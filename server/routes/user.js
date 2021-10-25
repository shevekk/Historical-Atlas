const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const userCtrl = require('../controllers/user');

router.post('/login', userCtrl.login);
router.post('/registration', userCtrl.registration);
router.get('/checkValidUser', auth, userCtrl.checkValidUser);
router.post('/mail', userCtrl.sendMail); 

module.exports = router;