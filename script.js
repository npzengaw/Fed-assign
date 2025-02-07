


// Fetch and Display Listings
async function fetchListings() {
    try {
        console.log(`Fetching listings from ${API_URL}...`);
        const response = await fetch(API_URL, {
            method: "GET",
            headers: USE_LOCAL_API
                ? { "Content-Type": "application/json" } // No API key for local
                : { "Content-Type": "application/json", "x-apikey": API_KEY }
        });

        if (!response.ok) {
            console.error("HTTP Error:", response.status);
            throw new Error("Failed to fetch listings");
        }

        const listings = await response.json();
        console.log("Listings:", listings);

        const listingsContainer = document.getElementById("featured-listings");
        if (!listings || listings.length === 0) {
            listingsContainer.innerHTML = "<p>No listings available.</p>";
            return;
        }

        listingsContainer.innerHTML = listings.map((listing) => `
            <div class="listing">
                <img src="${listing.image ? listing.image : 'https://via.placeholder.com/150'}" 
                     alt="${listing.title}" 
                     onerror="this.src='https://via.placeholder.com/150';" />
                <h3>${listing.title}</h3>
                <p>${listing.description}</p>
                <span>Price: $${listing.price}</span>
            </div>
        `).join("");
    } catch (error) {
        console.error("Error fetching listings:", error);
        alert("Failed to fetch listings.");
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
    const imageFile = document.getElementById("image").files[0];

    if (!imageFile) {
        alert("Please upload an image.");
        return;
    }

    // Convert image to Base64
    const reader = new FileReader();
    reader.readAsDataURL(imageFile);
    reader.onload = async function () {
        const imageBase64 = reader.result;

        try {
            const response = await fetch("https://mokesell-ec88.restdb.io/rest/listing", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-apikey": API_KEY,
                    "Authorization": token
                },
                body: JSON.stringify({ title, description, price, image: imageBase64 })
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
    };
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
