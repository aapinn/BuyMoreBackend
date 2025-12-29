const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const productRoutes = require("./routes/productRoutes");
const authRoutes = require("./routes/auth");

const app = express();
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, // izinkan token / cookie
};

// Connect DB
connectDB();

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Welcome to the E-commerce API");
});

// Main API Routes
app.use("/products", productRoutes);
app.use("/auth", authRoutes);


module.exports = app;
