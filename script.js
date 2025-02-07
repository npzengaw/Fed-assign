document.addEventListener("DOMContentLoaded", function() {
    // Delay the setup of event listeners to ensure the DOM is fully loaded
    setTimeout(() => {
        const searchBar = document.getElementById("searchBar");
        const searchBtn = document.getElementById("search-btn");
        const listingsContainer = document.getElementById("featured-listings-container");

        // Log elements to verify they are loaded
        console.log("Search Bar:", searchBar);
        console.log("Search Button:", searchBtn);
        console.log("Listings Container:", listingsContainer);

        // If any element is missing, log an error
        if (!searchBar || !searchBtn || !listingsContainer) {
            console.error("Required elements not found!");
            return;
        }

        // Search Button Click Event
        searchBtn.addEventListener("click", function() {
            const query = searchBar.value.toLowerCase();
            console.log("Search Query on Button Click:", query); // Log the query when clicked
            fetchListings(query);
        });

        // Search Input Event for Real-Time Search
        searchBar.addEventListener("input", function() {
            const query = searchBar.value.toLowerCase();
            console.log("Search Query on Input:", query); // Log the query when typing
            fetchListings(query);
        });

        // Initial fetch for featured listings
        fetchFeaturedListings();
    }, 500); // Delay by 500ms
});

// Fetch Listings Based on Search Query
async function fetchListings(query) {
    if (!query) {
        console.error("Search query is empty.");
        return;
    }

    // Log the query to ensure it's correct
    console.log("Search Query:", query);

    try {
        const response = await fetch("db.json"); // Fetch the local db.json
        const listings = await response.json();

        // Filter the listings by matching the title with the query
        const filteredListings = listings.listing.filter(item => {
            // Matching by name only, case insensitive
            return item.title.toLowerCase().includes(query.toLowerCase());
        });

        displaySearchResults(filteredListings);
    } catch (error) {
        console.error("Error fetching listings:", error);
    }
}


// Display Search Results
function displaySearchResults(listings) {
    const resultsContainer = document.getElementById("search-results-container");
    resultsContainer.innerHTML = ""; // Clear previous results

    if (listings.length === 0) {
        resultsContainer.innerHTML = "<p>No items found based on your search.</p>";
        return;
    }

    listings.forEach(item => {
        const itemElement = document.createElement("div");
        itemElement.classList.add("listing");

        itemElement.innerHTML = `
            <img src="${item.image ? item.image : 'https://via.placeholder.com/150'}" 
                 alt="${item.title}" 
                 onerror="this.src='https://via.placeholder.com/150';" />
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <span>Price: $${item.price},</span>
            <span>Condition: ${item.condition}</span>
        `;
        
        // Add the created listing element to the container
        resultsContainer.appendChild(itemElement);
    });
}


// Fetch Featured Listings
async function fetchFeaturedListings() {
    try {
        const response = await fetch("db.json"); // Use the local db.json file
        const listings = await response.json();
        const listingsContainer = document.querySelector('#featured-listings-container');

        if (!listingsContainer) {
            console.error("Error: Listings container not found.");
            return;
        }

        if (!listings || listings.length === 0) {
            listingsContainer.innerHTML = '<p>No featured listings available.</p>';
            return;
        }

        listingsContainer.innerHTML = listings.listing.map((listing) => `
            <div class="listing">
                <img src="${listing.image ? listing.image : 'https://via.placeholder.com/150'}" 
                     alt="${listing.title}" 
                     onerror="this.src='https://via.placeholder.com/150';" />
                <h3>${listing.title}</h3>
                <p>${listing.description}</p>
                <span>Price: $${listing.price},</span>
                <span>Condition: ${listing.condition}</span>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error fetching featured listings:', error);
        alert('Failed to load featured listings.');
    }
}
