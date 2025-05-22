// routes/brandRoutes.js
import express from 'express';
import * as brandController from '../controllers/brandController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', brandController.getAllBrands);
router.get('/:id', brandController.getBrandById);
router.post('/', authMiddleware, brandController.createBrand);
router.put('/:id', authMiddleware, brandController.updateBrand);
router.delete('/:id', authMiddleware, brandController.deleteBrand);

export default router;