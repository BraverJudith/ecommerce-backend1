const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const cartsFilePath = path.join(__dirname, '../data/carts.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

// Leer carritos desde el archivo
const readCarts = () => {
  const data = fs.readFileSync(cartsFilePath);
  return JSON.parse(data);
};

// Escribir carritos al archivo
const writeCarts = (carts) => {
  fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
};

// Leer productos desde el archivo
const readProducts = () => {
  const data = fs.readFileSync(productsFilePath);
  return JSON.parse(data);
};

// Ruta raíz POST /
router.post('/', (req, res) => {
  const carts = readCarts();
  const id = (carts.length > 0) ? (parseInt(carts[carts.length - 1].id) + 1).toString() : '1';
  const newCart = { id, products: [] };

  carts.push(newCart);
  writeCarts(carts);

  res.status(201).json(newCart);
});

// Ruta GET /:cid
router.get('/:cid', (req, res) => {
  const { cid } = req.params;
  const carts = readCarts();
  const cart = carts.find(c => c.id === cid);
  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }
  res.json(cart.products);
});

// Ruta POST /:cid/product/:pid
router.post('/:cid/product/:pid', (req, res) => {
  const { cid, pid } = req.params;
  const { quantity = 1 } = req.body;

  const carts = readCarts();
  const cart = carts.find(c => c.id === cid);
  if (!cart) {
    return res.status(404).json({ error: 'Cart not found' });
  }

  const products = readProducts();
  const product = products.find(p => p.id === pid);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const cartProduct = cart.products.find(p => p.product === pid);
  if (cartProduct) {
    cartProduct.quantity += quantity;
  } else {
    cart.products.push({ product: pid, quantity });
  }

  writeCarts(carts);

  res.status(201).json(cart);
});

module.exports = router;
