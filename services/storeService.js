import axios from "axios";
import * as storeModel from "../models/storeModel.js";
import * as productModel from "../models/productModel.js";

const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2026-01";

const validateShopDomain = (shop) => {
  return /^[a-z0-9-]+\.myshopify\.com$/i.test(shop);
};

const parseShopifyGidToNumber = (gid) => {
  if (!gid) return null;
  const id = String(gid).split("/").pop();
  return Number(id);
};

export const createStore = async (store) => {
  return await storeModel.createStore(store);
};

export const getStores = async () => {
  return await storeModel.getStores();
};

export const getStoreById = async (id) => {
  return await storeModel.getStoreById(id);
};

export const exchangeOfflineToken = async ({ shop, sessionToken }) => {
  if (!shop || !validateShopDomain(shop)) {
    throw new Error("유효한 shop 도메인이 아닙니다.");
  }

  if (!sessionToken) {
    throw new Error("sessionToken이 없습니다.");
  }

  if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
    throw new Error("SHOPIFY_API_KEY 또는 SHOPIFY_API_SECRET 환경변수가 없습니다.");
  }

  const params = new URLSearchParams();
  params.append("client_id", process.env.SHOPIFY_API_KEY);
  params.append("client_secret", process.env.SHOPIFY_API_SECRET);
  params.append("grant_type", "urn:ietf:params:oauth:grant-type:token-exchange");
  params.append("subject_token", sessionToken);
  params.append("subject_token_type", "urn:ietf:params:oauth:token-type:id_token");
  params.append(
    "requested_token_type",
    "urn:shopify:params:oauth:token-type:offline-access-token"
  );

  try {
    const { data } = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      params.toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
      }
    );

    return data;
  } catch (error) {
    const message = error?.response?.data
      ? JSON.stringify(error.response.data)
      : error.message;

    throw new Error(`Shopify 토큰 교환 실패: ${message}`);
  }
};

/**
 * OAuth authorization code grant 방식
 * GET /store/oauth/callback 에서 받은 code로 access token 교환
 */
export const exchangeAuthorizationCodeToken = async ({ shop, code }) => {
  if (!shop || !validateShopDomain(shop)) {
    throw new Error("유효한 shop 도메인이 아닙니다.");
  }

  if (!code) {
    throw new Error("authorization code가 없습니다.");
  }

  if (!process.env.SHOPIFY_API_KEY || !process.env.SHOPIFY_API_SECRET) {
    throw new Error("SHOPIFY_API_KEY 또는 SHOPIFY_API_SECRET 환경변수가 없습니다.");
  }

  try {
    const { data } = await axios.post(
      `https://${shop}/admin/oauth/access_token`,
      {
        client_id: process.env.SHOPIFY_API_KEY,
        client_secret: process.env.SHOPIFY_API_SECRET,
        code,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    return data;
  } catch (error) {
    const message = error?.response?.data
      ? JSON.stringify(error.response.data)
      : error.message;

    throw new Error(`Shopify authorization code 토큰 교환 실패: ${message}`);
  }
};

export const fetchShopInfo = async ({ shop, accessToken }) => {
  const query = `
    query {
      shop {
        id
        name
        myshopifyDomain
      }
    }
  `;

  try {
    const { data } = await axios.post(
      `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
      { query },
      {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      }
    );

    if (data.errors) {
      throw new Error(JSON.stringify(data.errors));
    }

    return data.data.shop;
  } catch (error) {
    const message = error?.response?.data
      ? JSON.stringify(error.response.data)
      : error.message;

    throw new Error(`Shop 정보 조회 실패: ${message}`);
  }
};

export const connectShopifyStore = async ({ shop, sessionToken }) => {
  const tokenData = await exchangeOfflineToken({ shop, sessionToken });
  const accessToken = tokenData?.access_token;

  if (!accessToken) {
    throw new Error("Shopify access token을 받지 못했습니다.");
  }

  const shopInfo = await fetchShopInfo({ shop, accessToken });

  const existingStore = await storeModel.getStoreByShopDomain(shop);

  const storePayload = {
    shop_name: shopInfo?.name || null,
    shop_domain: shop,
    access_token: accessToken,
  };

  if (existingStore) {
    await storeModel.updateStoreByShopDomain(shop, storePayload);
    return await storeModel.getStoreByShopDomain(shop);
  }

  const result = await storeModel.createStore(storePayload);
  return await storeModel.getStoreById(result.insertId);
};

/**
 * GET callback용 최종 연결 함수
 */
export const connectShopifyStoreByCode = async ({ shop, code }) => {
  const tokenData = await exchangeAuthorizationCodeToken({ shop, code });
  const accessToken = tokenData?.access_token;

  if (!accessToken) {
    throw new Error("Shopify access token을 받지 못했습니다.");
  }

  const shopInfo = await fetchShopInfo({ shop, accessToken });

  const existingStore = await storeModel.getStoreByShopDomain(shop);

  const storePayload = {
    shop_name: shopInfo?.name || null,
    shop_domain: shop,
    access_token: accessToken,
  };

  if (existingStore) {
    await storeModel.updateStoreByShopDomain(shop, storePayload);
    return await storeModel.getStoreByShopDomain(shop);
  }

  const result = await storeModel.createStore(storePayload);
  return await storeModel.getStoreById(result.insertId);
};

export const fetchProductsFromShopify = async ({ shop, accessToken }) => {
  const query = `
  query GetProducts($cursor: String) {
    products(first: 100, after: $cursor) {
      edges {
        cursor
        node {
          id
          title
          status
          featuredImage {
            url
          }
          variants(first: 100) {
            edges {
              node {
                id
                sku
                inventoryQuantity
              }
            }
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

  let cursor = null;
  let hasNextPage = true;
  const allProducts = [];

  try {
    while (hasNextPage) {
      const { data } = await axios.post(
        `https://${shop}/admin/api/${SHOPIFY_API_VERSION}/graphql.json`,
        {
          query,
          variables: { cursor },
        },
        {
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (data.errors) {
        throw new Error(JSON.stringify(data.errors));
      }

      const edges = data?.data?.products?.edges || [];
      hasNextPage = data?.data?.products?.pageInfo?.hasNextPage || false;

      for (const edge of edges) {
        allProducts.push(edge.node);
      }

      cursor = edges.length ? edges[edges.length - 1].cursor : null;
    }

    return allProducts;
  } catch (error) {
    const message = error?.response?.data
      ? JSON.stringify(error.response.data)
      : error.message;

    throw new Error(`Shopify 상품 조회 실패: ${message}`);
  }
};

export const syncStoreProducts = async (storeId) => {
  const store = await storeModel.getStoreById(storeId);

  if (!store) {
    throw new Error("스토어를 찾을 수 없습니다.");
  }

  const shopifyProducts = await fetchProductsFromShopify({
    shop: store.shop_domain,
    accessToken: store.access_token,
  });

  let syncedCount = 0;

  for (const product of shopifyProducts) {
    const variants = product?.variants?.edges || [];

    for (const variantEdge of variants) {
      const variant = variantEdge.node;

await productModel.upsertFromShopify({
  storeId: store.id,
  shopifyProductId: parseShopifyGidToNumber(product.id),
  shopifyVariantId: parseShopifyGidToNumber(variant.id),
  title: product.title,
  sku: variant.sku || null,
  stock: Number(variant.inventoryQuantity || 0),
  status: product.status || null,
  imageUrl: product.featuredImage?.url || null,
});

      syncedCount += 1;
    }
  }

  return {
    storeId: store.id,
    shopDomain: store.shop_domain,
    syncedCount,
  };
};

export const deleteStore = async (storeId) => {
  const store = await storeModel.getStoreById(storeId);

  if (!store) {
    throw new Error("스토어를 찾을 수 없습니다.");
  }

  await productModel.deleteByStoreId(storeId);
  await storeModel.deleteStoreById(storeId);

  return {
    storeId,
    shopDomain: store.shop_domain,
  };
};