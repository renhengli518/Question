var L={
	resize : function(obj){
		var container = $id("container"), demoContent = $id("demoContent"), speakerContent = $id("speakerContent"), talkContent = $id("talkContent");
		var bodyH = document.body.offsetHeight,
			containerH = bodyH - $id('header').offsetHeight - 3,
			containerW = $id("container").offsetWidth,
			talkContentW = $id("talkContent").offsetWidth;
		
		container.style.height = containerH - 1 + "px";
		
		$id("streamBoxWrap").style.height = containerH - $id("nav").offsetHeight - 1 + "px";
		
		if("videoMode"==obj) {
			var clickoverWrapH = containerH - $class("clickoverList")[0].offsetHeight - 3;
			$class("clickoverWrap")[0].style.height = (clickoverWrapH>0?clickoverWrapH:0) + "px";
			
			var msgConH = $class("clickoverWrap")[0].offsetHeight - $class("talk_tab")[0].offsetHeight - $id("sendBar").offsetHeight;
			$id("msgCon").style.height = (msgConH>0?msgConH:0) + "px";
			
			$id("speakerContent").style.height = "100%";
			$id("talkContent").removeAttribute("style");
		} else {
			if(SCREEN_COUNT<=3) {
				$id("speakerContent").style.height = SCREEN_COUNT * 180 + 8 + "px";
			} else if (SCREEN_COUNT>3) {
				$id("speakerContent").style.height = 180 + (Math.floor((SCREEN_COUNT-1)/2)+(SCREEN_COUNT-1)%2)*90 + 10 + "px";
			}
			
			$id("streamBoxWrap").style.height = $id("speakerContent").offsetHeight - 2 + "px";
			
			var talkContentH = containerH - $id("speakerContent").offsetHeight;
			$id("talkContent").style.height = (talkContentH>0?talkContentH:0) + "px";
			
			$id("talkContent").style.top = $id("speakerContent").offsetHeight - 3 + "px";
			
			var clickoverWrapH = containerH - $class("clickoverList")[0].offsetHeight - $id("speakerContent").offsetHeight;
			$class("clickoverWrap")[0].style.height = (clickoverWrapH>0?clickoverWrapH:0) + "px";
			
			var msgConH = $class("clickoverWrap")[0].offsetHeight - $class("talk_tab")[0].offsetHeight - $id("sendBar").offsetHeight;
			$id("msgCon").style.height = (msgConH>0?msgConH:0) + "px";
		}
		$("#vsPanel,#rdPanel").height($("body").height());
		$("#vsBox").height($("#vsPanel").height()-$("#vsControl").height());
		$("#rdBox").height($("#rdPanel").height()-$("#rdControl").height());
		
		$(".lsnTagBox").height($(".clickoverWrap").height()-$(".lsnTagBar").height());
		
		speakerContent.style.width = $id("container").offsetWidth - talkContentW + "px";
		demoContent.style.width = $id("container").offsetWidth - talkContentW + "px";
		
	},
	dragSize : function(e){
		var o = $class("rightContainer")[0];
		var w = o.offsetWidth,
			dy = e.clientX;
		if(!window.event) {e.preventDefault();}	
		function mouseM(){
			var e = arguments[0] || window.event;
			var w2 = w + dy - e.clientX;
			o.style.width = w2 + 'px';	
			if(window.event) {e.returnValue=false;}		/* 阻止ie下a,img的默认事件 */
		}
		function mouseU(){
			events.removeEvent(document, "mousemove", mouseM);
			events.removeEvent(document, "mouseup", mouseU);
			L.resize(SCREEN_TYPE);
		}
		events.addEvent(document,'mousemove',mouseM);
		events.addEvent(document,'mouseup',mouseU);
	},
	reSizeScreen: function() {
		
	}
};
events.addEvent(window, 'resize', function(){
	L.resize(SCREEN_TYPE);
});

events.addEvent($class("extBtn")[0],'mousedown',function(){
    var e = arguments[0] || window.event;
    L.dragSize(e);
});

events.addEvent($class("extBtn")[0],'mousedown',function(){
    var e = arguments[0] || window.event;
    L.dragSize(e);
});

events.addEvent(window, 'load', function(){
	if("showMode"==SCREEN_TYPE && (4==SCREEN_COUNT || 6==SCREEN_COUNT)) {
		$("#streamWrap>.streamBox").each(function(index, item) {
			if(index+1==SCREEN_COUNT) {
				$("<div id='block_stream' class='block_stream'></div>").insertAfter($(item));
			}
		});
	}
});

function fullScreenNow(){  	
	makeFullScreenNow();
	if(IS_HOST || IS_SPEAKER) COCO.callAll("makeFullScreenNow");
};

function makeFullScreenNow() {
	document.documentElement.className = 'fullScreen';
	return ;
}

function restoreFullScreen(){
	document.documentElement.className = '';
	return ;
};

//全屏
function makeFullScreen() {
	var htmlDom = document.documentElement;
	if(hasClass(htmlDom,"fullVideo")) {
		removeClass(htmlDom,"fullVideo");
	} else {
		addClass(htmlDom,"fullVideo");
	}
	L.resize(SCREEN_TYPE);
	sl.resize();
};

//初实化画面
function initScreen() {
	if(SCREEN_SET_TYPE=="same") {
		if($id("same")) $id("same").checked = "checked";
		$("#sameCount").val(SCREEN_COUNT);
	} else {
		$("#difCount").val(SCREEN_COUNT);
	}
	$("#"+SCREEN_TYPE).addClass("selected");
	$("#"+SCREEN_TYPE).siblings().removeClass("selected");
	changeLayout();
};

//保存是否自动调整画面个数；
function doAuto(obj) {
	var data = {
		"type": obj.checked?"Y":"N"
	};
	IS_AUTO_CTRL = obj.checked + "";
	$.post("${root}/meeting/updateAutoFrames.do", data);
};

function setScreenType(type, selectId, anth) {
	CSL.changeLayoutType(type, selectId, anth);
}

function setScreenCount(_select, type) {
	CSL.changeScreenCount(_select, type);
}

function doSort() {
	if(SCREEN_COUNT-0<3) {
		Win.alert("至少有3个画面才能进行排序！");
		return ;
	}
	initSortTab();
	win_sort.dom.style.zIndex = 1001;
};

function changeLayout() {
	var classStr = "";
	if("videoMode"==SCREEN_TYPE) {
		classStr = (SCREEN_SET_TYPE=="same"?"number":"count") + SCREEN_COUNT;
	} else {
		$("#container").addClass("ShowModeWrap");
		classStr = "showModeCount" + SCREEN_COUNT;
	}
	$id("streamWrap").className = arguments[0] || classStr;
}

L.resize(SCREEN_TYPE);