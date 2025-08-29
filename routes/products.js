const express = require('express');
const router = express.Router();
const Product = require('../models/product.model');
const { authenticateToken, optionalAuth } = require('../utilities/auth');
const { validate, productSchema } = require('../utilities/validation');
const { uploadMainImage, uploadAdditionalImages, handleUploadError } = require('../utilities/upload');

// Create Product (Admin only)
router.post('/', authenticateToken, uploadMainImage, handleUploadError, validate(productSchema), async (req, res) => {
    try {
        const { productName, productFeatures, description, price, category } = req.body;
        
        // Validate required fields
        if (!productName || !productName.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Product name is required'
            });
        }
        
        // Check if main image was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Main product image is required'
            });
        }

        // Handle productFeatures parsing safely
        let parsedFeatures = [];
        try {
            if (typeof productFeatures === 'string') {
                // Try to parse as JSON first
                parsedFeatures = JSON.parse(productFeatures);
            } else if (Array.isArray(productFeatures)) {
                parsedFeatures = productFeatures;
            } else {
                // If it's a single string, convert to array
                parsedFeatures = [productFeatures];
            }
            
            // Ensure it's an array
            if (!Array.isArray(parsedFeatures)) {
                parsedFeatures = [parsedFeatures];
            }
            
            // Filter out empty strings
            parsedFeatures = parsedFeatures.filter(feature => feature && feature.trim() !== '');
            
            if (parsedFeatures.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one product feature is required'
                });
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product features format. Please provide features as an array or valid JSON string.'
            });
        }

        // Validate and parse price
        let parsedPrice = undefined;
        if (price !== undefined && price !== null && price !== '') {
            parsedPrice = parseFloat(price);
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Price must be a valid positive number'
                });
            }
        }

        const product = new Product({
            productName,
            productFeatures: parsedFeatures,
            mainImage: `/uploads/products/main/${req.file.filename}`,
            description,
            price: parsedPrice,
            category,
            createdBy: req.admin._id
        });

        await product.save();

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: {
                product
            }
        });
    } catch (error) {
        console.error('Create product error:', error);
        console.error('Request body:', req.body);
        console.error('Request file:', req.file);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Upload Additional Images (Admin only)
router.post('/:productId/images', authenticateToken, uploadAdditionalImages, handleUploadError, async (req, res) => {
    try {
        const { productId } = req.params;
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'At least one image is required'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check if user created this product or is super admin
        if (product.createdBy.toString() !== req.admin._id.toString() && req.admin.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        // Add new images to additional images array
        const newImages = req.files.map(file => `/uploads/products/additional/${file.filename}`);
        product.additionalImages = [...product.additionalImages, ...newImages];
        
        await product.save();

        res.json({
            success: true,
            message: 'Additional images uploaded successfully',
            data: {
                additionalImages: newImages
            }
        });
    } catch (error) {
        console.error('Upload additional images error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get All Products (Public - no authentication required)
router.get('/', optionalAuth, async (req, res) => {
    try {
        const { page = 1, limit = 10, category, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        const query = { isActive: true };
        
        // Add category filter
        if (category) {
            query.category = category;
        }
        
        // Add search filter
        if (search) {
            query.$text = { $search: search };
        }
        
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const products = await Product.find(query)
            .populate('createdBy', 'fullName')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            
        const total = await Product.countDocuments(query);
        
        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalProducts: total,
                    hasNextPage: page * limit < total,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get Single Product (Public - no authentication required)
router.get('/:productId', optionalAuth, async (req, res) => {
    try {
        const { productId } = req.params;
        
        const product = await Product.findById(productId)
            .populate('createdBy', 'fullName')
            .exec();
            
        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                product
            }
        });
    } catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update Product (Admin only)
router.put('/:productId', authenticateToken, validate(productSchema), async (req, res) => {
    try {
        const { productId } = req.params;
        const { productName, productFeatures, description, price, category } = req.body;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Check if user created this product or is super admin
        if (product.createdBy.toString() !== req.admin._id.toString() && req.admin.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        // Handle productFeatures parsing safely
        let parsedFeatures = [];
        try {
            if (typeof productFeatures === 'string') {
                // Try to parse as JSON first
                parsedFeatures = JSON.parse(productFeatures);
            } else if (Array.isArray(productFeatures)) {
                parsedFeatures = productFeatures;
            } else {
                // If it's a single string, convert to array
                parsedFeatures = [productFeatures];
            }
            
            // Ensure it's an array
            if (!Array.isArray(parsedFeatures)) {
                parsedFeatures = [parsedFeatures];
            }
            
            // Filter out empty strings
            parsedFeatures = parsedFeatures.filter(feature => feature && feature.trim() !== '');
            
            if (parsedFeatures.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'At least one product feature is required'
                });
            }
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid product features format. Please provide features as an array or valid JSON string.'
            });
        }
        
        // Validate and parse price
        let parsedPrice = undefined;
        if (price !== undefined && price !== null && price !== '') {
            parsedPrice = parseFloat(price);
            if (isNaN(parsedPrice) || parsedPrice < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Price must be a valid positive number'
                });
            }
        }
        
        // Update fields
        product.productName = productName;
        product.productFeatures = parsedFeatures;
        if (description !== undefined) product.description = description;
        if (price !== undefined) product.price = parsedPrice;
        if (category !== undefined) product.category = category;
        
        await product.save();
        
        res.json({
            success: true,
            message: 'Product updated successfully',
            data: {
                product
            }
        });
    } catch (error) {
        console.error('Update product error:', error);
        console.error('Request body:', req.body);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Update Main Image (Admin only)
router.put('/:productId/main-image', authenticateToken, uploadMainImage, handleUploadError, async (req, res) => {
    try {
        const { productId } = req.params;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Main image is required'
            });
        }
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Check if user created this product or is super admin
        if (product.createdBy.toString() !== req.admin._id.toString() && req.admin.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        product.mainImage = `/uploads/products/main/${req.file.filename}`;
        await product.save();
        
        res.json({
            success: true,
            message: 'Main image updated successfully',
            data: {
                mainImage: product.mainImage
            }
        });
    } catch (error) {
        console.error('Update main image error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Delete Product (Admin only)
router.delete('/:productId', authenticateToken, async (req, res) => {
    try {
        const { productId } = req.params;
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }
        
        // Check if user created this product or is super admin
        if (product.createdBy.toString() !== req.admin._id.toString() && req.admin.role !== 'super_admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }
        
        // Soft delete - set isActive to false
        product.isActive = false;
        await product.save();
        
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get Product Categories (Public)
router.get('/categories/list', async (req, res) => {
    try {
        const categories = await Product.distinct('category', { isActive: true });
        
        res.json({
            success: true,
            data: {
                categories: categories.filter(cat => cat && cat.trim() !== '')
            }
        });
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
