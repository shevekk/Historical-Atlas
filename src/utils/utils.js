class Utils 
{
  /*
   * Call an API in the server
   * @param {String}               apiName                   The api name
   * @param {String}               method                    The method (GET, POST, ...)
   * @param {Object}               data                      Data of the API
   */
  static callServer(apiName, method, data)
  {
    return new Promise(function(resolve, reject) 
    {
      Config.load().then((config) =>
      {
        let urlServer = config.serverUrl + "/api/" + apiName;

        if(data)
        {
          $.ajax({
            url: urlServer,
            method: method,
            contentType: "application/json",
            headers:{ 'Authorization': localStorage.getItem('session-token-histoatlas') }, // 
            data: JSON.stringify(data),
            success: (response) => {
              resolve(response);
            },
            error: (err) => {
              reject(err);
            }
          });
        }
        else
        {
          $.ajax({
            url: urlServer,
            method: method,
            contentType: "application/json",
            headers:{ 'Authorization': localStorage.getItem('session-token-histoatlas') }, // 
            success: (response) => {
              resolve(response);
            },
            error: (err) => {
              reject(err);
            }
          });
        }
      });
    });
  }
}