(function ($, undefined) {
	var noop = function () {};
	var slice = Array.prototype.slice;
	var defaults = {
		direct : "left",//滚动的方向
		offsetPages : 3,//默认可视最大条数
		initPageIndex : 0,//默认当前显示第几条
		delay : 5000,//滚动间隔（毫秒）
		speed : 500, //滚动速度毫秒，
		itemSize: {
			width: 640, 
			height: 270
		},
		boxWidth : 1200,//最外层宽，需要使用的时候在传,默认由程序自动判断
		boxHeight : 310,//最外层高  
		cssOpts: {		
			'-1': {left: 0, top: 60, width: 370, height: 210},
			'0':  {left: 310, top: 0, width: 580, height: 330},
			'1':  {left: 830, top: 60, width: 370, height: 210}
		}
	};
	var item;
	function JsYKSlider($elm, options) {
		this.$elm = $elm;
		this.options = options;
		this.init();
	}
	JsYKSlider.prototype = {
		init: function () {
			var self = this;
			this.reset();
			$(window).resize(function(){
				self.reset();
			});
		},
		reset: function (options) {
			if (options) {
				$.extend(this.options, options);	
			}
			options = this.options;
			this.total = options.data.length;
			this.pageNowIndex = options.initPageIndex;
			this.drawContent();
		},
		drawContent: function () {
			var $elm = this.$elm;
			var options = this.options;
			var data = options.data;
			var totle = data.length;
			
			$elm.empty().css({position: "relative"}).addClass('ykSlider-box');
			var html = ['<div class="ykSlider-bottomNav-box">'];
			for (var i = 0; i < totle; i++) {
				html.push('<div class="ykSlider-bottomNav ' + ( i == this.pageNowIndex ? "sel":"") + '" ref="' + i + '" ></div>');
			}
			html.push('</div>');
			html.push('<div class="ykSlider-lr-box"><div class="ykSlider-leftNav" style="display: block;"></div><div class="ykSlider-rightNav" style="display: block;"></div></div>');
			html.push('<div style="width: ' + options.boxWidth + 'px;height:' + options.boxHeight + 'px;margin: 0 auto;position: relative;">');
			for (var i = 0; i < totle ; i++ ) {
				var obj = data[i];
				html.push('<div class="ykSlider-item" ref="' + i + '" >\
							<a data-from="1-' + i + '" class="ykSlider-item-link" target="_blank" href="' + obj.url + '">\
								<img title="' + obj.title + '" src="' + obj.img + '"><a href="'+obj.url+'" class="item_title" target="_blank">'+obj.desc+'</a>\
							</a>\
							<span class="ykSlider-item-overlay" ></span></div>');
			}
			html.push('</div>');
			$elm.html(html.join(''));
			var $elmTab = this.$elmTab = [];
			$elm.find(".ykSlider-item").each(function () {
				$elmTab.push($(this));
			})
			this.initContent();
			this.bind();
			this.start();
		},
		initContent: function () {
			var $elmTab = this.$elmTab;
			var options = this.options;
			var pageNowIndex = this.pageNowIndex;
			var offsetPages = options.offsetPages;
			var totle = options.data.length;
			
			var range = offsetPages/2>>0;
			var maxIndex = range + 2;
			for (var i = -range; i <= range; i++) {
				var pIndex = (i + pageNowIndex + totle) % totle;
				var absI = Math.abs(i);
				var $pElm = $elmTab[pIndex];
				if (absI == 0) {
					$pElm.find('.ykSlider-item-overlay').hide();
					$pElm.css($.extend({opacity: 1,zIndex: maxIndex}, options.cssOpts[0]));
				} else {
					$pElm.find('.ykSlider-item-overlay').show().css({opacity: (0.4+(absI-1) * 0.1)}).show();
					$pElm.css($.extend({opacity: 1,zIndex: maxIndex-absI}, options.cssOpts[i]));
				}
			}
		},
		bind: function(){
			var self = this;
			var $elm = this.$elm;
			
			
			var $leftNav = $elm.find(".ykSlider-leftNav").click(function() {
				self.turn("right");					 
			});
			var $rightNav = $elm.find(".ykSlider-rightNav").click(function() {
				self.turn("left");					 
			});
			$elm.mouseover(function(){
				self.stop();
				$leftNav.show();
				$rightNav.show();
			}).mouseout(function(){
				self.start();
				//$leftNav.hide();
				//$rightNav.hide();
			});
			$elm.find(".ykSlider-bottomNav").click(function() {
				var ref = this.getAttribute("ref")*1;
				var pageNowIndex = self.pageNowIndex;
				if (pageNowIndex == ref) return false;
				if (pageNowIndex < ref){
					var rightAbs = ref - pageNowIndex;
					var leftAbs = pageNowIndex + self.total - ref;
				}else{
					var rightAbs = self.total - pageNowIndex + ref;
					var leftAbs = pageNowIndex - ref;
				}
				if (leftAbs < rightAbs) {
					self.turnpage(ref, "right");
				} else {
					self.turnpage(ref, "left");
				}
				return false;
			});
			$elm.find(".ykSlider-item").click(function(e)  {
				var ref = this.getAttribute("ref")*1;
				var pageNowIndex = self.pageNowIndex;
				if (pageNowIndex == ref) {
					return;
				}
				e.preventDefault();
				if (pageNowIndex < ref) {
					var rightAbs = ref - pageNowIndex;
					var leftAbs = pageNowIndex + self.total - ref;
				}else{
					var rightAbs = self.total - pageNowIndex + ref;
					var leftAbs = pageNowIndex - ref;
				}
				if (leftAbs < rightAbs) {
					self.turnpage(ref, "right");
				} else {
					self.turnpage(ref, "left");
				}
			});
		},
		initBottomNav: function(){
			this.$elm.find(".ykSlider-bottomNav").removeClass("sel")
				.eq(this.pageNowIndex).addClass("sel");
		},
		start: function(){
			var self = this;
			if (self.timerId) {
				self.stop();
			}
			self.timerId = setInterval(function() {
				if (self.options.direct == "left") {
					self.turn("left");	
				} else {
					self.turn("right");	
				}
			}, self.options.delay);
		},
		stop: function () {
			clearInterval(this.timerId);
		},
		turn: function(dir){
			var self = this;		
			if (dir == "right") {
				self.turnpage(self.pageNowIndex - 1, dir);
			} else {
				self.turnpage(self.pageNowIndex + 1, dir);
			}
		},
		turnpage: function(pageIndex, dir){
			if (this.locked) return false;
			this.locked = true;
			
			var totle = this.options.data.length;
			pageIndex = (pageIndex + totle)%totle
			
			if (this.pageNowIndex == pageIndex) return false;
			this.run(pageIndex, dir, this.options.speed);
		},
		run: function(pageIndex, dir, t) {			
			var self = this;		
			var $elmTab = this.$elmTab;
			var options = this.options;
			var pageNowIndex = this.pageNowIndex;
			var offsetPages = options.offsetPages;
			var totle = options.data.length;
			var showNowMap = {}, showMap = {};
			
			var hideParams = {width: 0, height: 0, opacity: 0, left: options.boxWidth/2, top: options.boxHeight/2};
			var range = offsetPages/2>>0;
			var maxIndex = range + 2;
			for (var i = -range; i <= range; i++) {	
				showNowMap[(i + pageNowIndex + totle) % totle] = 1;
				showMap[(i + pageIndex + totle) % totle] = 1;
			}
			for (var i = -range; i <= range; i++) {
				var pIndex = (i + pageNowIndex + totle) % totle;
				var $pElm = $elmTab[pIndex];
				var absI = Math.abs(i);
				if (!showMap[pIndex]) {//不再显示的元素，中间的中间缩小，2边的飞出
					if (absI < range) {
						$pElm.css({zIndex: 0}).animate(hideParams);
					} else if (i == -range){
						$pElm.css({zIndex: 0}).animate($.extend({opacity: 0}, options.cssOpts[-1 - range]), t);
					} else if (i == range){
						$pElm.css({zIndex: 0}).animate($.extend({opacity: 0}, options.cssOpts[1 + range]), t);
					}
				}
			}
			for (var i = -range; i <= range; i++) {
				var pIndex = (i + pageIndex + totle) % totle;
				var $pElm = $elmTab[pIndex];
				var absI = Math.abs(i);
				if (absI == 0) {
					$pElm.find('.ykSlider-item-overlay').hide()
				} else {
					$pElm.find('.ykSlider-item-overlay').css({opacity: (0.4+(absI-1) * 0.1)}).show()
				}
				$pElm.css({zIndex:maxIndex-absI});//先修改zIndex
				if (!showNowMap[pIndex]) {//当前未显示,中间位置，不是边缘则从中间隐藏展现， 边缘则从2侧飞入
					//可以考虑状态tab同步更新，防止下次需要设置css + (hide,show) 方式
					if (absI < range) {
						$pElm.css(hideParams)
					} else if (i == -range){
						$pElm.css($.extend({opacity: 0}, options.cssOpts[-1-range]));
					} else if (i == range){
						$pElm.css($.extend({opacity: 0}, options.cssOpts[1+range]));
					}
				}
				$pElm.animate($.extend({opacity: 1}, options.cssOpts[i]), t);
			}
			setTimeout(function () {
				self.locked = false;
			}, t);
			this.pageNowIndex = pageIndex;
			this.initBottomNav();
		}
	}
	$.fn.jsYKSlider = function (options) {
		var args = slice.call(arguments, 1);
		var res;
		var flag = false;
		this.each(function () {
			var $elm = $(this);
			var obj = $elm.data('jsYKSlider');
			if (typeof options == "string" ) {
				if (obj && obj[options]) {
					var opt = obj[options];
					if ($.isFunction(opt)) {
						res = opt.apply(obj, args);
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
							obj[options] = args[0];
						}
					}
				}
			} else {
				$elm.data('jsYKSlider', new JsYKSlider($elm, $.extend({}, defaults, options)));
			}
		})
		if (flag) {
			return res;
		} else {
			return this;
		}
	}
})(jQuery)