const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const twilio = require('twilio');
require('dotenv').config();

const Volunteer = require('./server/models/Volunteer');
const User = require('./server/models/User');
const SOSAlert = require('./server/models/SOSAlert');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve frontend files

// MongoDB connection using environment variable
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Twilio Setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const whatsappFrom = 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER;

// Volunteer Signup
app.post('/api/volunteer/signup', async (req, res) => {
  const { email, password, name, phoneNumber, location } = req.body;
  const existing = await Volunteer.findOne({ email });
  if (existing) return res.status(400).json({ message: 'Volunteer already exists' });

  const newVolunteer = new Volunteer({ email, password, name, phoneNumber, location });
  await newVolunteer.save();
  res.json({ message: 'Volunteer signup successful' });
});

// Volunteer Login
app.post('/api/volunteer/login', async (req, res) => {
  const { email, password } = req.body;
  const volunteer = await Volunteer.findOne({ email });
  if (!volunteer || volunteer.password !== password)
    return res.status(401).json({ message: 'Invalid credentials' });

  res.json({ message: 'Login successful' });
});

// User Signup
app.post('/api/user/signup', async (req, res) => {
  const { email, password, name, address, phoneNumber } = req.body;
  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ message: 'User already exists' });

  const newUser = new User({ email, password, name, address, phoneNumber });
  await newUser.save();
  res.json({ message: 'User signup successful' });
});

// User Login
app.post('/api/user/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ message: 'Login successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve signup page
app.get('/signup', (req, res) => {
  res.sendFile(__dirname + '/public/signup.html');
});

// SOS Alert Route with Debug Logging
app.post('/send-sos', async (req, res) => {
  const { name, contact, location, lat, lon } = req.body;
  const message = `🚨 *WomenSafety SOS Alert!*\n👤 Name: ${name}\n📞 Contact: ${contact}\n🏠 Address: ${location}\n📍 Location: https://maps.google.com/?q=${lat},${lon}`;

  try {
    console.log("📩 Sending SOS to:", process.env.TARGET_USER_NUMBER);
    console.log("📦 Message:", message);

    // Save to database
    await SOSAlert.create({ name, contact, location, lat, lon, time: new Date() });

    // Send WhatsApp via Twilio
    const result = await client.messages.create({
      from: whatsappFrom,
      to: 'whatsapp:' + process.env.TARGET_USER_NUMBER,
      body: message
    });

    console.log("✅ Twilio message sent:", result.sid);
    res.json({ success: true, message: 'SOS sent!' });
  } catch (err) {
    console.error("❌ Error sending SOS:", err.message);
    res.status(500).json({ success: false, message: 'Failed to send SOS.' });
  }
});

// Stats: Total users
app.get('/api/stats/users/count', async (req, res) => {
  try {
    const count = await User.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user count' });
  }
});

// Stats: Total volunteers
app.get('/api/stats/volunteers/count', async (req, res) => {
  try {
    const count = await Volunteer.countDocuments();
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch volunteer count' });
  }
});

// Alerts: Recent 10
app.get('/api/alerts/recent', async (req, res) => {
  try {
    const alerts = await SOSAlert.find().sort({ time: -1 }).limit(10);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch alerts' });
  }
});

// ✅ IMPORTANT: Use dynamic port and 0.0.0.0
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
