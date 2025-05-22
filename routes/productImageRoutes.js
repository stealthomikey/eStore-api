// routes/productImageRoutes.js
import express from 'express';
import * as productImageController from '../controllers/productImageController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router({ mergeParams: true });

router.get('/', productImageController.getImagesByProductId);
router.post('/', authMiddleware, productImageController.createProductImage);
router.put('/:imageId', authMiddleware, productImageController.updateProductImage);
router.delete('/:imageId', authMiddleware, productImageController.deleteProductImage);

export default router;