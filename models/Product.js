const mongoose = require("mongoose");

// Define the product schema
const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  customerName: { type: String, required: true },
  deliveryFrom: { type: String, required: true },
  deliveryTo: { type: String, required: true },
  phoneNumber: { type: String, required: false },
  emailAddress: { type: String, required: true },
  weight: { type: String, required: true },
  trackingId: { type: String, required: true, unique: true },
  estimatedDeliveryTime: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    default: "In Transit",
    enum: ["In Transit", "Delivered"],
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;