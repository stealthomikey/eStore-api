// services/productService.js
import { pool } from '../config/db.js';

export const getAllProducts = async () => {
  const result = await pool.query(`
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
  `);
  const products = result.rows;
  // Fetch images for each product
  for (let product of products) {
    const images = await pool.query('SELECT * FROM product_images WHERE product_id = $1', [product.id]);
    product.images = images.rows;
  }
  return products;
};

export const getProductById = async (id) => {
  const result = await pool.query(`
    SELECT p.*, c.name AS category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = $1
  `, [id]);
  const product = result.rows[0];
  if (product) {
    const images = await pool.query('SELECT * FROM product_images WHERE product_id = $1', [id]);
    product.images = images.rows;
  }
  return product;
};

export const createProduct = async (productData) => {
  const {
    title,
    description,
    price,
    discount,
    rating,
    stock,
    category_id,
    brand_id,
    additional_info,
    images = [] // Array of image URLs
  } = productData;

  // Validate category_id
  const categoryCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
  if (!categoryCheck.rows.length) {
    throw new Error('Invalid category_id: Category does not exist');
  }

  // Validate brand_id
  const brandCheck = await pool.query('SELECT id FROM brands WHERE id = $1', [brand_id]);
  if (!brandCheck.rows.length) {
    throw new Error('Invalid brand_id: Brand does not exist');
  }

  // Start a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert product
    const productResult = await client.query(
      `INSERT INTO products (
        title, description, price, discount, rating, stock, category_id, brand_id, additional_info
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [title, description, price, discount, rating, stock, category_id, brand_id, additional_info]
    );
    const product = productResult.rows[0];

    // Insert images
    const imagePromises = images.map(async (imageUrl, index) => {
      await client.query(
        `INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3) RETURNING *`,
        [product.id, imageUrl, index === 0] // First image is primary
      );
    });
    await Promise.all(imagePromises);

    // Fetch images and category name for response
    const imagesResult = await client.query('SELECT * FROM product_images WHERE product_id = $1', [product.id]);
    const categoryResult = await client.query('SELECT name AS category_name FROM categories WHERE id = $1', [product.category_id]);
    product.images = imagesResult.rows;
    product.category_name = categoryResult.rows[0]?.name || 'Unknown Category';

    await client.query('COMMIT');
    return product;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const updateProduct = async (id, productData) => {
  const {
    title,
    description,
    price,
    discount,
    rating,
    stock,
    category_id,
    brand_id,
    additional_info,
    images = [] // Array of image URLs
  } = productData;

  // Validate category_id
  const categoryCheck = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
  if (!categoryCheck.rows.length) {
    throw new Error('Invalid category_id: Category does not exist');
  }

  // Validate brand_id
  const brandCheck = await pool.query('SELECT id FROM brands WHERE id = $1', [brand_id]);
  if (!brandCheck.rows.length) {
    throw new Error('Invalid brand_id: Brand does not exist');
  }

  // Start a transaction
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Update product
    const productResult = await client.query(
      `UPDATE products SET
        title = $1, description = $2, price = $3, discount = $4, rating = $5, stock = $6,
        category_id = $7, brand_id = $8, additional_info = $9
      WHERE id = $10 RETURNING *`,
      [title, description, price, discount, rating, stock, category_id, brand_id, additional_info, id]
    );
    const product = productResult.rows[0];
    if (!product) {
      throw new Error('Product not found');
    }

    // Delete existing images
    await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);

    // Insert new images
    const imagePromises = images.map(async (imageUrl, index) => {
      await client.query(
        `INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3) RETURNING *`,
        [id, imageUrl, index === 0]
      );
    });
    await Promise.all(imagePromises);

    // Fetch images and category name for response
    const imagesResult = await client.query('SELECT * FROM product_images WHERE product_id = $1', [id]);
    const categoryResult = await client.query('SELECT name AS category_name FROM categories WHERE id = $1', [product.category_id]);
    product.images = imagesResult.rows;
    product.category_name = categoryResult.rows[0]?.name || 'Unknown Category';

    await client.query('COMMIT');
    return product;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const deleteProduct = async (id) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Delete images first due to foreign key constraint
    await client.query('DELETE FROM product_images WHERE product_id = $1', [id]);
    const result = await client.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};