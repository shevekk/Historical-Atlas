const mariadb = require('mariadb');
const config = require('../params/config');
const user = require('./user');
const fs = require('fs');
const url = require('url');
const log = require("./log");

/*
 * Save a map
 * @param {String}                      req.body.user                       The user name
 * @param {String}                      req.body.name                       The name in database
 * @param {String}                      req.body.fileName                   The file name 
 * @param {String}                      req.body.content                    Content of the file to save (json stringify)
 * @return                                                                  Empty
 */
exports.save = (req, res, next) => 
{
  let folderUrl = `files/${req.body.user}`;
  let fileUrl = `${folderUrl}/${req.body.fileName}.json`;

  // Create folder if net exist
  if (!fs.existsSync(folderUrl)){
    fs.mkdirSync(folderUrl);
  }

  // Create file
  fs.writeFile(fileUrl, req.body.content, function (err) 
  {
    if (err) return res.status(500).json({ error: 'SERVER_CREATION_SAVE_FILE_FAIL' });;

    user.getUserIdFromName(req.body.user).then((userId) => {

      config.connectBDD().then((db) => {

        log.log("saveMap", {name : req.body.user, fileUrl : fileUrl});

        if(req.body.exist)
        {
          let sql = `UPDATE maps SET lang = '${req.body.lang}', category = '${req.body.type}' WHERE name = '${req.body.name}' AND user_id = '${userId}'`;

          db.query(sql).then((result) => {

            db.end();
            res.status(200).json({});

          }).catch(error => { db.end(); res.status(500).json({ error: 'SERVER_SAVE_QUERY_FAIL' })});
        }
        else
        {
          let sql = `INSERT INTO maps (user_id, name, url, lang, category) VALUES ('${userId}', '${req.body.name}', '${fileUrl}', '${req.body.lang}', '${req.body.type}')`;

          db.query(sql).then((result) => {

            db.end();
            res.status(200).json({});

          }).catch(error => { db.end(); res.status(500).json({ error: 'SERVER_SAVE_QUERY_FAIL' })});
        }

      }).catch((e) => { db.end(); res.status(500).json({ error: 'SERVER_CONNEXION_DATABASE_FAIL' }) });
    }).catch((e) => { res.status(500).json({ error: 'SERVER_CONNEXION_DATABASE_FAIL' }) });
  });
}

/*
 * Check if a file is exist
 * @param {String}                      req.body.user                       The user name
 * @param {String}                      req.body.name                       The name in database
 * @return {Object}                                                         Object with exist state
 */
exports.checkIfFileExist = (req, res, next) => 
{
  config.connectBDD().then((db) => {

    let sql = `SELECT maps.* FROM maps INNER JOIN users ON users.id = maps.user_id AND users.name="${req.body.user}" WHERE maps.name="${req.body.name}"`;

    db.query(sql).then((result) => {

      db.end();
      if(result.length > 0)
      {
        res.status(200).json({exist : true});
      }
      else
      {
        res.status(200).json({exist : false});
      }

    }).catch(error => {db.end(); res.status(500).json({ error: 'SERVER_QUERY_FAIL' })});

  }).catch((e) => { db.end(); res.status(500).json({ error: 'SERVER_CONNEXION_DATABASE_FAIL' }) });
}

/*
 * Get all maps of an user
 * @param {String}                      req.body.user                       The user name (null if not logged)
 * @return {Object}                                                         Object with all maps of user and public maps
 */
exports.getVisibleMapsOfUser = (req, res, next) => 
{
  config.connectBDD().then((db) => {

    let sql = `SELECT maps.* FROM maps INNER JOIN users ON users.id = maps.user_id AND users.name="${req.params.user}" `;

    db.query(sql).then((userMaps) => {

      db.end();
      res.status(200).json({userMaps : userMaps});

    }).catch(error => { db.end(); res.status(500).json({ error: 'SERVER_QUERY_FAIL' })});

  }).catch((e) => { db.end(); res.status(500).json({ error: 'SERVER_CONNEXION_DATABASE_FAIL' }) });
}

/*
 * Get all visible of an user
 * @param {String}                      req.body.user                       The user name (null if not logged)
 * @return {Object}                                                         Object with all maps of user and public maps
 */
exports.getVisibleMaps = (req, res, next) => 
{
  config.connectBDD().then((db) => {

    let sql = `SELECT maps.*, users.name as user_name FROM maps 
                INNER JOIN users ON users.id = maps.user_id AND users.name<>"${req.params.user}"
                WHERE maps.public`

    db.query(sql).then((publicMaps) => {

      db.end();
      res.status(200).json({publicMaps : publicMaps});

    }).catch(error => { db.end(); res.status(500).json({ error: 'SERVER_QUERY_FAIL' })});

  }).catch((e) => { db.end(); res.status(500).json({ error: 'SERVER_CONNEXION_DATABASE_FAIL' }) });
}

/*
 * Get a map
 * @param {Number}                      req.params.id                       The id of the map
 * @param {String}                      req.query.user                      The user name
 * @param {Boolean}                     req.query.editMode                  Edit Mode
 * @return {Object}                                                         Object with name and map data
 */
exports.getMap = (req, res, next) => 
{
  let user = url.parse(req.url,true).query.user;
  let editMode = url.parse(req.url,true).query.editMode;

  let sql = ``;

  if(editMode == true || editMode == "true")
  {
    sql = `SELECT maps.url, maps.name, maps.views, users.name as user_name, maps.lang, maps.category FROM maps 
            LEFT JOIN users ON users.id = maps.user_id 
            WHERE maps.id = ${req.params.id} AND (users.name = "${user}" OR (maps.public AND maps.public_editable))`;
  }
  else
  {
    sql = `SELECT maps.url, maps.name, maps.views, users.name as user_name, maps.lang, maps.category FROM maps 
            LEFT JOIN users ON users.id = maps.user_id 
            WHERE maps.id = ${req.params.id} AND (users.name = "${user}" OR maps.public)`;
  }

  this.getMapManage(sql, req.params.id, editMode, user, res);
}

/*
 * Get a map in guest mod
 * @param {Number}                      req.params.id                       The id of the map
 * @param {String}                      req.query.user                      The user name
 * @param {Boolean}                     req.query.editMode                  Edit Mode
 * @return {Object}                                                         Object with map data
 */
exports.getMapGuest = (req, res, next) => 
{
  let editMode = url.parse(req.url,true).query.editMode;
  let sql = "";

  if(editMode == true || editMode == "true")
  {
    sql = `SELECT maps.url, maps.name, maps.views, users.name as user_name, maps.lang, maps.category FROM maps 
            LEFT JOIN users ON users.id = maps.user_id 
            WHERE maps.id = ${req.params.id} AND (maps.public AND maps.public_editable)`;
  }
  else
  {
    sql = `SELECT maps.url, maps.name, maps.views, users.name as user_name, maps.lang, maps.category FROM maps 
            LEFT JOIN users ON users.id = maps.user_id 
            WHERE maps.id = ${req.params.id} AND maps.public`;
  }

  this.getMapManage(sql, req.params.id, editMode, "", res);
}

/*
 * Get a map in guest mod
 * @param {String}                      sql                  The sql query
 * @param {Number}                      id                   The map id
 * @param {Boolean}                     editMode             True if editMode 
 * @param {String}                      userName             The user name
 * @param {Boolean}                     res                  Result manager
 * @return {Object}                                          Object with map data
 */
exports.getMapManage = (sql, id, editMode, userName, res) =>
{
  config.connectBDD().then((db) => {

    db.query(sql).then((result) => {

      if(result.length == 0) return res.status(500).json({ error: 'La carte est inaccessible' });

      let views = result[0]['views'];
      if(editMode == false || editMode == "false" || result[0]['user_name'] != userName)
      {
        views ++;
      }

      sqlUpdate = `UPDATE maps SET views = ${views} WHERE maps.id = ${id}`;

      db.query(sqlUpdate).then((resultUpdate) => {

        fs.readFile(result[0]['url'], 'utf8', function (err,data) {
          if (err)
          { 
            console.log(err); 
            db.end();
            return res.status(500).json({ error: 'SERVER_READ_FILE_FAIL' });
          }
          
          db.end();
          log.log("getMap", {name : result[0]['name'], url : result[0]['url']});
          res.status(200).json({data : data, views : views, name : result[0]['name'], lang : result[0]['lang'], type : result[0]['category']});
        });

     }).catch(error => { db.end(); res.status(500).json({ error: 'SERVER_QUERY_FAIL' })});

    }).catch(error => { db.end(); res.status(500).json({ error: 'SERVER_QUERY_FAIL' })});

  }).catch((e) => { db.end(); res.status(500).json({ error: 'SERVER_CONNEXION_DATABASE_FAIL' }) });
}

/*
 * Change the public state of a map
 * @param {Number}                      req.params.id                       The id of the map
 * @param {String}                      req.query.user                      The user name
 * @param {Boolean}                     req.query.public                    Public state
 * @return {Object}                                                         Object empty
 */
exports.changePublicState = (req, res, next) => 
{
  config.connectBDD().then((db) => {

    let sql = `UPDATE maps 
              INNER JOIN users ON users.id = maps.user_id AND users.name = "${req.body.user}"
              SET public = ${req.body.public} WHERE maps.id = ${req.body.id}`

    db.query(sql).then((result) => {

      db.end();
      res.status(200).json({});

    }).catch(error => { db.end(); res.status(500).json({ error: 'SERVER_QUERY_FAIL' })});

  }).catch((e) => { db.end(); res.status(500).json({ error: 'SERVER_CONNEXION_DATABASE_FAIL' }) });
}

/*
 * Change the public editable state of a map
 * @param {Number}                      req.params.id                       The id of the map
 * @param {String}                      req.query.user                      The user name
 * @param {Boolean}                     req.query.public                    Public state
 * @return {Object}                                                         Object empty
 */
exports.changeEditableState = (req, res, next) => 
{
  config.connectBDD().then((db) => {

    let sql = `UPDATE maps 
              INNER JOIN users ON users.id = maps.user_id AND users.name = "${req.body.user}"
              SET public_editable = ${req.body.public_editable} WHERE maps.id = ${req.body.id}`

    db.query(sql).then((result) => {

      db.end();
      res.status(200).json({});

    }).catch(error => { db.end(); res.status(500).json({ error: 'SERVER_QUERY_FAIL' })});

  }).catch((e) => { db.end(); res.status(500).json({ error: 'SERVER_CONNEXION_DATABASE_FAIL' }) });
}

/* 
 * Delete a file and update database
 * @param {Number}                      req.params.id                       The id of the map
 * @param {String}                      req.query.user                      The user name
 * @return {Object}                                                         Object empty
 */
exports.delete = (req, res, next) => 
{
  config.connectBDD().then((db) => {

    let sqlSelect = `SELECT url FROM maps WHERE id = ${req.body.id}`;

    db.query(sqlSelect).then((resultSelect) => {

      if(resultSelect.length == 0) return res.status(500).json({ error: 'SERVER_QUERY_FAIL' });

      let fileUrl = resultSelect[0]['url'];

      let sql = `DELETE maps.* FROM maps
                INNER JOIN users ON users.id = maps.user_id AND users.name = "${req.body.user}"
                WHERE maps.id = ${req.body.id}`;
                
      db.query(sql).then((result) => {

        fs.unlink(fileUrl, (err) => {

          log.log("delete", {name : req.body.user, mapId : req.body.id, fileUrl : fileUrl});
          db.end();
          
          if (err) 
          {
            return res.status(500).json({ error: 'Impossible de supprimer le fichier' })
          }

          res.status(200).json({});
        });

      }).catch(error => { db.end(); res.status(500).json({ error: 'SERVER_QUERY_FAIL' }) });
    }).catch(error => { db.end(); res.status(500).json({ error: 'SERVER_QUERY_FAIL' })});

  }).catch((e) => { db.end(); res.status(500).json({ error: 'SERVER_CONNEXION_DATABASE_FAIL' }) });
}

/*
 * Create a new map action
 */
exports.createNewMap = (req, res, next) => 
{
  log.log("createNewFile", {});
}

/*
 * Rename a map
 * @param {String}                      req.body.user                       The user name
 * @param {String}                      req.body.newName                    The new name in database
 * @param {String}                      req.body.fileName                   The file name 
 * @param {String}                      req.body.id                         Id of the map
 */
exports.rename = (req, res, next) => 
{
  let folderUrl = `files/${req.body.user}`;
  let fileUrl = `${folderUrl}/${req.body.fileName}.json`;

  config.connectBDD().then((db) => {

    let sqlSelect = `SELECT maps.url as url FROM maps LEFT JOIN users ON users.id = maps.user_id WHERE maps.id = ${req.body.id}`;

    db.query(sqlSelect).then((resultSelect) => {

      if(resultSelect.length > 0)
      {
        let oldUrl = resultSelect[0]['url'];

        let sql = `UPDATE maps SET name = '${req.body.newName}', url = '${fileUrl}' WHERE maps.id = ${req.body.id}`

        db.query(sql).then((result) => {

          fs.rename(oldUrl, fileUrl, function()
          {
              db.end();

              log.log("renameMap", {name : req.body.user, oldFileUrl : oldUrl, newFileUrl : fileUrl, new_name : req.body.newName, id : req.body.id});

              res.status(200).json({});
          });

        }).catch(error => { db.end(); res.status(500).json({ error: 'SERVER_QUERY_FAIL' }) });
      }
      else
      {
        db.end(); 
        res.status(500).json({ error: 'SERVER_QUERY_FAIL' });
      }
    }).catch(error => { db.end(); res.status(500).json({ error: 'SERVER_QUERY_FAIL' })});

  }).catch((e) => { db.end(); res.status(500).json({ error: 'SERVER_CONNEXION_DATABASE_FAIL' }) });
}