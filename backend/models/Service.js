const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxlength: 1000
  },
  category: {
    type: String,
    required: [true, 'Service category is required'],
    enum: [
      'cleaning',
      'plumbing',
      'electrical',
      'carpentry',
      'painting',
      'gardening',
      'appliance-repair',
      'moving',
      'tutoring',
      'pet-care',
      'other'
    ]
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pricing: {
    type: {
      type: String,
      enum: ['hourly', 'fixed', 'quote'],
      default: 'hourly'
    },
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  duration: {
    estimated: Number, // in minutes
    minimum: Number    // minimum booking duration
  },
  location: {
    type: {
      type: String,
      enum: ['remote', 'client-location', 'provider-location', 'flexible'],
      default: 'client-location'
    },
    serviceArea: {
      radius: Number, // in kilometers
      cities: [String]
    }
  },
  images: [{
    url: String,
    alt: String
  }],
  tags: [{
    type: String,
    trim: true
  }],
  requirements: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  totalBookings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search functionality
serviceSchema.index({ title: 'text', description: 'text', tags: 'text' });
serviceSchema.index({ category: 1, 'location.type': 1 });

module.exports = mongoose.model('Service', serviceSchema);
