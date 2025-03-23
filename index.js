const express = require("express");
const cors = require("cors");
const db = require("./db"); // Import database connection
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Sample API to fetch data
app.get("/users", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
