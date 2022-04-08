const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const userCtrl = require('../controllers/user');

router.post('/login', userCtrl.login);
router.post('/registration', userCtrl.registration);
router.get('/checkValidUser', auth, userCtrl.checkValidUser);
router.post('/mail', userCtrl.sendMail); 
router.get('/getMail', auth, userCtrl.getMail);
router.patch('/changeMail', auth, userCtrl.changeMail);
router.patch('/changePassword', auth, userCtrl.changePassword);
router.post('/forgotPassword', userCtrl.forgotPassword);
router.get('/resetPassword/:token', userCtrl.resetPasswordGet);
router.post('/resetPassword', userCtrl.resetPassword);
router.patch('/changeNewsletterState', userCtrl.changeNewsletterState);
router.get('/getNewsletterState', userCtrl.getNewsletterState);
router.post('/addNewsletterMail', userCtrl.addNewsletterMail);

router.delete('/deleteUser', userCtrl.delete);

module.exports = router;