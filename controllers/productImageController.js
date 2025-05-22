// controllers/productImageController.js
import * as productImageService from '../services/productImageService.js';

export const getImagesByProductId = async (req, res) => {
  try {
    const images = await productImageService.getImagesByProductId(req.params.productId);
    res.json(images);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProductImage = async (req, res) => {
  try {
    const image = await productImageService.createProductImage(req.params.productId, req.body);
    res.status(201).json(image);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProductImage = async (req, res) => {
  try {
    const image = await productImageService.updateProductImage(req.params.imageId, req.body);
    res.json(image);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProductImage = async (req, res) => {
  try {
    const image = await productImageService.deleteProductImage(req.params.imageId);
    res.json({ message: 'Image deleted', image });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};