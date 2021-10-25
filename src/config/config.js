

class Config
{
  constructor()
  {

  }

  static load(inUnderFolder)
  {
    return new Promise(function(resolve, reject) 
    { 
      let url = "config/config.json";

      if(inUnderFolder)
      {
        url = "../config/config.json"
      }

      $.getJSON(url, function(configData) 
      {
        resolve(configData);
      });
    });
  }
}