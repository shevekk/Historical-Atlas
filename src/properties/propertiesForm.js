/*
 * Manage the properties form
 */
class PropertiesForm
{
  /*
   * @property {Property[]}                      properties                Array of all properties
   * @property {PropertyFormLine[]}              lines                     The lines of the forms
   * @property {NumberPropertyFormLine[]}        nbLines                   Nb of lines in property form
   */
  static properties = [];
  static lines = [];
  static nbLines = 0;

  /*
   * Display the form
   */
  static display()
  {
    PropertiesForm.lines = [];
    PropertiesForm.nbLines = 0;

    let me = this;

    $("#dialog-properties").prop('title', Dictionary.get("MAP_PROP_FORM_TITLE"));

    PropertiesForm.initFormContent();

    let dialog = $("#dialog-properties").dialog({
      autoOpen: false,
      height: 550,
      width: 745,
      modal: true,
      buttons: {
        Cancel: function() {
          dialog.dialog( "close" );
        },
        OK: function() {

          if(PropertiesForm.checkValidForm())
          {
            PropertiesForm.save();
            dialog.dialog( "close" );

            var evt = new CustomEvent("reloadPropertiesControl", { });
            document.dispatchEvent(evt);
          }
          else
          {
            alert(Dictionary.get('MAP_PROP_FORM_SAVE_INVALID'));
          }
        }
      },
      close: function() {
        dialog.dialog( "close" );
      }
    });

    dialog.dialog( "open" );
  }

  /*
   * Init the form content
   */
  static initFormContent()
  {
    let content = ``;

    content += `<p style="display:inline; margin-left:110px"><b>${Dictionary.get("MAP_PROP_FORM_TITLES_NAME")}</b></p>`;
    content += `<p style="display:inline; margin-left:165px"><b>${Dictionary.get("MAP_PROP_FORM_TITLES_VALUES")}</b></p>`;
    content += `<p style="display:inline; margin-left:88px"><b>${Dictionary.get("MAP_PROP_FORM_TITLES_COLOR")}</b></p>`;
    content += `<p style="display:inline; margin-left:55px"><b>${Dictionary.get("MAP_PROP_FORM_TITLES_OPACITY")}</b></p>`;

    content += `<div id="propmenu-content" style="margin-bottom:20px"></div>`;
    content += `<button id="propmenu-add-prop" style="width:250px; padding:4px;">${Dictionary.get("MAP_PROP_FORM_ADD_PROP")}</button>`;

    $("#dialog-properties").html(content);

    for(let i = 0; i < PropertiesForm.properties.length; i++) 
    {
      PropertiesForm.lines.push(new PropertyFormLine());
      PropertiesForm.lines[PropertiesForm.lines.length - 1].displayLine(PropertiesForm.properties[i], PropertiesForm.properties[i].number);
    }

    if(PropertiesForm.properties.length > 0)
    {
      PropertiesForm.properties.map(prop => { if(PropertiesForm.nbLines <= prop.number) { PropertiesForm.nbLines = prop.number+1 } });
    }

    // Add a new line
    $("#propmenu-add-prop").click(function()
    {
      PropertiesForm.nbLines ++;
      PropertiesForm.lines.push(new PropertyFormLine());
      PropertiesForm.lines[PropertiesForm.lines.length - 1].displayLine(null, PropertiesForm.nbLines);
    });
  }

  /* 
   * Check if content of the line is valid
   * @return {Boolean}                         Check if is a valid content
   */
  static checkValidForm()
  {
    let valid = true;

    for(let i = 0; i < PropertiesForm.lines.length; i++)
    {
      if(valid)
      {
        valid = PropertiesForm.lines[i].checkValidLine();
      }
    }

    return valid;
  }

  /*
   * Save the content
   */
  static save()
  {
    PropertiesForm.properties = [];

    for(let i = 0; i < PropertiesForm.lines.length; i++)
    {
      let prop = PropertiesForm.lines[i].save();

      if(prop)
      {
        PropertiesForm.properties.push(prop);
      }
    }
  }

  /*
   * Export properties data to json
   * @param {Object}               content                   Content Object
   * @return {Object}                                        Content with properties data
   */
  static toJson(content)
  {
    content.properties = [];
    for(let i = 0; i < PropertiesForm.properties.length; i++)
    {
      content = PropertiesForm.properties[i].toJson(content);
    }

    return content;
  }

  /*
   * Init property from json object content
   * @param {Object}               contentObj                   Content Object with properties data
   */
  static fromJson(contentProp)
  {
    PropertiesForm.properties = [];
    for(let i = 0; i < contentProp.length; i++)
    {
      PropertiesForm.properties.push(new Property());
      PropertiesForm.properties[i].fromJson(contentProp[i]);
    }
  }
}