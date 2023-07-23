const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Sign up new user
async function signUpUser(req, res) {
  const { phoneNumber, email, name, password } = req.body;

  // Validate input fields
  if (!phoneNumber || !email || !name || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Check if the user already exists
    let user = await User.findOne({ $or: [{ phoneNumber }, { email }] });
    if (user) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash the password before saving to the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new User object
    user = new User({ phoneNumber, email, name, password: hashedPassword });

    // Save the user to the database
    await user.save();

    return res.status(200).json({ message: 'User signed up successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to sign up user' });
  }
}

// Log in user and generate a JWT token
async function logInUser(req, res) {
  const { email, password } = req.body;

  // Validate input fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compare the provided password with the stored hash
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate a JWT token for the user
    const token = jwt.sign({ userId: user._id }, 'our little secret', { expiresIn: '1h' });

    return res.status(200).json({ message: 'User logged in successfully', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to log in user' });
  }
}

module.exports = {
  signUpUser,
  logInUser,
};
