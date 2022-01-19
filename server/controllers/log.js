const fs = require("fs");

/*
 * Add a log in file, if not file not exist create a new (1 file par day)
 * @param {String}                      apiName                   Name of the API
 * @param {Object}                      data                      Object of all data to display
 */
exports.log = (apiName, data) => 
{
  let now = new Date();
  let year = now.getFullYear();
  let day = now.getDate();
  let month = now.getMonth() + 1;
  let hours = now.getHours();
  let minutes = now.getMinutes();
  let second = now.getSeconds();

  if(day < 10) day = "0" + day;
  if(month < 10) month = "0" + month;
  if(hours < 10) hours = "0" + hours;
  if(minutes < 10) minutes = "0" + minutes;
  if(second < 10) second = "0" + second;

  let pathFile = "logs/" + day + "-" + month + "-" + year + ".log"; 
  let dateStr = day + "-" + month + "-" + year + " " + hours + ":" + minutes + ":" + second;

  let lineContent = `${dateStr} || ${apiName} || ${JSON.stringify(data)} \n`;

  fs.exists(pathFile, function(exists) 
  {
    //if (!fs.existsSync(path)) 
    if(!exists)
    {
      fs.writeFileSync(pathFile, lineContent, {});
    }
    else
    {
      let data = fs.readFileSync(pathFile, 'utf8');
      data += lineContent;
      fs.writeFileSync(pathFile, data, {});
    }
  });
}