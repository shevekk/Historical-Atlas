﻿
/* Load maps file and display all */
Config.load().then((config) =>
{
  $.getJSON("maps.json", function(jsonMaps) 
  {
    let htmlMaps = "";
    for(let key in jsonMaps)
    {
      htmlMaps += "<p>";
      htmlMaps += jsonMaps[key]["name"];
      htmlMaps += `<a href="histoAtlas.html?file=${jsonMaps[key]["file"]}&edit=false"><img class="icon-action" src="img/eye-solid.svg" title="Visualiser" /></a>`;
      htmlMaps += `<a href="histoAtlas.html?file=${jsonMaps[key]["file"]}"><img class="icon-action" src="img/edit-solid.svg" title="Editer un copie" /></a>`;
      htmlMaps += "</p>";
    }

    $("#maps").html(htmlMaps);
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
        getServerMaps(user);
        displayUser(user);
      },
      error: (err) => {
        getServerMaps(null);
      }
    });
  }
  else
  {
    getServerMaps(null);
  }

   /* 
    * Get users map on server and all visible maps 
    * @property {String}                      user                       The user name
    */
  function getServerMaps(user)
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

    for(let i = 0; i < userMaps.length; i++)
    {
      content += `<p><div id="map-div">${userMaps[i].name}
      <a href="histoAtlas.html?mapId=${userMaps[i].id}&edit=false"><img class="icon-action" src="img/eye-solid.svg" title="Visualiser" /></a>
      <a href="histoAtlas.html?mapId=${userMaps[i].id}"><img class="icon-action" src="img/edit-solid.svg" title="Editer" /></a></div>`;

      content += `<div id="edit-visibility-div">`;
      if(userMaps[i].public)
      {
        content += `<img class="icon-action-public" id="change-public-state_${i}" src="img/eye-solid-green.svg" title="Carte accessible à tous les utilisateurs" />`;

        if(userMaps[i].publicEditable)
        {
          content += `<img class="icon-action-editable" id="change-editable-state_${i}" src="img/edit-solid-green.svg" title="Edition d'une copie accessible à tous les utilisateurs" />`;
        }
        else
        {
          content += `<img class="icon-action-editable" id="change-editable-state_${i}" src="img/edit-solid-red.svg" title="Edition d'une copie inaccessible aux autres utilisateurs" />`;
        }
      }
      else
      {
        content += `<img class="icon-action-public" id="change-public-state_${i}" src="img/eye-solid-red.svg" title="Carte inaccessible aux autres utilisateurs" />`;
      }

      content += `</div>`;

      content += `<img class="icon-action-delete" id="delete_${i}" src="img/trash-solid.svg" title="Supprimer la carte" />`;

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
      <a href="histoAtlas.html?mapId=${publicMaps[i].id}&edit=false"><img class="icon-action" src="img/eye-solid.svg" title="Visualiser" /></a>`;

      if(publicMaps[i].publicEditable)
      {
        content += `<a href="histoAtlas.html?mapId=${publicMaps[i].id}"><img class="icon-action" src="img/edit-solid.svg" title="Editer une copie" /></a>`;
      }
      
      content += `</p>`;
    }

    $("#public-maps").html(content);
  }

  /*
   * Display user, if connected
   * @property {String}                      user                       The user name
   */ 
  function displayUser(user)
  {
    $("#connexion-div").html(`<h3 id="user-name-logged-in">${user}</h3><button id="logout" class="button-loggin">Déconnexion</button>`);

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
    content += `<label for="user-name">Nom d'utilisateur : </label><input id="user-name" type="text"></input><br/>`;
    content += `<label for="password">Mot de passe : </label><input id="user-password" type="password"></input><br/>`;
    content += `<button id="cancel-login" class="button-loggin">Annuler</button><button id="login" class="button-loggin">Connexion</button>`;

    $("#connexion-div").html(content);

    // Cancel login action
    $("#cancel-login").click(function() 
    {
      document.location.href="index.html";
    });

    /*
     * Clic login, call API
     */
    $("#login").click(function() 
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
    });
  });
});