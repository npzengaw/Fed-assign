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
    const condition = document.querySelector('input[name="condition"]:checked')?.value;

    if (!condition) {
        alert("Please select a condition for the item.");
        return;
    }

    // Handle Image Uploads
    const imageFile = document.getElementById("fileInput").files[0];
    let imageUrl = "";

    if (imageFile) {
        if (USE_LOCAL_API) {
            // Upload image to localhost backend
            const formData = new FormData();
            formData.append("image", imageFile);

            const uploadResponse = await fetch("http://localhost:5000/upload", {
                method: "POST",
                body: formData,
            });

            const uploadData = await uploadResponse.json();
            imageUrl = uploadData.imageUrl; // Get image path from backend
        } else {
            // Convert image to Base64 for RestDB.io
            const reader = new FileReader();
            reader.readAsDataURL(imageFile);
            await new Promise((resolve) => (reader.onload = resolve));
            imageUrl = reader.result;
        }
    }

    // Create the listing object
    const listing = {
        title,
        description,
        price,
        image: imageUrl, // Store either local file path or Base64 image
        condition,
        username: user.username,
        email: user.email,
    };

    try {
        const endpoint = listingId ? `${API_URL}/${listingId}` : API_URL;
        const method = listingId ? "PUT" : "POST";

        const response = await fetch(endpoint, {
            method,
            headers: USE_LOCAL_API
                ? { "Content-Type": "application/json" }
                : { "Content-Type": "application/json", "x-apikey": API_KEY },
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
    const imageFile = document.getElementById("fileInput").files[0]; // Get the file from the file input

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
            const response = await fetch("http://localhost:5000/listing", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, description, price, image: imageBase64 }) // Send the image as Base64
            });

            if (!response.ok) {
                throw new Error("Failed to add listing.");
            }

            alert("Listing successfully added!");
            window.location.href = "index.html"; // Redirect to homepage after saving
        } catch (error) {
            console.error("Error adding listing:", error);
            alert("Error adding listing.");
        }
    };
});
