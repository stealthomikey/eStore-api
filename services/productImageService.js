// services/productImageService.js
import { pool } from '../config/db.js';

export const getImagesByProductId = async (productId) => {
  const result = await pool.query('SELECT * FROM product_images WHERE product_id = $1', [productId]);
  return result.rows;
};

export const createProductImage = async (productId, imageData) => {
  const { image_url, is_primary = false } = imageData;

  // Validate product_id
  const productCheck = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
  if (!productCheck.rows.length) {
    throw new Error('Invalid product_id: Product does not exist');
  }

  // If is_primary is true, unset other primary images
  if (is_primary) {
    await pool.query('UPDATE product_images SET is_primary = false WHERE product_id = $1', [productId]);
  }

  const result = await pool.query(
    'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3) RETURNING *',
    [productId, image_url, is_primary]
  );
  return result.rows[0];
};

export const updateProductImage = async (imageId, imageData) => {
  const { image_url, is_primary = false } = imageData;

  const imageCheck = await pool.query('SELECT product_id FROM product_images WHERE id = $1', [imageId]);
  if (!imageCheck.rows.length) {
    throw new Error('Image not found');
  }
  const productId = imageCheck.rows[0].product_id;

  // If is_primary is true, unset other primary images
  if (is_primary) {
    await pool.query('UPDATE product_images SET is_primary = false WHERE product_id = $1', [productId]);
  }

  const result = await pool.query(
    'UPDATE product_images SET image_url = $1, is_primary = $2 WHERE id = $3 RETURNING *',
    [image_url, is_primary, imageId]
  );
  return result.rows[0];
};

export const deleteProductImage = async (imageId) => {
  const result = await pool.query('DELETE FROM product_images WHERE id = $1 RETURNING *', [imageId]);
  if (!result.rows.length) {
    throw new Error('Image not found');
  }
  return result.rows[0];
};