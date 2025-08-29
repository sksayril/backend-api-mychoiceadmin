const express = require('express');
const router = express.Router();
const Admin = require('../models/user.model');
const Product = require('../models/product.model');
const Contact = require('../models/contact.model');
const IdCard = require('../models/idCard.model');
const Department = require('../models/department.model');
const Designation = require('../models/designation.model');
const { authenticateToken } = require('../utilities/auth');

// Get Dashboard Overview (Admin only)
router.get('/overview', authenticateToken, async (req, res) => {
    try {
        // Get total counts
        const totalAdmins = await Admin.countDocuments({ isActive: true });
        const totalProducts = await Product.countDocuments({ isActive: true });
        const totalContacts = await Contact.countDocuments();
        const totalEmployees = await IdCard.countDocuments({ isActive: true });
        const totalDepartments = await Department.countDocuments({ isActive: true });
        const totalDesignations = await Designation.countDocuments({ isActive: true });

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentProducts = await Product.countDocuments({
            createdAt: { $gte: sevenDaysAgo },
            isActive: true
        });

        const recentContacts = await Contact.countDocuments({
            createdAt: { $gte: sevenDaysAgo }
        });

        const recentEmployees = await IdCard.countDocuments({
            createdAt: { $gte: sevenDaysAgo },
            isActive: true
        });

        const recentDepartments = await Department.countDocuments({
            createdAt: { $gte: sevenDaysAgo },
            isActive: true
        });

        const recentDesignations = await Designation.countDocuments({
            createdAt: { $gte: sevenDaysAgo },
            isActive: true
        });

        // Get pending contacts (new status)
        const pendingContacts = await Contact.countDocuments({ status: 'new' });

        // Get recent logins (last 24 hours)
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        const recentLogins = await Admin.countDocuments({
            lastLogin: { $gte: twentyFourHoursAgo }
        });

        res.json({
            success: true,
            data: {
                overview: {
                    totalAdmins,
                    totalProducts,
                    totalContacts,
                    totalEmployees,
                    totalDepartments,
                    totalDesignations,
                    recentProducts,
                    recentContacts,
                    recentEmployees,
                    recentDepartments,
                    recentDesignations,
                    pendingContacts,
                    recentLogins
                }
            }
        });
    } catch (error) {
        console.error('Get dashboard overview error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get Chart Data (Admin only)
router.get('/charts', authenticateToken, async (req, res) => {
    try {
        // Get monthly data for the last 12 months
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        // Products by month
        const productsByMonth = await Product.aggregate([
            {
                $match: {
                    createdAt: { $gte: twelveMonthsAgo },
                    isActive: true
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Contacts by month
        const contactsByMonth = await Contact.aggregate([
            {
                $match: {
                    createdAt: { $gte: twelveMonthsAgo }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Employees by month
        const employeesByMonth = await IdCard.aggregate([
            {
                $match: {
                    createdAt: { $gte: twelveMonthsAgo },
                    isActive: true
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1 }
            }
        ]);

        // Contact status distribution
        const contactStatusDistribution = await Contact.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Employee type distribution
        const employeeTypeDistribution = await IdCard.aggregate([
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

        // Department distribution
        const departmentDistribution = await IdCard.aggregate([
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
            },
            {
                $limit: 10
            }
        ]);

        // Designation distribution
        const designationDistribution = await IdCard.aggregate([
            {
                $match: { isActive: true }
            },
            {
                $lookup: {
                    from: 'designations',
                    localField: 'designation',
                    foreignField: '_id',
                    as: 'designationInfo'
                }
            },
            {
                $unwind: '$designationInfo'
            },
            {
                $group: {
                    _id: '$designationInfo.title',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);

        res.json({
            success: true,
            data: {
                productsByMonth,
                contactsByMonth,
                employeesByMonth,
                contactStatusDistribution,
                employeeTypeDistribution,
                departmentDistribution,
                designationDistribution
            }
        });
    } catch (error) {
        console.error('Get dashboard charts error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get Recent Activity (Admin only)
router.get('/recent-activity', authenticateToken, async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get recent products
        const recentProducts = await Product.find({ isActive: true })
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('productName createdAt createdBy');

        // Get recent contacts
        const recentContacts = await Contact.find()
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('fullName emailAddress subject status createdAt');

        // Get recent employees
        const recentEmployees = await IdCard.find({ isActive: true })
            .populate('createdBy', 'fullName')
            .populate('department', 'name')
            .populate('designation', 'title')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('fullName idCardNumber department designation createdAt createdBy');

        // Get recent departments
        const recentDepartments = await Department.find({ isActive: true })
            .populate('createdBy', 'fullName')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('name code createdAt createdBy');

        // Get recent designations
        const recentDesignations = await Designation.find({ isActive: true })
            .populate('createdBy', 'fullName')
            .populate('department', 'name')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .select('title level department createdAt createdBy');

        // Get recent admin logins
        const recentLogins = await Admin.find({ isActive: true, lastLogin: { $exists: true } })
            .sort({ lastLogin: -1 })
            .limit(parseInt(limit))
            .select('fullName email lastLogin');

        res.json({
            success: true,
            data: {
                recentProducts,
                recentContacts,
                recentEmployees,
                recentDepartments,
                recentDesignations,
                recentLogins
            }
        });
    } catch (error) {
        console.error('Get recent activity error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get System Health (Admin only)
router.get('/system-health', authenticateToken, async (req, res) => {
    try {
        // Check database connection
        const dbStatus = 'connected'; // This would be checked from mongoose connection

        // Get storage information (simplified)
        const storageInfo = {
            products: await Product.countDocuments({ isActive: true }),
            contacts: await Contact.countDocuments(),
            employees: await IdCard.countDocuments({ isActive: true }),
            admins: await Admin.countDocuments({ isActive: true }),
            departments: await Department.countDocuments({ isActive: true }),
            designations: await Designation.countDocuments({ isActive: true })
        };

        // Get performance metrics (simplified)
        const performanceMetrics = {
            averageResponseTime: '150ms', // This would be calculated from actual metrics
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage(),
            nodeVersion: process.version
        };

        res.json({
            success: true,
            data: {
                dbStatus,
                storageInfo,
                performanceMetrics
            }
        });
    } catch (error) {
        console.error('Get system health error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get Quick Stats (Admin only)
router.get('/quick-stats', authenticateToken, async (req, res) => {
    try {
        // Today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayProducts = await Product.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow },
            isActive: true
        });

        const todayContacts = await Contact.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow }
        });

        const todayEmployees = await IdCard.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow },
            isActive: true
        });

        const todayDepartments = await Department.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow },
            isActive: true
        });

        const todayDesignations = await Designation.countDocuments({
            createdAt: { $gte: today, $lt: tomorrow },
            isActive: true
        });

        // This week's stats
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);

        const weekProducts = await Product.countDocuments({
            createdAt: { $gte: weekStart },
            isActive: true
        });

        const weekContacts = await Contact.countDocuments({
            createdAt: { $gte: weekStart }
        });

        const weekEmployees = await IdCard.countDocuments({
            createdAt: { $gte: weekStart },
            isActive: true
        });

        const weekDepartments = await Department.countDocuments({
            createdAt: { $gte: weekStart },
            isActive: true
        });

        const weekDesignations = await Designation.countDocuments({
            createdAt: { $gte: weekStart },
            isActive: true
        });

        // This month's stats
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthProducts = await Product.countDocuments({
            createdAt: { $gte: monthStart },
            isActive: true
        });

        const monthContacts = await Contact.countDocuments({
            createdAt: { $gte: monthStart }
        });

        const monthEmployees = await IdCard.countDocuments({
            createdAt: { $gte: monthStart },
            isActive: true
        });

        const monthDepartments = await Department.countDocuments({
            createdAt: { $gte: monthStart },
            isActive: true
        });

        const monthDesignations = await Designation.countDocuments({
            createdAt: { $gte: monthStart },
            isActive: true
        });

        res.json({
            success: true,
            data: {
                today: {
                    products: todayProducts,
                    contacts: todayContacts,
                    employees: todayEmployees,
                    departments: todayDepartments,
                    designations: todayDesignations
                },
                thisWeek: {
                    products: weekProducts,
                    contacts: weekContacts,
                    employees: weekEmployees,
                    departments: weekDepartments,
                    designations: weekDesignations
                },
                thisMonth: {
                    products: monthProducts,
                    contacts: monthContacts,
                    employees: monthEmployees,
                    departments: monthDepartments,
                    designations: monthDesignations
                }
            }
        });
    } catch (error) {
        console.error('Get quick stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
