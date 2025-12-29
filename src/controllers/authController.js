const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Cek email sudah digunakan
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Cek username sudah digunakan
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered successfully",
      user: { username: newUser.username, email: newUser.email }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const userExist = await User.findOne({ username });
    if (!userExist) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, userExist.password);
    if (!match) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: userExist._id, username: userExist.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login success",
      token,
      user: { username: userExist.username, email: userExist.email }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
