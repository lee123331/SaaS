export const createOrder = async (productId, quantity) => {
  return {
    id: Math.floor(Math.random() * 100000),
    productId,
    quantity,
    status: "completed",
  };
};