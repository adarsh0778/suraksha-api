const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
const contactRoutes = require('./routes/contactRoutes');

// Create the Express app
const app = express();
app.use(express.json());

// Connect to MongoDB
const DB ="mongodb+srv://pankajkush17:mynameispankaj%40@cluster0.2srsh.mongodb.net/Suraksha?retryWrites=true&w=majority";

mongoose.connect(DB, {
    useNewUrlParser : true,
}).then(() => {
    console.log("connection Successful")
}).catch((err) =>{
    console.log(err)
})

// Use routes
app.use('/users', userRoutes);
app.use('/contacts', contactRoutes);

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
























/*
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Create the Express app
const app = express();
app.use(express.json());

// Connect to MongoDB
const DB ="mongodb+srv://pankajkush17:mynameispankaj%40@cluster0.2srsh.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
mongoose.connect(DB, {
    useNewUrlParser : true,
}).then(() => {
    console.log("connection Successful")
}).catch((err) =>{
    console.log(err)
})


// Define the user schema
const userSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Hash the password before saving to the database
userSchema.pre('save', async function (next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
    next();
  } catch (err) {
    return next(err);
  }
});

// Create the user model
const User = mongoose.model('User', userSchema);

// Define the contact schema
const contactSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  relation: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
});

// Create the contact model
const Contact = mongoose.model('Contact', contactSchema);

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

    // Create a new User object
    user = new User({ phoneNumber, email, name, password });

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
    const token = jwt.sign({ userId: user._id }, 'your_secret_key_here', { expiresIn: '1h' });

    return res.status(200).json({ message: 'User logged in successfully', token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to log in user' });
  }
}

// Middleware to verify JWT token and extract userId
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, 'your_secret_key_here', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Failed to authenticate token' });
    }
    req.user = { userId: decoded.userId };
    next();
  });
}

// Create a new contact record
async function createContact(req, res) {
  const { name, relation, contact } = req.body;
  const userId = req.user.userId;

  // Validate input fields
  if (!name || !relation || !contact) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Limit each user to only 5 contacts
  const userContactCount = await Contact.countDocuments({ userId });
  if (userContactCount >= 5) {
    return res.status(403).json({ error: 'Maximum contacts limit reached' });
  }

  // Create a new Contact object
  const newContact = new Contact({
    userId,
    name,
    relation,
    contact,
  });

  try {
    // Save the contact to the database
    await newContact.save();
    return res.status(200).json({ message: 'Contact saved successfully', contact: newContact });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to save contact' });
  }
}

// Get all contact records for the logged-in user
async function getAllContacts(req, res) {
  const userId = req.user.userId;

  try {
    // Retrieve all contact records for the logged-in user
    const contacts = await Contact.find({ userId });
    return res.status(200).json(contacts);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to retrieve contacts' });
  }
}

// Update a contact record
async function updateContact(req, res) {
  const contactId = req.params.id;
  const { name, relation, contact } = req.body;
  const userId = req.user.userId;

  // Validate input fields
  if (!name || !relation || !contact) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Update the contact record for the logged-in user
    const updatedContact = await Contact.findOneAndUpdate(
      { _id: contactId, userId },
      { name, relation, contact },
      { new: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    return res.status(200).json(updatedContact);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to update contact' });
  }
}

// Delete a contact record
async function deleteContact(req, res) {
  const contactId = req.params.id;
  const userId = req.user.userId;

  try {
    // Delete the contact record for the logged-in user
    const deletedContact = await Contact.findOneAndDelete({ _id: contactId, userId });
    if (!deletedContact) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    return res.status(200).json({ message: 'Contact deleted successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to delete contact' });
  }
}

// Define API endpoints
app.post('/signup', signUpUser);
app.post('/login', logInUser);

// Protected routes - require authentication
app.use(verifyToken);
app.post('/contacts', createContact);
app.get('/contacts', getAllContacts);
app.put('/contacts/:id', updateContact);
app.delete('/contacts/:id', deleteContact);

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});


*/