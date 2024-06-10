const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const productsFilePath = path.join(__dirname, '../data/products.json');

// Leer productos desde el archivo
const readProducts = () => {
  const data = fs.readFileSync(productsFilePath);
  return JSON.parse(data);
};

// Escribir productos al archivo
const writeProducts = (products) => {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

// Ruta raíz GET /
router.get('/', (req, res) => {
  const { limit } = req.query;
  const products = readProducts();
  if (limit) {
    return res.json(products.slice(0, limit));
  }
  res.json(products);
});

// Ruta GET /:pid
router.get('/:pid', (req, res) => {
  const { pid } = req.params;
  const products = readProducts();
  const product = products.find(p => p.id === pid);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// Ruta raíz POST /
router.post('/', (req, res) => {
  const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

  if (!title || !description || !code || !price || !stock || !category) {
    return res.status(400).json({ error: 'All fields except thumbnails are required' });
  }

  const products = readProducts();
  const id = (products.length > 0) ? (parseInt(products[products.length - 1].id) + 1).toString() : '1';
  const newProduct = { id, title, description, code, price, status, stock, category, thumbnails };

  products.push(newProduct);
  writeProducts(products);

  res.status(201).json(newProduct);
});

// Ruta PUT /:pid
router.put('/:pid', (req, res) => {
  const { pid } = req.params;
  const { title, description, code, price, status, stock, category, thumbnails } = req.body;

  const products = readProducts();
  const productIndex = products.findIndex(p => p.id === pid);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const updatedProduct = { ...products[productIndex], title, description, code, price, status, stock, category, thumbnails };
  products[productIndex] = updatedProduct;
  writeProducts(products);

  res.json(updatedProduct);
});

// Ruta DELETE /:pid
router.delete('/:pid', (req, res) => {
  const { pid } = req.params;
  const products = readProducts();
  const productIndex = products.findIndex(p => p.id === pid);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products.splice(productIndex, 1);
  writeProducts(products);

  res.status(204).send();
});

module.exports = router;

