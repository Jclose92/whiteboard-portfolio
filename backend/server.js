const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Validate environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('Missing required environment variables');
  console.error('EMAIL_USER:', process.env.EMAIL_USER ? 'SET' : 'MISSING');
  console.error('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'MISSING');
  process.exit(1);
}

const app = express();

// Enable CORS with specific configuration
const corsOptions = {
  origin: ['https://whiteboard-portfolio.vercel.app', 'http://localhost:3000', 'https://johnclose.ie'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
  credentials: true
};

app.use(cors(corsOptions));

// Parse JSON bodies
app.use(express.json());

// Test route to verify server is running
app.get('/api/test', (req, res) => {
  res.status(200).json({ 
    message: 'Backend is running',
    emailConfig: {
      user: process.env.EMAIL_USER ? 'SET' : 'MISSING',
      pass: process.env.EMAIL_PASS ? 'SET' : 'MISSING'
    }
  });
});

// Create a transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Handle POST requests to /api/contact
app.post('/api/contact', async (req, res) => {
  try {
    // Get the request body
    const body = req.body;
    
    // Validate the request body
    if (!body || typeof body !== 'object') {
      return res.status(400).json({ success: false, message: 'Invalid request body' });
    }

    const { name, email, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
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
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Error sending message',
      error: {
        type: error.code || 'unknown',
        message: error.message || 'Unknown error'
      }
    });
  }
});

// Handle all other routes
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Backend is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Email configuration:', {
    user: process.env.EMAIL_USER ? 'SET' : 'MISSING',
    pass: process.env.EMAIL_PASS ? 'SET' : 'MISSING'
  });
});
