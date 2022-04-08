const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const iconMarkerCtrl = require('../controllers/iconMarker');

router.post('/add', auth, iconMarkerCtrl.add);

router.get('/get/:user', iconMarkerCtrl.get);
router.get('/getImage/:id', iconMarkerCtrl.getImage);

module.exports = router;