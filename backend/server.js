const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Enable CORS with specific configuration
const corsOptions = {
  origin: ['https://whiteboard-portfolio.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Test route to verify server is running
app.get('/api/test', (req, res) => {
  res.status(200).json({ message: 'Backend is running' });
});

// Create a transporter using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Handle POST requests to /api/contact
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'New Message from Portfolio Website',
      text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Error sending message' });
  }
});

// Handle all other routes
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Backend is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
