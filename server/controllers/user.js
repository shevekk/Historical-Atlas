const mariadb = require('mariadb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../params/config');
const nodemailer = require('nodemailer');

/*
 * Log an user, check if password and user are correct
 * @param {String}                      req.body.name                       The user name
 * @param {String}                      req.body.password                   The password
 * @return                                                                  User token
 */
exports.login = (req, res, next) => 
{
  config.connectBDD().then((db) => {

    let sql = `SELECT * FROM users WHERE name = "${req.body.name}"`;

    db.query(sql).then((result) => {
      //if (err) { console.log(err); res.status(500).send({ error: err }) };

      if(result.length > 0)
      {
        let userPassword = result[0]['password'];
        let userName = result[0]['name'];

        bcrypt.compare(req.body.password, userPassword)
          .then(valid => {
            if (!valid) {
              return res.status(401).json({ error: 'Utilisateur ou Mot de passe incorrect !' });
            }
            config.getTokenKey().then((tokenKey) => {
              res.status(201).json({
                userId: userName,
                token: jwt.sign(
                  { userId: userName },
                  tokenKey,
                  { expiresIn: '24h' }
                )
              });
            }).catch(error => res.status(500).json({ error : "Echec de lecture de la configuration du server" }));
          }).catch(error => res.status(500).json({ error }));
      }
      else
      {
        return res.status(401).json({ error: 'Utilisateur ou Mot de passe incorrect !' });
      }
    }).catch(error => res.status(500).json({ error }));
  });
}

/*
 * Register a new user in database
 * @param {String}                      req.body.name                       The user name
 * @param {String}                      req.body.password                   The password
 * @param {String}                      req.body.mail                       The mail adress
 * @param {Boolean}                     req.body.newsletter                 True if register to newlettre
 * @return                                                                  User token
 */
exports.registration = (req, res, next) => 
{
  config.connectBDD().then((db) => {

    bcrypt.hash(req.body.password, 10).then(hash => {

      let sql = `SELECT * FROM users WHERE name = "${req.body.name}"`;

      db.query(sql).then(result => {

        if(result.length > 0)
        {
          return res.status(500).json({ error: "Le nom d'utiliseur choisie est déja utilisé" })
        }
        else
        {
          let sql = `INSERT INTO users (name, password, mail, admin, lang, newsletter) VALUES ('${req.body.name}', '${hash}', '${req.body.mail}', 0, 'fr', ${req.body.newsletter})`;

          db.query(sql).then(result => {

            config.getTokenKey().then((tokenKey) => {
              res.status(200).json({
                userId: req.body.name,
                token: jwt.sign(
                  { userId: req.body.name },
                  tokenKey,
                  { expiresIn: '24h' }
                )
              });
            }).catch(error => res.status(500).json({ error : "Echec de lecture de la configuration du server" }));
          }).catch(error => res.status(500).json({ error: 'Echec de la requête de la création' }));
        }
      }).catch(error => res.status(500).send({ error: 'Echec de la requête' }));
    }).catch(error => res.status(500).json({ error }));
  });
}

/*
 * Get user id from a user name
 * @param {String}                      name                       The user name
 * @return                                                         User ID
 */
exports.getUserIdFromName = (name) => 
{
  return new Promise(function(resolve, reject) 
  {
    config.connectBDD().then((db) => {
      let sql = `SELECT * FROM users WHERE name = "${name}"`;

      db.query(sql).then(result => {
          
          if(result.length > 0)
          {
            resolve(result[0]['id']);
          }
          else
          {
            reject();
          }
      }).catch(error => reject());
    }).catch(error => reject());
  });
}

/*
 * Check if user is valid (if security is OK return 200)
 */
exports.checkValidUser = (req, res, next) => 
{
  res.status(200).json({});
}

/*
 * Send mail
 * @param {String}                      req.body.name                    The user name of sender
 * @param {String}                      req.body.message                 The message content
 * @param {String}                      req.body.mail                    Mail of the sender
 * @param {Boolean}                     req.body.title                   Mail title
 * @return                                                               empty
 */
exports.sendMail = (req, res, next) => 
{
  config.getMailInfos().then((mailInfos) => {

    let mailContent = `mail : ${req.body.mail} \n name : ${req.body.name} \n \n ${req.body.message}`

    var transporter = nodemailer.createTransport({
      host: mailInfos['host'],
      port: mailInfos['port'],  //25,
      auth: {
        user: mailInfos['auth_user'],
        pass: mailInfos['auth_pass'],
      },
      tls: {
        rejectUnauthorized: false
      },
    });
    var mailOptions = {
      from: req.body.mail, 
      to: mailInfos['to'], 
      subject: "[HistoAtlas] " + req.body.title, 
      text: mailContent
    };

    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        res.status(500).send({ });
      } else {
        //console.log('Email sent: ' + info.response);
        res.status(200).send({ });
      }
    });
  }).catch(error => res.status(500).send({ }));
}