// services/categoryService.js
import { pool } from '../config/db.js';

export const getAllCategories = async () => {
  const result = await pool.query('SELECT * FROM categories');
  return result.rows;
};

export const getCategoryById = async (id) => {
  const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
  return result.rows[0];
};

export const createCategory = async (categoryData) => {
  const { name } = categoryData;
  const result = await pool.query(
    'INSERT INTO categories (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
};

export const updateCategory = async (id, categoryData) => {
  const { name } = categoryData;
  const result = await pool.query(
    'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *',
    [name, id]
  );
  return result.rows[0];
};

export const deleteCategory = async (id) => {
  const result = await pool.query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};