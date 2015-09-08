if(!Codyy) var Codyy = {};
if(!Codyy.Meet) Codyy.Meet = {};
(function(){
	var _lastApplyTime = 0;
	function applySpeakerBind(){
		if(!COCO.connected)  return Win.alert("正在连接通讯服务器中，请稍候再进行申请……");
		if ($id("applyBtn").innerHTML == "取消发言"){
			Win.confirm({id:"conf_cancel",html:"确定要取消发言吗？"},function(){
				$id("applyBtn").innerHTML = "申请发言";
				Codyy.Meet.SpeakerSet.cancelSpeaker(FROM_USER);
			});
		}else{
			function _applyFunc(){
				if(new Date() - _lastApplyTime < 60*1000) {
					Win.alert({width:250,html:"<div class='tip_pic'><i class='tip_icon icon4'></i><p>你申请发言操作过于频繁，<br />请稍后再试！</p><div>"});
					return false;
				};
				_lastApplyTime = new Date();
				sysMsgShow("<i>你</i>申请了发言！");
				COCO.callAll("Codyy.Meet.SpeakerSet.applySpeaker",FROM_USER);
			}
			Win.confirm({id:"conf_apply",width:250,iframe:true,html:"<div class='tip_pic'><i class='tip_icon icon1'></i><p>确定要申请发言吗？</p><div>"},_applyFunc,1);
		}
	};
	events.addEvent(window,"load",function(){
		events.addEvent($id("applyBtn"),"click",applySpeakerBind); //绑定申请发言按钮
	});
	
	var becomeClient = function(){
		//viceSpeaker.unPublish(); //在线课堂（视频）发布使用小视频发布
		commonPublish(MAINSPEAKERSARR.indexOf(FROM_USER)-0+1,"unpublish");
		 //加入音频群聊(集体备课)
		if(MEET_TYPE == "INTERACT_LESSON"){
			audioStream.publish("audio");
			joinAudio(); 
		}
		
		$("#applyBtn").html("申请发言");
		try{Codyy.Meet.Pad.doPad({'act':'auth','val':0});}catch(e){};
		cancleConvert(1);
		//$("#uploadBtn").css("visibility","hidden");
		addClass($class("applyWrap")[0],"hidden");
		$(".fileList .show").addClass("hidden");
		IS_SPEAKER = false;
	},
	becomeServer = function(){
		hasNewMsg("已同意您的发言申请！");
		var tmp_msg = "你已被老师设为发言人！<br />可以发言，可以上传文档，可以操作白板文档演示。";
		Win.alert({id:"conf_apply",width:250,html:"<div class='tip_pic tip_alert'><i class='tip_icon icon3'></i><p>"+tmp_msg+"</p><div>"});
		$("#applyBtn").html("取消发言");
		
		 //退出音频群聊(集体备课)
		if(MEET_TYPE == "INTERACT_LESSON"){
			audioStream.unPublish();
			quitAudio();
		}
		
		//viceSpeaker.publish();
		commonPublish(MAINSPEAKERSARR.indexOf(FROM_USER)-0+1);
		
		//$id("uploadBtn").style.visibility = "visible";
		removeClass($class("applyWrap")[0],"hidden");
		$(".fileList .show").removeClass("hidden");
		IS_SPEAKER = true;
		try{Codyy.Meet.Pad.doPad({'act':'auth','val':1});}catch(e){};
	};
	
	var SpeakerSet = {
		applyDialog : {},
		applySpeaker : function(uid,auto){
			if(!IS_HOST) return;
			if(!JOINER[uid]){
				return Win.alert(uname+"已经离开课堂!");
			};
			if(JOINER[uid]['comein'] == 0){
				return Win.alert(uname + "不在线！");
			};
			
			var uname = JOINER[uid].truename;
			var agree = function(tp){
				if(IS_LOOPWATCH) return Win.alert("当前正在轮巡！不能设置发言人");
				
				var index = MAINSPEAKERSARR.indexOf("");
				if(index> -1){
					MAINSPEAKERSARR[index] = uid;
				}else{
					if(MAINSPEAKERSARR.length >= SCREEN_COUNT - 1){
						return Win.alert("发言人已满!");
					}
					MAINSPEAKERSARR.push(uid);
				}
				MAINSPEAKERS[uid] = now();
				setSpeackerIcon(uid);
				//通知参会人
				COCO.callAll("Codyy.Meet.SpeakerSet.agreeSpeakerBack",uid,tp);
				if(tp == "actSetSpeaker"){
					sysMsgShow("<i>您</i>已经设置<i>" + uname + "</i>为发言人");
				}else{
					sysMsgShow("<i>您</i>已经接受了<i>" + uname + "</i>的发言申请");
				}
				
				$.post(ROOT+"/meeting/updateFramesOrder.do",{
					speakers: MAINSPEAKERSARR.join(",")
				});
			};
			
			var reject = function(){
				COCO.callAll("Codyy.Meet.SpeakerSet.refuseSpeakerBack",uid);
				var uname = JOINER[uid].truename;
				sysMsgShow("<i>您</i>已经拒绝了<i>" + uname + "</i>的发言申请");
			};
				
			if (auto){
				agree("actSetSpeaker");
			}else{
				SpeakerSet.applyDialog[uid] = Win.confirm({
					width:250,
					id : "applyspeaker",
					html:"<div class='tip_pic'><i class='tip_icon icon1'></i><p>"+uname+"申请发言，是否同意?</p><div>"
				},function(){
					agree("accept");
				}, reject);
			}
			hasNewMsg("有用户申请发言！");
		},
		agreeSpeakerBack : function(uid,tp){
			MAINSPEAKERS[uid] = now();
			var index = MAINSPEAKERSARR.indexOf("");
			if(index > -1){
				console.log(index);
				MAINSPEAKERSARR[index] = uid;
			}else{
				MAINSPEAKERSARR.push(uid);
			}
			setSpeackerIcon(uid);
			var uname = JOINER[uid].truename;
			if(tp == "actSetSpeaker"){
				sysMsgShow("<i>主持人</i>已经设置<i>" + uname + "</i>为发言人");
			}else{
				sysMsgShow("<i>主持人</i>已经接受了<i>" + uname + "</i>的发言申请");
			}
			if (FROM_USER == uid) becomeServer();
			if(IS_HOST){
				SpeakerSet.applyDialog[uid].close();
			}
		},
		refuseSpeakerBack : function(uid){
			var uname = JOINER[uid].truename;
			sysMsgShow("<i>主持人</i>拒绝了<i>"+uname+"</i>的发言申请");
			if(IS_HOST){
				applyDialog[uid].close();
			}
		},
		cancelSpeaker : function(uid,flag){
			delSpeakerIcon(uid);
			if(IS_HOST) $("#"+uid).remove();
			if(uid == FROM_USER){
				/*hideVolWrap();*/
				becomeClient();
				sysMsgShow("<i>你</i>取消了发言！");
			}else{
				sysMsgShow("<i>" + JOINER[uid].truename + "</i>取消了发言！");
			}
			if(MAINSPEAKERS[uid]) {
				delete MAINSPEAKERS[uid];
				var index = MAINSPEAKERSARR.indexOf(uid);
				MAINSPEAKERSARR[index] = "";
			}
			if(!flag){
				$.post(ROOT+"/meeting/cancelSpeaker.do",{uid:uid});
				COCO.callAll("Codyy.Meet.SpeakerSet.cancelSpeaker",uid,"flag");
			};
		}
	};
	if(!Codyy.Meet.SpeakerSet) Codyy.Meet.SpeakerSet = {};
	Codyy.Meet.SpeakerSet = SpeakerSet;
})();