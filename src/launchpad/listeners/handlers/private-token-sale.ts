import { Interface } from "@ethersproject/abi";
import { hexValue } from "@ethersproject/bytes";
import { abi } from "vefi-token-launchpad-staking/artifacts/contracts/PrivateTokenSaleCreator.sol/PrivateTokenSaleCreator.json";
import assert from "assert";
import _ from "lodash";
import { privateTokenSales } from "../../db/models";
import { rpcCall } from "../../../shared/utils";
import logger from "../../../shared/log";
import { getLastBlockNumberForPrivateSaleCreator, propagateLastBlockNumberForPrivateSaleCreator } from "../../cache";
import saleCreators from "../../assets/_sale_item_creators.json";

const saleCreatorAbiInterface = new Interface(abi);

export const handleTokenSaleItemCreatedEvent = (chainId: string) => {
  return async (log: any) => {
    try {
      const { args } = saleCreatorAbiInterface.parseLog(log);
      const [
        saleId,
        token,
        tokensForSale,
        softCap,
        hardCap,
        presaleRate,
        minContributionEther,
        maxContributionEther,
        startTime,
        endTime,
        proceedsTo,
        admin
      ] = args;

      logger("----- Creating private sale item: %s -----", saleId);

      await privateTokenSales.addPrivateTokenSaleItem(
        saleId,
        token,
        parseInt(tokensForSale.toString()),
        chainId,
        parseInt(hardCap.toString()),
        parseInt(softCap.toString()),
        parseInt(presaleRate.toString()),
        parseInt(minContributionEther.toString()),
        parseInt(maxContributionEther.toString()),
        _.multiply(parseInt(startTime.toString()), 1000),
        proceedsTo,
        _.multiply(parseInt(endTime.toString()), 1000),
        admin
      );
      await propagateLastBlockNumberForPrivateSaleCreator(log.blockNumber, chainId);
    } catch (error: any) {
      logger(error.message);
    }
  };
};

export const getPastLogsForPrivateSaleCreator = async (saleCreator: string, chainId: string) => {
  try {
    assert.equal(
      saleCreator,
      saleCreators[parseInt(chainId) as unknown as keyof typeof saleCreators].privateTokenSaleCreator,
      "sale creator addresses do not match"
    );
    logger("----- Retrieving last propagated block for sale creator %s -----", saleCreator);
    let lastPropagatedBlockForSaleCreator = await getLastBlockNumberForPrivateSaleCreator(chainId);
    const blockNumber = await rpcCall(parseInt(chainId), { method: "eth_blockNumber", params: [] });
    logger("----- Last propagated block for sale creator %s is %d -----", saleCreator, lastPropagatedBlockForSaleCreator);

    if (lastPropagatedBlockForSaleCreator === 0) {
      lastPropagatedBlockForSaleCreator = parseInt(blockNumber);
      await propagateLastBlockNumberForPrivateSaleCreator(blockNumber, chainId);
    }

    const logs = await rpcCall(parseInt(chainId), {
      method: "eth_getLogs",
      params: [{ fromBlock: hexValue(lastPropagatedBlockForSaleCreator + 1), toBlock: blockNumber, address: saleCreator, topics: [] }]
    });

    logger("----- Iterating logs for sale creator %s -----", saleCreator);
    for (const log of logs) {
      {
        const { name } = saleCreatorAbiInterface.parseLog(log);

        switch (name) {
          case "TokenSaleItemCreated": {
            await handleTokenSaleItemCreatedEvent(chainId)(log);
            break;
          }
          default: {
            break;
          }
        }
      }
    }
  } catch (error: any) {
    logger(error.message);
  }
};
