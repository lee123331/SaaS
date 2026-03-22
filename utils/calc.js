export const avgDailySales = (sales7) => {
  return Number((sales7 / 7).toFixed(2));
};

export const expectedOutOfStockDays = (stock, avg) => {
  if (avg === 0) return 999;
  return Number((stock / avg).toFixed(1));
};

export const getStatus = (days) => {
  if (days <= 3) return "danger";
  if (days <= 7) return "warning";
  return "safe";
};

export const recommendedOrderQty = (avg, safety, stock) => {
  return Math.max(0, Math.ceil(avg * 14 + safety - stock));
};