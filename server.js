const express = require('express');
const multer = require('multer');
const path = require('path');
const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (e.g., images)
app.use('/uploads', express.static('uploads'));

// Simple in-memory database for listings
let listings = [];

// Multer configuration for handling file uploads (images)
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

// POST endpoint to add a new listing
app.post('/listing', upload.single('image'), (req, res) => {
    const { title, description, price, image } = req.body;

    // If no image, we can handle as a placeholder or skip this
    const newListing = {
        id: listings.length + 1,
        title,
        description,
        price,
        image: req.file ? `/uploads/${req.file.filename}` : image // Store uploaded image or use Base64
    };
    listings.push(newListing);
    res.status(201).json(newListing);
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
