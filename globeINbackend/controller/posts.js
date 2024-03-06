const Product = require("../model/posts")
const multer = require('multer');
const { sendError, sendSuccess } = require('../utils/helper');

const upload = multer({
  storage: multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  }),
  limits: { fileSize: 1024 * 1024 * 5 }, 
  fileFilter: function(req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      cb(null, true);
    } else {
      cb('Error: Images only! (JPEG, JPG, PNG)');
    }
  }
}).single('image');

const calculateTimeLeft = (scheduledAt) => {
  const currentTime = new Date();
  const scheduledTime = new Date(scheduledAt);
  const timeLeft = scheduledTime - currentTime;
  return timeLeft;
};

const activateProducts = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const productsToDelete = await Product.find({
      scheduledAt: { $lte: twentyFourHoursAgo },
      active: false
    });

    for (const product of productsToDelete) {
      await product.remove();
    }

    console.log('Products deleted successfully');
  } catch (error) {
    console.error('Error deleting products:', error);
  }
};

setTimeout(activateProducts, 24 * 60 * 60 * 1000);

exports.createProduct = async (req, res) => {
    try {
        // Check if user is authenticated and user ID is available in the request
        if (!req.user || !req.user._id) {
            return sendError(res, 'User not authenticated or user ID not available');
        }

        const { name, description, price, location, scheduledAt } = req.body;
        const userId = req.user._id; 

        upload(req, res, async (err) => {
            if (err) {
                return sendError(res, err.message || 'Failed to upload image');
            }

            const imgUrl = req.file ? req.file.path : '';
            const createdAt = scheduledAt ? new Date(scheduledAt) : new Date();
            const timeLeft = scheduledAt ? calculateTimeLeft(scheduledAt) : null;

            console.log('UserID:', userId);

            const newProduct = new Product({
                user: userId, 
                name,
                description,
                price,
                location,
                scheduledAt: createdAt, 
                timeLeft,
                imgUrl,
                active: false 
            });

            await newProduct.save();

            activateProducts();

            return sendSuccess(res, 'Product created successfully');
        });
    } catch (error) {
        console.error('Error creating product:', error);
        return sendError(res, 'Failed to create product');
    }
};

  
  

exports.getProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id; 
    const product = await Product.findOne({ _id: productId, user: userId });
    if (!product) {
      return sendError(res, 'Product not found');
    }
    return sendSuccess(res, 'Product retrieved successfully', product);
  } catch (error) {
    console.error("Error retrieving product:", error);
    return sendError(res, "Failed to retrieve product");
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, description, price, location, scheduledAt } = req.body;
    const userId = req.user._id; 
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, user: userId },
      { name, description, price, location, scheduledAt },
      { new: true }
    );
    if (!updatedProduct) {
      return sendError(res, 'Product not found or user not authorized to update');
    }
    return sendSuccess(res, 'Product updated successfully', updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    return sendError(res, "Failed to update product");
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id; 
    const deletedProduct = await Product.findOneAndDelete({ _id: productId, user: userId });
    if (!deletedProduct) {
      return sendError(res, 'Product not found or user not authorized to delete');
    }
    return sendSuccess(res, 'Product deleted successfully');
  } catch (error) {
    console.error("Error deleting product:", error);
    return sendError(res, "Failed to delete product");
  }
};

exports.activateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.user._id; 

    const updatedProduct = await Product.findOneAndUpdate(
      { _id: productId, user: userId },
      { active: true }, 
      { new: true }
    );

    if (!updatedProduct) {
      return sendError(res, 'Product not found or user not authorized to activate');
    }

    return sendSuccess(res, 'Product activated successfully', updatedProduct);
  } catch (error) {
    console.error("Error activating product:", error);
    return sendError(res, "Failed to activate product");
  }
};
