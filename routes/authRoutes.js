const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const db = require("../db"); // Your database connection
require("dotenv").config();
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

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your app password
  },
});

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  console.log("Received request for:", email); // Debugging

  // Check if user exists
  try{
      const [userRows] = await db.query('SELECT * FROM users WHERE Email = ?', [email]);

      if (userRows.length === 0) {
        return res.status(404).json({ message: 'No account found with that email address.' });
      }

      const user = userRows[0];

      const resetToken = jwt.sign({ userId: user.User_ID }, process.env.JWT_SECRET, { expiresIn: '30m' });

      const resetLink = `http://localhost:3000/WDM_Team8/reset-password/${resetToken}`;

      console.log("Generated reset link:", resetLink);

      // Send email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset Link',
        html: `
          <p>Hello ${user.First_Name},</p> <br/> <p>You requested a password reset. Click below to reset it. This link is valid for 1 minute.</p> <br/> <a href="${resetLink}">Reset Password</a> <br/><br/> <p>If you didn't request this, please ignore this email.</p> `,
      };
      
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              console.error("Error sending email:", error);
              return res.status(500).json({ message: "Email not sent" });
          }

          console.log("Email sent successfully:", info.response);
          res.json({ message: "Reset link sent to email" });
      });
  
  console.log('Outside query')
}catch (err) {
  console.error("Forgot password error:", err);
  res.status(500).json({ message: 'Internal Server Error' });
}
});


// Reset Password Route
router.post("/reset-password", async (req, res) => {
  const { resetToken, password } = req.body;
  console.log("Received request for:", resetToken, password);
  try {
    // Verify token
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET); // Wait for token verification
    console.log('DECODED: ',decoded)
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update password in the database
    const [results] = await db.query(
      "UPDATE users SET Password = ? WHERE User_ID = ?",
      [hashedPassword, decoded.userId]
    );

    // Check if the update was successful
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return success message
    res.json({ message: "Password successfully reset" });
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      // Token verification failed
      return res.status(400).json({ message: "Invalid or expired token" });
    } else {
      // Other errors (e.g., database, bcrypt)
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  }
});


// Add this route to your authRoutes.js to verify the token
router.get("/verify-reset-token/:resetToken", (req, res) => {
  const { resetToken } = req.params;

  // Verify token validity (checking if it's expired or invalid)
  jwt.verify(resetToken, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return res.status(400).json({ message: "Invalid or expired token" });

      // If token is valid, send a success response
      res.json({ message: "Token is valid" });
  });
});


module.exports = router;