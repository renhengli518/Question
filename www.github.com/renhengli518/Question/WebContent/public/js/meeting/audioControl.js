(function($) {
	if(UA.isIE6){
		var imgTags = $tag("img",$class("volWrap")[0]);
		for(var i=0; i<imgTags.length; i++){
			imgTags[i].src = imgTags[i].src.replace('.png','.gif');
		}
	}
	
	var _dragEvent, _use, _$window = $(window), _$document = $(document), _elem = document.documentElement;
	$.noop = function() {};
	// 拖拽事件代理
	var dragEvent = function() {
		var that = this, proxy = function(name) {
			var fn = that[name];
			that[name] = function() {
				return fn.apply(that, arguments);
			};
		};
		proxy('start');
		proxy('move');
		proxy('end');
	};

	dragEvent.prototype = {
		// 开始拖拽
		onstart : $.noop,
		start : function(event) {
			_$document.bind('mousemove', this.move).bind('mouseup', this.end);

			this._sClientX = event.clientX;
			this._sClientY = event.clientY;
			this.onstart(event.clientX, event.clientY);

			return false;
		},
		// 正在拖拽
		onmove : $.noop,
		move : function(event) {
			this._mClientX = event.clientX;
			this._mClientY = event.clientY;
			this.onmove(event.clientX - this._sClientX, event.clientY - this._sClientY);

			return false;
		},
		// 结束拖拽
		onend : $.noop,
		end : function(event) {
			_$document.unbind('mousemove', this.move).unbind('mouseup', this.end);
			this.onend(event.clientX, event.clientY);
			return false;
		}
	};
	
	var _use = function(event) {
		var limit, startWidth, startHeight, startLeft, startTop, volPos, DOM = event.target, dw = $(DOM).width(), wrap = $(DOM).parent(), ow = wrap[0].offsetWidth, maxX = ow - dw;

		// 滑块准备拖动
		_dragEvent.onstart = function(x, y) {
			startLeft = DOM.offsetLeft;
			startTop = DOM.offsetTop;
			volPos = startLeft;
			$(DOM).parent().addClass('state_drag');
		};
		// 滑块拖动进行中
		_dragEvent.onmove = function(x, y) {
			var style = DOM.style;
			volPos = Math.max(0, Math.min(maxX, x + startLeft));
			style.left = volPos/ow * 100 + '%';
		};
		// 滑块拖动结束
		_dragEvent.onend = function(x, y) {
			var volNum = Math.floor(volPos / maxX * 100);
			switch(DOM.id){
				case 'micRod': 
					try{
						keySpeaker.setMicVolume(volNum); //主持人视频
					}catch(e){}
					try{
						viceSpeaker.setMicVolume(volNum); //发言人视频
					}catch(e){}
					try{
						keySpeaker_main.setMicVolume(volNum); //同步课堂
					}catch(e){}
					if(volNum == 0){
						addClass($class("micBox")[0],"mute");
					}else{
						removeClass($class("micBox")[0],"mute");
					}
					break;
				case 'soundRod' :
					//耳机音量 
					try{
						keySpeaker.setSoundVolume(volNum); //主持人视频
					}catch(e){}
					try{
						viceSpeaker.setSoundVolume(volNum); //发言人视频
					}catch(e){}
					try{
						keySpeaker_main.setSoundVolume(volNum); //同步课堂，接收高清视频
					}catch(e){}
					
					if(volNum == 0){
						addClass($class("soundBox")[0],"mute");
					}else{
						removeClass($class("soundBox")[0],"mute");
					}
					break;
			}
			setcookie("audioVol",$("#micRod").css("left")+","+$("#soundRod").css("left"), { expires: 365});
			// getFlash("myFlash").SetVariable("vol", volNum);
			_$document.unbind('dblclick', _dragEvent.end);
			$(DOM).parent().removeClass('state_drag');
		};

		_dragEvent.start(event);
	};
	// 代理 mousedown事件触发音量滑块拖动
	_$document.bind('mousedown', function(event) {
		var target = event.target, DOM = $('.slideRod');
		if(target === DOM[0] || target === DOM[1]) {
			_dragEvent = _dragEvent || new dragEvent();
			_use(event);
			return false;
			// 防止firefox与chrome滚屏
		}
	});
	
	window.mySoundMic = {
		/* 留给外面调用的接口 */
		playMicWave : function(volNum){
			/* 麦克风波形 */
			var barW = $('.controlBar')[0].offsetWidth;
			$('#micBar')[0].style.backgroundPosition= volNum * barW /100+'px 0';
		}
	};
	var micRodVol = "88%",
		soundRodVol = '45%';
	var audioVol = getcookie("audioVol");
	if(audioVol){
		audioVol = audioVol.split(",");
		micRodVol = audioVol[0];
		soundRodVol = audioVol[1];
	}
	$("#micRod").css({left: micRodVol});
	$("#soundRod").css({left: soundRodVol});
	if(micRodVol == '0px') addClass($class("micBox")[0],"mute");
	if(soundRodVol == '0px') addClass($class("soundBox")[0],"mute");
	$(".volumeBar").mousedown(function(e) {
		e.preventDefault();
	});
	 
})(jQuery);