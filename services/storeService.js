import * as storeModel from "../models/storeModel.js";

export const createStore = async (store) => {
  return await storeModel.createStore(store);
};

export const getStores = async () => {
  return await storeModel.getStores();
};

export const getStoreById = async (id) => {
  return await storeModel.getStoreById(id);
};