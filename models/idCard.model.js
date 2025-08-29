const mongoose = require('mongoose');

const idCardSchema = new mongoose.Schema({
    idCardNumber: {
        type: String,
        required: true,
        unique: true,
        default: function() {
            // Auto-generate ID card number: EMP + timestamp + random 4 digits
            const timestamp = Date.now().toString().slice(-8);
            const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
            return `EMP${timestamp}${random}`;
        }
    },
    employeeType: {
        type: String,
        required: [true, 'Employee type is required'],
        enum: ['full-time', 'part-time', 'contract', 'intern', 'temporary'],
        trim: true
    },
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters long'],
        maxlength: [50, 'Full name cannot exceed 50 characters']
    },
    employeePicture: {
        type: String,
        required: [true, 'Employee picture is required']
    },
    address: {
        street: {
            type: String,
            required: [true, 'Street address is required'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true
        },
        zipCode: {
            type: String,
            required: [true, 'Zip code is required'],
            trim: true
        },
        country: {
            type: String,
            required: [true, 'Country is required'],
            trim: true,
            default: 'India'
        }
    },
    bloodGroup: {
        type: String,
        required: [true, 'Blood group is required'],
        enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
        trim: true
    },
    mobileNumber: {
        type: String,
        required: [true, 'Mobile number is required'],
        trim: true,
        match: [/^[+]?[\d\s\-\(\)]{10,15}$/, 'Please enter a valid mobile number']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required']
    },
    dateOfJoining: {
        type: Date,
        required: [true, 'Date of joining is required']
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Department is required']
    },
    designation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Designation',
        required: [true, 'Designation is required']
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
idCardSchema.index({ idCardNumber: 1 });
idCardSchema.index({ employeeType: 1, isActive: 1 });
idCardSchema.index({ department: 1, isActive: 1 });
idCardSchema.index({ designation: 1, isActive: 1 });

module.exports = mongoose.model('IdCard', idCardSchema);
