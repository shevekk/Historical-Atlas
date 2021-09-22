
class ActionButtonSimple extends ActionButton
{
  /*
   * Simple Button
   * @param {L.Dom}           container             The contener element
   * @param {String}          imgSrc                The image src
   * @param {String}          title                 The button title 
   * @param {Function}        functionClick         The function call when button action
   */
  constructor(container, imgSrc, title, functionClick)
  {
    super(container, imgSrc, title, functionClick, 'a', 'action-button');
  }
}