const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    enum: ['sofa', 'bed', 'table', 'chair', 'wardrobe', 'other'],
    default: 'other'
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair'],
    default: 'good'
  },
  images: [{
    type: String
  }],
  location: {
    type: String,
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerPhone: {
  type: String,
  default: ''
},
  isSold: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);