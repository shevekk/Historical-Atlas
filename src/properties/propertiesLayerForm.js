class PropertyLayerForm
{
  /*
   * Manage the properties layer form
   * @property {PropertyLayerFormLine[]}            lines                     The lines of the forms
   */
  constructor()
  {
    this.lines = [];
  }

  /*
   * Display the form
   * @property {ParentLayer}             parentLayer             The parent layer target
   * @property {Params}                  params                  The params
   */
  display(parentLayer, params)
  {
    let me = this;

    $("#dialog-properties-layer").prop('title', Dictionary.get("MAP_PROP_LAYER_FORM_TITLE"));

    me.initFormContent(parentLayer, params);

    let dialog = $("#dialog-properties-layer").dialog({
      autoOpen: false,
      height: 550,
      width: 800,
      modal: true,
      buttons: {
        Cancel: function() {
          dialog.dialog( "close" );
        },
        OK: function() {

          if(me.checkValidForm())
          {
            me.save(parentLayer, params);
            dialog.dialog( "close" );
          }
          else
          {
            alert(Dictionary.get('MAP_PROP_LAYER_FORM_SAVE_INVALID'));
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
   * Init the content HTML of the form
   * @property {ParentLayer}             parentLayer             The parent layer target
   * @property {Params}                  params                  The params
   */
  initFormContent(parentLayer, params)
  {
    let me = this;

    let content = ``;

    content += `<p style="display:inline-block; margin-left:40px; width:165px; text-align:center"><b>${Dictionary.get("MAP_PROP_LAYER_FORM_TITLES_NAME")}</b></p>`;
    content += `<p style="display:inline-block; margin-left:50px; width:165px; text-align:center"><b>${Dictionary.get("MAP_PROP_LAYER_FORM_TITLES_VALUE")}</b></p>`;
    content += `<p style="display:inline-block; margin-left:15px; font-size: 0.9em; width:165px; text-align:center"><b>${Dictionary.get("MAP_PROP_LAYER_FORM_TITLES_START")}</b></p>`;
    content += `<p style="display:inline-block; margin-left:0px; font-size: 0.9em; width:165px; text-align:center"><b>${Dictionary.get("MAP_PROP_LAYER_FORM_TITLES_END")}</b></p>`;

    content += `<div id="propmenu-layer-content" style="margin-bottom:20px"></div>`;
    content += `<button id="propmenu-layer-add-prop" style="width:250px; padding:4px;">${Dictionary.get("MAP_PROP_FORM_ADD_PROP")}</button>`;

    $("#dialog-properties-layer").html(content);

    // Add a new line
    $("#propmenu-layer-add-prop").click(function()
    {
      me.lines.push(new PropertyLayerFormLine());
      me.lines[me.lines.length - 1].displayLine(null, params, me.lines.length);
    });

    for(let i = 0; i < parentLayer.properties.length; i++)
    {
      me.lines.push(new PropertyLayerFormLine());
      //me.lines[me.lines.length - 1].displayLine(parentLayer.properties[i], params, parentLayer.properties[i].number);
      me.lines[me.lines.length - 1].displayLine(parentLayer.properties[i], params, me.lines.length);
    }
  }

  /* 
   * Check if content of the line is valid
   * @return {Boolean}                         Check if is a valid content
   */
  checkValidForm()
  {
    let valid = true;

    for(let i = 0; i < this.lines.length; i++)
    {
      if(valid)
      {
        valid = this.lines[i].checkValidLine();
      }
    }

    return valid;
  }

  /*
   * Save the form, update properies of the parent layer
   * @property {ParentLayer}             parentLayer             The parent layer target to update
   * @property {Params}                  params                  The params
   */
  save(parentLayer, params)
  {
    parentLayer.properties = [];

    for(let i = 0; i < this.lines.length; i++)
    {
      let newProp = this.lines[i].save(params);

      if(newProp != null)
      {
        parentLayer.properties.push(newProp);
      }
    }
  }
}