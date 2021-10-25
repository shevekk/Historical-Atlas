const fs = require('fs');
const mariadb = require('mariadb');

/*
 * Connecte the the MariaBD database 
 * @return                                         The database connection
 */
exports.connectBDD = () => 
{
  return new Promise(function(resolve, reject) 
  {
    fs.readFile("params/config.json", "utf8", function (err,data) {
      if (err)
      { 
        return reject();
      }

      let dataObj = JSON.parse(data);

      mariadb.createConnection({
        host: dataObj["bdd"]["host"],
        user: dataObj["bdd"]["user"],
        password: dataObj["bdd"]["password"],
        database : dataObj["bdd"]["database"],
        port : dataObj["bdd"]["port"]
       }).then(conn => {
        resolve(conn);
      })
      .catch(err => {
        reject()
      });
    });
  });
}

/*
 * Get the token key from config
 * @return                                         The token key
 */
exports.getTokenKey = () => 
{
  return new Promise(function(resolve, reject) 
  {
    fs.readFile("params/config.json", "utf8", function (err,data) {
      if (err)
      {
        console.log(err); 
        reject();
      }
      else
      {
        let dataObj = JSON.parse(data);
        
        resolve(dataObj["tokenKey"]);
      }
    });
  });
}

/*
 * Get the mail infos
 * @return                                         The token key
 */
exports.getMailInfos = () => 
{
  return new Promise(function(resolve, reject) 
  {
    fs.readFile("params/config.json", "utf8", function (err,data) {
      if (err)
      {
        console.log(err); 
        reject();
      }
      else
      {
        let dataObj = JSON.parse(data);
        
        resolve(dataObj["mail"]);
      }
    });
  });
}