const express = require('express');
const router = express.Router();
const Designation = require('../models/designation.model');
const Department = require('../models/department.model');
const { authenticateToken } = require('../utilities/auth');
const { validate, designationSchema } = require('../utilities/validation');

// Create Designation (Admin only)
router.post('/', authenticateToken, validate(designationSchema), async (req, res) => {
    try {
        const { title, description, level, department } = req.body;

        // Check if designation with same title already exists
        const existingDesignation = await Designation.findOne({ title });
        if (existingDesignation) {
            return res.status(400).json({
                success: false,
                message: 'Designation with this title already exists'
            });
        }

        // Check if department exists
        const departmentExists = await Department.findById(department);
        if (!departmentExists || !departmentExists.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department'
            });
        }

        const designation = new Designation({
            title,
            description,
            level,
            department,
            createdBy: req.admin._id
        });

        await designation.save();

        // Populate department details
        await designation.populate('department', 'name code');

        res.status(201).json({
            success: true,
            message: 'Designation created successfully',
            data: {
                designation
            }
        });
    } catch (error) {
        console.error('Create designation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get All Designations (Admin only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, search, department, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        const query = { isActive: true };
        
        // Add department filter
        if (department) {
            query.department = department;
        }
        
        // Add search filter
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const designations = await Designation.find(query)
            .populate('department', 'name code')
            .populate('createdBy', 'fullName')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            
        const total = await Designation.countDocuments(query);
        
        res.json({
            success: true,
            data: {
                designations,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalDesignations: total,
                    hasNextPage: page * limit < total,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get designations error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get Single Designation (Admin only)
router.get('/:designationId', authenticateToken, async (req, res) => {
    try {
        const { designationId } = req.params;
        
        const designation = await Designation.findById(designationId)
            .populate('department', 'name code')
            .populate('createdBy', 'fullName')
            .exec();
            
        if (!designation || !designation.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Designation not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                designation
            }
        });
    } catch (error) {
        console.error('Get designation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update Designation (Admin only)
router.put('/:designationId', authenticateToken, validate(designationSchema), async (req, res) => {
    try {
        const { designationId } = req.params;
        const { title, description, level, department } = req.body;
        
        const designation = await Designation.findById(designationId);
        if (!designation) {
            return res.status(404).json({
                success: false,
                message: 'Designation not found'
            });
        }
        
        // Check if title is being changed and if it's already taken
        if (title && title !== designation.title) {
            const existingDesignation = await Designation.findOne({ title });
            if (existingDesignation) {
                return res.status(400).json({
                    success: false,
                    message: 'Designation with this title already exists'
                });
            }
        }
        
        // Check if department exists
        const departmentExists = await Department.findById(department);
        if (!departmentExists || !departmentExists.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department'
            });
        }
        
        // Update fields
        designation.title = title;
        designation.description = description;
        designation.level = level;
        designation.department = department;
        
        await designation.save();
        
        // Populate department details
        await designation.populate('department', 'name code');
        
        res.json({
            success: true,
            message: 'Designation updated successfully',
            data: {
                designation
            }
        });
    } catch (error) {
        console.error('Update designation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Delete Designation (Admin only)
router.delete('/:designationId', authenticateToken, async (req, res) => {
    try {
        const { designationId } = req.params;
        
        const designation = await Designation.findById(designationId);
        if (!designation) {
            return res.status(404).json({
                success: false,
                message: 'Designation not found'
            });
        }
        
        // Soft delete - set isActive to false
        designation.isActive = false;
        await designation.save();
        
        res.json({
            success: true,
            message: 'Designation deleted successfully'
        });
    } catch (error) {
        console.error('Delete designation error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get Designations by Department (Admin only)
router.get('/department/:departmentId', authenticateToken, async (req, res) => {
    try {
        const { departmentId } = req.params;
        
        // Check if department exists
        const departmentExists = await Department.findById(departmentId);
        if (!departmentExists || !departmentExists.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Department not found'
            });
        }
        
        const designations = await Designation.find({ 
            department: departmentId, 
            isActive: true 
        })
        .select('_id title level')
        .sort({ level: 1, title: 1 })
        .exec();
        
        res.json({
            success: true,
            data: {
                designations
            }
        });
    } catch (error) {
        console.error('Get designations by department error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get All Active Designations (for dropdowns)
router.get('/list/active', authenticateToken, async (req, res) => {
    try {
        const designations = await Designation.find({ isActive: true })
            .populate('department', 'name code')
            .select('_id title level department')
            .sort({ level: 1, title: 1 })
            .exec();
        
        res.json({
            success: true,
            data: {
                designations
            }
        });
    } catch (error) {
        console.error('Get active designations error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
