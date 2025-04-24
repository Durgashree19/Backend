const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const db = require("../db"); // Your database connection
const authenticateToken = require("../middleware/authMiddleware");
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
        "INSERT INTO users (First_Name, Last_Name, Email, Password, Phone, Address, Role, Notification_Preference, Subscriber, Date_Joined) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, Now())",
        [firstName, lastName, email, hashedPassword, phone || null, address || null, role || "Customer", JSON.stringify({
          email: false,
          sms: false,
        }), false]
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


router.get("/account-settings", authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;
    console.log('USER: ',email)
    const [user] = await db.query("SELECT First_Name, Last_Name, Email, Phone, Notification_Preference FROM users WHERE Email = ?", [email]);

    if (user.length === 0) return res.status(404).json({ message: "User not found" });
    console.log('USER: ',user)
    const { First_Name, Last_Name, Email, Phone, Notification_Preference } = user[0];
    res.json({
      fullName: `${First_Name} ${Last_Name}`,
      email: Email,
      phone: Phone,
      notifications: JSON.parse(Notification_Preference || '{"email": true, "sms": false}')
    });
  } catch (error) {
    res.status(500).json({ message: "Error retrieving account details", error });
  }
});

router.post("/account-settings", authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;
    const {
      fullName,
      phone,
      password,
      newPassword,
      confirmPassword,
      notifications
    } = req.body;

    const [firstName, ...rest] = fullName.split(" ");
    const lastName = rest.join(" ");

    // Update name, phone, and notifications
    await db.query(
        "UPDATE users SET First_Name = ?, Last_Name = ?, Phone = ?, Notification_Preference = ? WHERE Email = ?",
        [firstName, lastName, phone, JSON.stringify(notifications), email]
      );

    // Handle password update
    if (password && newPassword && confirmPassword) {
      const [user] = await db.query("SELECT Password FROM users WHERE Email = ?", [email]);
      const match = await bcrypt.compare(password, user[0].Password);
      if (!match) return res.status(400).json({ message: "Current password is incorrect" });

      if (newPassword !== confirmPassword) return res.status(400).json({ message: "Passwords do not match" });
      if (password == newPassword && password == confirmPassword) return res.status(400).json({ message: "New Password cannot be the same as old password" });

      const hashed = await bcrypt.hash(newPassword, 10);
      await db.query("UPDATE users SET Password = ? WHERE Email = ?", [hashed, email]);
    }

    res.json({ message: "Account updated successfully" });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: "Error updating account", error });
  }
});

// Route to handle newsletter subscription
router.post("/subscribe", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Step 1: Send the confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thanks for subscribing to our Newsletter!",
      html: `<h2>Welcome to Our Newsletter! 🎉</h2><br/><p>Thank you for subscribing. We'll keep you updated with exclusive offers and updates.</p><br/><p>If you ever wish to unsubscribe, just reply with "Unsubscribe".</p><br/><p>Warm regards,<br/>The Team</p>`,
    });

    // Step 2: Update the 'Subscriber' column to true in the users table
    const [results] = await db.query(
      "UPDATE users SET Subscriber = true WHERE email = ?",
      [email]  // The user’s email passed from the request body
    );

    // Check if the update was successful
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Subscription successful and email sent!" });
  } catch (error) {
    console.error("Email send or DB update error:", error);
    res.status(500).json({ message: "Failed to send email or update subscription. Try again later." });
  }
});

//Contact us mail
router.post("/send-enquiry", async (req, res) => {
  const { name, email, phone, message } = req.body;

  try {
    // Email content
    const mailOptions = {
      from: email,
      to: "justbuywdm@gmail.com",
      subject: "New Contact Us Enquiry",
      html: `
        <h3>New Enquiry from Contact Us Form</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Enquiry sent successfully!" });
  } catch (error) {
    console.error("Error sending enquiry:", error);
    res.status(500).json({ message: "Failed to send enquiry. Please try again later." });
  }
});

//API that Admin uses to sends notifications about offers to subscribers
router.post("/offer-notifications", async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ success: false, error: "Message is required" });
  }

  try {
    // Get subscribers from users table
    const [subscribers] = await db.query("SELECT Email FROM users WHERE Subscriber = TRUE");
    console.log('SUBS: ',subscribers)

    if (subscribers.length === 0) {
      return res.status(200).json({ success: true, message: "No subscribers to notify." });
    }

    // Send email to each subscriber
    for (const subscriber of subscribers) {
      console.log('SUBS EMAIL: ',subscriber.Email)
      console.log('message: ',message)
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: subscriber.Email,
        subject: "JustBuy Notification",
        text: message,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Sent email to ${subscriber.Email}`);
      } catch (sendErr) {
        console.error(`❌ Failed to send email to ${subscriber.Email}:`, sendErr);
      }
      
    }

    res.status(200).json({ success: true, message: "Notifications sent to all subscribers." });
  } catch (err) {
    console.error("Error sending notification emails:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

module.exports = router;