const { v4: uuidv4 } = require('uuid');
const Product = require('../models/Product');
const cron = require('node-cron');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');
const utc = require('dayjs/plugin/utc');

dayjs.extend(timezone);
dayjs.extend(utc);

// Function to generate a UPS-like tracking ID
const generateTrackingId = () => {
  const uuid = uuidv4().replace(/-/g, ''); 
  const prefix = '1Z'; 
  const suffix = uuid.slice(0, 16);
  return `${prefix}${suffix}`.toUpperCase();
};

// Create a new product
const createProduct = async (req, res) => {
  const { productName, customerName, deliveryFrom, deliveryTo, phoneNumber, estimatedDeliveryTime, weight, emailAddress } = req.body;
  const createdBy = req.user;
  if (!productName || !customerName || !deliveryFrom || !deliveryTo || !estimatedDeliveryTime || !weight || !emailAddress) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const trackingId = generateTrackingId(); 

    const createdAt = dayjs().tz('America/New_York').format();

    const newProduct = new Product({
      productName,
      customerName,
      deliveryFrom,
      deliveryTo,
      phoneNumber,
      trackingId,
      weight,
      emailAddress,
      estimatedDeliveryTime: dayjs(estimatedDeliveryTime).tz('America/New_York').toDate(),
      createdAt: createdAt,
      createdBy: createdBy,
    });

    await newProduct.save();

    res.status(201).json({ message: "Product created successfully", trackingId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// Get a product by tracking ID
const getProductByTrackingId = async (req, res) => {
  const { trackingId } = req.params;

  try {
    const product = await Product.findOne({ trackingId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

cron.schedule('* * * * *', async () => {
  const currentTime = dayjs().tz('America/New_York');

  const productsInTransit = await Product.find({ status: 'In Transit' });

  for (const product of productsInTransit) {
    const estimatedDeliveryTime = dayjs(product.estimatedDeliveryTime).tz('America/New_York');

    if (currentTime.isSameOrAfter(estimatedDeliveryTime)) {
      product.status = 'Delivered';
      await product.save();
      console.log(`Product with tracking ID ${product.trackingId} marked as Delivered.`);
    }
  }
});

module.exports = { createProduct, getProductByTrackingId };