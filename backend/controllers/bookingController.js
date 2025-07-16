const Booking = require('../models/Booking');
const Service = require('../models/Service');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Users only)
const createBooking = async (req, res) => {
  try {
    const { serviceId, scheduledDate, scheduledTime, location, notes, requirements } = req.body;

    // Get service details
    const service = await Service.findById(serviceId).populate('provider');
    
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Check if user is trying to book their own service
    if (service.provider._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot book your own service' });
    }

    const booking = new Booking({
      service: serviceId,
      client: req.user._id,
      provider: service.provider._id,
      scheduledDate,
      scheduledTime,
      location,
      pricing: {
        baseAmount: service.pricing.amount,
        totalAmount: service.pricing.amount,
        currency: service.pricing.currency
      },
      notes: {
        client: notes
      },
      requirements
    });

    const createdBooking = await booking.save();
    await createdBooking.populate([
      { path: 'service', select: 'title category pricing' },
      { path: 'client', select: 'name email phone' },
      { path: 'provider', select: 'name email phone' }
    ]);

    // Update service booking count
    service.totalBookings += 1;
    await service.save();

    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  try {
    const { status, role } = req.query;
    let query = {};

    if (req.user.role === 'user' || role === 'client') {
      query.client = req.user._id;
    } else if (req.user.role === 'worker' || role === 'provider') {
      query.provider = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    const bookings = await Booking.find(query)
      .populate('service', 'title category pricing images')
      .populate('client', 'name email phone profileImage')
      .populate('provider', 'name email phone profileImage rating')
      .sort({ scheduledDate: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service')
      .populate('client', 'name email phone profileImage address')
      .populate('provider', 'name email phone profileImage rating bio');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is authorized to view this booking
    if (booking.client._id.toString() !== req.user._id.toString() && 
        booking.provider._id.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check authorization
    const isProvider = booking.provider.toString() === req.user._id.toString();
    const isClient = booking.client.toString() === req.user._id.toString();

    if (!isProvider && !isClient) {
      return res.status(401).json({ message: 'Not authorized to update this booking' });
    }

    // Status transition rules
    const allowedTransitions = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['in-progress', 'cancelled'],
      'in-progress': ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      disputed: ['completed', 'cancelled']
    };

    if (!allowedTransitions[booking.status].includes(status)) {
      return res.status(400).json({ 
        message: `Cannot transition from ${booking.status} to ${status}` 
      });
    }

    booking.status = status;

    if (status === 'completed') {
      booking.completion.completedAt = new Date();
      if (notes) {
        booking.completion.providerNotes = notes;
      }
    }

    if (status === 'cancelled') {
      booking.cancellation = {
        cancelledBy: req.user._id,
        reason: notes,
        cancelledAt: new Date()
      };
    }

    const updatedBooking = await booking.save();
    await updatedBooking.populate([
      { path: 'service', select: 'title category pricing' },
      { path: 'client', select: 'name email phone' },
      { path: 'provider', select: 'name email phone' }
    ]);

    res.json(updatedBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add review to booking
// @route   PUT /api/bookings/:id/review
// @access  Private (Client only)
const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user is the client
    if (booking.client.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Only clients can add reviews' });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({ message: 'Can only review completed bookings' });
    }

    // Check if already reviewed
    if (booking.review.rating) {
      return res.status(400).json({ message: 'Booking already reviewed' });
    }

    booking.review = {
      rating,
      comment,
      reviewedAt: new Date()
    };

    await booking.save();

    // Update service and provider ratings
    const service = await Service.findById(booking.service);
    if (service) {
      const totalRating = service.rating.average * service.rating.count + rating;
      service.rating.count += 1;
      service.rating.average = totalRating / service.rating.count;
      await service.save();
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  updateBookingStatus,
  addReview
};
