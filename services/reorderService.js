// services/reorderService.js
const ReorderService = {
  calculateRecommendedOrder(product) {
    const currentStock = Number(product.stock || 0);
    const minStock = Number(product.minStock || 0);
    const targetStock = Number(product.targetStock || 0);

    if (currentStock >= minStock) {
      return 0;
    }

    const recommendedQty = targetStock - currentStock;
    return recommendedQty > 0 ? recommendedQty : 0;
  },

  shouldCreateOrder(product) {
    const currentStock = Number(product.stock || 0);
    const minStock = Number(product.minStock || 0);
    return currentStock < minStock;
  },
};

export default ReorderService;