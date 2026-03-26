export const fetchShopifyProducts = async ({ shopDomain, accessToken }) => {
  const url = `https://${shopDomain}/admin/api/2024-10/products.json?limit=50`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Shopify API error: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.products || [];
};