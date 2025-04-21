const express = require('express');
const router = express.Router();
const InventoryItem = require('../models/inventory');
const auth = require('./check-auth');

// @route   GET /api/inventory
// @desc    Get all inventory items
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { category, condition, search } = req.query;

    const filter = {};

    if (category && category !== 'All') filter.category = category;
    if (condition) filter.condition = condition;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const items = await InventoryItem.find(filter)
      .sort({ lastUpdated: -1 })
      .lean();

    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});
// Add this new endpoint
router.get('/categories', auth, async (req, res) => {
  try {
    // Return your predefined categories
    const categories=['IT_equipment',
        'Furniture',
        'Office_Supplies',
        'waste_management',
        'lab',
        'PVT',
        'Other']
    res.json({ 
      success: true, 
      data: {categories}
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});
// @route   POST /api/inventory
// @desc    Create new inventory item
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, quantity, condition, description,value } = req.body;
    
    const newItem = new InventoryItem({
      name,
      category,
      quantity,
      condition,
      description,
      value,
      addedBy: req.user.userId
    });

    await newItem.save();
    res.status(201).json({ success: true, data: newItem });
  } catch (err) {
    console.error("a posting error:",err)
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: Object.values(err.errors).map(val => val.message) 
      });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   PUT /api/inventory/:id
// @desc    Update inventory item
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, category, quantity, condition, description } = req.body;
    
    const updatedItem = await InventoryItem.findByIdAndUpdate(
      req.params.id,
      { 
        name,
        category,
        quantity,
        condition,
        description,
        value: req.body.value || 0,
        lastUpdated: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: updatedItem });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        success: false, 
        message: Object.values(err.errors).map(val => val.message) 
      });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   DELETE /api/inventory/:id
// @desc    Delete inventory item
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedItem = await InventoryItem.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/inventory/stats
// @desc    Get inventory statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const totalItems = await InventoryItem.countDocuments();
    const totalQuantity = await InventoryItem.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const categories = await InventoryItem.distinct('category');
    const conditionStats = await InventoryItem.aggregate([
      { $group: { _id: '$condition', count: { $sum: 1 } } }
    ]);
    const value = await InventoryItem.distinct('value');
    const totalvalue = await InventoryItem.aggregate([
      { $group: { _id: null, count: { $sum: '$value' } } }
    ]);
    console.log(totalvalue)
    res.json({
      success: true,
      data: {
        totalItems,
        totalQuantity: totalQuantity[0]?.total || 0,
        totalCategories: categories.length,
        totalvalue: totalvalue[0]?.count||0,
        conditionStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

module.exports = router;