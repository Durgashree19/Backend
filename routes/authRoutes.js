const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { body, validationResult } = require("express-validator");

const router = express.Router();

// User Signup
router.post(
  "/signup",
  [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, phone, address, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hash password

    try {
      // Check if email already exists
      const [existingUser] = await db.query("SELECT * FROM users WHERE Email = ?", [email]);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Email already in use" });
      }

      // Insert user into DB
      const result = await db.query(
        "INSERT INTO users (First_Name, Last_Name, Email, Password, Phone, Address, Role, Date_Joined) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
        [firstName, lastName, email, hashedPassword, phone || null, address || null, role || "User"]
      );

      // Generate JWT Token
      const token = jwt.sign({ userId: result[0].insertId, email, role: role || "User" }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });

      res.status(201).json({ message: "User registered successfully", token });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// User Login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    // Validate request input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      const [users] = await db.query("SELECT * FROM users WHERE Email = ?", [email]);
      if (users.length === 0) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const user = users[0];

      // Verify password
      const isMatch = await bcrypt.compare(password, user.Password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT Token
      const token = jwt.sign(
        { userId: user.User_ID, email: user.Email, role: user.Role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ message: "Login successful", token, role: user.Role });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);


module.exports = router;
