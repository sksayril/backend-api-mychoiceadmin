const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    productFeatures: [{
        type: String,
        required: [true, 'Product features are required'],
        trim: true
    }],
    mainImage: {
        type: String,
        required: [true, 'Main product image is required']
    },
    additionalImages: [{
        type: String
    }],
    description: {
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    price: {
        type: Number,
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin',
        required: true
    }
}, {
    timestamps: true
});

// Index for better search performance
productSchema.index({ productName: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
