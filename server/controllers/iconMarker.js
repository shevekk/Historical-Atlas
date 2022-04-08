const mariadb = require('mariadb');
const config = require('../params/config');
const user = require('./user');
const fs = require('fs');
const url = require('url');
const log = require("./log");

/*
 * Save a .svg icon in server
 * @param {String}                      req.body.user                       The user name
 * @param {String}                      req.body.fileName                   The imported file name 
 * @param {String}                      req.body.fileContent                Content of the file to save
 * @return                                                                  Empty
 */
exports.add = (req, res, next) => 
{
  let date = new Date();
  let fileName = `${req.body.fileName.split(".")[0]}_${date.getFullYear()}${date.getMonth()}${date.getDate()}_${date.getHours()}${date.getMinutes()}${date.getSeconds()}.svg`
  console.log(fileName);
  let folderUrl = `icons/${req.body.user}`;
  let fileUrl = `${folderUrl}/${fileName}`;

  // Create folder if net exist
  if (!fs.existsSync(folderUrl)){
    fs.mkdirSync(folderUrl);
  }

  // Create file
  fs.writeFile(fileUrl, req.body.fileContent, {encoding : 'utf8'}, function (err) 
  {
    if (err) return res.status(500).json({ error: 'SERVER_CREATION_SAVE_FILE_FAIL' });;
    
    user.getUserIdFromName(req.body.user).then((userId) => {

      config.connectBDD().then((db) => {

        log.log("addIcon", {user : req.body.user, fileUrl : fileUrl});

        let sql = `INSERT INTO icons_markers (user_id, file_name, url) VALUES ('${userId}', '${fileName}', '${fileUrl}')`;

        db.query(sql).then((result) => {

          db.end();
          res.status(200).json({});

        }).catch(error => { db.end(); res.status(500).json({ error: 'SERVER_SAVE_QUERY_FAIL' })});
      }).catch((e) => { db.end(); res.status(500).json({ error: 'SERVER_CONNEXION_DATABASE_FAIL' }) });
    }).catch((e) => { res.status(500).json({ error: 'SERVER_CONNEXION_DATABASE_FAIL' }) });
  });
}

/*
 * get all icons of user
 * @param {String}                      req.params.user                     The user name
 * @return {Object[]}                                                       Array of object of icons data
 */
exports.get = (req, res, next) => 
{
  config.connectBDD().then((db) => {

    let sql = `SELECT icons_markers.* FROM icons_markers INNER JOIN users ON users.id = icons_markers.user_id AND users.name="${req.params.user}" `;

    db.query(sql).then((iconsMarkers) => {

      db.end();
      res.status(200).json({iconsMarkers : iconsMarkers});

    }).catch(error => { db.end(); res.status(500).json({ error: 'SERVER_QUERY_FAIL' })});

  }).catch((e) => { db.end(); res.status(500).json({ error: 'SERVER_CONNEXION_DATABASE_FAIL' }) });
}


var mime = {
    html: 'text/html',
    txt: 'text/plain',
    css: 'text/css',
    gif: 'image/gif',
    jpg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    js: 'application/javascript'
};

/*
 * get all icons of user
 * @param {String}                      req.params.user                     The user name
 * @return {Object[]}                                                       Array of object of icons data
 */
exports.getImage = (req, res, next) => 
{
  config.connectBDD().then((db) => {

    let sql = `SELECT * FROM icons_markers WHERE id=${req.params.id}`;



    db.query(sql).then((iconsMarkers) => {

      console.log(iconsMarkers[0]["url"]);

      //var type = mime[path.extname(iconsMarkers[0]["url"]).slice(1)] || 'text/plain';
      var type = "image/svg+xml";

      console.log(type);

      var s = fs.createReadStream(iconsMarkers[0]["url"]);
      s.on('open', function () {
          res.set('Content-Type', type);
          s.pipe(res);
      });
      s.on('error', function () {
          res.set('Content-Type', 'text/plain');
          res.status(404).end('Not found');
      });
    }).catch(error => { db.end(); res.status(500).json({ error: 'SERVER_QUERY_FAIL' })});

  }).catch((e) => { db.end(); res.status(500).json({ error: 'SERVER_CONNEXION_DATABASE_FAIL' }) });

}