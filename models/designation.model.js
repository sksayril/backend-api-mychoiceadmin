const mongoose = require('mongoose');

const designationSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Designation title is required'],
        trim: true,
        unique: true,
        minlength: [2, 'Designation title must be at least 2 characters long'],
        maxlength: [50, 'Designation title cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    level: {
        type: Number,
        required: [true, 'Designation level is required'],
        min: [1, 'Level must be at least 1'],
        max: [20, 'Level cannot exceed 20']
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Department is required']
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

// Index for better query performance
designationSchema.index({ title: 1 });
designationSchema.index({ department: 1 });
designationSchema.index({ level: 1 });
designationSchema.index({ isActive: 1 });

module.exports = mongoose.model('Designation', designationSchema);
