import { CountOptions, DataTypes, FindOptions } from "sequelize";
import _ from "lodash";
import buildModel from "../../../shared/db";

export type PublicTokenSaleItemModel = {
  id: string;
  token: string;
  tokensForSale: string;
  hardCap: string;
  softCap: string;
  presaleRate: string;
  minContribution: string;
  maxContribution: string;
  startTime: string;
  proceedsTo: string;
  endTime: string;
  admin: string;
  chainId: string;
  createdAt?: any;
  updatedAt?: any;
};

const model = buildModel("PublicTokenSaleItem", {
  id: { type: DataTypes.STRING, primaryKey: true },
  token: { type: DataTypes.STRING, allowNull: false },
  tokensForSale: { type: DataTypes.STRING, allowNull: false },
  hardCap: { type: DataTypes.STRING, allowNull: false },
  softCap: { type: DataTypes.STRING, allowNull: false },
  presaleRate: { type: DataTypes.STRING, allowNull: false },
  minContribution: { type: DataTypes.STRING, allowNull: false },
  maxContribution: { type: DataTypes.STRING, allowNull: false },
  startTime: { type: DataTypes.STRING, allowNull: false },
  proceedsTo: { type: DataTypes.STRING, allowNull: false },
  endTime: { type: DataTypes.STRING, allowNull: false },
  admin: { type: DataTypes.STRING, allowNull: false },
  chainId: { type: DataTypes.STRING, allowNull: false }
});

function addPublicTokenSaleItem(
  id: string,
  token: string,
  tokensForSale: number,
  chainId: string,
  hardCap: number,
  softCap: number,
  presaleRate: number,
  minContribution: number,
  maxContribution: number,
  startTime: number,
  proceedsTo: string,
  endTime: number,
  admin: string
) {
  try {
    return new Promise<PublicTokenSaleItemModel>((resolve, reject) => {
      model
        .create({
          id,
          token,
          tokensForSale: tokensForSale.toString(),
          chainId,
          hardCap: hardCap.toString(),
          softCap: softCap.toString(),
          presaleRate: presaleRate.toString(),
          minContribution: minContribution.toString(),
          maxContribution: maxContribution.toString(),
          startTime: startTime.toString(),
          proceedsTo,
          endTime: endTime.toString(),
          admin
        })
        .then(m => resolve(m.toJSON()))
        .catch(reject);
    });
  } catch (error: any) {
    return Promise.reject(error);
  }
}

function getAllPublicSaleItems(opts?: FindOptions) {
  try {
    return new Promise<Array<PublicTokenSaleItemModel>>((resolve, reject) => {
      model
        .findAll(opts)
        .then(ms => resolve(ms.map(m => m.toJSON())))
        .catch(reject);
    });
  } catch (error: any) {
    return Promise.reject(error);
  }
}

function getPublicSaleItem(pk: string) {
  try {
    return new Promise<PublicTokenSaleItemModel | null>((resolve, reject) => {
      model
        .findByPk(pk)
        .then(m => resolve(m?.toJSON() || null))
        .catch(reject);
    });
  } catch (error: any) {
    return Promise.reject(error);
  }
}

function countAllPublicSaleItems(opts?: Omit<CountOptions<any>, "group">) {
  try {
    return new Promise<number>((resolve, reject) => {
      model.count(opts).then(resolve).catch(reject);
    });
  } catch (error: any) {
    return Promise.reject(error);
  }
}

export default _.merge(model, {
  addPublicTokenSaleItem,
  getAllPublicSaleItems,
  getPublicSaleItem,
  countAllPublicSaleItems
});
