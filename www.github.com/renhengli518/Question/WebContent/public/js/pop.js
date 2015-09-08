var popUi = (function () {	
	var $win = $(window);
	var $doc = $(document);
	var $showingTarget;//将要显示的对象
	var $showedTarget;//已显示的对象
	
	var time;
	var $box, $box2;
	var $cont, $cont2;
	
	return {
		init: function () {
			if (!$box) {
				var self = this;
				$box = $('<div class="pop-ui"><div class="pop-in"><div class="pop-cont"></div><div class="arr"></div><div class="arr-in"></div></div></div>').appendTo('body');
				$box2 = $('<div class="pop-ui" style="top: -1000px;left: -1000px;"><div class="pop-in"><div class="pop-cont"></div><div class="arr"></div><div class="arr-in"></div></div></div>').appendTo('body');
				
				$cont = $box.find('.pop-cont');
				$cont2 = $box2.find('.pop-cont');
				
				$box.on('mouseenter', function(){
					clearTimeout(time);
				}).on('mouseleave', function(){
					self._hide();
				});
				$win.on('resize', function() {
					if ($showedTarget) {
						self._pos($showedTarget);
					}
				});	
			}
			this.bindEvent(".pop-target");
		},
		bindEvent: function (selector) {
			var self = this;
			$doc.on('mouseenter', selector, function() {
				if ($showedTarget && $showedTarget[0] == this) {
					//self._pos($(this));
				} else {
					self._show($(this));
				}
			}).on('mouseleave', selector, function() {
				self._hide();
			});
		},
		_show: function ($target) {
			var self = this;
			clearTimeout(time);
			$showingTarget = $target;
			time = setTimeout(function(){
				self.onShow($target, function () {
					if ($showingTarget ==  $target) {
						self._pos($showingTarget);
						$cont.html($cont2.html());
						$box.show();
						
						console.log($box.width(), $cont.width(),$box.width() - $cont.width());
						$showedTarget = $target;
						$showingTarget = null;
					}
				})
			}, 200);
		},
		_hide: function () {
			var self = this;
			clearTimeout(time);
			time = setTimeout(function(){
				if ($showedTarget) {
					self.onHide();
					$box.hide();
					$showedTarget = null;
				}
			}, 200);
		},
		_pos: function ($target) {
			console.log(1, $target, $box2.width(), $box2.height());
			var offset = $target.offset();
			var targetW = $target.width(),  //目标元素的宽
				targetH = $target.height(),  //目标元素的高
				targetX = offset.left;  //目标元素的x轴位置
				targetY = offset.top;  //目标元素的y轴位置
			
			var docW = $doc.width();
			var docH = $doc.height();
			
			var w = $box2.width();
			var h = $box2.height();
			
			//判断悬浮层位置在左或右
			var className = "", posX, posY;
			if (targetX + targetW + w + 12 <= docW) {
				posX = targetX + targetW + 12;
			} else {
				posX = targetX - w - 12;
				className = 'arr-to-right';
			}
			if (posX <= 0) {
				posX = targetX + targetW + 12;
				className = "";
			}

			
			if (targetY + h <= docH) {
				posY = targetY;
			} else {
				posY = targetY - h + targetH/2 + 26;
				className += ' arr-to-bottom';
			}
			
			$box.removeClass('arr-to-bottom arr-to-right')
			if (className) {
				$box.addClass(className);
			}
			$box.css({
				top: posY,
				left: posX,
				width: w + 2
			});			
		},
		hide: function () {
			clearTimeout(time);
			this.onHide();
			$box.hide();
			$showingTarget = $showedTarget = null;
		},
		html: function (h) {
			$cont2.html(h);
		},
		onShow: function ($target, showFn) {
			showFn();
		},
		onHide: function () {
			
		}
	}
})();