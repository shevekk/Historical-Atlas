
/* Load maps file and display all */
$.getJSON("maps.json", function(jsonMaps) 
{
  let htmlMaps = "";
  for(let key in jsonMaps)
  {
    htmlMaps += "<p>";
    htmlMaps += jsonMaps[key]["name"];
    htmlMaps += `<a href="histoAtlas.html?file=${jsonMaps[key]["file"]}&edit=false"><img class="iconAction" src="img/eye-solid.svg" title="Visualiser" /></a>`;
    htmlMaps += `<a href="histoAtlas.html?file=${jsonMaps[key]["file"]}"><img class="iconAction" src="img/edit-solid.svg" title="Editer" /></a>`;
    htmlMaps += "</p>";
  }

  $("#maps").html(htmlMaps);
});