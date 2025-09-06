// controllers/monitoringController.js

const Monitoring = require('../../models/Monitoring');

// Create a new monitoring log
exports.createMonitoringLog = async (req, res) => {
  try {
    const logData = req.body;
   

    const newLog = await Monitoring.create(logData);
    return res.status(201).json({ message: 'Log created', data: newLog });

  } catch (error) {
    console.error('Error creating monitoring log:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/monitoring?serviceName=orders-api&limit=50
// GET /api/monitoring?page=1&limit=20
exports.getMonitoringLogs = async (req, res) => {
  try {
    const {
      serviceName,
      endpoint,
      method,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};
    if (serviceName) query.serviceName = serviceName;
    if (endpoint) query.endpoint = endpoint;
    if (method) query.method = method;

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      Monitoring.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Monitoring.countDocuments(query)
    ]);

    return res.status(200).json({
      logs,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      totalLogs: total,
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


exports.getMonitoringLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await Monitoring.findById(id);
    if (!log) return res.status(404).json({ message: 'Log not found' });

    return res.status(200).json(log);
  } catch (error) {
    console.error('Error fetching log by ID:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};


// DELETE /api/monitoring/cleanup?days=30
exports.cleanupOldLogs = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - Number(days));

    const result = await Monitoring.deleteMany({ createdAt: { $lt: thresholdDate } });

    return res.status(200).json({
      message: `Deleted ${result.deletedCount} logs older than ${days} days`,
    });
  } catch (error) {
    console.error('Error cleaning up logs:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getResponseTimeStats = async (req, res) => {
  try {
    const stats = await Monitoring.aggregate([
      {
        $group: {
          _id: { endpoint: "$endpoint", method: "$method" },
          avgResponseTime: { $avg: "$responseTimeMs" },
          count: { $sum: 1 }
        }
      },
      { $sort: { avgResponseTime: -1 } }
    ]);

    return res.status(200).json(stats);
  } catch (error) {
    console.error('Error aggregating stats:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
