 
/* Load maps file and display all */
let lang = "en";

if(Config.getCookie("lang"))
{
  lang = Config.getCookie("lang");
}
let params = Config.getUrlParams();
if(params["lang"])
{
  lang = params["lang"];
}

// Hide your map if not connected
if(!localStorage.getItem('session-id-histoatlas')) {
  $("#user-maps-div").css("display", "none");
}

// Hide description of the wrong language 
if(lang == "fr") {
  $("#description_en").css("display", "none");
}
else {
  $("#description_fr").css("display", "none");
}

// If HTTPS -> reload to http
if(window.location.protocol == "https:")
{
  location.href = "http://" + window.location.host + window.location.pathname + window.location.search
}

Config.load().then((config) =>
{
  Dictionary.load(lang, "", function()
  {
    Menu.init(lang);

    let urlArray = window.location.href.split("/");
    urlArray.pop();
    const websiteUrl = urlArray.join("/");

    /* Check if user is connected */
    if(localStorage.getItem('session-id-histoatlas'))
    {
      Utils.callServer("user/checkValidUser", "GET", {}).then((result) => 
      {
        let user = localStorage.getItem('session-id-histoatlas');
        getUserMap(user);
        getServerMaps(user);
        displayUser(user);

      }).catch((err) => { 
        localStorage.removeItem('session-id-histoatlas');
        localStorage.removeItem('session-token-histoatlas');
          
        getServerMaps(null);
      });
    }
    else
    {
      getServerMaps(null);
    }

    /* 
     * Get all visible maps for user on server (all if not connected)
     * @property {String}                      user                       The user name
     */
    function getServerMaps(user)
    {
      Utils.callServer("map/getVisibleMaps/" + user, "GET", {}).then((response) => 
      {
        let publicMaps = [];
          for(let i = 0; i < response.publicMaps.length; i++)
          {
            publicMaps.push(new MapData());
            publicMaps[i].fromJson(response.publicMaps[i]);
          }
          displayPublicMap(publicMaps);
      }).catch((err) => { 
        toastr.error(Dictionary.get(err.responseJSON.error), Dictionary.get('MENU_MAP_RECOVER_FAIL'));
      });
    }

    /* 
     * Get users map on server 
     * @property {String}                      user                       The user name
     */
    function getUserMap(user)
    {

      Utils.callServer("map/getVisibleMapsOfUser/" + user, "GET", {}).then((response) => 
      {
        let userMaps = [];
        for(let i = 0; i < response.userMaps.length; i++)
        {
          userMaps.push(new MapData());
          userMaps[i].fromJson(response.userMaps[i]);
        }
        displayUserMap(userMaps);
      }).catch((err) => { 
        toastr.error(Dictionary.get(err.responseJSON.error), Dictionary.get('MENU_MAP_RECOVER_FAIL'));
      });
    }

    /* 
     * Display maps of user with visibility editions button
     * @property {MapData[]}                      userMaps                       The users maps data
     */
    function displayUserMap(userMaps)
    {
      let content = "";

      let userMap = [];

      for(let i = 0; i < userMaps.length; i++)
      {
        userMap.push(new MenuMapFrame(userMaps[i], "user-maps", i, true));
      }
    }

    /* 
     * Display public maps of other users
     * @property {MapData[]}                      publicMaps                       The maps data
     */
    function displayPublicMap(publicMaps)
    {
      $("#public-maps").html("");
      $("#featured-maps").html("");

      let mapsPublic = [];
      for(let i = 0; i < publicMaps.length; i++) {
        if(publicMaps[i].topVisibility) {
          mapsPublic.push(new MenuMapFrame(publicMaps[i], "featured-maps", false));
        }
        else {
          mapsPublic.push(new MenuMapFrame(publicMaps[i], "public-maps", false));
        }
      }
    }

    /*
     * Display user, if connected
     * @property {String}                      user                       The user name
     */ 
    function displayUser(user)
    {
      $("#connexion-div").html(`<h3 id="user-name-logged-in">${user}</h3><button id="logout" class="button-loggin">${Dictionary.get('INDEX_LOGOUT')}</button><br/><br/><a href="pages/profile.html"><button id="profile" class="button-loggin">${Dictionary.get('INDEX_PROFIL')}</button></a>`);
      $("#registration-button").css("display", "none");

      $("#logout").click(function() 
      {
        localStorage.removeItem('session-token-histoatlas');
        localStorage.removeItem('session-id-histoatlas');

        document.location.href="index.html";
      });
    }

    /*
     * Manage connexion button, display form 
     */
    $("#connexion-button").click(function() 
    {
      let content = "";
      content += `<label for="user-name">${Dictionary.get('INDEX_USER_NAME')}</label><input id="user-name" type="text"></input><br/>
      <label for="user-password">${Dictionary.get('INDEX_USER_PASSWORD')}</label><input id="user-password" type="password"></input><br/>
      <button id="cancel-login" class="button-loggin">${Dictionary.get('INDEX_CANCEL')}</button><button id="login" class="button-loggin">${Dictionary.get('INDEX_USER_CONNEXION')}</button>
      <br/><a href="pages/forgotPassword.html">${Dictionary.get('INDEX_FORGOT_PASSWORD')}</a>`;

      $("#connexion-div").html(content);

      // Cancel login action
      $("#cancel-login").click(function() 
      {
        document.location.href="index.html";
      });

      /*
       * Call API
       */
      function login()
      {
        let name = $("#user-name").val();
        let password = $("#user-password").val();

        Utils.callServer("user/login", "POST", {name : name, password : password}).then((response) => 
        {
          localStorage.setItem('session-token-histoatlas', response.token);
          localStorage.setItem('session-id-histoatlas', response.userId);

          document.location.href="index.html";
        }).catch((err) => { 
          toastr.error(Dictionary.get(err.responseJSON.error), Dictionary.get('INDEX_LOGIN_UNABLE'));
        });
      }

      // Login on enter il focus
      $(window).keypress(function (e) {
        if(e.which == 13) {
          e.preventDefault()
          if (document.activeElement.id == "user-password" || document.activeElement.id == "user-name") {
            login();
          }
        }
      })

      /*
       * Clic login button
       */
      $("#login").click(function() 
      {
        login();
      });
    });

    let linkVersion = "pages/version10.html";
    let linkPresentation = "http://datavizdev.fr/Presentation/index.html";
    if(Dictionary.lang == "en")
    {
      linkVersion = "pages/version10_en.html";
      linkPresentation = "http://datavizdev.fr/Presentation/index_en.html";
    }

    // Add links frames
    new MenuLinkFrame("index-links", "img/menu/question-circle-solid.svg", Dictionary.get('INDEX_HELP_MENU'), `files/HistoAtlas_Help_${Dictionary.lang}.pdf`);
    new MenuLinkFrame("index-links", "img/menu/youtube-brands.svg", Dictionary.get('INDEX_VIDEO_LINK_TEXT'), "https://www.youtube.com/channel/UCVuK-EYlX5qDi8KaOtUQ8JQ");
    new MenuLinkFrame("index-links", "img/menu/calendar-alt-solid.svg", Dictionary.get('INDEX_VERSION_LINK_TEXT') + "10", linkVersion);
    new MenuLinkFrame("index-links", "img/menu/envelope-solid.svg", Dictionary.get('INDEX_CONTACT_LINK_TEXT'), "pages/contact.html", Dictionary.get('INDEX_CONTACT_LINK_DESCRIPTION'));
    new MenuLinkFrame("index-links", "img/menu/hands-helping-solid.svg", Dictionary.get('INDEX_SUPPORT_LINK_TEXT'), "pages/support.html");
    new MenuLinkFrame("index-links", "img/menu/git-hub.png", Dictionary.get('INDEX_SOURCE_CODE_LINK_TEXT'), "https://github.com/shevekk/Historical-Atlas");
    new MenuLinkFrame("index-links", "img/menu/twitter.png", "Twitter", "https://twitter.com/HistoAtlas");
    new MenuLinkFrame("index-links", "img/menu/facebook.png", "Facebook", "https://www.facebook.com/HistoAtlas-108587098369582");
    new MenuLinkFrame("index-links", "img/menu/circle-user-solid.svg", Dictionary.get('INDEX_CREATOR_LINK_TEXT'), linkPresentation);

    // Init text from Dictionnary
    $("#user-maps-title").html(Dictionary.get('INDEX_USER_MAPS_TITLE'));
    $("#public-maps-title").html(Dictionary.get('INDEX_PUBLIC_MAPS_TITLE'));
    $("#create_empty_map").html(Dictionary.get('INDEX_BOUTON_CREATE_NEW_MAP'));
    $("#featured-maps-title").html(Dictionary.get('INDEX_FEACTURED_MAPS_TITLE'));

    $("#connexion-button").html(Dictionary.get('INDEX_CONNEXION'));
    $("#registration-button").html(Dictionary.get('INDEX_REGISTRATION'));
    $("#cancel-button").html(Dictionary.get('INDEX_CANCEL'));

    $("#follow").html(Dictionary.get('INDEX_FOLLOW_PROJET'));
    $("#newsletter-follow-desc").html(Dictionary.get('INDEX_FOLLOW_GET_NEWSLETTER'));
    $("#mail-newsletter-follow-label").html(Dictionary.get('INDEX_FOLLOW_YOUR_MAIL'));
    $("#follow-newsletter-send").html(Dictionary.get('INDEX_FOLLOW_SEND'));

    // Links management
    let fileName = "config/links.json"
    let jqxhr = $.getJSON(fileName, null)
    .done(function(content)
    {
      $("#link-follow-twitter").attr("href", content.twitter);
      $("#link-follow-facebook").attr("href", content.facebook);
      $("#link-follow-discord").attr("href", content.discord);

      $("#link-bottom-twitter").attr("href", content.twitter);
      $("#link-bottom-facebook").attr("href", content.facebook);
      $("#link-bottom-discord").attr("href", content.discord);
      $("#link-bottom-youtube").attr("href", content.youtube);
      $("#link-bottom-gitHub").attr("href", content.gitHub);
    })
    .fail(function(d, textStatus, error)
    {
      console.error("JSON lINKS failed, status: " + textStatus + ", error: " + error);
    });

    // Newsletter div management
    $("#follow").click(function()
    {
      $("#follow-div").css("display", "block"); 
      $("#follow").css("display", "none"); 

      $('#lang-newsletter-follow-' + lang).prop("checked", true);
    });

    // Add a new entry in newsletters
    $("#follow-newsletter-send").click(() => 
    {
      let mailNewsletter = $("#mail-newsletter-follow").val();

      const exp = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      if(exp.test(mailNewsletter))
      {
        let selectLang = "";
        $('input[name="lang-newsletter-follow"]').each(function() {
          if(this.checked)
          {
            selectLang = this.value;
          }
        });

        let dataAddNewsletter = {};
        dataAddNewsletter["lang"] = selectLang;
        dataAddNewsletter["mail"] = mailNewsletter;

        Utils.callServer('user/addNewsletterMail', "POST", dataAddNewsletter).then(() => {
          toastr.success(Dictionary.get("INDEX_FOLLOW_SUCCESS"), "");
        })
        .catch(err => { toastr.error(Dictionary.get(err.responseJSON.error), Dictionary.get("INDEX_FOLLOW_FAIL"));});
      }
      else
      {
        toastr.error(Dictionary.get('REGISTRATION_UNABLE_MAIL_INVALID'), Dictionary.get("INDEX_FOLLOW_FAIL"));
      }
    });

    // Manage change image
    let listImages = ["", "map_rome.png", "map_ww1_alliance.png", "map_ww1.png", "rome_edit.png", "spain.png", "rome_mapbox.png"];
    let imgNumber = 0;
    $("#img-change-left").click(e => {
      changeImage(false);
    });

    $("#img-change-right").click(e => {
      changeImage(true);
    });

    // 
    function changeImage(rightChange) {
      if(rightChange) {
        imgNumber ++;

        if(imgNumber >= listImages.length) {
          imgNumber = 0;
        }
      }
      else {
        imgNumber --;

        if(imgNumber < 0) {
          imgNumber = listImages.length - 1;
        }
      }

      // Change image
      if(imgNumber == 0) {
        $("#img-change-content-images").css('display', 'none');
        $("#img-change-content-video").css('display', 'inline-block');
      }
      else {
        $("#img-change-content-images").attr("src", `img/captures/${listImages[imgNumber]}`);
        $("#img-change-content-images").css('display', 'inline-block');
        $("#img-change-content-video").css('display', 'none');
      }
    }
    
  });
});
