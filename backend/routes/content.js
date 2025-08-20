const express = require('express');
const Content = require('../models/Content');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

const router = express.Router();

// @route   POST /api/content
// @desc    Create new content (user only)
// @access  Private (User role)
router.post('/', auth, roleAuth(['user']), async (req, res) => {
  try {
    const { title, description } = req.body;

    // Validation
    if (!title || !description) {
      return res.status(400).json({ message: 'Title and description are required' });
    }

    const content = new Content({
      title,
      description,
      createdBy: req.user._id
    });

    await content.save();
    await content.populate('createdBy', 'email');

    res.status(201).json({
      message: 'Content created successfully',
      content
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Server error creating content' });
  }
});

// @route   GET /api/content
// @desc    Get content (Admin: all content, User: own content)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, keyword } = req.query;
    
    let query = {};
    
    // Users can only see their own content, admins can see all
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    // Add status filter if provided
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    // Add keyword search if provided
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { createdAt: -1 },
      populate: [
        { path: 'createdBy', select: 'email' },
        { path: 'approvedBy', select: 'email' }
      ]
    };

    const content = await Content.find(query)
      .populate('createdBy', 'email')
      .populate('approvedBy', 'email')
      .sort({ createdAt: -1 })
      .limit(options.limit)
      .skip(options.skip);

    const total = await Content.countDocuments(query);

    res.json({
      content,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({ message: 'Server error fetching content' });
  }
});

// @route   PUT /api/content/:id/approve
// @desc    Approve content (admin only)
// @access  Private (Admin role)
router.put('/:id/approve', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    content.status = 'approved';
    content.approvedAt = new Date();
    content.approvedBy = req.user._id;

    await content.save();
    await content.populate([
      { path: 'createdBy', select: 'email' },
      { path: 'approvedBy', select: 'email' }
    ]);

    res.json({
      message: 'Content approved successfully',
      content
    });
  } catch (error) {
    console.error('Approve content error:', error);
    res.status(500).json({ message: 'Server error approving content' });
  }
});

// @route   PUT /api/content/:id/reject
// @desc    Reject content (admin only)
// @access  Private (Admin role)
router.put('/:id/reject', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const content = await Content.findById(req.params.id);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    content.status = 'rejected';
    content.approvedAt = new Date();
    content.approvedBy = req.user._id;

    await content.save();
    await content.populate([
      { path: 'createdBy', select: 'email' },
      { path: 'approvedBy', select: 'email' }
    ]);

    res.json({
      message: 'Content rejected successfully',
      content
    });
  } catch (error) {
    console.error('Reject content error:', error);
    res.status(500).json({ message: 'Server error rejecting content' });
  }
});

// @route   GET /api/content/stats
// @desc    Get content statistics for analytics
// @access  Private (Admin only)
router.get('/stats', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const totalSubmissions = await Content.countDocuments();
    const approved = await Content.countDocuments({ status: 'approved' });
    const rejected = await Content.countDocuments({ status: 'rejected' });
    const pending = await Content.countDocuments({ status: 'pending' });

    // Get submissions by month for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Content.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      totalSubmissions,
      approved,
      rejected,
      pending,
      monthlyStats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
});

// @route   GET /api/content/recent
// @desc    Get recent activity feed
// @access  Private (Admin only)
router.get('/recent', auth, roleAuth(['admin']), async (req, res) => {
  try {
    const recentContent = await Content.find({
      $or: [
        { status: 'approved' },
        { status: 'rejected' }
      ]
    })
    .populate('createdBy', 'email')
    .populate('approvedBy', 'email')
    .sort({ approvedAt: -1 })
    .limit(5);

    res.json(recentContent);
  } catch (error) {
    console.error('Get recent activity error:', error);
    res.status(500).json({ message: 'Server error fetching recent activity' });
  }
});

module.exports = router;