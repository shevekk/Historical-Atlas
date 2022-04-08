const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const userRoutes = require('./routes/user');
const mapRoutes = require('./routes/map');
const iconMarkerRoutes = require('./routes/iconMarker');

const path = require('path');

const app = express();

/*
app.use(cors({
    origin: ['http://141.94.244.143', 'http://localhost', 'http://www.histoatlas.org'],
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));
*/

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.use(bodyParser.json({ limit: '100mb' }))

//app.use(express.limit('2mb'));
app.use(express.json()); 

app.options('*', cors()) 

/* app.use('/images', express.static(path.join(__dirname, 'images'))); */

app.use('/api/user', userRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/iconMarker', iconMarkerRoutes);


module.exports = app;