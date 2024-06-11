import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();
const __dirname = path.resolve();
const productsFilePath = path.join(__dirname, "src", "data", "products.json");

console.log("Products file path:", productsFilePath);

const readProducts = () => {
  try {
    const data = fs.readFileSync(productsFilePath, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading products file: ${err}`);
    return [];
  }
};

const writeProducts = (products) => {
  try {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
  } catch (err) {
    console.error(`Error writing products file: ${err}`);
  }
};

router.get('/', (req, res) => {
  const { limit } = req.query;
  const products = readProducts();
  if (limit) {
    return res.json(products.slice(0, limit));
  }
  res.json(products);
});

router.get('/:pid', (req, res) => {
  const { pid } = req.params;
  const products = readProducts();
  const product = products.find(p => p.id === pid);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

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

export default router;
