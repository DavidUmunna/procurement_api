const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  action: { type: String, enum: ['Added', 'Removed', 'Updated', 'Created'], required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'InventoryItem' },
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Activity', activitySchema);