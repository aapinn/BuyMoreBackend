const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Gunakan environment variables untuk keamanan
// .env
// EMAIL_USER=your_email@example.com
// EMAIL_PASS=your_email_password
// EMAIL_HOST=smtp.example.com
// EMAIL_PORT=587

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, // misal smtp.gmail.com
  port: process.env.EMAIL_PORT || 587,
  secure: false, // true untuk port 465
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate kode verifikasi 6 digit
const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString();

// REGISTER dengan verifikasi
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: 'Email sudah terdaftar' });
    }

    const hashedPass = await bcrypt.hash(password, 10);
    const code = generateCode();

    const newUser = new User({ username, email, password: hashedPass, verified: false, code });
    await newUser.save();

    // Kirim email verifikasi
    const info = await transporter.sendMail({
      from: `"BuyMore" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Kode Verifikasi BuyMore',
      text: `Halo ${username},\n\nKode verifikasi Anda: ${code}\n\nTerima kasih telah mendaftar di BuyMore!`,
    });

    console.log('Email sent: %s', info.messageId);

    return res.status(201).json({ message: 'Register success, silakan verifikasi email' });
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// VERIFY CODE
router.post('/verify', async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: 'Email not found' });
    if (user.verified) return res.status(400).json({ message: 'Email sudah diverifikasi' });
    if (user.code !== code) return res.status(400).json({ message: 'Kode verifikasi salah' });

    user.verified = true;
    user.code = null;
    await user.save();

    res.status(200).json({ message: 'Email berhasil diverifikasi' });
  } catch (err) {
    console.error('VERIFY ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'Email not found' });
    if (!user.verified) return res.status(400).json({ message: 'Email belum diverifikasi' });

    const isPasswordCorrect = await bcrypt.compare(req.body.password, user.password);
    if (!isPasswordCorrect) return res.status(401).json({ message: 'Wrong password' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const { password, code, ...others } = user._doc;

    res.status(200).json({ message: 'Login success', token, user: others });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET ALL USERS
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select('-password -code');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
