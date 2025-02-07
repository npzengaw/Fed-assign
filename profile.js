document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    // Redirect to login if no user is logged in
    if (!user) {
        alert("You need to log in to access your profile.");
        window.location.href = "login.html";
        return;
    }

    // Update the profile username dynamically
    document.getElementById("profile-username").textContent = user.username;

    // Load the user's listings
    await loadUserListings(user.email);

    // Fetch all listings for debugging (only needed if displaying all listings in profile)
    await fetchListings();
});

async function loadUserListings(email) {
    const USE_LOCAL_API = true; // Change to `false` to use RestDB API
    const API_URL = USE_LOCAL_API 
        ? "http://localhost:5000/listing" 
        : "https://mokesell-ec88.restdb.io/rest/listing";
    const API_KEY = "679628de0acc0620a20d364d"; // Only used for RestDB API

    try {
        // Construct the correct query URL
        const queryURL = USE_LOCAL_API 
            ? `${API_URL}?email=${email}` 
            : `${API_URL}?q={"email":"${email}"}`;

        // Fetch listings for the logged-in user
        const response = await fetch(queryURL, {
            method: "GET",
            headers: USE_LOCAL_API
                ? { "Content-Type": "application/json" } // No API key for local
                : { "Content-Type": "application/json", "x-apikey": API_KEY } // RestDB
        });

        if (!response.ok) throw new Error("Failed to fetch user listings.");

        const listings = await response.json();
        const listingsContainer = document.getElementById("user-listings-container");

        // If no listings are found, show a message
        if (listings.length === 0) {
            listingsContainer.innerHTML = "<p>No listings found. Start selling now!</p>";
            return;
        }

        // Render the user's listings dynamically
        listingsContainer.innerHTML = listings.map(
            (listing) => `
                <div class="listing-item">
                    <img src="${listing.image}" alt="${listing.title}" onerror="this.src='https://via.placeholder.com/150';" />
                    <h4>${listing.title}</h4>
                    <p>${listing.description}</p>
                    <p>Price: $${listing.price}</p>
                    <button onclick="editListing('${listing.id || listing._id}')">Edit</button>
                    <button onclick="deleteListing('${listing.id || listing._id}')">Delete</button>
                </div>
            `
        ).join("");
    } catch (error) {
        console.error("Error fetching user listings:", error);
        alert("Failed to load your listings. Please try again later.");
    }
}

async function fetchListings() {
    const API_URL = "http://localhost:5000/listing"; // Use local API for testing

    try {
        console.log("Fetching all listings...");
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) {
            console.error("HTTP Error:", response.status);
            throw new Error("Failed to fetch listings");
        }

        const listings = await response.json();
        console.log("Listings data:", listings);

        const listingsContainer = document.getElementById("featured-listings");

        if (!listings || listings.length === 0) {
            listingsContainer.innerHTML = "<p>No listings available.</p>";
            return;
        }

        listingsContainer.innerHTML = ""; // Clear existing content

        listings.forEach((listing) => {
            const listingElement = document.createElement("div");
            listingElement.className = "listing";
            listingElement.innerHTML = `
                <img src="${listing.image}" alt="${listing.title}" onerror="this.src='https://via.placeholder.com/150';" />
                <h3>${listing.title}</h3>
                <p>${listing.description}</p>
                <span>Price: $${listing.price}</span>
            `;
            listingsContainer.appendChild(listingElement);
        });
    } catch (error) {
        console.error("Fetch error:", error.message);
        alert("Failed to fetch listings. Please check the console for more details.");
    }
}

async function deleteListing(listingId) {
    const API_URL = "http://localhost:5000/listing"; // Local API

    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
        const response = await fetch(`${API_URL}/${listingId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            }
        });

        if (!response.ok) throw new Error("Failed to delete listing.");

        alert("Listing deleted successfully!");
        window.location.reload(); // Reload the profile page to update the listings
    } catch (error) {
        console.error("Error deleting listing:", error);
        alert("Failed to delete listing. Please try again.");
    }
}

function editListing(listingId) {
    window.location.href = `sell.html?edit=${listingId}`;
}
