 
/* Load maps file and display all */
Config.load().then((config) =>
{
  let urlArray = window.location.href.split("/");
  urlArray.pop();
  const websiteUrl = urlArray.join("/");

  $.getJSON("maps.json", function(jsonMaps) 
  {
    let htmlMaps = "";
    for(let key in jsonMaps)
    {
      htmlMaps += "<p>";
      htmlMaps += jsonMaps[key]["name"];
      htmlMaps += `<a href="histoAtlas.html?file=${jsonMaps[key]["file"]}&edit=false"><img class="icon-action" src="img/menu/eye-solid.svg" title="Visualiser" /></a>`;
      htmlMaps += `<a href="histoAtlas.html?file=${jsonMaps[key]["file"]}"><img class="icon-action" src="img/menu/edit-solid.svg" title="Editer un copie" /></a>`;
      htmlMaps += `<a><img id="iframe-${key}" class="icon-action" src="img/menu/iframe.png" title="Exporter sous forme d'une iframe" /></a>`;
      htmlMaps += `<input id="iframeContent-${key}" style="display:none; width:1150px; margin-left: 5px"></input>`;

      htmlMaps += "</p>";
    }

    $("#maps").html(htmlMaps);

    for(let key in jsonMaps)
    {
      $(`#iframe-${key}`).click(function()
      {
        if($(`#iframeContent-${key}`).css("display") == "none")
        {
          $(`#iframeContent-${key}`).css("display", "inline");
          $(`#iframeContent-${key}`).val(`<iframe id="histoatlas" title="Histo Atlas" width="600" height="400" src="${websiteUrl}/histoAtlas.html?file=${jsonMaps[key]["file"]}&edit=false&defaultFullScreen=true"> </iframe>`);
        }
        else
        {
          $(`#iframeContent-${key}`).css("display", "none");
        }
      });
    }
  });

  /* Check if user is connected */
  if(localStorage.getItem('session-id-histoatlas'))
  {
    let urlServer = config.serverUrl + "/api/user/checkValidUser";
    $.ajax({
      url: urlServer,
      method: "GET",
      contentType: "application/json",
      headers:{ 'Authorization': localStorage.getItem('session-token-histoatlas') },
      success: (response) => {

        let user = localStorage.getItem('session-id-histoatlas');
        getUserMap(user);
        getServerMaps(user);
        displayUser(user);
      },
      error: (err) => {
        localStorage.removeItem('session-id-histoatlas');
        localStorage.removeItem('session-token-histoatlas');
        
        getServerMaps(null);
      }
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
    $.ajax({
      url: config.serverUrl + "/api/map/getVisibleMaps/" + user,
      method: "GET",
      contentType: "application/json",
      success: (response) => 
      {
        let publicMaps = [];
        for(let i = 0; i < response.publicMaps.length; i++)
        {
          publicMaps.push(new MapData());
          publicMaps[i].fromJson(response.publicMaps[i]);
        }
        displayPublicMap(publicMaps);
      },
      error: (err) => {
        alert("Impossible de récupérer les cartes : " + err.responseJSON.error);
      }})
  }

  /* 
   * Get users map on server 
   * @property {String}                      user                       The user name
   */
  function getUserMap(user)
  {
    $.ajax({
      url: config.serverUrl + "/api/map/getVisibleMapsOfUser/" + user,
      method: "GET",
      contentType: "application/json",
      success: (response) => 
      {
        let userMaps = [];
        for(let i = 0; i < response.userMaps.length; i++)
        {
          userMaps.push(new MapData());
          userMaps[i].fromJson(response.userMaps[i]);
        }
        displayUserMap(userMaps);
      },
      error: (err) => {
        alert("Impossible de récupérer les cartes : " + err.responseJSON.error);
      }
    });
  }

  /* 
   * Display maps of user with visibility editions button
   * @property {MapData[]}                      userMaps                       The users maps data
   */
  function displayUserMap(userMaps)
  {
    let content = "";

    //alert(window.location.href.split("/").toString());

    

    for(let i = 0; i < userMaps.length; i++)
    {
      content += `<p><div id="map-div">${userMaps[i].name}
      <a href="histoAtlas.html?mapId=${userMaps[i].id}&edit=false"><img class="icon-action" src="img/menu/eye-solid.svg" title="Visualiser" /></a>
      <a href="histoAtlas.html?mapId=${userMaps[i].id}"><img class="icon-action" src="img/menu/edit-solid.svg" title="Editer" /></a></div>`;

      content += `<div id="edit-visibility-div">`;
      if(userMaps[i].public)
      {
        content += `<img class="icon-action-public" id="change-public-state_${i}" src="img/menu/eye-solid-green.svg" title="Carte accessible à tous les utilisateurs" />`;

        if(userMaps[i].publicEditable)
        {
          content += `<img class="icon-action-editable" id="change-editable-state_${i}" src="img/menu/edit-solid-green.svg" title="Edition d'une copie accessible à tous les utilisateurs" />`;
        }
        else
        {
          content += `<img class="icon-action-editable" id="change-editable-state_${i}" src="img/menu/edit-solid-red.svg" title="Edition d'une copie inaccessible aux autres utilisateurs" />`;
        }
      }
      else
      {
        content += `<img class="icon-action-public" id="change-public-state_${i}" src="img/menu/eye-solid-red.svg" title="Carte inaccessible aux autres utilisateurs" />`;
      }

      content += `</div>`;

      content += `<img class="icon-action-delete" id="delete_${i}" src="img/menu/trash-solid.svg" title="Supprimer la carte" />`;

      if(userMaps[i].public)
      {
        content += `<a><img class="iframe-usermap" id="iframeContent_${userMaps[i].id}" src="img/menu/iframe.png" title="Exporter sous forme d'une iframe" /></a>
        <input id="iframeContent-${userMaps[i].id}" style="display:none; width:1150px; margin-left: 5px"></input>`;
      }

      content += `</p>`;
    }

    $("#user-maps").html(content);

    // Change public state
    $(".icon-action-public").click(function() 
    {
      let mapNumber = parseInt($(this).prop("id").split("_")[1]);

      let urlServer = config.serverUrl + "/api/map/changePublicState";
      $.ajax({
        url: urlServer,
        method: "POST",
        contentType: "application/json",
        headers:{ 'Authorization': localStorage.getItem('session-token-histoatlas') }, // 
        data: JSON.stringify({user : localStorage.getItem('session-id-histoatlas'), id : userMaps[mapNumber].id, public : !userMaps[mapNumber].public}),
        success: (response) => {
          userMaps[mapNumber].public = !userMaps[mapNumber].public;
          displayUserMap(userMaps);
        },
        error: (err) => {
          alert("Connexion impossible : " + err.responseJSON.error);
        }
      });
    });

    // Change editable state
    $(".icon-action-editable").click(function() 
    {
      let mapNumber = parseInt($(this).prop("id").split("_")[1]);

      let urlServer = config.serverUrl + "/api/map/changeEditableState";
      $.ajax({
        url: urlServer,
        method: "POST",
        contentType: "application/json",
        headers:{ 'Authorization': localStorage.getItem('session-token-histoatlas') }, // 
        data: JSON.stringify({user : localStorage.getItem('session-id-histoatlas'), id : userMaps[mapNumber].id, public_editable : !userMaps[mapNumber].publicEditable}),
        success: (response) => {
          userMaps[mapNumber].publicEditable = !userMaps[mapNumber].publicEditable;
          displayUserMap(userMaps);
        },
        error: (err) => {
          alert("Connexion impossible : " + err.responseJSON.error);
        }
      });
    });

    // Delete map management
    $(".icon-action-delete").click(function() 
    {
      let mapNumber = parseInt($(this).prop("id").split("_")[1]);
      let mapName = userMaps[mapNumber].name;

      if (window.confirm(`Etes vous sur de vouloir supprimer la carte "${mapName}" ?`))
      {
        $.ajax({
        url: config.serverUrl + "/api/map/",
        method: "DELETE",
        contentType: "application/json",
        headers:{ 'Authorization': localStorage.getItem('session-token-histoatlas') }, // 
        data: JSON.stringify({user : localStorage.getItem('session-id-histoatlas'), id : userMaps[mapNumber].id}),
        success: (response) => {
          document.location.href="index.html";
        },
        error: (err) => {
          alert("Suppression impossible : " + err.responseJSON.error);
        }
      });
      }
    });

    // Manage iframe
    $('.iframe-usermap').click(function() 
    {
      let mapNumber = parseInt($(this).prop("id").split("_")[1]);

      if($(`#iframeContent-${mapNumber}`).css("display") == "none")
      {
        $(`#iframeContent-${mapNumber}`).css("display", "inline");
        $(`#iframeContent-${mapNumber}`).val(`<iframe id="histoatlas" title="Histo Atlas" width="600" height="400" src="${websiteUrl}/histoAtlas.html?mapId=${mapNumber}&edit=false&defaultFullScreen=true"> </iframe>`);
      }
      else
      {
        $(`#iframeContent-${mapNumber}`).css("display", "none");
      }
    });
  }

  /* 
   * Display public maps of other users
   * @property {MapData[]}                      publicMaps                       The maps data
   */
  function displayPublicMap(publicMaps)
  {
    let content = "";

    for(let i = 0; i < publicMaps.length; i++)
    {
      content += `<p>${publicMaps[i].name} - <i>créateur <b>${publicMaps[i].userName}</b></i>
      <a href="histoAtlas.html?mapId=${publicMaps[i].id}&edit=false"><img class="icon-action" src="img/menu/eye-solid.svg" title="Visualiser" /></a>`;

      if(publicMaps[i].publicEditable)
      {
        content += `<a href="histoAtlas.html?mapId=${publicMaps[i].id}"><img class="icon-action" src="img/menu/edit-solid.svg" title="Editer une copie" /></a>`;
      }

      content += `<a><img class="iframe-publicmap" id="iframeContent_${publicMaps[i].id}" src="img/menu/iframe.png" title="Exporter sous forme d'une iframe" /></a>
      <input id="iframeContent-${publicMaps[i].id}" style="display:none; width:1150px; margin-left: 5px"></input>`;
      
      content += `</p>`;
    }

    $("#public-maps").html(content);

    // Manage iframe
    $(".iframe-publicmap").click(function() 
    {
      let mapNumber = parseInt($(this).prop("id").split("_")[1]);

      if($(`#iframeContent-${mapNumber}`).css("display") == "none")
      {
        $(`#iframeContent-${mapNumber}`).css("display", "inline");
        $(`#iframeContent-${mapNumber}`).val(`<iframe id="histoatlas" title="Histo Atlas" width="600" height="400" src="${websiteUrl}/histoAtlas.html?mapId=${mapNumber}&edit=false&defaultFullScreen=true"> </iframe>`);
      }
      else
      {
        $(`#iframeContent-${mapNumber}`).css("display", "none");
      }
    });
  }

  /*
   * Display user, if connected
   * @property {String}                      user                       The user name
   */ 
  function displayUser(user)
  {
    $("#connexion-div").html(`<h3 id="user-name-logged-in">${user}</h3><button id="logout" class="button-loggin">Déconnexion</button><br/><br/><a href="pages/profile.html"><button id="profile" class="button-loggin">Mon profil</button></a>`);

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
    content += `<label for="user-name">Nom d'utilisateur : </label><input id="user-name" type="text"></input><br/>
    <label for="user-password">Mot de passe : </label><input id="user-password" type="password"></input><br/>
    <button id="cancel-login" class="button-loggin">Annuler</button><button id="login" class="button-loggin">Connexion</button>
    <br/><a href="pages/forgotPassword.html">Mot de passe oublié</a>`;

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
      let urlServer = config.serverUrl + "/api/user/login";

      let name = $("#user-name").val();
      let password = $("#user-password").val();

      $.ajax({
        url: urlServer,
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify({name : name, password : password}),
        success: (response) => {
          localStorage.setItem('session-token-histoatlas', response.token);
          localStorage.setItem('session-id-histoatlas', response.userId);

          document.location.href="index.html";
        },
        error: (err) => {
          alert("Connexion impossible : " + err.responseJSON.error);
        }
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
});