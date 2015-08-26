(function(a, b) {
	if (typeof define === "function" && define.amd) {
		define(["jquery"], b)
	} else {
		if (typeof module === "object" && module.exports) {
			module.exports = b(require("jquery"))
		} else {
			a.Fresco = b(jQuery)
		}
	}
}(this, function($) {
	var o = {};
	$.extend(o, {
		version: "2.1.1"
	});
	o.Skins = {
		fresco: {}
	};
	var p = {
		viewport: function() {
			var a = {
				width: $(window).width()
			};
			if (q.MobileSafari || (q.Android && q.Gecko)) {
				var b = document.documentElement.clientWidth / window.innerWidth;
				a.height = window.innerHeight * b
			} else {
				a.height = $(window).height()
			}
			return a
		}
	};
	var q = (function(c) {
		function getVersion(a) {
			var b = new RegExp(a + "([\\d.]+)").exec(c);
			return b ? parseFloat(b[1]) : true
		}
		return {
			IE: !! (window.attachEvent && c.indexOf("Opera") === -1) && getVersion("MSIE "),
			Opera: c.indexOf("Opera") > -1 && (( !! window.opera && opera.version && parseFloat(opera.version())) || 7.55),
			WebKit: c.indexOf("AppleWebKit/") > -1 && getVersion("AppleWebKit/"),
			Gecko: c.indexOf("Gecko") > -1 && c.indexOf("KHTML") === -1 && getVersion("rv:"),
			MobileSafari: !! c.match(/Apple.*Mobile.*Safari/),
			Chrome: c.indexOf("Chrome") > -1 && getVersion("Chrome/"),
			ChromeMobile: c.indexOf("CrMo") > -1 && getVersion("CrMo/"),
			Android: c.indexOf("Android") > -1 && getVersion("Android "),
			IEMobile: c.indexOf("IEMobile") > -1 && getVersion("IEMobile/")
		}
	})(navigator.userAgent);
	var r = Array.prototype.slice;

	function baseToString(a) {
		if (typeof a == "string") {
			return a
		}
		return a == null ? "" : (a + "")
	}
	var _ = {
		isElement: function(a) {
			return a && a.nodeType == 1
		},
		String: {
			capitalize: function(a) {
				a = baseToString(a);
				return a && (a.charAt(0).toUpperCase() + a.slice(1))
			}
		}
	};
	(function() {
		function wheel(a) {
			var b;
			if (a.originalEvent.wheelDelta) {
				b = a.originalEvent.wheelDelta / 120
			} else {
				if (a.originalEvent.detail) {
					b = -a.originalEvent.detail / 3
				}
			}
			if (!b) {
				return
			}
			var c = $.Event("fresco:mousewheel");
			$(a.target).trigger(c, b);
			if (c.isPropagationStopped()) {
				a.stopPropagation()
			}
			if (c.isDefaultPrevented()) {
				a.preventDefault()
			}
		}
		$(document.documentElement).on("mousewheel DOMMouseScroll", wheel)
	})();
	var s = {
		within: function(a, b) {
			var c = $.extend({
				height: true,
				width: true
			}, arguments[2] || {});
			var d = $.extend({}, b),
				g = 1,
				attempts = 5;
			var e = {
				width: c.width,
				height: c.height
			};
			while (attempts > 0 && ((e.width && d.width > a.width) || (e.height && d.height > a.height))) {
				var f = 1,
					scaleY = 1;
				if (e.width && d.width > a.width) {
					f = (a.width / d.width)
				}
				if (e.height && d.height > a.height) {
					scaleY = (a.height / d.height)
				}
				var g = Math.min(f, scaleY);
				d = {
					width: Math.round(b.width * g),
					height: Math.round(b.height * g)
				};
				attempts--
			}
			d.width = Math.max(d.width, 0);
			d.height = Math.max(d.height, 0);
			return d
		}
	};
	$.extend($.easing, {
		frescoEaseInCubic: function(x, t, b, c, d) {
			return c * (t /= d) * t * t + b
		},
		frescoEaseInSine: function(x, t, b, c, d) {
			return -c * Math.cos(t / d * (Math.PI / 2)) + c + b
		},
		frescoEaseOutSine: function(x, t, b, c, d) {
			return c * Math.sin(t / d * (Math.PI / 2)) + b
		}
	});
	var u = (function() {
		var d = document.createElement("div"),
			domPrefixes = "Webkit Moz O ms Khtml".split(" ");

		function prefixed(a) {
			return testAllProperties(a, "prefix")
		}
		function testProperties(a, b) {
			for (var i in a) {
				if (d.style[a[i]] !== undefined) {
					return b == "prefix" ? a[i] : true
				}
			}
			return false
		}
		function testAllProperties(a, b) {
			var c = a.charAt(0).toUpperCase() + a.substr(1),
				properties = (a + " " + domPrefixes.join(c + " ") + c).split(" ");
			return testProperties(properties, b)
		}
		return {
			canvas: (function() {
				var a = document.createElement("canvas");
				return !!(a.getContext && a.getContext("2d"))
			})(),
			css: {
				animation: testAllProperties("animation"),
				transform: testAllProperties("transform"),
				prefixed: prefixed
			},
			svg: ( !! document.createElementNS && !! document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect),
			touch: (function() {
				try {
					return !!(("ontouchstart" in window) || window.DocumentTouch && document instanceof DocumentTouch)
				} catch (e) {
					return false
				}
			})()
		}
	})();
	u.detectMobileTouch = function() {
		u.mobileTouch = u.touch && (q.MobileSafari || q.Android || q.IEMobile || q.ChromeMobile || !/^(Win|Mac|Linux)/.test(navigator.platform))
	};
	u.detectMobileTouch();
	var v = function() {
			return this.initialize.apply(this, Array.prototype.slice.call(arguments))
		};
	$.extend(v.prototype, {
		supports: {
			naturalWidth: (function() {
				return ("naturalWidth" in new Image())
			})()
		},
		initialize: function(a, b, c) {
			this.img = $(a)[0];
			this.successCallback = b;
			this.errorCallback = c;
			this.isLoaded = false;
			this.options = $.extend({
				method: "naturalWidth",
				pollFallbackAfter: 1000
			}, arguments[3] || {});
			if (!this.supports.naturalWidth || this.options.method == "onload") {
				setTimeout($.proxy(this.fallback, this));
				return
			}
			if (this.img.complete && $.type(this.img.naturalWidth) != "undefined") {
				setTimeout($.proxy(function() {
					if (this.img.naturalWidth > 0) {
						this.success()
					} else {
						this.error()
					}
				}, this));
				return
			}
			$(this.img).bind("error", $.proxy(function() {
				setTimeout($.proxy(function() {
					this.error()
				}, this))
			}, this));
			this.intervals = [
				[1 * 1000, 10],
				[2 * 1000, 50],
				[4 * 1000, 100],
				[20 * 1000, 500]
			];
			this._ipos = 0;
			this._time = 0;
			this._delay = this.intervals[this._ipos][1];
			this.poll()
		},
		poll: function() {
			this._polling = setTimeout($.proxy(function() {
				if (this.img.naturalWidth > 0) {
					this.success();
					return
				}
				this._time += this._delay;
				if (this.options.pollFallbackAfter && this._time >= this.options.pollFallbackAfter && !this._usedPollFallback) {
					this._usedPollFallback = true;
					this.fallback()
				}
				if (this._time > this.intervals[this._ipos][0]) {
					if (!this.intervals[this._ipos + 1]) {
						this.error();
						return
					}
					this._ipos++;
					this._delay = this.intervals[this._ipos][1]
				}
				this.poll()
			}, this), this._delay)
		},
		fallback: function() {
			var a = new Image();
			this._fallbackImg = a;
			a.onload = $.proxy(function() {
				a.onload = function() {};
				if (!this.supports.naturalWidth) {
					this.img.naturalWidth = a.width;
					this.img.naturalHeight = a.height
				}
				this.success()
			}, this);
			a.onerror = $.proxy(this.error, this);
			a.src = this.img.src
		},
		abort: function() {
			if (this._fallbackImg) {
				this._fallbackImg.onload = function() {}
			}
			if (this._polling) {
				clearTimeout(this._polling);
				this._polling = null
			}
		},
		success: function() {
			if (this._calledSuccess) {
				return
			}
			this._calledSuccess = true;
			this.isLoaded = true;
			this.successCallback(this)
		},
		error: function() {
			if (this._calledError) {
				return
			}
			this._calledError = true;
			this.abort();
			if (this.errorCallback) {
				this.errorCallback(this)
			}
		}
	});

	function Timers() {
		return this.initialize.apply(this, r.call(arguments))
	}
	$.extend(Timers.prototype, {
		initialize: function() {
			this._timers = {}
		},
		set: function(a, b, c) {
			this._timers[a] = setTimeout(b, c)
		},
		get: function(a) {
			return this._timers[a]
		},
		clear: function(a) {
			if (a) {
				if (this._timers[a]) {
					clearTimeout(this._timers[a]);
					delete this._timers[a]
				}
			} else {
				this.clearAll()
			}
		},
		clearAll: function() {
			$.each(this._timers, function(i, a) {
				clearTimeout(a)
			});
			this._timers = {}
		}
	});

	function getURIData(c) {
		var d = {
			type: "image"
		};
		$.each(A, function(i, a) {
			var b = a.data(c);
			if (b) {
				d = b;
				d.type = i;
				d.url = c
			}
		});
		return d
	}
	function detectExtension(a) {
		var b = (a || "").replace(/\?.*/g, "").match(/\.([^.]{3,4})$/);
		return b ? b[1].toLowerCase() : null
	}
	var w = {
		isVideo: function(a) {
			return /^(youtube|vimeo)$/.test(a)
		}
	};
	var A = {
		image: {
			extensions: "bmp gif jpeg jpg png webp",
			detect: function(a) {
				return $.inArray(detectExtension(a), this.extensions.split(" ")) > -1
			},
			data: function(a) {
				if (!this.detect()) {
					return false
				}
				return {
					extension: detectExtension(a)
				}
			}
		},
		vimeo: {
			detect: function(a) {
				var b = /(vimeo\.com)\/([a-zA-Z0-9-_]+)(?:\S+)?$/i.exec(a);
				if (b && b[2]) {
					return b[2]
				}
				return false
			},
			data: function(a) {
				var b = this.detect(a);
				if (!b) {
					return false
				}
				return {
					id: b
				}
			}
		},
		youtube: {
			detect: function(a) {
				var b = /(youtube\.com|youtu\.be)\/watch\?(?=.*vi?=([a-zA-Z0-9-_]+))(?:\S+)?$/.exec(a);
				if (b && b[2]) {
					return b[2]
				}
				b = /(youtube\.com|youtu\.be)\/(vi?\/|u\/|embed\/)?([a-zA-Z0-9-_]+)(?:\S+)?$/i.exec(a);
				if (b && b[3]) {
					return b[3]
				}
				return false
			},
			data: function(a) {
				var b = this.detect(a);
				if (!b) {
					return false
				}
				return {
					id: b
				}
			}
		}
	};
	var B = (function() {
		var d = function() {
				return this.initialize.apply(this, r.call(arguments))
			};
		$.extend(d.prototype, {
			initialize: function(a, b, c) {
				this.url = a;
				this.successCallback = b;
				this.errorCallback = c;
				this.load()
			},
			load: function() {
				var b = e.get(this.url);
				if (b) {
					return this.successCallback(b.data.url)
				}
				var c = "http" + (window.location && window.location.protocol == "https:" ? "s" : "") + ":",
					video_id = getURIData(this.url).id;
				this._xhr = $.getJSON(c + "//vimeo.com/api/oembed.json?url=" + c + "//vimeo.com/" + video_id + "&callback=?", $.proxy(function(a) {
					if (a && a.thumbnail_url) {
						var a = {
							url: a.thumbnail_url
						};
						e.set(this.url, a);
						this.successCallback(a.url)
					} else {
						this.errorCallback()
					}
				}, this))
			},
			abort: function() {
				if (this._xhr) {
					this._xhr.abort();
					this._xhr = null
				}
			}
		});
		var e = {
			cache: [],
			get: function(a) {
				var b = null;
				for (var i = 0; i < this.cache.length; i++) {
					if (this.cache[i] && this.cache[i].url == a) {
						b = this.cache[i]
					}
				}
				return b
			},
			set: function(a, b) {
				this.remove(a);
				this.cache.push({
					url: a,
					data: b
				})
			},
			remove: function(a) {
				for (var i = 0; i < this.cache.length; i++) {
					if (this.cache[i] && this.cache[i].url == a) {
						delete this.cache[i]
					}
				}
			}
		};
		return d
	})();
	var C = (function() {
		var e = function() {
				return this.initialize.apply(this, r.call(arguments))
			};
		$.extend(e.prototype, {
			initialize: function(a, b) {
				this.url = a;
				this.callback = b;
				this.load()
			},
			load: function() {
				var c = f.get(this.url);
				if (c) {
					return this.callback(c.data)
				}
				var d = "http" + (window.location && window.location.protocol == "https:" ? "s" : "") + ":",
					video_id = getURIData(this.url).id;
				this._xhr = $.getJSON(d + "//vimeo.com/api/oembed.json?url=" + d + "//vimeo.com/" + video_id + "&callback=?", $.proxy(function(a) {
					var b = {
						dimensions: {
							width: a.width,
							height: a.height
						}
					};
					f.set(this.url, b);
					if (this.callback) {
						this.callback(b)
					}
				}, this))
			},
			abort: function() {
				if (this._xhr) {
					this._xhr.abort();
					this._xhr = null
				}
			}
		});
		var f = {
			cache: [],
			get: function(a) {
				var b = null;
				for (var i = 0; i < this.cache.length; i++) {
					if (this.cache[i] && this.cache[i].url == a) {
						b = this.cache[i]
					}
				}
				return b
			},
			set: function(a, b) {
				this.remove(a);
				this.cache.push({
					url: a,
					data: b
				})
			},
			remove: function(a) {
				for (var i = 0; i < this.cache.length; i++) {
					if (this.cache[i] && this.cache[i].url == a) {
						delete this.cache[i]
					}
				}
			}
		};
		return e
	})();
	var E = {
		defaults: {
			effects: {
				content: {
					show: 0,
					hide: 0
				},
				spinner: {
					show: 150,
					hide: 150
				},
				window: {
					show: 440,
					hide: 300
				},
				thumbnail: {
					show: 300,
					delay: 150
				},
				thumbnails: {
					slide: 0
				}
			},
			keyboard: {
				left: true,
				right: true,
				esc: true
			},
			loadedMethod: "naturalWidth",
			loop: false,
			onClick: "previous-next",
			overflow: false,
			overlay: {
				close: true
			},
			preload: [1, 2],
			position: true,
			skin: "fresco",
			spinner: true,
			spinnerDelay: 300,
			sync: true,
			thumbnails: "horizontal",
			ui: "outside",
			uiDelay: 3000,
			vimeo: {
				autoplay: 1,
				api: 1,
				title: 1,
				byline: 1,
				portrait: 0,
				loop: 0
			},
			youtube: {
				autoplay: 1,
				controls: 1,
				enablejsapi: 1,
				hd: 1,
				iv_load_policy: 3,
				loop: 0,
				modestbranding: 1,
				rel: 0,
				vq: "hd1080"
			},
			initialTypeOptions: {
				image: {},
				vimeo: {
					width: 1280
				},
				youtube: {
					width: 1280,
					height: 720
				}
			}
		},
		create: function(d, e, f) {
			d = d || {};
			f = f || {};
			d.skin = d.skin || this.defaults.skin;
			var g = d.skin ? $.extend({}, o.Skins[d.skin] || o.Skins[this.defaults.skin]) : {},
				merged = $.extend(true, {}, this.defaults, g);
			if (merged.initialTypeOptions) {
				if (e && merged.initialTypeOptions[e]) {
					merged = $.extend(true, {}, merged.initialTypeOptions[e], merged)
				}
				delete merged.initialTypeOptions
			}
			var h = $.extend(true, {}, merged, d);
			if (u.mobileTouch && h.ui == "inside") {
				h.ui = "outside"
			}
			if (!h.effects || (q.IE && q.IE < 9)) {
				h.effects = {};
				$.each(this.defaults.effects, function(b, c) {
					$.each((h.effects[b] = $.extend({}, c)), function(a) {
						h.effects[b][a] = 0
					})
				});
				h.spinner = false
			}
			if (h.keyboard) {
				if ($.type(h.keyboard) == "boolean") {
					h.keyboard = {};
					$.each(this.defaults.keyboard, function(a, b) {
						h.keyboard[a] = true
					})
				}
				if (e == "vimeo" || e == "youtube") {
					$.extend(h.keyboard, {
						left: false,
						right: false
					})
				}
			}
			if (!h.overflow || u.mobileTouch) {
				h.overflow = {
					x: false,
					y: false
				}
			} else {
				if ($.type(h.overflow) == "boolean") {
					h.overflow = {
						x: false,
						y: true
					}
				}
			}
			if (e == "vimeo" || e == "youtube") {
				h.overlap = false
			}
			if ((q.IE && q.IE < 9) || u.mobileTouch) {
				h.thumbnail = false;
				h.thumbnails = false
			}
			if (e != "youtube") {
				if (h.width && !h.maxWidth) {
					h.maxWidth = h.width
				}
				if (h.height && !h.maxHeight) {
					h.maxHeight = h.height
				}
			}
			if (!h.thumbnail && $.type(h.thumbnail) != "boolean") {
				var i = false;
				switch (e) {
				case "youtube":
					var j = "http" + (window.location && window.location.protocol == "https:" ? "s" : "") + ":";
					i = j + "//img.youtube.com/vi/" + f.id + "/0.jpg";
					break;
				case "image":
				case "vimeo":
					i = true;
					break
				}
				h.thumbnail = i
			}
			return h
		}
	};
	var F = {
		initialize: function() {
			this.build();
			this.visible = false
		},
		build: function() {
			this.element = $("<div>").addClass("fr-overlay").hide().append($("<div>").addClass("fr-overlay-background"));
			this.element.on("click", $.proxy(function() {
				var a = J.page;
				if (a && a.view && a.view.options.overlay && !a.view.options.overlay.close) {
					return
				}
				G.hide()
			}, this));
			if (u.mobileTouch) {
				this.element.addClass("fr-mobile-touch")
			}
			this.element.on("fresco:mousewheel", function(a) {
				a.preventDefault()
			})
		},
		setSkin: function(a) {
			if (this.skin) {
				this.element.removeClass("fr-overlay-skin-" + this.skin)
			}
			this.element.addClass("fr-overlay-skin-" + a);
			this.skin = a
		},
		attach: function() {
			$(document.body).append(this.element)
		},
		detach: function() {
			this.element.detach()
		},
		show: function(a, b) {
			if (this.visible) {
				if (a) {
					a()
				}
				return
			}
			this.visible = true;
			this.attach();
			this.max();
			var c = (J.page && J.page.view.options.effects.window.show) || 0,
				duration = ($.type(b) == "number" ? b : c) || 0;
			this.element.stop(true).fadeTo(duration, 1, a)
		},
		hide: function(a, b) {
			if (!this.visible) {
				if (a) {
					a()
				}
				return
			}
			var c = (J.page && J.page.view.options.effects.window.hide) || 0,
				duration = ($.type(b) == "number" ? b : c) || 0;
			this.element.stop(true).fadeOut(duration || 0, $.proxy(function() {
				this.detach();
				this.visible = false;
				if (a) {
					a()
				}
			}, this))
		},
		getScrollDimensions: function() {
			var a = {};
			$.each(["width", "height"], function(i, d) {
				var D = d.substr(0, 1).toUpperCase() + d.substr(1),
					ddE = document.documentElement;
				a[d] = (q.IE ? Math.max(ddE["offset" + D], ddE["scroll" + D]) : q.WebKit ? document.body["scroll" + D] : ddE["scroll" + D]) || 0
			});
			return a
		},
		max: function() {
			var a;
			if ((q.MobileSafari && (q.WebKit && q.WebKit < 533.18))) {
				a = this.getScrollDimensions();
				this.element.css(a)
			}
			if (q.IE && q.IE < 9) {
				var b = p.viewport();
				this.element.css({
					height: b.height,
					width: b.width
				})
			}
			if (u.mobileTouch && !a) {
				this.element.css({
					height: this.getScrollDimensions().height
				})
			}
		}
	};
	var G = {
		initialize: function() {
			this.queues = [];
			this.queues.hide = $({});
			this.pages = [];
			this._tracking = [];
			this._first = true;
			this.timers = new Timers();
			this.build();
			this.setSkin(E.defaults.skin)
		},
		build: function() {
			this.element = $("<div>").addClass("fr-window fr-measured").hide().append(this._box = $("<div>").addClass("fr-box").append(this._pages = $("<div>").addClass("fr-pages"))).append(this._thumbnails = $("<div>").addClass("fr-thumbnails"));
			F.initialize();
			J.initialize(this._pages);
			N.initialize(this._thumbnails);
			K.initialize();
			O.initialize();
			this.element.addClass("fr" + (!u.mobileTouch ? "-no" : "") + "-mobile-touch");
			this.element.addClass("fr" + (!u.svg ? "-no" : "") + "-svg");
			if (q.IE) {
				for (var i = 7; i <= 9; i++) {
					if (q.IE < i) {
						this.element.addClass("fr-ltIE" + i)
					}
				}
			}
			this.element.on("fresco:mousewheel", function(a) {
				a.preventDefault()
			})
		},
		attach: function() {
			if (this._attached) {
				return
			}
			$(document.body).append(this.element);
			this._attached = true
		},
		detach: function() {
			if (!this._attached) {
				return
			}
			this.element.detach();
			this._attached = false
		},
		setSkin: function(a) {
			if (this._skin) {
				this.element.removeClass("fr-window-skin-" + this._skin)
			}
			this.element.addClass("fr-window-skin-" + a);
			F.setSkin(a);
			this._skin = a
		},
		setShowingType: function(a) {
			if (this._showingType == a) {
				return
			}
			if (this._showingType) {
				this.element.removeClass("fr-showing-type-" + this._showingType);
				if (w.isVideo(this._showingType)) {
					this.element.removeClass("fr-showing-type-video")
				}
			}
			this.element.addClass("fr-showing-type-" + a);
			if (w.isVideo(a)) {
				this.element.addClass("fr-showing-type-video")
			}
			this._showingType = a
		},
		startObservingResize: function() {
			if (this._onWindowResizeHandler) {
				return
			}
			$(window).on("resize orientationchange", this._onWindowResizeHandler = $.proxy(this._onWindowResize, this))
		},
		stopObservingResize: function() {
			if (this._onWindowResizeHandler) {
				$(window).off("resize orientationchange", this._onWindowResizeHandler);
				this._onWindowResizeHandler = null
			}
		},
		_onScroll: function() {
			if (!u.mobileTouch) {
				return
			}
			this.timers.set("scroll", $.proxy(this.adjustToScroll, this), 0)
		},
		_onWindowResize: function() {
			var a;
			if (!(a = J.page)) {
				return
			}
			N.fitToViewport();
			this.updateBoxDimensions();
			a.fitToBox();
			O.update();
			O.adjustPrevNext(null, 0);
			K.center();
			F.max();
			O._onWindowResize();
			this._onScroll()
		},
		adjustToScroll: function() {
			if (!u.mobileTouch) {
				return
			}
			this.element.css({
				top: $(window).scrollTop()
			})
		},
		getBoxDimensions: function() {
			return this._boxDimensions
		},
		updateBoxDimensions: function() {
			var a;
			if (!(a = J.page)) {
				return
			}
			var b = p.viewport(),
				thumbnails = N.getDimensions();
			var c = N._orientation == "horizontal";
			this._boxDimensions = {
				width: c ? b.width : b.width - thumbnails.width,
				height: c ? b.height - thumbnails.height : b.height
			};
			this._boxPosition = {
				top: 0,
				left: c ? 0 : thumbnails.width
			};
			this._box.css($.extend({}, this._boxDimensions, this._boxPosition))
		},
		show: function(a, b) {
			if (this.visible) {
				if (a) {
					a()
				}
				return
			}
			this.visible = true;
			this.opening = true;
			this.attach();
			this.timers.clear("show-window");
			this.timers.clear("hide-overlay");
			this.adjustToScroll();
			var c = ($.type(b) == "number" ? b : J.page && J.page.view.options.effects.window.show) || 0;
			var d = 2;
			F[J.page && J.page.view.options.overlay ? "show" : "hide"](function() {
				if (a && --d < 1) {
					a()
				}
			}, c);
			this.timers.set("show-window", $.proxy(function() {
				this._show($.proxy(function() {
					this.opening = false;
					if (a && --d < 1) {
						a()
					}
				}, this), c)
			}, this), c > 1 ? Math.min(c * 0.5, 50) : 1)
		},
		_show: function(a, b) {
			var c = ($.type(b) == "number" ? b : J.page && J.page.view.options.effects.window.show) || 0;
			this.element.stop(true).fadeTo(c, 1, a)
		},
		hide: function(c) {
			var d = this.queues.hide;
			d.queue([]);
			this.timers.clear("show-window");
			this.timers.clear("hide-overlay");
			var e = J.page ? J.page.view.options.effects.window.hide : 0;
			d.queue($.proxy(function(a) {
				J.stop();
				K.hide();
				a()
			}, this));
			d.queue($.proxy(function(a) {
				O.disable();
				O.hide(null, e);
				H.disable();
				a()
			}, this));
			d.queue($.proxy(function(a) {
				var b = 2;
				this._hide(function() {
					if (--b < 1) {
						a()
					}
				}, e);
				this.timers.set("hide-overlay", $.proxy(function() {
					F.hide(function() {
						if (--b < 1) {
							a()
						}
					}, e)
				}, this), e > 1 ? Math.min(e * 0.5, 150) : 1);
				this._first = true
			}, this));
			d.queue($.proxy(function(a) {
				this._reset();
				this.stopObservingResize();
				J.removeAll();
				N.clear();
				this.timers.clear();
				this._position = -1;
				var b = J.page && J.page.view.options.afterHide;
				if ($.type(b) == "function") {
					b.call(o)
				}
				this.view = null;
				this.opening = false;
				this.closing = false;
				this.detach();
				a()
			}, this));
			if ($.type(c) == "function") {
				d.queue($.proxy(function(a) {
					c();
					a()
				}, this))
			}
		},
		_hide: function(a, b) {
			var c = ($.type(b) == "number" ? b : J.page && J.page.view.options.effects.window.hide) || 0;
			this.element.stop(true).fadeOut(c, a)
		},
		load: function(a, b) {
			this.views = a;
			this.attach();
			N.load(a);
			J.load(a);
			this.startObservingResize();
			if (b) {
				this.setPosition(b)
			}
		},
		setPosition: function(a, b) {
			this._position = a;
			this.view = this.views[a - 1];
			this.stopHideQueue();
			this.page = J.show(a, $.proxy(function() {
				if (b) {
					b()
				}
			}, this))
		},
		stopHideQueue: function() {
			this.queues.hide.queue([])
		},
		_reset: function() {
			this.visible = false;
			O.hide(null, 0);
			O.reset()
		},
		mayPrevious: function() {
			return (this.view && this.view.options.loop && this.views && this.views.length > 1) || this._position != 1
		},
		previous: function(a) {
			var b = this.mayPrevious();
			if (a || b) {
				this.setPosition(this.getSurroundingIndexes().previous)
			}
		},
		mayNext: function() {
			var a = this.views && this.views.length > 1;
			return (this.view && this.view.options.loop && a) || (a && this.getSurroundingIndexes().next != 1)
		},
		next: function(a) {
			var b = this.mayNext();
			if (a || b) {
				this.setPosition(this.getSurroundingIndexes().next)
			}
		},
		getSurroundingIndexes: function() {
			if (!this.views) {
				return {}
			}
			var a = this._position,
				length = this.views.length;
			var b = (a <= 1) ? length : a - 1,
				next = (a >= length) ? 1 : a + 1;
			return {
				previous: b,
				next: next
			}
		}
	};
	var H = {
		enabled: false,
		keyCode: {
			left: 37,
			right: 39,
			esc: 27
		},
		enable: function(a) {
			this.disable();
			if (!a) {
				return
			}
			$(document).on("keydown", this._onKeyDownHandler = $.proxy(this.onKeyDown, this)).on("keyup", this._onKeyUpHandler = $.proxy(this.onKeyUp, this));
			this.enabled = a
		},
		disable: function() {
			this.enabled = false;
			if (this._onKeyUpHandler) {
				$(document).off("keyup", this._onKeyUpHandler).off("keydown", this._onKeyDownHandler);
				this._onKeyUpHandler = this._onKeyDownHandler = null
			}
		},
		onKeyDown: function(a) {
			if (!this.enabled) {
				return
			}
			var b = this.getKeyByKeyCode(a.keyCode);
			if (!b || (b && this.enabled && !this.enabled[b])) {
				return
			}
			a.preventDefault();
			a.stopPropagation();
			switch (b) {
			case "left":
				G.previous();
				break;
			case "right":
				G.next();
				break
			}
		},
		onKeyUp: function(a) {
			if (!this.enabled) {
				return
			}
			var b = this.getKeyByKeyCode(a.keyCode);
			if (!b || (b && this.enabled && !this.enabled[b])) {
				return
			}
			switch (b) {
			case "esc":
				G.hide();
				break
			}
		},
		getKeyByKeyCode: function(a) {
			for (var b in this.keyCode) {
				if (this.keyCode[b] == a) {
					return b
				}
			}
			return null
		}
	};
	var I = (function() {
		var n = 0,
			_loadedUrlCache = {},
			_strokes = $("<div>").addClass("fr-stroke fr-stroke-top fr-stroke-horizontal").append($("<div>").addClass("fr-stroke-color")).add($("<div>").addClass("fr-stroke fr-stroke-bottom fr-stroke-horizontal").append($("<div>").addClass("fr-stroke-color"))).add($("<div>").addClass("fr-stroke fr-stroke-left fr-stroke-vertical").append($("<div>").addClass("fr-stroke-color"))).add($("<div>").addClass("fr-stroke fr-stroke-right fr-stroke-vertical").append($("<div>").addClass("fr-stroke-color")));

		function I() {
			return this.initialize.apply(this, r.call(arguments))
		}
		$.extend(I.prototype, {
			initialize: function(a, b, c) {
				this.view = a;
				this.dimensions = {
					width: 0,
					height: 0
				};
				this.uid = n++;
				this._position = b;
				this._total = c;
				this._fullClick = false;
				this._visible = false;
				this.queues = {};
				this.queues.showhide = $({})
			},
			create: function() {
				if (this._created) {
					return
				}
				J.element.append(this.element = $("<div>").addClass("fr-page").append(this.container = $("<div>").addClass("fr-container")).css({
					opacity: 0
				}).hide());
				var a = (this.view.options.position && this._total > 1);
				if (a) {
					this.element.addClass("fr-has-position")
				}
				if (this.view.caption || a) {
					this.element.append(this.info = $("<div>").addClass("fr-info").append($("<div>").addClass("fr-info-background")).append(_strokes.clone(true)).append(this.infoPadder = $("<div>").addClass("fr-info-padder")));
					if (a) {
						this.element.addClass("fr-has-position");
						this.infoPadder.append(this.pos = $("<div>").addClass("fr-position").append($("<span>").addClass("fr-position-text").html(this._position + " / " + this._total)))
					}
					if (this.view.caption) {
						this.infoPadder.append(this.caption = $("<div>").addClass("fr-caption").html(this.view.caption))
					}
				}
				this.container.append(this.background = $("<div>").addClass("fr-content-background")).append(this.content = $("<div>").addClass("fr-content"));
				if (this.view.type == "image") {
					this.content.append(this.image = $("<img>").addClass("fr-content-element").attr({
						src: this.view.url
					}));
					this.content.append(_strokes.clone(true))
				}
				if (a && this.view.options.ui == "outside") {
					this.container.append(this.positionOutside = $("<div>").addClass("fr-position-outside").append($("<div>").addClass("fr-position-background")).append($("<span>").addClass("fr-position-text").html(this._position + " / " + this._total)))
				}
				if (this.view.options.ui == "inside") {
					this.content.append(this.previousInside = $("<div>").addClass("fr-side fr-side-previous fr-toggle-ui").append($("<div>").addClass("fr-side-button").append($("<div>").addClass("fr-side-button-background")).append($("<div>").addClass("fr-side-button-icon")))).append(this.nextInside = $("<div>").addClass("fr-side fr-side-next fr-toggle-ui").append($("<div>").addClass("fr-side-button").append($("<div>").addClass("fr-side-button-background")).append($("<div>").addClass("fr-side-button-icon")))).append(this.closeInside = $("<div>").addClass("fr-close fr-toggle-ui").append($("<div>").addClass("fr-close-background")).append($("<div>").addClass("fr-close-icon")));
					if (this.view.caption || (a && this.view.grouped.caption)) {
						this.content.append(this.infoInside = $("<div>").addClass("fr-info fr-toggle-ui").append($("<div>").addClass("fr-info-background")).append(_strokes.clone(true)).append(this.infoPadderInside = $("<div>").addClass("fr-info-padder")));
						if (a) {
							this.infoPadderInside.append(this.posInside = $("<div>").addClass("fr-position").append($("<span>").addClass("fr-position-text").html(this._position + " / " + this._total)))
						}
						if (this.view.caption) {
							this.infoPadderInside.append(this.captionInside = $("<div>").addClass("fr-caption").html(this.view.caption))
						}
					}
					if (!this.view.caption && a && !this.view.grouped.caption) {
						this.content.append(this.positionInside = $("<div>").addClass("fr-position-inside fr-toggle-ui").append($("<div>").addClass("fr-position-background")).append($("<span>").addClass("fr-position-text").html(this._position + " / " + this._total)))
					}
					var b = (this.view.options.loop && this._total > 1) || this._position != 1,
						mayNext = (this.view.options.loop && this._total > 1) || this._position < this._total;
					this.previousInside[(b ? "remove" : "add") + "Class"]("fr-side-disabled");
					this.nextInside[(mayNext ? "remove" : "add") + "Class"]("fr-side-disabled")
				}
				$.each(["x", "y"], $.proxy(function(i, z) {
					if (this.view.options.overflow[z]) {
						this.element.addClass("fr-overflow-" + z)
					}
				}, this));
				this.element.addClass("fr-type-" + this.view.type);
				if (w.isVideo(this.view.type)) {
					this.element.addClass("fr-type-video")
				}
				if (this._total < 2) {
					this.element.addClass("fr-no-sides")
				}
				this._created = true
			},
			_getSurroundingPages: function() {
				var a;
				if (!(a = this.view.options.preload)) {
					return []
				}
				var b = [],
					begin = Math.max(1, this._position - a[0]),
					end = Math.min(this._position + a[1], this._total),
					pos = this._position;
				for (var i = pos; i <= end; i++) {
					var c = J.pages[i - 1];
					if (c._position != pos) {
						b.push(c)
					}
				}
				for (var i = pos; i >= begin; i--) {
					var c = J.pages[i - 1];
					if (c._position != pos) {
						b.push(c)
					}
				}
				return b
			},
			preloadSurroundingImages: function() {
				var b = this._getSurroundingPages();
				$.each(b, $.proxy(function(i, a) {
					a.preload()
				}, this))
			},
			preload: function() {
				if (this.preloading || this.preloaded || this.view.type != "image" || !this.view.options.preload || this.loaded) {
					return
				}
				this.create();
				this.preloading = true;
				this.preloadReady = new v(this.image[0], $.proxy(function(a) {
					this.loaded = true;
					_loadedUrlCache[this.view.url] = true;
					this.preloading = false;
					this.preloaded = true;
					this.dimensions = {
						width: a.img.naturalWidth,
						height: a.img.naturalHeight
					}
				}, this), null, {
					method: "naturalWidth"
				})
			},
			load: function(b, c) {
				this.create();
				if (this.loaded) {
					if (b) {
						b()
					}
					return
				}
				this.abort();
				this.loading = true;
				if (this.view.options.spinner) {
					this._spinnerDelay = setTimeout($.proxy(function() {
						K.show()
					}, this), this.view.options.spinnerDelay || 0)
				}
				switch (this.view.type) {
				case "image":
					if (this.error) {
						if (b) {
							b()
						}
						return
					}
					this.imageReady = new v(this.image[0], $.proxy(function(a) {
						this._markAsLoaded();
						this.setDimensions({
							width: a.img.naturalWidth,
							height: a.img.naturalHeight
						});
						if (b) {
							b()
						}
					}, this), $.proxy(function() {
						this._markAsLoaded();
						this.image.hide();
						this.content.prepend(this.error = $("<div>").addClass("fr-error fr-content-element").append($("<div>").addClass("fr-error-icon")));
						this.element.addClass("fr-has-error");
						this.setDimensions({
							width: this.error.outerWidth(),
							height: this.error.outerHeight()
						});
						this.error.css({
							width: "100%",
							height: "100%"
						});
						if (b) {
							b()
						}
					}, this), {
						method: this.view.options.loadedMethod
					});
					break;
				case "vimeo":
					this.vimeoReady = new C(this.view.url, $.proxy(function(a) {
						this._markAsLoaded();
						this.setDimensions({
							width: a.dimensions.width,
							height: a.dimensions.height
						});
						if (b) {
							b()
						}
					}, this));
					break;
				case "youtube":
					this._markAsLoaded();
					this.setDimensions({
						width: this.view.options.width,
						height: this.view.options.height
					});
					if (b) {
						b()
					}
					break
				}
			},
			setDimensions: function(a) {
				this.dimensions = a;
				if (this.view.options.maxWidth || this.view.options.maxHeight) {
					var b = this.view.options,
						bounds = {
							width: b.maxWidth ? b.maxWidth : this.dimensions.width,
							height: b.maxHeight ? b.maxHeight : this.dimensions.height
						};
					this.dimensions = s.within(bounds, this.dimensions)
				}
			},
			_markAsLoaded: function() {
				this._abortSpinnerDelay();
				this.loading = false;
				this.loaded = true;
				_loadedUrlCache[this.view.url] = true;
				K.hide(null, null, this._position)
			},
			isVideo: function() {
				return w.isVideo(this.view.type)
			},
			insertVideo: function(a) {
				if (this.playerIframe || !this.isVideo()) {
					if (a) {
						a()
					}
					return
				}
				var b = "http" + (window.location && window.location.protocol == "https:" ? "s" : "") + ":";
				var c = $.extend({}, this.view.options[this.view.type] || {}),
					queryString = $.param(c),
					urls = {
						vimeo: b + "//player.vimeo.com/video/{id}?{queryString}",
						youtube: b + "//www.youtube.com/embed/{id}?{queryString}"
					},
					src = urls[this.view.type].replace("{id}", this.view._data.id).replace("{queryString}", queryString);
				this.content.prepend(this.playerIframe = $("<iframe webkitAllowFullScreen mozallowfullscreen allowFullScreen>").addClass("fr-content-element").attr({
					src: src,
					height: this._contentDimensions.height,
					width: this._contentDimensions.width,
					frameborder: 0
				}));
				if (a) {
					a()
				}
			},
			raise: function() {
				var a = J.element[0].lastChild;
				if (a && a == this.element[0]) {
					return
				}
				J.element.append(this.element)
			},
			show: function(d) {
				var e = this.queues.showhide;
				e.queue([]);
				e.queue($.proxy(function(a) {
					var b = this.view.options.spinner && !_loadedUrlCache[this.view.url];
					if (K._visible && !b) {
						K.hide()
					}
					J.stopInactive();
					a()
				}, this));
				e.queue($.proxy(function(a) {
					this.updateUI();
					O.set(this._ui);
					a()
				}, this));
				e.queue($.proxy(function(a) {
					H.enable(this.view.options.keyboard);
					a()
				}, this));
				e.queue($.proxy(function(a) {
					K.setSkin(this.view.options.skin);
					this.load($.proxy(function() {
						this.preloadSurroundingImages();
						a()
					}, this))
				}, this));
				e.queue($.proxy(function(a) {
					this.raise();
					G.setSkin(this.view.options.skin);
					O.enable();
					this.fitToBox();
					G.adjustToScroll();
					a()
				}, this));
				if (this.isVideo()) {
					e.queue($.proxy(function(a) {
						this.insertVideo($.proxy(function() {
							a()
						}))
					}, this))
				}
				if (!this.view.options.sync) {
					e.queue($.proxy(function(a) {
						J.hideInactive(a)
					}, this))
				}
				e.queue($.proxy(function(a) {
					var b = 3,
						duration = this.view.options.effects.content.show;
					G.setShowingType(this.view.type);
					if (!G.visible) {
						duration = this.view.options.effects.window.show;
						if ($.type(this.view.options.onShow) == "function") {
							this.view.options.onShow.call(o)
						}
					}
					if (this.view.options.sync) {
						b++;
						J.hideInactive(function() {
							if (--b < 1) {
								a()
							}
						})
					}
					G.show(function() {
						if (--b < 1) {
							a()
						}
					}, this.view.options.effects.window.show);
					this._show(function() {
						if (--b < 1) {
							a()
						}
					}, duration);
					O.adjustPrevNext(function() {
						if (--b < 1) {
							a()
						}
					}, G._first ? 0 : duration);
					if (G._first) {
						O.show(null, 0);
						G._first = false
					} else {
						O.show(null, 0)
					}
					var c = this.view.options.afterPosition;
					if ($.type(c) == "function") {
						c.call(o, this._position)
					}
				}, this));
				e.queue($.proxy(function(a) {
					this._visible = true;
					if (d) {
						d()
					}
					a()
				}, this))
			},
			_show: function(a, b) {
				var c = !G.visible ? 0 : ($.type(b) == "number") ? b : this.view.options.effects.content.show;
				this.element.stop(true).show().fadeTo(c || 0, 1, a)
			},
			hide: function(a, b) {
				if (!this.element) {
					if (a) {
						a()
					}
					return
				}
				this.removeVideo();
				this.abort();
				var c = ($.type(b) == "number") ? b : this.view.options.effects.content.hide;
				if (this.isVideo()) {
					c = 0
				}
				this.element.stop(true).fadeTo(c, 0, "frescoEaseInCubic", $.proxy(function() {
					this.element.hide();
					this._visible = false;
					J.removeTracking(this._position);
					if (a) {
						a()
					}
				}, this))
			},
			stop: function() {
				var a = this.queues.showhide;
				a.queue([]);
				if (this.element) {
					this.element.stop(true)
				}
				this.abort()
			},
			removeVideo: function() {
				if (this.playerIframe) {
					this.playerIframe[0].src = "//about:blank";
					this.playerIframe.remove();
					this.playerIframe = null
				}
			},
			remove: function() {
				this.stop();
				this.removeVideo();
				if (this.element) {
					this.element.remove()
				}
				if (this._track) {
					J.removeTracking(this._position);
					this._track = false
				}
				if (this.preloadReady) {
					this.preloadReady.abort();
					this.preloadReady = null;
					this.preloading = null;
					this.preloaded = null
				}
				this._visible = false;
				this.removed = true
			},
			abort: function() {
				if (this.imageReady) {
					this.imageReady.abort();
					this.imageReady = null
				}
				if (this.vimeoReady) {
					this.vimeoReady.abort();
					this.vimeoReady = null
				}
				this._abortSpinnerDelay();
				this.loading = false
			},
			_abortSpinnerDelay: function() {
				if (this._spinnerDelay) {
					clearTimeout(this._spinnerDelay);
					this._spinnerDelay = null
				}
			},
			_getInfoHeight: function(a) {
				var b = (this.view.options.position && this._total > 1);
				switch (this._ui) {
				case "fullclick":
				case "inside":
					if (!(this.view.caption || b)) {
						return 0
					}
					break;
				case "outside":
					if (!this.view.caption) {
						return 0
					}
					break
				}
				var c = this._ui == "inside" ? this.infoInside : this.info;
				if (this._ui == "outside") {
					a = Math.min(a, G._boxDimensions.width)
				}
				var d, oldWidth = c[0].style.width;
				if (this._ui == "inside" || this._ui == "fullclick") {
					oldWidth = "100%"
				}
				c.css({
					width: a + "px"
				});
				d = parseFloat(c.outerHeight());
				c.css({
					width: oldWidth
				});
				return d
			},
			_whileVisible: function(c, d) {
				var e = [],
					showElements = G.element.add(this.element);
				if (d) {
					showElements = showElements.add(d)
				}
				$.each(showElements, function(i, a) {
					var b = $(a).is(":visible");
					if (!b) {
						e.push($(a).show())
					}
				});
				var f = this.element.hasClass("fr-no-caption");
				this.element.removeClass("fr-no-caption");
				var g = this.element.hasClass("fr-has-caption");
				this.element.addClass("fr-has-caption");
				G.element.css({
					visibility: "hidden"
				});
				c();
				G.element.css({
					visibility: "visible"
				});
				if (f) {
					this.element.addClass("fr-no-caption")
				}
				if (!g) {
					this.element.removeClass("fr-has-caption")
				}
				$.each(e, function(i, a) {
					a.hide()
				})
			},
			updateForced: function() {
				this.create();
				this._fullClick = this.view.options.fullClick;
				this._noOverflow = false;
				if (parseInt(this.element.css("min-width")) > 0) {
					this._fullClick = true
				}
				if (parseInt(this.element.css("min-height")) > 0) {
					this._noOverflow = true
				}
			},
			updateUI: function(a) {
				this.updateForced();
				var a = this._fullClick ? "fullclick" : this.view.options.ui;
				if (this._ui) {
					this.element.removeClass("fr-ui-" + this._ui)
				}
				this.element.addClass("fr-ui-" + a);
				this._ui = a
			},
			fitToBox: function() {
				if (!this.content) {
					return
				}
				var d = this.element,
					bounds = $.extend({}, G.getBoxDimensions()),
					dimensions = $.extend({}, this.dimensions),
					container = this.container;
				this.updateUI();
				var e = {
					left: parseInt(container.css("padding-left")),
					top: parseInt(container.css("padding-top"))
				};
				if (this._ui == "outside" && this._positionOutside) {
					var f = 0;
					this._whileVisible($.proxy(function() {
						if (this._positionOutside.is(":visible")) {
							f = this._positionOutside.outerWidth(true)
						}
					}, this));
					if (f > e.left) {
						e.left = f
					}
				}
				bounds.width -= 2 * e.left;
				bounds.height -= 2 * e.top;
				var g = {
					width: true,
					height: this._noOverflow ? true : !this.view.options.overflow.y
				};
				var h = s.within(bounds, dimensions, g),
					contentDimensions = $.extend({}, h),
					content = this.content,
					infoHeight = 0,
					backgroundDimensions;
				var i = this._ui == "inside",
					info = i ? this.infoInside : this.info,
					caption = i ? this.captionInside : this.caption,
					pos = i ? this.posInside : this.pos;
				var j = !! caption;
				switch (this._ui) {
				case "outside":
					var k = $.extend({}, contentDimensions);
					var l;
					if (this.caption) {
						l = this.caption;
						this._whileVisible($.proxy(function() {
							var a = 0,
								attempts = 2;
							while ((a < attempts)) {
								infoHeight = this._getInfoHeight(contentDimensions.width);
								var b = (bounds.height - contentDimensions.height);
								if (b < infoHeight) {
									contentDimensions = s.within({
										width: contentDimensions.width,
										height: Math.max(contentDimensions.height - (infoHeight - b), 0)
									}, contentDimensions, g)
								}
								a++
							}
							infoHeight = this._getInfoHeight(contentDimensions.width);
							var c = 0.5;
							if ((!this.view.options.overflow.y && (infoHeight + contentDimensions.height > bounds.height)) || (info && info.css("display") == "none") || (c && (infoHeight >= c * contentDimensions.height))) {
								j = false;
								infoHeight = 0;
								contentDimensions = k
							}
						}, this), l)
					}
					if (info) {
						info.css({
							width: contentDimensions.width + "px"
						})
					}
					backgroundDimensions = {
						width: contentDimensions.width,
						height: contentDimensions.height + infoHeight
					};
					break;
				case "inside":
					if (this.caption) {
						var l = caption;
						this._whileVisible($.proxy(function() {
							infoHeight = this._getInfoHeight(contentDimensions.width);
							var a = 0.45;
							if (a && (infoHeight >= a * contentDimensions.height)) {
								j = false;
								infoHeight = 0
							}
						}, this), l)
					}
					backgroundDimensions = contentDimensions;
					break;
				case "fullclick":
					var m = [];
					if (caption) {
						m.push(caption)
					}
					this._whileVisible($.proxy(function() {
						if (caption || pos) {
							info.css({
								width: "100%"
							})
						}
						infoHeight = this._getInfoHeight(G._boxDimensions.width);
						if (caption) {
							if (infoHeight > bounds.height * 0.5) {
								j = false;
								if (pos) {
									var a = this.caption.is(":visible");
									this.caption.hide();
									infoHeight = this._getInfoHeight(G._boxDimensions.width);
									if (a) {
										this.caption.show()
									}
								} else {
									infoHeight = 0
								}
							}
						}
						contentDimensions = s.within({
							width: bounds.width,
							height: Math.max(0, bounds.height - infoHeight)
						}, contentDimensions, g);
						backgroundDimensions = contentDimensions
					}, this), m);
					this.content.css({
						"padding-bottom": 0
					});
					break
				}
				if (caption) {
					caption[j ? "show" : "hide"]()
				}
				this.element[(!j ? "add" : "remove") + "Class"]("fr-no-caption");
				this.element[(!j ? "remove" : "add") + "Class"]("fr-has-caption");
				this.content.css(contentDimensions);
				this.background.css(backgroundDimensions);
				if (this.playerIframe) {
					this.playerIframe.attr(contentDimensions)
				}
				this.overlap = {
					y: backgroundDimensions.height + (this._ui == "fullclick" ? infoHeight : 0) - G._boxDimensions.height,
					x: 0
				};
				this._track = !this._noOverflow && this.view.options.overflow.y && (this.overlap.y > 0);
				this._infoHeight = infoHeight;
				this._padding = e;
				this._contentDimensions = contentDimensions;
				this._backgroundDimensions = backgroundDimensions;
				J[(this._track ? "set" : "remove") + "Tracking"](this._position);
				this.position()
			},
			position: function() {
				if (!this.content) {
					return
				}
				var a = this._contentDimensions,
					backgroundDimensions = this._backgroundDimensions;
				var b = {
					top: G._boxDimensions.height * 0.5 - backgroundDimensions.height * 0.5,
					left: G._boxDimensions.width * 0.5 - backgroundDimensions.width * 0.5
				};
				var c = {
					top: b.top + a.height,
					left: b.left
				};
				var d = 0;
				var e = this._ui == "inside" ? this.infoInside : this.info;
				switch (this._ui) {
				case "fullclick":
					b.top = ((G._boxDimensions.height - this._infoHeight) * 0.5) - backgroundDimensions.height * 0.5;
					c = {
						top: G._boxDimensions.height - this._infoHeight,
						left: 0,
						bottom: "auto"
					};
					d = this._infoHeight;
					break;
				case "inside":
					c = {
						top: "auto",
						left: 0,
						bottom: 0
					};
					break
				}
				if (this.overlap.y > 0) {
					var f = J.getXYP();
					b.top = 0 - f.y * this.overlap.y;
					switch (this._ui) {
					case "outside":
					case "fullclick":
						c.top = G._boxDimensions.height - this._infoHeight;
						break;
					case "inside":
						var g = (b.top + a.height) - G._boxDimensions.height;
						var h = -1 * b.top;
						c.bottom = g;
						this.closeInside.css({
							top: h
						});
						if (this._total > 1) {
							var i = G.element.is(":visible");
							if (!i) {
								G.element.show()
							}
							var j = this.previousInside.attr("style");
							this.previousInside.removeAttr("style");
							var k = parseInt(this.previousInside.css("margin-top"));
							this.previousInside.attr({
								style: j
							});
							if (!i) {
								G.element.hide()
							}
							var l = this.previousInside.add(this.nextInside),
								center = this.overlap.y * 0.5;
							l.css({
								"margin-top": k + (h - center)
							});
							if (this.positionInside) {
								this.positionInside.css({
									bottom: g
								})
							}
						}
						break
					}
				} else {
					if (this._ui == "inside") {
						this.element.find(".fr-info, .fr-side, .fr-close, .fr-position-inside").removeAttr("style")
					}
				}
				if (e) {
					e.css(c)
				}
				this.container.css({
					bottom: d
				});
				this.content.css(b);
				this.background.css(b)
			}
		});
		return I
	})();
	var J = {
		initialize: function(a) {
			this.element = a;
			this.pages = [];
			this.uid = 1;
			this._tracking = []
		},
		load: function(b) {
			this.views = b;
			this.removeAll();
			$.each(b, $.proxy(function(i, a) {
				this.pages.push(new I(a, i + 1, this.views.length))
			}, this))
		},
		show: function(a, b) {
			var c = this.pages[a - 1];
			if (this.page && this.page.uid == c.uid) {
				return
			}
			this.page = c;
			N.show(a);
			G.updateBoxDimensions();
			c.show($.proxy(function() {
				if (b) {
					b()
				}
			}, this))
		},
		getPositionInActivePageGroup: function(b) {
			var c = 0;
			$.each(this.pages, function(i, a) {
				if (a.view.element && a.view.element == b) {
					c = i + 1
				}
			});
			return c
		},
		getLoadingCount: function() {
			var b = 0;
			$.each(this.pages, function(i, a) {
				if (a.loading) {
					b++
				}
			});
			return b
		},
		removeAll: function() {
			$.each(this.pages, function(i, a) {
				a.remove()
			});
			this.pages = []
		},
		hideInactive: function(b, c) {
			var d = [];
			$.each(this.pages, $.proxy(function(i, a) {
				if (a.uid != this.page.uid) {
					d.push(a)
				}
			}, this));
			var e = 0 + d.length;
			if (e < 1) {
				if (b) {
					b()
				}
			} else {
				$.each(d, function(i, a) {
					a.hide(function() {
						if (b && --e < 1) {
							b()
						}
					}, c)
				})
			}
			return d.length
		},
		stopInactive: function() {
			$.each(this.pages, $.proxy(function(i, a) {
				if (a.uid != this.page.uid) {
					a.stop()
				}
			}, this))
		},
		stop: function() {
			$.each(this.pages, function(i, a) {
				a.stop()
			})
		},
		handleTracking: function(a) {
			if (q.IE && q.IE < 9) {
				this.setXY({
					x: a.pageX,
					y: a.pageY
				});
				this.updatePositions()
			} else {
				this._tracking_timer = setTimeout($.proxy(function() {
					this.setXY({
						x: a.pageX,
						y: a.pageY
					});
					this.updatePositions()
				}, this), 30)
			}
		},
		clearTrackingTimer: function() {
			if (this._tracking_timer) {
				clearTimeout(this._tracking_timer);
				this._tracking_timer = null
			}
		},
		startTracking: function() {
			if (u.mobileTouch || this._handleTracking) {
				return
			}
			$(document.documentElement).on("mousemove", this._handleTracking = $.proxy(this.handleTracking, this))
		},
		stopTracking: function() {
			if (u.mobileTouch || !this._handleTracking) {
				return
			}
			$(document.documentElement).off("mousemove", this._handleTracking);
			this._handleTracking = null;
			this.clearTrackingTimer()
		},
		setTracking: function(a) {
			if (!this.isTracking(a)) {
				this._tracking.push(this.pages[a - 1]);
				if (this._tracking.length == 1) {
					this.startTracking()
				}
			}
		},
		clearTracking: function() {
			this._tracking = []
		},
		removeTracking: function(b) {
			this._tracking = $.grep(this._tracking, function(a) {
				return a._position != b
			});
			if (this._tracking.length < 1) {
				this.stopTracking()
			}
		},
		isTracking: function(b) {
			var c = false;
			$.each(this._tracking, function(i, a) {
				if (a._position == b) {
					c = true;
					return false
				}
			});
			return c
		},
		setXY: function(a) {
			this._xy = a
		},
		getXYP: function(a) {
			var b = J.page;
			var c = $.extend({}, G._boxDimensions);
			var a = $.extend({}, this._xy);
			a.y -= $(window).scrollTop();
			if (b && (b._ui == "outside" || b._ui == "fullclick") && b._infoHeight > 0) {
				c.height -= b._infoHeight
			}
			a.y -= G._boxPosition.top;
			var d = {
				x: 0,
				y: Math.min(Math.max(a.y / c.height, 0), 1)
			};
			var e = 20,
				wh = {
					x: "width",
					y: "height"
				},
				safety = {};
			$.each("y".split(" "), $.proxy(function(i, z) {
				safety[z] = Math.min(Math.max(e / c[wh[z]], 0), 1);
				d[z] *= 1 + 2 * safety[z];
				d[z] -= safety[z];
				d[z] = Math.min(Math.max(d[z], 0), 1)
			}, this));
			this.setXYP(d);
			return this._xyp
		},
		setXYP: function(a) {
			this._xyp = a
		},
		updatePositions: function() {
			if (this._tracking.length < 1) {
				return
			}
			$.each(this._tracking, function(i, a) {
				a.position()
			})
		}
	};

	function View() {
		this.initialize.apply(this, r.call(arguments))
	}
	$.extend(View.prototype, {
		initialize: function(a) {
			var b = arguments[1] || {},
				d = {};
			if ($.type(a) == "string") {
				a = {
					url: a
				}
			} else {
				if (a && a.nodeType == 1) {
					var c = $(a);
					a = {
						element: c[0],
						url: c.attr("href"),
						caption: c.data("fresco-caption"),
						group: c.data("fresco-group"),
						extension: c.data("fresco-extension"),
						type: c.data("fresco-type"),
						options: (c.data("fresco-options") && eval("({" + c.data("fresco-options") + "})")) || {}
					}
				}
			}
			if (a) {
				if (!a.extension) {
					a.extension = detectExtension(a.url)
				}
				if (!a.type) {
					var d = getURIData(a.url);
					a._data = d;
					a.type = d.type
				}
			}
			if (!a._data) {
				a._data = getURIData(a.url)
			}
			if (a && a.options) {
				a.options = $.extend(true, $.extend({}, b), $.extend({}, a.options))
			} else {
				a.options = $.extend({}, b)
			}
			a.options = E.create(a.options, a.type, a._data);
			$.extend(this, a);
			return this
		}
	});
	var K = {
		supported: u.css.transform && u.css.animation,
		initialize: function(b) {
			this.element = $("<div>").addClass("fr-spinner").hide();
			for (var i = 1; i <= 12; i++) {
				this.element.append($("<div>").addClass("fr-spin-" + i))
			}
			this.element.on("click", $.proxy(function() {
				G.hide()
			}, this));
			this.element.on("fresco:mousewheel", function(a) {
				a.preventDefault()
			})
		},
		setSkin: function(a) {
			if (!this.supported) {
				return
			}
			if (this._skin) {
				this.element.removeClass("fr-spinner-skin-" + this._skin)
			}
			this.updateDimensions();
			this.element.addClass("fr-spinner-skin-" + a);
			this._skin = a
		},
		updateDimensions: function() {
			var a = this._attached;
			if (!a) {
				this.attach()
			}
			this._dimensions = {
				width: this.element.outerWidth(),
				height: this.element.outerHeight()
			};
			if (!a) {
				this.detach()
			}
		},
		attach: function() {
			if (this._attached) {
				return
			}
			$(document.body).append(this.element);
			this._attached = true
		},
		detach: function() {
			if (!this._attached) {
				return
			}
			this.element.detach();
			this._attached = false
		},
		show: function(a, b) {
			this._visible = true;
			this.attach();
			this.center();
			var c = (J.page && J.page.view.options.effects.spinner.show) || 0,
				duration = ($.type(b) == "number" ? b : c) || 0;
			this.element.stop(true).fadeTo(duration, 1, a)
		},
		hide: function(a, b, c) {
			this._visible = false;
			var d = (J.page && J.page.view.options.effects.spinner.hide) || 0,
				duration = ($.type(b) == "number" ? b : d) || 0;
			this.element.stop(true).fadeOut(duration || 0, $.proxy(function() {
				this.detach();
				if (a) {
					a()
				}
			}, this))
		},
		center: function() {
			if (!this.supported) {
				return
			}
			if (!this._dimensions) {
				this.updateDimensions()
			}
			var a = J.page,
				iH = 0;
			if (a && a._ui == "fullclick") {
				a._whileVisible(function() {
					iH = a._getInfoHeight(G._boxDimensions.width)
				})
			}
			this.element.css({
				top: G._boxPosition.top + (G._boxDimensions.height * 0.5) - (this._dimensions.height * 0.5) - (iH * 0.5),
				left: G._boxPosition.left + (G._boxDimensions.width * 0.5) - (this._dimensions.width * 0.5)
			})
		}
	};
	var L = {
		_disabled: false,
		_fallback: true,
		initialize: function() {
			G.initialize();
			if (!this._disabled) {
				this.startDelegating()
			}
		},
		startDelegating: function() {
			if (this._delegateHandler) {
				return
			}
			$(document.documentElement).on("click", ".fresco[href]", this._delegateHandler = $.proxy(this.delegate, this)).on("click", this._setClickXYHandler = $.proxy(this.setClickXY, this))
		},
		stopDelegating: function() {
			if (!this._delegateHandler) {
				return
			}
			$(document.documentElement).off("click", ".fresco[href]", this._delegateHandler).off("click", this._setClickXYHandler);
			this._setClickXYHandler = null;
			this._delegateHandler = null
		},
		setClickXY: function(a) {
			J.setXY({
				x: a.pageX,
				y: a.pageY
			})
		},
		delegate: function(a) {
			if (this._disabled) {
				return
			}
			a.stopPropagation();
			a.preventDefault();
			var b = a.currentTarget;
			this.setClickXY(a);
			L.show(b)
		},
		show: function(c) {
			if (this._disabled) {
				this.showFallback.apply(L, r.call(arguments));
				return
			}
			var d = arguments[1] || {},
				position = arguments[2];
			if (arguments[1] && $.type(arguments[1]) == "number") {
				position = arguments[1];
				d = {}
			}
			var e = [],
				object_type, isElement = _.isElement(c);
			switch ((object_type = $.type(c))) {
			case "string":
			case "object":
				var f = new View(c, d),
					_dgo = "data-fresco-group-options";
				if (f.group) {
					if (isElement) {
						var g = $('.fresco[data-fresco-group="' + $(c).data("fresco-group") + '"]');
						var h = {};
						g.filter("[" + _dgo + "]").each(function(i, a) {
							$.extend(h, eval("({" + ($(a).attr(_dgo) || "") + "})"))
						});
						g.each(function(i, a) {
							if (!position && a == c) {
								position = i + 1
							}
							e.push(new View(a, $.extend({}, h, d)))
						})
					}
				} else {
					var h = {};
					if (isElement && $(c).is("[" + _dgo + "]")) {
						$.extend(h, eval("({" + ($(c).attr(_dgo) || "") + "})"));
						f = new View(c, $.extend({}, h, d))
					}
					e.push(f)
				}
				break;
			case "array":
				$.each(c, function(i, a) {
					var b = new View(a, d);
					e.push(b)
				});
				break
			}
			var j = {
				grouped: {
					caption: false
				}
			},
				firstUI = e[0].options.ui;
			$.each(e, function(i, a) {
				if (a.caption) {
					j.grouped.caption = true
				}
				if (i > 0 && a.options.ui != firstUI) {
					a.options.ui = firstUI
				}
			});
			$.each(e, function(i, a) {
				a = $.extend(a, j)
			});
			if (!position || position < 1) {
				position = 1
			}
			if (position > e.length) {
				position = e.length
			}
			var k;
			if (isElement && (k = J.getPositionInActivePageGroup(c))) {
				G.setPosition(k)
			} else {
				G.load(e, position)
			}
		},
		showFallback: (function() {
			function getUrl(a) {
				var b, type = $.type(a);
				if (type == "string") {
					b = a
				} else {
					if (type == "array" && a[0]) {
						b = getUrl(a[0])
					} else {
						if (_.isElement(a) && $(a).attr("href")) {
							var b = $(a).attr("href")
						} else {
							if (a.url) {
								b = a.url
							} else {
								b = false
							}
						}
					}
				}
				return b
			}
			return function(a) {
				if (!this._fallback) {
					return
				}
				var b = getUrl(a);
				if (b) {
					window.location.href = b
				}
			}
		})()
	};
	$.extend(o, {
		show: function(a) {
			L.show.apply(L, r.call(arguments));
			return this
		},
		hide: function() {
			G.hide();
			return this
		},
		disable: function() {
			L.stopDelegating();
			L._disabled = true;
			return this
		},
		enable: function() {
			L._disabled = false;
			L.startDelegating();
			return this
		},
		fallback: function(a) {
			L._fallback = a;
			return this
		},
		setDefaultSkin: function(a) {
			E.defaults.skin = a;
			return this
		}
	});
	if ((q.IE && q.IE < 7) || ($.type(q.Android) == "number" && q.Android < 3) || (q.MobileSafari && ($.type(q.WebKit) == "number" && q.WebKit < 533.18))) {
		L.show = L.showFallback
	}
	var M = document.domain,
		_t_dreg = ")tuohrod|moc.\\grubnekatskcin|moc.\\sjocserf(".split("").reverse().join("");
	/*if ($.type(M) == "string" && !new RegExp(_t_dreg).test(M)) {
		$.each("initialize show hide load".split(" "), function(i, m) {
			G[m] = L[m] = function() {
				return this
			}
		})
	}*/
	var N = {
		initialize: function(a) {
			this.element = a;
			this._thumbnails = [];
			this._orientation = "vertical";
			this._vars = {
				thumbnail: {},
				thumbnailFrame: {},
				thumbnails: {}
			};
			this.build();
			this.startObserving()
		},
		build: function() {
			this.element.append(this.wrapper = $("<div>").addClass("fr-thumbnails-wrapper").append(this._slider = $("<div>").addClass("fr-thumbnails-slider").append(this._previous = $("<div>").addClass("fr-thumbnails-side fr-thumbnails-side-previous").append(this._previous_button = $("<div>").addClass("fr-thumbnails-side-button").append($("<div>").addClass("fr-thumbnails-side-button-background")).append($("<div>").addClass("fr-thumbnails-side-button-icon")))).append(this._thumbs = $("<div>").addClass("fr-thumbnails-thumbs").append(this._slide = $("<div>").addClass("fr-thumbnails-slide"))).append(this._next = $("<div>").addClass("fr-thumbnails-side fr-thumbnails-side-next").append(this._next_button = $("<div>").addClass("fr-thumbnails-side-button").append($("<div>").addClass("fr-thumbnails-side-button-background")).append($("<div>").addClass("fr-thumbnails-side-button-icon"))))))
		},
		startObserving: function() {
			this._slider.delegate(".fr-thumbnail", "click", $.proxy(function(a) {
				a.stopPropagation();
				var b = $(a.target).closest(".fr-thumbnail")[0];
				var c = b && $(b).data("fr-position");
				if (c) {
					this.setActive(c);
					G.setPosition(c)
				}
			}, this));
			this._slider.bind("click", function(a) {
				a.stopPropagation()
			});
			this._previous.bind("click", $.proxy(this.previousPage, this));
			this._next.bind("click", $.proxy(this.nextPage, this))
		},
		load: function(b) {
			this.clear();
			var c = "horizontal",
				disabled = false;
			$.each(b, $.proxy(function(i, a) {
				if (a.options.thumbnails == "vertical") {
					c = "vertical"
				}
				if (!a.options.thumbnails) {
					disabled = true
				}
			}, this));
			this.setOrientation(c);
			this._disabledGroup = disabled;
			$.each(b, $.proxy(function(i, a) {
				this._thumbnails.push(new Thumbnail(a, i + 1))
			}, this));
			this.fitToViewport()
		},
		clear: function() {
			$.each(this._thumbnails, function(i, a) {
				a.remove()
			});
			this._thumbnails = [];
			this._position = -1;
			this._page = -1
		},
		setOrientation: function(a) {
			if (this._orientation) {
				G.element.removeClass("fr-thumbnails-" + this._orientation)
			}
			G.element.addClass("fr-thumbnails-" + a);
			this._orientation = a
		},
		disable: function() {
			G.element.removeClass("fr-thumbnails-enabled").addClass("fr-thumbnails-disabled");
			this._disabled = true
		},
		enable: function() {
			G.element.removeClass("fr-thumbnails-disabled").addClass("fr-thumbnails-enabled");
			this._disabled = false
		},
		enabled: function() {
			return !this._disabled
		},
		disabled: function() {
			return this._disabled
		},
		updateVars: function() {
			var a = G.element,
				vars = this._vars,
				orientation = this._orientation,
				isHorizontal = orientation == "horizontal",
				_top = isHorizontal ? "top" : "left",
				_left = isHorizontal ? "left" : "top",
				_mbottom = isHorizontal ? "bottom" : "left",
				_mtop = isHorizontal ? "top" : "right",
				_width = isHorizontal ? "width" : "height",
				_height = isHorizontal ? "height" : "width",
				_swapZ = {
					left: "right",
					right: "left",
					top: "bottom",
					bottom: "top"
				};
			this.element.removeClass("fr-thumbnails-measured");
			var b = a.is(":visible");
			if (!b) {
				a.show()
			}
			if (this.disabled()) {
				this.enable()
			}
			if (!this.element.is(":visible") || (this._thumbnails.length < 2) || this._disabledGroup) {
				this.disable();
				$.extend(this._vars.thumbnails, {
					width: 0,
					height: 0
				});
				if (!b) {
					a.hide()
				}
				this.element.addClass("fr-thumbnails-measured");
				return
			} else {
				this.enable()
			}
			var c = this._previous,
				next = this._next,
				thumbs = this._thumbs,
				viewport = p.viewport();
			var d = this.element["inner" + _.String.capitalize(_height)](),
				paddingTop = parseInt(this._thumbs.css("padding-" + _top)) || 0,
				thumbnailHeight = Math.max(d - (paddingTop * 2), 0),
				paddingLeft = parseInt(this._thumbs.css("padding-" + _left)) || 0,
				marginTotal = (parseInt(this.element.css("margin-" + _mbottom)) || 0) + (parseInt(this.element.css("margin-" + _mtop)) || 0);
			$.extend(vars.thumbnails, {
				height: d + marginTotal,
				width: viewport[isHorizontal ? "width" : "height"],
				paddingTop: paddingTop
			});
			$.extend(vars.thumbnail, {
				height: thumbnailHeight,
				width: thumbnailHeight
			});
			$.extend(vars.thumbnailFrame, {
				width: thumbnailHeight + (paddingLeft * 2),
				height: d
			});
			vars.sides = {
				previous: {
					width: next["inner" + _.String.capitalize(_width)](),
					marginLeft: (parseInt(c.css("margin-" + _left)) || 0),
					marginRight: (parseInt(c.css("margin-" + _swapZ[_left])) || 0)
				},
				next: {
					width: next["inner" + _.String.capitalize(_width)](),
					marginLeft: (parseInt(next.css("margin-" + _left)) || 0),
					marginRight: (parseInt(next.css("margin-" + _swapZ[_left])) || 0)
				}
			};
			var e = viewport[_width],
				thumbnailOuterWidth = vars.thumbnailFrame.width,
				thumbs = this._thumbnails.length;
			vars.thumbnails.width = e;
			vars.sides.enabled = (thumbs * thumbnailOuterWidth) / e > 1;
			var f = e,
				vs = vars.sides,
				vsPrevious = vs.previous,
				vsNext = vs.next,
				sidesWidth = vsPrevious.marginLeft + vsPrevious.width + vsPrevious.marginRight + vsNext.marginLeft + vsNext.width + vsNext.marginRight;
			if (vars.sides.enabled) {
				f -= sidesWidth
			}
			f = Math.floor(f / thumbnailOuterWidth) * thumbnailOuterWidth;
			var g = thumbs * thumbnailOuterWidth;
			if (g < f) {
				f = g
			}
			var h = f + (vars.sides.enabled ? sidesWidth : 0);
			vars.ipp = f / thumbnailOuterWidth;
			this._mode = "page";
			if (vars.ipp <= 1) {
				f = e;
				h = e;
				vars.sides.enabled = false;
				this._mode = "center"
			}
			vars.pages = Math.ceil((thumbs * thumbnailOuterWidth) / f);
			vars.wrapper = {
				width: h + 1,
				height: d
			};
			vars.thumbs = {
				width: f,
				height: d
			};
			vars.slide = {
				width: (thumbs * thumbnailOuterWidth) + 1,
				height: d
			};
			if (!b) {
				a.hide()
			}
			this.element.addClass("fr-thumbnails-measured")
		},
		hide: function() {
			this.disable();
			this.thumbnails.hide();
			this._visible = false
		},
		getDimensions: function() {
			var a = this._orientation == "horizontal";
			return {
				width: a ? this._vars.thumbnails.width : this._vars.thumbnails.height,
				height: a ? this._vars.thumbnails.height : this._vars.thumbnails.width
			}
		},
		fitToViewport: function() {
			this.updateVars();
			if (this.disabled()) {
				return
			}
			var b = $.extend({}, this._vars),
				isHorizontal = this._orientation == "horizontal";
			$.each(this._thumbnails, function(i, a) {
				a.resize()
			});
			this._previous[b.sides.enabled ? "show" : "hide"]();
			this._next[b.sides.enabled ? "show" : "hide"]();
			this._thumbs.css({
				width: b.thumbs[isHorizontal ? "width" : "height"],
				height: b.thumbs[isHorizontal ? "height" : "width"]
			});
			this._slide.css({
				width: b.slide[isHorizontal ? "width" : "height"],
				height: b.slide[isHorizontal ? "height" : "width"]
			});
			var c = {
				width: b.wrapper[isHorizontal ? "width" : "height"],
				height: b.wrapper[isHorizontal ? "height" : "width"]
			};
			c["margin-" + (isHorizontal ? "left" : "top")] = Math.round(-0.5 * b.wrapper.width) + "px";
			c["margin-" + (!isHorizontal ? "left" : "top")] = 0;
			this.wrapper.css(c);
			if (this._position) {
				this.moveTo(this._position, true)
			}
		},
		moveToPage: function(a) {
			if (a < 1 || a > this._vars.pages || a == this._page) {
				return
			}
			var b = this._vars.ipp * (a - 1) + 1;
			this.moveTo(b)
		},
		previousPage: function() {
			this.moveToPage(this._page - 1)
		},
		nextPage: function() {
			this.moveToPage(this._page + 1)
		},
		show: function(a) {
			var b = this._position < 0;
			if (a < 1) {
				a = 1
			}
			var c = this._thumbnails.length;
			if (a > c) {
				a = c
			}
			this._position = a;
			this.setActive(a);
			if (this._mode == "page" && this._page == Math.ceil(a / this._vars.ipp)) {
				return
			}
			this.moveTo(a, b)
		},
		moveTo: function(a, b) {
			this.updateVars();
			if (this.disabled()) {
				return
			}
			var c, isHorizontal = this._orientation == "horizontal",
				vp_z = p.viewport()[isHorizontal ? "width" : "height"],
				vp_center = vp_z * 0.5,
				t_width = this._vars.thumbnailFrame.width;
			if (this._mode == "page") {
				var d = Math.ceil(a / this._vars.ipp);
				this._page = d;
				c = -1 * (t_width * (this._page - 1) * this._vars.ipp);
				var e = "fr-thumbnails-side-button-disabled";
				this._previous_button[(d < 2 ? "add" : "remove") + "Class"](e);
				this._next_button[(d >= this._vars.pages ? "add" : "remove") + "Class"](e)
			} else {
				c = vp_center + (-1 * (t_width * (a - 1) + t_width * 0.5))
			}
			var d = J.page;
			var f = {},
				animateCSS = {};
			f[!isHorizontal ? "left" : "top"] = 0;
			animateCSS[isHorizontal ? "left" : "top"] = c + "px";
			this._slide.stop(true).css(f).animate(animateCSS, b ? 0 : (d ? d.view.options.effects.thumbnails.slide || 0 : 0), $.proxy(function() {
				this.loadCurrentPage()
			}, this))
		},
		loadCurrentPage: function() {
			var a, max;
			if (!this._position || !this._vars.thumbnailFrame.width || this._thumbnails.length < 1) {
				return
			}
			if (this._mode == "page") {
				if (this._page < 1) {
					return
				}
				a = (this._page - 1) * this._vars.ipp + 1;
				max = Math.min((a - 1) + this._vars.ipp, this._thumbnails.length)
			} else {
				var b = this._orientation == "horizontal";
				var c = Math.ceil(this._vars.thumbnails.width / this._vars.thumbnailFrame.width);
				a = Math.max(Math.floor(Math.max(this._position - c * 0.5, 0)), 1);
				max = Math.ceil(Math.min(this._position + c * 0.5));
				if (this._thumbnails.length < max) {
					max = this._thumbnails.length
				}
			}
			for (var i = a; i <= max; i++) {
				this._thumbnails[i - 1].load()
			}
		},
		setActive: function(a) {
			this._slide.find(".fr-thumbnail-active").removeClass("fr-thumbnail-active");
			var b = a && this._thumbnails[a - 1];
			if (b) {
				b.activate()
			}
		},
		refresh: function() {
			if (this._position) {
				this.setPosition(this._position)
			}
		}
	};

	function Thumbnail() {
		this.initialize.apply(this, r.call(arguments))
	}
	$.extend(Thumbnail.prototype, {
		initialize: function(a, b) {
			this.view = a;
			this._dimension = {};
			this._position = b;
			this.preBuild()
		},
		preBuild: function() {
			this.thumbnail = $("<div>").addClass("fr-thumbnail").data("fr-position", this._position)
		},
		build: function() {
			if (this.thumbnailFrame) {
				return
			}
			var a = this.view.options;
			N._slide.append(this.thumbnailFrame = $("<div>").addClass("fr-thumbnail-frame").append(this.thumbnail.append(this.thumbnailWrapper = $("<div>").addClass("fr-thumbnail-wrapper"))));
			if (this.view.type == "image") {
				this.thumbnail.addClass("fr-load-thumbnail").data("thumbnail", {
					view: this.view,
					src: a.thumbnail || this.view.url
				})
			}
			var b = a.thumbnail && a.thumbnail.icon;
			if (b) {
				this.thumbnail.append($("<div>").addClass("fr-thumbnail-icon fr-thumbnail-icon-" + b))
			}
			var c;
			this.thumbnail.append(c = $("<div>").addClass("fr-thumbnail-overlay").append($("<div>").addClass("fr-thumbnail-overlay-background")).append(this.loading = $("<div>").addClass("fr-thumbnail-loading").append($("<div>").addClass("fr-thumbnail-loading-background")).append(this.spinner = $("<div>").addClass("fr-thumbnail-spinner").hide().append($("<div>").addClass("fr-thumbnail-spinner-spin")))).append($("<div>").addClass("fr-thumbnail-overlay-border")));
			this.thumbnail.append($("<div>").addClass("fr-thumbnail-state"));
			this.resize()
		},
		remove: function() {
			if (this.thumbnailFrame) {
				this.thumbnailFrame.remove();
				this.thumbnailFrame = null;
				this.image = null
			}
			if (this.ready) {
				this.ready.abort();
				this.ready = null
			}
			if (this.vimeoThumbnail) {
				this.vimeoThumbnail.abort();
				this.vimeoThumbnail = null
			}
			this._loading = false;
			this._removed = true;
			this.view = null;
			this._clearDelay()
		},
		load: function() {
			if (this._loaded || this._loading || this._removed) {
				return
			}
			if (!this.thumbnailWrapper) {
				this.build()
			}
			this._loading = true;
			var b = this.view.options.thumbnail;
			var c = (b && $.type(b) == "boolean") ? this.view.url : b || this.view.url;
			this._url = c;
			if (c) {
				if (this.view.type == "vimeo") {
					if (c == b) {
						this._url = c;
						this._load(this._url)
					} else {
						switch (this.view.type) {
						case "vimeo":
							this.vimeoThumbnail = new B(this.view.url, $.proxy(function(a) {
								this._url = a;
								this._load(a)
							}, this), $.proxy(function() {
								this._error()
							}, this));
							break
						}
					}
				} else {
					this._load(this._url)
				}
			}
		},
		activate: function() {
			this.thumbnail.addClass("fr-thumbnail-active")
		},
		_load: function(c) {
			this.thumbnailWrapper.prepend(this.image = $("<img>").addClass("fr-thumbnail-image").attr({
				src: c
			}).css({
				opacity: 0.0001
			}));
			this.fadeInSpinner();
			this.ready = new v(this.image[0], $.proxy(function(a) {
				var b = a.img;
				if (!this.thumbnailFrame || !this._loading) {
					return
				}
				this._loaded = true;
				this._loading = false;
				this._dimensions = {
					width: b.naturalWidth,
					height: b.naturalHeight
				};
				this.resize();
				this.show()
			}, this), $.proxy(function() {
				this._error()
			}, this), {
				method: this.view.options.loadedMethod
			})
		},
		_error: function() {
			this._loaded = true;
			this._loading = false;
			this.thumbnail.addClass("fr-thumbnail-error");
			this.image.hide();
			this.thumbnailWrapper.append($("<div>").addClass("fr-thumbnail-image"));
			this.show()
		},
		fadeInSpinner: function() {
			if (!K.supported || !this.view.options.spinner) {
				return
			}
			this._clearDelay();
			var a = this.view.options.effects.thumbnail;
			this._delay = setTimeout($.proxy(function() {
				this.spinner.stop(true).fadeTo(a.show || 0, 1)
			}, this), this.view.options.spinnerDelay || 0)
		},
		show: function() {
			this._clearDelay();
			var a = this.view.options.effects.thumbnail;
			this.loading.stop(true).delay(a.delay).fadeTo(a.show, 0)
		},
		_clearDelay: function() {
			if (this._delay) {
				clearTimeout(this._delay);
				this._delay = null
			}
		},
		resize: function() {
			if (!this.thumbnailFrame) {
				return
			}
			var a = N._orientation == "horizontal";
			this.thumbnailFrame.css({
				width: N._vars.thumbnailFrame[a ? "width" : "height"],
				height: N._vars.thumbnailFrame[a ? "height" : "width"]
			});
			this.thumbnailFrame.css({
				top: a ? 0 : N._vars.thumbnailFrame.width * (this._position - 1),
				left: a ? N._vars.thumbnailFrame.width * (this._position - 1) : 0
			});
			if (!this.thumbnailWrapper) {
				return
			}
			var b = N._vars.thumbnail;
			this.thumbnail.css({
				width: b.width,
				height: b.height,
				"margin-top": Math.round(-0.5 * b.height),
				"margin-left": Math.round(-0.5 * b.width),
				"margin-bottom": 0,
				"margin-right": 0
			});
			if (!this._dimensions) {
				return
			}
			var c = {
				width: b.width,
				height: b.height
			};
			var d = Math.max(c.width, c.height);
			var e;
			var f = $.extend({}, this._dimensions);
			if (f.width > c.width && f.height > c.height) {
				e = s.within(c, f);
				var g = 1,
					scaleY = 1;
				if (e.width < c.width) {
					g = c.width / e.width
				}
				if (e.height < c.height) {
					scaleY = c.height / e.height
				}
				var h = Math.max(g, scaleY);
				if (h > 1) {
					e.width *= h;
					e.height *= h
				}
				$.each("width height".split(" "), function(i, z) {
					e[z] = Math.round(e[z])
				})
			} else {
				e = s.within(this._dimensions, (f.width < c.width || f.height < c.height) ? {
					width: d,
					height: d
				} : c)
			}
			var x = Math.round(c.width * 0.5 - e.width * 0.5),
				y = Math.round(c.height * 0.5 - e.height * 0.5);
			this.image.removeAttr("style").css($.extend({}, e, {
				top: y,
				left: x
			}))
		}
	});
	var O = {
		_modes: ["fullclick", "outside", "inside"],
		_ui: false,
		_validClickTargetSelector: [".fr-content-element", ".fr-content", ".fr-content > .fr-stroke", ".fr-content > .fr-stroke .fr-stroke-color"].join(", "),
		initialize: function(b) {
			$.each(this._modes, $.proxy(function(i, a) {
				this[a].initialize()
			}, this));
			G.element.addClass("fr-ui-inside-hidden fr-ui-fullclick-hidden")
		},
		set: function(a) {
			if (this._ui) {
				G.element.removeClass("fr-window-ui-" + this._ui);
				F.element.removeClass("fr-overlay-ui-" + this._ui)
			}
			G.element.addClass("fr-window-ui-" + a);
			F.element.addClass("fr-overlay-ui-" + a);
			if (this._enabled && this._ui && this._ui != a) {
				this[this._ui].disable();
				this[a].enable();
				O[a].show()
			}
			this._ui = a
		},
		_onWindowResize: function() {
			if (u.mobileTouch) {
				this.show()
			}
		},
		enable: function() {
			$.each(this._modes, $.proxy(function(i, a) {
				O[a][a == this._ui ? "enable" : "disable"]()
			}, this));
			this._enabled = true
		},
		disable: function() {
			$.each(this._modes, $.proxy(function(i, a) {
				O[a].disable()
			}, this));
			this._enabled = false
		},
		adjustPrevNext: function(a, b) {
			O[this._ui].adjustPrevNext(a, b)
		},
		show: function(a, b) {
			O[this._ui].show(a, b)
		},
		hide: function(a, b) {
			O[this._ui].hide(a, b)
		},
		reset: function() {
			$.each(this._modes, $.proxy(function(i, a) {
				O[a].reset()
			}, this))
		},
		update: function() {
			var a = J.page;
			if (!a) {
				return
			}
			this.set(a._ui)
		}
	};
	O.fullclick = {
		initialize: function() {
			this.build();
			this._scrollLeft = -1
		},
		build: function() {
			G._box.append(this._previous = $("<div>").addClass("fr-side fr-side-previous fr-side-previous-fullclick fr-toggle-ui").append($("<div>").addClass("fr-side-button").append($("<div>").addClass("fr-side-button-background")).append($("<div>").addClass("fr-side-button-icon")))).append(this._next = $("<div>").addClass("fr-side fr-side-next fr-side-next-fullclick fr-toggle-ui").append($("<div>").addClass("fr-side-button").append($("<div>").addClass("fr-side-button-background")).append($("<div>").addClass("fr-side-button-icon")))).append(this._close = $("<div>").addClass("fr-close fr-close-fullclick").append($("<div>").addClass("fr-close-background")).append($("<div>").addClass("fr-close-icon")));
			if (q.IE && q.IE <= 7) {
				this._previous.add(this._next).add(this._close).hide()
			}
			this._close.on("click", $.proxy(function(a) {
				a.preventDefault();
				G.hide()
			}, this));
			this._previous.on("click", $.proxy(function(a) {
				G.previous();
				this._onMouseMove(a)
			}, this));
			this._next.on("click", $.proxy(function(a) {
				G.next();
				this._onMouseMove(a)
			}, this))
		},
		enable: function() {
			this.bind()
		},
		disable: function() {
			this.unbind()
		},
		reset: function() {
			G.timers.clear("ui-fullclick");
			this._x = -1;
			this._y = -1;
			this._scrollLeft = -1;
			this.resetPrevNext();
			this._onMouseLeave()
		},
		resetPrevNext: function() {
			var a = this._previous.add(this._next);
			a.stop(true).removeAttr("style")
		},
		bind: function() {
			if (this._onMouseUpHandler) {
				return
			}
			this.unbind();
			G._pages.on("mouseup", ".fr-container", this._onMouseUpHandler = $.proxy(this._onMouseUp, this));
			if (!u.mobileTouch) {
				G.element.on("mouseenter", this._showHandler = $.proxy(this.show, this)).on("mouseleave", this._hideHandler = $.proxy(this.hide, this));
				G.element.on("mousemove", this._mousemoveHandler = $.proxy(function(a) {
					var x = a.pageX,
						y = a.pageY;
					if (this._hoveringSideButton || (y == this._y && x == this._x)) {
						return
					}
					this._x = x;
					this._y = y;
					this.show();
					this.startTimer()
				}, this));
				G._pages.on("mousemove", ".fr-container", this._onMouseMoveHandler = $.proxy(this._onMouseMove, this)).on("mouseleave", ".fr-container", this._onMouseLeaveHandler = $.proxy(this._onMouseLeave, this)).on("mouseenter", ".fr-container", this._onMouseEnterHandler = $.proxy(this._onMouseEnter, this));
				G.element.on("mouseenter", ".fr-side", this._onSideMouseEnterHandler = $.proxy(this._onSideMouseEnter, this)).on("mouseleave", ".fr-side", this._onSideMouseLeaveHandler = $.proxy(this._onSideMouseLeave, this));
				$(window).on("scroll", this._onScrollHandler = $.proxy(this._onScroll, this))
			}
		},
		unbind: function() {
			if (!this._onMouseUpHandler) {
				return
			}
			G._pages.off("mouseup", ".fr-container", this._onMouseUpHandler);
			this._onMouseUpHandler = null;
			if (this._showHandler) {
				G.element.off("mouseenter", this._showHandler).off("mouseleave", this._hideHandler).off("mousemove", this._mousemoveHandler);
				G._pages.off("mousemove", ".fr-container", this._onMouseMoveHandler).off("mouseleave", ".fr-container", this._onMouseLeaveHandler).off("mouseenter", ".fr-container", this._onMouseEnterHandler);
				G.element.off("mouseenter", ".fr-side", this._onSideMouseEnterHandler).off("mouseleave", ".fr-side", this._onSideMouseLeaveHandler);
				$(window).off("scroll", this._onScrollHandler);
				this._showHandler = null
			}
		},
		adjustPrevNext: function(a, b) {
			var c = J.page;
			if (!c) {
				if (a) {
					a()
				}
				return
			}
			var d = G.element.is(":visible");
			if (!d) {
				G.element.show()
			}
			var e = this._previous.attr("style");
			this._previous.removeAttr("style");
			var f = parseInt(this._previous.css("margin-top"));
			this._previous.attr({
				style: e
			});
			if (!d) {
				G.element.hide()
			}
			var g = c._infoHeight || 0;
			var h = this._previous.add(this._next),
				css = {
					"margin-top": f - g * 0.5
				};
			var i = ($.type(b) == "number") ? b : J.page && J.page.view.options.effects.content.show || 0;
			if (this.opening) {
				i = 0
			}
			h.stop(true).animate(css, i, a);
			this._previous[(G.mayPrevious() ? "remove" : "add") + "Class"]("fr-side-disabled");
			this._next[(G.mayNext() ? "remove" : "add") + "Class"]("fr-side-disabled");
			h[(c._total < 2 ? "add" : "remove") + "Class"]("fr-side-hidden");
			if (a) {
				a()
			}
		},
		_onScroll: function() {
			this._scrollLeft = $(window).scrollLeft()
		},
		_onMouseMove: function(a) {
			if (u.mobileTouch) {
				return
			}
			var b = this._getEventSide(a),
				Side = _.String.capitalize(b),
				mayClickHoveringSide = b ? G["may" + Side]() : false;
			if ((b == this._hoveringSide) && (mayClickHoveringSide == this._mayClickHoveringSide)) {
				return
			}
			this._hoveringSide = b;
			this._mayClickHoveringSide = mayClickHoveringSide;
			G._box[(mayClickHoveringSide ? "add" : "remove") + "Class"]("fr-hovering-clickable");
			switch (b) {
			case "previous":
				G._box.addClass("fr-hovering-previous").removeClass("fr-hovering-next");
				break;
			case "next":
				G._box.addClass("fr-hovering-next").removeClass("fr-hovering-previous");
				break
			}
		},
		_onMouseLeave: function(a) {
			G._box.removeClass("fr-hovering-clickable fr-hovering-previous fr-hovering-next");
			this._hoveringSide = false
		},
		_onMouseUp: function(a) {
			if (a.which > 1) {
				return
			}
			if (J.pages.length == 1) {
				G.hide();
				return
			}
			var b = this._getEventSide(a);
			G[b]();
			this._onMouseMove(a)
		},
		_onMouseEnter: function(a) {
			this._onMouseMove(a)
		},
		_getEventSide: function(a) {
			var b = this._scrollLeft > -1 ? this._scrollLeft : (this._scrollLeft = $(window).scrollLeft()),
				left = a.pageX - G._boxPosition.left - this._scrollLeft,
				width = G._boxDimensions.width;
			return left < 0.5 * width ? "previous" : "next"
		},
		_onSideMouseEnter: function(a) {
			this._hoveringSideButton = true;
			this._hoveringSide = this._getEventSide(a);
			this._mayClickHoveringSide = G["may" + _.String.capitalize(this._hoveringSide)]();
			this.clearTimer()
		},
		_onSideMouseLeave: function(a) {
			this._hoveringSideButton = false;
			this._hoveringSide = false;
			this._mayClickHoveringSide = false;
			this.startTimer()
		},
		show: function(a) {
			if (this._visible) {
				this.startTimer();
				if ($.type(a) == "function") {
					a()
				}
				return
			}
			this._visible = true;
			this.startTimer();
			G.element.addClass("fr-visible-fullclick-ui").removeClass("fr-hidden-fullclick-ui");
			if (q.IE && q.IE <= 7) {
				this._previous.add(this._next).add(this._close).show()
			}
			if ($.type(a) == "function") {
				a()
			}
		},
		hide: function(a) {
			var b = J.page && J.page.view.type;
			if (!this._visible || (b && (b == "youtube" || b == "vimeo"))) {
				if ($.type(a) == "function") {
					a()
				}
				return
			}
			this._visible = false;
			G.element.removeClass("fr-visible-fullclick-ui").addClass("fr-hidden-fullclick-ui");
			if ($.type(a) == "function") {
				a()
			}
		},
		clearTimer: function() {
			if (u.mobileTouch) {
				return
			}
			G.timers.clear("ui-fullclick")
		},
		startTimer: function() {
			if (u.mobileTouch) {
				return
			}
			this.clearTimer();
			G.timers.set("ui-fullclick", $.proxy(function() {
				this.hide()
			}, this), G.view ? G.view.options.uiDelay : 0)
		}
	};
	O.inside = {
		initialize: function() {},
		enable: function() {
			this.bind()
		},
		disable: function() {
			this.unbind()
		},
		bind: function() {
			if (this._onMouseUpHandler) {
				return
			}
			this.unbind();
			G._pages.on("mouseup", ".fr-content", this._onMouseUpHandler = $.proxy(this._onMouseUp, this));
			G._pages.on("click", ".fr-content .fr-close", $.proxy(function(a) {
				a.preventDefault();
				G.hide()
			}, this)).on("click", ".fr-content .fr-side-previous", $.proxy(function(a) {
				G.previous();
				this._onMouseMove(a)
			}, this)).on("click", ".fr-content .fr-side-next", $.proxy(function(a) {
				G.next();
				this._onMouseMove(a)
			}, this));
			G.element.on("click", ".fr-container, .fr-thumbnails, .fr-thumbnails-wrapper", this._delegateOverlayCloseHandler = $.proxy(this._delegateOverlayClose, this));
			if (!u.mobileTouch) {
				G.element.on("mouseenter", ".fr-content", this._showHandler = $.proxy(this.show, this)).on("mouseleave", ".fr-content", this._hideHandler = $.proxy(this.hide, this));
				G.element.on("mousemove", ".fr-content", this._mousemoveHandler = $.proxy(function(a) {
					var x = a.pageX,
						y = a.pageY;
					if (this._hoveringSideButton || (y == this._y && x == this._x)) {
						return
					}
					this._x = x;
					this._y = y;
					this.show();
					this.startTimer()
				}, this));
				G._pages.on("mousemove", ".fr-info, .fr-close", $.proxy(function(a) {
					a.stopPropagation();
					this._onMouseLeave(a)
				}, this));
				G._pages.on("mousemove", ".fr-info", $.proxy(function(a) {
					this.clearTimer()
				}, this));
				G._pages.on("mousemove", ".fr-content", this._onMouseMoveHandler = $.proxy(this._onMouseMove, this)).on("mouseleave", ".fr-content", this._onMouseLeaveHandler = $.proxy(this._onMouseLeave, this)).on("mouseenter", ".fr-content", this._onMouseEnterHandler = $.proxy(this._onMouseEnter, this));
				G.element.on("mouseenter", ".fr-side", this._onSideMouseEnterHandler = $.proxy(this._onSideMouseEnter, this)).on("mouseleave", ".fr-side", this._onSideMouseLeaveHandler = $.proxy(this._onSideMouseLeave, this));
				$(window).on("scroll", this._onScrollHandler = $.proxy(this._onScroll, this))
			}
		},
		unbind: function() {
			if (!this._onMouseUpHandler) {
				return
			}
			G._pages.off("mouseup", ".fr-content", this._onMouseUpHandler);
			this._onMouseUpHandler = null;
			G._pages.off("click", ".fr-content .fr-close").off("click", ".fr-content .fr-side-previous").off("click", ".fr-content .fr-side-next");
			G.element.off("click", ".fr-container, .fr-thumbnails, .fr-thumbnails-wrapper", this._delegateOverlayCloseHandler);
			if (this._showHandler) {
				G.element.off("mouseenter", ".fr-content", this._showHandler).off("mouseleave", ".fr-content", this._hideHandler).off("mousemove", ".fr-content", this._mousemoveHandler);
				G._pages.off("mousemove", ".fr-info, .fr-close");
				G._pages.off("mousemove", ".fr-info");
				G._pages.off("mousemove", ".fr-content-element", this._onMouseMoveHandler).off("mouseleave", ".fr-content", this._onMouseLeaveHandler).off("mouseenter", ".fr-content", this._onMouseEnterHandler);
				G.element.off("mouseenter", ".fr-side", this._onSideMouseEnterHandler).off("mouseleave", ".fr-side", this._onSideMouseLeaveHandler);
				$(window).off("scroll", this._onScrollHandler);
				this._showHandler = null
			}
		},
		reset: function() {
			G.timers.clear("ui-fullclick");
			this._x = -1;
			this._y = -1;
			this._scrollLeft = -1;
			this._hoveringSide = false;
			this._onMouseLeave()
		},
		adjustPrevNext: function(a) {
			if (a) {
				a()
			}
		},
		_onScroll: function() {
			this._scrollLeft = $(window).scrollLeft()
		},
		_delegateOverlayClose: function(a) {
			var b = J.page;
			if (b && b.view.options.overlay && !b.view.options.overlay.close) {
				return
			}
			if (!$(a.target).is(".fr-container, .fr-thumbnails, .fr-thumbnails-wrapper")) {
				return
			}
			a.preventDefault();
			a.stopPropagation();
			G.hide()
		},
		_onMouseMove: function(a) {
			if (u.mobileTouch) {
				return
			}
			var b = this._getEventSide(a),
				Side = _.String.capitalize(b),
				mayClickHoveringSide = b ? G["may" + Side]() : false;
			if (J.pages.length == 1 || J.page && J.page.view.options.onClick == "close") {
				b = false
			}
			if ((b == this._hoveringSide) && (mayClickHoveringSide == this._mayClickHoveringSide)) {
				return
			}
			this._hoveringSide = b;
			this._mayClickHoveringSide = mayClickHoveringSide;
			if (b) {
				G._box[(mayClickHoveringSide ? "add" : "remove") + "Class"]("fr-hovering-clickable");
				switch (b) {
				case "previous":
					G._box.addClass("fr-hovering-previous").removeClass("fr-hovering-next");
					break;
				case "next":
					G._box.addClass("fr-hovering-next").removeClass("fr-hovering-previous");
					break
				}
			} else {
				G._box.removeClass("fr-hovering-clickable fr-hovering-previous fr-hovering-next")
			}
		},
		_onMouseLeave: function(a) {
			G._box.removeClass("fr-hovering-clickable fr-hovering-previous fr-hovering-next");
			this._hoveringSide = false
		},
		_onMouseUp: function(a) {
			if ((a.which > 1) || !$(a.target).is(O._validClickTargetSelector)) {
				return
			}
			if (J.pages.length == 1 || J.page && J.page.view.options.onClick == "close") {
				G.hide();
				return
			}
			var b = this._getEventSide(a);
			G[b]();
			this._onMouseMove(a)
		},
		_onMouseEnter: function(a) {
			this._onMouseMove(a)
		},
		_getEventSide: function(a) {
			var b = this._scrollLeft > -1 ? this._scrollLeft : (this._scrollLeft = $(window).scrollLeft()),
				left = a.pageX - G._boxPosition.left - this._scrollLeft,
				width = G._boxDimensions.width;
			return left < 0.5 * width ? "previous" : "next"
		},
		_onSideMouseEnter: function(a) {
			this._hoveringSideButton = true;
			this._hoveringSide = this._getEventSide(a);
			this._mayClickHoveringSide = G["may" + _.String.capitalize(this._hoveringSide)]();
			this.clearTimer()
		},
		_onSideMouseLeave: function(a) {
			this._hoveringSideButton = false;
			this._hoveringSide = false;
			this._mayClickHoveringSide = false;
			this.startTimer()
		},
		show: function(a) {
			if (this._visible) {
				this.startTimer();
				if ($.type(a) == "function") {
					a()
				}
				return
			}
			this._visible = true;
			this.startTimer();
			G.element.addClass("fr-visible-inside-ui").removeClass("fr-hidden-inside-ui");
			if ($.type(a) == "function") {
				a()
			}
		},
		hide: function(a) {
			if (!this._visible) {
				if ($.type(a) == "function") {
					a()
				}
				return
			}
			this._visible = false;
			G.element.removeClass("fr-visible-inside-ui").addClass("fr-hidden-inside-ui");
			if ($.type(a) == "function") {
				a()
			}
		},
		clearTimer: function() {
			if (u.mobileTouch) {
				return
			}
			G.timers.clear("ui-inside")
		},
		startTimer: function() {
			if (u.mobileTouch) {
				return
			}
			this.clearTimer();
			G.timers.set("ui-inside", $.proxy(function() {
				this.hide()
			}, this), G.view ? G.view.options.uiDelay : 0)
		}
	};
	O.outside = {
		initialize: function() {
			this.build();
			this._scrollLeft = -1
		},
		build: function() {
			G._box.append(this._previous = $("<div>").addClass("fr-side fr-side-previous fr-side-previous-outside").append($("<div>").addClass("fr-side-button").append($("<div>").addClass("fr-side-button-background")).append($("<div>").addClass("fr-side-button-icon")))).append(this._next = $("<div>").addClass("fr-side fr-side-next fr-side-next-outside").append($("<div>").addClass("fr-side-button").append($("<div>").addClass("fr-side-button-background")).append($("<div>").addClass("fr-side-button-icon")))).append(this._close = $("<div>").addClass("fr-close fr-close-outside").append($("<div>").addClass("fr-close-background")).append($("<div>").addClass("fr-close-icon")));
			if (q.IE && q.IE <= 7) {
				this._previous.add(this._next).add(this._close).hide()
			}
			this._close.on("click", $.proxy(function(a) {
				a.preventDefault();
				G.hide()
			}, this));
			this._previous.on("click", $.proxy(function(a) {
				G.previous();
				this._onMouseMove(a)
			}, this));
			this._next.on("click", $.proxy(function(a) {
				G.next();
				this._onMouseMove(a)
			}, this))
		},
		enable: function() {
			this.bind()
		},
		disable: function() {
			this.unbind()
		},
		reset: function() {
			G.timers.clear("ui-outside");
			this._x = -1;
			this._y = -1;
			this._scrollLeft = -1;
			this._onMouseLeave()
		},
		bind: function() {
			if (this._onMouseUpHandler) {
				return
			}
			this.unbind();
			G.element.on("mouseup", ".fr-content", this._onMouseUpHandler = $.proxy(this._onMouseUp, this));
			G.element.on("click", ".fr-container, .fr-thumbnails, .fr-thumbnails-wrapper", this._delegateOverlayCloseHandler = $.proxy(this._delegateOverlayClose, this));
			if (!u.mobileTouch) {
				G._pages.on("mousemove", ".fr-content", this._onMouseMoveHandler = $.proxy(this._onMouseMove, this)).on("mouseleave", ".fr-content", this._onMouseLeaveHandler = $.proxy(this._onMouseLeave, this)).on("mouseenter", ".fr-content", this._onMouseEnterHandler = $.proxy(this._onMouseEnter, this));
				G.element.on("mouseenter", ".fr-side", this._onSideMouseEnterHandler = $.proxy(this._onSideMouseEnter, this)).on("mouseleave", ".fr-side", this._onSideMouseLeaveHandler = $.proxy(this._onSideMouseLeave, this));
				$(window).on("scroll", this._onScrollHandler = $.proxy(this._onScroll, this))
			}
		},
		unbind: function() {
			if (!this._onMouseUpHandler) {
				return
			}
			G.element.off("mouseup", ".fr-content", this._onMouseUpHandler);
			this._onMouseUpHandler = null;
			G.element.off("click", ".fr-container, .fr-thumbnails, .fr-thumbnails-wrapper", this._delegateOverlayCloseHandler);
			if (this._onMouseMoveHandler) {
				G._pages.off("mousemove", ".fr-content", this._onMouseMoveHandler).off("mouseleave", ".fr-content", this._onMouseLeaveHandler).off("mouseenter", ".fr-content", this._onMouseEnterHandler);
				G.element.off("mouseenter", ".fr-side", this._onSideMouseEnterHandler).off("mouseleave", ".fr-side", this._onSideMouseLeaveHandler);
				$(window).off("scroll", this._onScrollHandler);
				this._onMouseMoveHandler = null
			}
		},
		adjustPrevNext: function(a, b) {
			var c = J.page;
			if (!c) {
				if (a) {
					a()
				}
				return
			}
			var d = this._previous.add(this._next);
			this._previous[(G.mayPrevious() ? "remove" : "add") + "Class"]("fr-side-disabled");
			this._next[(G.mayNext() ? "remove" : "add") + "Class"]("fr-side-disabled");
			d[(c._total < 2 ? "add" : "remove") + "Class"]("fr-side-hidden");
			if (a) {
				a()
			}
		},
		_onScroll: function() {
			this._scrollLeft = $(window).scrollLeft()
		},
		_delegateOverlayClose: function(a) {
			var b = J.page;
			if (b && b.view.options.overlay && !b.view.options.overlay.close) {
				return
			}
			if (!$(a.target).is(".fr-container, .fr-thumbnails, .fr-thumbnails-wrapper")) {
				return
			}
			a.preventDefault();
			a.stopPropagation();
			G.hide()
		},
		_onMouseMove: function(a) {
			if (u.mobileTouch) {
				return
			}
			var b = this._getEventSide(a),
				Side = _.String.capitalize(b),
				mayClickHoveringSide = b ? G["may" + Side]() : false;
			if (J.pages.length == 1 || J.page && J.page.view.options.onClick == "close") {
				b = false
			}
			if ((b == this._hoveringSide) && (mayClickHoveringSide == this._mayClickHoveringSide)) {
				return
			}
			this._hoveringSide = b;
			this._mayClickHoveringSide = mayClickHoveringSide;
			if (b) {
				G._box[(mayClickHoveringSide ? "add" : "remove") + "Class"]("fr-hovering-clickable");
				switch (b) {
				case "previous":
					G._box.addClass("fr-hovering-previous").removeClass("fr-hovering-next");
					break;
				case "next":
					G._box.addClass("fr-hovering-next").removeClass("fr-hovering-previous");
					break
				}
			} else {
				G._box.removeClass("fr-hovering-clickable fr-hovering-previous fr-hovering-next")
			}
		},
		_onMouseLeave: function(a) {
			G._box.removeClass("fr-hovering-clickable fr-hovering-previous fr-hovering-next");
			this._hoveringSide = false
		},
		_onMouseUp: function(a) {
			if ((a.which > 1) || !$(a.target).is(O._validClickTargetSelector)) {
				return
			}
			if (J.pages.length == 1 || (J.page && J.page.view.options.onClick == "close")) {
				G.hide();
				return
			}
			var b = this._getEventSide(a);
			G[b]();
			this._onMouseMove(a)
		},
		_onMouseEnter: function(a) {
			this._onMouseMove(a)
		},
		_getEventSide: function(a) {
			var b = this._scrollLeft > -1 ? this._scrollLeft : (this._scrollLeft = $(window).scrollLeft()),
				left = a.pageX - G._boxPosition.left - this._scrollLeft,
				width = G._boxDimensions.width;
			return left < 0.5 * width ? "previous" : "next"
		},
		show: function() {
			if (q.IE && q.IE <= 7) {
				this._previous.add(this._next).add(this._close).show()
			}
		},
		hide: function() {},
		_onSideMouseEnter: function(a) {
			this._hoveringSideButton = true;
			this._hoveringSide = this._getEventSide(a);
			this._mayClickHoveringSide = G["may" + _.String.capitalize(this._hoveringSide)]()
		},
		_onSideMouseLeave: function(a) {
			this._hoveringSideButton = false;
			this._hoveringSide = false;
			this._mayClickHoveringSide = false
		},
		clearTimer: function() {}
	};
	$(document).ready(function(a) {
		L.initialize()
	});
	return o
}));