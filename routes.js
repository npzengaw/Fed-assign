const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
const User = require('../models/User'); // Ensure User model is imported
const jwt = require('jsonwebtoken');

// Middleware to verify user authentication
const authenticateUser = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied. No token provided.' });

    try {
        const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8")); // Decode user info
        req.user = decoded;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

// ----------------------
// User Routes
// ----------------------

// Get all users (for debugging)
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user profile data
router.get('/users/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ----------------------
// Listing Routes
// ----------------------

// Get all listings
router.get('/listings', async (req, res) => {
    try {
        const listings = await Listing.find().populate('userId', 'username email'); // Fetch user details
        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get listings for a specific user
router.get('/listings/user/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const listings = await Listing.find({ userId: user._id });
        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single listing by ID
router.get('/listings/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: "Listing not found" });

        res.json(listing);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new listing (Requires Authentication)
router.post('/listings', authenticateUser, async (req, res) => {
    const { title, description, price, image } = req.body;

    if (!req.user) return res.status(403).json({ message: 'Unauthorized' });

    const listing = new Listing({
        title,
        description,
        price,
        image,
        userId: req.user._id // Assign listing to logged-in user
    });

    try {
        const newListing = await listing.save();
        res.status(201).json(newListing);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update Listing (Only by Owner)
router.put('/listings/:id', authenticateUser, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: "Listing not found" });

        if (listing.userId.toString() !== req.user._id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        const updatedListing = await Listing.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedListing);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete Listing (Only by Owner)
router.delete('/listings/:id', authenticateUser, async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        if (!listing) return res.status(404).json({ message: "Listing not found" });

        if (listing.userId.toString() !== req.user._id) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        await Listing.findByIdAndDelete(req.params.id);
        res.json({ message: "Listing deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
