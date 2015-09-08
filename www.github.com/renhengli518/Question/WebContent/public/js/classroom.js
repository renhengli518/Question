var CodyyCR = {
	showTalkSet:function(){
		Win.open({id:'talkSetWin',width:500,height:350,title:'音视频设置',url:ROOT + URL_PATH +'/showTalkSet.html?mid='+MID});
	},
	videoSet: function (isShow) {
		if (isShow) {
			$('#publishBox').addClass('show');
		} else {
			$('#publishBox').removeClass('show');
		}
	},
	showBranchSet:function(){
		//Win.open({id:'addBranch',width:600,height:600,title:'添加接收教室',url:'/?a=classroom&type=showaddbranch&mid='+MID});  
	    window['SHOW_CLASS_ROOM'] = window['SHOW_CLASS_ROOM'] || [];
		Win.open({
			id:'addBranch',
			width: 600,
			height: 600,
			title: '添加接收教室',
			url: ROOT +URL_PATH+'/editReceiveClassroom.html?callback=selectReceiveRooms&mid=' + MID + '&classRooms=' + window['SHOW_CLASS_ROOM'].join(',') + '&reomveRooms=' + UID
		});
	},
	showEpad:function(){
		$.post(ROOT+URL_PATH+'setPadStatus.do',{status:1,mid:MID},function(data){});
		$("#ePad").css('visibility','visible');
		PADSHOW = 1;
	},
	hideEpad:function(){
		$.post(ROOT+URL_PATH+'setPadStatus.do',{status:0,mid:MID},function(data){});
		$("#ePad").css('visibility','hidden');
		PADSHOW = 0;
	},
	loadEpad:function(o,arg){
		var WRITEPADSWF = ROOT+"/public/flash/CR_writepad/CR_writepad.swf?";
		$.each(arg, function(k, v){
			WRITEPADSWF += '&' + k + '=' + v;
		});
		CodyyCR.docPad = FlashPlayer(o,WRITEPADSWF,{id:"docPad"});
		 
		//设置高度；
		// var setPadHeight = function(){
			// var h = Math.max(document.documentElement.clientHeight,document.body.offsetHeight);
				// if($(".fullSpeaker").length > 0) h = Math.max(h, $(".fullSpeaker")[0].offsetHeight);
			// o.style.height = h + "px";
		// };
		// setTimeout(setPadHeight,3000);
		// events.addEvent(window,'resize',setPadHeight);
	},
	endCR:function(){
		if(C_Remote.connectedID) return Win.alert("当前为互动课堂模式，请先取消互动课堂再结束！");
		Win.confirm({html:"<p class='noticeWrap'><span>确定要结束课堂吗？</span></p>",id:'confirm',width:250},function(){
			$.post(ROOT+URL_PATH+'/finishCourse.do',{type:'master',mid:MID},function(data){
				if(data.result) {
					COCO.callAll('CodyyCR.CRHasEnd');
					CodyyCR.goHome();
				}
			});
		},function(){});
	},
	quitCR:function(){
		Win.confirm({html:"<p class='noticeWrap'><span>确定要退出课堂吗？</span></p>",id:'confirm',width:250},function(){
			CodyyCR.goHome();
		},function(){});
	},
	goHome:function(){
		if(ROLE == 2){
			//来宾退出
			$.post(ROOT+URL_PATH+'finishCourse.do',{type:'guest',mid:MID},function(data){
				if(data.result) {
					if(WORKSPACE == 1) {
						window.close();
					} else {
						location.replace(ROOT+URL_PATH+'/guestLoginOut.do?mid='+MID);
					}
				} 
			},'json');
			
		}else if(ROLE == 1){
			//接收教室退出课堂
			$.post(ROOT+URL_PATH+'finishCourse.do',{type:'receive',mid:MID},function(data){
				if(data.result) {
					if(URL_PATH == "/live/appointment/") {
						location.replace(ROOT + '/live/appointment/liveIndex.html');
					} else {
						location.replace(ROOT + '/class/room/' +(JAVA_V == 5?'onlineClass/':'') + data.message + '.html');					}
				} 
			},'json');
		} else if(ROLE == 0) {
			$.post(ROOT+URL_PATH+'finishCourse.do',{type:'master',mid:MID},function(data){
				if(data.result) {
					if(URL_PATH == "/live/appointment/") {
						location.replace(ROOT + '/live/appointment/liveIndex.html');
					} else {
						location.replace(ROOT + '/class/room/' +(JAVA_V == 5?'onlineClass/':'') +  data.message + '.html');
					}
				} 
			},'json');
		}
	},
	CRHasEnd:function(){
		
		if(ROLE == 1){//主课堂结束，接收课堂提示并跳转
			Win.confirm("对不起，该课堂已结束！",function(){
				if(URL_PATH == "/live/appointment/") {
					location.replace(ROOT + '/live/appointment/liveIndex.html');
				} else {
					location.replace(ROOT+'/class/room/' +(JAVA_V == 5?'onlineClass/':'')  +SKEY+'.html');
				}
			});
		}else{//主课堂结束，观摩课堂跳转
			Win.confirm("对不起，该课堂已结束！",function(){
				location.reload();
			});
		}
		
	}
};

if(!Codyy) var Codyy ={};
Codyy.Meet = {	
	//接收白板内传出的消息
    sendMsg:function(arg){
    	COCO.send(arg);
    },
    //获取coco上相关的白板消息
    getPadMsg : function(data){
    	if(data.o == "wp") CodyyCR.docPad.doPad(data);
    }
}; 

$(document).ready(function(){
	/* 加载白板 */
	if($id("ePad")){
		CodyyCR.loadEpad($id("ePad"),{
			'phphost':MEET_SERVER_HOST,
			'meetId':parseInt(MID.substr(0,6),16).toString(10),
			'myID':UID,
			'myNick':UNAME,
			'auth': 1 //(ROLE=="0"?1:0)
		});
		if(PADSHOW){
			$("#ePad").css('visibility','visible');
		}
	};
	
	$('#talkSet').click(CodyyCR.showTalkSet);
	$('#videoSet').click(function () {
		if (this.innerHTML == "开启本地视频") {
			CodyyCR.videoSet(true);
			this.innerHTML = "关闭本地视频";
		} else {
			CodyyCR.videoSet(false);
			this.innerHTML = "开启本地视频";
		}
	});
	
	/* 主持人绑定功能 */
	if(ROLE == 0){
		var moreApps = $("#moreApps");
		$("#moreOpts").click(function(e){
			if(C_Remote.connectedID) return Win.alert("当前为互动课堂模式，请先取消互动课堂再操作！");
			if(moreApps.hasClass("hidden")){
				moreApps.removeClass("hidden");
			}else{
				moreApps.addClass("hidden");
			};
			e.stopPropagation();
			return false;
		});
		$(document).click(function(){
			moreApps.addClass("hidden");				
		});
		
		$("#setPad").click(function(){
		    if(!PADSHOW){
	            CodyyCR.showEpad();     
		       	COCO.callAll("CodyyCR.showEpad");     
	        }
	        else{
	        	CodyyCR.hideEpad();     
		        COCO.callAll("CodyyCR.hideEpad");
	        }  
		});
		$("#setRecord").click(function(){
			if($(this).html() == "暂停录制"){
				$(this).html("开始录制");
				(publishModule == "plugin") ? myHDPlugin.StopRecord() : myPublish.recordSet("live");
			}else{
				$(this).html("暂停录制");
				(publishModule == "plugin") ? myHDPlugin.StartRecord() : myPublish.recordSet("append");
			}
		});
	    $('#addBranch').click(CodyyCR.showBranchSet);
	    
    	$(".videoWrap").hover(function(){
    		addClass($class("ctlBtn",this),"focusBtn");
	   	},function(){
	   		removeClass($class("ctlBtn",this),"focusBtn");
	   	});
	   	$(".ctlBtn").hover(function(){
	   		addClass(this,"hoverBtn");
	   	},function(){
	   		removeClass(this,"hoverBtn");
	   	});
	}else{

	}
	if(ROLE==0 || ROLE==1){
		//主课堂和分课堂定时更新离开时间，For监管平台
	    setInterval(function(){
	        $.post(ROOT+URL_PATH+"updateLeftTime.do",{mid:MID,uid:UID,role:ROLE},function(msg){
	        	if(msg && msg.result == false) {
	        		location.reload();
	        	} 
	        },'json');
	    },refreshTime*1000);
    }
	if(ROLE == 2){
		//定时更新来宾离开时间
		setInterval(function(){
	        $.post(ROOT+URL_PATH+"updateGuestEndTime.do",{guestId:guestId},function(){});
	    },refreshTime*1000);
	}
	
	
	
	var url = ROOT + "/class/classWork/toClassWork.do?clsClassroomId=" + UID + "&mid=" + MID + "&type=" + (URL_PATH != '/class/schoolTeaching/' ? "LIVE": "ONLINE_CLASS");
	var $iframe = $('<iframe id="homeWorkIframe" class="homeWorkIframeHide" frameborder="no" border="0" allowtransparency="true" src="' + url + '"></iframe>').appendTo('body');
	var iframeWin = $iframe[0].contentWindow;
	
	$("#homeWorkBtn").on('click', function(){
		$iframe.removeClass('homeWorkIframeHide');
		iframeWin.search();
	});            
	workMode = {
		close: function () {
			$iframe.addClass('homeWorkIframeHide');
		}
	}
});
