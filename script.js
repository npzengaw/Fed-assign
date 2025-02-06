// RESTdb.io API Configuration
const API_URL = 'http://localhost:5000/listing';
const API_KEY = '679628de0acc0620a20d364d';

// Fetch and Display Listings
async function fetchListings() {
    try {
        console.log('Fetching listings...');
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': API_KEY
            }
        });

        console.log('Response object:', response);

        if (!response.ok) {
            console.error('HTTP Error:', response.status);
            throw new Error('Failed to fetch listings');
        }

        const listings = await response.json();
        console.log('Listings data:', listings);

        if (!Array.isArray(listings) || listings.length === 0) {
            const listingsContainer = document.getElementById('featured-listings');
            listingsContainer.innerHTML = '<p>No listings available.</p>';
            return;
        }

        const listingsContainer = document.getElementById('featured-listings');
        listingsContainer.innerHTML = ''; // Clear existing content

        listings.forEach((listing) => {
            const listingElement = document.createElement('div');
            listingElement.className = 'listing';
            listingElement.innerHTML = `
                <img src="${listing.image}" alt="${listing.title}" onerror="this.src='https://via.placeholder.com/150';" />
                <h3>${listing.title}</h3>
                <p>${listing.description}</p>
                <span>Price: $${listing.price}</span>
            `;
            listingsContainer.appendChild(listingElement);
        });
    } catch (error) {
        console.error('Fetch error:', error.message);
        alert('Failed to fetch listings. Please check the console for more details.');
    }
}

// Initialize Listings on Page Load
document.addEventListener('DOMContentLoaded', fetchListings);


document.getElementById("add-listing-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
        alert("You must be logged in to sell items.");
        window.location.href = "login.html";
        return;
    }

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const price = document.getElementById("price").value;
    const image = document.getElementById("image").value;

    try {
        const response = await fetch("http://localhost:5000/api/listings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": token,
            },
            body: JSON.stringify({ title, description, price, image }),
        });

        if (!response.ok) {
            throw new Error("Failed to add listing.");
        }

        alert("Listing successfully added!");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Error adding listing:", error);
        alert("Error adding listing.");
    }
});
async function fetchFeaturedListings() {
    const API_URL = 'https://mokesell-ec88.restdb.io/rest/listing';
    const API_KEY = '679628de0acc0620a20d364d';

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'x-apikey': API_KEY
            }
        });

        if (!response.ok) throw new Error('Failed to fetch featured listings.');

        const listings = await response.json();
        const listingsContainer = document.querySelector('#featured-listings .listings-container');

        if (!listings || listings.length === 0) {
            listingsContainer.innerHTML = '<p>No featured listings available.</p>';
            return;
        }

        listingsContainer.innerHTML = listings.map((listing) => `
            <div class="listing">
                <img src="${listing.image}" alt="${listing.title}" onerror="this.src='https://via.placeholder.com/150';" />
                <h3>${listing.title}</h3>
                <p>${listing.description}</p>
                <span>Price: $${listing.price}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching featured listings:', error);
        alert('Failed to load featured listings.');
    }
}

document.addEventListener('DOMContentLoaded', fetchFeaturedListings);
