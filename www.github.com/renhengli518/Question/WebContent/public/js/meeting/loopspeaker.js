if(!Codyy) var Codyy = {};
if(!Codyy.Meet) Codyy.Meet = {};
(function(){
	var LoopSpeaker = {
			_loopTimer : null,
			loopTime : 15*1000,
			index : 1,
			count : 0,
			getState : function(){ //获取轮巡设置
				var _state = getcookie("wheelSetting") || '{"custom":false,"period":"15","isSaveSpeaker":true}';
				return JSON.parse(_state);
			},
			getShowerArr : function(){
				var tempArr = [],
					i=0, 
					uid;
				for(; i<Codyy.User.allOnlineUser.length; i++){
					uid = Codyy.User.allOnlineUser[i];
					if(uid == MAIN_SPEAK || uid in MAINSPEAKERS || uid.indexOf("watcher") > -1) continue;//排除主持人,发言人,观摩者
					tempArr.push(uid);
				}
				return tempArr;
			},
			getSpaceArr : function(){
				//可轮巡位置
				var spaceArr = new Array(SCREEN_COUNT-1);
				for(var i = 0; i<spaceArr.length; i++){
					if(MAINSPEAKERSARR[i]) spaceArr[i] = 1;
				}
				return spaceArr;
			},
			start : function(){
				var state = LoopSpeaker.getState();
				LoopSpeaker.loopTime = state.period * 1000;
				//轮循计时器开始
				MAINSPEAKERSSTR = MAINSPEAKERSARR.join(",");
				for(var i=1; i<=MAINSPEAKERSARR.length; i++){
					var uid = MAINSPEAKERSARR[i-1];
					if(!uid) continue;
					if(!state.isSaveSpeaker) Codyy.Meet.SpeakerSet.cancelSpeaker(uid);  //清除发言人
				}
				
				clearInterval(LoopSpeaker._loopTimer);
				LoopSpeaker.applayLoop();
				LoopSpeaker._loopTimer = setInterval(LoopSpeaker.applayLoop, LoopSpeaker.loopTime)
			},
			stop : function(){
				//轮循计时器停止
				LoopSpeaker.cancelLoop();
				clearInterval(LoopSpeaker._loopTimer);
			},
			applayLoop : function(){
				console.log(LoopSpeaker.index, LoopSpeaker.count )
				//执行轮循
				var i = LoopSpeaker.index,
					j = LoopSpeaker.count,
					loopArr = LoopSpeaker.getShowerArr(),  //被轮巡人
					spaceArr = LoopSpeaker.getSpaceArr();  //可轮巡区
				for(var x=0,count = 0; x<MAINSPEAKERSARR.length; x++){
					if(MAINSPEAKERSARR[x]) count++;
				}
				if(spaceArr.length <= count) {
					clearInterval(LoopSpeaker._loopTimer);
					return Win.alert("轮巡空间不足！");
				}
				
				for(var _i=0;_i<=loopArr.length;_i++){
					if(loopArr[_i] in MAINSPEAKERSARR) continue;
					COCO.callOne(loopArr[_i],"commonPublish","","unpublish"); //通知取消轮巡者
				}
				
				for(;i<=spaceArr.length;i++){
					if(spaceArr[i-1]) continue;
					if(loopArr[j]) {
						console.log("被轮巡人：",j,"轮训位置：",i);
						COCO.callOne(loopArr[j],"commonPublish",i); //通知对应的与会人发布
						commonReceivePlay(i, loopArr[j], true);
						COCO.callAll("commonReceivePlay",i, loopArr[j], true);
						j++;
						LoopSpeaker.count ++;
						if(LoopSpeaker.count >= LoopSpeaker.getShowerArr().length) LoopSpeaker.count = 0;
					}else{
						commonReceivePlay(i, "");
						COCO.callAll("commonReceivePlay",i, "");
					}
				}
				IS_LOOPWATCH = true;
				addClass(document.body,"LOOPWATCH");
				addClass($("#loopWatchBtn")[0],"on");
				$("#loopWatchBtn").find("span").html("停止轮巡");
			},
			cancelLoop : function(){
				//撤销轮循
				
				//恢复发言人(刷新)
				$.post(ROOT+"/meeting/updateFramesOrder.do",{ 
					speakers: MAINSPEAKERSSTR
				},function(){
					COCO.callAll("location.reload");
					location.reload();
				});
				
				IS_LOOPWATCH = false;
				removeClass(document.body,"LOOPWATCH");
				removeClass($("#loopWatchBtn")[0],"on");
				$("#loopWatchBtn").find("span").html("开启轮巡");
			}
	};
	if(!Codyy.Meet.LoopSpeaker) Codyy.Meet.LoopSpeaker = {};
	Codyy.Meet.LoopSpeaker = LoopSpeaker;
})();

$(function(){
	$("#loopWatchBtn").click(function(){
		
		if(hasClass(this,"on")){
			Codyy.Meet.LoopSpeaker.stop();
		}else{
			Codyy.Meet.LoopSpeaker.start();
		}
	})
})