const USE_LOCAL_API = true; // Change to `false` when switching to RESTdb.io

const API_URL = USE_LOCAL_API
    ? "http://localhost:5000/listing"
    : "https://mokesell-ec88.restdb.io/rest/listing";

const API_KEY = "679628de0acc0620a20d364d"; // Only used for RESTdb.io
