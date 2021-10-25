
class ActionButtonColor extends ActionButton
{
  /*
   * Color button
   * @param {L.Dom}           container             The contener element
   * @param {String}          title                 The button title 
   * @param {Function}        functionClick         The function call when button action
   * @param {Function}        functionChange        The function call when change color
   */
  constructor(container, title, functionClick, functionChange)
  {
    super(container, "", title, functionClick, 'input', 'action-button-color');

    this.buttonDom.type="color";
    L.DomEvent.on(this.buttonDom, 'input change', functionChange, this);
  }
}