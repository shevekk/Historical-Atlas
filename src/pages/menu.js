/**
 * Class for display menu of choise language
 */
class Menu 
{
  /**
   * Init the menu
   * @property {String}                  lang                  The lang
   */
  static init(lang)
  {
    let content = `
    <label for="langue-select">${Dictionary.get("MENU_CHOISE_LANGUE_LABEL")}</label>
    <select name="langue-select" id="langue-select">
        <option value="fr">Francais</option>
        <option value="en">English</option>
    </select>`;

    $("#menu").html(content);

    $("#langue-select").val(lang);

    $("#langue-select").on('change', function() {
      //alert(this.value);

      let lang = this.value;

      Config.setCookie("lang", lang, 30);

      var url = window.location.href;    
      if (url.indexOf('lang=') > -1)
      {
        // If is in URL -> delete lang param et remplace this
        let urlSplit = url.split('lang=');
        let params = urlSplit[1].split('&');

        url = urlSplit[0];
        url += "lang="+lang;
        for(let i = 1; i < params.length; i++)
        {
          url += "&"+params[i];
        }
      }
      else
      {
        if (url.indexOf('?') > -1)
        {
          url += '&lang='+lang;
        }
        else 
        {
          url += '?lang='+lang;
        }
      }
      window.location.href = url;
    });
  }


}

