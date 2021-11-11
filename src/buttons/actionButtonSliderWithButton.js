
class ActionButtonSliderWithButton extends ActionButtonSlider
{
  /*
   * Button of manage Slider with an Ok button
   * @property {L.Dom}             cursor                Cursor component (input slider)
   * @property {L.Dom}             _menu                 The menu div of choose file
   * @param {L.Dom}                container             The contener element
   * @param {String}               imgSrc                The image src
   * @param {String}               title                 The button title 
   * @param {Function}             functionOk            The function call when ok is clicked
   * @param {Number}               minValue              Min value of the slider
   * @param {Number}               maxValue              Max value of the slider
   * @param {Number}               value                 Default value of the slider
   * @param {PaintLayer}           paintParams           The paint parameters
   */
  constructor(container, imgSrc, title, functionOk, minValue, maxValue, value, paintParams)
  {
    super(container, imgSrc, title, function() { }, minValue, maxValue, value, paintParams);

    var buttonSave = L.DomUtil.create('button', 'action-button-ok-slider', this.menuContent);
    buttonSave.type = "text";
    buttonSave.innerHTML = "Ok";
    
    L.DomEvent.on(buttonSave, 'click', function() { functionOk(this.cursor.value) } , this);
  }
}