class PropertyLayerFormLine
{
  /*
   * Manage the properties layer form line
   * @property {Numbers}            number                     The line number
   */
  constructor()
  {
    this.number = -1;
  }

  /*
   * Display the form line
   * @property {PropertyLayer}             prop                  The prop layer object
   * @property {ParentLayer}             parentLayer             The parent layer target
   * @property {Params}                  params                  The params
   */
  displayLine(prop, params, number)
  {
    let me = this;

    me.number = number;

    let lineContent = ``;

    lineContent += `<div id="propmenu-layer-${number}-line" style="margin-bottom:15px;">`;

    lineContent += `<img id="propmenu-layer-${number}-delete" title="${Dictionary.get('MAP_PROP_FORM_DELETE_LINE_TITLE')}" src="img/menu/source_icons_cancel" class="prop-form-delete-line-button" />`;

    lineContent += `<select id="propmenu-layer-${number}-name" style="margin-left:10px;width:200px">`
    lineContent += `<option value=""></option>`;
    for(let i = 0; i < PropertiesForm.properties.length; i++)
    {
      lineContent += `<option value="${PropertiesForm.properties[i].number}">${PropertiesForm.properties[i].name}</option>`;
    }
    lineContent += `</select>`;

    lineContent += `<select id="propmenu-layer-${number}-value" style="margin-left:10px;width:200px"></select>`

    lineContent += `<input id="propmenu-layer-${number}-start" style="margin-left:10px;width:135px"></input>`;
    lineContent += `<input id="propmenu-layer-${number}-end" style="margin-left:10px;width:135px"></input>`;

    lineContent += `</div>`;

    $("#propmenu-layer-content").append(lineContent);

    //  Manage change name
    $(`#propmenu-layer-${number}-name`).change(function()
    {
      let propNumber = $(`#propmenu-layer-${number}-name`).val();
      $(`#propmenu-layer-${number}-value`).html("");

      if(propNumber != "")
      {
        let values = PropertiesForm.properties.find(p => p.number == propNumber).values;
        for(let i = 1; i <= PropertiesForm.properties.find(p => p.number == propNumber).nbValues; i++)
        {
          if(values[i])
          {
            $(`#propmenu-layer-${number}-value`).append(`<option value="${i}">${values[i]}</option>`);
          }
        }
      }
      else
      {
        
      }
    });

    // Delete the line (hide) 
    $(`#propmenu-layer-${number}-delete`).click(function()
    {
      $(`#propmenu-layer-${number}-line`).css("display", "none");
    });

    // Add content from props
    if(prop != null)
    {
      $(`#propmenu-layer-${number}-name`).val(prop.propNumber);

      //let values = PropertiesForm.properties[prop.propNumber].values;
      if(PropertiesForm.properties.find(p => p.number == prop.propNumber))
      {
        let values = PropertiesForm.properties.find(p => p.number == prop.propNumber).values;
        for(let i = 0; i <= PropertiesForm.properties.find(p => p.number == prop.propNumber).nbValues; i++)
        {
          if(values[i])
          {
            $(`#propmenu-layer-${number}-value`).append(`<option value="${i}">${values[i]}</option>`);
          }
        }

        $(`#propmenu-layer-${number}-value`).val(prop.valueNumber);

        if(prop.startDate)
        {
          $(`#propmenu-layer-${number}-start`).val(DateConverter.numberToDate(prop.startDate, params));
        }
        if(prop.endDate)
        {
          $(`#propmenu-layer-${number}-end`).val(DateConverter.numberToDate(prop.endDate, params));
        }
      }
    }
    else
    {

    }
  }

  /* 
   * Check if content of the line is valid (start and end date)
   * @return {Boolean}                         Check if is a valid line
   */
  checkValidLine()
  {
    let valid = true;

    if($(`#propmenu-layer-${this.number}-line`).css("display") != "none")
    {
      if($(`#propmenu-layer-${this.number}-name`).val())
      {
        if(!DateConverter.checkDateValid($(`#propmenu-layer-${this.number}-start`).val()))
        {
          valid = false;
        }
        if(!DateConverter.checkDateValid($(`#propmenu-layer-${this.number}-end`).val()))
        {
          valid = false;
        }
      }
    }

    return valid;
  }

  /*
   * Save the form, update properies of the parent layer
   * @property {Params}                  params                  The params
   * @return {PropertyLayer}                                     The property data of the line (null if hidden or name empty)
   */
  save(params)
  {
    let prop = null;

    if($(`#propmenu-layer-${this.number}-line`).css("display") != "none")
    {
      if($(`#propmenu-layer-${this.number}-name`).val())
      {
        let propNumber = parseInt($(`#propmenu-layer-${this.number}-name`).val());
        let valueNumber = parseInt($(`#propmenu-layer-${this.number}-value`).val());
        let startDateStr = $(`#propmenu-layer-${this.number}-start`).val();
        let endDateStr = $(`#propmenu-layer-${this.number}-end`).val();

        let startDate = null;
        if(startDateStr)
        {
          startDate = DateConverter.dateToNumber(startDateStr, false, params);
        }
        let endDate = null;
        if(endDateStr)
        {
          endDate = DateConverter.dateToNumber(endDateStr, true, params);
        }

        prop = new PropertyLayer(propNumber, valueNumber, startDate, endDate);
      }
    }

    return prop;
  }
}