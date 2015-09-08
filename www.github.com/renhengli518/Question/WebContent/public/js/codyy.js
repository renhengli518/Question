function PluginPlayer(wrap,url,uuid,wh){
	var id = "plugin" + uuid;
	var wrapBox = wrap || document.body;
	wh ? wh = [wh[0] + "px",wh[1] + "px"] : wh = ["100%","100%"];
	var e = '<object  width="'+wh[0]+'" height="'+wh[1]+'" id="' + id + '" type="application/x-codyyreceivehd" class="receiver-plugin" ><param name="onload" value="receiverLoaded' + uuid + '" /></object>';
	if (window['PUBLISH2_MODULE'] && PUBLISH2_MODULE == 'fullplugin') {
		e = '<object  width="'+wh[0]+'" height="'+wh[1]+'" id="' + id + '" type="application/x-codyymultihd" class="receiver-plugin" ><param name="onload" value="receiverLoaded' + uuid + '" /><param name="pluginType" value="receiver" /><param name="receiveId" value="' + uuid + '" /></object>';
	}
	wrapBox.insertAdjacentHTML('afterBegin',e); 
	return document[id];
}

function PSpeaker(wrap, namespace, url, params,call){
	var myParams = this.myParams = extendCopy(params || {}, {
		nameSpace : namespace,
		debug : DEBUG,
		url : PMS,
		playType : -1,
		separator : "_",
		bgcolor: '0x73A53F',
		fullimg : "http://"+location.host+ROOT+"/public/img/green/fullBtn.png",
		schoolName: ''
	}); 
	myParams.uuid = PSpeaker.prototype.uuid++;
	this.wrap = wrap;
	this.load = function () {
		this.play();
	}; 
	if (call) {
		this.load = call.load || this.load;// flash加载完成时调用
	}
	this.init();
};

PSpeaker.prototype = {
	uuid: 1,
	addIcon: function () {
		this.obj.AddIcon.apply(this.obj, arguments);
	},
	removeElm: function (id) {
		this.obj.RemoveElement(id);
	},
	updateElement: function (id, url) {
		this.obj.UpdateElement(id, url);
	},
	recordState: function (p) {
		if (p  === void 0) {
			return this.obj.recordState;
		} else {
			this.obj.recordState = p;
		}
	},
	recordFileType: function (p) {
		if (p  === void 0) {
			return this.obj.recordFileType;
		} else {
			this.obj.recordFileType = p;
		}
	},
	recordFilePath: function (path) {
		this.obj.recordFilePath = path;
	},
	setSharedName: function (name) {
		this.obj.SetSharedQueueName(name);
	},
	recordFilePath: function (path) {
		this.obj.recordFilePath = path;
	},
	init: function () {
		var myParams = this.myParams;
		var self = this;
		var receiveTypeMap = {none: 0, video: 1, audio: 2, all: 3};
		var obj;
		//<option value="0">音视频都不接收</option><option value="1">只接收视频</option><option value="2">只接收音频</option><option value="3">音视频都接收</option>
		window['receiverLoaded' + myParams.uuid] = function () {
			obj.receiveBuffer = myParams.buffer;
			obj.receiveType = receiveTypeMap[myParams.receiveType];
			obj.rtmpUrl = myParams.url;
			obj.streamName = myParams.file;
			obj.schoolName = myParams.schoolName;
			obj.backGroundPath = myParams.bgimg;
			self.load();
		}

		obj = this.obj = PluginPlayer(this.wrap, "", myParams.uuid);	
		this.hasAddNetImg = false;
	},
	setSize : function(width){
		if(width>0){
			switch(width-0){
				case 1920 : //1920*1080
				case 1280 : //1280*720
					this.sizeRatio = 9/16;
					break;
				case 720 :  //720*480
					this.sizeRatio = 2/3;
					break;
				default : //640*480,320*240,160*120
					this.sizeRatio = 3/4;
					break;
			}
		}
		var w = this.wrap.parentNode.offsetWidth,
			h = this.wrap.parentNode.offsetHeight,
			ratio = this.sizeRatio;
		(h/w < ratio) ? w = h/(ratio)  : h = w*ratio;
		 this.wrap.style.width = w + "px";
		 this.wrap.style.height = h + "px";
	},
	play : function(uid,uname){
		this.obj.streamName = uid || this.obj.streamName;
		this.obj.Play();
	},
	playAudio : function(uid){
		this.obj.receiveType = 2;
		this.obj.streamName = uid || this.obj.streamName;
		this.obj.Play();
	},
	stop : function(uid){
		this.obj.Stop();
	},
	quitFull: function () {
		this.obj.SwitchToFullScreen(0);
	},
	setNetInfo: function (info, title, imgUrl) {
		if (!this.hasAddNetImg) {
			this.obj.AddIcon("netWork", imgUrl, -1, 0, 15, -1, 36, 30);
			this.hasAddNetImg = true;
		} else {
			this.obj.UpdateElement("netWork", imgUrl);
		}
	}
};


function Speaker(wrap, namespace, url, params,call){
	var myParams = extendCopy(params || {}, {
		nameSpace : namespace,
		debug : DEBUG,
		url : PMS,
		playType : -1,
		separator : "_",
		bgcolor: '0x73A53F',
		fullimg : "http://"+location.host+ROOT+"/public/img/green/fullBtn.png",
		bgsize : "300,300",
		fullpos : "4,25,25"
		//waterurl : "/public/img/speakvideo/logo.png",
	});  
	this.wrap = wrap;
	if(call){
		this.load = call.load; // flash加载完成时调用
		this.linkup = call.linkup; // flash connect success时调用
		this.micWave = call.micWave;  // flash中麦克风音量 
		this.soundWave = call.soundWave; // flash中扬声器音量 （未实现）
		this.camFps = call.camFps; // 摄像头实时帧率（调试用）
		this.setSize = call.setSize; // 分辨率改变后的回调
        this.onInsufficientBW = call.onInsufficientBW; //提示接收端带宽不足
		this.onMetaData = call.onMetaData; //视频播放开始，返回metadata信息(通常只用于录播流)
		this.onStop = call.onStop; //视频播放结束(录播流)
		this.linkDown = call.linkDown; //连接断开时
	}
	this.init = function(){
		var paramVars = "";
		for(var i in myParams){
			paramVars += i+"="+myParams[i]+"&";
		};
		this.obj = FlashPlayer(this.wrap, url+"?"+paramVars, {id:myParams.id});
		//this.setSize(640);
		var that = this;
		// events.addEvent(window,'resize',function(){
			// that.setSize(-1);
		// });
	};
	this.init();
};

Speaker.prototype = {
	addIcon: function (id, imgUrl, left, top, right, bottom, w, h) {
		$(this.wrap).append('<img class="videoContBtn videoContBtn' + id + '"  data-id="' + id + '" style="' 
																+ (left != -1? 'left:' + left + 'px;': '') 
																+ (top != -1? 'top:' + top + 'px;': '') 
																+ (right != -1? 'right:' + right + 'px;': '') 
																+ (bottom != -1? 'bottom:' + bottom + 'px;': '') 
																+ '" width="' + w + 'px" height="' + h + 'px" src="' + imgUrl + '"/>');
	},
	removeElm: function (id) {
		$(this.wrap).find('.videoContBtn' + id).remove();
	},
	updateElement: function (id, url) {
		var $elm = $(this.wrap).find('.videoContBtn' + id);
		if ($elm.length > 0) {
			$elm[0].src = url;
		}
	},
	setNetInfo: function (info, title) {
		var $videoWarp = $(this.wrap).parents('.videoWrap');
		var $elm = $videoWarp.find(".network");
		if ($elm.length == 0) {
			$elm = $('<div class="network"></div>').appendTo($videoWarp.find('.videoCont'));
		}
		$elm[0].className = "network network" + info;
		$elm.attr('title', title);
	},
	connect : function(sUrl){
		this.obj.connect(sUrl);
	},
	publish : function(){ 
		var isAudio = (arguments[0] === "audio"); //若传入"audio"则只发布音频。
		this.obj.publish(isAudio); //isAudio：可用于在视频模式下面发布音频流
	},
	purePublish : function(){ 
		this.obj.purePublish(); //纯发布流，不在本地video显示
	},
	unPublish : function(){
		var isAudio = (arguments[0] === "audio"); //传入audio，只停止发布，不去除video显示
		this.obj.unPublish(isAudio);
	},
	play : function(uid,uname){
		this.obj.playStream(uid,uname); //uname用于显示名字
	},
	playAudio : function(uid){
		this.obj.playStream(uid,'',true); //接收音频流（不会放入video）
	},
	stop : function(uid){
		this.obj.stopStream(uid);
	},
	togglePause : function(){
		this.obj.togglePause(); //录播流的暂停/播放
	},
	seek : function(t){
		this.obj.seek(t); //录播流跳播
	},
	selectCam : function(name){
		this.obj.selectCamera(name); 
	},
	setCamera : function(width,fps,quality,keyFrame){
		if(this.setSize) this.setSize(width);
		this.obj.setCamera(width,fps,quality,keyFrame); 
	},
	setMicVolume: function(v){
		this.obj.setMicVolume(v); 
	},
	setSoundVolume: function(v){
		this.obj.setSoundVolume(v/50); 
	},
	applyH264 : function(profile,level){
		this.obj.h264(profile,level); 
	},
	applyCodec : function(value){
		this.obj.codec(value); 
	},
	setRate : function(value){
		this.obj.setRate(value); 
	},
	applyEnhanced : function(value){
		this.obj.applyEnhanced(value); 
	},
	setEchoPath : function(value){
		this.obj.setEchoPath(value); 
	},
	recordSet : function(type){
		this.obj.recordSet(type); 
	},
	receiveSet : function(type){
		this.obj.receiveSet(type); 
	},
	getDeviceInfo : function(uid){
		this.obj.getDeviceInfo(); 	//获取摄像头，麦克风设置的信息
	},
	getStreamInfo : function(uid){
		return this.obj.getStreamInfo(uid); //接收方实时获取流信息，如果播的是主持人流或者录播流，不用传uid
	},
	quitFull : function(){ //退出flash全屏
		this.obj.quitFull();
	}
};

if(!window.Codyy) {
	window.Codyy = {};
}
Codyy.User = {
	loadUser : function(){
		 
	},
	loginNotify : function(data){
		var uid = data.from;
		if (!window.receiveGruop) {
			if (window.MAIN_SPEAK) {
				if (uid == MAIN_SPEAK) {
					window["mainSpeaker"].play("class_" + MAIN_SPEAK + '_u_' + MID + "__main");
				}else{
					window["play_" + uid].play("class_" + MAIN_SPEAK + "_u_" + MID + "_" + uid);
				}
			}
		} else {
			receiveGruop.oneCallFn(uid, 'play');
		}
	},
	logoutNotify : function(uid){
		if (!window.receiveGruop) {
			if (window.MAIN_SPEAK) {
				if (uid == MAIN_SPEAK) {
					window["mainSpeaker"].stop();
					if(C_Remote.connectedID) C_Remote.remote_stop(); //中心课堂下线，结束远程
				} else {
					window["play_" + uid].stop();
				}
			};
		} else {
			receiveGruop.oneCallFn(uid, 'stop');
			if (uid == MAIN_SPEAK && window.interactMode) {
				interactMode.EndVNC();
			}
		}
		/*
		if(ROLE == 0){
			//分课堂退出，中心课堂记录各分课堂上课情况
			//$.post("/index.php?a=api&type=updateLeftTime",{mid:MID,uid:uid},function(){});
		}*/
	}
};
