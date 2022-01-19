const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const mapCtrl = require('../controllers/map');

router.post('/checkIfFileExist', auth, mapCtrl.checkIfFileExist);
router.post('/save', auth, mapCtrl.save);

router.get('/getVisibleMapsOfUser/:user', mapCtrl.getVisibleMapsOfUser);
router.get('/getVisibleMaps/:user', mapCtrl.getVisibleMaps);
router.get('/get/:id', auth, mapCtrl.getMap);
router.get('/getGuest/:id', mapCtrl.getMapGuest);

router.post('/changePublicState', auth, mapCtrl.changePublicState);
router.post('/changeEditableState', auth, mapCtrl.changeEditableState);

router.post('/createNewMap', mapCtrl.createNewMap);

router.post('/rename', mapCtrl.rename);

router.delete('', auth, mapCtrl.delete);

module.exports = router;