/* global define */

(function(factory) {
	if (typeof define === "function" && define.amd) {
		define([
			"jquery",
			"./core",
			"./touch"
		], factory);
	} else {
		factory(jQuery, Formstone);
	}
}(function($, Formstone) {

	"use strict";

	/**
	 * @method private
	 * @name construct
	 * @description Builds instance.
	 * @param data [object] "Instance data"
	 */

	function construct(data) {
		data.baseClasses = [RawClasses.base, data.theme, data.customClass].join(" ");

		data.touching    = false;
		data.ready       = false;

		var html = "";
		html += '<div class="' + RawClasses.container + '"></div>';
		html += '<div class="' + RawClasses.container_copy + '"></div>';

		// Modify DOM
		data.$el.addClass(data.baseClasses)
			.append(html);

		// Store plugin data
		data.$container     = data.$el.find(Classes.container);
		data.$containerCopy = data.$el.find(Classes.container_copy);

		//
		data.$el.css({
			width     : data.width,
			height    : data.height
		});

		data.$container.touch({
			pan: true,
			scale: true
		});


		if (data.source) {
			loadImage(data, data.source);
		}
	}

	/**
	 * @method private
	 * @name destruct
	 * @description Tears down instance.
	 * @param data [object] "Instance data"
	 */

	function destruct(data) {
		this.removeClass(data.baseClasses)
			.html("");
	}

	function loadImage(data, source) {
		data.$image = $('<img class="' + RawClasses.image + '">');
		data.$imageCopy = $('<img class="' + RawClasses.image_copy + '">');

		data.$image.on(Events.load, data, onImageLoaded)
				   .on(Events.error, data, onImageError)
				   .attr("src", source)
				   .appendTo(data.$container);

		data.$imageCopy.attr("src", source)
					   .appendTo(data.$containerCopy);
	}

	function onImageLoaded(e) {
		var data  = e.data;

		data.ready = true;

		var naturalSize = calculateNaturalSize(data.$image);

		data.naturalHeight = naturalSize.naturalHeight;
		data.naturalWidth  = naturalSize.naturalWidth;

		if (data.naturalWidth > data.naturalHeight) {
			// Wide
			data.ratio     = data.naturalWidth / data.naturalHeight;
			data.minHeight = data.height;
			data.minWidth  = data.height * data.ratio;
		} else {
			// Tall
			data.ratio     = data.naturalHeight / data.naturalWidth;
			data.minWidth  = data.width;
			data.minHeight = data.width * data.ratio;
		}

		data.targetWidth     = data.minWidth;
		data.targetHeight    = data.minHeight;

		data.targetLeft = (data.targetWidth  - data.minWidth)  / 2;
		data.targetTop  = (data.targetHeight - data.minHeight) / 2;

		setMinMax(data);

		positionImage(data);

		data.$container.on(Events.scaleStart, data, onScaleStart)
			.on(Events.scaleEnd, data, onScaleEnd)
			.on(Events.scale, data, onScale);

		console.log("loaded");
	}

	function onImageError(e) {
		var data  = e.data;

		console.log("Load Error");
	}

	function onScaleStart(e) {
		var data  = e.data;

		if (data.ready) {
			data.touching = true;

			data.startWidth  = data.targetWidth;
			data.startHeight = data.targetHeight;
			data.startLeft   = data.targetLeft;
			data.startTop    = data.targetTop;

			data.currentZoom = data.targetHeight / data.naturalHeight;
		}
	}

	function onScale(e) {
		var data = e.data;

		if (data.ready && data.touching) {
			var newWidth    = data.startWidth  * e.scale,
				newHeight   = data.startHeight * e.scale,
				diffWidth   = (data.startWidth  - newWidth)  / 2,
				diffHeight  = (data.startHeight - newHeight) / 2,
				newLeft     = data.startLeft + e.deltaX + diffWidth,
				newTop      = data.startTop  + e.deltaY + diffHeight;

			// Size
			if (newWidth < data.minWidth) {
				newWidth = data.minWidth;
			}
			if (newWidth > data.naturalWidth) {
				newWidth = data.naturalWidth;
			}

			if (newHeight < data.minHeight) {
				newHeight = data.minHeight;
			}
			if (newHeight > data.naturalHeight) {
				newHeight = data.naturalHeight;
			}

			data.targetHeight = newHeight;
			data.targetWidth  = newWidth;

			setMinMax(data);

			// Zoom
			var newZoom = newHeight / data.startHeight;

			// if (e.touches.length === 1 || newZoom !== data.currentZoom) {
				// Position
				if (newLeft < data.minLeft) {
					newLeft = data.minLeft;
				}
				if (newLeft > data.maxLeft) {
					newLeft = data.maxLeft;
				}

				if (newTop < data.minTop) {
					newTop = data.minTop;
				}
				if (newTop > data.maxTop) {
					newTop = data.maxTop;
				}

				data.targetTop  = newTop;
				data.targetLeft = newLeft;
			// }

			data.currentZoom = newZoom;

			data.zoom  = newHeight / data.naturalHeight;
			data.scale = data.naturalHeight / data.height;

			console.log(data.scale);

			positionImage(data);
		}
	}

	function onScaleEnd(e) {
		var data = e.data;

		if (data.ready) {
			console.log(data.targetTop, data.currentZoom);

			var newE = $.Event("position", {
				bubbles    : true,
				height     : data.height / data.scale,
				width      : data.width  / data.scale,
				top        : data.targetTop  / data.zoom,
				left       : data.targetLeft / data.zoom
			});

			data.$el.trigger( newE );
		}
	}

	function positionImage(data) {
		if (data.ready) {
			data.$image.css({
				left      : data.targetLeft,
				top       : data.targetTop,
				width     : data.targetWidth,
				height    : data.targetHeight
			});

			data.$imageCopy.css({
				left      : data.targetLeft,
				top       : data.targetTop,
				width     : data.targetWidth,
				height    : data.targetHeight
			});
		}
	}

	function setMinMax(data) {
		data.maxLeft = 0;
		data.maxTop  = 0;

		data.minLeft = (data.width  - data.targetWidth);
		data.minTop  = (data.height - data.targetHeight);
	}

	function getAttributes(data) {

	}

	/**
	 * @method private
	 * @name calculateNaturalSize
	 * @description Determines natural size of target image.
	 * @param $img [jQuery object] "Source image object"
	 * @return [object | boolean] "Object containing natural height and width values or false"
	 */

	function calculateNaturalSize($img) {
		var node = $img[0],
			img = new Image();

		if (typeof node.naturalHeight !== "undefined") {
			return {
				naturalHeight: node.naturalHeight,
				naturalWidth:  node.naturalWidth
			};
		} else {
			if (node.tagName.toLowerCase() === 'img') {
				img.src = node.src;
				return {
					naturalHeight: img.height,
					naturalWidth:  img.width
				};
			}
		}

		return false;
	}

	/**
	 * @plugin
	 * @name Crop
	 * @description A jQuery plugin for touch-friendly cropping.
	 * @type widget
	 * @main crop.js
	 * @main crop.css
	 * @dependency jQuery
	 * @dependency core.js
	 * @dependency touch.js
	 */

	var Plugin = Formstone.Plugin("crop", {
			widget: true,

			/**
			 * @options
			 * @param customClass [string] <''> "Class applied to instance"
			 * @param theme [string] <"fs-light"> "Theme class name"
			 */

			defaults: {
				customClass    : "",
				height         : 600,
				width          : 600,
				theme          : "fs-light"
			},

			classes: [
				"container",
				"container_copy",
				"image",
				"image_copy",
				"loaded"
			],

			events: [
				"scalestart",
				"scale",
				"scaleend"
			],

			methods: {
				_construct    : construct,
				_destruct     : destruct,

				// disable       : disableCrop,
				// enable        : enableCrop
			}
		}),

		// Localize References

		Classes       = Plugin.classes,
		RawClasses    = Classes.raw,
		Events        = Plugin.events,
		Functions     = Plugin.functions,

		Window        = Formstone.window,
		$Window       = Formstone.$window;

})

);