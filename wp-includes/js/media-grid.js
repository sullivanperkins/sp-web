(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/edit-attachment-metadata.js":[function(require,module,exports){
/**
 * wp.media.controller.EditAttachmentMetadata
 *
 * A state for editing an attachment's metadata.
 *
 * @class
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 */
var l10n = wp.media.view.l10n,
	EditAttachmentMetadata;

EditAttachmentMetadata = wp.media.controller.State.extend({
	defaults: {
		id:      'edit-attachment',
		// Title string passed to the frame's title region view.
		title:   l10n.attachmentDetails,
		// Region mode defaults.
		content: 'edit-metadata',
		menu:    false,
		toolbar: false,
		router:  false
	}
});

module.exports = EditAttachmentMetadata;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/grid.manifest.js":[function(require,module,exports){
var media = wp.media;

media.controller.EditAttachmentMetadata = require( './controllers/edit-attachment-metadata.js' );
media.view.MediaFrame.Manage = require( './views/frame/manage.js' );
media.view.Attachment.Details.TwoColumn = require( './views/attachment/details-two-column.js' );
media.view.MediaFrame.Manage.Router = require( './routers/manage.js' );
media.view.EditImage.Details = require( './views/edit-image-details.js' );
media.view.MediaFrame.EditAttachments = require( './views/frame/edit-attachments.js' );
media.view.SelectModeToggleButton = require( './views/button/select-mode-toggle.js' );
media.view.DeleteSelectedButton = require( './views/button/delete-selected.js' );
media.view.DeleteSelectedPermanentlyButton = require( './views/button/delete-selected-permanently.js' );

},{"./controllers/edit-attachment-metadata.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/edit-attachment-metadata.js","./routers/manage.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/routers/manage.js","./views/attachment/details-two-column.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment/details-two-column.js","./views/button/delete-selected-permanently.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/button/delete-selected-permanently.js","./views/button/delete-selected.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/button/delete-selected.js","./views/button/select-mode-toggle.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/button/select-mode-toggle.js","./views/edit-image-details.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/edit-image-details.js","./views/frame/edit-attachments.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/frame/edit-attachments.js","./views/frame/manage.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/frame/manage.js"}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/routers/manage.js":[function(require,module,exports){
/**
 * wp.media.view.MediaFrame.Manage.Router
 *
 * A router for handling the browser history and application state.
 *
 * @class
 * @augments Backbone.Router
 */
var Router = Backbone.Router.extend({
	routes: {
		'upload.php?item=:slug':    'showItem',
		'upload.php?search=:query': 'search'
	},

	// Map routes against the page URL
	baseUrl: function( url ) {
		return 'upload.php' + url;
	},

	// Respond to the search route by filling the search field and trigggering the input event
	search: function( query ) {
		jQuery( '#media-search-input' ).val( query ).trigger( 'input' );
	},

	// Show the modal with a specific item
	showItem: function( query ) {
		var media = wp.media,
			library = media.frame.state().get('library'),
			item;

		// Trigger the media frame to open the correct item
		item = library.findWhere( { id: parseInt( query, 10 ) } );
		if ( item ) {
			media.frame.trigger( 'edit:attachment', item );
		} else {
			item = media.attachment( query );
			media.frame.listenTo( item, 'change', function( model ) {
				media.frame.stopListening( item );
				media.frame.trigger( 'edit:attachment', model );
			} );
			item.fetch();
		}
	}
});

module.exports = Router;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment/details-two-column.js":[function(require,module,exports){
/**
 * wp.media.view.Attachment.Details.TwoColumn
 *
 * A similar view to media.view.Attachment.Details
 * for use in the Edit Attachment modal.
 *
 * @class
 * @augments wp.media.view.Attachment.Details
 * @augments wp.media.view.Attachment
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Details = wp.media.view.Attachment.Details,
	TwoColumn;

TwoColumn = Details.extend({
	template: wp.template( 'attachment-details-two-column' ),

	editAttachment: function( event ) {
		event.preventDefault();
		this.controller.content.mode( 'edit-image' );
	},

	/**
	 * Noop this from parent class, doesn't apply here.
	 */
	toggleSelectionHandler: function() {},

	render: function() {
		Details.prototype.render.apply( this, arguments );

		wp.media.mixin.removeAllPlayers();
		this.$( 'audio, video' ).each( function (i, elem) {
			var el = wp.media.view.MediaDetails.prepareSrc( elem );
			new window.MediaElementPlayer( el, wp.media.mixin.mejsSettings );
		} );
	}
});

module.exports = TwoColumn;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/button/delete-selected-permanently.js":[function(require,module,exports){
/**
 * wp.media.view.DeleteSelectedPermanentlyButton
 *
 * When MEDIA_TRASH is true, a button that handles bulk Delete Permanently logic
 *
 * @class
 * @augments wp.media.view.DeleteSelectedButton
 * @augments wp.media.view.Button
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Button = wp.media.view.Button,
	DeleteSelected = wp.media.view.DeleteSelectedButton,
	DeleteSelectedPermanently;

DeleteSelectedPermanently = DeleteSelected.extend({
	initialize: function() {
		DeleteSelected.prototype.initialize.apply( this, arguments );
		this.listenTo( this.controller, 'select:activate', this.selectActivate );
		this.listenTo( this.controller, 'select:deactivate', this.selectDeactivate );
	},

	filterChange: function( model ) {
		this.canShow = ( 'trash' === model.get( 'status' ) );
	},

	selectActivate: function() {
		this.toggleDisabled();
		this.$el.toggleClass( 'hidden', ! this.canShow );
	},

	selectDeactivate: function() {
		this.toggleDisabled();
		this.$el.addClass( 'hidden' );
	},

	render: function() {
		Button.prototype.render.apply( this, arguments );
		this.selectActivate();
		return this;
	}
});

module.exports = DeleteSelectedPermanently;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/button/delete-selected.js":[function(require,module,exports){
/**
 * wp.media.view.DeleteSelectedButton
 *
 * A button that handles bulk Delete/Trash logic
 *
 * @class
 * @augments wp.media.view.Button
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Button = wp.media.view.Button,
	l10n = wp.media.view.l10n,
	DeleteSelected;

DeleteSelected = Button.extend({
	initialize: function() {
		Button.prototype.initialize.apply( this, arguments );
		if ( this.options.filters ) {
			this.listenTo( this.options.filters.model, 'change', this.filterChange );
		}
		this.listenTo( this.controller, 'selection:toggle', this.toggleDisabled );
	},

	filterChange: function( model ) {
		if ( 'trash' === model.get( 'status' ) ) {
			this.model.set( 'text', l10n.untrashSelected );
		} else if ( wp.media.view.settings.mediaTrash ) {
			this.model.set( 'text', l10n.trashSelected );
		} else {
			this.model.set( 'text', l10n.deleteSelected );
		}
	},

	toggleDisabled: function() {
		this.model.set( 'disabled', ! this.controller.state().get( 'selection' ).length );
	},

	render: function() {
		Button.prototype.render.apply( this, arguments );
		if ( this.controller.isModeActive( 'select' ) ) {
			this.$el.addClass( 'delete-selected-button' );
		} else {
			this.$el.addClass( 'delete-selected-button hidden' );
		}
		this.toggleDisabled();
		return this;
	}
});

module.exports = DeleteSelected;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/button/select-mode-toggle.js":[function(require,module,exports){
/**
 * wp.media.view.SelectModeToggleButton
 *
 * @class
 * @augments wp.media.view.Button
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Button = wp.media.view.Button,
	l10n = wp.media.view.l10n,
	SelectModeToggle;

SelectModeToggle = Button.extend({
	initialize: function() {
		_.defaults( this.options, {
			size : ''
		} );

		Button.prototype.initialize.apply( this, arguments );
		this.listenTo( this.controller, 'select:activate select:deactivate', this.toggleBulkEditHandler );
		this.listenTo( this.controller, 'selection:action:done', this.back );
	},

	back: function () {
		this.controller.deactivateMode( 'select' ).activateMode( 'edit' );
	},

	click: function() {
		Button.prototype.click.apply( this, arguments );
		if ( this.controller.isModeActive( 'select' ) ) {
			this.back();
		} else {
			this.controller.deactivateMode( 'edit' ).activateMode( 'select' );
		}
	},

	render: function() {
		Button.prototype.render.apply( this, arguments );
		this.$el.addClass( 'select-mode-toggle-button' );
		return this;
	},

	toggleBulkEditHandler: function() {
		var toolbar = this.controller.content.get().toolbar, children;

		children = toolbar.$( '.media-toolbar-secondary > *, .media-toolbar-primary > *' );

		// TODO: the Frame should be doing all of this.
		if ( this.controller.isModeActive( 'select' ) ) {
			this.model.set( {
				size: 'large',
				text: l10n.cancelSelection
			} );
			children.not( '.spinner, .media-button' ).hide();
			this.$el.show();
			toolbar.$( '.delete-selected-button' ).removeClass( 'hidden' );
		} else {
			this.model.set( {
				size: '',
				text: l10n.bulkSelect
			} );
			this.controller.content.get().$el.removeClass( 'fixed' );
			toolbar.$el.css( 'width', '' );
			toolbar.$( '.delete-selected-button' ).addClass( 'hidden' );
			children.not( '.media-button' ).show();
			this.controller.state().get( 'selection' ).reset();
		}
	}
});

module.exports = SelectModeToggle;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/edit-image-details.js":[function(require,module,exports){
/**
 * wp.media.view.EditImage.Details
 *
 * @class
 * @augments wp.media.view.EditImage
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	EditImage = wp.media.view.EditImage,
	Details;

Details = EditImage.extend({
	initialize: function( options ) {
		this.editor = window.imageEdit;
		this.frame = options.frame;
		this.controller = options.controller;
		View.prototype.initialize.apply( this, arguments );
	},

	back: function() {
		this.frame.content.mode( 'edit-metadata' );
	},

	save: function() {
		this.model.fetch().done( _.bind( function() {
			this.frame.content.mode( 'edit-metadata' );
		}, this ) );
	}
});

module.exports = Details;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/frame/edit-attachments.js":[function(require,module,exports){
/**
 * wp.media.view.MediaFrame.EditAttachments
 *
 * A frame for editing the details of a specific media item.
 *
 * Opens in a modal by default.
 *
 * Requires an attachment model to be passed in the options hash under `model`.
 *
 * @class
 * @augments wp.media.view.Frame
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 * @mixes wp.media.controller.StateMachine
 */
var Frame = wp.media.view.Frame,
	MediaFrame = wp.media.view.MediaFrame,

	$ = jQuery,
	EditAttachments;

EditAttachments = MediaFrame.extend({

	className: 'edit-attachment-frame',
	template:  wp.template( 'edit-attachment-frame' ),
	regions:   [ 'title', 'content' ],

	events: {
		'click .left':  'previousMediaItem',
		'click .right': 'nextMediaItem'
	},

	initialize: function() {
		Frame.prototype.initialize.apply( this, arguments );

		_.defaults( this.options, {
			modal: true,
			state: 'edit-attachment'
		});

		this.controller = this.options.controller;
		this.gridRouter = this.controller.gridRouter;
		this.library = this.options.library;

		if ( this.options.model ) {
			this.model = this.options.model;
		}

		this.bindHandlers();
		this.createStates();
		this.createModal();

		this.title.mode( 'default' );
		this.toggleNav();
	},

	bindHandlers: function() {
		// Bind default title creation.
		this.on( 'title:create:default', this.createTitle, this );

		// Close the modal if the attachment is deleted.
		this.listenTo( this.model, 'change:status destroy', this.close, this );

		this.on( 'content:create:edit-metadata', this.editMetadataMode, this );
		this.on( 'content:create:edit-image', this.editImageMode, this );
		this.on( 'content:render:edit-image', this.editImageModeRender, this );
		this.on( 'close', this.detach );
	},

	createModal: function() {
		// Initialize modal container view.
		if ( this.options.modal ) {
			this.modal = new wp.media.view.Modal({
				controller: this,
				title:      this.options.title
			});

			this.modal.on( 'open', _.bind( function () {
				$( 'body' ).on( 'keydown.media-modal', _.bind( this.keyEvent, this ) );
			}, this ) );

			// Completely destroy the modal DOM element when closing it.
			this.modal.on( 'close', _.bind( function() {
				this.modal.remove();
				$( 'body' ).off( 'keydown.media-modal' ); /* remove the keydown event */
				// Restore the original focus item if possible
				$( 'li.attachment[data-id="' + this.model.get( 'id' ) +'"]' ).focus();
				this.resetRoute();
			}, this ) );

			// Set this frame as the modal's content.
			this.modal.content( this );
			this.modal.open();
		}
	},

	/**
	 * Add the default states to the frame.
	 */
	createStates: function() {
		this.states.add([
			new wp.media.controller.EditAttachmentMetadata( { model: this.model } )
		]);
	},

	/**
	 * Content region rendering callback for the `edit-metadata` mode.
	 *
	 * @param {Object} contentRegion Basic object with a `view` property, which
	 *                               should be set with the proper region view.
	 */
	editMetadataMode: function( contentRegion ) {
		contentRegion.view = new wp.media.view.Attachment.Details.TwoColumn({
			controller: this,
			model:      this.model
		});

		/**
		 * Attach a subview to display fields added via the
		 * `attachment_fields_to_edit` filter.
		 */
		contentRegion.view.views.set( '.attachment-compat', new wp.media.view.AttachmentCompat({
			controller: this,
			model:      this.model
		}) );

		// Update browser url when navigating media details
		if ( this.model ) {
			this.gridRouter.navigate( this.gridRouter.baseUrl( '?item=' + this.model.id ) );
		}
	},

	/**
	 * Render the EditImage view into the frame's content region.
	 *
	 * @param {Object} contentRegion Basic object with a `view` property, which
	 *                               should be set with the proper region view.
	 */
	editImageMode: function( contentRegion ) {
		var editImageController = new wp.media.controller.EditImage( {
			model: this.model,
			frame: this
		} );
		// Noop some methods.
		editImageController._toolbar = function() {};
		editImageController._router = function() {};
		editImageController._menu = function() {};

		contentRegion.view = new wp.media.view.EditImage.Details( {
			model: this.model,
			frame: this,
			controller: editImageController
		} );
	},

	editImageModeRender: function( view ) {
		view.on( 'ready', view.loadEditor );
	},

	toggleNav: function() {
		this.$('.left').toggleClass( 'disabled', ! this.hasPrevious() );
		this.$('.right').toggleClass( 'disabled', ! this.hasNext() );
	},

	/**
	 * Rerender the view.
	 */
	rerender: function() {
		// Only rerender the `content` region.
		if ( this.content.mode() !== 'edit-metadata' ) {
			this.content.mode( 'edit-metadata' );
		} else {
			this.content.render();
		}

		this.toggleNav();
	},

	/**
	 * Click handler to switch to the previous media item.
	 */
	previousMediaItem: function() {
		if ( ! this.hasPrevious() ) {
			this.$( '.left' ).blur();
			return;
		}
		this.model = this.library.at( this.getCurrentIndex() - 1 );
		this.rerender();
		this.$( '.left' ).focus();
	},

	/**
	 * Click handler to switch to the next media item.
	 */
	nextMediaItem: function() {
		if ( ! this.hasNext() ) {
			this.$( '.right' ).blur();
			return;
		}
		this.model = this.library.at( this.getCurrentIndex() + 1 );
		this.rerender();
		this.$( '.right' ).focus();
	},

	getCurrentIndex: function() {
		return this.library.indexOf( this.model );
	},

	hasNext: function() {
		return ( this.getCurrentIndex() + 1 ) < this.library.length;
	},

	hasPrevious: function() {
		return ( this.getCurrentIndex() - 1 ) > -1;
	},
	/**
	 * Respond to the keyboard events: right arrow, left arrow, except when
	 * focus is in a textarea or input field.
	 */
	keyEvent: function( event ) {
		if ( ( 'INPUT' === event.target.nodeName || 'TEXTAREA' === event.target.nodeName ) && ! ( event.target.readOnly || event.target.disabled ) ) {
			return;
		}

		// The right arrow key
		if ( 39 === event.keyCode ) {
			this.nextMediaItem();
		}
		// The left arrow key
		if ( 37 === event.keyCode ) {
			this.previousMediaItem();
		}
	},

	resetRoute: function() {
		this.gridRouter.navigate( this.gridRouter.baseUrl( '' ) );
	}
});

module.exports = EditAttachments;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/frame/manage.js":[function(require,module,exports){
/**
 * wp.media.view.MediaFrame.Manage
 *
 * A generic management frame workflow.
 *
 * Used in the media grid view.
 *
 * @class
 * @augments wp.media.view.MediaFrame
 * @augments wp.media.view.Frame
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 * @mixes wp.media.controller.StateMachine
 */
var MediaFrame = wp.media.view.MediaFrame,
	Library = wp.media.controller.Library,

	$ = Backbone.$,
	Manage;

Manage = MediaFrame.extend({
	/**
	 * @global wp.Uploader
	 */
	initialize: function() {
		_.defaults( this.options, {
			title:     '',
			modal:     false,
			selection: [],
			library:   {}, // Options hash for the query to the media library.
			multiple:  'add',
			state:     'library',
			uploader:  true,
			mode:      [ 'grid', 'edit' ]
		});

		this.$body = $( document.body );
		this.$window = $( window );
		this.$adminBar = $( '#wpadminbar' );
		this.$window.on( 'scroll resize', _.debounce( _.bind( this.fixPosition, this ), 15 ) );
		$( document ).on( 'click', '.page-title-action', _.bind( this.addNewClickHandler, this ) );

		// Ensure core and media grid view UI is enabled.
		this.$el.addClass('wp-core-ui');

		// Force the uploader off if the upload limit has been exceeded or
		// if the browser isn't supported.
		if ( wp.Uploader.limitExceeded || ! wp.Uploader.browser.supported ) {
			this.options.uploader = false;
		}

		// Initialize a window-wide uploader.
		if ( this.options.uploader ) {
			this.uploader = new wp.media.view.UploaderWindow({
				controller: this,
				uploader: {
					dropzone:  document.body,
					container: document.body
				}
			}).render();
			this.uploader.ready();
			$('body').append( this.uploader.el );

			this.options.uploader = false;
		}

		this.gridRouter = new wp.media.view.MediaFrame.Manage.Router();

		// Call 'initialize' directly on the parent class.
		MediaFrame.prototype.initialize.apply( this, arguments );

		// Append the frame view directly the supplied container.
		this.$el.appendTo( this.options.container );

		this.createStates();
		this.bindRegionModeHandlers();
		this.render();
		this.bindSearchHandler();
	},

	bindSearchHandler: function() {
		var search = this.$( '#media-search-input' ),
			currentSearch = this.options.container.data( 'search' ),
			searchView = this.browserView.toolbar.get( 'search' ).$el,
			listMode = this.$( '.view-list' ),

			input  = _.debounce( function (e) {
				var val = $( e.currentTarget ).val(),
					url = '';

				if ( val ) {
					url += '?search=' + val;
				}
				this.gridRouter.navigate( this.gridRouter.baseUrl( url ) );
			}, 1000 );

		// Update the URL when entering search string (at most once per second)
		search.on( 'input', _.bind( input, this ) );
		searchView.val( currentSearch ).trigger( 'input' );

		this.gridRouter.on( 'route:search', function () {
			var href = window.location.href;
			if ( href.indexOf( 'mode=' ) > -1 ) {
				href = href.replace( /mode=[^&]+/g, 'mode=list' );
			} else {
				href += href.indexOf( '?' ) > -1 ? '&mode=list' : '?mode=list';
			}
			href = href.replace( 'search=', 's=' );
			listMode.prop( 'href', href );
		} );
	},

	/**
	 * Create the default states for the frame.
	 */
	createStates: function() {
		var options = this.options;

		if ( this.options.states ) {
			return;
		}

		// Add the default states.
		this.states.add([
			new Library({
				library:            wp.media.query( options.library ),
				multiple:           options.multiple,
				title:              options.title,
				content:            'browse',
				toolbar:            'select',
				contentUserSetting: false,
				filterable:         'all',
				autoSelect:         false
			})
		]);
	},

	/**
	 * Bind region mode activation events to proper handlers.
	 */
	bindRegionModeHandlers: function() {
		this.on( 'content:create:browse', this.browseContent, this );

		// Handle a frame-level event for editing an attachment.
		this.on( 'edit:attachment', this.openEditAttachmentModal, this );

		this.on( 'select:activate', this.bindKeydown, this );
		this.on( 'select:deactivate', this.unbindKeydown, this );
	},

	handleKeydown: function( e ) {
		if ( 27 === e.which ) {
			e.preventDefault();
			this.deactivateMode( 'select' ).activateMode( 'edit' );
		}
	},

	bindKeydown: function() {
		this.$body.on( 'keydown.select', _.bind( this.handleKeydown, this ) );
	},

	unbindKeydown: function() {
		this.$body.off( 'keydown.select' );
	},

	fixPosition: function() {
		var $browser, $toolbar;
		if ( ! this.isModeActive( 'select' ) ) {
			return;
		}

		$browser = this.$('.attachments-browser');
		$toolbar = $browser.find('.media-toolbar');

		// Offset doesn't appear to take top margin into account, hence +16
		if ( ( $browser.offset().top + 16 ) < this.$window.scrollTop() + this.$adminBar.height() ) {
			$browser.addClass( 'fixed' );
			$toolbar.css('width', $browser.width() + 'px');
		} else {
			$browser.removeClass( 'fixed' );
			$toolbar.css('width', '');
		}
	},

	/**
	 * Click handler for the `Add New` button.
	 */
	addNewClickHandler: function( event ) {
		event.preventDefault();
		this.trigger( 'toggle:upload:attachment' );
	},

	/**
	 * Open the Edit Attachment modal.
	 */
	openEditAttachmentModal: function( model ) {
		// Create a new EditAttachment frame, passing along the library and the attachment model.
		wp.media( {
			frame:       'edit-attachments',
			controller:  this,
			library:     this.state().get('library'),
			model:       model
		} );
	},

	/**
	 * Create an attachments browser view within the content region.
	 *
	 * @param {Object} contentRegion Basic object with a `view` property, which
	 *                               should be set with the proper region view.
	 * @this wp.media.controller.Region
	 */
	browseContent: function( contentRegion ) {
		var state = this.state();

		// Browse our library of attachments.
		this.browserView = contentRegion.view = new wp.media.view.AttachmentsBrowser({
			controller: this,
			collection: state.get('library'),
			selection:  state.get('selection'),
			model:      state,
			sortable:   state.get('sortable'),
			search:     state.get('searchable'),
			filters:    state.get('filterable'),
			date:       state.get('date'),
			display:    state.get('displaySettings'),
			dragInfo:   state.get('dragInfo'),
			sidebar:    'errors',

			suggestedWidth:  state.get('suggestedWidth'),
			suggestedHeight: state.get('suggestedHeight'),

			AttachmentView: state.get('AttachmentView'),

			scrollElement: document
		});
		this.browserView.on( 'ready', _.bind( this.bindDeferred, this ) );

		this.errors = wp.Uploader.errors;
		this.errors.on( 'add remove reset', this.sidebarVisibility, this );
	},

	sidebarVisibility: function() {
		this.browserView.$( '.media-sidebar' ).toggle( !! this.errors.length );
	},

	bindDeferred: function() {
		if ( ! this.browserView.dfd ) {
			return;
		}
		this.browserView.dfd.done( _.bind( this.startHistory, this ) );
	},

	startHistory: function() {
		// Verify pushState support and activate
		if ( window.history && window.history.pushState ) {
			Backbone.history.start( {
				root: window._wpMediaGridSettings.adminUrl,
				pushState: true
			} );
		}
	}
});

module.exports = Manage;

},{}]},{},["/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/grid.manifest.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvZWRpdC1hdHRhY2htZW50LW1ldGFkYXRhLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL2dyaWQubWFuaWZlc3QuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvcm91dGVycy9tYW5hZ2UuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudC9kZXRhaWxzLXR3by1jb2x1bW4uanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYnV0dG9uL2RlbGV0ZS1zZWxlY3RlZC1wZXJtYW5lbnRseS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9idXR0b24vZGVsZXRlLXNlbGVjdGVkLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL2J1dHRvbi9zZWxlY3QtbW9kZS10b2dnbGUuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvZWRpdC1pbWFnZS1kZXRhaWxzLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL2ZyYW1lL2VkaXQtYXR0YWNobWVudHMuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvZnJhbWUvbWFuYWdlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25QQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIHdwICovXG5cbi8qKlxuICogd3AubWVkaWEuY29udHJvbGxlci5FZGl0QXR0YWNobWVudE1ldGFkYXRhXG4gKlxuICogQSBzdGF0ZSBmb3IgZWRpdGluZyBhbiBhdHRhY2htZW50J3MgbWV0YWRhdGEuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZVxuICogQGF1Z21lbnRzIEJhY2tib25lLk1vZGVsXG4gKi9cbnZhciBsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHRFZGl0QXR0YWNobWVudE1ldGFkYXRhO1xuXG5FZGl0QXR0YWNobWVudE1ldGFkYXRhID0gd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZS5leHRlbmQoe1xuXHRkZWZhdWx0czoge1xuXHRcdGlkOiAgICAgICdlZGl0LWF0dGFjaG1lbnQnLFxuXHRcdC8vIFRpdGxlIHN0cmluZyBwYXNzZWQgdG8gdGhlIGZyYW1lJ3MgdGl0bGUgcmVnaW9uIHZpZXcuXG5cdFx0dGl0bGU6ICAgbDEwbi5hdHRhY2htZW50RGV0YWlscyxcblx0XHQvLyBSZWdpb24gbW9kZSBkZWZhdWx0cy5cblx0XHRjb250ZW50OiAnZWRpdC1tZXRhZGF0YScsXG5cdFx0bWVudTogICAgZmFsc2UsXG5cdFx0dG9vbGJhcjogZmFsc2UsXG5cdFx0cm91dGVyOiAgZmFsc2Vcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdEF0dGFjaG1lbnRNZXRhZGF0YTtcbiIsIi8qZ2xvYmFscyB3cCAqL1xuXG52YXIgbWVkaWEgPSB3cC5tZWRpYTtcblxubWVkaWEuY29udHJvbGxlci5FZGl0QXR0YWNobWVudE1ldGFkYXRhID0gcmVxdWlyZSggJy4vY29udHJvbGxlcnMvZWRpdC1hdHRhY2htZW50LW1ldGFkYXRhLmpzJyApO1xubWVkaWEudmlldy5NZWRpYUZyYW1lLk1hbmFnZSA9IHJlcXVpcmUoICcuL3ZpZXdzL2ZyYW1lL21hbmFnZS5qcycgKTtcbm1lZGlhLnZpZXcuQXR0YWNobWVudC5EZXRhaWxzLlR3b0NvbHVtbiA9IHJlcXVpcmUoICcuL3ZpZXdzL2F0dGFjaG1lbnQvZGV0YWlscy10d28tY29sdW1uLmpzJyApO1xubWVkaWEudmlldy5NZWRpYUZyYW1lLk1hbmFnZS5Sb3V0ZXIgPSByZXF1aXJlKCAnLi9yb3V0ZXJzL21hbmFnZS5qcycgKTtcbm1lZGlhLnZpZXcuRWRpdEltYWdlLkRldGFpbHMgPSByZXF1aXJlKCAnLi92aWV3cy9lZGl0LWltYWdlLWRldGFpbHMuanMnICk7XG5tZWRpYS52aWV3Lk1lZGlhRnJhbWUuRWRpdEF0dGFjaG1lbnRzID0gcmVxdWlyZSggJy4vdmlld3MvZnJhbWUvZWRpdC1hdHRhY2htZW50cy5qcycgKTtcbm1lZGlhLnZpZXcuU2VsZWN0TW9kZVRvZ2dsZUJ1dHRvbiA9IHJlcXVpcmUoICcuL3ZpZXdzL2J1dHRvbi9zZWxlY3QtbW9kZS10b2dnbGUuanMnICk7XG5tZWRpYS52aWV3LkRlbGV0ZVNlbGVjdGVkQnV0dG9uID0gcmVxdWlyZSggJy4vdmlld3MvYnV0dG9uL2RlbGV0ZS1zZWxlY3RlZC5qcycgKTtcbm1lZGlhLnZpZXcuRGVsZXRlU2VsZWN0ZWRQZXJtYW5lbnRseUJ1dHRvbiA9IHJlcXVpcmUoICcuL3ZpZXdzL2J1dHRvbi9kZWxldGUtc2VsZWN0ZWQtcGVybWFuZW50bHkuanMnICk7XG4iLCIvKmdsb2JhbHMgd3AsIEJhY2tib25lICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5NZWRpYUZyYW1lLk1hbmFnZS5Sb3V0ZXJcbiAqXG4gKiBBIHJvdXRlciBmb3IgaGFuZGxpbmcgdGhlIGJyb3dzZXIgaGlzdG9yeSBhbmQgYXBwbGljYXRpb24gc3RhdGUuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgQmFja2JvbmUuUm91dGVyXG4gKi9cbnZhciBSb3V0ZXIgPSBCYWNrYm9uZS5Sb3V0ZXIuZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24gKCBvcHRpb25zICkge1xuXHRcdHRoaXMuY29udHJvbGxlciA9IG9wdGlvbnMuY29udHJvbGxlcjtcblx0XHR0aGlzLmxpYnJhcnkgPSBvcHRpb25zLmxpYnJhcnk7XG5cdFx0dGhpcy5vbiggJ3JvdXRlJywgdGhpcy5jaGVja1JvdXRlICk7XG5cdH0sXG5cblx0cm91dGVzOiB7XG5cdFx0J3VwbG9hZC5waHA/aXRlbT06c2x1Zyc6ICAgICdzaG93SXRlbScsXG5cdFx0J3VwbG9hZC5waHA/c2VhcmNoPTpxdWVyeSc6ICdzZWFyY2gnLFxuXHRcdCd1cGxvYWQucGhwJzpcdFx0XHRcdCdkZWZhdWx0Um91dGUnXG5cdH0sXG5cblx0Y2hlY2tSb3V0ZTogZnVuY3Rpb24gKCBldmVudCApIHtcblx0XHRpZiAoICdkZWZhdWx0Um91dGUnICE9PSBldmVudCApIHtcblx0XHRcdHRoaXMubW9kYWwgPSB0cnVlO1xuXHRcdH1cblx0fSxcblxuXHRkZWZhdWx0Um91dGU6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAoIHRoaXMubW9kYWwgKSB7XG5cdFx0XHR3cC5tZWRpYS5mcmFtZS5jbG9zZSgpO1xuXHRcdFx0dGhpcy5tb2RhbCA9IGZhbHNlO1xuXHRcdH1cblx0fSxcblxuXHQvLyBNYXAgcm91dGVzIGFnYWluc3QgdGhlIHBhZ2UgVVJMXG5cdGJhc2VVcmw6IGZ1bmN0aW9uKCB1cmwgKSB7XG5cdFx0cmV0dXJuICd1cGxvYWQucGhwJyArIHVybDtcblx0fSxcblxuXHQvLyBSZXNwb25kIHRvIHRoZSBzZWFyY2ggcm91dGUgYnkgZmlsbGluZyB0aGUgc2VhcmNoIGZpZWxkIGFuZCB0cmlnZ2dlcmluZyB0aGUgaW5wdXQgZXZlbnRcblx0c2VhcmNoOiBmdW5jdGlvbiggcXVlcnkgKSB7XG5cdFx0alF1ZXJ5KCAnI21lZGlhLXNlYXJjaC1pbnB1dCcgKS52YWwoIHF1ZXJ5ICkudHJpZ2dlciggJ2lucHV0JyApO1xuXHR9LFxuXG5cdC8vIFNob3cgdGhlIG1vZGFsIHdpdGggYSBzcGVjaWZpYyBpdGVtXG5cdHNob3dJdGVtOiBmdW5jdGlvbiggcXVlcnkgKSB7XG5cdFx0dmFyIGZyYW1lID0gdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0aXRlbTtcblx0XG5cdFx0Ly8gVHJpZ2dlciB0aGUgbWVkaWEgZnJhbWUgdG8gb3BlbiB0aGUgY29ycmVjdCBpdGVtXG5cdFx0aXRlbSA9IHRoaXMubGlicmFyeS5maW5kV2hlcmUoIHsgaWQ6IHBhcnNlSW50KCBxdWVyeSwgMTAgKSB9ICk7XG5cdFx0aWYgKCBpdGVtICkge1xuXHRcdFx0ZnJhbWUudHJpZ2dlciggJ2VkaXQ6YXR0YWNobWVudCcsIGl0ZW0gKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aXRlbSA9IHdwLm1lZGlhLmF0dGFjaG1lbnQoIHF1ZXJ5ICk7XG5cdFx0XHRmcmFtZS5saXN0ZW5UbyggaXRlbSwgJ2NoYW5nZScsIGZ1bmN0aW9uKCBtb2RlbCApIHtcblx0XHRcdFx0ZnJhbWUuc3RvcExpc3RlbmluZyggaXRlbSApO1xuXHRcdFx0XHRmcmFtZS50cmlnZ2VyKCAnZWRpdDphdHRhY2htZW50JywgbW9kZWwgKTtcblx0XHRcdH0gKTtcblx0XHRcdGl0ZW0uZmV0Y2goKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJvdXRlcjtcbiIsIi8qZ2xvYmFscyB3cCAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudC5EZXRhaWxzLlR3b0NvbHVtblxuICpcbiAqIEEgc2ltaWxhciB2aWV3IHRvIG1lZGlhLnZpZXcuQXR0YWNobWVudC5EZXRhaWxzXG4gKiBmb3IgdXNlIGluIHRoZSBFZGl0IEF0dGFjaG1lbnQgbW9kYWwuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5BdHRhY2htZW50LkRldGFpbHNcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIERldGFpbHMgPSB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnQuRGV0YWlscyxcblx0VHdvQ29sdW1uO1xuXG5Ud29Db2x1bW4gPSBEZXRhaWxzLmV4dGVuZCh7XG5cdHRlbXBsYXRlOiB3cC50ZW1wbGF0ZSggJ2F0dGFjaG1lbnQtZGV0YWlscy10d28tY29sdW1uJyApLFxuXG5cdGVkaXRBdHRhY2htZW50OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR0aGlzLmNvbnRyb2xsZXIuY29udGVudC5tb2RlKCAnZWRpdC1pbWFnZScgKTtcblx0fSxcblxuXHQvKipcblx0ICogTm9vcCB0aGlzIGZyb20gcGFyZW50IGNsYXNzLCBkb2Vzbid0IGFwcGx5IGhlcmUuXG5cdCAqL1xuXHR0b2dnbGVTZWxlY3Rpb25IYW5kbGVyOiBmdW5jdGlvbigpIHt9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0RGV0YWlscy5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdHdwLm1lZGlhLm1peGluLnJlbW92ZUFsbFBsYXllcnMoKTtcblx0XHR0aGlzLiQoICdhdWRpbywgdmlkZW8nICkuZWFjaCggZnVuY3Rpb24gKGksIGVsZW0pIHtcblx0XHRcdHZhciBlbCA9IHdwLm1lZGlhLnZpZXcuTWVkaWFEZXRhaWxzLnByZXBhcmVTcmMoIGVsZW0gKTtcblx0XHRcdG5ldyB3aW5kb3cuTWVkaWFFbGVtZW50UGxheWVyKCBlbCwgd3AubWVkaWEubWl4aW4ubWVqc1NldHRpbmdzICk7XG5cdFx0fSApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUd29Db2x1bW47XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LkRlbGV0ZVNlbGVjdGVkUGVybWFuZW50bHlCdXR0b25cbiAqXG4gKiBXaGVuIE1FRElBX1RSQVNIIGlzIHRydWUsIGEgYnV0dG9uIHRoYXQgaGFuZGxlcyBidWxrIERlbGV0ZSBQZXJtYW5lbnRseSBsb2dpY1xuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuRGVsZXRlU2VsZWN0ZWRCdXR0b25cbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkJ1dHRvblxuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgQnV0dG9uID0gd3AubWVkaWEudmlldy5CdXR0b24sXG5cdERlbGV0ZVNlbGVjdGVkID0gd3AubWVkaWEudmlldy5EZWxldGVTZWxlY3RlZEJ1dHRvbixcblx0RGVsZXRlU2VsZWN0ZWRQZXJtYW5lbnRseTtcblxuRGVsZXRlU2VsZWN0ZWRQZXJtYW5lbnRseSA9IERlbGV0ZVNlbGVjdGVkLmV4dGVuZCh7XG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdERlbGV0ZVNlbGVjdGVkLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLmNvbnRyb2xsZXIsICdzZWxlY3Q6YWN0aXZhdGUnLCB0aGlzLnNlbGVjdEFjdGl2YXRlICk7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5jb250cm9sbGVyLCAnc2VsZWN0OmRlYWN0aXZhdGUnLCB0aGlzLnNlbGVjdERlYWN0aXZhdGUgKTtcblx0fSxcblxuXHRmaWx0ZXJDaGFuZ2U6IGZ1bmN0aW9uKCBtb2RlbCApIHtcblx0XHR0aGlzLmNhblNob3cgPSAoICd0cmFzaCcgPT09IG1vZGVsLmdldCggJ3N0YXR1cycgKSApO1xuXHR9LFxuXG5cdHNlbGVjdEFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnRvZ2dsZURpc2FibGVkKCk7XG5cdFx0dGhpcy4kZWwudG9nZ2xlQ2xhc3MoICdoaWRkZW4nLCAhIHRoaXMuY2FuU2hvdyApO1xuXHR9LFxuXG5cdHNlbGVjdERlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudG9nZ2xlRGlzYWJsZWQoKTtcblx0XHR0aGlzLiRlbC5hZGRDbGFzcyggJ2hpZGRlbicgKTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdEJ1dHRvbi5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHR0aGlzLnNlbGVjdEFjdGl2YXRlKCk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERlbGV0ZVNlbGVjdGVkUGVybWFuZW50bHk7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LkRlbGV0ZVNlbGVjdGVkQnV0dG9uXG4gKlxuICogQSBidXR0b24gdGhhdCBoYW5kbGVzIGJ1bGsgRGVsZXRlL1RyYXNoIGxvZ2ljXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5CdXR0b25cbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIEJ1dHRvbiA9IHdwLm1lZGlhLnZpZXcuQnV0dG9uLFxuXHRsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHREZWxldGVTZWxlY3RlZDtcblxuRGVsZXRlU2VsZWN0ZWQgPSBCdXR0b24uZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0QnV0dG9uLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHRpZiAoIHRoaXMub3B0aW9ucy5maWx0ZXJzICkge1xuXHRcdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5vcHRpb25zLmZpbHRlcnMubW9kZWwsICdjaGFuZ2UnLCB0aGlzLmZpbHRlckNoYW5nZSApO1xuXHRcdH1cblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLmNvbnRyb2xsZXIsICdzZWxlY3Rpb246dG9nZ2xlJywgdGhpcy50b2dnbGVEaXNhYmxlZCApO1xuXHR9LFxuXG5cdGZpbHRlckNoYW5nZTogZnVuY3Rpb24oIG1vZGVsICkge1xuXHRcdGlmICggJ3RyYXNoJyA9PT0gbW9kZWwuZ2V0KCAnc3RhdHVzJyApICkge1xuXHRcdFx0dGhpcy5tb2RlbC5zZXQoICd0ZXh0JywgbDEwbi51bnRyYXNoU2VsZWN0ZWQgKTtcblx0XHR9IGVsc2UgaWYgKCB3cC5tZWRpYS52aWV3LnNldHRpbmdzLm1lZGlhVHJhc2ggKSB7XG5cdFx0XHR0aGlzLm1vZGVsLnNldCggJ3RleHQnLCBsMTBuLnRyYXNoU2VsZWN0ZWQgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5tb2RlbC5zZXQoICd0ZXh0JywgbDEwbi5kZWxldGVTZWxlY3RlZCApO1xuXHRcdH1cblx0fSxcblxuXHR0b2dnbGVEaXNhYmxlZDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5tb2RlbC5zZXQoICdkaXNhYmxlZCcsICEgdGhpcy5jb250cm9sbGVyLnN0YXRlKCkuZ2V0KCAnc2VsZWN0aW9uJyApLmxlbmd0aCApO1xuXHR9LFxuXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0QnV0dG9uLnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdGlmICggdGhpcy5jb250cm9sbGVyLmlzTW9kZUFjdGl2ZSggJ3NlbGVjdCcgKSApIHtcblx0XHRcdHRoaXMuJGVsLmFkZENsYXNzKCAnZGVsZXRlLXNlbGVjdGVkLWJ1dHRvbicgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy4kZWwuYWRkQ2xhc3MoICdkZWxldGUtc2VsZWN0ZWQtYnV0dG9uIGhpZGRlbicgKTtcblx0XHR9XG5cdFx0dGhpcy50b2dnbGVEaXNhYmxlZCgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBEZWxldGVTZWxlY3RlZDtcbiIsIi8qZ2xvYmFscyB3cCAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuU2VsZWN0TW9kZVRvZ2dsZUJ1dHRvblxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuQnV0dG9uXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBCdXR0b24gPSB3cC5tZWRpYS52aWV3LkJ1dHRvbixcblx0bDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0U2VsZWN0TW9kZVRvZ2dsZTtcblxuU2VsZWN0TW9kZVRvZ2dsZSA9IEJ1dHRvbi5leHRlbmQoe1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdHNpemUgOiAnJ1xuXHRcdH0gKTtcblxuXHRcdEJ1dHRvbi5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5jb250cm9sbGVyLCAnc2VsZWN0OmFjdGl2YXRlIHNlbGVjdDpkZWFjdGl2YXRlJywgdGhpcy50b2dnbGVCdWxrRWRpdEhhbmRsZXIgKTtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLmNvbnRyb2xsZXIsICdzZWxlY3Rpb246YWN0aW9uOmRvbmUnLCB0aGlzLmJhY2sgKTtcblx0fSxcblxuXHRiYWNrOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5jb250cm9sbGVyLmRlYWN0aXZhdGVNb2RlKCAnc2VsZWN0JyApLmFjdGl2YXRlTW9kZSggJ2VkaXQnICk7XG5cdH0sXG5cblx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdEJ1dHRvbi5wcm90b3R5cGUuY2xpY2suYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdGlmICggdGhpcy5jb250cm9sbGVyLmlzTW9kZUFjdGl2ZSggJ3NlbGVjdCcgKSApIHtcblx0XHRcdHRoaXMuYmFjaygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNvbnRyb2xsZXIuZGVhY3RpdmF0ZU1vZGUoICdlZGl0JyApLmFjdGl2YXRlTW9kZSggJ3NlbGVjdCcgKTtcblx0XHR9XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRCdXR0b24ucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0dGhpcy4kZWwuYWRkQ2xhc3MoICdzZWxlY3QtbW9kZS10b2dnbGUtYnV0dG9uJyApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHRvZ2dsZUJ1bGtFZGl0SGFuZGxlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHRvb2xiYXIgPSB0aGlzLmNvbnRyb2xsZXIuY29udGVudC5nZXQoKS50b29sYmFyLCBjaGlsZHJlbjtcblxuXHRcdGNoaWxkcmVuID0gdG9vbGJhci4kKCAnLm1lZGlhLXRvb2xiYXItc2Vjb25kYXJ5ID4gKiwgLm1lZGlhLXRvb2xiYXItcHJpbWFyeSA+IConICk7XG5cblx0XHQvLyBUT0RPOiB0aGUgRnJhbWUgc2hvdWxkIGJlIGRvaW5nIGFsbCBvZiB0aGlzLlxuXHRcdGlmICggdGhpcy5jb250cm9sbGVyLmlzTW9kZUFjdGl2ZSggJ3NlbGVjdCcgKSApIHtcblx0XHRcdHRoaXMubW9kZWwuc2V0KCB7XG5cdFx0XHRcdHNpemU6ICdsYXJnZScsXG5cdFx0XHRcdHRleHQ6IGwxMG4uY2FuY2VsU2VsZWN0aW9uXG5cdFx0XHR9ICk7XG5cdFx0XHRjaGlsZHJlbi5ub3QoICcuc3Bpbm5lciwgLm1lZGlhLWJ1dHRvbicgKS5oaWRlKCk7XG5cdFx0XHR0aGlzLiRlbC5zaG93KCk7XG5cdFx0XHR0b29sYmFyLiQoICcuZGVsZXRlLXNlbGVjdGVkLWJ1dHRvbicgKS5yZW1vdmVDbGFzcyggJ2hpZGRlbicgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5tb2RlbC5zZXQoIHtcblx0XHRcdFx0c2l6ZTogJycsXG5cdFx0XHRcdHRleHQ6IGwxMG4uYnVsa1NlbGVjdFxuXHRcdFx0fSApO1xuXHRcdFx0dGhpcy5jb250cm9sbGVyLmNvbnRlbnQuZ2V0KCkuJGVsLnJlbW92ZUNsYXNzKCAnZml4ZWQnICk7XG5cdFx0XHR0b29sYmFyLiRlbC5jc3MoICd3aWR0aCcsICcnICk7XG5cdFx0XHR0b29sYmFyLiQoICcuZGVsZXRlLXNlbGVjdGVkLWJ1dHRvbicgKS5hZGRDbGFzcyggJ2hpZGRlbicgKTtcblx0XHRcdGNoaWxkcmVuLm5vdCggJy5tZWRpYS1idXR0b24nICkuc2hvdygpO1xuXHRcdFx0dGhpcy5jb250cm9sbGVyLnN0YXRlKCkuZ2V0KCAnc2VsZWN0aW9uJyApLnJlc2V0KCk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3RNb2RlVG9nZ2xlO1xuIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5FZGl0SW1hZ2UuRGV0YWlsc1xuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuRWRpdEltYWdlXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBWaWV3ID0gd3AubWVkaWEuVmlldyxcblx0RWRpdEltYWdlID0gd3AubWVkaWEudmlldy5FZGl0SW1hZ2UsXG5cdERldGFpbHM7XG5cbkRldGFpbHMgPSBFZGl0SW1hZ2UuZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0dGhpcy5lZGl0b3IgPSB3aW5kb3cuaW1hZ2VFZGl0O1xuXHRcdHRoaXMuZnJhbWUgPSBvcHRpb25zLmZyYW1lO1xuXHRcdHRoaXMuY29udHJvbGxlciA9IG9wdGlvbnMuY29udHJvbGxlcjtcblx0XHRWaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHRiYWNrOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmZyYW1lLmNvbnRlbnQubW9kZSggJ2VkaXQtbWV0YWRhdGEnICk7XG5cdH0sXG5cblx0c2F2ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5tb2RlbC5mZXRjaCgpLmRvbmUoIF8uYmluZCggZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLmZyYW1lLmNvbnRlbnQubW9kZSggJ2VkaXQtbWV0YWRhdGEnICk7XG5cdFx0fSwgdGhpcyApICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERldGFpbHM7XG4iLCIvKmdsb2JhbHMgd3AsIF8sIGpRdWVyeSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5FZGl0QXR0YWNobWVudHNcbiAqXG4gKiBBIGZyYW1lIGZvciBlZGl0aW5nIHRoZSBkZXRhaWxzIG9mIGEgc3BlY2lmaWMgbWVkaWEgaXRlbS5cbiAqXG4gKiBPcGVucyBpbiBhIG1vZGFsIGJ5IGRlZmF1bHQuXG4gKlxuICogUmVxdWlyZXMgYW4gYXR0YWNobWVudCBtb2RlbCB0byBiZSBwYXNzZWQgaW4gdGhlIG9wdGlvbnMgaGFzaCB1bmRlciBgbW9kZWxgLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuRnJhbWVcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqIEBtaXhlcyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlTWFjaGluZVxuICovXG52YXIgRnJhbWUgPSB3cC5tZWRpYS52aWV3LkZyYW1lLFxuXHRNZWRpYUZyYW1lID0gd3AubWVkaWEudmlldy5NZWRpYUZyYW1lLFxuXG5cdCQgPSBqUXVlcnksXG5cdEVkaXRBdHRhY2htZW50cztcblxuRWRpdEF0dGFjaG1lbnRzID0gTWVkaWFGcmFtZS5leHRlbmQoe1xuXG5cdGNsYXNzTmFtZTogJ2VkaXQtYXR0YWNobWVudC1mcmFtZScsXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoICdlZGl0LWF0dGFjaG1lbnQtZnJhbWUnICksXG5cdHJlZ2lvbnM6ICAgWyAndGl0bGUnLCAnY29udGVudCcgXSxcblxuXHRldmVudHM6IHtcblx0XHQnY2xpY2sgLmxlZnQnOiAgJ3ByZXZpb3VzTWVkaWFJdGVtJyxcblx0XHQnY2xpY2sgLnJpZ2h0JzogJ25leHRNZWRpYUl0ZW0nXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0RnJhbWUucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0Xy5kZWZhdWx0cyggdGhpcy5vcHRpb25zLCB7XG5cdFx0XHRtb2RhbDogdHJ1ZSxcblx0XHRcdHN0YXRlOiAnZWRpdC1hdHRhY2htZW50J1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5jb250cm9sbGVyID0gdGhpcy5vcHRpb25zLmNvbnRyb2xsZXI7XG5cdFx0dGhpcy5ncmlkUm91dGVyID0gdGhpcy5jb250cm9sbGVyLmdyaWRSb3V0ZXI7XG5cdFx0dGhpcy5saWJyYXJ5ID0gdGhpcy5vcHRpb25zLmxpYnJhcnk7XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5tb2RlbCApIHtcblx0XHRcdHRoaXMubW9kZWwgPSB0aGlzLm9wdGlvbnMubW9kZWw7XG5cdFx0fVxuXG5cdFx0dGhpcy5iaW5kSGFuZGxlcnMoKTtcblx0XHR0aGlzLmNyZWF0ZVN0YXRlcygpO1xuXHRcdHRoaXMuY3JlYXRlTW9kYWwoKTtcblxuXHRcdHRoaXMudGl0bGUubW9kZSggJ2RlZmF1bHQnICk7XG5cdFx0dGhpcy50b2dnbGVOYXYoKTtcblx0fSxcblxuXHRiaW5kSGFuZGxlcnM6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIEJpbmQgZGVmYXVsdCB0aXRsZSBjcmVhdGlvbi5cblx0XHR0aGlzLm9uKCAndGl0bGU6Y3JlYXRlOmRlZmF1bHQnLCB0aGlzLmNyZWF0ZVRpdGxlLCB0aGlzICk7XG5cblx0XHQvLyBDbG9zZSB0aGUgbW9kYWwgaWYgdGhlIGF0dGFjaG1lbnQgaXMgZGVsZXRlZC5cblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnY2hhbmdlOnN0YXR1cyBkZXN0cm95JywgdGhpcy5jbG9zZSwgdGhpcyApO1xuXG5cdFx0dGhpcy5vbiggJ2NvbnRlbnQ6Y3JlYXRlOmVkaXQtbWV0YWRhdGEnLCB0aGlzLmVkaXRNZXRhZGF0YU1vZGUsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnY29udGVudDpjcmVhdGU6ZWRpdC1pbWFnZScsIHRoaXMuZWRpdEltYWdlTW9kZSwgdGhpcyApO1xuXHRcdHRoaXMub24oICdjb250ZW50OnJlbmRlcjplZGl0LWltYWdlJywgdGhpcy5lZGl0SW1hZ2VNb2RlUmVuZGVyLCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ2Nsb3NlJywgdGhpcy5kZXRhY2ggKTtcblx0fSxcblxuXHRjcmVhdGVNb2RhbDogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gSW5pdGlhbGl6ZSBtb2RhbCBjb250YWluZXIgdmlldy5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5tb2RhbCApIHtcblx0XHRcdHRoaXMubW9kYWwgPSBuZXcgd3AubWVkaWEudmlldy5Nb2RhbCh7XG5cdFx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRcdHRpdGxlOiAgICAgIHRoaXMub3B0aW9ucy50aXRsZVxuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMubW9kYWwub24oICdvcGVuJywgXy5iaW5kKCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdCQoICdib2R5JyApLm9uKCAna2V5ZG93bi5tZWRpYS1tb2RhbCcsIF8uYmluZCggdGhpcy5rZXlFdmVudCwgdGhpcyApICk7XG5cdFx0XHR9LCB0aGlzICkgKTtcblxuXHRcdFx0Ly8gQ29tcGxldGVseSBkZXN0cm95IHRoZSBtb2RhbCBET00gZWxlbWVudCB3aGVuIGNsb3NpbmcgaXQuXG5cdFx0XHR0aGlzLm1vZGFsLm9uKCAnY2xvc2UnLCBfLmJpbmQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLm1vZGFsLnJlbW92ZSgpO1xuXHRcdFx0XHQkKCAnYm9keScgKS5vZmYoICdrZXlkb3duLm1lZGlhLW1vZGFsJyApOyAvKiByZW1vdmUgdGhlIGtleWRvd24gZXZlbnQgKi9cblx0XHRcdFx0Ly8gUmVzdG9yZSB0aGUgb3JpZ2luYWwgZm9jdXMgaXRlbSBpZiBwb3NzaWJsZVxuXHRcdFx0XHQkKCAnbGkuYXR0YWNobWVudFtkYXRhLWlkPVwiJyArIHRoaXMubW9kZWwuZ2V0KCAnaWQnICkgKydcIl0nICkuZm9jdXMoKTtcblx0XHRcdFx0dGhpcy5yZXNldFJvdXRlKCk7XG5cdFx0XHR9LCB0aGlzICkgKTtcblxuXHRcdFx0Ly8gU2V0IHRoaXMgZnJhbWUgYXMgdGhlIG1vZGFsJ3MgY29udGVudC5cblx0XHRcdHRoaXMubW9kYWwuY29udGVudCggdGhpcyApO1xuXHRcdFx0dGhpcy5tb2RhbC5vcGVuKCk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGQgdGhlIGRlZmF1bHQgc3RhdGVzIHRvIHRoZSBmcmFtZS5cblx0ICovXG5cdGNyZWF0ZVN0YXRlczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zdGF0ZXMuYWRkKFtcblx0XHRcdG5ldyB3cC5tZWRpYS5jb250cm9sbGVyLkVkaXRBdHRhY2htZW50TWV0YWRhdGEoIHsgbW9kZWw6IHRoaXMubW9kZWwgfSApXG5cdFx0XSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENvbnRlbnQgcmVnaW9uIHJlbmRlcmluZyBjYWxsYmFjayBmb3IgdGhlIGBlZGl0LW1ldGFkYXRhYCBtb2RlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gY29udGVudFJlZ2lvbiBCYXNpYyBvYmplY3Qgd2l0aCBhIGB2aWV3YCBwcm9wZXJ0eSwgd2hpY2hcblx0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkIGJlIHNldCB3aXRoIHRoZSBwcm9wZXIgcmVnaW9uIHZpZXcuXG5cdCAqL1xuXHRlZGl0TWV0YWRhdGFNb2RlOiBmdW5jdGlvbiggY29udGVudFJlZ2lvbiApIHtcblx0XHRjb250ZW50UmVnaW9uLnZpZXcgPSBuZXcgd3AubWVkaWEudmlldy5BdHRhY2htZW50LkRldGFpbHMuVHdvQ29sdW1uKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRtb2RlbDogICAgICB0aGlzLm1vZGVsXG5cdFx0fSk7XG5cblx0XHQvKipcblx0XHQgKiBBdHRhY2ggYSBzdWJ2aWV3IHRvIGRpc3BsYXkgZmllbGRzIGFkZGVkIHZpYSB0aGVcblx0XHQgKiBgYXR0YWNobWVudF9maWVsZHNfdG9fZWRpdGAgZmlsdGVyLlxuXHRcdCAqL1xuXHRcdGNvbnRlbnRSZWdpb24udmlldy52aWV3cy5zZXQoICcuYXR0YWNobWVudC1jb21wYXQnLCBuZXcgd3AubWVkaWEudmlldy5BdHRhY2htZW50Q29tcGF0KHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRtb2RlbDogICAgICB0aGlzLm1vZGVsXG5cdFx0fSkgKTtcblxuXHRcdC8vIFVwZGF0ZSBicm93c2VyIHVybCB3aGVuIG5hdmlnYXRpbmcgbWVkaWEgZGV0YWlsc1xuXHRcdGlmICggdGhpcy5tb2RlbCApIHtcblx0XHRcdHRoaXMuZ3JpZFJvdXRlci5uYXZpZ2F0ZSggdGhpcy5ncmlkUm91dGVyLmJhc2VVcmwoICc/aXRlbT0nICsgdGhpcy5tb2RlbC5pZCApICk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW5kZXIgdGhlIEVkaXRJbWFnZSB2aWV3IGludG8gdGhlIGZyYW1lJ3MgY29udGVudCByZWdpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZW50UmVnaW9uIEJhc2ljIG9iamVjdCB3aXRoIGEgYHZpZXdgIHByb3BlcnR5LCB3aGljaFxuXHQgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzaG91bGQgYmUgc2V0IHdpdGggdGhlIHByb3BlciByZWdpb24gdmlldy5cblx0ICovXG5cdGVkaXRJbWFnZU1vZGU6IGZ1bmN0aW9uKCBjb250ZW50UmVnaW9uICkge1xuXHRcdHZhciBlZGl0SW1hZ2VDb250cm9sbGVyID0gbmV3IHdwLm1lZGlhLmNvbnRyb2xsZXIuRWRpdEltYWdlKCB7XG5cdFx0XHRtb2RlbDogdGhpcy5tb2RlbCxcblx0XHRcdGZyYW1lOiB0aGlzXG5cdFx0fSApO1xuXHRcdC8vIE5vb3Agc29tZSBtZXRob2RzLlxuXHRcdGVkaXRJbWFnZUNvbnRyb2xsZXIuX3Rvb2xiYXIgPSBmdW5jdGlvbigpIHt9O1xuXHRcdGVkaXRJbWFnZUNvbnRyb2xsZXIuX3JvdXRlciA9IGZ1bmN0aW9uKCkge307XG5cdFx0ZWRpdEltYWdlQ29udHJvbGxlci5fbWVudSA9IGZ1bmN0aW9uKCkge307XG5cblx0XHRjb250ZW50UmVnaW9uLnZpZXcgPSBuZXcgd3AubWVkaWEudmlldy5FZGl0SW1hZ2UuRGV0YWlscygge1xuXHRcdFx0bW9kZWw6IHRoaXMubW9kZWwsXG5cdFx0XHRmcmFtZTogdGhpcyxcblx0XHRcdGNvbnRyb2xsZXI6IGVkaXRJbWFnZUNvbnRyb2xsZXJcblx0XHR9ICk7XG5cdH0sXG5cblx0ZWRpdEltYWdlTW9kZVJlbmRlcjogZnVuY3Rpb24oIHZpZXcgKSB7XG5cdFx0dmlldy5vbiggJ3JlYWR5Jywgdmlldy5sb2FkRWRpdG9yICk7XG5cdH0sXG5cblx0dG9nZ2xlTmF2OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiQoJy5sZWZ0JykudG9nZ2xlQ2xhc3MoICdkaXNhYmxlZCcsICEgdGhpcy5oYXNQcmV2aW91cygpICk7XG5cdFx0dGhpcy4kKCcucmlnaHQnKS50b2dnbGVDbGFzcyggJ2Rpc2FibGVkJywgISB0aGlzLmhhc05leHQoKSApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXJlbmRlciB0aGUgdmlldy5cblx0ICovXG5cdHJlcmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHQvLyBPbmx5IHJlcmVuZGVyIHRoZSBgY29udGVudGAgcmVnaW9uLlxuXHRcdGlmICggdGhpcy5jb250ZW50Lm1vZGUoKSAhPT0gJ2VkaXQtbWV0YWRhdGEnICkge1xuXHRcdFx0dGhpcy5jb250ZW50Lm1vZGUoICdlZGl0LW1ldGFkYXRhJyApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmNvbnRlbnQucmVuZGVyKCk7XG5cdFx0fVxuXG5cdFx0dGhpcy50b2dnbGVOYXYoKTtcblx0fSxcblxuXHQvKipcblx0ICogQ2xpY2sgaGFuZGxlciB0byBzd2l0Y2ggdG8gdGhlIHByZXZpb3VzIG1lZGlhIGl0ZW0uXG5cdCAqL1xuXHRwcmV2aW91c01lZGlhSXRlbTogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCAhIHRoaXMuaGFzUHJldmlvdXMoKSApIHtcblx0XHRcdHRoaXMuJCggJy5sZWZ0JyApLmJsdXIoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhpcy5tb2RlbCA9IHRoaXMubGlicmFyeS5hdCggdGhpcy5nZXRDdXJyZW50SW5kZXgoKSAtIDEgKTtcblx0XHR0aGlzLnJlcmVuZGVyKCk7XG5cdFx0dGhpcy4kKCAnLmxlZnQnICkuZm9jdXMoKTtcblx0fSxcblxuXHQvKipcblx0ICogQ2xpY2sgaGFuZGxlciB0byBzd2l0Y2ggdG8gdGhlIG5leHQgbWVkaWEgaXRlbS5cblx0ICovXG5cdG5leHRNZWRpYUl0ZW06IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggISB0aGlzLmhhc05leHQoKSApIHtcblx0XHRcdHRoaXMuJCggJy5yaWdodCcgKS5ibHVyKCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHRoaXMubW9kZWwgPSB0aGlzLmxpYnJhcnkuYXQoIHRoaXMuZ2V0Q3VycmVudEluZGV4KCkgKyAxICk7XG5cdFx0dGhpcy5yZXJlbmRlcigpO1xuXHRcdHRoaXMuJCggJy5yaWdodCcgKS5mb2N1cygpO1xuXHR9LFxuXG5cdGdldEN1cnJlbnRJbmRleDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMubGlicmFyeS5pbmRleE9mKCB0aGlzLm1vZGVsICk7XG5cdH0sXG5cblx0aGFzTmV4dDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuICggdGhpcy5nZXRDdXJyZW50SW5kZXgoKSArIDEgKSA8IHRoaXMubGlicmFyeS5sZW5ndGg7XG5cdH0sXG5cblx0aGFzUHJldmlvdXM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiAoIHRoaXMuZ2V0Q3VycmVudEluZGV4KCkgLSAxICkgPiAtMTtcblx0fSxcblx0LyoqXG5cdCAqIFJlc3BvbmQgdG8gdGhlIGtleWJvYXJkIGV2ZW50czogcmlnaHQgYXJyb3csIGxlZnQgYXJyb3csIGV4Y2VwdCB3aGVuXG5cdCAqIGZvY3VzIGlzIGluIGEgdGV4dGFyZWEgb3IgaW5wdXQgZmllbGQuXG5cdCAqL1xuXHRrZXlFdmVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGlmICggKCAnSU5QVVQnID09PSBldmVudC50YXJnZXQubm9kZU5hbWUgfHwgJ1RFWFRBUkVBJyA9PT0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lICkgJiYgISAoIGV2ZW50LnRhcmdldC5yZWFkT25seSB8fCBldmVudC50YXJnZXQuZGlzYWJsZWQgKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBUaGUgcmlnaHQgYXJyb3cga2V5XG5cdFx0aWYgKCAzOSA9PT0gZXZlbnQua2V5Q29kZSApIHtcblx0XHRcdHRoaXMubmV4dE1lZGlhSXRlbSgpO1xuXHRcdH1cblx0XHQvLyBUaGUgbGVmdCBhcnJvdyBrZXlcblx0XHRpZiAoIDM3ID09PSBldmVudC5rZXlDb2RlICkge1xuXHRcdFx0dGhpcy5wcmV2aW91c01lZGlhSXRlbSgpO1xuXHRcdH1cblx0fSxcblxuXHRyZXNldFJvdXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmdyaWRSb3V0ZXIubmF2aWdhdGUoIHRoaXMuZ3JpZFJvdXRlci5iYXNlVXJsKCAnJyApICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRBdHRhY2htZW50cztcbiIsIi8qZ2xvYmFscyB3cCwgXywgQmFja2JvbmUgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWUuTWFuYWdlXG4gKlxuICogQSBnZW5lcmljIG1hbmFnZW1lbnQgZnJhbWUgd29ya2Zsb3cuXG4gKlxuICogVXNlZCBpbiB0aGUgbWVkaWEgZ3JpZCB2aWV3LlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZVxuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuRnJhbWVcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqIEBtaXhlcyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlTWFjaGluZVxuICovXG52YXIgTWVkaWFGcmFtZSA9IHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZSxcblx0TGlicmFyeSA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuTGlicmFyeSxcblxuXHQkID0gQmFja2JvbmUuJCxcblx0TWFuYWdlO1xuXG5NYW5hZ2UgPSBNZWRpYUZyYW1lLmV4dGVuZCh7XG5cdC8qKlxuXHQgKiBAZ2xvYmFsIHdwLlVwbG9hZGVyXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdHRpdGxlOiAgICAgJycsXG5cdFx0XHRtb2RhbDogICAgIGZhbHNlLFxuXHRcdFx0c2VsZWN0aW9uOiBbXSxcblx0XHRcdGxpYnJhcnk6ICAge30sIC8vIE9wdGlvbnMgaGFzaCBmb3IgdGhlIHF1ZXJ5IHRvIHRoZSBtZWRpYSBsaWJyYXJ5LlxuXHRcdFx0bXVsdGlwbGU6ICAnYWRkJyxcblx0XHRcdHN0YXRlOiAgICAgJ2xpYnJhcnknLFxuXHRcdFx0dXBsb2FkZXI6ICB0cnVlLFxuXHRcdFx0bW9kZTogICAgICBbICdncmlkJywgJ2VkaXQnIF1cblx0XHR9KTtcblxuXHRcdHRoaXMuJGJvZHkgPSAkKCBkb2N1bWVudC5ib2R5ICk7XG5cdFx0dGhpcy4kd2luZG93ID0gJCggd2luZG93ICk7XG5cdFx0dGhpcy4kYWRtaW5CYXIgPSAkKCAnI3dwYWRtaW5iYXInICk7XG5cdFx0dGhpcy4kd2luZG93Lm9uKCAnc2Nyb2xsIHJlc2l6ZScsIF8uZGVib3VuY2UoIF8uYmluZCggdGhpcy5maXhQb3NpdGlvbiwgdGhpcyApLCAxNSApICk7XG5cdFx0JCggZG9jdW1lbnQgKS5vbiggJ2NsaWNrJywgJy5wYWdlLXRpdGxlLWFjdGlvbicsIF8uYmluZCggdGhpcy5hZGROZXdDbGlja0hhbmRsZXIsIHRoaXMgKSApO1xuXG5cdFx0Ly8gRW5zdXJlIGNvcmUgYW5kIG1lZGlhIGdyaWQgdmlldyBVSSBpcyBlbmFibGVkLlxuXHRcdHRoaXMuJGVsLmFkZENsYXNzKCd3cC1jb3JlLXVpJyk7XG5cblx0XHQvLyBGb3JjZSB0aGUgdXBsb2FkZXIgb2ZmIGlmIHRoZSB1cGxvYWQgbGltaXQgaGFzIGJlZW4gZXhjZWVkZWQgb3Jcblx0XHQvLyBpZiB0aGUgYnJvd3NlciBpc24ndCBzdXBwb3J0ZWQuXG5cdFx0aWYgKCB3cC5VcGxvYWRlci5saW1pdEV4Y2VlZGVkIHx8ICEgd3AuVXBsb2FkZXIuYnJvd3Nlci5zdXBwb3J0ZWQgKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMudXBsb2FkZXIgPSBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBJbml0aWFsaXplIGEgd2luZG93LXdpZGUgdXBsb2FkZXIuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMudXBsb2FkZXIgKSB7XG5cdFx0XHR0aGlzLnVwbG9hZGVyID0gbmV3IHdwLm1lZGlhLnZpZXcuVXBsb2FkZXJXaW5kb3coe1xuXHRcdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0XHR1cGxvYWRlcjoge1xuXHRcdFx0XHRcdGRyb3B6b25lOiAgZG9jdW1lbnQuYm9keSxcblx0XHRcdFx0XHRjb250YWluZXI6IGRvY3VtZW50LmJvZHlcblx0XHRcdFx0fVxuXHRcdFx0fSkucmVuZGVyKCk7XG5cdFx0XHR0aGlzLnVwbG9hZGVyLnJlYWR5KCk7XG5cdFx0XHR0aGlzLiRib2R5LmFwcGVuZCggdGhpcy51cGxvYWRlci5lbCApO1xuXG5cdFx0XHR0aGlzLm9wdGlvbnMudXBsb2FkZXIgPSBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBDYWxsICdpbml0aWFsaXplJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzLlxuXHRcdE1lZGlhRnJhbWUucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0Ly8gQXBwZW5kIHRoZSBmcmFtZSB2aWV3IGRpcmVjdGx5IHRoZSBzdXBwbGllZCBjb250YWluZXIuXG5cdFx0dGhpcy4kZWwuYXBwZW5kVG8oIHRoaXMub3B0aW9ucy5jb250YWluZXIgKTtcblxuXHRcdHRoaXMuc2V0TGlicmFyeSggdGhpcy5vcHRpb25zICk7XG5cdFx0dGhpcy5zZXRSb3V0ZXIoKTtcblx0XHR0aGlzLmNyZWF0ZVN0YXRlcygpO1xuXHRcdHRoaXMuYmluZFJlZ2lvbk1vZGVIYW5kbGVycygpO1xuXHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0dGhpcy5iaW5kU2VhcmNoSGFuZGxlcigpO1xuXHR9LFxuXG5cdHNldExpYnJhcnk6IGZ1bmN0aW9uICggb3B0aW9ucyApIHtcblx0XHR0aGlzLmxpYnJhcnkgPSB3cC5tZWRpYS5xdWVyeSggb3B0aW9ucy5saWJyYXJ5ICk7XG5cdH0sXG5cblx0c2V0Um91dGVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0dGhpcy5ncmlkUm91dGVyID0gbmV3IHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5NYW5hZ2UuUm91dGVyKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRsaWJyYXJ5OiB0aGlzLmxpYnJhcnlcblx0XHR9KTtcblx0fSxcblxuXHRiaW5kU2VhcmNoSGFuZGxlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlYXJjaCA9IHRoaXMuJCggJyNtZWRpYS1zZWFyY2gtaW5wdXQnICksXG5cdFx0XHRjdXJyZW50U2VhcmNoID0gdGhpcy5vcHRpb25zLmNvbnRhaW5lci5kYXRhKCAnc2VhcmNoJyApLFxuXHRcdFx0c2VhcmNoVmlldyA9IHRoaXMuYnJvd3NlclZpZXcudG9vbGJhci5nZXQoICdzZWFyY2gnICkuJGVsLFxuXHRcdFx0bGlzdE1vZGUgPSB0aGlzLiQoICcudmlldy1saXN0JyApLFxuXG5cdFx0XHRpbnB1dCAgPSBfLmRlYm91bmNlKCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHR2YXIgdmFsID0gJCggZS5jdXJyZW50VGFyZ2V0ICkudmFsKCksXG5cdFx0XHRcdFx0dXJsID0gJyc7XG5cblx0XHRcdFx0aWYgKCB2YWwgKSB7XG5cdFx0XHRcdFx0dXJsICs9ICc/c2VhcmNoPScgKyB2YWw7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5ncmlkUm91dGVyLm5hdmlnYXRlKCB0aGlzLmdyaWRSb3V0ZXIuYmFzZVVybCggdXJsICkgKTtcblx0XHRcdH0sIDEwMDAgKTtcblxuXHRcdC8vIFVwZGF0ZSB0aGUgVVJMIHdoZW4gZW50ZXJpbmcgc2VhcmNoIHN0cmluZyAoYXQgbW9zdCBvbmNlIHBlciBzZWNvbmQpXG5cdFx0c2VhcmNoLm9uKCAnaW5wdXQnLCBfLmJpbmQoIGlucHV0LCB0aGlzICkgKTtcblx0XHRpZiAoIGN1cnJlbnRTZWFyY2ggKSB7XG5cdFx0XHRzZWFyY2hWaWV3LnZhbCggY3VycmVudFNlYXJjaCApLnRyaWdnZXIoICdpbnB1dCcgKTtcblx0XHR9XG5cblx0XHR0aGlzLmdyaWRSb3V0ZXIub24oICdyb3V0ZTpzZWFyY2gnLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHR2YXIgaHJlZiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuXHRcdFx0aWYgKCBocmVmLmluZGV4T2YoICdtb2RlPScgKSA+IC0xICkge1xuXHRcdFx0XHRocmVmID0gaHJlZi5yZXBsYWNlKCAvbW9kZT1bXiZdKy9nLCAnbW9kZT1saXN0JyApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0aHJlZiArPSBocmVmLmluZGV4T2YoICc/JyApID4gLTEgPyAnJm1vZGU9bGlzdCcgOiAnP21vZGU9bGlzdCc7XG5cdFx0XHR9XG5cdFx0XHRocmVmID0gaHJlZi5yZXBsYWNlKCAnc2VhcmNoPScsICdzPScgKTtcblx0XHRcdGxpc3RNb2RlLnByb3AoICdocmVmJywgaHJlZiApO1xuXHRcdH0gKTtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIHRoZSBkZWZhdWx0IHN0YXRlcyBmb3IgdGhlIGZyYW1lLlxuXHQgKi9cblx0Y3JlYXRlU3RhdGVzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuXHRcdGlmICggdGhpcy5vcHRpb25zLnN0YXRlcyApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBBZGQgdGhlIGRlZmF1bHQgc3RhdGVzLlxuXHRcdHRoaXMuc3RhdGVzLmFkZChbXG5cdFx0XHRuZXcgTGlicmFyeSh7XG5cdFx0XHRcdGxpYnJhcnk6ICAgICAgICAgICAgdGhpcy5saWJyYXJ5LFxuXHRcdFx0XHRtdWx0aXBsZTogICAgICAgICAgIG9wdGlvbnMubXVsdGlwbGUsXG5cdFx0XHRcdHRpdGxlOiAgICAgICAgICAgICAgb3B0aW9ucy50aXRsZSxcblx0XHRcdFx0Y29udGVudDogICAgICAgICAgICAnYnJvd3NlJyxcblx0XHRcdFx0dG9vbGJhcjogICAgICAgICAgICAnc2VsZWN0Jyxcblx0XHRcdFx0Y29udGVudFVzZXJTZXR0aW5nOiBmYWxzZSxcblx0XHRcdFx0ZmlsdGVyYWJsZTogICAgICAgICAnYWxsJyxcblx0XHRcdFx0YXV0b1NlbGVjdDogICAgICAgICBmYWxzZVxuXHRcdFx0fSlcblx0XHRdKTtcblx0fSxcblxuXHQvKipcblx0ICogQmluZCByZWdpb24gbW9kZSBhY3RpdmF0aW9uIGV2ZW50cyB0byBwcm9wZXIgaGFuZGxlcnMuXG5cdCAqL1xuXHRiaW5kUmVnaW9uTW9kZUhhbmRsZXJzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm9uKCAnY29udGVudDpjcmVhdGU6YnJvd3NlJywgdGhpcy5icm93c2VDb250ZW50LCB0aGlzICk7XG5cblx0XHQvLyBIYW5kbGUgYSBmcmFtZS1sZXZlbCBldmVudCBmb3IgZWRpdGluZyBhbiBhdHRhY2htZW50LlxuXHRcdHRoaXMub24oICdlZGl0OmF0dGFjaG1lbnQnLCB0aGlzLm9wZW5FZGl0QXR0YWNobWVudE1vZGFsLCB0aGlzICk7XG5cblx0XHR0aGlzLm9uKCAnc2VsZWN0OmFjdGl2YXRlJywgdGhpcy5iaW5kS2V5ZG93biwgdGhpcyApO1xuXHRcdHRoaXMub24oICdzZWxlY3Q6ZGVhY3RpdmF0ZScsIHRoaXMudW5iaW5kS2V5ZG93biwgdGhpcyApO1xuXHR9LFxuXG5cdGhhbmRsZUtleWRvd246IGZ1bmN0aW9uKCBlICkge1xuXHRcdGlmICggMjcgPT09IGUud2hpY2ggKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHR0aGlzLmRlYWN0aXZhdGVNb2RlKCAnc2VsZWN0JyApLmFjdGl2YXRlTW9kZSggJ2VkaXQnICk7XG5cdFx0fVxuXHR9LFxuXG5cdGJpbmRLZXlkb3duOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiRib2R5Lm9uKCAna2V5ZG93bi5zZWxlY3QnLCBfLmJpbmQoIHRoaXMuaGFuZGxlS2V5ZG93biwgdGhpcyApICk7XG5cdH0sXG5cblx0dW5iaW5kS2V5ZG93bjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kYm9keS5vZmYoICdrZXlkb3duLnNlbGVjdCcgKTtcblx0fSxcblxuXHRmaXhQb3NpdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRicm93c2VyLCAkdG9vbGJhcjtcblx0XHRpZiAoICEgdGhpcy5pc01vZGVBY3RpdmUoICdzZWxlY3QnICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JGJyb3dzZXIgPSB0aGlzLiQoJy5hdHRhY2htZW50cy1icm93c2VyJyk7XG5cdFx0JHRvb2xiYXIgPSAkYnJvd3Nlci5maW5kKCcubWVkaWEtdG9vbGJhcicpO1xuXG5cdFx0Ly8gT2Zmc2V0IGRvZXNuJ3QgYXBwZWFyIHRvIHRha2UgdG9wIG1hcmdpbiBpbnRvIGFjY291bnQsIGhlbmNlICsxNlxuXHRcdGlmICggKCAkYnJvd3Nlci5vZmZzZXQoKS50b3AgKyAxNiApIDwgdGhpcy4kd2luZG93LnNjcm9sbFRvcCgpICsgdGhpcy4kYWRtaW5CYXIuaGVpZ2h0KCkgKSB7XG5cdFx0XHQkYnJvd3Nlci5hZGRDbGFzcyggJ2ZpeGVkJyApO1xuXHRcdFx0JHRvb2xiYXIuY3NzKCd3aWR0aCcsICRicm93c2VyLndpZHRoKCkgKyAncHgnKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0JGJyb3dzZXIucmVtb3ZlQ2xhc3MoICdmaXhlZCcgKTtcblx0XHRcdCR0b29sYmFyLmNzcygnd2lkdGgnLCAnJyk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBDbGljayBoYW5kbGVyIGZvciB0aGUgYEFkZCBOZXdgIGJ1dHRvbi5cblx0ICovXG5cdGFkZE5ld0NsaWNrSGFuZGxlcjogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0dGhpcy50cmlnZ2VyKCAndG9nZ2xlOnVwbG9hZDphdHRhY2htZW50JyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBPcGVuIHRoZSBFZGl0IEF0dGFjaG1lbnQgbW9kYWwuXG5cdCAqL1xuXHRvcGVuRWRpdEF0dGFjaG1lbnRNb2RhbDogZnVuY3Rpb24oIG1vZGVsICkge1xuXHRcdC8vIENyZWF0ZSBhIG5ldyBFZGl0QXR0YWNobWVudCBmcmFtZSwgcGFzc2luZyBhbG9uZyB0aGUgbGlicmFyeSBhbmQgdGhlIGF0dGFjaG1lbnQgbW9kZWwuXG5cdFx0d3AubWVkaWEoIHtcblx0XHRcdGZyYW1lOiAgICAgICAnZWRpdC1hdHRhY2htZW50cycsXG5cdFx0XHRjb250cm9sbGVyOiAgdGhpcyxcblx0XHRcdGxpYnJhcnk6ICAgICB0aGlzLnN0YXRlKCkuZ2V0KCdsaWJyYXJ5JyksXG5cdFx0XHRtb2RlbDogICAgICAgbW9kZWxcblx0XHR9ICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhbiBhdHRhY2htZW50cyBicm93c2VyIHZpZXcgd2l0aGluIHRoZSBjb250ZW50IHJlZ2lvbi5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IGNvbnRlbnRSZWdpb24gQmFzaWMgb2JqZWN0IHdpdGggYSBgdmlld2AgcHJvcGVydHksIHdoaWNoXG5cdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNob3VsZCBiZSBzZXQgd2l0aCB0aGUgcHJvcGVyIHJlZ2lvbiB2aWV3LlxuXHQgKiBAdGhpcyB3cC5tZWRpYS5jb250cm9sbGVyLlJlZ2lvblxuXHQgKi9cblx0YnJvd3NlQ29udGVudDogZnVuY3Rpb24oIGNvbnRlbnRSZWdpb24gKSB7XG5cdFx0dmFyIHN0YXRlID0gdGhpcy5zdGF0ZSgpO1xuXG5cdFx0Ly8gQnJvd3NlIG91ciBsaWJyYXJ5IG9mIGF0dGFjaG1lbnRzLlxuXHRcdHRoaXMuYnJvd3NlclZpZXcgPSBjb250ZW50UmVnaW9uLnZpZXcgPSBuZXcgd3AubWVkaWEudmlldy5BdHRhY2htZW50c0Jyb3dzZXIoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcyxcblx0XHRcdGNvbGxlY3Rpb246IHN0YXRlLmdldCgnbGlicmFyeScpLFxuXHRcdFx0c2VsZWN0aW9uOiAgc3RhdGUuZ2V0KCdzZWxlY3Rpb24nKSxcblx0XHRcdG1vZGVsOiAgICAgIHN0YXRlLFxuXHRcdFx0c29ydGFibGU6ICAgc3RhdGUuZ2V0KCdzb3J0YWJsZScpLFxuXHRcdFx0c2VhcmNoOiAgICAgc3RhdGUuZ2V0KCdzZWFyY2hhYmxlJyksXG5cdFx0XHRmaWx0ZXJzOiAgICBzdGF0ZS5nZXQoJ2ZpbHRlcmFibGUnKSxcblx0XHRcdGRhdGU6ICAgICAgIHN0YXRlLmdldCgnZGF0ZScpLFxuXHRcdFx0ZGlzcGxheTogICAgc3RhdGUuZ2V0KCdkaXNwbGF5U2V0dGluZ3MnKSxcblx0XHRcdGRyYWdJbmZvOiAgIHN0YXRlLmdldCgnZHJhZ0luZm8nKSxcblx0XHRcdHNpZGViYXI6ICAgICdlcnJvcnMnLFxuXG5cdFx0XHRzdWdnZXN0ZWRXaWR0aDogIHN0YXRlLmdldCgnc3VnZ2VzdGVkV2lkdGgnKSxcblx0XHRcdHN1Z2dlc3RlZEhlaWdodDogc3RhdGUuZ2V0KCdzdWdnZXN0ZWRIZWlnaHQnKSxcblxuXHRcdFx0QXR0YWNobWVudFZpZXc6IHN0YXRlLmdldCgnQXR0YWNobWVudFZpZXcnKSxcblxuXHRcdFx0c2Nyb2xsRWxlbWVudDogZG9jdW1lbnRcblx0XHR9KTtcblx0XHR0aGlzLmJyb3dzZXJWaWV3Lm9uKCAncmVhZHknLCBfLmJpbmQoIHRoaXMuYmluZERlZmVycmVkLCB0aGlzICkgKTtcblxuXHRcdHRoaXMuZXJyb3JzID0gd3AuVXBsb2FkZXIuZXJyb3JzO1xuXHRcdHRoaXMuZXJyb3JzLm9uKCAnYWRkIHJlbW92ZSByZXNldCcsIHRoaXMuc2lkZWJhclZpc2liaWxpdHksIHRoaXMgKTtcblx0fSxcblxuXHRzaWRlYmFyVmlzaWJpbGl0eTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5icm93c2VyVmlldy4kKCAnLm1lZGlhLXNpZGViYXInICkudG9nZ2xlKCAhISB0aGlzLmVycm9ycy5sZW5ndGggKTtcblx0fSxcblxuXHRiaW5kRGVmZXJyZWQ6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggISB0aGlzLmJyb3dzZXJWaWV3LmRmZCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhpcy5icm93c2VyVmlldy5kZmQuZG9uZSggXy5iaW5kKCB0aGlzLnN0YXJ0SGlzdG9yeSwgdGhpcyApICk7XG5cdH0sXG5cblx0c3RhcnRIaXN0b3J5OiBmdW5jdGlvbigpIHtcblx0XHQvLyBWZXJpZnkgcHVzaFN0YXRlIHN1cHBvcnQgYW5kIGFjdGl2YXRlXG5cdFx0aWYgKCB3aW5kb3cuaGlzdG9yeSAmJiB3aW5kb3cuaGlzdG9yeS5wdXNoU3RhdGUgKSB7XG5cdFx0XHRCYWNrYm9uZS5oaXN0b3J5LnN0YXJ0KCB7XG5cdFx0XHRcdHJvb3Q6IHdpbmRvdy5fd3BNZWRpYUdyaWRTZXR0aW5ncy5hZG1pblVybCxcblx0XHRcdFx0cHVzaFN0YXRlOiB0cnVlXG5cdFx0XHR9ICk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNYW5hZ2U7XG4iXX0=
