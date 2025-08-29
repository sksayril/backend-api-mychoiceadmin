const express = require('express');
const router = express.Router();
const Department = require('../models/department.model');
const { authenticateToken } = require('../utilities/auth');
const { validate, departmentSchema } = require('../utilities/validation');

// Create Department (Admin only)
router.post('/', authenticateToken, validate(departmentSchema), async (req, res) => {
    try {
        const { name, description, code } = req.body;

        // Check if department with same name already exists
        const existingDepartmentByName = await Department.findOne({ name });
        if (existingDepartmentByName) {
            return res.status(400).json({
                success: false,
                message: 'Department with this name already exists'
            });
        }

        // Check if department with same code already exists
        const existingDepartmentByCode = await Department.findOne({ code: code.toUpperCase() });
        if (existingDepartmentByCode) {
            return res.status(400).json({
                success: false,
                message: 'Department with this code already exists'
            });
        }

        const department = new Department({
            name,
            description,
            code: code.toUpperCase(),
            createdBy: req.admin._id
        });

        await department.save();

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: {
                department
            }
        });
    } catch (error) {
        console.error('Create department error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get All Departments (Admin only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        const query = { isActive: true };
        
        // Add search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { code: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const departments = await Department.find(query)
            .populate('createdBy', 'fullName')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            
        const total = await Department.countDocuments(query);
        
        res.json({
            success: true,
            data: {
                departments,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalDepartments: total,
                    hasNextPage: page * limit < total,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get departments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get Single Department (Admin only)
router.get('/:departmentId', authenticateToken, async (req, res) => {
    try {
        const { departmentId } = req.params;
        
        const department = await Department.findById(departmentId)
            .populate('createdBy', 'fullName')
            .exec();
            
        if (!department || !department.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                department
            }
        });
    } catch (error) {
        console.error('Get department error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update Department (Admin only)
router.put('/:departmentId', authenticateToken, validate(departmentSchema), async (req, res) => {
    try {
        const { departmentId } = req.params;
        const { name, description, code } = req.body;
        
        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        // Check if name is being changed and if it's already taken
        if (name && name !== department.name) {
            const existingDepartment = await Department.findOne({ name });
            if (existingDepartment) {
                return res.status(400).json({
                    success: false,
                    message: 'Department with this name already exists'
                });
            }
        }
        
        // Check if code is being changed and if it's already taken
        if (code && code.toUpperCase() !== department.code) {
            const existingDepartment = await Department.findOne({ code: code.toUpperCase() });
            if (existingDepartment) {
                return res.status(400).json({
                    success: false,
                    message: 'Department with this code already exists'
                });
            }
        }
        
        // Update fields
        department.name = name;
        department.description = description;
        department.code = code.toUpperCase();
        
        await department.save();
        
        res.json({
            success: true,
            message: 'Department updated successfully',
            data: {
                department
            }
        });
    } catch (error) {
        console.error('Update department error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Delete Department (Admin only)
router.delete('/:departmentId', authenticateToken, async (req, res) => {
    try {
        const { departmentId } = req.params;
        
        const department = await Department.findById(departmentId);
        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        // Soft delete - set isActive to false
        department.isActive = false;
        await department.save();
        
        res.json({
            success: true,
            message: 'Department deleted successfully'
        });
    } catch (error) {
        console.error('Delete department error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get All Active Departments (for dropdowns)
router.get('/list/active', authenticateToken, async (req, res) => {
    try {
        const departments = await Department.find({ isActive: true })
            .select('_id name code')
            .sort({ name: 1 })
            .exec();
        
        res.json({
            success: true,
            data: {
                departments
            }
        });
    } catch (error) {
        console.error('Get active departments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
