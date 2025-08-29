const express = require('express');
const router = express.Router();
const IdCard = require('../models/idCard.model');
const Department = require('../models/department.model');
const Designation = require('../models/designation.model');
const { authenticateToken } = require('../utilities/auth');
const { validate, idCardSchema, idCardUpdateSchema } = require('../utilities/validation');
const { uploadEmployeePicture, handleUploadError } = require('../utilities/upload');

// Create ID Card (Admin only)
router.post('/', authenticateToken, uploadEmployeePicture, handleUploadError, validate(idCardSchema), async (req, res) => {
    try {
        const {
            employeeType,
            fullName,
            address,
            bloodGroup,
            mobileNumber,
            email,
            dateOfBirth,
            dateOfJoining,
            department,
            designation
        } = req.body;

        // Check if employee picture was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Employee picture is required'
            });
        }

        // Check if email already exists
        const existingIdCard = await IdCard.findOne({ email });
        if (existingIdCard) {
            return res.status(400).json({
                success: false,
                message: 'Employee with this email already exists'
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

        // Check if designation exists
        const designationExists = await Designation.findById(designation);
        if (!designationExists || !designationExists.isActive) {
            return res.status(400).json({
                success: false,
                message: 'Invalid designation'
            });
        }

        const idCard = new IdCard({
            employeeType,
            fullName,
            employeePicture: `/uploads/employees/pictures/${req.file.filename}`,
            address,
            bloodGroup,
            mobileNumber,
            email,
            dateOfBirth,
            dateOfJoining,
            department,
            designation,
            createdBy: req.admin._id
        });

        await idCard.save();

        // Populate department and designation details
        await idCard.populate('department', 'name code');
        await idCard.populate('designation', 'title level');

        res.status(201).json({
            success: true,
            message: 'ID Card created successfully',
            data: {
                idCard
            }
        });
    } catch (error) {
        console.error('Create ID card error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get All ID Cards (Admin only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            employeeType, 
            department, 
            search, 
            sortBy = 'createdAt', 
            sortOrder = 'desc' 
        } = req.query;
        
        const query = { isActive: true };
        
        // Add filters
        if (employeeType) {
            query.employeeType = employeeType;
        }
        
        if (department) {
            query.department = department;
        }
        
        // Add search filter
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { idCardNumber: { $regex: search, $options: 'i' } }
            ];
        }
        
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const idCards = await IdCard.find(query)
            .populate('department', 'name code')
            .populate('designation', 'title level')
            .populate('createdBy', 'fullName')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            
        const total = await IdCard.countDocuments(query);
        
        res.json({
            success: true,
            data: {
                idCards,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalIdCards: total,
                    hasNextPage: page * limit < total,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get ID cards error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get Single ID Card (Admin only)
router.get('/:idCardId', authenticateToken, async (req, res) => {
    try {
        const { idCardId } = req.params;
        
        const idCard = await IdCard.findById(idCardId)
            .populate('department', 'name code')
            .populate('designation', 'title level')
            .populate('createdBy', 'fullName')
            .exec();
            
        if (!idCard || !idCard.isActive) {
            return res.status(404).json({
                success: false,
                message: 'ID Card not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                idCard
            }
        });
    } catch (error) {
        console.error('Get ID card error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get ID Card by ID Card Number (Admin only)
router.get('/number/:idCardNumber', authenticateToken, async (req, res) => {
    try {
        const { idCardNumber } = req.params;
        
        const idCard = await IdCard.findOne({ 
            idCardNumber: idCardNumber.toUpperCase(),
            isActive: true 
        })
        .populate('department', 'name code')
        .populate('designation', 'title level')
        .populate('createdBy', 'fullName');
            
        if (!idCard) {
            return res.status(404).json({
                success: false,
                message: 'ID Card not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                idCard
            }
        });
    } catch (error) {
        console.error('Get ID card by number error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update ID Card (Admin only)
router.put('/:idCardId', authenticateToken, uploadEmployeePicture, handleUploadError, validate(idCardUpdateSchema), async (req, res) => {
    try {
        const { idCardId } = req.params;
        const {
            employeeType,
            fullName,
            address,
            bloodGroup,
            mobileNumber,
            email,
            dateOfBirth,
            dateOfJoining,
            department,
            designation
        } = req.body;
        
        const idCard = await IdCard.findById(idCardId);
        if (!idCard) {
            return res.status(404).json({
                success: false,
                message: 'ID Card not found'
            });
        }
        
        // Check if email is being changed and if it's already taken
        if (email && email !== idCard.email) {
            const existingIdCard = await IdCard.findOne({ email });
            if (existingIdCard) {
                return res.status(400).json({
                    success: false,
                    message: 'Employee with this email already exists'
                });
            }
        }

        // Check if department exists (if being updated)
        if (department) {
            const departmentExists = await Department.findById(department);
            if (!departmentExists || !departmentExists.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid department'
                });
            }
        }

        // Check if designation exists (if being updated)
        if (designation) {
            const designationExists = await Designation.findById(designation);
            if (!designationExists || !designationExists.isActive) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid designation'
                });
            }
        }
        
        // Update fields (only if provided)
        if (employeeType) idCard.employeeType = employeeType;
        if (fullName) idCard.fullName = fullName;
        if (address) idCard.address = address;
        if (bloodGroup) idCard.bloodGroup = bloodGroup;
        if (mobileNumber) idCard.mobileNumber = mobileNumber;
        if (email) idCard.email = email;
        if (dateOfBirth) idCard.dateOfBirth = dateOfBirth;
        if (dateOfJoining) idCard.dateOfJoining = dateOfJoining;
        if (department) idCard.department = department;
        if (designation) idCard.designation = designation;
        
        // Update employee picture if uploaded
        if (req.file) {
            idCard.employeePicture = `/uploads/employees/pictures/${req.file.filename}`;
        }
        
        await idCard.save();

        // Populate department and designation details
        await idCard.populate('department', 'name code');
        await idCard.populate('designation', 'title level');

        res.json({
            success: true,
            message: 'ID Card updated successfully',
            data: {
                idCard
            }
        });
    } catch (error) {
        console.error('Update ID card error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update Employee Picture (Admin only)
router.put('/:idCardId/picture', authenticateToken, uploadEmployeePicture, handleUploadError, async (req, res) => {
    try {
        const { idCardId } = req.params;
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Employee picture is required'
            });
        }
        
        const idCard = await IdCard.findById(idCardId);
        if (!idCard) {
            return res.status(404).json({
                success: false,
                message: 'ID Card not found'
            });
        }
        
        idCard.employeePicture = `/uploads/employees/pictures/${req.file.filename}`;
        await idCard.save();
        
        res.json({
            success: true,
            message: 'Employee picture updated successfully',
            data: {
                employeePicture: idCard.employeePicture
            }
        });
    } catch (error) {
        console.error('Update employee picture error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Delete ID Card (Admin only)
router.delete('/:idCardId', authenticateToken, async (req, res) => {
    try {
        const { idCardId } = req.params;
        
        const idCard = await IdCard.findById(idCardId);
        if (!idCard) {
            return res.status(404).json({
                success: false,
                message: 'ID Card not found'
            });
        }
        
        // Soft delete - set isActive to false
        idCard.isActive = false;
        await idCard.save();
        
        res.json({
            success: true,
            message: 'ID Card deleted successfully'
        });
    } catch (error) {
        console.error('Delete ID card error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get ID Card Statistics (Admin only)
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const totalIdCards = await IdCard.countDocuments({ isActive: true });
        const activeEmployees = await IdCard.countDocuments({ isActive: true });
        
        // Get employee type breakdown
        const employeeTypeStats = await IdCard.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $group: {
                    _id: '$employeeType',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Get department breakdown
        const departmentStats = await IdCard.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'department',
                    foreignField: '_id',
                    as: 'departmentInfo'
                }
            },
            {
                $unwind: '$departmentInfo'
            },
            {
                $group: {
                    _id: '$departmentInfo.name',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        // Get blood group breakdown
        const bloodGroupStats = await IdCard.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $group: {
                    _id: '$bloodGroup',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Get recent hires (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const recentHires = await IdCard.countDocuments({
            dateOfJoining: { $gte: thirtyDaysAgo },
            isActive: true
        });
        
        res.json({
            success: true,
            data: {
                totalIdCards,
                activeEmployees,
                employeeTypeStats,
                departmentStats,
                bloodGroupStats,
                recentHires
            }
        });
    } catch (error) {
        console.error('Get ID card stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get Departments List (Admin only)
router.get('/departments/list', authenticateToken, async (req, res) => {
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
        console.error('Get departments error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
