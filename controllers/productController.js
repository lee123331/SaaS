import * as productService from "../services/productService.js";

export const getProducts = async (req, res) => {
  try {
    const products = await productService.getProducts();
    res.json({ products });
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ message: "상품 목록 조회 중 오류가 발생했습니다." });
  }
};

export const getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductDetail(Number(id));

    if (!product) {
      return res.status(404).json({ message: "상품을 찾을 수 없습니다." });
    }

    res.json(product);
  } catch (error) {
    console.error("getProductDetail error:", error);
    res.status(500).json({ message: "상품 상세 조회 중 오류가 발생했습니다." });
  }
};