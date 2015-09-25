(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/models.manifest.js":[function(require,module,exports){
var $ = jQuery,
	Attachment, Attachments, l10n, media;

window.wp = window.wp || {};

/**
 * Create and return a media frame.
 *
 * Handles the default media experience.
 *
 * @param  {object} attributes The properties passed to the main media controller.
 * @return {wp.media.view.MediaFrame} A media workflow.
 */
media = wp.media = function( attributes ) {
	var MediaFrame = media.view.MediaFrame,
		frame;

	if ( ! MediaFrame ) {
		return;
	}

	attributes = _.defaults( attributes || {}, {
		frame: 'select'
	});

	if ( 'select' === attributes.frame && MediaFrame.Select ) {
		frame = new MediaFrame.Select( attributes );
	} else if ( 'post' === attributes.frame && MediaFrame.Post ) {
		frame = new MediaFrame.Post( attributes );
	} else if ( 'manage' === attributes.frame && MediaFrame.Manage ) {
		frame = new MediaFrame.Manage( attributes );
	} else if ( 'image' === attributes.frame && MediaFrame.ImageDetails ) {
		frame = new MediaFrame.ImageDetails( attributes );
	} else if ( 'audio' === attributes.frame && MediaFrame.AudioDetails ) {
		frame = new MediaFrame.AudioDetails( attributes );
	} else if ( 'video' === attributes.frame && MediaFrame.VideoDetails ) {
		frame = new MediaFrame.VideoDetails( attributes );
	} else if ( 'edit-attachments' === attributes.frame && MediaFrame.EditAttachments ) {
		frame = new MediaFrame.EditAttachments( attributes );
	}

	delete attributes.frame;

	media.frame = frame;

	return frame;
};

_.extend( media, { model: {}, view: {}, controller: {}, frames: {} });

// Link any localized strings.
l10n = media.model.l10n = window._wpMediaModelsL10n || {};

// Link any settings.
media.model.settings = l10n.settings || {};
delete l10n.settings;

Attachment = media.model.Attachment = require( './models/attachment.js' );
Attachments = media.model.Attachments = require( './models/attachments.js' );

media.model.Query = require( './models/query.js' );
media.model.PostImage = require( './models/post-image.js' );
media.model.Selection = require( './models/selection.js' );

/**
 * ========================================================================
 * UTILITIES
 * ========================================================================
 */

/**
 * A basic equality comparator for Backbone models.
 *
 * Used to order models within a collection - @see wp.media.model.Attachments.comparator().
 *
 * @param  {mixed}  a  The primary parameter to compare.
 * @param  {mixed}  b  The primary parameter to compare.
 * @param  {string} ac The fallback parameter to compare, a's cid.
 * @param  {string} bc The fallback parameter to compare, b's cid.
 * @return {number}    -1: a should come before b.
 *                      0: a and b are of the same rank.
 *                      1: b should come before a.
 */
media.compare = function( a, b, ac, bc ) {
	if ( _.isEqual( a, b ) ) {
		return ac === bc ? 0 : (ac > bc ? -1 : 1);
	} else {
		return a > b ? -1 : 1;
	}
};

_.extend( media, {
	/**
	 * media.template( id )
	 *
	 * Fetch a JavaScript template for an id, and return a templating function for it.
	 *
	 * See wp.template() in `wp-includes/js/wp-util.js`.
	 *
	 * @borrows wp.template as template
	 */
	template: wp.template,

	/**
	 * media.post( [action], [data] )
	 *
	 * Sends a POST request to WordPress.
	 * See wp.ajax.post() in `wp-includes/js/wp-util.js`.
	 *
	 * @borrows wp.ajax.post as post
	 */
	post: wp.ajax.post,

	/**
	 * media.ajax( [action], [options] )
	 *
	 * Sends an XHR request to WordPress.
	 * See wp.ajax.send() in `wp-includes/js/wp-util.js`.
	 *
	 * @borrows wp.ajax.send as ajax
	 */
	ajax: wp.ajax.send,

	/**
	 * Scales a set of dimensions to fit within bounding dimensions.
	 *
	 * @param {Object} dimensions
	 * @returns {Object}
	 */
	fit: function( dimensions ) {
		var width     = dimensions.width,
			height    = dimensions.height,
			maxWidth  = dimensions.maxWidth,
			maxHeight = dimensions.maxHeight,
			constraint;

		// Compare ratios between the two values to determine which
		// max to constrain by. If a max value doesn't exist, then the
		// opposite side is the constraint.
		if ( ! _.isUndefined( maxWidth ) && ! _.isUndefined( maxHeight ) ) {
			constraint = ( width / height > maxWidth / maxHeight ) ? 'width' : 'height';
		} else if ( _.isUndefined( maxHeight ) ) {
			constraint = 'width';
		} else if (  _.isUndefined( maxWidth ) && height > maxHeight ) {
			constraint = 'height';
		}

		// If the value of the constrained side is larger than the max,
		// then scale the values. Otherwise return the originals; they fit.
		if ( 'width' === constraint && width > maxWidth ) {
			return {
				width : maxWidth,
				height: Math.round( maxWidth * height / width )
			};
		} else if ( 'height' === constraint && height > maxHeight ) {
			return {
				width : Math.round( maxHeight * width / height ),
				height: maxHeight
			};
		} else {
			return {
				width : width,
				height: height
			};
		}
	},
	/**
	 * Truncates a string by injecting an ellipsis into the middle.
	 * Useful for filenames.
	 *
	 * @param {String} string
	 * @param {Number} [length=30]
	 * @param {String} [replacement=&hellip;]
	 * @returns {String} The string, unless length is greater than string.length.
	 */
	truncate: function( string, length, replacement ) {
		length = length || 30;
		replacement = replacement || '&hellip;';

		if ( string.length <= length ) {
			return string;
		}

		return string.substr( 0, length / 2 ) + replacement + string.substr( -1 * length / 2 );
	}
});

/**
 * ========================================================================
 * MODELS
 * ========================================================================
 */
/**
 * wp.media.attachment
 *
 * @static
 * @param {String} id A string used to identify a model.
 * @returns {wp.media.model.Attachment}
 */
media.attachment = function( id ) {
	return Attachment.get( id );
};

/**
 * A collection of all attachments that have been fetched from the server.
 *
 * @static
 * @member {wp.media.model.Attachments}
 */
Attachments.all = new Attachments();

/**
 * wp.media.query
 *
 * Shorthand for creating a new Attachments Query.
 *
 * @param {object} [props]
 * @returns {wp.media.model.Attachments}
 */
media.query = function( props ) {
	return new Attachments( null, {
		props: _.extend( _.defaults( props || {}, { orderby: 'date' } ), { query: true } )
	});
};

// Clean up. Prevents mobile browsers caching
$(window).on('unload', function(){
	window.wp = null;
});

},{"./models/attachment.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/models/attachment.js","./models/attachments.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/models/attachments.js","./models/post-image.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/models/post-image.js","./models/query.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/models/query.js","./models/selection.js":"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/models/selection.js"}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/models/attachment.js":[function(require,module,exports){
/**
 * wp.media.model.Attachment
 *
 * @class
 * @augments Backbone.Model
 */
var $ = Backbone.$,
	Attachment;

Attachment = Backbone.Model.extend({
	/**
	 * Triggered when attachment details change
	 * Overrides Backbone.Model.sync
	 *
	 * @param {string} method
	 * @param {wp.media.model.Attachment} model
	 * @param {Object} [options={}]
	 *
	 * @returns {Promise}
	 */
	sync: function( method, model, options ) {
		// If the attachment does not yet have an `id`, return an instantly
		// rejected promise. Otherwise, all of our requests will fail.
		if ( _.isUndefined( this.id ) ) {
			return $.Deferred().rejectWith( this ).promise();
		}

		// Overload the `read` request so Attachment.fetch() functions correctly.
		if ( 'read' === method ) {
			options = options || {};
			options.context = this;
			options.data = _.extend( options.data || {}, {
				action: 'get-attachment',
				id: this.id
			});
			return wp.media.ajax( options );

		// Overload the `update` request so properties can be saved.
		} else if ( 'update' === method ) {
			// If we do not have the necessary nonce, fail immeditately.
			if ( ! this.get('nonces') || ! this.get('nonces').update ) {
				return $.Deferred().rejectWith( this ).promise();
			}

			options = options || {};
			options.context = this;

			// Set the action and ID.
			options.data = _.extend( options.data || {}, {
				action:  'save-attachment',
				id:      this.id,
				nonce:   this.get('nonces').update,
				post_id: wp.media.model.settings.post.id
			});

			// Record the values of the changed attributes.
			if ( model.hasChanged() ) {
				options.data.changes = {};

				_.each( model.changed, function( value, key ) {
					options.data.changes[ key ] = this.get( key );
				}, this );
			}

			return wp.media.ajax( options );

		// Overload the `delete` request so attachments can be removed.
		// This will permanently delete an attachment.
		} else if ( 'delete' === method ) {
			options = options || {};

			if ( ! options.wait ) {
				this.destroyed = true;
			}

			options.context = this;
			options.data = _.extend( options.data || {}, {
				action:   'delete-post',
				id:       this.id,
				_wpnonce: this.get('nonces')['delete']
			});

			return wp.media.ajax( options ).done( function() {
				this.destroyed = true;
			}).fail( function() {
				this.destroyed = false;
			});

		// Otherwise, fall back to `Backbone.sync()`.
		} else {
			/**
			 * Call `sync` directly on Backbone.Model
			 */
			return Backbone.Model.prototype.sync.apply( this, arguments );
		}
	},
	/**
	 * Convert date strings into Date objects.
	 *
	 * @param {Object} resp The raw response object, typically returned by fetch()
	 * @returns {Object} The modified response object, which is the attributes hash
	 *    to be set on the model.
	 */
	parse: function( resp ) {
		if ( ! resp ) {
			return resp;
		}

		resp.date = new Date( resp.date );
		resp.modified = new Date( resp.modified );
		return resp;
	},
	/**
	 * @param {Object} data The properties to be saved.
	 * @param {Object} options Sync options. e.g. patch, wait, success, error.
	 *
	 * @this Backbone.Model
	 *
	 * @returns {Promise}
	 */
	saveCompat: function( data, options ) {
		var model = this;

		// If we do not have the necessary nonce, fail immeditately.
		if ( ! this.get('nonces') || ! this.get('nonces').update ) {
			return $.Deferred().rejectWith( this ).promise();
		}

		return wp.media.post( 'save-attachment-compat', _.defaults({
			id:      this.id,
			nonce:   this.get('nonces').update,
			post_id: wp.media.model.settings.post.id
		}, data ) ).done( function( resp, status, xhr ) {
			model.set( model.parse( resp, xhr ), options );
		});
	}
}, {
	/**
	 * Create a new model on the static 'all' attachments collection and return it.
	 *
	 * @static
	 * @param {Object} attrs
	 * @returns {wp.media.model.Attachment}
	 */
	create: function( attrs ) {
		var Attachments = wp.media.model.Attachments;
		return Attachments.all.push( attrs );
	},
	/**
	 * Create a new model on the static 'all' attachments collection and return it.
	 *
	 * If this function has already been called for the id,
	 * it returns the specified attachment.
	 *
	 * @static
	 * @param {string} id A string used to identify a model.
	 * @param {Backbone.Model|undefined} attachment
	 * @returns {wp.media.model.Attachment}
	 */
	get: _.memoize( function( id, attachment ) {
		var Attachments = wp.media.model.Attachments;
		return Attachments.all.push( attachment || { id: id } );
	})
});

module.exports = Attachment;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/models/attachments.js":[function(require,module,exports){
/**
 * wp.media.model.Attachments
 *
 * A collection of attachments.
 *
 * This collection has no persistence with the server without supplying
 * 'options.props.query = true', which will mirror the collection
 * to an Attachments Query collection - @see wp.media.model.Attachments.mirror().
 *
 * @class
 * @augments Backbone.Collection
 *
 * @param {array}  [models]                Models to initialize with the collection.
 * @param {object} [options]               Options hash for the collection.
 * @param {string} [options.props]         Options hash for the initial query properties.
 * @param {string} [options.props.order]   Initial order (ASC or DESC) for the collection.
 * @param {string} [options.props.orderby] Initial attribute key to order the collection by.
 * @param {string} [options.props.query]   Whether the collection is linked to an attachments query.
 * @param {string} [options.observe]
 * @param {string} [options.filters]
 *
 */
var Attachments = Backbone.Collection.extend({
	/**
	 * @type {wp.media.model.Attachment}
	 */
	model: wp.media.model.Attachment,
	/**
	 * @param {Array} [models=[]] Array of models used to populate the collection.
	 * @param {Object} [options={}]
	 */
	initialize: function( models, options ) {
		options = options || {};

		this.props   = new Backbone.Model();
		this.filters = options.filters || {};

		// Bind default `change` events to the `props` model.
		this.props.on( 'change', this._changeFilteredProps, this );

		this.props.on( 'change:order',   this._changeOrder,   this );
		this.props.on( 'change:orderby', this._changeOrderby, this );
		this.props.on( 'change:query',   this._changeQuery,   this );

		this.props.set( _.defaults( options.props || {} ) );

		if ( options.observe ) {
			this.observe( options.observe );
		}
	},
	/**
	 * Sort the collection when the order attribute changes.
	 *
	 * @access private
	 */
	_changeOrder: function() {
		if ( this.comparator ) {
			this.sort();
		}
	},
	/**
	 * Set the default comparator only when the `orderby` property is set.
	 *
	 * @access private
	 *
	 * @param {Backbone.Model} model
	 * @param {string} orderby
	 */
	_changeOrderby: function( model, orderby ) {
		// If a different comparator is defined, bail.
		if ( this.comparator && this.comparator !== Attachments.comparator ) {
			return;
		}

		if ( orderby && 'post__in' !== orderby ) {
			this.comparator = Attachments.comparator;
		} else {
			delete this.comparator;
		}
	},
	/**
	 * If the `query` property is set to true, query the server using
	 * the `props` values, and sync the results to this collection.
	 *
	 * @access private
	 *
	 * @param {Backbone.Model} model
	 * @param {Boolean} query
	 */
	_changeQuery: function( model, query ) {
		if ( query ) {
			this.props.on( 'change', this._requery, this );
			this._requery();
		} else {
			this.props.off( 'change', this._requery, this );
		}
	},
	/**
	 * @access private
	 *
	 * @param {Backbone.Model} model
	 */
	_changeFilteredProps: function( model ) {
		// If this is a query, updating the collection will be handled by
		// `this._requery()`.
		if ( this.props.get('query') ) {
			return;
		}

		var changed = _.chain( model.changed ).map( function( t, prop ) {
			var filter = Attachments.filters[ prop ],
				term = model.get( prop );

			if ( ! filter ) {
				return;
			}

			if ( term && ! this.filters[ prop ] ) {
				this.filters[ prop ] = filter;
			} else if ( ! term && this.filters[ prop ] === filter ) {
				delete this.filters[ prop ];
			} else {
				return;
			}

			// Record the change.
			return true;
		}, this ).any().value();

		if ( ! changed ) {
			return;
		}

		// If no `Attachments` model is provided to source the searches
		// from, then automatically generate a source from the existing
		// models.
		if ( ! this._source ) {
			this._source = new Attachments( this.models );
		}

		this.reset( this._source.filter( this.validator, this ) );
	},

	validateDestroyed: false,
	/**
	 * Checks whether an attachment is valid.
	 *
	 * @param {wp.media.model.Attachment} attachment
	 * @returns {Boolean}
	 */
	validator: function( attachment ) {
		if ( ! this.validateDestroyed && attachment.destroyed ) {
			return false;
		}
		return _.all( this.filters, function( filter ) {
			return !! filter.call( this, attachment );
		}, this );
	},
	/**
	 * Add or remove an attachment to the collection depending on its validity.
	 *
	 * @param {wp.media.model.Attachment} attachment
	 * @param {Object} options
	 * @returns {wp.media.model.Attachments} Returns itself to allow chaining
	 */
	validate: function( attachment, options ) {
		var valid = this.validator( attachment ),
			hasAttachment = !! this.get( attachment.cid );

		if ( ! valid && hasAttachment ) {
			this.remove( attachment, options );
		} else if ( valid && ! hasAttachment ) {
			this.add( attachment, options );
		}

		return this;
	},

	/**
	 * Add or remove all attachments from another collection depending on each one's validity.
	 *
	 * @param {wp.media.model.Attachments} attachments
	 * @param {object} [options={}]
	 *
	 * @fires wp.media.model.Attachments#reset
	 *
	 * @returns {wp.media.model.Attachments} Returns itself to allow chaining
	 */
	validateAll: function( attachments, options ) {
		options = options || {};

		_.each( attachments.models, function( attachment ) {
			this.validate( attachment, { silent: true });
		}, this );

		if ( ! options.silent ) {
			this.trigger( 'reset', this, options );
		}
		return this;
	},
	/**
	 * Start observing another attachments collection change events
	 * and replicate them on this collection.
	 *
	 * @param {wp.media.model.Attachments} The attachments collection to observe.
	 * @returns {wp.media.model.Attachments} Returns itself to allow chaining.
	 */
	observe: function( attachments ) {
		this.observers = this.observers || [];
		this.observers.push( attachments );

		attachments.on( 'add change remove', this._validateHandler, this );
		attachments.on( 'reset', this._validateAllHandler, this );
		this.validateAll( attachments );
		return this;
	},
	/**
	 * Stop replicating collection change events from another attachments collection.
	 *
	 * @param {wp.media.model.Attachments} The attachments collection to stop observing.
	 * @returns {wp.media.model.Attachments} Returns itself to allow chaining
	 */
	unobserve: function( attachments ) {
		if ( attachments ) {
			attachments.off( null, null, this );
			this.observers = _.without( this.observers, attachments );

		} else {
			_.each( this.observers, function( attachments ) {
				attachments.off( null, null, this );
			}, this );
			delete this.observers;
		}

		return this;
	},
	/**
	 * @access private
	 *
	 * @param {wp.media.model.Attachments} attachment
	 * @param {wp.media.model.Attachments} attachments
	 * @param {Object} options
	 *
	 * @returns {wp.media.model.Attachments} Returns itself to allow chaining
	 */
	_validateHandler: function( attachment, attachments, options ) {
		// If we're not mirroring this `attachments` collection,
		// only retain the `silent` option.
		options = attachments === this.mirroring ? options : {
			silent: options && options.silent
		};

		return this.validate( attachment, options );
	},
	/**
	 * @access private
	 *
	 * @param {wp.media.model.Attachments} attachments
	 * @param {Object} options
	 * @returns {wp.media.model.Attachments} Returns itself to allow chaining
	 */
	_validateAllHandler: function( attachments, options ) {
		return this.validateAll( attachments, options );
	},
	/**
	 * Start mirroring another attachments collection, clearing out any models already
	 * in the collection.
	 *
	 * @param {wp.media.model.Attachments} The attachments collection to mirror.
	 * @returns {wp.media.model.Attachments} Returns itself to allow chaining
	 */
	mirror: function( attachments ) {
		if ( this.mirroring && this.mirroring === attachments ) {
			return this;
		}

		this.unmirror();
		this.mirroring = attachments;

		// Clear the collection silently. A `reset` event will be fired
		// when `observe()` calls `validateAll()`.
		this.reset( [], { silent: true } );
		this.observe( attachments );

		return this;
	},
	/**
	 * Stop mirroring another attachments collection.
	 */
	unmirror: function() {
		if ( ! this.mirroring ) {
			return;
		}

		this.unobserve( this.mirroring );
		delete this.mirroring;
	},
	/**
	 * Retrive more attachments from the server for the collection.
	 *
	 * Only works if the collection is mirroring a Query Attachments collection,
	 * and forwards to its `more` method. This collection class doesn't have
	 * server persistence by itself.
	 *
	 * @param {object} options
	 * @returns {Promise}
	 */
	more: function( options ) {
		var deferred = jQuery.Deferred(),
			mirroring = this.mirroring,
			attachments = this;

		if ( ! mirroring || ! mirroring.more ) {
			return deferred.resolveWith( this ).promise();
		}
		// If we're mirroring another collection, forward `more` to
		// the mirrored collection. Account for a race condition by
		// checking if we're still mirroring that collection when
		// the request resolves.
		mirroring.more( options ).done( function() {
			if ( this === attachments.mirroring ) {
				deferred.resolveWith( this );
			}
		});

		return deferred.promise();
	},
	/**
	 * Whether there are more attachments that haven't been sync'd from the server
	 * that match the collection's query.
	 *
	 * Only works if the collection is mirroring a Query Attachments collection,
	 * and forwards to its `hasMore` method. This collection class doesn't have
	 * server persistence by itself.
	 *
	 * @returns {boolean}
	 */
	hasMore: function() {
		return this.mirroring ? this.mirroring.hasMore() : false;
	},
	/**
	 * A custom AJAX-response parser.
	 *
	 * See trac ticket #24753
	 *
	 * @param {Object|Array} resp The raw response Object/Array.
	 * @param {Object} xhr
	 * @returns {Array} The array of model attributes to be added to the collection
	 */
	parse: function( resp, xhr ) {
		if ( ! _.isArray( resp ) ) {
			resp = [resp];
		}

		return _.map( resp, function( attrs ) {
			var id, attachment, newAttributes;

			if ( attrs instanceof Backbone.Model ) {
				id = attrs.get( 'id' );
				attrs = attrs.attributes;
			} else {
				id = attrs.id;
			}

			attachment = wp.media.model.Attachment.get( id );
			newAttributes = attachment.parse( attrs, xhr );

			if ( ! _.isEqual( attachment.attributes, newAttributes ) ) {
				attachment.set( newAttributes );
			}

			return attachment;
		});
	},
	/**
	 * If the collection is a query, create and mirror an Attachments Query collection.
	 *
	 * @access private
	 */
	_requery: function( refresh ) {
		var props;
		if ( this.props.get('query') ) {
			props = this.props.toJSON();
			props.cache = ( true !== refresh );
			this.mirror( wp.media.model.Query.get( props ) );
		}
	},
	/**
	 * If this collection is sorted by `menuOrder`, recalculates and saves
	 * the menu order to the database.
	 *
	 * @returns {undefined|Promise}
	 */
	saveMenuOrder: function() {
		if ( 'menuOrder' !== this.props.get('orderby') ) {
			return;
		}

		// Removes any uploading attachments, updates each attachment's
		// menu order, and returns an object with an { id: menuOrder }
		// mapping to pass to the request.
		var attachments = this.chain().filter( function( attachment ) {
			return ! _.isUndefined( attachment.id );
		}).map( function( attachment, index ) {
			// Indices start at 1.
			index = index + 1;
			attachment.set( 'menuOrder', index );
			return [ attachment.id, index ];
		}).object().value();

		if ( _.isEmpty( attachments ) ) {
			return;
		}

		return wp.media.post( 'save-attachment-order', {
			nonce:       wp.media.model.settings.post.nonce,
			post_id:     wp.media.model.settings.post.id,
			attachments: attachments
		});
	}
}, {
	/**
	 * A function to compare two attachment models in an attachments collection.
	 *
	 * Used as the default comparator for instances of wp.media.model.Attachments
	 * and its subclasses. @see wp.media.model.Attachments._changeOrderby().
	 *
	 * @static
	 *
	 * @param {Backbone.Model} a
	 * @param {Backbone.Model} b
	 * @param {Object} options
	 * @returns {Number} -1 if the first model should come before the second,
	 *    0 if they are of the same rank and
	 *    1 if the first model should come after.
	 */
	comparator: function( a, b, options ) {
		var key   = this.props.get('orderby'),
			order = this.props.get('order') || 'DESC',
			ac    = a.cid,
			bc    = b.cid;

		a = a.get( key );
		b = b.get( key );

		if ( 'date' === key || 'modified' === key ) {
			a = a || new Date();
			b = b || new Date();
		}

		// If `options.ties` is set, don't enforce the `cid` tiebreaker.
		if ( options && options.ties ) {
			ac = bc = null;
		}

		return ( 'DESC' === order ) ? wp.media.compare( a, b, ac, bc ) : wp.media.compare( b, a, bc, ac );
	},
	/**
	 * @namespace
	 */
	filters: {
		/**
		 * @static
		 * Note that this client-side searching is *not* equivalent
		 * to our server-side searching.
		 *
		 * @param {wp.media.model.Attachment} attachment
		 *
		 * @this wp.media.model.Attachments
		 *
		 * @returns {Boolean}
		 */
		search: function( attachment ) {
			if ( ! this.props.get('search') ) {
				return true;
			}

			return _.any(['title','filename','description','caption','name'], function( key ) {
				var value = attachment.get( key );
				return value && -1 !== value.search( this.props.get('search') );
			}, this );
		},
		/**
		 * @static
		 * @param {wp.media.model.Attachment} attachment
		 *
		 * @this wp.media.model.Attachments
		 *
		 * @returns {Boolean}
		 */
		type: function( attachment ) {
			var type = this.props.get('type'), atts = attachment.toJSON(), mime, found;

			if ( ! type || ( _.isArray( type ) && ! type.length ) ) {
				return true;
			}

			mime = atts.mime || ( atts.file && atts.file.type ) || '';

			if ( _.isArray( type ) ) {
				found = _.find( type, function (t) {
					return -1 !== mime.indexOf( t );
				} );
			} else {
				found = -1 !== mime.indexOf( type );
			}

			return found;
		},
		/**
		 * @static
		 * @param {wp.media.model.Attachment} attachment
		 *
		 * @this wp.media.model.Attachments
		 *
		 * @returns {Boolean}
		 */
		uploadedTo: function( attachment ) {
			var uploadedTo = this.props.get('uploadedTo');
			if ( _.isUndefined( uploadedTo ) ) {
				return true;
			}

			return uploadedTo === attachment.get('uploadedTo');
		},
		/**
		 * @static
		 * @param {wp.media.model.Attachment} attachment
		 *
		 * @this wp.media.model.Attachments
		 *
		 * @returns {Boolean}
		 */
		status: function( attachment ) {
			var status = this.props.get('status');
			if ( _.isUndefined( status ) ) {
				return true;
			}

			return status === attachment.get('status');
		}
	}
});

module.exports = Attachments;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/models/post-image.js":[function(require,module,exports){
/**
 * wp.media.model.PostImage
 *
 * An instance of an image that's been embedded into a post.
 *
 * Used in the embedded image attachment display settings modal - @see wp.media.view.MediaFrame.ImageDetails.
 *
 * @class
 * @augments Backbone.Model
 *
 * @param {int} [attributes]               Initial model attributes.
 * @param {int} [attributes.attachment_id] ID of the attachment.
 **/
var PostImage = Backbone.Model.extend({

	initialize: function( attributes ) {
		var Attachment = wp.media.model.Attachment;
		this.attachment = false;

		if ( attributes.attachment_id ) {
			this.attachment = Attachment.get( attributes.attachment_id );
			if ( this.attachment.get( 'url' ) ) {
				this.dfd = jQuery.Deferred();
				this.dfd.resolve();
			} else {
				this.dfd = this.attachment.fetch();
			}
			this.bindAttachmentListeners();
		}

		// keep url in sync with changes to the type of link
		this.on( 'change:link', this.updateLinkUrl, this );
		this.on( 'change:size', this.updateSize, this );

		this.setLinkTypeFromUrl();
		this.setAspectRatio();

		this.set( 'originalUrl', attributes.url );
	},

	bindAttachmentListeners: function() {
		this.listenTo( this.attachment, 'sync', this.setLinkTypeFromUrl );
		this.listenTo( this.attachment, 'sync', this.setAspectRatio );
		this.listenTo( this.attachment, 'change', this.updateSize );
	},

	changeAttachment: function( attachment, props ) {
		this.stopListening( this.attachment );
		this.attachment = attachment;
		this.bindAttachmentListeners();

		this.set( 'attachment_id', this.attachment.get( 'id' ) );
		this.set( 'caption', this.attachment.get( 'caption' ) );
		this.set( 'alt', this.attachment.get( 'alt' ) );
		this.set( 'size', props.get( 'size' ) );
		this.set( 'align', props.get( 'align' ) );
		this.set( 'link', props.get( 'link' ) );
		this.updateLinkUrl();
		this.updateSize();
	},

	setLinkTypeFromUrl: function() {
		var linkUrl = this.get( 'linkUrl' ),
			type;

		if ( ! linkUrl ) {
			this.set( 'link', 'none' );
			return;
		}

		// default to custom if there is a linkUrl
		type = 'custom';

		if ( this.attachment ) {
			if ( this.attachment.get( 'url' ) === linkUrl ) {
				type = 'file';
			} else if ( this.attachment.get( 'link' ) === linkUrl ) {
				type = 'post';
			}
		} else {
			if ( this.get( 'url' ) === linkUrl ) {
				type = 'file';
			}
		}

		this.set( 'link', type );
	},

	updateLinkUrl: function() {
		var link = this.get( 'link' ),
			url;

		switch( link ) {
			case 'file':
				if ( this.attachment ) {
					url = this.attachment.get( 'url' );
				} else {
					url = this.get( 'url' );
				}
				this.set( 'linkUrl', url );
				break;
			case 'post':
				this.set( 'linkUrl', this.attachment.get( 'link' ) );
				break;
			case 'none':
				this.set( 'linkUrl', '' );
				break;
		}
	},

	updateSize: function() {
		var size;

		if ( ! this.attachment ) {
			return;
		}

		if ( this.get( 'size' ) === 'custom' ) {
			this.set( 'width', this.get( 'customWidth' ) );
			this.set( 'height', this.get( 'customHeight' ) );
			this.set( 'url', this.get( 'originalUrl' ) );
			return;
		}

		size = this.attachment.get( 'sizes' )[ this.get( 'size' ) ];

		if ( ! size ) {
			return;
		}

		this.set( 'url', size.url );
		this.set( 'width', size.width );
		this.set( 'height', size.height );
	},

	setAspectRatio: function() {
		var full;

		if ( this.attachment && this.attachment.get( 'sizes' ) ) {
			full = this.attachment.get( 'sizes' ).full;

			if ( full ) {
				this.set( 'aspectRatio', full.width / full.height );
				return;
			}
		}

		this.set( 'aspectRatio', this.get( 'customWidth' ) / this.get( 'customHeight' ) );
	}
});

module.exports = PostImage;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/models/query.js":[function(require,module,exports){
/**
 * wp.media.model.Query
 *
 * A collection of attachments that match the supplied query arguments.
 *
 * Note: Do NOT change this.args after the query has been initialized.
 *       Things will break.
 *
 * @class
 * @augments wp.media.model.Attachments
 * @augments Backbone.Collection
 *
 * @param {array}  [models]                      Models to initialize with the collection.
 * @param {object} [options]                     Options hash.
 * @param {object} [options.args]                Attachments query arguments.
 * @param {object} [options.args.posts_per_page]
 */
var Attachments = wp.media.model.Attachments,
	Query;

Query = Attachments.extend({
	/**
	 * @global wp.Uploader
	 *
	 * @param {array}  [models=[]]  Array of initial models to populate the collection.
	 * @param {object} [options={}]
	 */
	initialize: function( models, options ) {
		var allowed;

		options = options || {};
		Attachments.prototype.initialize.apply( this, arguments );

		this.args     = options.args;
		this._hasMore = true;
		this.created  = new Date();

		this.filters.order = function( attachment ) {
			var orderby = this.props.get('orderby'),
				order = this.props.get('order');

			if ( ! this.comparator ) {
				return true;
			}

			// We want any items that can be placed before the last
			// item in the set. If we add any items after the last
			// item, then we can't guarantee the set is complete.
			if ( this.length ) {
				return 1 !== this.comparator( attachment, this.last(), { ties: true });

			// Handle the case where there are no items yet and
			// we're sorting for recent items. In that case, we want
			// changes that occurred after we created the query.
			} else if ( 'DESC' === order && ( 'date' === orderby || 'modified' === orderby ) ) {
				return attachment.get( orderby ) >= this.created;

			// If we're sorting by menu order and we have no items,
			// accept any items that have the default menu order (0).
			} else if ( 'ASC' === order && 'menuOrder' === orderby ) {
				return attachment.get( orderby ) === 0;
			}

			// Otherwise, we don't want any items yet.
			return false;
		};

		// Observe the central `wp.Uploader.queue` collection to watch for
		// new matches for the query.
		//
		// Only observe when a limited number of query args are set. There
		// are no filters for other properties, so observing will result in
		// false positives in those queries.
		allowed = [ 's', 'order', 'orderby', 'posts_per_page', 'post_mime_type', 'post_parent' ];
		if ( wp.Uploader && _( this.args ).chain().keys().difference( allowed ).isEmpty().value() ) {
			this.observe( wp.Uploader.queue );
		}
	},
	/**
	 * Whether there are more attachments that haven't been sync'd from the server
	 * that match the collection's query.
	 *
	 * @returns {boolean}
	 */
	hasMore: function() {
		return this._hasMore;
	},
	/**
	 * Fetch more attachments from the server for the collection.
	 *
	 * @param   {object}  [options={}]
	 * @returns {Promise}
	 */
	more: function( options ) {
		var query = this;

		// If there is already a request pending, return early with the Deferred object.
		if ( this._more && 'pending' === this._more.state() ) {
			return this._more;
		}

		if ( ! this.hasMore() ) {
			return jQuery.Deferred().resolveWith( this ).promise();
		}

		options = options || {};
		options.remove = false;

		return this._more = this.fetch( options ).done( function( resp ) {
			if ( _.isEmpty( resp ) || -1 === this.args.posts_per_page || resp.length < this.args.posts_per_page ) {
				query._hasMore = false;
			}
		});
	},
	/**
	 * Overrides Backbone.Collection.sync
	 * Overrides wp.media.model.Attachments.sync
	 *
	 * @param {String} method
	 * @param {Backbone.Model} model
	 * @param {Object} [options={}]
	 * @returns {Promise}
	 */
	sync: function( method, model, options ) {
		var args, fallback;

		// Overload the read method so Attachment.fetch() functions correctly.
		if ( 'read' === method ) {
			options = options || {};
			options.context = this;
			options.data = _.extend( options.data || {}, {
				action:  'query-attachments',
				post_id: wp.media.model.settings.post.id
			});

			// Clone the args so manipulation is non-destructive.
			args = _.clone( this.args );

			// Determine which page to query.
			if ( -1 !== args.posts_per_page ) {
				args.paged = Math.round( this.length / args.posts_per_page ) + 1;
			}

			options.data.query = args;
			return wp.media.ajax( options );

		// Otherwise, fall back to Backbone.sync()
		} else {
			/**
			 * Call wp.media.model.Attachments.sync or Backbone.sync
			 */
			fallback = Attachments.prototype.sync ? Attachments.prototype : Backbone;
			return fallback.sync.apply( this, arguments );
		}
	}
}, {
	/**
	 * @readonly
	 */
	defaultProps: {
		orderby: 'date',
		order:   'DESC'
	},
	/**
	 * @readonly
	 */
	defaultArgs: {
		posts_per_page: 40
	},
	/**
	 * @readonly
	 */
	orderby: {
		allowed:  [ 'name', 'author', 'date', 'title', 'modified', 'uploadedTo', 'id', 'post__in', 'menuOrder' ],
		/**
		 * A map of JavaScript orderby values to their WP_Query equivalents.
		 * @type {Object}
		 */
		valuemap: {
			'id':         'ID',
			'uploadedTo': 'parent',
			'menuOrder':  'menu_order ID'
		}
	},
	/**
	 * A map of JavaScript query properties to their WP_Query equivalents.
	 *
	 * @readonly
	 */
	propmap: {
		'search':    's',
		'type':      'post_mime_type',
		'perPage':   'posts_per_page',
		'menuOrder': 'menu_order',
		'uploadedTo': 'post_parent',
		'status':     'post_status',
		'include':    'post__in',
		'exclude':    'post__not_in'
	},
	/**
	 * Creates and returns an Attachments Query collection given the properties.
	 *
	 * Caches query objects and reuses where possible.
	 *
	 * @static
	 * @method
	 *
	 * @param {object} [props]
	 * @param {Object} [props.cache=true]   Whether to use the query cache or not.
	 * @param {Object} [props.order]
	 * @param {Object} [props.orderby]
	 * @param {Object} [props.include]
	 * @param {Object} [props.exclude]
	 * @param {Object} [props.s]
	 * @param {Object} [props.post_mime_type]
	 * @param {Object} [props.posts_per_page]
	 * @param {Object} [props.menu_order]
	 * @param {Object} [props.post_parent]
	 * @param {Object} [props.post_status]
	 * @param {Object} [options]
	 *
	 * @returns {wp.media.model.Query} A new Attachments Query collection.
	 */
	get: (function(){
		/**
		 * @static
		 * @type Array
		 */
		var queries = [];

		/**
		 * @returns {Query}
		 */
		return function( props, options ) {
			var args     = {},
				orderby  = Query.orderby,
				defaults = Query.defaultProps,
				query,
				cache    = !! props.cache || _.isUndefined( props.cache );

			// Remove the `query` property. This isn't linked to a query,
			// this *is* the query.
			delete props.query;
			delete props.cache;

			// Fill default args.
			_.defaults( props, defaults );

			// Normalize the order.
			props.order = props.order.toUpperCase();
			if ( 'DESC' !== props.order && 'ASC' !== props.order ) {
				props.order = defaults.order.toUpperCase();
			}

			// Ensure we have a valid orderby value.
			if ( ! _.contains( orderby.allowed, props.orderby ) ) {
				props.orderby = defaults.orderby;
			}

			_.each( [ 'include', 'exclude' ], function( prop ) {
				if ( props[ prop ] && ! _.isArray( props[ prop ] ) ) {
					props[ prop ] = [ props[ prop ] ];
				}
			} );

			// Generate the query `args` object.
			// Correct any differing property names.
			_.each( props, function( value, prop ) {
				if ( _.isNull( value ) ) {
					return;
				}

				args[ Query.propmap[ prop ] || prop ] = value;
			});

			// Fill any other default query args.
			_.defaults( args, Query.defaultArgs );

			// `props.orderby` does not always map directly to `args.orderby`.
			// Substitute exceptions specified in orderby.keymap.
			args.orderby = orderby.valuemap[ props.orderby ] || props.orderby;

			// Search the query cache for a matching query.
			if ( cache ) {
				query = _.find( queries, function( query ) {
					return _.isEqual( query.args, args );
				});
			} else {
				queries = [];
			}

			// Otherwise, create a new query and add it to the cache.
			if ( ! query ) {
				query = new Query( [], _.extend( options || {}, {
					props: props,
					args:  args
				} ) );
				queries.push( query );
			}

			return query;
		};
	}())
});

module.exports = Query;

},{}],"/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/models/selection.js":[function(require,module,exports){
/**
 * wp.media.model.Selection
 *
 * A selection of attachments.
 *
 * @class
 * @augments wp.media.model.Attachments
 * @augments Backbone.Collection
 */
var Attachments = wp.media.model.Attachments,
	Selection;

Selection = Attachments.extend({
	/**
	 * Refresh the `single` model whenever the selection changes.
	 * Binds `single` instead of using the context argument to ensure
	 * it receives no parameters.
	 *
	 * @param {Array} [models=[]] Array of models used to populate the collection.
	 * @param {Object} [options={}]
	 */
	initialize: function( models, options ) {
		/**
		 * call 'initialize' directly on the parent class
		 */
		Attachments.prototype.initialize.apply( this, arguments );
		this.multiple = options && options.multiple;

		this.on( 'add remove reset', _.bind( this.single, this, false ) );
	},

	/**
	 * If the workflow does not support multi-select, clear out the selection
	 * before adding a new attachment to it.
	 *
	 * @param {Array} models
	 * @param {Object} options
	 * @returns {wp.media.model.Attachment[]}
	 */
	add: function( models, options ) {
		if ( ! this.multiple ) {
			this.remove( this.models );
		}
		/**
		 * call 'add' directly on the parent class
		 */
		return Attachments.prototype.add.call( this, models, options );
	},

	/**
	 * Fired when toggling (clicking on) an attachment in the modal.
	 *
	 * @param {undefined|boolean|wp.media.model.Attachment} model
	 *
	 * @fires wp.media.model.Selection#selection:single
	 * @fires wp.media.model.Selection#selection:unsingle
	 *
	 * @returns {Backbone.Model}
	 */
	single: function( model ) {
		var previous = this._single;

		// If a `model` is provided, use it as the single model.
		if ( model ) {
			this._single = model;
		}
		// If the single model isn't in the selection, remove it.
		if ( this._single && ! this.get( this._single.cid ) ) {
			delete this._single;
		}

		this._single = this._single || this.last();

		// If single has changed, fire an event.
		if ( this._single !== previous ) {
			if ( previous ) {
				previous.trigger( 'selection:unsingle', previous, this );

				// If the model was already removed, trigger the collection
				// event manually.
				if ( ! this.get( previous.cid ) ) {
					this.trigger( 'selection:unsingle', previous, this );
				}
			}
			if ( this._single ) {
				this._single.trigger( 'selection:single', this._single, this );
			}
		}

		// Return the single model, or the last model as a fallback.
		return this._single;
	}
});

module.exports = Selection;

},{}]},{},["/Users/sidneyowallah/Google Drive/workspace/vagrant-local/www/wordpress-develop/src/wp-includes/js/media/models.manifest.js"])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9ncnVudC1icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvbW9kZWxzLm1hbmlmZXN0LmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL21vZGVscy9hdHRhY2htZW50LmpzIiwic3JjL3dwLWluY2x1ZGVzL2pzL21lZGlhL21vZGVscy9hdHRhY2htZW50cy5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS9tb2RlbHMvcG9zdC1pbWFnZS5qcyIsInNyYy93cC1pbmNsdWRlcy9qcy9tZWRpYS9tb2RlbHMvcXVlcnkuanMiLCJzcmMvd3AtaW5jbHVkZXMvanMvbWVkaWEvbW9kZWxzL3NlbGVjdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuaUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbHMgd3AsIF8sIGpRdWVyeSAqL1xuXG52YXIgJCA9IGpRdWVyeSxcblx0QXR0YWNobWVudCwgQXR0YWNobWVudHMsIGwxMG4sIG1lZGlhO1xuXG53aW5kb3cud3AgPSB3aW5kb3cud3AgfHwge307XG5cbi8qKlxuICogQ3JlYXRlIGFuZCByZXR1cm4gYSBtZWRpYSBmcmFtZS5cbiAqXG4gKiBIYW5kbGVzIHRoZSBkZWZhdWx0IG1lZGlhIGV4cGVyaWVuY2UuXG4gKlxuICogQHBhcmFtICB7b2JqZWN0fSBhdHRyaWJ1dGVzIFRoZSBwcm9wZXJ0aWVzIHBhc3NlZCB0byB0aGUgbWFpbiBtZWRpYSBjb250cm9sbGVyLlxuICogQHJldHVybiB7d3AubWVkaWEudmlldy5NZWRpYUZyYW1lfSBBIG1lZGlhIHdvcmtmbG93LlxuICovXG5tZWRpYSA9IHdwLm1lZGlhID0gZnVuY3Rpb24oIGF0dHJpYnV0ZXMgKSB7XG5cdHZhciBNZWRpYUZyYW1lID0gbWVkaWEudmlldy5NZWRpYUZyYW1lLFxuXHRcdGZyYW1lO1xuXG5cdGlmICggISBNZWRpYUZyYW1lICkge1xuXHRcdHJldHVybjtcblx0fVxuXG5cdGF0dHJpYnV0ZXMgPSBfLmRlZmF1bHRzKCBhdHRyaWJ1dGVzIHx8IHt9LCB7XG5cdFx0ZnJhbWU6ICdzZWxlY3QnXG5cdH0pO1xuXG5cdGlmICggJ3NlbGVjdCcgPT09IGF0dHJpYnV0ZXMuZnJhbWUgJiYgTWVkaWFGcmFtZS5TZWxlY3QgKSB7XG5cdFx0ZnJhbWUgPSBuZXcgTWVkaWFGcmFtZS5TZWxlY3QoIGF0dHJpYnV0ZXMgKTtcblx0fSBlbHNlIGlmICggJ3Bvc3QnID09PSBhdHRyaWJ1dGVzLmZyYW1lICYmIE1lZGlhRnJhbWUuUG9zdCApIHtcblx0XHRmcmFtZSA9IG5ldyBNZWRpYUZyYW1lLlBvc3QoIGF0dHJpYnV0ZXMgKTtcblx0fSBlbHNlIGlmICggJ21hbmFnZScgPT09IGF0dHJpYnV0ZXMuZnJhbWUgJiYgTWVkaWFGcmFtZS5NYW5hZ2UgKSB7XG5cdFx0ZnJhbWUgPSBuZXcgTWVkaWFGcmFtZS5NYW5hZ2UoIGF0dHJpYnV0ZXMgKTtcblx0fSBlbHNlIGlmICggJ2ltYWdlJyA9PT0gYXR0cmlidXRlcy5mcmFtZSAmJiBNZWRpYUZyYW1lLkltYWdlRGV0YWlscyApIHtcblx0XHRmcmFtZSA9IG5ldyBNZWRpYUZyYW1lLkltYWdlRGV0YWlscyggYXR0cmlidXRlcyApO1xuXHR9IGVsc2UgaWYgKCAnYXVkaW8nID09PSBhdHRyaWJ1dGVzLmZyYW1lICYmIE1lZGlhRnJhbWUuQXVkaW9EZXRhaWxzICkge1xuXHRcdGZyYW1lID0gbmV3IE1lZGlhRnJhbWUuQXVkaW9EZXRhaWxzKCBhdHRyaWJ1dGVzICk7XG5cdH0gZWxzZSBpZiAoICd2aWRlbycgPT09IGF0dHJpYnV0ZXMuZnJhbWUgJiYgTWVkaWFGcmFtZS5WaWRlb0RldGFpbHMgKSB7XG5cdFx0ZnJhbWUgPSBuZXcgTWVkaWFGcmFtZS5WaWRlb0RldGFpbHMoIGF0dHJpYnV0ZXMgKTtcblx0fSBlbHNlIGlmICggJ2VkaXQtYXR0YWNobWVudHMnID09PSBhdHRyaWJ1dGVzLmZyYW1lICYmIE1lZGlhRnJhbWUuRWRpdEF0dGFjaG1lbnRzICkge1xuXHRcdGZyYW1lID0gbmV3IE1lZGlhRnJhbWUuRWRpdEF0dGFjaG1lbnRzKCBhdHRyaWJ1dGVzICk7XG5cdH1cblxuXHRkZWxldGUgYXR0cmlidXRlcy5mcmFtZTtcblxuXHRtZWRpYS5mcmFtZSA9IGZyYW1lO1xuXG5cdHJldHVybiBmcmFtZTtcbn07XG5cbl8uZXh0ZW5kKCBtZWRpYSwgeyBtb2RlbDoge30sIHZpZXc6IHt9LCBjb250cm9sbGVyOiB7fSwgZnJhbWVzOiB7fSB9KTtcblxuLy8gTGluayBhbnkgbG9jYWxpemVkIHN0cmluZ3MuXG5sMTBuID0gbWVkaWEubW9kZWwubDEwbiA9IHdpbmRvdy5fd3BNZWRpYU1vZGVsc0wxMG4gfHwge307XG5cbi8vIExpbmsgYW55IHNldHRpbmdzLlxubWVkaWEubW9kZWwuc2V0dGluZ3MgPSBsMTBuLnNldHRpbmdzIHx8IHt9O1xuZGVsZXRlIGwxMG4uc2V0dGluZ3M7XG5cbkF0dGFjaG1lbnQgPSBtZWRpYS5tb2RlbC5BdHRhY2htZW50ID0gcmVxdWlyZSggJy4vbW9kZWxzL2F0dGFjaG1lbnQuanMnICk7XG5BdHRhY2htZW50cyA9IG1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzID0gcmVxdWlyZSggJy4vbW9kZWxzL2F0dGFjaG1lbnRzLmpzJyApO1xuXG5tZWRpYS5tb2RlbC5RdWVyeSA9IHJlcXVpcmUoICcuL21vZGVscy9xdWVyeS5qcycgKTtcbm1lZGlhLm1vZGVsLlBvc3RJbWFnZSA9IHJlcXVpcmUoICcuL21vZGVscy9wb3N0LWltYWdlLmpzJyApO1xubWVkaWEubW9kZWwuU2VsZWN0aW9uID0gcmVxdWlyZSggJy4vbW9kZWxzL3NlbGVjdGlvbi5qcycgKTtcblxuLyoqXG4gKiA9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAqIFVUSUxJVElFU1xuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKi9cblxuLyoqXG4gKiBBIGJhc2ljIGVxdWFsaXR5IGNvbXBhcmF0b3IgZm9yIEJhY2tib25lIG1vZGVscy5cbiAqXG4gKiBVc2VkIHRvIG9yZGVyIG1vZGVscyB3aXRoaW4gYSBjb2xsZWN0aW9uIC0gQHNlZSB3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50cy5jb21wYXJhdG9yKCkuXG4gKlxuICogQHBhcmFtICB7bWl4ZWR9ICBhICBUaGUgcHJpbWFyeSBwYXJhbWV0ZXIgdG8gY29tcGFyZS5cbiAqIEBwYXJhbSAge21peGVkfSAgYiAgVGhlIHByaW1hcnkgcGFyYW1ldGVyIHRvIGNvbXBhcmUuXG4gKiBAcGFyYW0gIHtzdHJpbmd9IGFjIFRoZSBmYWxsYmFjayBwYXJhbWV0ZXIgdG8gY29tcGFyZSwgYSdzIGNpZC5cbiAqIEBwYXJhbSAge3N0cmluZ30gYmMgVGhlIGZhbGxiYWNrIHBhcmFtZXRlciB0byBjb21wYXJlLCBiJ3MgY2lkLlxuICogQHJldHVybiB7bnVtYmVyfSAgICAtMTogYSBzaG91bGQgY29tZSBiZWZvcmUgYi5cbiAqICAgICAgICAgICAgICAgICAgICAgIDA6IGEgYW5kIGIgYXJlIG9mIHRoZSBzYW1lIHJhbmsuXG4gKiAgICAgICAgICAgICAgICAgICAgICAxOiBiIHNob3VsZCBjb21lIGJlZm9yZSBhLlxuICovXG5tZWRpYS5jb21wYXJlID0gZnVuY3Rpb24oIGEsIGIsIGFjLCBiYyApIHtcblx0aWYgKCBfLmlzRXF1YWwoIGEsIGIgKSApIHtcblx0XHRyZXR1cm4gYWMgPT09IGJjID8gMCA6IChhYyA+IGJjID8gLTEgOiAxKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gYSA+IGIgPyAtMSA6IDE7XG5cdH1cbn07XG5cbl8uZXh0ZW5kKCBtZWRpYSwge1xuXHQvKipcblx0ICogbWVkaWEudGVtcGxhdGUoIGlkIClcblx0ICpcblx0ICogRmV0Y2ggYSBKYXZhU2NyaXB0IHRlbXBsYXRlIGZvciBhbiBpZCwgYW5kIHJldHVybiBhIHRlbXBsYXRpbmcgZnVuY3Rpb24gZm9yIGl0LlxuXHQgKlxuXHQgKiBTZWUgd3AudGVtcGxhdGUoKSBpbiBgd3AtaW5jbHVkZXMvanMvd3AtdXRpbC5qc2AuXG5cdCAqXG5cdCAqIEBib3Jyb3dzIHdwLnRlbXBsYXRlIGFzIHRlbXBsYXRlXG5cdCAqL1xuXHR0ZW1wbGF0ZTogd3AudGVtcGxhdGUsXG5cblx0LyoqXG5cdCAqIG1lZGlhLnBvc3QoIFthY3Rpb25dLCBbZGF0YV0gKVxuXHQgKlxuXHQgKiBTZW5kcyBhIFBPU1QgcmVxdWVzdCB0byBXb3JkUHJlc3MuXG5cdCAqIFNlZSB3cC5hamF4LnBvc3QoKSBpbiBgd3AtaW5jbHVkZXMvanMvd3AtdXRpbC5qc2AuXG5cdCAqXG5cdCAqIEBib3Jyb3dzIHdwLmFqYXgucG9zdCBhcyBwb3N0XG5cdCAqL1xuXHRwb3N0OiB3cC5hamF4LnBvc3QsXG5cblx0LyoqXG5cdCAqIG1lZGlhLmFqYXgoIFthY3Rpb25dLCBbb3B0aW9uc10gKVxuXHQgKlxuXHQgKiBTZW5kcyBhbiBYSFIgcmVxdWVzdCB0byBXb3JkUHJlc3MuXG5cdCAqIFNlZSB3cC5hamF4LnNlbmQoKSBpbiBgd3AtaW5jbHVkZXMvanMvd3AtdXRpbC5qc2AuXG5cdCAqXG5cdCAqIEBib3Jyb3dzIHdwLmFqYXguc2VuZCBhcyBhamF4XG5cdCAqL1xuXHRhamF4OiB3cC5hamF4LnNlbmQsXG5cblx0LyoqXG5cdCAqIFNjYWxlcyBhIHNldCBvZiBkaW1lbnNpb25zIHRvIGZpdCB3aXRoaW4gYm91bmRpbmcgZGltZW5zaW9ucy5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IGRpbWVuc2lvbnNcblx0ICogQHJldHVybnMge09iamVjdH1cblx0ICovXG5cdGZpdDogZnVuY3Rpb24oIGRpbWVuc2lvbnMgKSB7XG5cdFx0dmFyIHdpZHRoICAgICA9IGRpbWVuc2lvbnMud2lkdGgsXG5cdFx0XHRoZWlnaHQgICAgPSBkaW1lbnNpb25zLmhlaWdodCxcblx0XHRcdG1heFdpZHRoICA9IGRpbWVuc2lvbnMubWF4V2lkdGgsXG5cdFx0XHRtYXhIZWlnaHQgPSBkaW1lbnNpb25zLm1heEhlaWdodCxcblx0XHRcdGNvbnN0cmFpbnQ7XG5cblx0XHQvLyBDb21wYXJlIHJhdGlvcyBiZXR3ZWVuIHRoZSB0d28gdmFsdWVzIHRvIGRldGVybWluZSB3aGljaFxuXHRcdC8vIG1heCB0byBjb25zdHJhaW4gYnkuIElmIGEgbWF4IHZhbHVlIGRvZXNuJ3QgZXhpc3QsIHRoZW4gdGhlXG5cdFx0Ly8gb3Bwb3NpdGUgc2lkZSBpcyB0aGUgY29uc3RyYWludC5cblx0XHRpZiAoICEgXy5pc1VuZGVmaW5lZCggbWF4V2lkdGggKSAmJiAhIF8uaXNVbmRlZmluZWQoIG1heEhlaWdodCApICkge1xuXHRcdFx0Y29uc3RyYWludCA9ICggd2lkdGggLyBoZWlnaHQgPiBtYXhXaWR0aCAvIG1heEhlaWdodCApID8gJ3dpZHRoJyA6ICdoZWlnaHQnO1xuXHRcdH0gZWxzZSBpZiAoIF8uaXNVbmRlZmluZWQoIG1heEhlaWdodCApICkge1xuXHRcdFx0Y29uc3RyYWludCA9ICd3aWR0aCc7XG5cdFx0fSBlbHNlIGlmICggIF8uaXNVbmRlZmluZWQoIG1heFdpZHRoICkgJiYgaGVpZ2h0ID4gbWF4SGVpZ2h0ICkge1xuXHRcdFx0Y29uc3RyYWludCA9ICdoZWlnaHQnO1xuXHRcdH1cblxuXHRcdC8vIElmIHRoZSB2YWx1ZSBvZiB0aGUgY29uc3RyYWluZWQgc2lkZSBpcyBsYXJnZXIgdGhhbiB0aGUgbWF4LFxuXHRcdC8vIHRoZW4gc2NhbGUgdGhlIHZhbHVlcy4gT3RoZXJ3aXNlIHJldHVybiB0aGUgb3JpZ2luYWxzOyB0aGV5IGZpdC5cblx0XHRpZiAoICd3aWR0aCcgPT09IGNvbnN0cmFpbnQgJiYgd2lkdGggPiBtYXhXaWR0aCApIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHdpZHRoIDogbWF4V2lkdGgsXG5cdFx0XHRcdGhlaWdodDogTWF0aC5yb3VuZCggbWF4V2lkdGggKiBoZWlnaHQgLyB3aWR0aCApXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoICdoZWlnaHQnID09PSBjb25zdHJhaW50ICYmIGhlaWdodCA+IG1heEhlaWdodCApIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHdpZHRoIDogTWF0aC5yb3VuZCggbWF4SGVpZ2h0ICogd2lkdGggLyBoZWlnaHQgKSxcblx0XHRcdFx0aGVpZ2h0OiBtYXhIZWlnaHRcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHdpZHRoIDogd2lkdGgsXG5cdFx0XHRcdGhlaWdodDogaGVpZ2h0XG5cdFx0XHR9O1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFRydW5jYXRlcyBhIHN0cmluZyBieSBpbmplY3RpbmcgYW4gZWxsaXBzaXMgaW50byB0aGUgbWlkZGxlLlxuXHQgKiBVc2VmdWwgZm9yIGZpbGVuYW1lcy5cblx0ICpcblx0ICogQHBhcmFtIHtTdHJpbmd9IHN0cmluZ1xuXHQgKiBAcGFyYW0ge051bWJlcn0gW2xlbmd0aD0zMF1cblx0ICogQHBhcmFtIHtTdHJpbmd9IFtyZXBsYWNlbWVudD0maGVsbGlwO11cblx0ICogQHJldHVybnMge1N0cmluZ30gVGhlIHN0cmluZywgdW5sZXNzIGxlbmd0aCBpcyBncmVhdGVyIHRoYW4gc3RyaW5nLmxlbmd0aC5cblx0ICovXG5cdHRydW5jYXRlOiBmdW5jdGlvbiggc3RyaW5nLCBsZW5ndGgsIHJlcGxhY2VtZW50ICkge1xuXHRcdGxlbmd0aCA9IGxlbmd0aCB8fCAzMDtcblx0XHRyZXBsYWNlbWVudCA9IHJlcGxhY2VtZW50IHx8ICcmaGVsbGlwOyc7XG5cblx0XHRpZiAoIHN0cmluZy5sZW5ndGggPD0gbGVuZ3RoICkge1xuXHRcdFx0cmV0dXJuIHN0cmluZztcblx0XHR9XG5cblx0XHRyZXR1cm4gc3RyaW5nLnN1YnN0ciggMCwgbGVuZ3RoIC8gMiApICsgcmVwbGFjZW1lbnQgKyBzdHJpbmcuc3Vic3RyKCAtMSAqIGxlbmd0aCAvIDIgKTtcblx0fVxufSk7XG5cbi8qKlxuICogPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gKiBNT0RFTFNcbiAqID09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICovXG4vKipcbiAqIHdwLm1lZGlhLmF0dGFjaG1lbnRcbiAqXG4gKiBAc3RhdGljXG4gKiBAcGFyYW0ge1N0cmluZ30gaWQgQSBzdHJpbmcgdXNlZCB0byBpZGVudGlmeSBhIG1vZGVsLlxuICogQHJldHVybnMge3dwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnR9XG4gKi9cbm1lZGlhLmF0dGFjaG1lbnQgPSBmdW5jdGlvbiggaWQgKSB7XG5cdHJldHVybiBBdHRhY2htZW50LmdldCggaWQgKTtcbn07XG5cbi8qKlxuICogQSBjb2xsZWN0aW9uIG9mIGFsbCBhdHRhY2htZW50cyB0aGF0IGhhdmUgYmVlbiBmZXRjaGVkIGZyb20gdGhlIHNlcnZlci5cbiAqXG4gKiBAc3RhdGljXG4gKiBAbWVtYmVyIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c31cbiAqL1xuQXR0YWNobWVudHMuYWxsID0gbmV3IEF0dGFjaG1lbnRzKCk7XG5cbi8qKlxuICogd3AubWVkaWEucXVlcnlcbiAqXG4gKiBTaG9ydGhhbmQgZm9yIGNyZWF0aW5nIGEgbmV3IEF0dGFjaG1lbnRzIFF1ZXJ5LlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSBbcHJvcHNdXG4gKiBAcmV0dXJucyB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudHN9XG4gKi9cbm1lZGlhLnF1ZXJ5ID0gZnVuY3Rpb24oIHByb3BzICkge1xuXHRyZXR1cm4gbmV3IEF0dGFjaG1lbnRzKCBudWxsLCB7XG5cdFx0cHJvcHM6IF8uZXh0ZW5kKCBfLmRlZmF1bHRzKCBwcm9wcyB8fCB7fSwgeyBvcmRlcmJ5OiAnZGF0ZScgfSApLCB7IHF1ZXJ5OiB0cnVlIH0gKVxuXHR9KTtcbn07XG5cbi8vIENsZWFuIHVwLiBQcmV2ZW50cyBtb2JpbGUgYnJvd3NlcnMgY2FjaGluZ1xuJCh3aW5kb3cpLm9uKCd1bmxvYWQnLCBmdW5jdGlvbigpe1xuXHR3aW5kb3cud3AgPSBudWxsO1xufSk7XG4iLCIvKmdsb2JhbHMgd3AsIF8sIEJhY2tib25lICovXG5cbi8qKlxuICogd3AubWVkaWEubW9kZWwuQXR0YWNobWVudFxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIEJhY2tib25lLk1vZGVsXG4gKi9cbnZhciAkID0gQmFja2JvbmUuJCxcblx0QXR0YWNobWVudDtcblxuQXR0YWNobWVudCA9IEJhY2tib25lLk1vZGVsLmV4dGVuZCh7XG5cdC8qKlxuXHQgKiBUcmlnZ2VyZWQgd2hlbiBhdHRhY2htZW50IGRldGFpbHMgY2hhbmdlXG5cdCAqIE92ZXJyaWRlcyBCYWNrYm9uZS5Nb2RlbC5zeW5jXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBtZXRob2Rcblx0ICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50fSBtb2RlbFxuXHQgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG5cdCAqXG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfVxuXHQgKi9cblx0c3luYzogZnVuY3Rpb24oIG1ldGhvZCwgbW9kZWwsIG9wdGlvbnMgKSB7XG5cdFx0Ly8gSWYgdGhlIGF0dGFjaG1lbnQgZG9lcyBub3QgeWV0IGhhdmUgYW4gYGlkYCwgcmV0dXJuIGFuIGluc3RhbnRseVxuXHRcdC8vIHJlamVjdGVkIHByb21pc2UuIE90aGVyd2lzZSwgYWxsIG9mIG91ciByZXF1ZXN0cyB3aWxsIGZhaWwuXG5cdFx0aWYgKCBfLmlzVW5kZWZpbmVkKCB0aGlzLmlkICkgKSB7XG5cdFx0XHRyZXR1cm4gJC5EZWZlcnJlZCgpLnJlamVjdFdpdGgoIHRoaXMgKS5wcm9taXNlKCk7XG5cdFx0fVxuXG5cdFx0Ly8gT3ZlcmxvYWQgdGhlIGByZWFkYCByZXF1ZXN0IHNvIEF0dGFjaG1lbnQuZmV0Y2goKSBmdW5jdGlvbnMgY29ycmVjdGx5LlxuXHRcdGlmICggJ3JlYWQnID09PSBtZXRob2QgKSB7XG5cdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHRcdG9wdGlvbnMuY29udGV4dCA9IHRoaXM7XG5cdFx0XHRvcHRpb25zLmRhdGEgPSBfLmV4dGVuZCggb3B0aW9ucy5kYXRhIHx8IHt9LCB7XG5cdFx0XHRcdGFjdGlvbjogJ2dldC1hdHRhY2htZW50Jyxcblx0XHRcdFx0aWQ6IHRoaXMuaWRcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHdwLm1lZGlhLmFqYXgoIG9wdGlvbnMgKTtcblxuXHRcdC8vIE92ZXJsb2FkIHRoZSBgdXBkYXRlYCByZXF1ZXN0IHNvIHByb3BlcnRpZXMgY2FuIGJlIHNhdmVkLlxuXHRcdH0gZWxzZSBpZiAoICd1cGRhdGUnID09PSBtZXRob2QgKSB7XG5cdFx0XHQvLyBJZiB3ZSBkbyBub3QgaGF2ZSB0aGUgbmVjZXNzYXJ5IG5vbmNlLCBmYWlsIGltbWVkaXRhdGVseS5cblx0XHRcdGlmICggISB0aGlzLmdldCgnbm9uY2VzJykgfHwgISB0aGlzLmdldCgnbm9uY2VzJykudXBkYXRlICkge1xuXHRcdFx0XHRyZXR1cm4gJC5EZWZlcnJlZCgpLnJlamVjdFdpdGgoIHRoaXMgKS5wcm9taXNlKCk7XG5cdFx0XHR9XG5cblx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdFx0b3B0aW9ucy5jb250ZXh0ID0gdGhpcztcblxuXHRcdFx0Ly8gU2V0IHRoZSBhY3Rpb24gYW5kIElELlxuXHRcdFx0b3B0aW9ucy5kYXRhID0gXy5leHRlbmQoIG9wdGlvbnMuZGF0YSB8fCB7fSwge1xuXHRcdFx0XHRhY3Rpb246ICAnc2F2ZS1hdHRhY2htZW50Jyxcblx0XHRcdFx0aWQ6ICAgICAgdGhpcy5pZCxcblx0XHRcdFx0bm9uY2U6ICAgdGhpcy5nZXQoJ25vbmNlcycpLnVwZGF0ZSxcblx0XHRcdFx0cG9zdF9pZDogd3AubWVkaWEubW9kZWwuc2V0dGluZ3MucG9zdC5pZFxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIFJlY29yZCB0aGUgdmFsdWVzIG9mIHRoZSBjaGFuZ2VkIGF0dHJpYnV0ZXMuXG5cdFx0XHRpZiAoIG1vZGVsLmhhc0NoYW5nZWQoKSApIHtcblx0XHRcdFx0b3B0aW9ucy5kYXRhLmNoYW5nZXMgPSB7fTtcblxuXHRcdFx0XHRfLmVhY2goIG1vZGVsLmNoYW5nZWQsIGZ1bmN0aW9uKCB2YWx1ZSwga2V5ICkge1xuXHRcdFx0XHRcdG9wdGlvbnMuZGF0YS5jaGFuZ2VzWyBrZXkgXSA9IHRoaXMuZ2V0KCBrZXkgKTtcblx0XHRcdFx0fSwgdGhpcyApO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gd3AubWVkaWEuYWpheCggb3B0aW9ucyApO1xuXG5cdFx0Ly8gT3ZlcmxvYWQgdGhlIGBkZWxldGVgIHJlcXVlc3Qgc28gYXR0YWNobWVudHMgY2FuIGJlIHJlbW92ZWQuXG5cdFx0Ly8gVGhpcyB3aWxsIHBlcm1hbmVudGx5IGRlbGV0ZSBhbiBhdHRhY2htZW50LlxuXHRcdH0gZWxzZSBpZiAoICdkZWxldGUnID09PSBtZXRob2QgKSB7XG5cdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdFx0aWYgKCAhIG9wdGlvbnMud2FpdCApIHtcblx0XHRcdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRvcHRpb25zLmNvbnRleHQgPSB0aGlzO1xuXHRcdFx0b3B0aW9ucy5kYXRhID0gXy5leHRlbmQoIG9wdGlvbnMuZGF0YSB8fCB7fSwge1xuXHRcdFx0XHRhY3Rpb246ICAgJ2RlbGV0ZS1wb3N0Jyxcblx0XHRcdFx0aWQ6ICAgICAgIHRoaXMuaWQsXG5cdFx0XHRcdF93cG5vbmNlOiB0aGlzLmdldCgnbm9uY2VzJylbJ2RlbGV0ZSddXG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIHdwLm1lZGlhLmFqYXgoIG9wdGlvbnMgKS5kb25lKCBmdW5jdGlvbigpIHtcblx0XHRcdFx0dGhpcy5kZXN0cm95ZWQgPSB0cnVlO1xuXHRcdFx0fSkuZmFpbCggZnVuY3Rpb24oKSB7XG5cdFx0XHRcdHRoaXMuZGVzdHJveWVkID0gZmFsc2U7XG5cdFx0XHR9KTtcblxuXHRcdC8vIE90aGVyd2lzZSwgZmFsbCBiYWNrIHRvIGBCYWNrYm9uZS5zeW5jKClgLlxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvKipcblx0XHRcdCAqIENhbGwgYHN5bmNgIGRpcmVjdGx5IG9uIEJhY2tib25lLk1vZGVsXG5cdFx0XHQgKi9cblx0XHRcdHJldHVybiBCYWNrYm9uZS5Nb2RlbC5wcm90b3R5cGUuc3luYy5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQ29udmVydCBkYXRlIHN0cmluZ3MgaW50byBEYXRlIG9iamVjdHMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSByZXNwIFRoZSByYXcgcmVzcG9uc2Ugb2JqZWN0LCB0eXBpY2FsbHkgcmV0dXJuZWQgYnkgZmV0Y2goKVxuXHQgKiBAcmV0dXJucyB7T2JqZWN0fSBUaGUgbW9kaWZpZWQgcmVzcG9uc2Ugb2JqZWN0LCB3aGljaCBpcyB0aGUgYXR0cmlidXRlcyBoYXNoXG5cdCAqICAgIHRvIGJlIHNldCBvbiB0aGUgbW9kZWwuXG5cdCAqL1xuXHRwYXJzZTogZnVuY3Rpb24oIHJlc3AgKSB7XG5cdFx0aWYgKCAhIHJlc3AgKSB7XG5cdFx0XHRyZXR1cm4gcmVzcDtcblx0XHR9XG5cblx0XHRyZXNwLmRhdGUgPSBuZXcgRGF0ZSggcmVzcC5kYXRlICk7XG5cdFx0cmVzcC5tb2RpZmllZCA9IG5ldyBEYXRlKCByZXNwLm1vZGlmaWVkICk7XG5cdFx0cmV0dXJuIHJlc3A7XG5cdH0sXG5cdC8qKlxuXHQgKiBAcGFyYW0ge09iamVjdH0gZGF0YSBUaGUgcHJvcGVydGllcyB0byBiZSBzYXZlZC5cblx0ICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnMgU3luYyBvcHRpb25zLiBlLmcuIHBhdGNoLCB3YWl0LCBzdWNjZXNzLCBlcnJvci5cblx0ICpcblx0ICogQHRoaXMgQmFja2JvbmUuTW9kZWxcblx0ICpcblx0ICogQHJldHVybnMge1Byb21pc2V9XG5cdCAqL1xuXHRzYXZlQ29tcGF0OiBmdW5jdGlvbiggZGF0YSwgb3B0aW9ucyApIHtcblx0XHR2YXIgbW9kZWwgPSB0aGlzO1xuXG5cdFx0Ly8gSWYgd2UgZG8gbm90IGhhdmUgdGhlIG5lY2Vzc2FyeSBub25jZSwgZmFpbCBpbW1lZGl0YXRlbHkuXG5cdFx0aWYgKCAhIHRoaXMuZ2V0KCdub25jZXMnKSB8fCAhIHRoaXMuZ2V0KCdub25jZXMnKS51cGRhdGUgKSB7XG5cdFx0XHRyZXR1cm4gJC5EZWZlcnJlZCgpLnJlamVjdFdpdGgoIHRoaXMgKS5wcm9taXNlKCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdwLm1lZGlhLnBvc3QoICdzYXZlLWF0dGFjaG1lbnQtY29tcGF0JywgXy5kZWZhdWx0cyh7XG5cdFx0XHRpZDogICAgICB0aGlzLmlkLFxuXHRcdFx0bm9uY2U6ICAgdGhpcy5nZXQoJ25vbmNlcycpLnVwZGF0ZSxcblx0XHRcdHBvc3RfaWQ6IHdwLm1lZGlhLm1vZGVsLnNldHRpbmdzLnBvc3QuaWRcblx0XHR9LCBkYXRhICkgKS5kb25lKCBmdW5jdGlvbiggcmVzcCwgc3RhdHVzLCB4aHIgKSB7XG5cdFx0XHRtb2RlbC5zZXQoIG1vZGVsLnBhcnNlKCByZXNwLCB4aHIgKSwgb3B0aW9ucyApO1xuXHRcdH0pO1xuXHR9XG59LCB7XG5cdC8qKlxuXHQgKiBDcmVhdGUgYSBuZXcgbW9kZWwgb24gdGhlIHN0YXRpYyAnYWxsJyBhdHRhY2htZW50cyBjb2xsZWN0aW9uIGFuZCByZXR1cm4gaXQuXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIHtPYmplY3R9IGF0dHJzXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50fVxuXHQgKi9cblx0Y3JlYXRlOiBmdW5jdGlvbiggYXR0cnMgKSB7XG5cdFx0dmFyIEF0dGFjaG1lbnRzID0gd3AubWVkaWEubW9kZWwuQXR0YWNobWVudHM7XG5cdFx0cmV0dXJuIEF0dGFjaG1lbnRzLmFsbC5wdXNoKCBhdHRycyApO1xuXHR9LFxuXHQvKipcblx0ICogQ3JlYXRlIGEgbmV3IG1vZGVsIG9uIHRoZSBzdGF0aWMgJ2FsbCcgYXR0YWNobWVudHMgY29sbGVjdGlvbiBhbmQgcmV0dXJuIGl0LlxuXHQgKlxuXHQgKiBJZiB0aGlzIGZ1bmN0aW9uIGhhcyBhbHJlYWR5IGJlZW4gY2FsbGVkIGZvciB0aGUgaWQsXG5cdCAqIGl0IHJldHVybnMgdGhlIHNwZWNpZmllZCBhdHRhY2htZW50LlxuXHQgKlxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBpZCBBIHN0cmluZyB1c2VkIHRvIGlkZW50aWZ5IGEgbW9kZWwuXG5cdCAqIEBwYXJhbSB7QmFja2JvbmUuTW9kZWx8dW5kZWZpbmVkfSBhdHRhY2htZW50XG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50fVxuXHQgKi9cblx0Z2V0OiBfLm1lbW9pemUoIGZ1bmN0aW9uKCBpZCwgYXR0YWNobWVudCApIHtcblx0XHR2YXIgQXR0YWNobWVudHMgPSB3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50cztcblx0XHRyZXR1cm4gQXR0YWNobWVudHMuYWxsLnB1c2goIGF0dGFjaG1lbnQgfHwgeyBpZDogaWQgfSApO1xuXHR9KVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gQXR0YWNobWVudDtcbiIsIi8qZ2xvYmFscyB3cCwgXywgQmFja2JvbmUgKi9cblxuLyoqXG4gKiB3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c1xuICpcbiAqIEEgY29sbGVjdGlvbiBvZiBhdHRhY2htZW50cy5cbiAqXG4gKiBUaGlzIGNvbGxlY3Rpb24gaGFzIG5vIHBlcnNpc3RlbmNlIHdpdGggdGhlIHNlcnZlciB3aXRob3V0IHN1cHBseWluZ1xuICogJ29wdGlvbnMucHJvcHMucXVlcnkgPSB0cnVlJywgd2hpY2ggd2lsbCBtaXJyb3IgdGhlIGNvbGxlY3Rpb25cbiAqIHRvIGFuIEF0dGFjaG1lbnRzIFF1ZXJ5IGNvbGxlY3Rpb24gLSBAc2VlIHdwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzLm1pcnJvcigpLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIEJhY2tib25lLkNvbGxlY3Rpb25cbiAqXG4gKiBAcGFyYW0ge2FycmF5fSAgW21vZGVsc10gICAgICAgICAgICAgICAgTW9kZWxzIHRvIGluaXRpYWxpemUgd2l0aCB0aGUgY29sbGVjdGlvbi5cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gICAgICAgICAgICAgICBPcHRpb25zIGhhc2ggZm9yIHRoZSBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnByb3BzXSAgICAgICAgIE9wdGlvbnMgaGFzaCBmb3IgdGhlIGluaXRpYWwgcXVlcnkgcHJvcGVydGllcy5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5wcm9wcy5vcmRlcl0gICBJbml0aWFsIG9yZGVyIChBU0Mgb3IgREVTQykgZm9yIHRoZSBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLnByb3BzLm9yZGVyYnldIEluaXRpYWwgYXR0cmlidXRlIGtleSB0byBvcmRlciB0aGUgY29sbGVjdGlvbiBieS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5wcm9wcy5xdWVyeV0gICBXaGV0aGVyIHRoZSBjb2xsZWN0aW9uIGlzIGxpbmtlZCB0byBhbiBhdHRhY2htZW50cyBxdWVyeS5cbiAqIEBwYXJhbSB7c3RyaW5nfSBbb3B0aW9ucy5vYnNlcnZlXVxuICogQHBhcmFtIHtzdHJpbmd9IFtvcHRpb25zLmZpbHRlcnNdXG4gKlxuICovXG52YXIgQXR0YWNobWVudHMgPSBCYWNrYm9uZS5Db2xsZWN0aW9uLmV4dGVuZCh7XG5cdC8qKlxuXHQgKiBAdHlwZSB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudH1cblx0ICovXG5cdG1vZGVsOiB3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50LFxuXHQvKipcblx0ICogQHBhcmFtIHtBcnJheX0gW21vZGVscz1bXV0gQXJyYXkgb2YgbW9kZWxzIHVzZWQgdG8gcG9wdWxhdGUgdGhlIGNvbGxlY3Rpb24uXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cblx0ICovXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBtb2RlbHMsIG9wdGlvbnMgKSB7XG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cblx0XHR0aGlzLnByb3BzICAgPSBuZXcgQmFja2JvbmUuTW9kZWwoKTtcblx0XHR0aGlzLmZpbHRlcnMgPSBvcHRpb25zLmZpbHRlcnMgfHwge307XG5cblx0XHQvLyBCaW5kIGRlZmF1bHQgYGNoYW5nZWAgZXZlbnRzIHRvIHRoZSBgcHJvcHNgIG1vZGVsLlxuXHRcdHRoaXMucHJvcHMub24oICdjaGFuZ2UnLCB0aGlzLl9jaGFuZ2VGaWx0ZXJlZFByb3BzLCB0aGlzICk7XG5cblx0XHR0aGlzLnByb3BzLm9uKCAnY2hhbmdlOm9yZGVyJywgICB0aGlzLl9jaGFuZ2VPcmRlciwgICB0aGlzICk7XG5cdFx0dGhpcy5wcm9wcy5vbiggJ2NoYW5nZTpvcmRlcmJ5JywgdGhpcy5fY2hhbmdlT3JkZXJieSwgdGhpcyApO1xuXHRcdHRoaXMucHJvcHMub24oICdjaGFuZ2U6cXVlcnknLCAgIHRoaXMuX2NoYW5nZVF1ZXJ5LCAgIHRoaXMgKTtcblxuXHRcdHRoaXMucHJvcHMuc2V0KCBfLmRlZmF1bHRzKCBvcHRpb25zLnByb3BzIHx8IHt9ICkgKTtcblxuXHRcdGlmICggb3B0aW9ucy5vYnNlcnZlICkge1xuXHRcdFx0dGhpcy5vYnNlcnZlKCBvcHRpb25zLm9ic2VydmUgKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBTb3J0IHRoZSBjb2xsZWN0aW9uIHdoZW4gdGhlIG9yZGVyIGF0dHJpYnV0ZSBjaGFuZ2VzLlxuXHQgKlxuXHQgKiBAYWNjZXNzIHByaXZhdGVcblx0ICovXG5cdF9jaGFuZ2VPcmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCB0aGlzLmNvbXBhcmF0b3IgKSB7XG5cdFx0XHR0aGlzLnNvcnQoKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBTZXQgdGhlIGRlZmF1bHQgY29tcGFyYXRvciBvbmx5IHdoZW4gdGhlIGBvcmRlcmJ5YCBwcm9wZXJ0eSBpcyBzZXQuXG5cdCAqXG5cdCAqIEBhY2Nlc3MgcHJpdmF0ZVxuXHQgKlxuXHQgKiBAcGFyYW0ge0JhY2tib25lLk1vZGVsfSBtb2RlbFxuXHQgKiBAcGFyYW0ge3N0cmluZ30gb3JkZXJieVxuXHQgKi9cblx0X2NoYW5nZU9yZGVyYnk6IGZ1bmN0aW9uKCBtb2RlbCwgb3JkZXJieSApIHtcblx0XHQvLyBJZiBhIGRpZmZlcmVudCBjb21wYXJhdG9yIGlzIGRlZmluZWQsIGJhaWwuXG5cdFx0aWYgKCB0aGlzLmNvbXBhcmF0b3IgJiYgdGhpcy5jb21wYXJhdG9yICE9PSBBdHRhY2htZW50cy5jb21wYXJhdG9yICkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGlmICggb3JkZXJieSAmJiAncG9zdF9faW4nICE9PSBvcmRlcmJ5ICkge1xuXHRcdFx0dGhpcy5jb21wYXJhdG9yID0gQXR0YWNobWVudHMuY29tcGFyYXRvcjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGVsZXRlIHRoaXMuY29tcGFyYXRvcjtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBJZiB0aGUgYHF1ZXJ5YCBwcm9wZXJ0eSBpcyBzZXQgdG8gdHJ1ZSwgcXVlcnkgdGhlIHNlcnZlciB1c2luZ1xuXHQgKiB0aGUgYHByb3BzYCB2YWx1ZXMsIGFuZCBzeW5jIHRoZSByZXN1bHRzIHRvIHRoaXMgY29sbGVjdGlvbi5cblx0ICpcblx0ICogQGFjY2VzcyBwcml2YXRlXG5cdCAqXG5cdCAqIEBwYXJhbSB7QmFja2JvbmUuTW9kZWx9IG1vZGVsXG5cdCAqIEBwYXJhbSB7Qm9vbGVhbn0gcXVlcnlcblx0ICovXG5cdF9jaGFuZ2VRdWVyeTogZnVuY3Rpb24oIG1vZGVsLCBxdWVyeSApIHtcblx0XHRpZiAoIHF1ZXJ5ICkge1xuXHRcdFx0dGhpcy5wcm9wcy5vbiggJ2NoYW5nZScsIHRoaXMuX3JlcXVlcnksIHRoaXMgKTtcblx0XHRcdHRoaXMuX3JlcXVlcnkoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5wcm9wcy5vZmYoICdjaGFuZ2UnLCB0aGlzLl9yZXF1ZXJ5LCB0aGlzICk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQGFjY2VzcyBwcml2YXRlXG5cdCAqXG5cdCAqIEBwYXJhbSB7QmFja2JvbmUuTW9kZWx9IG1vZGVsXG5cdCAqL1xuXHRfY2hhbmdlRmlsdGVyZWRQcm9wczogZnVuY3Rpb24oIG1vZGVsICkge1xuXHRcdC8vIElmIHRoaXMgaXMgYSBxdWVyeSwgdXBkYXRpbmcgdGhlIGNvbGxlY3Rpb24gd2lsbCBiZSBoYW5kbGVkIGJ5XG5cdFx0Ly8gYHRoaXMuX3JlcXVlcnkoKWAuXG5cdFx0aWYgKCB0aGlzLnByb3BzLmdldCgncXVlcnknKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR2YXIgY2hhbmdlZCA9IF8uY2hhaW4oIG1vZGVsLmNoYW5nZWQgKS5tYXAoIGZ1bmN0aW9uKCB0LCBwcm9wICkge1xuXHRcdFx0dmFyIGZpbHRlciA9IEF0dGFjaG1lbnRzLmZpbHRlcnNbIHByb3AgXSxcblx0XHRcdFx0dGVybSA9IG1vZGVsLmdldCggcHJvcCApO1xuXG5cdFx0XHRpZiAoICEgZmlsdGVyICkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGlmICggdGVybSAmJiAhIHRoaXMuZmlsdGVyc1sgcHJvcCBdICkge1xuXHRcdFx0XHR0aGlzLmZpbHRlcnNbIHByb3AgXSA9IGZpbHRlcjtcblx0XHRcdH0gZWxzZSBpZiAoICEgdGVybSAmJiB0aGlzLmZpbHRlcnNbIHByb3AgXSA9PT0gZmlsdGVyICkge1xuXHRcdFx0XHRkZWxldGUgdGhpcy5maWx0ZXJzWyBwcm9wIF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdC8vIFJlY29yZCB0aGUgY2hhbmdlLlxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fSwgdGhpcyApLmFueSgpLnZhbHVlKCk7XG5cblx0XHRpZiAoICEgY2hhbmdlZCApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBJZiBubyBgQXR0YWNobWVudHNgIG1vZGVsIGlzIHByb3ZpZGVkIHRvIHNvdXJjZSB0aGUgc2VhcmNoZXNcblx0XHQvLyBmcm9tLCB0aGVuIGF1dG9tYXRpY2FsbHkgZ2VuZXJhdGUgYSBzb3VyY2UgZnJvbSB0aGUgZXhpc3Rpbmdcblx0XHQvLyBtb2RlbHMuXG5cdFx0aWYgKCAhIHRoaXMuX3NvdXJjZSApIHtcblx0XHRcdHRoaXMuX3NvdXJjZSA9IG5ldyBBdHRhY2htZW50cyggdGhpcy5tb2RlbHMgKTtcblx0XHR9XG5cblx0XHR0aGlzLnJlc2V0KCB0aGlzLl9zb3VyY2UuZmlsdGVyKCB0aGlzLnZhbGlkYXRvciwgdGhpcyApICk7XG5cdH0sXG5cblx0dmFsaWRhdGVEZXN0cm95ZWQ6IGZhbHNlLFxuXHQvKipcblx0ICogQ2hlY2tzIHdoZXRoZXIgYW4gYXR0YWNobWVudCBpcyB2YWxpZC5cblx0ICpcblx0ICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50fSBhdHRhY2htZW50XG5cdCAqIEByZXR1cm5zIHtCb29sZWFufVxuXHQgKi9cblx0dmFsaWRhdG9yOiBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblx0XHRpZiAoICEgdGhpcy52YWxpZGF0ZURlc3Ryb3llZCAmJiBhdHRhY2htZW50LmRlc3Ryb3llZCApIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIF8uYWxsKCB0aGlzLmZpbHRlcnMsIGZ1bmN0aW9uKCBmaWx0ZXIgKSB7XG5cdFx0XHRyZXR1cm4gISEgZmlsdGVyLmNhbGwoIHRoaXMsIGF0dGFjaG1lbnQgKTtcblx0XHR9LCB0aGlzICk7XG5cdH0sXG5cdC8qKlxuXHQgKiBBZGQgb3IgcmVtb3ZlIGFuIGF0dGFjaG1lbnQgdG8gdGhlIGNvbGxlY3Rpb24gZGVwZW5kaW5nIG9uIGl0cyB2YWxpZGl0eS5cblx0ICpcblx0ICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50fSBhdHRhY2htZW50XG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c30gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdHZhbGlkYXRlOiBmdW5jdGlvbiggYXR0YWNobWVudCwgb3B0aW9ucyApIHtcblx0XHR2YXIgdmFsaWQgPSB0aGlzLnZhbGlkYXRvciggYXR0YWNobWVudCApLFxuXHRcdFx0aGFzQXR0YWNobWVudCA9ICEhIHRoaXMuZ2V0KCBhdHRhY2htZW50LmNpZCApO1xuXG5cdFx0aWYgKCAhIHZhbGlkICYmIGhhc0F0dGFjaG1lbnQgKSB7XG5cdFx0XHR0aGlzLnJlbW92ZSggYXR0YWNobWVudCwgb3B0aW9ucyApO1xuXHRcdH0gZWxzZSBpZiAoIHZhbGlkICYmICEgaGFzQXR0YWNobWVudCApIHtcblx0XHRcdHRoaXMuYWRkKCBhdHRhY2htZW50LCBvcHRpb25zICk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEFkZCBvciByZW1vdmUgYWxsIGF0dGFjaG1lbnRzIGZyb20gYW5vdGhlciBjb2xsZWN0aW9uIGRlcGVuZGluZyBvbiBlYWNoIG9uZSdzIHZhbGlkaXR5LlxuXHQgKlxuXHQgKiBAcGFyYW0ge3dwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzfSBhdHRhY2htZW50c1xuXHQgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnM9e31dXG5cdCAqXG5cdCAqIEBmaXJlcyB3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50cyNyZXNldFxuXHQgKlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudHN9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHR2YWxpZGF0ZUFsbDogZnVuY3Rpb24oIGF0dGFjaG1lbnRzLCBvcHRpb25zICkge1xuXHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0Xy5lYWNoKCBhdHRhY2htZW50cy5tb2RlbHMsIGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXHRcdFx0dGhpcy52YWxpZGF0ZSggYXR0YWNobWVudCwgeyBzaWxlbnQ6IHRydWUgfSk7XG5cdFx0fSwgdGhpcyApO1xuXG5cdFx0aWYgKCAhIG9wdGlvbnMuc2lsZW50ICkge1xuXHRcdFx0dGhpcy50cmlnZ2VyKCAncmVzZXQnLCB0aGlzLCBvcHRpb25zICk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHQvKipcblx0ICogU3RhcnQgb2JzZXJ2aW5nIGFub3RoZXIgYXR0YWNobWVudHMgY29sbGVjdGlvbiBjaGFuZ2UgZXZlbnRzXG5cdCAqIGFuZCByZXBsaWNhdGUgdGhlbSBvbiB0aGlzIGNvbGxlY3Rpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudHN9IFRoZSBhdHRhY2htZW50cyBjb2xsZWN0aW9uIHRvIG9ic2VydmUuXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c30gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmcuXG5cdCAqL1xuXHRvYnNlcnZlOiBmdW5jdGlvbiggYXR0YWNobWVudHMgKSB7XG5cdFx0dGhpcy5vYnNlcnZlcnMgPSB0aGlzLm9ic2VydmVycyB8fCBbXTtcblx0XHR0aGlzLm9ic2VydmVycy5wdXNoKCBhdHRhY2htZW50cyApO1xuXG5cdFx0YXR0YWNobWVudHMub24oICdhZGQgY2hhbmdlIHJlbW92ZScsIHRoaXMuX3ZhbGlkYXRlSGFuZGxlciwgdGhpcyApO1xuXHRcdGF0dGFjaG1lbnRzLm9uKCAncmVzZXQnLCB0aGlzLl92YWxpZGF0ZUFsbEhhbmRsZXIsIHRoaXMgKTtcblx0XHR0aGlzLnZhbGlkYXRlQWxsKCBhdHRhY2htZW50cyApO1xuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHQvKipcblx0ICogU3RvcCByZXBsaWNhdGluZyBjb2xsZWN0aW9uIGNoYW5nZSBldmVudHMgZnJvbSBhbm90aGVyIGF0dGFjaG1lbnRzIGNvbGxlY3Rpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudHN9IFRoZSBhdHRhY2htZW50cyBjb2xsZWN0aW9uIHRvIHN0b3Agb2JzZXJ2aW5nLlxuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudHN9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHR1bm9ic2VydmU6IGZ1bmN0aW9uKCBhdHRhY2htZW50cyApIHtcblx0XHRpZiAoIGF0dGFjaG1lbnRzICkge1xuXHRcdFx0YXR0YWNobWVudHMub2ZmKCBudWxsLCBudWxsLCB0aGlzICk7XG5cdFx0XHR0aGlzLm9ic2VydmVycyA9IF8ud2l0aG91dCggdGhpcy5vYnNlcnZlcnMsIGF0dGFjaG1lbnRzICk7XG5cblx0XHR9IGVsc2Uge1xuXHRcdFx0Xy5lYWNoKCB0aGlzLm9ic2VydmVycywgZnVuY3Rpb24oIGF0dGFjaG1lbnRzICkge1xuXHRcdFx0XHRhdHRhY2htZW50cy5vZmYoIG51bGwsIG51bGwsIHRoaXMgKTtcblx0XHRcdH0sIHRoaXMgKTtcblx0XHRcdGRlbGV0ZSB0aGlzLm9ic2VydmVycztcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fSxcblx0LyoqXG5cdCAqIEBhY2Nlc3MgcHJpdmF0ZVxuXHQgKlxuXHQgKiBAcGFyYW0ge3dwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzfSBhdHRhY2htZW50XG5cdCAqIEBwYXJhbSB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudHN9IGF0dGFjaG1lbnRzXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cdCAqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c30gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdF92YWxpZGF0ZUhhbmRsZXI6IGZ1bmN0aW9uKCBhdHRhY2htZW50LCBhdHRhY2htZW50cywgb3B0aW9ucyApIHtcblx0XHQvLyBJZiB3ZSdyZSBub3QgbWlycm9yaW5nIHRoaXMgYGF0dGFjaG1lbnRzYCBjb2xsZWN0aW9uLFxuXHRcdC8vIG9ubHkgcmV0YWluIHRoZSBgc2lsZW50YCBvcHRpb24uXG5cdFx0b3B0aW9ucyA9IGF0dGFjaG1lbnRzID09PSB0aGlzLm1pcnJvcmluZyA/IG9wdGlvbnMgOiB7XG5cdFx0XHRzaWxlbnQ6IG9wdGlvbnMgJiYgb3B0aW9ucy5zaWxlbnRcblx0XHR9O1xuXG5cdFx0cmV0dXJuIHRoaXMudmFsaWRhdGUoIGF0dGFjaG1lbnQsIG9wdGlvbnMgKTtcblx0fSxcblx0LyoqXG5cdCAqIEBhY2Nlc3MgcHJpdmF0ZVxuXHQgKlxuXHQgKiBAcGFyYW0ge3dwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzfSBhdHRhY2htZW50c1xuXHQgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuXHQgKiBAcmV0dXJucyB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudHN9IFJldHVybnMgaXRzZWxmIHRvIGFsbG93IGNoYWluaW5nXG5cdCAqL1xuXHRfdmFsaWRhdGVBbGxIYW5kbGVyOiBmdW5jdGlvbiggYXR0YWNobWVudHMsIG9wdGlvbnMgKSB7XG5cdFx0cmV0dXJuIHRoaXMudmFsaWRhdGVBbGwoIGF0dGFjaG1lbnRzLCBvcHRpb25zICk7XG5cdH0sXG5cdC8qKlxuXHQgKiBTdGFydCBtaXJyb3JpbmcgYW5vdGhlciBhdHRhY2htZW50cyBjb2xsZWN0aW9uLCBjbGVhcmluZyBvdXQgYW55IG1vZGVscyBhbHJlYWR5XG5cdCAqIGluIHRoZSBjb2xsZWN0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3dwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzfSBUaGUgYXR0YWNobWVudHMgY29sbGVjdGlvbiB0byBtaXJyb3IuXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c30gUmV0dXJucyBpdHNlbGYgdG8gYWxsb3cgY2hhaW5pbmdcblx0ICovXG5cdG1pcnJvcjogZnVuY3Rpb24oIGF0dGFjaG1lbnRzICkge1xuXHRcdGlmICggdGhpcy5taXJyb3JpbmcgJiYgdGhpcy5taXJyb3JpbmcgPT09IGF0dGFjaG1lbnRzICkge1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fVxuXG5cdFx0dGhpcy51bm1pcnJvcigpO1xuXHRcdHRoaXMubWlycm9yaW5nID0gYXR0YWNobWVudHM7XG5cblx0XHQvLyBDbGVhciB0aGUgY29sbGVjdGlvbiBzaWxlbnRseS4gQSBgcmVzZXRgIGV2ZW50IHdpbGwgYmUgZmlyZWRcblx0XHQvLyB3aGVuIGBvYnNlcnZlKClgIGNhbGxzIGB2YWxpZGF0ZUFsbCgpYC5cblx0XHR0aGlzLnJlc2V0KCBbXSwgeyBzaWxlbnQ6IHRydWUgfSApO1xuXHRcdHRoaXMub2JzZXJ2ZSggYXR0YWNobWVudHMgKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9LFxuXHQvKipcblx0ICogU3RvcCBtaXJyb3JpbmcgYW5vdGhlciBhdHRhY2htZW50cyBjb2xsZWN0aW9uLlxuXHQgKi9cblx0dW5taXJyb3I6IGZ1bmN0aW9uKCkge1xuXHRcdGlmICggISB0aGlzLm1pcnJvcmluZyApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLnVub2JzZXJ2ZSggdGhpcy5taXJyb3JpbmcgKTtcblx0XHRkZWxldGUgdGhpcy5taXJyb3Jpbmc7XG5cdH0sXG5cdC8qKlxuXHQgKiBSZXRyaXZlIG1vcmUgYXR0YWNobWVudHMgZnJvbSB0aGUgc2VydmVyIGZvciB0aGUgY29sbGVjdGlvbi5cblx0ICpcblx0ICogT25seSB3b3JrcyBpZiB0aGUgY29sbGVjdGlvbiBpcyBtaXJyb3JpbmcgYSBRdWVyeSBBdHRhY2htZW50cyBjb2xsZWN0aW9uLFxuXHQgKiBhbmQgZm9yd2FyZHMgdG8gaXRzIGBtb3JlYCBtZXRob2QuIFRoaXMgY29sbGVjdGlvbiBjbGFzcyBkb2Vzbid0IGhhdmVcblx0ICogc2VydmVyIHBlcnNpc3RlbmNlIGJ5IGl0c2VsZi5cblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IG9wdGlvbnNcblx0ICogQHJldHVybnMge1Byb21pc2V9XG5cdCAqL1xuXHRtb3JlOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHR2YXIgZGVmZXJyZWQgPSBqUXVlcnkuRGVmZXJyZWQoKSxcblx0XHRcdG1pcnJvcmluZyA9IHRoaXMubWlycm9yaW5nLFxuXHRcdFx0YXR0YWNobWVudHMgPSB0aGlzO1xuXG5cdFx0aWYgKCAhIG1pcnJvcmluZyB8fCAhIG1pcnJvcmluZy5tb3JlICkge1xuXHRcdFx0cmV0dXJuIGRlZmVycmVkLnJlc29sdmVXaXRoKCB0aGlzICkucHJvbWlzZSgpO1xuXHRcdH1cblx0XHQvLyBJZiB3ZSdyZSBtaXJyb3JpbmcgYW5vdGhlciBjb2xsZWN0aW9uLCBmb3J3YXJkIGBtb3JlYCB0b1xuXHRcdC8vIHRoZSBtaXJyb3JlZCBjb2xsZWN0aW9uLiBBY2NvdW50IGZvciBhIHJhY2UgY29uZGl0aW9uIGJ5XG5cdFx0Ly8gY2hlY2tpbmcgaWYgd2UncmUgc3RpbGwgbWlycm9yaW5nIHRoYXQgY29sbGVjdGlvbiB3aGVuXG5cdFx0Ly8gdGhlIHJlcXVlc3QgcmVzb2x2ZXMuXG5cdFx0bWlycm9yaW5nLm1vcmUoIG9wdGlvbnMgKS5kb25lKCBmdW5jdGlvbigpIHtcblx0XHRcdGlmICggdGhpcyA9PT0gYXR0YWNobWVudHMubWlycm9yaW5nICkge1xuXHRcdFx0XHRkZWZlcnJlZC5yZXNvbHZlV2l0aCggdGhpcyApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGRlZmVycmVkLnByb21pc2UoKTtcblx0fSxcblx0LyoqXG5cdCAqIFdoZXRoZXIgdGhlcmUgYXJlIG1vcmUgYXR0YWNobWVudHMgdGhhdCBoYXZlbid0IGJlZW4gc3luYydkIGZyb20gdGhlIHNlcnZlclxuXHQgKiB0aGF0IG1hdGNoIHRoZSBjb2xsZWN0aW9uJ3MgcXVlcnkuXG5cdCAqXG5cdCAqIE9ubHkgd29ya3MgaWYgdGhlIGNvbGxlY3Rpb24gaXMgbWlycm9yaW5nIGEgUXVlcnkgQXR0YWNobWVudHMgY29sbGVjdGlvbixcblx0ICogYW5kIGZvcndhcmRzIHRvIGl0cyBgaGFzTW9yZWAgbWV0aG9kLiBUaGlzIGNvbGxlY3Rpb24gY2xhc3MgZG9lc24ndCBoYXZlXG5cdCAqIHNlcnZlciBwZXJzaXN0ZW5jZSBieSBpdHNlbGYuXG5cdCAqXG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0aGFzTW9yZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMubWlycm9yaW5nID8gdGhpcy5taXJyb3JpbmcuaGFzTW9yZSgpIDogZmFsc2U7XG5cdH0sXG5cdC8qKlxuXHQgKiBBIGN1c3RvbSBBSkFYLXJlc3BvbnNlIHBhcnNlci5cblx0ICpcblx0ICogU2VlIHRyYWMgdGlja2V0ICMyNDc1M1xuXHQgKlxuXHQgKiBAcGFyYW0ge09iamVjdHxBcnJheX0gcmVzcCBUaGUgcmF3IHJlc3BvbnNlIE9iamVjdC9BcnJheS5cblx0ICogQHBhcmFtIHtPYmplY3R9IHhoclxuXHQgKiBAcmV0dXJucyB7QXJyYXl9IFRoZSBhcnJheSBvZiBtb2RlbCBhdHRyaWJ1dGVzIHRvIGJlIGFkZGVkIHRvIHRoZSBjb2xsZWN0aW9uXG5cdCAqL1xuXHRwYXJzZTogZnVuY3Rpb24oIHJlc3AsIHhociApIHtcblx0XHRpZiAoICEgXy5pc0FycmF5KCByZXNwICkgKSB7XG5cdFx0XHRyZXNwID0gW3Jlc3BdO1xuXHRcdH1cblxuXHRcdHJldHVybiBfLm1hcCggcmVzcCwgZnVuY3Rpb24oIGF0dHJzICkge1xuXHRcdFx0dmFyIGlkLCBhdHRhY2htZW50LCBuZXdBdHRyaWJ1dGVzO1xuXG5cdFx0XHRpZiAoIGF0dHJzIGluc3RhbmNlb2YgQmFja2JvbmUuTW9kZWwgKSB7XG5cdFx0XHRcdGlkID0gYXR0cnMuZ2V0KCAnaWQnICk7XG5cdFx0XHRcdGF0dHJzID0gYXR0cnMuYXR0cmlidXRlcztcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGlkID0gYXR0cnMuaWQ7XG5cdFx0XHR9XG5cblx0XHRcdGF0dGFjaG1lbnQgPSB3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50LmdldCggaWQgKTtcblx0XHRcdG5ld0F0dHJpYnV0ZXMgPSBhdHRhY2htZW50LnBhcnNlKCBhdHRycywgeGhyICk7XG5cblx0XHRcdGlmICggISBfLmlzRXF1YWwoIGF0dGFjaG1lbnQuYXR0cmlidXRlcywgbmV3QXR0cmlidXRlcyApICkge1xuXHRcdFx0XHRhdHRhY2htZW50LnNldCggbmV3QXR0cmlidXRlcyApO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gYXR0YWNobWVudDtcblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqIElmIHRoZSBjb2xsZWN0aW9uIGlzIGEgcXVlcnksIGNyZWF0ZSBhbmQgbWlycm9yIGFuIEF0dGFjaG1lbnRzIFF1ZXJ5IGNvbGxlY3Rpb24uXG5cdCAqXG5cdCAqIEBhY2Nlc3MgcHJpdmF0ZVxuXHQgKi9cblx0X3JlcXVlcnk6IGZ1bmN0aW9uKCByZWZyZXNoICkge1xuXHRcdHZhciBwcm9wcztcblx0XHRpZiAoIHRoaXMucHJvcHMuZ2V0KCdxdWVyeScpICkge1xuXHRcdFx0cHJvcHMgPSB0aGlzLnByb3BzLnRvSlNPTigpO1xuXHRcdFx0cHJvcHMuY2FjaGUgPSAoIHRydWUgIT09IHJlZnJlc2ggKTtcblx0XHRcdHRoaXMubWlycm9yKCB3cC5tZWRpYS5tb2RlbC5RdWVyeS5nZXQoIHByb3BzICkgKTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBJZiB0aGlzIGNvbGxlY3Rpb24gaXMgc29ydGVkIGJ5IGBtZW51T3JkZXJgLCByZWNhbGN1bGF0ZXMgYW5kIHNhdmVzXG5cdCAqIHRoZSBtZW51IG9yZGVyIHRvIHRoZSBkYXRhYmFzZS5cblx0ICpcblx0ICogQHJldHVybnMge3VuZGVmaW5lZHxQcm9taXNlfVxuXHQgKi9cblx0c2F2ZU1lbnVPcmRlcjogZnVuY3Rpb24oKSB7XG5cdFx0aWYgKCAnbWVudU9yZGVyJyAhPT0gdGhpcy5wcm9wcy5nZXQoJ29yZGVyYnknKSApIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvLyBSZW1vdmVzIGFueSB1cGxvYWRpbmcgYXR0YWNobWVudHMsIHVwZGF0ZXMgZWFjaCBhdHRhY2htZW50J3Ncblx0XHQvLyBtZW51IG9yZGVyLCBhbmQgcmV0dXJucyBhbiBvYmplY3Qgd2l0aCBhbiB7IGlkOiBtZW51T3JkZXIgfVxuXHRcdC8vIG1hcHBpbmcgdG8gcGFzcyB0byB0aGUgcmVxdWVzdC5cblx0XHR2YXIgYXR0YWNobWVudHMgPSB0aGlzLmNoYWluKCkuZmlsdGVyKCBmdW5jdGlvbiggYXR0YWNobWVudCApIHtcblx0XHRcdHJldHVybiAhIF8uaXNVbmRlZmluZWQoIGF0dGFjaG1lbnQuaWQgKTtcblx0XHR9KS5tYXAoIGZ1bmN0aW9uKCBhdHRhY2htZW50LCBpbmRleCApIHtcblx0XHRcdC8vIEluZGljZXMgc3RhcnQgYXQgMS5cblx0XHRcdGluZGV4ID0gaW5kZXggKyAxO1xuXHRcdFx0YXR0YWNobWVudC5zZXQoICdtZW51T3JkZXInLCBpbmRleCApO1xuXHRcdFx0cmV0dXJuIFsgYXR0YWNobWVudC5pZCwgaW5kZXggXTtcblx0XHR9KS5vYmplY3QoKS52YWx1ZSgpO1xuXG5cdFx0aWYgKCBfLmlzRW1wdHkoIGF0dGFjaG1lbnRzICkgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHdwLm1lZGlhLnBvc3QoICdzYXZlLWF0dGFjaG1lbnQtb3JkZXInLCB7XG5cdFx0XHRub25jZTogICAgICAgd3AubWVkaWEubW9kZWwuc2V0dGluZ3MucG9zdC5ub25jZSxcblx0XHRcdHBvc3RfaWQ6ICAgICB3cC5tZWRpYS5tb2RlbC5zZXR0aW5ncy5wb3N0LmlkLFxuXHRcdFx0YXR0YWNobWVudHM6IGF0dGFjaG1lbnRzXG5cdFx0fSk7XG5cdH1cbn0sIHtcblx0LyoqXG5cdCAqIEEgZnVuY3Rpb24gdG8gY29tcGFyZSB0d28gYXR0YWNobWVudCBtb2RlbHMgaW4gYW4gYXR0YWNobWVudHMgY29sbGVjdGlvbi5cblx0ICpcblx0ICogVXNlZCBhcyB0aGUgZGVmYXVsdCBjb21wYXJhdG9yIGZvciBpbnN0YW5jZXMgb2Ygd3AubWVkaWEubW9kZWwuQXR0YWNobWVudHNcblx0ICogYW5kIGl0cyBzdWJjbGFzc2VzLiBAc2VlIHdwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzLl9jaGFuZ2VPcmRlcmJ5KCkuXG5cdCAqXG5cdCAqIEBzdGF0aWNcblx0ICpcblx0ICogQHBhcmFtIHtCYWNrYm9uZS5Nb2RlbH0gYVxuXHQgKiBAcGFyYW0ge0JhY2tib25lLk1vZGVsfSBiXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cdCAqIEByZXR1cm5zIHtOdW1iZXJ9IC0xIGlmIHRoZSBmaXJzdCBtb2RlbCBzaG91bGQgY29tZSBiZWZvcmUgdGhlIHNlY29uZCxcblx0ICogICAgMCBpZiB0aGV5IGFyZSBvZiB0aGUgc2FtZSByYW5rIGFuZFxuXHQgKiAgICAxIGlmIHRoZSBmaXJzdCBtb2RlbCBzaG91bGQgY29tZSBhZnRlci5cblx0ICovXG5cdGNvbXBhcmF0b3I6IGZ1bmN0aW9uKCBhLCBiLCBvcHRpb25zICkge1xuXHRcdHZhciBrZXkgICA9IHRoaXMucHJvcHMuZ2V0KCdvcmRlcmJ5JyksXG5cdFx0XHRvcmRlciA9IHRoaXMucHJvcHMuZ2V0KCdvcmRlcicpIHx8ICdERVNDJyxcblx0XHRcdGFjICAgID0gYS5jaWQsXG5cdFx0XHRiYyAgICA9IGIuY2lkO1xuXG5cdFx0YSA9IGEuZ2V0KCBrZXkgKTtcblx0XHRiID0gYi5nZXQoIGtleSApO1xuXG5cdFx0aWYgKCAnZGF0ZScgPT09IGtleSB8fCAnbW9kaWZpZWQnID09PSBrZXkgKSB7XG5cdFx0XHRhID0gYSB8fCBuZXcgRGF0ZSgpO1xuXHRcdFx0YiA9IGIgfHwgbmV3IERhdGUoKTtcblx0XHR9XG5cblx0XHQvLyBJZiBgb3B0aW9ucy50aWVzYCBpcyBzZXQsIGRvbid0IGVuZm9yY2UgdGhlIGBjaWRgIHRpZWJyZWFrZXIuXG5cdFx0aWYgKCBvcHRpb25zICYmIG9wdGlvbnMudGllcyApIHtcblx0XHRcdGFjID0gYmMgPSBudWxsO1xuXHRcdH1cblxuXHRcdHJldHVybiAoICdERVNDJyA9PT0gb3JkZXIgKSA/IHdwLm1lZGlhLmNvbXBhcmUoIGEsIGIsIGFjLCBiYyApIDogd3AubWVkaWEuY29tcGFyZSggYiwgYSwgYmMsIGFjICk7XG5cdH0sXG5cdC8qKlxuXHQgKiBAbmFtZXNwYWNlXG5cdCAqL1xuXHRmaWx0ZXJzOiB7XG5cdFx0LyoqXG5cdFx0ICogQHN0YXRpY1xuXHRcdCAqIE5vdGUgdGhhdCB0aGlzIGNsaWVudC1zaWRlIHNlYXJjaGluZyBpcyAqbm90KiBlcXVpdmFsZW50XG5cdFx0ICogdG8gb3VyIHNlcnZlci1zaWRlIHNlYXJjaGluZy5cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudH0gYXR0YWNobWVudFxuXHRcdCAqXG5cdFx0ICogQHRoaXMgd3AubWVkaWEubW9kZWwuQXR0YWNobWVudHNcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtCb29sZWFufVxuXHRcdCAqL1xuXHRcdHNlYXJjaDogZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cdFx0XHRpZiAoICEgdGhpcy5wcm9wcy5nZXQoJ3NlYXJjaCcpICkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIF8uYW55KFsndGl0bGUnLCdmaWxlbmFtZScsJ2Rlc2NyaXB0aW9uJywnY2FwdGlvbicsJ25hbWUnXSwgZnVuY3Rpb24oIGtleSApIHtcblx0XHRcdFx0dmFyIHZhbHVlID0gYXR0YWNobWVudC5nZXQoIGtleSApO1xuXHRcdFx0XHRyZXR1cm4gdmFsdWUgJiYgLTEgIT09IHZhbHVlLnNlYXJjaCggdGhpcy5wcm9wcy5nZXQoJ3NlYXJjaCcpICk7XG5cdFx0XHR9LCB0aGlzICk7XG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBAc3RhdGljXG5cdFx0ICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50fSBhdHRhY2htZW50XG5cdFx0ICpcblx0XHQgKiBAdGhpcyB3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge0Jvb2xlYW59XG5cdFx0ICovXG5cdFx0dHlwZTogZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cdFx0XHR2YXIgdHlwZSA9IHRoaXMucHJvcHMuZ2V0KCd0eXBlJyksIGF0dHMgPSBhdHRhY2htZW50LnRvSlNPTigpLCBtaW1lLCBmb3VuZDtcblxuXHRcdFx0aWYgKCAhIHR5cGUgfHwgKCBfLmlzQXJyYXkoIHR5cGUgKSAmJiAhIHR5cGUubGVuZ3RoICkgKSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXG5cdFx0XHRtaW1lID0gYXR0cy5taW1lIHx8ICggYXR0cy5maWxlICYmIGF0dHMuZmlsZS50eXBlICkgfHwgJyc7XG5cblx0XHRcdGlmICggXy5pc0FycmF5KCB0eXBlICkgKSB7XG5cdFx0XHRcdGZvdW5kID0gXy5maW5kKCB0eXBlLCBmdW5jdGlvbiAodCkge1xuXHRcdFx0XHRcdHJldHVybiAtMSAhPT0gbWltZS5pbmRleE9mKCB0ICk7XG5cdFx0XHRcdH0gKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZvdW5kID0gLTEgIT09IG1pbWUuaW5kZXhPZiggdHlwZSApO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gZm91bmQ7XG5cdFx0fSxcblx0XHQvKipcblx0XHQgKiBAc3RhdGljXG5cdFx0ICogQHBhcmFtIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50fSBhdHRhY2htZW50XG5cdFx0ICpcblx0XHQgKiBAdGhpcyB3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c1xuXHRcdCAqXG5cdFx0ICogQHJldHVybnMge0Jvb2xlYW59XG5cdFx0ICovXG5cdFx0dXBsb2FkZWRUbzogZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cdFx0XHR2YXIgdXBsb2FkZWRUbyA9IHRoaXMucHJvcHMuZ2V0KCd1cGxvYWRlZFRvJyk7XG5cdFx0XHRpZiAoIF8uaXNVbmRlZmluZWQoIHVwbG9hZGVkVG8gKSApIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB1cGxvYWRlZFRvID09PSBhdHRhY2htZW50LmdldCgndXBsb2FkZWRUbycpO1xuXHRcdH0sXG5cdFx0LyoqXG5cdFx0ICogQHN0YXRpY1xuXHRcdCAqIEBwYXJhbSB7d3AubWVkaWEubW9kZWwuQXR0YWNobWVudH0gYXR0YWNobWVudFxuXHRcdCAqXG5cdFx0ICogQHRoaXMgd3AubWVkaWEubW9kZWwuQXR0YWNobWVudHNcblx0XHQgKlxuXHRcdCAqIEByZXR1cm5zIHtCb29sZWFufVxuXHRcdCAqL1xuXHRcdHN0YXR1czogZnVuY3Rpb24oIGF0dGFjaG1lbnQgKSB7XG5cdFx0XHR2YXIgc3RhdHVzID0gdGhpcy5wcm9wcy5nZXQoJ3N0YXR1cycpO1xuXHRcdFx0aWYgKCBfLmlzVW5kZWZpbmVkKCBzdGF0dXMgKSApIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBzdGF0dXMgPT09IGF0dGFjaG1lbnQuZ2V0KCdzdGF0dXMnKTtcblx0XHR9XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEF0dGFjaG1lbnRzO1xuIiwiLypnbG9iYWxzIEJhY2tib25lICovXG5cbi8qKlxuICogd3AubWVkaWEubW9kZWwuUG9zdEltYWdlXG4gKlxuICogQW4gaW5zdGFuY2Ugb2YgYW4gaW1hZ2UgdGhhdCdzIGJlZW4gZW1iZWRkZWQgaW50byBhIHBvc3QuXG4gKlxuICogVXNlZCBpbiB0aGUgZW1iZWRkZWQgaW1hZ2UgYXR0YWNobWVudCBkaXNwbGF5IHNldHRpbmdzIG1vZGFsIC0gQHNlZSB3cC5tZWRpYS52aWV3Lk1lZGlhRnJhbWUuSW1hZ2VEZXRhaWxzLlxuICpcbiAqIEBjbGFzc1xuICogQGF1Z21lbnRzIEJhY2tib25lLk1vZGVsXG4gKlxuICogQHBhcmFtIHtpbnR9IFthdHRyaWJ1dGVzXSAgICAgICAgICAgICAgIEluaXRpYWwgbW9kZWwgYXR0cmlidXRlcy5cbiAqIEBwYXJhbSB7aW50fSBbYXR0cmlidXRlcy5hdHRhY2htZW50X2lkXSBJRCBvZiB0aGUgYXR0YWNobWVudC5cbiAqKi9cbnZhciBQb3N0SW1hZ2UgPSBCYWNrYm9uZS5Nb2RlbC5leHRlbmQoe1xuXG5cdGluaXRpYWxpemU6IGZ1bmN0aW9uKCBhdHRyaWJ1dGVzICkge1xuXHRcdHZhciBBdHRhY2htZW50ID0gd3AubWVkaWEubW9kZWwuQXR0YWNobWVudDtcblx0XHR0aGlzLmF0dGFjaG1lbnQgPSBmYWxzZTtcblxuXHRcdGlmICggYXR0cmlidXRlcy5hdHRhY2htZW50X2lkICkge1xuXHRcdFx0dGhpcy5hdHRhY2htZW50ID0gQXR0YWNobWVudC5nZXQoIGF0dHJpYnV0ZXMuYXR0YWNobWVudF9pZCApO1xuXHRcdFx0aWYgKCB0aGlzLmF0dGFjaG1lbnQuZ2V0KCAndXJsJyApICkge1xuXHRcdFx0XHR0aGlzLmRmZCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xuXHRcdFx0XHR0aGlzLmRmZC5yZXNvbHZlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmRmZCA9IHRoaXMuYXR0YWNobWVudC5mZXRjaCgpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5iaW5kQXR0YWNobWVudExpc3RlbmVycygpO1xuXHRcdH1cblxuXHRcdC8vIGtlZXAgdXJsIGluIHN5bmMgd2l0aCBjaGFuZ2VzIHRvIHRoZSB0eXBlIG9mIGxpbmtcblx0XHR0aGlzLm9uKCAnY2hhbmdlOmxpbmsnLCB0aGlzLnVwZGF0ZUxpbmtVcmwsIHRoaXMgKTtcblx0XHR0aGlzLm9uKCAnY2hhbmdlOnNpemUnLCB0aGlzLnVwZGF0ZVNpemUsIHRoaXMgKTtcblxuXHRcdHRoaXMuc2V0TGlua1R5cGVGcm9tVXJsKCk7XG5cdFx0dGhpcy5zZXRBc3BlY3RSYXRpbygpO1xuXG5cdFx0dGhpcy5zZXQoICdvcmlnaW5hbFVybCcsIGF0dHJpYnV0ZXMudXJsICk7XG5cdH0sXG5cblx0YmluZEF0dGFjaG1lbnRMaXN0ZW5lcnM6IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMuYXR0YWNobWVudCwgJ3N5bmMnLCB0aGlzLnNldExpbmtUeXBlRnJvbVVybCApO1xuXHRcdHRoaXMubGlzdGVuVG8oIHRoaXMuYXR0YWNobWVudCwgJ3N5bmMnLCB0aGlzLnNldEFzcGVjdFJhdGlvICk7XG5cdFx0dGhpcy5saXN0ZW5UbyggdGhpcy5hdHRhY2htZW50LCAnY2hhbmdlJywgdGhpcy51cGRhdGVTaXplICk7XG5cdH0sXG5cblx0Y2hhbmdlQXR0YWNobWVudDogZnVuY3Rpb24oIGF0dGFjaG1lbnQsIHByb3BzICkge1xuXHRcdHRoaXMuc3RvcExpc3RlbmluZyggdGhpcy5hdHRhY2htZW50ICk7XG5cdFx0dGhpcy5hdHRhY2htZW50ID0gYXR0YWNobWVudDtcblx0XHR0aGlzLmJpbmRBdHRhY2htZW50TGlzdGVuZXJzKCk7XG5cblx0XHR0aGlzLnNldCggJ2F0dGFjaG1lbnRfaWQnLCB0aGlzLmF0dGFjaG1lbnQuZ2V0KCAnaWQnICkgKTtcblx0XHR0aGlzLnNldCggJ2NhcHRpb24nLCB0aGlzLmF0dGFjaG1lbnQuZ2V0KCAnY2FwdGlvbicgKSApO1xuXHRcdHRoaXMuc2V0KCAnYWx0JywgdGhpcy5hdHRhY2htZW50LmdldCggJ2FsdCcgKSApO1xuXHRcdHRoaXMuc2V0KCAnc2l6ZScsIHByb3BzLmdldCggJ3NpemUnICkgKTtcblx0XHR0aGlzLnNldCggJ2FsaWduJywgcHJvcHMuZ2V0KCAnYWxpZ24nICkgKTtcblx0XHR0aGlzLnNldCggJ2xpbmsnLCBwcm9wcy5nZXQoICdsaW5rJyApICk7XG5cdFx0dGhpcy51cGRhdGVMaW5rVXJsKCk7XG5cdFx0dGhpcy51cGRhdGVTaXplKCk7XG5cdH0sXG5cblx0c2V0TGlua1R5cGVGcm9tVXJsOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbGlua1VybCA9IHRoaXMuZ2V0KCAnbGlua1VybCcgKSxcblx0XHRcdHR5cGU7XG5cblx0XHRpZiAoICEgbGlua1VybCApIHtcblx0XHRcdHRoaXMuc2V0KCAnbGluaycsICdub25lJyApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIGRlZmF1bHQgdG8gY3VzdG9tIGlmIHRoZXJlIGlzIGEgbGlua1VybFxuXHRcdHR5cGUgPSAnY3VzdG9tJztcblxuXHRcdGlmICggdGhpcy5hdHRhY2htZW50ICkge1xuXHRcdFx0aWYgKCB0aGlzLmF0dGFjaG1lbnQuZ2V0KCAndXJsJyApID09PSBsaW5rVXJsICkge1xuXHRcdFx0XHR0eXBlID0gJ2ZpbGUnO1xuXHRcdFx0fSBlbHNlIGlmICggdGhpcy5hdHRhY2htZW50LmdldCggJ2xpbmsnICkgPT09IGxpbmtVcmwgKSB7XG5cdFx0XHRcdHR5cGUgPSAncG9zdCc7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICggdGhpcy5nZXQoICd1cmwnICkgPT09IGxpbmtVcmwgKSB7XG5cdFx0XHRcdHR5cGUgPSAnZmlsZSc7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXQoICdsaW5rJywgdHlwZSApO1xuXHR9LFxuXG5cdHVwZGF0ZUxpbmtVcmw6IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBsaW5rID0gdGhpcy5nZXQoICdsaW5rJyApLFxuXHRcdFx0dXJsO1xuXG5cdFx0c3dpdGNoKCBsaW5rICkge1xuXHRcdFx0Y2FzZSAnZmlsZSc6XG5cdFx0XHRcdGlmICggdGhpcy5hdHRhY2htZW50ICkge1xuXHRcdFx0XHRcdHVybCA9IHRoaXMuYXR0YWNobWVudC5nZXQoICd1cmwnICk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dXJsID0gdGhpcy5nZXQoICd1cmwnICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5zZXQoICdsaW5rVXJsJywgdXJsICk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAncG9zdCc6XG5cdFx0XHRcdHRoaXMuc2V0KCAnbGlua1VybCcsIHRoaXMuYXR0YWNobWVudC5nZXQoICdsaW5rJyApICk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSAnbm9uZSc6XG5cdFx0XHRcdHRoaXMuc2V0KCAnbGlua1VybCcsICcnICk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fSxcblxuXHR1cGRhdGVTaXplOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgc2l6ZTtcblxuXHRcdGlmICggISB0aGlzLmF0dGFjaG1lbnQgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLmdldCggJ3NpemUnICkgPT09ICdjdXN0b20nICkge1xuXHRcdFx0dGhpcy5zZXQoICd3aWR0aCcsIHRoaXMuZ2V0KCAnY3VzdG9tV2lkdGgnICkgKTtcblx0XHRcdHRoaXMuc2V0KCAnaGVpZ2h0JywgdGhpcy5nZXQoICdjdXN0b21IZWlnaHQnICkgKTtcblx0XHRcdHRoaXMuc2V0KCAndXJsJywgdGhpcy5nZXQoICdvcmlnaW5hbFVybCcgKSApO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdHNpemUgPSB0aGlzLmF0dGFjaG1lbnQuZ2V0KCAnc2l6ZXMnIClbIHRoaXMuZ2V0KCAnc2l6ZScgKSBdO1xuXG5cdFx0aWYgKCAhIHNpemUgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXQoICd1cmwnLCBzaXplLnVybCApO1xuXHRcdHRoaXMuc2V0KCAnd2lkdGgnLCBzaXplLndpZHRoICk7XG5cdFx0dGhpcy5zZXQoICdoZWlnaHQnLCBzaXplLmhlaWdodCApO1xuXHR9LFxuXG5cdHNldEFzcGVjdFJhdGlvOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgZnVsbDtcblxuXHRcdGlmICggdGhpcy5hdHRhY2htZW50ICYmIHRoaXMuYXR0YWNobWVudC5nZXQoICdzaXplcycgKSApIHtcblx0XHRcdGZ1bGwgPSB0aGlzLmF0dGFjaG1lbnQuZ2V0KCAnc2l6ZXMnICkuZnVsbDtcblxuXHRcdFx0aWYgKCBmdWxsICkge1xuXHRcdFx0XHR0aGlzLnNldCggJ2FzcGVjdFJhdGlvJywgZnVsbC53aWR0aCAvIGZ1bGwuaGVpZ2h0ICk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLnNldCggJ2FzcGVjdFJhdGlvJywgdGhpcy5nZXQoICdjdXN0b21XaWR0aCcgKSAvIHRoaXMuZ2V0KCAnY3VzdG9tSGVpZ2h0JyApICk7XG5cdH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFBvc3RJbWFnZTtcbiIsIi8qZ2xvYmFscyB3cCwgXyAqL1xuXG4vKipcbiAqIHdwLm1lZGlhLm1vZGVsLlF1ZXJ5XG4gKlxuICogQSBjb2xsZWN0aW9uIG9mIGF0dGFjaG1lbnRzIHRoYXQgbWF0Y2ggdGhlIHN1cHBsaWVkIHF1ZXJ5IGFyZ3VtZW50cy5cbiAqXG4gKiBOb3RlOiBEbyBOT1QgY2hhbmdlIHRoaXMuYXJncyBhZnRlciB0aGUgcXVlcnkgaGFzIGJlZW4gaW5pdGlhbGl6ZWQuXG4gKiAgICAgICBUaGluZ3Mgd2lsbCBicmVhay5cbiAqXG4gKiBAY2xhc3NcbiAqIEBhdWdtZW50cyB3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50c1xuICogQGF1Z21lbnRzIEJhY2tib25lLkNvbGxlY3Rpb25cbiAqXG4gKiBAcGFyYW0ge2FycmF5fSAgW21vZGVsc10gICAgICAgICAgICAgICAgICAgICAgTW9kZWxzIHRvIGluaXRpYWxpemUgd2l0aCB0aGUgY29sbGVjdGlvbi5cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb3B0aW9uc10gICAgICAgICAgICAgICAgICAgICBPcHRpb25zIGhhc2guXG4gKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnMuYXJnc10gICAgICAgICAgICAgICAgQXR0YWNobWVudHMgcXVlcnkgYXJndW1lbnRzLlxuICogQHBhcmFtIHtvYmplY3R9IFtvcHRpb25zLmFyZ3MucG9zdHNfcGVyX3BhZ2VdXG4gKi9cbnZhciBBdHRhY2htZW50cyA9IHdwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzLFxuXHRRdWVyeTtcblxuUXVlcnkgPSBBdHRhY2htZW50cy5leHRlbmQoe1xuXHQvKipcblx0ICogQGdsb2JhbCB3cC5VcGxvYWRlclxuXHQgKlxuXHQgKiBAcGFyYW0ge2FycmF5fSAgW21vZGVscz1bXV0gIEFycmF5IG9mIGluaXRpYWwgbW9kZWxzIHRvIHBvcHVsYXRlIHRoZSBjb2xsZWN0aW9uLlxuXHQgKiBAcGFyYW0ge29iamVjdH0gW29wdGlvbnM9e31dXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggbW9kZWxzLCBvcHRpb25zICkge1xuXHRcdHZhciBhbGxvd2VkO1xuXG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0QXR0YWNobWVudHMucHJvdG90eXBlLmluaXRpYWxpemUuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuXG5cdFx0dGhpcy5hcmdzICAgICA9IG9wdGlvbnMuYXJncztcblx0XHR0aGlzLl9oYXNNb3JlID0gdHJ1ZTtcblx0XHR0aGlzLmNyZWF0ZWQgID0gbmV3IERhdGUoKTtcblxuXHRcdHRoaXMuZmlsdGVycy5vcmRlciA9IGZ1bmN0aW9uKCBhdHRhY2htZW50ICkge1xuXHRcdFx0dmFyIG9yZGVyYnkgPSB0aGlzLnByb3BzLmdldCgnb3JkZXJieScpLFxuXHRcdFx0XHRvcmRlciA9IHRoaXMucHJvcHMuZ2V0KCdvcmRlcicpO1xuXG5cdFx0XHRpZiAoICEgdGhpcy5jb21wYXJhdG9yICkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gV2Ugd2FudCBhbnkgaXRlbXMgdGhhdCBjYW4gYmUgcGxhY2VkIGJlZm9yZSB0aGUgbGFzdFxuXHRcdFx0Ly8gaXRlbSBpbiB0aGUgc2V0LiBJZiB3ZSBhZGQgYW55IGl0ZW1zIGFmdGVyIHRoZSBsYXN0XG5cdFx0XHQvLyBpdGVtLCB0aGVuIHdlIGNhbid0IGd1YXJhbnRlZSB0aGUgc2V0IGlzIGNvbXBsZXRlLlxuXHRcdFx0aWYgKCB0aGlzLmxlbmd0aCApIHtcblx0XHRcdFx0cmV0dXJuIDEgIT09IHRoaXMuY29tcGFyYXRvciggYXR0YWNobWVudCwgdGhpcy5sYXN0KCksIHsgdGllczogdHJ1ZSB9KTtcblxuXHRcdFx0Ly8gSGFuZGxlIHRoZSBjYXNlIHdoZXJlIHRoZXJlIGFyZSBubyBpdGVtcyB5ZXQgYW5kXG5cdFx0XHQvLyB3ZSdyZSBzb3J0aW5nIGZvciByZWNlbnQgaXRlbXMuIEluIHRoYXQgY2FzZSwgd2Ugd2FudFxuXHRcdFx0Ly8gY2hhbmdlcyB0aGF0IG9jY3VycmVkIGFmdGVyIHdlIGNyZWF0ZWQgdGhlIHF1ZXJ5LlxuXHRcdFx0fSBlbHNlIGlmICggJ0RFU0MnID09PSBvcmRlciAmJiAoICdkYXRlJyA9PT0gb3JkZXJieSB8fCAnbW9kaWZpZWQnID09PSBvcmRlcmJ5ICkgKSB7XG5cdFx0XHRcdHJldHVybiBhdHRhY2htZW50LmdldCggb3JkZXJieSApID49IHRoaXMuY3JlYXRlZDtcblxuXHRcdFx0Ly8gSWYgd2UncmUgc29ydGluZyBieSBtZW51IG9yZGVyIGFuZCB3ZSBoYXZlIG5vIGl0ZW1zLFxuXHRcdFx0Ly8gYWNjZXB0IGFueSBpdGVtcyB0aGF0IGhhdmUgdGhlIGRlZmF1bHQgbWVudSBvcmRlciAoMCkuXG5cdFx0XHR9IGVsc2UgaWYgKCAnQVNDJyA9PT0gb3JkZXIgJiYgJ21lbnVPcmRlcicgPT09IG9yZGVyYnkgKSB7XG5cdFx0XHRcdHJldHVybiBhdHRhY2htZW50LmdldCggb3JkZXJieSApID09PSAwO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBPdGhlcndpc2UsIHdlIGRvbid0IHdhbnQgYW55IGl0ZW1zIHlldC5cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9O1xuXG5cdFx0Ly8gT2JzZXJ2ZSB0aGUgY2VudHJhbCBgd3AuVXBsb2FkZXIucXVldWVgIGNvbGxlY3Rpb24gdG8gd2F0Y2ggZm9yXG5cdFx0Ly8gbmV3IG1hdGNoZXMgZm9yIHRoZSBxdWVyeS5cblx0XHQvL1xuXHRcdC8vIE9ubHkgb2JzZXJ2ZSB3aGVuIGEgbGltaXRlZCBudW1iZXIgb2YgcXVlcnkgYXJncyBhcmUgc2V0LiBUaGVyZVxuXHRcdC8vIGFyZSBubyBmaWx0ZXJzIGZvciBvdGhlciBwcm9wZXJ0aWVzLCBzbyBvYnNlcnZpbmcgd2lsbCByZXN1bHQgaW5cblx0XHQvLyBmYWxzZSBwb3NpdGl2ZXMgaW4gdGhvc2UgcXVlcmllcy5cblx0XHRhbGxvd2VkID0gWyAncycsICdvcmRlcicsICdvcmRlcmJ5JywgJ3Bvc3RzX3Blcl9wYWdlJywgJ3Bvc3RfbWltZV90eXBlJywgJ3Bvc3RfcGFyZW50JyBdO1xuXHRcdGlmICggd3AuVXBsb2FkZXIgJiYgXyggdGhpcy5hcmdzICkuY2hhaW4oKS5rZXlzKCkuZGlmZmVyZW5jZSggYWxsb3dlZCApLmlzRW1wdHkoKS52YWx1ZSgpICkge1xuXHRcdFx0dGhpcy5vYnNlcnZlKCB3cC5VcGxvYWRlci5xdWV1ZSApO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIFdoZXRoZXIgdGhlcmUgYXJlIG1vcmUgYXR0YWNobWVudHMgdGhhdCBoYXZlbid0IGJlZW4gc3luYydkIGZyb20gdGhlIHNlcnZlclxuXHQgKiB0aGF0IG1hdGNoIHRoZSBjb2xsZWN0aW9uJ3MgcXVlcnkuXG5cdCAqXG5cdCAqIEByZXR1cm5zIHtib29sZWFufVxuXHQgKi9cblx0aGFzTW9yZTogZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2hhc01vcmU7XG5cdH0sXG5cdC8qKlxuXHQgKiBGZXRjaCBtb3JlIGF0dGFjaG1lbnRzIGZyb20gdGhlIHNlcnZlciBmb3IgdGhlIGNvbGxlY3Rpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSAgIHtvYmplY3R9ICBbb3B0aW9ucz17fV1cblx0ICogQHJldHVybnMge1Byb21pc2V9XG5cdCAqL1xuXHRtb3JlOiBmdW5jdGlvbiggb3B0aW9ucyApIHtcblx0XHR2YXIgcXVlcnkgPSB0aGlzO1xuXG5cdFx0Ly8gSWYgdGhlcmUgaXMgYWxyZWFkeSBhIHJlcXVlc3QgcGVuZGluZywgcmV0dXJuIGVhcmx5IHdpdGggdGhlIERlZmVycmVkIG9iamVjdC5cblx0XHRpZiAoIHRoaXMuX21vcmUgJiYgJ3BlbmRpbmcnID09PSB0aGlzLl9tb3JlLnN0YXRlKCkgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fbW9yZTtcblx0XHR9XG5cblx0XHRpZiAoICEgdGhpcy5oYXNNb3JlKCkgKSB7XG5cdFx0XHRyZXR1cm4galF1ZXJ5LkRlZmVycmVkKCkucmVzb2x2ZVdpdGgoIHRoaXMgKS5wcm9taXNlKCk7XG5cdFx0fVxuXG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0b3B0aW9ucy5yZW1vdmUgPSBmYWxzZTtcblxuXHRcdHJldHVybiB0aGlzLl9tb3JlID0gdGhpcy5mZXRjaCggb3B0aW9ucyApLmRvbmUoIGZ1bmN0aW9uKCByZXNwICkge1xuXHRcdFx0aWYgKCBfLmlzRW1wdHkoIHJlc3AgKSB8fCAtMSA9PT0gdGhpcy5hcmdzLnBvc3RzX3Blcl9wYWdlIHx8IHJlc3AubGVuZ3RoIDwgdGhpcy5hcmdzLnBvc3RzX3Blcl9wYWdlICkge1xuXHRcdFx0XHRxdWVyeS5faGFzTW9yZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHQvKipcblx0ICogT3ZlcnJpZGVzIEJhY2tib25lLkNvbGxlY3Rpb24uc3luY1xuXHQgKiBPdmVycmlkZXMgd3AubWVkaWEubW9kZWwuQXR0YWNobWVudHMuc3luY1xuXHQgKlxuXHQgKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG5cdCAqIEBwYXJhbSB7QmFja2JvbmUuTW9kZWx9IG1vZGVsXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9ucz17fV1cblx0ICogQHJldHVybnMge1Byb21pc2V9XG5cdCAqL1xuXHRzeW5jOiBmdW5jdGlvbiggbWV0aG9kLCBtb2RlbCwgb3B0aW9ucyApIHtcblx0XHR2YXIgYXJncywgZmFsbGJhY2s7XG5cblx0XHQvLyBPdmVybG9hZCB0aGUgcmVhZCBtZXRob2Qgc28gQXR0YWNobWVudC5mZXRjaCgpIGZ1bmN0aW9ucyBjb3JyZWN0bHkuXG5cdFx0aWYgKCAncmVhZCcgPT09IG1ldGhvZCApIHtcblx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHRcdFx0b3B0aW9ucy5jb250ZXh0ID0gdGhpcztcblx0XHRcdG9wdGlvbnMuZGF0YSA9IF8uZXh0ZW5kKCBvcHRpb25zLmRhdGEgfHwge30sIHtcblx0XHRcdFx0YWN0aW9uOiAgJ3F1ZXJ5LWF0dGFjaG1lbnRzJyxcblx0XHRcdFx0cG9zdF9pZDogd3AubWVkaWEubW9kZWwuc2V0dGluZ3MucG9zdC5pZFxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIENsb25lIHRoZSBhcmdzIHNvIG1hbmlwdWxhdGlvbiBpcyBub24tZGVzdHJ1Y3RpdmUuXG5cdFx0XHRhcmdzID0gXy5jbG9uZSggdGhpcy5hcmdzICk7XG5cblx0XHRcdC8vIERldGVybWluZSB3aGljaCBwYWdlIHRvIHF1ZXJ5LlxuXHRcdFx0aWYgKCAtMSAhPT0gYXJncy5wb3N0c19wZXJfcGFnZSApIHtcblx0XHRcdFx0YXJncy5wYWdlZCA9IE1hdGgucm91bmQoIHRoaXMubGVuZ3RoIC8gYXJncy5wb3N0c19wZXJfcGFnZSApICsgMTtcblx0XHRcdH1cblxuXHRcdFx0b3B0aW9ucy5kYXRhLnF1ZXJ5ID0gYXJncztcblx0XHRcdHJldHVybiB3cC5tZWRpYS5hamF4KCBvcHRpb25zICk7XG5cblx0XHQvLyBPdGhlcndpc2UsIGZhbGwgYmFjayB0byBCYWNrYm9uZS5zeW5jKClcblx0XHR9IGVsc2Uge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBDYWxsIHdwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzLnN5bmMgb3IgQmFja2JvbmUuc3luY1xuXHRcdFx0ICovXG5cdFx0XHRmYWxsYmFjayA9IEF0dGFjaG1lbnRzLnByb3RvdHlwZS5zeW5jID8gQXR0YWNobWVudHMucHJvdG90eXBlIDogQmFja2JvbmU7XG5cdFx0XHRyZXR1cm4gZmFsbGJhY2suc3luYy5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0fVxuXHR9XG59LCB7XG5cdC8qKlxuXHQgKiBAcmVhZG9ubHlcblx0ICovXG5cdGRlZmF1bHRQcm9wczoge1xuXHRcdG9yZGVyYnk6ICdkYXRlJyxcblx0XHRvcmRlcjogICAnREVTQydcblx0fSxcblx0LyoqXG5cdCAqIEByZWFkb25seVxuXHQgKi9cblx0ZGVmYXVsdEFyZ3M6IHtcblx0XHRwb3N0c19wZXJfcGFnZTogNDBcblx0fSxcblx0LyoqXG5cdCAqIEByZWFkb25seVxuXHQgKi9cblx0b3JkZXJieToge1xuXHRcdGFsbG93ZWQ6ICBbICduYW1lJywgJ2F1dGhvcicsICdkYXRlJywgJ3RpdGxlJywgJ21vZGlmaWVkJywgJ3VwbG9hZGVkVG8nLCAnaWQnLCAncG9zdF9faW4nLCAnbWVudU9yZGVyJyBdLFxuXHRcdC8qKlxuXHRcdCAqIEEgbWFwIG9mIEphdmFTY3JpcHQgb3JkZXJieSB2YWx1ZXMgdG8gdGhlaXIgV1BfUXVlcnkgZXF1aXZhbGVudHMuXG5cdFx0ICogQHR5cGUge09iamVjdH1cblx0XHQgKi9cblx0XHR2YWx1ZW1hcDoge1xuXHRcdFx0J2lkJzogICAgICAgICAnSUQnLFxuXHRcdFx0J3VwbG9hZGVkVG8nOiAncGFyZW50Jyxcblx0XHRcdCdtZW51T3JkZXInOiAgJ21lbnVfb3JkZXIgSUQnXG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogQSBtYXAgb2YgSmF2YVNjcmlwdCBxdWVyeSBwcm9wZXJ0aWVzIHRvIHRoZWlyIFdQX1F1ZXJ5IGVxdWl2YWxlbnRzLlxuXHQgKlxuXHQgKiBAcmVhZG9ubHlcblx0ICovXG5cdHByb3BtYXA6IHtcblx0XHQnc2VhcmNoJzogICAgJ3MnLFxuXHRcdCd0eXBlJzogICAgICAncG9zdF9taW1lX3R5cGUnLFxuXHRcdCdwZXJQYWdlJzogICAncG9zdHNfcGVyX3BhZ2UnLFxuXHRcdCdtZW51T3JkZXInOiAnbWVudV9vcmRlcicsXG5cdFx0J3VwbG9hZGVkVG8nOiAncG9zdF9wYXJlbnQnLFxuXHRcdCdzdGF0dXMnOiAgICAgJ3Bvc3Rfc3RhdHVzJyxcblx0XHQnaW5jbHVkZSc6ICAgICdwb3N0X19pbicsXG5cdFx0J2V4Y2x1ZGUnOiAgICAncG9zdF9fbm90X2luJ1xuXHR9LFxuXHQvKipcblx0ICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhbiBBdHRhY2htZW50cyBRdWVyeSBjb2xsZWN0aW9uIGdpdmVuIHRoZSBwcm9wZXJ0aWVzLlxuXHQgKlxuXHQgKiBDYWNoZXMgcXVlcnkgb2JqZWN0cyBhbmQgcmV1c2VzIHdoZXJlIHBvc3NpYmxlLlxuXHQgKlxuXHQgKiBAc3RhdGljXG5cdCAqIEBtZXRob2Rcblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IFtwcm9wc11cblx0ICogQHBhcmFtIHtPYmplY3R9IFtwcm9wcy5jYWNoZT10cnVlXSAgIFdoZXRoZXIgdG8gdXNlIHRoZSBxdWVyeSBjYWNoZSBvciBub3QuXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHMub3JkZXJdXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHMub3JkZXJieV1cblx0ICogQHBhcmFtIHtPYmplY3R9IFtwcm9wcy5pbmNsdWRlXVxuXHQgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzLmV4Y2x1ZGVdXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBbcHJvcHMuc11cblx0ICogQHBhcmFtIHtPYmplY3R9IFtwcm9wcy5wb3N0X21pbWVfdHlwZV1cblx0ICogQHBhcmFtIHtPYmplY3R9IFtwcm9wcy5wb3N0c19wZXJfcGFnZV1cblx0ICogQHBhcmFtIHtPYmplY3R9IFtwcm9wcy5tZW51X29yZGVyXVxuXHQgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzLnBvc3RfcGFyZW50XVxuXHQgKiBAcGFyYW0ge09iamVjdH0gW3Byb3BzLnBvc3Rfc3RhdHVzXVxuXHQgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG5cdCAqXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5tb2RlbC5RdWVyeX0gQSBuZXcgQXR0YWNobWVudHMgUXVlcnkgY29sbGVjdGlvbi5cblx0ICovXG5cdGdldDogKGZ1bmN0aW9uKCl7XG5cdFx0LyoqXG5cdFx0ICogQHN0YXRpY1xuXHRcdCAqIEB0eXBlIEFycmF5XG5cdFx0ICovXG5cdFx0dmFyIHF1ZXJpZXMgPSBbXTtcblxuXHRcdC8qKlxuXHRcdCAqIEByZXR1cm5zIHtRdWVyeX1cblx0XHQgKi9cblx0XHRyZXR1cm4gZnVuY3Rpb24oIHByb3BzLCBvcHRpb25zICkge1xuXHRcdFx0dmFyIGFyZ3MgICAgID0ge30sXG5cdFx0XHRcdG9yZGVyYnkgID0gUXVlcnkub3JkZXJieSxcblx0XHRcdFx0ZGVmYXVsdHMgPSBRdWVyeS5kZWZhdWx0UHJvcHMsXG5cdFx0XHRcdHF1ZXJ5LFxuXHRcdFx0XHRjYWNoZSAgICA9ICEhIHByb3BzLmNhY2hlIHx8IF8uaXNVbmRlZmluZWQoIHByb3BzLmNhY2hlICk7XG5cblx0XHRcdC8vIFJlbW92ZSB0aGUgYHF1ZXJ5YCBwcm9wZXJ0eS4gVGhpcyBpc24ndCBsaW5rZWQgdG8gYSBxdWVyeSxcblx0XHRcdC8vIHRoaXMgKmlzKiB0aGUgcXVlcnkuXG5cdFx0XHRkZWxldGUgcHJvcHMucXVlcnk7XG5cdFx0XHRkZWxldGUgcHJvcHMuY2FjaGU7XG5cblx0XHRcdC8vIEZpbGwgZGVmYXVsdCBhcmdzLlxuXHRcdFx0Xy5kZWZhdWx0cyggcHJvcHMsIGRlZmF1bHRzICk7XG5cblx0XHRcdC8vIE5vcm1hbGl6ZSB0aGUgb3JkZXIuXG5cdFx0XHRwcm9wcy5vcmRlciA9IHByb3BzLm9yZGVyLnRvVXBwZXJDYXNlKCk7XG5cdFx0XHRpZiAoICdERVNDJyAhPT0gcHJvcHMub3JkZXIgJiYgJ0FTQycgIT09IHByb3BzLm9yZGVyICkge1xuXHRcdFx0XHRwcm9wcy5vcmRlciA9IGRlZmF1bHRzLm9yZGVyLnRvVXBwZXJDYXNlKCk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIEVuc3VyZSB3ZSBoYXZlIGEgdmFsaWQgb3JkZXJieSB2YWx1ZS5cblx0XHRcdGlmICggISBfLmNvbnRhaW5zKCBvcmRlcmJ5LmFsbG93ZWQsIHByb3BzLm9yZGVyYnkgKSApIHtcblx0XHRcdFx0cHJvcHMub3JkZXJieSA9IGRlZmF1bHRzLm9yZGVyYnk7XG5cdFx0XHR9XG5cblx0XHRcdF8uZWFjaCggWyAnaW5jbHVkZScsICdleGNsdWRlJyBdLCBmdW5jdGlvbiggcHJvcCApIHtcblx0XHRcdFx0aWYgKCBwcm9wc1sgcHJvcCBdICYmICEgXy5pc0FycmF5KCBwcm9wc1sgcHJvcCBdICkgKSB7XG5cdFx0XHRcdFx0cHJvcHNbIHByb3AgXSA9IFsgcHJvcHNbIHByb3AgXSBdO1xuXHRcdFx0XHR9XG5cdFx0XHR9ICk7XG5cblx0XHRcdC8vIEdlbmVyYXRlIHRoZSBxdWVyeSBgYXJnc2Agb2JqZWN0LlxuXHRcdFx0Ly8gQ29ycmVjdCBhbnkgZGlmZmVyaW5nIHByb3BlcnR5IG5hbWVzLlxuXHRcdFx0Xy5lYWNoKCBwcm9wcywgZnVuY3Rpb24oIHZhbHVlLCBwcm9wICkge1xuXHRcdFx0XHRpZiAoIF8uaXNOdWxsKCB2YWx1ZSApICkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFyZ3NbIFF1ZXJ5LnByb3BtYXBbIHByb3AgXSB8fCBwcm9wIF0gPSB2YWx1ZTtcblx0XHRcdH0pO1xuXG5cdFx0XHQvLyBGaWxsIGFueSBvdGhlciBkZWZhdWx0IHF1ZXJ5IGFyZ3MuXG5cdFx0XHRfLmRlZmF1bHRzKCBhcmdzLCBRdWVyeS5kZWZhdWx0QXJncyApO1xuXG5cdFx0XHQvLyBgcHJvcHMub3JkZXJieWAgZG9lcyBub3QgYWx3YXlzIG1hcCBkaXJlY3RseSB0byBgYXJncy5vcmRlcmJ5YC5cblx0XHRcdC8vIFN1YnN0aXR1dGUgZXhjZXB0aW9ucyBzcGVjaWZpZWQgaW4gb3JkZXJieS5rZXltYXAuXG5cdFx0XHRhcmdzLm9yZGVyYnkgPSBvcmRlcmJ5LnZhbHVlbWFwWyBwcm9wcy5vcmRlcmJ5IF0gfHwgcHJvcHMub3JkZXJieTtcblxuXHRcdFx0Ly8gU2VhcmNoIHRoZSBxdWVyeSBjYWNoZSBmb3IgYSBtYXRjaGluZyBxdWVyeS5cblx0XHRcdGlmICggY2FjaGUgKSB7XG5cdFx0XHRcdHF1ZXJ5ID0gXy5maW5kKCBxdWVyaWVzLCBmdW5jdGlvbiggcXVlcnkgKSB7XG5cdFx0XHRcdFx0cmV0dXJuIF8uaXNFcXVhbCggcXVlcnkuYXJncywgYXJncyApO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHF1ZXJpZXMgPSBbXTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gT3RoZXJ3aXNlLCBjcmVhdGUgYSBuZXcgcXVlcnkgYW5kIGFkZCBpdCB0byB0aGUgY2FjaGUuXG5cdFx0XHRpZiAoICEgcXVlcnkgKSB7XG5cdFx0XHRcdHF1ZXJ5ID0gbmV3IFF1ZXJ5KCBbXSwgXy5leHRlbmQoIG9wdGlvbnMgfHwge30sIHtcblx0XHRcdFx0XHRwcm9wczogcHJvcHMsXG5cdFx0XHRcdFx0YXJnczogIGFyZ3Ncblx0XHRcdFx0fSApICk7XG5cdFx0XHRcdHF1ZXJpZXMucHVzaCggcXVlcnkgKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIHF1ZXJ5O1xuXHRcdH07XG5cdH0oKSlcbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFF1ZXJ5O1xuIiwiLypnbG9iYWxzIHdwLCBfICovXG5cbi8qKlxuICogd3AubWVkaWEubW9kZWwuU2VsZWN0aW9uXG4gKlxuICogQSBzZWxlY3Rpb24gb2YgYXR0YWNobWVudHMuXG4gKlxuICogQGNsYXNzXG4gKiBAYXVnbWVudHMgd3AubWVkaWEubW9kZWwuQXR0YWNobWVudHNcbiAqIEBhdWdtZW50cyBCYWNrYm9uZS5Db2xsZWN0aW9uXG4gKi9cbnZhciBBdHRhY2htZW50cyA9IHdwLm1lZGlhLm1vZGVsLkF0dGFjaG1lbnRzLFxuXHRTZWxlY3Rpb247XG5cblNlbGVjdGlvbiA9IEF0dGFjaG1lbnRzLmV4dGVuZCh7XG5cdC8qKlxuXHQgKiBSZWZyZXNoIHRoZSBgc2luZ2xlYCBtb2RlbCB3aGVuZXZlciB0aGUgc2VsZWN0aW9uIGNoYW5nZXMuXG5cdCAqIEJpbmRzIGBzaW5nbGVgIGluc3RlYWQgb2YgdXNpbmcgdGhlIGNvbnRleHQgYXJndW1lbnQgdG8gZW5zdXJlXG5cdCAqIGl0IHJlY2VpdmVzIG5vIHBhcmFtZXRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSB7QXJyYXl9IFttb2RlbHM9W11dIEFycmF5IG9mIG1vZGVscyB1c2VkIHRvIHBvcHVsYXRlIHRoZSBjb2xsZWN0aW9uLlxuXHQgKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnM9e31dXG5cdCAqL1xuXHRpbml0aWFsaXplOiBmdW5jdGlvbiggbW9kZWxzLCBvcHRpb25zICkge1xuXHRcdC8qKlxuXHRcdCAqIGNhbGwgJ2luaXRpYWxpemUnIGRpcmVjdGx5IG9uIHRoZSBwYXJlbnQgY2xhc3Ncblx0XHQgKi9cblx0XHRBdHRhY2htZW50cy5wcm90b3R5cGUuaW5pdGlhbGl6ZS5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG5cdFx0dGhpcy5tdWx0aXBsZSA9IG9wdGlvbnMgJiYgb3B0aW9ucy5tdWx0aXBsZTtcblxuXHRcdHRoaXMub24oICdhZGQgcmVtb3ZlIHJlc2V0JywgXy5iaW5kKCB0aGlzLnNpbmdsZSwgdGhpcywgZmFsc2UgKSApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBJZiB0aGUgd29ya2Zsb3cgZG9lcyBub3Qgc3VwcG9ydCBtdWx0aS1zZWxlY3QsIGNsZWFyIG91dCB0aGUgc2VsZWN0aW9uXG5cdCAqIGJlZm9yZSBhZGRpbmcgYSBuZXcgYXR0YWNobWVudCB0byBpdC5cblx0ICpcblx0ICogQHBhcmFtIHtBcnJheX0gbW9kZWxzXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG5cdCAqIEByZXR1cm5zIHt3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50W119XG5cdCAqL1xuXHRhZGQ6IGZ1bmN0aW9uKCBtb2RlbHMsIG9wdGlvbnMgKSB7XG5cdFx0aWYgKCAhIHRoaXMubXVsdGlwbGUgKSB7XG5cdFx0XHR0aGlzLnJlbW92ZSggdGhpcy5tb2RlbHMgKTtcblx0XHR9XG5cdFx0LyoqXG5cdFx0ICogY2FsbCAnYWRkJyBkaXJlY3RseSBvbiB0aGUgcGFyZW50IGNsYXNzXG5cdFx0ICovXG5cdFx0cmV0dXJuIEF0dGFjaG1lbnRzLnByb3RvdHlwZS5hZGQuY2FsbCggdGhpcywgbW9kZWxzLCBvcHRpb25zICk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEZpcmVkIHdoZW4gdG9nZ2xpbmcgKGNsaWNraW5nIG9uKSBhbiBhdHRhY2htZW50IGluIHRoZSBtb2RhbC5cblx0ICpcblx0ICogQHBhcmFtIHt1bmRlZmluZWR8Ym9vbGVhbnx3cC5tZWRpYS5tb2RlbC5BdHRhY2htZW50fSBtb2RlbFxuXHQgKlxuXHQgKiBAZmlyZXMgd3AubWVkaWEubW9kZWwuU2VsZWN0aW9uI3NlbGVjdGlvbjpzaW5nbGVcblx0ICogQGZpcmVzIHdwLm1lZGlhLm1vZGVsLlNlbGVjdGlvbiNzZWxlY3Rpb246dW5zaW5nbGVcblx0ICpcblx0ICogQHJldHVybnMge0JhY2tib25lLk1vZGVsfVxuXHQgKi9cblx0c2luZ2xlOiBmdW5jdGlvbiggbW9kZWwgKSB7XG5cdFx0dmFyIHByZXZpb3VzID0gdGhpcy5fc2luZ2xlO1xuXG5cdFx0Ly8gSWYgYSBgbW9kZWxgIGlzIHByb3ZpZGVkLCB1c2UgaXQgYXMgdGhlIHNpbmdsZSBtb2RlbC5cblx0XHRpZiAoIG1vZGVsICkge1xuXHRcdFx0dGhpcy5fc2luZ2xlID0gbW9kZWw7XG5cdFx0fVxuXHRcdC8vIElmIHRoZSBzaW5nbGUgbW9kZWwgaXNuJ3QgaW4gdGhlIHNlbGVjdGlvbiwgcmVtb3ZlIGl0LlxuXHRcdGlmICggdGhpcy5fc2luZ2xlICYmICEgdGhpcy5nZXQoIHRoaXMuX3NpbmdsZS5jaWQgKSApIHtcblx0XHRcdGRlbGV0ZSB0aGlzLl9zaW5nbGU7XG5cdFx0fVxuXG5cdFx0dGhpcy5fc2luZ2xlID0gdGhpcy5fc2luZ2xlIHx8IHRoaXMubGFzdCgpO1xuXG5cdFx0Ly8gSWYgc2luZ2xlIGhhcyBjaGFuZ2VkLCBmaXJlIGFuIGV2ZW50LlxuXHRcdGlmICggdGhpcy5fc2luZ2xlICE9PSBwcmV2aW91cyApIHtcblx0XHRcdGlmICggcHJldmlvdXMgKSB7XG5cdFx0XHRcdHByZXZpb3VzLnRyaWdnZXIoICdzZWxlY3Rpb246dW5zaW5nbGUnLCBwcmV2aW91cywgdGhpcyApO1xuXG5cdFx0XHRcdC8vIElmIHRoZSBtb2RlbCB3YXMgYWxyZWFkeSByZW1vdmVkLCB0cmlnZ2VyIHRoZSBjb2xsZWN0aW9uXG5cdFx0XHRcdC8vIGV2ZW50IG1hbnVhbGx5LlxuXHRcdFx0XHRpZiAoICEgdGhpcy5nZXQoIHByZXZpb3VzLmNpZCApICkge1xuXHRcdFx0XHRcdHRoaXMudHJpZ2dlciggJ3NlbGVjdGlvbjp1bnNpbmdsZScsIHByZXZpb3VzLCB0aGlzICk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmICggdGhpcy5fc2luZ2xlICkge1xuXHRcdFx0XHR0aGlzLl9zaW5nbGUudHJpZ2dlciggJ3NlbGVjdGlvbjpzaW5nbGUnLCB0aGlzLl9zaW5nbGUsIHRoaXMgKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBSZXR1cm4gdGhlIHNpbmdsZSBtb2RlbCwgb3IgdGhlIGxhc3QgbW9kZWwgYXMgYSBmYWxsYmFjay5cblx0XHRyZXR1cm4gdGhpcy5fc2luZ2xlO1xuXHR9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBTZWxlY3Rpb247XG4iXX0=
