const express = require("express");
const app = express();

app.use(express.json());

let products = [
  { id: 1, name: "Laptop" },
  { id: 2, name: "Phone" }
];

// Get all products
app.get("/products", (req, res) => {
  res.json(products);
});

// Add product
app.post("/products", (req, res) => {
  const product = { id: Date.now(), name: req.body.name };
  products.push(product);
  res.json(product);
});

// Health check (IMPORTANT)
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});