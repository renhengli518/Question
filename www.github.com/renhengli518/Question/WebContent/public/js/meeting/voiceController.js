(function($) {
	var $doc = $(document), clickMicrophoneCount=0, clickEarphoneCount=0;

	var dragHandle = (function() {
		return _dragHandle = function(ev) {
			var eventSet={}, dragBoxSet={}, dragBox=ev.target, wrapSize={}, dragBoxSize={},soundValue = 75 ;
	
			dragBoxSize = {
				"w": dragBox.offsetWidth,
				"h": dragBox.offsetHeight
			};
	
			wrapSize = {
				"w": dragBox.parentNode.offsetWidth,
				"h": dragBox.parentNode.offsetHeight
			};
	
			var _drag = function() {};
	
			_drag.prototype = {
				"start": function(e) {
					eventSet = {
						"x": e.clientX,
						"y": e.clientY
					};
					dragBoxSet = {
						"x": e.target.offsetLeft,
						"y": e.target.offsetTop
					};
	
					$doc.bind("mousemove", this.move).bind("mouseup", this.end);
				},
				"move": function() {
					var currentMouseSet = {
						"x": arguments[0].clientX,
						"y": arguments[0].clientY
					};
					var style = dragBox.style;
					dragBoxSet.x = Math.max(0, Math.min(dragBoxSet.x + (currentMouseSet.x - eventSet.x), wrapSize.w-dragBoxSize.w/3*2));
					dragBoxSet.y = Math.max(-dragBoxSize.h/3*2, Math.min(dragBoxSet.y + (currentMouseSet.y - eventSet.y), wrapSize.h-dragBoxSize.h/3*2));
					eventSet = currentMouseSet;
					/*style.left = dragBoxSet.x + "px";*/
					(dragBox.previousElementSibling || dragBox.previousSibling).style.height = (wrapSize.h-dragBoxSet.y-dragBoxSize.h/2) + "px";
					style.top = dragBoxSet.y + "px";
					/*soundSetting(dragBox.id, (dragBoxSet.y/(wrapSize.h-dragBoxSize.h/3*2)).toFixed(2));*/
				},
				"end": function() {
					$doc.unbind("mousemove").unbind("mouseup");
					soundValue = (wrapSize.h-dragBoxSet.y-dragBoxSize.h/3*2)/wrapSize.h*100>>0;
					soundSetting(dragBox.id, soundValue);
				}
			};
	
			var _d = new _drag();
	
			_d.start(ev);
		};
	})();
	
	$doc.bind("mousedown", function(e) {
		var doms = [];
		
		if(window.getElementsByClassName) {
			doms = document.getElementsByClassName("voice_button");
		} else {
			var allDom = document.getElementsByTagName("*") || document.all;
			for(var i=0,len=allDom.length; i<len; i++) {
				var el = allDom[i];
				var classNameStr = el.className || "";
				classNameStr.replace("/(^\s*)|(\s*$)/g", "");
				var classNameList = classNameStr.split(" ");
				for(var j=0, l=classNameList.length; j<l; j++) {
					if(classNameList[j]=="voice_button") {
						doms.push(el);
						break;
					}
				}
			}
		}
		
		for(var i=0,len=doms.length; i<len; i++) {
			if(e.target === doms[i]) {
				new dragHandle(e);
			}
		}
	});
	
	var soundSetting = function(goal, soundValue) {
		switch(goal){
		case 'microphone': 
			console.log(soundValue);
			publisher.setMicVolume(soundValue);
			if(audioStream) audioStream.setMicVolume(soundValue);
			break;
		case 'earphone' :
			console.log(soundValue);
			if(!IS_HOST) window["play_MainSpeaker"].setSoundVolume(soundValue);
			if(audioStream) audioStream.setSoundVolume(soundValue);
			for(var i =1; i<=8; i++){
				(function(id){
					window["play_"+id].setSoundVolume(soundValue)
				})(i);
			}
			break;
		}
	};
	
})(jQuery);