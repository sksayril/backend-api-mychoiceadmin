const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Department name is required'],
        trim: true,
        unique: true,
        minlength: [2, 'Department name must be at least 2 characters long'],
        maxlength: [50, 'Department name cannot exceed 50 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [200, 'Description cannot exceed 200 characters']
    },
    code: {
        type: String,
        required: [true, 'Department code is required'],
        unique: true,
        trim: true,
        uppercase: true,
        minlength: [2, 'Department code must be at least 2 characters long'],
        maxlength: [10, 'Department code cannot exceed 10 characters']
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
departmentSchema.index({ name: 1 });
departmentSchema.index({ code: 1 });
departmentSchema.index({ isActive: 1 });

module.exports = mongoose.model('Department', departmentSchema);
