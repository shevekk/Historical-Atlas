const mariadb = require('mariadb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../params/config');
const nodemailer = require('nodemailer');
const url = require('url');
const { v4: uuidv4 } = require('uuid');

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

            // Update connexion date
            let sqlDateUpdate = `UPDATE users SET login_date = '${new Date().toISOString().slice(0, 19).replace("T", " ")}' WHERE name = "${req.body.name}"`;

            console.log(sqlDateUpdate);

            db.query(sqlDateUpdate).then((result) => {

              db.end();

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

            }).catch(error => res.status(500).json({ error : 'Impossible de mettre à jour la base de donnée' }));
          }).catch(error => res.status(500).json({ error }));
      }
      else
      {
        return res.status(401).json({ error: 'Utilisateur ou Mot de passe incorrect !' });
      }
    }).catch(error => { res.status(500).json({ error }) });
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
          let sql = `INSERT INTO users (name, password, mail, admin, lang, newsletter, registration_date) VALUES ('${req.body.name}', '${hash}', '${req.body.mail}', 0, 'fr', ${req.body.newsletter}, '${new Date().toISOString().slice(0, 19).replace('T', ' ')}')`;

          db.query(sql).then(result => {

            db.end();

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
          }).catch(error => { db.end(); res.status(500).json({ error: 'Echec de la requête de la création' }) });
        }
      }).catch(error => { db.end(); res.status(500).send({ error: 'Echec de la requête' }) });
    }).catch(error => { res.status(500).json({ error }) });
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
          
        db.end();
        if(result.length > 0)
        {
          resolve(result[0]['id']);
        }
        else
        {
          reject();
        }
      }).catch(error => { db.end(); reject() });
    }).catch(error => { reject() });
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

/*
 * Get mail adress
 * @param {String}                      user                             The user name
 * @return                                                               The email adresse of user
 */
exports.getMail  = (req, res, next) => 
{
  let userName = url.parse(req.url,true).query.user;

  config.connectBDD().then((db) => {
    let sql = `SELECT * FROM users WHERE name = "${userName}"`;

    db.query(sql).then(result => {
        
      db.end();
      if(result.length > 0)
      {
        res.status(200).send({ mail : result[0]['mail']});
      }
      else
      {
        res.status(500).send({ });
      }

    }).catch(error => { db.end(); res.status(500).send({ }); });
  }).catch(error => { res.status(500).send({ }); });
}

/*
 * Set mail adress
 * @param {String}                      req.body.mail                    The new mail adress
 * @param {String}                      req.body.name                    The user name
 * @return                                                               empty
 */
exports.changeMail = (req, res, next) => 
{
  config.connectBDD().then((db) => {

    let sql = `UPDATE users SET mail = "${req.body.mail}" WHERE name = "${req.body.user}"`;

    db.query(sql).then(result => {
      db.end();

      res.status(200).send({});

    }).catch(error => { db.end(); res.status(500).send({ }); });
  }).catch(error => { res.status(500).send({ }); });
}

/*
 * Change the password
 * @param {String}                      req.body.password                    The new password
 * @return                                                               empty
 */
exports.changePassword = (req, res, next) => 
{
  bcrypt.hash(req.body.password, 10).then(hash => {

    config.connectBDD().then((db) => {

      let sql = `UPDATE users SET password = "${hash}" WHERE name = "${req.body.user}"`;

      db.query(sql).then(result => {
        db.end();

        res.status(200).send({});

      }).catch(error => { db.end(); res.status(500).send({ }); });
    }).catch(error => { res.status(500).send({ }); });
  }).catch(error => { res.status(500).json({ error }) });
}

/*
 * Forgot password : generate key and send mail
 * @param {String}                      req.body.userName                    The target user name
 * @return                                                                   Empty
 */
exports.forgotPassword = (req, res, next) => 
{
  config.connectBDD().then((db) => {

    let generated_key = uuidv4();
    let sqlInsert = `INSERT INTO password_reset (user_name, generated_key, date) VALUES ('${req.body.userName}', '${generated_key}', '${new Date().toISOString().slice(0, 19).replace('T', ' ')}')`;

    db.query(sqlInsert).then(result => {

      let sqlGetMail = `SELECT * FROM users WHERE name = "${req.body.userName}"`;

      db.query(sqlGetMail).then(resultGetMail => {

        let targetMail = resultGetMail[0]['mail'];

        db.end();

        config.getMailInfos().then((mailInfos) => {

          let mailContent = `Bonjour \n\nPour réinitialiser votre mot de passe cliquez sur le lien : http://www.histoatlas.org/pages/resetPassword.html?token=${generated_key} \n\nVotre clé sera valide une journée`

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
            from: "histoatlas3@gmail.com", 
            to: targetMail, 
            subject: "[HistoAtlas] Changement de mot de passe", 
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


        res.status(200).send({});
      });

    }).catch(error => { db.end(); res.status(500).send({ }); });

  }).catch(error => { res.status(500).json({ error }) });
}

/*
 * Reset the password, check valid key
 * @param {String}                      req.params.token                 The token
 * @return                                                               Empty
 */
exports.resetPasswordGet = (req, res, next) => 
{
  let token = req.params.token;

  config.connectBDD().then((db) => {

    this.resetPasswordCheckVality(db, token)
    .then(() => 
    {
      db.end(); 

      res.status(200).send({});
    })
    .catch((error) => { db.end(); res.status(500).send({ error : error }) });

  }).catch(error => { res.status(500).json({ error }) });
}

/*
 * Reset the password, check valid key and change password
 * @param {String}                      req.body.password              The password
 * @param {String}                      req.body.token                 The token
 * @return                                                             Empty
 */
exports.resetPassword = (req, res, next) => 
{
  let token = req.body.token;

  config.connectBDD().then((db) => {

    this.resetPasswordCheckVality(db, token)
    .then((userName) => 
    {
      bcrypt.hash(req.body.password, 10).then(hash => {

      let sql = `UPDATE users SET password = "${hash}" WHERE name = "${userName}"`;

      db.query(sql).then(result => {

        db.end();

        res.status(200).send({});

        }).catch(error => { db.end(); res.status(500).send({ error : "Echec de la requête" }); });
      }).catch(error => { db.end(); res.status(500).json({ error }) });
    })
    .catch((error) => { db.end(); res.status(500).send({ error : error }) });

  }).catch(error => { res.status(500).json({ error }) });
}

/*
 * Reset the password, check valid key and valid date
 * @param {MariaDB Connector}           db                    The db connector
 * @param {String}                      token                 The token
 * @return                                                    Empty
 */
exports.resetPasswordCheckVality = (db, token) => 
{
  return new Promise(function(resolve, reject) 
  {
    let sql = `SELECT * FROM password_reset WHERE generated_key = "${token}"`;

    db.query(sql).then(result => {

      if(result.length > 0)
      {
        let actualDate = new Date();
        let dbDate = new Date(result[0]['date']);

        let diffTime = Math.abs(dbDate - actualDate);
        let diffDays = diffTime / (1000 * 60 * 60 * 24); 

        if(diffDays > 1)
        {
          reject("Votre clé à expirée");
        }
        else
        {
          resolve(result[0]['user_name']);
        }
      }
      else
      {
        reject("Votre clé n'est pas valide");
      }
    }).catch(error => { reject("Votre clé n'est pas valide"); });
  });
}

/*
 * Delete the user (but not delete maps)
 * @param {String}           req.body.user                    The user
 * @return                                                    Empty
 */
exports.delete = (req, res, next) => 
{
    config.connectBDD().then((db) => {

    let sqlDelete = `DELETE FROM users WHERE name = '${req.body.user}'`;

    db.query(sqlDelete).then(result => {

      res.status(200).send({});

    }).catch(error => { db.end(); res.status(500).send({ }); });

  }).catch(error => { res.status(500).send({ }); });  
}

/*
 * Get newsletter state
 * @param {String}                      user                             The user name
 * @return                                                               The email adresse of user
 */
exports.getNewsletterState  = (req, res, next) => 
{
  let userName = url.parse(req.url,true).query.user;

  config.connectBDD().then((db) => {
    let sql = `SELECT * FROM users WHERE name = "${userName}"`;

    db.query(sql).then(result => {
        
      db.end();
      if(result.length > 0)
      {
        res.status(200).send({ newsletter : result[0]['newsletter']});
      }
      else
      {
        res.status(500).send({ });
      }

    }).catch(error => { db.end(); res.status(500).send({ }); });
  }).catch(error => { res.status(500).send({ }); });
}

/*
 * Set newsletter state
 * @param {String}                      req.body.newsletter              The new newsletter state
 * @param {String}                      req.body.name                    The user name
 * @return                                                               empty
 */
exports.changeNewsletterState = (req, res, next) => 
{
  config.connectBDD().then((db) => {

    let sql = `UPDATE users SET newsletter = ${req.body.newsletter} WHERE name = "${req.body.user}"`;

    db.query(sql).then(result => {
      db.end();

      res.status(200).send({});

    }).catch(error => { db.end(); res.status(500).send({ error : "Echec de la requête" }); });
  }).catch(error => { res.status(500).send({ error : "Echec de la connexion" }); });
}