

class Config
{
  constructor()
  {
    // mapboxAccessToken
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

  /**
   * get params in the address bar
   * return {String[]}             Array of params get in address bar 
   */
  static getUrlParams()
  {
    // Get ars values of address bar
    var args = location.search.substr(1).split(/&/);
    var argsValues = [];

    for(var i =0; i < args.length; i++)
    {
      var tmp = args[i].split(/=/);
      if (tmp[0] != "") {
          argsValues[decodeURIComponent(tmp[0])] = decodeURIComponent(tmp.slice(1).join("").replace("+", " "));
      }
    }

    return argsValues;
  }

  /* 
   * Get cookies
   * param {String}          cname            Name of the cookie
   */
  static getCookie(cname) 
  {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  /* 
   * Set a cookies
   * param {String}          name            Name of the cookie
   * param {String}          value           Value of the cookie
   * param {String}          timeDays        Nombre of days cookie before expiration
   */
  static setCookie(name, value, timeDays) 
  {
    let date = new Date();
    date.setTime(date.getTime() + (3600 * 24 * timeDays)); 
    let cookieexpire = date.toGMTString();

    let cookiepath = "/";

    document.cookie = name + "=" + value + "; expires=" + cookieexpire + "; path=" + cookiepath;
  }
}
