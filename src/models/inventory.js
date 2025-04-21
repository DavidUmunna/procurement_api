const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Inventory Item Schema
const inventoryItemSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['IT_equipment', 'Furniture', 'Office_Supplies', 'waste_management',"lab","PVT", 'Other'],
      message: 'Invalid category'
    }
  },
  condition: {
    type: String,
    required: [true, 'Condition is required'],
    enum: {
      values: ['New', 'Used', 'Refurbished', 'Damaged'],
      message: 'Invalid condition'
    },
    default: 'New'
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 1
  },
  value: {
    type: Number,
    required: [true, 'Value is required'],
    min: [0, 'Value cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  sku: {
    type: String,
    unique: true,
    trim: true,
    uppercase: true,
    validate: {
      validator: function(v) {
        return /^[A-Z0-9]{6,12}$/.test(v);
      },
      message: 'SKU must be 6-12 alphanumeric characters'
    }
  },
  location: {
    warehouse: {
      type: String,
      trim: true
    },
    shelf: {
      type: String,
      trim: true
    }
  },
 
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total inventory value (quantity * value)
inventoryItemSchema.virtual('totalValue').get(function() {
  return this.quantity * this.value;
});

// Indexes for better query performance
inventoryItemSchema.index({ name: 'text', category: 1, condition: 1 });
inventoryItemSchema.index({ sku: 1 }, { unique: true });

// Middleware to handle SKU generation if not provided
inventoryItemSchema.pre('save', async function(next) {
  if (!this.sku) {
    this.sku = await generateUniqueSKU(this.category);
  }
  next();
});

// Static method for inventory summary by condition
inventoryItemSchema.statics.getConditionSummary = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$condition',
        count: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { $sum: { $multiply: ['$quantity', '$value'] } }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

// Model export
const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);

module.exports = InventoryItem;

// Helper function for SKU generation
async function generateUniqueSKU(category) {
  const prefix = category.substring(0, 3).toUpperCase();
  const randomNum = Math.floor(100 + Math.random() * 900);
  const sku = `${prefix}-${randomNum}`;
  
  // Check if SKU exists (very low probability but we should verify)
  const exists = await InventoryItem.findOne({ sku });
  return exists ? generateUniqueSKU(category) : sku;
}