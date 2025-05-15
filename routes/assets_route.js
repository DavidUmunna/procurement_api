const express = require('express');
const router = express.Router();
const AssetItem = require('../models/Assets');
const auth = require('../middlewares/check-auth');
const { getPagination,getPagingData } = require('../middlewares/pagination');

function generateSKU(name) {
  const prefix = name.substring(0, 3).toUpperCase(); 
  const unique = Date.now().toString().slice(-5);    
  return `${prefix}-${unique}`;     
}                 
router.get('/', auth, async (req, res) => {
  try {
    const {page,limit,skip}=getPagination(req);
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

    const [total,items] = await Promise.all([
      AssetItem.countDocuments(filter),
      AssetItem.find(filter)
      .sort({ lastUpdated: -1 })
      .lean()
      .skip(skip)
      .limit(limit)])

    res.json({ success: true, data: items,Pagination:getPagingData(total,page,limit) });
  } catch (err) {
    console.error("error originated from asset get route:",err)
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});
// Add this new endpoint
router.get('/categories', auth, async (req, res) => {
  try {
    // Return your predefined categories
    const categories=['IT_equipment',
        'Furniture',
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
// @route   POST /apiAsset
// @desc    Create newAsset item
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, category, quantity, condition, description,value } = req.body;
    const sku=generateSKU(name)
    const newItem = new AssetItem({
      name,
      category,
      quantity,
      condition,
      description,
      value,
      sku,
      addedBy: req.user.name
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

// @route   PUT /apiAsset/:id
// @desc    UpdateAsset item
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, category, quantity, condition, description } = req.body;
    
    const updatedItem = await AssetItem.findByIdAndUpdate(
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

// @route   DELETE /apiAsset/:id
// @desc    DeleteAsset item
// @access  Private (Admin only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deletedItem = await AssetItem.findByIdAndDelete(req.params.id);
    
    if (!deletedItem) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    res.json({ success: true, data: {} });
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/Asset/stats
// @desc    GetAsset statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const totalItems = await AssetItem.countDocuments();
    const totalQuantity = await AssetItem.aggregate([
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const categories = await AssetItem.distinct('category');
    const conditionStats = await AssetItem.aggregate([
      { $group: { _id: '$condition', count: { $sum: 1 } } }
    ]);
    const value = await AssetItem.distinct('value');
    const totalvalue = await AssetItem.aggregate([
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