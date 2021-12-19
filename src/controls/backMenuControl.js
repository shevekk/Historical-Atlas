/*
 * Control for back to menu
 */
var BackMenuControl = L.Control.extend({  

  /*
   * Options
   */
  options: {
    position: 'bottomleft'
  },
 
  /*
   */
  initialize: function (options) 
  {
    this.params = options.params;
    this.paintParams = options.paintParams;
  },
  
  /*
   * Add map, init content
   * @param {L.Map}               map                  The map content
   */
  onAdd: function(map) 
  {
    let me = this;
    this.map = map;

    this._container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');

    // 
    this.divLang = L.DomUtil.create('div', 'div-change-lang', this._container);
    this.divLang.title = "";
    //this.divLang.style["padding"] = "0px";
    // back-menu-button

    this.divLangContent = L.DomUtil.create('a', '', this.divLang);

    if(Dictionary.lang == "en")
    {
      this.divLangContent.innerHTML = "EN";
    }
    else
    {
      this.divLangContent.innerHTML = "FR";
    }
    this.divLangContent.style="display : inline;";

    this.buttonLangLeft = L.DomUtil.create('img', 'change-lang-left', this.divLang);
    this.buttonLangLeft.src = "img/menu/angle-left-solid.svg";

    this.buttonLangRight = L.DomUtil.create('img', 'change-lang-right', this.divLang);
    this.buttonLangRight.src = "img/menu/angle-right-solid.svg";

    L.DomEvent.addListener(this.divLang, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this.divLang, 'mousedown', L.DomEvent.stop);
    L.DomEvent.addListener(this.divLang, 'mouseup', L.DomEvent.stop);

    L.DomEvent.on(this.buttonLangLeft, 'click', function() { me.changeLang(false); me.paintParams.uiClick = true; });
    L.DomEvent.on(this.buttonLangRight, 'click', function() { me.changeLang(true); me.paintParams.uiClick = true; });
    

    if(this.inIframe())
    {
      // Accès in main site button
      this.buttonMain = L.DomUtil.create('a', 'back-menu-button', this._container);
      this.buttonMain.title = Dictionary.get("MAP_MENU_WEBSITE_DESC");
      this.buttonMain.innerHTML = Dictionary.get("MAP_MENU_WEBSITE");
      this.buttonMain.href = "";
      this.buttonMain.target = "_blank";

      L.DomEvent.addListener(this.buttonMain, 'click', function(e) { this.paintParams.uiClick = true; }, this);
      L.DomEvent.addListener(this.buttonMain, 'dblclick', L.DomEvent.stop);
      L.DomEvent.addListener(this.buttonMain, 'mousedown', L.DomEvent.stop);
      L.DomEvent.addListener(this.buttonMain, 'mouseup', L.DomEvent.stop);
    }
   
    // Menu button
    this.buttonMenu = L.DomUtil.create('a', 'back-menu-button', this._container);
    this.buttonMenu.title = Dictionary.get("MAP_MENU_MENU_DESC");
    this.buttonMenu.innerHTML = Dictionary.get("MAP_MENU_MENU");
    this.buttonMenu.href = "index.html";
    if(this.params.editMode)
    {
      this.buttonMenu.target = "_blank";
    }

    L.DomEvent.addListener(this.buttonMenu, 'click', function(e) { this.paintParams.uiClick = true; }, this);
    L.DomEvent.addListener(this.buttonMenu, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this.buttonMenu, 'mousedown', L.DomEvent.stop);
    L.DomEvent.addListener(this.buttonMenu, 'mouseup', L.DomEvent.stop);

    if(this.params.editMode)
    {
      // Help button
      this.buttonHelp = L.DomUtil.create('a', 'back-menu-button', this._container);
      this.buttonHelp.title = Dictionary.get("MAP_MENU_HELP_DESC");
      this.buttonHelp.innerHTML = Dictionary.get("MAP_MENU_HELP");
      this.buttonHelp.href = `files/HistoAtlas_Help_${Dictionary.lang}.pdf`;
      this.buttonHelp.target = "_blank";

      L.DomEvent.addListener(this.buttonHelp, 'click', function(e) { this.paintParams.uiClick = true; }, this);
      L.DomEvent.addListener(this.buttonHelp, 'dblclick', L.DomEvent.stop);
      L.DomEvent.addListener(this.buttonHelp, 'mousedown', L.DomEvent.stop);
      L.DomEvent.addListener(this.buttonHelp, 'mouseup', L.DomEvent.stop);
    }

    return this._container;
  },

  /* 
   * Check if the map is in an Iframe
   * @return {Boolean}                   True if is an Iframe
   */
  inIframe : function() 
  {
    try {
      return window.self !== window.top;
    } catch (e) {
      return true;
    }
  },

  /* 
   * Change the lang
   * @param {Boolean}        rightArraw          True if a right arraw 
   */
  changeLang : function(rightArraw)
  {
    let lang = Dictionary.lang;
    if(lang == "fr")
    {
      this.divLangContent.innerHTML = "EN";
      lang = "en";
    }
    else
    {
      this.divLangContent.innerHTML = "FR";
      lang = "fr";
    }

    Config.setCookie("lang", lang, 30);

    this.buttonHelp.href = `files/HistoAtlas_Help_${lang}.pdf`;

    var evt = new CustomEvent("changeLang", { detail: {lang : lang} });
    document.dispatchEvent(evt);
  },

  /*
   * Redraw for lang change
   */
  redraw()
  {
    this.buttonMenu.title = Dictionary.get("MAP_MENU_MENU_DESC");
    this.buttonMenu.innerHTML = Dictionary.get("MAP_MENU_MENU");

    this.buttonHelp.title = Dictionary.get("MAP_MENU_HELP_DESC");
    this.buttonHelp.innerHTML = Dictionary.get("MAP_MENU_HELP");

    if(this.buttonMain)
    {
      this.buttonMain.title = Dictionary.get("MAP_MENU_WEBSITE_DESC");
      this.buttonMain.innerHTML = Dictionary.get("MAP_MENU_WEBSITE");
    }
  }
});