class DescriptionManager
{
  /*
   *
   * @property {Params}              params                 The params
   * @property {Dialog}              dialog                 The jquery dialog div
   * @property {String}              lang                   The lang saved value
   * @property {String}              type                   The type saved value
   * @property {String}              description            The description saved value
   */
  constructor(params) {
		let me = this;

		me.params = params;

		this.lang = null;
		this.type = null;
		this.description = "";

		let height = 640;
		let width = 740;
		if($(window).width() < 800 || $(window).height() < 800) {
			height = 340;
		  width = 440;
    }

		me.dialog = $("#dialog-description").dialog({
		  autoOpen: false,
		  height: height,
		  width: width,
		  modal: true,
		  buttons: {
			Cancel: function() {
				if(me.params.editMode) {
			  	me.initFormValues();
			  }
			  me.dialog.dialog("close");
			},
			OK: function() {
			  me.saveDescription();
			  me.description = me.params.description;
			  me.dialog.dialog("close");
			}
		  }
		});
  }

  /*
   * Display
   */
  display() {
		this.dialog.dialog("open");
  }

  /*
   * Update content depending on the edition param
   * @param {Object}              mapData                 The data of the map
   */
  updateContent(mapData) {
		let me = this;
		if(!me.params.editMode) {
			let html = `<h2>${mapData.name}</h2>
			<p>
				<b>${mapData.views} <span id="map-desc-view-number-label">${Dictionary.get("MAP_DESC_VIEWS_NUMBER")}</span>,
				<span id="map-desc-lang-label">${Dictionary.get("MAP_DESC_LANG_CHOISE")}</span> ${mapData.lang},
				<span id="map-desc-type-label">${Dictionary.get("MAP_DESC_TYPE")}</span> ${Dictionary.get("MAP_TYPE_"+mapData.type.toUpperCase())}</b>
			</p>
			<p>${mapData.data ? JSON.parse(mapData.data).params["description"] : ""}</p>`;

			$("#dialog-description").html(html);
		}
		else {
			me.lang = mapData.lang;
			me.type = mapData.type;
			me.description = mapData.data ? JSON.parse(mapData.data).params["description"] : "";

			let html = `<h2>${mapData.name}</h2>

			<div id="description">Description :
				<div id="description-text">${me.description.replaceAll("<br/>\n", "\n")}</div>
				<img id="img-description-edit" src="img/menu/edit-solid.svg" width="20px" />
				<button style="display:none" id="sav-description">Ok</button>
			</div><br/><br/>

			<div id="language-choise">
				<text id="language-choise-text">${Dictionary.get("MAP_DESC_LANG_CHOISE")}</text>

				<input type="radio" id="map-lang-en" name="map-lang" value="en">
				<label for="map-lang-en">EN</label>

				<input type="radio" id="map-lang-fr" name="map-lang" value="fr">
				<label for="map-lang-fr">FR</label>
			</div>

			<div id="type-map-choise">
				<text id="type-map-choise-text">${Dictionary.get("MAP_TYPE_TEXT")}</text>

				<input type="radio" id="type-map-choise-history" name="type-map-choise" value="history" checked="true">
				<label for="type-map-choise-history" id="type-map-choise-history-label">${Dictionary.get("MAP_TYPE_HISTORY")}</label>

				<input type="radio" id="type-map-choise-uchrony" name="type-map-choise" value="uchrony">
				<label for="type-map-choise-uchrony" id="type-map-choise-uchrony-label">${Dictionary.get("MAP_TYPE_UCHRONY")}</label>

				<input type="radio" id="type-map-choise-present" name="type-map-choise" value="present">
				<label for="type-map-choise-present" id="type-map-choise-present-label">${Dictionary.get("MAP_TYPE_PRESENT")}</label>
	    </div>`;

			$("#dialog-description").html(html);

			// Manage edit
			$("#img-description-edit").click(function() {

				$("#description-text").html(`<textarea id="text-area-description">${me.description.replaceAll("<br/>\n", "\n")}</textarea>`);
				$("#img-description-edit").css("visibility", "hidden");
				$("#sav-description").css("display", "inline");

				$("#sav-description").click(function() {
					me.saveDescription();
				});
			});

			$('#map-lang-' + mapData.lang).prop("checked", true);
			$('#type-map-choise-' + mapData.type).prop("checked", true);
		}
  }

  /*
   * Reinit value for close
   */
  initFormValues() {
	  $('#map-lang-' + this.lang).prop("checked", true);
	  $('#type-map-choise-' + this.type).prop("checked", true);

	  this.params.description = this.description;
	  $("#description-text").html(this.description.replaceAll("<br/>\n", "\n"));
	  $("#text-area-description").html(this.description.replaceAll("<br/>\n", "\n"));

	  $("#img-description-edit").css("visibility", "visible");
	  $("#sav-description").css("display", "none");
  }

  /*
   * Save the description (ok button)
   */
  saveDescription() {

		if($("#text-area-description").length > 0) {
			this.params.description = $("#text-area-description").val().replaceAll("\n", "<br/>\n");
		}

		$("#description-text").html(this.params.description);
		$("#img-description-edit").css("visibility", "visible");
		$("#sav-description").css("display", "none");
  }

  /*
   * Change lang of the UI
   */
  changeLang() {
		$("#map-desc-view-number-label").html(Dictionary.get("MAP_DESC_VIEWS_NUMBER"));
		$("#map-desc-lang-label").html(Dictionary.get("MAP_DESC_LANG_CHOISE"));

		$("#type-map-choise-history-label").html(Dictionary.get("MAP_TYPE_HISTORY"));
	    $("#type-map-choise-uchrony-label").html(Dictionary.get("MAP_TYPE_UCHRONY"));
	    $("#type-map-choise-present-label").html(Dictionary.get("MAP_TYPE_PRESENT"));
	    $("#type-map-choise-text").html(Dictionary.get("MAP_TYPE_TEXT"));
		$("#language-choise-text").html(Dictionary.get("MAP_DESC_LANG_CHOISE"));

  }
}


