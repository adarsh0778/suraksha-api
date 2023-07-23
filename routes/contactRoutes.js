const express = require('express');
const contactController = require('../controllers/contactController');
const verifyToken = require('../middlewares/verifyToken');

const router = express.Router();

router.use(verifyToken);
router.post('/', contactController.createContact);
router.get('/', contactController.getAllContacts);
router.put('/:id', contactController.updateContact);
router.delete('/:id', contactController.deleteContact);

module.exports = router;
