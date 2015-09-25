(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/collection-add.js":[function(require,module,exports){
/**
 * wp.media.controller.CollectionAdd
 *
 * A state for adding attachments to a collection (e.g. video playlist).
 *
 * @class
 * @augments wp.media.controller.Library
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                     [attributes]                         The attributes hash passed to the state.
 * @param {string}                     [attributes.id=library]      Unique identifier.
 * @param {string}                     attributes.title                    Title for the state. Displays in the frame's title region.
 * @param {boolean}                    [attributes.multiple=add]            Whether multi-select is enabled. @todo 'add' doesn't seem do anything special, and gets used as a boolean.
 * @param {wp.media.model.Attachments} [attributes.library]                 The attachments collection to browse.
 *                                                                          If one is not supplied, a collection of attachments of the specified type will be created.
 * @param {boolean|string}             [attributes.filterable=uploaded]     Whether the library is filterable, and if so what filters should be shown.
 *                                                                          Accepts 'all', 'uploaded', or 'unattached'.
 * @param {string}                     [attributes.menu=gallery]            Initial mode for the menu region.
 * @param {string}                     [attributes.content=upload]          Initial mode for the content region.
 *                                                                          Overridden by persistent user setting if 'contentUserSetting' is true.
 * @param {string}                     [attributes.router=browse]           Initial mode for the router region.
 * @param {string}                     [attributes.toolbar=gallery-add]     Initial mode for the toolbar region.
 * @param {boolean}                    [attributes.searchable=true]         Whether the library is searchable.
 * @param {boolean}                    [attributes.sortable=true]           Whether the Attachments should be sortable. Depends on the orderby property being set to menuOrder on the attachments collection.
 * @param {boolean}                    [attributes.autoSelect=true]         Whether an uploaded attachment should be automatically added to the selection.
 * @param {boolean}                    [attributes.contentUserSetting=true] Whether the content region's mode should be set and persisted per user.
 * @param {int}                        [attributes.priority=100]            The priority for the state link in the media menu.
 * @param {boolean}                    [attributes.syncSelection=false]     Whether the Attachments selection should be persisted from the last state.
 *                                                                          Defaults to false because for this state, because the library of the Edit Gallery state is the selection.
 * @param {string}                     attributes.type                   The collection's media type. (e.g. 'video').
 * @param {string}                     attributes.collectionType         The collection type. (e.g. 'playlist').
 */
var Selection = wp.media.model.Selection,
	Library = wp.media.controller.Library,
	CollectionAdd;

CollectionAdd = Library.extend({
	defaults: _.defaults( {
		// Selection defaults. @see media.model.Selection
		multiple:      'add',
		// Attachments browser defaults. @see media.view.AttachmentsBrowser
		filterable:    'uploaded',

		priority:      100,
		syncSelection: false
	}, Library.prototype.defaults ),

	/**
	 * @since 3.9.0
	 */
	initialize: function() {
		var collectionType = this.get('collectionType');

		if ( 'video' === this.get( 'type' ) ) {
			collectionType = 'video-' + collectionType;
		}

		this.set( 'id', collectionType + '-library' );
		this.set( 'toolbar', collectionType + '-add' );
		this.set( 'menu', collectionType );

		// If we haven't been provided a `library`, create a `Selection`.
		if ( ! this.get('library') ) {
			this.set( 'library', wp.media.query({ type: this.get('type') }) );
		}
		Library.prototype.initialize.apply( this, arguments );
	},

	/**
	 * @since 3.9.0
	 */
	activate: function() {
		var library = this.get('library'),
			editLibrary = this.get('editLibrary'),
			edit = this.frame.state( this.get('collectionType') + '-edit' ).get('library');

		if ( editLibrary && editLibrary !== edit ) {
			library.unobserve( editLibrary );
		}

		// Accepts attachments that exist in the original library and
		// that do not exist in gallery's library.
		library.validator = function( attachment ) {
			return !! this.mirroring.get( attachment.cid ) && ! edit.get( attachment.cid ) && Selection.prototype.validator.apply( this, arguments );
		};

		// Reset the library to ensure that all attachments are re-added
		// to the collection. Do so silently, as calling `observe` will
		// trigger the `reset` event.
		library.reset( library.mirroring.models, { silent: true });
		library.observe( edit );
		this.set('editLibrary', edit);

		Library.prototype.activate.apply( this, arguments );
	}
});

module.exports = CollectionAdd;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/collection-edit.js":[function(require,module,exports){
/**
 * wp.media.controller.CollectionEdit
 *
 * A state for editing a collection, which is used by audio and video playlists,
 * and can be used for other collections.
 *
 * @class
 * @augments wp.media.controller.Library
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                     [attributes]                      The attributes hash passed to the state.
 * @param {string}                     attributes.title                  Title for the state. Displays in the media menu and the frame's title region.
 * @param {wp.media.model.Attachments} [attributes.library]              The attachments collection to edit.
 *                                                                       If one is not supplied, an empty media.model.Selection collection is created.
 * @param {boolean}                    [attributes.multiple=false]       Whether multi-select is enabled.
 * @param {string}                     [attributes.content=browse]       Initial mode for the content region.
 * @param {string}                     attributes.menu                   Initial mode for the menu region. @todo this needs a better explanation.
 * @param {boolean}                    [attributes.searchable=false]     Whether the library is searchable.
 * @param {boolean}                    [attributes.sortable=true]        Whether the Attachments should be sortable. Depends on the orderby property being set to menuOrder on the attachments collection.
 * @param {boolean}                    [attributes.date=true]            Whether to show the date filter in the browser's toolbar.
 * @param {boolean}                    [attributes.describe=true]        Whether to offer UI to describe the attachments - e.g. captioning images in a gallery.
 * @param {boolean}                    [attributes.dragInfo=true]        Whether to show instructional text about the attachments being sortable.
 * @param {boolean}                    [attributes.dragInfoText]         Instructional text about the attachments being sortable.
 * @param {int}                        [attributes.idealColumnWidth=170] The ideal column width in pixels for attachments.
 * @param {boolean}                    [attributes.editing=false]        Whether the gallery is being created, or editing an existing instance.
 * @param {int}                        [attributes.priority=60]          The priority for the state link in the media menu.
 * @param {boolean}                    [attributes.syncSelection=false]  Whether the Attachments selection should be persisted from the last state.
 *                                                                       Defaults to false for this state, because the library passed in  *is* the selection.
 * @param {view}                       [attributes.SettingsView]         The view to edit the collection instance settings (e.g. Playlist settings with "Show tracklist" checkbox).
 * @param {view}                       [attributes.AttachmentView]       The single `Attachment` view to be used in the `Attachments`.
 *                                                                       If none supplied, defaults to wp.media.view.Attachment.EditLibrary.
 * @param {string}                     attributes.type                   The collection's media type. (e.g. 'video').
 * @param {string}                     attributes.collectionType         The collection type. (e.g. 'playlist').
 */
var Library = wp.media.controller.Library,
	l10n = wp.media.view.l10n,
	$ = jQuery,
	CollectionEdit;

CollectionEdit = Library.extend({
	defaults: {
		multiple:         false,
		sortable:         true,
		date:             false,
		searchable:       false,
		content:          'browse',
		describe:         true,
		dragInfo:         true,
		idealColumnWidth: 170,
		editing:          false,
		priority:         60,
		SettingsView:     false,
		syncSelection:    false
	},

	/**
	 * @since 3.9.0
	 */
	initialize: function() {
		var collectionType = this.get('collectionType');

		if ( 'video' === this.get( 'type' ) ) {
			collectionType = 'video-' + collectionType;
		}

		this.set( 'id', collectionType + '-edit' );
		this.set( 'toolbar', collectionType + '-edit' );

		// If we haven't been provided a `library`, create a `Selection`.
		if ( ! this.get('library') ) {
			this.set( 'library', new wp.media.model.Selection() );
		}
		// The single `Attachment` view to be used in the `Attachments` view.
		if ( ! this.get('AttachmentView') ) {
			this.set( 'AttachmentView', wp.media.view.Attachment.EditLibrary );
		}
		Library.prototype.initialize.apply( this, arguments );
	},

	/**
	 * @since 3.9.0
	 */
	activate: function() {
		var library = this.get('library');

		// Limit the library to images only.
		library.props.set( 'type', this.get( 'type' ) );

		// Watch for uploaded attachments.
		this.get('library').observe( wp.Uploader.queue );

		this.frame.on( 'content:render:browse', this.renderSettings, this );

		Library.prototype.activate.apply( this, arguments );
	},

	/**
	 * @since 3.9.0
	 */
	deactivate: function() {
		// Stop watching for uploaded attachments.
		this.get('library').unobserve( wp.Uploader.queue );

		this.frame.off( 'content:render:browse', this.renderSettings, this );

		Library.prototype.deactivate.apply( this, arguments );
	},

	/**
	 * Render the collection embed settings view in the browser sidebar.
	 *
	 * @todo This is against the pattern elsewhere in media. Typically the frame
	 *       is responsible for adding region mode callbacks. Explain.
	 *
	 * @since 3.9.0
	 *
	 * @param {wp.media.view.attachmentsBrowser} The attachments browser view.
	 */
	renderSettings: function( attachmentsBrowserView ) {
		var library = this.get('library'),
			collectionType = this.get('collectionType'),
			dragInfoText = this.get('dragInfoText'),
			SettingsView = this.get('SettingsView'),
			obj = {};

		if ( ! library || ! attachmentsBrowserView ) {
			return;
		}

		library[ collectionType ] = library[ collectionType ] || new Backbone.Model();

		obj[ collectionType ] = new SettingsView({
			controller: this,
			model:      library[ collectionType ],
			priority:   40
		});

		attachmentsBrowserView.sidebar.set( obj );

		if ( dragInfoText ) {
			attachmentsBrowserView.toolbar.set( 'dragInfo', new wp.media.View({
				el: $( '<div class="instructions">' + dragInfoText + '</div>' )[0],
				priority: -40
			}) );
		}

		// Add the 'Reverse order' button to the toolbar.
		attachmentsBrowserView.toolbar.set( 'reverse', {
			text:     l10n.reverseOrder,
			priority: 80,

			click: function() {
				library.reset( library.toArray().reverse() );
			}
		});
	}
});

module.exports = CollectionEdit;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/cropper.js":[function(require,module,exports){
/**
 * wp.media.controller.Cropper
 *
 * A state for cropping an image.
 *
 * @class
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 */
var l10n = wp.media.view.l10n,
	Cropper;

Cropper = wp.media.controller.State.extend({
	defaults: {
		id:          'cropper',
		title:       l10n.cropImage,
		// Region mode defaults.
		toolbar:     'crop',
		content:     'crop',
		router:      false,

		canSkipCrop: false
	},

	activate: function() {
		this.frame.on( 'content:create:crop', this.createCropContent, this );
		this.frame.on( 'close', this.removeCropper, this );
		this.set('selection', new Backbone.Collection(this.frame._selection.single));
	},

	deactivate: function() {
		this.frame.toolbar.mode('browse');
	},

	createCropContent: function() {
		this.cropperView = new wp.media.view.Cropper({
			controller: this,
			attachment: this.get('selection').first()
		});
		this.cropperView.on('image-loaded', this.createCropToolbar, this);
		this.frame.content.set(this.cropperView);

	},
	removeCropper: function() {
		this.imgSelect.cancelSelection();
		this.imgSelect.setOptions({remove: true});
		this.imgSelect.update();
		this.cropperView.remove();
	},
	createCropToolbar: function() {
		var canSkipCrop, toolbarOptions;

		canSkipCrop = this.get('canSkipCrop') || false;

		toolbarOptions = {
			controller: this.frame,
			items: {
				insert: {
					style:    'primary',
					text:     l10n.cropImage,
					priority: 80,
					requires: { library: false, selection: false },

					click: function() {
						var controller = this.controller,
							selection;

						selection = controller.state().get('selection').first();
						selection.set({cropDetails: controller.state().imgSelect.getSelection()});

						this.$el.text(l10n.cropping);
						this.$el.attr('disabled', true);

						controller.state().doCrop( selection ).done( function( croppedImage ) {
							controller.trigger('cropped', croppedImage );
							controller.close();
						}).fail( function() {
							controller.trigger('content:error:crop');
						});
					}
				}
			}
		};

		if ( canSkipCrop ) {
			_.extend( toolbarOptions.items, {
				skip: {
					style:      'secondary',
					text:       l10n.skipCropping,
					priority:   70,
					requires:   { library: false, selection: false },
					click:      function() {
						var selection = this.controller.state().get('selection').first();
						this.controller.state().cropperView.remove();
						this.controller.trigger('skippedcrop', selection);
						this.controller.close();
					}
				}
			});
		}

		this.frame.toolbar.set( new wp.media.view.Toolbar(toolbarOptions) );
	},

	doCrop: function( attachment ) {
		return wp.ajax.post( 'custom-header-crop', {
			nonce: attachment.get('nonces').edit,
			id: attachment.get('id'),
			cropDetails: attachment.get('cropDetails')
		} );
	}
});

module.exports = Cropper;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/customize-image-cropper.js":[function(require,module,exports){
/**
 * wp.media.controller.CustomizeImageCropper
 *
 * A state for cropping an image.
 *
 * @class
 * @augments wp.media.controller.Cropper
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 */
var Controller = wp.media.controller,
	CustomizeImageCropper;

CustomizeImageCropper = Controller.Cropper.extend({
	doCrop: function( attachment ) {
		var cropDetails = attachment.get( 'cropDetails' ),
			control = this.get( 'control' );

		cropDetails.dst_width  = control.params.width;
		cropDetails.dst_height = control.params.height;

		return wp.ajax.post( 'crop-image', {
			wp_customize: 'on',
			nonce: attachment.get( 'nonces' ).edit,
			id: attachment.get( 'id' ),
			context: control.id,
			cropDetails: cropDetails
		} );
	}
});

module.exports = CustomizeImageCropper;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/edit-image.js":[function(require,module,exports){
/**
 * wp.media.controller.EditImage
 *
 * A state for editing (cropping, etc.) an image.
 *
 * @class
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                    attributes                      The attributes hash passed to the state.
 * @param {wp.media.model.Attachment} attributes.model                The attachment.
 * @param {string}                    [attributes.id=edit-image]      Unique identifier.
 * @param {string}                    [attributes.title=Edit Image]   Title for the state. Displays in the media menu and the frame's title region.
 * @param {string}                    [attributes.content=edit-image] Initial mode for the content region.
 * @param {string}                    [attributes.toolbar=edit-image] Initial mode for the toolbar region.
 * @param {string}                    [attributes.menu=false]         Initial mode for the menu region.
 * @param {string}                    [attributes.url]                Unused. @todo Consider removal.
 */
var l10n = wp.media.view.l10n,
	EditImage;

EditImage = wp.media.controller.State.extend({
	defaults: {
		id:      'edit-image',
		title:   l10n.editImage,
		menu:    false,
		toolbar: 'edit-image',
		content: 'edit-image',
		url:     ''
	},

	/**
	 * @since 3.9.0
	 */
	activate: function() {
		this.listenTo( this.frame, 'toolbar:render:edit-image', this.toolbar );
	},

	/**
	 * @since 3.9.0
	 */
	deactivate: function() {
		this.stopListening( this.frame );
	},

	/**
	 * @since 3.9.0
	 */
	toolbar: function() {
		var frame = this.frame,
			lastState = frame.lastState(),
			previous = lastState && lastState.id;

		frame.toolbar.set( new wp.media.view.Toolbar({
			controller: frame,
			items: {
				back: {
					style: 'primary',
					text:     l10n.back,
					priority: 20,
					click:    function() {
						if ( previous ) {
							frame.setState( previous );
						} else {
							frame.close();
						}
					}
				}
			}
		}) );
	}
});

module.exports = EditImage;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/embed.js":[function(require,module,exports){
/**
 * wp.media.controller.Embed
 *
 * A state for embedding media from a URL.
 *
 * @class
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object} attributes                         The attributes hash passed to the state.
 * @param {string} [attributes.id=embed]              Unique identifier.
 * @param {string} [attributes.title=Insert From URL] Title for the state. Displays in the media menu and the frame's title region.
 * @param {string} [attributes.content=embed]         Initial mode for the content region.
 * @param {string} [attributes.menu=default]          Initial mode for the menu region.
 * @param {string} [attributes.toolbar=main-embed]    Initial mode for the toolbar region.
 * @param {string} [attributes.menu=false]            Initial mode for the menu region.
 * @param {int}    [attributes.priority=120]          The priority for the state link in the media menu.
 * @param {string} [attributes.type=link]             The type of embed. Currently only link is supported.
 * @param {string} [attributes.url]                   The embed URL.
 * @param {object} [attributes.metadata={}]           Properties of the embed, which will override attributes.url if set.
 */
var l10n = wp.media.view.l10n,
	$ = Backbone.$,
	Embed;

Embed = wp.media.controller.State.extend({
	defaults: {
		id:       'embed',
		title:    l10n.insertFromUrlTitle,
		content:  'embed',
		menu:     'default',
		toolbar:  'main-embed',
		priority: 120,
		type:     'link',
		url:      '',
		metadata: {}
	},

	// The amount of time used when debouncing the scan.
	sensitivity: 400,

	initialize: function(options) {
		this.metadata = options.metadata;
		this.debouncedScan = _.debounce( _.bind( this.scan, this ), this.sensitivity );
		this.props = new Backbone.Model( this.metadata || { url: '' });
		this.props.on( 'change:url', this.debouncedScan, this );
		this.props.on( 'change:url', this.refresh, this );
		this.on( 'scan', this.scanImage, this );
	},

	/**
	 * Trigger a scan of the embedded URL's content for metadata required to embed.
	 *
	 * @fires wp.media.controller.Embed#scan
	 */
	scan: function() {
		var scanners,
			embed = this,
			attributes = {
				type: 'link',
				scanners: []
			};

		// Scan is triggered with the list of `attributes` to set on the
		// state, useful for the 'type' attribute and 'scanners' attribute,
		// an array of promise objects for asynchronous scan operations.
		if ( this.props.get('url') ) {
			this.trigger( 'scan', attributes );
		}

		if ( attributes.scanners.length ) {
			scanners = attributes.scanners = $.when.apply( $, attributes.scanners );
			scanners.always( function() {
				if ( embed.get('scanners') === scanners ) {
					embed.set( 'loading', false );
				}
			});
		} else {
			attributes.scanners = null;
		}

		attributes.loading = !! attributes.scanners;
		this.set( attributes );
	},
	/**
	 * Try scanning the embed as an image to discover its dimensions.
	 *
	 * @param {Object} attributes
	 */
	scanImage: function( attributes ) {
		var frame = this.frame,
			state = this,
			url = this.props.get('url'),
			image = new Image(),
			deferred = $.Deferred();

		attributes.scanners.push( deferred.promise() );

		// Try to load the image and find its width/height.
		image.onload = function() {
			deferred.resolve();

			if ( state !== frame.state() || url !== state.props.get('url') ) {
				return;
			}

			state.set({
				type: 'image'
			});

			state.props.set({
				width:  image.width,
				height: image.height
			});
		};

		image.onerror = deferred.reject;
		image.src = url;
	},

	refresh: function() {
		this.frame.toolbar.get().refresh();
	},

	reset: function() {
		this.props.clear().set({ url: '' });

		if ( this.active ) {
			this.refresh();
		}
	}
});

module.exports = Embed;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/featured-image.js":[function(require,module,exports){
/**
 * wp.media.controller.FeaturedImage
 *
 * A state for selecting a featured image for a post.
 *
 * @class
 * @augments wp.media.controller.Library
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                     [attributes]                          The attributes hash passed to the state.
 * @param {string}                     [attributes.id=featured-image]        Unique identifier.
 * @param {string}                     [attributes.title=Set Featured Image] Title for the state. Displays in the media menu and the frame's title region.
 * @param {wp.media.model.Attachments} [attributes.library]                  The attachments collection to browse.
 *                                                                           If one is not supplied, a collection of all images will be created.
 * @param {boolean}                    [attributes.multiple=false]           Whether multi-select is enabled.
 * @param {string}                     [attributes.content=upload]           Initial mode for the content region.
 *                                                                           Overridden by persistent user setting if 'contentUserSetting' is true.
 * @param {string}                     [attributes.menu=default]             Initial mode for the menu region.
 * @param {string}                     [attributes.router=browse]            Initial mode for the router region.
 * @param {string}                     [attributes.toolbar=featured-image]   Initial mode for the toolbar region.
 * @param {int}                        [attributes.priority=60]              The priority for the state link in the media menu.
 * @param {boolean}                    [attributes.searchable=true]          Whether the library is searchable.
 * @param {boolean|string}             [attributes.filterable=false]         Whether the library is filterable, and if so what filters should be shown.
 *                                                                           Accepts 'all', 'uploaded', or 'unattached'.
 * @param {boolean}                    [attributes.sortable=true]            Whether the Attachments should be sortable. Depends on the orderby property being set to menuOrder on the attachments collection.
 * @param {boolean}                    [attributes.autoSelect=true]          Whether an uploaded attachment should be automatically added to the selection.
 * @param {boolean}                    [attributes.describe=false]           Whether to offer UI to describe attachments - e.g. captioning images in a gallery.
 * @param {boolean}                    [attributes.contentUserSetting=true]  Whether the content region's mode should be set and persisted per user.
 * @param {boolean}                    [attributes.syncSelection=true]       Whether the Attachments selection should be persisted from the last state.
 */
var Attachment = wp.media.model.Attachment,
	Library = wp.media.controller.Library,
	l10n = wp.media.view.l10n,
	FeaturedImage;

FeaturedImage = Library.extend({
	defaults: _.defaults({
		id:            'featured-image',
		title:         l10n.setFeaturedImageTitle,
		multiple:      false,
		filterable:    'uploaded',
		toolbar:       'featured-image',
		priority:      60,
		syncSelection: true
	}, Library.prototype.defaults ),

	/**
	 * @since 3.5.0
	 */
	initialize: function() {
		var library, comparator;

		// If we haven't been provided a `library`, create a `Selection`.
		if ( ! this.get('library') ) {
			this.set( 'library', wp.media.query({ type: 'image' }) );
		}

		Library.prototype.initialize.apply( this, arguments );

		library    = this.get('library');
		comparator = library.comparator;

		// Overload the library's comparator to push items that are not in
		// the mirrored query to the front of the aggregate collection.
		library.comparator = function( a, b ) {
			var aInQuery = !! this.mirroring.get( a.cid ),
				bInQuery = !! this.mirroring.get( b.cid );

			if ( ! aInQuery && bInQuery ) {
				return -1;
			} else if ( aInQuery && ! bInQuery ) {
				return 1;
			} else {
				return comparator.apply( this, arguments );
			}
		};

		// Add all items in the selection to the library, so any featured
		// images that are not initially loaded still appear.
		library.observe( this.get('selection') );
	},

	/**
	 * @since 3.5.0
	 */
	activate: function() {
		this.updateSelection();
		this.frame.on( 'open', this.updateSelection, this );

		Library.prototype.activate.apply( this, arguments );
	},

	/**
	 * @since 3.5.0
	 */
	deactivate: function() {
		this.frame.off( 'open', this.updateSelection, this );

		Library.prototype.deactivate.apply( this, arguments );
	},

	/**
	 * @since 3.5.0
	 */
	updateSelection: function() {
		var selection = this.get('selection'),
			id = wp.media.view.settings.post.featuredImageId,
			attachment;

		if ( '' !== id && -1 !== id ) {
			attachment = Attachment.get( id );
			attachment.fetch();
		}

		selection.reset( attachment ? [ attachment ] : [] );
	}
});

module.exports = FeaturedImage;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/gallery-add.js":[function(require,module,exports){
/**
 * wp.media.controller.GalleryAdd
 *
 * A state for selecting more images to add to a gallery.
 *
 * @class
 * @augments wp.media.controller.Library
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                     [attributes]                         The attributes hash passed to the state.
 * @param {string}                     [attributes.id=gallery-library]      Unique identifier.
 * @param {string}                     [attributes.title=Add to Gallery]    Title for the state. Displays in the frame's title region.
 * @param {boolean}                    [attributes.multiple=add]            Whether multi-select is enabled. @todo 'add' doesn't seem do anything special, and gets used as a boolean.
 * @param {wp.media.model.Attachments} [attributes.library]                 The attachments collection to browse.
 *                                                                          If one is not supplied, a collection of all images will be created.
 * @param {boolean|string}             [attributes.filterable=uploaded]     Whether the library is filterable, and if so what filters should be shown.
 *                                                                          Accepts 'all', 'uploaded', or 'unattached'.
 * @param {string}                     [attributes.menu=gallery]            Initial mode for the menu region.
 * @param {string}                     [attributes.content=upload]          Initial mode for the content region.
 *                                                                          Overridden by persistent user setting if 'contentUserSetting' is true.
 * @param {string}                     [attributes.router=browse]           Initial mode for the router region.
 * @param {string}                     [attributes.toolbar=gallery-add]     Initial mode for the toolbar region.
 * @param {boolean}                    [attributes.searchable=true]         Whether the library is searchable.
 * @param {boolean}                    [attributes.sortable=true]           Whether the Attachments should be sortable. Depends on the orderby property being set to menuOrder on the attachments collection.
 * @param {boolean}                    [attributes.autoSelect=true]         Whether an uploaded attachment should be automatically added to the selection.
 * @param {boolean}                    [attributes.contentUserSetting=true] Whether the content region's mode should be set and persisted per user.
 * @param {int}                        [attributes.priority=100]            The priority for the state link in the media menu.
 * @param {boolean}                    [attributes.syncSelection=false]     Whether the Attachments selection should be persisted from the last state.
 *                                                                          Defaults to false because for this state, because the library of the Edit Gallery state is the selection.
 */
var Selection = wp.media.model.Selection,
	Library = wp.media.controller.Library,
	l10n = wp.media.view.l10n,
	GalleryAdd;

GalleryAdd = Library.extend({
	defaults: _.defaults({
		id:            'gallery-library',
		title:         l10n.addToGalleryTitle,
		multiple:      'add',
		filterable:    'uploaded',
		menu:          'gallery',
		toolbar:       'gallery-add',
		priority:      100,
		syncSelection: false
	}, Library.prototype.defaults ),

	/**
	 * @since 3.5.0
	 */
	initialize: function() {
		// If a library wasn't supplied, create a library of images.
		if ( ! this.get('library') ) {
			this.set( 'library', wp.media.query({ type: 'image' }) );
		}

		Library.prototype.initialize.apply( this, arguments );
	},

	/**
	 * @since 3.5.0
	 */
	activate: function() {
		var library = this.get('library'),
			edit    = this.frame.state('gallery-edit').get('library');

		if ( this.editLibrary && this.editLibrary !== edit ) {
			library.unobserve( this.editLibrary );
		}

		// Accepts attachments that exist in the original library and
		// that do not exist in gallery's library.
		library.validator = function( attachment ) {
			return !! this.mirroring.get( attachment.cid ) && ! edit.get( attachment.cid ) && Selection.prototype.validator.apply( this, arguments );
		};

		// Reset the library to ensure that all attachments are re-added
		// to the collection. Do so silently, as calling `observe` will
		// trigger the `reset` event.
		library.reset( library.mirroring.models, { silent: true });
		library.observe( edit );
		this.editLibrary = edit;

		Library.prototype.activate.apply( this, arguments );
	}
});

module.exports = GalleryAdd;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/gallery-edit.js":[function(require,module,exports){
/**
 * wp.media.controller.GalleryEdit
 *
 * A state for editing a gallery's images and settings.
 *
 * @class
 * @augments wp.media.controller.Library
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                     [attributes]                       The attributes hash passed to the state.
 * @param {string}                     [attributes.id=gallery-edit]       Unique identifier.
 * @param {string}                     [attributes.title=Edit Gallery]    Title for the state. Displays in the frame's title region.
 * @param {wp.media.model.Attachments} [attributes.library]               The collection of attachments in the gallery.
 *                                                                        If one is not supplied, an empty media.model.Selection collection is created.
 * @param {boolean}                    [attributes.multiple=false]        Whether multi-select is enabled.
 * @param {boolean}                    [attributes.searchable=false]      Whether the library is searchable.
 * @param {boolean}                    [attributes.sortable=true]         Whether the Attachments should be sortable. Depends on the orderby property being set to menuOrder on the attachments collection.
 * @param {boolean}                    [attributes.date=true]             Whether to show the date filter in the browser's toolbar.
 * @param {string|false}               [attributes.content=browse]        Initial mode for the content region.
 * @param {string|false}               [attributes.toolbar=image-details] Initial mode for the toolbar region.
 * @param {boolean}                    [attributes.describe=true]         Whether to offer UI to describe attachments - e.g. captioning images in a gallery.
 * @param {boolean}                    [attributes.displaySettings=true]  Whether to show the attachment display settings interface.
 * @param {boolean}                    [attributes.dragInfo=true]         Whether to show instructional text about the attachments being sortable.
 * @param {int}                        [attributes.idealColumnWidth=170]  The ideal column width in pixels for attachments.
 * @param {boolean}                    [attributes.editing=false]         Whether the gallery is being created, or editing an existing instance.
 * @param {int}                        [attributes.priority=60]           The priority for the state link in the media menu.
 * @param {boolean}                    [attributes.syncSelection=false]   Whether the Attachments selection should be persisted from the last state.
 *                                                                        Defaults to false for this state, because the library passed in  *is* the selection.
 * @param {view}                       [attributes.AttachmentView]        The single `Attachment` view to be used in the `Attachments`.
 *                                                                        If none supplied, defaults to wp.media.view.Attachment.EditLibrary.
 */
var Library = wp.media.controller.Library,
	l10n = wp.media.view.l10n,
	GalleryEdit;

GalleryEdit = Library.extend({
	defaults: {
		id:               'gallery-edit',
		title:            l10n.editGalleryTitle,
		multiple:         false,
		searchable:       false,
		sortable:         true,
		date:             false,
		display:          false,
		content:          'browse',
		toolbar:          'gallery-edit',
		describe:         true,
		displaySettings:  true,
		dragInfo:         true,
		idealColumnWidth: 170,
		editing:          false,
		priority:         60,
		syncSelection:    false
	},

	/**
	 * @since 3.5.0
	 */
	initialize: function() {
		// If we haven't been provided a `library`, create a `Selection`.
		if ( ! this.get('library') ) {
			this.set( 'library', new wp.media.model.Selection() );
		}

		// The single `Attachment` view to be used in the `Attachments` view.
		if ( ! this.get('AttachmentView') ) {
			this.set( 'AttachmentView', wp.media.view.Attachment.EditLibrary );
		}

		Library.prototype.initialize.apply( this, arguments );
	},

	/**
	 * @since 3.5.0
	 */
	activate: function() {
		var library = this.get('library');

		// Limit the library to images only.
		library.props.set( 'type', 'image' );

		// Watch for uploaded attachments.
		this.get('library').observe( wp.Uploader.queue );

		this.frame.on( 'content:render:browse', this.gallerySettings, this );

		Library.prototype.activate.apply( this, arguments );
	},

	/**
	 * @since 3.5.0
	 */
	deactivate: function() {
		// Stop watching for uploaded attachments.
		this.get('library').unobserve( wp.Uploader.queue );

		this.frame.off( 'content:render:browse', this.gallerySettings, this );

		Library.prototype.deactivate.apply( this, arguments );
	},

	/**
	 * @since 3.5.0
	 *
	 * @param browser
	 */
	gallerySettings: function( browser ) {
		if ( ! this.get('displaySettings') ) {
			return;
		}

		var library = this.get('library');

		if ( ! library || ! browser ) {
			return;
		}

		library.gallery = library.gallery || new Backbone.Model();

		browser.sidebar.set({
			gallery: new wp.media.view.Settings.Gallery({
				controller: this,
				model:      library.gallery,
				priority:   40
			})
		});

		browser.toolbar.set( 'reverse', {
			text:     l10n.reverseOrder,
			priority: 80,

			click: function() {
				library.reset( library.toArray().reverse() );
			}
		});
	}
});

module.exports = GalleryEdit;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/image-details.js":[function(require,module,exports){
/**
 * wp.media.controller.ImageDetails
 *
 * A state for editing the attachment display settings of an image that's been
 * inserted into the editor.
 *
 * @class
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                    [attributes]                       The attributes hash passed to the state.
 * @param {string}                    [attributes.id=image-details]      Unique identifier.
 * @param {string}                    [attributes.title=Image Details]   Title for the state. Displays in the frame's title region.
 * @param {wp.media.model.Attachment} attributes.image                   The image's model.
 * @param {string|false}              [attributes.content=image-details] Initial mode for the content region.
 * @param {string|false}              [attributes.menu=false]            Initial mode for the menu region.
 * @param {string|false}              [attributes.router=false]          Initial mode for the router region.
 * @param {string|false}              [attributes.toolbar=image-details] Initial mode for the toolbar region.
 * @param {boolean}                   [attributes.editing=false]         Unused.
 * @param {int}                       [attributes.priority=60]           Unused.
 *
 * @todo This state inherits some defaults from media.controller.Library.prototype.defaults,
 *       however this may not do anything.
 */
var State = wp.media.controller.State,
	Library = wp.media.controller.Library,
	l10n = wp.media.view.l10n,
	ImageDetails;

ImageDetails = State.extend({
	defaults: _.defaults({
		id:       'image-details',
		title:    l10n.imageDetailsTitle,
		content:  'image-details',
		menu:     false,
		router:   false,
		toolbar:  'image-details',
		editing:  false,
		priority: 60
	}, Library.prototype.defaults ),

	/**
	 * @since 3.9.0
	 *
	 * @param options Attributes
	 */
	initialize: function( options ) {
		this.image = options.image;
		State.prototype.initialize.apply( this, arguments );
	},

	/**
	 * @since 3.9.0
	 */
	activate: function() {
		this.frame.modal.$el.addClass('image-details');
	}
});

module.exports = ImageDetails;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/library.js":[function(require,module,exports){
/**
 * wp.media.controller.Library
 *
 * A state for choosing an attachment or group of attachments from the media library.
 *
 * @class
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 * @mixes media.selectionSync
 *
 * @param {object}                          [attributes]                         The attributes hash passed to the state.
 * @param {string}                          [attributes.id=library]              Unique identifier.
 * @param {string}                          [attributes.title=Media library]     Title for the state. Displays in the media menu and the frame's title region.
 * @param {wp.media.model.Attachments}      [attributes.library]                 The attachments collection to browse.
 *                                                                               If one is not supplied, a collection of all attachments will be created.
 * @param {wp.media.model.Selection|object} [attributes.selection]               A collection to contain attachment selections within the state.
 *                                                                               If the 'selection' attribute is a plain JS object,
 *                                                                               a Selection will be created using its values as the selection instance's `props` model.
 *                                                                               Otherwise, it will copy the library's `props` model.
 * @param {boolean}                         [attributes.multiple=false]          Whether multi-select is enabled.
 * @param {string}                          [attributes.content=upload]          Initial mode for the content region.
 *                                                                               Overridden by persistent user setting if 'contentUserSetting' is true.
 * @param {string}                          [attributes.menu=default]            Initial mode for the menu region.
 * @param {string}                          [attributes.router=browse]           Initial mode for the router region.
 * @param {string}                          [attributes.toolbar=select]          Initial mode for the toolbar region.
 * @param {boolean}                         [attributes.searchable=true]         Whether the library is searchable.
 * @param {boolean|string}                  [attributes.filterable=false]        Whether the library is filterable, and if so what filters should be shown.
 *                                                                               Accepts 'all', 'uploaded', or 'unattached'.
 * @param {boolean}                         [attributes.sortable=true]           Whether the Attachments should be sortable. Depends on the orderby property being set to menuOrder on the attachments collection.
 * @param {boolean}                         [attributes.autoSelect=true]         Whether an uploaded attachment should be automatically added to the selection.
 * @param {boolean}                         [attributes.describe=false]          Whether to offer UI to describe attachments - e.g. captioning images in a gallery.
 * @param {boolean}                         [attributes.contentUserSetting=true] Whether the content region's mode should be set and persisted per user.
 * @param {boolean}                         [attributes.syncSelection=true]      Whether the Attachments selection should be persisted from the last state.
 */
var l10n = wp.media.view.l10n,
	getUserSetting = window.getUserSetting,
	setUserSetting = window.setUserSetting,
	Library;

Library = wp.media.controller.State.extend({
	defaults: {
		id:                 'library',
		title:              l10n.mediaLibraryTitle,
		multiple:           false,
		content:            'upload',
		menu:               'default',
		router:             'browse',
		toolbar:            'select',
		searchable:         true,
		filterable:         false,
		sortable:           true,
		autoSelect:         true,
		describe:           false,
		contentUserSetting: true,
		syncSelection:      true
	},

	/**
	 * If a library isn't provided, query all media items.
	 * If a selection instance isn't provided, create one.
	 *
	 * @since 3.5.0
	 */
	initialize: function() {
		var selection = this.get('selection'),
			props;

		if ( ! this.get('library') ) {
			this.set( 'library', wp.media.query() );
		}

		if ( ! ( selection instanceof wp.media.model.Selection ) ) {
			props = selection;

			if ( ! props ) {
				props = this.get('library').props.toJSON();
				props = _.omit( props, 'orderby', 'query' );
			}

			this.set( 'selection', new wp.media.model.Selection( null, {
				multiple: this.get('multiple'),
				props: props
			}) );
		}

		this.resetDisplays();
	},

	/**
	 * @since 3.5.0
	 */
	activate: function() {
		this.syncSelection();

		wp.Uploader.queue.on( 'add', this.uploading, this );

		this.get('selection').on( 'add remove reset', this.refreshContent, this );

		if ( this.get( 'router' ) && this.get('contentUserSetting') ) {
			this.frame.on( 'content:activate', this.saveContentMode, this );
			this.set( 'content', getUserSetting( 'libraryContent', this.get('content') ) );
		}
	},

	/**
	 * @since 3.5.0
	 */
	deactivate: function() {
		this.recordSelection();

		this.frame.off( 'content:activate', this.saveContentMode, this );

		// Unbind all event handlers that use this state as the context
		// from the selection.
		this.get('selection').off( null, null, this );

		wp.Uploader.queue.off( null, null, this );
	},

	/**
	 * Reset the library to its initial state.
	 *
	 * @since 3.5.0
	 */
	reset: function() {
		this.get('selection').reset();
		this.resetDisplays();
		this.refreshContent();
	},

	/**
	 * Reset the attachment display settings defaults to the site options.
	 *
	 * If site options don't define them, fall back to a persistent user setting.
	 *
	 * @since 3.5.0
	 */
	resetDisplays: function() {
		var defaultProps = wp.media.view.settings.defaultProps;
		this._displays = [];
		this._defaultDisplaySettings = {
			align: getUserSetting( 'align', defaultProps.align ) || 'none',
			size:  getUserSetting( 'imgsize', defaultProps.size ) || 'medium',
			link:  getUserSetting( 'urlbutton', defaultProps.link ) || 'none'
		};
	},

	/**
	 * Create a model to represent display settings (alignment, etc.) for an attachment.
	 *
	 * @since 3.5.0
	 *
	 * @param {wp.media.model.Attachment} attachment
	 * @returns {Backbone.Model}
	 */
	display: function( attachment ) {
		var displays = this._displays;

		if ( ! displays[ attachment.cid ] ) {
			displays[ attachment.cid ] = new Backbone.Model( this.defaultDisplaySettings( attachment ) );
		}
		return displays[ attachment.cid ];
	},

	/**
	 * Given an attachment, create attachment display settings properties.
	 *
	 * @since 3.6.0
	 *
	 * @param {wp.media.model.Attachment} attachment
	 * @returns {Object}
	 */
	defaultDisplaySettings: function( attachment ) {
		var settings = this._defaultDisplaySettings;
		if ( settings.canEmbed = this.canEmbed( attachment ) ) {
			settings.link = 'embed';
		}
		return settings;
	},

	/**
	 * Whether an attachment can be embedded (audio or video).
	 *
	 * @since 3.6.0
	 *
	 * @param {wp.media.model.Attachment} attachment
	 * @returns {Boolean}
	 */
	canEmbed: function( attachment ) {
		// If uploading, we know the filename but not the mime type.
		if ( ! attachment.get('uploading') ) {
			var type = attachment.get('type');
			if ( type !== 'audio' && type !== 'video' ) {
				return false;
			}
		}

		return _.contains( wp.media.view.settings.embedExts, attachment.get('filename').split('.').pop() );
	},


	/**
	 * If the state is active, no items are selected, and the current
	 * content mode is not an option in the state's router (provided
	 * the state has a router), reset the content mode to the default.
	 *
	 * @since 3.5.0
	 */
	refreshContent: function() {
		var selection = this.get('selection'),
			frame = this.frame,
			router = frame.router.get(),
			mode = frame.content.mode();

		if ( this.active && ! selection.length && router && ! router.get( mode ) ) {
			this.frame.content.render( this.get('content') );
		}
	},

	/**
	 * Callback handler when an attachment is uploaded.
	 *
	 * Switch to the Media Library if uploaded from the 'Upload Files' tab.
	 *
	 * Adds any uploading attachments to the selection.
	 *
	 * If the state only supports one attachment to be selected and multiple
	 * attachments are uploaded, the last attachment in the upload queue will
	 * be selected.
	 *
	 * @since 3.5.0
	 *
	 * @param {wp.media.model.Attachment} attachment
	 */
	uploading: function( attachment ) {
		var content = this.frame.content;

		if ( 'upload' === content.mode() ) {
			this.frame.content.mode('browse');
		}

		if ( this.get( 'autoSelect' ) ) {
			this.get('selection').add( attachment );
			this.frame.trigger( 'library:selection:add' );
		}
	},

	/**
	 * Persist the mode of the content region as a user setting.
	 *
	 * @since 3.5.0
	 */
	saveContentMode: function() {
		if ( 'browse' !== this.get('router') ) {
			return;
		}

		var mode = this.frame.content.mode(),
			view = this.frame.router.get();

		if ( view && view.get( mode ) ) {
			setUserSetting( 'libraryContent', mode );
		}
	}
});

// Make selectionSync available on any Media Library state.
_.extend( Library.prototype, wp.media.selectionSync );

module.exports = Library;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/media-library.js":[function(require,module,exports){
/**
 * wp.media.controller.MediaLibrary
 *
 * @class
 * @augments wp.media.controller.Library
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 */
var Library = wp.media.controller.Library,
	MediaLibrary;

MediaLibrary = Library.extend({
	defaults: _.defaults({
		// Attachments browser defaults. @see media.view.AttachmentsBrowser
		filterable:      'uploaded',

		displaySettings: false,
		priority:        80,
		syncSelection:   false
	}, Library.prototype.defaults ),

	/**
	 * @since 3.9.0
	 *
	 * @param options
	 */
	initialize: function( options ) {
		this.media = options.media;
		this.type = options.type;
		this.set( 'library', wp.media.query({ type: this.type }) );

		Library.prototype.initialize.apply( this, arguments );
	},

	/**
	 * @since 3.9.0
	 */
	activate: function() {
		// @todo this should use this.frame.
		if ( wp.media.frame.lastMime ) {
			this.set( 'library', wp.media.query({ type: wp.media.frame.lastMime }) );
			delete wp.media.frame.lastMime;
		}
		Library.prototype.activate.apply( this, arguments );
	}
});

module.exports = MediaLibrary;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/region.js":[function(require,module,exports){
/**
 * wp.media.controller.Region
 *
 * A region is a persistent application layout area.
 *
 * A region assumes one mode at any time, and can be switched to another.
 *
 * When mode changes, events are triggered on the region's parent view.
 * The parent view will listen to specific events and fill the region with an
 * appropriate view depending on mode. For example, a frame listens for the
 * 'browse' mode t be activated on the 'content' view and then fills the region
 * with an AttachmentsBrowser view.
 *
 * @class
 *
 * @param {object}        options          Options hash for the region.
 * @param {string}        options.id       Unique identifier for the region.
 * @param {Backbone.View} options.view     A parent view the region exists within.
 * @param {string}        options.selector jQuery selector for the region within the parent view.
 */
var Region = function( options ) {
	_.extend( this, _.pick( options || {}, 'id', 'view', 'selector' ) );
};

// Use Backbone's self-propagating `extend` inheritance method.
Region.extend = Backbone.Model.extend;

_.extend( Region.prototype, {
	/**
	 * Activate a mode.
	 *
	 * @since 3.5.0
	 *
	 * @param {string} mode
	 *
	 * @fires this.view#{this.id}:activate:{this._mode}
	 * @fires this.view#{this.id}:activate
	 * @fires this.view#{this.id}:deactivate:{this._mode}
	 * @fires this.view#{this.id}:deactivate
	 *
	 * @returns {wp.media.controller.Region} Returns itself to allow chaining.
	 */
	mode: function( mode ) {
		if ( ! mode ) {
			return this._mode;
		}
		// Bail if we're trying to change to the current mode.
		if ( mode === this._mode ) {
			return this;
		}

		/**
		 * Region mode deactivation event.
		 *
		 * @event this.view#{this.id}:deactivate:{this._mode}
		 * @event this.view#{this.id}:deactivate
		 */
		this.trigger('deactivate');

		this._mode = mode;
		this.render( mode );

		/**
		 * Region mode activation event.
		 *
		 * @event this.view#{this.id}:activate:{this._mode}
		 * @event this.view#{this.id}:activate
		 */
		this.trigger('activate');
		return this;
	},
	/**
	 * Render a mode.
	 *
	 * @since 3.5.0
	 *
	 * @param {string} mode
	 *
	 * @fires this.view#{this.id}:create:{this._mode}
	 * @fires this.view#{this.id}:create
	 * @fires this.view#{this.id}:render:{this._mode}
	 * @fires this.view#{this.id}:render
	 *
	 * @returns {wp.media.controller.Region} Returns itself to allow chaining
	 */
	render: function( mode ) {
		// If the mode isn't active, activate it.
		if ( mode && mode !== this._mode ) {
			return this.mode( mode );
		}

		var set = { view: null },
			view;

		/**
		 * Create region view event.
		 *
		 * Region view creation takes place in an event callback on the frame.
		 *
		 * @event this.view#{this.id}:create:{this._mode}
		 * @event this.view#{this.id}:create
		 */
		this.trigger( 'create', set );
		view = set.view;

		/**
		 * Render region view event.
		 *
		 * Region view creation takes place in an event callback on the frame.
		 *
		 * @event this.view#{this.id}:create:{this._mode}
		 * @event this.view#{this.id}:create
		 */
		this.trigger( 'render', view );
		if ( view ) {
			this.set( view );
		}
		return this;
	},

	/**
	 * Get the region's view.
	 *
	 * @since 3.5.0
	 *
	 * @returns {wp.media.View}
	 */
	get: function() {
		return this.view.views.first( this.selector );
	},

	/**
	 * Set the region's view as a subview of the frame.
	 *
	 * @since 3.5.0
	 *
	 * @param {Array|Object} views
	 * @param {Object} [options={}]
	 * @returns {wp.Backbone.Subviews} Subviews is returned to allow chaining
	 */
	set: function( views, options ) {
		if ( options ) {
			options.add = false;
		}
		return this.view.views.set( this.selector, views, options );
	},

	/**
	 * Trigger regional view events on the frame.
	 *
	 * @since 3.5.0
	 *
	 * @param {string} event
	 * @returns {undefined|wp.media.controller.Region} Returns itself to allow chaining.
	 */
	trigger: function( event ) {
		var base, args;

		if ( ! this._mode ) {
			return;
		}

		args = _.toArray( arguments );
		base = this.id + ':' + event;

		// Trigger `{this.id}:{event}:{this._mode}` event on the frame.
		args[0] = base + ':' + this._mode;
		this.view.trigger.apply( this.view, args );

		// Trigger `{this.id}:{event}` event on the frame.
		args[0] = base;
		this.view.trigger.apply( this.view, args );
		return this;
	}
});

module.exports = Region;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/replace-image.js":[function(require,module,exports){
/**
 * wp.media.controller.ReplaceImage
 *
 * A state for replacing an image.
 *
 * @class
 * @augments wp.media.controller.Library
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 *
 * @param {object}                     [attributes]                         The attributes hash passed to the state.
 * @param {string}                     [attributes.id=replace-image]        Unique identifier.
 * @param {string}                     [attributes.title=Replace Image]     Title for the state. Displays in the media menu and the frame's title region.
 * @param {wp.media.model.Attachments} [attributes.library]                 The attachments collection to browse.
 *                                                                          If one is not supplied, a collection of all images will be created.
 * @param {boolean}                    [attributes.multiple=false]          Whether multi-select is enabled.
 * @param {string}                     [attributes.content=upload]          Initial mode for the content region.
 *                                                                          Overridden by persistent user setting if 'contentUserSetting' is true.
 * @param {string}                     [attributes.menu=default]            Initial mode for the menu region.
 * @param {string}                     [attributes.router=browse]           Initial mode for the router region.
 * @param {string}                     [attributes.toolbar=replace]         Initial mode for the toolbar region.
 * @param {int}                        [attributes.priority=60]             The priority for the state link in the media menu.
 * @param {boolean}                    [attributes.searchable=true]         Whether the library is searchable.
 * @param {boolean|string}             [attributes.filterable=uploaded]     Whether the library is filterable, and if so what filters should be shown.
 *                                                                          Accepts 'all', 'uploaded', or 'unattached'.
 * @param {boolean}                    [attributes.sortable=true]           Whether the Attachments should be sortable. Depends on the orderby property being set to menuOrder on the attachments collection.
 * @param {boolean}                    [attributes.autoSelect=true]         Whether an uploaded attachment should be automatically added to the selection.
 * @param {boolean}                    [attributes.describe=false]          Whether to offer UI to describe attachments - e.g. captioning images in a gallery.
 * @param {boolean}                    [attributes.contentUserSetting=true] Whether the content region's mode should be set and persisted per user.
 * @param {boolean}                    [attributes.syncSelection=true]      Whether the Attachments selection should be persisted from the last state.
 */
var Library = wp.media.controller.Library,
	l10n = wp.media.view.l10n,
	ReplaceImage;

ReplaceImage = Library.extend({
	defaults: _.defaults({
		id:            'replace-image',
		title:         l10n.replaceImageTitle,
		multiple:      false,
		filterable:    'uploaded',
		toolbar:       'replace',
		menu:          false,
		priority:      60,
		syncSelection: true
	}, Library.prototype.defaults ),

	/**
	 * @since 3.9.0
	 *
	 * @param options
	 */
	initialize: function( options ) {
		var library, comparator;

		this.image = options.image;
		// If we haven't been provided a `library`, create a `Selection`.
		if ( ! this.get('library') ) {
			this.set( 'library', wp.media.query({ type: 'image' }) );
		}

		Library.prototype.initialize.apply( this, arguments );

		library    = this.get('library');
		comparator = library.comparator;

		// Overload the library's comparator to push items that are not in
		// the mirrored query to the front of the aggregate collection.
		library.comparator = function( a, b ) {
			var aInQuery = !! this.mirroring.get( a.cid ),
				bInQuery = !! this.mirroring.get( b.cid );

			if ( ! aInQuery && bInQuery ) {
				return -1;
			} else if ( aInQuery && ! bInQuery ) {
				return 1;
			} else {
				return comparator.apply( this, arguments );
			}
		};

		// Add all items in the selection to the library, so any featured
		// images that are not initially loaded still appear.
		library.observe( this.get('selection') );
	},

	/**
	 * @since 3.9.0
	 */
	activate: function() {
		this.updateSelection();
		Library.prototype.activate.apply( this, arguments );
	},

	/**
	 * @since 3.9.0
	 */
	updateSelection: function() {
		var selection = this.get('selection'),
			attachment = this.image.attachment;

		selection.reset( attachment ? [ attachment ] : [] );
	}
});

module.exports = ReplaceImage;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/site-icon-cropper.js":[function(require,module,exports){
/**
 * wp.media.controller.SiteIconCropper
 *
 * A state for cropping a Site Icon.
 *
 * @class
 * @augments wp.media.controller.Cropper
 * @augments wp.media.controller.State
 * @augments Backbone.Model
 */
var Controller = wp.media.controller,
	SiteIconCropper;

SiteIconCropper = Controller.Cropper.extend({
	activate: function() {
		this.frame.on( 'content:create:crop', this.createCropContent, this );
		this.frame.on( 'close', this.removeCropper, this );
		this.set('selection', new Backbone.Collection(this.frame._selection.single));
	},

	createCropContent: function() {
		this.cropperView = new wp.media.view.SiteIconCropper({
			controller: this,
			attachment: this.get('selection').first()
		});
		this.cropperView.on('image-loaded', this.createCropToolbar, this);
		this.frame.content.set(this.cropperView);

	},

	doCrop: function( attachment ) {
		var cropDetails = attachment.get( 'cropDetails' ),
			control = this.get( 'control' );

		cropDetails.dst_width  = control.params.width;
		cropDetails.dst_height = control.params.height;

		return wp.ajax.post( 'crop-image', {
			nonce: attachment.get( 'nonces' ).edit,
			id: attachment.get( 'id' ),
			context: 'site-icon',
			cropDetails: cropDetails
		} );
	}
});

module.exports = SiteIconCropper;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/state-machine.js":[function(require,module,exports){
/**
 * wp.media.controller.StateMachine
 *
 * A state machine keeps track of state. It is in one state at a time,
 * and can change from one state to another.
 *
 * States are stored as models in a Backbone collection.
 *
 * @since 3.5.0
 *
 * @class
 * @augments Backbone.Model
 * @mixin
 * @mixes Backbone.Events
 *
 * @param {Array} states
 */
var StateMachine = function( states ) {
	// @todo This is dead code. The states collection gets created in media.view.Frame._createStates.
	this.states = new Backbone.Collection( states );
};

// Use Backbone's self-propagating `extend` inheritance method.
StateMachine.extend = Backbone.Model.extend;

_.extend( StateMachine.prototype, Backbone.Events, {
	/**
	 * Fetch a state.
	 *
	 * If no `id` is provided, returns the active state.
	 *
	 * Implicitly creates states.
	 *
	 * Ensure that the `states` collection exists so the `StateMachine`
	 *   can be used as a mixin.
	 *
	 * @since 3.5.0
	 *
	 * @param {string} id
	 * @returns {wp.media.controller.State} Returns a State model
	 *   from the StateMachine collection
	 */
	state: function( id ) {
		this.states = this.states || new Backbone.Collection();

		// Default to the active state.
		id = id || this._state;

		if ( id && ! this.states.get( id ) ) {
			this.states.add({ id: id });
		}
		return this.states.get( id );
	},

	/**
	 * Sets the active state.
	 *
	 * Bail if we're trying to select the current state, if we haven't
	 * created the `states` collection, or are trying to select a state
	 * that does not exist.
	 *
	 * @since 3.5.0
	 *
	 * @param {string} id
	 *
	 * @fires wp.media.controller.State#deactivate
	 * @fires wp.media.controller.State#activate
	 *
	 * @returns {wp.media.controller.StateMachine} Returns itself to allow chaining
	 */
	setState: function( id ) {
		var previous = this.state();

		if ( ( previous && id === previous.id ) || ! this.states || ! this.states.get( id ) ) {
			return this;
		}

		if ( previous ) {
			previous.trigger('deactivate');
			this._lastState = previous.id;
		}

		this._state = id;
		this.state().trigger('activate');

		return this;
	},

	/**
	 * Returns the previous active state.
	 *
	 * Call the `state()` method with no parameters to retrieve the current
	 * active state.
	 *
	 * @since 3.5.0
	 *
	 * @returns {wp.media.controller.State} Returns a State model
	 *    from the StateMachine collection
	 */
	lastState: function() {
		if ( this._lastState ) {
			return this.state( this._lastState );
		}
	}
});

// Map all event binding and triggering on a StateMachine to its `states` collection.
_.each([ 'on', 'off', 'trigger' ], function( method ) {
	/**
	 * @returns {wp.media.controller.StateMachine} Returns itself to allow chaining.
	 */
	StateMachine.prototype[ method ] = function() {
		// Ensure that the `states` collection exists so the `StateMachine`
		// can be used as a mixin.
		this.states = this.states || new Backbone.Collection();
		// Forward the method to the `states` collection.
		this.states[ method ].apply( this.states, arguments );
		return this;
	};
});

module.exports = StateMachine;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/state.js":[function(require,module,exports){
/**
 * wp.media.controller.State
 *
 * A state is a step in a workflow that when set will trigger the controllers
 * for the regions to be updated as specified in the frame.
 *
 * A state has an event-driven lifecycle:
 *
 *     'ready'      triggers when a state is added to a state machine's collection.
 *     'activate'   triggers when a state is activated by a state machine.
 *     'deactivate' triggers when a state is deactivated by a state machine.
 *     'reset'      is not triggered automatically. It should be invoked by the
 *                  proper controller to reset the state to its default.
 *
 * @class
 * @augments Backbone.Model
 */
var State = Backbone.Model.extend({
	/**
	 * Constructor.
	 *
	 * @since 3.5.0
	 */
	constructor: function() {
		this.on( 'activate', this._preActivate, this );
		this.on( 'activate', this.activate, this );
		this.on( 'activate', this._postActivate, this );
		this.on( 'deactivate', this._deactivate, this );
		this.on( 'deactivate', this.deactivate, this );
		this.on( 'reset', this.reset, this );
		this.on( 'ready', this._ready, this );
		this.on( 'ready', this.ready, this );
		/**
		 * Call parent constructor with passed arguments
		 */
		Backbone.Model.apply( this, arguments );
		this.on( 'change:menu', this._updateMenu, this );
	},
	/**
	 * Ready event callback.
	 *
	 * @abstract
	 * @since 3.5.0
	 */
	ready: function() {},

	/**
	 * Activate event callback.
	 *
	 * @abstract
	 * @since 3.5.0
	 */
	activate: function() {},

	/**
	 * Deactivate event callback.
	 *
	 * @abstract
	 * @since 3.5.0
	 */
	deactivate: function() {},

	/**
	 * Reset event callback.
	 *
	 * @abstract
	 * @since 3.5.0
	 */
	reset: function() {},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_ready: function() {
		this._updateMenu();
	},

	/**
	 * @access private
	 * @since 3.5.0
	*/
	_preActivate: function() {
		this.active = true;
	},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_postActivate: function() {
		this.on( 'change:menu', this._menu, this );
		this.on( 'change:titleMode', this._title, this );
		this.on( 'change:content', this._content, this );
		this.on( 'change:toolbar', this._toolbar, this );

		this.frame.on( 'title:render:default', this._renderTitle, this );

		this._title();
		this._menu();
		this._toolbar();
		this._content();
		this._router();
	},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_deactivate: function() {
		this.active = false;

		this.frame.off( 'title:render:default', this._renderTitle, this );

		this.off( 'change:menu', this._menu, this );
		this.off( 'change:titleMode', this._title, this );
		this.off( 'change:content', this._content, this );
		this.off( 'change:toolbar', this._toolbar, this );
	},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_title: function() {
		this.frame.title.render( this.get('titleMode') || 'default' );
	},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_renderTitle: function( view ) {
		view.$el.text( this.get('title') || '' );
	},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_router: function() {
		var router = this.frame.router,
			mode = this.get('router'),
			view;

		this.frame.$el.toggleClass( 'hide-router', ! mode );
		if ( ! mode ) {
			return;
		}

		this.frame.router.render( mode );

		view = router.get();
		if ( view && view.select ) {
			view.select( this.frame.content.mode() );
		}
	},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_menu: function() {
		var menu = this.frame.menu,
			mode = this.get('menu'),
			view;

		this.frame.$el.toggleClass( 'hide-menu', ! mode );
		if ( ! mode ) {
			return;
		}

		menu.mode( mode );

		view = menu.get();
		if ( view && view.select ) {
			view.select( this.id );
		}
	},

	/**
	 * @access private
	 * @since 3.5.0
	 */
	_updateMenu: function() {
		var previous = this.previous('menu'),
			menu = this.get('menu');

		if ( previous ) {
			this.frame.off( 'menu:render:' + previous, this._renderMenu, this );
		}

		if ( menu ) {
			this.frame.on( 'menu:render:' + menu, this._renderMenu, this );
		}
	},

	/**
	 * Create a view in the media menu for the state.
	 *
	 * @access private
	 * @since 3.5.0
	 *
	 * @param {media.view.Menu} view The menu view.
	 */
	_renderMenu: function( view ) {
		var menuItem = this.get('menuItem'),
			title = this.get('title'),
			priority = this.get('priority');

		if ( ! menuItem && title ) {
			menuItem = { text: title };

			if ( priority ) {
				menuItem.priority = priority;
			}
		}

		if ( ! menuItem ) {
			return;
		}

		view.set( this.id, menuItem );
	}
});

_.each(['toolbar','content'], function( region ) {
	/**
	 * @access private
	 */
	State.prototype[ '_' + region ] = function() {
		var mode = this.get( region );
		if ( mode ) {
			this.frame[ region ].render( mode );
		}
	};
});

module.exports = State;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/utils/selection-sync.js":[function(require,module,exports){
/**
 * wp.media.selectionSync
 *
 * Sync an attachments selection in a state with another state.
 *
 * Allows for selecting multiple images in the Insert Media workflow, and then
 * switching to the Insert Gallery workflow while preserving the attachments selection.
 *
 * @mixin
 */
var selectionSync = {
	/**
	 * @since 3.5.0
	 */
	syncSelection: function() {
		var selection = this.get('selection'),
			manager = this.frame._selection;

		if ( ! this.get('syncSelection') || ! manager || ! selection ) {
			return;
		}

		// If the selection supports multiple items, validate the stored
		// attachments based on the new selection's conditions. Record
		// the attachments that are not included; we'll maintain a
		// reference to those. Other attachments are considered in flux.
		if ( selection.multiple ) {
			selection.reset( [], { silent: true });
			selection.validateAll( manager.attachments );
			manager.difference = _.difference( manager.attachments.models, selection.models );
		}

		// Sync the selection's single item with the master.
		selection.single( manager.single );
	},

	/**
	 * Record the currently active attachments, which is a combination
	 * of the selection's attachments and the set of selected
	 * attachments that this specific selection considered invalid.
	 * Reset the difference and record the single attachment.
	 *
	 * @since 3.5.0
	 */
	recordSelection: function() {
		var selection = this.get('selection'),
			manager = this.frame._selection;

		if ( ! this.get('syncSelection') || ! manager || ! selection ) {
			return;
		}

		if ( selection.multiple ) {
			manager.attachments.reset( selection.toArray().concat( manager.difference ) );
			manager.difference = [];
		} else {
			manager.attachments.add( selection.toArray() );
		}

		manager.single = selection._single;
	}
};

module.exports = selectionSync;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views.manifest.js":[function(require,module,exports){
var media = wp.media,
	$ = jQuery,
	l10n;

media.isTouchDevice = ( 'ontouchend' in document );

// Link any localized strings.
l10n = media.view.l10n = window._wpMediaViewsL10n || {};

// Link any settings.
media.view.settings = l10n.settings || {};
delete l10n.settings;

// Copy the `post` setting over to the model settings.
media.model.settings.post = media.view.settings.post;

// Check if the browser supports CSS 3.0 transitions
$.support.transition = (function(){
	var style = document.documentElement.style,
		transitions = {
			WebkitTransition: 'webkitTransitionEnd',
			MozTransition:    'transitionend',
			OTransition:      'oTransitionEnd otransitionend',
			transition:       'transitionend'
		}, transition;

	transition = _.find( _.keys( transitions ), function( transition ) {
		return ! _.isUndefined( style[ transition ] );
	});

	return transition && {
		end: transitions[ transition ]
	};
}());

/**
 * A shared event bus used to provide events into
 * the media workflows that 3rd-party devs can use to hook
 * in.
 */
media.events = _.extend( {}, Backbone.Events );

/**
 * Makes it easier to bind events using transitions.
 *
 * @param {string} selector
 * @param {Number} sensitivity
 * @returns {Promise}
 */
media.transition = function( selector, sensitivity ) {
	var deferred = $.Deferred();

	sensitivity = sensitivity || 2000;

	if ( $.support.transition ) {
		if ( ! (selector instanceof $) ) {
			selector = $( selector );
		}

		// Resolve the deferred when the first element finishes animating.
		selector.first().one( $.support.transition.end, deferred.resolve );

		// Just in case the event doesn't trigger, fire a callback.
		_.delay( deferred.resolve, sensitivity );

	// Otherwise, execute on the spot.
	} else {
		deferred.resolve();
	}

	return deferred.promise();
};

media.controller.Region = require( './controllers/region.js' );
media.controller.StateMachine = require( './controllers/state-machine.js' );
media.controller.State = require( './controllers/state.js' );

media.selectionSync = require( './utils/selection-sync.js' );
media.controller.Library = require( './controllers/library.js' );
media.controller.ImageDetails = require( './controllers/image-details.js' );
media.controller.GalleryEdit = require( './controllers/gallery-edit.js' );
media.controller.GalleryAdd = require( './controllers/gallery-add.js' );
media.controller.CollectionEdit = require( './controllers/collection-edit.js' );
media.controller.CollectionAdd = require( './controllers/collection-add.js' );
media.controller.FeaturedImage = require( './controllers/featured-image.js' );
media.controller.ReplaceImage = require( './controllers/replace-image.js' );
media.controller.EditImage = require( './controllers/edit-image.js' );
media.controller.MediaLibrary = require( './controllers/media-library.js' );
media.controller.Embed = require( './controllers/embed.js' );
media.controller.Cropper = require( './controllers/cropper.js' );
media.controller.CustomizeImageCropper = require( './controllers/customize-image-cropper.js' );
media.controller.SiteIconCropper = require( './controllers/site-icon-cropper.js' );

media.View = require( './views/view.js' );
media.view.Frame = require( './views/frame.js' );
media.view.MediaFrame = require( './views/media-frame.js' );
media.view.MediaFrame.Select = require( './views/frame/select.js' );
media.view.MediaFrame.Post = require( './views/frame/post.js' );
media.view.MediaFrame.ImageDetails = require( './views/frame/image-details.js' );
media.view.Modal = require( './views/modal.js' );
media.view.FocusManager = require( './views/focus-manager.js' );
media.view.UploaderWindow = require( './views/uploader/window.js' );
media.view.EditorUploader = require( './views/uploader/editor.js' );
media.view.UploaderInline = require( './views/uploader/inline.js' );
media.view.UploaderStatus = require( './views/uploader/status.js' );
media.view.UploaderStatusError = require( './views/uploader/status-error.js' );
media.view.Toolbar = require( './views/toolbar.js' );
media.view.Toolbar.Select = require( './views/toolbar/select.js' );
media.view.Toolbar.Embed = require( './views/toolbar/embed.js' );
media.view.Button = require( './views/button.js' );
media.view.ButtonGroup = require( './views/button-group.js' );
media.view.PriorityList = require( './views/priority-list.js' );
media.view.MenuItem = require( './views/menu-item.js' );
media.view.Menu = require( './views/menu.js' );
media.view.RouterItem = require( './views/router-item.js' );
media.view.Router = require( './views/router.js' );
media.view.Sidebar = require( './views/sidebar.js' );
media.view.Attachment = require( './views/attachment.js' );
media.view.Attachment.Library = require( './views/attachment/library.js' );
media.view.Attachment.EditLibrary = require( './views/attachment/edit-library.js' );
media.view.Attachments = require( './views/attachments.js' );
media.view.Search = require( './views/search.js' );
media.view.AttachmentFilters = require( './views/attachment-filters.js' );
media.view.DateFilter = require( './views/attachment-filters/date.js' );
media.view.AttachmentFilters.Uploaded = require( './views/attachment-filters/uploaded.js' );
media.view.AttachmentFilters.All = require( './views/attachment-filters/all.js' );
media.view.AttachmentsBrowser = require( './views/attachments/browser.js' );
media.view.Selection = require( './views/selection.js' );
media.view.Attachment.Selection = require( './views/attachment/selection.js' );
media.view.Attachments.Selection = require( './views/attachments/selection.js' );
media.view.Attachment.EditSelection = require( './views/attachment/edit-selection.js' );
media.view.Settings = require( './views/settings.js' );
media.view.Settings.AttachmentDisplay = require( './views/settings/attachment-display.js' );
media.view.Settings.Gallery = require( './views/settings/gallery.js' );
media.view.Settings.Playlist = require( './views/settings/playlist.js' );
media.view.Attachment.Details = require( './views/attachment/details.js' );
media.view.AttachmentCompat = require( './views/attachment-compat.js' );
media.view.Iframe = require( './views/iframe.js' );
media.view.Embed = require( './views/embed.js' );
media.view.Label = require( './views/label.js' );
media.view.EmbedUrl = require( './views/embed/url.js' );
media.view.EmbedLink = require( './views/embed/link.js' );
media.view.EmbedImage = require( './views/embed/image.js' );
media.view.ImageDetails = require( './views/image-details.js' );
media.view.Cropper = require( './views/cropper.js' );
media.view.SiteIconCropper = require( './views/site-icon-cropper.js' );
media.view.SiteIconPreview = require( './views/site-icon-preview.js' );
media.view.EditImage = require( './views/edit-image.js' );
media.view.Spinner = require( './views/spinner.js' );

},{"./controllers/collection-add.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/collection-add.js","./controllers/collection-edit.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/collection-edit.js","./controllers/cropper.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/cropper.js","./controllers/customize-image-cropper.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/customize-image-cropper.js","./controllers/edit-image.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/edit-image.js","./controllers/embed.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/embed.js","./controllers/featured-image.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/featured-image.js","./controllers/gallery-add.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/gallery-add.js","./controllers/gallery-edit.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/gallery-edit.js","./controllers/image-details.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/image-details.js","./controllers/library.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/library.js","./controllers/media-library.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/media-library.js","./controllers/region.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/region.js","./controllers/replace-image.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/replace-image.js","./controllers/site-icon-cropper.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/site-icon-cropper.js","./controllers/state-machine.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/state-machine.js","./controllers/state.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/controllers/state.js","./utils/selection-sync.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/utils/selection-sync.js","./views/attachment-compat.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment-compat.js","./views/attachment-filters.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment-filters.js","./views/attachment-filters/all.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment-filters/all.js","./views/attachment-filters/date.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment-filters/date.js","./views/attachment-filters/uploaded.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment-filters/uploaded.js","./views/attachment.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment.js","./views/attachment/details.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment/details.js","./views/attachment/edit-library.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment/edit-library.js","./views/attachment/edit-selection.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment/edit-selection.js","./views/attachment/library.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment/library.js","./views/attachment/selection.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment/selection.js","./views/attachments.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachments.js","./views/attachments/browser.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachments/browser.js","./views/attachments/selection.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachments/selection.js","./views/button-group.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/button-group.js","./views/button.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/button.js","./views/cropper.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/cropper.js","./views/edit-image.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/edit-image.js","./views/embed.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/embed.js","./views/embed/image.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/embed/image.js","./views/embed/link.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/embed/link.js","./views/embed/url.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/embed/url.js","./views/focus-manager.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/focus-manager.js","./views/frame.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/frame.js","./views/frame/image-details.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/frame/image-details.js","./views/frame/post.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/frame/post.js","./views/frame/select.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/frame/select.js","./views/iframe.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/iframe.js","./views/image-details.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/image-details.js","./views/label.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/label.js","./views/media-frame.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/media-frame.js","./views/menu-item.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/menu-item.js","./views/menu.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/menu.js","./views/modal.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/modal.js","./views/priority-list.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/priority-list.js","./views/router-item.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/router-item.js","./views/router.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/router.js","./views/search.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/search.js","./views/selection.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/selection.js","./views/settings.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/settings.js","./views/settings/attachment-display.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/settings/attachment-display.js","./views/settings/gallery.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/settings/gallery.js","./views/settings/playlist.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/settings/playlist.js","./views/sidebar.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/sidebar.js","./views/site-icon-cropper.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/site-icon-cropper.js","./views/site-icon-preview.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/site-icon-preview.js","./views/spinner.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/spinner.js","./views/toolbar.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/toolbar.js","./views/toolbar/embed.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/toolbar/embed.js","./views/toolbar/select.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/toolbar/select.js","./views/uploader/editor.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/uploader/editor.js","./views/uploader/inline.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/uploader/inline.js","./views/uploader/status-error.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/uploader/status-error.js","./views/uploader/status.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/uploader/status.js","./views/uploader/window.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/uploader/window.js","./views/view.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/view.js"}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment-compat.js":[function(require,module,exports){
/**
 * wp.media.view.AttachmentCompat
 *
 * A view to display fields added via the `attachment_fields_to_edit` filter.
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	AttachmentCompat;

AttachmentCompat = View.extend({
	tagName:   'form',
	className: 'compat-item',

	events: {
		'submit':          'preventDefault',
		'change input':    'save',
		'change select':   'save',
		'change textarea': 'save'
	},

	initialize: function() {
		this.listenTo( this.model, 'change:compat', this.render );
	},
	/**
	 * @returns {wp.media.view.AttachmentCompat} Returns itself to allow chaining
	 */
	dispose: function() {
		if ( this.$(':focus').length ) {
			this.save();
		}
		/**
		 * call 'dispose' directly on the parent class
		 */
		return View.prototype.dispose.apply( this, arguments );
	},
	/**
	 * @returns {wp.media.view.AttachmentCompat} Returns itself to allow chaining
	 */
	render: function() {
		var compat = this.model.get('compat');
		if ( ! compat || ! compat.item ) {
			return;
		}

		this.views.detach();
		this.$el.html( compat.item );
		this.views.render();
		return this;
	},
	/**
	 * @param {Object} event
	 */
	preventDefault: function( event ) {
		event.preventDefault();
	},
	/**
	 * @param {Object} event
	 */
	save: function( event ) {
		var data = {};

		if ( event ) {
			event.preventDefault();
		}

		_.each( this.$el.serializeArray(), function( pair ) {
			data[ pair.name ] = pair.value;
		});

		this.controller.trigger( 'attachment:compat:waiting', ['waiting'] );
		this.model.saveCompat( data ).always( _.bind( this.postSave, this ) );
	},

	postSave: function() {
		this.controller.trigger( 'attachment:compat:ready', ['ready'] );
	}
});

module.exports = AttachmentCompat;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment-filters.js":[function(require,module,exports){
/**
 * wp.media.view.AttachmentFilters
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var $ = jQuery,
	AttachmentFilters;

AttachmentFilters = wp.media.View.extend({
	tagName:   'select',
	className: 'attachment-filters',
	id:        'media-attachment-filters',

	events: {
		change: 'change'
	},

	keys: [],

	initialize: function() {
		this.createFilters();
		_.extend( this.filters, this.options.filters );

		// Build `<option>` elements.
		this.$el.html( _.chain( this.filters ).map( function( filter, value ) {
			return {
				el: $( '<option></option>' ).val( value ).html( filter.text )[0],
				priority: filter.priority || 50
			};
		}, this ).sortBy('priority').pluck('el').value() );

		this.listenTo( this.model, 'change', this.select );
		this.select();
	},

	/**
	 * @abstract
	 */
	createFilters: function() {
		this.filters = {};
	},

	/**
	 * When the selected filter changes, update the Attachment Query properties to match.
	 */
	change: function() {
		var filter = this.filters[ this.el.value ];
		if ( filter ) {
			this.model.set( filter.props );
		}
	},

	select: function() {
		var model = this.model,
			value = 'all',
			props = model.toJSON();

		_.find( this.filters, function( filter, id ) {
			var equal = _.all( filter.props, function( prop, key ) {
				return prop === ( _.isUndefined( props[ key ] ) ? null : props[ key ] );
			});

			if ( equal ) {
				return value = id;
			}
		});

		this.$el.val( value );
	}
});

module.exports = AttachmentFilters;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment-filters/all.js":[function(require,module,exports){
/**
 * wp.media.view.AttachmentFilters.All
 *
 * @class
 * @augments wp.media.view.AttachmentFilters
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var l10n = wp.media.view.l10n,
	All;

All = wp.media.view.AttachmentFilters.extend({
	createFilters: function() {
		var filters = {};

		_.each( wp.media.view.settings.mimeTypes || {}, function( text, key ) {
			filters[ key ] = {
				text: text,
				props: {
					status:  null,
					type:    key,
					uploadedTo: null,
					orderby: 'date',
					order:   'DESC'
				}
			};
		});

		filters.all = {
			text:  l10n.allMediaItems,
			props: {
				status:  null,
				type:    null,
				uploadedTo: null,
				orderby: 'date',
				order:   'DESC'
			},
			priority: 10
		};

		if ( wp.media.view.settings.post.id ) {
			filters.uploaded = {
				text:  l10n.uploadedToThisPost,
				props: {
					status:  null,
					type:    null,
					uploadedTo: wp.media.view.settings.post.id,
					orderby: 'menuOrder',
					order:   'ASC'
				},
				priority: 20
			};
		}

		filters.unattached = {
			text:  l10n.unattached,
			props: {
				status:     null,
				uploadedTo: 0,
				type:       null,
				orderby:    'menuOrder',
				order:      'ASC'
			},
			priority: 50
		};

		if ( wp.media.view.settings.mediaTrash &&
			this.controller.isModeActive( 'grid' ) ) {

			filters.trash = {
				text:  l10n.trash,
				props: {
					uploadedTo: null,
					status:     'trash',
					type:       null,
					orderby:    'date',
					order:      'DESC'
				},
				priority: 50
			};
		}

		this.filters = filters;
	}
});

module.exports = All;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment-filters/date.js":[function(require,module,exports){
/**
 * A filter dropdown for month/dates.
 *
 * @class
 * @augments wp.media.view.AttachmentFilters
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var l10n = wp.media.view.l10n,
	DateFilter;

DateFilter = wp.media.view.AttachmentFilters.extend({
	id: 'media-attachment-date-filters',

	createFilters: function() {
		var filters = {};
		_.each( wp.media.view.settings.months || {}, function( value, index ) {
			filters[ index ] = {
				text: value.text,
				props: {
					year: value.year,
					monthnum: value.month
				}
			};
		});
		filters.all = {
			text:  l10n.allDates,
			props: {
				monthnum: false,
				year:  false
			},
			priority: 10
		};
		this.filters = filters;
	}
});

module.exports = DateFilter;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment-filters/uploaded.js":[function(require,module,exports){
/**
 * wp.media.view.AttachmentFilters.Uploaded
 *
 * @class
 * @augments wp.media.view.AttachmentFilters
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var l10n = wp.media.view.l10n,
	Uploaded;

Uploaded = wp.media.view.AttachmentFilters.extend({
	createFilters: function() {
		var type = this.model.get('type'),
			types = wp.media.view.settings.mimeTypes,
			text;

		if ( types && type ) {
			text = types[ type ];
		}

		this.filters = {
			all: {
				text:  text || l10n.allMediaItems,
				props: {
					uploadedTo: null,
					orderby: 'date',
					order:   'DESC'
				},
				priority: 10
			},

			uploaded: {
				text:  l10n.uploadedToThisPost,
				props: {
					uploadedTo: wp.media.view.settings.post.id,
					orderby: 'menuOrder',
					order:   'ASC'
				},
				priority: 20
			},

			unattached: {
				text:  l10n.unattached,
				props: {
					uploadedTo: 0,
					orderby: 'menuOrder',
					order:   'ASC'
				},
				priority: 50
			}
		};
	}
});

module.exports = Uploaded;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment.js":[function(require,module,exports){
/**
 * wp.media.view.Attachment
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	$ = jQuery,
	Attachment;

Attachment = View.extend({
	tagName:   'li',
	className: 'attachment',
	template:  wp.template('attachment'),

	attributes: function() {
		return {
			'tabIndex':     0,
			'role':         'checkbox',
			'aria-label':   this.model.get( 'title' ),
			'aria-checked': false,
			'data-id':      this.model.get( 'id' )
		};
	},

	events: {
		'click .js--select-attachment':   'toggleSelectionHandler',
		'change [data-setting]':          'updateSetting',
		'change [data-setting] input':    'updateSetting',
		'change [data-setting] select':   'updateSetting',
		'change [data-setting] textarea': 'updateSetting',
		'click .attachment-close':        'removeFromLibrary',
		'click .check':                   'checkClickHandler',
		'keydown':                        'toggleSelectionHandler'
	},

	buttons: {},

	initialize: function() {
		var selection = this.options.selection,
			options = _.defaults( this.options, {
				rerenderOnModelChange: true
			} );

		if ( options.rerenderOnModelChange ) {
			this.listenTo( this.model, 'change', this.render );
		} else {
			this.listenTo( this.model, 'change:percent', this.progress );
		}
		this.listenTo( this.model, 'change:title', this._syncTitle );
		this.listenTo( this.model, 'change:caption', this._syncCaption );
		this.listenTo( this.model, 'change:artist', this._syncArtist );
		this.listenTo( this.model, 'change:album', this._syncAlbum );

		// Update the selection.
		this.listenTo( this.model, 'add', this.select );
		this.listenTo( this.model, 'remove', this.deselect );
		if ( selection ) {
			selection.on( 'reset', this.updateSelect, this );
			// Update the model's details view.
			this.listenTo( this.model, 'selection:single selection:unsingle', this.details );
			this.details( this.model, this.controller.state().get('selection') );
		}

		this.listenTo( this.controller, 'attachment:compat:waiting attachment:compat:ready', this.updateSave );
	},
	/**
	 * @returns {wp.media.view.Attachment} Returns itself to allow chaining
	 */
	dispose: function() {
		var selection = this.options.selection;

		// Make sure all settings are saved before removing the view.
		this.updateAll();

		if ( selection ) {
			selection.off( null, null, this );
		}
		/**
		 * call 'dispose' directly on the parent class
		 */
		View.prototype.dispose.apply( this, arguments );
		return this;
	},
	/**
	 * @returns {wp.media.view.Attachment} Returns itself to allow chaining
	 */
	render: function() {
		var options = _.defaults( this.model.toJSON(), {
				orientation:   'landscape',
				uploading:     false,
				type:          '',
				subtype:       '',
				icon:          '',
				filename:      '',
				caption:       '',
				title:         '',
				dateFormatted: '',
				width:         '',
				height:        '',
				compat:        false,
				alt:           '',
				description:   ''
			}, this.options );

		options.buttons  = this.buttons;
		options.describe = this.controller.state().get('describe');

		if ( 'image' === options.type ) {
			options.size = this.imageSize();
		}

		options.can = {};
		if ( options.nonces ) {
			options.can.remove = !! options.nonces['delete'];
			options.can.save = !! options.nonces.update;
		}

		if ( this.controller.state().get('allowLocalEdits') ) {
			options.allowLocalEdits = true;
		}

		if ( options.uploading && ! options.percent ) {
			options.percent = 0;
		}

		this.views.detach();
		this.$el.html( this.template( options ) );

		this.$el.toggleClass( 'uploading', options.uploading );

		if ( options.uploading ) {
			this.$bar = this.$('.media-progress-bar div');
		} else {
			delete this.$bar;
		}

		// Check if the model is selected.
		this.updateSelect();

		// Update the save status.
		this.updateSave();

		this.views.render();

		return this;
	},

	progress: function() {
		if ( this.$bar && this.$bar.length ) {
			this.$bar.width( this.model.get('percent') + '%' );
		}
	},

	/**
	 * @param {Object} event
	 */
	toggleSelectionHandler: function( event ) {
		var method;

		// Don't do anything inside inputs and on the attachment check and remove buttons.
		if ( 'INPUT' === event.target.nodeName || 'BUTTON' === event.target.nodeName ) {
			return;
		}

		// Catch arrow events
		if ( 37 === event.keyCode || 38 === event.keyCode || 39 === event.keyCode || 40 === event.keyCode ) {
			this.controller.trigger( 'attachment:keydown:arrow', event );
			return;
		}

		// Catch enter and space events
		if ( 'keydown' === event.type && 13 !== event.keyCode && 32 !== event.keyCode ) {
			return;
		}

		event.preventDefault();

		// In the grid view, bubble up an edit:attachment event to the controller.
		if ( this.controller.isModeActive( 'grid' ) ) {
			if ( this.controller.isModeActive( 'edit' ) ) {
				// Pass the current target to restore focus when closing
				this.controller.trigger( 'edit:attachment', this.model, event.currentTarget );
				return;
			}

			if ( this.controller.isModeActive( 'select' ) ) {
				method = 'toggle';
			}
		}

		if ( event.shiftKey ) {
			method = 'between';
		} else if ( event.ctrlKey || event.metaKey ) {
			method = 'toggle';
		}

		this.toggleSelection({
			method: method
		});

		this.controller.trigger( 'selection:toggle' );
	},
	/**
	 * @param {Object} options
	 */
	toggleSelection: function( options ) {
		var collection = this.collection,
			selection = this.options.selection,
			model = this.model,
			method = options && options.method,
			single, models, singleIndex, modelIndex;

		if ( ! selection ) {
			return;
		}

		single = selection.single();
		method = _.isUndefined( method ) ? selection.multiple : method;

		// If the `method` is set to `between`, select all models that
		// exist between the current and the selected model.
		if ( 'between' === method && single && selection.multiple ) {
			// If the models are the same, short-circuit.
			if ( single === model ) {
				return;
			}

			singleIndex = collection.indexOf( single );
			modelIndex  = collection.indexOf( this.model );

			if ( singleIndex < modelIndex ) {
				models = collection.models.slice( singleIndex, modelIndex + 1 );
			} else {
				models = collection.models.slice( modelIndex, singleIndex + 1 );
			}

			selection.add( models );
			selection.single( model );
			return;

		// If the `method` is set to `toggle`, just flip the selection
		// status, regardless of whether the model is the single model.
		} else if ( 'toggle' === method ) {
			selection[ this.selected() ? 'remove' : 'add' ]( model );
			selection.single( model );
			return;
		} else if ( 'add' === method ) {
			selection.add( model );
			selection.single( model );
			return;
		}

		// Fixes bug that loses focus when selecting a featured image
		if ( ! method ) {
			method = 'add';
		}

		if ( method !== 'add' ) {
			method = 'reset';
		}

		if ( this.selected() ) {
			// If the model is the single model, remove it.
			// If it is not the same as the single model,
			// it now becomes the single model.
			selection[ single === model ? 'remove' : 'single' ]( model );
		} else {
			// If the model is not selected, run the `method` on the
			// selection. By default, we `reset` the selection, but the
			// `method` can be set to `add` the model to the selection.
			selection[ method ]( model );
			selection.single( model );
		}
	},

	updateSelect: function() {
		this[ this.selected() ? 'select' : 'deselect' ]();
	},
	/**
	 * @returns {unresolved|Boolean}
	 */
	selected: function() {
		var selection = this.options.selection;
		if ( selection ) {
			return !! selection.get( this.model.cid );
		}
	},
	/**
	 * @param {Backbone.Model} model
	 * @param {Backbone.Collection} collection
	 */
	select: function( model, collection ) {
		var selection = this.options.selection,
			controller = this.controller;

		// Check if a selection exists and if it's the collection provided.
		// If they're not the same collection, bail; we're in another
		// selection's event loop.
		if ( ! selection || ( collection && collection !== selection ) ) {
			return;
		}

		// Bail if the model is already selected.
		if ( this.$el.hasClass( 'selected' ) ) {
			return;
		}

		// Add 'selected' class to model, set aria-checked to true.
		this.$el.addClass( 'selected' ).attr( 'aria-checked', true );
		//  Make the checkbox tabable, except in media grid (bulk select mode).
		if ( ! ( controller.isModeActive( 'grid' ) && controller.isModeActive( 'select' ) ) ) {
			this.$( '.check' ).attr( 'tabindex', '0' );
		}
	},
	/**
	 * @param {Backbone.Model} model
	 * @param {Backbone.Collection} collection
	 */
	deselect: function( model, collection ) {
		var selection = this.options.selection;

		// Check if a selection exists and if it's the collection provided.
		// If they're not the same collection, bail; we're in another
		// selection's event loop.
		if ( ! selection || ( collection && collection !== selection ) ) {
			return;
		}
		this.$el.removeClass( 'selected' ).attr( 'aria-checked', false )
			.find( '.check' ).attr( 'tabindex', '-1' );
	},
	/**
	 * @param {Backbone.Model} model
	 * @param {Backbone.Collection} collection
	 */
	details: function( model, collection ) {
		var selection = this.options.selection,
			details;

		if ( selection !== collection ) {
			return;
		}

		details = selection.single();
		this.$el.toggleClass( 'details', details === this.model );
	},
	/**
	 * @param {string} size
	 * @returns {Object}
	 */
	imageSize: function( size ) {
		var sizes = this.model.get('sizes'), matched = false;

		size = size || 'medium';

		// Use the provided image size if possible.
		if ( sizes ) {
			if ( sizes[ size ] ) {
				matched = sizes[ size ];
			} else if ( sizes.large ) {
				matched = sizes.large;
			} else if ( sizes.thumbnail ) {
				matched = sizes.thumbnail;
			} else if ( sizes.full ) {
				matched = sizes.full;
			}

			if ( matched ) {
				return _.clone( matched );
			}
		}

		return {
			url:         this.model.get('url'),
			width:       this.model.get('width'),
			height:      this.model.get('height'),
			orientation: this.model.get('orientation')
		};
	},
	/**
	 * @param {Object} event
	 */
	updateSetting: function( event ) {
		var $setting = $( event.target ).closest('[data-setting]'),
			setting, value;

		if ( ! $setting.length ) {
			return;
		}

		setting = $setting.data('setting');
		value   = event.target.value;

		if ( this.model.get( setting ) !== value ) {
			this.save( setting, value );
		}
	},

	/**
	 * Pass all the arguments to the model's save method.
	 *
	 * Records the aggregate status of all save requests and updates the
	 * view's classes accordingly.
	 */
	save: function() {
		var view = this,
			save = this._save = this._save || { status: 'ready' },
			request = this.model.save.apply( this.model, arguments ),
			requests = save.requests ? $.when( request, save.requests ) : request;

		// If we're waiting to remove 'Saved.', stop.
		if ( save.savedTimer ) {
			clearTimeout( save.savedTimer );
		}

		this.updateSave('waiting');
		save.requests = requests;
		requests.always( function() {
			// If we've performed another request since this one, bail.
			if ( save.requests !== requests ) {
				return;
			}

			view.updateSave( requests.state() === 'resolved' ? 'complete' : 'error' );
			save.savedTimer = setTimeout( function() {
				view.updateSave('ready');
				delete save.savedTimer;
			}, 2000 );
		});
	},
	/**
	 * @param {string} status
	 * @returns {wp.media.view.Attachment} Returns itself to allow chaining
	 */
	updateSave: function( status ) {
		var save = this._save = this._save || { status: 'ready' };

		if ( status && status !== save.status ) {
			this.$el.removeClass( 'save-' + save.status );
			save.status = status;
		}

		this.$el.addClass( 'save-' + save.status );
		return this;
	},

	updateAll: function() {
		var $settings = this.$('[data-setting]'),
			model = this.model,
			changed;

		changed = _.chain( $settings ).map( function( el ) {
			var $input = $('input, textarea, select, [value]', el ),
				setting, value;

			if ( ! $input.length ) {
				return;
			}

			setting = $(el).data('setting');
			value = $input.val();

			// Record the value if it changed.
			if ( model.get( setting ) !== value ) {
				return [ setting, value ];
			}
		}).compact().object().value();

		if ( ! _.isEmpty( changed ) ) {
			model.save( changed );
		}
	},
	/**
	 * @param {Object} event
	 */
	removeFromLibrary: function( event ) {
		// Catch enter and space events
		if ( 'keydown' === event.type && 13 !== event.keyCode && 32 !== event.keyCode ) {
			return;
		}

		// Stop propagation so the model isn't selected.
		event.stopPropagation();

		this.collection.remove( this.model );
	},

	/**
	 * Add the model if it isn't in the selection, if it is in the selection,
	 * remove it.
	 *
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 */
	checkClickHandler: function ( event ) {
		var selection = this.options.selection;
		if ( ! selection ) {
			return;
		}
		event.stopPropagation();
		if ( selection.where( { id: this.model.get( 'id' ) } ).length ) {
			selection.remove( this.model );
			// Move focus back to the attachment tile (from the check).
			this.$el.focus();
		} else {
			selection.add( this.model );
		}
	}
});

// Ensure settings remain in sync between attachment views.
_.each({
	caption: '_syncCaption',
	title:   '_syncTitle',
	artist:  '_syncArtist',
	album:   '_syncAlbum'
}, function( method, setting ) {
	/**
	 * @param {Backbone.Model} model
	 * @param {string} value
	 * @returns {wp.media.view.Attachment} Returns itself to allow chaining
	 */
	Attachment.prototype[ method ] = function( model, value ) {
		var $setting = this.$('[data-setting="' + setting + '"]');

		if ( ! $setting.length ) {
			return this;
		}

		// If the updated value is in sync with the value in the DOM, there
		// is no need to re-render. If we're currently editing the value,
		// it will automatically be in sync, suppressing the re-render for
		// the view we're editing, while updating any others.
		if ( value === $setting.find('input, textarea, select, [value]').val() ) {
			return this;
		}

		return this.render();
	};
});

module.exports = Attachment;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment/details.js":[function(require,module,exports){
/**
 * wp.media.view.Attachment.Details
 *
 * @class
 * @augments wp.media.view.Attachment
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Attachment = wp.media.view.Attachment,
	l10n = wp.media.view.l10n,
	Details;

Details = Attachment.extend({
	tagName:   'div',
	className: 'attachment-details',
	template:  wp.template('attachment-details'),

	attributes: function() {
		return {
			'tabIndex':     0,
			'data-id':      this.model.get( 'id' )
		};
	},

	events: {
		'change [data-setting]':          'updateSetting',
		'change [data-setting] input':    'updateSetting',
		'change [data-setting] select':   'updateSetting',
		'change [data-setting] textarea': 'updateSetting',
		'click .delete-attachment':       'deleteAttachment',
		'click .trash-attachment':        'trashAttachment',
		'click .untrash-attachment':      'untrashAttachment',
		'click .edit-attachment':         'editAttachment',
		'keydown':                        'toggleSelectionHandler'
	},

	initialize: function() {
		this.options = _.defaults( this.options, {
			rerenderOnModelChange: false
		});

		this.on( 'ready', this.initialFocus );
		// Call 'initialize' directly on the parent class.
		Attachment.prototype.initialize.apply( this, arguments );
	},

	initialFocus: function() {
		if ( ! wp.media.isTouchDevice ) {
			/*
			Previously focused the first ':input' (the readonly URL text field).
			Since the first ':input' is now a button (delete/trash): when pressing
			spacebar on an attachment, Firefox fires deleteAttachment/trashAttachment
			as soon as focus is moved. Explicitly target the first text field for now.
			@todo change initial focus logic, also for accessibility.
			*/
			this.$( 'input[type="text"]' ).eq( 0 ).focus();
		}
	},
	/**
	 * @param {Object} event
	 */
	deleteAttachment: function( event ) {
		event.preventDefault();

		if ( window.confirm( l10n.warnDelete ) ) {
			this.model.destroy();
			// Keep focus inside media modal
			// after image is deleted
			this.controller.modal.focusManager.focus();
		}
	},
	/**
	 * @param {Object} event
	 */
	trashAttachment: function( event ) {
		var library = this.controller.library;
		event.preventDefault();

		if ( wp.media.view.settings.mediaTrash &&
			'edit-metadata' === this.controller.content.mode() ) {

			this.model.set( 'status', 'trash' );
			this.model.save().done( function() {
				library._requery( true );
			} );
		}  else {
			this.model.destroy();
		}
	},
	/**
	 * @param {Object} event
	 */
	untrashAttachment: function( event ) {
		var library = this.controller.library;
		event.preventDefault();

		this.model.set( 'status', 'inherit' );
		this.model.save().done( function() {
			library._requery( true );
		} );
	},
	/**
	 * @param {Object} event
	 */
	editAttachment: function( event ) {
		var editState = this.controller.states.get( 'edit-image' );
		if ( window.imageEdit && editState ) {
			event.preventDefault();

			editState.set( 'image', this.model );
			this.controller.setState( 'edit-image' );
		} else {
			this.$el.addClass('needs-refresh');
		}
	},
	/**
	 * When reverse tabbing(shift+tab) out of the right details panel, deliver
	 * the focus to the item in the list that was being edited.
	 *
	 * @param {Object} event
	 */
	toggleSelectionHandler: function( event ) {
		if ( 'keydown' === event.type && 9 === event.keyCode && event.shiftKey && event.target === this.$( ':tabbable' ).get( 0 ) ) {
			this.controller.trigger( 'attachment:details:shift-tab', event );
			return false;
		}

		if ( 37 === event.keyCode || 38 === event.keyCode || 39 === event.keyCode || 40 === event.keyCode ) {
			this.controller.trigger( 'attachment:keydown:arrow', event );
			return;
		}
	}
});

module.exports = Details;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment/edit-library.js":[function(require,module,exports){
/**
 * wp.media.view.Attachment.EditLibrary
 *
 * @class
 * @augments wp.media.view.Attachment
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var EditLibrary = wp.media.view.Attachment.extend({
	buttons: {
		close: true
	}
});

module.exports = EditLibrary;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment/edit-selection.js":[function(require,module,exports){
/**
 * wp.media.view.Attachments.EditSelection
 *
 * @class
 * @augments wp.media.view.Attachment.Selection
 * @augments wp.media.view.Attachment
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var EditSelection = wp.media.view.Attachment.Selection.extend({
	buttons: {
		close: true
	}
});

module.exports = EditSelection;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment/library.js":[function(require,module,exports){
/**
 * wp.media.view.Attachment.Library
 *
 * @class
 * @augments wp.media.view.Attachment
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Library = wp.media.view.Attachment.extend({
	buttons: {
		check: true
	}
});

module.exports = Library;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachment/selection.js":[function(require,module,exports){
/**
 * wp.media.view.Attachment.Selection
 *
 * @class
 * @augments wp.media.view.Attachment
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Selection = wp.media.view.Attachment.extend({
	className: 'attachment selection',

	// On click, just select the model, instead of removing the model from
	// the selection.
	toggleSelection: function() {
		this.options.selection.single( this.model );
	}
});

module.exports = Selection;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachments.js":[function(require,module,exports){
/**
 * wp.media.view.Attachments
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	$ = jQuery,
	Attachments;

Attachments = View.extend({
	tagName:   'ul',
	className: 'attachments',

	attributes: {
		tabIndex: -1
	},

	initialize: function() {
		this.el.id = _.uniqueId('__attachments-view-');

		_.defaults( this.options, {
			refreshSensitivity: wp.media.isTouchDevice ? 300 : 200,
			refreshThreshold:   3,
			AttachmentView:     wp.media.view.Attachment,
			sortable:           false,
			resize:             true,
			idealColumnWidth:   $( window ).width() < 640 ? 135 : 150
		});

		this._viewsByCid = {};
		this.$window = $( window );
		this.resizeEvent = 'resize.media-modal-columns';

		this.collection.on( 'add', function( attachment ) {
			this.views.add( this.createAttachmentView( attachment ), {
				at: this.collection.indexOf( attachment )
			});
		}, this );

		this.collection.on( 'remove', function( attachment ) {
			var view = this._viewsByCid[ attachment.cid ];
			delete this._viewsByCid[ attachment.cid ];

			if ( view ) {
				view.remove();
			}
		}, this );

		this.collection.on( 'reset', this.render, this );

		this.listenTo( this.controller, 'library:selection:add',    this.attachmentFocus );

		// Throttle the scroll handler and bind this.
		this.scroll = _.chain( this.scroll ).bind( this ).throttle( this.options.refreshSensitivity ).value();

		this.options.scrollElement = this.options.scrollElement || this.el;
		$( this.options.scrollElement ).on( 'scroll', this.scroll );

		this.initSortable();

		_.bindAll( this, 'setColumns' );

		if ( this.options.resize ) {
			this.on( 'ready', this.bindEvents );
			this.controller.on( 'open', this.setColumns );

			// Call this.setColumns() after this view has been rendered in the DOM so
			// attachments get proper width applied.
			_.defer( this.setColumns, this );
		}
	},

	bindEvents: function() {
		this.$window.off( this.resizeEvent ).on( this.resizeEvent, _.debounce( this.setColumns, 50 ) );
	},

	attachmentFocus: function() {
		this.$( 'li:first' ).focus();
	},

	restoreFocus: function() {
		this.$( 'li.selected:first' ).focus();
	},

	arrowEvent: function( event ) {
		var attachments = this.$el.children( 'li' ),
			perRow = this.columns,
			index = attachments.filter( ':focus' ).index(),
			row = ( index + 1 ) <= perRow ? 1 : Math.ceil( ( index + 1 ) / perRow );

		if ( index === -1 ) {
			return;
		}

		// Left arrow
		if ( 37 === event.keyCode ) {
			if ( 0 === index ) {
				return;
			}
			attachments.eq( index - 1 ).focus();
		}

		// Up arrow
		if ( 38 === event.keyCode ) {
			if ( 1 === row ) {
				return;
			}
			attachments.eq( index - perRow ).focus();
		}

		// Right arrow
		if ( 39 === event.keyCode ) {
			if ( attachments.length === index ) {
				return;
			}
			attachments.eq( index + 1 ).focus();
		}

		// Down arrow
		if ( 40 === event.keyCode ) {
			if ( Math.ceil( attachments.length / perRow ) === row ) {
				return;
			}
			attachments.eq( index + perRow ).focus();
		}
	},

	dispose: function() {
		this.collection.props.off( null, null, this );
		if ( this.options.resize ) {
			this.$window.off( this.resizeEvent );
		}

		/**
		 * call 'dispose' directly on the parent class
		 */
		View.prototype.dispose.apply( this, arguments );
	},

	setColumns: function() {
		var prev = this.columns,
			width = this.$el.width();

		if ( width ) {
			this.columns = Math.min( Math.round( width / this.options.idealColumnWidth ), 12 ) || 1;

			if ( ! prev || prev !== this.columns ) {
				this.$el.closest( '.media-frame-content' ).attr( 'data-columns', this.columns );
			}
		}
	},

	initSortable: function() {
		var collection = this.collection;

		if ( wp.media.isTouchDevice || ! this.options.sortable || ! $.fn.sortable ) {
			return;
		}

		this.$el.sortable( _.extend({
			// If the `collection` has a `comparator`, disable sorting.
			disabled: !! collection.comparator,

			// Change the position of the attachment as soon as the
			// mouse pointer overlaps a thumbnail.
			tolerance: 'pointer',

			// Record the initial `index` of the dragged model.
			start: function( event, ui ) {
				ui.item.data('sortableIndexStart', ui.item.index());
			},

			// Update the model's index in the collection.
			// Do so silently, as the view is already accurate.
			update: function( event, ui ) {
				var model = collection.at( ui.item.data('sortableIndexStart') ),
					comparator = collection.comparator;

				// Temporarily disable the comparator to prevent `add`
				// from re-sorting.
				delete collection.comparator;

				// Silently shift the model to its new index.
				collection.remove( model, {
					silent: true
				});
				collection.add( model, {
					silent: true,
					at:     ui.item.index()
				});

				// Restore the comparator.
				collection.comparator = comparator;

				// Fire the `reset` event to ensure other collections sync.
				collection.trigger( 'reset', collection );

				// If the collection is sorted by menu order,
				// update the menu order.
				collection.saveMenuOrder();
			}
		}, this.options.sortable ) );

		// If the `orderby` property is changed on the `collection`,
		// check to see if we have a `comparator`. If so, disable sorting.
		collection.props.on( 'change:orderby', function() {
			this.$el.sortable( 'option', 'disabled', !! collection.comparator );
		}, this );

		this.collection.props.on( 'change:orderby', this.refreshSortable, this );
		this.refreshSortable();
	},

	refreshSortable: function() {
		if ( wp.media.isTouchDevice || ! this.options.sortable || ! $.fn.sortable ) {
			return;
		}

		// If the `collection` has a `comparator`, disable sorting.
		var collection = this.collection,
			orderby = collection.props.get('orderby'),
			enabled = 'menuOrder' === orderby || ! collection.comparator;

		this.$el.sortable( 'option', 'disabled', ! enabled );
	},

	/**
	 * @param {wp.media.model.Attachment} attachment
	 * @returns {wp.media.View}
	 */
	createAttachmentView: function( attachment ) {
		var view = new this.options.AttachmentView({
			controller:           this.controller,
			model:                attachment,
			collection:           this.collection,
			selection:            this.options.selection
		});

		return this._viewsByCid[ attachment.cid ] = view;
	},

	prepare: function() {
		// Create all of the Attachment views, and replace
		// the list in a single DOM operation.
		if ( this.collection.length ) {
			this.views.set( this.collection.map( this.createAttachmentView, this ) );

		// If there are no elements, clear the views and load some.
		} else {
			this.views.unset();
			this.collection.more().done( this.scroll );
		}
	},

	ready: function() {
		// Trigger the scroll event to check if we're within the
		// threshold to query for additional attachments.
		this.scroll();
	},

	scroll: function() {
		var view = this,
			el = this.options.scrollElement,
			scrollTop = el.scrollTop,
			toolbar;

		// The scroll event occurs on the document, but the element
		// that should be checked is the document body.
		if ( el === document ) {
			el = document.body;
			scrollTop = $(document).scrollTop();
		}

		if ( ! $(el).is(':visible') || ! this.collection.hasMore() ) {
			return;
		}

		toolbar = this.views.parent.toolbar;

		// Show the spinner only if we are close to the bottom.
		if ( el.scrollHeight - ( scrollTop + el.clientHeight ) < el.clientHeight / 3 ) {
			toolbar.get('spinner').show();
		}

		if ( el.scrollHeight < scrollTop + ( el.clientHeight * this.options.refreshThreshold ) ) {
			this.collection.more().done(function() {
				view.scroll();
				toolbar.get('spinner').hide();
			});
		}
	}
});

module.exports = Attachments;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachments/browser.js":[function(require,module,exports){
/**
 * wp.media.view.AttachmentsBrowser
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 *
 * @param {object}         [options]               The options hash passed to the view.
 * @param {boolean|string} [options.filters=false] Which filters to show in the browser's toolbar.
 *                                                 Accepts 'uploaded' and 'all'.
 * @param {boolean}        [options.search=true]   Whether to show the search interface in the
 *                                                 browser's toolbar.
 * @param {boolean}        [options.date=true]     Whether to show the date filter in the
 *                                                 browser's toolbar.
 * @param {boolean}        [options.display=false] Whether to show the attachments display settings
 *                                                 view in the sidebar.
 * @param {boolean|string} [options.sidebar=true]  Whether to create a sidebar for the browser.
 *                                                 Accepts true, false, and 'errors'.
 */
var View = wp.media.View,
	mediaTrash = wp.media.view.settings.mediaTrash,
	l10n = wp.media.view.l10n,
	$ = jQuery,
	AttachmentsBrowser;

AttachmentsBrowser = View.extend({
	tagName:   'div',
	className: 'attachments-browser',

	initialize: function() {
		_.defaults( this.options, {
			filters: false,
			search:  true,
			date:    true,
			display: false,
			sidebar: true,
			AttachmentView: wp.media.view.Attachment.Library
		});

		this.listenTo( this.controller, 'toggle:upload:attachment', _.bind( this.toggleUploader, this ) );
		this.controller.on( 'edit:selection', this.editSelection );
		this.createToolbar();
		if ( this.options.sidebar ) {
			this.createSidebar();
		}
		this.createUploader();
		this.createAttachments();
		this.updateContent();

		if ( ! this.options.sidebar || 'errors' === this.options.sidebar ) {
			this.$el.addClass( 'hide-sidebar' );

			if ( 'errors' === this.options.sidebar ) {
				this.$el.addClass( 'sidebar-for-errors' );
			}
		}

		this.collection.on( 'add remove reset', this.updateContent, this );
	},

	editSelection: function( modal ) {
		modal.$( '.media-button-backToLibrary' ).focus();
	},

	/**
	 * @returns {wp.media.view.AttachmentsBrowser} Returns itself to allow chaining
	 */
	dispose: function() {
		this.options.selection.off( null, null, this );
		View.prototype.dispose.apply( this, arguments );
		return this;
	},

	createToolbar: function() {
		var LibraryViewSwitcher, Filters, toolbarOptions;

		toolbarOptions = {
			controller: this.controller
		};

		if ( this.controller.isModeActive( 'grid' ) ) {
			toolbarOptions.className = 'media-toolbar wp-filter';
		}

		/**
		* @member {wp.media.view.Toolbar}
		*/
		this.toolbar = new wp.media.view.Toolbar( toolbarOptions );

		this.views.add( this.toolbar );

		this.toolbar.set( 'spinner', new wp.media.view.Spinner({
			priority: -60
		}) );

		if ( -1 !== $.inArray( this.options.filters, [ 'uploaded', 'all' ] ) ) {
			// "Filters" will return a <select>, need to render
			// screen reader text before
			this.toolbar.set( 'filtersLabel', new wp.media.view.Label({
				value: l10n.filterByType,
				attributes: {
					'for':  'media-attachment-filters'
				},
				priority:   -80
			}).render() );

			if ( 'uploaded' === this.options.filters ) {
				this.toolbar.set( 'filters', new wp.media.view.AttachmentFilters.Uploaded({
					controller: this.controller,
					model:      this.collection.props,
					priority:   -80
				}).render() );
			} else {
				Filters = new wp.media.view.AttachmentFilters.All({
					controller: this.controller,
					model:      this.collection.props,
					priority:   -80
				});

				this.toolbar.set( 'filters', Filters.render() );
			}
		}

		// Feels odd to bring the global media library switcher into the Attachment
		// browser view. Is this a use case for doAction( 'add:toolbar-items:attachments-browser', this.toolbar );
		// which the controller can tap into and add this view?
		if ( this.controller.isModeActive( 'grid' ) ) {
			LibraryViewSwitcher = View.extend({
				className: 'view-switch media-grid-view-switch',
				template: wp.template( 'media-library-view-switcher')
			});

			this.toolbar.set( 'libraryViewSwitcher', new LibraryViewSwitcher({
				controller: this.controller,
				priority: -90
			}).render() );

			// DateFilter is a <select>, screen reader text needs to be rendered before
			this.toolbar.set( 'dateFilterLabel', new wp.media.view.Label({
				value: l10n.filterByDate,
				attributes: {
					'for': 'media-attachment-date-filters'
				},
				priority: -75
			}).render() );
			this.toolbar.set( 'dateFilter', new wp.media.view.DateFilter({
				controller: this.controller,
				model:      this.collection.props,
				priority: -75
			}).render() );

			// BulkSelection is a <div> with subviews, including screen reader text
			this.toolbar.set( 'selectModeToggleButton', new wp.media.view.SelectModeToggleButton({
				text: l10n.bulkSelect,
				controller: this.controller,
				priority: -70
			}).render() );

			this.toolbar.set( 'deleteSelectedButton', new wp.media.view.DeleteSelectedButton({
				filters: Filters,
				style: 'primary',
				disabled: true,
				text: mediaTrash ? l10n.trashSelected : l10n.deleteSelected,
				controller: this.controller,
				priority: -60,
				click: function() {
					var changed = [], removed = [],
						selection = this.controller.state().get( 'selection' ),
						library = this.controller.state().get( 'library' );

					if ( ! selection.length ) {
						return;
					}

					if ( ! mediaTrash && ! window.confirm( l10n.warnBulkDelete ) ) {
						return;
					}

					if ( mediaTrash &&
						'trash' !== selection.at( 0 ).get( 'status' ) &&
						! window.confirm( l10n.warnBulkTrash ) ) {

						return;
					}

					selection.each( function( model ) {
						if ( ! model.get( 'nonces' )['delete'] ) {
							removed.push( model );
							return;
						}

						if ( mediaTrash && 'trash' === model.get( 'status' ) ) {
							model.set( 'status', 'inherit' );
							changed.push( model.save() );
							removed.push( model );
						} else if ( mediaTrash ) {
							model.set( 'status', 'trash' );
							changed.push( model.save() );
							removed.push( model );
						} else {
							model.destroy({wait: true});
						}
					} );

					if ( changed.length ) {
						selection.remove( removed );

						$.when.apply( null, changed ).then( _.bind( function() {
							library._requery( true );
							this.controller.trigger( 'selection:action:done' );
						}, this ) );
					} else {
						this.controller.trigger( 'selection:action:done' );
					}
				}
			}).render() );

			if ( mediaTrash ) {
				this.toolbar.set( 'deleteSelectedPermanentlyButton', new wp.media.view.DeleteSelectedPermanentlyButton({
					filters: Filters,
					style: 'primary',
					disabled: true,
					text: l10n.deleteSelected,
					controller: this.controller,
					priority: -55,
					click: function() {
						var removed = [], selection = this.controller.state().get( 'selection' );

						if ( ! selection.length || ! window.confirm( l10n.warnBulkDelete ) ) {
							return;
						}

						selection.each( function( model ) {
							if ( ! model.get( 'nonces' )['delete'] ) {
								removed.push( model );
								return;
							}

							model.destroy();
						} );

						selection.remove( removed );
						this.controller.trigger( 'selection:action:done' );
					}
				}).render() );
			}

		} else if ( this.options.date ) {
			// DateFilter is a <select>, screen reader text needs to be rendered before
			this.toolbar.set( 'dateFilterLabel', new wp.media.view.Label({
				value: l10n.filterByDate,
				attributes: {
					'for': 'media-attachment-date-filters'
				},
				priority: -75
			}).render() );
			this.toolbar.set( 'dateFilter', new wp.media.view.DateFilter({
				controller: this.controller,
				model:      this.collection.props,
				priority: -75
			}).render() );
		}

		if ( this.options.search ) {
			// Search is an input, screen reader text needs to be rendered before
			this.toolbar.set( 'searchLabel', new wp.media.view.Label({
				value: l10n.searchMediaLabel,
				attributes: {
					'for': 'media-search-input'
				},
				priority:   60
			}).render() );
			this.toolbar.set( 'search', new wp.media.view.Search({
				controller: this.controller,
				model:      this.collection.props,
				priority:   60
			}).render() );
		}

		if ( this.options.dragInfo ) {
			this.toolbar.set( 'dragInfo', new View({
				el: $( '<div class="instructions">' + l10n.dragInfo + '</div>' )[0],
				priority: -40
			}) );
		}

		if ( this.options.suggestedWidth && this.options.suggestedHeight ) {
			this.toolbar.set( 'suggestedDimensions', new View({
				el: $( '<div class="instructions">' + l10n.suggestedDimensions + ' ' + this.options.suggestedWidth + ' &times; ' + this.options.suggestedHeight + '</div>' )[0],
				priority: -40
			}) );
		}
	},

	updateContent: function() {
		var view = this,
			noItemsView;

		if ( this.controller.isModeActive( 'grid' ) ) {
			noItemsView = view.attachmentsNoResults;
		} else {
			noItemsView = view.uploader;
		}

		if ( ! this.collection.length ) {
			this.toolbar.get( 'spinner' ).show();
			this.dfd = this.collection.more().done( function() {
				if ( ! view.collection.length ) {
					noItemsView.$el.removeClass( 'hidden' );
				} else {
					noItemsView.$el.addClass( 'hidden' );
				}
				view.toolbar.get( 'spinner' ).hide();
			} );
		} else {
			noItemsView.$el.addClass( 'hidden' );
			view.toolbar.get( 'spinner' ).hide();
		}
	},

	createUploader: function() {
		this.uploader = new wp.media.view.UploaderInline({
			controller: this.controller,
			status:     false,
			message:    this.controller.isModeActive( 'grid' ) ? '' : l10n.noItemsFound,
			canClose:   this.controller.isModeActive( 'grid' )
		});

		this.uploader.hide();
		this.views.add( this.uploader );
	},

	toggleUploader: function() {
		if ( this.uploader.$el.hasClass( 'hidden' ) ) {
			this.uploader.show();
		} else {
			this.uploader.hide();
		}
	},

	createAttachments: function() {
		this.attachments = new wp.media.view.Attachments({
			controller:           this.controller,
			collection:           this.collection,
			selection:            this.options.selection,
			model:                this.model,
			sortable:             this.options.sortable,
			scrollElement:        this.options.scrollElement,
			idealColumnWidth:     this.options.idealColumnWidth,

			// The single `Attachment` view to be used in the `Attachments` view.
			AttachmentView: this.options.AttachmentView
		});

		// Add keydown listener to the instance of the Attachments view
		this.attachments.listenTo( this.controller, 'attachment:keydown:arrow',     this.attachments.arrowEvent );
		this.attachments.listenTo( this.controller, 'attachment:details:shift-tab', this.attachments.restoreFocus );

		this.views.add( this.attachments );


		if ( this.controller.isModeActive( 'grid' ) ) {
			this.attachmentsNoResults = new View({
				controller: this.controller,
				tagName: 'p'
			});

			this.attachmentsNoResults.$el.addClass( 'hidden no-media' );
			this.attachmentsNoResults.$el.html( l10n.noMedia );

			this.views.add( this.attachmentsNoResults );
		}
	},

	createSidebar: function() {
		var options = this.options,
			selection = options.selection,
			sidebar = this.sidebar = new wp.media.view.Sidebar({
				controller: this.controller
			});

		this.views.add( sidebar );

		if ( this.controller.uploader ) {
			sidebar.set( 'uploads', new wp.media.view.UploaderStatus({
				controller: this.controller,
				priority:   40
			}) );
		}

		selection.on( 'selection:single', this.createSingle, this );
		selection.on( 'selection:unsingle', this.disposeSingle, this );

		if ( selection.single() ) {
			this.createSingle();
		}
	},

	createSingle: function() {
		var sidebar = this.sidebar,
			single = this.options.selection.single();

		sidebar.set( 'details', new wp.media.view.Attachment.Details({
			controller: this.controller,
			model:      single,
			priority:   80
		}) );

		sidebar.set( 'compat', new wp.media.view.AttachmentCompat({
			controller: this.controller,
			model:      single,
			priority:   120
		}) );

		if ( this.options.display ) {
			sidebar.set( 'display', new wp.media.view.Settings.AttachmentDisplay({
				controller:   this.controller,
				model:        this.model.display( single ),
				attachment:   single,
				priority:     160,
				userSettings: this.model.get('displayUserSettings')
			}) );
		}

		// Show the sidebar on mobile
		if ( this.model.id === 'insert' ) {
			sidebar.$el.addClass( 'visible' );
		}
	},

	disposeSingle: function() {
		var sidebar = this.sidebar;
		sidebar.unset('details');
		sidebar.unset('compat');
		sidebar.unset('display');
		// Hide the sidebar on mobile
		sidebar.$el.removeClass( 'visible' );
	}
});

module.exports = AttachmentsBrowser;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/attachments/selection.js":[function(require,module,exports){
/**
 * wp.media.view.Attachments.Selection
 *
 * @class
 * @augments wp.media.view.Attachments
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Attachments = wp.media.view.Attachments,
	Selection;

Selection = Attachments.extend({
	events: {},
	initialize: function() {
		_.defaults( this.options, {
			sortable:   false,
			resize:     false,

			// The single `Attachment` view to be used in the `Attachments` view.
			AttachmentView: wp.media.view.Attachment.Selection
		});
		// Call 'initialize' directly on the parent class.
		return Attachments.prototype.initialize.apply( this, arguments );
	}
});

module.exports = Selection;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/button-group.js":[function(require,module,exports){
/**
 * wp.media.view.ButtonGroup
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var $ = Backbone.$,
	ButtonGroup;

ButtonGroup = wp.media.View.extend({
	tagName:   'div',
	className: 'button-group button-large media-button-group',

	initialize: function() {
		/**
		 * @member {wp.media.view.Button[]}
		 */
		this.buttons = _.map( this.options.buttons || [], function( button ) {
			if ( button instanceof Backbone.View ) {
				return button;
			} else {
				return new wp.media.view.Button( button ).render();
			}
		});

		delete this.options.buttons;

		if ( this.options.classes ) {
			this.$el.addClass( this.options.classes );
		}
	},

	/**
	 * @returns {wp.media.view.ButtonGroup}
	 */
	render: function() {
		this.$el.html( $( _.pluck( this.buttons, 'el' ) ).detach() );
		return this;
	}
});

module.exports = ButtonGroup;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/button.js":[function(require,module,exports){
/**
 * wp.media.view.Button
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Button = wp.media.View.extend({
	tagName:    'button',
	className:  'media-button',
	attributes: { type: 'button' },

	events: {
		'click': 'click'
	},

	defaults: {
		text:     '',
		style:    '',
		size:     'large',
		disabled: false
	},

	initialize: function() {
		/**
		 * Create a model with the provided `defaults`.
		 *
		 * @member {Backbone.Model}
		 */
		this.model = new Backbone.Model( this.defaults );

		// If any of the `options` have a key from `defaults`, apply its
		// value to the `model` and remove it from the `options object.
		_.each( this.defaults, function( def, key ) {
			var value = this.options[ key ];
			if ( _.isUndefined( value ) ) {
				return;
			}

			this.model.set( key, value );
			delete this.options[ key ];
		}, this );

		this.listenTo( this.model, 'change', this.render );
	},
	/**
	 * @returns {wp.media.view.Button} Returns itself to allow chaining
	 */
	render: function() {
		var classes = [ 'button', this.className ],
			model = this.model.toJSON();

		if ( model.style ) {
			classes.push( 'button-' + model.style );
		}

		if ( model.size ) {
			classes.push( 'button-' + model.size );
		}

		classes = _.uniq( classes.concat( this.options.classes ) );
		this.el.className = classes.join(' ');

		this.$el.attr( 'disabled', model.disabled );
		this.$el.text( this.model.get('text') );

		return this;
	},
	/**
	 * @param {Object} event
	 */
	click: function( event ) {
		if ( '#' === this.attributes.href ) {
			event.preventDefault();
		}

		if ( this.options.click && ! this.model.get('disabled') ) {
			this.options.click.apply( this, arguments );
		}
	}
});

module.exports = Button;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/cropper.js":[function(require,module,exports){
/**
 * wp.media.view.Cropper
 *
 * Uses the imgAreaSelect plugin to allow a user to crop an image.
 *
 * Takes imgAreaSelect options from
 * wp.customize.HeaderControl.calculateImageSelectOptions via
 * wp.customize.HeaderControl.openMM.
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	UploaderStatus = wp.media.view.UploaderStatus,
	l10n = wp.media.view.l10n,
	$ = jQuery,
	Cropper;

Cropper = View.extend({
	className: 'crop-content',
	template: wp.template('crop-content'),
	initialize: function() {
		_.bindAll(this, 'onImageLoad');
	},
	ready: function() {
		this.controller.frame.on('content:error:crop', this.onError, this);
		this.$image = this.$el.find('.crop-image');
		this.$image.on('load', this.onImageLoad);
		$(window).on('resize.cropper', _.debounce(this.onImageLoad, 250));
	},
	remove: function() {
		$(window).off('resize.cropper');
		this.$el.remove();
		this.$el.off();
		View.prototype.remove.apply(this, arguments);
	},
	prepare: function() {
		return {
			title: l10n.cropYourImage,
			url: this.options.attachment.get('url')
		};
	},
	onImageLoad: function() {
		var imgOptions = this.controller.get('imgSelectOptions');
		if (typeof imgOptions === 'function') {
			imgOptions = imgOptions(this.options.attachment, this.controller);
		}

		imgOptions = _.extend(imgOptions, {parent: this.$el});
		this.trigger('image-loaded');
		this.controller.imgSelect = this.$image.imgAreaSelect(imgOptions);
	},
	onError: function() {
		var filename = this.options.attachment.get('filename');

		this.views.add( '.upload-errors', new wp.media.view.UploaderStatusError({
			filename: UploaderStatus.prototype.filename(filename),
			message: window._wpMediaViewsL10n.cropError
		}), { at: 0 });
	}
});

module.exports = Cropper;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/edit-image.js":[function(require,module,exports){
/**
 * wp.media.view.EditImage
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	EditImage;

EditImage = View.extend({
	className: 'image-editor',
	template: wp.template('image-editor'),

	initialize: function( options ) {
		this.editor = window.imageEdit;
		this.controller = options.controller;
		View.prototype.initialize.apply( this, arguments );
	},

	prepare: function() {
		return this.model.toJSON();
	},

	loadEditor: function() {
		var dfd = this.editor.open( this.model.get('id'), this.model.get('nonces').edit, this );
		dfd.done( _.bind( this.focus, this ) );
	},

	focus: function() {
		this.$( '.imgedit-submit .button' ).eq( 0 ).focus();
	},

	back: function() {
		var lastState = this.controller.lastState();
		this.controller.setState( lastState );
	},

	refresh: function() {
		this.model.fetch();
	},

	save: function() {
		var lastState = this.controller.lastState();

		this.model.fetch().done( _.bind( function() {
			this.controller.setState( lastState );
		}, this ) );
	}

});

module.exports = EditImage;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/embed.js":[function(require,module,exports){
/**
 * wp.media.view.Embed
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Embed = wp.media.View.extend({
	className: 'media-embed',

	initialize: function() {
		/**
		 * @member {wp.media.view.EmbedUrl}
		 */
		this.url = new wp.media.view.EmbedUrl({
			controller: this.controller,
			model:      this.model.props
		}).render();

		this.views.set([ this.url ]);
		this.refresh();
		this.listenTo( this.model, 'change:type', this.refresh );
		this.listenTo( this.model, 'change:loading', this.loading );
	},

	/**
	 * @param {Object} view
	 */
	settings: function( view ) {
		if ( this._settings ) {
			this._settings.remove();
		}
		this._settings = view;
		this.views.add( view );
	},

	refresh: function() {
		var type = this.model.get('type'),
			constructor;

		if ( 'image' === type ) {
			constructor = wp.media.view.EmbedImage;
		} else if ( 'link' === type ) {
			constructor = wp.media.view.EmbedLink;
		} else {
			return;
		}

		this.settings( new constructor({
			controller: this.controller,
			model:      this.model.props,
			priority:   40
		}) );
	},

	loading: function() {
		this.$el.toggleClass( 'embed-loading', this.model.get('loading') );
	}
});

module.exports = Embed;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/embed/image.js":[function(require,module,exports){
/**
 * wp.media.view.EmbedImage
 *
 * @class
 * @augments wp.media.view.Settings.AttachmentDisplay
 * @augments wp.media.view.Settings
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var AttachmentDisplay = wp.media.view.Settings.AttachmentDisplay,
	EmbedImage;

EmbedImage = AttachmentDisplay.extend({
	className: 'embed-media-settings',
	template:  wp.template('embed-image-settings'),

	initialize: function() {
		/**
		 * Call `initialize` directly on parent class with passed arguments
		 */
		AttachmentDisplay.prototype.initialize.apply( this, arguments );
		this.listenTo( this.model, 'change:url', this.updateImage );
	},

	updateImage: function() {
		this.$('img').attr( 'src', this.model.get('url') );
	}
});

module.exports = EmbedImage;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/embed/link.js":[function(require,module,exports){
/**
 * wp.media.view.EmbedLink
 *
 * @class
 * @augments wp.media.view.Settings
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var $ = jQuery,
	EmbedLink;

EmbedLink = wp.media.view.Settings.extend({
	className: 'embed-link-settings',
	template:  wp.template('embed-link-settings'),

	initialize: function() {
		this.listenTo( this.model, 'change:url', this.updateoEmbed );
	},

	updateoEmbed: _.debounce( function() {
		var url = this.model.get( 'url' );

		// clear out previous results
		this.$('.embed-container').hide().find('.embed-preview').empty();
		this.$( '.setting' ).hide();

		// only proceed with embed if the field contains more than 11 characters
		// Example: http://a.io is 11 chars
		if ( url && ( url.length < 11 || ! url.match(/^http(s)?:\/\//) ) ) {
			return;
		}

		this.fetch();
	}, wp.media.controller.Embed.sensitivity ),

	fetch: function() {
		var embed;

		// check if they haven't typed in 500 ms
		if ( $('#embed-url-field').val() !== this.model.get('url') ) {
			return;
		}

		if ( this.dfd && 'pending' === this.dfd.state() ) {
			this.dfd.abort();
		}

		embed = new wp.shortcode({
			tag: 'embed',
			attrs: _.pick( this.model.attributes, [ 'width', 'height', 'src' ] ),
			content: this.model.get('url')
		});

		this.dfd = $.ajax({
			type:    'POST',
			url:     wp.ajax.settings.url,
			context: this,
			data:    {
				action: 'parse-embed',
				post_ID: wp.media.view.settings.post.id,
				shortcode: embed.string()
			}
		})
			.done( this.renderoEmbed )
			.fail( this.renderFail );
	},

	renderFail: function ( response, status ) {
		if ( 'abort' === status ) {
			return;
		}
		this.$( '.link-text' ).show();
	},

	renderoEmbed: function( response ) {
		var html = ( response && response.data && response.data.body ) || '';

		if ( html ) {
			this.$('.embed-container').show().find('.embed-preview').html( html );
		} else {
			this.renderFail();
		}
	}
});

module.exports = EmbedLink;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/embed/url.js":[function(require,module,exports){
/**
 * wp.media.view.EmbedUrl
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	$ = jQuery,
	EmbedUrl;

EmbedUrl = View.extend({
	tagName:   'label',
	className: 'embed-url',

	events: {
		'input':  'url',
		'keyup':  'url',
		'change': 'url'
	},

	initialize: function() {
		this.$input = $('<input id="embed-url-field" type="url" />').val( this.model.get('url') );
		this.input = this.$input[0];

		this.spinner = $('<span class="spinner" />')[0];
		this.$el.append([ this.input, this.spinner ]);

		this.listenTo( this.model, 'change:url', this.render );

		if ( this.model.get( 'url' ) ) {
			_.delay( _.bind( function () {
				this.model.trigger( 'change:url' );
			}, this ), 500 );
		}
	},
	/**
	 * @returns {wp.media.view.EmbedUrl} Returns itself to allow chaining
	 */
	render: function() {
		var $input = this.$input;

		if ( $input.is(':focus') ) {
			return;
		}

		this.input.value = this.model.get('url') || 'http://';
		/**
		 * Call `render` directly on parent class with passed arguments
		 */
		View.prototype.render.apply( this, arguments );
		return this;
	},

	ready: function() {
		if ( ! wp.media.isTouchDevice ) {
			this.focus();
		}
	},

	url: function( event ) {
		this.model.set( 'url', event.target.value );
	},

	/**
	 * If the input is visible, focus and select its contents.
	 */
	focus: function() {
		var $input = this.$input;
		if ( $input.is(':visible') ) {
			$input.focus()[0].select();
		}
	}
});

module.exports = EmbedUrl;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/focus-manager.js":[function(require,module,exports){
/**
 * wp.media.view.FocusManager
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var FocusManager = wp.media.View.extend({

	events: {
		'keydown': 'constrainTabbing'
	},

	focus: function() { // Reset focus on first left menu item
		this.$('.media-menu-item').first().focus();
	},
	/**
	 * @param {Object} event
	 */
	constrainTabbing: function( event ) {
		var tabbables;

		// Look for the tab key.
		if ( 9 !== event.keyCode ) {
			return;
		}

		// Skip the file input added by Plupload.
		tabbables = this.$( ':tabbable' ).not( '.moxie-shim input[type="file"]' );

		// Keep tab focus within media modal while it's open
		if ( tabbables.last()[0] === event.target && ! event.shiftKey ) {
			tabbables.first().focus();
			return false;
		} else if ( tabbables.first()[0] === event.target && event.shiftKey ) {
			tabbables.last().focus();
			return false;
		}
	}

});

module.exports = FocusManager;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/frame.js":[function(require,module,exports){
/**
 * wp.media.view.Frame
 *
 * A frame is a composite view consisting of one or more regions and one or more
 * states.
 *
 * @see wp.media.controller.State
 * @see wp.media.controller.Region
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 * @mixes wp.media.controller.StateMachine
 */
var Frame = wp.media.View.extend({
	initialize: function() {
		_.defaults( this.options, {
			mode: [ 'select' ]
		});
		this._createRegions();
		this._createStates();
		this._createModes();
	},

	_createRegions: function() {
		// Clone the regions array.
		this.regions = this.regions ? this.regions.slice() : [];

		// Initialize regions.
		_.each( this.regions, function( region ) {
			this[ region ] = new wp.media.controller.Region({
				view:     this,
				id:       region,
				selector: '.media-frame-' + region
			});
		}, this );
	},
	/**
	 * Create the frame's states.
	 *
	 * @see wp.media.controller.State
	 * @see wp.media.controller.StateMachine
	 *
	 * @fires wp.media.controller.State#ready
	 */
	_createStates: function() {
		// Create the default `states` collection.
		this.states = new Backbone.Collection( null, {
			model: wp.media.controller.State
		});

		// Ensure states have a reference to the frame.
		this.states.on( 'add', function( model ) {
			model.frame = this;
			model.trigger('ready');
		}, this );

		if ( this.options.states ) {
			this.states.add( this.options.states );
		}
	},

	/**
	 * A frame can be in a mode or multiple modes at one time.
	 *
	 * For example, the manage media frame can be in the `Bulk Select` or `Edit` mode.
	 */
	_createModes: function() {
		// Store active "modes" that the frame is in. Unrelated to region modes.
		this.activeModes = new Backbone.Collection();
		this.activeModes.on( 'add remove reset', _.bind( this.triggerModeEvents, this ) );

		_.each( this.options.mode, function( mode ) {
			this.activateMode( mode );
		}, this );
	},
	/**
	 * Reset all states on the frame to their defaults.
	 *
	 * @returns {wp.media.view.Frame} Returns itself to allow chaining
	 */
	reset: function() {
		this.states.invoke( 'trigger', 'reset' );
		return this;
	},
	/**
	 * Map activeMode collection events to the frame.
	 */
	triggerModeEvents: function( model, collection, options ) {
		var collectionEvent,
			modeEventMap = {
				add: 'activate',
				remove: 'deactivate'
			},
			eventToTrigger;
		// Probably a better way to do this.
		_.each( options, function( value, key ) {
			if ( value ) {
				collectionEvent = key;
			}
		} );

		if ( ! _.has( modeEventMap, collectionEvent ) ) {
			return;
		}

		eventToTrigger = model.get('id') + ':' + modeEventMap[collectionEvent];
		this.trigger( eventToTrigger );
	},
	/**
	 * Activate a mode on the frame.
	 *
	 * @param string mode Mode ID.
	 * @returns {this} Returns itself to allow chaining.
	 */
	activateMode: function( mode ) {
		// Bail if the mode is already active.
		if ( this.isModeActive( mode ) ) {
			return;
		}
		this.activeModes.add( [ { id: mode } ] );
		// Add a CSS class to the frame so elements can be styled for the mode.
		this.$el.addClass( 'mode-' + mode );

		return this;
	},
	/**
	 * Deactivate a mode on the frame.
	 *
	 * @param string mode Mode ID.
	 * @returns {this} Returns itself to allow chaining.
	 */
	deactivateMode: function( mode ) {
		// Bail if the mode isn't active.
		if ( ! this.isModeActive( mode ) ) {
			return this;
		}
		this.activeModes.remove( this.activeModes.where( { id: mode } ) );
		this.$el.removeClass( 'mode-' + mode );
		/**
		 * Frame mode deactivation event.
		 *
		 * @event this#{mode}:deactivate
		 */
		this.trigger( mode + ':deactivate' );

		return this;
	},
	/**
	 * Check if a mode is enabled on the frame.
	 *
	 * @param  string mode Mode ID.
	 * @return bool
	 */
	isModeActive: function( mode ) {
		return Boolean( this.activeModes.where( { id: mode } ).length );
	}
});

// Make the `Frame` a `StateMachine`.
_.extend( Frame.prototype, wp.media.controller.StateMachine.prototype );

module.exports = Frame;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/frame/image-details.js":[function(require,module,exports){
/**
 * wp.media.view.MediaFrame.ImageDetails
 *
 * A media frame for manipulating an image that's already been inserted
 * into a post.
 *
 * @class
 * @augments wp.media.view.MediaFrame.Select
 * @augments wp.media.view.MediaFrame
 * @augments wp.media.view.Frame
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 * @mixes wp.media.controller.StateMachine
 */
var Select = wp.media.view.MediaFrame.Select,
	l10n = wp.media.view.l10n,
	ImageDetails;

ImageDetails = Select.extend({
	defaults: {
		id:      'image',
		url:     '',
		menu:    'image-details',
		content: 'image-details',
		toolbar: 'image-details',
		type:    'link',
		title:    l10n.imageDetailsTitle,
		priority: 120
	},

	initialize: function( options ) {
		this.image = new wp.media.model.PostImage( options.metadata );
		this.options.selection = new wp.media.model.Selection( this.image.attachment, { multiple: false } );
		Select.prototype.initialize.apply( this, arguments );
	},

	bindHandlers: function() {
		Select.prototype.bindHandlers.apply( this, arguments );
		this.on( 'menu:create:image-details', this.createMenu, this );
		this.on( 'content:create:image-details', this.imageDetailsContent, this );
		this.on( 'content:render:edit-image', this.editImageContent, this );
		this.on( 'toolbar:render:image-details', this.renderImageDetailsToolbar, this );
		// override the select toolbar
		this.on( 'toolbar:render:replace', this.renderReplaceImageToolbar, this );
	},

	createStates: function() {
		this.states.add([
			new wp.media.controller.ImageDetails({
				image: this.image,
				editable: false
			}),
			new wp.media.controller.ReplaceImage({
				id: 'replace-image',
				library: wp.media.query( { type: 'image' } ),
				image: this.image,
				multiple:  false,
				title:     l10n.imageReplaceTitle,
				toolbar: 'replace',
				priority:  80,
				displaySettings: true
			}),
			new wp.media.controller.EditImage( {
				image: this.image,
				selection: this.options.selection
			} )
		]);
	},

	imageDetailsContent: function( options ) {
		options.view = new wp.media.view.ImageDetails({
			controller: this,
			model: this.state().image,
			attachment: this.state().image.attachment
		});
	},

	editImageContent: function() {
		var state = this.state(),
			model = state.get('image'),
			view;

		if ( ! model ) {
			return;
		}

		view = new wp.media.view.EditImage( { model: model, controller: this } ).render();

		this.content.set( view );

		// after bringing in the frame, load the actual editor via an ajax call
		view.loadEditor();

	},

	renderImageDetailsToolbar: function() {
		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				select: {
					style:    'primary',
					text:     l10n.update,
					priority: 80,

					click: function() {
						var controller = this.controller,
							state = controller.state();

						controller.close();

						// not sure if we want to use wp.media.string.image which will create a shortcode or
						// perhaps wp.html.string to at least to build the <img />
						state.trigger( 'update', controller.image.toJSON() );

						// Restore and reset the default state.
						controller.setState( controller.options.state );
						controller.reset();
					}
				}
			}
		}) );
	},

	renderReplaceImageToolbar: function() {
		var frame = this,
			lastState = frame.lastState(),
			previous = lastState && lastState.id;

		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				back: {
					text:     l10n.back,
					priority: 20,
					click:    function() {
						if ( previous ) {
							frame.setState( previous );
						} else {
							frame.close();
						}
					}
				},

				replace: {
					style:    'primary',
					text:     l10n.replace,
					priority: 80,

					click: function() {
						var controller = this.controller,
							state = controller.state(),
							selection = state.get( 'selection' ),
							attachment = selection.single();

						controller.close();

						controller.image.changeAttachment( attachment, state.display( attachment ) );

						// not sure if we want to use wp.media.string.image which will create a shortcode or
						// perhaps wp.html.string to at least to build the <img />
						state.trigger( 'replace', controller.image.toJSON() );

						// Restore and reset the default state.
						controller.setState( controller.options.state );
						controller.reset();
					}
				}
			}
		}) );
	}

});

module.exports = ImageDetails;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/frame/post.js":[function(require,module,exports){
/**
 * wp.media.view.MediaFrame.Post
 *
 * The frame for manipulating media on the Edit Post page.
 *
 * @class
 * @augments wp.media.view.MediaFrame.Select
 * @augments wp.media.view.MediaFrame
 * @augments wp.media.view.Frame
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 * @mixes wp.media.controller.StateMachine
 */
var Select = wp.media.view.MediaFrame.Select,
	Library = wp.media.controller.Library,
	l10n = wp.media.view.l10n,
	Post;

Post = Select.extend({
	initialize: function() {
		this.counts = {
			audio: {
				count: wp.media.view.settings.attachmentCounts.audio,
				state: 'playlist'
			},
			video: {
				count: wp.media.view.settings.attachmentCounts.video,
				state: 'video-playlist'
			}
		};

		_.defaults( this.options, {
			multiple:  true,
			editing:   false,
			state:    'insert',
			metadata:  {}
		});

		// Call 'initialize' directly on the parent class.
		Select.prototype.initialize.apply( this, arguments );
		this.createIframeStates();

	},

	/**
	 * Create the default states.
	 */
	createStates: function() {
		var options = this.options;

		this.states.add([
			// Main states.
			new Library({
				id:         'insert',
				title:      l10n.insertMediaTitle,
				priority:   20,
				toolbar:    'main-insert',
				filterable: 'all',
				library:    wp.media.query( options.library ),
				multiple:   options.multiple ? 'reset' : false,
				editable:   true,

				// If the user isn't allowed to edit fields,
				// can they still edit it locally?
				allowLocalEdits: true,

				// Show the attachment display settings.
				displaySettings: true,
				// Update user settings when users adjust the
				// attachment display settings.
				displayUserSettings: true
			}),

			new Library({
				id:         'gallery',
				title:      l10n.createGalleryTitle,
				priority:   40,
				toolbar:    'main-gallery',
				filterable: 'uploaded',
				multiple:   'add',
				editable:   false,

				library:  wp.media.query( _.defaults({
					type: 'image'
				}, options.library ) )
			}),

			// Embed states.
			new wp.media.controller.Embed( { metadata: options.metadata } ),

			new wp.media.controller.EditImage( { model: options.editImage } ),

			// Gallery states.
			new wp.media.controller.GalleryEdit({
				library: options.selection,
				editing: options.editing,
				menu:    'gallery'
			}),

			new wp.media.controller.GalleryAdd(),

			new Library({
				id:         'playlist',
				title:      l10n.createPlaylistTitle,
				priority:   60,
				toolbar:    'main-playlist',
				filterable: 'uploaded',
				multiple:   'add',
				editable:   false,

				library:  wp.media.query( _.defaults({
					type: 'audio'
				}, options.library ) )
			}),

			// Playlist states.
			new wp.media.controller.CollectionEdit({
				type: 'audio',
				collectionType: 'playlist',
				title:          l10n.editPlaylistTitle,
				SettingsView:   wp.media.view.Settings.Playlist,
				library:        options.selection,
				editing:        options.editing,
				menu:           'playlist',
				dragInfoText:   l10n.playlistDragInfo,
				dragInfo:       false
			}),

			new wp.media.controller.CollectionAdd({
				type: 'audio',
				collectionType: 'playlist',
				title: l10n.addToPlaylistTitle
			}),

			new Library({
				id:         'video-playlist',
				title:      l10n.createVideoPlaylistTitle,
				priority:   60,
				toolbar:    'main-video-playlist',
				filterable: 'uploaded',
				multiple:   'add',
				editable:   false,

				library:  wp.media.query( _.defaults({
					type: 'video'
				}, options.library ) )
			}),

			new wp.media.controller.CollectionEdit({
				type: 'video',
				collectionType: 'playlist',
				title:          l10n.editVideoPlaylistTitle,
				SettingsView:   wp.media.view.Settings.Playlist,
				library:        options.selection,
				editing:        options.editing,
				menu:           'video-playlist',
				dragInfoText:   l10n.videoPlaylistDragInfo,
				dragInfo:       false
			}),

			new wp.media.controller.CollectionAdd({
				type: 'video',
				collectionType: 'playlist',
				title: l10n.addToVideoPlaylistTitle
			})
		]);

		if ( wp.media.view.settings.post.featuredImageId ) {
			this.states.add( new wp.media.controller.FeaturedImage() );
		}
	},

	bindHandlers: function() {
		var handlers, checkCounts;

		Select.prototype.bindHandlers.apply( this, arguments );

		this.on( 'activate', this.activate, this );

		// Only bother checking media type counts if one of the counts is zero
		checkCounts = _.find( this.counts, function( type ) {
			return type.count === 0;
		} );

		if ( typeof checkCounts !== 'undefined' ) {
			this.listenTo( wp.media.model.Attachments.all, 'change:type', this.mediaTypeCounts );
		}

		this.on( 'menu:create:gallery', this.createMenu, this );
		this.on( 'menu:create:playlist', this.createMenu, this );
		this.on( 'menu:create:video-playlist', this.createMenu, this );
		this.on( 'toolbar:create:main-insert', this.createToolbar, this );
		this.on( 'toolbar:create:main-gallery', this.createToolbar, this );
		this.on( 'toolbar:create:main-playlist', this.createToolbar, this );
		this.on( 'toolbar:create:main-video-playlist', this.createToolbar, this );
		this.on( 'toolbar:create:featured-image', this.featuredImageToolbar, this );
		this.on( 'toolbar:create:main-embed', this.mainEmbedToolbar, this );

		handlers = {
			menu: {
				'default': 'mainMenu',
				'gallery': 'galleryMenu',
				'playlist': 'playlistMenu',
				'video-playlist': 'videoPlaylistMenu'
			},

			content: {
				'embed':          'embedContent',
				'edit-image':     'editImageContent',
				'edit-selection': 'editSelectionContent'
			},

			toolbar: {
				'main-insert':      'mainInsertToolbar',
				'main-gallery':     'mainGalleryToolbar',
				'gallery-edit':     'galleryEditToolbar',
				'gallery-add':      'galleryAddToolbar',
				'main-playlist':	'mainPlaylistToolbar',
				'playlist-edit':	'playlistEditToolbar',
				'playlist-add':		'playlistAddToolbar',
				'main-video-playlist': 'mainVideoPlaylistToolbar',
				'video-playlist-edit': 'videoPlaylistEditToolbar',
				'video-playlist-add': 'videoPlaylistAddToolbar'
			}
		};

		_.each( handlers, function( regionHandlers, region ) {
			_.each( regionHandlers, function( callback, handler ) {
				this.on( region + ':render:' + handler, this[ callback ], this );
			}, this );
		}, this );
	},

	activate: function() {
		// Hide menu items for states tied to particular media types if there are no items
		_.each( this.counts, function( type ) {
			if ( type.count < 1 ) {
				this.menuItemVisibility( type.state, 'hide' );
			}
		}, this );
	},

	mediaTypeCounts: function( model, attr ) {
		if ( typeof this.counts[ attr ] !== 'undefined' && this.counts[ attr ].count < 1 ) {
			this.counts[ attr ].count++;
			this.menuItemVisibility( this.counts[ attr ].state, 'show' );
		}
	},

	// Menus
	/**
	 * @param {wp.Backbone.View} view
	 */
	mainMenu: function( view ) {
		view.set({
			'library-separator': new wp.media.View({
				className: 'separator',
				priority: 100
			})
		});
	},

	menuItemVisibility: function( state, visibility ) {
		var menu = this.menu.get();
		if ( visibility === 'hide' ) {
			menu.hide( state );
		} else if ( visibility === 'show' ) {
			menu.show( state );
		}
	},
	/**
	 * @param {wp.Backbone.View} view
	 */
	galleryMenu: function( view ) {
		var lastState = this.lastState(),
			previous = lastState && lastState.id,
			frame = this;

		view.set({
			cancel: {
				text:     l10n.cancelGalleryTitle,
				priority: 20,
				click:    function() {
					if ( previous ) {
						frame.setState( previous );
					} else {
						frame.close();
					}

					// Keep focus inside media modal
					// after canceling a gallery
					this.controller.modal.focusManager.focus();
				}
			},
			separateCancel: new wp.media.View({
				className: 'separator',
				priority: 40
			})
		});
	},

	playlistMenu: function( view ) {
		var lastState = this.lastState(),
			previous = lastState && lastState.id,
			frame = this;

		view.set({
			cancel: {
				text:     l10n.cancelPlaylistTitle,
				priority: 20,
				click:    function() {
					if ( previous ) {
						frame.setState( previous );
					} else {
						frame.close();
					}
				}
			},
			separateCancel: new wp.media.View({
				className: 'separator',
				priority: 40
			})
		});
	},

	videoPlaylistMenu: function( view ) {
		var lastState = this.lastState(),
			previous = lastState && lastState.id,
			frame = this;

		view.set({
			cancel: {
				text:     l10n.cancelVideoPlaylistTitle,
				priority: 20,
				click:    function() {
					if ( previous ) {
						frame.setState( previous );
					} else {
						frame.close();
					}
				}
			},
			separateCancel: new wp.media.View({
				className: 'separator',
				priority: 40
			})
		});
	},

	// Content
	embedContent: function() {
		var view = new wp.media.view.Embed({
			controller: this,
			model:      this.state()
		}).render();

		this.content.set( view );

		if ( ! wp.media.isTouchDevice ) {
			view.url.focus();
		}
	},

	editSelectionContent: function() {
		var state = this.state(),
			selection = state.get('selection'),
			view;

		view = new wp.media.view.AttachmentsBrowser({
			controller: this,
			collection: selection,
			selection:  selection,
			model:      state,
			sortable:   true,
			search:     false,
			date:       false,
			dragInfo:   true,

			AttachmentView: wp.media.view.Attachments.EditSelection
		}).render();

		view.toolbar.set( 'backToLibrary', {
			text:     l10n.returnToLibrary,
			priority: -100,

			click: function() {
				this.controller.content.mode('browse');
			}
		});

		// Browse our library of attachments.
		this.content.set( view );

		// Trigger the controller to set focus
		this.trigger( 'edit:selection', this );
	},

	editImageContent: function() {
		var image = this.state().get('image'),
			view = new wp.media.view.EditImage( { model: image, controller: this } ).render();

		this.content.set( view );

		// after creating the wrapper view, load the actual editor via an ajax call
		view.loadEditor();

	},

	// Toolbars

	/**
	 * @param {wp.Backbone.View} view
	 */
	selectionStatusToolbar: function( view ) {
		var editable = this.state().get('editable');

		view.set( 'selection', new wp.media.view.Selection({
			controller: this,
			collection: this.state().get('selection'),
			priority:   -40,

			// If the selection is editable, pass the callback to
			// switch the content mode.
			editable: editable && function() {
				this.controller.content.mode('edit-selection');
			}
		}).render() );
	},

	/**
	 * @param {wp.Backbone.View} view
	 */
	mainInsertToolbar: function( view ) {
		var controller = this;

		this.selectionStatusToolbar( view );

		view.set( 'insert', {
			style:    'primary',
			priority: 80,
			text:     l10n.insertIntoPost,
			requires: { selection: true },

			/**
			 * @fires wp.media.controller.State#insert
			 */
			click: function() {
				var state = controller.state(),
					selection = state.get('selection');

				controller.close();
				state.trigger( 'insert', selection ).reset();
			}
		});
	},

	/**
	 * @param {wp.Backbone.View} view
	 */
	mainGalleryToolbar: function( view ) {
		var controller = this;

		this.selectionStatusToolbar( view );

		view.set( 'gallery', {
			style:    'primary',
			text:     l10n.createNewGallery,
			priority: 60,
			requires: { selection: true },

			click: function() {
				var selection = controller.state().get('selection'),
					edit = controller.state('gallery-edit'),
					models = selection.where({ type: 'image' });

				edit.set( 'library', new wp.media.model.Selection( models, {
					props:    selection.props.toJSON(),
					multiple: true
				}) );

				this.controller.setState('gallery-edit');

				// Keep focus inside media modal
				// after jumping to gallery view
				this.controller.modal.focusManager.focus();
			}
		});
	},

	mainPlaylistToolbar: function( view ) {
		var controller = this;

		this.selectionStatusToolbar( view );

		view.set( 'playlist', {
			style:    'primary',
			text:     l10n.createNewPlaylist,
			priority: 100,
			requires: { selection: true },

			click: function() {
				var selection = controller.state().get('selection'),
					edit = controller.state('playlist-edit'),
					models = selection.where({ type: 'audio' });

				edit.set( 'library', new wp.media.model.Selection( models, {
					props:    selection.props.toJSON(),
					multiple: true
				}) );

				this.controller.setState('playlist-edit');

				// Keep focus inside media modal
				// after jumping to playlist view
				this.controller.modal.focusManager.focus();
			}
		});
	},

	mainVideoPlaylistToolbar: function( view ) {
		var controller = this;

		this.selectionStatusToolbar( view );

		view.set( 'video-playlist', {
			style:    'primary',
			text:     l10n.createNewVideoPlaylist,
			priority: 100,
			requires: { selection: true },

			click: function() {
				var selection = controller.state().get('selection'),
					edit = controller.state('video-playlist-edit'),
					models = selection.where({ type: 'video' });

				edit.set( 'library', new wp.media.model.Selection( models, {
					props:    selection.props.toJSON(),
					multiple: true
				}) );

				this.controller.setState('video-playlist-edit');

				// Keep focus inside media modal
				// after jumping to video playlist view
				this.controller.modal.focusManager.focus();
			}
		});
	},

	featuredImageToolbar: function( toolbar ) {
		this.createSelectToolbar( toolbar, {
			text:  l10n.setFeaturedImage,
			state: this.options.state
		});
	},

	mainEmbedToolbar: function( toolbar ) {
		toolbar.view = new wp.media.view.Toolbar.Embed({
			controller: this
		});
	},

	galleryEditToolbar: function() {
		var editing = this.state().get('editing');
		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				insert: {
					style:    'primary',
					text:     editing ? l10n.updateGallery : l10n.insertGallery,
					priority: 80,
					requires: { library: true },

					/**
					 * @fires wp.media.controller.State#update
					 */
					click: function() {
						var controller = this.controller,
							state = controller.state();

						controller.close();
						state.trigger( 'update', state.get('library') );

						// Restore and reset the default state.
						controller.setState( controller.options.state );
						controller.reset();
					}
				}
			}
		}) );
	},

	galleryAddToolbar: function() {
		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				insert: {
					style:    'primary',
					text:     l10n.addToGallery,
					priority: 80,
					requires: { selection: true },

					/**
					 * @fires wp.media.controller.State#reset
					 */
					click: function() {
						var controller = this.controller,
							state = controller.state(),
							edit = controller.state('gallery-edit');

						edit.get('library').add( state.get('selection').models );
						state.trigger('reset');
						controller.setState('gallery-edit');
					}
				}
			}
		}) );
	},

	playlistEditToolbar: function() {
		var editing = this.state().get('editing');
		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				insert: {
					style:    'primary',
					text:     editing ? l10n.updatePlaylist : l10n.insertPlaylist,
					priority: 80,
					requires: { library: true },

					/**
					 * @fires wp.media.controller.State#update
					 */
					click: function() {
						var controller = this.controller,
							state = controller.state();

						controller.close();
						state.trigger( 'update', state.get('library') );

						// Restore and reset the default state.
						controller.setState( controller.options.state );
						controller.reset();
					}
				}
			}
		}) );
	},

	playlistAddToolbar: function() {
		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				insert: {
					style:    'primary',
					text:     l10n.addToPlaylist,
					priority: 80,
					requires: { selection: true },

					/**
					 * @fires wp.media.controller.State#reset
					 */
					click: function() {
						var controller = this.controller,
							state = controller.state(),
							edit = controller.state('playlist-edit');

						edit.get('library').add( state.get('selection').models );
						state.trigger('reset');
						controller.setState('playlist-edit');
					}
				}
			}
		}) );
	},

	videoPlaylistEditToolbar: function() {
		var editing = this.state().get('editing');
		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				insert: {
					style:    'primary',
					text:     editing ? l10n.updateVideoPlaylist : l10n.insertVideoPlaylist,
					priority: 140,
					requires: { library: true },

					click: function() {
						var controller = this.controller,
							state = controller.state(),
							library = state.get('library');

						library.type = 'video';

						controller.close();
						state.trigger( 'update', library );

						// Restore and reset the default state.
						controller.setState( controller.options.state );
						controller.reset();
					}
				}
			}
		}) );
	},

	videoPlaylistAddToolbar: function() {
		this.toolbar.set( new wp.media.view.Toolbar({
			controller: this,
			items: {
				insert: {
					style:    'primary',
					text:     l10n.addToVideoPlaylist,
					priority: 140,
					requires: { selection: true },

					click: function() {
						var controller = this.controller,
							state = controller.state(),
							edit = controller.state('video-playlist-edit');

						edit.get('library').add( state.get('selection').models );
						state.trigger('reset');
						controller.setState('video-playlist-edit');
					}
				}
			}
		}) );
	}
});

module.exports = Post;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/frame/select.js":[function(require,module,exports){
/**
 * wp.media.view.MediaFrame.Select
 *
 * A frame for selecting an item or items from the media library.
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
	l10n = wp.media.view.l10n,
	Select;

Select = MediaFrame.extend({
	initialize: function() {
		// Call 'initialize' directly on the parent class.
		MediaFrame.prototype.initialize.apply( this, arguments );

		_.defaults( this.options, {
			selection: [],
			library:   {},
			multiple:  false,
			state:    'library'
		});

		this.createSelection();
		this.createStates();
		this.bindHandlers();
	},

	/**
	 * Attach a selection collection to the frame.
	 *
	 * A selection is a collection of attachments used for a specific purpose
	 * by a media frame. e.g. Selecting an attachment (or many) to insert into
	 * post content.
	 *
	 * @see media.model.Selection
	 */
	createSelection: function() {
		var selection = this.options.selection;

		if ( ! (selection instanceof wp.media.model.Selection) ) {
			this.options.selection = new wp.media.model.Selection( selection, {
				multiple: this.options.multiple
			});
		}

		this._selection = {
			attachments: new wp.media.model.Attachments(),
			difference: []
		};
	},

	/**
	 * Create the default states on the frame.
	 */
	createStates: function() {
		var options = this.options;

		if ( this.options.states ) {
			return;
		}

		// Add the default states.
		this.states.add([
			// Main states.
			new wp.media.controller.Library({
				library:   wp.media.query( options.library ),
				multiple:  options.multiple,
				title:     options.title,
				priority:  20
			})
		]);
	},

	/**
	 * Bind region mode event callbacks.
	 *
	 * @see media.controller.Region.render
	 */
	bindHandlers: function() {
		this.on( 'router:create:browse', this.createRouter, this );
		this.on( 'router:render:browse', this.browseRouter, this );
		this.on( 'content:create:browse', this.browseContent, this );
		this.on( 'content:render:upload', this.uploadContent, this );
		this.on( 'toolbar:create:select', this.createSelectToolbar, this );
	},

	/**
	 * Render callback for the router region in the `browse` mode.
	 *
	 * @param {wp.media.view.Router} routerView
	 */
	browseRouter: function( routerView ) {
		routerView.set({
			upload: {
				text:     l10n.uploadFilesTitle,
				priority: 20
			},
			browse: {
				text:     l10n.mediaLibraryTitle,
				priority: 40
			}
		});
	},

	/**
	 * Render callback for the content region in the `browse` mode.
	 *
	 * @param {wp.media.controller.Region} contentRegion
	 */
	browseContent: function( contentRegion ) {
		var state = this.state();

		this.$el.removeClass('hide-toolbar');

		// Browse our library of attachments.
		contentRegion.view = new wp.media.view.AttachmentsBrowser({
			controller: this,
			collection: state.get('library'),
			selection:  state.get('selection'),
			model:      state,
			sortable:   state.get('sortable'),
			search:     state.get('searchable'),
			filters:    state.get('filterable'),
			date:       state.get('date'),
			display:    state.has('display') ? state.get('display') : state.get('displaySettings'),
			dragInfo:   state.get('dragInfo'),

			idealColumnWidth: state.get('idealColumnWidth'),
			suggestedWidth:   state.get('suggestedWidth'),
			suggestedHeight:  state.get('suggestedHeight'),

			AttachmentView: state.get('AttachmentView')
		});
	},

	/**
	 * Render callback for the content region in the `upload` mode.
	 */
	uploadContent: function() {
		this.$el.removeClass( 'hide-toolbar' );
		this.content.set( new wp.media.view.UploaderInline({
			controller: this
		}) );
	},

	/**
	 * Toolbars
	 *
	 * @param {Object} toolbar
	 * @param {Object} [options={}]
	 * @this wp.media.controller.Region
	 */
	createSelectToolbar: function( toolbar, options ) {
		options = options || this.options.button || {};
		options.controller = this;

		toolbar.view = new wp.media.view.Toolbar.Select( options );
	}
});

module.exports = Select;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/iframe.js":[function(require,module,exports){
/**
 * wp.media.view.Iframe
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Iframe = wp.media.View.extend({
	className: 'media-iframe',
	/**
	 * @returns {wp.media.view.Iframe} Returns itself to allow chaining
	 */
	render: function() {
		this.views.detach();
		this.$el.html( '<iframe src="' + this.controller.state().get('src') + '" />' );
		this.views.render();
		return this;
	}
});

module.exports = Iframe;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/image-details.js":[function(require,module,exports){
/**
 * wp.media.view.ImageDetails
 *
 * @class
 * @augments wp.media.view.Settings.AttachmentDisplay
 * @augments wp.media.view.Settings
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var AttachmentDisplay = wp.media.view.Settings.AttachmentDisplay,
	$ = jQuery,
	ImageDetails;

ImageDetails = AttachmentDisplay.extend({
	className: 'image-details',
	template:  wp.template('image-details'),
	events: _.defaults( AttachmentDisplay.prototype.events, {
		'click .edit-attachment': 'editAttachment',
		'click .replace-attachment': 'replaceAttachment',
		'click .advanced-toggle': 'onToggleAdvanced',
		'change [data-setting="customWidth"]': 'onCustomSize',
		'change [data-setting="customHeight"]': 'onCustomSize',
		'keyup [data-setting="customWidth"]': 'onCustomSize',
		'keyup [data-setting="customHeight"]': 'onCustomSize'
	} ),
	initialize: function() {
		// used in AttachmentDisplay.prototype.updateLinkTo
		this.options.attachment = this.model.attachment;
		this.listenTo( this.model, 'change:url', this.updateUrl );
		this.listenTo( this.model, 'change:link', this.toggleLinkSettings );
		this.listenTo( this.model, 'change:size', this.toggleCustomSize );

		AttachmentDisplay.prototype.initialize.apply( this, arguments );
	},

	prepare: function() {
		var attachment = false;

		if ( this.model.attachment ) {
			attachment = this.model.attachment.toJSON();
		}
		return _.defaults({
			model: this.model.toJSON(),
			attachment: attachment
		}, this.options );
	},

	render: function() {
		var args = arguments;

		if ( this.model.attachment && 'pending' === this.model.dfd.state() ) {
			this.model.dfd
				.done( _.bind( function() {
					AttachmentDisplay.prototype.render.apply( this, args );
					this.postRender();
				}, this ) )
				.fail( _.bind( function() {
					this.model.attachment = false;
					AttachmentDisplay.prototype.render.apply( this, args );
					this.postRender();
				}, this ) );
		} else {
			AttachmentDisplay.prototype.render.apply( this, arguments );
			this.postRender();
		}

		return this;
	},

	postRender: function() {
		setTimeout( _.bind( this.resetFocus, this ), 10 );
		this.toggleLinkSettings();
		if ( window.getUserSetting( 'advImgDetails' ) === 'show' ) {
			this.toggleAdvanced( true );
		}
		this.trigger( 'post-render' );
	},

	resetFocus: function() {
		this.$( '.link-to-custom' ).blur();
		this.$( '.embed-media-settings' ).scrollTop( 0 );
	},

	updateUrl: function() {
		this.$( '.image img' ).attr( 'src', this.model.get( 'url' ) );
		this.$( '.url' ).val( this.model.get( 'url' ) );
	},

	toggleLinkSettings: function() {
		if ( this.model.get( 'link' ) === 'none' ) {
			this.$( '.link-settings' ).addClass('hidden');
		} else {
			this.$( '.link-settings' ).removeClass('hidden');
		}
	},

	toggleCustomSize: function() {
		if ( this.model.get( 'size' ) !== 'custom' ) {
			this.$( '.custom-size' ).addClass('hidden');
		} else {
			this.$( '.custom-size' ).removeClass('hidden');
		}
	},

	onCustomSize: function( event ) {
		var dimension = $( event.target ).data('setting'),
			num = $( event.target ).val(),
			value;

		// Ignore bogus input
		if ( ! /^\d+/.test( num ) || parseInt( num, 10 ) < 1 ) {
			event.preventDefault();
			return;
		}

		if ( dimension === 'customWidth' ) {
			value = Math.round( 1 / this.model.get( 'aspectRatio' ) * num );
			this.model.set( 'customHeight', value, { silent: true } );
			this.$( '[data-setting="customHeight"]' ).val( value );
		} else {
			value = Math.round( this.model.get( 'aspectRatio' ) * num );
			this.model.set( 'customWidth', value, { silent: true  } );
			this.$( '[data-setting="customWidth"]' ).val( value );
		}
	},

	onToggleAdvanced: function( event ) {
		event.preventDefault();
		this.toggleAdvanced();
	},

	toggleAdvanced: function( show ) {
		var $advanced = this.$el.find( '.advanced-section' ),
			mode;

		if ( $advanced.hasClass('advanced-visible') || show === false ) {
			$advanced.removeClass('advanced-visible');
			$advanced.find('.advanced-settings').addClass('hidden');
			mode = 'hide';
		} else {
			$advanced.addClass('advanced-visible');
			$advanced.find('.advanced-settings').removeClass('hidden');
			mode = 'show';
		}

		window.setUserSetting( 'advImgDetails', mode );
	},

	editAttachment: function( event ) {
		var editState = this.controller.states.get( 'edit-image' );

		if ( window.imageEdit && editState ) {
			event.preventDefault();
			editState.set( 'image', this.model.attachment );
			this.controller.setState( 'edit-image' );
		}
	},

	replaceAttachment: function( event ) {
		event.preventDefault();
		this.controller.setState( 'replace-image' );
	}
});

module.exports = ImageDetails;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/label.js":[function(require,module,exports){
/**
 * wp.media.view.Label
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Label = wp.media.View.extend({
	tagName: 'label',
	className: 'screen-reader-text',

	initialize: function() {
		this.value = this.options.value;
	},

	render: function() {
		this.$el.html( this.value );

		return this;
	}
});

module.exports = Label;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/media-frame.js":[function(require,module,exports){
/**
 * wp.media.view.MediaFrame
 *
 * The frame used to create the media modal.
 *
 * @class
 * @augments wp.media.view.Frame
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 * @mixes wp.media.controller.StateMachine
 */
var Frame = wp.media.view.Frame,
	$ = jQuery,
	MediaFrame;

MediaFrame = Frame.extend({
	className: 'media-frame',
	template:  wp.template('media-frame'),
	regions:   ['menu','title','content','toolbar','router'],

	events: {
		'click div.media-frame-title h1': 'toggleMenu'
	},

	/**
	 * @global wp.Uploader
	 */
	initialize: function() {
		Frame.prototype.initialize.apply( this, arguments );

		_.defaults( this.options, {
			title:    '',
			modal:    true,
			uploader: true
		});

		// Ensure core UI is enabled.
		this.$el.addClass('wp-core-ui');

		// Initialize modal container view.
		if ( this.options.modal ) {
			this.modal = new wp.media.view.Modal({
				controller: this,
				title:      this.options.title
			});

			this.modal.content( this );
		}

		// Force the uploader off if the upload limit has been exceeded or
		// if the browser isn't supported.
		if ( wp.Uploader.limitExceeded || ! wp.Uploader.browser.supported ) {
			this.options.uploader = false;
		}

		// Initialize window-wide uploader.
		if ( this.options.uploader ) {
			this.uploader = new wp.media.view.UploaderWindow({
				controller: this,
				uploader: {
					dropzone:  this.modal ? this.modal.$el : this.$el,
					container: this.$el
				}
			});
			this.views.set( '.media-frame-uploader', this.uploader );
		}

		this.on( 'attach', _.bind( this.views.ready, this.views ), this );

		// Bind default title creation.
		this.on( 'title:create:default', this.createTitle, this );
		this.title.mode('default');

		this.on( 'title:render', function( view ) {
			view.$el.append( '<span class="dashicons dashicons-arrow-down"></span>' );
		});

		// Bind default menu.
		this.on( 'menu:create:default', this.createMenu, this );
	},
	/**
	 * @returns {wp.media.view.MediaFrame} Returns itself to allow chaining
	 */
	render: function() {
		// Activate the default state if no active state exists.
		if ( ! this.state() && this.options.state ) {
			this.setState( this.options.state );
		}
		/**
		 * call 'render' directly on the parent class
		 */
		return Frame.prototype.render.apply( this, arguments );
	},
	/**
	 * @param {Object} title
	 * @this wp.media.controller.Region
	 */
	createTitle: function( title ) {
		title.view = new wp.media.View({
			controller: this,
			tagName: 'h1'
		});
	},
	/**
	 * @param {Object} menu
	 * @this wp.media.controller.Region
	 */
	createMenu: function( menu ) {
		menu.view = new wp.media.view.Menu({
			controller: this
		});
	},

	toggleMenu: function() {
		this.$el.find( '.media-menu' ).toggleClass( 'visible' );
	},

	/**
	 * @param {Object} toolbar
	 * @this wp.media.controller.Region
	 */
	createToolbar: function( toolbar ) {
		toolbar.view = new wp.media.view.Toolbar({
			controller: this
		});
	},
	/**
	 * @param {Object} router
	 * @this wp.media.controller.Region
	 */
	createRouter: function( router ) {
		router.view = new wp.media.view.Router({
			controller: this
		});
	},
	/**
	 * @param {Object} options
	 */
	createIframeStates: function( options ) {
		var settings = wp.media.view.settings,
			tabs = settings.tabs,
			tabUrl = settings.tabUrl,
			$postId;

		if ( ! tabs || ! tabUrl ) {
			return;
		}

		// Add the post ID to the tab URL if it exists.
		$postId = $('#post_ID');
		if ( $postId.length ) {
			tabUrl += '&post_id=' + $postId.val();
		}

		// Generate the tab states.
		_.each( tabs, function( title, id ) {
			this.state( 'iframe:' + id ).set( _.defaults({
				tab:     id,
				src:     tabUrl + '&tab=' + id,
				title:   title,
				content: 'iframe',
				menu:    'default'
			}, options ) );
		}, this );

		this.on( 'content:create:iframe', this.iframeContent, this );
		this.on( 'content:deactivate:iframe', this.iframeContentCleanup, this );
		this.on( 'menu:render:default', this.iframeMenu, this );
		this.on( 'open', this.hijackThickbox, this );
		this.on( 'close', this.restoreThickbox, this );
	},

	/**
	 * @param {Object} content
	 * @this wp.media.controller.Region
	 */
	iframeContent: function( content ) {
		this.$el.addClass('hide-toolbar');
		content.view = new wp.media.view.Iframe({
			controller: this
		});
	},

	iframeContentCleanup: function() {
		this.$el.removeClass('hide-toolbar');
	},

	iframeMenu: function( view ) {
		var views = {};

		if ( ! view ) {
			return;
		}

		_.each( wp.media.view.settings.tabs, function( title, id ) {
			views[ 'iframe:' + id ] = {
				text: this.state( 'iframe:' + id ).get('title'),
				priority: 200
			};
		}, this );

		view.set( views );
	},

	hijackThickbox: function() {
		var frame = this;

		if ( ! window.tb_remove || this._tb_remove ) {
			return;
		}

		this._tb_remove = window.tb_remove;
		window.tb_remove = function() {
			frame.close();
			frame.reset();
			frame.setState( frame.options.state );
			frame._tb_remove.call( window );
		};
	},

	restoreThickbox: function() {
		if ( ! this._tb_remove ) {
			return;
		}

		window.tb_remove = this._tb_remove;
		delete this._tb_remove;
	}
});

// Map some of the modal's methods to the frame.
_.each(['open','close','attach','detach','escape'], function( method ) {
	/**
	 * @returns {wp.media.view.MediaFrame} Returns itself to allow chaining
	 */
	MediaFrame.prototype[ method ] = function() {
		if ( this.modal ) {
			this.modal[ method ].apply( this.modal, arguments );
		}
		return this;
	};
});

module.exports = MediaFrame;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/menu-item.js":[function(require,module,exports){
/**
 * wp.media.view.MenuItem
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var $ = jQuery,
	MenuItem;

MenuItem = wp.media.View.extend({
	tagName:   'a',
	className: 'media-menu-item',

	attributes: {
		href: '#'
	},

	events: {
		'click': '_click'
	},
	/**
	 * @param {Object} event
	 */
	_click: function( event ) {
		var clickOverride = this.options.click;

		if ( event ) {
			event.preventDefault();
		}

		if ( clickOverride ) {
			clickOverride.call( this );
		} else {
			this.click();
		}

		// When selecting a tab along the left side,
		// focus should be transferred into the main panel
		if ( ! wp.media.isTouchDevice ) {
			$('.media-frame-content input').first().focus();
		}
	},

	click: function() {
		var state = this.options.state;

		if ( state ) {
			this.controller.setState( state );
			this.views.parent.$el.removeClass( 'visible' ); // TODO: or hide on any click, see below
		}
	},
	/**
	 * @returns {wp.media.view.MenuItem} returns itself to allow chaining
	 */
	render: function() {
		var options = this.options;

		if ( options.text ) {
			this.$el.text( options.text );
		} else if ( options.html ) {
			this.$el.html( options.html );
		}

		return this;
	}
});

module.exports = MenuItem;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/menu.js":[function(require,module,exports){
/**
 * wp.media.view.Menu
 *
 * @class
 * @augments wp.media.view.PriorityList
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var MenuItem = wp.media.view.MenuItem,
	PriorityList = wp.media.view.PriorityList,
	Menu;

Menu = PriorityList.extend({
	tagName:   'div',
	className: 'media-menu',
	property:  'state',
	ItemView:  MenuItem,
	region:    'menu',

	/* TODO: alternatively hide on any click anywhere
	events: {
		'click': 'click'
	},

	click: function() {
		this.$el.removeClass( 'visible' );
	},
	*/

	/**
	 * @param {Object} options
	 * @param {string} id
	 * @returns {wp.media.View}
	 */
	toView: function( options, id ) {
		options = options || {};
		options[ this.property ] = options[ this.property ] || id;
		return new this.ItemView( options ).render();
	},

	ready: function() {
		/**
		 * call 'ready' directly on the parent class
		 */
		PriorityList.prototype.ready.apply( this, arguments );
		this.visibility();
	},

	set: function() {
		/**
		 * call 'set' directly on the parent class
		 */
		PriorityList.prototype.set.apply( this, arguments );
		this.visibility();
	},

	unset: function() {
		/**
		 * call 'unset' directly on the parent class
		 */
		PriorityList.prototype.unset.apply( this, arguments );
		this.visibility();
	},

	visibility: function() {
		var region = this.region,
			view = this.controller[ region ].get(),
			views = this.views.get(),
			hide = ! views || views.length < 2;

		if ( this === view ) {
			this.controller.$el.toggleClass( 'hide-' + region, hide );
		}
	},
	/**
	 * @param {string} id
	 */
	select: function( id ) {
		var view = this.get( id );

		if ( ! view ) {
			return;
		}

		this.deselect();
		view.$el.addClass('active');
	},

	deselect: function() {
		this.$el.children().removeClass('active');
	},

	hide: function( id ) {
		var view = this.get( id );

		if ( ! view ) {
			return;
		}

		view.$el.addClass('hidden');
	},

	show: function( id ) {
		var view = this.get( id );

		if ( ! view ) {
			return;
		}

		view.$el.removeClass('hidden');
	}
});

module.exports = Menu;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/modal.js":[function(require,module,exports){
/**
 * wp.media.view.Modal
 *
 * A modal view, which the media modal uses as its default container.
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var $ = jQuery,
	Modal;

Modal = wp.media.View.extend({
	tagName:  'div',
	template: wp.template('media-modal'),

	attributes: {
		tabindex: 0
	},

	events: {
		'click .media-modal-backdrop, .media-modal-close': 'escapeHandler',
		'keydown': 'keydown'
	},

	initialize: function() {
		_.defaults( this.options, {
			container: document.body,
			title:     '',
			propagate: true,
			freeze:    true
		});

		this.focusManager = new wp.media.view.FocusManager({
			el: this.el
		});
	},
	/**
	 * @returns {Object}
	 */
	prepare: function() {
		return {
			title: this.options.title
		};
	},

	/**
	 * @returns {wp.media.view.Modal} Returns itself to allow chaining
	 */
	attach: function() {
		if ( this.views.attached ) {
			return this;
		}

		if ( ! this.views.rendered ) {
			this.render();
		}

		this.$el.appendTo( this.options.container );

		// Manually mark the view as attached and trigger ready.
		this.views.attached = true;
		this.views.ready();

		return this.propagate('attach');
	},

	/**
	 * @returns {wp.media.view.Modal} Returns itself to allow chaining
	 */
	detach: function() {
		if ( this.$el.is(':visible') ) {
			this.close();
		}

		this.$el.detach();
		this.views.attached = false;
		return this.propagate('detach');
	},

	/**
	 * @returns {wp.media.view.Modal} Returns itself to allow chaining
	 */
	open: function() {
		var $el = this.$el,
			options = this.options,
			mceEditor;

		if ( $el.is(':visible') ) {
			return this;
		}

		if ( ! this.views.attached ) {
			this.attach();
		}

		// If the `freeze` option is set, record the window's scroll position.
		if ( options.freeze ) {
			this._freeze = {
				scrollTop: $( window ).scrollTop()
			};
		}

		// Disable page scrolling.
		$( 'body' ).addClass( 'modal-open' );

		$el.show();

		// Try to close the onscreen keyboard
		if ( 'ontouchend' in document ) {
			if ( ( mceEditor = window.tinymce && window.tinymce.activeEditor )  && ! mceEditor.isHidden() && mceEditor.iframeElement ) {
				mceEditor.iframeElement.focus();
				mceEditor.iframeElement.blur();

				setTimeout( function() {
					mceEditor.iframeElement.blur();
				}, 100 );
			}
		}

		this.$el.focus();

		return this.propagate('open');
	},

	/**
	 * @param {Object} options
	 * @returns {wp.media.view.Modal} Returns itself to allow chaining
	 */
	close: function( options ) {
		var freeze = this._freeze;

		if ( ! this.views.attached || ! this.$el.is(':visible') ) {
			return this;
		}

		// Enable page scrolling.
		$( 'body' ).removeClass( 'modal-open' );

		// Hide modal and remove restricted media modal tab focus once it's closed
		this.$el.hide().undelegate( 'keydown' );

		// Put focus back in useful location once modal is closed
		$('#wpbody-content').focus();

		this.propagate('close');

		// If the `freeze` option is set, restore the container's scroll position.
		if ( freeze ) {
			$( window ).scrollTop( freeze.scrollTop );
		}

		if ( options && options.escape ) {
			this.propagate('escape');
		}

		return this;
	},
	/**
	 * @returns {wp.media.view.Modal} Returns itself to allow chaining
	 */
	escape: function() {
		return this.close({ escape: true });
	},
	/**
	 * @param {Object} event
	 */
	escapeHandler: function( event ) {
		event.preventDefault();
		this.escape();
	},

	/**
	 * @param {Array|Object} content Views to register to '.media-modal-content'
	 * @returns {wp.media.view.Modal} Returns itself to allow chaining
	 */
	content: function( content ) {
		this.views.set( '.media-modal-content', content );
		return this;
	},

	/**
	 * Triggers a modal event and if the `propagate` option is set,
	 * forwards events to the modal's controller.
	 *
	 * @param {string} id
	 * @returns {wp.media.view.Modal} Returns itself to allow chaining
	 */
	propagate: function( id ) {
		this.trigger( id );

		if ( this.options.propagate ) {
			this.controller.trigger( id );
		}

		return this;
	},
	/**
	 * @param {Object} event
	 */
	keydown: function( event ) {
		// Close the modal when escape is pressed.
		if ( 27 === event.which && this.$el.is(':visible') ) {
			this.escape();
			event.stopImmediatePropagation();
		}
	}
});

module.exports = Modal;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/priority-list.js":[function(require,module,exports){
/**
 * wp.media.view.PriorityList
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var PriorityList = wp.media.View.extend({
	tagName:   'div',

	initialize: function() {
		this._views = {};

		this.set( _.extend( {}, this._views, this.options.views ), { silent: true });
		delete this.options.views;

		if ( ! this.options.silent ) {
			this.render();
		}
	},
	/**
	 * @param {string} id
	 * @param {wp.media.View|Object} view
	 * @param {Object} options
	 * @returns {wp.media.view.PriorityList} Returns itself to allow chaining
	 */
	set: function( id, view, options ) {
		var priority, views, index;

		options = options || {};

		// Accept an object with an `id` : `view` mapping.
		if ( _.isObject( id ) ) {
			_.each( id, function( view, id ) {
				this.set( id, view );
			}, this );
			return this;
		}

		if ( ! (view instanceof Backbone.View) ) {
			view = this.toView( view, id, options );
		}
		view.controller = view.controller || this.controller;

		this.unset( id );

		priority = view.options.priority || 10;
		views = this.views.get() || [];

		_.find( views, function( existing, i ) {
			if ( existing.options.priority > priority ) {
				index = i;
				return true;
			}
		});

		this._views[ id ] = view;
		this.views.add( view, {
			at: _.isNumber( index ) ? index : views.length || 0
		});

		return this;
	},
	/**
	 * @param {string} id
	 * @returns {wp.media.View}
	 */
	get: function( id ) {
		return this._views[ id ];
	},
	/**
	 * @param {string} id
	 * @returns {wp.media.view.PriorityList}
	 */
	unset: function( id ) {
		var view = this.get( id );

		if ( view ) {
			view.remove();
		}

		delete this._views[ id ];
		return this;
	},
	/**
	 * @param {Object} options
	 * @returns {wp.media.View}
	 */
	toView: function( options ) {
		return new wp.media.View( options );
	}
});

module.exports = PriorityList;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/router-item.js":[function(require,module,exports){
/**
 * wp.media.view.RouterItem
 *
 * @class
 * @augments wp.media.view.MenuItem
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var RouterItem = wp.media.view.MenuItem.extend({
	/**
	 * On click handler to activate the content region's corresponding mode.
	 */
	click: function() {
		var contentMode = this.options.contentMode;
		if ( contentMode ) {
			this.controller.content.mode( contentMode );
		}
	}
});

module.exports = RouterItem;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/router.js":[function(require,module,exports){
/**
 * wp.media.view.Router
 *
 * @class
 * @augments wp.media.view.Menu
 * @augments wp.media.view.PriorityList
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Menu = wp.media.view.Menu,
	Router;

Router = Menu.extend({
	tagName:   'div',
	className: 'media-router',
	property:  'contentMode',
	ItemView:  wp.media.view.RouterItem,
	region:    'router',

	initialize: function() {
		this.controller.on( 'content:render', this.update, this );
		// Call 'initialize' directly on the parent class.
		Menu.prototype.initialize.apply( this, arguments );
	},

	update: function() {
		var mode = this.controller.content.mode();
		if ( mode ) {
			this.select( mode );
		}
	}
});

module.exports = Router;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/search.js":[function(require,module,exports){
/**
 * wp.media.view.Search
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var l10n = wp.media.view.l10n,
	Search;

Search = wp.media.View.extend({
	tagName:   'input',
	className: 'search',
	id:        'media-search-input',

	attributes: {
		type:        'search',
		placeholder: l10n.search
	},

	events: {
		'input':  'search',
		'keyup':  'search',
		'change': 'search',
		'search': 'search'
	},

	/**
	 * @returns {wp.media.view.Search} Returns itself to allow chaining
	 */
	render: function() {
		this.el.value = this.model.escape('search');
		return this;
	},

	search: function( event ) {
		if ( event.target.value ) {
			this.model.set( 'search', event.target.value );
		} else {
			this.model.unset('search');
		}
	}
});

module.exports = Search;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/selection.js":[function(require,module,exports){
/**
 * wp.media.view.Selection
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var l10n = wp.media.view.l10n,
	Selection;

Selection = wp.media.View.extend({
	tagName:   'div',
	className: 'media-selection',
	template:  wp.template('media-selection'),

	events: {
		'click .edit-selection':  'edit',
		'click .clear-selection': 'clear'
	},

	initialize: function() {
		_.defaults( this.options, {
			editable:  false,
			clearable: true
		});

		/**
		 * @member {wp.media.view.Attachments.Selection}
		 */
		this.attachments = new wp.media.view.Attachments.Selection({
			controller: this.controller,
			collection: this.collection,
			selection:  this.collection,
			model:      new Backbone.Model()
		});

		this.views.set( '.selection-view', this.attachments );
		this.collection.on( 'add remove reset', this.refresh, this );
		this.controller.on( 'content:activate', this.refresh, this );
	},

	ready: function() {
		this.refresh();
	},

	refresh: function() {
		// If the selection hasn't been rendered, bail.
		if ( ! this.$el.children().length ) {
			return;
		}

		var collection = this.collection,
			editing = 'edit-selection' === this.controller.content.mode();

		// If nothing is selected, display nothing.
		this.$el.toggleClass( 'empty', ! collection.length );
		this.$el.toggleClass( 'one', 1 === collection.length );
		this.$el.toggleClass( 'editing', editing );

		this.$('.count').text( l10n.selected.replace('%d', collection.length) );
	},

	edit: function( event ) {
		event.preventDefault();
		if ( this.options.editable ) {
			this.options.editable.call( this, this.collection );
		}
	},

	clear: function( event ) {
		event.preventDefault();
		this.collection.reset();

		// Keep focus inside media modal
		// after clear link is selected
		this.controller.modal.focusManager.focus();
	}
});

module.exports = Selection;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/settings.js":[function(require,module,exports){
/**
 * wp.media.view.Settings
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	$ = Backbone.$,
	Settings;

Settings = View.extend({
	events: {
		'click button':    'updateHandler',
		'change input':    'updateHandler',
		'change select':   'updateHandler',
		'change textarea': 'updateHandler'
	},

	initialize: function() {
		this.model = this.model || new Backbone.Model();
		this.listenTo( this.model, 'change', this.updateChanges );
	},

	prepare: function() {
		return _.defaults({
			model: this.model.toJSON()
		}, this.options );
	},
	/**
	 * @returns {wp.media.view.Settings} Returns itself to allow chaining
	 */
	render: function() {
		View.prototype.render.apply( this, arguments );
		// Select the correct values.
		_( this.model.attributes ).chain().keys().each( this.update, this );
		return this;
	},
	/**
	 * @param {string} key
	 */
	update: function( key ) {
		var value = this.model.get( key ),
			$setting = this.$('[data-setting="' + key + '"]'),
			$buttons, $value;

		// Bail if we didn't find a matching setting.
		if ( ! $setting.length ) {
			return;
		}

		// Attempt to determine how the setting is rendered and update
		// the selected value.

		// Handle dropdowns.
		if ( $setting.is('select') ) {
			$value = $setting.find('[value="' + value + '"]');

			if ( $value.length ) {
				$setting.find('option').prop( 'selected', false );
				$value.prop( 'selected', true );
			} else {
				// If we can't find the desired value, record what *is* selected.
				this.model.set( key, $setting.find(':selected').val() );
			}

		// Handle button groups.
		} else if ( $setting.hasClass('button-group') ) {
			$buttons = $setting.find('button').removeClass('active');
			$buttons.filter( '[value="' + value + '"]' ).addClass('active');

		// Handle text inputs and textareas.
		} else if ( $setting.is('input[type="text"], textarea') ) {
			if ( ! $setting.is(':focus') ) {
				$setting.val( value );
			}
		// Handle checkboxes.
		} else if ( $setting.is('input[type="checkbox"]') ) {
			$setting.prop( 'checked', !! value && 'false' !== value );
		}
	},
	/**
	 * @param {Object} event
	 */
	updateHandler: function( event ) {
		var $setting = $( event.target ).closest('[data-setting]'),
			value = event.target.value,
			userSetting;

		event.preventDefault();

		if ( ! $setting.length ) {
			return;
		}

		// Use the correct value for checkboxes.
		if ( $setting.is('input[type="checkbox"]') ) {
			value = $setting[0].checked;
		}

		// Update the corresponding setting.
		this.model.set( $setting.data('setting'), value );

		// If the setting has a corresponding user setting,
		// update that as well.
		if ( userSetting = $setting.data('userSetting') ) {
			window.setUserSetting( userSetting, value );
		}
	},

	updateChanges: function( model ) {
		if ( model.hasChanged() ) {
			_( model.changed ).chain().keys().each( this.update, this );
		}
	}
});

module.exports = Settings;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/settings/attachment-display.js":[function(require,module,exports){
/**
 * wp.media.view.Settings.AttachmentDisplay
 *
 * @class
 * @augments wp.media.view.Settings
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Settings = wp.media.view.Settings,
	AttachmentDisplay;

AttachmentDisplay = Settings.extend({
	className: 'attachment-display-settings',
	template:  wp.template('attachment-display-settings'),

	initialize: function() {
		var attachment = this.options.attachment;

		_.defaults( this.options, {
			userSettings: false
		});
		// Call 'initialize' directly on the parent class.
		Settings.prototype.initialize.apply( this, arguments );
		this.listenTo( this.model, 'change:link', this.updateLinkTo );

		if ( attachment ) {
			attachment.on( 'change:uploading', this.render, this );
		}
	},

	dispose: function() {
		var attachment = this.options.attachment;
		if ( attachment ) {
			attachment.off( null, null, this );
		}
		/**
		 * call 'dispose' directly on the parent class
		 */
		Settings.prototype.dispose.apply( this, arguments );
	},
	/**
	 * @returns {wp.media.view.AttachmentDisplay} Returns itself to allow chaining
	 */
	render: function() {
		var attachment = this.options.attachment;
		if ( attachment ) {
			_.extend( this.options, {
				sizes: attachment.get('sizes'),
				type:  attachment.get('type')
			});
		}
		/**
		 * call 'render' directly on the parent class
		 */
		Settings.prototype.render.call( this );
		this.updateLinkTo();
		return this;
	},

	updateLinkTo: function() {
		var linkTo = this.model.get('link'),
			$input = this.$('.link-to-custom'),
			attachment = this.options.attachment;

		if ( 'none' === linkTo || 'embed' === linkTo || ( ! attachment && 'custom' !== linkTo ) ) {
			$input.addClass( 'hidden' );
			return;
		}

		if ( attachment ) {
			if ( 'post' === linkTo ) {
				$input.val( attachment.get('link') );
			} else if ( 'file' === linkTo ) {
				$input.val( attachment.get('url') );
			} else if ( ! this.model.get('linkUrl') ) {
				$input.val('http://');
			}

			$input.prop( 'readonly', 'custom' !== linkTo );
		}

		$input.removeClass( 'hidden' );

		// If the input is visible, focus and select its contents.
		if ( ! wp.media.isTouchDevice && $input.is(':visible') ) {
			$input.focus()[0].select();
		}
	}
});

module.exports = AttachmentDisplay;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/settings/gallery.js":[function(require,module,exports){
/**
 * wp.media.view.Settings.Gallery
 *
 * @class
 * @augments wp.media.view.Settings
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Gallery = wp.media.view.Settings.extend({
	className: 'collection-settings gallery-settings',
	template:  wp.template('gallery-settings')
});

module.exports = Gallery;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/settings/playlist.js":[function(require,module,exports){
/**
 * wp.media.view.Settings.Playlist
 *
 * @class
 * @augments wp.media.view.Settings
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Playlist = wp.media.view.Settings.extend({
	className: 'collection-settings playlist-settings',
	template:  wp.template('playlist-settings')
});

module.exports = Playlist;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/sidebar.js":[function(require,module,exports){
/**
 * wp.media.view.Sidebar
 *
 * @class
 * @augments wp.media.view.PriorityList
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Sidebar = wp.media.view.PriorityList.extend({
	className: 'media-sidebar'
});

module.exports = Sidebar;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/site-icon-cropper.js":[function(require,module,exports){
/**
 * wp.media.view.SiteIconCropper
 *
 * Uses the imgAreaSelect plugin to allow a user to crop a Site Icon.
 *
 * Takes imgAreaSelect options from
 * wp.customize.SiteIconControl.calculateImageSelectOptions.
 *
 * @class
 * @augments wp.media.view.Cropper
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.view,
	SiteIconCropper;

SiteIconCropper = View.Cropper.extend({
	className: 'crop-content site-icon',

	ready: function () {
		View.Cropper.prototype.ready.apply( this, arguments );

		this.$( '.crop-image' ).on( 'load', _.bind( this.addSidebar, this ) );
	},

	addSidebar: function() {
		this.sidebar = new wp.media.view.Sidebar({
			controller: this.controller
		});

		this.sidebar.set( 'preview', new wp.media.view.SiteIconPreview({
			controller: this.controller,
			attachment: this.options.attachment
		}) );

		this.controller.cropperView.views.add( this.sidebar );
	}
});

module.exports = SiteIconCropper;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/site-icon-preview.js":[function(require,module,exports){
/**
 * wp.media.view.SiteIconPreview
 *
 * Shows a preview of the Site Icon as a favicon and app icon while cropping.
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	$ = jQuery,
	SiteIconPreview;

SiteIconPreview = View.extend({
	className: 'site-icon-preview',
	template: wp.template( 'site-icon-preview' ),

	ready: function() {
		this.controller.imgSelect.setOptions({
			onInit: this.updatePreview,
			onSelectChange: this.updatePreview
		});
	},

	prepare: function() {
		return {
			url: this.options.attachment.get( 'url' )
		};
	},

	updatePreview: function( img, coords ) {
		var rx = 64 / coords.width,
			ry = 64 / coords.height,
			preview_rx = 16 / coords.width,
			preview_ry = 16 / coords.height;

		$( '#preview-app-icon' ).css({
			width: Math.round(rx * this.imageWidth ) + 'px',
			height: Math.round(ry * this.imageHeight ) + 'px',
			marginLeft: '-' + Math.round(rx * coords.x1) + 'px',
			marginTop: '-' + Math.round(ry * coords.y1) + 'px'
		});

		$( '#preview-favicon' ).css({
			width: Math.round( preview_rx * this.imageWidth ) + 'px',
			height: Math.round( preview_ry * this.imageHeight ) + 'px',
			marginLeft: '-' + Math.round( preview_rx * coords.x1 ) + 'px',
			marginTop: '-' + Math.floor( preview_ry* coords.y1 ) + 'px'
		});
	}
});

module.exports = SiteIconPreview;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/spinner.js":[function(require,module,exports){
/**
 * wp.media.view.Spinner
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Spinner = wp.media.View.extend({
	tagName:   'span',
	className: 'spinner',
	spinnerTimeout: false,
	delay: 400,

	show: function() {
		if ( ! this.spinnerTimeout ) {
			this.spinnerTimeout = _.delay(function( $el ) {
				$el.addClass( 'is-active' );
			}, this.delay, this.$el );
		}

		return this;
	},

	hide: function() {
		this.$el.removeClass( 'is-active' );
		this.spinnerTimeout = clearTimeout( this.spinnerTimeout );

		return this;
	}
});

module.exports = Spinner;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/toolbar.js":[function(require,module,exports){
/**
 * wp.media.view.Toolbar
 *
 * A toolbar which consists of a primary and a secondary section. Each sections
 * can be filled with views.
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	Toolbar;

Toolbar = View.extend({
	tagName:   'div',
	className: 'media-toolbar',

	initialize: function() {
		var state = this.controller.state(),
			selection = this.selection = state.get('selection'),
			library = this.library = state.get('library');

		this._views = {};

		// The toolbar is composed of two `PriorityList` views.
		this.primary   = new wp.media.view.PriorityList();
		this.secondary = new wp.media.view.PriorityList();
		this.primary.$el.addClass('media-toolbar-primary search-form');
		this.secondary.$el.addClass('media-toolbar-secondary');

		this.views.set([ this.secondary, this.primary ]);

		if ( this.options.items ) {
			this.set( this.options.items, { silent: true });
		}

		if ( ! this.options.silent ) {
			this.render();
		}

		if ( selection ) {
			selection.on( 'add remove reset', this.refresh, this );
		}

		if ( library ) {
			library.on( 'add remove reset', this.refresh, this );
		}
	},
	/**
	 * @returns {wp.media.view.Toolbar} Returns itsef to allow chaining
	 */
	dispose: function() {
		if ( this.selection ) {
			this.selection.off( null, null, this );
		}

		if ( this.library ) {
			this.library.off( null, null, this );
		}
		/**
		 * call 'dispose' directly on the parent class
		 */
		return View.prototype.dispose.apply( this, arguments );
	},

	ready: function() {
		this.refresh();
	},

	/**
	 * @param {string} id
	 * @param {Backbone.View|Object} view
	 * @param {Object} [options={}]
	 * @returns {wp.media.view.Toolbar} Returns itself to allow chaining
	 */
	set: function( id, view, options ) {
		var list;
		options = options || {};

		// Accept an object with an `id` : `view` mapping.
		if ( _.isObject( id ) ) {
			_.each( id, function( view, id ) {
				this.set( id, view, { silent: true });
			}, this );

		} else {
			if ( ! ( view instanceof Backbone.View ) ) {
				view.classes = [ 'media-button-' + id ].concat( view.classes || [] );
				view = new wp.media.view.Button( view ).render();
			}

			view.controller = view.controller || this.controller;

			this._views[ id ] = view;

			list = view.options.priority < 0 ? 'secondary' : 'primary';
			this[ list ].set( id, view, options );
		}

		if ( ! options.silent ) {
			this.refresh();
		}

		return this;
	},
	/**
	 * @param {string} id
	 * @returns {wp.media.view.Button}
	 */
	get: function( id ) {
		return this._views[ id ];
	},
	/**
	 * @param {string} id
	 * @param {Object} options
	 * @returns {wp.media.view.Toolbar} Returns itself to allow chaining
	 */
	unset: function( id, options ) {
		delete this._views[ id ];
		this.primary.unset( id, options );
		this.secondary.unset( id, options );

		if ( ! options || ! options.silent ) {
			this.refresh();
		}
		return this;
	},

	refresh: function() {
		var state = this.controller.state(),
			library = state.get('library'),
			selection = state.get('selection');

		_.each( this._views, function( button ) {
			if ( ! button.model || ! button.options || ! button.options.requires ) {
				return;
			}

			var requires = button.options.requires,
				disabled = false;

			// Prevent insertion of attachments if any of them are still uploading
			disabled = _.some( selection.models, function( attachment ) {
				return attachment.get('uploading') === true;
			});

			if ( requires.selection && selection && ! selection.length ) {
				disabled = true;
			} else if ( requires.library && library && ! library.length ) {
				disabled = true;
			}
			button.model.set( 'disabled', disabled );
		});
	}
});

module.exports = Toolbar;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/toolbar/embed.js":[function(require,module,exports){
/**
 * wp.media.view.Toolbar.Embed
 *
 * @class
 * @augments wp.media.view.Toolbar.Select
 * @augments wp.media.view.Toolbar
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Select = wp.media.view.Toolbar.Select,
	l10n = wp.media.view.l10n,
	Embed;

Embed = Select.extend({
	initialize: function() {
		_.defaults( this.options, {
			text: l10n.insertIntoPost,
			requires: false
		});
		// Call 'initialize' directly on the parent class.
		Select.prototype.initialize.apply( this, arguments );
	},

	refresh: function() {
		var url = this.controller.state().props.get('url');
		this.get('select').model.set( 'disabled', ! url || url === 'http://' );
		/**
		 * call 'refresh' directly on the parent class
		 */
		Select.prototype.refresh.apply( this, arguments );
	}
});

module.exports = Embed;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/toolbar/select.js":[function(require,module,exports){
/**
 * wp.media.view.Toolbar.Select
 *
 * @class
 * @augments wp.media.view.Toolbar
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var Toolbar = wp.media.view.Toolbar,
	l10n = wp.media.view.l10n,
	Select;

Select = Toolbar.extend({
	initialize: function() {
		var options = this.options;

		_.bindAll( this, 'clickSelect' );

		_.defaults( options, {
			event: 'select',
			state: false,
			reset: true,
			close: true,
			text:  l10n.select,

			// Does the button rely on the selection?
			requires: {
				selection: true
			}
		});

		options.items = _.defaults( options.items || {}, {
			select: {
				style:    'primary',
				text:     options.text,
				priority: 80,
				click:    this.clickSelect,
				requires: options.requires
			}
		});
		// Call 'initialize' directly on the parent class.
		Toolbar.prototype.initialize.apply( this, arguments );
	},

	clickSelect: function() {
		var options = this.options,
			controller = this.controller;

		if ( options.close ) {
			controller.close();
		}

		if ( options.event ) {
			controller.state().trigger( options.event );
		}

		if ( options.state ) {
			controller.setState( options.state );
		}

		if ( options.reset ) {
			controller.reset();
		}
	}
});

module.exports = Select;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/uploader/editor.js":[function(require,module,exports){
/**
 * Creates a dropzone on WP editor instances (elements with .wp-editor-wrap)
 * and relays drag'n'dropped files to a media workflow.
 *
 * wp.media.view.EditorUploader
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	l10n = wp.media.view.l10n,
	$ = jQuery,
	EditorUploader;

EditorUploader = View.extend({
	tagName:   'div',
	className: 'uploader-editor',
	template:  wp.template( 'uploader-editor' ),

	localDrag: false,
	overContainer: false,
	overDropzone: false,
	draggingFile: null,

	/**
	 * Bind drag'n'drop events to callbacks.
	 */
	initialize: function() {
		this.initialized = false;

		// Bail if not enabled or UA does not support drag'n'drop or File API.
		if ( ! window.tinyMCEPreInit || ! window.tinyMCEPreInit.dragDropUpload || ! this.browserSupport() ) {
			return this;
		}

		this.$document = $(document);
		this.dropzones = [];
		this.files = [];

		this.$document.on( 'drop', '.uploader-editor', _.bind( this.drop, this ) );
		this.$document.on( 'dragover', '.uploader-editor', _.bind( this.dropzoneDragover, this ) );
		this.$document.on( 'dragleave', '.uploader-editor', _.bind( this.dropzoneDragleave, this ) );
		this.$document.on( 'click', '.uploader-editor', _.bind( this.click, this ) );

		this.$document.on( 'dragover', _.bind( this.containerDragover, this ) );
		this.$document.on( 'dragleave', _.bind( this.containerDragleave, this ) );

		this.$document.on( 'dragstart dragend drop', _.bind( function( event ) {
			this.localDrag = event.type === 'dragstart';
		}, this ) );

		this.initialized = true;
		return this;
	},

	/**
	 * Check browser support for drag'n'drop.
	 *
	 * @return Boolean
	 */
	browserSupport: function() {
		var supports = false, div = document.createElement('div');

		supports = ( 'draggable' in div ) || ( 'ondragstart' in div && 'ondrop' in div );
		supports = supports && !! ( window.File && window.FileList && window.FileReader );
		return supports;
	},

	isDraggingFile: function( event ) {
		if ( this.draggingFile !== null ) {
			return this.draggingFile;
		}

		if ( _.isUndefined( event.originalEvent ) || _.isUndefined( event.originalEvent.dataTransfer ) ) {
			return false;
		}

		this.draggingFile = _.indexOf( event.originalEvent.dataTransfer.types, 'Files' ) > -1 &&
			_.indexOf( event.originalEvent.dataTransfer.types, 'text/plain' ) === -1;

		return this.draggingFile;
	},

	refresh: function( e ) {
		var dropzone_id;
		for ( dropzone_id in this.dropzones ) {
			// Hide the dropzones only if dragging has left the screen.
			this.dropzones[ dropzone_id ].toggle( this.overContainer || this.overDropzone );
		}

		if ( ! _.isUndefined( e ) ) {
			$( e.target ).closest( '.uploader-editor' ).toggleClass( 'droppable', this.overDropzone );
		}

		if ( ! this.overContainer && ! this.overDropzone ) {
			this.draggingFile = null;
		}

		return this;
	},

	render: function() {
		if ( ! this.initialized ) {
			return this;
		}

		View.prototype.render.apply( this, arguments );
		$( '.wp-editor-wrap' ).each( _.bind( this.attach, this ) );
		return this;
	},

	attach: function( index, editor ) {
		// Attach a dropzone to an editor.
		var dropzone = this.$el.clone();
		this.dropzones.push( dropzone );
		$( editor ).append( dropzone );
		return this;
	},

	/**
	 * When a file is dropped on the editor uploader, open up an editor media workflow
	 * and upload the file immediately.
	 *
	 * @param  {jQuery.Event} event The 'drop' event.
	 */
	drop: function( event ) {
		var $wrap, uploadView;

		this.containerDragleave( event );
		this.dropzoneDragleave( event );

		this.files = event.originalEvent.dataTransfer.files;
		if ( this.files.length < 1 ) {
			return;
		}

		// Set the active editor to the drop target.
		$wrap = $( event.target ).parents( '.wp-editor-wrap' );
		if ( $wrap.length > 0 && $wrap[0].id ) {
			window.wpActiveEditor = $wrap[0].id.slice( 3, -5 );
		}

		if ( ! this.workflow ) {
			this.workflow = wp.media.editor.open( window.wpActiveEditor, {
				frame:    'post',
				state:    'insert',
				title:    l10n.addMedia,
				multiple: true
			});

			uploadView = this.workflow.uploader;

			if ( uploadView.uploader && uploadView.uploader.ready ) {
				this.addFiles.apply( this );
			} else {
				this.workflow.on( 'uploader:ready', this.addFiles, this );
			}
		} else {
			this.workflow.state().reset();
			this.addFiles.apply( this );
			this.workflow.open();
		}

		return false;
	},

	/**
	 * Add the files to the uploader.
	 */
	addFiles: function() {
		if ( this.files.length ) {
			this.workflow.uploader.uploader.uploader.addFile( _.toArray( this.files ) );
			this.files = [];
		}
		return this;
	},

	containerDragover: function( event ) {
		if ( this.localDrag || ! this.isDraggingFile( event ) ) {
			return;
		}

		this.overContainer = true;
		this.refresh();
	},

	containerDragleave: function() {
		this.overContainer = false;

		// Throttle dragleave because it's called when bouncing from some elements to others.
		_.delay( _.bind( this.refresh, this ), 50 );
	},

	dropzoneDragover: function( event ) {
		if ( this.localDrag || ! this.isDraggingFile( event ) ) {
			return;
		}

		this.overDropzone = true;
		this.refresh( event );
		return false;
	},

	dropzoneDragleave: function( e ) {
		this.overDropzone = false;
		_.delay( _.bind( this.refresh, this, e ), 50 );
	},

	click: function( e ) {
		// In the rare case where the dropzone gets stuck, hide it on click.
		this.containerDragleave( e );
		this.dropzoneDragleave( e );
		this.localDrag = false;
	}
});

module.exports = EditorUploader;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/uploader/inline.js":[function(require,module,exports){
/**
 * wp.media.view.UploaderInline
 *
 * The inline uploader that shows up in the 'Upload Files' tab.
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	UploaderInline;

UploaderInline = View.extend({
	tagName:   'div',
	className: 'uploader-inline',
	template:  wp.template('uploader-inline'),

	events: {
		'click .close': 'hide'
	},

	initialize: function() {
		_.defaults( this.options, {
			message: '',
			status:  true,
			canClose: false
		});

		if ( ! this.options.$browser && this.controller.uploader ) {
			this.options.$browser = this.controller.uploader.$browser;
		}

		if ( _.isUndefined( this.options.postId ) ) {
			this.options.postId = wp.media.view.settings.post.id;
		}

		if ( this.options.status ) {
			this.views.set( '.upload-inline-status', new wp.media.view.UploaderStatus({
				controller: this.controller
			}) );
		}
	},

	prepare: function() {
		var suggestedWidth = this.controller.state().get('suggestedWidth'),
			suggestedHeight = this.controller.state().get('suggestedHeight'),
			data = {};

		data.message = this.options.message;
		data.canClose = this.options.canClose;

		if ( suggestedWidth && suggestedHeight ) {
			data.suggestedWidth = suggestedWidth;
			data.suggestedHeight = suggestedHeight;
		}

		return data;
	},
	/**
	 * @returns {wp.media.view.UploaderInline} Returns itself to allow chaining
	 */
	dispose: function() {
		if ( this.disposing ) {
			/**
			 * call 'dispose' directly on the parent class
			 */
			return View.prototype.dispose.apply( this, arguments );
		}

		// Run remove on `dispose`, so we can be sure to refresh the
		// uploader with a view-less DOM. Track whether we're disposing
		// so we don't trigger an infinite loop.
		this.disposing = true;
		return this.remove();
	},
	/**
	 * @returns {wp.media.view.UploaderInline} Returns itself to allow chaining
	 */
	remove: function() {
		/**
		 * call 'remove' directly on the parent class
		 */
		var result = View.prototype.remove.apply( this, arguments );

		_.defer( _.bind( this.refresh, this ) );
		return result;
	},

	refresh: function() {
		var uploader = this.controller.uploader;

		if ( uploader ) {
			uploader.refresh();
		}
	},
	/**
	 * @returns {wp.media.view.UploaderInline}
	 */
	ready: function() {
		var $browser = this.options.$browser,
			$placeholder;

		if ( this.controller.uploader ) {
			$placeholder = this.$('.browser');

			// Check if we've already replaced the placeholder.
			if ( $placeholder[0] === $browser[0] ) {
				return;
			}

			$browser.detach().text( $placeholder.text() );
			$browser[0].className = $placeholder[0].className;
			$placeholder.replaceWith( $browser.show() );
		}

		this.refresh();
		return this;
	},
	show: function() {
		this.$el.removeClass( 'hidden' );
	},
	hide: function() {
		this.$el.addClass( 'hidden' );
	}

});

module.exports = UploaderInline;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/uploader/status-error.js":[function(require,module,exports){
/**
 * wp.media.view.UploaderStatusError
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var UploaderStatusError = wp.media.View.extend({
	className: 'upload-error',
	template:  wp.template('uploader-status-error')
});

module.exports = UploaderStatusError;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/uploader/status.js":[function(require,module,exports){
/**
 * wp.media.view.UploaderStatus
 *
 * An uploader status for on-going uploads.
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.media.View,
	UploaderStatus;

UploaderStatus = View.extend({
	className: 'media-uploader-status',
	template:  wp.template('uploader-status'),

	events: {
		'click .upload-dismiss-errors': 'dismiss'
	},

	initialize: function() {
		this.queue = wp.Uploader.queue;
		this.queue.on( 'add remove reset', this.visibility, this );
		this.queue.on( 'add remove reset change:percent', this.progress, this );
		this.queue.on( 'add remove reset change:uploading', this.info, this );

		this.errors = wp.Uploader.errors;
		this.errors.reset();
		this.errors.on( 'add remove reset', this.visibility, this );
		this.errors.on( 'add', this.error, this );
	},
	/**
	 * @global wp.Uploader
	 * @returns {wp.media.view.UploaderStatus}
	 */
	dispose: function() {
		wp.Uploader.queue.off( null, null, this );
		/**
		 * call 'dispose' directly on the parent class
		 */
		View.prototype.dispose.apply( this, arguments );
		return this;
	},

	visibility: function() {
		this.$el.toggleClass( 'uploading', !! this.queue.length );
		this.$el.toggleClass( 'errors', !! this.errors.length );
		this.$el.toggle( !! this.queue.length || !! this.errors.length );
	},

	ready: function() {
		_.each({
			'$bar':      '.media-progress-bar div',
			'$index':    '.upload-index',
			'$total':    '.upload-total',
			'$filename': '.upload-filename'
		}, function( selector, key ) {
			this[ key ] = this.$( selector );
		}, this );

		this.visibility();
		this.progress();
		this.info();
	},

	progress: function() {
		var queue = this.queue,
			$bar = this.$bar;

		if ( ! $bar || ! queue.length ) {
			return;
		}

		$bar.width( ( queue.reduce( function( memo, attachment ) {
			if ( ! attachment.get('uploading') ) {
				return memo + 100;
			}

			var percent = attachment.get('percent');
			return memo + ( _.isNumber( percent ) ? percent : 100 );
		}, 0 ) / queue.length ) + '%' );
	},

	info: function() {
		var queue = this.queue,
			index = 0, active;

		if ( ! queue.length ) {
			return;
		}

		active = this.queue.find( function( attachment, i ) {
			index = i;
			return attachment.get('uploading');
		});

		this.$index.text( index + 1 );
		this.$total.text( queue.length );
		this.$filename.html( active ? this.filename( active.get('filename') ) : '' );
	},
	/**
	 * @param {string} filename
	 * @returns {string}
	 */
	filename: function( filename ) {
		return _.escape( filename );
	},
	/**
	 * @param {Backbone.Model} error
	 */
	error: function( error ) {
		this.views.add( '.upload-errors', new wp.media.view.UploaderStatusError({
			filename: this.filename( error.get('file').name ),
			message:  error.get('message')
		}), { at: 0 });
	},

	/**
	 * @global wp.Uploader
	 *
	 * @param {Object} event
	 */
	dismiss: function( event ) {
		var errors = this.views.get('.upload-errors');

		event.preventDefault();

		if ( errors ) {
			_.invoke( errors, 'remove' );
		}
		wp.Uploader.errors.reset();
	}
});

module.exports = UploaderStatus;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/uploader/window.js":[function(require,module,exports){
/**
 * wp.media.view.UploaderWindow
 *
 * An uploader window that allows for dragging and dropping media.
 *
 * @class
 * @augments wp.media.View
 * @augments wp.Backbone.View
 * @augments Backbone.View
 *
 * @param {object} [options]                   Options hash passed to the view.
 * @param {object} [options.uploader]          Uploader properties.
 * @param {jQuery} [options.uploader.browser]
 * @param {jQuery} [options.uploader.dropzone] jQuery collection of the dropzone.
 * @param {object} [options.uploader.params]
 */
var $ = jQuery,
	UploaderWindow;

UploaderWindow = wp.media.View.extend({
	tagName:   'div',
	className: 'uploader-window',
	template:  wp.template('uploader-window'),

	initialize: function() {
		var uploader;

		this.$browser = $('<a href="#" class="browser" />').hide().appendTo('body');

		uploader = this.options.uploader = _.defaults( this.options.uploader || {}, {
			dropzone:  this.$el,
			browser:   this.$browser,
			params:    {}
		});

		// Ensure the dropzone is a jQuery collection.
		if ( uploader.dropzone && ! (uploader.dropzone instanceof $) ) {
			uploader.dropzone = $( uploader.dropzone );
		}

		this.controller.on( 'activate', this.refresh, this );

		this.controller.on( 'detach', function() {
			this.$browser.remove();
		}, this );
	},

	refresh: function() {
		if ( this.uploader ) {
			this.uploader.refresh();
		}
	},

	ready: function() {
		var postId = wp.media.view.settings.post.id,
			dropzone;

		// If the uploader already exists, bail.
		if ( this.uploader ) {
			return;
		}

		if ( postId ) {
			this.options.uploader.params.post_id = postId;
		}
		this.uploader = new wp.Uploader( this.options.uploader );

		dropzone = this.uploader.dropzone;
		dropzone.on( 'dropzone:enter', _.bind( this.show, this ) );
		dropzone.on( 'dropzone:leave', _.bind( this.hide, this ) );

		$( this.uploader ).on( 'uploader:ready', _.bind( this._ready, this ) );
	},

	_ready: function() {
		this.controller.trigger( 'uploader:ready' );
	},

	show: function() {
		var $el = this.$el.show();

		// Ensure that the animation is triggered by waiting until
		// the transparent element is painted into the DOM.
		_.defer( function() {
			$el.css({ opacity: 1 });
		});
	},

	hide: function() {
		var $el = this.$el.css({ opacity: 0 });

		wp.media.transition( $el ).done( function() {
			// Transition end events are subject to race conditions.
			// Make sure that the value is set as intended.
			if ( '0' === $el.css('opacity') ) {
				$el.hide();
			}
		});

		// https://core.trac.wordpress.org/ticket/27341
		_.delay( function() {
			if ( '0' === $el.css('opacity') && $el.is(':visible') ) {
				$el.hide();
			}
		}, 500 );
	}
});

module.exports = UploaderWindow;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views/view.js":[function(require,module,exports){
/**
 * wp.media.View
 *
 * The base view class for media.
 *
 * Undelegating events, removing events from the model, and
 * removing events from the controller mirror the code for
 * `Backbone.View.dispose` in Backbone 0.9.8 development.
 *
 * This behavior has since been removed, and should not be used
 * outside of the media manager.
 *
 * @class
 * @augments wp.Backbone.View
 * @augments Backbone.View
 */
var View = wp.Backbone.View.extend({
	constructor: function( options ) {
		if ( options && options.controller ) {
			this.controller = options.controller;
		}
		wp.Backbone.View.apply( this, arguments );
	},
	/**
	 * @todo The internal comment mentions this might have been a stop-gap
	 *       before Backbone 0.9.8 came out. Figure out if Backbone core takes
	 *       care of this in Backbone.View now.
	 *
	 * @returns {wp.media.View} Returns itself to allow chaining
	 */
	dispose: function() {
		// Undelegating events, removing events from the model, and
		// removing events from the controller mirror the code for
		// `Backbone.View.dispose` in Backbone 0.9.8 development.
		this.undelegateEvents();

		if ( this.model && this.model.off ) {
			this.model.off( null, null, this );
		}

		if ( this.collection && this.collection.off ) {
			this.collection.off( null, null, this );
		}

		// Unbind controller events.
		if ( this.controller && this.controller.off ) {
			this.controller.off( null, null, this );
		}

		return this;
	},
	/**
	 * @returns {wp.media.View} Returns itself to allow chaining
	 */
	remove: function() {
		this.dispose();
		/**
		 * call 'remove' directly on the parent class
		 */
		return wp.Backbone.View.prototype.remove.apply( this, arguments );
	}
});

module.exports = View;

},{}]},{},["/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/views.manifest.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvY29sbGVjdGlvbi1hZGQuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvY29sbGVjdGlvbi1lZGl0LmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL2NvbnRyb2xsZXJzL2Nyb3BwZXIuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvY3VzdG9taXplLWltYWdlLWNyb3BwZXIuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvZWRpdC1pbWFnZS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS9jb250cm9sbGVycy9lbWJlZC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS9jb250cm9sbGVycy9mZWF0dXJlZC1pbWFnZS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS9jb250cm9sbGVycy9nYWxsZXJ5LWFkZC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS9jb250cm9sbGVycy9nYWxsZXJ5LWVkaXQuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvaW1hZ2UtZGV0YWlscy5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS9jb250cm9sbGVycy9saWJyYXJ5LmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL2NvbnRyb2xsZXJzL21lZGlhLWxpYnJhcnkuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvcmVnaW9uLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL2NvbnRyb2xsZXJzL3JlcGxhY2UtaW1hZ2UuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvc2l0ZS1pY29uLWNyb3BwZXIuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvY29udHJvbGxlcnMvc3RhdGUtbWFjaGluZS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS9jb250cm9sbGVycy9zdGF0ZS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS91dGlscy9zZWxlY3Rpb24tc3luYy5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy5tYW5pZmVzdC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9hdHRhY2htZW50LWNvbXBhdC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9hdHRhY2htZW50LWZpbHRlcnMuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudC1maWx0ZXJzL2FsbC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9hdHRhY2htZW50LWZpbHRlcnMvZGF0ZS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9hdHRhY2htZW50LWZpbHRlcnMvdXBsb2FkZWQuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9hdHRhY2htZW50L2RldGFpbHMuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudC9lZGl0LWxpYnJhcnkuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudC9lZGl0LXNlbGVjdGlvbi5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9hdHRhY2htZW50L2xpYnJhcnkuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudC9zZWxlY3Rpb24uanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudHMuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYXR0YWNobWVudHMvYnJvd3Nlci5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9hdHRhY2htZW50cy9zZWxlY3Rpb24uanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvYnV0dG9uLWdyb3VwLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL2J1dHRvbi5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9jcm9wcGVyLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL2VkaXQtaW1hZ2UuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvZW1iZWQuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvZW1iZWQvaW1hZ2UuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvZW1iZWQvbGluay5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9lbWJlZC91cmwuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvZm9jdXMtbWFuYWdlci5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9mcmFtZS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9mcmFtZS9pbWFnZS1kZXRhaWxzLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL2ZyYW1lL3Bvc3QuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvZnJhbWUvc2VsZWN0LmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL2lmcmFtZS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9pbWFnZS1kZXRhaWxzLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL2xhYmVsLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL21lZGlhLWZyYW1lLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL21lbnUtaXRlbS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9tZW51LmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL21vZGFsLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL3ByaW9yaXR5LWxpc3QuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3Mvcm91dGVyLWl0ZW0uanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3Mvcm91dGVyLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL3NlYXJjaC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9zZWxlY3Rpb24uanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3Mvc2V0dGluZ3MuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3Mvc2V0dGluZ3MvYXR0YWNobWVudC1kaXNwbGF5LmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL3NldHRpbmdzL2dhbGxlcnkuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3Mvc2V0dGluZ3MvcGxheWxpc3QuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3Mvc2lkZWJhci5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9zaXRlLWljb24tY3JvcHBlci5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9zaXRlLWljb24tcHJldmlldy5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy9zcGlubmVyLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL3Rvb2xiYXIuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvdG9vbGJhci9lbWJlZC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy90b29sYmFyL3NlbGVjdC5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy91cGxvYWRlci9lZGl0b3IuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvdXBsb2FkZXIvaW5saW5lLmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL3VwbG9hZGVyL3N0YXR1cy1lcnJvci5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS92aWV3cy91cGxvYWRlci9zdGF0dXMuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvdmlld3MvdXBsb2FkZXIvd2luZG93LmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL3ZpZXdzL3ZpZXcuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25MQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzU0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25IQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEuY29udHJvbGxlci5Db2xsZWN0aW9uQWRkXG4gKlxuICogQSBzdGF0ZSBmb3IgYWRkaW5nIGF0dGFjaG1lbnRzIHRvIGEgY29sbGVjdGlvbiAoZS5nLiB2aWRlbyBwbGF5bGlzdCkuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5XG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZVxuICogQGF1Z21lbnRzIEJhY2tib25lLk1vZGVsXG4gKlxuICogQHBhcmFtIHtvYmplY3R9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXNdICAgICAgICAgICAgICAgICAgICAgICAgIFRoZSBhdHRyaWJ1dGVzIGhhc2ggcGFzc2VkIHRvIHRoZSBzdGF0ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmlkPWxpYnJhcnldICAgICAgVW5pcXVlIGlkZW50aWZpZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnRpdGxlICAgICAgICAgICAgICAgICAgICBUaXRsZSBmb3IgdGhlIHN0YXRlLiBEaXNwbGF5cyBpbiB0aGUgZnJhbWUncyB0aXRsZSByZWdpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5tdWx0aXBsZT1hZGRdICAgICAgICAgICAgV2hldGhlciBtdWx0aS1zZWxlY3QgaXMgZW5hYmxlZC4gQHRvZG8gJ2FkZCcgZG9lc24ndCBzZWVtIGRvIGFueXRoaW5nIHNwZWNpYWwsIGFuZCBnZXRzIHVzZWQgYXMgYSBib29sZWFuLlxuICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c30gW2F0dHJpYnV0ZXMubGlicmFyeV0gICAgICAgICAgICAgICAgIFRoZSBhdHRhY2htZW50cyBjb2xsZWN0aW9uIHRvIGJyb3dzZS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJZiBvbmUgaXMgbm90IHN1cHBsaWVkLCBhIGNvbGxlY3Rpb24gb2YgYXR0YWNobWVudHMgb2YgdGhlIHNwZWNpZmllZCB0eXBlIHdpbGwgYmUgY3JlYXRlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9ICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmZpbHRlcmFibGU9dXBsb2FkZWRdICAgICBXaGV0aGVyIHRoZSBsaWJyYXJ5IGlzIGZpbHRlcmFibGUsIGFuZCBpZiBzbyB3aGF0IGZpbHRlcnMgc2hvdWxkIGJlIHNob3duLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjY2VwdHMgJ2FsbCcsICd1cGxvYWRlZCcsIG9yICd1bmF0dGFjaGVkJy5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLm1lbnU9Z2FsbGVyeV0gICAgICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSBtZW51IHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmNvbnRlbnQ9dXBsb2FkXSAgICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSBjb250ZW50IHJlZ2lvbi5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPdmVycmlkZGVuIGJ5IHBlcnNpc3RlbnQgdXNlciBzZXR0aW5nIGlmICdjb250ZW50VXNlclNldHRpbmcnIGlzIHRydWUuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5yb3V0ZXI9YnJvd3NlXSAgICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgcm91dGVyIHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnRvb2xiYXI9Z2FsbGVyeS1hZGRdICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSB0b29sYmFyIHJlZ2lvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnNlYXJjaGFibGU9dHJ1ZV0gICAgICAgICBXaGV0aGVyIHRoZSBsaWJyYXJ5IGlzIHNlYXJjaGFibGUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5zb3J0YWJsZT10cnVlXSAgICAgICAgICAgV2hldGhlciB0aGUgQXR0YWNobWVudHMgc2hvdWxkIGJlIHNvcnRhYmxlLiBEZXBlbmRzIG9uIHRoZSBvcmRlcmJ5IHByb3BlcnR5IGJlaW5nIHNldCB0byBtZW51T3JkZXIgb24gdGhlIGF0dGFjaG1lbnRzIGNvbGxlY3Rpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5hdXRvU2VsZWN0PXRydWVdICAgICAgICAgV2hldGhlciBhbiB1cGxvYWRlZCBhdHRhY2htZW50IHNob3VsZCBiZSBhdXRvbWF0aWNhbGx5IGFkZGVkIHRvIHRoZSBzZWxlY3Rpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5jb250ZW50VXNlclNldHRpbmc9dHJ1ZV0gV2hldGhlciB0aGUgY29udGVudCByZWdpb24ncyBtb2RlIHNob3VsZCBiZSBzZXQgYW5kIHBlcnNpc3RlZCBwZXIgdXNlci5cbiAqIEBwYXJhbSB7aW50fSAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnByaW9yaXR5PTEwMF0gICAgICAgICAgICBUaGUgcHJpb3JpdHkgZm9yIHRoZSBzdGF0ZSBsaW5rIGluIHRoZSBtZWRpYSBtZW51LlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc3luY1NlbGVjdGlvbj1mYWxzZV0gICAgIFdoZXRoZXIgdGhlIEF0dGFjaG1lbnRzIHNlbGVjdGlvbiBzaG91bGQgYmUgcGVyc2lzdGVkIGZyb20gdGhlIGxhc3Qgc3RhdGUuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRGVmYXVsdHMgdG8gZmFsc2UgYmVjYXVzZSBmb3IgdGhpcyBzdGF0ZSwgYmVjYXVzZSB0aGUgbGlicmFyeSBvZiB0aGUgRWRpdCBHYWxsZXJ5IHN0YXRlIGlzIHRoZSBzZWxlY3Rpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBhdHRyaWJ1dGVzLnR5cGUgICAgICAgICAgICAgICAgICAgVGhlIGNvbGxlY3Rpb24ncyBtZWRpYSB0eXBlLiAoZS5nLiAndmlkZW8nKS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMuY29sbGVjdGlvblR5cGUgICAgICAgICBUaGUgY29sbGVjdGlvbiB0eXBlLiAoZS5nLiAncGxheWxpc3QnKS5cbiAqL1xudmFyIFNlbGVjdGlvbiA9IHdwLm1lZGlhLm1vZGVsLlNlbGVjdGlvbixcblx0TGlicmFyeSA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuTGlicmFyeSxcblx0Q29sbGVjdGlvbkFkZDtcblxuQ29sbGVjdGlvbkFkZCA9IExpYnJhcnkuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6IF8uZGVmYXVsdHMoIHtcblx0XHQvLyBTZWxlY3Rpb24gZGVmYXVsdHMuIEBzZWUgbWVkaWEubW9kZWwuU2VsZWN0aW9uXG5cdFx0bXVsdGlwbGU6ICAgICAgJ2FkZCcsXG5cdFx0Ly8gQXR0YWNobWVudHMgYnJvd3NlciBkZWZhdWx0cy4gQHNlZSBtZWRpYS52aWV3LkF0dGFjaG1lbnRzQnJvd3NlclxuXHRcdGZpbHRlcmFibGU6ICAgICd1cGxvYWRlZCcsXG5cblx0XHRwcmlvcml0eTogICAgICAxMDAsXG5cdFx0c3luY1NlbGVjdGlvbjogZmFsc2Vcblx0fSwgTGlicmFyeS5wcm90b3R5cGUuZGVmYXVsdHMgKSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuOS4wXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgY29sbGVjdGlvblR5cGUgPSB0aGlzLmdldCgnY29sbGVjdGlvblR5cGUnKTtcblxuXHRcdGlmICggJ3ZpZGVvJyA9PT0gdGhpcy5nZXQoICd0eXBlJyApICkge1xuXHRcdFx0Y29sbGVjdGlvblR5cGUgPSAndmlkZW8tJyArIGNvbGxlY3Rpb25UeXBlO1xuXHRcdH1cblxuXHRcdHRoaXMuc2V0KCAnaWQnLCBjb2xsZWN0aW9uVHlwZSArICctbGlicmFyeScgKTtcblx0XHR0aGlzLnNldCggJ3Rvb2xiYXInLCBjb2xsZWN0aW9uVHlwZSArICctYWRkJyApO1xuXHRcdHRoaXMuc2V0KCAnbWVudScsIGNvbGxlY3Rpb25UeXBlICk7XG5cblx0XHQvLyBJZiB3ZSBoYXZlbid0IGJlZW4gcHJvdmlkZWQgYSBgbGlicmFyeWAsIGNyZWF0ZSBhIGBTZWxlY3Rpb25gLlxuXHRcdGlmICggISB0aGlzLmdldCgnbGlicmFyeScpICkge1xuXHRcdFx0dGhpcy5zZXQoICdsaWJyYXJ5Jywgd3AubWVkaWEucXVlcnkoeyB0eXBlOiB0aGlzLmdldCgndHlwZScpIH0pICk7XG5cdFx0fVxuXHRcdExpYnJhcnkucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy45LjBcblx0ICovXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbGlicmFyeSA9IHRoaXMuZ2V0KCdsaWJyYXJ5JyksXG5cdFx0XHRlZGl0TGlicmFyeSA9IHRoaXMuZ2V0KCdlZGl0TGlicmFyeScpLFxuXHRcdFx0ZWRpdCA9IHRoaXMuZnJhbWUuc3RhdGUoIHRoaXMuZ2V0KCdjb2xsZWN0aW9uVHlwZScpICsgJy1lZGl0JyApLmdldCgnbGlicmFyeScpO1xuXG5cdFx0aWYgKCBlZGl0TGlicmFyeSAmJiBlZGl0TGlicmFyeSAhPT0gZWRpdCApIHtcblx0XHRcdGxpYnJhcnkudW5vYnNlcnZlKCBlZGl0TGlicmFyeSApO1xuXHRcdH1cblxuXHRcdC8vIEFjY2VwdHMgYXR0YWNobWVudHMgdGhhdCBleGlzdCBpbiB0aGUgb3JpZ2luYWwgbGlicmFyeSBhbmRcblx0XHQvLyB0aGF0IGRvIG5vdCBleGlzdCBpbiBnYWxsZXJ5J3MgbGlicmFyeS5cblx0XHRsaWJyYXJ5LnZhbGlkYXRvciA9IGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXHRcdFx0cmV0dXJuICEhIHRoaXMubWlycm9yaW5nLmdldCggYXR0YWNobWVudC5jaWQgKSAmJiAhIGVkaXQuZ2V0KCBhdHRhY2htZW50LmNpZCApICYmIFNlbGVjdGlvbi5wcm90b3R5cGUudmFsaWRhdG9yLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHR9O1xuXG5cdFx0Ly8gUmVzZXQgdGhlIGxpYnJhcnkgdG8gZW5zdXJlIHRoYXQgYWxsIGF0dGFjaG1lbnRzIGFyZSByZS1hZGRlZFxuXHRcdC8vIHRvIHRoZSBjb2xsZWN0aW9uLiBEbyBzbyBzaWxlbnRseSwgYXMgY2FsbGluZyBgb2JzZXJ2ZWAgd2lsbFxuXHRcdC8vIHRyaWdnZXIgdGhlIGByZXNldGAgZXZlbnQuXG5cdFx0bGlicmFyeS5yZXNldCggbGlicmFyeS5taXJyb3JpbmcubW9kZWxzLCB7IHNpbGVudDogdHJ1ZSB9KTtcblx0XHRsaWJyYXJ5Lm9ic2VydmUoIGVkaXQgKTtcblx0XHR0aGlzLnNldCgnZWRpdExpYnJhcnknLCBlZGl0KTtcblxuXHRcdExpYnJhcnkucHJvdG90eXBlLmFjdGl2YXRlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ29sbGVjdGlvbkFkZDtcbiIsIi8qZ2xvYmFscyB3cCwgQmFja2JvbmUgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5jb250cm9sbGVyLkNvbGxlY3Rpb25FZGl0XG4gKlxuICogQSBzdGF0ZSBmb3IgZWRpdGluZyBhIGNvbGxlY3Rpb24sIHdoaWNoIGlzIHVzZWQgYnkgYXVkaW8gYW5kIHZpZGVvIHBsYXlsaXN0cyxcbiAqIGFuZCBjYW4gYmUgdXNlZCBmb3Igb3RoZXIgY29sbGVjdGlvbnMuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5XG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZVxuICogQGF1Z21lbnRzIEJhY2tib25lLk1vZGVsXG4gKlxuICogQHBhcmFtIHtvYmplY3R9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXNdICAgICAgICAgICAgICAgICAgICAgIFRoZSBhdHRyaWJ1dGVzIGhhc2ggcGFzc2VkIHRvIHRoZSBzdGF0ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMudGl0bGUgICAgICAgICAgICAgICAgICBUaXRsZSBmb3IgdGhlIHN0YXRlLiBEaXNwbGF5cyBpbiB0aGUgbWVkaWEgbWVudSBhbmQgdGhlIGZyYW1lJ3MgdGl0bGUgcmVnaW9uLlxuICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c30gW2F0dHJpYnV0ZXMubGlicmFyeV0gICAgICAgICAgICAgIFRoZSBhdHRhY2htZW50cyBjb2xsZWN0aW9uIHRvIGVkaXQuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSWYgb25lIGlzIG5vdCBzdXBwbGllZCwgYW4gZW1wdHkgbWVkaWEubW9kZWwuU2VsZWN0aW9uIGNvbGxlY3Rpb24gaXMgY3JlYXRlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLm11bHRpcGxlPWZhbHNlXSAgICAgICBXaGV0aGVyIG11bHRpLXNlbGVjdCBpcyBlbmFibGVkLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuY29udGVudD1icm93c2VdICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIGNvbnRlbnQgcmVnaW9uLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5tZW51ICAgICAgICAgICAgICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIG1lbnUgcmVnaW9uLiBAdG9kbyB0aGlzIG5lZWRzIGEgYmV0dGVyIGV4cGxhbmF0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc2VhcmNoYWJsZT1mYWxzZV0gICAgIFdoZXRoZXIgdGhlIGxpYnJhcnkgaXMgc2VhcmNoYWJsZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnNvcnRhYmxlPXRydWVdICAgICAgICBXaGV0aGVyIHRoZSBBdHRhY2htZW50cyBzaG91bGQgYmUgc29ydGFibGUuIERlcGVuZHMgb24gdGhlIG9yZGVyYnkgcHJvcGVydHkgYmVpbmcgc2V0IHRvIG1lbnVPcmRlciBvbiB0aGUgYXR0YWNobWVudHMgY29sbGVjdGlvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmRhdGU9dHJ1ZV0gICAgICAgICAgICBXaGV0aGVyIHRvIHNob3cgdGhlIGRhdGUgZmlsdGVyIGluIHRoZSBicm93c2VyJ3MgdG9vbGJhci5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmRlc2NyaWJlPXRydWVdICAgICAgICBXaGV0aGVyIHRvIG9mZmVyIFVJIHRvIGRlc2NyaWJlIHRoZSBhdHRhY2htZW50cyAtIGUuZy4gY2FwdGlvbmluZyBpbWFnZXMgaW4gYSBnYWxsZXJ5LlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuZHJhZ0luZm89dHJ1ZV0gICAgICAgIFdoZXRoZXIgdG8gc2hvdyBpbnN0cnVjdGlvbmFsIHRleHQgYWJvdXQgdGhlIGF0dGFjaG1lbnRzIGJlaW5nIHNvcnRhYmxlLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuZHJhZ0luZm9UZXh0XSAgICAgICAgIEluc3RydWN0aW9uYWwgdGV4dCBhYm91dCB0aGUgYXR0YWNobWVudHMgYmVpbmcgc29ydGFibGUuXG4gKiBAcGFyYW0ge2ludH0gICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5pZGVhbENvbHVtbldpZHRoPTE3MF0gVGhlIGlkZWFsIGNvbHVtbiB3aWR0aCBpbiBwaXhlbHMgZm9yIGF0dGFjaG1lbnRzLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuZWRpdGluZz1mYWxzZV0gICAgICAgIFdoZXRoZXIgdGhlIGdhbGxlcnkgaXMgYmVpbmcgY3JlYXRlZCwgb3IgZWRpdGluZyBhbiBleGlzdGluZyBpbnN0YW5jZS5cbiAqIEBwYXJhbSB7aW50fSAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnByaW9yaXR5PTYwXSAgICAgICAgICBUaGUgcHJpb3JpdHkgZm9yIHRoZSBzdGF0ZSBsaW5rIGluIHRoZSBtZWRpYSBtZW51LlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc3luY1NlbGVjdGlvbj1mYWxzZV0gIFdoZXRoZXIgdGhlIEF0dGFjaG1lbnRzIHNlbGVjdGlvbiBzaG91bGQgYmUgcGVyc2lzdGVkIGZyb20gdGhlIGxhc3Qgc3RhdGUuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRGVmYXVsdHMgdG8gZmFsc2UgZm9yIHRoaXMgc3RhdGUsIGJlY2F1c2UgdGhlIGxpYnJhcnkgcGFzc2VkIGluICAqaXMqIHRoZSBzZWxlY3Rpb24uXG4gKiBAcGFyYW0ge3ZpZXd9ICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5TZXR0aW5nc1ZpZXddICAgICAgICAgVGhlIHZpZXcgdG8gZWRpdCB0aGUgY29sbGVjdGlvbiBpbnN0YW5jZSBzZXR0aW5ncyAoZS5nLiBQbGF5bGlzdCBzZXR0aW5ncyB3aXRoIFwiU2hvdyB0cmFja2xpc3RcIiBjaGVja2JveCkuXG4gKiBAcGFyYW0ge3ZpZXd9ICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5BdHRhY2htZW50Vmlld10gICAgICAgVGhlIHNpbmdsZSBgQXR0YWNobWVudGAgdmlldyB0byBiZSB1c2VkIGluIHRoZSBgQXR0YWNobWVudHNgLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIElmIG5vbmUgc3VwcGxpZWQsIGRlZmF1bHRzIHRvIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudC5FZGl0TGlicmFyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIGF0dHJpYnV0ZXMudHlwZSAgICAgICAgICAgICAgICAgICBUaGUgY29sbGVjdGlvbidzIG1lZGlhIHR5cGUuIChlLmcuICd2aWRlbycpLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcy5jb2xsZWN0aW9uVHlwZSAgICAgICAgIFRoZSBjb2xsZWN0aW9uIHR5cGUuIChlLmcuICdwbGF5bGlzdCcpLlxuICovXG52YXIgTGlicmFyeSA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuTGlicmFyeSxcblx0bDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0JCA9IGpRdWVyeSxcblx0Q29sbGVjdGlvbkVkaXQ7XG5cbkNvbGxlY3Rpb25FZGl0ID0gTGlicmFyeS5leHRlbmQoe1xuXHRkZWZhdWx0czoge1xuXHRcdG11bHRpcGxlOiAgICAgICAgIGZhbHNlLFxuXHRcdHNvcnRhYmxlOiAgICAgICAgIHRydWUsXG5cdFx0ZGF0ZTogICAgICAgICAgICAgZmFsc2UsXG5cdFx0c2VhcmNoYWJsZTogICAgICAgZmFsc2UsXG5cdFx0Y29udGVudDogICAgICAgICAgJ2Jyb3dzZScsXG5cdFx0ZGVzY3JpYmU6ICAgICAgICAgdHJ1ZSxcblx0XHRkcmFnSW5mbzogICAgICAgICB0cnVlLFxuXHRcdGlkZWFsQ29sdW1uV2lkdGg6IDE3MCxcblx0XHRlZGl0aW5nOiAgICAgICAgICBmYWxzZSxcblx0XHRwcmlvcml0eTogICAgICAgICA2MCxcblx0XHRTZXR0aW5nc1ZpZXc6ICAgICBmYWxzZSxcblx0XHRzeW5jU2VsZWN0aW9uOiAgICBmYWxzZVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy45LjBcblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBjb2xsZWN0aW9uVHlwZSA9IHRoaXMuZ2V0KCdjb2xsZWN0aW9uVHlwZScpO1xuXG5cdFx0aWYgKCAndmlkZW8nID09PSB0aGlzLmdldCggJ3R5cGUnICkgKSB7XG5cdFx0XHRjb2xsZWN0aW9uVHlwZSA9ICd2aWRlby0nICsgY29sbGVjdGlvblR5cGU7XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXQoICdpZCcsIGNvbGxlY3Rpb25UeXBlICsgJy1lZGl0JyApO1xuXHRcdHRoaXMuc2V0KCAndG9vbGJhcicsIGNvbGxlY3Rpb25UeXBlICsgJy1lZGl0JyApO1xuXG5cdFx0Ly8gSWYgd2UgaGF2ZW4ndCBiZWVuIHByb3ZpZGVkIGEgYGxpYnJhcnlgLCBjcmVhdGUgYSBgU2VsZWN0aW9uYC5cblx0XHRpZiAoICEgdGhpcy5nZXQoJ2xpYnJhcnknKSApIHtcblx0XHRcdHRoaXMuc2V0KCAnbGlicmFyeScsIG5ldyB3cC5tZWRpYS5tb2RlbC5TZWxlY3Rpb24oKSApO1xuXHRcdH1cblx0XHQvLyBUaGUgc2luZ2xlIGBBdHRhY2htZW50YCB2aWV3IHRvIGJlIHVzZWQgaW4gdGhlIGBBdHRhY2htZW50c2Agdmlldy5cblx0XHRpZiAoICEgdGhpcy5nZXQoJ0F0dGFjaG1lbnRWaWV3JykgKSB7XG5cdFx0XHR0aGlzLnNldCggJ0F0dGFjaG1lbnRWaWV3Jywgd3AubWVkaWEudmlldy5BdHRhY2htZW50LkVkaXRMaWJyYXJ5ICk7XG5cdFx0fVxuXHRcdExpYnJhcnkucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy45LjBcblx0ICovXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbGlicmFyeSA9IHRoaXMuZ2V0KCdsaWJyYXJ5Jyk7XG5cblx0XHQvLyBMaW1pdCB0aGUgbGlicmFyeSB0byBpbWFnZXMgb25seS5cblx0XHRsaWJyYXJ5LnByb3BzLnNldCggJ3R5cGUnLCB0aGlzLmdldCggJ3R5cGUnICkgKTtcblxuXHRcdC8vIFdhdGNoIGZvciB1cGxvYWRlZCBhdHRhY2htZW50cy5cblx0XHR0aGlzLmdldCgnbGlicmFyeScpLm9ic2VydmUoIHdwLlVwbG9hZGVyLnF1ZXVlICk7XG5cblx0XHR0aGlzLmZyYW1lLm9uKCAnY29udGVudDpyZW5kZXI6YnJvd3NlJywgdGhpcy5yZW5kZXJTZXR0aW5ncywgdGhpcyApO1xuXG5cdFx0TGlicmFyeS5wcm90b3R5cGUuYWN0aXZhdGUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy45LjBcblx0ICovXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIFN0b3Agd2F0Y2hpbmcgZm9yIHVwbG9hZGVkIGF0dGFjaG1lbnRzLlxuXHRcdHRoaXMuZ2V0KCdsaWJyYXJ5JykudW5vYnNlcnZlKCB3cC5VcGxvYWRlci5xdWV1ZSApO1xuXG5cdFx0dGhpcy5mcmFtZS5vZmYoICdjb250ZW50OnJlbmRlcjpicm93c2UnLCB0aGlzLnJlbmRlclNldHRpbmdzLCB0aGlzICk7XG5cblx0XHRMaWJyYXJ5LnByb3RvdHlwZS5kZWFjdGl2YXRlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHQvKipcblx0ICogUmVuZGVyIHRoZSBjb2xsZWN0aW9uIGVtYmVkIHNldHRpbmdzIHZpZXcgaW4gdGhlIGJyb3dzZXIgc2lkZWJhci5cblx0ICpcblx0ICogQHRvZG8gVGhpcyBpcyBhZ2FpbnN0IHRoZSBwYXR0ZXJuIGVsc2V3aGVyZSBpbiBtZWRpYS4gVHlwaWNhbGx5IHRoZSBmcmFtZVxuXHQgKiAgICAgICBpcyByZXNwb25zaWJsZSBmb3IgYWRkaW5nIHJlZ2lvbiBtb2RlIGNhbGxiYWNrcy4gRXhwbGFpbi5cblx0ICpcblx0ICogQHNpbmNlIDMuOS4wXG5cdCAqXG5cdCAqIEBwYXJhbSB7d3AubWVkaWEudmlldy5hdHRhY2htZW50c0Jyb3dzZXJ9IFRoZSBhdHRhY2htZW50cyBicm93c2VyIHZpZXcuXG5cdCAqL1xuXHRyZW5kZXJTZXR0aW5nczogZnVuY3Rpb24oIGF0dGFjaG1lbnRzQnJvd3NlclZpZXcgKSB7XG5cdFx0dmFyIGxpYnJhcnkgPSB0aGlzLmdldCgnbGlicmFyeScpLFxuXHRcdFx0Y29sbGVjdGlvblR5cGUgPSB0aGlzLmdldCgnY29sbGVjdGlvblR5cGUnKSxcblx0XHRcdGRyYWdJbmZvVGV4dCA9IHRoaXMuZ2V0KCdkcmFnSW5mb1RleHQnKSxcblx0XHRcdFNldHRpbmdzVmlldyA9IHRoaXMuZ2V0KCdTZXR0aW5nc1ZpZXcnKSxcblx0XHRcdG9iaiA9IHt9O1xuXG5cdFx0aWYgKCAhIGxpYnJhcnkgfHwgISBhdHRhY2htZW50c0Jyb3dzZXJWaWV3ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGxpYnJhcnlbIGNvbGxlY3Rpb25UeXBlIF0gPSBsaWJyYXJ5WyBjb2xsZWN0aW9uVHlwZSBdIHx8IG5ldyBCYWNrYm9uZS5Nb2RlbCgpO1xuXG5cdFx0b2JqWyBjb2xsZWN0aW9uVHlwZSBdID0gbmV3IFNldHRpbmdzVmlldyh7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0bW9kZWw6ICAgICAgbGlicmFyeVsgY29sbGVjdGlvblR5cGUgXSxcblx0XHRcdHByaW9yaXR5OiAgIDQwXG5cdFx0fSk7XG5cblx0XHRhdHRhY2htZW50c0Jyb3dzZXJWaWV3LnNpZGViYXIuc2V0KCBvYmogKTtcblxuXHRcdGlmICggZHJhZ0luZm9UZXh0ICkge1xuXHRcdFx0YXR0YWNobWVudHNCcm93c2VyVmlldy50b29sYmFyLnNldCggJ2RyYWdJbmZvJywgbmV3IHdwLm1lZGlhLlZpZXcoe1xuXHRcdFx0XHRlbDogJCggJzxkaXYgY2xhc3M9XCJpbnN0cnVjdGlvbnNcIj4nICsgZHJhZ0luZm9UZXh0ICsgJzwvZGl2PicgKVswXSxcblx0XHRcdFx0cHJpb3JpdHk6IC00MFxuXHRcdFx0fSkgKTtcblx0XHR9XG5cblx0XHQvLyBBZGQgdGhlICdSZXZlcnNlIG9yZGVyJyBidXR0b24gdG8gdGhlIHRvb2xiYXIuXG5cdFx0YXR0YWNobWVudHNCcm93c2VyVmlldy50b29sYmFyLnNldCggJ3JldmVyc2UnLCB7XG5cdFx0XHR0ZXh0OiAgICAgbDEwbi5yZXZlcnNlT3JkZXIsXG5cdFx0XHRwcmlvcml0eTogODAsXG5cblx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0bGlicmFyeS5yZXNldCggbGlicmFyeS50b0FycmF5KCkucmV2ZXJzZSgpICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENvbGxlY3Rpb25FZGl0O1xuIiwiLypnbG9iYWxzIHdwLCBfLCBCYWNrYm9uZSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLmNvbnRyb2xsZXIuQ3JvcHBlclxuICpcbiAqIEEgc3RhdGUgZm9yIGNyb3BwaW5nIGFuIGltYWdlLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5Nb2RlbFxuICovXG52YXIgbDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0Q3JvcHBlcjtcblxuQ3JvcHBlciA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGUuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6IHtcblx0XHRpZDogICAgICAgICAgJ2Nyb3BwZXInLFxuXHRcdHRpdGxlOiAgICAgICBsMTBuLmNyb3BJbWFnZSxcblx0XHQvLyBSZWdpb24gbW9kZSBkZWZhdWx0cy5cblx0XHR0b29sYmFyOiAgICAgJ2Nyb3AnLFxuXHRcdGNvbnRlbnQ6ICAgICAnY3JvcCcsXG5cdFx0cm91dGVyOiAgICAgIGZhbHNlLFxuXG5cdFx0Y2FuU2tpcENyb3A6IGZhbHNlXG5cdH0sXG5cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuZnJhbWUub24oICdjb250ZW50OmNyZWF0ZTpjcm9wJywgdGhpcy5jcmVhdGVDcm9wQ29udGVudCwgdGhpcyApO1xuXHRcdHRoaXMuZnJhbWUub24oICdjbG9zZScsIHRoaXMucmVtb3ZlQ3JvcHBlciwgdGhpcyApO1xuXHRcdHRoaXMuc2V0KCdzZWxlY3Rpb24nLCBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbih0aGlzLmZyYW1lLl9zZWxlY3Rpb24uc2luZ2xlKSk7XG5cdH0sXG5cblx0ZGVhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mcmFtZS50b29sYmFyLm1vZGUoJ2Jyb3dzZScpO1xuXHR9LFxuXG5cdGNyZWF0ZUNyb3BDb250ZW50OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNyb3BwZXJWaWV3ID0gbmV3IHdwLm1lZGlhLnZpZXcuQ3JvcHBlcih7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0YXR0YWNobWVudDogdGhpcy5nZXQoJ3NlbGVjdGlvbicpLmZpcnN0KClcblx0XHR9KTtcblx0XHR0aGlzLmNyb3BwZXJWaWV3Lm9uKCdpbWFnZS1sb2FkZWQnLCB0aGlzLmNyZWF0ZUNyb3BUb29sYmFyLCB0aGlzKTtcblx0XHR0aGlzLmZyYW1lLmNvbnRlbnQuc2V0KHRoaXMuY3JvcHBlclZpZXcpO1xuXG5cdH0sXG5cdHJlbW92ZUNyb3BwZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuaW1nU2VsZWN0LmNhbmNlbFNlbGVjdGlvbigpO1xuXHRcdHRoaXMuaW1nU2VsZWN0LnNldE9wdGlvbnMoe3JlbW92ZTogdHJ1ZX0pO1xuXHRcdHRoaXMuaW1nU2VsZWN0LnVwZGF0ZSgpO1xuXHRcdHRoaXMuY3JvcHBlclZpZXcucmVtb3ZlKCk7XG5cdH0sXG5cdGNyZWF0ZUNyb3BUb29sYmFyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgY2FuU2tpcENyb3AsIHRvb2xiYXJPcHRpb25zO1xuXG5cdFx0Y2FuU2tpcENyb3AgPSB0aGlzLmdldCgnY2FuU2tpcENyb3AnKSB8fCBmYWxzZTtcblxuXHRcdHRvb2xiYXJPcHRpb25zID0ge1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcy5mcmFtZSxcblx0XHRcdGl0ZW1zOiB7XG5cdFx0XHRcdGluc2VydDoge1xuXHRcdFx0XHRcdHN0eWxlOiAgICAncHJpbWFyeScsXG5cdFx0XHRcdFx0dGV4dDogICAgIGwxMG4uY3JvcEltYWdlLFxuXHRcdFx0XHRcdHByaW9yaXR5OiA4MCxcblx0XHRcdFx0XHRyZXF1aXJlczogeyBsaWJyYXJ5OiBmYWxzZSwgc2VsZWN0aW9uOiBmYWxzZSB9LFxuXG5cdFx0XHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGNvbnRyb2xsZXIgPSB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGlvbjtcblxuXHRcdFx0XHRcdFx0c2VsZWN0aW9uID0gY29udHJvbGxlci5zdGF0ZSgpLmdldCgnc2VsZWN0aW9uJykuZmlyc3QoKTtcblx0XHRcdFx0XHRcdHNlbGVjdGlvbi5zZXQoe2Nyb3BEZXRhaWxzOiBjb250cm9sbGVyLnN0YXRlKCkuaW1nU2VsZWN0LmdldFNlbGVjdGlvbigpfSk7XG5cblx0XHRcdFx0XHRcdHRoaXMuJGVsLnRleHQobDEwbi5jcm9wcGluZyk7XG5cdFx0XHRcdFx0XHR0aGlzLiRlbC5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuXG5cdFx0XHRcdFx0XHRjb250cm9sbGVyLnN0YXRlKCkuZG9Dcm9wKCBzZWxlY3Rpb24gKS5kb25lKCBmdW5jdGlvbiggY3JvcHBlZEltYWdlICkge1xuXHRcdFx0XHRcdFx0XHRjb250cm9sbGVyLnRyaWdnZXIoJ2Nyb3BwZWQnLCBjcm9wcGVkSW1hZ2UgKTtcblx0XHRcdFx0XHRcdFx0Y29udHJvbGxlci5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0fSkuZmFpbCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRyb2xsZXIudHJpZ2dlcignY29udGVudDplcnJvcjpjcm9wJyk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0aWYgKCBjYW5Ta2lwQ3JvcCApIHtcblx0XHRcdF8uZXh0ZW5kKCB0b29sYmFyT3B0aW9ucy5pdGVtcywge1xuXHRcdFx0XHRza2lwOiB7XG5cdFx0XHRcdFx0c3R5bGU6ICAgICAgJ3NlY29uZGFyeScsXG5cdFx0XHRcdFx0dGV4dDogICAgICAgbDEwbi5za2lwQ3JvcHBpbmcsXG5cdFx0XHRcdFx0cHJpb3JpdHk6ICAgNzAsXG5cdFx0XHRcdFx0cmVxdWlyZXM6ICAgeyBsaWJyYXJ5OiBmYWxzZSwgc2VsZWN0aW9uOiBmYWxzZSB9LFxuXHRcdFx0XHRcdGNsaWNrOiAgICAgIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLmdldCgnc2VsZWN0aW9uJykuZmlyc3QoKTtcblx0XHRcdFx0XHRcdHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLmNyb3BwZXJWaWV3LnJlbW92ZSgpO1xuXHRcdFx0XHRcdFx0dGhpcy5jb250cm9sbGVyLnRyaWdnZXIoJ3NraXBwZWRjcm9wJywgc2VsZWN0aW9uKTtcblx0XHRcdFx0XHRcdHRoaXMuY29udHJvbGxlci5jbG9zZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0dGhpcy5mcmFtZS50b29sYmFyLnNldCggbmV3IHdwLm1lZGlhLnZpZXcuVG9vbGJhcih0b29sYmFyT3B0aW9ucykgKTtcblx0fSxcblxuXHRkb0Nyb3A6IGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXHRcdHJldHVybiB3cC5hamF4LnBvc3QoICdjdXN0b20taGVhZGVyLWNyb3AnLCB7XG5cdFx0XHRub25jZTogYXR0YWNobWVudC5nZXQoJ25vbmNlcycpLmVkaXQsXG5cdFx0XHRpZDogYXR0YWNobWVudC5nZXQoJ2lkJyksXG5cdFx0XHRjcm9wRGV0YWlsczogYXR0YWNobWVudC5nZXQoJ2Nyb3BEZXRhaWxzJylcblx0XHR9ICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IENyb3BwZXI7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5jb250cm9sbGVyLkN1c3RvbWl6ZUltYWdlQ3JvcHBlclxuICpcbiAqIEEgc3RhdGUgZm9yIGNyb3BwaW5nIGFuIGltYWdlLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuQ3JvcHBlclxuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5Nb2RlbFxuICovXG52YXIgQ29udHJvbGxlciA9IHdwLm1lZGlhLmNvbnRyb2xsZXIsXG5cdEN1c3RvbWl6ZUltYWdlQ3JvcHBlcjtcblxuQ3VzdG9taXplSW1hZ2VDcm9wcGVyID0gQ29udHJvbGxlci5Dcm9wcGVyLmV4dGVuZCh7XG5cdGRvQ3JvcDogZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cdFx0dmFyIGNyb3BEZXRhaWxzID0gYXR0YWNobWVudC5nZXQoICdjcm9wRGV0YWlscycgKSxcblx0XHRcdGNvbnRyb2wgPSB0aGlzLmdldCggJ2NvbnRyb2wnICk7XG5cblx0XHRjcm9wRGV0YWlscy5kc3Rfd2lkdGggID0gY29udHJvbC5wYXJhbXMud2lkdGg7XG5cdFx0Y3JvcERldGFpbHMuZHN0X2hlaWdodCA9IGNvbnRyb2wucGFyYW1zLmhlaWdodDtcblxuXHRcdHJldHVybiB3cC5hamF4LnBvc3QoICdjcm9wLWltYWdlJywge1xuXHRcdFx0d3BfY3VzdG9taXplOiAnb24nLFxuXHRcdFx0bm9uY2U6IGF0dGFjaG1lbnQuZ2V0KCAnbm9uY2VzJyApLmVkaXQsXG5cdFx0XHRpZDogYXR0YWNobWVudC5nZXQoICdpZCcgKSxcblx0XHRcdGNvbnRleHQ6IGNvbnRyb2wuaWQsXG5cdFx0XHRjcm9wRGV0YWlsczogY3JvcERldGFpbHNcblx0XHR9ICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEN1c3RvbWl6ZUltYWdlQ3JvcHBlcjtcbiIsIi8qZ2xvYmFscyB3cCAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLmNvbnRyb2xsZXIuRWRpdEltYWdlXG4gKlxuICogQSBzdGF0ZSBmb3IgZWRpdGluZyAoY3JvcHBpbmcsIGV0Yy4pIGFuIGltYWdlLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5Nb2RlbFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSAgICAgICAgICAgICAgICAgICAgYXR0cmlidXRlcyAgICAgICAgICAgICAgICAgICAgICBUaGUgYXR0cmlidXRlcyBoYXNoIHBhc3NlZCB0byB0aGUgc3RhdGUuXG4gKiBAcGFyYW0ge3dwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnR9IGF0dHJpYnV0ZXMubW9kZWwgICAgICAgICAgICAgICAgVGhlIGF0dGFjaG1lbnQuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmlkPWVkaXQtaW1hZ2VdICAgICAgVW5pcXVlIGlkZW50aWZpZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnRpdGxlPUVkaXQgSW1hZ2VdICAgVGl0bGUgZm9yIHRoZSBzdGF0ZS4gRGlzcGxheXMgaW4gdGhlIG1lZGlhIG1lbnUgYW5kIHRoZSBmcmFtZSdzIHRpdGxlIHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuY29udGVudD1lZGl0LWltYWdlXSBJbml0aWFsIG1vZGUgZm9yIHRoZSBjb250ZW50IHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMudG9vbGJhcj1lZGl0LWltYWdlXSBJbml0aWFsIG1vZGUgZm9yIHRoZSB0b29sYmFyIHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMubWVudT1mYWxzZV0gICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSBtZW51IHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMudXJsXSAgICAgICAgICAgICAgICBVbnVzZWQuIEB0b2RvIENvbnNpZGVyIHJlbW92YWwuXG4gKi9cbnZhciBsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHRFZGl0SW1hZ2U7XG5cbkVkaXRJbWFnZSA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGUuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6IHtcblx0XHRpZDogICAgICAnZWRpdC1pbWFnZScsXG5cdFx0dGl0bGU6ICAgbDEwbi5lZGl0SW1hZ2UsXG5cdFx0bWVudTogICAgZmFsc2UsXG5cdFx0dG9vbGJhcjogJ2VkaXQtaW1hZ2UnLFxuXHRcdGNvbnRlbnQ6ICdlZGl0LWltYWdlJyxcblx0XHR1cmw6ICAgICAnJ1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy45LjBcblx0ICovXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLmZyYW1lLCAndG9vbGJhcjpyZW5kZXI6ZWRpdC1pbWFnZScsIHRoaXMudG9vbGJhciApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy45LjBcblx0ICovXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc3RvcExpc3RlbmluZyggdGhpcy5mcmFtZSApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy45LjBcblx0ICovXG5cdHRvb2xiYXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBmcmFtZSA9IHRoaXMuZnJhbWUsXG5cdFx0XHRsYXN0U3RhdGUgPSBmcmFtZS5sYXN0U3RhdGUoKSxcblx0XHRcdHByZXZpb3VzID0gbGFzdFN0YXRlICYmIGxhc3RTdGF0ZS5pZDtcblxuXHRcdGZyYW1lLnRvb2xiYXIuc2V0KCBuZXcgd3AubWVkaWEudmlldy5Ub29sYmFyKHtcblx0XHRcdGNvbnRyb2xsZXI6IGZyYW1lLFxuXHRcdFx0aXRlbXM6IHtcblx0XHRcdFx0YmFjazoge1xuXHRcdFx0XHRcdHN0eWxlOiAncHJpbWFyeScsXG5cdFx0XHRcdFx0dGV4dDogICAgIGwxMG4uYmFjayxcblx0XHRcdFx0XHRwcmlvcml0eTogMjAsXG5cdFx0XHRcdFx0Y2xpY2s6ICAgIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0aWYgKCBwcmV2aW91cyApIHtcblx0XHRcdFx0XHRcdFx0ZnJhbWUuc2V0U3RhdGUoIHByZXZpb3VzICk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRmcmFtZS5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVkaXRJbWFnZTtcbiIsIi8qZ2xvYmFscyB3cCwgXywgQmFja2JvbmUgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5jb250cm9sbGVyLkVtYmVkXG4gKlxuICogQSBzdGF0ZSBmb3IgZW1iZWRkaW5nIG1lZGlhIGZyb20gYSBVUkwuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZVxuICogQGF1Z21lbnRzIEJhY2tib25lLk1vZGVsXG4gKlxuICogQHBhcmFtIHtvYmplY3R9IGF0dHJpYnV0ZXMgICAgICAgICAgICAgICAgICAgICAgICAgVGhlIGF0dHJpYnV0ZXMgaGFzaCBwYXNzZWQgdG8gdGhlIHN0YXRlLlxuICogQHBhcmFtIHtzdHJpbmd9IFthdHRyaWJ1dGVzLmlkPWVtYmVkXSAgICAgICAgICAgICAgVW5pcXVlIGlkZW50aWZpZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gW2F0dHJpYnV0ZXMudGl0bGU9SW5zZXJ0IEZyb20gVVJMXSBUaXRsZSBmb3IgdGhlIHN0YXRlLiBEaXNwbGF5cyBpbiB0aGUgbWVkaWEgbWVudSBhbmQgdGhlIGZyYW1lJ3MgdGl0bGUgcmVnaW9uLlxuICogQHBhcmFtIHtzdHJpbmd9IFthdHRyaWJ1dGVzLmNvbnRlbnQ9ZW1iZWRdICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgY29udGVudCByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gW2F0dHJpYnV0ZXMubWVudT1kZWZhdWx0XSAgICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSBtZW51IHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbYXR0cmlidXRlcy50b29sYmFyPW1haW4tZW1iZWRdICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIHRvb2xiYXIgcmVnaW9uLlxuICogQHBhcmFtIHtzdHJpbmd9IFthdHRyaWJ1dGVzLm1lbnU9ZmFsc2VdICAgICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgbWVudSByZWdpb24uXG4gKiBAcGFyYW0ge2ludH0gICAgW2F0dHJpYnV0ZXMucHJpb3JpdHk9MTIwXSAgICAgICAgICBUaGUgcHJpb3JpdHkgZm9yIHRoZSBzdGF0ZSBsaW5rIGluIHRoZSBtZWRpYSBtZW51LlxuICogQHBhcmFtIHtzdHJpbmd9IFthdHRyaWJ1dGVzLnR5cGU9bGlua10gICAgICAgICAgICAgVGhlIHR5cGUgb2YgZW1iZWQuIEN1cnJlbnRseSBvbmx5IGxpbmsgaXMgc3VwcG9ydGVkLlxuICogQHBhcmFtIHtzdHJpbmd9IFthdHRyaWJ1dGVzLnVybF0gICAgICAgICAgICAgICAgICAgVGhlIGVtYmVkIFVSTC5cbiAqIEBwYXJhbSB7b2JqZWN0fSBbYXR0cmlidXRlcy5tZXRhZGF0YT17fV0gICAgICAgICAgIFByb3BlcnRpZXMgb2YgdGhlIGVtYmVkLCB3aGljaCB3aWxsIG92ZXJyaWRlIGF0dHJpYnV0ZXMudXJsIGlmIHNldC5cbiAqL1xudmFyIGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdCQgPSBCYWNrYm9uZS4kLFxuXHRFbWJlZDtcblxuRW1iZWQgPSB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlLmV4dGVuZCh7XG5cdGRlZmF1bHRzOiB7XG5cdFx0aWQ6ICAgICAgICdlbWJlZCcsXG5cdFx0dGl0bGU6ICAgIGwxMG4uaW5zZXJ0RnJvbVVybFRpdGxlLFxuXHRcdGNvbnRlbnQ6ICAnZW1iZWQnLFxuXHRcdG1lbnU6ICAgICAnZGVmYXVsdCcsXG5cdFx0dG9vbGJhcjogICdtYWluLWVtYmVkJyxcblx0XHRwcmlvcml0eTogMTIwLFxuXHRcdHR5cGU6ICAgICAnbGluaycsXG5cdFx0dXJsOiAgICAgICcnLFxuXHRcdG1ldGFkYXRhOiB7fVxuXHR9LFxuXG5cdC8vIFRoZSBhbW91bnQgb2YgdGltZSB1c2VkIHdoZW4gZGVib3VuY2luZyB0aGUgc2Nhbi5cblx0c2Vuc2l0aXZpdHk6IDQwMCxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbihvcHRpb25zKSB7XG5cdFx0dGhpcy5tZXRhZGF0YSA9IG9wdGlvbnMubWV0YWRhdGE7XG5cdFx0dGhpcy5kZWJvdW5jZWRTY2FuID0gXy5kZWJvdW5jZSggXy5iaW5kKCB0aGlzLnNjYW4sIHRoaXMgKSwgdGhpcy5zZW5zaXRpdml0eSApO1xuXHRcdHRoaXMucHJvcHMgPSBuZXcgQmFja2JvbmUuTW9kZWwoIHRoaXMubWV0YWRhdGEgfHwgeyB1cmw6ICcnIH0pO1xuXHRcdHRoaXMucHJvcHMub24oICdjaGFuZ2U6dXJsJywgdGhpcy5kZWJvdW5jZWRTY2FuLCB0aGlzICk7XG5cdFx0dGhpcy5wcm9wcy5vbiggJ2NoYW5nZTp1cmwnLCB0aGlzLnJlZnJlc2gsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnc2NhbicsIHRoaXMuc2NhbkltYWdlLCB0aGlzICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRyaWdnZXIgYSBzY2FuIG9mIHRoZSBlbWJlZGRlZCBVUkwncyBjb250ZW50IGZvciBtZXRhZGF0YSByZXF1aXJlZCB0byBlbWJlZC5cblx0ICpcblx0ICogQGZpcmVzIHdwLm1lZGlhLmNvbnRyb2xsZXIuRW1iZWQjc2NhblxuXHQgKi9cblx0c2NhbjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNjYW5uZXJzLFxuXHRcdFx0ZW1iZWQgPSB0aGlzLFxuXHRcdFx0YXR0cmlidXRlcyA9IHtcblx0XHRcdFx0dHlwZTogJ2xpbmsnLFxuXHRcdFx0XHRzY2FubmVyczogW11cblx0XHRcdH07XG5cblx0XHQvLyBTY2FuIGlzIHRyaWdnZXJlZCB3aXRoIHRoZSBsaXN0IG9mIGBhdHRyaWJ1dGVzYCB0byBzZXQgb24gdGhlXG5cdFx0Ly8gc3RhdGUsIHVzZWZ1bCBmb3IgdGhlICd0eXBlJyBhdHRyaWJ1dGUgYW5kICdzY2FubmVycycgYXR0cmlidXRlLFxuXHRcdC8vIGFuIGFycmF5IG9mIHByb21pc2Ugb2JqZWN0cyBmb3IgYXN5bmNocm9ub3VzIHNjYW4gb3BlcmF0aW9ucy5cblx0XHRpZiAoIHRoaXMucHJvcHMuZ2V0KCd1cmwnKSApIHtcblx0XHRcdHRoaXMudHJpZ2dlciggJ3NjYW4nLCBhdHRyaWJ1dGVzICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBhdHRyaWJ1dGVzLnNjYW5uZXJzLmxlbmd0aCApIHtcblx0XHRcdHNjYW5uZXJzID0gYXR0cmlidXRlcy5zY2FubmVycyA9ICQud2hlbi5hcHBseSggJCwgYXR0cmlidXRlcy5zY2FubmVycyApO1xuXHRcdFx0c2Nhbm5lcnMuYWx3YXlzKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0aWYgKCBlbWJlZC5nZXQoJ3NjYW5uZXJzJykgPT09IHNjYW5uZXJzICkge1xuXHRcdFx0XHRcdGVtYmVkLnNldCggJ2xvYWRpbmcnLCBmYWxzZSApO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YXR0cmlidXRlcy5zY2FubmVycyA9IG51bGw7XG5cdFx0fVxuXG5cdFx0YXR0cmlidXRlcy5sb2FkaW5nID0gISEgYXR0cmlidXRlcy5zY2FubmVycztcblx0XHR0aGlzLnNldCggYXR0cmlidXRlcyApO1xuXHR9LFxuXHQvKipcblx0ICogVHJ5IHNjYW5uaW5nIHRoZSBlbWJlZCBhcyBhbiBpbWFnZSB0byBkaXNjb3ZlciBpdHMgZGltZW5zaW9ucy5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IGF0dHJpYnV0ZXNcblx0ICovXG5cdHNjYW5JbWFnZTogZnVuY3Rpb24oIGF0dHJpYnV0ZXMgKSB7XG5cdFx0dmFyIGZyYW1lID0gdGhpcy5mcmFtZSxcblx0XHRcdHN0YXRlID0gdGhpcyxcblx0XHRcdHVybCA9IHRoaXMucHJvcHMuZ2V0KCd1cmwnKSxcblx0XHRcdGltYWdlID0gbmV3IEltYWdlKCksXG5cdFx0XHRkZWZlcnJlZCA9ICQuRGVmZXJyZWQoKTtcblxuXHRcdGF0dHJpYnV0ZXMuc2Nhbm5lcnMucHVzaCggZGVmZXJyZWQucHJvbWlzZSgpICk7XG5cblx0XHQvLyBUcnkgdG8gbG9hZCB0aGUgaW1hZ2UgYW5kIGZpbmQgaXRzIHdpZHRoL2hlaWdodC5cblx0XHRpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbigpIHtcblx0XHRcdGRlZmVycmVkLnJlc29sdmUoKTtcblxuXHRcdFx0aWYgKCBzdGF0ZSAhPT0gZnJhbWUuc3RhdGUoKSB8fCB1cmwgIT09IHN0YXRlLnByb3BzLmdldCgndXJsJykgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0c3RhdGUuc2V0KHtcblx0XHRcdFx0dHlwZTogJ2ltYWdlJ1xuXHRcdFx0fSk7XG5cblx0XHRcdHN0YXRlLnByb3BzLnNldCh7XG5cdFx0XHRcdHdpZHRoOiAgaW1hZ2Uud2lkdGgsXG5cdFx0XHRcdGhlaWdodDogaW1hZ2UuaGVpZ2h0XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0aW1hZ2Uub25lcnJvciA9IGRlZmVycmVkLnJlamVjdDtcblx0XHRpbWFnZS5zcmMgPSB1cmw7XG5cdH0sXG5cblx0cmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mcmFtZS50b29sYmFyLmdldCgpLnJlZnJlc2goKTtcblx0fSxcblxuXHRyZXNldDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5wcm9wcy5jbGVhcigpLnNldCh7IHVybDogJycgfSk7XG5cblx0XHRpZiAoIHRoaXMuYWN0aXZlICkge1xuXHRcdFx0dGhpcy5yZWZyZXNoKCk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbWJlZDtcbiIsIi8qZ2xvYmFscyB3cCwgXyAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLmNvbnRyb2xsZXIuRmVhdHVyZWRJbWFnZVxuICpcbiAqIEEgc3RhdGUgZm9yIHNlbGVjdGluZyBhIGZlYXR1cmVkIGltYWdlIGZvciBhIHBvc3QuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5XG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZVxuICogQGF1Z21lbnRzIEJhY2tib25lLk1vZGVsXG4gKlxuICogQHBhcmFtIHtvYmplY3R9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXNdICAgICAgICAgICAgICAgICAgICAgICAgICBUaGUgYXR0cmlidXRlcyBoYXNoIHBhc3NlZCB0byB0aGUgc3RhdGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5pZD1mZWF0dXJlZC1pbWFnZV0gICAgICAgIFVuaXF1ZSBpZGVudGlmaWVyLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMudGl0bGU9U2V0IEZlYXR1cmVkIEltYWdlXSBUaXRsZSBmb3IgdGhlIHN0YXRlLiBEaXNwbGF5cyBpbiB0aGUgbWVkaWEgbWVudSBhbmQgdGhlIGZyYW1lJ3MgdGl0bGUgcmVnaW9uLlxuICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c30gW2F0dHJpYnV0ZXMubGlicmFyeV0gICAgICAgICAgICAgICAgICBUaGUgYXR0YWNobWVudHMgY29sbGVjdGlvbiB0byBicm93c2UuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIElmIG9uZSBpcyBub3Qgc3VwcGxpZWQsIGEgY29sbGVjdGlvbiBvZiBhbGwgaW1hZ2VzIHdpbGwgYmUgY3JlYXRlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLm11bHRpcGxlPWZhbHNlXSAgICAgICAgICAgV2hldGhlciBtdWx0aS1zZWxlY3QgaXMgZW5hYmxlZC5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmNvbnRlbnQ9dXBsb2FkXSAgICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgY29udGVudCByZWdpb24uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE92ZXJyaWRkZW4gYnkgcGVyc2lzdGVudCB1c2VyIHNldHRpbmcgaWYgJ2NvbnRlbnRVc2VyU2V0dGluZycgaXMgdHJ1ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLm1lbnU9ZGVmYXVsdF0gICAgICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgbWVudSByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5yb3V0ZXI9YnJvd3NlXSAgICAgICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIHJvdXRlciByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy50b29sYmFyPWZlYXR1cmVkLWltYWdlXSAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIHRvb2xiYXIgcmVnaW9uLlxuICogQHBhcmFtIHtpbnR9ICAgICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMucHJpb3JpdHk9NjBdICAgICAgICAgICAgICBUaGUgcHJpb3JpdHkgZm9yIHRoZSBzdGF0ZSBsaW5rIGluIHRoZSBtZWRpYSBtZW51LlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc2VhcmNoYWJsZT10cnVlXSAgICAgICAgICBXaGV0aGVyIHRoZSBsaWJyYXJ5IGlzIHNlYXJjaGFibGUuXG4gKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSAgICAgICAgICAgICBbYXR0cmlidXRlcy5maWx0ZXJhYmxlPWZhbHNlXSAgICAgICAgIFdoZXRoZXIgdGhlIGxpYnJhcnkgaXMgZmlsdGVyYWJsZSwgYW5kIGlmIHNvIHdoYXQgZmlsdGVycyBzaG91bGQgYmUgc2hvd24uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjY2VwdHMgJ2FsbCcsICd1cGxvYWRlZCcsIG9yICd1bmF0dGFjaGVkJy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnNvcnRhYmxlPXRydWVdICAgICAgICAgICAgV2hldGhlciB0aGUgQXR0YWNobWVudHMgc2hvdWxkIGJlIHNvcnRhYmxlLiBEZXBlbmRzIG9uIHRoZSBvcmRlcmJ5IHByb3BlcnR5IGJlaW5nIHNldCB0byBtZW51T3JkZXIgb24gdGhlIGF0dGFjaG1lbnRzIGNvbGxlY3Rpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5hdXRvU2VsZWN0PXRydWVdICAgICAgICAgIFdoZXRoZXIgYW4gdXBsb2FkZWQgYXR0YWNobWVudCBzaG91bGQgYmUgYXV0b21hdGljYWxseSBhZGRlZCB0byB0aGUgc2VsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuZGVzY3JpYmU9ZmFsc2VdICAgICAgICAgICBXaGV0aGVyIHRvIG9mZmVyIFVJIHRvIGRlc2NyaWJlIGF0dGFjaG1lbnRzIC0gZS5nLiBjYXB0aW9uaW5nIGltYWdlcyBpbiBhIGdhbGxlcnkuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5jb250ZW50VXNlclNldHRpbmc9dHJ1ZV0gIFdoZXRoZXIgdGhlIGNvbnRlbnQgcmVnaW9uJ3MgbW9kZSBzaG91bGQgYmUgc2V0IGFuZCBwZXJzaXN0ZWQgcGVyIHVzZXIuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5zeW5jU2VsZWN0aW9uPXRydWVdICAgICAgIFdoZXRoZXIgdGhlIEF0dGFjaG1lbnRzIHNlbGVjdGlvbiBzaG91bGQgYmUgcGVyc2lzdGVkIGZyb20gdGhlIGxhc3Qgc3RhdGUuXG4gKi9cbnZhciBBdHRhY2htZW50ID0gd3AubWVkaWEubW9kZWwuQXR0YWNobWVudCxcblx0TGlicmFyeSA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuTGlicmFyeSxcblx0bDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0RmVhdHVyZWRJbWFnZTtcblxuRmVhdHVyZWRJbWFnZSA9IExpYnJhcnkuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6IF8uZGVmYXVsdHMoe1xuXHRcdGlkOiAgICAgICAgICAgICdmZWF0dXJlZC1pbWFnZScsXG5cdFx0dGl0bGU6ICAgICAgICAgbDEwbi5zZXRGZWF0dXJlZEltYWdlVGl0bGUsXG5cdFx0bXVsdGlwbGU6ICAgICAgZmFsc2UsXG5cdFx0ZmlsdGVyYWJsZTogICAgJ3VwbG9hZGVkJyxcblx0XHR0b29sYmFyOiAgICAgICAnZmVhdHVyZWQtaW1hZ2UnLFxuXHRcdHByaW9yaXR5OiAgICAgIDYwLFxuXHRcdHN5bmNTZWxlY3Rpb246IHRydWVcblx0fSwgTGlicmFyeS5wcm90b3R5cGUuZGVmYXVsdHMgKSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbGlicmFyeSwgY29tcGFyYXRvcjtcblxuXHRcdC8vIElmIHdlIGhhdmVuJ3QgYmVlbiBwcm92aWRlZCBhIGBsaWJyYXJ5YCwgY3JlYXRlIGEgYFNlbGVjdGlvbmAuXG5cdFx0aWYgKCAhIHRoaXMuZ2V0KCdsaWJyYXJ5JykgKSB7XG5cdFx0XHR0aGlzLnNldCggJ2xpYnJhcnknLCB3cC5tZWRpYS5xdWVyeSh7IHR5cGU6ICdpbWFnZScgfSkgKTtcblx0XHR9XG5cblx0XHRMaWJyYXJ5LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdGxpYnJhcnkgICAgPSB0aGlzLmdldCgnbGlicmFyeScpO1xuXHRcdGNvbXBhcmF0b3IgPSBsaWJyYXJ5LmNvbXBhcmF0b3I7XG5cblx0XHQvLyBPdmVybG9hZCB0aGUgbGlicmFyeSdzIGNvbXBhcmF0b3IgdG8gcHVzaCBpdGVtcyB0aGF0IGFyZSBub3QgaW5cblx0XHQvLyB0aGUgbWlycm9yZWQgcXVlcnkgdG8gdGhlIGZyb250IG9mIHRoZSBhZ2dyZWdhdGUgY29sbGVjdGlvbi5cblx0XHRsaWJyYXJ5LmNvbXBhcmF0b3IgPSBmdW5jdGlvbiggYSwgYiApIHtcblx0XHRcdHZhciBhSW5RdWVyeSA9ICEhIHRoaXMubWlycm9yaW5nLmdldCggYS5jaWQgKSxcblx0XHRcdFx0YkluUXVlcnkgPSAhISB0aGlzLm1pcnJvcmluZy5nZXQoIGIuY2lkICk7XG5cblx0XHRcdGlmICggISBhSW5RdWVyeSAmJiBiSW5RdWVyeSApIHtcblx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0fSBlbHNlIGlmICggYUluUXVlcnkgJiYgISBiSW5RdWVyeSApIHtcblx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gY29tcGFyYXRvci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdC8vIEFkZCBhbGwgaXRlbXMgaW4gdGhlIHNlbGVjdGlvbiB0byB0aGUgbGlicmFyeSwgc28gYW55IGZlYXR1cmVkXG5cdFx0Ly8gaW1hZ2VzIHRoYXQgYXJlIG5vdCBpbml0aWFsbHkgbG9hZGVkIHN0aWxsIGFwcGVhci5cblx0XHRsaWJyYXJ5Lm9ic2VydmUoIHRoaXMuZ2V0KCdzZWxlY3Rpb24nKSApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnVwZGF0ZVNlbGVjdGlvbigpO1xuXHRcdHRoaXMuZnJhbWUub24oICdvcGVuJywgdGhpcy51cGRhdGVTZWxlY3Rpb24sIHRoaXMgKTtcblxuXHRcdExpYnJhcnkucHJvdG90eXBlLmFjdGl2YXRlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmZyYW1lLm9mZiggJ29wZW4nLCB0aGlzLnVwZGF0ZVNlbGVjdGlvbiwgdGhpcyApO1xuXG5cdFx0TGlicmFyeS5wcm90b3R5cGUuZGVhY3RpdmF0ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0dXBkYXRlU2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5nZXQoJ3NlbGVjdGlvbicpLFxuXHRcdFx0aWQgPSB3cC5tZWRpYS52aWV3LnNldHRpbmdzLnBvc3QuZmVhdHVyZWRJbWFnZUlkLFxuXHRcdFx0YXR0YWNobWVudDtcblxuXHRcdGlmICggJycgIT09IGlkICYmIC0xICE9PSBpZCApIHtcblx0XHRcdGF0dGFjaG1lbnQgPSBBdHRhY2htZW50LmdldCggaWQgKTtcblx0XHRcdGF0dGFjaG1lbnQuZmV0Y2goKTtcblx0XHR9XG5cblx0XHRzZWxlY3Rpb24ucmVzZXQoIGF0dGFjaG1lbnQgPyBbIGF0dGFjaG1lbnQgXSA6IFtdICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZlYXR1cmVkSW1hZ2U7XG4iLCIvKmdsb2JhbHMgd3AsIF8gKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5jb250cm9sbGVyLkdhbGxlcnlBZGRcbiAqXG4gKiBBIHN0YXRlIGZvciBzZWxlY3RpbmcgbW9yZSBpbWFnZXMgdG8gYWRkIHRvIGEgZ2FsbGVyeS5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5jb250cm9sbGVyLkxpYnJhcnlcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlXG4gKiBAYXVnbWVudHMgQmFja2JvbmUuTW9kZWxcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlc10gICAgICAgICAgICAgICAgICAgICAgICAgVGhlIGF0dHJpYnV0ZXMgaGFzaCBwYXNzZWQgdG8gdGhlIHN0YXRlLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuaWQ9Z2FsbGVyeS1saWJyYXJ5XSAgICAgIFVuaXF1ZSBpZGVudGlmaWVyLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMudGl0bGU9QWRkIHRvIEdhbGxlcnldICAgIFRpdGxlIGZvciB0aGUgc3RhdGUuIERpc3BsYXlzIGluIHRoZSBmcmFtZSdzIHRpdGxlIHJlZ2lvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLm11bHRpcGxlPWFkZF0gICAgICAgICAgICBXaGV0aGVyIG11bHRpLXNlbGVjdCBpcyBlbmFibGVkLiBAdG9kbyAnYWRkJyBkb2Vzbid0IHNlZW0gZG8gYW55dGhpbmcgc3BlY2lhbCwgYW5kIGdldHMgdXNlZCBhcyBhIGJvb2xlYW4uXG4gKiBAcGFyYW0ge3dwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzfSBbYXR0cmlidXRlcy5saWJyYXJ5XSAgICAgICAgICAgICAgICAgVGhlIGF0dGFjaG1lbnRzIGNvbGxlY3Rpb24gdG8gYnJvd3NlLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIElmIG9uZSBpcyBub3Qgc3VwcGxpZWQsIGEgY29sbGVjdGlvbiBvZiBhbGwgaW1hZ2VzIHdpbGwgYmUgY3JlYXRlZC5cbiAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9ICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmZpbHRlcmFibGU9dXBsb2FkZWRdICAgICBXaGV0aGVyIHRoZSBsaWJyYXJ5IGlzIGZpbHRlcmFibGUsIGFuZCBpZiBzbyB3aGF0IGZpbHRlcnMgc2hvdWxkIGJlIHNob3duLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjY2VwdHMgJ2FsbCcsICd1cGxvYWRlZCcsIG9yICd1bmF0dGFjaGVkJy5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLm1lbnU9Z2FsbGVyeV0gICAgICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSBtZW51IHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmNvbnRlbnQ9dXBsb2FkXSAgICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSBjb250ZW50IHJlZ2lvbi5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPdmVycmlkZGVuIGJ5IHBlcnNpc3RlbnQgdXNlciBzZXR0aW5nIGlmICdjb250ZW50VXNlclNldHRpbmcnIGlzIHRydWUuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5yb3V0ZXI9YnJvd3NlXSAgICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgcm91dGVyIHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnRvb2xiYXI9Z2FsbGVyeS1hZGRdICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSB0b29sYmFyIHJlZ2lvbi5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnNlYXJjaGFibGU9dHJ1ZV0gICAgICAgICBXaGV0aGVyIHRoZSBsaWJyYXJ5IGlzIHNlYXJjaGFibGUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5zb3J0YWJsZT10cnVlXSAgICAgICAgICAgV2hldGhlciB0aGUgQXR0YWNobWVudHMgc2hvdWxkIGJlIHNvcnRhYmxlLiBEZXBlbmRzIG9uIHRoZSBvcmRlcmJ5IHByb3BlcnR5IGJlaW5nIHNldCB0byBtZW51T3JkZXIgb24gdGhlIGF0dGFjaG1lbnRzIGNvbGxlY3Rpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5hdXRvU2VsZWN0PXRydWVdICAgICAgICAgV2hldGhlciBhbiB1cGxvYWRlZCBhdHRhY2htZW50IHNob3VsZCBiZSBhdXRvbWF0aWNhbGx5IGFkZGVkIHRvIHRoZSBzZWxlY3Rpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5jb250ZW50VXNlclNldHRpbmc9dHJ1ZV0gV2hldGhlciB0aGUgY29udGVudCByZWdpb24ncyBtb2RlIHNob3VsZCBiZSBzZXQgYW5kIHBlcnNpc3RlZCBwZXIgdXNlci5cbiAqIEBwYXJhbSB7aW50fSAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnByaW9yaXR5PTEwMF0gICAgICAgICAgICBUaGUgcHJpb3JpdHkgZm9yIHRoZSBzdGF0ZSBsaW5rIGluIHRoZSBtZWRpYSBtZW51LlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc3luY1NlbGVjdGlvbj1mYWxzZV0gICAgIFdoZXRoZXIgdGhlIEF0dGFjaG1lbnRzIHNlbGVjdGlvbiBzaG91bGQgYmUgcGVyc2lzdGVkIGZyb20gdGhlIGxhc3Qgc3RhdGUuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgRGVmYXVsdHMgdG8gZmFsc2UgYmVjYXVzZSBmb3IgdGhpcyBzdGF0ZSwgYmVjYXVzZSB0aGUgbGlicmFyeSBvZiB0aGUgRWRpdCBHYWxsZXJ5IHN0YXRlIGlzIHRoZSBzZWxlY3Rpb24uXG4gKi9cbnZhciBTZWxlY3Rpb24gPSB3cC5tZWRpYS5tb2RlbC5TZWxlY3Rpb24sXG5cdExpYnJhcnkgPSB3cC5tZWRpYS5jb250cm9sbGVyLkxpYnJhcnksXG5cdGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdEdhbGxlcnlBZGQ7XG5cbkdhbGxlcnlBZGQgPSBMaWJyYXJ5LmV4dGVuZCh7XG5cdGRlZmF1bHRzOiBfLmRlZmF1bHRzKHtcblx0XHRpZDogICAgICAgICAgICAnZ2FsbGVyeS1saWJyYXJ5Jyxcblx0XHR0aXRsZTogICAgICAgICBsMTBuLmFkZFRvR2FsbGVyeVRpdGxlLFxuXHRcdG11bHRpcGxlOiAgICAgICdhZGQnLFxuXHRcdGZpbHRlcmFibGU6ICAgICd1cGxvYWRlZCcsXG5cdFx0bWVudTogICAgICAgICAgJ2dhbGxlcnknLFxuXHRcdHRvb2xiYXI6ICAgICAgICdnYWxsZXJ5LWFkZCcsXG5cdFx0cHJpb3JpdHk6ICAgICAgMTAwLFxuXHRcdHN5bmNTZWxlY3Rpb246IGZhbHNlXG5cdH0sIExpYnJhcnkucHJvdG90eXBlLmRlZmF1bHRzICksXG5cblx0LyoqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gSWYgYSBsaWJyYXJ5IHdhc24ndCBzdXBwbGllZCwgY3JlYXRlIGEgbGlicmFyeSBvZiBpbWFnZXMuXG5cdFx0aWYgKCAhIHRoaXMuZ2V0KCdsaWJyYXJ5JykgKSB7XG5cdFx0XHR0aGlzLnNldCggJ2xpYnJhcnknLCB3cC5tZWRpYS5xdWVyeSh7IHR5cGU6ICdpbWFnZScgfSkgKTtcblx0XHR9XG5cblx0XHRMaWJyYXJ5LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGxpYnJhcnkgPSB0aGlzLmdldCgnbGlicmFyeScpLFxuXHRcdFx0ZWRpdCAgICA9IHRoaXMuZnJhbWUuc3RhdGUoJ2dhbGxlcnktZWRpdCcpLmdldCgnbGlicmFyeScpO1xuXG5cdFx0aWYgKCB0aGlzLmVkaXRMaWJyYXJ5ICYmIHRoaXMuZWRpdExpYnJhcnkgIT09IGVkaXQgKSB7XG5cdFx0XHRsaWJyYXJ5LnVub2JzZXJ2ZSggdGhpcy5lZGl0TGlicmFyeSApO1xuXHRcdH1cblxuXHRcdC8vIEFjY2VwdHMgYXR0YWNobWVudHMgdGhhdCBleGlzdCBpbiB0aGUgb3JpZ2luYWwgbGlicmFyeSBhbmRcblx0XHQvLyB0aGF0IGRvIG5vdCBleGlzdCBpbiBnYWxsZXJ5J3MgbGlicmFyeS5cblx0XHRsaWJyYXJ5LnZhbGlkYXRvciA9IGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXHRcdFx0cmV0dXJuICEhIHRoaXMubWlycm9yaW5nLmdldCggYXR0YWNobWVudC5jaWQgKSAmJiAhIGVkaXQuZ2V0KCBhdHRhY2htZW50LmNpZCApICYmIFNlbGVjdGlvbi5wcm90b3R5cGUudmFsaWRhdG9yLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHR9O1xuXG5cdFx0Ly8gUmVzZXQgdGhlIGxpYnJhcnkgdG8gZW5zdXJlIHRoYXQgYWxsIGF0dGFjaG1lbnRzIGFyZSByZS1hZGRlZFxuXHRcdC8vIHRvIHRoZSBjb2xsZWN0aW9uLiBEbyBzbyBzaWxlbnRseSwgYXMgY2FsbGluZyBgb2JzZXJ2ZWAgd2lsbFxuXHRcdC8vIHRyaWdnZXIgdGhlIGByZXNldGAgZXZlbnQuXG5cdFx0bGlicmFyeS5yZXNldCggbGlicmFyeS5taXJyb3JpbmcubW9kZWxzLCB7IHNpbGVudDogdHJ1ZSB9KTtcblx0XHRsaWJyYXJ5Lm9ic2VydmUoIGVkaXQgKTtcblx0XHR0aGlzLmVkaXRMaWJyYXJ5ID0gZWRpdDtcblxuXHRcdExpYnJhcnkucHJvdG90eXBlLmFjdGl2YXRlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gR2FsbGVyeUFkZDtcbiIsIi8qZ2xvYmFscyB3cCAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLmNvbnRyb2xsZXIuR2FsbGVyeUVkaXRcbiAqXG4gKiBBIHN0YXRlIGZvciBlZGl0aW5nIGEgZ2FsbGVyeSdzIGltYWdlcyBhbmQgc2V0dGluZ3MuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5XG4gKiBAYXVnbWVudHMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZVxuICogQGF1Z21lbnRzIEJhY2tib25lLk1vZGVsXG4gKlxuICogQHBhcmFtIHtvYmplY3R9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXNdICAgICAgICAgICAgICAgICAgICAgICBUaGUgYXR0cmlidXRlcyBoYXNoIHBhc3NlZCB0byB0aGUgc3RhdGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5pZD1nYWxsZXJ5LWVkaXRdICAgICAgIFVuaXF1ZSBpZGVudGlmaWVyLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMudGl0bGU9RWRpdCBHYWxsZXJ5XSAgICBUaXRsZSBmb3IgdGhlIHN0YXRlLiBEaXNwbGF5cyBpbiB0aGUgZnJhbWUncyB0aXRsZSByZWdpb24uXG4gKiBAcGFyYW0ge3dwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzfSBbYXR0cmlidXRlcy5saWJyYXJ5XSAgICAgICAgICAgICAgIFRoZSBjb2xsZWN0aW9uIG9mIGF0dGFjaG1lbnRzIGluIHRoZSBnYWxsZXJ5LlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJZiBvbmUgaXMgbm90IHN1cHBsaWVkLCBhbiBlbXB0eSBtZWRpYS5tb2RlbC5TZWxlY3Rpb24gY29sbGVjdGlvbiBpcyBjcmVhdGVkLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMubXVsdGlwbGU9ZmFsc2VdICAgICAgICBXaGV0aGVyIG11bHRpLXNlbGVjdCBpcyBlbmFibGVkLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc2VhcmNoYWJsZT1mYWxzZV0gICAgICBXaGV0aGVyIHRoZSBsaWJyYXJ5IGlzIHNlYXJjaGFibGUuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5zb3J0YWJsZT10cnVlXSAgICAgICAgIFdoZXRoZXIgdGhlIEF0dGFjaG1lbnRzIHNob3VsZCBiZSBzb3J0YWJsZS4gRGVwZW5kcyBvbiB0aGUgb3JkZXJieSBwcm9wZXJ0eSBiZWluZyBzZXQgdG8gbWVudU9yZGVyIG9uIHRoZSBhdHRhY2htZW50cyBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuZGF0ZT10cnVlXSAgICAgICAgICAgICBXaGV0aGVyIHRvIHNob3cgdGhlIGRhdGUgZmlsdGVyIGluIHRoZSBicm93c2VyJ3MgdG9vbGJhci5cbiAqIEBwYXJhbSB7c3RyaW5nfGZhbHNlfSAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmNvbnRlbnQ9YnJvd3NlXSAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgY29udGVudCByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ3xmYWxzZX0gICAgICAgICAgICAgICBbYXR0cmlidXRlcy50b29sYmFyPWltYWdlLWRldGFpbHNdIEluaXRpYWwgbW9kZSBmb3IgdGhlIHRvb2xiYXIgcmVnaW9uLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuZGVzY3JpYmU9dHJ1ZV0gICAgICAgICBXaGV0aGVyIHRvIG9mZmVyIFVJIHRvIGRlc2NyaWJlIGF0dGFjaG1lbnRzIC0gZS5nLiBjYXB0aW9uaW5nIGltYWdlcyBpbiBhIGdhbGxlcnkuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5kaXNwbGF5U2V0dGluZ3M9dHJ1ZV0gIFdoZXRoZXIgdG8gc2hvdyB0aGUgYXR0YWNobWVudCBkaXNwbGF5IHNldHRpbmdzIGludGVyZmFjZS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmRyYWdJbmZvPXRydWVdICAgICAgICAgV2hldGhlciB0byBzaG93IGluc3RydWN0aW9uYWwgdGV4dCBhYm91dCB0aGUgYXR0YWNobWVudHMgYmVpbmcgc29ydGFibGUuXG4gKiBAcGFyYW0ge2ludH0gICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5pZGVhbENvbHVtbldpZHRoPTE3MF0gIFRoZSBpZGVhbCBjb2x1bW4gd2lkdGggaW4gcGl4ZWxzIGZvciBhdHRhY2htZW50cy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmVkaXRpbmc9ZmFsc2VdICAgICAgICAgV2hldGhlciB0aGUgZ2FsbGVyeSBpcyBiZWluZyBjcmVhdGVkLCBvciBlZGl0aW5nIGFuIGV4aXN0aW5nIGluc3RhbmNlLlxuICogQHBhcmFtIHtpbnR9ICAgICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMucHJpb3JpdHk9NjBdICAgICAgICAgICBUaGUgcHJpb3JpdHkgZm9yIHRoZSBzdGF0ZSBsaW5rIGluIHRoZSBtZWRpYSBtZW51LlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc3luY1NlbGVjdGlvbj1mYWxzZV0gICBXaGV0aGVyIHRoZSBBdHRhY2htZW50cyBzZWxlY3Rpb24gc2hvdWxkIGJlIHBlcnNpc3RlZCBmcm9tIHRoZSBsYXN0IHN0YXRlLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBEZWZhdWx0cyB0byBmYWxzZSBmb3IgdGhpcyBzdGF0ZSwgYmVjYXVzZSB0aGUgbGlicmFyeSBwYXNzZWQgaW4gICppcyogdGhlIHNlbGVjdGlvbi5cbiAqIEBwYXJhbSB7dmlld30gICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLkF0dGFjaG1lbnRWaWV3XSAgICAgICAgVGhlIHNpbmdsZSBgQXR0YWNobWVudGAgdmlldyB0byBiZSB1c2VkIGluIHRoZSBgQXR0YWNobWVudHNgLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBJZiBub25lIHN1cHBsaWVkLCBkZWZhdWx0cyB0byB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnQuRWRpdExpYnJhcnkuXG4gKi9cbnZhciBMaWJyYXJ5ID0gd3AubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5LFxuXHRsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHRHYWxsZXJ5RWRpdDtcblxuR2FsbGVyeUVkaXQgPSBMaWJyYXJ5LmV4dGVuZCh7XG5cdGRlZmF1bHRzOiB7XG5cdFx0aWQ6ICAgICAgICAgICAgICAgJ2dhbGxlcnktZWRpdCcsXG5cdFx0dGl0bGU6ICAgICAgICAgICAgbDEwbi5lZGl0R2FsbGVyeVRpdGxlLFxuXHRcdG11bHRpcGxlOiAgICAgICAgIGZhbHNlLFxuXHRcdHNlYXJjaGFibGU6ICAgICAgIGZhbHNlLFxuXHRcdHNvcnRhYmxlOiAgICAgICAgIHRydWUsXG5cdFx0ZGF0ZTogICAgICAgICAgICAgZmFsc2UsXG5cdFx0ZGlzcGxheTogICAgICAgICAgZmFsc2UsXG5cdFx0Y29udGVudDogICAgICAgICAgJ2Jyb3dzZScsXG5cdFx0dG9vbGJhcjogICAgICAgICAgJ2dhbGxlcnktZWRpdCcsXG5cdFx0ZGVzY3JpYmU6ICAgICAgICAgdHJ1ZSxcblx0XHRkaXNwbGF5U2V0dGluZ3M6ICB0cnVlLFxuXHRcdGRyYWdJbmZvOiAgICAgICAgIHRydWUsXG5cdFx0aWRlYWxDb2x1bW5XaWR0aDogMTcwLFxuXHRcdGVkaXRpbmc6ICAgICAgICAgIGZhbHNlLFxuXHRcdHByaW9yaXR5OiAgICAgICAgIDYwLFxuXHRcdHN5bmNTZWxlY3Rpb246ICAgIGZhbHNlXG5cdH0sXG5cblx0LyoqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gSWYgd2UgaGF2ZW4ndCBiZWVuIHByb3ZpZGVkIGEgYGxpYnJhcnlgLCBjcmVhdGUgYSBgU2VsZWN0aW9uYC5cblx0XHRpZiAoICEgdGhpcy5nZXQoJ2xpYnJhcnknKSApIHtcblx0XHRcdHRoaXMuc2V0KCAnbGlicmFyeScsIG5ldyB3cC5tZWRpYS5tb2RlbC5TZWxlY3Rpb24oKSApO1xuXHRcdH1cblxuXHRcdC8vIFRoZSBzaW5nbGUgYEF0dGFjaG1lbnRgIHZpZXcgdG8gYmUgdXNlZCBpbiB0aGUgYEF0dGFjaG1lbnRzYCB2aWV3LlxuXHRcdGlmICggISB0aGlzLmdldCgnQXR0YWNobWVudFZpZXcnKSApIHtcblx0XHRcdHRoaXMuc2V0KCAnQXR0YWNobWVudFZpZXcnLCB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnQuRWRpdExpYnJhcnkgKTtcblx0XHR9XG5cblx0XHRMaWJyYXJ5LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGxpYnJhcnkgPSB0aGlzLmdldCgnbGlicmFyeScpO1xuXG5cdFx0Ly8gTGltaXQgdGhlIGxpYnJhcnkgdG8gaW1hZ2VzIG9ubHkuXG5cdFx0bGlicmFyeS5wcm9wcy5zZXQoICd0eXBlJywgJ2ltYWdlJyApO1xuXG5cdFx0Ly8gV2F0Y2ggZm9yIHVwbG9hZGVkIGF0dGFjaG1lbnRzLlxuXHRcdHRoaXMuZ2V0KCdsaWJyYXJ5Jykub2JzZXJ2ZSggd3AuVXBsb2FkZXIucXVldWUgKTtcblxuXHRcdHRoaXMuZnJhbWUub24oICdjb250ZW50OnJlbmRlcjpicm93c2UnLCB0aGlzLmdhbGxlcnlTZXR0aW5ncywgdGhpcyApO1xuXG5cdFx0TGlicmFyeS5wcm90b3R5cGUuYWN0aXZhdGUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIFN0b3Agd2F0Y2hpbmcgZm9yIHVwbG9hZGVkIGF0dGFjaG1lbnRzLlxuXHRcdHRoaXMuZ2V0KCdsaWJyYXJ5JykudW5vYnNlcnZlKCB3cC5VcGxvYWRlci5xdWV1ZSApO1xuXG5cdFx0dGhpcy5mcmFtZS5vZmYoICdjb250ZW50OnJlbmRlcjpicm93c2UnLCB0aGlzLmdhbGxlcnlTZXR0aW5ncywgdGhpcyApO1xuXG5cdFx0TGlicmFyeS5wcm90b3R5cGUuZGVhY3RpdmF0ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKlxuXHQgKiBAcGFyYW0gYnJvd3NlclxuXHQgKi9cblx0Z2FsbGVyeVNldHRpbmdzOiBmdW5jdGlvbiggYnJvd3NlciApIHtcblx0XHRpZiAoICEgdGhpcy5nZXQoJ2Rpc3BsYXlTZXR0aW5ncycpICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBsaWJyYXJ5ID0gdGhpcy5nZXQoJ2xpYnJhcnknKTtcblxuXHRcdGlmICggISBsaWJyYXJ5IHx8ICEgYnJvd3NlciApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRsaWJyYXJ5LmdhbGxlcnkgPSBsaWJyYXJ5LmdhbGxlcnkgfHwgbmV3IEJhY2tib25lLk1vZGVsKCk7XG5cblx0XHRicm93c2VyLnNpZGViYXIuc2V0KHtcblx0XHRcdGdhbGxlcnk6IG5ldyB3cC5tZWRpYS52aWV3LlNldHRpbmdzLkdhbGxlcnkoe1xuXHRcdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0XHRtb2RlbDogICAgICBsaWJyYXJ5LmdhbGxlcnksXG5cdFx0XHRcdHByaW9yaXR5OiAgIDQwXG5cdFx0XHR9KVxuXHRcdH0pO1xuXG5cdFx0YnJvd3Nlci50b29sYmFyLnNldCggJ3JldmVyc2UnLCB7XG5cdFx0XHR0ZXh0OiAgICAgbDEwbi5yZXZlcnNlT3JkZXIsXG5cdFx0XHRwcmlvcml0eTogODAsXG5cblx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0bGlicmFyeS5yZXNldCggbGlicmFyeS50b0FycmF5KCkucmV2ZXJzZSgpICk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEdhbGxlcnlFZGl0O1xuIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEuY29udHJvbGxlci5JbWFnZURldGFpbHNcbiAqXG4gKiBBIHN0YXRlIGZvciBlZGl0aW5nIHRoZSBhdHRhY2htZW50IGRpc3BsYXkgc2V0dGluZ3Mgb2YgYW4gaW1hZ2UgdGhhdCdzIGJlZW5cbiAqIGluc2VydGVkIGludG8gdGhlIGVkaXRvci5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlXG4gKiBAYXVnbWVudHMgQmFja2JvbmUuTW9kZWxcbiAqXG4gKiBAcGFyYW0ge29iamVjdH0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzXSAgICAgICAgICAgICAgICAgICAgICAgVGhlIGF0dHJpYnV0ZXMgaGFzaCBwYXNzZWQgdG8gdGhlIHN0YXRlLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5pZD1pbWFnZS1kZXRhaWxzXSAgICAgIFVuaXF1ZSBpZGVudGlmaWVyLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy50aXRsZT1JbWFnZSBEZXRhaWxzXSAgIFRpdGxlIGZvciB0aGUgc3RhdGUuIERpc3BsYXlzIGluIHRoZSBmcmFtZSdzIHRpdGxlIHJlZ2lvbi5cbiAqIEBwYXJhbSB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudH0gYXR0cmlidXRlcy5pbWFnZSAgICAgICAgICAgICAgICAgICBUaGUgaW1hZ2UncyBtb2RlbC5cbiAqIEBwYXJhbSB7c3RyaW5nfGZhbHNlfSAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuY29udGVudD1pbWFnZS1kZXRhaWxzXSBJbml0aWFsIG1vZGUgZm9yIHRoZSBjb250ZW50IHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfGZhbHNlfSAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMubWVudT1mYWxzZV0gICAgICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSBtZW51IHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfGZhbHNlfSAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMucm91dGVyPWZhbHNlXSAgICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSByb3V0ZXIgcmVnaW9uLlxuICogQHBhcmFtIHtzdHJpbmd8ZmFsc2V9ICAgICAgICAgICAgICBbYXR0cmlidXRlcy50b29sYmFyPWltYWdlLWRldGFpbHNdIEluaXRpYWwgbW9kZSBmb3IgdGhlIHRvb2xiYXIgcmVnaW9uLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5lZGl0aW5nPWZhbHNlXSAgICAgICAgIFVudXNlZC5cbiAqIEBwYXJhbSB7aW50fSAgICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMucHJpb3JpdHk9NjBdICAgICAgICAgICBVbnVzZWQuXG4gKlxuICogQHRvZG8gVGhpcyBzdGF0ZSBpbmhlcml0cyBzb21lIGRlZmF1bHRzIGZyb20gbWVkaWEuY29udHJvbGxlci5MaWJyYXJ5LnByb3RvdHlwZS5kZWZhdWx0cyxcbiAqICAgICAgIGhvd2V2ZXIgdGhpcyBtYXkgbm90IGRvIGFueXRoaW5nLlxuICovXG52YXIgU3RhdGUgPSB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlLFxuXHRMaWJyYXJ5ID0gd3AubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5LFxuXHRsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHRJbWFnZURldGFpbHM7XG5cbkltYWdlRGV0YWlscyA9IFN0YXRlLmV4dGVuZCh7XG5cdGRlZmF1bHRzOiBfLmRlZmF1bHRzKHtcblx0XHRpZDogICAgICAgJ2ltYWdlLWRldGFpbHMnLFxuXHRcdHRpdGxlOiAgICBsMTBuLmltYWdlRGV0YWlsc1RpdGxlLFxuXHRcdGNvbnRlbnQ6ICAnaW1hZ2UtZGV0YWlscycsXG5cdFx0bWVudTogICAgIGZhbHNlLFxuXHRcdHJvdXRlcjogICBmYWxzZSxcblx0XHR0b29sYmFyOiAgJ2ltYWdlLWRldGFpbHMnLFxuXHRcdGVkaXRpbmc6ICBmYWxzZSxcblx0XHRwcmlvcml0eTogNjBcblx0fSwgTGlicmFyeS5wcm90b3R5cGUuZGVmYXVsdHMgKSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuOS4wXG5cdCAqXG5cdCAqIEBwYXJhbSBvcHRpb25zIEF0dHJpYnV0ZXNcblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdHRoaXMuaW1hZ2UgPSBvcHRpb25zLmltYWdlO1xuXHRcdFN0YXRlLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuOS4wXG5cdCAqL1xuXHRhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mcmFtZS5tb2RhbC4kZWwuYWRkQ2xhc3MoJ2ltYWdlLWRldGFpbHMnKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VEZXRhaWxzO1xuIiwiLypnbG9iYWxzIHdwLCBfLCBCYWNrYm9uZSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLmNvbnRyb2xsZXIuTGlicmFyeVxuICpcbiAqIEEgc3RhdGUgZm9yIGNob29zaW5nIGFuIGF0dGFjaG1lbnQgb3IgZ3JvdXAgb2YgYXR0YWNobWVudHMgZnJvbSB0aGUgbWVkaWEgbGlicmFyeS5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlXG4gKiBAYXVnbWVudHMgQmFja2JvbmUuTW9kZWxcbiAqIEBtaXhlcyBtZWRpYS5zZWxlY3Rpb25TeW5jXG4gKlxuICogQHBhcmFtIHtvYmplY3R9ICAgICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlc10gICAgICAgICAgICAgICAgICAgICAgICAgVGhlIGF0dHJpYnV0ZXMgaGFzaCBwYXNzZWQgdG8gdGhlIHN0YXRlLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5pZD1saWJyYXJ5XSAgICAgICAgICAgICAgVW5pcXVlIGlkZW50aWZpZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnRpdGxlPU1lZGlhIGxpYnJhcnldICAgICBUaXRsZSBmb3IgdGhlIHN0YXRlLiBEaXNwbGF5cyBpbiB0aGUgbWVkaWEgbWVudSBhbmQgdGhlIGZyYW1lJ3MgdGl0bGUgcmVnaW9uLlxuICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c30gICAgICBbYXR0cmlidXRlcy5saWJyYXJ5XSAgICAgICAgICAgICAgICAgVGhlIGF0dGFjaG1lbnRzIGNvbGxlY3Rpb24gdG8gYnJvd3NlLlxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSWYgb25lIGlzIG5vdCBzdXBwbGllZCwgYSBjb2xsZWN0aW9uIG9mIGFsbCBhdHRhY2htZW50cyB3aWxsIGJlIGNyZWF0ZWQuXG4gKiBAcGFyYW0ge3dwLm1lZGlhLm1vZGVsLlNlbGVjdGlvbnxvYmplY3R9IFthdHRyaWJ1dGVzLnNlbGVjdGlvbl0gICAgICAgICAgICAgICBBIGNvbGxlY3Rpb24gdG8gY29udGFpbiBhdHRhY2htZW50IHNlbGVjdGlvbnMgd2l0aGluIHRoZSBzdGF0ZS5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIElmIHRoZSAnc2VsZWN0aW9uJyBhdHRyaWJ1dGUgaXMgYSBwbGFpbiBKUyBvYmplY3QsXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhIFNlbGVjdGlvbiB3aWxsIGJlIGNyZWF0ZWQgdXNpbmcgaXRzIHZhbHVlcyBhcyB0aGUgc2VsZWN0aW9uIGluc3RhbmNlJ3MgYHByb3BzYCBtb2RlbC5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE90aGVyd2lzZSwgaXQgd2lsbCBjb3B5IHRoZSBsaWJyYXJ5J3MgYHByb3BzYCBtb2RlbC5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMubXVsdGlwbGU9ZmFsc2VdICAgICAgICAgIFdoZXRoZXIgbXVsdGktc2VsZWN0IGlzIGVuYWJsZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmNvbnRlbnQ9dXBsb2FkXSAgICAgICAgICBJbml0aWFsIG1vZGUgZm9yIHRoZSBjb250ZW50IHJlZ2lvbi5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE92ZXJyaWRkZW4gYnkgcGVyc2lzdGVudCB1c2VyIHNldHRpbmcgaWYgJ2NvbnRlbnRVc2VyU2V0dGluZycgaXMgdHJ1ZS5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMubWVudT1kZWZhdWx0XSAgICAgICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIG1lbnUgcmVnaW9uLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5yb3V0ZXI9YnJvd3NlXSAgICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgcm91dGVyIHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMudG9vbGJhcj1zZWxlY3RdICAgICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIHRvb2xiYXIgcmVnaW9uLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5zZWFyY2hhYmxlPXRydWVdICAgICAgICAgV2hldGhlciB0aGUgbGlicmFyeSBpcyBzZWFyY2hhYmxlLlxuICogQHBhcmFtIHtib29sZWFufHN0cmluZ30gICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5maWx0ZXJhYmxlPWZhbHNlXSAgICAgICAgV2hldGhlciB0aGUgbGlicmFyeSBpcyBmaWx0ZXJhYmxlLCBhbmQgaWYgc28gd2hhdCBmaWx0ZXJzIHNob3VsZCBiZSBzaG93bi5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjY2VwdHMgJ2FsbCcsICd1cGxvYWRlZCcsIG9yICd1bmF0dGFjaGVkJy5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuc29ydGFibGU9dHJ1ZV0gICAgICAgICAgIFdoZXRoZXIgdGhlIEF0dGFjaG1lbnRzIHNob3VsZCBiZSBzb3J0YWJsZS4gRGVwZW5kcyBvbiB0aGUgb3JkZXJieSBwcm9wZXJ0eSBiZWluZyBzZXQgdG8gbWVudU9yZGVyIG9uIHRoZSBhdHRhY2htZW50cyBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5hdXRvU2VsZWN0PXRydWVdICAgICAgICAgV2hldGhlciBhbiB1cGxvYWRlZCBhdHRhY2htZW50IHNob3VsZCBiZSBhdXRvbWF0aWNhbGx5IGFkZGVkIHRvIHRoZSBzZWxlY3Rpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmRlc2NyaWJlPWZhbHNlXSAgICAgICAgICBXaGV0aGVyIHRvIG9mZmVyIFVJIHRvIGRlc2NyaWJlIGF0dGFjaG1lbnRzIC0gZS5nLiBjYXB0aW9uaW5nIGltYWdlcyBpbiBhIGdhbGxlcnkuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLmNvbnRlbnRVc2VyU2V0dGluZz10cnVlXSBXaGV0aGVyIHRoZSBjb250ZW50IHJlZ2lvbidzIG1vZGUgc2hvdWxkIGJlIHNldCBhbmQgcGVyc2lzdGVkIHBlciB1c2VyLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5zeW5jU2VsZWN0aW9uPXRydWVdICAgICAgV2hldGhlciB0aGUgQXR0YWNobWVudHMgc2VsZWN0aW9uIHNob3VsZCBiZSBwZXJzaXN0ZWQgZnJvbSB0aGUgbGFzdCBzdGF0ZS5cbiAqL1xudmFyIGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdGdldFVzZXJTZXR0aW5nID0gd2luZG93LmdldFVzZXJTZXR0aW5nLFxuXHRzZXRVc2VyU2V0dGluZyA9IHdpbmRvdy5zZXRVc2VyU2V0dGluZyxcblx0TGlicmFyeTtcblxuTGlicmFyeSA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGUuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6IHtcblx0XHRpZDogICAgICAgICAgICAgICAgICdsaWJyYXJ5Jyxcblx0XHR0aXRsZTogICAgICAgICAgICAgIGwxMG4ubWVkaWFMaWJyYXJ5VGl0bGUsXG5cdFx0bXVsdGlwbGU6ICAgICAgICAgICBmYWxzZSxcblx0XHRjb250ZW50OiAgICAgICAgICAgICd1cGxvYWQnLFxuXHRcdG1lbnU6ICAgICAgICAgICAgICAgJ2RlZmF1bHQnLFxuXHRcdHJvdXRlcjogICAgICAgICAgICAgJ2Jyb3dzZScsXG5cdFx0dG9vbGJhcjogICAgICAgICAgICAnc2VsZWN0Jyxcblx0XHRzZWFyY2hhYmxlOiAgICAgICAgIHRydWUsXG5cdFx0ZmlsdGVyYWJsZTogICAgICAgICBmYWxzZSxcblx0XHRzb3J0YWJsZTogICAgICAgICAgIHRydWUsXG5cdFx0YXV0b1NlbGVjdDogICAgICAgICB0cnVlLFxuXHRcdGRlc2NyaWJlOiAgICAgICAgICAgZmFsc2UsXG5cdFx0Y29udGVudFVzZXJTZXR0aW5nOiB0cnVlLFxuXHRcdHN5bmNTZWxlY3Rpb246ICAgICAgdHJ1ZVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBJZiBhIGxpYnJhcnkgaXNuJ3QgcHJvdmlkZWQsIHF1ZXJ5IGFsbCBtZWRpYSBpdGVtcy5cblx0ICogSWYgYSBzZWxlY3Rpb24gaW5zdGFuY2UgaXNuJ3QgcHJvdmlkZWQsIGNyZWF0ZSBvbmUuXG5cdCAqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMuZ2V0KCdzZWxlY3Rpb24nKSxcblx0XHRcdHByb3BzO1xuXG5cdFx0aWYgKCAhIHRoaXMuZ2V0KCdsaWJyYXJ5JykgKSB7XG5cdFx0XHR0aGlzLnNldCggJ2xpYnJhcnknLCB3cC5tZWRpYS5xdWVyeSgpICk7XG5cdFx0fVxuXG5cdFx0aWYgKCAhICggc2VsZWN0aW9uIGluc3RhbmNlb2Ygd3AubWVkaWEubW9kZWwuU2VsZWN0aW9uICkgKSB7XG5cdFx0XHRwcm9wcyA9IHNlbGVjdGlvbjtcblxuXHRcdFx0aWYgKCAhIHByb3BzICkge1xuXHRcdFx0XHRwcm9wcyA9IHRoaXMuZ2V0KCdsaWJyYXJ5JykucHJvcHMudG9KU09OKCk7XG5cdFx0XHRcdHByb3BzID0gXy5vbWl0KCBwcm9wcywgJ29yZGVyYnknLCAncXVlcnknICk7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuc2V0KCAnc2VsZWN0aW9uJywgbmV3IHdwLm1lZGlhLm1vZGVsLlNlbGVjdGlvbiggbnVsbCwge1xuXHRcdFx0XHRtdWx0aXBsZTogdGhpcy5nZXQoJ211bHRpcGxlJyksXG5cdFx0XHRcdHByb3BzOiBwcm9wc1xuXHRcdFx0fSkgKTtcblx0XHR9XG5cblx0XHR0aGlzLnJlc2V0RGlzcGxheXMoKTtcblx0fSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5zeW5jU2VsZWN0aW9uKCk7XG5cblx0XHR3cC5VcGxvYWRlci5xdWV1ZS5vbiggJ2FkZCcsIHRoaXMudXBsb2FkaW5nLCB0aGlzICk7XG5cblx0XHR0aGlzLmdldCgnc2VsZWN0aW9uJykub24oICdhZGQgcmVtb3ZlIHJlc2V0JywgdGhpcy5yZWZyZXNoQ29udGVudCwgdGhpcyApO1xuXG5cdFx0aWYgKCB0aGlzLmdldCggJ3JvdXRlcicgKSAmJiB0aGlzLmdldCgnY29udGVudFVzZXJTZXR0aW5nJykgKSB7XG5cdFx0XHR0aGlzLmZyYW1lLm9uKCAnY29udGVudDphY3RpdmF0ZScsIHRoaXMuc2F2ZUNvbnRlbnRNb2RlLCB0aGlzICk7XG5cdFx0XHR0aGlzLnNldCggJ2NvbnRlbnQnLCBnZXRVc2VyU2V0dGluZyggJ2xpYnJhcnlDb250ZW50JywgdGhpcy5nZXQoJ2NvbnRlbnQnKSApICk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdGRlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMucmVjb3JkU2VsZWN0aW9uKCk7XG5cblx0XHR0aGlzLmZyYW1lLm9mZiggJ2NvbnRlbnQ6YWN0aXZhdGUnLCB0aGlzLnNhdmVDb250ZW50TW9kZSwgdGhpcyApO1xuXG5cdFx0Ly8gVW5iaW5kIGFsbCBldmVudCBoYW5kbGVycyB0aGF0IHVzZSB0aGlzIHN0YXRlIGFzIHRoZSBjb250ZXh0XG5cdFx0Ly8gZnJvbSB0aGUgc2VsZWN0aW9uLlxuXHRcdHRoaXMuZ2V0KCdzZWxlY3Rpb24nKS5vZmYoIG51bGwsIG51bGwsIHRoaXMgKTtcblxuXHRcdHdwLlVwbG9hZGVyLnF1ZXVlLm9mZiggbnVsbCwgbnVsbCwgdGhpcyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXNldCB0aGUgbGlicmFyeSB0byBpdHMgaW5pdGlhbCBzdGF0ZS5cblx0ICpcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRyZXNldDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5nZXQoJ3NlbGVjdGlvbicpLnJlc2V0KCk7XG5cdFx0dGhpcy5yZXNldERpc3BsYXlzKCk7XG5cdFx0dGhpcy5yZWZyZXNoQ29udGVudCgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXNldCB0aGUgYXR0YWNobWVudCBkaXNwbGF5IHNldHRpbmdzIGRlZmF1bHRzIHRvIHRoZSBzaXRlIG9wdGlvbnMuXG5cdCAqXG5cdCAqIElmIHNpdGUgb3B0aW9ucyBkb24ndCBkZWZpbmUgdGhlbSwgZmFsbCBiYWNrIHRvIGEgcGVyc2lzdGVudCB1c2VyIHNldHRpbmcuXG5cdCAqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0cmVzZXREaXNwbGF5czogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGRlZmF1bHRQcm9wcyA9IHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MuZGVmYXVsdFByb3BzO1xuXHRcdHRoaXMuX2Rpc3BsYXlzID0gW107XG5cdFx0dGhpcy5fZGVmYXVsdERpc3BsYXlTZXR0aW5ncyA9IHtcblx0XHRcdGFsaWduOiBkZWZhdWx0UHJvcHMuYWxpZ24gfHwgZ2V0VXNlclNldHRpbmcoICdhbGlnbicsICdub25lJyApLFxuXHRcdFx0c2l6ZTogIGRlZmF1bHRQcm9wcy5zaXplICB8fCBnZXRVc2VyU2V0dGluZyggJ2ltZ3NpemUnLCAnbWVkaXVtJyApLFxuXHRcdFx0bGluazogIGRlZmF1bHRQcm9wcy5saW5rICB8fCBnZXRVc2VyU2V0dGluZyggJ3VybGJ1dHRvbicsICdmaWxlJyApXG5cdFx0fTtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIGEgbW9kZWwgdG8gcmVwcmVzZW50IGRpc3BsYXkgc2V0dGluZ3MgKGFsaWdubWVudCwgZXRjLikgZm9yIGFuIGF0dGFjaG1lbnQuXG5cdCAqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKlxuXHQgKiBAcGFyYW0ge3dwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnR9IGF0dGFjaG1lbnRcblx0ICogQHJldHVybnMge0JhY2tib25lLk1vZGVsfVxuXHQgKi9cblx0ZGlzcGxheTogZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cdFx0dmFyIGRpc3BsYXlzID0gdGhpcy5fZGlzcGxheXM7XG5cblx0XHRpZiAoICEgZGlzcGxheXNbIGF0dGFjaG1lbnQuY2lkIF0gKSB7XG5cdFx0XHRkaXNwbGF5c1sgYXR0YWNobWVudC5jaWQgXSA9IG5ldyBCYWNrYm9uZS5Nb2RlbCggdGhpcy5kZWZhdWx0RGlzcGxheVNldHRpbmdzKCBhdHRhY2htZW50ICkgKTtcblx0XHR9XG5cdFx0cmV0dXJuIGRpc3BsYXlzWyBhdHRhY2htZW50LmNpZCBdO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHaXZlbiBhbiBhdHRhY2htZW50LCBjcmVhdGUgYXR0YWNobWVudCBkaXNwbGF5IHNldHRpbmdzIHByb3BlcnRpZXMuXG5cdCAqXG5cdCAqIEBzaW5jZSAzLjYuMFxuXHQgKlxuXHQgKiBAcGFyYW0ge3dwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnR9IGF0dGFjaG1lbnRcblx0ICogQHJldHVybnMge09iamVjdH1cblx0ICovXG5cdGRlZmF1bHREaXNwbGF5U2V0dGluZ3M6IGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXHRcdHZhciBzZXR0aW5ncyA9IHRoaXMuX2RlZmF1bHREaXNwbGF5U2V0dGluZ3M7XG5cdFx0aWYgKCBzZXR0aW5ncy5jYW5FbWJlZCA9IHRoaXMuY2FuRW1iZWQoIGF0dGFjaG1lbnQgKSApIHtcblx0XHRcdHNldHRpbmdzLmxpbmsgPSAnZW1iZWQnO1xuXHRcdH1cblx0XHRyZXR1cm4gc2V0dGluZ3M7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFdoZXRoZXIgYW4gYXR0YWNobWVudCBjYW4gYmUgZW1iZWRkZWQgKGF1ZGlvIG9yIHZpZGVvKS5cblx0ICpcblx0ICogQHNpbmNlIDMuNi4wXG5cdCAqXG5cdCAqIEBwYXJhbSB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudH0gYXR0YWNobWVudFxuXHQgKiBAcmV0dXJucyB7Qm9vbGVhbn1cblx0ICovXG5cdGNhbkVtYmVkOiBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblx0XHQvLyBJZiB1cGxvYWRpbmcsIHdlIGtub3cgdGhlIGZpbGVuYW1lIGJ1dCBub3QgdGhlIG1pbWUgdHlwZS5cblx0XHRpZiAoICEgYXR0YWNobWVudC5nZXQoJ3VwbG9hZGluZycpICkge1xuXHRcdFx0dmFyIHR5cGUgPSBhdHRhY2htZW50LmdldCgndHlwZScpO1xuXHRcdFx0aWYgKCB0eXBlICE9PSAnYXVkaW8nICYmIHR5cGUgIT09ICd2aWRlbycgKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gXy5jb250YWlucyggd3AubWVkaWEudmlldy5zZXR0aW5ncy5lbWJlZEV4dHMsIGF0dGFjaG1lbnQuZ2V0KCdmaWxlbmFtZScpLnNwbGl0KCcuJykucG9wKCkgKTtcblx0fSxcblxuXG5cdC8qKlxuXHQgKiBJZiB0aGUgc3RhdGUgaXMgYWN0aXZlLCBubyBpdGVtcyBhcmUgc2VsZWN0ZWQsIGFuZCB0aGUgY3VycmVudFxuXHQgKiBjb250ZW50IG1vZGUgaXMgbm90IGFuIG9wdGlvbiBpbiB0aGUgc3RhdGUncyByb3V0ZXIgKHByb3ZpZGVkXG5cdCAqIHRoZSBzdGF0ZSBoYXMgYSByb3V0ZXIpLCByZXNldCB0aGUgY29udGVudCBtb2RlIHRvIHRoZSBkZWZhdWx0LlxuXHQgKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdHJlZnJlc2hDb250ZW50OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5nZXQoJ3NlbGVjdGlvbicpLFxuXHRcdFx0ZnJhbWUgPSB0aGlzLmZyYW1lLFxuXHRcdFx0cm91dGVyID0gZnJhbWUucm91dGVyLmdldCgpLFxuXHRcdFx0bW9kZSA9IGZyYW1lLmNvbnRlbnQubW9kZSgpO1xuXG5cdFx0aWYgKCB0aGlzLmFjdGl2ZSAmJiAhIHNlbGVjdGlvbi5sZW5ndGggJiYgcm91dGVyICYmICEgcm91dGVyLmdldCggbW9kZSApICkge1xuXHRcdFx0dGhpcy5mcmFtZS5jb250ZW50LnJlbmRlciggdGhpcy5nZXQoJ2NvbnRlbnQnKSApO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogQ2FsbGJhY2sgaGFuZGxlciB3aGVuIGFuIGF0dGFjaG1lbnQgaXMgdXBsb2FkZWQuXG5cdCAqXG5cdCAqIFN3aXRjaCB0byB0aGUgTWVkaWEgTGlicmFyeSBpZiB1cGxvYWRlZCBmcm9tIHRoZSAnVXBsb2FkIEZpbGVzJyB0YWIuXG5cdCAqXG5cdCAqIEFkZHMgYW55IHVwbG9hZGluZyBhdHRhY2htZW50cyB0byB0aGUgc2VsZWN0aW9uLlxuXHQgKlxuXHQgKiBJZiB0aGUgc3RhdGUgb25seSBzdXBwb3J0cyBvbmUgYXR0YWNobWVudCB0byBiZSBzZWxlY3RlZCBhbmQgbXVsdGlwbGVcblx0ICogYXR0YWNobWVudHMgYXJlIHVwbG9hZGVkLCB0aGUgbGFzdCBhdHRhY2htZW50IGluIHRoZSB1cGxvYWQgcXVldWUgd2lsbFxuXHQgKiBiZSBzZWxlY3RlZC5cblx0ICpcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqXG5cdCAqIEBwYXJhbSB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudH0gYXR0YWNobWVudFxuXHQgKi9cblx0dXBsb2FkaW5nOiBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblx0XHR2YXIgY29udGVudCA9IHRoaXMuZnJhbWUuY29udGVudDtcblxuXHRcdGlmICggJ3VwbG9hZCcgPT09IGNvbnRlbnQubW9kZSgpICkge1xuXHRcdFx0dGhpcy5mcmFtZS5jb250ZW50Lm1vZGUoJ2Jyb3dzZScpO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5nZXQoICdhdXRvU2VsZWN0JyApICkge1xuXHRcdFx0dGhpcy5nZXQoJ3NlbGVjdGlvbicpLmFkZCggYXR0YWNobWVudCApO1xuXHRcdFx0dGhpcy5mcmFtZS50cmlnZ2VyKCAnbGlicmFyeTpzZWxlY3Rpb246YWRkJyApO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogUGVyc2lzdCB0aGUgbW9kZSBvZiB0aGUgY29udGVudCByZWdpb24gYXMgYSB1c2VyIHNldHRpbmcuXG5cdCAqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0c2F2ZUNvbnRlbnRNb2RlOiBmdW5jdGlvbigpIHtcblx0XHRpZiAoICdicm93c2UnICE9PSB0aGlzLmdldCgncm91dGVyJykgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dmFyIG1vZGUgPSB0aGlzLmZyYW1lLmNvbnRlbnQubW9kZSgpLFxuXHRcdFx0dmlldyA9IHRoaXMuZnJhbWUucm91dGVyLmdldCgpO1xuXG5cdFx0aWYgKCB2aWV3ICYmIHZpZXcuZ2V0KCBtb2RlICkgKSB7XG5cdFx0XHRzZXRVc2VyU2V0dGluZyggJ2xpYnJhcnlDb250ZW50JywgbW9kZSApO1xuXHRcdH1cblx0fVxufSk7XG5cbi8vIE1ha2Ugc2VsZWN0aW9uU3luYyBhdmFpbGFibGUgb24gYW55IE1lZGlhIExpYnJhcnkgc3RhdGUuXG5fLmV4dGVuZCggTGlicmFyeS5wcm90b3R5cGUsIHdwLm1lZGlhLnNlbGVjdGlvblN5bmMgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBMaWJyYXJ5O1xuIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEuY29udHJvbGxlci5NZWRpYUxpYnJhcnlcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5jb250cm9sbGVyLkxpYnJhcnlcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlXG4gKiBAYXVnbWVudHMgQmFja2JvbmUuTW9kZWxcbiAqL1xudmFyIExpYnJhcnkgPSB3cC5tZWRpYS5jb250cm9sbGVyLkxpYnJhcnksXG5cdE1lZGlhTGlicmFyeTtcblxuTWVkaWFMaWJyYXJ5ID0gTGlicmFyeS5leHRlbmQoe1xuXHRkZWZhdWx0czogXy5kZWZhdWx0cyh7XG5cdFx0Ly8gQXR0YWNobWVudHMgYnJvd3NlciBkZWZhdWx0cy4gQHNlZSBtZWRpYS52aWV3LkF0dGFjaG1lbnRzQnJvd3NlclxuXHRcdGZpbHRlcmFibGU6ICAgICAgJ3VwbG9hZGVkJyxcblxuXHRcdGRpc3BsYXlTZXR0aW5nczogZmFsc2UsXG5cdFx0cHJpb3JpdHk6ICAgICAgICA4MCxcblx0XHRzeW5jU2VsZWN0aW9uOiAgIGZhbHNlXG5cdH0sIExpYnJhcnkucHJvdG90eXBlLmRlZmF1bHRzICksXG5cblx0LyoqXG5cdCAqIEBzaW5jZSAzLjkuMFxuXHQgKlxuXHQgKiBAcGFyYW0gb3B0aW9uc1xuXHQgKi9cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0dGhpcy5tZWRpYSA9IG9wdGlvbnMubWVkaWE7XG5cdFx0dGhpcy50eXBlID0gb3B0aW9ucy50eXBlO1xuXHRcdHRoaXMuc2V0KCAnbGlicmFyeScsIHdwLm1lZGlhLnF1ZXJ5KHsgdHlwZTogdGhpcy50eXBlIH0pICk7XG5cblx0XHRMaWJyYXJ5LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHQvKipcblx0ICogQHNpbmNlIDMuOS4wXG5cdCAqL1xuXHRhY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gQHRvZG8gdGhpcyBzaG91bGQgdXNlIHRoaXMuZnJhbWUuXG5cdFx0aWYgKCB3cC5tZWRpYS5mcmFtZS5sYXN0TWltZSApIHtcblx0XHRcdHRoaXMuc2V0KCAnbGlicmFyeScsIHdwLm1lZGlhLnF1ZXJ5KHsgdHlwZTogd3AubWVkaWEuZnJhbWUubGFzdE1pbWUgfSkgKTtcblx0XHRcdGRlbGV0ZSB3cC5tZWRpYS5mcmFtZS5sYXN0TWltZTtcblx0XHR9XG5cdFx0TGlicmFyeS5wcm90b3R5cGUuYWN0aXZhdGUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNZWRpYUxpYnJhcnk7XG4iLCIvKmdsb2JhbHMgQmFja2JvbmUsIF8gKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5jb250cm9sbGVyLlJlZ2lvblxuICpcbiAqIEEgcmVnaW9uIGlzIGEgcGVyc2lzdGVudCBhcHBsaWNhdGlvbiBsYXlvdXQgYXJlYS5cbiAqXG4gKiBBIHJlZ2lvbiBhc3N1bWVzIG9uZSBtb2RlIGF0IGFueSB0aW1lLCBhbmQgY2FuIGJlIHN3aXRjaGVkIHRvIGFub3RoZXIuXG4gKlxuICogV2hlbiBtb2RlIGNoYW5nZXMsIGV2ZW50cyBhcmUgdHJpZ2dlcmVkIG9uIHRoZSByZWdpb24ncyBwYXJlbnQgdmlldy5cbiAqIFRoZSBwYXJlbnQgdmlldyB3aWxsIGxpc3RlbiB0byBzcGVjaWZpYyBldmVudHMgYW5kIGZpbGwgdGhlIHJlZ2lvbiB3aXRoIGFuXG4gKiBhcHByb3ByaWF0ZSB2aWV3IGRlcGVuZGluZyBvbiBtb2RlLiBGb3IgZXhhbXBsZSwgYSBmcmFtZSBsaXN0ZW5zIGZvciB0aGVcbiAqICdicm93c2UnIG1vZGUgdCBiZSBhY3RpdmF0ZWQgb24gdGhlICdjb250ZW50JyB2aWV3IGFuZCB0aGVuIGZpbGxzIHRoZSByZWdpb25cbiAqIHdpdGggYW4gQXR0YWNobWVudHNCcm93c2VyIHZpZXcuXG4gKlxuICogQGNsYXNzXG4gKlxuICogQHBhcmFtIHtvYmplY3R9ICAgICAgICBvcHRpb25zICAgICAgICAgIE9wdGlvbnMgaGFzaCBmb3IgdGhlIHJlZ2lvbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgb3B0aW9ucy5pZCAgICAgICBVbmlxdWUgaWRlbnRpZmllciBmb3IgdGhlIHJlZ2lvbi5cbiAqIEBwYXJhbSB7QmFja2JvbmUuVmlld30gb3B0aW9ucy52aWV3ICAgICBBIHBhcmVudCB2aWV3IHRoZSByZWdpb24gZXhpc3RzIHdpdGhpbi5cbiAqIEBwYXJhbSB7c3RyaW5nfSAgICAgICAgb3B0aW9ucy5zZWxlY3RvciBqUXVlcnkgc2VsZWN0b3IgZm9yIHRoZSByZWdpb24gd2l0aGluIHRoZSBwYXJlbnQgdmlldy5cbiAqL1xudmFyIFJlZ2lvbiA9IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRfLmV4dGVuZCggdGhpcywgXy5waWNrKCBvcHRpb25zIHx8IHt9LCAnaWQnLCAndmlldycsICdzZWxlY3RvcicgKSApO1xufTtcblxuLy8gVXNlIEJhY2tib25lJ3Mgc2VsZi1wcm9wYWdhdGluZyBgZXh0ZW5kYCBpbmhlcml0YW5jZSBtZXRob2QuXG5SZWdpb24uZXh0ZW5kID0gQmFja2JvbmUuTW9kZWwuZXh0ZW5kO1xuXG5fLmV4dGVuZCggUmVnaW9uLnByb3RvdHlwZSwge1xuXHQvKipcblx0ICogQWN0aXZhdGUgYSBtb2RlLlxuXHQgKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICpcblx0ICogQHBhcmFtIHtzdHJpbmd9IG1vZGVcblx0ICpcblx0ICogQGZpcmVzIHRoaXMudmlldyN7dGhpcy5pZH06YWN0aXZhdGU6e3RoaXMuX21vZGV9XG5cdCAqIEBmaXJlcyB0aGlzLnZpZXcje3RoaXMuaWR9OmFjdGl2YXRlXG5cdCAqIEBmaXJlcyB0aGlzLnZpZXcje3RoaXMuaWR9OmRlYWN0aXZhdGU6e3RoaXMuX21vZGV9XG5cdCAqIEBmaXJlcyB0aGlzLnZpZXcje3RoaXMuaWR9OmRlYWN0aXZhdGVcblx0ICpcblx0ICogQHJldHVybnMge3dwLm1lZGlhLmNvbnRyb2xsZXIuUmVnaW9ufSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZy5cblx0ICovXG5cdG1vZGU6IGZ1bmN0aW9uKCBtb2RlICkge1xuXHRcdGlmICggISBtb2RlICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX21vZGU7XG5cdFx0fVxuXHRcdC8vIEJhaWwgaWYgd2UncmUgdHJ5aW5nIHRvIGNoYW5nZSB0byB0aGUgY3VycmVudCBtb2RlLlxuXHRcdGlmICggbW9kZSA9PT0gdGhpcy5fbW9kZSApIHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFJlZ2lvbiBtb2RlIGRlYWN0aXZhdGlvbiBldmVudC5cblx0XHQgKlxuXHRcdCAqIEBldmVudCB0aGlzLnZpZXcje3RoaXMuaWR9OmRlYWN0aXZhdGU6e3RoaXMuX21vZGV9XG5cdFx0ICogQGV2ZW50IHRoaXMudmlldyN7dGhpcy5pZH06ZGVhY3RpdmF0ZVxuXHRcdCAqL1xuXHRcdHRoaXMudHJpZ2dlcignZGVhY3RpdmF0ZScpO1xuXG5cdFx0dGhpcy5fbW9kZSA9IG1vZGU7XG5cdFx0dGhpcy5yZW5kZXIoIG1vZGUgKTtcblxuXHRcdC8qKlxuXHRcdCAqIFJlZ2lvbiBtb2RlIGFjdGl2YXRpb24gZXZlbnQuXG5cdFx0ICpcblx0XHQgKiBAZXZlbnQgdGhpcy52aWV3I3t0aGlzLmlkfTphY3RpdmF0ZTp7dGhpcy5fbW9kZX1cblx0XHQgKiBAZXZlbnQgdGhpcy52aWV3I3t0aGlzLmlkfTphY3RpdmF0ZVxuXHRcdCAqL1xuXHRcdHRoaXMudHJpZ2dlcignYWN0aXZhdGUnKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0LyoqXG5cdCAqIFJlbmRlciBhIG1vZGUuXG5cdCAqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gbW9kZVxuXHQgKlxuXHQgKiBAZmlyZXMgdGhpcy52aWV3I3t0aGlzLmlkfTpjcmVhdGU6e3RoaXMuX21vZGV9XG5cdCAqIEBmaXJlcyB0aGlzLnZpZXcje3RoaXMuaWR9OmNyZWF0ZVxuXHQgKiBAZmlyZXMgdGhpcy52aWV3I3t0aGlzLmlkfTpyZW5kZXI6e3RoaXMuX21vZGV9XG5cdCAqIEBmaXJlcyB0aGlzLnZpZXcje3RoaXMuaWR9OnJlbmRlclxuXHQgKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEuY29udHJvbGxlci5SZWdpb259IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRyZW5kZXI6IGZ1bmN0aW9uKCBtb2RlICkge1xuXHRcdC8vIElmIHRoZSBtb2RlIGlzbid0IGFjdGl2ZSwgYWN0aXZhdGUgaXQuXG5cdFx0aWYgKCBtb2RlICYmIG1vZGUgIT09IHRoaXMuX21vZGUgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5tb2RlKCBtb2RlICk7XG5cdFx0fVxuXG5cdFx0dmFyIHNldCA9IHsgdmlldzogbnVsbCB9LFxuXHRcdFx0dmlldztcblxuXHRcdC8qKlxuXHRcdCAqIENyZWF0ZSByZWdpb24gdmlldyBldmVudC5cblx0XHQgKlxuXHRcdCAqIFJlZ2lvbiB2aWV3IGNyZWF0aW9uIHRha2VzIHBsYWNlIGluIGFuIGV2ZW50IGNhbGxiYWNrIG9uIHRoZSBmcmFtZS5cblx0XHQgKlxuXHRcdCAqIEBldmVudCB0aGlzLnZpZXcje3RoaXMuaWR9OmNyZWF0ZTp7dGhpcy5fbW9kZX1cblx0XHQgKiBAZXZlbnQgdGhpcy52aWV3I3t0aGlzLmlkfTpjcmVhdGVcblx0XHQgKi9cblx0XHR0aGlzLnRyaWdnZXIoICdjcmVhdGUnLCBzZXQgKTtcblx0XHR2aWV3ID0gc2V0LnZpZXc7XG5cblx0XHQvKipcblx0XHQgKiBSZW5kZXIgcmVnaW9uIHZpZXcgZXZlbnQuXG5cdFx0ICpcblx0XHQgKiBSZWdpb24gdmlldyBjcmVhdGlvbiB0YWtlcyBwbGFjZSBpbiBhbiBldmVudCBjYWxsYmFjayBvbiB0aGUgZnJhbWUuXG5cdFx0ICpcblx0XHQgKiBAZXZlbnQgdGhpcy52aWV3I3t0aGlzLmlkfTpjcmVhdGU6e3RoaXMuX21vZGV9XG5cdFx0ICogQGV2ZW50IHRoaXMudmlldyN7dGhpcy5pZH06Y3JlYXRlXG5cdFx0ICovXG5cdFx0dGhpcy50cmlnZ2VyKCAncmVuZGVyJywgdmlldyApO1xuXHRcdGlmICggdmlldyApIHtcblx0XHRcdHRoaXMuc2V0KCB2aWV3ICk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIHJlZ2lvbidzIHZpZXcuXG5cdCAqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEuVmlld31cblx0ICovXG5cdGdldDogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMudmlldy52aWV3cy5maXJzdCggdGhpcy5zZWxlY3RvciApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTZXQgdGhlIHJlZ2lvbidzIHZpZXcgYXMgYSBzdWJ2aWV3IG9mIHRoZSBmcmFtZS5cblx0ICpcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl8T2JqZWN0fSB2aWV3c1xuXHQgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG5cdCAqIEByZXR1cm5zIHt3cC5CYWNrYm9uZS5TdWJ2aWV3c30gU3Vidmlld3MgaXMgcmV0dXJuZWQgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHNldDogZnVuY3Rpb24oIHZpZXdzLCBvcHRpb25zICkge1xuXHRcdGlmICggb3B0aW9ucyApIHtcblx0XHRcdG9wdGlvbnMuYWRkID0gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLnZpZXcudmlld3Muc2V0KCB0aGlzLnNlbGVjdG9yLCB2aWV3cywgb3B0aW9ucyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUcmlnZ2VyIHJlZ2lvbmFsIHZpZXcgZXZlbnRzIG9uIHRoZSBmcmFtZS5cblx0ICpcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBldmVudFxuXHQgKiBAcmV0dXJucyB7dW5kZWZpbmVkfHdwLm1lZGlhLmNvbnRyb2xsZXIuUmVnaW9ufSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZy5cblx0ICovXG5cdHRyaWdnZXI6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR2YXIgYmFzZSwgYXJncztcblxuXHRcdGlmICggISB0aGlzLl9tb2RlICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGFyZ3MgPSBfLnRvQXJyYXkoIGFyZ3VtZW50cyApO1xuXHRcdGJhc2UgPSB0aGlzLmlkICsgJzonICsgZXZlbnQ7XG5cblx0XHQvLyBUcmlnZ2VyIGB7dGhpcy5pZH06e2V2ZW50fTp7dGhpcy5fbW9kZX1gIGV2ZW50IG9uIHRoZSBmcmFtZS5cblx0XHRhcmdzWzBdID0gYmFzZSArICc6JyArIHRoaXMuX21vZGU7XG5cdFx0dGhpcy52aWV3LnRyaWdnZXIuYXBwbHkoIHRoaXMudmlldywgYXJncyApO1xuXG5cdFx0Ly8gVHJpZ2dlciBge3RoaXMuaWR9OntldmVudH1gIGV2ZW50IG9uIHRoZSBmcmFtZS5cblx0XHRhcmdzWzBdID0gYmFzZTtcblx0XHR0aGlzLnZpZXcudHJpZ2dlci5hcHBseSggdGhpcy52aWV3LCBhcmdzICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlZ2lvbjtcbiIsIi8qZ2xvYmFscyB3cCwgXyAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLmNvbnRyb2xsZXIuUmVwbGFjZUltYWdlXG4gKlxuICogQSBzdGF0ZSBmb3IgcmVwbGFjaW5nIGFuIGltYWdlLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuTGlicmFyeVxuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5Nb2RlbFxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSAgICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzXSAgICAgICAgICAgICAgICAgICAgICAgICBUaGUgYXR0cmlidXRlcyBoYXNoIHBhc3NlZCB0byB0aGUgc3RhdGUuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5pZD1yZXBsYWNlLWltYWdlXSAgICAgICAgVW5pcXVlIGlkZW50aWZpZXIuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy50aXRsZT1SZXBsYWNlIEltYWdlXSAgICAgVGl0bGUgZm9yIHRoZSBzdGF0ZS4gRGlzcGxheXMgaW4gdGhlIG1lZGlhIG1lbnUgYW5kIHRoZSBmcmFtZSdzIHRpdGxlIHJlZ2lvbi5cbiAqIEBwYXJhbSB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudHN9IFthdHRyaWJ1dGVzLmxpYnJhcnldICAgICAgICAgICAgICAgICBUaGUgYXR0YWNobWVudHMgY29sbGVjdGlvbiB0byBicm93c2UuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgSWYgb25lIGlzIG5vdCBzdXBwbGllZCwgYSBjb2xsZWN0aW9uIG9mIGFsbCBpbWFnZXMgd2lsbCBiZSBjcmVhdGVkLlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMubXVsdGlwbGU9ZmFsc2VdICAgICAgICAgIFdoZXRoZXIgbXVsdGktc2VsZWN0IGlzIGVuYWJsZWQuXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5jb250ZW50PXVwbG9hZF0gICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgY29udGVudCByZWdpb24uXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgT3ZlcnJpZGRlbiBieSBwZXJzaXN0ZW50IHVzZXIgc2V0dGluZyBpZiAnY29udGVudFVzZXJTZXR0aW5nJyBpcyB0cnVlLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMubWVudT1kZWZhdWx0XSAgICAgICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIG1lbnUgcmVnaW9uLlxuICogQHBhcmFtIHtzdHJpbmd9ICAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMucm91dGVyPWJyb3dzZV0gICAgICAgICAgIEluaXRpYWwgbW9kZSBmb3IgdGhlIHJvdXRlciByZWdpb24uXG4gKiBAcGFyYW0ge3N0cmluZ30gICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy50b29sYmFyPXJlcGxhY2VdICAgICAgICAgSW5pdGlhbCBtb2RlIGZvciB0aGUgdG9vbGJhciByZWdpb24uXG4gKiBAcGFyYW0ge2ludH0gICAgICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5wcmlvcml0eT02MF0gICAgICAgICAgICAgVGhlIHByaW9yaXR5IGZvciB0aGUgc3RhdGUgbGluayBpbiB0aGUgbWVkaWEgbWVudS5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgICAgICAgICAgICAgIFthdHRyaWJ1dGVzLnNlYXJjaGFibGU9dHJ1ZV0gICAgICAgICBXaGV0aGVyIHRoZSBsaWJyYXJ5IGlzIHNlYXJjaGFibGUuXG4gKiBAcGFyYW0ge2Jvb2xlYW58c3RyaW5nfSAgICAgICAgICAgICBbYXR0cmlidXRlcy5maWx0ZXJhYmxlPXVwbG9hZGVkXSAgICAgV2hldGhlciB0aGUgbGlicmFyeSBpcyBmaWx0ZXJhYmxlLCBhbmQgaWYgc28gd2hhdCBmaWx0ZXJzIHNob3VsZCBiZSBzaG93bi5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBY2NlcHRzICdhbGwnLCAndXBsb2FkZWQnLCBvciAndW5hdHRhY2hlZCcuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5zb3J0YWJsZT10cnVlXSAgICAgICAgICAgV2hldGhlciB0aGUgQXR0YWNobWVudHMgc2hvdWxkIGJlIHNvcnRhYmxlLiBEZXBlbmRzIG9uIHRoZSBvcmRlcmJ5IHByb3BlcnR5IGJlaW5nIHNldCB0byBtZW51T3JkZXIgb24gdGhlIGF0dGFjaG1lbnRzIGNvbGxlY3Rpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5hdXRvU2VsZWN0PXRydWVdICAgICAgICAgV2hldGhlciBhbiB1cGxvYWRlZCBhdHRhY2htZW50IHNob3VsZCBiZSBhdXRvbWF0aWNhbGx5IGFkZGVkIHRvIHRoZSBzZWxlY3Rpb24uXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5kZXNjcmliZT1mYWxzZV0gICAgICAgICAgV2hldGhlciB0byBvZmZlciBVSSB0byBkZXNjcmliZSBhdHRhY2htZW50cyAtIGUuZy4gY2FwdGlvbmluZyBpbWFnZXMgaW4gYSBnYWxsZXJ5LlxuICogQHBhcmFtIHtib29sZWFufSAgICAgICAgICAgICAgICAgICAgW2F0dHJpYnV0ZXMuY29udGVudFVzZXJTZXR0aW5nPXRydWVdIFdoZXRoZXIgdGhlIGNvbnRlbnQgcmVnaW9uJ3MgbW9kZSBzaG91bGQgYmUgc2V0IGFuZCBwZXJzaXN0ZWQgcGVyIHVzZXIuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICAgICAgICAgICAgICBbYXR0cmlidXRlcy5zeW5jU2VsZWN0aW9uPXRydWVdICAgICAgV2hldGhlciB0aGUgQXR0YWNobWVudHMgc2VsZWN0aW9uIHNob3VsZCBiZSBwZXJzaXN0ZWQgZnJvbSB0aGUgbGFzdCBzdGF0ZS5cbiAqL1xudmFyIExpYnJhcnkgPSB3cC5tZWRpYS5jb250cm9sbGVyLkxpYnJhcnksXG5cdGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdFJlcGxhY2VJbWFnZTtcblxuUmVwbGFjZUltYWdlID0gTGlicmFyeS5leHRlbmQoe1xuXHRkZWZhdWx0czogXy5kZWZhdWx0cyh7XG5cdFx0aWQ6ICAgICAgICAgICAgJ3JlcGxhY2UtaW1hZ2UnLFxuXHRcdHRpdGxlOiAgICAgICAgIGwxMG4ucmVwbGFjZUltYWdlVGl0bGUsXG5cdFx0bXVsdGlwbGU6ICAgICAgZmFsc2UsXG5cdFx0ZmlsdGVyYWJsZTogICAgJ3VwbG9hZGVkJyxcblx0XHR0b29sYmFyOiAgICAgICAncmVwbGFjZScsXG5cdFx0bWVudTogICAgICAgICAgZmFsc2UsXG5cdFx0cHJpb3JpdHk6ICAgICAgNjAsXG5cdFx0c3luY1NlbGVjdGlvbjogdHJ1ZVxuXHR9LCBMaWJyYXJ5LnByb3RvdHlwZS5kZWZhdWx0cyApLFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy45LjBcblx0ICpcblx0ICogQHBhcmFtIG9wdGlvbnNcblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdHZhciBsaWJyYXJ5LCBjb21wYXJhdG9yO1xuXG5cdFx0dGhpcy5pbWFnZSA9IG9wdGlvbnMuaW1hZ2U7XG5cdFx0Ly8gSWYgd2UgaGF2ZW4ndCBiZWVuIHByb3ZpZGVkIGEgYGxpYnJhcnlgLCBjcmVhdGUgYSBgU2VsZWN0aW9uYC5cblx0XHRpZiAoICEgdGhpcy5nZXQoJ2xpYnJhcnknKSApIHtcblx0XHRcdHRoaXMuc2V0KCAnbGlicmFyeScsIHdwLm1lZGlhLnF1ZXJ5KHsgdHlwZTogJ2ltYWdlJyB9KSApO1xuXHRcdH1cblxuXHRcdExpYnJhcnkucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0bGlicmFyeSAgICA9IHRoaXMuZ2V0KCdsaWJyYXJ5Jyk7XG5cdFx0Y29tcGFyYXRvciA9IGxpYnJhcnkuY29tcGFyYXRvcjtcblxuXHRcdC8vIE92ZXJsb2FkIHRoZSBsaWJyYXJ5J3MgY29tcGFyYXRvciB0byBwdXNoIGl0ZW1zIHRoYXQgYXJlIG5vdCBpblxuXHRcdC8vIHRoZSBtaXJyb3JlZCBxdWVyeSB0byB0aGUgZnJvbnQgb2YgdGhlIGFnZ3JlZ2F0ZSBjb2xsZWN0aW9uLlxuXHRcdGxpYnJhcnkuY29tcGFyYXRvciA9IGZ1bmN0aW9uKCBhLCBiICkge1xuXHRcdFx0dmFyIGFJblF1ZXJ5ID0gISEgdGhpcy5taXJyb3JpbmcuZ2V0KCBhLmNpZCApLFxuXHRcdFx0XHRiSW5RdWVyeSA9ICEhIHRoaXMubWlycm9yaW5nLmdldCggYi5jaWQgKTtcblxuXHRcdFx0aWYgKCAhIGFJblF1ZXJ5ICYmIGJJblF1ZXJ5ICkge1xuXHRcdFx0XHRyZXR1cm4gLTE7XG5cdFx0XHR9IGVsc2UgaWYgKCBhSW5RdWVyeSAmJiAhIGJJblF1ZXJ5ICkge1xuXHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBjb21wYXJhdG9yLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Ly8gQWRkIGFsbCBpdGVtcyBpbiB0aGUgc2VsZWN0aW9uIHRvIHRoZSBsaWJyYXJ5LCBzbyBhbnkgZmVhdHVyZWRcblx0XHQvLyBpbWFnZXMgdGhhdCBhcmUgbm90IGluaXRpYWxseSBsb2FkZWQgc3RpbGwgYXBwZWFyLlxuXHRcdGxpYnJhcnkub2JzZXJ2ZSggdGhpcy5nZXQoJ3NlbGVjdGlvbicpICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBzaW5jZSAzLjkuMFxuXHQgKi9cblx0YWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudXBkYXRlU2VsZWN0aW9uKCk7XG5cdFx0TGlicmFyeS5wcm90b3R5cGUuYWN0aXZhdGUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAc2luY2UgMy45LjBcblx0ICovXG5cdHVwZGF0ZVNlbGVjdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMuZ2V0KCdzZWxlY3Rpb24nKSxcblx0XHRcdGF0dGFjaG1lbnQgPSB0aGlzLmltYWdlLmF0dGFjaG1lbnQ7XG5cblx0XHRzZWxlY3Rpb24ucmVzZXQoIGF0dGFjaG1lbnQgPyBbIGF0dGFjaG1lbnQgXSA6IFtdICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlcGxhY2VJbWFnZTtcbiIsIi8qZ2xvYmFscyB3cCwgQmFja2JvbmUgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5jb250cm9sbGVyLlNpdGVJY29uQ3JvcHBlclxuICpcbiAqIEEgc3RhdGUgZm9yIGNyb3BwaW5nIGEgU2l0ZSBJY29uLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuQ3JvcHBlclxuICogQGF1Z21lbnRzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5Nb2RlbFxuICovXG52YXIgQ29udHJvbGxlciA9IHdwLm1lZGlhLmNvbnRyb2xsZXIsXG5cdFNpdGVJY29uQ3JvcHBlcjtcblxuU2l0ZUljb25Dcm9wcGVyID0gQ29udHJvbGxlci5Dcm9wcGVyLmV4dGVuZCh7XG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmZyYW1lLm9uKCAnY29udGVudDpjcmVhdGU6Y3JvcCcsIHRoaXMuY3JlYXRlQ3JvcENvbnRlbnQsIHRoaXMgKTtcblx0XHR0aGlzLmZyYW1lLm9uKCAnY2xvc2UnLCB0aGlzLnJlbW92ZUNyb3BwZXIsIHRoaXMgKTtcblx0XHR0aGlzLnNldCgnc2VsZWN0aW9uJywgbmV3IEJhY2tib25lLkNvbGxlY3Rpb24odGhpcy5mcmFtZS5fc2VsZWN0aW9uLnNpbmdsZSkpO1xuXHR9LFxuXG5cdGNyZWF0ZUNyb3BDb250ZW50OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNyb3BwZXJWaWV3ID0gbmV3IHdwLm1lZGlhLnZpZXcuU2l0ZUljb25Dcm9wcGVyKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRhdHRhY2htZW50OiB0aGlzLmdldCgnc2VsZWN0aW9uJykuZmlyc3QoKVxuXHRcdH0pO1xuXHRcdHRoaXMuY3JvcHBlclZpZXcub24oJ2ltYWdlLWxvYWRlZCcsIHRoaXMuY3JlYXRlQ3JvcFRvb2xiYXIsIHRoaXMpO1xuXHRcdHRoaXMuZnJhbWUuY29udGVudC5zZXQodGhpcy5jcm9wcGVyVmlldyk7XG5cblx0fSxcblxuXHRkb0Nyb3A6IGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXHRcdHZhciBjcm9wRGV0YWlscyA9IGF0dGFjaG1lbnQuZ2V0KCAnY3JvcERldGFpbHMnICksXG5cdFx0XHRjb250cm9sID0gdGhpcy5nZXQoICdjb250cm9sJyApO1xuXG5cdFx0Y3JvcERldGFpbHMuZHN0X3dpZHRoICA9IGNvbnRyb2wucGFyYW1zLndpZHRoO1xuXHRcdGNyb3BEZXRhaWxzLmRzdF9oZWlnaHQgPSBjb250cm9sLnBhcmFtcy5oZWlnaHQ7XG5cblx0XHRyZXR1cm4gd3AuYWpheC5wb3N0KCAnY3JvcC1pbWFnZScsIHtcblx0XHRcdG5vbmNlOiBhdHRhY2htZW50LmdldCggJ25vbmNlcycgKS5lZGl0LFxuXHRcdFx0aWQ6IGF0dGFjaG1lbnQuZ2V0KCAnaWQnICksXG5cdFx0XHRjb250ZXh0OiAnc2l0ZS1pY29uJyxcblx0XHRcdGNyb3BEZXRhaWxzOiBjcm9wRGV0YWlsc1xuXHRcdH0gKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2l0ZUljb25Dcm9wcGVyO1xuIiwiLypnbG9iYWxzIF8sIEJhY2tib25lICovXG5cbi8qKlxuICogd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZU1hY2hpbmVcbiAqXG4gKiBBIHN0YXRlIG1hY2hpbmUga2VlcHMgdHJhY2sgb2Ygc3RhdGUuIEl0IGlzIGluIG9uZSBzdGF0ZSBhdCBhIHRpbWUsXG4gKiBhbmQgY2FuIGNoYW5nZSBmcm9tIG9uZSBzdGF0ZSB0byBhbm90aGVyLlxuICpcbiAqIFN0YXRlcyBhcmUgc3RvcmVkIGFzIG1vZGVscyBpbiBhIEJhY2tib25lIGNvbGxlY3Rpb24uXG4gKlxuICogQHNpbmNlIDMuNS4wXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgQmFja2JvbmUuTW9kZWxcbiAqIEBtaXhpblxuICogQG1peGVzIEJhY2tib25lLkV2ZW50c1xuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHN0YXRlc1xuICovXG52YXIgU3RhdGVNYWNoaW5lID0gZnVuY3Rpb24oIHN0YXRlcyApIHtcblx0Ly8gQHRvZG8gVGhpcyBpcyBkZWFkIGNvZGUuIFRoZSBzdGF0ZXMgY29sbGVjdGlvbiBnZXRzIGNyZWF0ZWQgaW4gbWVkaWEudmlldy5GcmFtZS5fY3JlYXRlU3RhdGVzLlxuXHR0aGlzLnN0YXRlcyA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKCBzdGF0ZXMgKTtcbn07XG5cbi8vIFVzZSBCYWNrYm9uZSdzIHNlbGYtcHJvcGFnYXRpbmcgYGV4dGVuZGAgaW5oZXJpdGFuY2UgbWV0aG9kLlxuU3RhdGVNYWNoaW5lLmV4dGVuZCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZDtcblxuXy5leHRlbmQoIFN0YXRlTWFjaGluZS5wcm90b3R5cGUsIEJhY2tib25lLkV2ZW50cywge1xuXHQvKipcblx0ICogRmV0Y2ggYSBzdGF0ZS5cblx0ICpcblx0ICogSWYgbm8gYGlkYCBpcyBwcm92aWRlZCwgcmV0dXJucyB0aGUgYWN0aXZlIHN0YXRlLlxuXHQgKlxuXHQgKiBJbXBsaWNpdGx5IGNyZWF0ZXMgc3RhdGVzLlxuXHQgKlxuXHQgKiBFbnN1cmUgdGhhdCB0aGUgYHN0YXRlc2AgY29sbGVjdGlvbiBleGlzdHMgc28gdGhlIGBTdGF0ZU1hY2hpbmVgXG5cdCAqICAgY2FuIGJlIHVzZWQgYXMgYSBtaXhpbi5cblx0ICpcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEuY29udHJvbGxlci5TdGF0ZX0gUmV0dXJucyBhIFN0YXRlIG1vZGVsXG5cdCAqICAgZnJvbSB0aGUgU3RhdGVNYWNoaW5lIGNvbGxlY3Rpb25cblx0ICovXG5cdHN0YXRlOiBmdW5jdGlvbiggaWQgKSB7XG5cdFx0dGhpcy5zdGF0ZXMgPSB0aGlzLnN0YXRlcyB8fCBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbigpO1xuXG5cdFx0Ly8gRGVmYXVsdCB0byB0aGUgYWN0aXZlIHN0YXRlLlxuXHRcdGlkID0gaWQgfHwgdGhpcy5fc3RhdGU7XG5cblx0XHRpZiAoIGlkICYmICEgdGhpcy5zdGF0ZXMuZ2V0KCBpZCApICkge1xuXHRcdFx0dGhpcy5zdGF0ZXMuYWRkKHsgaWQ6IGlkIH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5zdGF0ZXMuZ2V0KCBpZCApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBhY3RpdmUgc3RhdGUuXG5cdCAqXG5cdCAqIEJhaWwgaWYgd2UncmUgdHJ5aW5nIHRvIHNlbGVjdCB0aGUgY3VycmVudCBzdGF0ZSwgaWYgd2UgaGF2ZW4ndFxuXHQgKiBjcmVhdGVkIHRoZSBgc3RhdGVzYCBjb2xsZWN0aW9uLCBvciBhcmUgdHJ5aW5nIHRvIHNlbGVjdCBhIHN0YXRlXG5cdCAqIHRoYXQgZG9lcyBub3QgZXhpc3QuXG5cdCAqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaWRcblx0ICpcblx0ICogQGZpcmVzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGUjZGVhY3RpdmF0ZVxuXHQgKiBAZmlyZXMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZSNhY3RpdmF0ZVxuXHQgKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEuY29udHJvbGxlci5TdGF0ZU1hY2hpbmV9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRzZXRTdGF0ZTogZnVuY3Rpb24oIGlkICkge1xuXHRcdHZhciBwcmV2aW91cyA9IHRoaXMuc3RhdGUoKTtcblxuXHRcdGlmICggKCBwcmV2aW91cyAmJiBpZCA9PT0gcHJldmlvdXMuaWQgKSB8fCAhIHRoaXMuc3RhdGVzIHx8ICEgdGhpcy5zdGF0ZXMuZ2V0KCBpZCApICkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0aWYgKCBwcmV2aW91cyApIHtcblx0XHRcdHByZXZpb3VzLnRyaWdnZXIoJ2RlYWN0aXZhdGUnKTtcblx0XHRcdHRoaXMuX2xhc3RTdGF0ZSA9IHByZXZpb3VzLmlkO1xuXHRcdH1cblxuXHRcdHRoaXMuX3N0YXRlID0gaWQ7XG5cdFx0dGhpcy5zdGF0ZSgpLnRyaWdnZXIoJ2FjdGl2YXRlJyk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgcHJldmlvdXMgYWN0aXZlIHN0YXRlLlxuXHQgKlxuXHQgKiBDYWxsIHRoZSBgc3RhdGUoKWAgbWV0aG9kIHdpdGggbm8gcGFyYW1ldGVycyB0byByZXRyaWV2ZSB0aGUgY3VycmVudFxuXHQgKiBhY3RpdmUgc3RhdGUuXG5cdCAqXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEuY29udHJvbGxlci5TdGF0ZX0gUmV0dXJucyBhIFN0YXRlIG1vZGVsXG5cdCAqICAgIGZyb20gdGhlIFN0YXRlTWFjaGluZSBjb2xsZWN0aW9uXG5cdCAqL1xuXHRsYXN0U3RhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggdGhpcy5fbGFzdFN0YXRlICkge1xuXHRcdFx0cmV0dXJuIHRoaXMuc3RhdGUoIHRoaXMuX2xhc3RTdGF0ZSApO1xuXHRcdH1cblx0fVxufSk7XG5cbi8vIE1hcCBhbGwgZXZlbnQgYmluZGluZyBhbmQgdHJpZ2dlcmluZyBvbiBhIFN0YXRlTWFjaGluZSB0byBpdHMgYHN0YXRlc2AgY29sbGVjdGlvbi5cbl8uZWFjaChbICdvbicsICdvZmYnLCAndHJpZ2dlcicgXSwgZnVuY3Rpb24oIG1ldGhvZCApIHtcblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlTWFjaGluZX0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmcuXG5cdCAqL1xuXHRTdGF0ZU1hY2hpbmUucHJvdG90eXBlWyBtZXRob2QgXSA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vIEVuc3VyZSB0aGF0IHRoZSBgc3RhdGVzYCBjb2xsZWN0aW9uIGV4aXN0cyBzbyB0aGUgYFN0YXRlTWFjaGluZWBcblx0XHQvLyBjYW4gYmUgdXNlZCBhcyBhIG1peGluLlxuXHRcdHRoaXMuc3RhdGVzID0gdGhpcy5zdGF0ZXMgfHwgbmV3IEJhY2tib25lLkNvbGxlY3Rpb24oKTtcblx0XHQvLyBGb3J3YXJkIHRoZSBtZXRob2QgdG8gdGhlIGBzdGF0ZXNgIGNvbGxlY3Rpb24uXG5cdFx0dGhpcy5zdGF0ZXNbIG1ldGhvZCBdLmFwcGx5KCB0aGlzLnN0YXRlcywgYXJndW1lbnRzICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGF0ZU1hY2hpbmU7XG4iLCIvKmdsb2JhbHMgXywgQmFja2JvbmUgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlXG4gKlxuICogQSBzdGF0ZSBpcyBhIHN0ZXAgaW4gYSB3b3JrZmxvdyB0aGF0IHdoZW4gc2V0IHdpbGwgdHJpZ2dlciB0aGUgY29udHJvbGxlcnNcbiAqIGZvciB0aGUgcmVnaW9ucyB0byBiZSB1cGRhdGVkIGFzIHNwZWNpZmllZCBpbiB0aGUgZnJhbWUuXG4gKlxuICogQSBzdGF0ZSBoYXMgYW4gZXZlbnQtZHJpdmVuIGxpZmVjeWNsZTpcbiAqXG4gKiAgICAgJ3JlYWR5JyAgICAgIHRyaWdnZXJzIHdoZW4gYSBzdGF0ZSBpcyBhZGRlZCB0byBhIHN0YXRlIG1hY2hpbmUncyBjb2xsZWN0aW9uLlxuICogICAgICdhY3RpdmF0ZScgICB0cmlnZ2VycyB3aGVuIGEgc3RhdGUgaXMgYWN0aXZhdGVkIGJ5IGEgc3RhdGUgbWFjaGluZS5cbiAqICAgICAnZGVhY3RpdmF0ZScgdHJpZ2dlcnMgd2hlbiBhIHN0YXRlIGlzIGRlYWN0aXZhdGVkIGJ5IGEgc3RhdGUgbWFjaGluZS5cbiAqICAgICAncmVzZXQnICAgICAgaXMgbm90IHRyaWdnZXJlZCBhdXRvbWF0aWNhbGx5LiBJdCBzaG91bGQgYmUgaW52b2tlZCBieSB0aGVcbiAqICAgICAgICAgICAgICAgICAgcHJvcGVyIGNvbnRyb2xsZXIgdG8gcmVzZXQgdGhlIHN0YXRlIHRvIGl0cyBkZWZhdWx0LlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIEJhY2tib25lLk1vZGVsXG4gKi9cbnZhciBTdGF0ZSA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cdC8qKlxuXHQgKiBDb25zdHJ1Y3Rvci5cblx0ICpcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcjogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5vbiggJ2FjdGl2YXRlJywgdGhpcy5fcHJlQWN0aXZhdGUsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnYWN0aXZhdGUnLCB0aGlzLmFjdGl2YXRlLCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ2FjdGl2YXRlJywgdGhpcy5fcG9zdEFjdGl2YXRlLCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ2RlYWN0aXZhdGUnLCB0aGlzLl9kZWFjdGl2YXRlLCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ2RlYWN0aXZhdGUnLCB0aGlzLmRlYWN0aXZhdGUsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAncmVzZXQnLCB0aGlzLnJlc2V0LCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ3JlYWR5JywgdGhpcy5fcmVhZHksIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAncmVhZHknLCB0aGlzLnJlYWR5LCB0aGlzICk7XG5cdFx0LyoqXG5cdFx0ICogQ2FsbCBwYXJlbnQgY29uc3RydWN0b3Igd2l0aCBwYXNzZWQgYXJndW1lbnRzXG5cdFx0ICovXG5cdFx0QmFja2JvbmUuTW9kZWwuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHRoaXMub24oICdjaGFuZ2U6bWVudScsIHRoaXMuX3VwZGF0ZU1lbnUsIHRoaXMgKTtcblx0fSxcblx0LyoqXG5cdCAqIFJlYWR5IGV2ZW50IGNhbGxiYWNrLlxuXHQgKlxuXHQgKiBAYWJzdHJhY3Rcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRyZWFkeTogZnVuY3Rpb24oKSB7fSxcblxuXHQvKipcblx0ICogQWN0aXZhdGUgZXZlbnQgY2FsbGJhY2suXG5cdCAqXG5cdCAqIEBhYnN0cmFjdFxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHt9LFxuXG5cdC8qKlxuXHQgKiBEZWFjdGl2YXRlIGV2ZW50IGNhbGxiYWNrLlxuXHQgKlxuXHQgKiBAYWJzdHJhY3Rcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRkZWFjdGl2YXRlOiBmdW5jdGlvbigpIHt9LFxuXG5cdC8qKlxuXHQgKiBSZXNldCBldmVudCBjYWxsYmFjay5cblx0ICpcblx0ICogQGFic3RyYWN0XG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0cmVzZXQ6IGZ1bmN0aW9uKCkge30sXG5cblx0LyoqXG5cdCAqIEBhY2Nlc3MgcHJpdmF0ZVxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdF9yZWFkeTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fdXBkYXRlTWVudSgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAYWNjZXNzIHByaXZhdGVcblx0ICogQHNpbmNlIDMuNS4wXG5cdCovXG5cdF9wcmVBY3RpdmF0ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5hY3RpdmUgPSB0cnVlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAYWNjZXNzIHByaXZhdGVcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRfcG9zdEFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm9uKCAnY2hhbmdlOm1lbnUnLCB0aGlzLl9tZW51LCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ2NoYW5nZTp0aXRsZU1vZGUnLCB0aGlzLl90aXRsZSwgdGhpcyApO1xuXHRcdHRoaXMub24oICdjaGFuZ2U6Y29udGVudCcsIHRoaXMuX2NvbnRlbnQsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnY2hhbmdlOnRvb2xiYXInLCB0aGlzLl90b29sYmFyLCB0aGlzICk7XG5cblx0XHR0aGlzLmZyYW1lLm9uKCAndGl0bGU6cmVuZGVyOmRlZmF1bHQnLCB0aGlzLl9yZW5kZXJUaXRsZSwgdGhpcyApO1xuXG5cdFx0dGhpcy5fdGl0bGUoKTtcblx0XHR0aGlzLl9tZW51KCk7XG5cdFx0dGhpcy5fdG9vbGJhcigpO1xuXHRcdHRoaXMuX2NvbnRlbnQoKTtcblx0XHR0aGlzLl9yb3V0ZXIoKTtcblx0fSxcblxuXHQvKipcblx0ICogQGFjY2VzcyBwcml2YXRlXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0X2RlYWN0aXZhdGU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuYWN0aXZlID0gZmFsc2U7XG5cblx0XHR0aGlzLmZyYW1lLm9mZiggJ3RpdGxlOnJlbmRlcjpkZWZhdWx0JywgdGhpcy5fcmVuZGVyVGl0bGUsIHRoaXMgKTtcblxuXHRcdHRoaXMub2ZmKCAnY2hhbmdlOm1lbnUnLCB0aGlzLl9tZW51LCB0aGlzICk7XG5cdFx0dGhpcy5vZmYoICdjaGFuZ2U6dGl0bGVNb2RlJywgdGhpcy5fdGl0bGUsIHRoaXMgKTtcblx0XHR0aGlzLm9mZiggJ2NoYW5nZTpjb250ZW50JywgdGhpcy5fY29udGVudCwgdGhpcyApO1xuXHRcdHRoaXMub2ZmKCAnY2hhbmdlOnRvb2xiYXInLCB0aGlzLl90b29sYmFyLCB0aGlzICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBhY2Nlc3MgcHJpdmF0ZVxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdF90aXRsZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5mcmFtZS50aXRsZS5yZW5kZXIoIHRoaXMuZ2V0KCd0aXRsZU1vZGUnKSB8fCAnZGVmYXVsdCcgKTtcblx0fSxcblxuXHQvKipcblx0ICogQGFjY2VzcyBwcml2YXRlXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0X3JlbmRlclRpdGxlOiBmdW5jdGlvbiggdmlldyApIHtcblx0XHR2aWV3LiRlbC50ZXh0KCB0aGlzLmdldCgndGl0bGUnKSB8fCAnJyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAYWNjZXNzIHByaXZhdGVcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRfcm91dGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgcm91dGVyID0gdGhpcy5mcmFtZS5yb3V0ZXIsXG5cdFx0XHRtb2RlID0gdGhpcy5nZXQoJ3JvdXRlcicpLFxuXHRcdFx0dmlldztcblxuXHRcdHRoaXMuZnJhbWUuJGVsLnRvZ2dsZUNsYXNzKCAnaGlkZS1yb3V0ZXInLCAhIG1vZGUgKTtcblx0XHRpZiAoICEgbW9kZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLmZyYW1lLnJvdXRlci5yZW5kZXIoIG1vZGUgKTtcblxuXHRcdHZpZXcgPSByb3V0ZXIuZ2V0KCk7XG5cdFx0aWYgKCB2aWV3ICYmIHZpZXcuc2VsZWN0ICkge1xuXHRcdFx0dmlldy5zZWxlY3QoIHRoaXMuZnJhbWUuY29udGVudC5tb2RlKCkgKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBhY2Nlc3MgcHJpdmF0ZVxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdF9tZW51OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbWVudSA9IHRoaXMuZnJhbWUubWVudSxcblx0XHRcdG1vZGUgPSB0aGlzLmdldCgnbWVudScpLFxuXHRcdFx0dmlldztcblxuXHRcdHRoaXMuZnJhbWUuJGVsLnRvZ2dsZUNsYXNzKCAnaGlkZS1tZW51JywgISBtb2RlICk7XG5cdFx0aWYgKCAhIG1vZGUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0bWVudS5tb2RlKCBtb2RlICk7XG5cblx0XHR2aWV3ID0gbWVudS5nZXQoKTtcblx0XHRpZiAoIHZpZXcgJiYgdmlldy5zZWxlY3QgKSB7XG5cdFx0XHR2aWV3LnNlbGVjdCggdGhpcy5pZCApO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogQGFjY2VzcyBwcml2YXRlXG5cdCAqIEBzaW5jZSAzLjUuMFxuXHQgKi9cblx0X3VwZGF0ZU1lbnU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBwcmV2aW91cyA9IHRoaXMucHJldmlvdXMoJ21lbnUnKSxcblx0XHRcdG1lbnUgPSB0aGlzLmdldCgnbWVudScpO1xuXG5cdFx0aWYgKCBwcmV2aW91cyApIHtcblx0XHRcdHRoaXMuZnJhbWUub2ZmKCAnbWVudTpyZW5kZXI6JyArIHByZXZpb3VzLCB0aGlzLl9yZW5kZXJNZW51LCB0aGlzICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBtZW51ICkge1xuXHRcdFx0dGhpcy5mcmFtZS5vbiggJ21lbnU6cmVuZGVyOicgKyBtZW51LCB0aGlzLl9yZW5kZXJNZW51LCB0aGlzICk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgYSB2aWV3IGluIHRoZSBtZWRpYSBtZW51IGZvciB0aGUgc3RhdGUuXG5cdCAqXG5cdCAqIEBhY2Nlc3MgcHJpdmF0ZVxuXHQgKiBAc2luY2UgMy41LjBcblx0ICpcblx0ICogQHBhcmFtIHttZWRpYS52aWV3Lk1lbnV9IHZpZXcgVGhlIG1lbnUgdmlldy5cblx0ICovXG5cdF9yZW5kZXJNZW51OiBmdW5jdGlvbiggdmlldyApIHtcblx0XHR2YXIgbWVudUl0ZW0gPSB0aGlzLmdldCgnbWVudUl0ZW0nKSxcblx0XHRcdHRpdGxlID0gdGhpcy5nZXQoJ3RpdGxlJyksXG5cdFx0XHRwcmlvcml0eSA9IHRoaXMuZ2V0KCdwcmlvcml0eScpO1xuXG5cdFx0aWYgKCAhIG1lbnVJdGVtICYmIHRpdGxlICkge1xuXHRcdFx0bWVudUl0ZW0gPSB7IHRleHQ6IHRpdGxlIH07XG5cblx0XHRcdGlmICggcHJpb3JpdHkgKSB7XG5cdFx0XHRcdG1lbnVJdGVtLnByaW9yaXR5ID0gcHJpb3JpdHk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCAhIG1lbnVJdGVtICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZpZXcuc2V0KCB0aGlzLmlkLCBtZW51SXRlbSApO1xuXHR9XG59KTtcblxuXy5lYWNoKFsndG9vbGJhcicsJ2NvbnRlbnQnXSwgZnVuY3Rpb24oIHJlZ2lvbiApIHtcblx0LyoqXG5cdCAqIEBhY2Nlc3MgcHJpdmF0ZVxuXHQgKi9cblx0U3RhdGUucHJvdG90eXBlWyAnXycgKyByZWdpb24gXSA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBtb2RlID0gdGhpcy5nZXQoIHJlZ2lvbiApO1xuXHRcdGlmICggbW9kZSApIHtcblx0XHRcdHRoaXMuZnJhbWVbIHJlZ2lvbiBdLnJlbmRlciggbW9kZSApO1xuXHRcdH1cblx0fTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXRlO1xuIiwiLypnbG9iYWxzIF8gKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5zZWxlY3Rpb25TeW5jXG4gKlxuICogU3luYyBhbiBhdHRhY2htZW50cyBzZWxlY3Rpb24gaW4gYSBzdGF0ZSB3aXRoIGFub3RoZXIgc3RhdGUuXG4gKlxuICogQWxsb3dzIGZvciBzZWxlY3RpbmcgbXVsdGlwbGUgaW1hZ2VzIGluIHRoZSBJbnNlcnQgTWVkaWEgd29ya2Zsb3csIGFuZCB0aGVuXG4gKiBzd2l0Y2hpbmcgdG8gdGhlIEluc2VydCBHYWxsZXJ5IHdvcmtmbG93IHdoaWxlIHByZXNlcnZpbmcgdGhlIGF0dGFjaG1lbnRzIHNlbGVjdGlvbi5cbiAqXG4gKiBAbWl4aW5cbiAqL1xudmFyIHNlbGVjdGlvblN5bmMgPSB7XG5cdC8qKlxuXHQgKiBAc2luY2UgMy41LjBcblx0ICovXG5cdHN5bmNTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLmdldCgnc2VsZWN0aW9uJyksXG5cdFx0XHRtYW5hZ2VyID0gdGhpcy5mcmFtZS5fc2VsZWN0aW9uO1xuXG5cdFx0aWYgKCAhIHRoaXMuZ2V0KCdzeW5jU2VsZWN0aW9uJykgfHwgISBtYW5hZ2VyIHx8ICEgc2VsZWN0aW9uICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoZSBzZWxlY3Rpb24gc3VwcG9ydHMgbXVsdGlwbGUgaXRlbXMsIHZhbGlkYXRlIHRoZSBzdG9yZWRcblx0XHQvLyBhdHRhY2htZW50cyBiYXNlZCBvbiB0aGUgbmV3IHNlbGVjdGlvbidzIGNvbmRpdGlvbnMuIFJlY29yZFxuXHRcdC8vIHRoZSBhdHRhY2htZW50cyB0aGF0IGFyZSBub3QgaW5jbHVkZWQ7IHdlJ2xsIG1haW50YWluIGFcblx0XHQvLyByZWZlcmVuY2UgdG8gdGhvc2UuIE90aGVyIGF0dGFjaG1lbnRzIGFyZSBjb25zaWRlcmVkIGluIGZsdXguXG5cdFx0aWYgKCBzZWxlY3Rpb24ubXVsdGlwbGUgKSB7XG5cdFx0XHRzZWxlY3Rpb24ucmVzZXQoIFtdLCB7IHNpbGVudDogdHJ1ZSB9KTtcblx0XHRcdHNlbGVjdGlvbi52YWxpZGF0ZUFsbCggbWFuYWdlci5hdHRhY2htZW50cyApO1xuXHRcdFx0bWFuYWdlci5kaWZmZXJlbmNlID0gXy5kaWZmZXJlbmNlKCBtYW5hZ2VyLmF0dGFjaG1lbnRzLm1vZGVscywgc2VsZWN0aW9uLm1vZGVscyApO1xuXHRcdH1cblxuXHRcdC8vIFN5bmMgdGhlIHNlbGVjdGlvbidzIHNpbmdsZSBpdGVtIHdpdGggdGhlIG1hc3Rlci5cblx0XHRzZWxlY3Rpb24uc2luZ2xlKCBtYW5hZ2VyLnNpbmdsZSApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZWNvcmQgdGhlIGN1cnJlbnRseSBhY3RpdmUgYXR0YWNobWVudHMsIHdoaWNoIGlzIGEgY29tYmluYXRpb25cblx0ICogb2YgdGhlIHNlbGVjdGlvbidzIGF0dGFjaG1lbnRzIGFuZCB0aGUgc2V0IG9mIHNlbGVjdGVkXG5cdCAqIGF0dGFjaG1lbnRzIHRoYXQgdGhpcyBzcGVjaWZpYyBzZWxlY3Rpb24gY29uc2lkZXJlZCBpbnZhbGlkLlxuXHQgKiBSZXNldCB0aGUgZGlmZmVyZW5jZSBhbmQgcmVjb3JkIHRoZSBzaW5nbGUgYXR0YWNobWVudC5cblx0ICpcblx0ICogQHNpbmNlIDMuNS4wXG5cdCAqL1xuXHRyZWNvcmRTZWxlY3Rpb246IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLmdldCgnc2VsZWN0aW9uJyksXG5cdFx0XHRtYW5hZ2VyID0gdGhpcy5mcmFtZS5fc2VsZWN0aW9uO1xuXG5cdFx0aWYgKCAhIHRoaXMuZ2V0KCdzeW5jU2VsZWN0aW9uJykgfHwgISBtYW5hZ2VyIHx8ICEgc2VsZWN0aW9uICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggc2VsZWN0aW9uLm11bHRpcGxlICkge1xuXHRcdFx0bWFuYWdlci5hdHRhY2htZW50cy5yZXNldCggc2VsZWN0aW9uLnRvQXJyYXkoKS5jb25jYXQoIG1hbmFnZXIuZGlmZmVyZW5jZSApICk7XG5cdFx0XHRtYW5hZ2VyLmRpZmZlcmVuY2UgPSBbXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bWFuYWdlci5hdHRhY2htZW50cy5hZGQoIHNlbGVjdGlvbi50b0FycmF5KCkgKTtcblx0XHR9XG5cblx0XHRtYW5hZ2VyLnNpbmdsZSA9IHNlbGVjdGlvbi5fc2luZ2xlO1xuXHR9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHNlbGVjdGlvblN5bmM7XG4iLCIvKmdsb2JhbHMgd3AsIGpRdWVyeSwgXywgQmFja2JvbmUgKi9cblxudmFyIG1lZGlhID0gd3AubWVkaWEsXG5cdCQgPSBqUXVlcnksXG5cdGwxMG47XG5cbm1lZGlhLmlzVG91Y2hEZXZpY2UgPSAoICdvbnRvdWNoZW5kJyBpbiBkb2N1bWVudCApO1xuXG4vLyBMaW5rIGFueSBsb2NhbGl6ZWQgc3RyaW5ncy5cbmwxMG4gPSBtZWRpYS52aWV3LmwxMG4gPSB3aW5kb3cuX3dwTWVkaWFWaWV3c0wxMG4gfHwge307XG5cbi8vIExpbmsgYW55IHNldHRpbmdzLlxubWVkaWEudmlldy5zZXR0aW5ncyA9IGwxMG4uc2V0dGluZ3MgfHwge307XG5kZWxldGUgbDEwbi5zZXR0aW5ncztcblxuLy8gQ29weSB0aGUgYHBvc3RgIHNldHRpbmcgb3ZlciB0byB0aGUgbW9kZWwgc2V0dGluZ3MuXG5tZWRpYS5tb2RlbC5zZXR0aW5ncy5wb3N0ID0gbWVkaWEudmlldy5zZXR0aW5ncy5wb3N0O1xuXG4vLyBDaGVjayBpZiB0aGUgYnJvd3NlciBzdXBwb3J0cyBDU1MgMy4wIHRyYW5zaXRpb25zXG4kLnN1cHBvcnQudHJhbnNpdGlvbiA9IChmdW5jdGlvbigpe1xuXHR2YXIgc3R5bGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUsXG5cdFx0dHJhbnNpdGlvbnMgPSB7XG5cdFx0XHRXZWJraXRUcmFuc2l0aW9uOiAnd2Via2l0VHJhbnNpdGlvbkVuZCcsXG5cdFx0XHRNb3pUcmFuc2l0aW9uOiAgICAndHJhbnNpdGlvbmVuZCcsXG5cdFx0XHRPVHJhbnNpdGlvbjogICAgICAnb1RyYW5zaXRpb25FbmQgb3RyYW5zaXRpb25lbmQnLFxuXHRcdFx0dHJhbnNpdGlvbjogICAgICAgJ3RyYW5zaXRpb25lbmQnXG5cdFx0fSwgdHJhbnNpdGlvbjtcblxuXHR0cmFuc2l0aW9uID0gXy5maW5kKCBfLmtleXMoIHRyYW5zaXRpb25zICksIGZ1bmN0aW9uKCB0cmFuc2l0aW9uICkge1xuXHRcdHJldHVybiAhIF8uaXNVbmRlZmluZWQoIHN0eWxlWyB0cmFuc2l0aW9uIF0gKTtcblx0fSk7XG5cblx0cmV0dXJuIHRyYW5zaXRpb24gJiYge1xuXHRcdGVuZDogdHJhbnNpdGlvbnNbIHRyYW5zaXRpb24gXVxuXHR9O1xufSgpKTtcblxuLyoqXG4gKiBBIHNoYXJlZCBldmVudCBidXMgdXNlZCB0byBwcm92aWRlIGV2ZW50cyBpbnRvXG4gKiB0aGUgbWVkaWEgd29ya2Zsb3dzIHRoYXQgM3JkLXBhcnR5IGRldnMgY2FuIHVzZSB0byBob29rXG4gKiBpbi5cbiAqL1xubWVkaWEuZXZlbnRzID0gXy5leHRlbmQoIHt9LCBCYWNrYm9uZS5FdmVudHMgKTtcblxuLyoqXG4gKiBNYWtlcyBpdCBlYXNpZXIgdG8gYmluZCBldmVudHMgdXNpbmcgdHJhbnNpdGlvbnMuXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IHNlbGVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gc2Vuc2l0aXZpdHlcbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5tZWRpYS50cmFuc2l0aW9uID0gZnVuY3Rpb24oIHNlbGVjdG9yLCBzZW5zaXRpdml0eSApIHtcblx0dmFyIGRlZmVycmVkID0gJC5EZWZlcnJlZCgpO1xuXG5cdHNlbnNpdGl2aXR5ID0gc2Vuc2l0aXZpdHkgfHwgMjAwMDtcblxuXHRpZiAoICQuc3VwcG9ydC50cmFuc2l0aW9uICkge1xuXHRcdGlmICggISAoc2VsZWN0b3IgaW5zdGFuY2VvZiAkKSApIHtcblx0XHRcdHNlbGVjdG9yID0gJCggc2VsZWN0b3IgKTtcblx0XHR9XG5cblx0XHQvLyBSZXNvbHZlIHRoZSBkZWZlcnJlZCB3aGVuIHRoZSBmaXJzdCBlbGVtZW50IGZpbmlzaGVzIGFuaW1hdGluZy5cblx0XHRzZWxlY3Rvci5maXJzdCgpLm9uZSggJC5zdXBwb3J0LnRyYW5zaXRpb24uZW5kLCBkZWZlcnJlZC5yZXNvbHZlICk7XG5cblx0XHQvLyBKdXN0IGluIGNhc2UgdGhlIGV2ZW50IGRvZXNuJ3QgdHJpZ2dlciwgZmlyZSBhIGNhbGxiYWNrLlxuXHRcdF8uZGVsYXkoIGRlZmVycmVkLnJlc29sdmUsIHNlbnNpdGl2aXR5ICk7XG5cblx0Ly8gT3RoZXJ3aXNlLCBleGVjdXRlIG9uIHRoZSBzcG90LlxuXHR9IGVsc2Uge1xuXHRcdGRlZmVycmVkLnJlc29sdmUoKTtcblx0fVxuXG5cdHJldHVybiBkZWZlcnJlZC5wcm9taXNlKCk7XG59O1xuXG5tZWRpYS5jb250cm9sbGVyLlJlZ2lvbiA9IHJlcXVpcmUoICcuL2NvbnRyb2xsZXJzL3JlZ2lvbi5qcycgKTtcbm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVNYWNoaW5lID0gcmVxdWlyZSggJy4vY29udHJvbGxlcnMvc3RhdGUtbWFjaGluZS5qcycgKTtcbm1lZGlhLmNvbnRyb2xsZXIuU3RhdGUgPSByZXF1aXJlKCAnLi9jb250cm9sbGVycy9zdGF0ZS5qcycgKTtcblxubWVkaWEuc2VsZWN0aW9uU3luYyA9IHJlcXVpcmUoICcuL3V0aWxzL3NlbGVjdGlvbi1zeW5jLmpzJyApO1xubWVkaWEuY29udHJvbGxlci5MaWJyYXJ5ID0gcmVxdWlyZSggJy4vY29udHJvbGxlcnMvbGlicmFyeS5qcycgKTtcbm1lZGlhLmNvbnRyb2xsZXIuSW1hZ2VEZXRhaWxzID0gcmVxdWlyZSggJy4vY29udHJvbGxlcnMvaW1hZ2UtZGV0YWlscy5qcycgKTtcbm1lZGlhLmNvbnRyb2xsZXIuR2FsbGVyeUVkaXQgPSByZXF1aXJlKCAnLi9jb250cm9sbGVycy9nYWxsZXJ5LWVkaXQuanMnICk7XG5tZWRpYS5jb250cm9sbGVyLkdhbGxlcnlBZGQgPSByZXF1aXJlKCAnLi9jb250cm9sbGVycy9nYWxsZXJ5LWFkZC5qcycgKTtcbm1lZGlhLmNvbnRyb2xsZXIuQ29sbGVjdGlvbkVkaXQgPSByZXF1aXJlKCAnLi9jb250cm9sbGVycy9jb2xsZWN0aW9uLWVkaXQuanMnICk7XG5tZWRpYS5jb250cm9sbGVyLkNvbGxlY3Rpb25BZGQgPSByZXF1aXJlKCAnLi9jb250cm9sbGVycy9jb2xsZWN0aW9uLWFkZC5qcycgKTtcbm1lZGlhLmNvbnRyb2xsZXIuRmVhdHVyZWRJbWFnZSA9IHJlcXVpcmUoICcuL2NvbnRyb2xsZXJzL2ZlYXR1cmVkLWltYWdlLmpzJyApO1xubWVkaWEuY29udHJvbGxlci5SZXBsYWNlSW1hZ2UgPSByZXF1aXJlKCAnLi9jb250cm9sbGVycy9yZXBsYWNlLWltYWdlLmpzJyApO1xubWVkaWEuY29udHJvbGxlci5FZGl0SW1hZ2UgPSByZXF1aXJlKCAnLi9jb250cm9sbGVycy9lZGl0LWltYWdlLmpzJyApO1xubWVkaWEuY29udHJvbGxlci5NZWRpYUxpYnJhcnkgPSByZXF1aXJlKCAnLi9jb250cm9sbGVycy9tZWRpYS1saWJyYXJ5LmpzJyApO1xubWVkaWEuY29udHJvbGxlci5FbWJlZCA9IHJlcXVpcmUoICcuL2NvbnRyb2xsZXJzL2VtYmVkLmpzJyApO1xubWVkaWEuY29udHJvbGxlci5Dcm9wcGVyID0gcmVxdWlyZSggJy4vY29udHJvbGxlcnMvY3JvcHBlci5qcycgKTtcbm1lZGlhLmNvbnRyb2xsZXIuQ3VzdG9taXplSW1hZ2VDcm9wcGVyID0gcmVxdWlyZSggJy4vY29udHJvbGxlcnMvY3VzdG9taXplLWltYWdlLWNyb3BwZXIuanMnICk7XG5tZWRpYS5jb250cm9sbGVyLlNpdGVJY29uQ3JvcHBlciA9IHJlcXVpcmUoICcuL2NvbnRyb2xsZXJzL3NpdGUtaWNvbi1jcm9wcGVyLmpzJyApO1xuXG5tZWRpYS5WaWV3ID0gcmVxdWlyZSggJy4vdmlld3Mvdmlldy5qcycgKTtcbm1lZGlhLnZpZXcuRnJhbWUgPSByZXF1aXJlKCAnLi92aWV3cy9mcmFtZS5qcycgKTtcbm1lZGlhLnZpZXcuTWVkaWFGcmFtZSA9IHJlcXVpcmUoICcuL3ZpZXdzL21lZGlhLWZyYW1lLmpzJyApO1xubWVkaWEudmlldy5NZWRpYUZyYW1lLlNlbGVjdCA9IHJlcXVpcmUoICcuL3ZpZXdzL2ZyYW1lL3NlbGVjdC5qcycgKTtcbm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5Qb3N0ID0gcmVxdWlyZSggJy4vdmlld3MvZnJhbWUvcG9zdC5qcycgKTtcbm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5JbWFnZURldGFpbHMgPSByZXF1aXJlKCAnLi92aWV3cy9mcmFtZS9pbWFnZS1kZXRhaWxzLmpzJyApO1xubWVkaWEudmlldy5Nb2RhbCA9IHJlcXVpcmUoICcuL3ZpZXdzL21vZGFsLmpzJyApO1xubWVkaWEudmlldy5Gb2N1c01hbmFnZXIgPSByZXF1aXJlKCAnLi92aWV3cy9mb2N1cy1tYW5hZ2VyLmpzJyApO1xubWVkaWEudmlldy5VcGxvYWRlcldpbmRvdyA9IHJlcXVpcmUoICcuL3ZpZXdzL3VwbG9hZGVyL3dpbmRvdy5qcycgKTtcbm1lZGlhLnZpZXcuRWRpdG9yVXBsb2FkZXIgPSByZXF1aXJlKCAnLi92aWV3cy91cGxvYWRlci9lZGl0b3IuanMnICk7XG5tZWRpYS52aWV3LlVwbG9hZGVySW5saW5lID0gcmVxdWlyZSggJy4vdmlld3MvdXBsb2FkZXIvaW5saW5lLmpzJyApO1xubWVkaWEudmlldy5VcGxvYWRlclN0YXR1cyA9IHJlcXVpcmUoICcuL3ZpZXdzL3VwbG9hZGVyL3N0YXR1cy5qcycgKTtcbm1lZGlhLnZpZXcuVXBsb2FkZXJTdGF0dXNFcnJvciA9IHJlcXVpcmUoICcuL3ZpZXdzL3VwbG9hZGVyL3N0YXR1cy1lcnJvci5qcycgKTtcbm1lZGlhLnZpZXcuVG9vbGJhciA9IHJlcXVpcmUoICcuL3ZpZXdzL3Rvb2xiYXIuanMnICk7XG5tZWRpYS52aWV3LlRvb2xiYXIuU2VsZWN0ID0gcmVxdWlyZSggJy4vdmlld3MvdG9vbGJhci9zZWxlY3QuanMnICk7XG5tZWRpYS52aWV3LlRvb2xiYXIuRW1iZWQgPSByZXF1aXJlKCAnLi92aWV3cy90b29sYmFyL2VtYmVkLmpzJyApO1xubWVkaWEudmlldy5CdXR0b24gPSByZXF1aXJlKCAnLi92aWV3cy9idXR0b24uanMnICk7XG5tZWRpYS52aWV3LkJ1dHRvbkdyb3VwID0gcmVxdWlyZSggJy4vdmlld3MvYnV0dG9uLWdyb3VwLmpzJyApO1xubWVkaWEudmlldy5Qcmlvcml0eUxpc3QgPSByZXF1aXJlKCAnLi92aWV3cy9wcmlvcml0eS1saXN0LmpzJyApO1xubWVkaWEudmlldy5NZW51SXRlbSA9IHJlcXVpcmUoICcuL3ZpZXdzL21lbnUtaXRlbS5qcycgKTtcbm1lZGlhLnZpZXcuTWVudSA9IHJlcXVpcmUoICcuL3ZpZXdzL21lbnUuanMnICk7XG5tZWRpYS52aWV3LlJvdXRlckl0ZW0gPSByZXF1aXJlKCAnLi92aWV3cy9yb3V0ZXItaXRlbS5qcycgKTtcbm1lZGlhLnZpZXcuUm91dGVyID0gcmVxdWlyZSggJy4vdmlld3Mvcm91dGVyLmpzJyApO1xubWVkaWEudmlldy5TaWRlYmFyID0gcmVxdWlyZSggJy4vdmlld3Mvc2lkZWJhci5qcycgKTtcbm1lZGlhLnZpZXcuQXR0YWNobWVudCA9IHJlcXVpcmUoICcuL3ZpZXdzL2F0dGFjaG1lbnQuanMnICk7XG5tZWRpYS52aWV3LkF0dGFjaG1lbnQuTGlicmFyeSA9IHJlcXVpcmUoICcuL3ZpZXdzL2F0dGFjaG1lbnQvbGlicmFyeS5qcycgKTtcbm1lZGlhLnZpZXcuQXR0YWNobWVudC5FZGl0TGlicmFyeSA9IHJlcXVpcmUoICcuL3ZpZXdzL2F0dGFjaG1lbnQvZWRpdC1saWJyYXJ5LmpzJyApO1xubWVkaWEudmlldy5BdHRhY2htZW50cyA9IHJlcXVpcmUoICcuL3ZpZXdzL2F0dGFjaG1lbnRzLmpzJyApO1xubWVkaWEudmlldy5TZWFyY2ggPSByZXF1aXJlKCAnLi92aWV3cy9zZWFyY2guanMnICk7XG5tZWRpYS52aWV3LkF0dGFjaG1lbnRGaWx0ZXJzID0gcmVxdWlyZSggJy4vdmlld3MvYXR0YWNobWVudC1maWx0ZXJzLmpzJyApO1xubWVkaWEudmlldy5EYXRlRmlsdGVyID0gcmVxdWlyZSggJy4vdmlld3MvYXR0YWNobWVudC1maWx0ZXJzL2RhdGUuanMnICk7XG5tZWRpYS52aWV3LkF0dGFjaG1lbnRGaWx0ZXJzLlVwbG9hZGVkID0gcmVxdWlyZSggJy4vdmlld3MvYXR0YWNobWVudC1maWx0ZXJzL3VwbG9hZGVkLmpzJyApO1xubWVkaWEudmlldy5BdHRhY2htZW50RmlsdGVycy5BbGwgPSByZXF1aXJlKCAnLi92aWV3cy9hdHRhY2htZW50LWZpbHRlcnMvYWxsLmpzJyApO1xubWVkaWEudmlldy5BdHRhY2htZW50c0Jyb3dzZXIgPSByZXF1aXJlKCAnLi92aWV3cy9hdHRhY2htZW50cy9icm93c2VyLmpzJyApO1xubWVkaWEudmlldy5TZWxlY3Rpb24gPSByZXF1aXJlKCAnLi92aWV3cy9zZWxlY3Rpb24uanMnICk7XG5tZWRpYS52aWV3LkF0dGFjaG1lbnQuU2VsZWN0aW9uID0gcmVxdWlyZSggJy4vdmlld3MvYXR0YWNobWVudC9zZWxlY3Rpb24uanMnICk7XG5tZWRpYS52aWV3LkF0dGFjaG1lbnRzLlNlbGVjdGlvbiA9IHJlcXVpcmUoICcuL3ZpZXdzL2F0dGFjaG1lbnRzL3NlbGVjdGlvbi5qcycgKTtcbm1lZGlhLnZpZXcuQXR0YWNobWVudC5FZGl0U2VsZWN0aW9uID0gcmVxdWlyZSggJy4vdmlld3MvYXR0YWNobWVudC9lZGl0LXNlbGVjdGlvbi5qcycgKTtcbm1lZGlhLnZpZXcuU2V0dGluZ3MgPSByZXF1aXJlKCAnLi92aWV3cy9zZXR0aW5ncy5qcycgKTtcbm1lZGlhLnZpZXcuU2V0dGluZ3MuQXR0YWNobWVudERpc3BsYXkgPSByZXF1aXJlKCAnLi92aWV3cy9zZXR0aW5ncy9hdHRhY2htZW50LWRpc3BsYXkuanMnICk7XG5tZWRpYS52aWV3LlNldHRpbmdzLkdhbGxlcnkgPSByZXF1aXJlKCAnLi92aWV3cy9zZXR0aW5ncy9nYWxsZXJ5LmpzJyApO1xubWVkaWEudmlldy5TZXR0aW5ncy5QbGF5bGlzdCA9IHJlcXVpcmUoICcuL3ZpZXdzL3NldHRpbmdzL3BsYXlsaXN0LmpzJyApO1xubWVkaWEudmlldy5BdHRhY2htZW50LkRldGFpbHMgPSByZXF1aXJlKCAnLi92aWV3cy9hdHRhY2htZW50L2RldGFpbHMuanMnICk7XG5tZWRpYS52aWV3LkF0dGFjaG1lbnRDb21wYXQgPSByZXF1aXJlKCAnLi92aWV3cy9hdHRhY2htZW50LWNvbXBhdC5qcycgKTtcbm1lZGlhLnZpZXcuSWZyYW1lID0gcmVxdWlyZSggJy4vdmlld3MvaWZyYW1lLmpzJyApO1xubWVkaWEudmlldy5FbWJlZCA9IHJlcXVpcmUoICcuL3ZpZXdzL2VtYmVkLmpzJyApO1xubWVkaWEudmlldy5MYWJlbCA9IHJlcXVpcmUoICcuL3ZpZXdzL2xhYmVsLmpzJyApO1xubWVkaWEudmlldy5FbWJlZFVybCA9IHJlcXVpcmUoICcuL3ZpZXdzL2VtYmVkL3VybC5qcycgKTtcbm1lZGlhLnZpZXcuRW1iZWRMaW5rID0gcmVxdWlyZSggJy4vdmlld3MvZW1iZWQvbGluay5qcycgKTtcbm1lZGlhLnZpZXcuRW1iZWRJbWFnZSA9IHJlcXVpcmUoICcuL3ZpZXdzL2VtYmVkL2ltYWdlLmpzJyApO1xubWVkaWEudmlldy5JbWFnZURldGFpbHMgPSByZXF1aXJlKCAnLi92aWV3cy9pbWFnZS1kZXRhaWxzLmpzJyApO1xubWVkaWEudmlldy5Dcm9wcGVyID0gcmVxdWlyZSggJy4vdmlld3MvY3JvcHBlci5qcycgKTtcbm1lZGlhLnZpZXcuU2l0ZUljb25Dcm9wcGVyID0gcmVxdWlyZSggJy4vdmlld3Mvc2l0ZS1pY29uLWNyb3BwZXIuanMnICk7XG5tZWRpYS52aWV3LlNpdGVJY29uUHJldmlldyA9IHJlcXVpcmUoICcuL3ZpZXdzL3NpdGUtaWNvbi1wcmV2aWV3LmpzJyApO1xubWVkaWEudmlldy5FZGl0SW1hZ2UgPSByZXF1aXJlKCAnLi92aWV3cy9lZGl0LWltYWdlLmpzJyApO1xubWVkaWEudmlldy5TcGlubmVyID0gcmVxdWlyZSggJy4vdmlld3Mvc3Bpbm5lci5qcycgKTtcbiIsIi8qZ2xvYmFscyBfICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5BdHRhY2htZW50Q29tcGF0XG4gKlxuICogQSB2aWV3IHRvIGRpc3BsYXkgZmllbGRzIGFkZGVkIHZpYSB0aGUgYGF0dGFjaG1lbnRfZmllbGRzX3RvX2VkaXRgIGZpbHRlci5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFZpZXcgPSB3cC5tZWRpYS5WaWV3LFxuXHRBdHRhY2htZW50Q29tcGF0O1xuXG5BdHRhY2htZW50Q29tcGF0ID0gVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiAgICdmb3JtJyxcblx0Y2xhc3NOYW1lOiAnY29tcGF0LWl0ZW0nLFxuXG5cdGV2ZW50czoge1xuXHRcdCdzdWJtaXQnOiAgICAgICAgICAncHJldmVudERlZmF1bHQnLFxuXHRcdCdjaGFuZ2UgaW5wdXQnOiAgICAnc2F2ZScsXG5cdFx0J2NoYW5nZSBzZWxlY3QnOiAgICdzYXZlJyxcblx0XHQnY2hhbmdlIHRleHRhcmVhJzogJ3NhdmUnXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZTpjb21wYXQnLCB0aGlzLnJlbmRlciApO1xuXHR9LFxuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuQXR0YWNobWVudENvbXBhdH0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdGRpc3Bvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggdGhpcy4kKCc6Zm9jdXMnKS5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLnNhdmUoKTtcblx0XHR9XG5cdFx0LyoqXG5cdFx0ICogY2FsbCAnZGlzcG9zZScgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzc1xuXHRcdCAqL1xuXHRcdHJldHVybiBWaWV3LnByb3RvdHlwZS5kaXNwb3NlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRDb21wYXR9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBjb21wYXQgPSB0aGlzLm1vZGVsLmdldCgnY29tcGF0Jyk7XG5cdFx0aWYgKCAhIGNvbXBhdCB8fCAhIGNvbXBhdC5pdGVtICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMudmlld3MuZGV0YWNoKCk7XG5cdFx0dGhpcy4kZWwuaHRtbCggY29tcGF0Lml0ZW0gKTtcblx0XHR0aGlzLnZpZXdzLnJlbmRlcigpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHRwcmV2ZW50RGVmYXVsdDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcblx0ICovXG5cdHNhdmU6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR2YXIgZGF0YSA9IHt9O1xuXG5cdFx0aWYgKCBldmVudCApIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXG5cdFx0Xy5lYWNoKCB0aGlzLiRlbC5zZXJpYWxpemVBcnJheSgpLCBmdW5jdGlvbiggcGFpciApIHtcblx0XHRcdGRhdGFbIHBhaXIubmFtZSBdID0gcGFpci52YWx1ZTtcblx0XHR9KTtcblxuXHRcdHRoaXMuY29udHJvbGxlci50cmlnZ2VyKCAnYXR0YWNobWVudDpjb21wYXQ6d2FpdGluZycsIFsnd2FpdGluZyddICk7XG5cdFx0dGhpcy5tb2RlbC5zYXZlQ29tcGF0KCBkYXRhICkuYWx3YXlzKCBfLmJpbmQoIHRoaXMucG9zdFNhdmUsIHRoaXMgKSApO1xuXHR9LFxuXG5cdHBvc3RTYXZlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNvbnRyb2xsZXIudHJpZ2dlciggJ2F0dGFjaG1lbnQ6Y29tcGF0OnJlYWR5JywgWydyZWFkeSddICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF0dGFjaG1lbnRDb21wYXQ7XG4iLCIvKmdsb2JhbHMgXywgalF1ZXJ5ICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5BdHRhY2htZW50RmlsdGVyc1xuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgJCA9IGpRdWVyeSxcblx0QXR0YWNobWVudEZpbHRlcnM7XG5cbkF0dGFjaG1lbnRGaWx0ZXJzID0gd3AubWVkaWEuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiAgICdzZWxlY3QnLFxuXHRjbGFzc05hbWU6ICdhdHRhY2htZW50LWZpbHRlcnMnLFxuXHRpZDogICAgICAgICdtZWRpYS1hdHRhY2htZW50LWZpbHRlcnMnLFxuXG5cdGV2ZW50czoge1xuXHRcdGNoYW5nZTogJ2NoYW5nZSdcblx0fSxcblxuXHRrZXlzOiBbXSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNyZWF0ZUZpbHRlcnMoKTtcblx0XHRfLmV4dGVuZCggdGhpcy5maWx0ZXJzLCB0aGlzLm9wdGlvbnMuZmlsdGVycyApO1xuXG5cdFx0Ly8gQnVpbGQgYDxvcHRpb24+YCBlbGVtZW50cy5cblx0XHR0aGlzLiRlbC5odG1sKCBfLmNoYWluKCB0aGlzLmZpbHRlcnMgKS5tYXAoIGZ1bmN0aW9uKCBmaWx0ZXIsIHZhbHVlICkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZWw6ICQoICc8b3B0aW9uPjwvb3B0aW9uPicgKS52YWwoIHZhbHVlICkuaHRtbCggZmlsdGVyLnRleHQgKVswXSxcblx0XHRcdFx0cHJpb3JpdHk6IGZpbHRlci5wcmlvcml0eSB8fCA1MFxuXHRcdFx0fTtcblx0XHR9LCB0aGlzICkuc29ydEJ5KCdwcmlvcml0eScpLnBsdWNrKCdlbCcpLnZhbHVlKCkgKTtcblxuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdjaGFuZ2UnLCB0aGlzLnNlbGVjdCApO1xuXHRcdHRoaXMuc2VsZWN0KCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBhYnN0cmFjdFxuXHQgKi9cblx0Y3JlYXRlRmlsdGVyczogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5maWx0ZXJzID0ge307XG5cdH0sXG5cblx0LyoqXG5cdCAqIFdoZW4gdGhlIHNlbGVjdGVkIGZpbHRlciBjaGFuZ2VzLCB1cGRhdGUgdGhlIEF0dGFjaG1lbnQgUXVlcnkgcHJvcGVydGllcyB0byBtYXRjaC5cblx0ICovXG5cdGNoYW5nZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGZpbHRlciA9IHRoaXMuZmlsdGVyc1sgdGhpcy5lbC52YWx1ZSBdO1xuXHRcdGlmICggZmlsdGVyICkge1xuXHRcdFx0dGhpcy5tb2RlbC5zZXQoIGZpbHRlci5wcm9wcyApO1xuXHRcdH1cblx0fSxcblxuXHRzZWxlY3Q6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBtb2RlbCA9IHRoaXMubW9kZWwsXG5cdFx0XHR2YWx1ZSA9ICdhbGwnLFxuXHRcdFx0cHJvcHMgPSBtb2RlbC50b0pTT04oKTtcblxuXHRcdF8uZmluZCggdGhpcy5maWx0ZXJzLCBmdW5jdGlvbiggZmlsdGVyLCBpZCApIHtcblx0XHRcdHZhciBlcXVhbCA9IF8uYWxsKCBmaWx0ZXIucHJvcHMsIGZ1bmN0aW9uKCBwcm9wLCBrZXkgKSB7XG5cdFx0XHRcdHJldHVybiBwcm9wID09PSAoIF8uaXNVbmRlZmluZWQoIHByb3BzWyBrZXkgXSApID8gbnVsbCA6IHByb3BzWyBrZXkgXSApO1xuXHRcdFx0fSk7XG5cblx0XHRcdGlmICggZXF1YWwgKSB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZSA9IGlkO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGhpcy4kZWwudmFsKCB2YWx1ZSApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBdHRhY2htZW50RmlsdGVycztcbiIsIi8qZ2xvYmFscyB3cCAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudEZpbHRlcnMuQWxsXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5BdHRhY2htZW50RmlsdGVyc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgbDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0QWxsO1xuXG5BbGwgPSB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRGaWx0ZXJzLmV4dGVuZCh7XG5cdGNyZWF0ZUZpbHRlcnM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBmaWx0ZXJzID0ge307XG5cblx0XHRfLmVhY2goIHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MubWltZVR5cGVzIHx8IHt9LCBmdW5jdGlvbiggdGV4dCwga2V5ICkge1xuXHRcdFx0ZmlsdGVyc1sga2V5IF0gPSB7XG5cdFx0XHRcdHRleHQ6IHRleHQsXG5cdFx0XHRcdHByb3BzOiB7XG5cdFx0XHRcdFx0c3RhdHVzOiAgbnVsbCxcblx0XHRcdFx0XHR0eXBlOiAgICBrZXksXG5cdFx0XHRcdFx0dXBsb2FkZWRUbzogbnVsbCxcblx0XHRcdFx0XHRvcmRlcmJ5OiAnZGF0ZScsXG5cdFx0XHRcdFx0b3JkZXI6ICAgJ0RFU0MnXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fSk7XG5cblx0XHRmaWx0ZXJzLmFsbCA9IHtcblx0XHRcdHRleHQ6ICBsMTBuLmFsbE1lZGlhSXRlbXMsXG5cdFx0XHRwcm9wczoge1xuXHRcdFx0XHRzdGF0dXM6ICBudWxsLFxuXHRcdFx0XHR0eXBlOiAgICBudWxsLFxuXHRcdFx0XHR1cGxvYWRlZFRvOiBudWxsLFxuXHRcdFx0XHRvcmRlcmJ5OiAnZGF0ZScsXG5cdFx0XHRcdG9yZGVyOiAgICdERVNDJ1xuXHRcdFx0fSxcblx0XHRcdHByaW9yaXR5OiAxMFxuXHRcdH07XG5cblx0XHRpZiAoIHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MucG9zdC5pZCApIHtcblx0XHRcdGZpbHRlcnMudXBsb2FkZWQgPSB7XG5cdFx0XHRcdHRleHQ6ICBsMTBuLnVwbG9hZGVkVG9UaGlzUG9zdCxcblx0XHRcdFx0cHJvcHM6IHtcblx0XHRcdFx0XHRzdGF0dXM6ICBudWxsLFxuXHRcdFx0XHRcdHR5cGU6ICAgIG51bGwsXG5cdFx0XHRcdFx0dXBsb2FkZWRUbzogd3AubWVkaWEudmlldy5zZXR0aW5ncy5wb3N0LmlkLFxuXHRcdFx0XHRcdG9yZGVyYnk6ICdtZW51T3JkZXInLFxuXHRcdFx0XHRcdG9yZGVyOiAgICdBU0MnXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHByaW9yaXR5OiAyMFxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRmaWx0ZXJzLnVuYXR0YWNoZWQgPSB7XG5cdFx0XHR0ZXh0OiAgbDEwbi51bmF0dGFjaGVkLFxuXHRcdFx0cHJvcHM6IHtcblx0XHRcdFx0c3RhdHVzOiAgICAgbnVsbCxcblx0XHRcdFx0dXBsb2FkZWRUbzogMCxcblx0XHRcdFx0dHlwZTogICAgICAgbnVsbCxcblx0XHRcdFx0b3JkZXJieTogICAgJ21lbnVPcmRlcicsXG5cdFx0XHRcdG9yZGVyOiAgICAgICdBU0MnXG5cdFx0XHR9LFxuXHRcdFx0cHJpb3JpdHk6IDUwXG5cdFx0fTtcblxuXHRcdGlmICggd3AubWVkaWEudmlldy5zZXR0aW5ncy5tZWRpYVRyYXNoICYmXG5cdFx0XHR0aGlzLmNvbnRyb2xsZXIuaXNNb2RlQWN0aXZlKCAnZ3JpZCcgKSApIHtcblxuXHRcdFx0ZmlsdGVycy50cmFzaCA9IHtcblx0XHRcdFx0dGV4dDogIGwxMG4udHJhc2gsXG5cdFx0XHRcdHByb3BzOiB7XG5cdFx0XHRcdFx0dXBsb2FkZWRUbzogbnVsbCxcblx0XHRcdFx0XHRzdGF0dXM6ICAgICAndHJhc2gnLFxuXHRcdFx0XHRcdHR5cGU6ICAgICAgIG51bGwsXG5cdFx0XHRcdFx0b3JkZXJieTogICAgJ2RhdGUnLFxuXHRcdFx0XHRcdG9yZGVyOiAgICAgICdERVNDJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmlvcml0eTogNTBcblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0dGhpcy5maWx0ZXJzID0gZmlsdGVycztcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQWxsO1xuIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogQSBmaWx0ZXIgZHJvcGRvd24gZm9yIG1vbnRoL2RhdGVzLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudEZpbHRlcnNcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdERhdGVGaWx0ZXI7XG5cbkRhdGVGaWx0ZXIgPSB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRGaWx0ZXJzLmV4dGVuZCh7XG5cdGlkOiAnbWVkaWEtYXR0YWNobWVudC1kYXRlLWZpbHRlcnMnLFxuXG5cdGNyZWF0ZUZpbHRlcnM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBmaWx0ZXJzID0ge307XG5cdFx0Xy5lYWNoKCB3cC5tZWRpYS52aWV3LnNldHRpbmdzLm1vbnRocyB8fCB7fSwgZnVuY3Rpb24oIHZhbHVlLCBpbmRleCApIHtcblx0XHRcdGZpbHRlcnNbIGluZGV4IF0gPSB7XG5cdFx0XHRcdHRleHQ6IHZhbHVlLnRleHQsXG5cdFx0XHRcdHByb3BzOiB7XG5cdFx0XHRcdFx0eWVhcjogdmFsdWUueWVhcixcblx0XHRcdFx0XHRtb250aG51bTogdmFsdWUubW9udGhcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9KTtcblx0XHRmaWx0ZXJzLmFsbCA9IHtcblx0XHRcdHRleHQ6ICBsMTBuLmFsbERhdGVzLFxuXHRcdFx0cHJvcHM6IHtcblx0XHRcdFx0bW9udGhudW06IGZhbHNlLFxuXHRcdFx0XHR5ZWFyOiAgZmFsc2Vcblx0XHRcdH0sXG5cdFx0XHRwcmlvcml0eTogMTBcblx0XHR9O1xuXHRcdHRoaXMuZmlsdGVycyA9IGZpbHRlcnM7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERhdGVGaWx0ZXI7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRGaWx0ZXJzLlVwbG9hZGVkXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5BdHRhY2htZW50RmlsdGVyc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgbDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0VXBsb2FkZWQ7XG5cblVwbG9hZGVkID0gd3AubWVkaWEudmlldy5BdHRhY2htZW50RmlsdGVycy5leHRlbmQoe1xuXHRjcmVhdGVGaWx0ZXJzOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgdHlwZSA9IHRoaXMubW9kZWwuZ2V0KCd0eXBlJyksXG5cdFx0XHR0eXBlcyA9IHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MubWltZVR5cGVzLFxuXHRcdFx0dGV4dDtcblxuXHRcdGlmICggdHlwZXMgJiYgdHlwZSApIHtcblx0XHRcdHRleHQgPSB0eXBlc1sgdHlwZSBdO1xuXHRcdH1cblxuXHRcdHRoaXMuZmlsdGVycyA9IHtcblx0XHRcdGFsbDoge1xuXHRcdFx0XHR0ZXh0OiAgdGV4dCB8fCBsMTBuLmFsbE1lZGlhSXRlbXMsXG5cdFx0XHRcdHByb3BzOiB7XG5cdFx0XHRcdFx0dXBsb2FkZWRUbzogbnVsbCxcblx0XHRcdFx0XHRvcmRlcmJ5OiAnZGF0ZScsXG5cdFx0XHRcdFx0b3JkZXI6ICAgJ0RFU0MnXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHByaW9yaXR5OiAxMFxuXHRcdFx0fSxcblxuXHRcdFx0dXBsb2FkZWQ6IHtcblx0XHRcdFx0dGV4dDogIGwxMG4udXBsb2FkZWRUb1RoaXNQb3N0LFxuXHRcdFx0XHRwcm9wczoge1xuXHRcdFx0XHRcdHVwbG9hZGVkVG86IHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MucG9zdC5pZCxcblx0XHRcdFx0XHRvcmRlcmJ5OiAnbWVudU9yZGVyJyxcblx0XHRcdFx0XHRvcmRlcjogICAnQVNDJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmlvcml0eTogMjBcblx0XHRcdH0sXG5cblx0XHRcdHVuYXR0YWNoZWQ6IHtcblx0XHRcdFx0dGV4dDogIGwxMG4udW5hdHRhY2hlZCxcblx0XHRcdFx0cHJvcHM6IHtcblx0XHRcdFx0XHR1cGxvYWRlZFRvOiAwLFxuXHRcdFx0XHRcdG9yZGVyYnk6ICdtZW51T3JkZXInLFxuXHRcdFx0XHRcdG9yZGVyOiAgICdBU0MnXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHByaW9yaXR5OiA1MFxuXHRcdFx0fVxuXHRcdH07XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVwbG9hZGVkO1xuIiwiLypnbG9iYWxzIHdwLCBfLCBqUXVlcnkgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFZpZXcgPSB3cC5tZWRpYS5WaWV3LFxuXHQkID0galF1ZXJ5LFxuXHRBdHRhY2htZW50O1xuXG5BdHRhY2htZW50ID0gVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiAgICdsaScsXG5cdGNsYXNzTmFtZTogJ2F0dGFjaG1lbnQnLFxuXHR0ZW1wbGF0ZTogIHdwLnRlbXBsYXRlKCdhdHRhY2htZW50JyksXG5cblx0YXR0cmlidXRlczogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdCd0YWJJbmRleCc6ICAgICAwLFxuXHRcdFx0J3JvbGUnOiAgICAgICAgICdjaGVja2JveCcsXG5cdFx0XHQnYXJpYS1sYWJlbCc6ICAgdGhpcy5tb2RlbC5nZXQoICd0aXRsZScgKSxcblx0XHRcdCdhcmlhLWNoZWNrZWQnOiBmYWxzZSxcblx0XHRcdCdkYXRhLWlkJzogICAgICB0aGlzLm1vZGVsLmdldCggJ2lkJyApXG5cdFx0fTtcblx0fSxcblxuXHRldmVudHM6IHtcblx0XHQnY2xpY2sgLmpzLS1zZWxlY3QtYXR0YWNobWVudCc6ICAgJ3RvZ2dsZVNlbGVjdGlvbkhhbmRsZXInLFxuXHRcdCdjaGFuZ2UgW2RhdGEtc2V0dGluZ10nOiAgICAgICAgICAndXBkYXRlU2V0dGluZycsXG5cdFx0J2NoYW5nZSBbZGF0YS1zZXR0aW5nXSBpbnB1dCc6ICAgICd1cGRhdGVTZXR0aW5nJyxcblx0XHQnY2hhbmdlIFtkYXRhLXNldHRpbmddIHNlbGVjdCc6ICAgJ3VwZGF0ZVNldHRpbmcnLFxuXHRcdCdjaGFuZ2UgW2RhdGEtc2V0dGluZ10gdGV4dGFyZWEnOiAndXBkYXRlU2V0dGluZycsXG5cdFx0J2NsaWNrIC5hdHRhY2htZW50LWNsb3NlJzogICAgICAgICdyZW1vdmVGcm9tTGlicmFyeScsXG5cdFx0J2NsaWNrIC5jaGVjayc6ICAgICAgICAgICAgICAgICAgICdjaGVja0NsaWNrSGFuZGxlcicsXG5cdFx0J2tleWRvd24nOiAgICAgICAgICAgICAgICAgICAgICAgICd0b2dnbGVTZWxlY3Rpb25IYW5kbGVyJ1xuXHR9LFxuXG5cdGJ1dHRvbnM6IHt9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLm9wdGlvbnMuc2VsZWN0aW9uLFxuXHRcdFx0b3B0aW9ucyA9IF8uZGVmYXVsdHMoIHRoaXMub3B0aW9ucywge1xuXHRcdFx0XHRyZXJlbmRlck9uTW9kZWxDaGFuZ2U6IHRydWVcblx0XHRcdH0gKTtcblxuXHRcdGlmICggb3B0aW9ucy5yZXJlbmRlck9uTW9kZWxDaGFuZ2UgKSB7XG5cdFx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnY2hhbmdlJywgdGhpcy5yZW5kZXIgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZTpwZXJjZW50JywgdGhpcy5wcm9ncmVzcyApO1xuXHRcdH1cblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnY2hhbmdlOnRpdGxlJywgdGhpcy5fc3luY1RpdGxlICk7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZTpjYXB0aW9uJywgdGhpcy5fc3luY0NhcHRpb24gKTtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnY2hhbmdlOmFydGlzdCcsIHRoaXMuX3N5bmNBcnRpc3QgKTtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnY2hhbmdlOmFsYnVtJywgdGhpcy5fc3luY0FsYnVtICk7XG5cblx0XHQvLyBVcGRhdGUgdGhlIHNlbGVjdGlvbi5cblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnYWRkJywgdGhpcy5zZWxlY3QgKTtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAncmVtb3ZlJywgdGhpcy5kZXNlbGVjdCApO1xuXHRcdGlmICggc2VsZWN0aW9uICkge1xuXHRcdFx0c2VsZWN0aW9uLm9uKCAncmVzZXQnLCB0aGlzLnVwZGF0ZVNlbGVjdCwgdGhpcyApO1xuXHRcdFx0Ly8gVXBkYXRlIHRoZSBtb2RlbCdzIGRldGFpbHMgdmlldy5cblx0XHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdzZWxlY3Rpb246c2luZ2xlIHNlbGVjdGlvbjp1bnNpbmdsZScsIHRoaXMuZGV0YWlscyApO1xuXHRcdFx0dGhpcy5kZXRhaWxzKCB0aGlzLm1vZGVsLCB0aGlzLmNvbnRyb2xsZXIuc3RhdGUoKS5nZXQoJ3NlbGVjdGlvbicpICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5jb250cm9sbGVyLCAnYXR0YWNobWVudDpjb21wYXQ6d2FpdGluZyBhdHRhY2htZW50OmNvbXBhdDpyZWFkeScsIHRoaXMudXBkYXRlU2F2ZSApO1xuXHR9LFxuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuQXR0YWNobWVudH0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdGRpc3Bvc2U6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLm9wdGlvbnMuc2VsZWN0aW9uO1xuXG5cdFx0Ly8gTWFrZSBzdXJlIGFsbCBzZXR0aW5ncyBhcmUgc2F2ZWQgYmVmb3JlIHJlbW92aW5nIHRoZSB2aWV3LlxuXHRcdHRoaXMudXBkYXRlQWxsKCk7XG5cblx0XHRpZiAoIHNlbGVjdGlvbiApIHtcblx0XHRcdHNlbGVjdGlvbi5vZmYoIG51bGwsIG51bGwsIHRoaXMgKTtcblx0XHR9XG5cdFx0LyoqXG5cdFx0ICogY2FsbCAnZGlzcG9zZScgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzc1xuXHRcdCAqL1xuXHRcdFZpZXcucHJvdG90eXBlLmRpc3Bvc2UuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuQXR0YWNobWVudH0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSBfLmRlZmF1bHRzKCB0aGlzLm1vZGVsLnRvSlNPTigpLCB7XG5cdFx0XHRcdG9yaWVudGF0aW9uOiAgICdsYW5kc2NhcGUnLFxuXHRcdFx0XHR1cGxvYWRpbmc6ICAgICBmYWxzZSxcblx0XHRcdFx0dHlwZTogICAgICAgICAgJycsXG5cdFx0XHRcdHN1YnR5cGU6ICAgICAgICcnLFxuXHRcdFx0XHRpY29uOiAgICAgICAgICAnJyxcblx0XHRcdFx0ZmlsZW5hbWU6ICAgICAgJycsXG5cdFx0XHRcdGNhcHRpb246ICAgICAgICcnLFxuXHRcdFx0XHR0aXRsZTogICAgICAgICAnJyxcblx0XHRcdFx0ZGF0ZUZvcm1hdHRlZDogJycsXG5cdFx0XHRcdHdpZHRoOiAgICAgICAgICcnLFxuXHRcdFx0XHRoZWlnaHQ6ICAgICAgICAnJyxcblx0XHRcdFx0Y29tcGF0OiAgICAgICAgZmFsc2UsXG5cdFx0XHRcdGFsdDogICAgICAgICAgICcnLFxuXHRcdFx0XHRkZXNjcmlwdGlvbjogICAnJ1xuXHRcdFx0fSwgdGhpcy5vcHRpb25zICk7XG5cblx0XHRvcHRpb25zLmJ1dHRvbnMgID0gdGhpcy5idXR0b25zO1xuXHRcdG9wdGlvbnMuZGVzY3JpYmUgPSB0aGlzLmNvbnRyb2xsZXIuc3RhdGUoKS5nZXQoJ2Rlc2NyaWJlJyk7XG5cblx0XHRpZiAoICdpbWFnZScgPT09IG9wdGlvbnMudHlwZSApIHtcblx0XHRcdG9wdGlvbnMuc2l6ZSA9IHRoaXMuaW1hZ2VTaXplKCk7XG5cdFx0fVxuXG5cdFx0b3B0aW9ucy5jYW4gPSB7fTtcblx0XHRpZiAoIG9wdGlvbnMubm9uY2VzICkge1xuXHRcdFx0b3B0aW9ucy5jYW4ucmVtb3ZlID0gISEgb3B0aW9ucy5ub25jZXNbJ2RlbGV0ZSddO1xuXHRcdFx0b3B0aW9ucy5jYW4uc2F2ZSA9ICEhIG9wdGlvbnMubm9uY2VzLnVwZGF0ZTtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLmdldCgnYWxsb3dMb2NhbEVkaXRzJykgKSB7XG5cdFx0XHRvcHRpb25zLmFsbG93TG9jYWxFZGl0cyA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKCBvcHRpb25zLnVwbG9hZGluZyAmJiAhIG9wdGlvbnMucGVyY2VudCApIHtcblx0XHRcdG9wdGlvbnMucGVyY2VudCA9IDA7XG5cdFx0fVxuXG5cdFx0dGhpcy52aWV3cy5kZXRhY2goKTtcblx0XHR0aGlzLiRlbC5odG1sKCB0aGlzLnRlbXBsYXRlKCBvcHRpb25zICkgKTtcblxuXHRcdHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCAndXBsb2FkaW5nJywgb3B0aW9ucy51cGxvYWRpbmcgKTtcblxuXHRcdGlmICggb3B0aW9ucy51cGxvYWRpbmcgKSB7XG5cdFx0XHR0aGlzLiRiYXIgPSB0aGlzLiQoJy5tZWRpYS1wcm9ncmVzcy1iYXIgZGl2Jyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGRlbGV0ZSB0aGlzLiRiYXI7XG5cdFx0fVxuXG5cdFx0Ly8gQ2hlY2sgaWYgdGhlIG1vZGVsIGlzIHNlbGVjdGVkLlxuXHRcdHRoaXMudXBkYXRlU2VsZWN0KCk7XG5cblx0XHQvLyBVcGRhdGUgdGhlIHNhdmUgc3RhdHVzLlxuXHRcdHRoaXMudXBkYXRlU2F2ZSgpO1xuXG5cdFx0dGhpcy52aWV3cy5yZW5kZXIoKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHByb2dyZXNzOiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMuJGJhciAmJiB0aGlzLiRiYXIubGVuZ3RoICkge1xuXHRcdFx0dGhpcy4kYmFyLndpZHRoKCB0aGlzLm1vZGVsLmdldCgncGVyY2VudCcpICsgJyUnICk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcblx0ICovXG5cdHRvZ2dsZVNlbGVjdGlvbkhhbmRsZXI6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR2YXIgbWV0aG9kO1xuXG5cdFx0Ly8gRG9uJ3QgZG8gYW55dGhpbmcgaW5zaWRlIGlucHV0cyBhbmQgb24gdGhlIGF0dGFjaG1lbnQgY2hlY2sgYW5kIHJlbW92ZSBidXR0b25zLlxuXHRcdGlmICggJ0lOUFVUJyA9PT0gZXZlbnQudGFyZ2V0Lm5vZGVOYW1lIHx8ICdCVVRUT04nID09PSBldmVudC50YXJnZXQubm9kZU5hbWUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gQ2F0Y2ggYXJyb3cgZXZlbnRzXG5cdFx0aWYgKCAzNyA9PT0gZXZlbnQua2V5Q29kZSB8fCAzOCA9PT0gZXZlbnQua2V5Q29kZSB8fCAzOSA9PT0gZXZlbnQua2V5Q29kZSB8fCA0MCA9PT0gZXZlbnQua2V5Q29kZSApIHtcblx0XHRcdHRoaXMuY29udHJvbGxlci50cmlnZ2VyKCAnYXR0YWNobWVudDprZXlkb3duOmFycm93JywgZXZlbnQgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBDYXRjaCBlbnRlciBhbmQgc3BhY2UgZXZlbnRzXG5cdFx0aWYgKCAna2V5ZG93bicgPT09IGV2ZW50LnR5cGUgJiYgMTMgIT09IGV2ZW50LmtleUNvZGUgJiYgMzIgIT09IGV2ZW50LmtleUNvZGUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdC8vIEluIHRoZSBncmlkIHZpZXcsIGJ1YmJsZSB1cCBhbiBlZGl0OmF0dGFjaG1lbnQgZXZlbnQgdG8gdGhlIGNvbnRyb2xsZXIuXG5cdFx0aWYgKCB0aGlzLmNvbnRyb2xsZXIuaXNNb2RlQWN0aXZlKCAnZ3JpZCcgKSApIHtcblx0XHRcdGlmICggdGhpcy5jb250cm9sbGVyLmlzTW9kZUFjdGl2ZSggJ2VkaXQnICkgKSB7XG5cdFx0XHRcdC8vIFBhc3MgdGhlIGN1cnJlbnQgdGFyZ2V0IHRvIHJlc3RvcmUgZm9jdXMgd2hlbiBjbG9zaW5nXG5cdFx0XHRcdHRoaXMuY29udHJvbGxlci50cmlnZ2VyKCAnZWRpdDphdHRhY2htZW50JywgdGhpcy5tb2RlbCwgZXZlbnQuY3VycmVudFRhcmdldCApO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmICggdGhpcy5jb250cm9sbGVyLmlzTW9kZUFjdGl2ZSggJ3NlbGVjdCcgKSApIHtcblx0XHRcdFx0bWV0aG9kID0gJ3RvZ2dsZSc7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKCBldmVudC5zaGlmdEtleSApIHtcblx0XHRcdG1ldGhvZCA9ICdiZXR3ZWVuJztcblx0XHR9IGVsc2UgaWYgKCBldmVudC5jdHJsS2V5IHx8IGV2ZW50Lm1ldGFLZXkgKSB7XG5cdFx0XHRtZXRob2QgPSAndG9nZ2xlJztcblx0XHR9XG5cblx0XHR0aGlzLnRvZ2dsZVNlbGVjdGlvbih7XG5cdFx0XHRtZXRob2Q6IG1ldGhvZFxuXHRcdH0pO1xuXG5cdFx0dGhpcy5jb250cm9sbGVyLnRyaWdnZXIoICdzZWxlY3Rpb246dG9nZ2xlJyApO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblx0ICovXG5cdHRvZ2dsZVNlbGVjdGlvbjogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0dmFyIGNvbGxlY3Rpb24gPSB0aGlzLmNvbGxlY3Rpb24sXG5cdFx0XHRzZWxlY3Rpb24gPSB0aGlzLm9wdGlvbnMuc2VsZWN0aW9uLFxuXHRcdFx0bW9kZWwgPSB0aGlzLm1vZGVsLFxuXHRcdFx0bWV0aG9kID0gb3B0aW9ucyAmJiBvcHRpb25zLm1ldGhvZCxcblx0XHRcdHNpbmdsZSwgbW9kZWxzLCBzaW5nbGVJbmRleCwgbW9kZWxJbmRleDtcblxuXHRcdGlmICggISBzZWxlY3Rpb24gKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0c2luZ2xlID0gc2VsZWN0aW9uLnNpbmdsZSgpO1xuXHRcdG1ldGhvZCA9IF8uaXNVbmRlZmluZWQoIG1ldGhvZCApID8gc2VsZWN0aW9uLm11bHRpcGxlIDogbWV0aG9kO1xuXG5cdFx0Ly8gSWYgdGhlIGBtZXRob2RgIGlzIHNldCB0byBgYmV0d2VlbmAsIHNlbGVjdCBhbGwgbW9kZWxzIHRoYXRcblx0XHQvLyBleGlzdCBiZXR3ZWVuIHRoZSBjdXJyZW50IGFuZCB0aGUgc2VsZWN0ZWQgbW9kZWwuXG5cdFx0aWYgKCAnYmV0d2VlbicgPT09IG1ldGhvZCAmJiBzaW5nbGUgJiYgc2VsZWN0aW9uLm11bHRpcGxlICkge1xuXHRcdFx0Ly8gSWYgdGhlIG1vZGVscyBhcmUgdGhlIHNhbWUsIHNob3J0LWNpcmN1aXQuXG5cdFx0XHRpZiAoIHNpbmdsZSA9PT0gbW9kZWwgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0c2luZ2xlSW5kZXggPSBjb2xsZWN0aW9uLmluZGV4T2YoIHNpbmdsZSApO1xuXHRcdFx0bW9kZWxJbmRleCAgPSBjb2xsZWN0aW9uLmluZGV4T2YoIHRoaXMubW9kZWwgKTtcblxuXHRcdFx0aWYgKCBzaW5nbGVJbmRleCA8IG1vZGVsSW5kZXggKSB7XG5cdFx0XHRcdG1vZGVscyA9IGNvbGxlY3Rpb24ubW9kZWxzLnNsaWNlKCBzaW5nbGVJbmRleCwgbW9kZWxJbmRleCArIDEgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG1vZGVscyA9IGNvbGxlY3Rpb24ubW9kZWxzLnNsaWNlKCBtb2RlbEluZGV4LCBzaW5nbGVJbmRleCArIDEgKTtcblx0XHRcdH1cblxuXHRcdFx0c2VsZWN0aW9uLmFkZCggbW9kZWxzICk7XG5cdFx0XHRzZWxlY3Rpb24uc2luZ2xlKCBtb2RlbCApO1xuXHRcdFx0cmV0dXJuO1xuXG5cdFx0Ly8gSWYgdGhlIGBtZXRob2RgIGlzIHNldCB0byBgdG9nZ2xlYCwganVzdCBmbGlwIHRoZSBzZWxlY3Rpb25cblx0XHQvLyBzdGF0dXMsIHJlZ2FyZGxlc3Mgb2Ygd2hldGhlciB0aGUgbW9kZWwgaXMgdGhlIHNpbmdsZSBtb2RlbC5cblx0XHR9IGVsc2UgaWYgKCAndG9nZ2xlJyA9PT0gbWV0aG9kICkge1xuXHRcdFx0c2VsZWN0aW9uWyB0aGlzLnNlbGVjdGVkKCkgPyAncmVtb3ZlJyA6ICdhZGQnIF0oIG1vZGVsICk7XG5cdFx0XHRzZWxlY3Rpb24uc2luZ2xlKCBtb2RlbCApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH0gZWxzZSBpZiAoICdhZGQnID09PSBtZXRob2QgKSB7XG5cdFx0XHRzZWxlY3Rpb24uYWRkKCBtb2RlbCApO1xuXHRcdFx0c2VsZWN0aW9uLnNpbmdsZSggbW9kZWwgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBGaXhlcyBidWcgdGhhdCBsb3NlcyBmb2N1cyB3aGVuIHNlbGVjdGluZyBhIGZlYXR1cmVkIGltYWdlXG5cdFx0aWYgKCAhIG1ldGhvZCApIHtcblx0XHRcdG1ldGhvZCA9ICdhZGQnO1xuXHRcdH1cblxuXHRcdGlmICggbWV0aG9kICE9PSAnYWRkJyApIHtcblx0XHRcdG1ldGhvZCA9ICdyZXNldCc7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLnNlbGVjdGVkKCkgKSB7XG5cdFx0XHQvLyBJZiB0aGUgbW9kZWwgaXMgdGhlIHNpbmdsZSBtb2RlbCwgcmVtb3ZlIGl0LlxuXHRcdFx0Ly8gSWYgaXQgaXMgbm90IHRoZSBzYW1lIGFzIHRoZSBzaW5nbGUgbW9kZWwsXG5cdFx0XHQvLyBpdCBub3cgYmVjb21lcyB0aGUgc2luZ2xlIG1vZGVsLlxuXHRcdFx0c2VsZWN0aW9uWyBzaW5nbGUgPT09IG1vZGVsID8gJ3JlbW92ZScgOiAnc2luZ2xlJyBdKCBtb2RlbCApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBJZiB0aGUgbW9kZWwgaXMgbm90IHNlbGVjdGVkLCBydW4gdGhlIGBtZXRob2RgIG9uIHRoZVxuXHRcdFx0Ly8gc2VsZWN0aW9uLiBCeSBkZWZhdWx0LCB3ZSBgcmVzZXRgIHRoZSBzZWxlY3Rpb24sIGJ1dCB0aGVcblx0XHRcdC8vIGBtZXRob2RgIGNhbiBiZSBzZXQgdG8gYGFkZGAgdGhlIG1vZGVsIHRvIHRoZSBzZWxlY3Rpb24uXG5cdFx0XHRzZWxlY3Rpb25bIG1ldGhvZCBdKCBtb2RlbCApO1xuXHRcdFx0c2VsZWN0aW9uLnNpbmdsZSggbW9kZWwgKTtcblx0XHR9XG5cdH0sXG5cblx0dXBkYXRlU2VsZWN0OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzWyB0aGlzLnNlbGVjdGVkKCkgPyAnc2VsZWN0JyA6ICdkZXNlbGVjdCcgXSgpO1xuXHR9LFxuXHQvKipcblx0ICogQHJldHVybnMge3VucmVzb2x2ZWR8Qm9vbGVhbn1cblx0ICovXG5cdHNlbGVjdGVkOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5vcHRpb25zLnNlbGVjdGlvbjtcblx0XHRpZiAoIHNlbGVjdGlvbiApIHtcblx0XHRcdHJldHVybiAhISBzZWxlY3Rpb24uZ2V0KCB0aGlzLm1vZGVsLmNpZCApO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7QmFja2JvbmUuTW9kZWx9IG1vZGVsXG5cdCAqIEBwYXJhbSB7QmFja2JvbmUuQ29sbGVjdGlvbn0gY29sbGVjdGlvblxuXHQgKi9cblx0c2VsZWN0OiBmdW5jdGlvbiggbW9kZWwsIGNvbGxlY3Rpb24gKSB7XG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMub3B0aW9ucy5zZWxlY3Rpb24sXG5cdFx0XHRjb250cm9sbGVyID0gdGhpcy5jb250cm9sbGVyO1xuXG5cdFx0Ly8gQ2hlY2sgaWYgYSBzZWxlY3Rpb24gZXhpc3RzIGFuZCBpZiBpdCdzIHRoZSBjb2xsZWN0aW9uIHByb3ZpZGVkLlxuXHRcdC8vIElmIHRoZXkncmUgbm90IHRoZSBzYW1lIGNvbGxlY3Rpb24sIGJhaWw7IHdlJ3JlIGluIGFub3RoZXJcblx0XHQvLyBzZWxlY3Rpb24ncyBldmVudCBsb29wLlxuXHRcdGlmICggISBzZWxlY3Rpb24gfHwgKCBjb2xsZWN0aW9uICYmIGNvbGxlY3Rpb24gIT09IHNlbGVjdGlvbiApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEJhaWwgaWYgdGhlIG1vZGVsIGlzIGFscmVhZHkgc2VsZWN0ZWQuXG5cdFx0aWYgKCB0aGlzLiRlbC5oYXNDbGFzcyggJ3NlbGVjdGVkJyApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEFkZCAnc2VsZWN0ZWQnIGNsYXNzIHRvIG1vZGVsLCBzZXQgYXJpYS1jaGVja2VkIHRvIHRydWUuXG5cdFx0dGhpcy4kZWwuYWRkQ2xhc3MoICdzZWxlY3RlZCcgKS5hdHRyKCAnYXJpYS1jaGVja2VkJywgdHJ1ZSApO1xuXHRcdC8vICBNYWtlIHRoZSBjaGVja2JveCB0YWJhYmxlLCBleGNlcHQgaW4gbWVkaWEgZ3JpZCAoYnVsayBzZWxlY3QgbW9kZSkuXG5cdFx0aWYgKCAhICggY29udHJvbGxlci5pc01vZGVBY3RpdmUoICdncmlkJyApICYmIGNvbnRyb2xsZXIuaXNNb2RlQWN0aXZlKCAnc2VsZWN0JyApICkgKSB7XG5cdFx0XHR0aGlzLiQoICcuY2hlY2snICkuYXR0ciggJ3RhYmluZGV4JywgJzAnICk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtCYWNrYm9uZS5Nb2RlbH0gbW9kZWxcblx0ICogQHBhcmFtIHtCYWNrYm9uZS5Db2xsZWN0aW9ufSBjb2xsZWN0aW9uXG5cdCAqL1xuXHRkZXNlbGVjdDogZnVuY3Rpb24oIG1vZGVsLCBjb2xsZWN0aW9uICkge1xuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLm9wdGlvbnMuc2VsZWN0aW9uO1xuXG5cdFx0Ly8gQ2hlY2sgaWYgYSBzZWxlY3Rpb24gZXhpc3RzIGFuZCBpZiBpdCdzIHRoZSBjb2xsZWN0aW9uIHByb3ZpZGVkLlxuXHRcdC8vIElmIHRoZXkncmUgbm90IHRoZSBzYW1lIGNvbGxlY3Rpb24sIGJhaWw7IHdlJ3JlIGluIGFub3RoZXJcblx0XHQvLyBzZWxlY3Rpb24ncyBldmVudCBsb29wLlxuXHRcdGlmICggISBzZWxlY3Rpb24gfHwgKCBjb2xsZWN0aW9uICYmIGNvbGxlY3Rpb24gIT09IHNlbGVjdGlvbiApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0aGlzLiRlbC5yZW1vdmVDbGFzcyggJ3NlbGVjdGVkJyApLmF0dHIoICdhcmlhLWNoZWNrZWQnLCBmYWxzZSApXG5cdFx0XHQuZmluZCggJy5jaGVjaycgKS5hdHRyKCAndGFiaW5kZXgnLCAnLTEnICk7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge0JhY2tib25lLk1vZGVsfSBtb2RlbFxuXHQgKiBAcGFyYW0ge0JhY2tib25lLkNvbGxlY3Rpb259IGNvbGxlY3Rpb25cblx0ICovXG5cdGRldGFpbHM6IGZ1bmN0aW9uKCBtb2RlbCwgY29sbGVjdGlvbiApIHtcblx0XHR2YXIgc2VsZWN0aW9uID0gdGhpcy5vcHRpb25zLnNlbGVjdGlvbixcblx0XHRcdGRldGFpbHM7XG5cblx0XHRpZiAoIHNlbGVjdGlvbiAhPT0gY29sbGVjdGlvbiApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRkZXRhaWxzID0gc2VsZWN0aW9uLnNpbmdsZSgpO1xuXHRcdHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCAnZGV0YWlscycsIGRldGFpbHMgPT09IHRoaXMubW9kZWwgKTtcblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzaXplXG5cdCAqIEByZXR1cm5zIHtPYmplY3R9XG5cdCAqL1xuXHRpbWFnZVNpemU6IGZ1bmN0aW9uKCBzaXplICkge1xuXHRcdHZhciBzaXplcyA9IHRoaXMubW9kZWwuZ2V0KCdzaXplcycpLCBtYXRjaGVkID0gZmFsc2U7XG5cblx0XHRzaXplID0gc2l6ZSB8fCAnbWVkaXVtJztcblxuXHRcdC8vIFVzZSB0aGUgcHJvdmlkZWQgaW1hZ2Ugc2l6ZSBpZiBwb3NzaWJsZS5cblx0XHRpZiAoIHNpemVzICkge1xuXHRcdFx0aWYgKCBzaXplc1sgc2l6ZSBdICkge1xuXHRcdFx0XHRtYXRjaGVkID0gc2l6ZXNbIHNpemUgXTtcblx0XHRcdH0gZWxzZSBpZiAoIHNpemVzLmxhcmdlICkge1xuXHRcdFx0XHRtYXRjaGVkID0gc2l6ZXMubGFyZ2U7XG5cdFx0XHR9IGVsc2UgaWYgKCBzaXplcy50aHVtYm5haWwgKSB7XG5cdFx0XHRcdG1hdGNoZWQgPSBzaXplcy50aHVtYm5haWw7XG5cdFx0XHR9IGVsc2UgaWYgKCBzaXplcy5mdWxsICkge1xuXHRcdFx0XHRtYXRjaGVkID0gc2l6ZXMuZnVsbDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBtYXRjaGVkICkge1xuXHRcdFx0XHRyZXR1cm4gXy5jbG9uZSggbWF0Y2hlZCApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHR1cmw6ICAgICAgICAgdGhpcy5tb2RlbC5nZXQoJ3VybCcpLFxuXHRcdFx0d2lkdGg6ICAgICAgIHRoaXMubW9kZWwuZ2V0KCd3aWR0aCcpLFxuXHRcdFx0aGVpZ2h0OiAgICAgIHRoaXMubW9kZWwuZ2V0KCdoZWlnaHQnKSxcblx0XHRcdG9yaWVudGF0aW9uOiB0aGlzLm1vZGVsLmdldCgnb3JpZW50YXRpb24nKVxuXHRcdH07XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcblx0ICovXG5cdHVwZGF0ZVNldHRpbmc6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHR2YXIgJHNldHRpbmcgPSAkKCBldmVudC50YXJnZXQgKS5jbG9zZXN0KCdbZGF0YS1zZXR0aW5nXScpLFxuXHRcdFx0c2V0dGluZywgdmFsdWU7XG5cblx0XHRpZiAoICEgJHNldHRpbmcubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHNldHRpbmcgPSAkc2V0dGluZy5kYXRhKCdzZXR0aW5nJyk7XG5cdFx0dmFsdWUgICA9IGV2ZW50LnRhcmdldC52YWx1ZTtcblxuXHRcdGlmICggdGhpcy5tb2RlbC5nZXQoIHNldHRpbmcgKSAhPT0gdmFsdWUgKSB7XG5cdFx0XHR0aGlzLnNhdmUoIHNldHRpbmcsIHZhbHVlICk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBQYXNzIGFsbCB0aGUgYXJndW1lbnRzIHRvIHRoZSBtb2RlbCdzIHNhdmUgbWV0aG9kLlxuXHQgKlxuXHQgKiBSZWNvcmRzIHRoZSBhZ2dyZWdhdGUgc3RhdHVzIG9mIGFsbCBzYXZlIHJlcXVlc3RzIGFuZCB1cGRhdGVzIHRoZVxuXHQgKiB2aWV3J3MgY2xhc3NlcyBhY2NvcmRpbmdseS5cblx0ICovXG5cdHNhdmU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB2aWV3ID0gdGhpcyxcblx0XHRcdHNhdmUgPSB0aGlzLl9zYXZlID0gdGhpcy5fc2F2ZSB8fCB7IHN0YXR1czogJ3JlYWR5JyB9LFxuXHRcdFx0cmVxdWVzdCA9IHRoaXMubW9kZWwuc2F2ZS5hcHBseSggdGhpcy5tb2RlbCwgYXJndW1lbnRzICksXG5cdFx0XHRyZXF1ZXN0cyA9IHNhdmUucmVxdWVzdHMgPyAkLndoZW4oIHJlcXVlc3QsIHNhdmUucmVxdWVzdHMgKSA6IHJlcXVlc3Q7XG5cblx0XHQvLyBJZiB3ZSdyZSB3YWl0aW5nIHRvIHJlbW92ZSAnU2F2ZWQuJywgc3RvcC5cblx0XHRpZiAoIHNhdmUuc2F2ZWRUaW1lciApIHtcblx0XHRcdGNsZWFyVGltZW91dCggc2F2ZS5zYXZlZFRpbWVyICk7XG5cdFx0fVxuXG5cdFx0dGhpcy51cGRhdGVTYXZlKCd3YWl0aW5nJyk7XG5cdFx0c2F2ZS5yZXF1ZXN0cyA9IHJlcXVlc3RzO1xuXHRcdHJlcXVlc3RzLmFsd2F5cyggZnVuY3Rpb24oKSB7XG5cdFx0XHQvLyBJZiB3ZSd2ZSBwZXJmb3JtZWQgYW5vdGhlciByZXF1ZXN0IHNpbmNlIHRoaXMgb25lLCBiYWlsLlxuXHRcdFx0aWYgKCBzYXZlLnJlcXVlc3RzICE9PSByZXF1ZXN0cyApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXG5cdFx0XHR2aWV3LnVwZGF0ZVNhdmUoIHJlcXVlc3RzLnN0YXRlKCkgPT09ICdyZXNvbHZlZCcgPyAnY29tcGxldGUnIDogJ2Vycm9yJyApO1xuXHRcdFx0c2F2ZS5zYXZlZFRpbWVyID0gc2V0VGltZW91dCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZpZXcudXBkYXRlU2F2ZSgncmVhZHknKTtcblx0XHRcdFx0ZGVsZXRlIHNhdmUuc2F2ZWRUaW1lcjtcblx0XHRcdH0sIDIwMDAgKTtcblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzdGF0dXNcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuQXR0YWNobWVudH0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHVwZGF0ZVNhdmU6IGZ1bmN0aW9uKCBzdGF0dXMgKSB7XG5cdFx0dmFyIHNhdmUgPSB0aGlzLl9zYXZlID0gdGhpcy5fc2F2ZSB8fCB7IHN0YXR1czogJ3JlYWR5JyB9O1xuXG5cdFx0aWYgKCBzdGF0dXMgJiYgc3RhdHVzICE9PSBzYXZlLnN0YXR1cyApIHtcblx0XHRcdHRoaXMuJGVsLnJlbW92ZUNsYXNzKCAnc2F2ZS0nICsgc2F2ZS5zdGF0dXMgKTtcblx0XHRcdHNhdmUuc3RhdHVzID0gc3RhdHVzO1xuXHRcdH1cblxuXHRcdHRoaXMuJGVsLmFkZENsYXNzKCAnc2F2ZS0nICsgc2F2ZS5zdGF0dXMgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHR1cGRhdGVBbGw6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciAkc2V0dGluZ3MgPSB0aGlzLiQoJ1tkYXRhLXNldHRpbmddJyksXG5cdFx0XHRtb2RlbCA9IHRoaXMubW9kZWwsXG5cdFx0XHRjaGFuZ2VkO1xuXG5cdFx0Y2hhbmdlZCA9IF8uY2hhaW4oICRzZXR0aW5ncyApLm1hcCggZnVuY3Rpb24oIGVsICkge1xuXHRcdFx0dmFyICRpbnB1dCA9ICQoJ2lucHV0LCB0ZXh0YXJlYSwgc2VsZWN0LCBbdmFsdWVdJywgZWwgKSxcblx0XHRcdFx0c2V0dGluZywgdmFsdWU7XG5cblx0XHRcdGlmICggISAkaW5wdXQubGVuZ3RoICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHNldHRpbmcgPSAkKGVsKS5kYXRhKCdzZXR0aW5nJyk7XG5cdFx0XHR2YWx1ZSA9ICRpbnB1dC52YWwoKTtcblxuXHRcdFx0Ly8gUmVjb3JkIHRoZSB2YWx1ZSBpZiBpdCBjaGFuZ2VkLlxuXHRcdFx0aWYgKCBtb2RlbC5nZXQoIHNldHRpbmcgKSAhPT0gdmFsdWUgKSB7XG5cdFx0XHRcdHJldHVybiBbIHNldHRpbmcsIHZhbHVlIF07XG5cdFx0XHR9XG5cdFx0fSkuY29tcGFjdCgpLm9iamVjdCgpLnZhbHVlKCk7XG5cblx0XHRpZiAoICEgXy5pc0VtcHR5KCBjaGFuZ2VkICkgKSB7XG5cdFx0XHRtb2RlbC5zYXZlKCBjaGFuZ2VkICk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHRyZW1vdmVGcm9tTGlicmFyeTogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdC8vIENhdGNoIGVudGVyIGFuZCBzcGFjZSBldmVudHNcblx0XHRpZiAoICdrZXlkb3duJyA9PT0gZXZlbnQudHlwZSAmJiAxMyAhPT0gZXZlbnQua2V5Q29kZSAmJiAzMiAhPT0gZXZlbnQua2V5Q29kZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBTdG9wIHByb3BhZ2F0aW9uIHNvIHRoZSBtb2RlbCBpc24ndCBzZWxlY3RlZC5cblx0XHRldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcblxuXHRcdHRoaXMuY29sbGVjdGlvbi5yZW1vdmUoIHRoaXMubW9kZWwgKTtcblx0fSxcblxuXHQvKipcblx0ICogQWRkIHRoZSBtb2RlbCBpZiBpdCBpc24ndCBpbiB0aGUgc2VsZWN0aW9uLCBpZiBpdCBpcyBpbiB0aGUgc2VsZWN0aW9uLFxuXHQgKiByZW1vdmUgaXQuXG5cdCAqXG5cdCAqIEBwYXJhbSAge1t0eXBlXX0gZXZlbnQgW2Rlc2NyaXB0aW9uXVxuXHQgKiBAcmV0dXJuIHtbdHlwZV19ICAgICAgIFtkZXNjcmlwdGlvbl1cblx0ICovXG5cdGNoZWNrQ2xpY2tIYW5kbGVyOiBmdW5jdGlvbiAoIGV2ZW50ICkge1xuXHRcdHZhciBzZWxlY3Rpb24gPSB0aGlzLm9wdGlvbnMuc2VsZWN0aW9uO1xuXHRcdGlmICggISBzZWxlY3Rpb24gKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdGlmICggc2VsZWN0aW9uLndoZXJlKCB7IGlkOiB0aGlzLm1vZGVsLmdldCggJ2lkJyApIH0gKS5sZW5ndGggKSB7XG5cdFx0XHRzZWxlY3Rpb24ucmVtb3ZlKCB0aGlzLm1vZGVsICk7XG5cdFx0XHQvLyBNb3ZlIGZvY3VzIGJhY2sgdG8gdGhlIGF0dGFjaG1lbnQgdGlsZSAoZnJvbSB0aGUgY2hlY2spLlxuXHRcdFx0dGhpcy4kZWwuZm9jdXMoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c2VsZWN0aW9uLmFkZCggdGhpcy5tb2RlbCApO1xuXHRcdH1cblx0fVxufSk7XG5cbi8vIEVuc3VyZSBzZXR0aW5ncyByZW1haW4gaW4gc3luYyBiZXR3ZWVuIGF0dGFjaG1lbnQgdmlld3MuXG5fLmVhY2goe1xuXHRjYXB0aW9uOiAnX3N5bmNDYXB0aW9uJyxcblx0dGl0bGU6ICAgJ19zeW5jVGl0bGUnLFxuXHRhcnRpc3Q6ICAnX3N5bmNBcnRpc3QnLFxuXHRhbGJ1bTogICAnX3N5bmNBbGJ1bSdcbn0sIGZ1bmN0aW9uKCBtZXRob2QsIHNldHRpbmcgKSB7XG5cdC8qKlxuXHQgKiBAcGFyYW0ge0JhY2tib25lLk1vZGVsfSBtb2RlbFxuXHQgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWVcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuQXR0YWNobWVudH0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdEF0dGFjaG1lbnQucHJvdG90eXBlWyBtZXRob2QgXSA9IGZ1bmN0aW9uKCBtb2RlbCwgdmFsdWUgKSB7XG5cdFx0dmFyICRzZXR0aW5nID0gdGhpcy4kKCdbZGF0YS1zZXR0aW5nPVwiJyArIHNldHRpbmcgKyAnXCJdJyk7XG5cblx0XHRpZiAoICEgJHNldHRpbmcubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0Ly8gSWYgdGhlIHVwZGF0ZWQgdmFsdWUgaXMgaW4gc3luYyB3aXRoIHRoZSB2YWx1ZSBpbiB0aGUgRE9NLCB0aGVyZVxuXHRcdC8vIGlzIG5vIG5lZWQgdG8gcmUtcmVuZGVyLiBJZiB3ZSdyZSBjdXJyZW50bHkgZWRpdGluZyB0aGUgdmFsdWUsXG5cdFx0Ly8gaXQgd2lsbCBhdXRvbWF0aWNhbGx5IGJlIGluIHN5bmMsIHN1cHByZXNzaW5nIHRoZSByZS1yZW5kZXIgZm9yXG5cdFx0Ly8gdGhlIHZpZXcgd2UncmUgZWRpdGluZywgd2hpbGUgdXBkYXRpbmcgYW55IG90aGVycy5cblx0XHRpZiAoIHZhbHVlID09PSAkc2V0dGluZy5maW5kKCdpbnB1dCwgdGV4dGFyZWEsIHNlbGVjdCwgW3ZhbHVlXScpLnZhbCgpICkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMucmVuZGVyKCk7XG5cdH07XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBdHRhY2htZW50O1xuIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5BdHRhY2htZW50LkRldGFpbHNcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIEF0dGFjaG1lbnQgPSB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnQsXG5cdGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdERldGFpbHM7XG5cbkRldGFpbHMgPSBBdHRhY2htZW50LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAgJ2RpdicsXG5cdGNsYXNzTmFtZTogJ2F0dGFjaG1lbnQtZGV0YWlscycsXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoJ2F0dGFjaG1lbnQtZGV0YWlscycpLFxuXG5cdGF0dHJpYnV0ZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHQndGFiSW5kZXgnOiAgICAgMCxcblx0XHRcdCdkYXRhLWlkJzogICAgICB0aGlzLm1vZGVsLmdldCggJ2lkJyApXG5cdFx0fTtcblx0fSxcblxuXHRldmVudHM6IHtcblx0XHQnY2hhbmdlIFtkYXRhLXNldHRpbmddJzogICAgICAgICAgJ3VwZGF0ZVNldHRpbmcnLFxuXHRcdCdjaGFuZ2UgW2RhdGEtc2V0dGluZ10gaW5wdXQnOiAgICAndXBkYXRlU2V0dGluZycsXG5cdFx0J2NoYW5nZSBbZGF0YS1zZXR0aW5nXSBzZWxlY3QnOiAgICd1cGRhdGVTZXR0aW5nJyxcblx0XHQnY2hhbmdlIFtkYXRhLXNldHRpbmddIHRleHRhcmVhJzogJ3VwZGF0ZVNldHRpbmcnLFxuXHRcdCdjbGljayAuZGVsZXRlLWF0dGFjaG1lbnQnOiAgICAgICAnZGVsZXRlQXR0YWNobWVudCcsXG5cdFx0J2NsaWNrIC50cmFzaC1hdHRhY2htZW50JzogICAgICAgICd0cmFzaEF0dGFjaG1lbnQnLFxuXHRcdCdjbGljayAudW50cmFzaC1hdHRhY2htZW50JzogICAgICAndW50cmFzaEF0dGFjaG1lbnQnLFxuXHRcdCdjbGljayAuZWRpdC1hdHRhY2htZW50JzogICAgICAgICAnZWRpdEF0dGFjaG1lbnQnLFxuXHRcdCdrZXlkb3duJzogICAgICAgICAgICAgICAgICAgICAgICAndG9nZ2xlU2VsZWN0aW9uSGFuZGxlcidcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm9wdGlvbnMgPSBfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdHJlcmVuZGVyT25Nb2RlbENoYW5nZTogZmFsc2Vcblx0XHR9KTtcblxuXHRcdHRoaXMub24oICdyZWFkeScsIHRoaXMuaW5pdGlhbEZvY3VzICk7XG5cdFx0Ly8gQ2FsbCAnaW5pdGlhbGl6ZScgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzcy5cblx0XHRBdHRhY2htZW50LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHRpbml0aWFsRm9jdXM6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggISB3cC5tZWRpYS5pc1RvdWNoRGV2aWNlICkge1xuXHRcdFx0Lypcblx0XHRcdFByZXZpb3VzbHkgZm9jdXNlZCB0aGUgZmlyc3QgJzppbnB1dCcgKHRoZSByZWFkb25seSBVUkwgdGV4dCBmaWVsZCkuXG5cdFx0XHRTaW5jZSB0aGUgZmlyc3QgJzppbnB1dCcgaXMgbm93IGEgYnV0dG9uIChkZWxldGUvdHJhc2gpOiB3aGVuIHByZXNzaW5nXG5cdFx0XHRzcGFjZWJhciBvbiBhbiBhdHRhY2htZW50LCBGaXJlZm94IGZpcmVzIGRlbGV0ZUF0dGFjaG1lbnQvdHJhc2hBdHRhY2htZW50XG5cdFx0XHRhcyBzb29uIGFzIGZvY3VzIGlzIG1vdmVkLiBFeHBsaWNpdGx5IHRhcmdldCB0aGUgZmlyc3QgdGV4dCBmaWVsZCBmb3Igbm93LlxuXHRcdFx0QHRvZG8gY2hhbmdlIGluaXRpYWwgZm9jdXMgbG9naWMsIGFsc28gZm9yIGFjY2Vzc2liaWxpdHkuXG5cdFx0XHQqL1xuXHRcdFx0dGhpcy4kKCAnaW5wdXRbdHlwZT1cInRleHRcIl0nICkuZXEoIDAgKS5mb2N1cygpO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuXHQgKi9cblx0ZGVsZXRlQXR0YWNobWVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRpZiAoIHdpbmRvdy5jb25maXJtKCBsMTBuLndhcm5EZWxldGUgKSApIHtcblx0XHRcdHRoaXMubW9kZWwuZGVzdHJveSgpO1xuXHRcdFx0Ly8gS2VlcCBmb2N1cyBpbnNpZGUgbWVkaWEgbW9kYWxcblx0XHRcdC8vIGFmdGVyIGltYWdlIGlzIGRlbGV0ZWRcblx0XHRcdHRoaXMuY29udHJvbGxlci5tb2RhbC5mb2N1c01hbmFnZXIuZm9jdXMoKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZXZlbnRcblx0ICovXG5cdHRyYXNoQXR0YWNobWVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBsaWJyYXJ5ID0gdGhpcy5jb250cm9sbGVyLmxpYnJhcnk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGlmICggd3AubWVkaWEudmlldy5zZXR0aW5ncy5tZWRpYVRyYXNoICYmXG5cdFx0XHQnZWRpdC1tZXRhZGF0YScgPT09IHRoaXMuY29udHJvbGxlci5jb250ZW50Lm1vZGUoKSApIHtcblxuXHRcdFx0dGhpcy5tb2RlbC5zZXQoICdzdGF0dXMnLCAndHJhc2gnICk7XG5cdFx0XHR0aGlzLm1vZGVsLnNhdmUoKS5kb25lKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0bGlicmFyeS5fcmVxdWVyeSggdHJ1ZSApO1xuXHRcdFx0fSApO1xuXHRcdH0gIGVsc2Uge1xuXHRcdFx0dGhpcy5tb2RlbC5kZXN0cm95KCk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHR1bnRyYXNoQXR0YWNobWVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBsaWJyYXJ5ID0gdGhpcy5jb250cm9sbGVyLmxpYnJhcnk7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdHRoaXMubW9kZWwuc2V0KCAnc3RhdHVzJywgJ2luaGVyaXQnICk7XG5cdFx0dGhpcy5tb2RlbC5zYXZlKCkuZG9uZSggZnVuY3Rpb24oKSB7XG5cdFx0XHRsaWJyYXJ5Ll9yZXF1ZXJ5KCB0cnVlICk7XG5cdFx0fSApO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHRlZGl0QXR0YWNobWVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBlZGl0U3RhdGUgPSB0aGlzLmNvbnRyb2xsZXIuc3RhdGVzLmdldCggJ2VkaXQtaW1hZ2UnICk7XG5cdFx0aWYgKCB3aW5kb3cuaW1hZ2VFZGl0ICYmIGVkaXRTdGF0ZSApIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cblx0XHRcdGVkaXRTdGF0ZS5zZXQoICdpbWFnZScsIHRoaXMubW9kZWwgKTtcblx0XHRcdHRoaXMuY29udHJvbGxlci5zZXRTdGF0ZSggJ2VkaXQtaW1hZ2UnICk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuJGVsLmFkZENsYXNzKCduZWVkcy1yZWZyZXNoJyk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogV2hlbiByZXZlcnNlIHRhYmJpbmcoc2hpZnQrdGFiKSBvdXQgb2YgdGhlIHJpZ2h0IGRldGFpbHMgcGFuZWwsIGRlbGl2ZXJcblx0ICogdGhlIGZvY3VzIHRvIHRoZSBpdGVtIGluIHRoZSBsaXN0IHRoYXQgd2FzIGJlaW5nIGVkaXRlZC5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHR0b2dnbGVTZWxlY3Rpb25IYW5kbGVyOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0aWYgKCAna2V5ZG93bicgPT09IGV2ZW50LnR5cGUgJiYgOSA9PT0gZXZlbnQua2V5Q29kZSAmJiBldmVudC5zaGlmdEtleSAmJiBldmVudC50YXJnZXQgPT09IHRoaXMuJCggJzp0YWJiYWJsZScgKS5nZXQoIDAgKSApIHtcblx0XHRcdHRoaXMuY29udHJvbGxlci50cmlnZ2VyKCAnYXR0YWNobWVudDpkZXRhaWxzOnNoaWZ0LXRhYicsIGV2ZW50ICk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0aWYgKCAzNyA9PT0gZXZlbnQua2V5Q29kZSB8fCAzOCA9PT0gZXZlbnQua2V5Q29kZSB8fCAzOSA9PT0gZXZlbnQua2V5Q29kZSB8fCA0MCA9PT0gZXZlbnQua2V5Q29kZSApIHtcblx0XHRcdHRoaXMuY29udHJvbGxlci50cmlnZ2VyKCAnYXR0YWNobWVudDprZXlkb3duOmFycm93JywgZXZlbnQgKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IERldGFpbHM7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnQuRWRpdExpYnJhcnlcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIEVkaXRMaWJyYXJ5ID0gd3AubWVkaWEudmlldy5BdHRhY2htZW50LmV4dGVuZCh7XG5cdGJ1dHRvbnM6IHtcblx0XHRjbG9zZTogdHJ1ZVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0TGlicmFyeTtcbiIsIi8qZ2xvYmFscyB3cCAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudHMuRWRpdFNlbGVjdGlvblxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudC5TZWxlY3Rpb25cbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIEVkaXRTZWxlY3Rpb24gPSB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnQuU2VsZWN0aW9uLmV4dGVuZCh7XG5cdGJ1dHRvbnM6IHtcblx0XHRjbG9zZTogdHJ1ZVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0U2VsZWN0aW9uO1xuIiwiLypnbG9iYWxzIHdwICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5BdHRhY2htZW50LkxpYnJhcnlcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIExpYnJhcnkgPSB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnQuZXh0ZW5kKHtcblx0YnV0dG9uczoge1xuXHRcdGNoZWNrOiB0cnVlXG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IExpYnJhcnk7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnQuU2VsZWN0aW9uXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5BdHRhY2htZW50XG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBTZWxlY3Rpb24gPSB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnQuZXh0ZW5kKHtcblx0Y2xhc3NOYW1lOiAnYXR0YWNobWVudCBzZWxlY3Rpb24nLFxuXG5cdC8vIE9uIGNsaWNrLCBqdXN0IHNlbGVjdCB0aGUgbW9kZWwsIGluc3RlYWQgb2YgcmVtb3ZpbmcgdGhlIG1vZGVsIGZyb21cblx0Ly8gdGhlIHNlbGVjdGlvbi5cblx0dG9nZ2xlU2VsZWN0aW9uOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm9wdGlvbnMuc2VsZWN0aW9uLnNpbmdsZSggdGhpcy5tb2RlbCApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Rpb247XG4iLCIvKmdsb2JhbHMgd3AsIF8sIGpRdWVyeSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudHNcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFZpZXcgPSB3cC5tZWRpYS5WaWV3LFxuXHQkID0galF1ZXJ5LFxuXHRBdHRhY2htZW50cztcblxuQXR0YWNobWVudHMgPSBWaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAgJ3VsJyxcblx0Y2xhc3NOYW1lOiAnYXR0YWNobWVudHMnLFxuXG5cdGF0dHJpYnV0ZXM6IHtcblx0XHR0YWJJbmRleDogLTFcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVsLmlkID0gXy51bmlxdWVJZCgnX19hdHRhY2htZW50cy12aWV3LScpO1xuXG5cdFx0Xy5kZWZhdWx0cyggdGhpcy5vcHRpb25zLCB7XG5cdFx0XHRyZWZyZXNoU2Vuc2l0aXZpdHk6IHdwLm1lZGlhLmlzVG91Y2hEZXZpY2UgPyAzMDAgOiAyMDAsXG5cdFx0XHRyZWZyZXNoVGhyZXNob2xkOiAgIDMsXG5cdFx0XHRBdHRhY2htZW50VmlldzogICAgIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudCxcblx0XHRcdHNvcnRhYmxlOiAgICAgICAgICAgZmFsc2UsXG5cdFx0XHRyZXNpemU6ICAgICAgICAgICAgIHRydWUsXG5cdFx0XHRpZGVhbENvbHVtbldpZHRoOiAgICQoIHdpbmRvdyApLndpZHRoKCkgPCA2NDAgPyAxMzUgOiAxNTBcblx0XHR9KTtcblxuXHRcdHRoaXMuX3ZpZXdzQnlDaWQgPSB7fTtcblx0XHR0aGlzLiR3aW5kb3cgPSAkKCB3aW5kb3cgKTtcblx0XHR0aGlzLnJlc2l6ZUV2ZW50ID0gJ3Jlc2l6ZS5tZWRpYS1tb2RhbC1jb2x1bW5zJztcblxuXHRcdHRoaXMuY29sbGVjdGlvbi5vbiggJ2FkZCcsIGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXHRcdFx0dGhpcy52aWV3cy5hZGQoIHRoaXMuY3JlYXRlQXR0YWNobWVudFZpZXcoIGF0dGFjaG1lbnQgKSwge1xuXHRcdFx0XHRhdDogdGhpcy5jb2xsZWN0aW9uLmluZGV4T2YoIGF0dGFjaG1lbnQgKVxuXHRcdFx0fSk7XG5cdFx0fSwgdGhpcyApO1xuXG5cdFx0dGhpcy5jb2xsZWN0aW9uLm9uKCAncmVtb3ZlJywgZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cdFx0XHR2YXIgdmlldyA9IHRoaXMuX3ZpZXdzQnlDaWRbIGF0dGFjaG1lbnQuY2lkIF07XG5cdFx0XHRkZWxldGUgdGhpcy5fdmlld3NCeUNpZFsgYXR0YWNobWVudC5jaWQgXTtcblxuXHRcdFx0aWYgKCB2aWV3ICkge1xuXHRcdFx0XHR2aWV3LnJlbW92ZSgpO1xuXHRcdFx0fVxuXHRcdH0sIHRoaXMgKTtcblxuXHRcdHRoaXMuY29sbGVjdGlvbi5vbiggJ3Jlc2V0JywgdGhpcy5yZW5kZXIsIHRoaXMgKTtcblxuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMuY29udHJvbGxlciwgJ2xpYnJhcnk6c2VsZWN0aW9uOmFkZCcsICAgIHRoaXMuYXR0YWNobWVudEZvY3VzICk7XG5cblx0XHQvLyBUaHJvdHRsZSB0aGUgc2Nyb2xsIGhhbmRsZXIgYW5kIGJpbmQgdGhpcy5cblx0XHR0aGlzLnNjcm9sbCA9IF8uY2hhaW4oIHRoaXMuc2Nyb2xsICkuYmluZCggdGhpcyApLnRocm90dGxlKCB0aGlzLm9wdGlvbnMucmVmcmVzaFNlbnNpdGl2aXR5ICkudmFsdWUoKTtcblxuXHRcdHRoaXMub3B0aW9ucy5zY3JvbGxFbGVtZW50ID0gdGhpcy5vcHRpb25zLnNjcm9sbEVsZW1lbnQgfHwgdGhpcy5lbDtcblx0XHQkKCB0aGlzLm9wdGlvbnMuc2Nyb2xsRWxlbWVudCApLm9uKCAnc2Nyb2xsJywgdGhpcy5zY3JvbGwgKTtcblxuXHRcdHRoaXMuaW5pdFNvcnRhYmxlKCk7XG5cblx0XHRfLmJpbmRBbGwoIHRoaXMsICdzZXRDb2x1bW5zJyApO1xuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMucmVzaXplICkge1xuXHRcdFx0dGhpcy5vbiggJ3JlYWR5JywgdGhpcy5iaW5kRXZlbnRzICk7XG5cdFx0XHR0aGlzLmNvbnRyb2xsZXIub24oICdvcGVuJywgdGhpcy5zZXRDb2x1bW5zICk7XG5cblx0XHRcdC8vIENhbGwgdGhpcy5zZXRDb2x1bW5zKCkgYWZ0ZXIgdGhpcyB2aWV3IGhhcyBiZWVuIHJlbmRlcmVkIGluIHRoZSBET00gc29cblx0XHRcdC8vIGF0dGFjaG1lbnRzIGdldCBwcm9wZXIgd2lkdGggYXBwbGllZC5cblx0XHRcdF8uZGVmZXIoIHRoaXMuc2V0Q29sdW1ucywgdGhpcyApO1xuXHRcdH1cblx0fSxcblxuXHRiaW5kRXZlbnRzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiR3aW5kb3cub2ZmKCB0aGlzLnJlc2l6ZUV2ZW50ICkub24oIHRoaXMucmVzaXplRXZlbnQsIF8uZGVib3VuY2UoIHRoaXMuc2V0Q29sdW1ucywgNTAgKSApO1xuXHR9LFxuXG5cdGF0dGFjaG1lbnRGb2N1czogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kKCAnbGk6Zmlyc3QnICkuZm9jdXMoKTtcblx0fSxcblxuXHRyZXN0b3JlRm9jdXM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJCggJ2xpLnNlbGVjdGVkOmZpcnN0JyApLmZvY3VzKCk7XG5cdH0sXG5cblx0YXJyb3dFdmVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBhdHRhY2htZW50cyA9IHRoaXMuJGVsLmNoaWxkcmVuKCAnbGknICksXG5cdFx0XHRwZXJSb3cgPSB0aGlzLmNvbHVtbnMsXG5cdFx0XHRpbmRleCA9IGF0dGFjaG1lbnRzLmZpbHRlciggJzpmb2N1cycgKS5pbmRleCgpLFxuXHRcdFx0cm93ID0gKCBpbmRleCArIDEgKSA8PSBwZXJSb3cgPyAxIDogTWF0aC5jZWlsKCAoIGluZGV4ICsgMSApIC8gcGVyUm93ICk7XG5cblx0XHRpZiAoIGluZGV4ID09PSAtMSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBMZWZ0IGFycm93XG5cdFx0aWYgKCAzNyA9PT0gZXZlbnQua2V5Q29kZSApIHtcblx0XHRcdGlmICggMCA9PT0gaW5kZXggKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGF0dGFjaG1lbnRzLmVxKCBpbmRleCAtIDEgKS5mb2N1cygpO1xuXHRcdH1cblxuXHRcdC8vIFVwIGFycm93XG5cdFx0aWYgKCAzOCA9PT0gZXZlbnQua2V5Q29kZSApIHtcblx0XHRcdGlmICggMSA9PT0gcm93ICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRhdHRhY2htZW50cy5lcSggaW5kZXggLSBwZXJSb3cgKS5mb2N1cygpO1xuXHRcdH1cblxuXHRcdC8vIFJpZ2h0IGFycm93XG5cdFx0aWYgKCAzOSA9PT0gZXZlbnQua2V5Q29kZSApIHtcblx0XHRcdGlmICggYXR0YWNobWVudHMubGVuZ3RoID09PSBpbmRleCApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0YXR0YWNobWVudHMuZXEoIGluZGV4ICsgMSApLmZvY3VzKCk7XG5cdFx0fVxuXG5cdFx0Ly8gRG93biBhcnJvd1xuXHRcdGlmICggNDAgPT09IGV2ZW50LmtleUNvZGUgKSB7XG5cdFx0XHRpZiAoIE1hdGguY2VpbCggYXR0YWNobWVudHMubGVuZ3RoIC8gcGVyUm93ICkgPT09IHJvdyApIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0YXR0YWNobWVudHMuZXEoIGluZGV4ICsgcGVyUm93ICkuZm9jdXMoKTtcblx0XHR9XG5cdH0sXG5cblx0ZGlzcG9zZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5jb2xsZWN0aW9uLnByb3BzLm9mZiggbnVsbCwgbnVsbCwgdGhpcyApO1xuXHRcdGlmICggdGhpcy5vcHRpb25zLnJlc2l6ZSApIHtcblx0XHRcdHRoaXMuJHdpbmRvdy5vZmYoIHRoaXMucmVzaXplRXZlbnQgKTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBjYWxsICdkaXNwb3NlJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzXG5cdFx0ICovXG5cdFx0Vmlldy5wcm90b3R5cGUuZGlzcG9zZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cblx0c2V0Q29sdW1uczogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHByZXYgPSB0aGlzLmNvbHVtbnMsXG5cdFx0XHR3aWR0aCA9IHRoaXMuJGVsLndpZHRoKCk7XG5cblx0XHRpZiAoIHdpZHRoICkge1xuXHRcdFx0dGhpcy5jb2x1bW5zID0gTWF0aC5taW4oIE1hdGgucm91bmQoIHdpZHRoIC8gdGhpcy5vcHRpb25zLmlkZWFsQ29sdW1uV2lkdGggKSwgMTIgKSB8fCAxO1xuXG5cdFx0XHRpZiAoICEgcHJldiB8fCBwcmV2ICE9PSB0aGlzLmNvbHVtbnMgKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmNsb3Nlc3QoICcubWVkaWEtZnJhbWUtY29udGVudCcgKS5hdHRyKCAnZGF0YS1jb2x1bW5zJywgdGhpcy5jb2x1bW5zICk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdGluaXRTb3J0YWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGNvbGxlY3Rpb24gPSB0aGlzLmNvbGxlY3Rpb247XG5cblx0XHRpZiAoIHdwLm1lZGlhLmlzVG91Y2hEZXZpY2UgfHwgISB0aGlzLm9wdGlvbnMuc29ydGFibGUgfHwgISAkLmZuLnNvcnRhYmxlICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuJGVsLnNvcnRhYmxlKCBfLmV4dGVuZCh7XG5cdFx0XHQvLyBJZiB0aGUgYGNvbGxlY3Rpb25gIGhhcyBhIGBjb21wYXJhdG9yYCwgZGlzYWJsZSBzb3J0aW5nLlxuXHRcdFx0ZGlzYWJsZWQ6ICEhIGNvbGxlY3Rpb24uY29tcGFyYXRvcixcblxuXHRcdFx0Ly8gQ2hhbmdlIHRoZSBwb3NpdGlvbiBvZiB0aGUgYXR0YWNobWVudCBhcyBzb29uIGFzIHRoZVxuXHRcdFx0Ly8gbW91c2UgcG9pbnRlciBvdmVybGFwcyBhIHRodW1ibmFpbC5cblx0XHRcdHRvbGVyYW5jZTogJ3BvaW50ZXInLFxuXG5cdFx0XHQvLyBSZWNvcmQgdGhlIGluaXRpYWwgYGluZGV4YCBvZiB0aGUgZHJhZ2dlZCBtb2RlbC5cblx0XHRcdHN0YXJ0OiBmdW5jdGlvbiggZXZlbnQsIHVpICkge1xuXHRcdFx0XHR1aS5pdGVtLmRhdGEoJ3NvcnRhYmxlSW5kZXhTdGFydCcsIHVpLml0ZW0uaW5kZXgoKSk7XG5cdFx0XHR9LFxuXG5cdFx0XHQvLyBVcGRhdGUgdGhlIG1vZGVsJ3MgaW5kZXggaW4gdGhlIGNvbGxlY3Rpb24uXG5cdFx0XHQvLyBEbyBzbyBzaWxlbnRseSwgYXMgdGhlIHZpZXcgaXMgYWxyZWFkeSBhY2N1cmF0ZS5cblx0XHRcdHVwZGF0ZTogZnVuY3Rpb24oIGV2ZW50LCB1aSApIHtcblx0XHRcdFx0dmFyIG1vZGVsID0gY29sbGVjdGlvbi5hdCggdWkuaXRlbS5kYXRhKCdzb3J0YWJsZUluZGV4U3RhcnQnKSApLFxuXHRcdFx0XHRcdGNvbXBhcmF0b3IgPSBjb2xsZWN0aW9uLmNvbXBhcmF0b3I7XG5cblx0XHRcdFx0Ly8gVGVtcG9yYXJpbHkgZGlzYWJsZSB0aGUgY29tcGFyYXRvciB0byBwcmV2ZW50IGBhZGRgXG5cdFx0XHRcdC8vIGZyb20gcmUtc29ydGluZy5cblx0XHRcdFx0ZGVsZXRlIGNvbGxlY3Rpb24uY29tcGFyYXRvcjtcblxuXHRcdFx0XHQvLyBTaWxlbnRseSBzaGlmdCB0aGUgbW9kZWwgdG8gaXRzIG5ldyBpbmRleC5cblx0XHRcdFx0Y29sbGVjdGlvbi5yZW1vdmUoIG1vZGVsLCB7XG5cdFx0XHRcdFx0c2lsZW50OiB0cnVlXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRjb2xsZWN0aW9uLmFkZCggbW9kZWwsIHtcblx0XHRcdFx0XHRzaWxlbnQ6IHRydWUsXG5cdFx0XHRcdFx0YXQ6ICAgICB1aS5pdGVtLmluZGV4KClcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0Ly8gUmVzdG9yZSB0aGUgY29tcGFyYXRvci5cblx0XHRcdFx0Y29sbGVjdGlvbi5jb21wYXJhdG9yID0gY29tcGFyYXRvcjtcblxuXHRcdFx0XHQvLyBGaXJlIHRoZSBgcmVzZXRgIGV2ZW50IHRvIGVuc3VyZSBvdGhlciBjb2xsZWN0aW9ucyBzeW5jLlxuXHRcdFx0XHRjb2xsZWN0aW9uLnRyaWdnZXIoICdyZXNldCcsIGNvbGxlY3Rpb24gKTtcblxuXHRcdFx0XHQvLyBJZiB0aGUgY29sbGVjdGlvbiBpcyBzb3J0ZWQgYnkgbWVudSBvcmRlcixcblx0XHRcdFx0Ly8gdXBkYXRlIHRoZSBtZW51IG9yZGVyLlxuXHRcdFx0XHRjb2xsZWN0aW9uLnNhdmVNZW51T3JkZXIoKTtcblx0XHRcdH1cblx0XHR9LCB0aGlzLm9wdGlvbnMuc29ydGFibGUgKSApO1xuXG5cdFx0Ly8gSWYgdGhlIGBvcmRlcmJ5YCBwcm9wZXJ0eSBpcyBjaGFuZ2VkIG9uIHRoZSBgY29sbGVjdGlvbmAsXG5cdFx0Ly8gY2hlY2sgdG8gc2VlIGlmIHdlIGhhdmUgYSBgY29tcGFyYXRvcmAuIElmIHNvLCBkaXNhYmxlIHNvcnRpbmcuXG5cdFx0Y29sbGVjdGlvbi5wcm9wcy5vbiggJ2NoYW5nZTpvcmRlcmJ5JywgZnVuY3Rpb24oKSB7XG5cdFx0XHR0aGlzLiRlbC5zb3J0YWJsZSggJ29wdGlvbicsICdkaXNhYmxlZCcsICEhIGNvbGxlY3Rpb24uY29tcGFyYXRvciApO1xuXHRcdH0sIHRoaXMgKTtcblxuXHRcdHRoaXMuY29sbGVjdGlvbi5wcm9wcy5vbiggJ2NoYW5nZTpvcmRlcmJ5JywgdGhpcy5yZWZyZXNoU29ydGFibGUsIHRoaXMgKTtcblx0XHR0aGlzLnJlZnJlc2hTb3J0YWJsZSgpO1xuXHR9LFxuXG5cdHJlZnJlc2hTb3J0YWJsZTogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB3cC5tZWRpYS5pc1RvdWNoRGV2aWNlIHx8ICEgdGhpcy5vcHRpb25zLnNvcnRhYmxlIHx8ICEgJC5mbi5zb3J0YWJsZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBJZiB0aGUgYGNvbGxlY3Rpb25gIGhhcyBhIGBjb21wYXJhdG9yYCwgZGlzYWJsZSBzb3J0aW5nLlxuXHRcdHZhciBjb2xsZWN0aW9uID0gdGhpcy5jb2xsZWN0aW9uLFxuXHRcdFx0b3JkZXJieSA9IGNvbGxlY3Rpb24ucHJvcHMuZ2V0KCdvcmRlcmJ5JyksXG5cdFx0XHRlbmFibGVkID0gJ21lbnVPcmRlcicgPT09IG9yZGVyYnkgfHwgISBjb2xsZWN0aW9uLmNvbXBhcmF0b3I7XG5cblx0XHR0aGlzLiRlbC5zb3J0YWJsZSggJ29wdGlvbicsICdkaXNhYmxlZCcsICEgZW5hYmxlZCApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge3dwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnR9IGF0dGFjaG1lbnRcblx0ICogQHJldHVybnMge3dwLm1lZGlhLlZpZXd9XG5cdCAqL1xuXHRjcmVhdGVBdHRhY2htZW50VmlldzogZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cdFx0dmFyIHZpZXcgPSBuZXcgdGhpcy5vcHRpb25zLkF0dGFjaG1lbnRWaWV3KHtcblx0XHRcdGNvbnRyb2xsZXI6ICAgICAgICAgICB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRtb2RlbDogICAgICAgICAgICAgICAgYXR0YWNobWVudCxcblx0XHRcdGNvbGxlY3Rpb246ICAgICAgICAgICB0aGlzLmNvbGxlY3Rpb24sXG5cdFx0XHRzZWxlY3Rpb246ICAgICAgICAgICAgdGhpcy5vcHRpb25zLnNlbGVjdGlvblxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHRoaXMuX3ZpZXdzQnlDaWRbIGF0dGFjaG1lbnQuY2lkIF0gPSB2aWV3O1xuXHR9LFxuXG5cdHByZXBhcmU6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIENyZWF0ZSBhbGwgb2YgdGhlIEF0dGFjaG1lbnQgdmlld3MsIGFuZCByZXBsYWNlXG5cdFx0Ly8gdGhlIGxpc3QgaW4gYSBzaW5nbGUgRE9NIG9wZXJhdGlvbi5cblx0XHRpZiAoIHRoaXMuY29sbGVjdGlvbi5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLnZpZXdzLnNldCggdGhpcy5jb2xsZWN0aW9uLm1hcCggdGhpcy5jcmVhdGVBdHRhY2htZW50VmlldywgdGhpcyApICk7XG5cblx0XHQvLyBJZiB0aGVyZSBhcmUgbm8gZWxlbWVudHMsIGNsZWFyIHRoZSB2aWV3cyBhbmQgbG9hZCBzb21lLlxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnZpZXdzLnVuc2V0KCk7XG5cdFx0XHR0aGlzLmNvbGxlY3Rpb24ubW9yZSgpLmRvbmUoIHRoaXMuc2Nyb2xsICk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlYWR5OiBmdW5jdGlvbigpIHtcblx0XHQvLyBUcmlnZ2VyIHRoZSBzY3JvbGwgZXZlbnQgdG8gY2hlY2sgaWYgd2UncmUgd2l0aGluIHRoZVxuXHRcdC8vIHRocmVzaG9sZCB0byBxdWVyeSBmb3IgYWRkaXRpb25hbCBhdHRhY2htZW50cy5cblx0XHR0aGlzLnNjcm9sbCgpO1xuXHR9LFxuXG5cdHNjcm9sbDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHZpZXcgPSB0aGlzLFxuXHRcdFx0ZWwgPSB0aGlzLm9wdGlvbnMuc2Nyb2xsRWxlbWVudCxcblx0XHRcdHNjcm9sbFRvcCA9IGVsLnNjcm9sbFRvcCxcblx0XHRcdHRvb2xiYXI7XG5cblx0XHQvLyBUaGUgc2Nyb2xsIGV2ZW50IG9jY3VycyBvbiB0aGUgZG9jdW1lbnQsIGJ1dCB0aGUgZWxlbWVudFxuXHRcdC8vIHRoYXQgc2hvdWxkIGJlIGNoZWNrZWQgaXMgdGhlIGRvY3VtZW50IGJvZHkuXG5cdFx0aWYgKCBlbCA9PT0gZG9jdW1lbnQgKSB7XG5cdFx0XHRlbCA9IGRvY3VtZW50LmJvZHk7XG5cdFx0XHRzY3JvbGxUb3AgPSAkKGRvY3VtZW50KS5zY3JvbGxUb3AoKTtcblx0XHR9XG5cblx0XHRpZiAoICEgJChlbCkuaXMoJzp2aXNpYmxlJykgfHwgISB0aGlzLmNvbGxlY3Rpb24uaGFzTW9yZSgpICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRvb2xiYXIgPSB0aGlzLnZpZXdzLnBhcmVudC50b29sYmFyO1xuXG5cdFx0Ly8gU2hvdyB0aGUgc3Bpbm5lciBvbmx5IGlmIHdlIGFyZSBjbG9zZSB0byB0aGUgYm90dG9tLlxuXHRcdGlmICggZWwuc2Nyb2xsSGVpZ2h0IC0gKCBzY3JvbGxUb3AgKyBlbC5jbGllbnRIZWlnaHQgKSA8IGVsLmNsaWVudEhlaWdodCAvIDMgKSB7XG5cdFx0XHR0b29sYmFyLmdldCgnc3Bpbm5lcicpLnNob3coKTtcblx0XHR9XG5cblx0XHRpZiAoIGVsLnNjcm9sbEhlaWdodCA8IHNjcm9sbFRvcCArICggZWwuY2xpZW50SGVpZ2h0ICogdGhpcy5vcHRpb25zLnJlZnJlc2hUaHJlc2hvbGQgKSApIHtcblx0XHRcdHRoaXMuY29sbGVjdGlvbi5tb3JlKCkuZG9uZShmdW5jdGlvbigpIHtcblx0XHRcdFx0dmlldy5zY3JvbGwoKTtcblx0XHRcdFx0dG9vbGJhci5nZXQoJ3NwaW5uZXInKS5oaWRlKCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF0dGFjaG1lbnRzO1xuIiwiLypnbG9iYWxzIHdwLCBfLCBqUXVlcnkgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRzQnJvd3NlclxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSAgICAgICAgIFtvcHRpb25zXSAgICAgICAgICAgICAgIFRoZSBvcHRpb25zIGhhc2ggcGFzc2VkIHRvIHRoZSB2aWV3LlxuICogQHBhcmFtIHtib29sZWFufHN0cmluZ30gW29wdGlvbnMuZmlsdGVycz1mYWxzZV0gV2hpY2ggZmlsdGVycyB0byBzaG93IGluIHRoZSBicm93c2VyJ3MgdG9vbGJhci5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEFjY2VwdHMgJ3VwbG9hZGVkJyBhbmQgJ2FsbCcuXG4gKiBAcGFyYW0ge2Jvb2xlYW59ICAgICAgICBbb3B0aW9ucy5zZWFyY2g9dHJ1ZV0gICBXaGV0aGVyIHRvIHNob3cgdGhlIHNlYXJjaCBpbnRlcmZhY2UgaW4gdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicm93c2VyJ3MgdG9vbGJhci5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgIFtvcHRpb25zLmRhdGU9dHJ1ZV0gICAgIFdoZXRoZXIgdG8gc2hvdyB0aGUgZGF0ZSBmaWx0ZXIgaW4gdGhlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBicm93c2VyJ3MgdG9vbGJhci5cbiAqIEBwYXJhbSB7Ym9vbGVhbn0gICAgICAgIFtvcHRpb25zLmRpc3BsYXk9ZmFsc2VdIFdoZXRoZXIgdG8gc2hvdyB0aGUgYXR0YWNobWVudHMgZGlzcGxheSBzZXR0aW5nc1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlldyBpbiB0aGUgc2lkZWJhci5cbiAqIEBwYXJhbSB7Ym9vbGVhbnxzdHJpbmd9IFtvcHRpb25zLnNpZGViYXI9dHJ1ZV0gIFdoZXRoZXIgdG8gY3JlYXRlIGEgc2lkZWJhciBmb3IgdGhlIGJyb3dzZXIuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBBY2NlcHRzIHRydWUsIGZhbHNlLCBhbmQgJ2Vycm9ycycuXG4gKi9cbnZhciBWaWV3ID0gd3AubWVkaWEuVmlldyxcblx0bWVkaWFUcmFzaCA9IHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MubWVkaWFUcmFzaCxcblx0bDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0JCA9IGpRdWVyeSxcblx0QXR0YWNobWVudHNCcm93c2VyO1xuXG5BdHRhY2htZW50c0Jyb3dzZXIgPSBWaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAgJ2RpdicsXG5cdGNsYXNzTmFtZTogJ2F0dGFjaG1lbnRzLWJyb3dzZXInLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdF8uZGVmYXVsdHMoIHRoaXMub3B0aW9ucywge1xuXHRcdFx0ZmlsdGVyczogZmFsc2UsXG5cdFx0XHRzZWFyY2g6ICB0cnVlLFxuXHRcdFx0ZGF0ZTogICAgdHJ1ZSxcblx0XHRcdGRpc3BsYXk6IGZhbHNlLFxuXHRcdFx0c2lkZWJhcjogdHJ1ZSxcblx0XHRcdEF0dGFjaG1lbnRWaWV3OiB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnQuTGlicmFyeVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5jb250cm9sbGVyLCAndG9nZ2xlOnVwbG9hZDphdHRhY2htZW50JywgXy5iaW5kKCB0aGlzLnRvZ2dsZVVwbG9hZGVyLCB0aGlzICkgKTtcblx0XHR0aGlzLmNvbnRyb2xsZXIub24oICdlZGl0OnNlbGVjdGlvbicsIHRoaXMuZWRpdFNlbGVjdGlvbiApO1xuXHRcdHRoaXMuY3JlYXRlVG9vbGJhcigpO1xuXHRcdGlmICggdGhpcy5vcHRpb25zLnNpZGViYXIgKSB7XG5cdFx0XHR0aGlzLmNyZWF0ZVNpZGViYXIoKTtcblx0XHR9XG5cdFx0dGhpcy5jcmVhdGVVcGxvYWRlcigpO1xuXHRcdHRoaXMuY3JlYXRlQXR0YWNobWVudHMoKTtcblx0XHR0aGlzLnVwZGF0ZUNvbnRlbnQoKTtcblxuXHRcdGlmICggISB0aGlzLm9wdGlvbnMuc2lkZWJhciB8fCAnZXJyb3JzJyA9PT0gdGhpcy5vcHRpb25zLnNpZGViYXIgKSB7XG5cdFx0XHR0aGlzLiRlbC5hZGRDbGFzcyggJ2hpZGUtc2lkZWJhcicgKTtcblxuXHRcdFx0aWYgKCAnZXJyb3JzJyA9PT0gdGhpcy5vcHRpb25zLnNpZGViYXIgKSB7XG5cdFx0XHRcdHRoaXMuJGVsLmFkZENsYXNzKCAnc2lkZWJhci1mb3ItZXJyb3JzJyApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuY29sbGVjdGlvbi5vbiggJ2FkZCByZW1vdmUgcmVzZXQnLCB0aGlzLnVwZGF0ZUNvbnRlbnQsIHRoaXMgKTtcblx0fSxcblxuXHRlZGl0U2VsZWN0aW9uOiBmdW5jdGlvbiggbW9kYWwgKSB7XG5cdFx0bW9kYWwuJCggJy5tZWRpYS1idXR0b24tYmFja1RvTGlicmFyeScgKS5mb2N1cygpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5BdHRhY2htZW50c0Jyb3dzZXJ9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRkaXNwb3NlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLm9wdGlvbnMuc2VsZWN0aW9uLm9mZiggbnVsbCwgbnVsbCwgdGhpcyApO1xuXHRcdFZpZXcucHJvdG90eXBlLmRpc3Bvc2UuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGNyZWF0ZVRvb2xiYXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBMaWJyYXJ5Vmlld1N3aXRjaGVyLCBGaWx0ZXJzLCB0b29sYmFyT3B0aW9ucztcblxuXHRcdHRvb2xiYXJPcHRpb25zID0ge1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyXG5cdFx0fTtcblxuXHRcdGlmICggdGhpcy5jb250cm9sbGVyLmlzTW9kZUFjdGl2ZSggJ2dyaWQnICkgKSB7XG5cdFx0XHR0b29sYmFyT3B0aW9ucy5jbGFzc05hbWUgPSAnbWVkaWEtdG9vbGJhciB3cC1maWx0ZXInO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCogQG1lbWJlciB7d3AubWVkaWEudmlldy5Ub29sYmFyfVxuXHRcdCovXG5cdFx0dGhpcy50b29sYmFyID0gbmV3IHdwLm1lZGlhLnZpZXcuVG9vbGJhciggdG9vbGJhck9wdGlvbnMgKTtcblxuXHRcdHRoaXMudmlld3MuYWRkKCB0aGlzLnRvb2xiYXIgKTtcblxuXHRcdHRoaXMudG9vbGJhci5zZXQoICdzcGlubmVyJywgbmV3IHdwLm1lZGlhLnZpZXcuU3Bpbm5lcih7XG5cdFx0XHRwcmlvcml0eTogLTYwXG5cdFx0fSkgKTtcblxuXHRcdGlmICggLTEgIT09ICQuaW5BcnJheSggdGhpcy5vcHRpb25zLmZpbHRlcnMsIFsgJ3VwbG9hZGVkJywgJ2FsbCcgXSApICkge1xuXHRcdFx0Ly8gXCJGaWx0ZXJzXCIgd2lsbCByZXR1cm4gYSA8c2VsZWN0PiwgbmVlZCB0byByZW5kZXJcblx0XHRcdC8vIHNjcmVlbiByZWFkZXIgdGV4dCBiZWZvcmVcblx0XHRcdHRoaXMudG9vbGJhci5zZXQoICdmaWx0ZXJzTGFiZWwnLCBuZXcgd3AubWVkaWEudmlldy5MYWJlbCh7XG5cdFx0XHRcdHZhbHVlOiBsMTBuLmZpbHRlckJ5VHlwZSxcblx0XHRcdFx0YXR0cmlidXRlczoge1xuXHRcdFx0XHRcdCdmb3InOiAgJ21lZGlhLWF0dGFjaG1lbnQtZmlsdGVycydcblx0XHRcdFx0fSxcblx0XHRcdFx0cHJpb3JpdHk6ICAgLTgwXG5cdFx0XHR9KS5yZW5kZXIoKSApO1xuXG5cdFx0XHRpZiAoICd1cGxvYWRlZCcgPT09IHRoaXMub3B0aW9ucy5maWx0ZXJzICkge1xuXHRcdFx0XHR0aGlzLnRvb2xiYXIuc2V0KCAnZmlsdGVycycsIG5ldyB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRGaWx0ZXJzLlVwbG9hZGVkKHtcblx0XHRcdFx0XHRjb250cm9sbGVyOiB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRcdFx0bW9kZWw6ICAgICAgdGhpcy5jb2xsZWN0aW9uLnByb3BzLFxuXHRcdFx0XHRcdHByaW9yaXR5OiAgIC04MFxuXHRcdFx0XHR9KS5yZW5kZXIoKSApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0RmlsdGVycyA9IG5ldyB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRGaWx0ZXJzLkFsbCh7XG5cdFx0XHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRcdG1vZGVsOiAgICAgIHRoaXMuY29sbGVjdGlvbi5wcm9wcyxcblx0XHRcdFx0XHRwcmlvcml0eTogICAtODBcblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0dGhpcy50b29sYmFyLnNldCggJ2ZpbHRlcnMnLCBGaWx0ZXJzLnJlbmRlcigpICk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gRmVlbHMgb2RkIHRvIGJyaW5nIHRoZSBnbG9iYWwgbWVkaWEgbGlicmFyeSBzd2l0Y2hlciBpbnRvIHRoZSBBdHRhY2htZW50XG5cdFx0Ly8gYnJvd3NlciB2aWV3LiBJcyB0aGlzIGEgdXNlIGNhc2UgZm9yIGRvQWN0aW9uKCAnYWRkOnRvb2xiYXItaXRlbXM6YXR0YWNobWVudHMtYnJvd3NlcicsIHRoaXMudG9vbGJhciApO1xuXHRcdC8vIHdoaWNoIHRoZSBjb250cm9sbGVyIGNhbiB0YXAgaW50byBhbmQgYWRkIHRoaXMgdmlldz9cblx0XHRpZiAoIHRoaXMuY29udHJvbGxlci5pc01vZGVBY3RpdmUoICdncmlkJyApICkge1xuXHRcdFx0TGlicmFyeVZpZXdTd2l0Y2hlciA9IFZpZXcuZXh0ZW5kKHtcblx0XHRcdFx0Y2xhc3NOYW1lOiAndmlldy1zd2l0Y2ggbWVkaWEtZ3JpZC12aWV3LXN3aXRjaCcsXG5cdFx0XHRcdHRlbXBsYXRlOiB3cC50ZW1wbGF0ZSggJ21lZGlhLWxpYnJhcnktdmlldy1zd2l0Y2hlcicpXG5cdFx0XHR9KTtcblxuXHRcdFx0dGhpcy50b29sYmFyLnNldCggJ2xpYnJhcnlWaWV3U3dpdGNoZXInLCBuZXcgTGlicmFyeVZpZXdTd2l0Y2hlcih7XG5cdFx0XHRcdGNvbnRyb2xsZXI6IHRoaXMuY29udHJvbGxlcixcblx0XHRcdFx0cHJpb3JpdHk6IC05MFxuXHRcdFx0fSkucmVuZGVyKCkgKTtcblxuXHRcdFx0Ly8gRGF0ZUZpbHRlciBpcyBhIDxzZWxlY3Q+LCBzY3JlZW4gcmVhZGVyIHRleHQgbmVlZHMgdG8gYmUgcmVuZGVyZWQgYmVmb3JlXG5cdFx0XHR0aGlzLnRvb2xiYXIuc2V0KCAnZGF0ZUZpbHRlckxhYmVsJywgbmV3IHdwLm1lZGlhLnZpZXcuTGFiZWwoe1xuXHRcdFx0XHR2YWx1ZTogbDEwbi5maWx0ZXJCeURhdGUsXG5cdFx0XHRcdGF0dHJpYnV0ZXM6IHtcblx0XHRcdFx0XHQnZm9yJzogJ21lZGlhLWF0dGFjaG1lbnQtZGF0ZS1maWx0ZXJzJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmlvcml0eTogLTc1XG5cdFx0XHR9KS5yZW5kZXIoKSApO1xuXHRcdFx0dGhpcy50b29sYmFyLnNldCggJ2RhdGVGaWx0ZXInLCBuZXcgd3AubWVkaWEudmlldy5EYXRlRmlsdGVyKHtcblx0XHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRtb2RlbDogICAgICB0aGlzLmNvbGxlY3Rpb24ucHJvcHMsXG5cdFx0XHRcdHByaW9yaXR5OiAtNzVcblx0XHRcdH0pLnJlbmRlcigpICk7XG5cblx0XHRcdC8vIEJ1bGtTZWxlY3Rpb24gaXMgYSA8ZGl2PiB3aXRoIHN1YnZpZXdzLCBpbmNsdWRpbmcgc2NyZWVuIHJlYWRlciB0ZXh0XG5cdFx0XHR0aGlzLnRvb2xiYXIuc2V0KCAnc2VsZWN0TW9kZVRvZ2dsZUJ1dHRvbicsIG5ldyB3cC5tZWRpYS52aWV3LlNlbGVjdE1vZGVUb2dnbGVCdXR0b24oe1xuXHRcdFx0XHR0ZXh0OiBsMTBuLmJ1bGtTZWxlY3QsXG5cdFx0XHRcdGNvbnRyb2xsZXI6IHRoaXMuY29udHJvbGxlcixcblx0XHRcdFx0cHJpb3JpdHk6IC03MFxuXHRcdFx0fSkucmVuZGVyKCkgKTtcblxuXHRcdFx0dGhpcy50b29sYmFyLnNldCggJ2RlbGV0ZVNlbGVjdGVkQnV0dG9uJywgbmV3IHdwLm1lZGlhLnZpZXcuRGVsZXRlU2VsZWN0ZWRCdXR0b24oe1xuXHRcdFx0XHRmaWx0ZXJzOiBGaWx0ZXJzLFxuXHRcdFx0XHRzdHlsZTogJ3ByaW1hcnknLFxuXHRcdFx0XHRkaXNhYmxlZDogdHJ1ZSxcblx0XHRcdFx0dGV4dDogbWVkaWFUcmFzaCA/IGwxMG4udHJhc2hTZWxlY3RlZCA6IGwxMG4uZGVsZXRlU2VsZWN0ZWQsXG5cdFx0XHRcdGNvbnRyb2xsZXI6IHRoaXMuY29udHJvbGxlcixcblx0XHRcdFx0cHJpb3JpdHk6IC02MCxcblx0XHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHZhciBjaGFuZ2VkID0gW10sIHJlbW92ZWQgPSBbXSxcblx0XHRcdFx0XHRcdHNlbGVjdGlvbiA9IHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLmdldCggJ3NlbGVjdGlvbicgKSxcblx0XHRcdFx0XHRcdGxpYnJhcnkgPSB0aGlzLmNvbnRyb2xsZXIuc3RhdGUoKS5nZXQoICdsaWJyYXJ5JyApO1xuXG5cdFx0XHRcdFx0aWYgKCAhIHNlbGVjdGlvbi5sZW5ndGggKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCAhIG1lZGlhVHJhc2ggJiYgISB3aW5kb3cuY29uZmlybSggbDEwbi53YXJuQnVsa0RlbGV0ZSApICkge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICggbWVkaWFUcmFzaCAmJlxuXHRcdFx0XHRcdFx0J3RyYXNoJyAhPT0gc2VsZWN0aW9uLmF0KCAwICkuZ2V0KCAnc3RhdHVzJyApICYmXG5cdFx0XHRcdFx0XHQhIHdpbmRvdy5jb25maXJtKCBsMTBuLndhcm5CdWxrVHJhc2ggKSApIHtcblxuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHNlbGVjdGlvbi5lYWNoKCBmdW5jdGlvbiggbW9kZWwgKSB7XG5cdFx0XHRcdFx0XHRpZiAoICEgbW9kZWwuZ2V0KCAnbm9uY2VzJyApWydkZWxldGUnXSApIHtcblx0XHRcdFx0XHRcdFx0cmVtb3ZlZC5wdXNoKCBtb2RlbCApO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICggbWVkaWFUcmFzaCAmJiAndHJhc2gnID09PSBtb2RlbC5nZXQoICdzdGF0dXMnICkgKSB7XG5cdFx0XHRcdFx0XHRcdG1vZGVsLnNldCggJ3N0YXR1cycsICdpbmhlcml0JyApO1xuXHRcdFx0XHRcdFx0XHRjaGFuZ2VkLnB1c2goIG1vZGVsLnNhdmUoKSApO1xuXHRcdFx0XHRcdFx0XHRyZW1vdmVkLnB1c2goIG1vZGVsICk7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCBtZWRpYVRyYXNoICkge1xuXHRcdFx0XHRcdFx0XHRtb2RlbC5zZXQoICdzdGF0dXMnLCAndHJhc2gnICk7XG5cdFx0XHRcdFx0XHRcdGNoYW5nZWQucHVzaCggbW9kZWwuc2F2ZSgpICk7XG5cdFx0XHRcdFx0XHRcdHJlbW92ZWQucHVzaCggbW9kZWwgKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG1vZGVsLmRlc3Ryb3koe3dhaXQ6IHRydWV9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0XHRpZiAoIGNoYW5nZWQubGVuZ3RoICkge1xuXHRcdFx0XHRcdFx0c2VsZWN0aW9uLnJlbW92ZSggcmVtb3ZlZCApO1xuXG5cdFx0XHRcdFx0XHQkLndoZW4uYXBwbHkoIG51bGwsIGNoYW5nZWQgKS50aGVuKCBfLmJpbmQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0XHRsaWJyYXJ5Ll9yZXF1ZXJ5KCB0cnVlICk7XG5cdFx0XHRcdFx0XHRcdHRoaXMuY29udHJvbGxlci50cmlnZ2VyKCAnc2VsZWN0aW9uOmFjdGlvbjpkb25lJyApO1xuXHRcdFx0XHRcdFx0fSwgdGhpcyApICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMuY29udHJvbGxlci50cmlnZ2VyKCAnc2VsZWN0aW9uOmFjdGlvbjpkb25lJyApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSkucmVuZGVyKCkgKTtcblxuXHRcdFx0aWYgKCBtZWRpYVRyYXNoICkge1xuXHRcdFx0XHR0aGlzLnRvb2xiYXIuc2V0KCAnZGVsZXRlU2VsZWN0ZWRQZXJtYW5lbnRseUJ1dHRvbicsIG5ldyB3cC5tZWRpYS52aWV3LkRlbGV0ZVNlbGVjdGVkUGVybWFuZW50bHlCdXR0b24oe1xuXHRcdFx0XHRcdGZpbHRlcnM6IEZpbHRlcnMsXG5cdFx0XHRcdFx0c3R5bGU6ICdwcmltYXJ5Jyxcblx0XHRcdFx0XHRkaXNhYmxlZDogdHJ1ZSxcblx0XHRcdFx0XHR0ZXh0OiBsMTBuLmRlbGV0ZVNlbGVjdGVkLFxuXHRcdFx0XHRcdGNvbnRyb2xsZXI6IHRoaXMuY29udHJvbGxlcixcblx0XHRcdFx0XHRwcmlvcml0eTogLTU1LFxuXHRcdFx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciByZW1vdmVkID0gW10sIHNlbGVjdGlvbiA9IHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLmdldCggJ3NlbGVjdGlvbicgKTtcblxuXHRcdFx0XHRcdFx0aWYgKCAhIHNlbGVjdGlvbi5sZW5ndGggfHwgISB3aW5kb3cuY29uZmlybSggbDEwbi53YXJuQnVsa0RlbGV0ZSApICkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHNlbGVjdGlvbi5lYWNoKCBmdW5jdGlvbiggbW9kZWwgKSB7XG5cdFx0XHRcdFx0XHRcdGlmICggISBtb2RlbC5nZXQoICdub25jZXMnIClbJ2RlbGV0ZSddICkge1xuXHRcdFx0XHRcdFx0XHRcdHJlbW92ZWQucHVzaCggbW9kZWwgKTtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRtb2RlbC5kZXN0cm95KCk7XG5cdFx0XHRcdFx0XHR9ICk7XG5cblx0XHRcdFx0XHRcdHNlbGVjdGlvbi5yZW1vdmUoIHJlbW92ZWQgKTtcblx0XHRcdFx0XHRcdHRoaXMuY29udHJvbGxlci50cmlnZ2VyKCAnc2VsZWN0aW9uOmFjdGlvbjpkb25lJyApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSkucmVuZGVyKCkgKTtcblx0XHRcdH1cblxuXHRcdH0gZWxzZSBpZiAoIHRoaXMub3B0aW9ucy5kYXRlICkge1xuXHRcdFx0Ly8gRGF0ZUZpbHRlciBpcyBhIDxzZWxlY3Q+LCBzY3JlZW4gcmVhZGVyIHRleHQgbmVlZHMgdG8gYmUgcmVuZGVyZWQgYmVmb3JlXG5cdFx0XHR0aGlzLnRvb2xiYXIuc2V0KCAnZGF0ZUZpbHRlckxhYmVsJywgbmV3IHdwLm1lZGlhLnZpZXcuTGFiZWwoe1xuXHRcdFx0XHR2YWx1ZTogbDEwbi5maWx0ZXJCeURhdGUsXG5cdFx0XHRcdGF0dHJpYnV0ZXM6IHtcblx0XHRcdFx0XHQnZm9yJzogJ21lZGlhLWF0dGFjaG1lbnQtZGF0ZS1maWx0ZXJzJ1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRwcmlvcml0eTogLTc1XG5cdFx0XHR9KS5yZW5kZXIoKSApO1xuXHRcdFx0dGhpcy50b29sYmFyLnNldCggJ2RhdGVGaWx0ZXInLCBuZXcgd3AubWVkaWEudmlldy5EYXRlRmlsdGVyKHtcblx0XHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRtb2RlbDogICAgICB0aGlzLmNvbGxlY3Rpb24ucHJvcHMsXG5cdFx0XHRcdHByaW9yaXR5OiAtNzVcblx0XHRcdH0pLnJlbmRlcigpICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuc2VhcmNoICkge1xuXHRcdFx0Ly8gU2VhcmNoIGlzIGFuIGlucHV0LCBzY3JlZW4gcmVhZGVyIHRleHQgbmVlZHMgdG8gYmUgcmVuZGVyZWQgYmVmb3JlXG5cdFx0XHR0aGlzLnRvb2xiYXIuc2V0KCAnc2VhcmNoTGFiZWwnLCBuZXcgd3AubWVkaWEudmlldy5MYWJlbCh7XG5cdFx0XHRcdHZhbHVlOiBsMTBuLnNlYXJjaE1lZGlhTGFiZWwsXG5cdFx0XHRcdGF0dHJpYnV0ZXM6IHtcblx0XHRcdFx0XHQnZm9yJzogJ21lZGlhLXNlYXJjaC1pbnB1dCdcblx0XHRcdFx0fSxcblx0XHRcdFx0cHJpb3JpdHk6ICAgNjBcblx0XHRcdH0pLnJlbmRlcigpICk7XG5cdFx0XHR0aGlzLnRvb2xiYXIuc2V0KCAnc2VhcmNoJywgbmV3IHdwLm1lZGlhLnZpZXcuU2VhcmNoKHtcblx0XHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRtb2RlbDogICAgICB0aGlzLmNvbGxlY3Rpb24ucHJvcHMsXG5cdFx0XHRcdHByaW9yaXR5OiAgIDYwXG5cdFx0XHR9KS5yZW5kZXIoKSApO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5vcHRpb25zLmRyYWdJbmZvICkge1xuXHRcdFx0dGhpcy50b29sYmFyLnNldCggJ2RyYWdJbmZvJywgbmV3IFZpZXcoe1xuXHRcdFx0XHRlbDogJCggJzxkaXYgY2xhc3M9XCJpbnN0cnVjdGlvbnNcIj4nICsgbDEwbi5kcmFnSW5mbyArICc8L2Rpdj4nIClbMF0sXG5cdFx0XHRcdHByaW9yaXR5OiAtNDBcblx0XHRcdH0pICk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuc3VnZ2VzdGVkV2lkdGggJiYgdGhpcy5vcHRpb25zLnN1Z2dlc3RlZEhlaWdodCApIHtcblx0XHRcdHRoaXMudG9vbGJhci5zZXQoICdzdWdnZXN0ZWREaW1lbnNpb25zJywgbmV3IFZpZXcoe1xuXHRcdFx0XHRlbDogJCggJzxkaXYgY2xhc3M9XCJpbnN0cnVjdGlvbnNcIj4nICsgbDEwbi5zdWdnZXN0ZWREaW1lbnNpb25zICsgJyAnICsgdGhpcy5vcHRpb25zLnN1Z2dlc3RlZFdpZHRoICsgJyAmdGltZXM7ICcgKyB0aGlzLm9wdGlvbnMuc3VnZ2VzdGVkSGVpZ2h0ICsgJzwvZGl2PicgKVswXSxcblx0XHRcdFx0cHJpb3JpdHk6IC00MFxuXHRcdFx0fSkgKTtcblx0XHR9XG5cdH0sXG5cblx0dXBkYXRlQ29udGVudDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHZpZXcgPSB0aGlzLFxuXHRcdFx0bm9JdGVtc1ZpZXc7XG5cblx0XHRpZiAoIHRoaXMuY29udHJvbGxlci5pc01vZGVBY3RpdmUoICdncmlkJyApICkge1xuXHRcdFx0bm9JdGVtc1ZpZXcgPSB2aWV3LmF0dGFjaG1lbnRzTm9SZXN1bHRzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRub0l0ZW1zVmlldyA9IHZpZXcudXBsb2FkZXI7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIHRoaXMuY29sbGVjdGlvbi5sZW5ndGggKSB7XG5cdFx0XHR0aGlzLnRvb2xiYXIuZ2V0KCAnc3Bpbm5lcicgKS5zaG93KCk7XG5cdFx0XHR0aGlzLmRmZCA9IHRoaXMuY29sbGVjdGlvbi5tb3JlKCkuZG9uZSggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdGlmICggISB2aWV3LmNvbGxlY3Rpb24ubGVuZ3RoICkge1xuXHRcdFx0XHRcdG5vSXRlbXNWaWV3LiRlbC5yZW1vdmVDbGFzcyggJ2hpZGRlbicgKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRub0l0ZW1zVmlldy4kZWwuYWRkQ2xhc3MoICdoaWRkZW4nICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmlldy50b29sYmFyLmdldCggJ3NwaW5uZXInICkuaGlkZSgpO1xuXHRcdFx0fSApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRub0l0ZW1zVmlldy4kZWwuYWRkQ2xhc3MoICdoaWRkZW4nICk7XG5cdFx0XHR2aWV3LnRvb2xiYXIuZ2V0KCAnc3Bpbm5lcicgKS5oaWRlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGNyZWF0ZVVwbG9hZGVyOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnVwbG9hZGVyID0gbmV3IHdwLm1lZGlhLnZpZXcuVXBsb2FkZXJJbmxpbmUoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0c3RhdHVzOiAgICAgZmFsc2UsXG5cdFx0XHRtZXNzYWdlOiAgICB0aGlzLmNvbnRyb2xsZXIuaXNNb2RlQWN0aXZlKCAnZ3JpZCcgKSA/ICcnIDogbDEwbi5ub0l0ZW1zRm91bmQsXG5cdFx0XHRjYW5DbG9zZTogICB0aGlzLmNvbnRyb2xsZXIuaXNNb2RlQWN0aXZlKCAnZ3JpZCcgKVxuXHRcdH0pO1xuXG5cdFx0dGhpcy51cGxvYWRlci5oaWRlKCk7XG5cdFx0dGhpcy52aWV3cy5hZGQoIHRoaXMudXBsb2FkZXIgKTtcblx0fSxcblxuXHR0b2dnbGVVcGxvYWRlcjogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLnVwbG9hZGVyLiRlbC5oYXNDbGFzcyggJ2hpZGRlbicgKSApIHtcblx0XHRcdHRoaXMudXBsb2FkZXIuc2hvdygpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLnVwbG9hZGVyLmhpZGUoKTtcblx0XHR9XG5cdH0sXG5cblx0Y3JlYXRlQXR0YWNobWVudHM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuYXR0YWNobWVudHMgPSBuZXcgd3AubWVkaWEudmlldy5BdHRhY2htZW50cyh7XG5cdFx0XHRjb250cm9sbGVyOiAgICAgICAgICAgdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0Y29sbGVjdGlvbjogICAgICAgICAgIHRoaXMuY29sbGVjdGlvbixcblx0XHRcdHNlbGVjdGlvbjogICAgICAgICAgICB0aGlzLm9wdGlvbnMuc2VsZWN0aW9uLFxuXHRcdFx0bW9kZWw6ICAgICAgICAgICAgICAgIHRoaXMubW9kZWwsXG5cdFx0XHRzb3J0YWJsZTogICAgICAgICAgICAgdGhpcy5vcHRpb25zLnNvcnRhYmxlLFxuXHRcdFx0c2Nyb2xsRWxlbWVudDogICAgICAgIHRoaXMub3B0aW9ucy5zY3JvbGxFbGVtZW50LFxuXHRcdFx0aWRlYWxDb2x1bW5XaWR0aDogICAgIHRoaXMub3B0aW9ucy5pZGVhbENvbHVtbldpZHRoLFxuXG5cdFx0XHQvLyBUaGUgc2luZ2xlIGBBdHRhY2htZW50YCB2aWV3IHRvIGJlIHVzZWQgaW4gdGhlIGBBdHRhY2htZW50c2Agdmlldy5cblx0XHRcdEF0dGFjaG1lbnRWaWV3OiB0aGlzLm9wdGlvbnMuQXR0YWNobWVudFZpZXdcblx0XHR9KTtcblxuXHRcdC8vIEFkZCBrZXlkb3duIGxpc3RlbmVyIHRvIHRoZSBpbnN0YW5jZSBvZiB0aGUgQXR0YWNobWVudHMgdmlld1xuXHRcdHRoaXMuYXR0YWNobWVudHMubGlzdGVuVG8oIHRoaXMuY29udHJvbGxlciwgJ2F0dGFjaG1lbnQ6a2V5ZG93bjphcnJvdycsICAgICB0aGlzLmF0dGFjaG1lbnRzLmFycm93RXZlbnQgKTtcblx0XHR0aGlzLmF0dGFjaG1lbnRzLmxpc3RlblRvKCB0aGlzLmNvbnRyb2xsZXIsICdhdHRhY2htZW50OmRldGFpbHM6c2hpZnQtdGFiJywgdGhpcy5hdHRhY2htZW50cy5yZXN0b3JlRm9jdXMgKTtcblxuXHRcdHRoaXMudmlld3MuYWRkKCB0aGlzLmF0dGFjaG1lbnRzICk7XG5cblxuXHRcdGlmICggdGhpcy5jb250cm9sbGVyLmlzTW9kZUFjdGl2ZSggJ2dyaWQnICkgKSB7XG5cdFx0XHR0aGlzLmF0dGFjaG1lbnRzTm9SZXN1bHRzID0gbmV3IFZpZXcoe1xuXHRcdFx0XHRjb250cm9sbGVyOiB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRcdHRhZ05hbWU6ICdwJ1xuXHRcdFx0fSk7XG5cblx0XHRcdHRoaXMuYXR0YWNobWVudHNOb1Jlc3VsdHMuJGVsLmFkZENsYXNzKCAnaGlkZGVuIG5vLW1lZGlhJyApO1xuXHRcdFx0dGhpcy5hdHRhY2htZW50c05vUmVzdWx0cy4kZWwuaHRtbCggbDEwbi5ub01lZGlhICk7XG5cblx0XHRcdHRoaXMudmlld3MuYWRkKCB0aGlzLmF0dGFjaG1lbnRzTm9SZXN1bHRzICk7XG5cdFx0fVxuXHR9LFxuXG5cdGNyZWF0ZVNpZGViYXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zLFxuXHRcdFx0c2VsZWN0aW9uID0gb3B0aW9ucy5zZWxlY3Rpb24sXG5cdFx0XHRzaWRlYmFyID0gdGhpcy5zaWRlYmFyID0gbmV3IHdwLm1lZGlhLnZpZXcuU2lkZWJhcih7XG5cdFx0XHRcdGNvbnRyb2xsZXI6IHRoaXMuY29udHJvbGxlclxuXHRcdFx0fSk7XG5cblx0XHR0aGlzLnZpZXdzLmFkZCggc2lkZWJhciApO1xuXG5cdFx0aWYgKCB0aGlzLmNvbnRyb2xsZXIudXBsb2FkZXIgKSB7XG5cdFx0XHRzaWRlYmFyLnNldCggJ3VwbG9hZHMnLCBuZXcgd3AubWVkaWEudmlldy5VcGxvYWRlclN0YXR1cyh7XG5cdFx0XHRcdGNvbnRyb2xsZXI6IHRoaXMuY29udHJvbGxlcixcblx0XHRcdFx0cHJpb3JpdHk6ICAgNDBcblx0XHRcdH0pICk7XG5cdFx0fVxuXG5cdFx0c2VsZWN0aW9uLm9uKCAnc2VsZWN0aW9uOnNpbmdsZScsIHRoaXMuY3JlYXRlU2luZ2xlLCB0aGlzICk7XG5cdFx0c2VsZWN0aW9uLm9uKCAnc2VsZWN0aW9uOnVuc2luZ2xlJywgdGhpcy5kaXNwb3NlU2luZ2xlLCB0aGlzICk7XG5cblx0XHRpZiAoIHNlbGVjdGlvbi5zaW5nbGUoKSApIHtcblx0XHRcdHRoaXMuY3JlYXRlU2luZ2xlKCk7XG5cdFx0fVxuXHR9LFxuXG5cdGNyZWF0ZVNpbmdsZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNpZGViYXIgPSB0aGlzLnNpZGViYXIsXG5cdFx0XHRzaW5nbGUgPSB0aGlzLm9wdGlvbnMuc2VsZWN0aW9uLnNpbmdsZSgpO1xuXG5cdFx0c2lkZWJhci5zZXQoICdkZXRhaWxzJywgbmV3IHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudC5EZXRhaWxzKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMuY29udHJvbGxlcixcblx0XHRcdG1vZGVsOiAgICAgIHNpbmdsZSxcblx0XHRcdHByaW9yaXR5OiAgIDgwXG5cdFx0fSkgKTtcblxuXHRcdHNpZGViYXIuc2V0KCAnY29tcGF0JywgbmV3IHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudENvbXBhdCh7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRtb2RlbDogICAgICBzaW5nbGUsXG5cdFx0XHRwcmlvcml0eTogICAxMjBcblx0XHR9KSApO1xuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuZGlzcGxheSApIHtcblx0XHRcdHNpZGViYXIuc2V0KCAnZGlzcGxheScsIG5ldyB3cC5tZWRpYS52aWV3LlNldHRpbmdzLkF0dGFjaG1lbnREaXNwbGF5KHtcblx0XHRcdFx0Y29udHJvbGxlcjogICB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRcdG1vZGVsOiAgICAgICAgdGhpcy5tb2RlbC5kaXNwbGF5KCBzaW5nbGUgKSxcblx0XHRcdFx0YXR0YWNobWVudDogICBzaW5nbGUsXG5cdFx0XHRcdHByaW9yaXR5OiAgICAgMTYwLFxuXHRcdFx0XHR1c2VyU2V0dGluZ3M6IHRoaXMubW9kZWwuZ2V0KCdkaXNwbGF5VXNlclNldHRpbmdzJylcblx0XHRcdH0pICk7XG5cdFx0fVxuXG5cdFx0Ly8gU2hvdyB0aGUgc2lkZWJhciBvbiBtb2JpbGVcblx0XHRpZiAoIHRoaXMubW9kZWwuaWQgPT09ICdpbnNlcnQnICkge1xuXHRcdFx0c2lkZWJhci4kZWwuYWRkQ2xhc3MoICd2aXNpYmxlJyApO1xuXHRcdH1cblx0fSxcblxuXHRkaXNwb3NlU2luZ2xlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2lkZWJhciA9IHRoaXMuc2lkZWJhcjtcblx0XHRzaWRlYmFyLnVuc2V0KCdkZXRhaWxzJyk7XG5cdFx0c2lkZWJhci51bnNldCgnY29tcGF0Jyk7XG5cdFx0c2lkZWJhci51bnNldCgnZGlzcGxheScpO1xuXHRcdC8vIEhpZGUgdGhlIHNpZGViYXIgb24gbW9iaWxlXG5cdFx0c2lkZWJhci4kZWwucmVtb3ZlQ2xhc3MoICd2aXNpYmxlJyApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBBdHRhY2htZW50c0Jyb3dzZXI7XG4iLCIvKmdsb2JhbHMgd3AsIF8gKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LkF0dGFjaG1lbnRzLlNlbGVjdGlvblxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudHNcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIEF0dGFjaG1lbnRzID0gd3AubWVkaWEudmlldy5BdHRhY2htZW50cyxcblx0U2VsZWN0aW9uO1xuXG5TZWxlY3Rpb24gPSBBdHRhY2htZW50cy5leHRlbmQoe1xuXHRldmVudHM6IHt9LFxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdHNvcnRhYmxlOiAgIGZhbHNlLFxuXHRcdFx0cmVzaXplOiAgICAgZmFsc2UsXG5cblx0XHRcdC8vIFRoZSBzaW5nbGUgYEF0dGFjaG1lbnRgIHZpZXcgdG8gYmUgdXNlZCBpbiB0aGUgYEF0dGFjaG1lbnRzYCB2aWV3LlxuXHRcdFx0QXR0YWNobWVudFZpZXc6IHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudC5TZWxlY3Rpb25cblx0XHR9KTtcblx0XHQvLyBDYWxsICdpbml0aWFsaXplJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzLlxuXHRcdHJldHVybiBBdHRhY2htZW50cy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNlbGVjdGlvbjtcbiIsIi8qZ2xvYmFscyBfLCBCYWNrYm9uZSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuQnV0dG9uR3JvdXBcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyICQgPSBCYWNrYm9uZS4kLFxuXHRCdXR0b25Hcm91cDtcblxuQnV0dG9uR3JvdXAgPSB3cC5tZWRpYS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAgJ2RpdicsXG5cdGNsYXNzTmFtZTogJ2J1dHRvbi1ncm91cCBidXR0b24tbGFyZ2UgbWVkaWEtYnV0dG9uLWdyb3VwJyxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHQvKipcblx0XHQgKiBAbWVtYmVyIHt3cC5tZWRpYS52aWV3LkJ1dHRvbltdfVxuXHRcdCAqL1xuXHRcdHRoaXMuYnV0dG9ucyA9IF8ubWFwKCB0aGlzLm9wdGlvbnMuYnV0dG9ucyB8fCBbXSwgZnVuY3Rpb24oIGJ1dHRvbiApIHtcblx0XHRcdGlmICggYnV0dG9uIGluc3RhbmNlb2YgQmFja2JvbmUuVmlldyApIHtcblx0XHRcdFx0cmV0dXJuIGJ1dHRvbjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBuZXcgd3AubWVkaWEudmlldy5CdXR0b24oIGJ1dHRvbiApLnJlbmRlcigpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0ZGVsZXRlIHRoaXMub3B0aW9ucy5idXR0b25zO1xuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuY2xhc3NlcyApIHtcblx0XHRcdHRoaXMuJGVsLmFkZENsYXNzKCB0aGlzLm9wdGlvbnMuY2xhc3NlcyApO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuQnV0dG9uR3JvdXB9XG5cdCAqL1xuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJGVsLmh0bWwoICQoIF8ucGx1Y2soIHRoaXMuYnV0dG9ucywgJ2VsJyApICkuZGV0YWNoKCkgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQnV0dG9uR3JvdXA7XG4iLCIvKmdsb2JhbHMgXywgQmFja2JvbmUgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LkJ1dHRvblxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgQnV0dG9uID0gd3AubWVkaWEuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiAgICAnYnV0dG9uJyxcblx0Y2xhc3NOYW1lOiAgJ21lZGlhLWJ1dHRvbicsXG5cdGF0dHJpYnV0ZXM6IHsgdHlwZTogJ2J1dHRvbicgfSxcblxuXHRldmVudHM6IHtcblx0XHQnY2xpY2snOiAnY2xpY2snXG5cdH0sXG5cblx0ZGVmYXVsdHM6IHtcblx0XHR0ZXh0OiAgICAgJycsXG5cdFx0c3R5bGU6ICAgICcnLFxuXHRcdHNpemU6ICAgICAnbGFyZ2UnLFxuXHRcdGRpc2FibGVkOiBmYWxzZVxuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdC8qKlxuXHRcdCAqIENyZWF0ZSBhIG1vZGVsIHdpdGggdGhlIHByb3ZpZGVkIGBkZWZhdWx0c2AuXG5cdFx0ICpcblx0XHQgKiBAbWVtYmVyIHtCYWNrYm9uZS5Nb2RlbH1cblx0XHQgKi9cblx0XHR0aGlzLm1vZGVsID0gbmV3IEJhY2tib25lLk1vZGVsKCB0aGlzLmRlZmF1bHRzICk7XG5cblx0XHQvLyBJZiBhbnkgb2YgdGhlIGBvcHRpb25zYCBoYXZlIGEga2V5IGZyb20gYGRlZmF1bHRzYCwgYXBwbHkgaXRzXG5cdFx0Ly8gdmFsdWUgdG8gdGhlIGBtb2RlbGAgYW5kIHJlbW92ZSBpdCBmcm9tIHRoZSBgb3B0aW9ucyBvYmplY3QuXG5cdFx0Xy5lYWNoKCB0aGlzLmRlZmF1bHRzLCBmdW5jdGlvbiggZGVmLCBrZXkgKSB7XG5cdFx0XHR2YXIgdmFsdWUgPSB0aGlzLm9wdGlvbnNbIGtleSBdO1xuXHRcdFx0aWYgKCBfLmlzVW5kZWZpbmVkKCB2YWx1ZSApICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMubW9kZWwuc2V0KCBrZXksIHZhbHVlICk7XG5cdFx0XHRkZWxldGUgdGhpcy5vcHRpb25zWyBrZXkgXTtcblx0XHR9LCB0aGlzICk7XG5cblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnY2hhbmdlJywgdGhpcy5yZW5kZXIgKTtcblx0fSxcblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LkJ1dHRvbn0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGNsYXNzZXMgPSBbICdidXR0b24nLCB0aGlzLmNsYXNzTmFtZSBdLFxuXHRcdFx0bW9kZWwgPSB0aGlzLm1vZGVsLnRvSlNPTigpO1xuXG5cdFx0aWYgKCBtb2RlbC5zdHlsZSApIHtcblx0XHRcdGNsYXNzZXMucHVzaCggJ2J1dHRvbi0nICsgbW9kZWwuc3R5bGUgKTtcblx0XHR9XG5cblx0XHRpZiAoIG1vZGVsLnNpemUgKSB7XG5cdFx0XHRjbGFzc2VzLnB1c2goICdidXR0b24tJyArIG1vZGVsLnNpemUgKTtcblx0XHR9XG5cblx0XHRjbGFzc2VzID0gXy51bmlxKCBjbGFzc2VzLmNvbmNhdCggdGhpcy5vcHRpb25zLmNsYXNzZXMgKSApO1xuXHRcdHRoaXMuZWwuY2xhc3NOYW1lID0gY2xhc3Nlcy5qb2luKCcgJyk7XG5cblx0XHR0aGlzLiRlbC5hdHRyKCAnZGlzYWJsZWQnLCBtb2RlbC5kaXNhYmxlZCApO1xuXHRcdHRoaXMuJGVsLnRleHQoIHRoaXMubW9kZWwuZ2V0KCd0ZXh0JykgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHRjbGljazogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGlmICggJyMnID09PSB0aGlzLmF0dHJpYnV0ZXMuaHJlZiApIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuY2xpY2sgJiYgISB0aGlzLm1vZGVsLmdldCgnZGlzYWJsZWQnKSApIHtcblx0XHRcdHRoaXMub3B0aW9ucy5jbGljay5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBCdXR0b247XG4iLCIvKmdsb2JhbHMgd3AsIF8sIGpRdWVyeSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuQ3JvcHBlclxuICpcbiAqIFVzZXMgdGhlIGltZ0FyZWFTZWxlY3QgcGx1Z2luIHRvIGFsbG93IGEgdXNlciB0byBjcm9wIGFuIGltYWdlLlxuICpcbiAqIFRha2VzIGltZ0FyZWFTZWxlY3Qgb3B0aW9ucyBmcm9tXG4gKiB3cC5jdXN0b21pemUuSGVhZGVyQ29udHJvbC5jYWxjdWxhdGVJbWFnZVNlbGVjdE9wdGlvbnMgdmlhXG4gKiB3cC5jdXN0b21pemUuSGVhZGVyQ29udHJvbC5vcGVuTU0uXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBWaWV3ID0gd3AubWVkaWEuVmlldyxcblx0VXBsb2FkZXJTdGF0dXMgPSB3cC5tZWRpYS52aWV3LlVwbG9hZGVyU3RhdHVzLFxuXHRsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHQkID0galF1ZXJ5LFxuXHRDcm9wcGVyO1xuXG5Dcm9wcGVyID0gVmlldy5leHRlbmQoe1xuXHRjbGFzc05hbWU6ICdjcm9wLWNvbnRlbnQnLFxuXHR0ZW1wbGF0ZTogd3AudGVtcGxhdGUoJ2Nyb3AtY29udGVudCcpLFxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRfLmJpbmRBbGwodGhpcywgJ29uSW1hZ2VMb2FkJyk7XG5cdH0sXG5cdHJlYWR5OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNvbnRyb2xsZXIuZnJhbWUub24oJ2NvbnRlbnQ6ZXJyb3I6Y3JvcCcsIHRoaXMub25FcnJvciwgdGhpcyk7XG5cdFx0dGhpcy4kaW1hZ2UgPSB0aGlzLiRlbC5maW5kKCcuY3JvcC1pbWFnZScpO1xuXHRcdHRoaXMuJGltYWdlLm9uKCdsb2FkJywgdGhpcy5vbkltYWdlTG9hZCk7XG5cdFx0JCh3aW5kb3cpLm9uKCdyZXNpemUuY3JvcHBlcicsIF8uZGVib3VuY2UodGhpcy5vbkltYWdlTG9hZCwgMjUwKSk7XG5cdH0sXG5cdHJlbW92ZTogZnVuY3Rpb24oKSB7XG5cdFx0JCh3aW5kb3cpLm9mZigncmVzaXplLmNyb3BwZXInKTtcblx0XHR0aGlzLiRlbC5yZW1vdmUoKTtcblx0XHR0aGlzLiRlbC5vZmYoKTtcblx0XHRWaWV3LnByb3RvdHlwZS5yZW1vdmUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblx0fSxcblx0cHJlcGFyZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHRpdGxlOiBsMTBuLmNyb3BZb3VySW1hZ2UsXG5cdFx0XHR1cmw6IHRoaXMub3B0aW9ucy5hdHRhY2htZW50LmdldCgndXJsJylcblx0XHR9O1xuXHR9LFxuXHRvbkltYWdlTG9hZDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGltZ09wdGlvbnMgPSB0aGlzLmNvbnRyb2xsZXIuZ2V0KCdpbWdTZWxlY3RPcHRpb25zJyk7XG5cdFx0aWYgKHR5cGVvZiBpbWdPcHRpb25zID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRpbWdPcHRpb25zID0gaW1nT3B0aW9ucyh0aGlzLm9wdGlvbnMuYXR0YWNobWVudCwgdGhpcy5jb250cm9sbGVyKTtcblx0XHR9XG5cblx0XHRpbWdPcHRpb25zID0gXy5leHRlbmQoaW1nT3B0aW9ucywge3BhcmVudDogdGhpcy4kZWx9KTtcblx0XHR0aGlzLnRyaWdnZXIoJ2ltYWdlLWxvYWRlZCcpO1xuXHRcdHRoaXMuY29udHJvbGxlci5pbWdTZWxlY3QgPSB0aGlzLiRpbWFnZS5pbWdBcmVhU2VsZWN0KGltZ09wdGlvbnMpO1xuXHR9LFxuXHRvbkVycm9yOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZmlsZW5hbWUgPSB0aGlzLm9wdGlvbnMuYXR0YWNobWVudC5nZXQoJ2ZpbGVuYW1lJyk7XG5cblx0XHR0aGlzLnZpZXdzLmFkZCggJy51cGxvYWQtZXJyb3JzJywgbmV3IHdwLm1lZGlhLnZpZXcuVXBsb2FkZXJTdGF0dXNFcnJvcih7XG5cdFx0XHRmaWxlbmFtZTogVXBsb2FkZXJTdGF0dXMucHJvdG90eXBlLmZpbGVuYW1lKGZpbGVuYW1lKSxcblx0XHRcdG1lc3NhZ2U6IHdpbmRvdy5fd3BNZWRpYVZpZXdzTDEwbi5jcm9wRXJyb3Jcblx0XHR9KSwgeyBhdDogMCB9KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQ3JvcHBlcjtcbiIsIi8qZ2xvYmFscyB3cCwgXyAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuRWRpdEltYWdlXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBWaWV3ID0gd3AubWVkaWEuVmlldyxcblx0RWRpdEltYWdlO1xuXG5FZGl0SW1hZ2UgPSBWaWV3LmV4dGVuZCh7XG5cdGNsYXNzTmFtZTogJ2ltYWdlLWVkaXRvcicsXG5cdHRlbXBsYXRlOiB3cC50ZW1wbGF0ZSgnaW1hZ2UtZWRpdG9yJyksXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0dGhpcy5lZGl0b3IgPSB3aW5kb3cuaW1hZ2VFZGl0O1xuXHRcdHRoaXMuY29udHJvbGxlciA9IG9wdGlvbnMuY29udHJvbGxlcjtcblx0XHRWaWV3LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHRwcmVwYXJlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gdGhpcy5tb2RlbC50b0pTT04oKTtcblx0fSxcblxuXHRsb2FkRWRpdG9yOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZGZkID0gdGhpcy5lZGl0b3Iub3BlbiggdGhpcy5tb2RlbC5nZXQoJ2lkJyksIHRoaXMubW9kZWwuZ2V0KCdub25jZXMnKS5lZGl0LCB0aGlzICk7XG5cdFx0ZGZkLmRvbmUoIF8uYmluZCggdGhpcy5mb2N1cywgdGhpcyApICk7XG5cdH0sXG5cblx0Zm9jdXM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJCggJy5pbWdlZGl0LXN1Ym1pdCAuYnV0dG9uJyApLmVxKCAwICkuZm9jdXMoKTtcblx0fSxcblxuXHRiYWNrOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbGFzdFN0YXRlID0gdGhpcy5jb250cm9sbGVyLmxhc3RTdGF0ZSgpO1xuXHRcdHRoaXMuY29udHJvbGxlci5zZXRTdGF0ZSggbGFzdFN0YXRlICk7XG5cdH0sXG5cblx0cmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5tb2RlbC5mZXRjaCgpO1xuXHR9LFxuXG5cdHNhdmU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBsYXN0U3RhdGUgPSB0aGlzLmNvbnRyb2xsZXIubGFzdFN0YXRlKCk7XG5cblx0XHR0aGlzLm1vZGVsLmZldGNoKCkuZG9uZSggXy5iaW5kKCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMuY29udHJvbGxlci5zZXRTdGF0ZSggbGFzdFN0YXRlICk7XG5cdFx0fSwgdGhpcyApICk7XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRWRpdEltYWdlO1xuIiwiLyoqXG4gKiB3cC5tZWRpYS52aWV3LkVtYmVkXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBFbWJlZCA9IHdwLm1lZGlhLlZpZXcuZXh0ZW5kKHtcblx0Y2xhc3NOYW1lOiAnbWVkaWEtZW1iZWQnLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdC8qKlxuXHRcdCAqIEBtZW1iZXIge3dwLm1lZGlhLnZpZXcuRW1iZWRVcmx9XG5cdFx0ICovXG5cdFx0dGhpcy51cmwgPSBuZXcgd3AubWVkaWEudmlldy5FbWJlZFVybCh7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRtb2RlbDogICAgICB0aGlzLm1vZGVsLnByb3BzXG5cdFx0fSkucmVuZGVyKCk7XG5cblx0XHR0aGlzLnZpZXdzLnNldChbIHRoaXMudXJsIF0pO1xuXHRcdHRoaXMucmVmcmVzaCgpO1xuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdjaGFuZ2U6dHlwZScsIHRoaXMucmVmcmVzaCApO1xuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdjaGFuZ2U6bG9hZGluZycsIHRoaXMubG9hZGluZyApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gdmlld1xuXHQgKi9cblx0c2V0dGluZ3M6IGZ1bmN0aW9uKCB2aWV3ICkge1xuXHRcdGlmICggdGhpcy5fc2V0dGluZ3MgKSB7XG5cdFx0XHR0aGlzLl9zZXR0aW5ncy5yZW1vdmUoKTtcblx0XHR9XG5cdFx0dGhpcy5fc2V0dGluZ3MgPSB2aWV3O1xuXHRcdHRoaXMudmlld3MuYWRkKCB2aWV3ICk7XG5cdH0sXG5cblx0cmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHR5cGUgPSB0aGlzLm1vZGVsLmdldCgndHlwZScpLFxuXHRcdFx0Y29uc3RydWN0b3I7XG5cblx0XHRpZiAoICdpbWFnZScgPT09IHR5cGUgKSB7XG5cdFx0XHRjb25zdHJ1Y3RvciA9IHdwLm1lZGlhLnZpZXcuRW1iZWRJbWFnZTtcblx0XHR9IGVsc2UgaWYgKCAnbGluaycgPT09IHR5cGUgKSB7XG5cdFx0XHRjb25zdHJ1Y3RvciA9IHdwLm1lZGlhLnZpZXcuRW1iZWRMaW5rO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXR0aW5ncyggbmV3IGNvbnN0cnVjdG9yKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMuY29udHJvbGxlcixcblx0XHRcdG1vZGVsOiAgICAgIHRoaXMubW9kZWwucHJvcHMsXG5cdFx0XHRwcmlvcml0eTogICA0MFxuXHRcdH0pICk7XG5cdH0sXG5cblx0bG9hZGluZzogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZWwudG9nZ2xlQ2xhc3MoICdlbWJlZC1sb2FkaW5nJywgdGhpcy5tb2RlbC5nZXQoJ2xvYWRpbmcnKSApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbWJlZDtcbiIsIi8qZ2xvYmFscyB3cCAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuRW1iZWRJbWFnZVxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuU2V0dGluZ3MuQXR0YWNobWVudERpc3BsYXlcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LlNldHRpbmdzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBBdHRhY2htZW50RGlzcGxheSA9IHdwLm1lZGlhLnZpZXcuU2V0dGluZ3MuQXR0YWNobWVudERpc3BsYXksXG5cdEVtYmVkSW1hZ2U7XG5cbkVtYmVkSW1hZ2UgPSBBdHRhY2htZW50RGlzcGxheS5leHRlbmQoe1xuXHRjbGFzc05hbWU6ICdlbWJlZC1tZWRpYS1zZXR0aW5ncycsXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoJ2VtYmVkLWltYWdlLXNldHRpbmdzJyksXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0LyoqXG5cdFx0ICogQ2FsbCBgaW5pdGlhbGl6ZWAgZGlyZWN0bHkgb24gcGFyZW50IGNsYXNzIHdpdGggcGFzc2VkIGFyZ3VtZW50c1xuXHRcdCAqL1xuXHRcdEF0dGFjaG1lbnREaXNwbGF5LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnY2hhbmdlOnVybCcsIHRoaXMudXBkYXRlSW1hZ2UgKTtcblx0fSxcblxuXHR1cGRhdGVJbWFnZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kKCdpbWcnKS5hdHRyKCAnc3JjJywgdGhpcy5tb2RlbC5nZXQoJ3VybCcpICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEVtYmVkSW1hZ2U7XG4iLCIvKmdsb2JhbHMgd3AsIF8sIGpRdWVyeSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuRW1iZWRMaW5rXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5TZXR0aW5nc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgJCA9IGpRdWVyeSxcblx0RW1iZWRMaW5rO1xuXG5FbWJlZExpbmsgPSB3cC5tZWRpYS52aWV3LlNldHRpbmdzLmV4dGVuZCh7XG5cdGNsYXNzTmFtZTogJ2VtYmVkLWxpbmstc2V0dGluZ3MnLFxuXHR0ZW1wbGF0ZTogIHdwLnRlbXBsYXRlKCdlbWJlZC1saW5rLXNldHRpbmdzJyksXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZTp1cmwnLCB0aGlzLnVwZGF0ZW9FbWJlZCApO1xuXHR9LFxuXG5cdHVwZGF0ZW9FbWJlZDogXy5kZWJvdW5jZSggZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHVybCA9IHRoaXMubW9kZWwuZ2V0KCAndXJsJyApO1xuXG5cdFx0Ly8gY2xlYXIgb3V0IHByZXZpb3VzIHJlc3VsdHNcblx0XHR0aGlzLiQoJy5lbWJlZC1jb250YWluZXInKS5oaWRlKCkuZmluZCgnLmVtYmVkLXByZXZpZXcnKS5lbXB0eSgpO1xuXHRcdHRoaXMuJCggJy5zZXR0aW5nJyApLmhpZGUoKTtcblxuXHRcdC8vIG9ubHkgcHJvY2VlZCB3aXRoIGVtYmVkIGlmIHRoZSBmaWVsZCBjb250YWlucyBtb3JlIHRoYW4gMTEgY2hhcmFjdGVyc1xuXHRcdC8vIEV4YW1wbGU6IGh0dHA6Ly9hLmlvIGlzIDExIGNoYXJzXG5cdFx0aWYgKCB1cmwgJiYgKCB1cmwubGVuZ3RoIDwgMTEgfHwgISB1cmwubWF0Y2goL15odHRwKHMpPzpcXC9cXC8vKSApICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHRoaXMuZmV0Y2goKTtcblx0fSwgd3AubWVkaWEuY29udHJvbGxlci5FbWJlZC5zZW5zaXRpdml0eSApLFxuXG5cdGZldGNoOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZW1iZWQ7XG5cblx0XHQvLyBjaGVjayBpZiB0aGV5IGhhdmVuJ3QgdHlwZWQgaW4gNTAwIG1zXG5cdFx0aWYgKCAkKCcjZW1iZWQtdXJsLWZpZWxkJykudmFsKCkgIT09IHRoaXMubW9kZWwuZ2V0KCd1cmwnKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoIHRoaXMuZGZkICYmICdwZW5kaW5nJyA9PT0gdGhpcy5kZmQuc3RhdGUoKSApIHtcblx0XHRcdHRoaXMuZGZkLmFib3J0KCk7XG5cdFx0fVxuXG5cdFx0ZW1iZWQgPSBuZXcgd3Auc2hvcnRjb2RlKHtcblx0XHRcdHRhZzogJ2VtYmVkJyxcblx0XHRcdGF0dHJzOiBfLnBpY2soIHRoaXMubW9kZWwuYXR0cmlidXRlcywgWyAnd2lkdGgnLCAnaGVpZ2h0JywgJ3NyYycgXSApLFxuXHRcdFx0Y29udGVudDogdGhpcy5tb2RlbC5nZXQoJ3VybCcpXG5cdFx0fSk7XG5cblx0XHR0aGlzLmRmZCA9ICQuYWpheCh7XG5cdFx0XHR0eXBlOiAgICAnUE9TVCcsXG5cdFx0XHR1cmw6ICAgICB3cC5hamF4LnNldHRpbmdzLnVybCxcblx0XHRcdGNvbnRleHQ6IHRoaXMsXG5cdFx0XHRkYXRhOiAgICB7XG5cdFx0XHRcdGFjdGlvbjogJ3BhcnNlLWVtYmVkJyxcblx0XHRcdFx0cG9zdF9JRDogd3AubWVkaWEudmlldy5zZXR0aW5ncy5wb3N0LmlkLFxuXHRcdFx0XHRzaG9ydGNvZGU6IGVtYmVkLnN0cmluZygpXG5cdFx0XHR9XG5cdFx0fSlcblx0XHRcdC5kb25lKCB0aGlzLnJlbmRlcm9FbWJlZCApXG5cdFx0XHQuZmFpbCggdGhpcy5yZW5kZXJGYWlsICk7XG5cdH0sXG5cblx0cmVuZGVyRmFpbDogZnVuY3Rpb24gKCByZXNwb25zZSwgc3RhdHVzICkge1xuXHRcdGlmICggJ2Fib3J0JyA9PT0gc3RhdHVzICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0aGlzLiQoICcubGluay10ZXh0JyApLnNob3coKTtcblx0fSxcblxuXHRyZW5kZXJvRW1iZWQ6IGZ1bmN0aW9uKCByZXNwb25zZSApIHtcblx0XHR2YXIgaHRtbCA9ICggcmVzcG9uc2UgJiYgcmVzcG9uc2UuZGF0YSAmJiByZXNwb25zZS5kYXRhLmJvZHkgKSB8fCAnJztcblxuXHRcdGlmICggaHRtbCApIHtcblx0XHRcdHRoaXMuJCgnLmVtYmVkLWNvbnRhaW5lcicpLnNob3coKS5maW5kKCcuZW1iZWQtcHJldmlldycpLmh0bWwoIGh0bWwgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5yZW5kZXJGYWlsKCk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBFbWJlZExpbms7XG4iLCIvKmdsb2JhbHMgd3AsIF8sIGpRdWVyeSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuRW1iZWRVcmxcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFZpZXcgPSB3cC5tZWRpYS5WaWV3LFxuXHQkID0galF1ZXJ5LFxuXHRFbWJlZFVybDtcblxuRW1iZWRVcmwgPSBWaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAgJ2xhYmVsJyxcblx0Y2xhc3NOYW1lOiAnZW1iZWQtdXJsJyxcblxuXHRldmVudHM6IHtcblx0XHQnaW5wdXQnOiAgJ3VybCcsXG5cdFx0J2tleXVwJzogICd1cmwnLFxuXHRcdCdjaGFuZ2UnOiAndXJsJ1xuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJGlucHV0ID0gJCgnPGlucHV0IGlkPVwiZW1iZWQtdXJsLWZpZWxkXCIgdHlwZT1cInVybFwiIC8+JykudmFsKCB0aGlzLm1vZGVsLmdldCgndXJsJykgKTtcblx0XHR0aGlzLmlucHV0ID0gdGhpcy4kaW5wdXRbMF07XG5cblx0XHR0aGlzLnNwaW5uZXIgPSAkKCc8c3BhbiBjbGFzcz1cInNwaW5uZXJcIiAvPicpWzBdO1xuXHRcdHRoaXMuJGVsLmFwcGVuZChbIHRoaXMuaW5wdXQsIHRoaXMuc3Bpbm5lciBdKTtcblxuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdjaGFuZ2U6dXJsJywgdGhpcy5yZW5kZXIgKTtcblxuXHRcdGlmICggdGhpcy5tb2RlbC5nZXQoICd1cmwnICkgKSB7XG5cdFx0XHRfLmRlbGF5KCBfLmJpbmQoIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0dGhpcy5tb2RlbC50cmlnZ2VyKCAnY2hhbmdlOnVybCcgKTtcblx0XHRcdH0sIHRoaXMgKSwgNTAwICk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuRW1iZWRVcmx9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciAkaW5wdXQgPSB0aGlzLiRpbnB1dDtcblxuXHRcdGlmICggJGlucHV0LmlzKCc6Zm9jdXMnKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLmlucHV0LnZhbHVlID0gdGhpcy5tb2RlbC5nZXQoJ3VybCcpIHx8ICdodHRwOi8vJztcblx0XHQvKipcblx0XHQgKiBDYWxsIGByZW5kZXJgIGRpcmVjdGx5IG9uIHBhcmVudCBjbGFzcyB3aXRoIHBhc3NlZCBhcmd1bWVudHNcblx0XHQgKi9cblx0XHRWaWV3LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHJlYWR5OiBmdW5jdGlvbigpIHtcblx0XHRpZiAoICEgd3AubWVkaWEuaXNUb3VjaERldmljZSApIHtcblx0XHRcdHRoaXMuZm9jdXMoKTtcblx0XHR9XG5cdH0sXG5cblx0dXJsOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dGhpcy5tb2RlbC5zZXQoICd1cmwnLCBldmVudC50YXJnZXQudmFsdWUgKTtcblx0fSxcblxuXHQvKipcblx0ICogSWYgdGhlIGlucHV0IGlzIHZpc2libGUsIGZvY3VzIGFuZCBzZWxlY3QgaXRzIGNvbnRlbnRzLlxuXHQgKi9cblx0Zm9jdXM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciAkaW5wdXQgPSB0aGlzLiRpbnB1dDtcblx0XHRpZiAoICRpbnB1dC5pcygnOnZpc2libGUnKSApIHtcblx0XHRcdCRpbnB1dC5mb2N1cygpWzBdLnNlbGVjdCgpO1xuXHRcdH1cblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRW1iZWRVcmw7XG4iLCIvKipcbiAqIHdwLm1lZGlhLnZpZXcuRm9jdXNNYW5hZ2VyXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBGb2N1c01hbmFnZXIgPSB3cC5tZWRpYS5WaWV3LmV4dGVuZCh7XG5cblx0ZXZlbnRzOiB7XG5cdFx0J2tleWRvd24nOiAnY29uc3RyYWluVGFiYmluZydcblx0fSxcblxuXHRmb2N1czogZnVuY3Rpb24oKSB7IC8vIFJlc2V0IGZvY3VzIG9uIGZpcnN0IGxlZnQgbWVudSBpdGVtXG5cdFx0dGhpcy4kKCcubWVkaWEtbWVudS1pdGVtJykuZmlyc3QoKS5mb2N1cygpO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHRjb25zdHJhaW5UYWJiaW5nOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dmFyIHRhYmJhYmxlcztcblxuXHRcdC8vIExvb2sgZm9yIHRoZSB0YWIga2V5LlxuXHRcdGlmICggOSAhPT0gZXZlbnQua2V5Q29kZSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBTa2lwIHRoZSBmaWxlIGlucHV0IGFkZGVkIGJ5IFBsdXBsb2FkLlxuXHRcdHRhYmJhYmxlcyA9IHRoaXMuJCggJzp0YWJiYWJsZScgKS5ub3QoICcubW94aWUtc2hpbSBpbnB1dFt0eXBlPVwiZmlsZVwiXScgKTtcblxuXHRcdC8vIEtlZXAgdGFiIGZvY3VzIHdpdGhpbiBtZWRpYSBtb2RhbCB3aGlsZSBpdCdzIG9wZW5cblx0XHRpZiAoIHRhYmJhYmxlcy5sYXN0KClbMF0gPT09IGV2ZW50LnRhcmdldCAmJiAhIGV2ZW50LnNoaWZ0S2V5ICkge1xuXHRcdFx0dGFiYmFibGVzLmZpcnN0KCkuZm9jdXMoKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IGVsc2UgaWYgKCB0YWJiYWJsZXMuZmlyc3QoKVswXSA9PT0gZXZlbnQudGFyZ2V0ICYmIGV2ZW50LnNoaWZ0S2V5ICkge1xuXHRcdFx0dGFiYmFibGVzLmxhc3QoKS5mb2N1cygpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fVxuXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBGb2N1c01hbmFnZXI7XG4iLCIvKmdsb2JhbHMgXywgQmFja2JvbmUgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LkZyYW1lXG4gKlxuICogQSBmcmFtZSBpcyBhIGNvbXBvc2l0ZSB2aWV3IGNvbnNpc3Rpbmcgb2Ygb25lIG9yIG1vcmUgcmVnaW9ucyBhbmQgb25lIG9yIG1vcmVcbiAqIHN0YXRlcy5cbiAqXG4gKiBAc2VlIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVcbiAqIEBzZWUgd3AubWVkaWEuY29udHJvbGxlci5SZWdpb25cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqIEBtaXhlcyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlTWFjaGluZVxuICovXG52YXIgRnJhbWUgPSB3cC5tZWRpYS5WaWV3LmV4dGVuZCh7XG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdF8uZGVmYXVsdHMoIHRoaXMub3B0aW9ucywge1xuXHRcdFx0bW9kZTogWyAnc2VsZWN0JyBdXG5cdFx0fSk7XG5cdFx0dGhpcy5fY3JlYXRlUmVnaW9ucygpO1xuXHRcdHRoaXMuX2NyZWF0ZVN0YXRlcygpO1xuXHRcdHRoaXMuX2NyZWF0ZU1vZGVzKCk7XG5cdH0sXG5cblx0X2NyZWF0ZVJlZ2lvbnM6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIENsb25lIHRoZSByZWdpb25zIGFycmF5LlxuXHRcdHRoaXMucmVnaW9ucyA9IHRoaXMucmVnaW9ucyA/IHRoaXMucmVnaW9ucy5zbGljZSgpIDogW107XG5cblx0XHQvLyBJbml0aWFsaXplIHJlZ2lvbnMuXG5cdFx0Xy5lYWNoKCB0aGlzLnJlZ2lvbnMsIGZ1bmN0aW9uKCByZWdpb24gKSB7XG5cdFx0XHR0aGlzWyByZWdpb24gXSA9IG5ldyB3cC5tZWRpYS5jb250cm9sbGVyLlJlZ2lvbih7XG5cdFx0XHRcdHZpZXc6ICAgICB0aGlzLFxuXHRcdFx0XHRpZDogICAgICAgcmVnaW9uLFxuXHRcdFx0XHRzZWxlY3RvcjogJy5tZWRpYS1mcmFtZS0nICsgcmVnaW9uXG5cdFx0XHR9KTtcblx0XHR9LCB0aGlzICk7XG5cdH0sXG5cdC8qKlxuXHQgKiBDcmVhdGUgdGhlIGZyYW1lJ3Mgc3RhdGVzLlxuXHQgKlxuXHQgKiBAc2VlIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVcblx0ICogQHNlZSB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlTWFjaGluZVxuXHQgKlxuXHQgKiBAZmlyZXMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZSNyZWFkeVxuXHQgKi9cblx0X2NyZWF0ZVN0YXRlczogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gQ3JlYXRlIHRoZSBkZWZhdWx0IGBzdGF0ZXNgIGNvbGxlY3Rpb24uXG5cdFx0dGhpcy5zdGF0ZXMgPSBuZXcgQmFja2JvbmUuQ29sbGVjdGlvbiggbnVsbCwge1xuXHRcdFx0bW9kZWw6IHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVcblx0XHR9KTtcblxuXHRcdC8vIEVuc3VyZSBzdGF0ZXMgaGF2ZSBhIHJlZmVyZW5jZSB0byB0aGUgZnJhbWUuXG5cdFx0dGhpcy5zdGF0ZXMub24oICdhZGQnLCBmdW5jdGlvbiggbW9kZWwgKSB7XG5cdFx0XHRtb2RlbC5mcmFtZSA9IHRoaXM7XG5cdFx0XHRtb2RlbC50cmlnZ2VyKCdyZWFkeScpO1xuXHRcdH0sIHRoaXMgKTtcblxuXHRcdGlmICggdGhpcy5vcHRpb25zLnN0YXRlcyApIHtcblx0XHRcdHRoaXMuc3RhdGVzLmFkZCggdGhpcy5vcHRpb25zLnN0YXRlcyApO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogQSBmcmFtZSBjYW4gYmUgaW4gYSBtb2RlIG9yIG11bHRpcGxlIG1vZGVzIGF0IG9uZSB0aW1lLlxuXHQgKlxuXHQgKiBGb3IgZXhhbXBsZSwgdGhlIG1hbmFnZSBtZWRpYSBmcmFtZSBjYW4gYmUgaW4gdGhlIGBCdWxrIFNlbGVjdGAgb3IgYEVkaXRgIG1vZGUuXG5cdCAqL1xuXHRfY3JlYXRlTW9kZXM6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIFN0b3JlIGFjdGl2ZSBcIm1vZGVzXCIgdGhhdCB0aGUgZnJhbWUgaXMgaW4uIFVucmVsYXRlZCB0byByZWdpb24gbW9kZXMuXG5cdFx0dGhpcy5hY3RpdmVNb2RlcyA9IG5ldyBCYWNrYm9uZS5Db2xsZWN0aW9uKCk7XG5cdFx0dGhpcy5hY3RpdmVNb2Rlcy5vbiggJ2FkZCByZW1vdmUgcmVzZXQnLCBfLmJpbmQoIHRoaXMudHJpZ2dlck1vZGVFdmVudHMsIHRoaXMgKSApO1xuXG5cdFx0Xy5lYWNoKCB0aGlzLm9wdGlvbnMubW9kZSwgZnVuY3Rpb24oIG1vZGUgKSB7XG5cdFx0XHR0aGlzLmFjdGl2YXRlTW9kZSggbW9kZSApO1xuXHRcdH0sIHRoaXMgKTtcblx0fSxcblx0LyoqXG5cdCAqIFJlc2V0IGFsbCBzdGF0ZXMgb24gdGhlIGZyYW1lIHRvIHRoZWlyIGRlZmF1bHRzLlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5GcmFtZX0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHJlc2V0OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnN0YXRlcy5pbnZva2UoICd0cmlnZ2VyJywgJ3Jlc2V0JyApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHQvKipcblx0ICogTWFwIGFjdGl2ZU1vZGUgY29sbGVjdGlvbiBldmVudHMgdG8gdGhlIGZyYW1lLlxuXHQgKi9cblx0dHJpZ2dlck1vZGVFdmVudHM6IGZ1bmN0aW9uKCBtb2RlbCwgY29sbGVjdGlvbiwgb3B0aW9ucyApIHtcblx0XHR2YXIgY29sbGVjdGlvbkV2ZW50LFxuXHRcdFx0bW9kZUV2ZW50TWFwID0ge1xuXHRcdFx0XHRhZGQ6ICdhY3RpdmF0ZScsXG5cdFx0XHRcdHJlbW92ZTogJ2RlYWN0aXZhdGUnXG5cdFx0XHR9LFxuXHRcdFx0ZXZlbnRUb1RyaWdnZXI7XG5cdFx0Ly8gUHJvYmFibHkgYSBiZXR0ZXIgd2F5IHRvIGRvIHRoaXMuXG5cdFx0Xy5lYWNoKCBvcHRpb25zLCBmdW5jdGlvbiggdmFsdWUsIGtleSApIHtcblx0XHRcdGlmICggdmFsdWUgKSB7XG5cdFx0XHRcdGNvbGxlY3Rpb25FdmVudCA9IGtleTtcblx0XHRcdH1cblx0XHR9ICk7XG5cblx0XHRpZiAoICEgXy5oYXMoIG1vZGVFdmVudE1hcCwgY29sbGVjdGlvbkV2ZW50ICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0ZXZlbnRUb1RyaWdnZXIgPSBtb2RlbC5nZXQoJ2lkJykgKyAnOicgKyBtb2RlRXZlbnRNYXBbY29sbGVjdGlvbkV2ZW50XTtcblx0XHR0aGlzLnRyaWdnZXIoIGV2ZW50VG9UcmlnZ2VyICk7XG5cdH0sXG5cdC8qKlxuXHQgKiBBY3RpdmF0ZSBhIG1vZGUgb24gdGhlIGZyYW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0gc3RyaW5nIG1vZGUgTW9kZSBJRC5cblx0ICogQHJldHVybnMge3RoaXN9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nLlxuXHQgKi9cblx0YWN0aXZhdGVNb2RlOiBmdW5jdGlvbiggbW9kZSApIHtcblx0XHQvLyBCYWlsIGlmIHRoZSBtb2RlIGlzIGFscmVhZHkgYWN0aXZlLlxuXHRcdGlmICggdGhpcy5pc01vZGVBY3RpdmUoIG1vZGUgKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0dGhpcy5hY3RpdmVNb2Rlcy5hZGQoIFsgeyBpZDogbW9kZSB9IF0gKTtcblx0XHQvLyBBZGQgYSBDU1MgY2xhc3MgdG8gdGhlIGZyYW1lIHNvIGVsZW1lbnRzIGNhbiBiZSBzdHlsZWQgZm9yIHRoZSBtb2RlLlxuXHRcdHRoaXMuJGVsLmFkZENsYXNzKCAnbW9kZS0nICsgbW9kZSApO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdC8qKlxuXHQgKiBEZWFjdGl2YXRlIGEgbW9kZSBvbiB0aGUgZnJhbWUuXG5cdCAqXG5cdCAqIEBwYXJhbSBzdHJpbmcgbW9kZSBNb2RlIElELlxuXHQgKiBAcmV0dXJucyB7dGhpc30gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmcuXG5cdCAqL1xuXHRkZWFjdGl2YXRlTW9kZTogZnVuY3Rpb24oIG1vZGUgKSB7XG5cdFx0Ly8gQmFpbCBpZiB0aGUgbW9kZSBpc24ndCBhY3RpdmUuXG5cdFx0aWYgKCAhIHRoaXMuaXNNb2RlQWN0aXZlKCBtb2RlICkgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cdFx0dGhpcy5hY3RpdmVNb2Rlcy5yZW1vdmUoIHRoaXMuYWN0aXZlTW9kZXMud2hlcmUoIHsgaWQ6IG1vZGUgfSApICk7XG5cdFx0dGhpcy4kZWwucmVtb3ZlQ2xhc3MoICdtb2RlLScgKyBtb2RlICk7XG5cdFx0LyoqXG5cdFx0ICogRnJhbWUgbW9kZSBkZWFjdGl2YXRpb24gZXZlbnQuXG5cdFx0ICpcblx0XHQgKiBAZXZlbnQgdGhpcyN7bW9kZX06ZGVhY3RpdmF0ZVxuXHRcdCAqL1xuXHRcdHRoaXMudHJpZ2dlciggbW9kZSArICc6ZGVhY3RpdmF0ZScgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHQvKipcblx0ICogQ2hlY2sgaWYgYSBtb2RlIGlzIGVuYWJsZWQgb24gdGhlIGZyYW1lLlxuXHQgKlxuXHQgKiBAcGFyYW0gIHN0cmluZyBtb2RlIE1vZGUgSUQuXG5cdCAqIEByZXR1cm4gYm9vbFxuXHQgKi9cblx0aXNNb2RlQWN0aXZlOiBmdW5jdGlvbiggbW9kZSApIHtcblx0XHRyZXR1cm4gQm9vbGVhbiggdGhpcy5hY3RpdmVNb2Rlcy53aGVyZSggeyBpZDogbW9kZSB9ICkubGVuZ3RoICk7XG5cdH1cbn0pO1xuXG4vLyBNYWtlIHRoZSBgRnJhbWVgIGEgYFN0YXRlTWFjaGluZWAuXG5fLmV4dGVuZCggRnJhbWUucHJvdG90eXBlLCB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlTWFjaGluZS5wcm90b3R5cGUgKTtcblxubW9kdWxlLmV4cG9ydHMgPSBGcmFtZTtcbiIsIi8qZ2xvYmFscyB3cCAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZS5JbWFnZURldGFpbHNcbiAqXG4gKiBBIG1lZGlhIGZyYW1lIGZvciBtYW5pcHVsYXRpbmcgYW4gaW1hZ2UgdGhhdCdzIGFscmVhZHkgYmVlbiBpbnNlcnRlZFxuICogaW50byBhIHBvc3QuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5NZWRpYUZyYW1lLlNlbGVjdFxuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZVxuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuRnJhbWVcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqIEBtaXhlcyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlTWFjaGluZVxuICovXG52YXIgU2VsZWN0ID0gd3AubWVkaWEudmlldy5NZWRpYUZyYW1lLlNlbGVjdCxcblx0bDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0SW1hZ2VEZXRhaWxzO1xuXG5JbWFnZURldGFpbHMgPSBTZWxlY3QuZXh0ZW5kKHtcblx0ZGVmYXVsdHM6IHtcblx0XHRpZDogICAgICAnaW1hZ2UnLFxuXHRcdHVybDogICAgICcnLFxuXHRcdG1lbnU6ICAgICdpbWFnZS1kZXRhaWxzJyxcblx0XHRjb250ZW50OiAnaW1hZ2UtZGV0YWlscycsXG5cdFx0dG9vbGJhcjogJ2ltYWdlLWRldGFpbHMnLFxuXHRcdHR5cGU6ICAgICdsaW5rJyxcblx0XHR0aXRsZTogICAgbDEwbi5pbWFnZURldGFpbHNUaXRsZSxcblx0XHRwcmlvcml0eTogMTIwXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0dGhpcy5pbWFnZSA9IG5ldyB3cC5tZWRpYS5tb2RlbC5Qb3N0SW1hZ2UoIG9wdGlvbnMubWV0YWRhdGEgKTtcblx0XHR0aGlzLm9wdGlvbnMuc2VsZWN0aW9uID0gbmV3IHdwLm1lZGlhLm1vZGVsLlNlbGVjdGlvbiggdGhpcy5pbWFnZS5hdHRhY2htZW50LCB7IG11bHRpcGxlOiBmYWxzZSB9ICk7XG5cdFx0U2VsZWN0LnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fSxcblxuXHRiaW5kSGFuZGxlcnM6IGZ1bmN0aW9uKCkge1xuXHRcdFNlbGVjdC5wcm90b3R5cGUuYmluZEhhbmRsZXJzLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHR0aGlzLm9uKCAnbWVudTpjcmVhdGU6aW1hZ2UtZGV0YWlscycsIHRoaXMuY3JlYXRlTWVudSwgdGhpcyApO1xuXHRcdHRoaXMub24oICdjb250ZW50OmNyZWF0ZTppbWFnZS1kZXRhaWxzJywgdGhpcy5pbWFnZURldGFpbHNDb250ZW50LCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ2NvbnRlbnQ6cmVuZGVyOmVkaXQtaW1hZ2UnLCB0aGlzLmVkaXRJbWFnZUNvbnRlbnQsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAndG9vbGJhcjpyZW5kZXI6aW1hZ2UtZGV0YWlscycsIHRoaXMucmVuZGVySW1hZ2VEZXRhaWxzVG9vbGJhciwgdGhpcyApO1xuXHRcdC8vIG92ZXJyaWRlIHRoZSBzZWxlY3QgdG9vbGJhclxuXHRcdHRoaXMub24oICd0b29sYmFyOnJlbmRlcjpyZXBsYWNlJywgdGhpcy5yZW5kZXJSZXBsYWNlSW1hZ2VUb29sYmFyLCB0aGlzICk7XG5cdH0sXG5cblx0Y3JlYXRlU3RhdGVzOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnN0YXRlcy5hZGQoW1xuXHRcdFx0bmV3IHdwLm1lZGlhLmNvbnRyb2xsZXIuSW1hZ2VEZXRhaWxzKHtcblx0XHRcdFx0aW1hZ2U6IHRoaXMuaW1hZ2UsXG5cdFx0XHRcdGVkaXRhYmxlOiBmYWxzZVxuXHRcdFx0fSksXG5cdFx0XHRuZXcgd3AubWVkaWEuY29udHJvbGxlci5SZXBsYWNlSW1hZ2Uoe1xuXHRcdFx0XHRpZDogJ3JlcGxhY2UtaW1hZ2UnLFxuXHRcdFx0XHRsaWJyYXJ5OiB3cC5tZWRpYS5xdWVyeSggeyB0eXBlOiAnaW1hZ2UnIH0gKSxcblx0XHRcdFx0aW1hZ2U6IHRoaXMuaW1hZ2UsXG5cdFx0XHRcdG11bHRpcGxlOiAgZmFsc2UsXG5cdFx0XHRcdHRpdGxlOiAgICAgbDEwbi5pbWFnZVJlcGxhY2VUaXRsZSxcblx0XHRcdFx0dG9vbGJhcjogJ3JlcGxhY2UnLFxuXHRcdFx0XHRwcmlvcml0eTogIDgwLFxuXHRcdFx0XHRkaXNwbGF5U2V0dGluZ3M6IHRydWVcblx0XHRcdH0pLFxuXHRcdFx0bmV3IHdwLm1lZGlhLmNvbnRyb2xsZXIuRWRpdEltYWdlKCB7XG5cdFx0XHRcdGltYWdlOiB0aGlzLmltYWdlLFxuXHRcdFx0XHRzZWxlY3Rpb246IHRoaXMub3B0aW9ucy5zZWxlY3Rpb25cblx0XHRcdH0gKVxuXHRcdF0pO1xuXHR9LFxuXG5cdGltYWdlRGV0YWlsc0NvbnRlbnQ6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdG9wdGlvbnMudmlldyA9IG5ldyB3cC5tZWRpYS52aWV3LkltYWdlRGV0YWlscyh7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0bW9kZWw6IHRoaXMuc3RhdGUoKS5pbWFnZSxcblx0XHRcdGF0dGFjaG1lbnQ6IHRoaXMuc3RhdGUoKS5pbWFnZS5hdHRhY2htZW50XG5cdFx0fSk7XG5cdH0sXG5cblx0ZWRpdEltYWdlQ29udGVudDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHN0YXRlID0gdGhpcy5zdGF0ZSgpLFxuXHRcdFx0bW9kZWwgPSBzdGF0ZS5nZXQoJ2ltYWdlJyksXG5cdFx0XHR2aWV3O1xuXG5cdFx0aWYgKCAhIG1vZGVsICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZpZXcgPSBuZXcgd3AubWVkaWEudmlldy5FZGl0SW1hZ2UoIHsgbW9kZWw6IG1vZGVsLCBjb250cm9sbGVyOiB0aGlzIH0gKS5yZW5kZXIoKTtcblxuXHRcdHRoaXMuY29udGVudC5zZXQoIHZpZXcgKTtcblxuXHRcdC8vIGFmdGVyIGJyaW5naW5nIGluIHRoZSBmcmFtZSwgbG9hZCB0aGUgYWN0dWFsIGVkaXRvciB2aWEgYW4gYWpheCBjYWxsXG5cdFx0dmlldy5sb2FkRWRpdG9yKCk7XG5cblx0fSxcblxuXHRyZW5kZXJJbWFnZURldGFpbHNUb29sYmFyOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnRvb2xiYXIuc2V0KCBuZXcgd3AubWVkaWEudmlldy5Ub29sYmFyKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRpdGVtczoge1xuXHRcdFx0XHRzZWxlY3Q6IHtcblx0XHRcdFx0XHRzdHlsZTogICAgJ3ByaW1hcnknLFxuXHRcdFx0XHRcdHRleHQ6ICAgICBsMTBuLnVwZGF0ZSxcblx0XHRcdFx0XHRwcmlvcml0eTogODAsXG5cblx0XHRcdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29udHJvbGxlciA9IHRoaXMuY29udHJvbGxlcixcblx0XHRcdFx0XHRcdFx0c3RhdGUgPSBjb250cm9sbGVyLnN0YXRlKCk7XG5cblx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuY2xvc2UoKTtcblxuXHRcdFx0XHRcdFx0Ly8gbm90IHN1cmUgaWYgd2Ugd2FudCB0byB1c2Ugd3AubWVkaWEuc3RyaW5nLmltYWdlIHdoaWNoIHdpbGwgY3JlYXRlIGEgc2hvcnRjb2RlIG9yXG5cdFx0XHRcdFx0XHQvLyBwZXJoYXBzIHdwLmh0bWwuc3RyaW5nIHRvIGF0IGxlYXN0IHRvIGJ1aWxkIHRoZSA8aW1nIC8+XG5cdFx0XHRcdFx0XHRzdGF0ZS50cmlnZ2VyKCAndXBkYXRlJywgY29udHJvbGxlci5pbWFnZS50b0pTT04oKSApO1xuXG5cdFx0XHRcdFx0XHQvLyBSZXN0b3JlIGFuZCByZXNldCB0aGUgZGVmYXVsdCBzdGF0ZS5cblx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuc2V0U3RhdGUoIGNvbnRyb2xsZXIub3B0aW9ucy5zdGF0ZSApO1xuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5yZXNldCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pICk7XG5cdH0sXG5cblx0cmVuZGVyUmVwbGFjZUltYWdlVG9vbGJhcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGZyYW1lID0gdGhpcyxcblx0XHRcdGxhc3RTdGF0ZSA9IGZyYW1lLmxhc3RTdGF0ZSgpLFxuXHRcdFx0cHJldmlvdXMgPSBsYXN0U3RhdGUgJiYgbGFzdFN0YXRlLmlkO1xuXG5cdFx0dGhpcy50b29sYmFyLnNldCggbmV3IHdwLm1lZGlhLnZpZXcuVG9vbGJhcih7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0aXRlbXM6IHtcblx0XHRcdFx0YmFjazoge1xuXHRcdFx0XHRcdHRleHQ6ICAgICBsMTBuLmJhY2ssXG5cdFx0XHRcdFx0cHJpb3JpdHk6IDIwLFxuXHRcdFx0XHRcdGNsaWNrOiAgICBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdGlmICggcHJldmlvdXMgKSB7XG5cdFx0XHRcdFx0XHRcdGZyYW1lLnNldFN0YXRlKCBwcmV2aW91cyApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0ZnJhbWUuY2xvc2UoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0cmVwbGFjZToge1xuXHRcdFx0XHRcdHN0eWxlOiAgICAncHJpbWFyeScsXG5cdFx0XHRcdFx0dGV4dDogICAgIGwxMG4ucmVwbGFjZSxcblx0XHRcdFx0XHRwcmlvcml0eTogODAsXG5cblx0XHRcdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29udHJvbGxlciA9IHRoaXMuY29udHJvbGxlcixcblx0XHRcdFx0XHRcdFx0c3RhdGUgPSBjb250cm9sbGVyLnN0YXRlKCksXG5cdFx0XHRcdFx0XHRcdHNlbGVjdGlvbiA9IHN0YXRlLmdldCggJ3NlbGVjdGlvbicgKSxcblx0XHRcdFx0XHRcdFx0YXR0YWNobWVudCA9IHNlbGVjdGlvbi5zaW5nbGUoKTtcblxuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5jbG9zZSgpO1xuXG5cdFx0XHRcdFx0XHRjb250cm9sbGVyLmltYWdlLmNoYW5nZUF0dGFjaG1lbnQoIGF0dGFjaG1lbnQsIHN0YXRlLmRpc3BsYXkoIGF0dGFjaG1lbnQgKSApO1xuXG5cdFx0XHRcdFx0XHQvLyBub3Qgc3VyZSBpZiB3ZSB3YW50IHRvIHVzZSB3cC5tZWRpYS5zdHJpbmcuaW1hZ2Ugd2hpY2ggd2lsbCBjcmVhdGUgYSBzaG9ydGNvZGUgb3Jcblx0XHRcdFx0XHRcdC8vIHBlcmhhcHMgd3AuaHRtbC5zdHJpbmcgdG8gYXQgbGVhc3QgdG8gYnVpbGQgdGhlIDxpbWcgLz5cblx0XHRcdFx0XHRcdHN0YXRlLnRyaWdnZXIoICdyZXBsYWNlJywgY29udHJvbGxlci5pbWFnZS50b0pTT04oKSApO1xuXG5cdFx0XHRcdFx0XHQvLyBSZXN0b3JlIGFuZCByZXNldCB0aGUgZGVmYXVsdCBzdGF0ZS5cblx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuc2V0U3RhdGUoIGNvbnRyb2xsZXIub3B0aW9ucy5zdGF0ZSApO1xuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5yZXNldCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pICk7XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSW1hZ2VEZXRhaWxzO1xuIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5NZWRpYUZyYW1lLlBvc3RcbiAqXG4gKiBUaGUgZnJhbWUgZm9yIG1hbmlwdWxhdGluZyBtZWRpYSBvbiB0aGUgRWRpdCBQb3N0IHBhZ2UuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5NZWRpYUZyYW1lLlNlbGVjdFxuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZVxuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuRnJhbWVcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqIEBtaXhlcyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlTWFjaGluZVxuICovXG52YXIgU2VsZWN0ID0gd3AubWVkaWEudmlldy5NZWRpYUZyYW1lLlNlbGVjdCxcblx0TGlicmFyeSA9IHdwLm1lZGlhLmNvbnRyb2xsZXIuTGlicmFyeSxcblx0bDEwbiA9IHdwLm1lZGlhLnZpZXcubDEwbixcblx0UG9zdDtcblxuUG9zdCA9IFNlbGVjdC5leHRlbmQoe1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmNvdW50cyA9IHtcblx0XHRcdGF1ZGlvOiB7XG5cdFx0XHRcdGNvdW50OiB3cC5tZWRpYS52aWV3LnNldHRpbmdzLmF0dGFjaG1lbnRDb3VudHMuYXVkaW8sXG5cdFx0XHRcdHN0YXRlOiAncGxheWxpc3QnXG5cdFx0XHR9LFxuXHRcdFx0dmlkZW86IHtcblx0XHRcdFx0Y291bnQ6IHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MuYXR0YWNobWVudENvdW50cy52aWRlbyxcblx0XHRcdFx0c3RhdGU6ICd2aWRlby1wbGF5bGlzdCdcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Xy5kZWZhdWx0cyggdGhpcy5vcHRpb25zLCB7XG5cdFx0XHRtdWx0aXBsZTogIHRydWUsXG5cdFx0XHRlZGl0aW5nOiAgIGZhbHNlLFxuXHRcdFx0c3RhdGU6ICAgICdpbnNlcnQnLFxuXHRcdFx0bWV0YWRhdGE6ICB7fVxuXHRcdH0pO1xuXG5cdFx0Ly8gQ2FsbCAnaW5pdGlhbGl6ZScgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzcy5cblx0XHRTZWxlY3QucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHRoaXMuY3JlYXRlSWZyYW1lU3RhdGVzKCk7XG5cblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIHRoZSBkZWZhdWx0IHN0YXRlcy5cblx0ICovXG5cdGNyZWF0ZVN0YXRlczogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cblx0XHR0aGlzLnN0YXRlcy5hZGQoW1xuXHRcdFx0Ly8gTWFpbiBzdGF0ZXMuXG5cdFx0XHRuZXcgTGlicmFyeSh7XG5cdFx0XHRcdGlkOiAgICAgICAgICdpbnNlcnQnLFxuXHRcdFx0XHR0aXRsZTogICAgICBsMTBuLmluc2VydE1lZGlhVGl0bGUsXG5cdFx0XHRcdHByaW9yaXR5OiAgIDIwLFxuXHRcdFx0XHR0b29sYmFyOiAgICAnbWFpbi1pbnNlcnQnLFxuXHRcdFx0XHRmaWx0ZXJhYmxlOiAnYWxsJyxcblx0XHRcdFx0bGlicmFyeTogICAgd3AubWVkaWEucXVlcnkoIG9wdGlvbnMubGlicmFyeSApLFxuXHRcdFx0XHRtdWx0aXBsZTogICBvcHRpb25zLm11bHRpcGxlID8gJ3Jlc2V0JyA6IGZhbHNlLFxuXHRcdFx0XHRlZGl0YWJsZTogICB0cnVlLFxuXG5cdFx0XHRcdC8vIElmIHRoZSB1c2VyIGlzbid0IGFsbG93ZWQgdG8gZWRpdCBmaWVsZHMsXG5cdFx0XHRcdC8vIGNhbiB0aGV5IHN0aWxsIGVkaXQgaXQgbG9jYWxseT9cblx0XHRcdFx0YWxsb3dMb2NhbEVkaXRzOiB0cnVlLFxuXG5cdFx0XHRcdC8vIFNob3cgdGhlIGF0dGFjaG1lbnQgZGlzcGxheSBzZXR0aW5ncy5cblx0XHRcdFx0ZGlzcGxheVNldHRpbmdzOiB0cnVlLFxuXHRcdFx0XHQvLyBVcGRhdGUgdXNlciBzZXR0aW5ncyB3aGVuIHVzZXJzIGFkanVzdCB0aGVcblx0XHRcdFx0Ly8gYXR0YWNobWVudCBkaXNwbGF5IHNldHRpbmdzLlxuXHRcdFx0XHRkaXNwbGF5VXNlclNldHRpbmdzOiB0cnVlXG5cdFx0XHR9KSxcblxuXHRcdFx0bmV3IExpYnJhcnkoe1xuXHRcdFx0XHRpZDogICAgICAgICAnZ2FsbGVyeScsXG5cdFx0XHRcdHRpdGxlOiAgICAgIGwxMG4uY3JlYXRlR2FsbGVyeVRpdGxlLFxuXHRcdFx0XHRwcmlvcml0eTogICA0MCxcblx0XHRcdFx0dG9vbGJhcjogICAgJ21haW4tZ2FsbGVyeScsXG5cdFx0XHRcdGZpbHRlcmFibGU6ICd1cGxvYWRlZCcsXG5cdFx0XHRcdG11bHRpcGxlOiAgICdhZGQnLFxuXHRcdFx0XHRlZGl0YWJsZTogICBmYWxzZSxcblxuXHRcdFx0XHRsaWJyYXJ5OiAgd3AubWVkaWEucXVlcnkoIF8uZGVmYXVsdHMoe1xuXHRcdFx0XHRcdHR5cGU6ICdpbWFnZSdcblx0XHRcdFx0fSwgb3B0aW9ucy5saWJyYXJ5ICkgKVxuXHRcdFx0fSksXG5cblx0XHRcdC8vIEVtYmVkIHN0YXRlcy5cblx0XHRcdG5ldyB3cC5tZWRpYS5jb250cm9sbGVyLkVtYmVkKCB7IG1ldGFkYXRhOiBvcHRpb25zLm1ldGFkYXRhIH0gKSxcblxuXHRcdFx0bmV3IHdwLm1lZGlhLmNvbnRyb2xsZXIuRWRpdEltYWdlKCB7IG1vZGVsOiBvcHRpb25zLmVkaXRJbWFnZSB9ICksXG5cblx0XHRcdC8vIEdhbGxlcnkgc3RhdGVzLlxuXHRcdFx0bmV3IHdwLm1lZGlhLmNvbnRyb2xsZXIuR2FsbGVyeUVkaXQoe1xuXHRcdFx0XHRsaWJyYXJ5OiBvcHRpb25zLnNlbGVjdGlvbixcblx0XHRcdFx0ZWRpdGluZzogb3B0aW9ucy5lZGl0aW5nLFxuXHRcdFx0XHRtZW51OiAgICAnZ2FsbGVyeSdcblx0XHRcdH0pLFxuXG5cdFx0XHRuZXcgd3AubWVkaWEuY29udHJvbGxlci5HYWxsZXJ5QWRkKCksXG5cblx0XHRcdG5ldyBMaWJyYXJ5KHtcblx0XHRcdFx0aWQ6ICAgICAgICAgJ3BsYXlsaXN0Jyxcblx0XHRcdFx0dGl0bGU6ICAgICAgbDEwbi5jcmVhdGVQbGF5bGlzdFRpdGxlLFxuXHRcdFx0XHRwcmlvcml0eTogICA2MCxcblx0XHRcdFx0dG9vbGJhcjogICAgJ21haW4tcGxheWxpc3QnLFxuXHRcdFx0XHRmaWx0ZXJhYmxlOiAndXBsb2FkZWQnLFxuXHRcdFx0XHRtdWx0aXBsZTogICAnYWRkJyxcblx0XHRcdFx0ZWRpdGFibGU6ICAgZmFsc2UsXG5cblx0XHRcdFx0bGlicmFyeTogIHdwLm1lZGlhLnF1ZXJ5KCBfLmRlZmF1bHRzKHtcblx0XHRcdFx0XHR0eXBlOiAnYXVkaW8nXG5cdFx0XHRcdH0sIG9wdGlvbnMubGlicmFyeSApIClcblx0XHRcdH0pLFxuXG5cdFx0XHQvLyBQbGF5bGlzdCBzdGF0ZXMuXG5cdFx0XHRuZXcgd3AubWVkaWEuY29udHJvbGxlci5Db2xsZWN0aW9uRWRpdCh7XG5cdFx0XHRcdHR5cGU6ICdhdWRpbycsXG5cdFx0XHRcdGNvbGxlY3Rpb25UeXBlOiAncGxheWxpc3QnLFxuXHRcdFx0XHR0aXRsZTogICAgICAgICAgbDEwbi5lZGl0UGxheWxpc3RUaXRsZSxcblx0XHRcdFx0U2V0dGluZ3NWaWV3OiAgIHdwLm1lZGlhLnZpZXcuU2V0dGluZ3MuUGxheWxpc3QsXG5cdFx0XHRcdGxpYnJhcnk6ICAgICAgICBvcHRpb25zLnNlbGVjdGlvbixcblx0XHRcdFx0ZWRpdGluZzogICAgICAgIG9wdGlvbnMuZWRpdGluZyxcblx0XHRcdFx0bWVudTogICAgICAgICAgICdwbGF5bGlzdCcsXG5cdFx0XHRcdGRyYWdJbmZvVGV4dDogICBsMTBuLnBsYXlsaXN0RHJhZ0luZm8sXG5cdFx0XHRcdGRyYWdJbmZvOiAgICAgICBmYWxzZVxuXHRcdFx0fSksXG5cblx0XHRcdG5ldyB3cC5tZWRpYS5jb250cm9sbGVyLkNvbGxlY3Rpb25BZGQoe1xuXHRcdFx0XHR0eXBlOiAnYXVkaW8nLFxuXHRcdFx0XHRjb2xsZWN0aW9uVHlwZTogJ3BsYXlsaXN0Jyxcblx0XHRcdFx0dGl0bGU6IGwxMG4uYWRkVG9QbGF5bGlzdFRpdGxlXG5cdFx0XHR9KSxcblxuXHRcdFx0bmV3IExpYnJhcnkoe1xuXHRcdFx0XHRpZDogICAgICAgICAndmlkZW8tcGxheWxpc3QnLFxuXHRcdFx0XHR0aXRsZTogICAgICBsMTBuLmNyZWF0ZVZpZGVvUGxheWxpc3RUaXRsZSxcblx0XHRcdFx0cHJpb3JpdHk6ICAgNjAsXG5cdFx0XHRcdHRvb2xiYXI6ICAgICdtYWluLXZpZGVvLXBsYXlsaXN0Jyxcblx0XHRcdFx0ZmlsdGVyYWJsZTogJ3VwbG9hZGVkJyxcblx0XHRcdFx0bXVsdGlwbGU6ICAgJ2FkZCcsXG5cdFx0XHRcdGVkaXRhYmxlOiAgIGZhbHNlLFxuXG5cdFx0XHRcdGxpYnJhcnk6ICB3cC5tZWRpYS5xdWVyeSggXy5kZWZhdWx0cyh7XG5cdFx0XHRcdFx0dHlwZTogJ3ZpZGVvJ1xuXHRcdFx0XHR9LCBvcHRpb25zLmxpYnJhcnkgKSApXG5cdFx0XHR9KSxcblxuXHRcdFx0bmV3IHdwLm1lZGlhLmNvbnRyb2xsZXIuQ29sbGVjdGlvbkVkaXQoe1xuXHRcdFx0XHR0eXBlOiAndmlkZW8nLFxuXHRcdFx0XHRjb2xsZWN0aW9uVHlwZTogJ3BsYXlsaXN0Jyxcblx0XHRcdFx0dGl0bGU6ICAgICAgICAgIGwxMG4uZWRpdFZpZGVvUGxheWxpc3RUaXRsZSxcblx0XHRcdFx0U2V0dGluZ3NWaWV3OiAgIHdwLm1lZGlhLnZpZXcuU2V0dGluZ3MuUGxheWxpc3QsXG5cdFx0XHRcdGxpYnJhcnk6ICAgICAgICBvcHRpb25zLnNlbGVjdGlvbixcblx0XHRcdFx0ZWRpdGluZzogICAgICAgIG9wdGlvbnMuZWRpdGluZyxcblx0XHRcdFx0bWVudTogICAgICAgICAgICd2aWRlby1wbGF5bGlzdCcsXG5cdFx0XHRcdGRyYWdJbmZvVGV4dDogICBsMTBuLnZpZGVvUGxheWxpc3REcmFnSW5mbyxcblx0XHRcdFx0ZHJhZ0luZm86ICAgICAgIGZhbHNlXG5cdFx0XHR9KSxcblxuXHRcdFx0bmV3IHdwLm1lZGlhLmNvbnRyb2xsZXIuQ29sbGVjdGlvbkFkZCh7XG5cdFx0XHRcdHR5cGU6ICd2aWRlbycsXG5cdFx0XHRcdGNvbGxlY3Rpb25UeXBlOiAncGxheWxpc3QnLFxuXHRcdFx0XHR0aXRsZTogbDEwbi5hZGRUb1ZpZGVvUGxheWxpc3RUaXRsZVxuXHRcdFx0fSlcblx0XHRdKTtcblxuXHRcdGlmICggd3AubWVkaWEudmlldy5zZXR0aW5ncy5wb3N0LmZlYXR1cmVkSW1hZ2VJZCApIHtcblx0XHRcdHRoaXMuc3RhdGVzLmFkZCggbmV3IHdwLm1lZGlhLmNvbnRyb2xsZXIuRmVhdHVyZWRJbWFnZSgpICk7XG5cdFx0fVxuXHR9LFxuXG5cdGJpbmRIYW5kbGVyczogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGhhbmRsZXJzLCBjaGVja0NvdW50cztcblxuXHRcdFNlbGVjdC5wcm90b3R5cGUuYmluZEhhbmRsZXJzLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdHRoaXMub24oICdhY3RpdmF0ZScsIHRoaXMuYWN0aXZhdGUsIHRoaXMgKTtcblxuXHRcdC8vIE9ubHkgYm90aGVyIGNoZWNraW5nIG1lZGlhIHR5cGUgY291bnRzIGlmIG9uZSBvZiB0aGUgY291bnRzIGlzIHplcm9cblx0XHRjaGVja0NvdW50cyA9IF8uZmluZCggdGhpcy5jb3VudHMsIGZ1bmN0aW9uKCB0eXBlICkge1xuXHRcdFx0cmV0dXJuIHR5cGUuY291bnQgPT09IDA7XG5cdFx0fSApO1xuXG5cdFx0aWYgKCB0eXBlb2YgY2hlY2tDb3VudHMgIT09ICd1bmRlZmluZWQnICkge1xuXHRcdFx0dGhpcy5saXN0ZW5Ubyggd3AubWVkaWEubW9kZWwuQXR0YWNobWVudHMuYWxsLCAnY2hhbmdlOnR5cGUnLCB0aGlzLm1lZGlhVHlwZUNvdW50cyApO1xuXHRcdH1cblxuXHRcdHRoaXMub24oICdtZW51OmNyZWF0ZTpnYWxsZXJ5JywgdGhpcy5jcmVhdGVNZW51LCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ21lbnU6Y3JlYXRlOnBsYXlsaXN0JywgdGhpcy5jcmVhdGVNZW51LCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ21lbnU6Y3JlYXRlOnZpZGVvLXBsYXlsaXN0JywgdGhpcy5jcmVhdGVNZW51LCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ3Rvb2xiYXI6Y3JlYXRlOm1haW4taW5zZXJ0JywgdGhpcy5jcmVhdGVUb29sYmFyLCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ3Rvb2xiYXI6Y3JlYXRlOm1haW4tZ2FsbGVyeScsIHRoaXMuY3JlYXRlVG9vbGJhciwgdGhpcyApO1xuXHRcdHRoaXMub24oICd0b29sYmFyOmNyZWF0ZTptYWluLXBsYXlsaXN0JywgdGhpcy5jcmVhdGVUb29sYmFyLCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ3Rvb2xiYXI6Y3JlYXRlOm1haW4tdmlkZW8tcGxheWxpc3QnLCB0aGlzLmNyZWF0ZVRvb2xiYXIsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAndG9vbGJhcjpjcmVhdGU6ZmVhdHVyZWQtaW1hZ2UnLCB0aGlzLmZlYXR1cmVkSW1hZ2VUb29sYmFyLCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ3Rvb2xiYXI6Y3JlYXRlOm1haW4tZW1iZWQnLCB0aGlzLm1haW5FbWJlZFRvb2xiYXIsIHRoaXMgKTtcblxuXHRcdGhhbmRsZXJzID0ge1xuXHRcdFx0bWVudToge1xuXHRcdFx0XHQnZGVmYXVsdCc6ICdtYWluTWVudScsXG5cdFx0XHRcdCdnYWxsZXJ5JzogJ2dhbGxlcnlNZW51Jyxcblx0XHRcdFx0J3BsYXlsaXN0JzogJ3BsYXlsaXN0TWVudScsXG5cdFx0XHRcdCd2aWRlby1wbGF5bGlzdCc6ICd2aWRlb1BsYXlsaXN0TWVudSdcblx0XHRcdH0sXG5cblx0XHRcdGNvbnRlbnQ6IHtcblx0XHRcdFx0J2VtYmVkJzogICAgICAgICAgJ2VtYmVkQ29udGVudCcsXG5cdFx0XHRcdCdlZGl0LWltYWdlJzogICAgICdlZGl0SW1hZ2VDb250ZW50Jyxcblx0XHRcdFx0J2VkaXQtc2VsZWN0aW9uJzogJ2VkaXRTZWxlY3Rpb25Db250ZW50J1xuXHRcdFx0fSxcblxuXHRcdFx0dG9vbGJhcjoge1xuXHRcdFx0XHQnbWFpbi1pbnNlcnQnOiAgICAgICdtYWluSW5zZXJ0VG9vbGJhcicsXG5cdFx0XHRcdCdtYWluLWdhbGxlcnknOiAgICAgJ21haW5HYWxsZXJ5VG9vbGJhcicsXG5cdFx0XHRcdCdnYWxsZXJ5LWVkaXQnOiAgICAgJ2dhbGxlcnlFZGl0VG9vbGJhcicsXG5cdFx0XHRcdCdnYWxsZXJ5LWFkZCc6ICAgICAgJ2dhbGxlcnlBZGRUb29sYmFyJyxcblx0XHRcdFx0J21haW4tcGxheWxpc3QnOlx0J21haW5QbGF5bGlzdFRvb2xiYXInLFxuXHRcdFx0XHQncGxheWxpc3QtZWRpdCc6XHQncGxheWxpc3RFZGl0VG9vbGJhcicsXG5cdFx0XHRcdCdwbGF5bGlzdC1hZGQnOlx0XHQncGxheWxpc3RBZGRUb29sYmFyJyxcblx0XHRcdFx0J21haW4tdmlkZW8tcGxheWxpc3QnOiAnbWFpblZpZGVvUGxheWxpc3RUb29sYmFyJyxcblx0XHRcdFx0J3ZpZGVvLXBsYXlsaXN0LWVkaXQnOiAndmlkZW9QbGF5bGlzdEVkaXRUb29sYmFyJyxcblx0XHRcdFx0J3ZpZGVvLXBsYXlsaXN0LWFkZCc6ICd2aWRlb1BsYXlsaXN0QWRkVG9vbGJhcidcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Xy5lYWNoKCBoYW5kbGVycywgZnVuY3Rpb24oIHJlZ2lvbkhhbmRsZXJzLCByZWdpb24gKSB7XG5cdFx0XHRfLmVhY2goIHJlZ2lvbkhhbmRsZXJzLCBmdW5jdGlvbiggY2FsbGJhY2ssIGhhbmRsZXIgKSB7XG5cdFx0XHRcdHRoaXMub24oIHJlZ2lvbiArICc6cmVuZGVyOicgKyBoYW5kbGVyLCB0aGlzWyBjYWxsYmFjayBdLCB0aGlzICk7XG5cdFx0XHR9LCB0aGlzICk7XG5cdFx0fSwgdGhpcyApO1xuXHR9LFxuXG5cdGFjdGl2YXRlOiBmdW5jdGlvbigpIHtcblx0XHQvLyBIaWRlIG1lbnUgaXRlbXMgZm9yIHN0YXRlcyB0aWVkIHRvIHBhcnRpY3VsYXIgbWVkaWEgdHlwZXMgaWYgdGhlcmUgYXJlIG5vIGl0ZW1zXG5cdFx0Xy5lYWNoKCB0aGlzLmNvdW50cywgZnVuY3Rpb24oIHR5cGUgKSB7XG5cdFx0XHRpZiAoIHR5cGUuY291bnQgPCAxICkge1xuXHRcdFx0XHR0aGlzLm1lbnVJdGVtVmlzaWJpbGl0eSggdHlwZS5zdGF0ZSwgJ2hpZGUnICk7XG5cdFx0XHR9XG5cdFx0fSwgdGhpcyApO1xuXHR9LFxuXG5cdG1lZGlhVHlwZUNvdW50czogZnVuY3Rpb24oIG1vZGVsLCBhdHRyICkge1xuXHRcdGlmICggdHlwZW9mIHRoaXMuY291bnRzWyBhdHRyIF0gIT09ICd1bmRlZmluZWQnICYmIHRoaXMuY291bnRzWyBhdHRyIF0uY291bnQgPCAxICkge1xuXHRcdFx0dGhpcy5jb3VudHNbIGF0dHIgXS5jb3VudCsrO1xuXHRcdFx0dGhpcy5tZW51SXRlbVZpc2liaWxpdHkoIHRoaXMuY291bnRzWyBhdHRyIF0uc3RhdGUsICdzaG93JyApO1xuXHRcdH1cblx0fSxcblxuXHQvLyBNZW51c1xuXHQvKipcblx0ICogQHBhcmFtIHt3cC5CYWNrYm9uZS5WaWV3fSB2aWV3XG5cdCAqL1xuXHRtYWluTWVudTogZnVuY3Rpb24oIHZpZXcgKSB7XG5cdFx0dmlldy5zZXQoe1xuXHRcdFx0J2xpYnJhcnktc2VwYXJhdG9yJzogbmV3IHdwLm1lZGlhLlZpZXcoe1xuXHRcdFx0XHRjbGFzc05hbWU6ICdzZXBhcmF0b3InLFxuXHRcdFx0XHRwcmlvcml0eTogMTAwXG5cdFx0XHR9KVxuXHRcdH0pO1xuXHR9LFxuXG5cdG1lbnVJdGVtVmlzaWJpbGl0eTogZnVuY3Rpb24oIHN0YXRlLCB2aXNpYmlsaXR5ICkge1xuXHRcdHZhciBtZW51ID0gdGhpcy5tZW51LmdldCgpO1xuXHRcdGlmICggdmlzaWJpbGl0eSA9PT0gJ2hpZGUnICkge1xuXHRcdFx0bWVudS5oaWRlKCBzdGF0ZSApO1xuXHRcdH0gZWxzZSBpZiAoIHZpc2liaWxpdHkgPT09ICdzaG93JyApIHtcblx0XHRcdG1lbnUuc2hvdyggc3RhdGUgKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge3dwLkJhY2tib25lLlZpZXd9IHZpZXdcblx0ICovXG5cdGdhbGxlcnlNZW51OiBmdW5jdGlvbiggdmlldyApIHtcblx0XHR2YXIgbGFzdFN0YXRlID0gdGhpcy5sYXN0U3RhdGUoKSxcblx0XHRcdHByZXZpb3VzID0gbGFzdFN0YXRlICYmIGxhc3RTdGF0ZS5pZCxcblx0XHRcdGZyYW1lID0gdGhpcztcblxuXHRcdHZpZXcuc2V0KHtcblx0XHRcdGNhbmNlbDoge1xuXHRcdFx0XHR0ZXh0OiAgICAgbDEwbi5jYW5jZWxHYWxsZXJ5VGl0bGUsXG5cdFx0XHRcdHByaW9yaXR5OiAyMCxcblx0XHRcdFx0Y2xpY2s6ICAgIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICggcHJldmlvdXMgKSB7XG5cdFx0XHRcdFx0XHRmcmFtZS5zZXRTdGF0ZSggcHJldmlvdXMgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZnJhbWUuY2xvc2UoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBLZWVwIGZvY3VzIGluc2lkZSBtZWRpYSBtb2RhbFxuXHRcdFx0XHRcdC8vIGFmdGVyIGNhbmNlbGluZyBhIGdhbGxlcnlcblx0XHRcdFx0XHR0aGlzLmNvbnRyb2xsZXIubW9kYWwuZm9jdXNNYW5hZ2VyLmZvY3VzKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRzZXBhcmF0ZUNhbmNlbDogbmV3IHdwLm1lZGlhLlZpZXcoe1xuXHRcdFx0XHRjbGFzc05hbWU6ICdzZXBhcmF0b3InLFxuXHRcdFx0XHRwcmlvcml0eTogNDBcblx0XHRcdH0pXG5cdFx0fSk7XG5cdH0sXG5cblx0cGxheWxpc3RNZW51OiBmdW5jdGlvbiggdmlldyApIHtcblx0XHR2YXIgbGFzdFN0YXRlID0gdGhpcy5sYXN0U3RhdGUoKSxcblx0XHRcdHByZXZpb3VzID0gbGFzdFN0YXRlICYmIGxhc3RTdGF0ZS5pZCxcblx0XHRcdGZyYW1lID0gdGhpcztcblxuXHRcdHZpZXcuc2V0KHtcblx0XHRcdGNhbmNlbDoge1xuXHRcdFx0XHR0ZXh0OiAgICAgbDEwbi5jYW5jZWxQbGF5bGlzdFRpdGxlLFxuXHRcdFx0XHRwcmlvcml0eTogMjAsXG5cdFx0XHRcdGNsaWNrOiAgICBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRpZiAoIHByZXZpb3VzICkge1xuXHRcdFx0XHRcdFx0ZnJhbWUuc2V0U3RhdGUoIHByZXZpb3VzICk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGZyYW1lLmNsb3NlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0c2VwYXJhdGVDYW5jZWw6IG5ldyB3cC5tZWRpYS5WaWV3KHtcblx0XHRcdFx0Y2xhc3NOYW1lOiAnc2VwYXJhdG9yJyxcblx0XHRcdFx0cHJpb3JpdHk6IDQwXG5cdFx0XHR9KVxuXHRcdH0pO1xuXHR9LFxuXG5cdHZpZGVvUGxheWxpc3RNZW51OiBmdW5jdGlvbiggdmlldyApIHtcblx0XHR2YXIgbGFzdFN0YXRlID0gdGhpcy5sYXN0U3RhdGUoKSxcblx0XHRcdHByZXZpb3VzID0gbGFzdFN0YXRlICYmIGxhc3RTdGF0ZS5pZCxcblx0XHRcdGZyYW1lID0gdGhpcztcblxuXHRcdHZpZXcuc2V0KHtcblx0XHRcdGNhbmNlbDoge1xuXHRcdFx0XHR0ZXh0OiAgICAgbDEwbi5jYW5jZWxWaWRlb1BsYXlsaXN0VGl0bGUsXG5cdFx0XHRcdHByaW9yaXR5OiAyMCxcblx0XHRcdFx0Y2xpY2s6ICAgIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdGlmICggcHJldmlvdXMgKSB7XG5cdFx0XHRcdFx0XHRmcmFtZS5zZXRTdGF0ZSggcHJldmlvdXMgKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0ZnJhbWUuY2xvc2UoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRzZXBhcmF0ZUNhbmNlbDogbmV3IHdwLm1lZGlhLlZpZXcoe1xuXHRcdFx0XHRjbGFzc05hbWU6ICdzZXBhcmF0b3InLFxuXHRcdFx0XHRwcmlvcml0eTogNDBcblx0XHRcdH0pXG5cdFx0fSk7XG5cdH0sXG5cblx0Ly8gQ29udGVudFxuXHRlbWJlZENvbnRlbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB2aWV3ID0gbmV3IHdwLm1lZGlhLnZpZXcuRW1iZWQoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcyxcblx0XHRcdG1vZGVsOiAgICAgIHRoaXMuc3RhdGUoKVxuXHRcdH0pLnJlbmRlcigpO1xuXG5cdFx0dGhpcy5jb250ZW50LnNldCggdmlldyApO1xuXG5cdFx0aWYgKCAhIHdwLm1lZGlhLmlzVG91Y2hEZXZpY2UgKSB7XG5cdFx0XHR2aWV3LnVybC5mb2N1cygpO1xuXHRcdH1cblx0fSxcblxuXHRlZGl0U2VsZWN0aW9uQ29udGVudDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHN0YXRlID0gdGhpcy5zdGF0ZSgpLFxuXHRcdFx0c2VsZWN0aW9uID0gc3RhdGUuZ2V0KCdzZWxlY3Rpb24nKSxcblx0XHRcdHZpZXc7XG5cblx0XHR2aWV3ID0gbmV3IHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudHNCcm93c2VyKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRjb2xsZWN0aW9uOiBzZWxlY3Rpb24sXG5cdFx0XHRzZWxlY3Rpb246ICBzZWxlY3Rpb24sXG5cdFx0XHRtb2RlbDogICAgICBzdGF0ZSxcblx0XHRcdHNvcnRhYmxlOiAgIHRydWUsXG5cdFx0XHRzZWFyY2g6ICAgICBmYWxzZSxcblx0XHRcdGRhdGU6ICAgICAgIGZhbHNlLFxuXHRcdFx0ZHJhZ0luZm86ICAgdHJ1ZSxcblxuXHRcdFx0QXR0YWNobWVudFZpZXc6IHdwLm1lZGlhLnZpZXcuQXR0YWNobWVudHMuRWRpdFNlbGVjdGlvblxuXHRcdH0pLnJlbmRlcigpO1xuXG5cdFx0dmlldy50b29sYmFyLnNldCggJ2JhY2tUb0xpYnJhcnknLCB7XG5cdFx0XHR0ZXh0OiAgICAgbDEwbi5yZXR1cm5Ub0xpYnJhcnksXG5cdFx0XHRwcmlvcml0eTogLTEwMCxcblxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLmNvbnRyb2xsZXIuY29udGVudC5tb2RlKCdicm93c2UnKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIEJyb3dzZSBvdXIgbGlicmFyeSBvZiBhdHRhY2htZW50cy5cblx0XHR0aGlzLmNvbnRlbnQuc2V0KCB2aWV3ICk7XG5cblx0XHQvLyBUcmlnZ2VyIHRoZSBjb250cm9sbGVyIHRvIHNldCBmb2N1c1xuXHRcdHRoaXMudHJpZ2dlciggJ2VkaXQ6c2VsZWN0aW9uJywgdGhpcyApO1xuXHR9LFxuXG5cdGVkaXRJbWFnZUNvbnRlbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBpbWFnZSA9IHRoaXMuc3RhdGUoKS5nZXQoJ2ltYWdlJyksXG5cdFx0XHR2aWV3ID0gbmV3IHdwLm1lZGlhLnZpZXcuRWRpdEltYWdlKCB7IG1vZGVsOiBpbWFnZSwgY29udHJvbGxlcjogdGhpcyB9ICkucmVuZGVyKCk7XG5cblx0XHR0aGlzLmNvbnRlbnQuc2V0KCB2aWV3ICk7XG5cblx0XHQvLyBhZnRlciBjcmVhdGluZyB0aGUgd3JhcHBlciB2aWV3LCBsb2FkIHRoZSBhY3R1YWwgZWRpdG9yIHZpYSBhbiBhamF4IGNhbGxcblx0XHR2aWV3LmxvYWRFZGl0b3IoKTtcblxuXHR9LFxuXG5cdC8vIFRvb2xiYXJzXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7d3AuQmFja2JvbmUuVmlld30gdmlld1xuXHQgKi9cblx0c2VsZWN0aW9uU3RhdHVzVG9vbGJhcjogZnVuY3Rpb24oIHZpZXcgKSB7XG5cdFx0dmFyIGVkaXRhYmxlID0gdGhpcy5zdGF0ZSgpLmdldCgnZWRpdGFibGUnKTtcblxuXHRcdHZpZXcuc2V0KCAnc2VsZWN0aW9uJywgbmV3IHdwLm1lZGlhLnZpZXcuU2VsZWN0aW9uKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRjb2xsZWN0aW9uOiB0aGlzLnN0YXRlKCkuZ2V0KCdzZWxlY3Rpb24nKSxcblx0XHRcdHByaW9yaXR5OiAgIC00MCxcblxuXHRcdFx0Ly8gSWYgdGhlIHNlbGVjdGlvbiBpcyBlZGl0YWJsZSwgcGFzcyB0aGUgY2FsbGJhY2sgdG9cblx0XHRcdC8vIHN3aXRjaCB0aGUgY29udGVudCBtb2RlLlxuXHRcdFx0ZWRpdGFibGU6IGVkaXRhYmxlICYmIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR0aGlzLmNvbnRyb2xsZXIuY29udGVudC5tb2RlKCdlZGl0LXNlbGVjdGlvbicpO1xuXHRcdFx0fVxuXHRcdH0pLnJlbmRlcigpICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7d3AuQmFja2JvbmUuVmlld30gdmlld1xuXHQgKi9cblx0bWFpbkluc2VydFRvb2xiYXI6IGZ1bmN0aW9uKCB2aWV3ICkge1xuXHRcdHZhciBjb250cm9sbGVyID0gdGhpcztcblxuXHRcdHRoaXMuc2VsZWN0aW9uU3RhdHVzVG9vbGJhciggdmlldyApO1xuXG5cdFx0dmlldy5zZXQoICdpbnNlcnQnLCB7XG5cdFx0XHRzdHlsZTogICAgJ3ByaW1hcnknLFxuXHRcdFx0cHJpb3JpdHk6IDgwLFxuXHRcdFx0dGV4dDogICAgIGwxMG4uaW5zZXJ0SW50b1Bvc3QsXG5cdFx0XHRyZXF1aXJlczogeyBzZWxlY3Rpb246IHRydWUgfSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBAZmlyZXMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZSNpbnNlcnRcblx0XHRcdCAqL1xuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc3RhdGUgPSBjb250cm9sbGVyLnN0YXRlKCksXG5cdFx0XHRcdFx0c2VsZWN0aW9uID0gc3RhdGUuZ2V0KCdzZWxlY3Rpb24nKTtcblxuXHRcdFx0XHRjb250cm9sbGVyLmNsb3NlKCk7XG5cdFx0XHRcdHN0YXRlLnRyaWdnZXIoICdpbnNlcnQnLCBzZWxlY3Rpb24gKS5yZXNldCgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge3dwLkJhY2tib25lLlZpZXd9IHZpZXdcblx0ICovXG5cdG1haW5HYWxsZXJ5VG9vbGJhcjogZnVuY3Rpb24oIHZpZXcgKSB7XG5cdFx0dmFyIGNvbnRyb2xsZXIgPSB0aGlzO1xuXG5cdFx0dGhpcy5zZWxlY3Rpb25TdGF0dXNUb29sYmFyKCB2aWV3ICk7XG5cblx0XHR2aWV3LnNldCggJ2dhbGxlcnknLCB7XG5cdFx0XHRzdHlsZTogICAgJ3ByaW1hcnknLFxuXHRcdFx0dGV4dDogICAgIGwxMG4uY3JlYXRlTmV3R2FsbGVyeSxcblx0XHRcdHByaW9yaXR5OiA2MCxcblx0XHRcdHJlcXVpcmVzOiB7IHNlbGVjdGlvbjogdHJ1ZSB9LFxuXG5cdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzZWxlY3Rpb24gPSBjb250cm9sbGVyLnN0YXRlKCkuZ2V0KCdzZWxlY3Rpb24nKSxcblx0XHRcdFx0XHRlZGl0ID0gY29udHJvbGxlci5zdGF0ZSgnZ2FsbGVyeS1lZGl0JyksXG5cdFx0XHRcdFx0bW9kZWxzID0gc2VsZWN0aW9uLndoZXJlKHsgdHlwZTogJ2ltYWdlJyB9KTtcblxuXHRcdFx0XHRlZGl0LnNldCggJ2xpYnJhcnknLCBuZXcgd3AubWVkaWEubW9kZWwuU2VsZWN0aW9uKCBtb2RlbHMsIHtcblx0XHRcdFx0XHRwcm9wczogICAgc2VsZWN0aW9uLnByb3BzLnRvSlNPTigpLFxuXHRcdFx0XHRcdG11bHRpcGxlOiB0cnVlXG5cdFx0XHRcdH0pICk7XG5cblx0XHRcdFx0dGhpcy5jb250cm9sbGVyLnNldFN0YXRlKCdnYWxsZXJ5LWVkaXQnKTtcblxuXHRcdFx0XHQvLyBLZWVwIGZvY3VzIGluc2lkZSBtZWRpYSBtb2RhbFxuXHRcdFx0XHQvLyBhZnRlciBqdW1waW5nIHRvIGdhbGxlcnkgdmlld1xuXHRcdFx0XHR0aGlzLmNvbnRyb2xsZXIubW9kYWwuZm9jdXNNYW5hZ2VyLmZvY3VzKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0bWFpblBsYXlsaXN0VG9vbGJhcjogZnVuY3Rpb24oIHZpZXcgKSB7XG5cdFx0dmFyIGNvbnRyb2xsZXIgPSB0aGlzO1xuXG5cdFx0dGhpcy5zZWxlY3Rpb25TdGF0dXNUb29sYmFyKCB2aWV3ICk7XG5cblx0XHR2aWV3LnNldCggJ3BsYXlsaXN0Jywge1xuXHRcdFx0c3R5bGU6ICAgICdwcmltYXJ5Jyxcblx0XHRcdHRleHQ6ICAgICBsMTBuLmNyZWF0ZU5ld1BsYXlsaXN0LFxuXHRcdFx0cHJpb3JpdHk6IDEwMCxcblx0XHRcdHJlcXVpcmVzOiB7IHNlbGVjdGlvbjogdHJ1ZSB9LFxuXG5cdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHZhciBzZWxlY3Rpb24gPSBjb250cm9sbGVyLnN0YXRlKCkuZ2V0KCdzZWxlY3Rpb24nKSxcblx0XHRcdFx0XHRlZGl0ID0gY29udHJvbGxlci5zdGF0ZSgncGxheWxpc3QtZWRpdCcpLFxuXHRcdFx0XHRcdG1vZGVscyA9IHNlbGVjdGlvbi53aGVyZSh7IHR5cGU6ICdhdWRpbycgfSk7XG5cblx0XHRcdFx0ZWRpdC5zZXQoICdsaWJyYXJ5JywgbmV3IHdwLm1lZGlhLm1vZGVsLlNlbGVjdGlvbiggbW9kZWxzLCB7XG5cdFx0XHRcdFx0cHJvcHM6ICAgIHNlbGVjdGlvbi5wcm9wcy50b0pTT04oKSxcblx0XHRcdFx0XHRtdWx0aXBsZTogdHJ1ZVxuXHRcdFx0XHR9KSApO1xuXG5cdFx0XHRcdHRoaXMuY29udHJvbGxlci5zZXRTdGF0ZSgncGxheWxpc3QtZWRpdCcpO1xuXG5cdFx0XHRcdC8vIEtlZXAgZm9jdXMgaW5zaWRlIG1lZGlhIG1vZGFsXG5cdFx0XHRcdC8vIGFmdGVyIGp1bXBpbmcgdG8gcGxheWxpc3Qgdmlld1xuXHRcdFx0XHR0aGlzLmNvbnRyb2xsZXIubW9kYWwuZm9jdXNNYW5hZ2VyLmZvY3VzKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0bWFpblZpZGVvUGxheWxpc3RUb29sYmFyOiBmdW5jdGlvbiggdmlldyApIHtcblx0XHR2YXIgY29udHJvbGxlciA9IHRoaXM7XG5cblx0XHR0aGlzLnNlbGVjdGlvblN0YXR1c1Rvb2xiYXIoIHZpZXcgKTtcblxuXHRcdHZpZXcuc2V0KCAndmlkZW8tcGxheWxpc3QnLCB7XG5cdFx0XHRzdHlsZTogICAgJ3ByaW1hcnknLFxuXHRcdFx0dGV4dDogICAgIGwxMG4uY3JlYXRlTmV3VmlkZW9QbGF5bGlzdCxcblx0XHRcdHByaW9yaXR5OiAxMDAsXG5cdFx0XHRyZXF1aXJlczogeyBzZWxlY3Rpb246IHRydWUgfSxcblxuXHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHR2YXIgc2VsZWN0aW9uID0gY29udHJvbGxlci5zdGF0ZSgpLmdldCgnc2VsZWN0aW9uJyksXG5cdFx0XHRcdFx0ZWRpdCA9IGNvbnRyb2xsZXIuc3RhdGUoJ3ZpZGVvLXBsYXlsaXN0LWVkaXQnKSxcblx0XHRcdFx0XHRtb2RlbHMgPSBzZWxlY3Rpb24ud2hlcmUoeyB0eXBlOiAndmlkZW8nIH0pO1xuXG5cdFx0XHRcdGVkaXQuc2V0KCAnbGlicmFyeScsIG5ldyB3cC5tZWRpYS5tb2RlbC5TZWxlY3Rpb24oIG1vZGVscywge1xuXHRcdFx0XHRcdHByb3BzOiAgICBzZWxlY3Rpb24ucHJvcHMudG9KU09OKCksXG5cdFx0XHRcdFx0bXVsdGlwbGU6IHRydWVcblx0XHRcdFx0fSkgKTtcblxuXHRcdFx0XHR0aGlzLmNvbnRyb2xsZXIuc2V0U3RhdGUoJ3ZpZGVvLXBsYXlsaXN0LWVkaXQnKTtcblxuXHRcdFx0XHQvLyBLZWVwIGZvY3VzIGluc2lkZSBtZWRpYSBtb2RhbFxuXHRcdFx0XHQvLyBhZnRlciBqdW1waW5nIHRvIHZpZGVvIHBsYXlsaXN0IHZpZXdcblx0XHRcdFx0dGhpcy5jb250cm9sbGVyLm1vZGFsLmZvY3VzTWFuYWdlci5mb2N1cygpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdGZlYXR1cmVkSW1hZ2VUb29sYmFyOiBmdW5jdGlvbiggdG9vbGJhciApIHtcblx0XHR0aGlzLmNyZWF0ZVNlbGVjdFRvb2xiYXIoIHRvb2xiYXIsIHtcblx0XHRcdHRleHQ6ICBsMTBuLnNldEZlYXR1cmVkSW1hZ2UsXG5cdFx0XHRzdGF0ZTogdGhpcy5vcHRpb25zLnN0YXRlXG5cdFx0fSk7XG5cdH0sXG5cblx0bWFpbkVtYmVkVG9vbGJhcjogZnVuY3Rpb24oIHRvb2xiYXIgKSB7XG5cdFx0dG9vbGJhci52aWV3ID0gbmV3IHdwLm1lZGlhLnZpZXcuVG9vbGJhci5FbWJlZCh7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzXG5cdFx0fSk7XG5cdH0sXG5cblx0Z2FsbGVyeUVkaXRUb29sYmFyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZWRpdGluZyA9IHRoaXMuc3RhdGUoKS5nZXQoJ2VkaXRpbmcnKTtcblx0XHR0aGlzLnRvb2xiYXIuc2V0KCBuZXcgd3AubWVkaWEudmlldy5Ub29sYmFyKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRpdGVtczoge1xuXHRcdFx0XHRpbnNlcnQ6IHtcblx0XHRcdFx0XHRzdHlsZTogICAgJ3ByaW1hcnknLFxuXHRcdFx0XHRcdHRleHQ6ICAgICBlZGl0aW5nID8gbDEwbi51cGRhdGVHYWxsZXJ5IDogbDEwbi5pbnNlcnRHYWxsZXJ5LFxuXHRcdFx0XHRcdHByaW9yaXR5OiA4MCxcblx0XHRcdFx0XHRyZXF1aXJlczogeyBsaWJyYXJ5OiB0cnVlIH0sXG5cblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiBAZmlyZXMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZSN1cGRhdGVcblx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29udHJvbGxlciA9IHRoaXMuY29udHJvbGxlcixcblx0XHRcdFx0XHRcdFx0c3RhdGUgPSBjb250cm9sbGVyLnN0YXRlKCk7XG5cblx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuY2xvc2UoKTtcblx0XHRcdFx0XHRcdHN0YXRlLnRyaWdnZXIoICd1cGRhdGUnLCBzdGF0ZS5nZXQoJ2xpYnJhcnknKSApO1xuXG5cdFx0XHRcdFx0XHQvLyBSZXN0b3JlIGFuZCByZXNldCB0aGUgZGVmYXVsdCBzdGF0ZS5cblx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuc2V0U3RhdGUoIGNvbnRyb2xsZXIub3B0aW9ucy5zdGF0ZSApO1xuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5yZXNldCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pICk7XG5cdH0sXG5cblx0Z2FsbGVyeUFkZFRvb2xiYXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudG9vbGJhci5zZXQoIG5ldyB3cC5tZWRpYS52aWV3LlRvb2xiYXIoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcyxcblx0XHRcdGl0ZW1zOiB7XG5cdFx0XHRcdGluc2VydDoge1xuXHRcdFx0XHRcdHN0eWxlOiAgICAncHJpbWFyeScsXG5cdFx0XHRcdFx0dGV4dDogICAgIGwxMG4uYWRkVG9HYWxsZXJ5LFxuXHRcdFx0XHRcdHByaW9yaXR5OiA4MCxcblx0XHRcdFx0XHRyZXF1aXJlczogeyBzZWxlY3Rpb246IHRydWUgfSxcblxuXHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdCAqIEBmaXJlcyB3cC5tZWRpYS5jb250cm9sbGVyLlN0YXRlI3Jlc2V0XG5cdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdFx0dmFyIGNvbnRyb2xsZXIgPSB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRcdFx0XHRcdHN0YXRlID0gY29udHJvbGxlci5zdGF0ZSgpLFxuXHRcdFx0XHRcdFx0XHRlZGl0ID0gY29udHJvbGxlci5zdGF0ZSgnZ2FsbGVyeS1lZGl0Jyk7XG5cblx0XHRcdFx0XHRcdGVkaXQuZ2V0KCdsaWJyYXJ5JykuYWRkKCBzdGF0ZS5nZXQoJ3NlbGVjdGlvbicpLm1vZGVscyApO1xuXHRcdFx0XHRcdFx0c3RhdGUudHJpZ2dlcigncmVzZXQnKTtcblx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuc2V0U3RhdGUoJ2dhbGxlcnktZWRpdCcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pICk7XG5cdH0sXG5cblx0cGxheWxpc3RFZGl0VG9vbGJhcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGVkaXRpbmcgPSB0aGlzLnN0YXRlKCkuZ2V0KCdlZGl0aW5nJyk7XG5cdFx0dGhpcy50b29sYmFyLnNldCggbmV3IHdwLm1lZGlhLnZpZXcuVG9vbGJhcih7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0aXRlbXM6IHtcblx0XHRcdFx0aW5zZXJ0OiB7XG5cdFx0XHRcdFx0c3R5bGU6ICAgICdwcmltYXJ5Jyxcblx0XHRcdFx0XHR0ZXh0OiAgICAgZWRpdGluZyA/IGwxMG4udXBkYXRlUGxheWxpc3QgOiBsMTBuLmluc2VydFBsYXlsaXN0LFxuXHRcdFx0XHRcdHByaW9yaXR5OiA4MCxcblx0XHRcdFx0XHRyZXF1aXJlczogeyBsaWJyYXJ5OiB0cnVlIH0sXG5cblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiBAZmlyZXMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZSN1cGRhdGVcblx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29udHJvbGxlciA9IHRoaXMuY29udHJvbGxlcixcblx0XHRcdFx0XHRcdFx0c3RhdGUgPSBjb250cm9sbGVyLnN0YXRlKCk7XG5cblx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuY2xvc2UoKTtcblx0XHRcdFx0XHRcdHN0YXRlLnRyaWdnZXIoICd1cGRhdGUnLCBzdGF0ZS5nZXQoJ2xpYnJhcnknKSApO1xuXG5cdFx0XHRcdFx0XHQvLyBSZXN0b3JlIGFuZCByZXNldCB0aGUgZGVmYXVsdCBzdGF0ZS5cblx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuc2V0U3RhdGUoIGNvbnRyb2xsZXIub3B0aW9ucy5zdGF0ZSApO1xuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5yZXNldCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pICk7XG5cdH0sXG5cblx0cGxheWxpc3RBZGRUb29sYmFyOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnRvb2xiYXIuc2V0KCBuZXcgd3AubWVkaWEudmlldy5Ub29sYmFyKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHRpdGVtczoge1xuXHRcdFx0XHRpbnNlcnQ6IHtcblx0XHRcdFx0XHRzdHlsZTogICAgJ3ByaW1hcnknLFxuXHRcdFx0XHRcdHRleHQ6ICAgICBsMTBuLmFkZFRvUGxheWxpc3QsXG5cdFx0XHRcdFx0cHJpb3JpdHk6IDgwLFxuXHRcdFx0XHRcdHJlcXVpcmVzOiB7IHNlbGVjdGlvbjogdHJ1ZSB9LFxuXG5cdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0ICogQGZpcmVzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGUjcmVzZXRcblx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29udHJvbGxlciA9IHRoaXMuY29udHJvbGxlcixcblx0XHRcdFx0XHRcdFx0c3RhdGUgPSBjb250cm9sbGVyLnN0YXRlKCksXG5cdFx0XHRcdFx0XHRcdGVkaXQgPSBjb250cm9sbGVyLnN0YXRlKCdwbGF5bGlzdC1lZGl0Jyk7XG5cblx0XHRcdFx0XHRcdGVkaXQuZ2V0KCdsaWJyYXJ5JykuYWRkKCBzdGF0ZS5nZXQoJ3NlbGVjdGlvbicpLm1vZGVscyApO1xuXHRcdFx0XHRcdFx0c3RhdGUudHJpZ2dlcigncmVzZXQnKTtcblx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuc2V0U3RhdGUoJ3BsYXlsaXN0LWVkaXQnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KSApO1xuXHR9LFxuXG5cdHZpZGVvUGxheWxpc3RFZGl0VG9vbGJhcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGVkaXRpbmcgPSB0aGlzLnN0YXRlKCkuZ2V0KCdlZGl0aW5nJyk7XG5cdFx0dGhpcy50b29sYmFyLnNldCggbmV3IHdwLm1lZGlhLnZpZXcuVG9vbGJhcih7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0aXRlbXM6IHtcblx0XHRcdFx0aW5zZXJ0OiB7XG5cdFx0XHRcdFx0c3R5bGU6ICAgICdwcmltYXJ5Jyxcblx0XHRcdFx0XHR0ZXh0OiAgICAgZWRpdGluZyA/IGwxMG4udXBkYXRlVmlkZW9QbGF5bGlzdCA6IGwxMG4uaW5zZXJ0VmlkZW9QbGF5bGlzdCxcblx0XHRcdFx0XHRwcmlvcml0eTogMTQwLFxuXHRcdFx0XHRcdHJlcXVpcmVzOiB7IGxpYnJhcnk6IHRydWUgfSxcblxuXHRcdFx0XHRcdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRcdHZhciBjb250cm9sbGVyID0gdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0XHRcdFx0XHRzdGF0ZSA9IGNvbnRyb2xsZXIuc3RhdGUoKSxcblx0XHRcdFx0XHRcdFx0bGlicmFyeSA9IHN0YXRlLmdldCgnbGlicmFyeScpO1xuXG5cdFx0XHRcdFx0XHRsaWJyYXJ5LnR5cGUgPSAndmlkZW8nO1xuXG5cdFx0XHRcdFx0XHRjb250cm9sbGVyLmNsb3NlKCk7XG5cdFx0XHRcdFx0XHRzdGF0ZS50cmlnZ2VyKCAndXBkYXRlJywgbGlicmFyeSApO1xuXG5cdFx0XHRcdFx0XHQvLyBSZXN0b3JlIGFuZCByZXNldCB0aGUgZGVmYXVsdCBzdGF0ZS5cblx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuc2V0U3RhdGUoIGNvbnRyb2xsZXIub3B0aW9ucy5zdGF0ZSApO1xuXHRcdFx0XHRcdFx0Y29udHJvbGxlci5yZXNldCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pICk7XG5cdH0sXG5cblx0dmlkZW9QbGF5bGlzdEFkZFRvb2xiYXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudG9vbGJhci5zZXQoIG5ldyB3cC5tZWRpYS52aWV3LlRvb2xiYXIoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcyxcblx0XHRcdGl0ZW1zOiB7XG5cdFx0XHRcdGluc2VydDoge1xuXHRcdFx0XHRcdHN0eWxlOiAgICAncHJpbWFyeScsXG5cdFx0XHRcdFx0dGV4dDogICAgIGwxMG4uYWRkVG9WaWRlb1BsYXlsaXN0LFxuXHRcdFx0XHRcdHByaW9yaXR5OiAxNDAsXG5cdFx0XHRcdFx0cmVxdWlyZXM6IHsgc2VsZWN0aW9uOiB0cnVlIH0sXG5cblx0XHRcdFx0XHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0XHR2YXIgY29udHJvbGxlciA9IHRoaXMuY29udHJvbGxlcixcblx0XHRcdFx0XHRcdFx0c3RhdGUgPSBjb250cm9sbGVyLnN0YXRlKCksXG5cdFx0XHRcdFx0XHRcdGVkaXQgPSBjb250cm9sbGVyLnN0YXRlKCd2aWRlby1wbGF5bGlzdC1lZGl0Jyk7XG5cblx0XHRcdFx0XHRcdGVkaXQuZ2V0KCdsaWJyYXJ5JykuYWRkKCBzdGF0ZS5nZXQoJ3NlbGVjdGlvbicpLm1vZGVscyApO1xuXHRcdFx0XHRcdFx0c3RhdGUudHJpZ2dlcigncmVzZXQnKTtcblx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuc2V0U3RhdGUoJ3ZpZGVvLXBsYXlsaXN0LWVkaXQnKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KSApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQb3N0O1xuIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5NZWRpYUZyYW1lLlNlbGVjdFxuICpcbiAqIEEgZnJhbWUgZm9yIHNlbGVjdGluZyBhbiBpdGVtIG9yIGl0ZW1zIGZyb20gdGhlIG1lZGlhIGxpYnJhcnkuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5NZWRpYUZyYW1lXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5GcmFtZVxuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICogQG1peGVzIHdwLm1lZGlhLmNvbnRyb2xsZXIuU3RhdGVNYWNoaW5lXG4gKi9cblxudmFyIE1lZGlhRnJhbWUgPSB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWUsXG5cdGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdFNlbGVjdDtcblxuU2VsZWN0ID0gTWVkaWFGcmFtZS5leHRlbmQoe1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHQvLyBDYWxsICdpbml0aWFsaXplJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzLlxuXHRcdE1lZGlhRnJhbWUucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0Xy5kZWZhdWx0cyggdGhpcy5vcHRpb25zLCB7XG5cdFx0XHRzZWxlY3Rpb246IFtdLFxuXHRcdFx0bGlicmFyeTogICB7fSxcblx0XHRcdG11bHRpcGxlOiAgZmFsc2UsXG5cdFx0XHRzdGF0ZTogICAgJ2xpYnJhcnknXG5cdFx0fSk7XG5cblx0XHR0aGlzLmNyZWF0ZVNlbGVjdGlvbigpO1xuXHRcdHRoaXMuY3JlYXRlU3RhdGVzKCk7XG5cdFx0dGhpcy5iaW5kSGFuZGxlcnMoKTtcblx0fSxcblxuXHQvKipcblx0ICogQXR0YWNoIGEgc2VsZWN0aW9uIGNvbGxlY3Rpb24gdG8gdGhlIGZyYW1lLlxuXHQgKlxuXHQgKiBBIHNlbGVjdGlvbiBpcyBhIGNvbGxlY3Rpb24gb2YgYXR0YWNobWVudHMgdXNlZCBmb3IgYSBzcGVjaWZpYyBwdXJwb3NlXG5cdCAqIGJ5IGEgbWVkaWEgZnJhbWUuIGUuZy4gU2VsZWN0aW5nIGFuIGF0dGFjaG1lbnQgKG9yIG1hbnkpIHRvIGluc2VydCBpbnRvXG5cdCAqIHBvc3QgY29udGVudC5cblx0ICpcblx0ICogQHNlZSBtZWRpYS5tb2RlbC5TZWxlY3Rpb25cblx0ICovXG5cdGNyZWF0ZVNlbGVjdGlvbjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHNlbGVjdGlvbiA9IHRoaXMub3B0aW9ucy5zZWxlY3Rpb247XG5cblx0XHRpZiAoICEgKHNlbGVjdGlvbiBpbnN0YW5jZW9mIHdwLm1lZGlhLm1vZGVsLlNlbGVjdGlvbikgKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMuc2VsZWN0aW9uID0gbmV3IHdwLm1lZGlhLm1vZGVsLlNlbGVjdGlvbiggc2VsZWN0aW9uLCB7XG5cdFx0XHRcdG11bHRpcGxlOiB0aGlzLm9wdGlvbnMubXVsdGlwbGVcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHRoaXMuX3NlbGVjdGlvbiA9IHtcblx0XHRcdGF0dGFjaG1lbnRzOiBuZXcgd3AubWVkaWEubW9kZWwuQXR0YWNobWVudHMoKSxcblx0XHRcdGRpZmZlcmVuY2U6IFtdXG5cdFx0fTtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIHRoZSBkZWZhdWx0IHN0YXRlcyBvbiB0aGUgZnJhbWUuXG5cdCAqL1xuXHRjcmVhdGVTdGF0ZXM6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMuc3RhdGVzICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEFkZCB0aGUgZGVmYXVsdCBzdGF0ZXMuXG5cdFx0dGhpcy5zdGF0ZXMuYWRkKFtcblx0XHRcdC8vIE1haW4gc3RhdGVzLlxuXHRcdFx0bmV3IHdwLm1lZGlhLmNvbnRyb2xsZXIuTGlicmFyeSh7XG5cdFx0XHRcdGxpYnJhcnk6ICAgd3AubWVkaWEucXVlcnkoIG9wdGlvbnMubGlicmFyeSApLFxuXHRcdFx0XHRtdWx0aXBsZTogIG9wdGlvbnMubXVsdGlwbGUsXG5cdFx0XHRcdHRpdGxlOiAgICAgb3B0aW9ucy50aXRsZSxcblx0XHRcdFx0cHJpb3JpdHk6ICAyMFxuXHRcdFx0fSlcblx0XHRdKTtcblx0fSxcblxuXHQvKipcblx0ICogQmluZCByZWdpb24gbW9kZSBldmVudCBjYWxsYmFja3MuXG5cdCAqXG5cdCAqIEBzZWUgbWVkaWEuY29udHJvbGxlci5SZWdpb24ucmVuZGVyXG5cdCAqL1xuXHRiaW5kSGFuZGxlcnM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMub24oICdyb3V0ZXI6Y3JlYXRlOmJyb3dzZScsIHRoaXMuY3JlYXRlUm91dGVyLCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ3JvdXRlcjpyZW5kZXI6YnJvd3NlJywgdGhpcy5icm93c2VSb3V0ZXIsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnY29udGVudDpjcmVhdGU6YnJvd3NlJywgdGhpcy5icm93c2VDb250ZW50LCB0aGlzICk7XG5cdFx0dGhpcy5vbiggJ2NvbnRlbnQ6cmVuZGVyOnVwbG9hZCcsIHRoaXMudXBsb2FkQ29udGVudCwgdGhpcyApO1xuXHRcdHRoaXMub24oICd0b29sYmFyOmNyZWF0ZTpzZWxlY3QnLCB0aGlzLmNyZWF0ZVNlbGVjdFRvb2xiYXIsIHRoaXMgKTtcblx0fSxcblxuXHQvKipcblx0ICogUmVuZGVyIGNhbGxiYWNrIGZvciB0aGUgcm91dGVyIHJlZ2lvbiBpbiB0aGUgYGJyb3dzZWAgbW9kZS5cblx0ICpcblx0ICogQHBhcmFtIHt3cC5tZWRpYS52aWV3LlJvdXRlcn0gcm91dGVyVmlld1xuXHQgKi9cblx0YnJvd3NlUm91dGVyOiBmdW5jdGlvbiggcm91dGVyVmlldyApIHtcblx0XHRyb3V0ZXJWaWV3LnNldCh7XG5cdFx0XHR1cGxvYWQ6IHtcblx0XHRcdFx0dGV4dDogICAgIGwxMG4udXBsb2FkRmlsZXNUaXRsZSxcblx0XHRcdFx0cHJpb3JpdHk6IDIwXG5cdFx0XHR9LFxuXHRcdFx0YnJvd3NlOiB7XG5cdFx0XHRcdHRleHQ6ICAgICBsMTBuLm1lZGlhTGlicmFyeVRpdGxlLFxuXHRcdFx0XHRwcmlvcml0eTogNDBcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogUmVuZGVyIGNhbGxiYWNrIGZvciB0aGUgY29udGVudCByZWdpb24gaW4gdGhlIGBicm93c2VgIG1vZGUuXG5cdCAqXG5cdCAqIEBwYXJhbSB7d3AubWVkaWEuY29udHJvbGxlci5SZWdpb259IGNvbnRlbnRSZWdpb25cblx0ICovXG5cdGJyb3dzZUNvbnRlbnQ6IGZ1bmN0aW9uKCBjb250ZW50UmVnaW9uICkge1xuXHRcdHZhciBzdGF0ZSA9IHRoaXMuc3RhdGUoKTtcblxuXHRcdHRoaXMuJGVsLnJlbW92ZUNsYXNzKCdoaWRlLXRvb2xiYXInKTtcblxuXHRcdC8vIEJyb3dzZSBvdXIgbGlicmFyeSBvZiBhdHRhY2htZW50cy5cblx0XHRjb250ZW50UmVnaW9uLnZpZXcgPSBuZXcgd3AubWVkaWEudmlldy5BdHRhY2htZW50c0Jyb3dzZXIoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcyxcblx0XHRcdGNvbGxlY3Rpb246IHN0YXRlLmdldCgnbGlicmFyeScpLFxuXHRcdFx0c2VsZWN0aW9uOiAgc3RhdGUuZ2V0KCdzZWxlY3Rpb24nKSxcblx0XHRcdG1vZGVsOiAgICAgIHN0YXRlLFxuXHRcdFx0c29ydGFibGU6ICAgc3RhdGUuZ2V0KCdzb3J0YWJsZScpLFxuXHRcdFx0c2VhcmNoOiAgICAgc3RhdGUuZ2V0KCdzZWFyY2hhYmxlJyksXG5cdFx0XHRmaWx0ZXJzOiAgICBzdGF0ZS5nZXQoJ2ZpbHRlcmFibGUnKSxcblx0XHRcdGRhdGU6ICAgICAgIHN0YXRlLmdldCgnZGF0ZScpLFxuXHRcdFx0ZGlzcGxheTogICAgc3RhdGUuaGFzKCdkaXNwbGF5JykgPyBzdGF0ZS5nZXQoJ2Rpc3BsYXknKSA6IHN0YXRlLmdldCgnZGlzcGxheVNldHRpbmdzJyksXG5cdFx0XHRkcmFnSW5mbzogICBzdGF0ZS5nZXQoJ2RyYWdJbmZvJyksXG5cblx0XHRcdGlkZWFsQ29sdW1uV2lkdGg6IHN0YXRlLmdldCgnaWRlYWxDb2x1bW5XaWR0aCcpLFxuXHRcdFx0c3VnZ2VzdGVkV2lkdGg6ICAgc3RhdGUuZ2V0KCdzdWdnZXN0ZWRXaWR0aCcpLFxuXHRcdFx0c3VnZ2VzdGVkSGVpZ2h0OiAgc3RhdGUuZ2V0KCdzdWdnZXN0ZWRIZWlnaHQnKSxcblxuXHRcdFx0QXR0YWNobWVudFZpZXc6IHN0YXRlLmdldCgnQXR0YWNobWVudFZpZXcnKVxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW5kZXIgY2FsbGJhY2sgZm9yIHRoZSBjb250ZW50IHJlZ2lvbiBpbiB0aGUgYHVwbG9hZGAgbW9kZS5cblx0ICovXG5cdHVwbG9hZENvbnRlbnQ6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJGVsLnJlbW92ZUNsYXNzKCAnaGlkZS10b29sYmFyJyApO1xuXHRcdHRoaXMuY29udGVudC5zZXQoIG5ldyB3cC5tZWRpYS52aWV3LlVwbG9hZGVySW5saW5lKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXNcblx0XHR9KSApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUb29sYmFyc1xuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gdG9vbGJhclxuXHQgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG5cdCAqIEB0aGlzIHdwLm1lZGlhLmNvbnRyb2xsZXIuUmVnaW9uXG5cdCAqL1xuXHRjcmVhdGVTZWxlY3RUb29sYmFyOiBmdW5jdGlvbiggdG9vbGJhciwgb3B0aW9ucyApIHtcblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB0aGlzLm9wdGlvbnMuYnV0dG9uIHx8IHt9O1xuXHRcdG9wdGlvbnMuY29udHJvbGxlciA9IHRoaXM7XG5cblx0XHR0b29sYmFyLnZpZXcgPSBuZXcgd3AubWVkaWEudmlldy5Ub29sYmFyLlNlbGVjdCggb3B0aW9ucyApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Q7XG4iLCIvKipcbiAqIHdwLm1lZGlhLnZpZXcuSWZyYW1lXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBJZnJhbWUgPSB3cC5tZWRpYS5WaWV3LmV4dGVuZCh7XG5cdGNsYXNzTmFtZTogJ21lZGlhLWlmcmFtZScsXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5JZnJhbWV9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMudmlld3MuZGV0YWNoKCk7XG5cdFx0dGhpcy4kZWwuaHRtbCggJzxpZnJhbWUgc3JjPVwiJyArIHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLmdldCgnc3JjJykgKyAnXCIgLz4nICk7XG5cdFx0dGhpcy52aWV3cy5yZW5kZXIoKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gSWZyYW1lO1xuIiwiLypnbG9iYWxzIHdwLCBfLCBqUXVlcnkgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LkltYWdlRGV0YWlsc1xuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuU2V0dGluZ3MuQXR0YWNobWVudERpc3BsYXlcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LlNldHRpbmdzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBBdHRhY2htZW50RGlzcGxheSA9IHdwLm1lZGlhLnZpZXcuU2V0dGluZ3MuQXR0YWNobWVudERpc3BsYXksXG5cdCQgPSBqUXVlcnksXG5cdEltYWdlRGV0YWlscztcblxuSW1hZ2VEZXRhaWxzID0gQXR0YWNobWVudERpc3BsYXkuZXh0ZW5kKHtcblx0Y2xhc3NOYW1lOiAnaW1hZ2UtZGV0YWlscycsXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoJ2ltYWdlLWRldGFpbHMnKSxcblx0ZXZlbnRzOiBfLmRlZmF1bHRzKCBBdHRhY2htZW50RGlzcGxheS5wcm90b3R5cGUuZXZlbnRzLCB7XG5cdFx0J2NsaWNrIC5lZGl0LWF0dGFjaG1lbnQnOiAnZWRpdEF0dGFjaG1lbnQnLFxuXHRcdCdjbGljayAucmVwbGFjZS1hdHRhY2htZW50JzogJ3JlcGxhY2VBdHRhY2htZW50Jyxcblx0XHQnY2xpY2sgLmFkdmFuY2VkLXRvZ2dsZSc6ICdvblRvZ2dsZUFkdmFuY2VkJyxcblx0XHQnY2hhbmdlIFtkYXRhLXNldHRpbmc9XCJjdXN0b21XaWR0aFwiXSc6ICdvbkN1c3RvbVNpemUnLFxuXHRcdCdjaGFuZ2UgW2RhdGEtc2V0dGluZz1cImN1c3RvbUhlaWdodFwiXSc6ICdvbkN1c3RvbVNpemUnLFxuXHRcdCdrZXl1cCBbZGF0YS1zZXR0aW5nPVwiY3VzdG9tV2lkdGhcIl0nOiAnb25DdXN0b21TaXplJyxcblx0XHQna2V5dXAgW2RhdGEtc2V0dGluZz1cImN1c3RvbUhlaWdodFwiXSc6ICdvbkN1c3RvbVNpemUnXG5cdH0gKSxcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gdXNlZCBpbiBBdHRhY2htZW50RGlzcGxheS5wcm90b3R5cGUudXBkYXRlTGlua1RvXG5cdFx0dGhpcy5vcHRpb25zLmF0dGFjaG1lbnQgPSB0aGlzLm1vZGVsLmF0dGFjaG1lbnQ7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZTp1cmwnLCB0aGlzLnVwZGF0ZVVybCApO1xuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdjaGFuZ2U6bGluaycsIHRoaXMudG9nZ2xlTGlua1NldHRpbmdzICk7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5tb2RlbCwgJ2NoYW5nZTpzaXplJywgdGhpcy50b2dnbGVDdXN0b21TaXplICk7XG5cblx0XHRBdHRhY2htZW50RGlzcGxheS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cblx0cHJlcGFyZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF0dGFjaG1lbnQgPSBmYWxzZTtcblxuXHRcdGlmICggdGhpcy5tb2RlbC5hdHRhY2htZW50ICkge1xuXHRcdFx0YXR0YWNobWVudCA9IHRoaXMubW9kZWwuYXR0YWNobWVudC50b0pTT04oKTtcblx0XHR9XG5cdFx0cmV0dXJuIF8uZGVmYXVsdHMoe1xuXHRcdFx0bW9kZWw6IHRoaXMubW9kZWwudG9KU09OKCksXG5cdFx0XHRhdHRhY2htZW50OiBhdHRhY2htZW50XG5cdFx0fSwgdGhpcy5vcHRpb25zICk7XG5cdH0sXG5cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgYXJncyA9IGFyZ3VtZW50cztcblxuXHRcdGlmICggdGhpcy5tb2RlbC5hdHRhY2htZW50ICYmICdwZW5kaW5nJyA9PT0gdGhpcy5tb2RlbC5kZmQuc3RhdGUoKSApIHtcblx0XHRcdHRoaXMubW9kZWwuZGZkXG5cdFx0XHRcdC5kb25lKCBfLmJpbmQoIGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdEF0dGFjaG1lbnREaXNwbGF5LnByb3RvdHlwZS5yZW5kZXIuYXBwbHkoIHRoaXMsIGFyZ3MgKTtcblx0XHRcdFx0XHR0aGlzLnBvc3RSZW5kZXIoKTtcblx0XHRcdFx0fSwgdGhpcyApIClcblx0XHRcdFx0LmZhaWwoIF8uYmluZCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdFx0dGhpcy5tb2RlbC5hdHRhY2htZW50ID0gZmFsc2U7XG5cdFx0XHRcdFx0QXR0YWNobWVudERpc3BsYXkucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcywgYXJncyApO1xuXHRcdFx0XHRcdHRoaXMucG9zdFJlbmRlcigpO1xuXHRcdFx0XHR9LCB0aGlzICkgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0QXR0YWNobWVudERpc3BsYXkucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0XHR0aGlzLnBvc3RSZW5kZXIoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRwb3N0UmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHRzZXRUaW1lb3V0KCBfLmJpbmQoIHRoaXMucmVzZXRGb2N1cywgdGhpcyApLCAxMCApO1xuXHRcdHRoaXMudG9nZ2xlTGlua1NldHRpbmdzKCk7XG5cdFx0aWYgKCB3aW5kb3cuZ2V0VXNlclNldHRpbmcoICdhZHZJbWdEZXRhaWxzJyApID09PSAnc2hvdycgKSB7XG5cdFx0XHR0aGlzLnRvZ2dsZUFkdmFuY2VkKCB0cnVlICk7XG5cdFx0fVxuXHRcdHRoaXMudHJpZ2dlciggJ3Bvc3QtcmVuZGVyJyApO1xuXHR9LFxuXG5cdHJlc2V0Rm9jdXM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJCggJy5saW5rLXRvLWN1c3RvbScgKS5ibHVyKCk7XG5cdFx0dGhpcy4kKCAnLmVtYmVkLW1lZGlhLXNldHRpbmdzJyApLnNjcm9sbFRvcCggMCApO1xuXHR9LFxuXG5cdHVwZGF0ZVVybDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kKCAnLmltYWdlIGltZycgKS5hdHRyKCAnc3JjJywgdGhpcy5tb2RlbC5nZXQoICd1cmwnICkgKTtcblx0XHR0aGlzLiQoICcudXJsJyApLnZhbCggdGhpcy5tb2RlbC5nZXQoICd1cmwnICkgKTtcblx0fSxcblxuXHR0b2dnbGVMaW5rU2V0dGluZ3M6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggdGhpcy5tb2RlbC5nZXQoICdsaW5rJyApID09PSAnbm9uZScgKSB7XG5cdFx0XHR0aGlzLiQoICcubGluay1zZXR0aW5ncycgKS5hZGRDbGFzcygnaGlkZGVuJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuJCggJy5saW5rLXNldHRpbmdzJyApLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblx0XHR9XG5cdH0sXG5cblx0dG9nZ2xlQ3VzdG9tU2l6ZTogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLm1vZGVsLmdldCggJ3NpemUnICkgIT09ICdjdXN0b20nICkge1xuXHRcdFx0dGhpcy4kKCAnLmN1c3RvbS1zaXplJyApLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy4kKCAnLmN1c3RvbS1zaXplJyApLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblx0XHR9XG5cdH0sXG5cblx0b25DdXN0b21TaXplOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dmFyIGRpbWVuc2lvbiA9ICQoIGV2ZW50LnRhcmdldCApLmRhdGEoJ3NldHRpbmcnKSxcblx0XHRcdG51bSA9ICQoIGV2ZW50LnRhcmdldCApLnZhbCgpLFxuXHRcdFx0dmFsdWU7XG5cblx0XHQvLyBJZ25vcmUgYm9ndXMgaW5wdXRcblx0XHRpZiAoICEgL15cXGQrLy50ZXN0KCBudW0gKSB8fCBwYXJzZUludCggbnVtLCAxMCApIDwgMSApIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCBkaW1lbnNpb24gPT09ICdjdXN0b21XaWR0aCcgKSB7XG5cdFx0XHR2YWx1ZSA9IE1hdGgucm91bmQoIDEgLyB0aGlzLm1vZGVsLmdldCggJ2FzcGVjdFJhdGlvJyApICogbnVtICk7XG5cdFx0XHR0aGlzLm1vZGVsLnNldCggJ2N1c3RvbUhlaWdodCcsIHZhbHVlLCB7IHNpbGVudDogdHJ1ZSB9ICk7XG5cdFx0XHR0aGlzLiQoICdbZGF0YS1zZXR0aW5nPVwiY3VzdG9tSGVpZ2h0XCJdJyApLnZhbCggdmFsdWUgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFsdWUgPSBNYXRoLnJvdW5kKCB0aGlzLm1vZGVsLmdldCggJ2FzcGVjdFJhdGlvJyApICogbnVtICk7XG5cdFx0XHR0aGlzLm1vZGVsLnNldCggJ2N1c3RvbVdpZHRoJywgdmFsdWUsIHsgc2lsZW50OiB0cnVlICB9ICk7XG5cdFx0XHR0aGlzLiQoICdbZGF0YS1zZXR0aW5nPVwiY3VzdG9tV2lkdGhcIl0nICkudmFsKCB2YWx1ZSApO1xuXHRcdH1cblx0fSxcblxuXHRvblRvZ2dsZUFkdmFuY2VkOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR0aGlzLnRvZ2dsZUFkdmFuY2VkKCk7XG5cdH0sXG5cblx0dG9nZ2xlQWR2YW5jZWQ6IGZ1bmN0aW9uKCBzaG93ICkge1xuXHRcdHZhciAkYWR2YW5jZWQgPSB0aGlzLiRlbC5maW5kKCAnLmFkdmFuY2VkLXNlY3Rpb24nICksXG5cdFx0XHRtb2RlO1xuXG5cdFx0aWYgKCAkYWR2YW5jZWQuaGFzQ2xhc3MoJ2FkdmFuY2VkLXZpc2libGUnKSB8fCBzaG93ID09PSBmYWxzZSApIHtcblx0XHRcdCRhZHZhbmNlZC5yZW1vdmVDbGFzcygnYWR2YW5jZWQtdmlzaWJsZScpO1xuXHRcdFx0JGFkdmFuY2VkLmZpbmQoJy5hZHZhbmNlZC1zZXR0aW5ncycpLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0XHRcdG1vZGUgPSAnaGlkZSc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCRhZHZhbmNlZC5hZGRDbGFzcygnYWR2YW5jZWQtdmlzaWJsZScpO1xuXHRcdFx0JGFkdmFuY2VkLmZpbmQoJy5hZHZhbmNlZC1zZXR0aW5ncycpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblx0XHRcdG1vZGUgPSAnc2hvdyc7XG5cdFx0fVxuXG5cdFx0d2luZG93LnNldFVzZXJTZXR0aW5nKCAnYWR2SW1nRGV0YWlscycsIG1vZGUgKTtcblx0fSxcblxuXHRlZGl0QXR0YWNobWVudDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciBlZGl0U3RhdGUgPSB0aGlzLmNvbnRyb2xsZXIuc3RhdGVzLmdldCggJ2VkaXQtaW1hZ2UnICk7XG5cblx0XHRpZiAoIHdpbmRvdy5pbWFnZUVkaXQgJiYgZWRpdFN0YXRlICkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGVkaXRTdGF0ZS5zZXQoICdpbWFnZScsIHRoaXMubW9kZWwuYXR0YWNobWVudCApO1xuXHRcdFx0dGhpcy5jb250cm9sbGVyLnNldFN0YXRlKCAnZWRpdC1pbWFnZScgKTtcblx0XHR9XG5cdH0sXG5cblx0cmVwbGFjZUF0dGFjaG1lbnQ6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHRoaXMuY29udHJvbGxlci5zZXRTdGF0ZSggJ3JlcGxhY2UtaW1hZ2UnICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEltYWdlRGV0YWlscztcbiIsIi8qKlxuICogd3AubWVkaWEudmlldy5MYWJlbFxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgTGFiZWwgPSB3cC5tZWRpYS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICdsYWJlbCcsXG5cdGNsYXNzTmFtZTogJ3NjcmVlbi1yZWFkZXItdGV4dCcsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy52YWx1ZSA9IHRoaXMub3B0aW9ucy52YWx1ZTtcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJGVsLmh0bWwoIHRoaXMudmFsdWUgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBMYWJlbDtcbiIsIi8qZ2xvYmFscyB3cCwgXywgalF1ZXJ5ICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5NZWRpYUZyYW1lXG4gKlxuICogVGhlIGZyYW1lIHVzZWQgdG8gY3JlYXRlIHRoZSBtZWRpYSBtb2RhbC5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkZyYW1lXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKiBAbWl4ZXMgd3AubWVkaWEuY29udHJvbGxlci5TdGF0ZU1hY2hpbmVcbiAqL1xudmFyIEZyYW1lID0gd3AubWVkaWEudmlldy5GcmFtZSxcblx0JCA9IGpRdWVyeSxcblx0TWVkaWFGcmFtZTtcblxuTWVkaWFGcmFtZSA9IEZyYW1lLmV4dGVuZCh7XG5cdGNsYXNzTmFtZTogJ21lZGlhLWZyYW1lJyxcblx0dGVtcGxhdGU6ICB3cC50ZW1wbGF0ZSgnbWVkaWEtZnJhbWUnKSxcblx0cmVnaW9uczogICBbJ21lbnUnLCd0aXRsZScsJ2NvbnRlbnQnLCd0b29sYmFyJywncm91dGVyJ10sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIGRpdi5tZWRpYS1mcmFtZS10aXRsZSBoMSc6ICd0b2dnbGVNZW51J1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAZ2xvYmFsIHdwLlVwbG9hZGVyXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRGcmFtZS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cblx0XHRfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdHRpdGxlOiAgICAnJyxcblx0XHRcdG1vZGFsOiAgICB0cnVlLFxuXHRcdFx0dXBsb2FkZXI6IHRydWVcblx0XHR9KTtcblxuXHRcdC8vIEVuc3VyZSBjb3JlIFVJIGlzIGVuYWJsZWQuXG5cdFx0dGhpcy4kZWwuYWRkQ2xhc3MoJ3dwLWNvcmUtdWknKTtcblxuXHRcdC8vIEluaXRpYWxpemUgbW9kYWwgY29udGFpbmVyIHZpZXcuXG5cdFx0aWYgKCB0aGlzLm9wdGlvbnMubW9kYWwgKSB7XG5cdFx0XHR0aGlzLm1vZGFsID0gbmV3IHdwLm1lZGlhLnZpZXcuTW9kYWwoe1xuXHRcdFx0XHRjb250cm9sbGVyOiB0aGlzLFxuXHRcdFx0XHR0aXRsZTogICAgICB0aGlzLm9wdGlvbnMudGl0bGVcblx0XHRcdH0pO1xuXG5cdFx0XHR0aGlzLm1vZGFsLmNvbnRlbnQoIHRoaXMgKTtcblx0XHR9XG5cblx0XHQvLyBGb3JjZSB0aGUgdXBsb2FkZXIgb2ZmIGlmIHRoZSB1cGxvYWQgbGltaXQgaGFzIGJlZW4gZXhjZWVkZWQgb3Jcblx0XHQvLyBpZiB0aGUgYnJvd3NlciBpc24ndCBzdXBwb3J0ZWQuXG5cdFx0aWYgKCB3cC5VcGxvYWRlci5saW1pdEV4Y2VlZGVkIHx8ICEgd3AuVXBsb2FkZXIuYnJvd3Nlci5zdXBwb3J0ZWQgKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMudXBsb2FkZXIgPSBmYWxzZTtcblx0XHR9XG5cblx0XHQvLyBJbml0aWFsaXplIHdpbmRvdy13aWRlIHVwbG9hZGVyLlxuXHRcdGlmICggdGhpcy5vcHRpb25zLnVwbG9hZGVyICkge1xuXHRcdFx0dGhpcy51cGxvYWRlciA9IG5ldyB3cC5tZWRpYS52aWV3LlVwbG9hZGVyV2luZG93KHtcblx0XHRcdFx0Y29udHJvbGxlcjogdGhpcyxcblx0XHRcdFx0dXBsb2FkZXI6IHtcblx0XHRcdFx0XHRkcm9wem9uZTogIHRoaXMubW9kYWwgPyB0aGlzLm1vZGFsLiRlbCA6IHRoaXMuJGVsLFxuXHRcdFx0XHRcdGNvbnRhaW5lcjogdGhpcy4kZWxcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLnZpZXdzLnNldCggJy5tZWRpYS1mcmFtZS11cGxvYWRlcicsIHRoaXMudXBsb2FkZXIgKTtcblx0XHR9XG5cblx0XHR0aGlzLm9uKCAnYXR0YWNoJywgXy5iaW5kKCB0aGlzLnZpZXdzLnJlYWR5LCB0aGlzLnZpZXdzICksIHRoaXMgKTtcblxuXHRcdC8vIEJpbmQgZGVmYXVsdCB0aXRsZSBjcmVhdGlvbi5cblx0XHR0aGlzLm9uKCAndGl0bGU6Y3JlYXRlOmRlZmF1bHQnLCB0aGlzLmNyZWF0ZVRpdGxlLCB0aGlzICk7XG5cdFx0dGhpcy50aXRsZS5tb2RlKCdkZWZhdWx0Jyk7XG5cblx0XHR0aGlzLm9uKCAndGl0bGU6cmVuZGVyJywgZnVuY3Rpb24oIHZpZXcgKSB7XG5cdFx0XHR2aWV3LiRlbC5hcHBlbmQoICc8c3BhbiBjbGFzcz1cImRhc2hpY29ucyBkYXNoaWNvbnMtYXJyb3ctZG93blwiPjwvc3Bhbj4nICk7XG5cdFx0fSk7XG5cblx0XHQvLyBCaW5kIGRlZmF1bHQgbWVudS5cblx0XHR0aGlzLm9uKCAnbWVudTpjcmVhdGU6ZGVmYXVsdCcsIHRoaXMuY3JlYXRlTWVudSwgdGhpcyApO1xuXHR9LFxuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuTWVkaWFGcmFtZX0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gQWN0aXZhdGUgdGhlIGRlZmF1bHQgc3RhdGUgaWYgbm8gYWN0aXZlIHN0YXRlIGV4aXN0cy5cblx0XHRpZiAoICEgdGhpcy5zdGF0ZSgpICYmIHRoaXMub3B0aW9ucy5zdGF0ZSApIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoIHRoaXMub3B0aW9ucy5zdGF0ZSApO1xuXHRcdH1cblx0XHQvKipcblx0XHQgKiBjYWxsICdyZW5kZXInIGRpcmVjdGx5IG9uIHRoZSBwYXJlbnQgY2xhc3Ncblx0XHQgKi9cblx0XHRyZXR1cm4gRnJhbWUucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gdGl0bGVcblx0ICogQHRoaXMgd3AubWVkaWEuY29udHJvbGxlci5SZWdpb25cblx0ICovXG5cdGNyZWF0ZVRpdGxlOiBmdW5jdGlvbiggdGl0bGUgKSB7XG5cdFx0dGl0bGUudmlldyA9IG5ldyB3cC5tZWRpYS5WaWV3KHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXMsXG5cdFx0XHR0YWdOYW1lOiAnaDEnXG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gbWVudVxuXHQgKiBAdGhpcyB3cC5tZWRpYS5jb250cm9sbGVyLlJlZ2lvblxuXHQgKi9cblx0Y3JlYXRlTWVudTogZnVuY3Rpb24oIG1lbnUgKSB7XG5cdFx0bWVudS52aWV3ID0gbmV3IHdwLm1lZGlhLnZpZXcuTWVudSh7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzXG5cdFx0fSk7XG5cdH0sXG5cblx0dG9nZ2xlTWVudTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZWwuZmluZCggJy5tZWRpYS1tZW51JyApLnRvZ2dsZUNsYXNzKCAndmlzaWJsZScgKTtcblx0fSxcblxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IHRvb2xiYXJcblx0ICogQHRoaXMgd3AubWVkaWEuY29udHJvbGxlci5SZWdpb25cblx0ICovXG5cdGNyZWF0ZVRvb2xiYXI6IGZ1bmN0aW9uKCB0b29sYmFyICkge1xuXHRcdHRvb2xiYXIudmlldyA9IG5ldyB3cC5tZWRpYS52aWV3LlRvb2xiYXIoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpc1xuXHRcdH0pO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IHJvdXRlclxuXHQgKiBAdGhpcyB3cC5tZWRpYS5jb250cm9sbGVyLlJlZ2lvblxuXHQgKi9cblx0Y3JlYXRlUm91dGVyOiBmdW5jdGlvbiggcm91dGVyICkge1xuXHRcdHJvdXRlci52aWV3ID0gbmV3IHdwLm1lZGlhLnZpZXcuUm91dGVyKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXNcblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cdCAqL1xuXHRjcmVhdGVJZnJhbWVTdGF0ZXM6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdHZhciBzZXR0aW5ncyA9IHdwLm1lZGlhLnZpZXcuc2V0dGluZ3MsXG5cdFx0XHR0YWJzID0gc2V0dGluZ3MudGFicyxcblx0XHRcdHRhYlVybCA9IHNldHRpbmdzLnRhYlVybCxcblx0XHRcdCRwb3N0SWQ7XG5cblx0XHRpZiAoICEgdGFicyB8fCAhIHRhYlVybCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBBZGQgdGhlIHBvc3QgSUQgdG8gdGhlIHRhYiBVUkwgaWYgaXQgZXhpc3RzLlxuXHRcdCRwb3N0SWQgPSAkKCcjcG9zdF9JRCcpO1xuXHRcdGlmICggJHBvc3RJZC5sZW5ndGggKSB7XG5cdFx0XHR0YWJVcmwgKz0gJyZwb3N0X2lkPScgKyAkcG9zdElkLnZhbCgpO1xuXHRcdH1cblxuXHRcdC8vIEdlbmVyYXRlIHRoZSB0YWIgc3RhdGVzLlxuXHRcdF8uZWFjaCggdGFicywgZnVuY3Rpb24oIHRpdGxlLCBpZCApIHtcblx0XHRcdHRoaXMuc3RhdGUoICdpZnJhbWU6JyArIGlkICkuc2V0KCBfLmRlZmF1bHRzKHtcblx0XHRcdFx0dGFiOiAgICAgaWQsXG5cdFx0XHRcdHNyYzogICAgIHRhYlVybCArICcmdGFiPScgKyBpZCxcblx0XHRcdFx0dGl0bGU6ICAgdGl0bGUsXG5cdFx0XHRcdGNvbnRlbnQ6ICdpZnJhbWUnLFxuXHRcdFx0XHRtZW51OiAgICAnZGVmYXVsdCdcblx0XHRcdH0sIG9wdGlvbnMgKSApO1xuXHRcdH0sIHRoaXMgKTtcblxuXHRcdHRoaXMub24oICdjb250ZW50OmNyZWF0ZTppZnJhbWUnLCB0aGlzLmlmcmFtZUNvbnRlbnQsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnY29udGVudDpkZWFjdGl2YXRlOmlmcmFtZScsIHRoaXMuaWZyYW1lQ29udGVudENsZWFudXAsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnbWVudTpyZW5kZXI6ZGVmYXVsdCcsIHRoaXMuaWZyYW1lTWVudSwgdGhpcyApO1xuXHRcdHRoaXMub24oICdvcGVuJywgdGhpcy5oaWphY2tUaGlja2JveCwgdGhpcyApO1xuXHRcdHRoaXMub24oICdjbG9zZScsIHRoaXMucmVzdG9yZVRoaWNrYm94LCB0aGlzICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZW50XG5cdCAqIEB0aGlzIHdwLm1lZGlhLmNvbnRyb2xsZXIuUmVnaW9uXG5cdCAqL1xuXHRpZnJhbWVDb250ZW50OiBmdW5jdGlvbiggY29udGVudCApIHtcblx0XHR0aGlzLiRlbC5hZGRDbGFzcygnaGlkZS10b29sYmFyJyk7XG5cdFx0Y29udGVudC52aWV3ID0gbmV3IHdwLm1lZGlhLnZpZXcuSWZyYW1lKHtcblx0XHRcdGNvbnRyb2xsZXI6IHRoaXNcblx0XHR9KTtcblx0fSxcblxuXHRpZnJhbWVDb250ZW50Q2xlYW51cDogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZWwucmVtb3ZlQ2xhc3MoJ2hpZGUtdG9vbGJhcicpO1xuXHR9LFxuXG5cdGlmcmFtZU1lbnU6IGZ1bmN0aW9uKCB2aWV3ICkge1xuXHRcdHZhciB2aWV3cyA9IHt9O1xuXG5cdFx0aWYgKCAhIHZpZXcgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Xy5lYWNoKCB3cC5tZWRpYS52aWV3LnNldHRpbmdzLnRhYnMsIGZ1bmN0aW9uKCB0aXRsZSwgaWQgKSB7XG5cdFx0XHR2aWV3c1sgJ2lmcmFtZTonICsgaWQgXSA9IHtcblx0XHRcdFx0dGV4dDogdGhpcy5zdGF0ZSggJ2lmcmFtZTonICsgaWQgKS5nZXQoJ3RpdGxlJyksXG5cdFx0XHRcdHByaW9yaXR5OiAyMDBcblx0XHRcdH07XG5cdFx0fSwgdGhpcyApO1xuXG5cdFx0dmlldy5zZXQoIHZpZXdzICk7XG5cdH0sXG5cblx0aGlqYWNrVGhpY2tib3g6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBmcmFtZSA9IHRoaXM7XG5cblx0XHRpZiAoICEgd2luZG93LnRiX3JlbW92ZSB8fCB0aGlzLl90Yl9yZW1vdmUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5fdGJfcmVtb3ZlID0gd2luZG93LnRiX3JlbW92ZTtcblx0XHR3aW5kb3cudGJfcmVtb3ZlID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRmcmFtZS5jbG9zZSgpO1xuXHRcdFx0ZnJhbWUucmVzZXQoKTtcblx0XHRcdGZyYW1lLnNldFN0YXRlKCBmcmFtZS5vcHRpb25zLnN0YXRlICk7XG5cdFx0XHRmcmFtZS5fdGJfcmVtb3ZlLmNhbGwoIHdpbmRvdyApO1xuXHRcdH07XG5cdH0sXG5cblx0cmVzdG9yZVRoaWNrYm94OiBmdW5jdGlvbigpIHtcblx0XHRpZiAoICEgdGhpcy5fdGJfcmVtb3ZlICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHdpbmRvdy50Yl9yZW1vdmUgPSB0aGlzLl90Yl9yZW1vdmU7XG5cdFx0ZGVsZXRlIHRoaXMuX3RiX3JlbW92ZTtcblx0fVxufSk7XG5cbi8vIE1hcCBzb21lIG9mIHRoZSBtb2RhbCdzIG1ldGhvZHMgdG8gdGhlIGZyYW1lLlxuXy5lYWNoKFsnb3BlbicsJ2Nsb3NlJywnYXR0YWNoJywnZGV0YWNoJywnZXNjYXBlJ10sIGZ1bmN0aW9uKCBtZXRob2QgKSB7XG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5NZWRpYUZyYW1lfSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0TWVkaWFGcmFtZS5wcm90b3R5cGVbIG1ldGhvZCBdID0gZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLm1vZGFsICkge1xuXHRcdFx0dGhpcy5tb2RhbFsgbWV0aG9kIF0uYXBwbHkoIHRoaXMubW9kYWwsIGFyZ3VtZW50cyApO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fTtcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IE1lZGlhRnJhbWU7XG4iLCIvKmdsb2JhbHMgalF1ZXJ5ICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5NZW51SXRlbVxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgJCA9IGpRdWVyeSxcblx0TWVudUl0ZW07XG5cbk1lbnVJdGVtID0gd3AubWVkaWEuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiAgICdhJyxcblx0Y2xhc3NOYW1lOiAnbWVkaWEtbWVudS1pdGVtJyxcblxuXHRhdHRyaWJ1dGVzOiB7XG5cdFx0aHJlZjogJyMnXG5cdH0sXG5cblx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrJzogJ19jbGljaydcblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuXHQgKi9cblx0X2NsaWNrOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dmFyIGNsaWNrT3ZlcnJpZGUgPSB0aGlzLm9wdGlvbnMuY2xpY2s7XG5cblx0XHRpZiAoIGV2ZW50ICkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR9XG5cblx0XHRpZiAoIGNsaWNrT3ZlcnJpZGUgKSB7XG5cdFx0XHRjbGlja092ZXJyaWRlLmNhbGwoIHRoaXMgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5jbGljaygpO1xuXHRcdH1cblxuXHRcdC8vIFdoZW4gc2VsZWN0aW5nIGEgdGFiIGFsb25nIHRoZSBsZWZ0IHNpZGUsXG5cdFx0Ly8gZm9jdXMgc2hvdWxkIGJlIHRyYW5zZmVycmVkIGludG8gdGhlIG1haW4gcGFuZWxcblx0XHRpZiAoICEgd3AubWVkaWEuaXNUb3VjaERldmljZSApIHtcblx0XHRcdCQoJy5tZWRpYS1mcmFtZS1jb250ZW50IGlucHV0JykuZmlyc3QoKS5mb2N1cygpO1xuXHRcdH1cblx0fSxcblxuXHRjbGljazogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHN0YXRlID0gdGhpcy5vcHRpb25zLnN0YXRlO1xuXG5cdFx0aWYgKCBzdGF0ZSApIHtcblx0XHRcdHRoaXMuY29udHJvbGxlci5zZXRTdGF0ZSggc3RhdGUgKTtcblx0XHRcdHRoaXMudmlld3MucGFyZW50LiRlbC5yZW1vdmVDbGFzcyggJ3Zpc2libGUnICk7IC8vIFRPRE86IG9yIGhpZGUgb24gYW55IGNsaWNrLCBzZWUgYmVsb3dcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5NZW51SXRlbX0gcmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cblx0XHRpZiAoIG9wdGlvbnMudGV4dCApIHtcblx0XHRcdHRoaXMuJGVsLnRleHQoIG9wdGlvbnMudGV4dCApO1xuXHRcdH0gZWxzZSBpZiAoIG9wdGlvbnMuaHRtbCApIHtcblx0XHRcdHRoaXMuJGVsLmh0bWwoIG9wdGlvbnMuaHRtbCApO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBNZW51SXRlbTtcbiIsIi8qKlxuICogd3AubWVkaWEudmlldy5NZW51XG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5Qcmlvcml0eUxpc3RcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIE1lbnVJdGVtID0gd3AubWVkaWEudmlldy5NZW51SXRlbSxcblx0UHJpb3JpdHlMaXN0ID0gd3AubWVkaWEudmlldy5Qcmlvcml0eUxpc3QsXG5cdE1lbnU7XG5cbk1lbnUgPSBQcmlvcml0eUxpc3QuZXh0ZW5kKHtcblx0dGFnTmFtZTogICAnZGl2Jyxcblx0Y2xhc3NOYW1lOiAnbWVkaWEtbWVudScsXG5cdHByb3BlcnR5OiAgJ3N0YXRlJyxcblx0SXRlbVZpZXc6ICBNZW51SXRlbSxcblx0cmVnaW9uOiAgICAnbWVudScsXG5cblx0LyogVE9ETzogYWx0ZXJuYXRpdmVseSBoaWRlIG9uIGFueSBjbGljayBhbnl3aGVyZVxuXHRldmVudHM6IHtcblx0XHQnY2xpY2snOiAnY2xpY2snXG5cdH0sXG5cblx0Y2xpY2s6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuJGVsLnJlbW92ZUNsYXNzKCAndmlzaWJsZScgKTtcblx0fSxcblx0Ki9cblxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblx0ICogQHBhcmFtIHtzdHJpbmd9IGlkXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5WaWV3fVxuXHQgKi9cblx0dG9WaWV3OiBmdW5jdGlvbiggb3B0aW9ucywgaWQgKSB7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0b3B0aW9uc1sgdGhpcy5wcm9wZXJ0eSBdID0gb3B0aW9uc1sgdGhpcy5wcm9wZXJ0eSBdIHx8IGlkO1xuXHRcdHJldHVybiBuZXcgdGhpcy5JdGVtVmlldyggb3B0aW9ucyApLnJlbmRlcigpO1xuXHR9LFxuXG5cdHJlYWR5OiBmdW5jdGlvbigpIHtcblx0XHQvKipcblx0XHQgKiBjYWxsICdyZWFkeScgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzc1xuXHRcdCAqL1xuXHRcdFByaW9yaXR5TGlzdC5wcm90b3R5cGUucmVhZHkuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHRoaXMudmlzaWJpbGl0eSgpO1xuXHR9LFxuXG5cdHNldDogZnVuY3Rpb24oKSB7XG5cdFx0LyoqXG5cdFx0ICogY2FsbCAnc2V0JyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzXG5cdFx0ICovXG5cdFx0UHJpb3JpdHlMaXN0LnByb3RvdHlwZS5zZXQuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHRoaXMudmlzaWJpbGl0eSgpO1xuXHR9LFxuXG5cdHVuc2V0OiBmdW5jdGlvbigpIHtcblx0XHQvKipcblx0XHQgKiBjYWxsICd1bnNldCcgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzc1xuXHRcdCAqL1xuXHRcdFByaW9yaXR5TGlzdC5wcm90b3R5cGUudW5zZXQuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHRcdHRoaXMudmlzaWJpbGl0eSgpO1xuXHR9LFxuXG5cdHZpc2liaWxpdHk6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciByZWdpb24gPSB0aGlzLnJlZ2lvbixcblx0XHRcdHZpZXcgPSB0aGlzLmNvbnRyb2xsZXJbIHJlZ2lvbiBdLmdldCgpLFxuXHRcdFx0dmlld3MgPSB0aGlzLnZpZXdzLmdldCgpLFxuXHRcdFx0aGlkZSA9ICEgdmlld3MgfHwgdmlld3MubGVuZ3RoIDwgMjtcblxuXHRcdGlmICggdGhpcyA9PT0gdmlldyApIHtcblx0XHRcdHRoaXMuY29udHJvbGxlci4kZWwudG9nZ2xlQ2xhc3MoICdoaWRlLScgKyByZWdpb24sIGhpZGUgKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaWRcblx0ICovXG5cdHNlbGVjdDogZnVuY3Rpb24oIGlkICkge1xuXHRcdHZhciB2aWV3ID0gdGhpcy5nZXQoIGlkICk7XG5cblx0XHRpZiAoICEgdmlldyApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLmRlc2VsZWN0KCk7XG5cdFx0dmlldy4kZWwuYWRkQ2xhc3MoJ2FjdGl2ZScpO1xuXHR9LFxuXG5cdGRlc2VsZWN0OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiRlbC5jaGlsZHJlbigpLnJlbW92ZUNsYXNzKCdhY3RpdmUnKTtcblx0fSxcblxuXHRoaWRlOiBmdW5jdGlvbiggaWQgKSB7XG5cdFx0dmFyIHZpZXcgPSB0aGlzLmdldCggaWQgKTtcblxuXHRcdGlmICggISB2aWV3ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZpZXcuJGVsLmFkZENsYXNzKCdoaWRkZW4nKTtcblx0fSxcblxuXHRzaG93OiBmdW5jdGlvbiggaWQgKSB7XG5cdFx0dmFyIHZpZXcgPSB0aGlzLmdldCggaWQgKTtcblxuXHRcdGlmICggISB2aWV3ICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZpZXcuJGVsLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTWVudTtcbiIsIi8qZ2xvYmFscyB3cCwgXywgalF1ZXJ5ICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5Nb2RhbFxuICpcbiAqIEEgbW9kYWwgdmlldywgd2hpY2ggdGhlIG1lZGlhIG1vZGFsIHVzZXMgYXMgaXRzIGRlZmF1bHQgY29udGFpbmVyLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgJCA9IGpRdWVyeSxcblx0TW9kYWw7XG5cbk1vZGFsID0gd3AubWVkaWEuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiAgJ2RpdicsXG5cdHRlbXBsYXRlOiB3cC50ZW1wbGF0ZSgnbWVkaWEtbW9kYWwnKSxcblxuXHRhdHRyaWJ1dGVzOiB7XG5cdFx0dGFiaW5kZXg6IDBcblx0fSxcblxuXHRldmVudHM6IHtcblx0XHQnY2xpY2sgLm1lZGlhLW1vZGFsLWJhY2tkcm9wLCAubWVkaWEtbW9kYWwtY2xvc2UnOiAnZXNjYXBlSGFuZGxlcicsXG5cdFx0J2tleWRvd24nOiAna2V5ZG93bidcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdGNvbnRhaW5lcjogZG9jdW1lbnQuYm9keSxcblx0XHRcdHRpdGxlOiAgICAgJycsXG5cdFx0XHRwcm9wYWdhdGU6IHRydWUsXG5cdFx0XHRmcmVlemU6ICAgIHRydWVcblx0XHR9KTtcblxuXHRcdHRoaXMuZm9jdXNNYW5hZ2VyID0gbmV3IHdwLm1lZGlhLnZpZXcuRm9jdXNNYW5hZ2VyKHtcblx0XHRcdGVsOiB0aGlzLmVsXG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7T2JqZWN0fVxuXHQgKi9cblx0cHJlcGFyZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHRpdGxlOiB0aGlzLm9wdGlvbnMudGl0bGVcblx0XHR9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5Nb2RhbH0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdGF0dGFjaDogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLnZpZXdzLmF0dGFjaGVkICkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIHRoaXMudmlld3MucmVuZGVyZWQgKSB7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH1cblxuXHRcdHRoaXMuJGVsLmFwcGVuZFRvKCB0aGlzLm9wdGlvbnMuY29udGFpbmVyICk7XG5cblx0XHQvLyBNYW51YWxseSBtYXJrIHRoZSB2aWV3IGFzIGF0dGFjaGVkIGFuZCB0cmlnZ2VyIHJlYWR5LlxuXHRcdHRoaXMudmlld3MuYXR0YWNoZWQgPSB0cnVlO1xuXHRcdHRoaXMudmlld3MucmVhZHkoKTtcblxuXHRcdHJldHVybiB0aGlzLnByb3BhZ2F0ZSgnYXR0YWNoJyk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3Lk1vZGFsfSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0ZGV0YWNoOiBmdW5jdGlvbigpIHtcblx0XHRpZiAoIHRoaXMuJGVsLmlzKCc6dmlzaWJsZScpICkge1xuXHRcdFx0dGhpcy5jbG9zZSgpO1xuXHRcdH1cblxuXHRcdHRoaXMuJGVsLmRldGFjaCgpO1xuXHRcdHRoaXMudmlld3MuYXR0YWNoZWQgPSBmYWxzZTtcblx0XHRyZXR1cm4gdGhpcy5wcm9wYWdhdGUoJ2RldGFjaCcpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5Nb2RhbH0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdG9wZW46IGZ1bmN0aW9uKCkge1xuXHRcdHZhciAkZWwgPSB0aGlzLiRlbCxcblx0XHRcdG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsXG5cdFx0XHRtY2VFZGl0b3I7XG5cblx0XHRpZiAoICRlbC5pcygnOnZpc2libGUnKSApIHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGlmICggISB0aGlzLnZpZXdzLmF0dGFjaGVkICkge1xuXHRcdFx0dGhpcy5hdHRhY2goKTtcblx0XHR9XG5cblx0XHQvLyBJZiB0aGUgYGZyZWV6ZWAgb3B0aW9uIGlzIHNldCwgcmVjb3JkIHRoZSB3aW5kb3cncyBzY3JvbGwgcG9zaXRpb24uXG5cdFx0aWYgKCBvcHRpb25zLmZyZWV6ZSApIHtcblx0XHRcdHRoaXMuX2ZyZWV6ZSA9IHtcblx0XHRcdFx0c2Nyb2xsVG9wOiAkKCB3aW5kb3cgKS5zY3JvbGxUb3AoKVxuXHRcdFx0fTtcblx0XHR9XG5cblx0XHQvLyBEaXNhYmxlIHBhZ2Ugc2Nyb2xsaW5nLlxuXHRcdCQoICdib2R5JyApLmFkZENsYXNzKCAnbW9kYWwtb3BlbicgKTtcblxuXHRcdCRlbC5zaG93KCk7XG5cblx0XHQvLyBUcnkgdG8gY2xvc2UgdGhlIG9uc2NyZWVuIGtleWJvYXJkXG5cdFx0aWYgKCAnb250b3VjaGVuZCcgaW4gZG9jdW1lbnQgKSB7XG5cdFx0XHRpZiAoICggbWNlRWRpdG9yID0gd2luZG93LnRpbnltY2UgJiYgd2luZG93LnRpbnltY2UuYWN0aXZlRWRpdG9yICkgICYmICEgbWNlRWRpdG9yLmlzSGlkZGVuKCkgJiYgbWNlRWRpdG9yLmlmcmFtZUVsZW1lbnQgKSB7XG5cdFx0XHRcdG1jZUVkaXRvci5pZnJhbWVFbGVtZW50LmZvY3VzKCk7XG5cdFx0XHRcdG1jZUVkaXRvci5pZnJhbWVFbGVtZW50LmJsdXIoKTtcblxuXHRcdFx0XHRzZXRUaW1lb3V0KCBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRtY2VFZGl0b3IuaWZyYW1lRWxlbWVudC5ibHVyKCk7XG5cdFx0XHRcdH0sIDEwMCApO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuJGVsLmZvY3VzKCk7XG5cblx0XHRyZXR1cm4gdGhpcy5wcm9wYWdhdGUoJ29wZW4nKTtcblx0fSxcblxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuTW9kYWx9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRjbG9zZTogZnVuY3Rpb24oIG9wdGlvbnMgKSB7XG5cdFx0dmFyIGZyZWV6ZSA9IHRoaXMuX2ZyZWV6ZTtcblxuXHRcdGlmICggISB0aGlzLnZpZXdzLmF0dGFjaGVkIHx8ICEgdGhpcy4kZWwuaXMoJzp2aXNpYmxlJykgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9XG5cblx0XHQvLyBFbmFibGUgcGFnZSBzY3JvbGxpbmcuXG5cdFx0JCggJ2JvZHknICkucmVtb3ZlQ2xhc3MoICdtb2RhbC1vcGVuJyApO1xuXG5cdFx0Ly8gSGlkZSBtb2RhbCBhbmQgcmVtb3ZlIHJlc3RyaWN0ZWQgbWVkaWEgbW9kYWwgdGFiIGZvY3VzIG9uY2UgaXQncyBjbG9zZWRcblx0XHR0aGlzLiRlbC5oaWRlKCkudW5kZWxlZ2F0ZSggJ2tleWRvd24nICk7XG5cblx0XHQvLyBQdXQgZm9jdXMgYmFjayBpbiB1c2VmdWwgbG9jYXRpb24gb25jZSBtb2RhbCBpcyBjbG9zZWRcblx0XHQkKCcjd3Bib2R5LWNvbnRlbnQnKS5mb2N1cygpO1xuXG5cdFx0dGhpcy5wcm9wYWdhdGUoJ2Nsb3NlJyk7XG5cblx0XHQvLyBJZiB0aGUgYGZyZWV6ZWAgb3B0aW9uIGlzIHNldCwgcmVzdG9yZSB0aGUgY29udGFpbmVyJ3Mgc2Nyb2xsIHBvc2l0aW9uLlxuXHRcdGlmICggZnJlZXplICkge1xuXHRcdFx0JCggd2luZG93ICkuc2Nyb2xsVG9wKCBmcmVlemUuc2Nyb2xsVG9wICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMuZXNjYXBlICkge1xuXHRcdFx0dGhpcy5wcm9wYWdhdGUoJ2VzY2FwZScpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuTW9kYWx9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRlc2NhcGU6IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmNsb3NlKHsgZXNjYXBlOiB0cnVlIH0pO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHRlc2NhcGVIYW5kbGVyOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHR0aGlzLmVzY2FwZSgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gY29udGVudCBWaWV3cyB0byByZWdpc3RlciB0byAnLm1lZGlhLW1vZGFsLWNvbnRlbnQnXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3Lk1vZGFsfSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0Y29udGVudDogZnVuY3Rpb24oIGNvbnRlbnQgKSB7XG5cdFx0dGhpcy52aWV3cy5zZXQoICcubWVkaWEtbW9kYWwtY29udGVudCcsIGNvbnRlbnQgKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvKipcblx0ICogVHJpZ2dlcnMgYSBtb2RhbCBldmVudCBhbmQgaWYgdGhlIGBwcm9wYWdhdGVgIG9wdGlvbiBpcyBzZXQsXG5cdCAqIGZvcndhcmRzIGV2ZW50cyB0byB0aGUgbW9kYWwncyBjb250cm9sbGVyLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gaWRcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuTW9kYWx9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRwcm9wYWdhdGU6IGZ1bmN0aW9uKCBpZCApIHtcblx0XHR0aGlzLnRyaWdnZXIoIGlkICk7XG5cblx0XHRpZiAoIHRoaXMub3B0aW9ucy5wcm9wYWdhdGUgKSB7XG5cdFx0XHR0aGlzLmNvbnRyb2xsZXIudHJpZ2dlciggaWQgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuXHQgKi9cblx0a2V5ZG93bjogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdC8vIENsb3NlIHRoZSBtb2RhbCB3aGVuIGVzY2FwZSBpcyBwcmVzc2VkLlxuXHRcdGlmICggMjcgPT09IGV2ZW50LndoaWNoICYmIHRoaXMuJGVsLmlzKCc6dmlzaWJsZScpICkge1xuXHRcdFx0dGhpcy5lc2NhcGUoKTtcblx0XHRcdGV2ZW50LnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuXHRcdH1cblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gTW9kYWw7XG4iLCIvKmdsb2JhbHMgXywgQmFja2JvbmUgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlByaW9yaXR5TGlzdFxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgUHJpb3JpdHlMaXN0ID0gd3AubWVkaWEuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiAgICdkaXYnLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuX3ZpZXdzID0ge307XG5cblx0XHR0aGlzLnNldCggXy5leHRlbmQoIHt9LCB0aGlzLl92aWV3cywgdGhpcy5vcHRpb25zLnZpZXdzICksIHsgc2lsZW50OiB0cnVlIH0pO1xuXHRcdGRlbGV0ZSB0aGlzLm9wdGlvbnMudmlld3M7XG5cblx0XHRpZiAoICEgdGhpcy5vcHRpb25zLnNpbGVudCApIHtcblx0XHRcdHRoaXMucmVuZGVyKCk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtzdHJpbmd9IGlkXG5cdCAqIEBwYXJhbSB7d3AubWVkaWEuVmlld3xPYmplY3R9IHZpZXdcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuUHJpb3JpdHlMaXN0fSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0c2V0OiBmdW5jdGlvbiggaWQsIHZpZXcsIG9wdGlvbnMgKSB7XG5cdFx0dmFyIHByaW9yaXR5LCB2aWV3cywgaW5kZXg7XG5cblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdC8vIEFjY2VwdCBhbiBvYmplY3Qgd2l0aCBhbiBgaWRgIDogYHZpZXdgIG1hcHBpbmcuXG5cdFx0aWYgKCBfLmlzT2JqZWN0KCBpZCApICkge1xuXHRcdFx0Xy5lYWNoKCBpZCwgZnVuY3Rpb24oIHZpZXcsIGlkICkge1xuXHRcdFx0XHR0aGlzLnNldCggaWQsIHZpZXcgKTtcblx0XHRcdH0sIHRoaXMgKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdGlmICggISAodmlldyBpbnN0YW5jZW9mIEJhY2tib25lLlZpZXcpICkge1xuXHRcdFx0dmlldyA9IHRoaXMudG9WaWV3KCB2aWV3LCBpZCwgb3B0aW9ucyApO1xuXHRcdH1cblx0XHR2aWV3LmNvbnRyb2xsZXIgPSB2aWV3LmNvbnRyb2xsZXIgfHwgdGhpcy5jb250cm9sbGVyO1xuXG5cdFx0dGhpcy51bnNldCggaWQgKTtcblxuXHRcdHByaW9yaXR5ID0gdmlldy5vcHRpb25zLnByaW9yaXR5IHx8IDEwO1xuXHRcdHZpZXdzID0gdGhpcy52aWV3cy5nZXQoKSB8fCBbXTtcblxuXHRcdF8uZmluZCggdmlld3MsIGZ1bmN0aW9uKCBleGlzdGluZywgaSApIHtcblx0XHRcdGlmICggZXhpc3Rpbmcub3B0aW9ucy5wcmlvcml0eSA+IHByaW9yaXR5ICkge1xuXHRcdFx0XHRpbmRleCA9IGk7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5fdmlld3NbIGlkIF0gPSB2aWV3O1xuXHRcdHRoaXMudmlld3MuYWRkKCB2aWV3LCB7XG5cdFx0XHRhdDogXy5pc051bWJlciggaW5kZXggKSA/IGluZGV4IDogdmlld3MubGVuZ3RoIHx8IDBcblx0XHR9KTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtzdHJpbmd9IGlkXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5WaWV3fVxuXHQgKi9cblx0Z2V0OiBmdW5jdGlvbiggaWQgKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3ZpZXdzWyBpZCBdO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtzdHJpbmd9IGlkXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LlByaW9yaXR5TGlzdH1cblx0ICovXG5cdHVuc2V0OiBmdW5jdGlvbiggaWQgKSB7XG5cdFx0dmFyIHZpZXcgPSB0aGlzLmdldCggaWQgKTtcblxuXHRcdGlmICggdmlldyApIHtcblx0XHRcdHZpZXcucmVtb3ZlKCk7XG5cdFx0fVxuXG5cdFx0ZGVsZXRlIHRoaXMuX3ZpZXdzWyBpZCBdO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcblx0ICogQHJldHVybnMge3dwLm1lZGlhLlZpZXd9XG5cdCAqL1xuXHR0b1ZpZXc6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdHJldHVybiBuZXcgd3AubWVkaWEuVmlldyggb3B0aW9ucyApO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBQcmlvcml0eUxpc3Q7XG4iLCIvKipcbiAqIHdwLm1lZGlhLnZpZXcuUm91dGVySXRlbVxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuTWVudUl0ZW1cbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFJvdXRlckl0ZW0gPSB3cC5tZWRpYS52aWV3Lk1lbnVJdGVtLmV4dGVuZCh7XG5cdC8qKlxuXHQgKiBPbiBjbGljayBoYW5kbGVyIHRvIGFjdGl2YXRlIHRoZSBjb250ZW50IHJlZ2lvbidzIGNvcnJlc3BvbmRpbmcgbW9kZS5cblx0ICovXG5cdGNsaWNrOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgY29udGVudE1vZGUgPSB0aGlzLm9wdGlvbnMuY29udGVudE1vZGU7XG5cdFx0aWYgKCBjb250ZW50TW9kZSApIHtcblx0XHRcdHRoaXMuY29udHJvbGxlci5jb250ZW50Lm1vZGUoIGNvbnRlbnRNb2RlICk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBSb3V0ZXJJdGVtO1xuIiwiLypnbG9iYWxzIHdwICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5Sb3V0ZXJcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3Lk1lbnVcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LlByaW9yaXR5TGlzdFxuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgTWVudSA9IHdwLm1lZGlhLnZpZXcuTWVudSxcblx0Um91dGVyO1xuXG5Sb3V0ZXIgPSBNZW51LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAgJ2RpdicsXG5cdGNsYXNzTmFtZTogJ21lZGlhLXJvdXRlcicsXG5cdHByb3BlcnR5OiAgJ2NvbnRlbnRNb2RlJyxcblx0SXRlbVZpZXc6ICB3cC5tZWRpYS52aWV3LlJvdXRlckl0ZW0sXG5cdHJlZ2lvbjogICAgJ3JvdXRlcicsXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5jb250cm9sbGVyLm9uKCAnY29udGVudDpyZW5kZXInLCB0aGlzLnVwZGF0ZSwgdGhpcyApO1xuXHRcdC8vIENhbGwgJ2luaXRpYWxpemUnIGRpcmVjdGx5IG9uIHRoZSBwYXJlbnQgY2xhc3MuXG5cdFx0TWVudS5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cblx0dXBkYXRlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbW9kZSA9IHRoaXMuY29udHJvbGxlci5jb250ZW50Lm1vZGUoKTtcblx0XHRpZiAoIG1vZGUgKSB7XG5cdFx0XHR0aGlzLnNlbGVjdCggbW9kZSApO1xuXHRcdH1cblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUm91dGVyO1xuIiwiLypnbG9iYWxzIHdwICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5TZWFyY2hcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdFNlYXJjaDtcblxuU2VhcmNoID0gd3AubWVkaWEuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiAgICdpbnB1dCcsXG5cdGNsYXNzTmFtZTogJ3NlYXJjaCcsXG5cdGlkOiAgICAgICAgJ21lZGlhLXNlYXJjaC1pbnB1dCcsXG5cblx0YXR0cmlidXRlczoge1xuXHRcdHR5cGU6ICAgICAgICAnc2VhcmNoJyxcblx0XHRwbGFjZWhvbGRlcjogbDEwbi5zZWFyY2hcblx0fSxcblxuXHRldmVudHM6IHtcblx0XHQnaW5wdXQnOiAgJ3NlYXJjaCcsXG5cdFx0J2tleXVwJzogICdzZWFyY2gnLFxuXHRcdCdjaGFuZ2UnOiAnc2VhcmNoJyxcblx0XHQnc2VhcmNoJzogJ3NlYXJjaCdcblx0fSxcblxuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuU2VhcmNofSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0cmVuZGVyOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVsLnZhbHVlID0gdGhpcy5tb2RlbC5lc2NhcGUoJ3NlYXJjaCcpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHNlYXJjaDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGlmICggZXZlbnQudGFyZ2V0LnZhbHVlICkge1xuXHRcdFx0dGhpcy5tb2RlbC5zZXQoICdzZWFyY2gnLCBldmVudC50YXJnZXQudmFsdWUgKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5tb2RlbC51bnNldCgnc2VhcmNoJyk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZWFyY2g7XG4iLCIvKmdsb2JhbHMgd3AsIF8sIEJhY2tib25lICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5TZWxlY3Rpb25cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdFNlbGVjdGlvbjtcblxuU2VsZWN0aW9uID0gd3AubWVkaWEuVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiAgICdkaXYnLFxuXHRjbGFzc05hbWU6ICdtZWRpYS1zZWxlY3Rpb24nLFxuXHR0ZW1wbGF0ZTogIHdwLnRlbXBsYXRlKCdtZWRpYS1zZWxlY3Rpb24nKSxcblxuXHRldmVudHM6IHtcblx0XHQnY2xpY2sgLmVkaXQtc2VsZWN0aW9uJzogICdlZGl0Jyxcblx0XHQnY2xpY2sgLmNsZWFyLXNlbGVjdGlvbic6ICdjbGVhcidcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdGVkaXRhYmxlOiAgZmFsc2UsXG5cdFx0XHRjbGVhcmFibGU6IHRydWVcblx0XHR9KTtcblxuXHRcdC8qKlxuXHRcdCAqIEBtZW1iZXIge3dwLm1lZGlhLnZpZXcuQXR0YWNobWVudHMuU2VsZWN0aW9ufVxuXHRcdCAqL1xuXHRcdHRoaXMuYXR0YWNobWVudHMgPSBuZXcgd3AubWVkaWEudmlldy5BdHRhY2htZW50cy5TZWxlY3Rpb24oe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyLFxuXHRcdFx0Y29sbGVjdGlvbjogdGhpcy5jb2xsZWN0aW9uLFxuXHRcdFx0c2VsZWN0aW9uOiAgdGhpcy5jb2xsZWN0aW9uLFxuXHRcdFx0bW9kZWw6ICAgICAgbmV3IEJhY2tib25lLk1vZGVsKClcblx0XHR9KTtcblxuXHRcdHRoaXMudmlld3Muc2V0KCAnLnNlbGVjdGlvbi12aWV3JywgdGhpcy5hdHRhY2htZW50cyApO1xuXHRcdHRoaXMuY29sbGVjdGlvbi5vbiggJ2FkZCByZW1vdmUgcmVzZXQnLCB0aGlzLnJlZnJlc2gsIHRoaXMgKTtcblx0XHR0aGlzLmNvbnRyb2xsZXIub24oICdjb250ZW50OmFjdGl2YXRlJywgdGhpcy5yZWZyZXNoLCB0aGlzICk7XG5cdH0sXG5cblx0cmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMucmVmcmVzaCgpO1xuXHR9LFxuXG5cdHJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdC8vIElmIHRoZSBzZWxlY3Rpb24gaGFzbid0IGJlZW4gcmVuZGVyZWQsIGJhaWwuXG5cdFx0aWYgKCAhIHRoaXMuJGVsLmNoaWxkcmVuKCkubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHZhciBjb2xsZWN0aW9uID0gdGhpcy5jb2xsZWN0aW9uLFxuXHRcdFx0ZWRpdGluZyA9ICdlZGl0LXNlbGVjdGlvbicgPT09IHRoaXMuY29udHJvbGxlci5jb250ZW50Lm1vZGUoKTtcblxuXHRcdC8vIElmIG5vdGhpbmcgaXMgc2VsZWN0ZWQsIGRpc3BsYXkgbm90aGluZy5cblx0XHR0aGlzLiRlbC50b2dnbGVDbGFzcyggJ2VtcHR5JywgISBjb2xsZWN0aW9uLmxlbmd0aCApO1xuXHRcdHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCAnb25lJywgMSA9PT0gY29sbGVjdGlvbi5sZW5ndGggKTtcblx0XHR0aGlzLiRlbC50b2dnbGVDbGFzcyggJ2VkaXRpbmcnLCBlZGl0aW5nICk7XG5cblx0XHR0aGlzLiQoJy5jb3VudCcpLnRleHQoIGwxMG4uc2VsZWN0ZWQucmVwbGFjZSgnJWQnLCBjb2xsZWN0aW9uLmxlbmd0aCkgKTtcblx0fSxcblxuXHRlZGl0OiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblx0XHRpZiAoIHRoaXMub3B0aW9ucy5lZGl0YWJsZSApIHtcblx0XHRcdHRoaXMub3B0aW9ucy5lZGl0YWJsZS5jYWxsKCB0aGlzLCB0aGlzLmNvbGxlY3Rpb24gKTtcblx0XHR9XG5cdH0sXG5cblx0Y2xlYXI6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdHRoaXMuY29sbGVjdGlvbi5yZXNldCgpO1xuXG5cdFx0Ly8gS2VlcCBmb2N1cyBpbnNpZGUgbWVkaWEgbW9kYWxcblx0XHQvLyBhZnRlciBjbGVhciBsaW5rIGlzIHNlbGVjdGVkXG5cdFx0dGhpcy5jb250cm9sbGVyLm1vZGFsLmZvY3VzTWFuYWdlci5mb2N1cygpO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Rpb247XG4iLCIvKmdsb2JhbHMgXywgQmFja2JvbmUgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlNldHRpbmdzXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBWaWV3ID0gd3AubWVkaWEuVmlldyxcblx0JCA9IEJhY2tib25lLiQsXG5cdFNldHRpbmdzO1xuXG5TZXR0aW5ncyA9IFZpZXcuZXh0ZW5kKHtcblx0ZXZlbnRzOiB7XG5cdFx0J2NsaWNrIGJ1dHRvbic6ICAgICd1cGRhdGVIYW5kbGVyJyxcblx0XHQnY2hhbmdlIGlucHV0JzogICAgJ3VwZGF0ZUhhbmRsZXInLFxuXHRcdCdjaGFuZ2Ugc2VsZWN0JzogICAndXBkYXRlSGFuZGxlcicsXG5cdFx0J2NoYW5nZSB0ZXh0YXJlYSc6ICd1cGRhdGVIYW5kbGVyJ1xuXHR9LFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubW9kZWwgPSB0aGlzLm1vZGVsIHx8IG5ldyBCYWNrYm9uZS5Nb2RlbCgpO1xuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMubW9kZWwsICdjaGFuZ2UnLCB0aGlzLnVwZGF0ZUNoYW5nZXMgKTtcblx0fSxcblxuXHRwcmVwYXJlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4gXy5kZWZhdWx0cyh7XG5cdFx0XHRtb2RlbDogdGhpcy5tb2RlbC50b0pTT04oKVxuXHRcdH0sIHRoaXMub3B0aW9ucyApO1xuXHR9LFxuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuU2V0dGluZ3N9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdFZpZXcucHJvdG90eXBlLnJlbmRlci5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0Ly8gU2VsZWN0IHRoZSBjb3JyZWN0IHZhbHVlcy5cblx0XHRfKCB0aGlzLm1vZGVsLmF0dHJpYnV0ZXMgKS5jaGFpbigpLmtleXMoKS5lYWNoKCB0aGlzLnVwZGF0ZSwgdGhpcyApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtzdHJpbmd9IGtleVxuXHQgKi9cblx0dXBkYXRlOiBmdW5jdGlvbigga2V5ICkge1xuXHRcdHZhciB2YWx1ZSA9IHRoaXMubW9kZWwuZ2V0KCBrZXkgKSxcblx0XHRcdCRzZXR0aW5nID0gdGhpcy4kKCdbZGF0YS1zZXR0aW5nPVwiJyArIGtleSArICdcIl0nKSxcblx0XHRcdCRidXR0b25zLCAkdmFsdWU7XG5cblx0XHQvLyBCYWlsIGlmIHdlIGRpZG4ndCBmaW5kIGEgbWF0Y2hpbmcgc2V0dGluZy5cblx0XHRpZiAoICEgJHNldHRpbmcubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIEF0dGVtcHQgdG8gZGV0ZXJtaW5lIGhvdyB0aGUgc2V0dGluZyBpcyByZW5kZXJlZCBhbmQgdXBkYXRlXG5cdFx0Ly8gdGhlIHNlbGVjdGVkIHZhbHVlLlxuXG5cdFx0Ly8gSGFuZGxlIGRyb3Bkb3ducy5cblx0XHRpZiAoICRzZXR0aW5nLmlzKCdzZWxlY3QnKSApIHtcblx0XHRcdCR2YWx1ZSA9ICRzZXR0aW5nLmZpbmQoJ1t2YWx1ZT1cIicgKyB2YWx1ZSArICdcIl0nKTtcblxuXHRcdFx0aWYgKCAkdmFsdWUubGVuZ3RoICkge1xuXHRcdFx0XHQkc2V0dGluZy5maW5kKCdvcHRpb24nKS5wcm9wKCAnc2VsZWN0ZWQnLCBmYWxzZSApO1xuXHRcdFx0XHQkdmFsdWUucHJvcCggJ3NlbGVjdGVkJywgdHJ1ZSApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gSWYgd2UgY2FuJ3QgZmluZCB0aGUgZGVzaXJlZCB2YWx1ZSwgcmVjb3JkIHdoYXQgKmlzKiBzZWxlY3RlZC5cblx0XHRcdFx0dGhpcy5tb2RlbC5zZXQoIGtleSwgJHNldHRpbmcuZmluZCgnOnNlbGVjdGVkJykudmFsKCkgKTtcblx0XHRcdH1cblxuXHRcdC8vIEhhbmRsZSBidXR0b24gZ3JvdXBzLlxuXHRcdH0gZWxzZSBpZiAoICRzZXR0aW5nLmhhc0NsYXNzKCdidXR0b24tZ3JvdXAnKSApIHtcblx0XHRcdCRidXR0b25zID0gJHNldHRpbmcuZmluZCgnYnV0dG9uJykucmVtb3ZlQ2xhc3MoJ2FjdGl2ZScpO1xuXHRcdFx0JGJ1dHRvbnMuZmlsdGVyKCAnW3ZhbHVlPVwiJyArIHZhbHVlICsgJ1wiXScgKS5hZGRDbGFzcygnYWN0aXZlJyk7XG5cblx0XHQvLyBIYW5kbGUgdGV4dCBpbnB1dHMgYW5kIHRleHRhcmVhcy5cblx0XHR9IGVsc2UgaWYgKCAkc2V0dGluZy5pcygnaW5wdXRbdHlwZT1cInRleHRcIl0sIHRleHRhcmVhJykgKSB7XG5cdFx0XHRpZiAoICEgJHNldHRpbmcuaXMoJzpmb2N1cycpICkge1xuXHRcdFx0XHQkc2V0dGluZy52YWwoIHZhbHVlICk7XG5cdFx0XHR9XG5cdFx0Ly8gSGFuZGxlIGNoZWNrYm94ZXMuXG5cdFx0fSBlbHNlIGlmICggJHNldHRpbmcuaXMoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpICkge1xuXHRcdFx0JHNldHRpbmcucHJvcCggJ2NoZWNrZWQnLCAhISB2YWx1ZSAmJiAnZmFsc2UnICE9PSB2YWx1ZSApO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBldmVudFxuXHQgKi9cblx0dXBkYXRlSGFuZGxlcjogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciAkc2V0dGluZyA9ICQoIGV2ZW50LnRhcmdldCApLmNsb3Nlc3QoJ1tkYXRhLXNldHRpbmddJyksXG5cdFx0XHR2YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZSxcblx0XHRcdHVzZXJTZXR0aW5nO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGlmICggISAkc2V0dGluZy5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gVXNlIHRoZSBjb3JyZWN0IHZhbHVlIGZvciBjaGVja2JveGVzLlxuXHRcdGlmICggJHNldHRpbmcuaXMoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXScpICkge1xuXHRcdFx0dmFsdWUgPSAkc2V0dGluZ1swXS5jaGVja2VkO1xuXHRcdH1cblxuXHRcdC8vIFVwZGF0ZSB0aGUgY29ycmVzcG9uZGluZyBzZXR0aW5nLlxuXHRcdHRoaXMubW9kZWwuc2V0KCAkc2V0dGluZy5kYXRhKCdzZXR0aW5nJyksIHZhbHVlICk7XG5cblx0XHQvLyBJZiB0aGUgc2V0dGluZyBoYXMgYSBjb3JyZXNwb25kaW5nIHVzZXIgc2V0dGluZyxcblx0XHQvLyB1cGRhdGUgdGhhdCBhcyB3ZWxsLlxuXHRcdGlmICggdXNlclNldHRpbmcgPSAkc2V0dGluZy5kYXRhKCd1c2VyU2V0dGluZycpICkge1xuXHRcdFx0d2luZG93LnNldFVzZXJTZXR0aW5nKCB1c2VyU2V0dGluZywgdmFsdWUgKTtcblx0XHR9XG5cdH0sXG5cblx0dXBkYXRlQ2hhbmdlczogZnVuY3Rpb24oIG1vZGVsICkge1xuXHRcdGlmICggbW9kZWwuaGFzQ2hhbmdlZCgpICkge1xuXHRcdFx0XyggbW9kZWwuY2hhbmdlZCApLmNoYWluKCkua2V5cygpLmVhY2goIHRoaXMudXBkYXRlLCB0aGlzICk7XG5cdFx0fVxuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZXR0aW5ncztcbiIsIi8qZ2xvYmFscyB3cCwgXyAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuU2V0dGluZ3MuQXR0YWNobWVudERpc3BsYXlcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LlNldHRpbmdzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBTZXR0aW5ncyA9IHdwLm1lZGlhLnZpZXcuU2V0dGluZ3MsXG5cdEF0dGFjaG1lbnREaXNwbGF5O1xuXG5BdHRhY2htZW50RGlzcGxheSA9IFNldHRpbmdzLmV4dGVuZCh7XG5cdGNsYXNzTmFtZTogJ2F0dGFjaG1lbnQtZGlzcGxheS1zZXR0aW5ncycsXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoJ2F0dGFjaG1lbnQtZGlzcGxheS1zZXR0aW5ncycpLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBhdHRhY2htZW50ID0gdGhpcy5vcHRpb25zLmF0dGFjaG1lbnQ7XG5cblx0XHRfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdHVzZXJTZXR0aW5nczogZmFsc2Vcblx0XHR9KTtcblx0XHQvLyBDYWxsICdpbml0aWFsaXplJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzLlxuXHRcdFNldHRpbmdzLnByb3RvdHlwZS5pbml0aWFsaXplLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHR0aGlzLmxpc3RlblRvKCB0aGlzLm1vZGVsLCAnY2hhbmdlOmxpbmsnLCB0aGlzLnVwZGF0ZUxpbmtUbyApO1xuXG5cdFx0aWYgKCBhdHRhY2htZW50ICkge1xuXHRcdFx0YXR0YWNobWVudC5vbiggJ2NoYW5nZTp1cGxvYWRpbmcnLCB0aGlzLnJlbmRlciwgdGhpcyApO1xuXHRcdH1cblx0fSxcblxuXHRkaXNwb3NlOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgYXR0YWNobWVudCA9IHRoaXMub3B0aW9ucy5hdHRhY2htZW50O1xuXHRcdGlmICggYXR0YWNobWVudCApIHtcblx0XHRcdGF0dGFjaG1lbnQub2ZmKCBudWxsLCBudWxsLCB0aGlzICk7XG5cdFx0fVxuXHRcdC8qKlxuXHRcdCAqIGNhbGwgJ2Rpc3Bvc2UnIGRpcmVjdGx5IG9uIHRoZSBwYXJlbnQgY2xhc3Ncblx0XHQgKi9cblx0XHRTZXR0aW5ncy5wcm90b3R5cGUuZGlzcG9zZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5BdHRhY2htZW50RGlzcGxheX0gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHJlbmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGF0dGFjaG1lbnQgPSB0aGlzLm9wdGlvbnMuYXR0YWNobWVudDtcblx0XHRpZiAoIGF0dGFjaG1lbnQgKSB7XG5cdFx0XHRfLmV4dGVuZCggdGhpcy5vcHRpb25zLCB7XG5cdFx0XHRcdHNpemVzOiBhdHRhY2htZW50LmdldCgnc2l6ZXMnKSxcblx0XHRcdFx0dHlwZTogIGF0dGFjaG1lbnQuZ2V0KCd0eXBlJylcblx0XHRcdH0pO1xuXHRcdH1cblx0XHQvKipcblx0XHQgKiBjYWxsICdyZW5kZXInIGRpcmVjdGx5IG9uIHRoZSBwYXJlbnQgY2xhc3Ncblx0XHQgKi9cblx0XHRTZXR0aW5ncy5wcm90b3R5cGUucmVuZGVyLmNhbGwoIHRoaXMgKTtcblx0XHR0aGlzLnVwZGF0ZUxpbmtUbygpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdHVwZGF0ZUxpbmtUbzogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIGxpbmtUbyA9IHRoaXMubW9kZWwuZ2V0KCdsaW5rJyksXG5cdFx0XHQkaW5wdXQgPSB0aGlzLiQoJy5saW5rLXRvLWN1c3RvbScpLFxuXHRcdFx0YXR0YWNobWVudCA9IHRoaXMub3B0aW9ucy5hdHRhY2htZW50O1xuXG5cdFx0aWYgKCAnbm9uZScgPT09IGxpbmtUbyB8fCAnZW1iZWQnID09PSBsaW5rVG8gfHwgKCAhIGF0dGFjaG1lbnQgJiYgJ2N1c3RvbScgIT09IGxpbmtUbyApICkge1xuXHRcdFx0JGlucHV0LmFkZENsYXNzKCAnaGlkZGVuJyApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggYXR0YWNobWVudCApIHtcblx0XHRcdGlmICggJ3Bvc3QnID09PSBsaW5rVG8gKSB7XG5cdFx0XHRcdCRpbnB1dC52YWwoIGF0dGFjaG1lbnQuZ2V0KCdsaW5rJykgKTtcblx0XHRcdH0gZWxzZSBpZiAoICdmaWxlJyA9PT0gbGlua1RvICkge1xuXHRcdFx0XHQkaW5wdXQudmFsKCBhdHRhY2htZW50LmdldCgndXJsJykgKTtcblx0XHRcdH0gZWxzZSBpZiAoICEgdGhpcy5tb2RlbC5nZXQoJ2xpbmtVcmwnKSApIHtcblx0XHRcdFx0JGlucHV0LnZhbCgnaHR0cDovLycpO1xuXHRcdFx0fVxuXG5cdFx0XHQkaW5wdXQucHJvcCggJ3JlYWRvbmx5JywgJ2N1c3RvbScgIT09IGxpbmtUbyApO1xuXHRcdH1cblxuXHRcdCRpbnB1dC5yZW1vdmVDbGFzcyggJ2hpZGRlbicgKTtcblxuXHRcdC8vIElmIHRoZSBpbnB1dCBpcyB2aXNpYmxlLCBmb2N1cyBhbmQgc2VsZWN0IGl0cyBjb250ZW50cy5cblx0XHRpZiAoICEgd3AubWVkaWEuaXNUb3VjaERldmljZSAmJiAkaW5wdXQuaXMoJzp2aXNpYmxlJykgKSB7XG5cdFx0XHQkaW5wdXQuZm9jdXMoKVswXS5zZWxlY3QoKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF0dGFjaG1lbnREaXNwbGF5O1xuIiwiLypnbG9iYWxzIHdwICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5TZXR0aW5ncy5HYWxsZXJ5XG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5TZXR0aW5nc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgR2FsbGVyeSA9IHdwLm1lZGlhLnZpZXcuU2V0dGluZ3MuZXh0ZW5kKHtcblx0Y2xhc3NOYW1lOiAnY29sbGVjdGlvbi1zZXR0aW5ncyBnYWxsZXJ5LXNldHRpbmdzJyxcblx0dGVtcGxhdGU6ICB3cC50ZW1wbGF0ZSgnZ2FsbGVyeS1zZXR0aW5ncycpXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBHYWxsZXJ5O1xuIiwiLypnbG9iYWxzIHdwICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5TZXR0aW5ncy5QbGF5bGlzdFxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuU2V0dGluZ3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFBsYXlsaXN0ID0gd3AubWVkaWEudmlldy5TZXR0aW5ncy5leHRlbmQoe1xuXHRjbGFzc05hbWU6ICdjb2xsZWN0aW9uLXNldHRpbmdzIHBsYXlsaXN0LXNldHRpbmdzJyxcblx0dGVtcGxhdGU6ICB3cC50ZW1wbGF0ZSgncGxheWxpc3Qtc2V0dGluZ3MnKVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gUGxheWxpc3Q7XG4iLCIvKipcbiAqIHdwLm1lZGlhLnZpZXcuU2lkZWJhclxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuUHJpb3JpdHlMaXN0XG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBTaWRlYmFyID0gd3AubWVkaWEudmlldy5Qcmlvcml0eUxpc3QuZXh0ZW5kKHtcblx0Y2xhc3NOYW1lOiAnbWVkaWEtc2lkZWJhcidcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNpZGViYXI7XG4iLCIvKmdsb2JhbHMgd3AsIF8gKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlNpdGVJY29uQ3JvcHBlclxuICpcbiAqIFVzZXMgdGhlIGltZ0FyZWFTZWxlY3QgcGx1Z2luIHRvIGFsbG93IGEgdXNlciB0byBjcm9wIGEgU2l0ZSBJY29uLlxuICpcbiAqIFRha2VzIGltZ0FyZWFTZWxlY3Qgb3B0aW9ucyBmcm9tXG4gKiB3cC5jdXN0b21pemUuU2l0ZUljb25Db250cm9sLmNhbGN1bGF0ZUltYWdlU2VsZWN0T3B0aW9ucy5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LkNyb3BwZXJcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFZpZXcgPSB3cC5tZWRpYS52aWV3LFxuXHRTaXRlSWNvbkNyb3BwZXI7XG5cblNpdGVJY29uQ3JvcHBlciA9IFZpZXcuQ3JvcHBlci5leHRlbmQoe1xuXHRjbGFzc05hbWU6ICdjcm9wLWNvbnRlbnQgc2l0ZS1pY29uJyxcblxuXHRyZWFkeTogZnVuY3Rpb24gKCkge1xuXHRcdFZpZXcuQ3JvcHBlci5wcm90b3R5cGUucmVhZHkuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0dGhpcy4kKCAnLmNyb3AtaW1hZ2UnICkub24oICdsb2FkJywgXy5iaW5kKCB0aGlzLmFkZFNpZGViYXIsIHRoaXMgKSApO1xuXHR9LFxuXG5cdGFkZFNpZGViYXI6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuc2lkZWJhciA9IG5ldyB3cC5tZWRpYS52aWV3LlNpZGViYXIoe1xuXHRcdFx0Y29udHJvbGxlcjogdGhpcy5jb250cm9sbGVyXG5cdFx0fSk7XG5cblx0XHR0aGlzLnNpZGViYXIuc2V0KCAncHJldmlldycsIG5ldyB3cC5tZWRpYS52aWV3LlNpdGVJY29uUHJldmlldyh7XG5cdFx0XHRjb250cm9sbGVyOiB0aGlzLmNvbnRyb2xsZXIsXG5cdFx0XHRhdHRhY2htZW50OiB0aGlzLm9wdGlvbnMuYXR0YWNobWVudFxuXHRcdH0pICk7XG5cblx0XHR0aGlzLmNvbnRyb2xsZXIuY3JvcHBlclZpZXcudmlld3MuYWRkKCB0aGlzLnNpZGViYXIgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2l0ZUljb25Dcm9wcGVyO1xuIiwiLypnbG9iYWxzIHdwLCBqUXVlcnkgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlNpdGVJY29uUHJldmlld1xuICpcbiAqIFNob3dzIGEgcHJldmlldyBvZiB0aGUgU2l0ZSBJY29uIGFzIGEgZmF2aWNvbiBhbmQgYXBwIGljb24gd2hpbGUgY3JvcHBpbmcuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBWaWV3ID0gd3AubWVkaWEuVmlldyxcblx0JCA9IGpRdWVyeSxcblx0U2l0ZUljb25QcmV2aWV3O1xuXG5TaXRlSWNvblByZXZpZXcgPSBWaWV3LmV4dGVuZCh7XG5cdGNsYXNzTmFtZTogJ3NpdGUtaWNvbi1wcmV2aWV3Jyxcblx0dGVtcGxhdGU6IHdwLnRlbXBsYXRlKCAnc2l0ZS1pY29uLXByZXZpZXcnICksXG5cblx0cmVhZHk6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMuY29udHJvbGxlci5pbWdTZWxlY3Quc2V0T3B0aW9ucyh7XG5cdFx0XHRvbkluaXQ6IHRoaXMudXBkYXRlUHJldmlldyxcblx0XHRcdG9uU2VsZWN0Q2hhbmdlOiB0aGlzLnVwZGF0ZVByZXZpZXdcblx0XHR9KTtcblx0fSxcblxuXHRwcmVwYXJlOiBmdW5jdGlvbigpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dXJsOiB0aGlzLm9wdGlvbnMuYXR0YWNobWVudC5nZXQoICd1cmwnIClcblx0XHR9O1xuXHR9LFxuXG5cdHVwZGF0ZVByZXZpZXc6IGZ1bmN0aW9uKCBpbWcsIGNvb3JkcyApIHtcblx0XHR2YXIgcnggPSA2NCAvIGNvb3Jkcy53aWR0aCxcblx0XHRcdHJ5ID0gNjQgLyBjb29yZHMuaGVpZ2h0LFxuXHRcdFx0cHJldmlld19yeCA9IDE2IC8gY29vcmRzLndpZHRoLFxuXHRcdFx0cHJldmlld19yeSA9IDE2IC8gY29vcmRzLmhlaWdodDtcblxuXHRcdCQoICcjcHJldmlldy1hcHAtaWNvbicgKS5jc3Moe1xuXHRcdFx0d2lkdGg6IE1hdGgucm91bmQocnggKiB0aGlzLmltYWdlV2lkdGggKSArICdweCcsXG5cdFx0XHRoZWlnaHQ6IE1hdGgucm91bmQocnkgKiB0aGlzLmltYWdlSGVpZ2h0ICkgKyAncHgnLFxuXHRcdFx0bWFyZ2luTGVmdDogJy0nICsgTWF0aC5yb3VuZChyeCAqIGNvb3Jkcy54MSkgKyAncHgnLFxuXHRcdFx0bWFyZ2luVG9wOiAnLScgKyBNYXRoLnJvdW5kKHJ5ICogY29vcmRzLnkxKSArICdweCdcblx0XHR9KTtcblxuXHRcdCQoICcjcHJldmlldy1mYXZpY29uJyApLmNzcyh7XG5cdFx0XHR3aWR0aDogTWF0aC5yb3VuZCggcHJldmlld19yeCAqIHRoaXMuaW1hZ2VXaWR0aCApICsgJ3B4Jyxcblx0XHRcdGhlaWdodDogTWF0aC5yb3VuZCggcHJldmlld19yeSAqIHRoaXMuaW1hZ2VIZWlnaHQgKSArICdweCcsXG5cdFx0XHRtYXJnaW5MZWZ0OiAnLScgKyBNYXRoLnJvdW5kKCBwcmV2aWV3X3J4ICogY29vcmRzLngxICkgKyAncHgnLFxuXHRcdFx0bWFyZ2luVG9wOiAnLScgKyBNYXRoLmZsb29yKCBwcmV2aWV3X3J5KiBjb29yZHMueTEgKSArICdweCdcblx0XHR9KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2l0ZUljb25QcmV2aWV3O1xuIiwiLypnbG9iYWxzIF8gKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlNwaW5uZXJcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFNwaW5uZXIgPSB3cC5tZWRpYS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAgJ3NwYW4nLFxuXHRjbGFzc05hbWU6ICdzcGlubmVyJyxcblx0c3Bpbm5lclRpbWVvdXQ6IGZhbHNlLFxuXHRkZWxheTogNDAwLFxuXG5cdHNob3c6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggISB0aGlzLnNwaW5uZXJUaW1lb3V0ICkge1xuXHRcdFx0dGhpcy5zcGlubmVyVGltZW91dCA9IF8uZGVsYXkoZnVuY3Rpb24oICRlbCApIHtcblx0XHRcdFx0JGVsLmFkZENsYXNzKCAnaXMtYWN0aXZlJyApO1xuXHRcdFx0fSwgdGhpcy5kZWxheSwgdGhpcy4kZWwgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRoaWRlOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiRlbC5yZW1vdmVDbGFzcyggJ2lzLWFjdGl2ZScgKTtcblx0XHR0aGlzLnNwaW5uZXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0KCB0aGlzLnNwaW5uZXJUaW1lb3V0ICk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU3Bpbm5lcjtcbiIsIi8qZ2xvYmFscyBfLCBCYWNrYm9uZSAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuVG9vbGJhclxuICpcbiAqIEEgdG9vbGJhciB3aGljaCBjb25zaXN0cyBvZiBhIHByaW1hcnkgYW5kIGEgc2Vjb25kYXJ5IHNlY3Rpb24uIEVhY2ggc2VjdGlvbnNcbiAqIGNhbiBiZSBmaWxsZWQgd2l0aCB2aWV3cy5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFZpZXcgPSB3cC5tZWRpYS5WaWV3LFxuXHRUb29sYmFyO1xuXG5Ub29sYmFyID0gVmlldy5leHRlbmQoe1xuXHR0YWdOYW1lOiAgICdkaXYnLFxuXHRjbGFzc05hbWU6ICdtZWRpYS10b29sYmFyJyxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc3RhdGUgPSB0aGlzLmNvbnRyb2xsZXIuc3RhdGUoKSxcblx0XHRcdHNlbGVjdGlvbiA9IHRoaXMuc2VsZWN0aW9uID0gc3RhdGUuZ2V0KCdzZWxlY3Rpb24nKSxcblx0XHRcdGxpYnJhcnkgPSB0aGlzLmxpYnJhcnkgPSBzdGF0ZS5nZXQoJ2xpYnJhcnknKTtcblxuXHRcdHRoaXMuX3ZpZXdzID0ge307XG5cblx0XHQvLyBUaGUgdG9vbGJhciBpcyBjb21wb3NlZCBvZiB0d28gYFByaW9yaXR5TGlzdGAgdmlld3MuXG5cdFx0dGhpcy5wcmltYXJ5ICAgPSBuZXcgd3AubWVkaWEudmlldy5Qcmlvcml0eUxpc3QoKTtcblx0XHR0aGlzLnNlY29uZGFyeSA9IG5ldyB3cC5tZWRpYS52aWV3LlByaW9yaXR5TGlzdCgpO1xuXHRcdHRoaXMucHJpbWFyeS4kZWwuYWRkQ2xhc3MoJ21lZGlhLXRvb2xiYXItcHJpbWFyeSBzZWFyY2gtZm9ybScpO1xuXHRcdHRoaXMuc2Vjb25kYXJ5LiRlbC5hZGRDbGFzcygnbWVkaWEtdG9vbGJhci1zZWNvbmRhcnknKTtcblxuXHRcdHRoaXMudmlld3Muc2V0KFsgdGhpcy5zZWNvbmRhcnksIHRoaXMucHJpbWFyeSBdKTtcblxuXHRcdGlmICggdGhpcy5vcHRpb25zLml0ZW1zICkge1xuXHRcdFx0dGhpcy5zZXQoIHRoaXMub3B0aW9ucy5pdGVtcywgeyBzaWxlbnQ6IHRydWUgfSk7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIHRoaXMub3B0aW9ucy5zaWxlbnQgKSB7XG5cdFx0XHR0aGlzLnJlbmRlcigpO1xuXHRcdH1cblxuXHRcdGlmICggc2VsZWN0aW9uICkge1xuXHRcdFx0c2VsZWN0aW9uLm9uKCAnYWRkIHJlbW92ZSByZXNldCcsIHRoaXMucmVmcmVzaCwgdGhpcyApO1xuXHRcdH1cblxuXHRcdGlmICggbGlicmFyeSApIHtcblx0XHRcdGxpYnJhcnkub24oICdhZGQgcmVtb3ZlIHJlc2V0JywgdGhpcy5yZWZyZXNoLCB0aGlzICk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuVG9vbGJhcn0gUmV0dXJucyBpdHNlZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0ZGlzcG9zZTogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLnNlbGVjdGlvbiApIHtcblx0XHRcdHRoaXMuc2VsZWN0aW9uLm9mZiggbnVsbCwgbnVsbCwgdGhpcyApO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5saWJyYXJ5ICkge1xuXHRcdFx0dGhpcy5saWJyYXJ5Lm9mZiggbnVsbCwgbnVsbCwgdGhpcyApO1xuXHRcdH1cblx0XHQvKipcblx0XHQgKiBjYWxsICdkaXNwb3NlJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzXG5cdFx0ICovXG5cdFx0cmV0dXJuIFZpZXcucHJvdG90eXBlLmRpc3Bvc2UuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdHJlYWR5OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLnJlZnJlc2goKTtcblx0fSxcblxuXHQvKipcblx0ICogQHBhcmFtIHtzdHJpbmd9IGlkXG5cdCAqIEBwYXJhbSB7QmFja2JvbmUuVmlld3xPYmplY3R9IHZpZXdcblx0ICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zPXt9XVxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5Ub29sYmFyfSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0c2V0OiBmdW5jdGlvbiggaWQsIHZpZXcsIG9wdGlvbnMgKSB7XG5cdFx0dmFyIGxpc3Q7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHQvLyBBY2NlcHQgYW4gb2JqZWN0IHdpdGggYW4gYGlkYCA6IGB2aWV3YCBtYXBwaW5nLlxuXHRcdGlmICggXy5pc09iamVjdCggaWQgKSApIHtcblx0XHRcdF8uZWFjaCggaWQsIGZ1bmN0aW9uKCB2aWV3LCBpZCApIHtcblx0XHRcdFx0dGhpcy5zZXQoIGlkLCB2aWV3LCB7IHNpbGVudDogdHJ1ZSB9KTtcblx0XHRcdH0sIHRoaXMgKTtcblxuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoICEgKCB2aWV3IGluc3RhbmNlb2YgQmFja2JvbmUuVmlldyApICkge1xuXHRcdFx0XHR2aWV3LmNsYXNzZXMgPSBbICdtZWRpYS1idXR0b24tJyArIGlkIF0uY29uY2F0KCB2aWV3LmNsYXNzZXMgfHwgW10gKTtcblx0XHRcdFx0dmlldyA9IG5ldyB3cC5tZWRpYS52aWV3LkJ1dHRvbiggdmlldyApLnJlbmRlcigpO1xuXHRcdFx0fVxuXG5cdFx0XHR2aWV3LmNvbnRyb2xsZXIgPSB2aWV3LmNvbnRyb2xsZXIgfHwgdGhpcy5jb250cm9sbGVyO1xuXG5cdFx0XHR0aGlzLl92aWV3c1sgaWQgXSA9IHZpZXc7XG5cblx0XHRcdGxpc3QgPSB2aWV3Lm9wdGlvbnMucHJpb3JpdHkgPCAwID8gJ3NlY29uZGFyeScgOiAncHJpbWFyeSc7XG5cdFx0XHR0aGlzWyBsaXN0IF0uc2V0KCBpZCwgdmlldywgb3B0aW9ucyApO1xuXHRcdH1cblxuXHRcdGlmICggISBvcHRpb25zLnNpbGVudCApIHtcblx0XHRcdHRoaXMucmVmcmVzaCgpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHQvKipcblx0ICogQHBhcmFtIHtzdHJpbmd9IGlkXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LkJ1dHRvbn1cblx0ICovXG5cdGdldDogZnVuY3Rpb24oIGlkICkge1xuXHRcdHJldHVybiB0aGlzLl92aWV3c1sgaWQgXTtcblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBpZFxuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEudmlldy5Ub29sYmFyfSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0dW5zZXQ6IGZ1bmN0aW9uKCBpZCwgb3B0aW9ucyApIHtcblx0XHRkZWxldGUgdGhpcy5fdmlld3NbIGlkIF07XG5cdFx0dGhpcy5wcmltYXJ5LnVuc2V0KCBpZCwgb3B0aW9ucyApO1xuXHRcdHRoaXMuc2Vjb25kYXJ5LnVuc2V0KCBpZCwgb3B0aW9ucyApO1xuXG5cdFx0aWYgKCAhIG9wdGlvbnMgfHwgISBvcHRpb25zLnNpbGVudCApIHtcblx0XHRcdHRoaXMucmVmcmVzaCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRyZWZyZXNoOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc3RhdGUgPSB0aGlzLmNvbnRyb2xsZXIuc3RhdGUoKSxcblx0XHRcdGxpYnJhcnkgPSBzdGF0ZS5nZXQoJ2xpYnJhcnknKSxcblx0XHRcdHNlbGVjdGlvbiA9IHN0YXRlLmdldCgnc2VsZWN0aW9uJyk7XG5cblx0XHRfLmVhY2goIHRoaXMuX3ZpZXdzLCBmdW5jdGlvbiggYnV0dG9uICkge1xuXHRcdFx0aWYgKCAhIGJ1dHRvbi5tb2RlbCB8fCAhIGJ1dHRvbi5vcHRpb25zIHx8ICEgYnV0dG9uLm9wdGlvbnMucmVxdWlyZXMgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dmFyIHJlcXVpcmVzID0gYnV0dG9uLm9wdGlvbnMucmVxdWlyZXMsXG5cdFx0XHRcdGRpc2FibGVkID0gZmFsc2U7XG5cblx0XHRcdC8vIFByZXZlbnQgaW5zZXJ0aW9uIG9mIGF0dGFjaG1lbnRzIGlmIGFueSBvZiB0aGVtIGFyZSBzdGlsbCB1cGxvYWRpbmdcblx0XHRcdGRpc2FibGVkID0gXy5zb21lKCBzZWxlY3Rpb24ubW9kZWxzLCBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblx0XHRcdFx0cmV0dXJuIGF0dGFjaG1lbnQuZ2V0KCd1cGxvYWRpbmcnKSA9PT0gdHJ1ZTtcblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoIHJlcXVpcmVzLnNlbGVjdGlvbiAmJiBzZWxlY3Rpb24gJiYgISBzZWxlY3Rpb24ubGVuZ3RoICkge1xuXHRcdFx0XHRkaXNhYmxlZCA9IHRydWU7XG5cdFx0XHR9IGVsc2UgaWYgKCByZXF1aXJlcy5saWJyYXJ5ICYmIGxpYnJhcnkgJiYgISBsaWJyYXJ5Lmxlbmd0aCApIHtcblx0XHRcdFx0ZGlzYWJsZWQgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0YnV0dG9uLm1vZGVsLnNldCggJ2Rpc2FibGVkJywgZGlzYWJsZWQgKTtcblx0XHR9KTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVG9vbGJhcjtcbiIsIi8qZ2xvYmFscyB3cCwgXyAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuVG9vbGJhci5FbWJlZFxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLnZpZXcuVG9vbGJhci5TZWxlY3RcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS52aWV3LlRvb2xiYXJcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFNlbGVjdCA9IHdwLm1lZGlhLnZpZXcuVG9vbGJhci5TZWxlY3QsXG5cdGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdEVtYmVkO1xuXG5FbWJlZCA9IFNlbGVjdC5leHRlbmQoe1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdHRleHQ6IGwxMG4uaW5zZXJ0SW50b1Bvc3QsXG5cdFx0XHRyZXF1aXJlczogZmFsc2Vcblx0XHR9KTtcblx0XHQvLyBDYWxsICdpbml0aWFsaXplJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzLlxuXHRcdFNlbGVjdC5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH0sXG5cblx0cmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHVybCA9IHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLnByb3BzLmdldCgndXJsJyk7XG5cdFx0dGhpcy5nZXQoJ3NlbGVjdCcpLm1vZGVsLnNldCggJ2Rpc2FibGVkJywgISB1cmwgfHwgdXJsID09PSAnaHR0cDovLycgKTtcblx0XHQvKipcblx0XHQgKiBjYWxsICdyZWZyZXNoJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzXG5cdFx0ICovXG5cdFx0U2VsZWN0LnByb3RvdHlwZS5yZWZyZXNoLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gRW1iZWQ7XG4iLCIvKmdsb2JhbHMgd3AsIF8gKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlRvb2xiYXIuU2VsZWN0XG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEudmlldy5Ub29sYmFyXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKi9cbnZhciBUb29sYmFyID0gd3AubWVkaWEudmlldy5Ub29sYmFyLFxuXHRsMTBuID0gd3AubWVkaWEudmlldy5sMTBuLFxuXHRTZWxlY3Q7XG5cblNlbGVjdCA9IFRvb2xiYXIuZXh0ZW5kKHtcblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cblx0XHRfLmJpbmRBbGwoIHRoaXMsICdjbGlja1NlbGVjdCcgKTtcblxuXHRcdF8uZGVmYXVsdHMoIG9wdGlvbnMsIHtcblx0XHRcdGV2ZW50OiAnc2VsZWN0Jyxcblx0XHRcdHN0YXRlOiBmYWxzZSxcblx0XHRcdHJlc2V0OiB0cnVlLFxuXHRcdFx0Y2xvc2U6IHRydWUsXG5cdFx0XHR0ZXh0OiAgbDEwbi5zZWxlY3QsXG5cblx0XHRcdC8vIERvZXMgdGhlIGJ1dHRvbiByZWx5IG9uIHRoZSBzZWxlY3Rpb24/XG5cdFx0XHRyZXF1aXJlczoge1xuXHRcdFx0XHRzZWxlY3Rpb246IHRydWVcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdG9wdGlvbnMuaXRlbXMgPSBfLmRlZmF1bHRzKCBvcHRpb25zLml0ZW1zIHx8IHt9LCB7XG5cdFx0XHRzZWxlY3Q6IHtcblx0XHRcdFx0c3R5bGU6ICAgICdwcmltYXJ5Jyxcblx0XHRcdFx0dGV4dDogICAgIG9wdGlvbnMudGV4dCxcblx0XHRcdFx0cHJpb3JpdHk6IDgwLFxuXHRcdFx0XHRjbGljazogICAgdGhpcy5jbGlja1NlbGVjdCxcblx0XHRcdFx0cmVxdWlyZXM6IG9wdGlvbnMucmVxdWlyZXNcblx0XHRcdH1cblx0XHR9KTtcblx0XHQvLyBDYWxsICdpbml0aWFsaXplJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzLlxuXHRcdFRvb2xiYXIucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXG5cdGNsaWNrU2VsZWN0OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucyxcblx0XHRcdGNvbnRyb2xsZXIgPSB0aGlzLmNvbnRyb2xsZXI7XG5cblx0XHRpZiAoIG9wdGlvbnMuY2xvc2UgKSB7XG5cdFx0XHRjb250cm9sbGVyLmNsb3NlKCk7XG5cdFx0fVxuXG5cdFx0aWYgKCBvcHRpb25zLmV2ZW50ICkge1xuXHRcdFx0Y29udHJvbGxlci5zdGF0ZSgpLnRyaWdnZXIoIG9wdGlvbnMuZXZlbnQgKTtcblx0XHR9XG5cblx0XHRpZiAoIG9wdGlvbnMuc3RhdGUgKSB7XG5cdFx0XHRjb250cm9sbGVyLnNldFN0YXRlKCBvcHRpb25zLnN0YXRlICk7XG5cdFx0fVxuXG5cdFx0aWYgKCBvcHRpb25zLnJlc2V0ICkge1xuXHRcdFx0Y29udHJvbGxlci5yZXNldCgpO1xuXHRcdH1cblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gU2VsZWN0O1xuIiwiLypnbG9iYWxzIHdwLCBfLCBqUXVlcnkgKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgZHJvcHpvbmUgb24gV1AgZWRpdG9yIGluc3RhbmNlcyAoZWxlbWVudHMgd2l0aCAud3AtZWRpdG9yLXdyYXApXG4gKiBhbmQgcmVsYXlzIGRyYWcnbidkcm9wcGVkIGZpbGVzIHRvIGEgbWVkaWEgd29ya2Zsb3cuXG4gKlxuICogd3AubWVkaWEudmlldy5FZGl0b3JVcGxvYWRlclxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIHdwLm1lZGlhLlZpZXdcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgVmlldyA9IHdwLm1lZGlhLlZpZXcsXG5cdGwxMG4gPSB3cC5tZWRpYS52aWV3LmwxMG4sXG5cdCQgPSBqUXVlcnksXG5cdEVkaXRvclVwbG9hZGVyO1xuXG5FZGl0b3JVcGxvYWRlciA9IFZpZXcuZXh0ZW5kKHtcblx0dGFnTmFtZTogICAnZGl2Jyxcblx0Y2xhc3NOYW1lOiAndXBsb2FkZXItZWRpdG9yJyxcblx0dGVtcGxhdGU6ICB3cC50ZW1wbGF0ZSggJ3VwbG9hZGVyLWVkaXRvcicgKSxcblxuXHRsb2NhbERyYWc6IGZhbHNlLFxuXHRvdmVyQ29udGFpbmVyOiBmYWxzZSxcblx0b3ZlckRyb3B6b25lOiBmYWxzZSxcblx0ZHJhZ2dpbmdGaWxlOiBudWxsLFxuXG5cdC8qKlxuXHQgKiBCaW5kIGRyYWcnbidkcm9wIGV2ZW50cyB0byBjYWxsYmFja3MuXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmluaXRpYWxpemVkID0gZmFsc2U7XG5cblx0XHQvLyBCYWlsIGlmIG5vdCBlbmFibGVkIG9yIFVBIGRvZXMgbm90IHN1cHBvcnQgZHJhZyduJ2Ryb3Agb3IgRmlsZSBBUEkuXG5cdFx0aWYgKCAhIHdpbmRvdy50aW55TUNFUHJlSW5pdCB8fCAhIHdpbmRvdy50aW55TUNFUHJlSW5pdC5kcmFnRHJvcFVwbG9hZCB8fCAhIHRoaXMuYnJvd3NlclN1cHBvcnQoKSApIHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH1cblxuXHRcdHRoaXMuJGRvY3VtZW50ID0gJChkb2N1bWVudCk7XG5cdFx0dGhpcy5kcm9wem9uZXMgPSBbXTtcblx0XHR0aGlzLmZpbGVzID0gW107XG5cblx0XHR0aGlzLiRkb2N1bWVudC5vbiggJ2Ryb3AnLCAnLnVwbG9hZGVyLWVkaXRvcicsIF8uYmluZCggdGhpcy5kcm9wLCB0aGlzICkgKTtcblx0XHR0aGlzLiRkb2N1bWVudC5vbiggJ2RyYWdvdmVyJywgJy51cGxvYWRlci1lZGl0b3InLCBfLmJpbmQoIHRoaXMuZHJvcHpvbmVEcmFnb3ZlciwgdGhpcyApICk7XG5cdFx0dGhpcy4kZG9jdW1lbnQub24oICdkcmFnbGVhdmUnLCAnLnVwbG9hZGVyLWVkaXRvcicsIF8uYmluZCggdGhpcy5kcm9wem9uZURyYWdsZWF2ZSwgdGhpcyApICk7XG5cdFx0dGhpcy4kZG9jdW1lbnQub24oICdjbGljaycsICcudXBsb2FkZXItZWRpdG9yJywgXy5iaW5kKCB0aGlzLmNsaWNrLCB0aGlzICkgKTtcblxuXHRcdHRoaXMuJGRvY3VtZW50Lm9uKCAnZHJhZ292ZXInLCBfLmJpbmQoIHRoaXMuY29udGFpbmVyRHJhZ292ZXIsIHRoaXMgKSApO1xuXHRcdHRoaXMuJGRvY3VtZW50Lm9uKCAnZHJhZ2xlYXZlJywgXy5iaW5kKCB0aGlzLmNvbnRhaW5lckRyYWdsZWF2ZSwgdGhpcyApICk7XG5cblx0XHR0aGlzLiRkb2N1bWVudC5vbiggJ2RyYWdzdGFydCBkcmFnZW5kIGRyb3AnLCBfLmJpbmQoIGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRcdHRoaXMubG9jYWxEcmFnID0gZXZlbnQudHlwZSA9PT0gJ2RyYWdzdGFydCc7XG5cdFx0fSwgdGhpcyApICk7XG5cblx0XHR0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHQvKipcblx0ICogQ2hlY2sgYnJvd3NlciBzdXBwb3J0IGZvciBkcmFnJ24nZHJvcC5cblx0ICpcblx0ICogQHJldHVybiBCb29sZWFuXG5cdCAqL1xuXHRicm93c2VyU3VwcG9ydDogZnVuY3Rpb24oKSB7XG5cdFx0dmFyIHN1cHBvcnRzID0gZmFsc2UsIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG5cdFx0c3VwcG9ydHMgPSAoICdkcmFnZ2FibGUnIGluIGRpdiApIHx8ICggJ29uZHJhZ3N0YXJ0JyBpbiBkaXYgJiYgJ29uZHJvcCcgaW4gZGl2ICk7XG5cdFx0c3VwcG9ydHMgPSBzdXBwb3J0cyAmJiAhISAoIHdpbmRvdy5GaWxlICYmIHdpbmRvdy5GaWxlTGlzdCAmJiB3aW5kb3cuRmlsZVJlYWRlciApO1xuXHRcdHJldHVybiBzdXBwb3J0cztcblx0fSxcblxuXHRpc0RyYWdnaW5nRmlsZTogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdGlmICggdGhpcy5kcmFnZ2luZ0ZpbGUgIT09IG51bGwgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5kcmFnZ2luZ0ZpbGU7XG5cdFx0fVxuXG5cdFx0aWYgKCBfLmlzVW5kZWZpbmVkKCBldmVudC5vcmlnaW5hbEV2ZW50ICkgfHwgXy5pc1VuZGVmaW5lZCggZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIgKSApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHR0aGlzLmRyYWdnaW5nRmlsZSA9IF8uaW5kZXhPZiggZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIudHlwZXMsICdGaWxlcycgKSA+IC0xICYmXG5cdFx0XHRfLmluZGV4T2YoIGV2ZW50Lm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLnR5cGVzLCAndGV4dC9wbGFpbicgKSA9PT0gLTE7XG5cblx0XHRyZXR1cm4gdGhpcy5kcmFnZ2luZ0ZpbGU7XG5cdH0sXG5cblx0cmVmcmVzaDogZnVuY3Rpb24oIGUgKSB7XG5cdFx0dmFyIGRyb3B6b25lX2lkO1xuXHRcdGZvciAoIGRyb3B6b25lX2lkIGluIHRoaXMuZHJvcHpvbmVzICkge1xuXHRcdFx0Ly8gSGlkZSB0aGUgZHJvcHpvbmVzIG9ubHkgaWYgZHJhZ2dpbmcgaGFzIGxlZnQgdGhlIHNjcmVlbi5cblx0XHRcdHRoaXMuZHJvcHpvbmVzWyBkcm9wem9uZV9pZCBdLnRvZ2dsZSggdGhpcy5vdmVyQ29udGFpbmVyIHx8IHRoaXMub3ZlckRyb3B6b25lICk7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIF8uaXNVbmRlZmluZWQoIGUgKSApIHtcblx0XHRcdCQoIGUudGFyZ2V0ICkuY2xvc2VzdCggJy51cGxvYWRlci1lZGl0b3InICkudG9nZ2xlQ2xhc3MoICdkcm9wcGFibGUnLCB0aGlzLm92ZXJEcm9wem9uZSApO1xuXHRcdH1cblxuXHRcdGlmICggISB0aGlzLm92ZXJDb250YWluZXIgJiYgISB0aGlzLm92ZXJEcm9wem9uZSApIHtcblx0XHRcdHRoaXMuZHJhZ2dpbmdGaWxlID0gbnVsbDtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblxuXHRyZW5kZXI6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggISB0aGlzLmluaXRpYWxpemVkICkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0Vmlldy5wcm90b3R5cGUucmVuZGVyLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblx0XHQkKCAnLndwLWVkaXRvci13cmFwJyApLmVhY2goIF8uYmluZCggdGhpcy5hdHRhY2gsIHRoaXMgKSApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXG5cdGF0dGFjaDogZnVuY3Rpb24oIGluZGV4LCBlZGl0b3IgKSB7XG5cdFx0Ly8gQXR0YWNoIGEgZHJvcHpvbmUgdG8gYW4gZWRpdG9yLlxuXHRcdHZhciBkcm9wem9uZSA9IHRoaXMuJGVsLmNsb25lKCk7XG5cdFx0dGhpcy5kcm9wem9uZXMucHVzaCggZHJvcHpvbmUgKTtcblx0XHQkKCBlZGl0b3IgKS5hcHBlbmQoIGRyb3B6b25lICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFdoZW4gYSBmaWxlIGlzIGRyb3BwZWQgb24gdGhlIGVkaXRvciB1cGxvYWRlciwgb3BlbiB1cCBhbiBlZGl0b3IgbWVkaWEgd29ya2Zsb3dcblx0ICogYW5kIHVwbG9hZCB0aGUgZmlsZSBpbW1lZGlhdGVseS5cblx0ICpcblx0ICogQHBhcmFtICB7alF1ZXJ5LkV2ZW50fSBldmVudCBUaGUgJ2Ryb3AnIGV2ZW50LlxuXHQgKi9cblx0ZHJvcDogZnVuY3Rpb24oIGV2ZW50ICkge1xuXHRcdHZhciAkd3JhcCwgdXBsb2FkVmlldztcblxuXHRcdHRoaXMuY29udGFpbmVyRHJhZ2xlYXZlKCBldmVudCApO1xuXHRcdHRoaXMuZHJvcHpvbmVEcmFnbGVhdmUoIGV2ZW50ICk7XG5cblx0XHR0aGlzLmZpbGVzID0gZXZlbnQub3JpZ2luYWxFdmVudC5kYXRhVHJhbnNmZXIuZmlsZXM7XG5cdFx0aWYgKCB0aGlzLmZpbGVzLmxlbmd0aCA8IDEgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gU2V0IHRoZSBhY3RpdmUgZWRpdG9yIHRvIHRoZSBkcm9wIHRhcmdldC5cblx0XHQkd3JhcCA9ICQoIGV2ZW50LnRhcmdldCApLnBhcmVudHMoICcud3AtZWRpdG9yLXdyYXAnICk7XG5cdFx0aWYgKCAkd3JhcC5sZW5ndGggPiAwICYmICR3cmFwWzBdLmlkICkge1xuXHRcdFx0d2luZG93LndwQWN0aXZlRWRpdG9yID0gJHdyYXBbMF0uaWQuc2xpY2UoIDMsIC01ICk7XG5cdFx0fVxuXG5cdFx0aWYgKCAhIHRoaXMud29ya2Zsb3cgKSB7XG5cdFx0XHR0aGlzLndvcmtmbG93ID0gd3AubWVkaWEuZWRpdG9yLm9wZW4oIHdpbmRvdy53cEFjdGl2ZUVkaXRvciwge1xuXHRcdFx0XHRmcmFtZTogICAgJ3Bvc3QnLFxuXHRcdFx0XHRzdGF0ZTogICAgJ2luc2VydCcsXG5cdFx0XHRcdHRpdGxlOiAgICBsMTBuLmFkZE1lZGlhLFxuXHRcdFx0XHRtdWx0aXBsZTogdHJ1ZVxuXHRcdFx0fSk7XG5cblx0XHRcdHVwbG9hZFZpZXcgPSB0aGlzLndvcmtmbG93LnVwbG9hZGVyO1xuXG5cdFx0XHRpZiAoIHVwbG9hZFZpZXcudXBsb2FkZXIgJiYgdXBsb2FkVmlldy51cGxvYWRlci5yZWFkeSApIHtcblx0XHRcdFx0dGhpcy5hZGRGaWxlcy5hcHBseSggdGhpcyApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy53b3JrZmxvdy5vbiggJ3VwbG9hZGVyOnJlYWR5JywgdGhpcy5hZGRGaWxlcywgdGhpcyApO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLndvcmtmbG93LnN0YXRlKCkucmVzZXQoKTtcblx0XHRcdHRoaXMuYWRkRmlsZXMuYXBwbHkoIHRoaXMgKTtcblx0XHRcdHRoaXMud29ya2Zsb3cub3BlbigpO1xuXHRcdH1cblxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblxuXHQvKipcblx0ICogQWRkIHRoZSBmaWxlcyB0byB0aGUgdXBsb2FkZXIuXG5cdCAqL1xuXHRhZGRGaWxlczogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLmZpbGVzLmxlbmd0aCApIHtcblx0XHRcdHRoaXMud29ya2Zsb3cudXBsb2FkZXIudXBsb2FkZXIudXBsb2FkZXIuYWRkRmlsZSggXy50b0FycmF5KCB0aGlzLmZpbGVzICkgKTtcblx0XHRcdHRoaXMuZmlsZXMgPSBbXTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0Y29udGFpbmVyRHJhZ292ZXI6IGZ1bmN0aW9uKCBldmVudCApIHtcblx0XHRpZiAoIHRoaXMubG9jYWxEcmFnIHx8ICEgdGhpcy5pc0RyYWdnaW5nRmlsZSggZXZlbnQgKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLm92ZXJDb250YWluZXIgPSB0cnVlO1xuXHRcdHRoaXMucmVmcmVzaCgpO1xuXHR9LFxuXG5cdGNvbnRhaW5lckRyYWdsZWF2ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5vdmVyQ29udGFpbmVyID0gZmFsc2U7XG5cblx0XHQvLyBUaHJvdHRsZSBkcmFnbGVhdmUgYmVjYXVzZSBpdCdzIGNhbGxlZCB3aGVuIGJvdW5jaW5nIGZyb20gc29tZSBlbGVtZW50cyB0byBvdGhlcnMuXG5cdFx0Xy5kZWxheSggXy5iaW5kKCB0aGlzLnJlZnJlc2gsIHRoaXMgKSwgNTAgKTtcblx0fSxcblxuXHRkcm9wem9uZURyYWdvdmVyOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0aWYgKCB0aGlzLmxvY2FsRHJhZyB8fCAhIHRoaXMuaXNEcmFnZ2luZ0ZpbGUoIGV2ZW50ICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5vdmVyRHJvcHpvbmUgPSB0cnVlO1xuXHRcdHRoaXMucmVmcmVzaCggZXZlbnQgKTtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cblx0ZHJvcHpvbmVEcmFnbGVhdmU6IGZ1bmN0aW9uKCBlICkge1xuXHRcdHRoaXMub3ZlckRyb3B6b25lID0gZmFsc2U7XG5cdFx0Xy5kZWxheSggXy5iaW5kKCB0aGlzLnJlZnJlc2gsIHRoaXMsIGUgKSwgNTAgKTtcblx0fSxcblxuXHRjbGljazogZnVuY3Rpb24oIGUgKSB7XG5cdFx0Ly8gSW4gdGhlIHJhcmUgY2FzZSB3aGVyZSB0aGUgZHJvcHpvbmUgZ2V0cyBzdHVjaywgaGlkZSBpdCBvbiBjbGljay5cblx0XHR0aGlzLmNvbnRhaW5lckRyYWdsZWF2ZSggZSApO1xuXHRcdHRoaXMuZHJvcHpvbmVEcmFnbGVhdmUoIGUgKTtcblx0XHR0aGlzLmxvY2FsRHJhZyA9IGZhbHNlO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBFZGl0b3JVcGxvYWRlcjtcbiIsIi8qZ2xvYmFscyB3cCwgXyAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLnZpZXcuVXBsb2FkZXJJbmxpbmVcbiAqXG4gKiBUaGUgaW5saW5lIHVwbG9hZGVyIHRoYXQgc2hvd3MgdXAgaW4gdGhlICdVcGxvYWQgRmlsZXMnIHRhYi5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFZpZXcgPSB3cC5tZWRpYS5WaWV3LFxuXHRVcGxvYWRlcklubGluZTtcblxuVXBsb2FkZXJJbmxpbmUgPSBWaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAgJ2RpdicsXG5cdGNsYXNzTmFtZTogJ3VwbG9hZGVyLWlubGluZScsXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoJ3VwbG9hZGVyLWlubGluZScpLFxuXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayAuY2xvc2UnOiAnaGlkZSdcblx0fSxcblxuXHRpbml0aWFsaXplOiBmdW5jdGlvbigpIHtcblx0XHRfLmRlZmF1bHRzKCB0aGlzLm9wdGlvbnMsIHtcblx0XHRcdG1lc3NhZ2U6ICcnLFxuXHRcdFx0c3RhdHVzOiAgdHJ1ZSxcblx0XHRcdGNhbkNsb3NlOiBmYWxzZVxuXHRcdH0pO1xuXG5cdFx0aWYgKCAhIHRoaXMub3B0aW9ucy4kYnJvd3NlciAmJiB0aGlzLmNvbnRyb2xsZXIudXBsb2FkZXIgKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMuJGJyb3dzZXIgPSB0aGlzLmNvbnRyb2xsZXIudXBsb2FkZXIuJGJyb3dzZXI7XG5cdFx0fVxuXG5cdFx0aWYgKCBfLmlzVW5kZWZpbmVkKCB0aGlzLm9wdGlvbnMucG9zdElkICkgKSB7XG5cdFx0XHR0aGlzLm9wdGlvbnMucG9zdElkID0gd3AubWVkaWEudmlldy5zZXR0aW5ncy5wb3N0LmlkO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5vcHRpb25zLnN0YXR1cyApIHtcblx0XHRcdHRoaXMudmlld3Muc2V0KCAnLnVwbG9hZC1pbmxpbmUtc3RhdHVzJywgbmV3IHdwLm1lZGlhLnZpZXcuVXBsb2FkZXJTdGF0dXMoe1xuXHRcdFx0XHRjb250cm9sbGVyOiB0aGlzLmNvbnRyb2xsZXJcblx0XHRcdH0pICk7XG5cdFx0fVxuXHR9LFxuXG5cdHByZXBhcmU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBzdWdnZXN0ZWRXaWR0aCA9IHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLmdldCgnc3VnZ2VzdGVkV2lkdGgnKSxcblx0XHRcdHN1Z2dlc3RlZEhlaWdodCA9IHRoaXMuY29udHJvbGxlci5zdGF0ZSgpLmdldCgnc3VnZ2VzdGVkSGVpZ2h0JyksXG5cdFx0XHRkYXRhID0ge307XG5cblx0XHRkYXRhLm1lc3NhZ2UgPSB0aGlzLm9wdGlvbnMubWVzc2FnZTtcblx0XHRkYXRhLmNhbkNsb3NlID0gdGhpcy5vcHRpb25zLmNhbkNsb3NlO1xuXG5cdFx0aWYgKCBzdWdnZXN0ZWRXaWR0aCAmJiBzdWdnZXN0ZWRIZWlnaHQgKSB7XG5cdFx0XHRkYXRhLnN1Z2dlc3RlZFdpZHRoID0gc3VnZ2VzdGVkV2lkdGg7XG5cdFx0XHRkYXRhLnN1Z2dlc3RlZEhlaWdodCA9IHN1Z2dlc3RlZEhlaWdodDtcblx0XHR9XG5cblx0XHRyZXR1cm4gZGF0YTtcblx0fSxcblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LlVwbG9hZGVySW5saW5lfSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0ZGlzcG9zZTogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLmRpc3Bvc2luZyApIHtcblx0XHRcdC8qKlxuXHRcdFx0ICogY2FsbCAnZGlzcG9zZScgZGlyZWN0bHkgb24gdGhlIHBhcmVudCBjbGFzc1xuXHRcdFx0ICovXG5cdFx0XHRyZXR1cm4gVmlldy5wcm90b3R5cGUuZGlzcG9zZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0fVxuXG5cdFx0Ly8gUnVuIHJlbW92ZSBvbiBgZGlzcG9zZWAsIHNvIHdlIGNhbiBiZSBzdXJlIHRvIHJlZnJlc2ggdGhlXG5cdFx0Ly8gdXBsb2FkZXIgd2l0aCBhIHZpZXctbGVzcyBET00uIFRyYWNrIHdoZXRoZXIgd2UncmUgZGlzcG9zaW5nXG5cdFx0Ly8gc28gd2UgZG9uJ3QgdHJpZ2dlciBhbiBpbmZpbml0ZSBsb29wLlxuXHRcdHRoaXMuZGlzcG9zaW5nID0gdHJ1ZTtcblx0XHRyZXR1cm4gdGhpcy5yZW1vdmUoKTtcblx0fSxcblx0LyoqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS52aWV3LlVwbG9hZGVySW5saW5lfSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0cmVtb3ZlOiBmdW5jdGlvbigpIHtcblx0XHQvKipcblx0XHQgKiBjYWxsICdyZW1vdmUnIGRpcmVjdGx5IG9uIHRoZSBwYXJlbnQgY2xhc3Ncblx0XHQgKi9cblx0XHR2YXIgcmVzdWx0ID0gVmlldy5wcm90b3R5cGUucmVtb3ZlLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcblxuXHRcdF8uZGVmZXIoIF8uYmluZCggdGhpcy5yZWZyZXNoLCB0aGlzICkgKTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXG5cdHJlZnJlc2g6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB1cGxvYWRlciA9IHRoaXMuY29udHJvbGxlci51cGxvYWRlcjtcblxuXHRcdGlmICggdXBsb2FkZXIgKSB7XG5cdFx0XHR1cGxvYWRlci5yZWZyZXNoKCk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuVXBsb2FkZXJJbmxpbmV9XG5cdCAqL1xuXHRyZWFkeTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRicm93c2VyID0gdGhpcy5vcHRpb25zLiRicm93c2VyLFxuXHRcdFx0JHBsYWNlaG9sZGVyO1xuXG5cdFx0aWYgKCB0aGlzLmNvbnRyb2xsZXIudXBsb2FkZXIgKSB7XG5cdFx0XHQkcGxhY2Vob2xkZXIgPSB0aGlzLiQoJy5icm93c2VyJyk7XG5cblx0XHRcdC8vIENoZWNrIGlmIHdlJ3ZlIGFscmVhZHkgcmVwbGFjZWQgdGhlIHBsYWNlaG9sZGVyLlxuXHRcdFx0aWYgKCAkcGxhY2Vob2xkZXJbMF0gPT09ICRicm93c2VyWzBdICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdCRicm93c2VyLmRldGFjaCgpLnRleHQoICRwbGFjZWhvbGRlci50ZXh0KCkgKTtcblx0XHRcdCRicm93c2VyWzBdLmNsYXNzTmFtZSA9ICRwbGFjZWhvbGRlclswXS5jbGFzc05hbWU7XG5cdFx0XHQkcGxhY2Vob2xkZXIucmVwbGFjZVdpdGgoICRicm93c2VyLnNob3coKSApO1xuXHRcdH1cblxuXHRcdHRoaXMucmVmcmVzaCgpO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHR0aGlzLiRlbC5yZW1vdmVDbGFzcyggJ2hpZGRlbicgKTtcblx0fSxcblx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZWwuYWRkQ2xhc3MoICdoaWRkZW4nICk7XG5cdH1cblxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVXBsb2FkZXJJbmxpbmU7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlVwbG9hZGVyU3RhdHVzRXJyb3JcbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFVwbG9hZGVyU3RhdHVzRXJyb3IgPSB3cC5tZWRpYS5WaWV3LmV4dGVuZCh7XG5cdGNsYXNzTmFtZTogJ3VwbG9hZC1lcnJvcicsXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoJ3VwbG9hZGVyLXN0YXR1cy1lcnJvcicpXG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBVcGxvYWRlclN0YXR1c0Vycm9yO1xuIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEudmlldy5VcGxvYWRlclN0YXR1c1xuICpcbiAqIEFuIHVwbG9hZGVyIHN0YXR1cyBmb3Igb24tZ29pbmcgdXBsb2Fkcy5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5WaWV3XG4gKiBAYXVnbWVudHMgd3AuQmFja2JvbmUuVmlld1xuICogQGF1Z21lbnRzIEJhY2tib25lLlZpZXdcbiAqL1xudmFyIFZpZXcgPSB3cC5tZWRpYS5WaWV3LFxuXHRVcGxvYWRlclN0YXR1cztcblxuVXBsb2FkZXJTdGF0dXMgPSBWaWV3LmV4dGVuZCh7XG5cdGNsYXNzTmFtZTogJ21lZGlhLXVwbG9hZGVyLXN0YXR1cycsXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoJ3VwbG9hZGVyLXN0YXR1cycpLFxuXG5cdGV2ZW50czoge1xuXHRcdCdjbGljayAudXBsb2FkLWRpc21pc3MtZXJyb3JzJzogJ2Rpc21pc3MnXG5cdH0sXG5cblx0aW5pdGlhbGl6ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5xdWV1ZSA9IHdwLlVwbG9hZGVyLnF1ZXVlO1xuXHRcdHRoaXMucXVldWUub24oICdhZGQgcmVtb3ZlIHJlc2V0JywgdGhpcy52aXNpYmlsaXR5LCB0aGlzICk7XG5cdFx0dGhpcy5xdWV1ZS5vbiggJ2FkZCByZW1vdmUgcmVzZXQgY2hhbmdlOnBlcmNlbnQnLCB0aGlzLnByb2dyZXNzLCB0aGlzICk7XG5cdFx0dGhpcy5xdWV1ZS5vbiggJ2FkZCByZW1vdmUgcmVzZXQgY2hhbmdlOnVwbG9hZGluZycsIHRoaXMuaW5mbywgdGhpcyApO1xuXG5cdFx0dGhpcy5lcnJvcnMgPSB3cC5VcGxvYWRlci5lcnJvcnM7XG5cdFx0dGhpcy5lcnJvcnMucmVzZXQoKTtcblx0XHR0aGlzLmVycm9ycy5vbiggJ2FkZCByZW1vdmUgcmVzZXQnLCB0aGlzLnZpc2liaWxpdHksIHRoaXMgKTtcblx0XHR0aGlzLmVycm9ycy5vbiggJ2FkZCcsIHRoaXMuZXJyb3IsIHRoaXMgKTtcblx0fSxcblx0LyoqXG5cdCAqIEBnbG9iYWwgd3AuVXBsb2FkZXJcblx0ICogQHJldHVybnMge3dwLm1lZGlhLnZpZXcuVXBsb2FkZXJTdGF0dXN9XG5cdCAqL1xuXHRkaXNwb3NlOiBmdW5jdGlvbigpIHtcblx0XHR3cC5VcGxvYWRlci5xdWV1ZS5vZmYoIG51bGwsIG51bGwsIHRoaXMgKTtcblx0XHQvKipcblx0XHQgKiBjYWxsICdkaXNwb3NlJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzXG5cdFx0ICovXG5cdFx0Vmlldy5wcm90b3R5cGUuZGlzcG9zZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0dmlzaWJpbGl0eTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy4kZWwudG9nZ2xlQ2xhc3MoICd1cGxvYWRpbmcnLCAhISB0aGlzLnF1ZXVlLmxlbmd0aCApO1xuXHRcdHRoaXMuJGVsLnRvZ2dsZUNsYXNzKCAnZXJyb3JzJywgISEgdGhpcy5lcnJvcnMubGVuZ3RoICk7XG5cdFx0dGhpcy4kZWwudG9nZ2xlKCAhISB0aGlzLnF1ZXVlLmxlbmd0aCB8fCAhISB0aGlzLmVycm9ycy5sZW5ndGggKTtcblx0fSxcblxuXHRyZWFkeTogZnVuY3Rpb24oKSB7XG5cdFx0Xy5lYWNoKHtcblx0XHRcdCckYmFyJzogICAgICAnLm1lZGlhLXByb2dyZXNzLWJhciBkaXYnLFxuXHRcdFx0JyRpbmRleCc6ICAgICcudXBsb2FkLWluZGV4Jyxcblx0XHRcdCckdG90YWwnOiAgICAnLnVwbG9hZC10b3RhbCcsXG5cdFx0XHQnJGZpbGVuYW1lJzogJy51cGxvYWQtZmlsZW5hbWUnXG5cdFx0fSwgZnVuY3Rpb24oIHNlbGVjdG9yLCBrZXkgKSB7XG5cdFx0XHR0aGlzWyBrZXkgXSA9IHRoaXMuJCggc2VsZWN0b3IgKTtcblx0XHR9LCB0aGlzICk7XG5cblx0XHR0aGlzLnZpc2liaWxpdHkoKTtcblx0XHR0aGlzLnByb2dyZXNzKCk7XG5cdFx0dGhpcy5pbmZvKCk7XG5cdH0sXG5cblx0cHJvZ3Jlc3M6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBxdWV1ZSA9IHRoaXMucXVldWUsXG5cdFx0XHQkYmFyID0gdGhpcy4kYmFyO1xuXG5cdFx0aWYgKCAhICRiYXIgfHwgISBxdWV1ZS5sZW5ndGggKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0JGJhci53aWR0aCggKCBxdWV1ZS5yZWR1Y2UoIGZ1bmN0aW9uKCBtZW1vLCBhdHRhY2htZW50ICkge1xuXHRcdFx0aWYgKCAhIGF0dGFjaG1lbnQuZ2V0KCd1cGxvYWRpbmcnKSApIHtcblx0XHRcdFx0cmV0dXJuIG1lbW8gKyAxMDA7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBwZXJjZW50ID0gYXR0YWNobWVudC5nZXQoJ3BlcmNlbnQnKTtcblx0XHRcdHJldHVybiBtZW1vICsgKCBfLmlzTnVtYmVyKCBwZXJjZW50ICkgPyBwZXJjZW50IDogMTAwICk7XG5cdFx0fSwgMCApIC8gcXVldWUubGVuZ3RoICkgKyAnJScgKTtcblx0fSxcblxuXHRpbmZvOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgcXVldWUgPSB0aGlzLnF1ZXVlLFxuXHRcdFx0aW5kZXggPSAwLCBhY3RpdmU7XG5cblx0XHRpZiAoICEgcXVldWUubGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGFjdGl2ZSA9IHRoaXMucXVldWUuZmluZCggZnVuY3Rpb24oIGF0dGFjaG1lbnQsIGkgKSB7XG5cdFx0XHRpbmRleCA9IGk7XG5cdFx0XHRyZXR1cm4gYXR0YWNobWVudC5nZXQoJ3VwbG9hZGluZycpO1xuXHRcdH0pO1xuXG5cdFx0dGhpcy4kaW5kZXgudGV4dCggaW5kZXggKyAxICk7XG5cdFx0dGhpcy4kdG90YWwudGV4dCggcXVldWUubGVuZ3RoICk7XG5cdFx0dGhpcy4kZmlsZW5hbWUuaHRtbCggYWN0aXZlID8gdGhpcy5maWxlbmFtZSggYWN0aXZlLmdldCgnZmlsZW5hbWUnKSApIDogJycgKTtcblx0fSxcblx0LyoqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBmaWxlbmFtZVxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfVxuXHQgKi9cblx0ZmlsZW5hbWU6IGZ1bmN0aW9uKCBmaWxlbmFtZSApIHtcblx0XHRyZXR1cm4gXy5lc2NhcGUoIGZpbGVuYW1lICk7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge0JhY2tib25lLk1vZGVsfSBlcnJvclxuXHQgKi9cblx0ZXJyb3I6IGZ1bmN0aW9uKCBlcnJvciApIHtcblx0XHR0aGlzLnZpZXdzLmFkZCggJy51cGxvYWQtZXJyb3JzJywgbmV3IHdwLm1lZGlhLnZpZXcuVXBsb2FkZXJTdGF0dXNFcnJvcih7XG5cdFx0XHRmaWxlbmFtZTogdGhpcy5maWxlbmFtZSggZXJyb3IuZ2V0KCdmaWxlJykubmFtZSApLFxuXHRcdFx0bWVzc2FnZTogIGVycm9yLmdldCgnbWVzc2FnZScpXG5cdFx0fSksIHsgYXQ6IDAgfSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEBnbG9iYWwgd3AuVXBsb2FkZXJcblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IGV2ZW50XG5cdCAqL1xuXHRkaXNtaXNzOiBmdW5jdGlvbiggZXZlbnQgKSB7XG5cdFx0dmFyIGVycm9ycyA9IHRoaXMudmlld3MuZ2V0KCcudXBsb2FkLWVycm9ycycpO1xuXG5cdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuXHRcdGlmICggZXJyb3JzICkge1xuXHRcdFx0Xy5pbnZva2UoIGVycm9ycywgJ3JlbW92ZScgKTtcblx0XHR9XG5cdFx0d3AuVXBsb2FkZXIuZXJyb3JzLnJlc2V0KCk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFVwbG9hZGVyU3RhdHVzO1xuIiwiLypnbG9iYWxzIHdwLCBfLCBqUXVlcnkgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS52aWV3LlVwbG9hZGVyV2luZG93XG4gKlxuICogQW4gdXBsb2FkZXIgd2luZG93IHRoYXQgYWxsb3dzIGZvciBkcmFnZ2luZyBhbmQgZHJvcHBpbmcgbWVkaWEuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEuVmlld1xuICogQGF1Z21lbnRzIHdwLkJhY2tib25lLlZpZXdcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5WaWV3XG4gKlxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zXSAgICAgICAgICAgICAgICAgICBPcHRpb25zIGhhc2ggcGFzc2VkIHRvIHRoZSB2aWV3LlxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLnVwbG9hZGVyXSAgICAgICAgICBVcGxvYWRlciBwcm9wZXJ0aWVzLlxuICogQHBhcmFtIHtqUXVlcnl9IFtvcHRpb25zLnVwbG9hZGVyLmJyb3dzZXJdXG4gKiBAcGFyYW0ge2pRdWVyeX0gW29wdGlvbnMudXBsb2FkZXIuZHJvcHpvbmVdIGpRdWVyeSBjb2xsZWN0aW9uIG9mIHRoZSBkcm9wem9uZS5cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9ucy51cGxvYWRlci5wYXJhbXNdXG4gKi9cbnZhciAkID0galF1ZXJ5LFxuXHRVcGxvYWRlcldpbmRvdztcblxuVXBsb2FkZXJXaW5kb3cgPSB3cC5tZWRpYS5WaWV3LmV4dGVuZCh7XG5cdHRhZ05hbWU6ICAgJ2RpdicsXG5cdGNsYXNzTmFtZTogJ3VwbG9hZGVyLXdpbmRvdycsXG5cdHRlbXBsYXRlOiAgd3AudGVtcGxhdGUoJ3VwbG9hZGVyLXdpbmRvdycpLFxuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciB1cGxvYWRlcjtcblxuXHRcdHRoaXMuJGJyb3dzZXIgPSAkKCc8YSBocmVmPVwiI1wiIGNsYXNzPVwiYnJvd3NlclwiIC8+JykuaGlkZSgpLmFwcGVuZFRvKCdib2R5Jyk7XG5cblx0XHR1cGxvYWRlciA9IHRoaXMub3B0aW9ucy51cGxvYWRlciA9IF8uZGVmYXVsdHMoIHRoaXMub3B0aW9ucy51cGxvYWRlciB8fCB7fSwge1xuXHRcdFx0ZHJvcHpvbmU6ICB0aGlzLiRlbCxcblx0XHRcdGJyb3dzZXI6ICAgdGhpcy4kYnJvd3Nlcixcblx0XHRcdHBhcmFtczogICAge31cblx0XHR9KTtcblxuXHRcdC8vIEVuc3VyZSB0aGUgZHJvcHpvbmUgaXMgYSBqUXVlcnkgY29sbGVjdGlvbi5cblx0XHRpZiAoIHVwbG9hZGVyLmRyb3B6b25lICYmICEgKHVwbG9hZGVyLmRyb3B6b25lIGluc3RhbmNlb2YgJCkgKSB7XG5cdFx0XHR1cGxvYWRlci5kcm9wem9uZSA9ICQoIHVwbG9hZGVyLmRyb3B6b25lICk7XG5cdFx0fVxuXG5cdFx0dGhpcy5jb250cm9sbGVyLm9uKCAnYWN0aXZhdGUnLCB0aGlzLnJlZnJlc2gsIHRoaXMgKTtcblxuXHRcdHRoaXMuY29udHJvbGxlci5vbiggJ2RldGFjaCcsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy4kYnJvd3Nlci5yZW1vdmUoKTtcblx0XHR9LCB0aGlzICk7XG5cdH0sXG5cblx0cmVmcmVzaDogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLnVwbG9hZGVyICkge1xuXHRcdFx0dGhpcy51cGxvYWRlci5yZWZyZXNoKCk7XG5cdFx0fVxuXHR9LFxuXG5cdHJlYWR5OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgcG9zdElkID0gd3AubWVkaWEudmlldy5zZXR0aW5ncy5wb3N0LmlkLFxuXHRcdFx0ZHJvcHpvbmU7XG5cblx0XHQvLyBJZiB0aGUgdXBsb2FkZXIgYWxyZWFkeSBleGlzdHMsIGJhaWwuXG5cdFx0aWYgKCB0aGlzLnVwbG9hZGVyICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggcG9zdElkICkge1xuXHRcdFx0dGhpcy5vcHRpb25zLnVwbG9hZGVyLnBhcmFtcy5wb3N0X2lkID0gcG9zdElkO1xuXHRcdH1cblx0XHR0aGlzLnVwbG9hZGVyID0gbmV3IHdwLlVwbG9hZGVyKCB0aGlzLm9wdGlvbnMudXBsb2FkZXIgKTtcblxuXHRcdGRyb3B6b25lID0gdGhpcy51cGxvYWRlci5kcm9wem9uZTtcblx0XHRkcm9wem9uZS5vbiggJ2Ryb3B6b25lOmVudGVyJywgXy5iaW5kKCB0aGlzLnNob3csIHRoaXMgKSApO1xuXHRcdGRyb3B6b25lLm9uKCAnZHJvcHpvbmU6bGVhdmUnLCBfLmJpbmQoIHRoaXMuaGlkZSwgdGhpcyApICk7XG5cblx0XHQkKCB0aGlzLnVwbG9hZGVyICkub24oICd1cGxvYWRlcjpyZWFkeScsIF8uYmluZCggdGhpcy5fcmVhZHksIHRoaXMgKSApO1xuXHR9LFxuXG5cdF9yZWFkeTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5jb250cm9sbGVyLnRyaWdnZXIoICd1cGxvYWRlcjpyZWFkeScgKTtcblx0fSxcblxuXHRzaG93OiBmdW5jdGlvbigpIHtcblx0XHR2YXIgJGVsID0gdGhpcy4kZWwuc2hvdygpO1xuXG5cdFx0Ly8gRW5zdXJlIHRoYXQgdGhlIGFuaW1hdGlvbiBpcyB0cmlnZ2VyZWQgYnkgd2FpdGluZyB1bnRpbFxuXHRcdC8vIHRoZSB0cmFuc3BhcmVudCBlbGVtZW50IGlzIHBhaW50ZWQgaW50byB0aGUgRE9NLlxuXHRcdF8uZGVmZXIoIGZ1bmN0aW9uKCkge1xuXHRcdFx0JGVsLmNzcyh7IG9wYWNpdHk6IDEgfSk7XG5cdFx0fSk7XG5cdH0sXG5cblx0aGlkZTogZnVuY3Rpb24oKSB7XG5cdFx0dmFyICRlbCA9IHRoaXMuJGVsLmNzcyh7IG9wYWNpdHk6IDAgfSk7XG5cblx0XHR3cC5tZWRpYS50cmFuc2l0aW9uKCAkZWwgKS5kb25lKCBmdW5jdGlvbigpIHtcblx0XHRcdC8vIFRyYW5zaXRpb24gZW5kIGV2ZW50cyBhcmUgc3ViamVjdCB0byByYWNlIGNvbmRpdGlvbnMuXG5cdFx0XHQvLyBNYWtlIHN1cmUgdGhhdCB0aGUgdmFsdWUgaXMgc2V0IGFzIGludGVuZGVkLlxuXHRcdFx0aWYgKCAnMCcgPT09ICRlbC5jc3MoJ29wYWNpdHknKSApIHtcblx0XHRcdFx0JGVsLmhpZGUoKTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdC8vIGh0dHBzOi8vY29yZS50cmFjLndvcmRwcmVzcy5vcmcvdGlja2V0LzI3MzQxXG5cdFx0Xy5kZWxheSggZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoICcwJyA9PT0gJGVsLmNzcygnb3BhY2l0eScpICYmICRlbC5pcygnOnZpc2libGUnKSApIHtcblx0XHRcdFx0JGVsLmhpZGUoKTtcblx0XHRcdH1cblx0XHR9LCA1MDAgKTtcblx0fVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVXBsb2FkZXJXaW5kb3c7XG4iLCIvKmdsb2JhbHMgd3AgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5WaWV3XG4gKlxuICogVGhlIGJhc2UgdmlldyBjbGFzcyBmb3IgbWVkaWEuXG4gKlxuICogVW5kZWxlZ2F0aW5nIGV2ZW50cywgcmVtb3ZpbmcgZXZlbnRzIGZyb20gdGhlIG1vZGVsLCBhbmRcbiAqIHJlbW92aW5nIGV2ZW50cyBmcm9tIHRoZSBjb250cm9sbGVyIG1pcnJvciB0aGUgY29kZSBmb3JcbiAqIGBCYWNrYm9uZS5WaWV3LmRpc3Bvc2VgIGluIEJhY2tib25lIDAuOS44IGRldmVsb3BtZW50LlxuICpcbiAqIFRoaXMgYmVoYXZpb3IgaGFzIHNpbmNlIGJlZW4gcmVtb3ZlZCwgYW5kIHNob3VsZCBub3QgYmUgdXNlZFxuICogb3V0c2lkZSBvZiB0aGUgbWVkaWEgbWFuYWdlci5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5CYWNrYm9uZS5WaWV3XG4gKiBAYXVnbWVudHMgQmFja2JvbmUuVmlld1xuICovXG52YXIgVmlldyA9IHdwLkJhY2tib25lLlZpZXcuZXh0ZW5kKHtcblx0Y29uc3RydWN0b3I6IGZ1bmN0aW9uKCBvcHRpb25zICkge1xuXHRcdGlmICggb3B0aW9ucyAmJiBvcHRpb25zLmNvbnRyb2xsZXIgKSB7XG5cdFx0XHR0aGlzLmNvbnRyb2xsZXIgPSBvcHRpb25zLmNvbnRyb2xsZXI7XG5cdFx0fVxuXHRcdHdwLkJhY2tib25lLlZpZXcuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXHR9LFxuXHQvKipcblx0ICogQHRvZG8gVGhlIGludGVybmFsIGNvbW1lbnQgbWVudGlvbnMgdGhpcyBtaWdodCBoYXZlIGJlZW4gYSBzdG9wLWdhcFxuXHQgKiAgICAgICBiZWZvcmUgQmFja2JvbmUgMC45LjggY2FtZSBvdXQuIEZpZ3VyZSBvdXQgaWYgQmFja2JvbmUgY29yZSB0YWtlc1xuXHQgKiAgICAgICBjYXJlIG9mIHRoaXMgaW4gQmFja2JvbmUuVmlldyBub3cuXG5cdCAqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5WaWV3fSBSZXR1cm5zIGl0c2VsZiB0byBhbGxvdyBjaGFpbmluZ1xuXHQgKi9cblx0ZGlzcG9zZTogZnVuY3Rpb24oKSB7XG5cdFx0Ly8gVW5kZWxlZ2F0aW5nIGV2ZW50cywgcmVtb3ZpbmcgZXZlbnRzIGZyb20gdGhlIG1vZGVsLCBhbmRcblx0XHQvLyByZW1vdmluZyBldmVudHMgZnJvbSB0aGUgY29udHJvbGxlciBtaXJyb3IgdGhlIGNvZGUgZm9yXG5cdFx0Ly8gYEJhY2tib25lLlZpZXcuZGlzcG9zZWAgaW4gQmFja2JvbmUgMC45LjggZGV2ZWxvcG1lbnQuXG5cdFx0dGhpcy51bmRlbGVnYXRlRXZlbnRzKCk7XG5cblx0XHRpZiAoIHRoaXMubW9kZWwgJiYgdGhpcy5tb2RlbC5vZmYgKSB7XG5cdFx0XHR0aGlzLm1vZGVsLm9mZiggbnVsbCwgbnVsbCwgdGhpcyApO1xuXHRcdH1cblxuXHRcdGlmICggdGhpcy5jb2xsZWN0aW9uICYmIHRoaXMuY29sbGVjdGlvbi5vZmYgKSB7XG5cdFx0XHR0aGlzLmNvbGxlY3Rpb24ub2ZmKCBudWxsLCBudWxsLCB0aGlzICk7XG5cdFx0fVxuXG5cdFx0Ly8gVW5iaW5kIGNvbnRyb2xsZXIgZXZlbnRzLlxuXHRcdGlmICggdGhpcy5jb250cm9sbGVyICYmIHRoaXMuY29udHJvbGxlci5vZmYgKSB7XG5cdFx0XHR0aGlzLmNvbnRyb2xsZXIub2ZmKCBudWxsLCBudWxsLCB0aGlzICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEuVmlld30gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHJlbW92ZTogZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5kaXNwb3NlKCk7XG5cdFx0LyoqXG5cdFx0ICogY2FsbCAncmVtb3ZlJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzXG5cdFx0ICovXG5cdFx0cmV0dXJuIHdwLkJhY2tib25lLlZpZXcucHJvdG90eXBlLnJlbW92ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFZpZXc7XG4iXX0=
