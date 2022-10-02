class Property
{
  /*
   * Model of a property
   * @property {String}                 name              The property name
   * @property {String[]}               values            The values array
   * @property {String[]}               colors            The colors array
   * @property {Number[]}               opacity           The opacity array
   * @property {Number}                 number            The number
   * @property {Number}                 nbValues          The number of values (values content max key)
   */
  constructor()
  {
    this.name = "";
    this.values = {};
    this.color = {};
    this.opacity = {};
    this.number = 0;
    this.nbValues = 0;
  }

  /*
   * Init the property
   * @param {String}                 name              The property name
   * @param {Number}                 number            The number
   * @param {String[]}               values            The values array
   * @param {String[]}               colors            The colors array
   * @param {Number[]}               opacity           The opacity array
   */
  init(name, number, nbValues, values, colors, opacity)
  {
    this.name = name;
    this.number = parseInt(number);
    this.nbValues = parseInt(nbValues);
    this.values = values;
    this.colors = colors;
    this.opacity = opacity;
  }

  /*
   * Modify polygons options
   * @param {Object}                 polygonOptions         Polygons options to modify
   * @param {Number}                 valueNumber            The number value (ket of the color and opacity)
   */
  modifyPolygonOptions(polygonOptions, valueNumber)
  {
    polygonOptions.fillColor = this.colors[valueNumber];
    polygonOptions.color = this.colors[valueNumber];
    polygonOptions.fillOpacity = parseInt(this.opacity[valueNumber]) / 100;
    polygonOptions.weight = 1;
  }

  /*
   * Export properties data to json
   * @param {Object}               content                   Content Object
   * @return {Object}                                        Content with property data
   */
  toJson(content)
  {
    content.properties.push({});
    content.properties[content.properties.length - 1]['name'] = this.name;
    content.properties[content.properties.length - 1]['number'] = this.number;
    content.properties[content.properties.length - 1]['nbValues'] = this.nbValues;
    content.properties[content.properties.length - 1]['values'] = this.values;
    content.properties[content.properties.length - 1]['colors'] = this.colors;
    content.properties[content.properties.length - 1]['opacity'] = this.opacity;

    return content;
  }

  /*
   * Init property from json object content
   * @param {Object}               contentObj                   Properties data
   */
  fromJson(contentProp)
  {
    this.name = contentProp["name"];
    this.number = contentProp["number"];
    this.nbValues = contentProp["nbValues"];
    this.values = contentProp["values"];
    this.colors = contentProp["colors"];
    this.opacity = contentProp["opacity"];
  }
}