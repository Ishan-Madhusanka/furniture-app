const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const {
  createListing,
  getAllListings,
  getListing,
  deleteListing,
  updateListing
} = require('../controllers/listingController');

router.get('/', getAllListings);
router.get('/:id', getListing);
router.post('/', auth, upload.array('images', 3), createListing);
router.put('/:id', auth, updateListing);
router.delete('/:id', auth, deleteListing);

module.exports = router;