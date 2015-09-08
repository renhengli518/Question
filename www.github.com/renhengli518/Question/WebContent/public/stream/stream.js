/* RTMP发布接收类 */
function Speaker(wrap, namespace, url, params,call){
	var myParams = extendCopy(params || {}, {
		nameSpace : namespace,
		debug : 0,
		//url : RTMP,
		code : window.CODE,
		mid :  window.MEET_ID,
		myid :  window.FROM_USER,
		separator : "_",
		//codec : 1,
		buffer : window.BUFFER_TIME || "0.1",
		bufferMax : window.BUFFER_TIMEMAX || "0.2",
		//echoPath : ECHO_PATH,
		//width : SPEAKER_RATIO,
		//quality : VIDEO_QUALITY,
		//frame : VIDEO_FRAME,
		//h264 : H264_SET,   //none:照顾移动端,可不启用h264
        bgcolor : "0xAAC7EC",
		bgimg : ROOT+"/public/img/speakvideo/speaker.jpg", //背景图
		//bgsize : "500,500", //为空时自适应
		fullimg : ROOT+"/public/img/speakvideo/fullBtn.png", //全屏按钮
		//fullpos : "2,20,20",  //缺省为右上角，20*20的尺寸
		waterimg : ROOT+"/public/img/speakvideo/logo.png" //水印
	});  
	this.wrap = wrap;
	//绑定事件触发函数
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
		var self = this;
		var paramVars = "";
		for(var i in myParams){
			paramVars += i+"="+myParams[i]+"&";
		};
		this.obj = FlashPlayer(this.wrap, url+"?"+paramVars,{
			id : myParams.id//,
			//wmode : "Opaque",
			//wh : [600,500],
			//returnType ： "string"
		});
		if(this.setSize){
			this.setSize(640);
			events.addEvent(window,'resize',function(){
				self.setSize(-1);
			});
		};
	};
	this.init();
};
Speaker.prototype = {
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