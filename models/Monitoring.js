const mongoose = require('mongoose');

const MonitoringSchema = new mongoose.Schema({
  serviceName: {
    type: String,
    required: true,
  },
  endpoint: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    required: true,
  },
  statusCode: {
    type: Number,
    required: true,
  },
  responseTimeMs: {
    type: Number, // response time in milliseconds
    required: true,
  },
  isError: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  serverMeta: {
    ip: String,
    memoryUsage: {
      rss: Number,
      heapUsed: Number,
      heapTotal: Number,
    },
    cpuLoad: Number, // or more detailed info if needed
  },
  userMeta: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userAgent: String,
    ip: String,
  },
}, { timestamps: true });


const Monitoring=mongoose.model("Monitoring",MonitoringSchema)

module.exports=Monitoring