const Joi = require('joi');

// Admin validation schemas
const adminSignupSchema = Joi.object({
    fullName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Full name must be at least 2 characters long',
            'string.max': 'Full name cannot exceed 50 characters',
            'any.required': 'Full name is required'
        }),
    email: Joi.string()
        .email()
        .lowercase()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .min(6)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        }),
    role: Joi.string()
        .valid('admin', 'super_admin')
        .default('admin')
});

const adminLoginSchema = Joi.object({
    email: Joi.string()
        .email()
        .lowercase()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email is required'
        }),
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        })
});

// Department validation schema
const departmentSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Department name must be at least 2 characters long',
            'string.max': 'Department name cannot exceed 50 characters',
            'any.required': 'Department name is required'
        }),
    description: Joi.string()
        .max(200)
        .optional()
        .messages({
            'string.max': 'Description cannot exceed 200 characters'
        }),
    code: Joi.string()
        .min(2)
        .max(10)
        .required()
        .messages({
            'string.min': 'Department code must be at least 2 characters long',
            'string.max': 'Department code cannot exceed 10 characters',
            'any.required': 'Department code is required'
        })
});

// Designation validation schema
const designationSchema = Joi.object({
    title: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Designation title must be at least 2 characters long',
            'string.max': 'Designation title cannot exceed 50 characters',
            'any.required': 'Designation title is required'
        }),
    description: Joi.string()
        .max(200)
        .optional()
        .messages({
            'string.max': 'Description cannot exceed 200 characters'
        }),
    level: Joi.number()
        .min(1)
        .max(20)
        .required()
        .messages({
            'number.min': 'Level must be at least 1',
            'number.max': 'Level cannot exceed 20',
            'any.required': 'Designation level is required'
        }),
    department: Joi.string()
        .required()
        .messages({
            'any.required': 'Department is required'
        })
});

// Product validation schemas
const productSchema = Joi.object({
    productName: Joi.string()
        .min(1)
        .max(100)
        .required()
        .messages({
            'string.min': 'Product name is required',
            'string.max': 'Product name cannot exceed 100 characters',
            'any.required': 'Product name is required'
        }),
    productFeatures: Joi.alternatives()
        .try(
            Joi.array().items(Joi.string().min(1)).min(1),
            Joi.string().min(1)
        )
        .required()
        .messages({
            'array.min': 'At least one product feature is required',
            'string.min': 'Product features cannot be empty',
            'any.required': 'Product features are required',
            'alternatives.types': 'Product features must be an array or string'
        }),
    description: Joi.string()
        .max(1000)
        .optional()
        .messages({
            'string.max': 'Description cannot exceed 1000 characters'
        }),
    price: Joi.number()
        .min(0)
        .optional()
        .messages({
            'number.min': 'Price cannot be negative'
        }),
    category: Joi.string()
        .optional()
});

// Contact validation schema
const contactSchema = Joi.object({
    fullName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Full name must be at least 2 characters long',
            'string.max': 'Full name cannot exceed 50 characters',
            'any.required': 'Full name is required'
        }),
    emailAddress: Joi.string()
        .email()
        .lowercase()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email address is required'
        }),
    mobileNumber: Joi.string()
        .pattern(/^[+]?[\d\s\-\(\)]{10,15}$/)
        .required()
        .messages({
            'string.pattern.base': 'Please enter a valid mobile number',
            'any.required': 'Mobile number is required'
        }),
    subject: Joi.string()
        .min(5)
        .max(100)
        .required()
        .messages({
            'string.min': 'Subject must be at least 5 characters long',
            'string.max': 'Subject cannot exceed 100 characters',
            'any.required': 'Subject is required'
        }),
    message: Joi.string()
        .min(10)
        .max(1000)
        .required()
        .messages({
            'string.min': 'Message must be at least 10 characters long',
            'string.max': 'Message cannot exceed 1000 characters',
            'any.required': 'Message is required'
        })
});

// ID Card validation schema
const idCardSchema = Joi.object({
    employeeType: Joi.string()
        .valid('full-time', 'part-time', 'contract', 'intern', 'temporary')
        .required()
        .messages({
            'any.only': 'Please select a valid employee type',
            'any.required': 'Employee type is required'
        }),
    fullName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Full name must be at least 2 characters long',
            'string.max': 'Full name cannot exceed 50 characters',
            'any.required': 'Full name is required'
        }),
    employeePicture: Joi.string()
        .optional()
        .messages({
            'string.base': 'Employee picture must be a string'
        }),
    address: Joi.object({
        street: Joi.string()
            .required()
            .messages({
                'any.required': 'Street address is required'
            }),
        city: Joi.string()
            .required()
            .messages({
                'any.required': 'City is required'
            }),
        state: Joi.string()
            .required()
            .messages({
                'any.required': 'State is required'
            }),
        zipCode: Joi.string()
            .required()
            .messages({
                'any.required': 'Zip code is required'
            }),
        country: Joi.string()
            .default('India')
    }).required(),
    bloodGroup: Joi.string()
        .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
        .required()
        .messages({
            'any.only': 'Please select a valid blood group',
            'any.required': 'Blood group is required'
        }),
    mobileNumber: Joi.string()
        .pattern(/^[+]?[\d\s\-\(\)]{10,15}$/)
        .required()
        .messages({
            'string.pattern.base': 'Please enter a valid mobile number',
            'any.required': 'Mobile number is required'
        }),
    email: Joi.string()
        .email()
        .lowercase()
        .required()
        .messages({
            'string.email': 'Please enter a valid email address',
            'any.required': 'Email is required'
        }),
    dateOfBirth: Joi.date()
        .max('now')
        .required()
        .messages({
            'date.max': 'Date of birth cannot be in the future',
            'any.required': 'Date of birth is required'
        }),
    dateOfJoining: Joi.date()
        .max('now')
        .required()
        .messages({
            'date.max': 'Date of joining cannot be in the future',
            'any.required': 'Date of joining is required'
        }),
    department: Joi.string()
        .required()
        .messages({
            'any.required': 'Department is required'
        }),
    designation: Joi.string()
        .required()
        .messages({
            'any.required': 'Designation is required'
        })
});

// ID Card update validation schema (all fields optional except employeePicture)
const idCardUpdateSchema = Joi.object({
    employeeType: Joi.string()
        .valid('full-time', 'part-time', 'contract', 'intern', 'temporary')
        .optional()
        .messages({
            'any.only': 'Please select a valid employee type'
        }),
    fullName: Joi.string()
        .min(2)
        .max(50)
        .optional()
        .messages({
            'string.min': 'Full name must be at least 2 characters long',
            'string.max': 'Full name cannot exceed 50 characters'
        }),
    employeePicture: Joi.string()
        .optional()
        .messages({
            'string.base': 'Employee picture must be a string'
        }),
    address: Joi.object({
        street: Joi.string()
            .optional()
            .messages({
                'any.required': 'Street address is required'
            }),
        city: Joi.string()
            .optional()
            .messages({
                'any.required': 'City is required'
            }),
        state: Joi.string()
            .optional()
            .messages({
                'any.required': 'State is required'
            }),
        zipCode: Joi.string()
            .optional()
            .messages({
                'any.required': 'Zip code is required'
            }),
        country: Joi.string()
            .default('India')
    }).optional(),
    bloodGroup: Joi.string()
        .valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
        .optional()
        .messages({
            'any.only': 'Please select a valid blood group'
        }),
    mobileNumber: Joi.string()
        .pattern(/^[+]?[\d\s\-\(\)]{10,15}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Please enter a valid mobile number'
        }),
    email: Joi.string()
        .email()
        .lowercase()
        .optional()
        .messages({
            'string.email': 'Please enter a valid email address'
        }),
    dateOfBirth: Joi.date()
        .max('now')
        .optional()
        .messages({
            'date.max': 'Date of birth cannot be in the future'
        }),
    dateOfJoining: Joi.date()
        .max('now')
        .optional()
        .messages({
            'date.max': 'Date of joining cannot be in the future'
        }),
    department: Joi.string()
        .optional()
        .messages({
            'any.required': 'Department is required'
        }),
    designation: Joi.string()
        .optional()
        .messages({
            'any.required': 'Designation is required'
        })
});

// Validation middleware
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            const errorMessage = error.details[0].message;
            return res.status(400).json({
                success: false,
                message: errorMessage
            });
        }
        next();
    };
};

module.exports = {
    adminSignupSchema,
    adminLoginSchema,
    departmentSchema,
    designationSchema,
    productSchema,
    contactSchema,
    idCardSchema,
    idCardUpdateSchema,
    validate
};
