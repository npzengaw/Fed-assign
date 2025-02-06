document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const listingId = urlParams.get("edit");

    if (listingId) {
        await loadListingForEdit(listingId);
    }

    document.getElementById("add-listing-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        await saveListing(listingId);
    });
});

async function loadListingForEdit(listingId) {
    try {
        const response = await fetch(`http://localhost:5000/api/listings/${listingId}`);
        if (!response.ok) throw new Error("Failed to load listing.");

        const listing = await response.json();
        document.getElementById("listing-id").value = listing._id;
        document.getElementById("title").value = listing.title;
        document.getElementById("description").value = listing.description;
        document.getElementById("price").value = listing.price;
        document.getElementById("image").value = listing.image;
    } catch (error) {
        console.error("Error loading listing:", error);
    }
}

async function saveListing() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("You must be logged in to sell items.");
        window.location.href = "login.html";
        return;
    }

    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const price = document.getElementById("price").value;
    const image = document.getElementById("image").value;

    const listing = {
        title,
        description,
        price,
        image,
        username: user.username, // Link the listing to the logged-in user
        email: user.email // Optionally include email for verification
    };

    try {
        const response = await fetch("https://mokesell-ec88.restdb.io/rest/listing", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": "679628de0acc0620a20d364d", // Your API key
            },
            body: JSON.stringify(listing),
        });

        if (!response.ok) throw new Error("Failed to save listing.");

        alert("Listing saved successfully!");
        window.location.href = "profile.html";
    } catch (error) {
        console.error("Error saving listing:", error);
        alert("Error saving listing. Please try again.");
    }
}

document.getElementById("add-listing-form").addEventListener("submit", (event) => {
    event.preventDefault();
    saveListing();
});
async function fetchUserListings() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("You must be logged in.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`https://mokesell-ec88.restdb.io/rest/listing?q={"email":"${user.email}"}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": "679628de0acc0620a20d364d",
            },
        });

        if (!response.ok) throw new Error("Failed to fetch listings.");

        const listings = await response.json();
        const listingsContainer = document.getElementById("user-listings-container");
        listingsContainer.innerHTML = listings.map((listing) => `
            <div class="listing-item">
                <img src="${listing.image}" alt="${listing.title}">
                <h4>${listing.title}</h4>
                <p>${listing.description}</p>
                <p>Price: $${listing.price}</p>
            </div>
        `).join("");
    } catch (error) {
        console.error("Error fetching listings:", error);
    }
}

document.addEventListener("DOMContentLoaded", fetchUserListings);
