// services/brandService.js
import { pool } from '../config/db.js';

export const getAllBrands = async () => {
  const result = await pool.query('SELECT * FROM brands');
  return result.rows;
};

export const getBrandById = async (id) => {
  const result = await pool.query('SELECT * FROM brands WHERE id = $1', [id]);
  return result.rows[0];
};

export const createBrand = async (brandData) => {
  const { name } = brandData;
  const result = await pool.query(
    'INSERT INTO brands (name) VALUES ($1) RETURNING *',
    [name]
  );
  return result.rows[0];
};

export const updateBrand = async (id, brandData) => {
  const { name } = brandData;
  const result = await pool.query(
    'UPDATE brands SET name = $1 WHERE id = $2 RETURNING *',
    [name, id]
  );
  return result.rows[0];
};

export const deleteBrand = async (id) => {
  const result = await pool.query('DELETE FROM brands WHERE id = $1 RETURNING *', [id]);
  return result.rows[0];
};