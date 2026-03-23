const Department = require('../models/Department');
const Ticket = require('../models/Ticket');
const Response = require('../models/Response');
const logger = require('../utils/logger');

exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('head', 'name email')
      .select('-staff');
    res.json({ success: true, departments });
  } catch (error) {
    next(error);
  }
};

exports.getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('head', 'name email')
      .populate('staff', 'name email');
    if (!department) {
      return res
        .status(404)
        .json({ success: false, message: 'Department not found.' });
    }
    res.json({ success: true, department });
  } catch (error) {
    next(error);
  }
};

exports.getDepartmentTickets = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const query = { department: req.params.id };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate('student', 'name email studentId')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Ticket.countDocuments(query),
    ]);

    res.json({
      success: true,
      tickets,
      pagination: {
        total,
        page: parseInt(page, 10),
        pages: Math.ceil(total / parseInt(limit, 10)),
        limit: parseInt(limit, 10),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.addResponse = async (req, res, next) => {
  try {
    const { content, type } = req.body;
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: 'Ticket not found.' });
    }

    const response = await Response.create({
      ticket: req.params.id,
      author: req.user._id,
      content,
      type: type || 'comment',
    });

    if (type === 'solution') {
      await Ticket.findByIdAndUpdate(req.params.id, { status: 'resolved', resolvedAt: new Date() });
    } else if (ticket.status === 'open') {
      await Ticket.findByIdAndUpdate(req.params.id, { status: 'in_progress' });
    }

    const populated = await Response.findById(response._id).populate('author', 'name email role');
    res.status(201).json({ success: true, response: populated });
  } catch (error) {
    next(error);
  }
};

exports.createDepartment = async (req, res, next) => {
  try {
    const { name, code, description, email, categories } = req.body;
    const department = await Department.create({ name, code, description, email, categories });
    res.status(201).json({ success: true, department });
  } catch (error) {
    next(error);
  }
};
