

/*
 * Display in layer control a parent layer div
 */
class MapData 
{
  /* 
   *
   */
  constructor()
  {
    this.id = null;
    this.userId = null;
    this.name = null;
    this.url = null;
    this.public = null;
    this.topVisibility = null;
    this.publicEditable = null;
    this.userName = null;
    this.lang = null;
  }

  fromJson(jsonData)
  {
    this.id = jsonData["id"];
    this.userId = jsonData["user_id"];
    this.name = jsonData["name"];
    this.url = jsonData["url"];
    this.public = jsonData["public"];
    this.topVisibility = jsonData["top_visibility"];
    this.publicEditable = jsonData["public_editable"];
    this.lang = jsonData["lang"];

    if(jsonData["user_name"])
    {
      this.userName = jsonData["user_name"];
    }
  }
}