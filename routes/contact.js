const express = require('express');
const router = express.Router();
const Contact = require('../models/contact.model');
const { authenticateToken } = require('../utilities/auth');
const { validate, contactSchema } = require('../utilities/validation');

// Submit Contact Form (Public - no authentication required)
router.post('/', validate(contactSchema), async (req, res) => {
    try {
        const { fullName, emailAddress, mobileNumber, subject, message } = req.body;
        
        // Get client IP and user agent
        const ipAddress = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
        const userAgent = req.get('User-Agent');
        
        const contact = new Contact({
            fullName,
            emailAddress,
            mobileNumber,
            subject,
            message,
            ipAddress,
            userAgent
        });
        
        await contact.save();
        
        res.status(201).json({
            success: true,
            message: 'Contact form submitted successfully. We will get back to you soon!'
        });
    } catch (error) {
        console.error('Submit contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get All Contacts (Admin only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
        
        const query = {};
        
        // Add status filter
        if (status) {
            query.status = status;
        }
        
        // Add search filter
        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { emailAddress: { $regex: search, $options: 'i' } },
                { subject: { $regex: search, $options: 'i' } },
                { message: { $regex: search, $options: 'i' } }
            ];
        }
        
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
        
        const contacts = await Contact.find(query)
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            
        const total = await Contact.countDocuments(query);
        
        res.json({
            success: true,
            data: {
                contacts,
                pagination: {
                    currentPage: parseInt(page),
                    totalPages: Math.ceil(total / limit),
                    totalContacts: total,
                    hasNextPage: page * limit < total,
                    hasPrevPage: page > 1
                }
            }
        });
    } catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get Single Contact (Admin only)
router.get('/:contactId', authenticateToken, async (req, res) => {
    try {
        const { contactId } = req.params;
        
        const contact = await Contact.findById(contactId);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        res.json({
            success: true,
            data: {
                contact
            }
        });
    } catch (error) {
        console.error('Get contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Update Contact Status (Admin only)
router.put('/:contactId/status', authenticateToken, async (req, res) => {
    try {
        const { contactId } = req.params;
        const { status } = req.body;
        
        if (!['new', 'read', 'replied', 'closed'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be one of: new, read, replied, closed'
            });
        }
        
        const contact = await Contact.findById(contactId);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        contact.status = status;
        await contact.save();
        
        res.json({
            success: true,
            message: 'Contact status updated successfully',
            data: {
                contact
            }
        });
    } catch (error) {
        console.error('Update contact status error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Delete Contact (Admin only)
router.delete('/:contactId', authenticateToken, async (req, res) => {
    try {
        const { contactId } = req.params;
        
        const contact = await Contact.findById(contactId);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }
        
        await Contact.findByIdAndDelete(contactId);
        
        res.json({
            success: true,
            message: 'Contact deleted successfully'
        });
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get Contact Statistics (Admin only)
router.get('/stats/overview', authenticateToken, async (req, res) => {
    try {
        const totalContacts = await Contact.countDocuments();
        const newContacts = await Contact.countDocuments({ status: 'new' });
        const readContacts = await Contact.countDocuments({ status: 'read' });
        const repliedContacts = await Contact.countDocuments({ status: 'replied' });
        const closedContacts = await Contact.countDocuments({ status: 'closed' });
        
        // Get contacts by month for the last 6 months
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const monthlyStats = await Contact.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo }
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
        
        res.json({
            success: true,
            data: {
                totalContacts,
                statusBreakdown: {
                    new: newContacts,
                    read: readContacts,
                    replied: repliedContacts,
                    closed: closedContacts
                },
                monthlyStats
            }
        });
    } catch (error) {
        console.error('Get contact stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;
