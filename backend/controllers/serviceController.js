const Service = require('../models/Service');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = async (req, res) => {
  try {
    const { category, search, location, priceMin, priceMax, rating } = req.query;
    
    let query = { isActive: true };

    // Category filter
    if (category) {
      query.category = category;
    }

    // Search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Price range filter
    if (priceMin || priceMax) {
      query['pricing.amount'] = {};
      if (priceMin) query['pricing.amount'].$gte = Number(priceMin);
      if (priceMax) query['pricing.amount'].$lte = Number(priceMax);
    }

    // Rating filter
    if (rating) {
      query['rating.average'] = { $gte: Number(rating) };
    }

    const services = await Service.find(query)
      .populate('provider', 'name email phone rating profileImage')
      .sort({ createdAt: -1 });

    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name email phone rating profileImage bio experience');

    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Workers only)
const createService = async (req, res) => {
  try {
    const service = new Service({
      ...req.body,
      provider: req.user._id
    });

    const createdService = await service.save();
    await createdService.populate('provider', 'name email phone rating profileImage');

    res.status(201).json(createdService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Owner only)
const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (service) {
      if (service.provider.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to update this service' });
      }

      Object.assign(service, req.body);
      const updatedService = await service.save();
      await updatedService.populate('provider', 'name email phone rating profileImage');

      res.json(updatedService);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private (Owner only)
const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (service) {
      if (service.provider.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized to delete this service' });
      }

      await service.deleteOne();
      res.json({ message: 'Service removed' });
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's services
// @route   GET /api/services/my-services
// @access  Private (Workers only)
const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  getMyServices
};
