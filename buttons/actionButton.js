
class ActionButton
{
  /*
   * Base code of button
   * @property {L.Dom}        buttonDom             The button dom
   * @property {L.Dom}        image                 The image of the button
   * @param {L.Dom}           container             The contener element
   * @param {String}          imgSrc                The image src
   * @param {String}          title                 The button title 
   * @param {Function}        functionClick         The function call when button action
   * @param {String}          elType                Type of the button 
   * @param {String}          classCss              Class of the button
   */
  constructor(container, imgSrc, title, functionClick, elType, classCss)
  {
    this.buttonDom = L.DomUtil.create(elType, classCss, container);
    this.buttonDom.title=title;

    if(functionClick)
    {
      L.DomEvent.on(this.buttonDom, 'click', functionClick, this);
    }
    
    if(imgSrc)
    {
      this.image = L.DomUtil.create('img', '', this.buttonDom);
      this.image.src = imgSrc;
      this.image.style = "margin-top : 5px;margin-left:0px;width:20px;height:20px";
    }

    L.DomEvent.addListener(this.buttonDom, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this.buttonDom, 'mousedown', L.DomEvent.stop);
    L.DomEvent.addListener(this.buttonDom, 'mouseup', L.DomEvent.stop);
  }

  /*
   * Change image and title of the button
   * @param {String}          imgSrc                The image src
   * @param {String}          title                 The button title
   */
  changeImageAndTitle(imgSrc, title)
  {
    this.image.src = imgSrc;
    this.buttonDom.title=title;
  }

  /*
   * Set the value of the button
   * @param {String}          value                The value
   */
  setValue(value)
  {
    this.buttonDom.value = value;
  }

  /*
   * Change the selected state
   * @param {Boolean}          state                The state
   */
  setSelectedState(state)
  {
    if(state)
    {
      this.image.style['background-color'] = "#bbbbbb";
      this.buttonDom.style['background-color'] = "#bbbbbb";
    }
    else
    {
      this.image.style['background-color'] = "#ffffff";
      this.buttonDom.style['background-color'] = "#ffffff";
    }
  }
}