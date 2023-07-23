const mongoose = require('mongoose');

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

module.exports = mongoose.model('Contact', contactSchema);
