const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to User
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Listing', ListingSchema);
