const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    start: {
      type: String,
      required: true
    },
    end: String
  },
  location: {
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    instructions: String
  },
  pricing: {
    baseAmount: {
      type: Number,
      required: true
    },
    additional: [{
      description: String,
      amount: Number
    }],
    totalAmount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'in-progress',
      'completed',
      'cancelled',
      'disputed'
    ],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'online', 'wallet']
  },
  notes: {
    client: String,
    provider: String,
    admin: String
  },
  requirements: [String],
  completion: {
    completedAt: Date,
    workDuration: Number, // in minutes
    photos: [{
      url: String,
      description: String
    }],
    clientSignature: String,
    providerNotes: String
  },
  review: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    reviewedAt: Date
  },
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: String,
    cancelledAt: Date,
    refundAmount: Number
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
bookingSchema.index({ client: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ scheduledDate: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
