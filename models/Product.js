const { Schema, model } = require('mongoose');

const ProductSchema = new Schema({
  
  staff:{
    type: Schema.Types.ObjectId,
    ref: 'user',
  },
  Department: { type: String, required: true },
  products:[{name: { type: String, required: true }, 
  quantity:{ type:Number , required:true},
  price: { type: Number, required: true },
  }]
}, { timestamps: true });

module.exports = model("Product", ProductSchema);