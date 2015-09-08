//视频播放类
function FlvPlayer(wrap, namespace, url, params) {
	var self = this;
	var myParams = extendCopy(params || {}, {
		nameSpace: namespace,
		debug: 1,
		skin: "/public/player/MinimaFlatCustomColorAll.swf",
		//thumb : "play.png",
		hidemenu: false,
		autoplay: false
	});
	this.init = function() {
		var paramVars = "";
		for (var i in myParams) {
			paramVars += i + "=" + myParams[i] + "&";
		};
		wrap.innerHTML = "";
		this.obj = FlashPlayer(wrap, url + "?" + paramVars, {
			wmode: "Opaque"
		});
	};
	this.playerEvent = new CustomEvent();
	this.init();
}
FlvPlayer.prototype = {
	onMetadataReceived: function(data) {
		//视频信息
		this.totalTime = data.duration;
		this.playerEvent.fire({type:"onMetadataReceived",message:data});
	},
	onStart : function(){
		this.playerEvent.fire({type:"onStart",message:true});
	},
	onPlaying: function(time) {
		//currTime
		this.playerEvent.fire({type:"onPlaying",message:time});
	},
	onCuePoint: function(data){
		//提示点信息
		this.playerEvent.fire({type:"onCuePoint",message:data});
	},
	onProgress: function(prec){
		//loading
		this.playerEvent.fire({type:"onProgress",message:prec});
	},
	onComplate: function(){
		this.playerEvent.fire({type:"onComplate",message:true});
	},
	playFile: function(file) {
		this.obj.playFile(file);
	},
	pauseFile: function() {
		this.obj.pauseFile();
	},
	seek: function(time) {
		this.obj.seek(time);
	},
	stopFile: function() {
		this.obj.stopFile();
		this.obj.seek(0);
	},
	setVolume: function(vol) {
		this.obj.setVolume(vol);
	},
	addCuePoint: function(ms,name) {
		this.obj.addCuePoint(ms,name);
	}
};