// middleware/monitorLogger.js

const Monitoring = require('../models/Monitoring'); // Mongoose model

const monitorLogger = async (req, res, next) => {
  const start = Date.now();

  // Listen for response finish
  res.on('finish', async () => {
    const responseTime = Date.now() - start;

    const log = {
      serviceName: 'your-api-service', // Customize per service
      endpoint: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode,
      responseTimeMs: responseTime,
      isError: res.statusCode >= 400,
      serverMeta: {
        ip: req.socket.localAddress,
        memoryUsage: process.memoryUsage(),
        cpuLoad: process.cpuUsage().user / 1000, // convert µs to ms
      },
      userMeta: {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
        // userId: req.user?._id (if you use auth)
      },
    };

    try {
      await Monitoring.create(log);
    } catch (err) {
      console.error('Failed to log monitoring data:', err);
    }
  });

  next();
};

module.exports = monitorLogger;
