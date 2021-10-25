const jwt = require('jsonwebtoken');
const config = require('../params/config');

module.exports = (req, res, next) => {

  config.getTokenKey().then((tokenKey) => {
    try {
      //const token = req.headers.authorization.split(' ')[1];
      const token = req.headers.authorization;
      const decodedToken = jwt.verify(token, tokenKey);
      const userId = decodedToken.userId;
      //console.log("userId : " + userId);
      
      if (req.body.user && req.body.user !== userId) 
      {
        res.status(401).json({ error: 'Utilisateur non connecté' });
      } else 
      {
        next();
      }
      
    } catch {
      res.status(401).json({ error: 'Utilisateur non connecté' });
    }
  }).catch(error => res.status(500).json({ error : "Echec de lecture de la configuration du server" }));
};