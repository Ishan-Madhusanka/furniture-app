const Listing = require('../models/Listing');
const cloudinary = require('../config/cloudinary');

// Create listing with images
exports.createListing = async (req, res) => {
  try {
    const { title, description, price, category, condition, location, sellerPhone } = req.body;
    
    let imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'furnimart' },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(file.buffer);
        });
        imageUrls.push(result.secure_url);
      }
    }

    const listing = await Listing.create({
      title,
      description,
      price,
      category,
      condition,
      location,
      sellerPhone,
      images: imageUrls,
      seller: req.userId
    });

    res.status(201).json({ message: 'Listing created!', listing });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all listings
exports.getAllListings = async (req, res) => {
  try {
    const listings = await Listing.find({ isSold: false })
      .populate('seller', 'name phone')
      .sort({ createdAt: -1 });

    res.json(listings);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single listing
exports.getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name phone email');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete listing
exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await listing.deleteOne();
    res.json({ message: 'Listing deleted!' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};// Update listing
exports.updateListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.seller.toString() !== req.userId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { title, description, price, category, condition, location, sellerPhone } = req.body;

    listing.title = title || listing.title;
    listing.description = description || listing.description;
    listing.price = price || listing.price;
    listing.category = category || listing.category;
    listing.condition = condition || listing.condition;
    listing.location = location || listing.location;
    listing.sellerPhone = sellerPhone || listing.sellerPhone;

    await listing.save();
    res.json({ message: 'Listing updated!', listing });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};