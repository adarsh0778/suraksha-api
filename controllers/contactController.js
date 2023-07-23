const Contact = require('../models/contact');

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

module.exports = {
  createContact,
  getAllContacts,
  updateContact,
  deleteContact,
};
