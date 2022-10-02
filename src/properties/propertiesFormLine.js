class PropertyFormLine
{
  /*
   * Display line of properties 
   * @property {Number}              numValues            Number of lines (including hide line)
   */
  constructor()
  {
    this.numValues = 0;
  }

  /**
   * Display the line
   * @params {Number}              number            The number of the line
   */
  displayLine(prop, number)
  {
    let me = this;

    me.numValues = 0;
    me.number = number;

    let lineContent = ``;

    lineContent += `<div id="propmenu-${number}-line" style="margin-bottom:15px;">`;

    lineContent += `<img id="propmenu-${number}-delete" title="${Dictionary.get('MAP_PROP_FORM_DELETE_LINE_TITLE')}" src="img/menu/source_icons_cancel.svg" class="prop-form-delete-line-button" />`;

    lineContent += `<input id="propmenu-${number}-number" style="display:none" value="${number}"></input>`;
    lineContent += `<input id="propmenu-${number}-name" style="margin-left:10px"></input>`;
    lineContent += `<br/>`;
    lineContent += `<div id="propmenu-${number}-values-content" style="display:inline; margin-left:200px">`;

    lineContent += `</div>`;

    lineContent += `  <button id="propmenu-${number}-add-prop" style="display:block; margin-left:275px; margin-top:5px">${Dictionary.get("MAP_PROP_FORM_ADD_VALUES")}</button>`;

    lineContent += `</div>`;

    $("#propmenu-content").append(lineContent);

    // Add value in form
    $(`#propmenu-${number}-add-prop`).click(function()
    {
      me.numValues ++;
      me.addValue(me.numValues);
    });

    // Delete the line (hide) 
    $(`#propmenu-${number}-delete`).click(function()
    {
      $(`#propmenu-${number}-line`).css("display", "none");
    });

    // Add content from props
    if(prop != null)
    {
      $(`#propmenu-${this.number}-name`).val(prop.name);
      $(`#propmenu-${this.number}-number`).val(prop.number);

      //for(let i = 0; i < prop.values.keys("toto"); i++) {
      for (var i in prop.values)
      {
        this.numValues = i;
        this.addValue(i);

        $(`#propmenu-${this.number}-values-${i}`).val(prop.values[i]);
        $(`#propmenu-${this.number}-color-${i}`).val(prop.colors[i]);
        $(`#propmenu-${this.number}-opacity-${i}`).val(prop.opacity[i]);
      }

      /*
      for(let i = 0; i < prop.values.length; i++)
      {
        this.numValues ++;
        this.addValue(me.numValues);

        $(`#propmenu-${this.number}-values-${this.numValues}`).val(prop.values[i]);
        $(`#propmenu-${this.number}-color-${this.numValues}`).val(prop.colors[i]);
        $(`#propmenu-${this.number}-opacity-${this.numValues}`).val(prop.opacity[i]);
      }
      */
    }
    else
    {
      me.numValues ++;
      me.addValue(me.numValues);
    }
  }

  /**
   * Add a new value
   * @params {Number}              numValues            The number of the value
   */
  addValue(numValues)
  {
    let me = this;
    let marginLeftValue = 30;

    if(numValues != 1)
    {
      marginLeftValue = 230;
    }

    let valueContent = "";
    valueContent += `<div id="propmenu-${me.number}-values-${numValues}-div" style="display:inline-block; margin-left:${marginLeftValue}px">`;

    if(numValues == 1)
    {
      valueContent += `<input title="${Dictionary.get("MAP_PROP_FORM_VALUE_DEFAULT")}" id="propmenu-${me.number}-values-${numValues}"></input>`;
    }  
    else
    {
      valueContent += `<input id="propmenu-${me.number}-values-${numValues}"></input>`;
    }

    valueContent += `<input type="color" id="propmenu-${me.number}-color-${numValues}" style="margin-left:20px">`;
    valueContent += `<input type="range" id="propmenu-${me.number}-opacity-${numValues}" min="0" max="100" style="margin-left:20px">`;

    if(numValues != 1)
    {
      valueContent += `<img id="propmenu-${me.number}-delete-${numValues}" title="${Dictionary.get('MAP_PROP_FORM_DELETE_VALUE_TITLE')}" src="img/menu/source_icons_cancel.svg" class="prop-form-delete-value-button" />`;
    }
    valueContent += `</div>`;

    $(`#propmenu-${me.number}-values-content`).append(valueContent);

    // Delete the value (hide) 
    $(`#propmenu-${me.number}-delete-${numValues}`).click(function()
    {
      $(`#propmenu-${me.number}-values-${numValues}-div`).css("display", "none");
    });
  }

  /* 
   * Check if content of the line is valid
   * @return {Boolean}                         Check if is a valid line
   */
  checkValidLine()
  {
    let valid = true;

    if($(`#propmenu-${this.number}-line`).css("display") != "none")
    {
      if(!$(`#propmenu-${this.number}-name`).val() || $(`#propmenu-${this.number}-name`).val() == "")
      {
        valid = false;
      }

      for(let i = 1; i < this.numValues+1; i++)
      {
        if($(`#propmenu-${this.number}-values-${i}-div`))
        {
          if($(`#propmenu-${this.number}-values-${i}-div`).css("display") && $(`#propmenu-${this.number}-values-${i}-div`).css("display") != "none")
          {
            if(!$(`#propmenu-${this.number}-values-${i}`).val() || $(`#propmenu-${this.number}-values-${i}`).val() == "")
            {
              valid = false;
            }
          }        
        }
      }
    }

    return valid;
  }

  /**
   * Save the content of the line
   * @params {Property}              property            The propertie of the line
   */
  save()
  {
    let property = null;

    if($(`#propmenu-${this.number}-line`).css("display") != "none")
    {
      let name = $(`#propmenu-${this.number}-name`).val();
      let number = $(`#propmenu-${this.number}-number`).val();
      let values = {};
      let colors = {};
      let opacity = {};

      for(let i = 1; i <= this.numValues; i++)
      {
        if($(`#propmenu-${this.number}-values-${i}-div`))
        {
          if($(`#propmenu-${this.number}-values-${i}-div`).css("display") && $(`#propmenu-${this.number}-values-${i}-div`).css("display") != "none")
          {
            values[i] = $(`#propmenu-${this.number}-values-${i}`).val();
            colors[i] = $(`#propmenu-${this.number}-color-${i}`).val();
            opacity[i] = $(`#propmenu-${this.number}-opacity-${i}`).val();
          }
        }
      }

      property = new Property();
      property.init(name, number, this.numValues, values, colors, opacity);
    }

    return property;
  }
}