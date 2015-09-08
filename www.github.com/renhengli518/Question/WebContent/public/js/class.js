
function transferLoaded(){
	//导播，远程控制插件
	window.MHDPluginLoaded = true;
	window.C_PluginObj = $id("transferObject");
	C_PluginObj.classroomMode = ROLE; //课堂模式：0:主课堂；1:辅课堂；2:观摩课堂
	if(ROLE == 0){
		C_PluginObj.lessonMode = 0;
		C_SetMode.currMode = 0;
		events.addEvent(C_PluginObj,'hotkeyNotify',function(code){
			 //捕获按键 1 : ctrl+1键; 2 : ctrl+2键; 1 : ctrl+3键; 
			C_SetMode.setMode(code - 1); 
		});
	}
};

 
/* 授课模式导播设置 */
var C_SetMode = {
	setMode : function(code, isDirector){
		//远程导播，切换机位，VGA->演示模式,其他->视频模式,不调用C_PluginObj.lessonMode，以director为准
		isDirector = isDirector || false;
		try {
			//切换为互动模式，远程导播切为手动模式,采用远程 模拟点击远程页面形式
			if (window.director) {
				if (C_SetMode.currMode != code) {
					director.setMode(code);
				}
			}
			if (!isDirector) {
				C_PluginObj.lessonMode = code; //0:视频模式,1：演示模式,2：互动模式
			}
		} catch(e) {
			console.log("插件问题："+e);
		}
		C_SetMode.currMode = code;
		if(C_Remote.connectedID) C_Remote.stop(C_Remote.connectedID);  //如果有远程连接则断开
		if(window.FullScreenID)	{
			Screen.quitMainScreen(); //如果有指定发言则恢复
			COCO.callAll('Screen.quitMainScreen');
		}
		(function(){
			var btns = $class("ctlBtn");
			for(var i = 0; i < btns.length; i++){
				if(code == 2){
					btns[i].innerHTML = "指定交互";
					btns[i].title = "指定交互";
					addClass(btns[i],"vgamodeBtn");
				}else{
					btns[i].innerHTML = "指定发言";
					btns[i].title = "指定发言";
					removeClass(btns[i],"vgamodeBtn");
				}
			}
		})();
		removeClass($class("cur")[0],'cur');
		addClass($class("modeBtn")[code],'cur');
		if(!!PADSHOW){
			//切换模式时，若存在白板则去除
			CodyyCR.hideEpad();     
	        COCO.callAll("CodyyCR.hideEpad");
		};
		
	}
};

/* 远程控制功能 */
var C_Remote = {
	start : function(to){
		//开始远程
		if(!COCO.connected) return Win.alert("正在连接通讯服务器！",1000);
		if(to == "") return Win.alert("所选教室为空！",1000);
		if(to == undefined) return Screen.selfMainScreen();
		if(COCO.users[to] !== true) return Win.alert("对方未在线！",1000);
		/* 开启插件，并请求对方控制 */
		C_PluginObj.StartRemote();
		COCO.callOne(to,"C_Remote.remote_start",UID,window.screen.width,window.screen.height);
		Screen.player = $id('player'+to);
		if($class("ctlBtn",Screen.player)[0]){
			 $class("ctlBtn",Screen.player)[0].innerHTML = "取消交互";
			  $class("ctlBtn",Screen.player)[0].title = "取消交互";
			  addClass($id('player'+to),"currInterSpeaker");
		}
		C_Remote.connectedID = to;
	},
	stop : function(to){
		//结束远程
		C_PluginObj.EndRemote();
		COCO.callOne(to,"C_Remote.remote_stop","");
		Screen.player = $id('player'+to);
		if($class("ctlBtn",Screen.player)[0]) {
			$class("ctlBtn",Screen.player)[0].innerHTML = "指定交互";
			$class("ctlBtn",Screen.player)[0].title = "指定交互";
			removeClass($id('player'+to),"currInterSpeaker");
		}
		C_Remote.connectedID = false;
	},
	remote_start:function(from,w,h){
		C_PluginObj.SetScreenMatrix(w,h); //将发送方屏幕分辨率设入插件
		C_PluginObj.StartRemote();
		C_Remote.host = from;
		window.scrollTo(0,1000); //滚动到最下方
		events.addEvent(C_PluginObj,'remoteNotify',C_Remote._remoteNotify);
		Win.alert("您现在获取了操作主课堂电脑的权限。");
	},
	remote_stop:function(){
		C_PluginObj.EndRemote();
		Win.alert("您现在取消了操作主课堂电脑的权限。");
		events.removeEvent(C_PluginObj,'remoteNotify',C_Remote._remoteNotify);
	},
	remote_control:function(pars){
		var cmd = decodeURIComponent(pars);
		console.log("中心课堂收到远程操作命令：",cmd);
		C_PluginObj.ExecuteRemoteMsg(cmd);
	},
	receive : function(j){
		//有coco接收的消息
		if(j.to !== UID) return;
	},
	_remoteNotify : function(cmd){
		console.log("附课堂发布远程操作命令：",cmd);
		COCO.callOne(C_Remote.host,"C_Remote.remote_control",cmd);
	}
};


/*
 * 交互控制
 */
var Screen = {
	setMainScreen : function(id){
		try{//如有flash在全屏状态，则先退出全屏。
			for(var i=0; i < MAINSPEAKERS.length; i++){
				window['play_'+MAINSPEAKERS[i]].quitFull();
			}
		}catch(e){};
		//将指定发言课堂视频最大化
		window.FullScreenID = id;
		Screen.player = $id('player'+id);
		addClass(document.body,"fullMode");
		addClass(Screen.player,"fullSpeaker");
		if($class("ctlBtn",Screen.player)[0]){
			 $class("ctlBtn",Screen.player)[0].innerHTML = "取消发言";
			  $class("ctlBtn",Screen.player)[0].title = "取消发言";
		}
		this.specResize();
		this.setPreview();
		if(ROLE==0){
			$.post(ROOT+'/class/schoolTeaching/setMainScreen.do',{mid:MID,uid:id},function(data){
				//记入缓存
				console.log(data);
			},'json');
		}
	},
	quitMainScreen : function(){
		var id = window.FullScreenID;
		window.FullScreenID = 0;
		Screen.player = $id('player'+id);
		removeClass(document.body,"fullMode");
		removeClass(Screen.player,"fullSpeaker");
		if($class("ctlBtn",Screen.player)[0]) {
			$class("ctlBtn",Screen.player)[0].innerHTML = "指定发言";
			$class("ctlBtn",Screen.player)[0].title = "指定发言";
		}
		this.specResize();
		this.setSize();
		this.setPreview();
		if(ROLE==0){
			$.post(ROOT+'/class/schoolTeaching/setMainScreen.do',{mid:MID,uid:-1},function(data){
				//清除缓存
				console.log(data);
			},'json');
		}
	},
	specResize: function(){
		var videoCont = $class("videoCont",Screen.player)[0];
		if(window.FullScreenID){
			//进入最大
			var _height = (videoCont.offsetWidth * 9 / 16) + "px";
				videoCont.style.height = _height;
				videoCont.style.lineHeight = _height;
		}else{
			//退出最大
			if(ROLE != 0) videoCont.style.height = ''; 
		}
	},
	setSize: function(){
		if(!!window.FullScreenID){
			Screen.specResize();
		};
		if(ROLE == 0){
			//主课堂看多个分课				
			var videoConts = $class("videoCont");
			if(videoConts.length>0){
				for(var i = 0; i<videoConts.length; i++){
					var _height = (videoConts[i].offsetWidth * 9 / 16) + "px";
					videoConts[i].style.height = _height;
					videoConts[i].style.lineHeight = _height;
				}
			}
		}else{
			//分课堂看主课堂视频
			var bigvideoWrap = $id("bigvideoWrap");	
			if(bigvideoWrap){
					var _height = (bigvideoWrap.offsetWidth * 9 / 16) + "px";
					bigvideoWrap.style.height = _height;
					bigvideoWrap.style.lineHeight = _height;
			}
		}
	},
	setPreview:function(){
		//var obj = $tag("embed",Screen.player)[0];
		//if(ROLE != 0){
			// if(window.FullScreenID){
				// obj.width = "100%";
				// obj.height = "100%";
			// }else{
				// obj.width = "1";
				// obj.height = "1";
			// }
		//}
		//obj.PreviewWindow(0,0,obj.offsetWidth, obj.offsetHeight); 
	},
	selfMainScreen:function(){
		window.FullScreenID = "Self";
		addClass(document.body,"fullMode");
		addClass($id("playerSelf"),"fullSpeaker");
		var mainPublishBox = $id("mainPublishBox"),
			_height = (mainPublishBox.offsetWidth * 9 / 16) + "px";
		mainPublishBox.style.height = _height;
		mainPublishBox.style.lineHeight = _height;
	},
	quitSelfMainScreen:function(){
		window.FullScreenID = 0;
		removeClass(document.body,"fullMode");
		removeClass($id("playerSelf"),"fullSpeaker");
		var mainPublishBox = $id("mainPublishBox");
		mainPublishBox.style.height = "";
	}
};

/* 按键选择 */
var keyControl = {
	host : Number(0),
	bind : function(e){
		//按键值
		switch(e.keyCode){
			case 37 : 
				this.move('left'); 
				break;
			case 38 : 
				this.move('up'); 
				break;
			case 39 :
				this.move('right'); 
				break;
			case 40 : 
				this.move('down'); 
				break;
			case 49 : //ctrl+1
				if(e.ctrlKey) C_SetMode.setMode(0); 
				break;
			case 50 :
				if(e.ctrlKey) C_SetMode.setMode(1); 
				break;
			case 51 :
				if(e.ctrlKey) C_SetMode.setMode(2); 
				break;	
			case 27 : //esc
				this.move('cancel'); 
				break;
			case 13 : //enter
				this.apply($class("currSpeaker")[0].getAttribute('playId')); 
				break;
		}
	},
	move : function(arrow){
		if(window.FullScreenID) return; //有最大化时，没有选择功能键；
		if(arrow == 'cancel'){
			this.host = 0;
			this.select();
			return;
		};
		//按人数区分
		SPEAKER_LIMIT = '4'; //写死了
		switch(SPEAKER_LIMIT){
			case '1' :
				if(this.host == 1){
					this.host = 0;
					this.move('cancel'); 
				}else{
					this.host = 1;
					this.select();
				};
				return;
			case '2' :
				if(arrow == 'left' || arrow == 'up'){
					this.host --;
				}else{
					this.host ++;
				};
				if(this.host <= 0) this.host = 2;
				if(this.host > 2) this.host = 1;
				break;
			case '3' :
			case '4' :
				if(arrow == 'left'){
					this.host --;
					if(this.host <= 0) this.host = SPEAKER_LIMIT;
					break;
				}
				if(arrow == 'right'){
					this.host ++;
					if(this.host > SPEAKER_LIMIT) this.host = 1;
					break;
				}
				if(arrow == 'up'){
					this.host -= 2;
					if(this.host <= -1) this.host = SPEAKER_LIMIT;
					if(this.host == 0) this.host = 3;
					break;	
				}
				if(arrow == 'down'){
					this.host = this.host - 0 + 2;
					if(this.host == 2) this.host = 1;
					if(this.host == 5) this.host = 2;
					if(this.host > SPEAKER_LIMIT ) this.host = 1;
					break;	
				}
		}
		this.select();
	},
	select : function(){
		removeClass($class("currSpeaker"),"currSpeaker");
		addClass($class("videoWrap")[this.host-1],"currSpeaker");
	},
	clickMainSpeaker: function () {
		this.host = $class("videoWrap").length
		this.select();
		this.apply();
	},
	apply : function(playid){
		if(!window.FullScreenID){
			if(C_SetMode.currMode == 2){
				//交互模式
				if(!C_Remote.connectedID){
					C_Remote.start(playid);
				}else{
					if(C_Remote.connectedID !== playid){ //当前交互ID不是设置id
						Win.alert("请先取消当前交互课堂！");
					}else{
						C_Remote.stop(playid);
					}
				}
			}else{
				if(!COCO.connected) return Win.alert("正在连接通讯服务器！",1000);
				if(playid == "") return Win.alert("所选教室为空！",1000);
				if(playid == undefined) {
					 Screen.selfMainScreen();
					 return false;
				}
				if(COCO.users[playid] !== true) return Win.alert("所选教室未在线！",1000);
				COCO.callAll('switchSpeaker.receiveSpeaker',playid); //接收音视频
				Screen.setMainScreen(playid);
				COCO.callAll('Screen.setMainScreen',playid);
				console.log('Screen.setMainScreen',playid); //保留这句注释，否则可能消息发不通
			}
		}else{
				COCO.callAll('switchSpeaker.receiveNormal',playid); //只接收音频
				Screen.quitMainScreen();
				COCO.callAll('Screen.quitMainScreen');
		}
	}
};


var switchSpeaker = {
	receiveSpeaker : function(playid){  //设置发言人后做音视频设置
		if(playid == UID) return false; 
		var _receiveType = "all",
			_u = playid;
		if(UserSet[_u]){
			if(!UserSet[_u][0] && !UserSet[_u][1]){ //设置了当前发言人禁音视频
                _receiveType = "none";
			}else{
				if(!UserSet[_u][0]){  //设置了当前发言人禁音
					_receiveType = "video";  
				}else if(!UserSet[_u][1]){  //设置了当前发言人禁视频
					_receiveType = "audio";
				}
			};
		}
		window['play_'+playid].receiveSet(_receiveType);
		window['play_'+playid].play("class_"+MAIN_SPEAK+"_u_"+MID+"_"+playid);
	},
	receiveNormal : function(playid){ //取消发言人后做音视频设置
		if(playid == UID) return false; 
		var _receiveType = "audio",
			_u = playid;
		if(UserSet[_u]){
			if(!UserSet[_u][0] && !UserSet[_u][1]){ //设置了当前发言人禁音视频
                _receiveType = "none";
			}else{
				if(!UserSet[_u][0]){  //设置了当前发言人禁音（由于最小化，为省带宽，默认也不接收视频）
					_receiveType = "none";  
				}
			}
		}
		window['play_'+playid].receiveSet(_receiveType);
		window['play_'+playid].play("class_"+MAIN_SPEAK+"_u_"+MID+"_"+playid);
	}
};

events.addEvent(window,'load',function(){
	Screen.setSize();
	events.addEvent($class('ctlBtn'),'click',function(){
		var playid = this.getAttribute('playid');
		keyControl.apply(playid);
		this.blur();
	});
	if(ROLE == 0){
		events.addEvent(document,'keyup',function(){
			var e = arguments[0] || window.event;
			keyControl.bind(e);
			if(e.keyCode == 116 || e.keyCode == 122 || e.keyCode == 123) return false;
			try{
				e.preventDefault();
			}catch(e){
				e.returnValue=false;
			}
		});
		events.addEvent(document,'keydown',function(){
			var e = arguments[0] || window.event;
			if(e.keyCode == 116 || e.keyCode == 122 || e.keyCode == 123) return false;
			try{
				e.preventDefault();
			}catch(e){
				e.returnValue=false;
			}
		});
	};
});
events.addEvent(window,'resize',Screen.setSize);
