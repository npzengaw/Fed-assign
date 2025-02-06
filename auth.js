// RESTdb API Configuration
const API_URL = "https://mokesell-ec88.restdb.io/rest/userss"; // Correct RestDB collection URL
const API_KEY = "679628de0acc0620a20d364d"; // Your RestDB API Key

// Function to hash a password using the Web Crypto API
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data); // Generate hash
    const hashArray = Array.from(new Uint8Array(hashBuffer)); // Convert to byte array
    return hashArray.map(byte => byte.toString(16).padStart(2, "0")).join(""); // Convert to hex string
}

// Function to register a new user
async function registerUser(event) {
    event.preventDefault(); // Stop form submission

    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        // Hash the password
        const hashedPassword = await hashPassword(password);
        console.log("Hashed Password (SHA-256):", hashedPassword);

        const userData = {
            username: username,
            email: email,
            password: hashedPassword, // Store the hashed password
        };

        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": API_KEY,
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Registration failed: ${response.statusText}\n${errorText}`);
        }

        const data = await response.json();
        console.log("User Registered Successfully:", data);

        // Clear form fields
        usernameInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";

        alert("Account successfully created. Redirecting to login...");
        window.location.href = "login.html"; // Redirect to login page
    } catch (error) {
        console.error("Registration Error:", error.message);
        alert("Registration Error: " + error.message);
    }
}

// Function to log in a user
async function loginUser(event) {
    event.preventDefault();

    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        alert("Please fill in all fields.");
        return;
    }

    try {
        // Fetch user data from RestDB
        const response = await fetch(`${API_URL}?q={"email":"${email}"}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "x-apikey": API_KEY,
            },
        });

        if (!response.ok) {
            throw new Error(`Login failed: ${response.statusText}`);
        }

        const users = await response.json();
        if (users.length === 0) {
            alert("No user found with this email.");
            return;
        }

        const user = users[0];
        const hashedPassword = await hashPassword(password);

        if (hashedPassword !== user.password) {
            alert("Invalid password. Please try again.");
            return;
        }

        // Generate JWT Token (Mocking authentication)
        const token = btoa(JSON.stringify({ _id: user._id, username: user.username, email: user.email }));

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify({ username: user.username, email: user.email }));

        alert("Login successful. Redirecting to homepage...");
        window.location.href = "index.html";
    } catch (error) {
        console.error("Login Error:", error.message);
        alert("Login Error: " + error.message);
    }
}

// Function to dynamically update the navigation bar
function updateNavBar() {
    const user = JSON.parse(localStorage.getItem("user"));
    const navBar = document.querySelector("nav ul");

    // Clear existing nav items
    navBar.innerHTML = "";

    // Always show Home
    navBar.innerHTML += `<li><a href="index.html">Home</a></li>`;

    if (user) {
        // If the user is logged in
        navBar.innerHTML += `
            <li><a href="profile.html">Profile</a></li>
            <li><a href="search.html">Search</a></li>
            <li><a href="chat.html">Chat</a></li>
            <li><a href="sell.html" id="sell-button" class="sell-nav-button">Sell</a></li>
            <li><a href="#" id="logout-button">Logout</a></li>
        `;
    } else {
        // If the user is not logged in
        navBar.innerHTML += `
            <li><a href="login.html">Login</a></li>
            <li><a href="register.html">Register</a></li>
        `;
    }

    // Add logout functionality if the user is logged in
    if (user) {
        const logoutButton = document.getElementById("logout-button");
        logoutButton.addEventListener("click", logoutUser);
    }
}

// Function to log out the user
function logoutUser() {
    localStorage.removeItem("user");
    window.location.reload();
}

// Call the updateNavBar function on page load
document.addEventListener("DOMContentLoaded", updateNavBar);

// Attach event listeners to forms
document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", registerUser);
    }

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", loginUser);
    }
});
