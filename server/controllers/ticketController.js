const Ticket = require('../models/Ticket');
const AIAnalysis = require('../models/AIAnalysis');
const Department = require('../models/Department');
const Response = require('../models/Response');
const { analyzeTicket } = require('../services/openaiService');
const { generateSolutions } = require('../services/geminiService');
const { sendTicketConfirmation, sendTicketUpdate } = require('../services/emailService');
const logger = require('../utils/logger');

exports.createTicket = async (req, res, next) => {
  try {
    const { title, description, priority, category, department, tags } = req.body;

    const ticket = await Ticket.create({
      title,
      description,
      priority: priority || 'medium',
      category,
      department,
      tags,
      student: req.user._id,
    });

    sendTicketConfirmation(req.user, ticket).catch((err) =>
      logger.error(`Email error: ${err.message}`)
    );

    const departments = await Department.find({ isActive: true });
    const aiAnalysis = await AIAnalysis.create({
      ticket: ticket._id,
      processingStatus: 'processing',
    });

    ticket.aiAnalysis = aiAnalysis._id;
    await ticket.save();

    (async () => {
      try {
        const openaiResult = await analyzeTicket(title, description, departments);
        const geminiResult = await generateSolutions(
          title,
          description,
          openaiResult.data?.category
        );

        let suggestedDeptId = department;
        if (openaiResult.data?.suggestedDepartment) {
          const dept = await Department.findOne({
            name: openaiResult.data.suggestedDepartment,
          });
          if (dept) suggestedDeptId = dept._id;
        }

        await AIAnalysis.findByIdAndUpdate(aiAnalysis._id, {
          suggestedCategory: openaiResult.data?.category,
          suggestedDepartment: suggestedDeptId,
          suggestedPriority: openaiResult.data?.priority,
          sentimentScore: openaiResult.data?.sentimentScore,
          urgencyScore: openaiResult.data?.urgencyScore,
          keywords: openaiResult.data?.keywords || [],
          summary: openaiResult.data?.summary,
          openaiSolutions: openaiResult.data?.solutions || [],
          geminiSolutions: geminiResult.data?.solutions || [],
          rawOpenaiResponse: openaiResult.raw,
          rawGeminiResponse: geminiResult.raw,
          processingStatus: 'completed',
        });

        if (!department && suggestedDeptId) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            department: suggestedDeptId,
            category: openaiResult.data?.category,
          });
        }
      } catch (aiErr) {
        logger.error(`AI processing error: ${aiErr.message}`);
        await AIAnalysis.findByIdAndUpdate(aiAnalysis._id, {
          processingStatus: 'failed',
          processingError: aiErr.message,
        });
      }
    })();

    const populated = await Ticket.findById(ticket._id)
      .populate('student', 'name email')
      .populate('department', 'name code');

    res.status(201).json({ success: true, ticket: populated });
  } catch (error) {
    next(error);
  }
};

exports.getTickets = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 10 } = req.query;
    const query = {};

    if (req.user.role === 'student') {
      query.student = req.user._id;
    } else if (req.user.role === 'department_staff') {
      query.department = req.user.department;
    }

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const [tickets, total] = await Promise.all([
      Ticket.find(query)
        .populate('student', 'name email studentId')
        .populate('department', 'name code')
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

exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id)
      .populate('student', 'name email studentId phone')
      .populate('department', 'name code email')
      .populate('assignedTo', 'name email')
      .populate('aiAnalysis');

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: 'Ticket not found.' });
    }

    if (
      req.user.role === 'student' &&
      ticket.student._id.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied.' });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    next(error);
  }
};

exports.updateTicket = async (req, res, next) => {
  try {
    const { status, priority, department, assignedTo, feedback } = req.body;
    const ticket = await Ticket.findById(req.params.id);

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: 'Ticket not found.' });
    }

    if (
      req.user.role === 'student' &&
      ticket.student.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied.' });
    }

    const updates = {};
    if (status) {
      updates.status = status;
      if (status === 'resolved') updates.resolvedAt = new Date();
      if (status === 'closed') updates.closedAt = new Date();
    }
    if (priority && req.user.role !== 'student') updates.priority = priority;
    if (department && req.user.role !== 'student') updates.department = department;
    if (assignedTo && req.user.role !== 'student') updates.assignedTo = assignedTo;
    if (feedback) updates.feedback = feedback;

    const updated = await Ticket.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    })
      .populate('student', 'name email')
      .populate('department', 'name code');

    if (status && updated.student) {
      sendTicketUpdate(
        updated.student,
        updated,
        `Your ticket status has been updated to: ${status}`
      ).catch((err) => logger.error(`Email error: ${err.message}`));
    }

    res.json({ success: true, ticket: updated });
  } catch (error) {
    next(error);
  }
};

exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: 'Ticket not found.' });
    }

    if (
      req.user.role === 'student' &&
      ticket.student.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ success: false, message: 'Access denied.' });
    }

    await Promise.all([
      Ticket.findByIdAndDelete(req.params.id),
      Response.deleteMany({ ticket: req.params.id }),
      AIAnalysis.findByIdAndDelete(ticket.aiAnalysis),
    ]);

    res.json({ success: true, message: 'Ticket deleted.' });
  } catch (error) {
    next(error);
  }
};

exports.getTicketSolutions = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('aiAnalysis');
    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, message: 'Ticket not found.' });
    }

    const responses = await Response.find({ ticket: req.params.id, type: 'solution' })
      .populate('author', 'name email role')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      aiAnalysis: ticket.aiAnalysis,
      solutions: responses,
    });
  } catch (error) {
    next(error);
  }
};
