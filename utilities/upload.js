const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
    const dirs = [
        'public/uploads',
        'public/uploads/products',
        'public/uploads/products/main',
        'public/uploads/products/additional',
        'public/uploads/employees',
        'public/uploads/employees/pictures'
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

createUploadDirs();

// Configure storage for main product image
const mainImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/products/main');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'main-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure storage for additional product images
const additionalImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/products/additional');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'additional-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure storage for employee pictures
const employeePictureStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/employees/pictures');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'employee-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed!'), false);
    }
};

// Configure multer for main image upload (100MB limit)
const uploadMainImage = multer({
    storage: mainImageStorage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: fileFilter
});

// Configure multer for additional images upload (100MB limit)
const uploadAdditionalImages = multer({
    storage: additionalImageStorage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
        files: 5 // Maximum 5 additional images
    },
    fileFilter: fileFilter
});

// Configure multer for employee picture upload (100MB limit)
const uploadEmployeePicture = multer({
    storage: employeePictureStorage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    },
    fileFilter: fileFilter
});

// Error handling middleware for multer
const handleUploadError = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                message: 'File size too large. Maximum size is 100MB.'
            });
        }
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                message: 'Too many files. Maximum 5 additional images allowed.'
            });
        }
    }
    
    if (error.message.includes('Only image files')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    return res.status(500).json({
        success: false,
        message: 'File upload error'
    });
};

module.exports = {
    uploadMainImage: uploadMainImage.single('mainImage'),
    uploadAdditionalImages: uploadAdditionalImages.array('additionalImages', 5),
    uploadEmployeePicture: uploadEmployeePicture.single('employeePicture'),
    handleUploadError
};
