
class ActionButtonConnexionState
{
  /*
   * Bouton display of a user is connected
   * @param {L.Dom}           container             The contener element
   * @property {L.Dom}        buttonDom             The button dom
   * @property {L.Dom}        image                 The image of the button
   */
  constructor(container)
  {
    this.buttonDom = L.DomUtil.create("a", "button-logged", container);

    this.image = L.DomUtil.create('img', '', this.buttonDom);
    this.image.style = "margin-top : 5px;margin-left:0px;width:20px;height:20px";

    L.DomEvent.addListener(this.buttonDom, 'dblclick', L.DomEvent.stop);
    L.DomEvent.addListener(this.buttonDom, 'mousedown', L.DomEvent.stop);
    L.DomEvent.addListener(this.buttonDom, 'mouseup', L.DomEvent.stop);
  }

  /*
   * Change the logged state
   * @param {Boolean}          state                The state
   */
  setLoggedState(state)
  {
    if(state)
    {
      this.buttonDom.style['background-color'] = "#ADE196";
      this.image.src = "img/actions/circle_green.png";
      this.buttonDom.title="Connecté, en tant que " + localStorage.getItem('session-id-histoatlas');
    }
    else
    {
      this.buttonDom.style['background-color'] = "#FD9CA1";
      this.image.src = "img/actions/circle_red.png";
      this.buttonDom.title="Non connecté, retourné au menu pour vous connecté et pouvoir sauvegarder ";
    }
  }

  /*
   * Hide the button
   */
  hide()
  {
    this.buttonDom.style['display'] = "none";
  }

  /*
   * Show the button
   */
  show()
  {
    this.buttonDom.style['display'] = "block";
  }
}