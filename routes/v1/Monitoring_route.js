const express = require('express');
const router = express.Router();
const monitoringController = require('../../controllers/v1.controllers/Monitoring_control');

router.post('/', monitoringController.createMonitoringLog);
router.get('/', monitoringController.getMonitoringLogs);
router.get('/stats', monitoringController.getResponseTimeStats);
router.get('/:id', monitoringController.getMonitoringLogById);
router.delete('/cleanup', monitoringController.cleanupOldLogs);

module.exports = router;
