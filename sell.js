document.addEventListener("DOMContentLoaded", () => {
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("fileInput");
    const selectPhotosButton = document.getElementById("selectPhotosButton");
    const imagePreview = document.getElementById("imagePreview");

    // Open file explorer when "Select photos" is clicked
    selectPhotosButton.addEventListener("click", () => {
        fileInput.click();
    });

    // Trigger preview when files are selected
    fileInput.addEventListener("change", (event) => {
        handleFiles(event.target.files);
    });

    // Drag-and-drop functionality
    dropzone.addEventListener("dragover", (event) => {
        event.preventDefault();
        dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (event) => {
        event.preventDefault();
        dropzone.classList.remove("dragover");
        handleFiles(event.dataTransfer.files);
    });

    // Handle file preview
    function handleFiles(files) {
        imagePreview.innerHTML = ""; // Clear previous previews

        if (files.length > 10) {
            alert("You can upload up to 10 images only.");
            return;
        }

        Array.from(files).forEach((file) => {
            if (!file.type.startsWith("image/")) {
                alert("Only image files are allowed.");
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement("img");
                img.src = e.target.result;
                imagePreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
});


// Load listing data for editing
async function loadListingForEdit(listingId) {
    try {
        const response = await fetch(`https://mokesell-ec88.restdb.io/rest/listing/${listingId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": "679628de0acc0620a20d364d",
            },
        });

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

// Save or create a new listing
async function saveListing(listingId) {
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
        username: user.username,
        email: user.email,
    };

    const endpoint = listingId
        ? `https://mokesell-ec88.restdb.io/rest/listing/${listingId}`
        : "https://mokesell-ec88.restdb.io/rest/listing";

    const method = listingId ? "PUT" : "POST";

    try {
        const response = await fetch(endpoint, {
            method,
            headers: {
                "Content-Type": "application/json",
                "x-apikey": "679628de0acc0620a20d364d",
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

// Fetch and display user-specific listings
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
        listingsContainer.innerHTML = listings
            .map(
                (listing) => `
                <div class="listing-item">
                    <img src="${listing.image}" alt="${listing.title}">
                    <h4>${listing.title}</h4>
                    <p>${listing.description}</p>
                    <p>Price: $${listing.price}</p>
                </div>`
            )
            .join("");
    } catch (error) {
        console.error("Error fetching listings:", error);
    }
}

// Initialize fetching user listings when the page loads
document.addEventListener("DOMContentLoaded", fetchUserListings);


async function saveListing(listingId) {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
        alert("You must be logged in to sell items.");
        window.location.href = "login.html";
        return;
    }

    // Get form values
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const price = document.getElementById("price").value;
    const image = document.getElementById("image").value;

    // Get selected condition
    const condition = document.querySelector('input[name="condition"]:checked');
    if (!condition) {
        alert("Please select a condition for the item.");
        return;
    }

    // Create the listing object
    const listing = {
        title,
        description,
        price,
        image,
        condition: condition.value, // Include the selected condition
        username: user.username,
        email: user.email,
    };

    // Send listing to the server
    try {
        const endpoint = listingId
            ? `https://mokesell-ec88.restdb.io/rest/listing/${listingId}`
            : "https://mokesell-ec88.restdb.io/rest/listing";

        const method = listingId ? "PUT" : "POST";

        const response = await fetch(endpoint, {
            method,
            headers: {
                "Content-Type": "application/json",
                "x-apikey": "679628de0acc0620a20d364d",
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
