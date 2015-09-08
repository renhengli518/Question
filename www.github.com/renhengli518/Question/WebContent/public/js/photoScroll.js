;(function ($) {
	var slice = Array.prototype.slice;
	var defaults = {
		index: 0,
		autoScroll: false,
		interval: 3000,
		step: 1,
		speed: 300,
		easing: 'linear',
		showNum: 1,
		marquee: false,
		state: 'scroll',
		scrollState: 'stop',
		direction: 'scrollLeft',
		firstInterval: 0,
		init: function () {},
		onScroll: function(){},
		onScrolled: function(){}
	}
	function PhotoScroll($wrapper, options) {
		this.$wrapper = $wrapper;
		this.options = options;
		
		var $items = $wrapper.find(options.items);
		if (options.direction == 'scrollLeft') {
			options.stepLength = $items.outerWidth(true);
		} else {
			options.stepLength = $items.outerHeight(true);
		}
		options.totleIndex = Math.ceil($items.length/options.showNum) * options.showNum;
		//options.totleIndex = $items.length;
		
		options.maxIndex = (Math.ceil($items.length/options.showNum) - 1) * options.showNum;
		if (options.marquee) {
			var $marquee = this.$wrapper.find(options.marquee);
			$marquee.children().clone().appendTo($marquee);
			options.maxIndex = $items.length * 2;
		}
		
		this.timeId = 0;
		this.init();
	}
	PhotoScroll.prototype = {
		init: function () {
			var opt = this.options;
			var self = this;
			opt.init.call(this);
			if (opt.autoScroll) {
				self.timeId = setTimeout(function () {
					self.next();
				}, opt.firstInterval||opt.interval);
			}
		},
		off: function (index) {
			var opt = this.options;
			clearTimeout(self.timeId);
			if (typeof index != "undefined") {
				this.scroll(index, true);
			}
			opt.state = 'stop';
		},
		on: function () {
			var opt = this.options;
			var self = this;
			opt.state = 'scroll';
			if (opt.autoScroll) {
				clearTimeout(self.timeId);
				self.timeId = setTimeout(function () {
					self.next();
				}, opt.interval);
			}
		},
		scroll: function (num, isStop) {		
			isStop =  isStop || false;
			var opt = this.options;
			var self = this;
			if ((opt.scrollState == 'scroll' && isStop == false) || opt.state == 'stop') return;
			opt.scrollState = 'scroll';
			if (opt.marquee && num < 0) {
				opt.index = (num + opt.maxIndex/2)% (opt.maxIndex/2);
			} else {
				opt.index = (num + opt.totleIndex)% opt.totleIndex;
			}
			clearTimeout(self.timeId);
			var parms = {};
			parms[opt.direction] = (opt.index * opt.stepLength + 'px');
			if (opt.marquee && opt.index == opt.maxIndex/2) {
				opt.index = 0;
			}
			opt.onScroll.call(self, opt.index);
			this.$wrapper.animate(parms, opt.speed, opt.easing, function () {
				opt.scrollState = 'stop';
				if (opt.marquee && opt.index == 0) {
					self.$wrapper[0][opt.direction] = '0px';
				}
				if (opt.autoScroll && (isStop == false || opt.state == 'scroll')) {
					clearTimeout(self.timeId);
					self.timeId = setTimeout(function () {
						self.next();
					}, opt.interval);
				}
				opt.onScrolled.call(self, opt.index);
			})
		},
		next: function () {
			this.scroll(this.options.index + this.options.step);
		},
		prev: function () {
			this.scroll(this.options.index - this.options.step);
		},
		options: function (opt) {
			if (typeof opt == "object" ) {
				$.extend(this.options, opt);
			} else {
				return this.options[opt];
			}
		}
	}
	$.fn.photoScroll = function (options) {
		var args = slice.call(arguments, 1);
		var res;
		var flag = false;
		this.each(function () {
			var $elm = $(this);
			var photoScroll = $elm.data('photoScroll');
			if (typeof options == "string" ) {
				if (photoScroll && photoScroll[options]) {
					var opt = photoScroll[options];
					if ($.isFunction(opt)) {
						res = opt.apply(photoScroll, args);
						if (res !== undefined) {
							flag = true;
							return true;
						}
					} else {
						if (args.length == 0) {
							res = opt;
							flag = true;
							return true;
						} else if (args.length == 1) {
							photoScroll[options] = args[0];
						}
					}
				}
			} else {
				$elm.data('photoScroll', new PhotoScroll($elm, $.extend({}, defaults, options)));
			}
		})
		if (flag) {
			return res;
		} else {
			return this;
		}	
	}
})(jQuery);