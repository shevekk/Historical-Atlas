/**
 * Class for link frame
 */
class MenuLinkFrame
{
  /**
   * Init the link frame 
   * @param {String}           idHtmlParent           The html id of the element
   * @param {String}           imgUrl                 The url of the image
   * @param {String}           text                   The string of the text
   * @param {String}           linkUrl                The number of the element
   * @param {String}           title                  The string of the title (optional)
   */
    constructor(idHtmlParent, imgUrl, text, linkUrl, title) {
        this.display(idHtmlParent, imgUrl, text, linkUrl, title);
    }

    /**
     * Display frame
     * @param {String}           idHtmlParent           The html id of the element
     * @param {String}           imgUrl                 The url of the image
     * @param {String}           text                   The string of the text
     * @param {String}           linkUrl                The number of the element
     * @param {String}           title                  The string of the title (optional)
     */
    display(idHtmlParent, imgUrl, text, linkUrl, title) {
        if(!title) {
            title = text;
        }

        let content = `<a class='link-frame' href="${linkUrl}" title="${title}" target="_black">
            <img src="${imgUrl}" class="icon-link-frame" />
            <p>${text}</p>
        </a>`;

        $("#" + idHtmlParent).append(content);
    }
}