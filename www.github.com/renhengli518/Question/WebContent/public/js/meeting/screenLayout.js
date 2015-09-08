var sl = (function($) {
	return {
		"load": function() {
			if("videoMode"==SCREEN_TYPE) {
				var streamWrap = $id("streamWrap");
				var streamWrapW = streamWrap.offsetWidth,
					streamWrapH = streamWrap.offsetHeight;
				streamWrap.style.paddingLeft = 0;
				streamWrap.style.paddingTop = 0;
				
				$id("streamBox_main").style.margin = 0;
				$id("streamBox_main").style.top = 0;
				$id("streamBox_main").style.left = 0;
				
				for(var i=1; i<SCREEN_COUNT; i++) {
					$id("streamBox_"+i).style.top = 0;
					$id("streamBox_"+i).style.left = 0;
				}
				
				//当画面只有一个的时候，不需要区分当前模式是“同等大小”还是“一大多小”
				if(1==SCREEN_COUNT) {
					//判断当前视频区外框的宽高比
					if(streamWrapW/streamWrapH>16/9) {//如果宽高比大于(16/9)，那么画面的高度充满，宽度根据(16/9)的比例计算
						$id("streamBox_main").style.height = streamWrapH + "px";
						$id("streamBox_main").style.width = streamWrapH/9*16 + "px";
					} else {//如果宽高比小于(16/9)，那么画面的宽度充满，高度根据(16/9)的比例计算
						$id("streamBox_main").style.width = streamWrapW + "px";
						$id("streamBox_main").style.height = streamWrapW/16*9 + "px";
					}
					//计算画面左边和上边的位移量，保证画面永远在视频区中当中
					$id("streamBox_main").style.left = (streamWrapW-$id("streamBox_main").offsetWidth)/2 + "px";
					$id("streamBox_main").style.top = (streamWrapH-$id("streamBox_main").offsetHeight)/2 + "px";
				}
				
				//一大多小
				if("bigSmall"==SCREEN_SET_TYPE) {
					//定义接收大画面宽、高值和小画面宽、高值的变量
					var smallHeight=0, smallWidth=0, bigHeight=0, bigWidth=0;
					
					//一大二小
					if(3==SCREEN_COUNT) {
						if(streamWrapW/streamWrapH>8/3) {//如果视频区的宽高比大于(8/3)，那么面视频区高被充满，用视频区高度计算小画面的高度
							smallHeight = streamWrapH/2-27/2;
						} else {//如果视频区的宽高比小于(8/3)，那么面视频区宽被充满；用视频区宽度计算小画面的高度
							smallHeight = streamWrapW*3/16-12
						}
						smallWidth = smallHeight/9*16;
						bigHeight = smallHeight*2 + 9;
						bigWidth = bigHeight/9*16;
						
						//设置大画面的宽、高
						$id("streamBox_main").style.width = bigWidth + "px";
						$id("streamBox_main").style.height = bigHeight + "px";
						
						//设置小画面的宽、高
						for(var i=1; i<SCREEN_COUNT; i++) {
							$id("streamBox_"+i).style.width = smallWidth + "px";
							$id("streamBox_"+i).style.height = smallHeight + "px";
						}
						
						//设置发言人自己的画面宽、高
						$("#myPublishBox").width(smallWidth).height(smallHeight);
						
						//计算左边留白的宽高
						var leftBlock = (streamWrapW-(bigWidth+smallWidth+16))/2;
						
						//设置所有画面向左的偏移量
						$id("streamBox_main").style.left = leftBlock + "px";
						for(var i=1; i<SCREEN_COUNT; i++) {
							$id("streamBox_"+i).style.left = leftBlock + bigWidth + 16 + "px";
						}
						
						//计算左边留白的宽高
						var topBlock = (streamWrapH-bigHeight)/2;
						
						//设置所有画面向下的偏移量
						$id("streamBox_main").style.top = topBlock + "px";
						$id("streamBox_1").style.top = topBlock + "px";
						$id("streamBox_2").style.top = topBlock + smallHeight + 9 + "px";
						
						for(var i=1; i<SCREEN_COUNT; i++) {
							$(".myPublishBox_"+i).css("width", $id("streamBox_"+i).offsetWidth);
							$(".myPublishBox_"+i).css("height", $id("streamBox_"+i).offsetHeight);
							$(".myPublishBox_"+i).css("left", $id("streamBox_"+i).offsetLeft);
							$(".myPublishBox_"+i).css("top", $id("streamBox_"+i).offsetTop);
						}
					}
					if(6==SCREEN_COUNT) {
						if(streamWrapW/streamWrapH>16/9) {
							smallHeight = streamWrapH/3-12;
						} else {
							smallHeight = streamWrapW*3/16-12;
						}
						smallWidth = smallHeight/9*16;
						bigHeight = smallHeight*2 + 9;
						bigWidth = bigHeight/9*16;
						
						$id("streamBox_main").style.width = bigWidth + "px";
						$id("streamBox_main").style.height = bigHeight + "px";
						
						for(var i=1; i<SCREEN_COUNT; i++) {
							$id("streamBox_"+i).style.width = smallWidth + "px";
							$id("streamBox_"+i).style.height = smallHeight + "px";
						}
						
						$("#myPublishBox").width(smallWidth).height(smallHeight);
						
						var leftBlock = (streamWrapW-(bigWidth+smallWidth+16))/2;
						
						$id("streamBox_main").style.left = leftBlock + "px";
						$id("streamBox_1").style.left = leftBlock + bigWidth + 16 + "px";
						$id("streamBox_2").style.left = leftBlock + bigWidth + 16 + "px";
						$id("streamBox_3").style.left = leftBlock + "px";
						$id("streamBox_4").style.left = leftBlock + smallWidth + 16 + "px";
						$id("streamBox_5").style.left = leftBlock + smallWidth*2 + 32 + "px";
						
						var topBlock = (streamWrapH-bigHeight-smallHeight-9)/2;
						
						$id("streamBox_main").style.top = topBlock + "px";
						$id("streamBox_1").style.top = topBlock + "px";
						$id("streamBox_2").style.top = topBlock + smallHeight + 9 + "px";
						$id("streamBox_3").style.top = topBlock + bigHeight + 9 + "px";
						$id("streamBox_4").style.top = topBlock + bigHeight + 9 + "px";
						$id("streamBox_5").style.top = topBlock + bigHeight + 9 + "px";
						
						for(var i=1; i<SCREEN_COUNT; i++) {
							$(".myPublishBox_"+i).css("width", $id("streamBox_"+i).offsetWidth);
							$(".myPublishBox_"+i).css("height", $id("streamBox_"+i).offsetHeight);
							$(".myPublishBox_"+i).css("left", $id("streamBox_"+i).offsetLeft);
							$(".myPublishBox_"+i).css("top", $id("streamBox_"+i).offsetTop);
						}
					}
					if(9==SCREEN_COUNT) {
						if(streamWrapW/streamWrapH>64/27) {
							smallHeight = streamWrapH/3-12;
						} else {
							smallHeight = streamWrapW*9/64-45/4;
						}
						smallWidth = smallHeight/9*16;
						bigHeight = smallHeight*2 + 9;
						bigWidth = bigHeight/9*16;
						
						$id("streamBox_main").style.width = bigWidth + "px";
						$id("streamBox_main").style.height = bigHeight + "px";
						
						for(var i=1; i<SCREEN_COUNT; i++) {
							$id("streamBox_"+i).style.width = smallWidth + "px";
							$id("streamBox_"+i).style.height = smallHeight + "px";
						}
						
						$("#myPublishBox").width(smallWidth).height(smallHeight);
						
						var leftBlock = (streamWrapW-(bigWidth+smallWidth*2+32))/2;
						
						$id("streamBox_main").style.left = leftBlock + "px";
						$id("streamBox_1").style.left = leftBlock + bigWidth + 16 + "px";
						$id("streamBox_2").style.left = leftBlock + bigWidth + smallWidth + 32 + "px";
						$id("streamBox_3").style.left = leftBlock + bigWidth + 16 + "px";
						$id("streamBox_4").style.left = leftBlock + bigWidth + smallWidth + 32 + "px";
						$id("streamBox_5").style.left = leftBlock + "px";
						$id("streamBox_6").style.left = leftBlock + smallWidth + 16 + "px";
						$id("streamBox_7").style.left = leftBlock + smallWidth*2 + 32 + "px";
						$id("streamBox_8").style.left = leftBlock + smallWidth*3 + 48 + "px";
						
						var topBlock = (streamWrapH-bigHeight-smallHeight-9)/2;
						
						$id("streamBox_main").style.top = topBlock + "px";
						$id("streamBox_1").style.top = topBlock + "px";
						$id("streamBox_2").style.top = topBlock + "px";
						$id("streamBox_3").style.top = topBlock + smallHeight + 9 + "px";
						$id("streamBox_4").style.top = topBlock + smallHeight + 9 + "px";
						$id("streamBox_5").style.top = topBlock + bigHeight + 9 + "px";
						$id("streamBox_6").style.top = topBlock + bigHeight + 9 + "px";
						$id("streamBox_7").style.top = topBlock + bigHeight + 9 + "px";
						$id("streamBox_8").style.top = topBlock + bigHeight + 9 + "px";
						
						for(var i=1; i<SCREEN_COUNT; i++) {
							$(".myPublishBox_"+i).css("width", $id("streamBox_"+i).offsetWidth);
							$(".myPublishBox_"+i).css("height", $id("streamBox_"+i).offsetHeight);
							$(".myPublishBox_"+i).css("left", $id("streamBox_"+i).offsetLeft);
							$(".myPublishBox_"+i).css("top", $id("streamBox_"+i).offsetTop);
						}
					}
				}
				
				//同等大小
				if("same"==SCREEN_SET_TYPE) {
					var height = 0, width = 0;
					if(2==SCREEN_COUNT) {
						if(streamWrapW/streamWrapH>32/9) {
							height = streamWrapH-18;
						} else {
							height = streamWrapW*9/32-27/2;
						}
						
						width = height/9*16;
						
						$id("streamBox_main").style.width = width + "px";
						$id("streamBox_main").style.height = height + "px";
						
						$id("streamBox_1").style.width = width + "px";
						$id("streamBox_1").style.height = height + "px";
						
						$("#myPublishBox").width(width).height(height);
						
						var leftBlock = (streamWrapW-(width*2+16))/2;
						$id("streamBox_main").style.left = leftBlock + "px";
						$id("streamBox_1").style.left = leftBlock + width + 16 + "px";
						
						var topBlock = (streamWrapH-height)/2;
						$id("streamBox_main").style.top = topBlock + "px";
						$id("streamBox_1").style.top = topBlock + "px";
						
						$(".myPublishBox_1").css("width", $id("streamBox_1").offsetWidth);
						$(".myPublishBox_1").css("height", $id("streamBox_1").offsetHeight);
						$(".myPublishBox_1").css("left", $id("streamBox_1").offsetLeft);
						$(".myPublishBox_1").css("top", $id("streamBox_1").offsetTop);
					}
					
					if(4==SCREEN_COUNT) {
						if(streamWrapW/streamWrapH>16/9) {
							height = streamWrapH/2-27/2;
						} else {
							height = 9*streamWrapW/32-27/2;
						}
						
						width = height/9*16;
						
						$id("streamBox_main").style.width = width + "px";
						$id("streamBox_main").style.height = height + "px";
						
						for(var i=1; i<SCREEN_COUNT; i++) {
							$id("streamBox_"+i).style.width = width + "px";
							$id("streamBox_"+i).style.height = height + "px";
						}
						
						$("#myPublishBox").width(width).height(height);
						
						var leftBlock = (streamWrapW-(width*2+16))/2;
						
						$id("streamBox_main").style.left = leftBlock + "px";
						$id("streamBox_1").style.left = leftBlock + width + 16 + "px";
						$id("streamBox_2").style.left = leftBlock + "px";
						$id("streamBox_3").style.left = leftBlock + width + 16 + "px";
						
						var topBlock  = (streamWrapH-(height*2+9))/2;
						
						$id("streamBox_main").style.top = topBlock + "px";
						$id("streamBox_1").style.top = topBlock + "px";
						$id("streamBox_2").style.top = topBlock + height + 9 + "px";
						$id("streamBox_3").style.top = topBlock + height + 9 + "px";
						
						for(var i=1; i<SCREEN_COUNT; i++) {
							$(".myPublishBox_"+i).css("width", $id("streamBox_"+i).offsetWidth);
							$(".myPublishBox_"+i).css("height", $id("streamBox_"+i).offsetHeight);
							$(".myPublishBox_"+i).css("left", $id("streamBox_"+i).offsetLeft);
							$(".myPublishBox_"+i).css("top", $id("streamBox_"+i).offsetTop);
						}
					}
					
					if(6==SCREEN_COUNT) {
						if(streamWrapW/streamWrapH>8/3) {
							height = streamWrapH/2-27/2;
						} else {
							height = 3*streamWrapW/16-12;
						}
						
						width = height/9*16;
						
						$id("streamBox_main").style.width = width + "px";
						$id("streamBox_main").style.height = height + "px";
						
						for(var i=1; i<SCREEN_COUNT; i++) {
							$id("streamBox_"+i).style.width = width + "px";
							$id("streamBox_"+i).style.height = height + "px";
						}
						
						$("#myPublishBox").width(width).height(height);
						
						var leftBlock = (streamWrapW-(width*3+32))/2;
						
						$id("streamBox_main").style.left = leftBlock + "px";
						$id("streamBox_1").style.left = leftBlock + width + 16 + "px";
						$id("streamBox_2").style.left = leftBlock + width*2 + 32 + "px";
						$id("streamBox_3").style.left = leftBlock + "px";
						$id("streamBox_4").style.left = leftBlock + width + 16 + "px";
						$id("streamBox_5").style.left = leftBlock + width*2 + 32 + "px";
						
						var topBlock = (streamWrapH-(height*2+9))/2;
						
						$id("streamBox_main").style.top = topBlock + "px";
						$id("streamBox_1").style.top = topBlock + "px";
						$id("streamBox_2").style.top = topBlock + "px";
						$id("streamBox_3").style.top = topBlock + height + 9 + "px";
						$id("streamBox_4").style.top = topBlock + height + 9 + "px";
						$id("streamBox_5").style.top = topBlock + height + 9 + "px";
						
						for(var i=1; i<SCREEN_COUNT; i++) {
							$(".myPublishBox_"+i).css("width", $id("streamBox_"+i).offsetWidth);
							$(".myPublishBox_"+i).css("height", $id("streamBox_"+i).offsetHeight);
							$(".myPublishBox_"+i).css("left", $id("streamBox_"+i).offsetLeft);
							$(".myPublishBox_"+i).css("top", $id("streamBox_"+i).offsetTop);
						}
					}
					
					if(9==SCREEN_COUNT) {
						if(streamWrapW/streamWrapH>16/9) {
							height = streamWrapH/3-12;
						} else {
							height = 3*streamWrapW/16-12;
						}
						
						width = height/9*16;
						
						$id("streamBox_main").style.width = width + "px";
						$id("streamBox_main").style.height = height + "px";
						
						for(var i=1; i<SCREEN_COUNT; i++) {
							$id("streamBox_"+i).style.width = width + "px";
							$id("streamBox_"+i).style.height = height + "px";
						}
						
						var leftBlock = (streamWrapW-(width*3+32))/2;
						
						$id("streamBox_main").style.left = leftBlock + "px";
						$id("streamBox_1").style.left = leftBlock + width + 16 + "px";
						$id("streamBox_2").style.left = leftBlock + width*2 + 32 + "px";
						$id("streamBox_3").style.left = leftBlock + "px";
						$id("streamBox_4").style.left = leftBlock + width + 16 + "px";
						$id("streamBox_5").style.left = leftBlock + width*2 + 32 + "px";
						$id("streamBox_6").style.left = leftBlock + "px";
						$id("streamBox_7").style.left = leftBlock + width + 16 + "px";
						$id("streamBox_8").style.left = leftBlock + width*2 + 32 + "px";
						
						var topBlock = (streamWrapH-(height*3+18))/2;
						
						$id("streamBox_main").style.top = topBlock + "px";
						$id("streamBox_1").style.top = topBlock + "px";
						$id("streamBox_2").style.top = topBlock + "px";
						$id("streamBox_3").style.top = topBlock + height + 9 + "px";
						$id("streamBox_4").style.top = topBlock + height + 9 + "px";
						$id("streamBox_5").style.top = topBlock + height + 9 + "px";
						$id("streamBox_6").style.top = topBlock + height*2 + 18 + "px";
						$id("streamBox_7").style.top = topBlock + height*2 + 18 + "px";
						$id("streamBox_8").style.top = topBlock + height*2 + 18 + "px";
						
						for(var i=1; i<SCREEN_COUNT; i++) {
							$(".myPublishBox_"+i).css("width", $id("streamBox_"+i).offsetWidth);
							$(".myPublishBox_"+i).css("height", $id("streamBox_"+i).offsetHeight);
							$(".myPublishBox_"+i).css("left", $id("streamBox_"+i).offsetLeft);
							$(".myPublishBox_"+i).css("top", $id("streamBox_"+i).offsetTop);
						}
					}
				}
				
				var nodeList = $class("streamInnerBox");
				
				for(var i=0, len=nodeList.length; i<len; i++) {
					var _p = nodeList[i].parentNode;
					if(_p.clientWidth/_p.clientHeight>16/9) {
						nodeList[i].style.height = _p.clientHeight + "px";
						nodeList[i].style.width = _p.clientHeight/9*16 + "px";
						nodeList[i].style.marginTop = 0;
					} else {
						nodeList[i].style.width = _p.clientWidth + "px";
						nodeList[i].style.height = _p.clientWidth/16*9 + "px";
						nodeList[i].style.marginTop = (_p.clientHeight - nodeList[i].clientHeight)/2 + "px";
					}
				}
			}
			
			//演示模式
			if("showMode"==SCREEN_TYPE) {
				$id("streamBox_main").removeAttribute("style");
				
				for(var i=1; i<9; i++) {
					$id("streamBox_"+i).removeAttribute("style");
				}
				
				var nodeList = $class("streamInnerBox");
				
				for(var i=0,len=nodeList.length; i<len; i++) {
					nodeList[i].removeAttribute("style");
					nodeList[i].style.height = "100%";
				}
				
				$id("streamWrap").removeAttribute("style");
				
				for(var i=1; i<SCREEN_COUNT; i++) {
					$(".myPublishBox_"+i).css("width", $id("streamBox_"+i).offsetWidth);
					$(".myPublishBox_"+i).css("height", $id("streamBox_"+i).offsetHeight);
					$(".myPublishBox_"+i).css("left", $id("streamBox_"+i).offsetLeft);
					$(".myPublishBox_"+i).css("top", $id("streamBox_"+i).offsetTop);
				}
			}
		},
		"resize": function() {
			this.load();
		}
	};
})(jQuery);

window.onload = sl.load();

events.addEvent(window, 'resize', function(){
	sl.resize();
});