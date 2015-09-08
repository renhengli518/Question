var COCO = {
	users : {},
	connected : false,
    cocoEvent : new CustomEvent(),
	init : function(wrap, url, params){
		var paramVars ="";
		var myParams = extendCopy(params || {}, {
			//预留，默认参数可以写这里
		});  
		for(var i in myParams){
			paramVars += i+"="+myParams[i]+"&";
		};
        COCO.socket = FlashPlayer(wrap,url+"?"+paramVars,{id:"cocoSwf"});
	},
	//连接成功
	linkup : function(hasConnect){
		COCO.connected = hasConnect;
        COCO.cocoEvent.fire({type:"linkup"});
	},
	linkDown : function(hasDisConnect){
		COCO.connected = !hasDisConnect;
        COCO.cocoEvent.fire({type:"linkDown"});
	},
    licenseFail : function(result){
        var _errorStr = "";
        switch(result){
            case "0":
                _errorStr = "License认证失败";
                break;
            case "3":
                _errorStr = "点数已满";
                window.location.href = '/?r=//overpoints';
				return;
            case "2":
                _errorStr = "License已到期";
                break;
        };
        alert(_errorStr);
        COCO.cocoEvent.fire({type:"licenseFail",message:_errorStr});
    },
	loginup : function(users){
        if(users && users.length){
            COCO.users.onlineNum = users.length;
            for(var i = 0; i < users.length; i++){
                COCO.users[users[i]] = true;
            }
        }
        COCO.cocoEvent.fire({type:"loginup"});
        //通过getGroupOnline再获取一遍user(新版COCO中，在loginup时不返回user列表)
        COCO.getGroupOnline();
	},
	//上下线通知
	loginNotify : function(j){
		COCO.users[j.from] = true;
		COCO.users.onlineNum++;
		j.send_nick = decodeURI(j.send_nick);
        COCO.cocoEvent.fire({type:"loginNotify",message:j});
	},
	logoutNotify : function(j){
		COCO.users[j.from] = false;
		COCO.users.onlineNum--;
		COCO.users.outlineNum++;
		j.send_nick = decodeURI(j.send_nick);
        COCO.cocoEvent.fire({type:"logoutNotify",message:j});
	},
    //消息发送
	send : function(msg){
		var reSend = function(){
			var ret = COCO.socket.sendData(msg);
			if(!ret) setTimeout(reSend,300);
		};
		reSend();
	},
	//文本私聊发送
	sendMsgTo : function(id,msg){
		COCO.socket.sendMsgTo(id,msg);
	},
	//文本群聊发送
	sendMsgToAll : function(msg){
		COCO.socket.sendMsgToAll(msg);
	},
	/* 单call 
	 * @param id,method,pars
	 */
	callOne : function(){
		var info = Array.prototype.slice.call(arguments, 0); //arguments传入as是转成object的，所以先转array再传
		COCO.socket.callOne(info); 
	},
	/* 群call 
	 * @param method,pars
	 */
	callAll : function(){
		var info = Array.prototype.slice.call(arguments, 0);
		COCO.socket.callAll(info);
	},
	/*
	 * 获取(返回)服务器在线人数和剩余点数
	 */
	getAllCount : function(result){
        if(arguments.length == 0){
            COCO.socket.checkOnline();
        }else{
            COCO.cocoEvent.fire({type:"getAllCount",message:result});
        }
	},
    /*
     * 获取(返回)服务器内人员id列表
     */
	getAllOnline : function(result){
        if(arguments.length == 0){
            COCO.socket.getAllOnline();
        }else{
            COCO.cocoEvent.fire({type:"getAllOnline",message:result});
        }
	},
    /*
     * 获取(返回)当前组人员id列表
     */
	getGroupOnline : function(users){
        if(arguments.length == 0){
            COCO.socket.getGroupOnline();
        }else{
            COCO.users.onlineNum = users.length;
            for(var i = 0; i < users.length; i++){
                COCO.users[users[i]] = true;
            };
            COCO.cocoEvent.fire({type:"loadUser",message:users});
        }
	},
	/*
	 * 提示音
	 * @param mp3 音乐文件名
	 *  */
	playSound : function(mp3){
		COCO.socket.playSound(mp3);
	},
	stopSound : function(){
		COCO.socket.stopSound();
	},
	//私聊接收
	recePrivateMsg : function(data){
		data.say = decodeURI(data.say);
		data.send_nick = decodeURI(data.send_nick);
        COCO.cocoEvent.fire({type:"recePrivateMsg",message:data});
	},
	//群聊接收
	recePublicMsg : function(data){
		data.say = decodeURI(data.say);
		data.send_nick = decodeURI(data.send_nick);
        COCO.cocoEvent.fire({type:"recePublicMsg",message:data});
	},
    //接收除私聊，群聊，群call，私call等消息外的消息
    receive : function(data){
        COCO.cocoEvent.fire({type:"receive",message:data});
    },
    //接收所有消息,包括自己发的（尽量不用此处）
    receiveAll : function(data){
    	data.say = decodeURI(data.say);
		data.send_nick = decodeURI(data.send_nick);
        COCO.cocoEvent.fire({type:"receiveAll",message:data});
	}
};