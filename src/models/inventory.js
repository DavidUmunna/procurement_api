const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the Inventory Item Schema
const InventoryItemSchema = new Schema({
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
      values: ['procurement_items','lab_items'],
      message: 'Invalid category'
    }
  },
  sku: {
    type: String,
    unique: true,
    required: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
    default: 1
  },

},{
    timestamps: true,

  });

// Model export
const InventoryItem = mongoose.model('InventoryItem', InventoryItemSchema);

module.exports = InventoryItem;

async function generateUniqueSKU(category) {
    const prefix = category.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    const sku = `${prefix}-${randomNum}`;
    
    // Check if SKU exists (very low probability but we should verify)
    const exists = await AssetItem.findOne({ sku });
    return exists ? generateUniqueSKU(category) : sku;
  }
InventoryItemSchema.pre('save',async function(next){
    if(!this.sku){
        this.sku=await generateUniqueSKU(this.category)
    }
    next()
})