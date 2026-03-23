const User = require('../models/User');
const Ticket = require('../models/Ticket');
const Department = require('../models/Department');
const Response = require('../models/Response');
const logger = require('../utils/logger');

exports.getDashboard = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalTickets,
      openTickets,
      resolvedTickets,
      inProgressTickets,
      departments,
    ] = await Promise.all([
      User.countDocuments(),
      Ticket.countDocuments(),
      Ticket.countDocuments({ status: 'open' }),
      Ticket.countDocuments({ status: 'resolved' }),
      Ticket.countDocuments({ status: 'in_progress' }),
      Department.countDocuments({ isActive: true }),
    ]);

    const recentTickets = await Ticket.find()
      .populate('student', 'name email')
      .populate('department', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalUsers,
        totalTickets,
        openTickets,
        resolvedTickets,
        inProgressTickets,
        departments,
      },
      recentTickets,
    });
  } catch (error) {
    next(error);
  }
};

exports.getAnalytics = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [ticketsByStatus, ticketsByPriority, ticketsByDepartment, dailyTickets] =
      await Promise.all([
        Ticket.aggregate([
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Ticket.aggregate([
          { $group: { _id: '$priority', count: { $sum: 1 } } },
        ]),
        Ticket.aggregate([
          { $match: { department: { $ne: null } } },
          {
            $group: {
              _id: '$department',
              count: { $sum: 1 },
            },
          },
          {
            $lookup: {
              from: 'departments',
              localField: '_id',
              foreignField: '_id',
              as: 'dept',
            },
          },
          { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
          {
            $project: {
              name: '$dept.name',
              count: 1,
            },
          },
        ]),
        Ticket.aggregate([
          { $match: { createdAt: { $gte: thirtyDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

    res.json({
      success: true,
      analytics: {
        ticketsByStatus,
        ticketsByPriority,
        ticketsByDepartment,
        dailyTickets,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [users, total] = await Promise.all([
      User.find(query)
        .populate('department', 'name code')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      User.countDocuments(query),
    ]);

    res.json({
      success: true,
      users,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { isActive, role, department } = req.body;
    const updates = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (role) updates.role = role;
    if (department !== undefined) updates.department = department;

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate('department', 'name code');

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  res.json({ success: true, message: 'Settings updated.' });
};
