function keyScreenCaptureLoaded(){
	screenCapture.load();
};
 
function beginSnap()
{
	//白板内的截屏调的也是这个方法
	if(!keyCapObject.valid){
        if(navigator.appVersion.indexOf("x64") > 0){
            Win.alert("截屏功能仅支持<b>32位IE</b>内核浏览器");
            return;
        }
        Win.confirm({
			id:'dialog_plugin',
			width:320,
			height:180,
			html:"<p>安装截图控件后，您将可以很方便地进行截图，并支持快捷键Ctrl+Alt+A操作。现在安装？安装完成后请刷新页面</p>"
		},function(){
			location.href = ROOT+"/plugin/download/optimize.do";
		},true);
		return;
	}
	fileExt="png";
 	keyCapObject.StartCapture();//开始截图
}

var screenCapture = {
	load : function(){
		cuts = [];
		events.addEvent(keyCapObject, 'Finish', function(lRet, lFileSize){
			if (lRet == 1 && lFileSize > 0) {			  
				window.focus();
				var furl = location.host.replace(/http[s]?:\/\//i,""),
					fname,
					func,
                    domain = furl.split(":")[0],
                    port = furl.split(":")[1] || 80;
				var randomNum = parseInt(Math.random()*100000);
				if(window.MEET_ID){
					//会议内截图上传到白板
					fname = guid() + ".png";
					func = ROOT+"/file/upload.do?fileName="+fname;
				}else{
					//IM聊天区截图
					fname = "uploadDir/temp/"+now("ymd/h")+"/"+COMPANYID+"/"+randomNum+".png";
					func = "/index.php?r=common/default/snapscreen&imgSend=1&path="+fname+"&a=1";
				}
				cuts.push(fname);
				keyCapObject.SendFile(domain, port, func);
			}
		});
		events.addEvent(keyCapObject, 'SendFinish', function(lRet, strFileName, lFileSize){
			if(window.MEET_ID){
				saveFileInfo({message:cuts.pop()},0, function(data){
					if(data && data.result){
						fileList.showDoc(data.message);
					}
				});
				//会议内在白板区显示
//				$.post("/?r=//getdocid",{'url':cuts.pop()+",1"},function(id){
//					
//				});
			}else{
				//IM聊天在聊天区显示
				FM.capturedImage(ROOT+'/' + cuts.pop() + ",100,80");
			}
		});
		events.addEvent(window, 'beforeunload', function(){
			keyCapObject.UnRegistHotKey();
		});
		keyCapObject.SetLanguage(0);
		keyCapObject.RegistHotKey();
	},
	ctreteObject : function(){
		if(!window.keyCapObject){
			keyCapWrap = document.createElement("DIV");
			keyCapWrap.id = "keyCapWrap";
			keyCapWrap.innerHTML = '<object id="keyScreenCapture" type="application/x-ppmeetscreencapture" style="position:absolute;width:0px;height:0px;"><param name="onload" value="keyScreenCaptureLoaded" /></object>';
			document.body.appendChild(keyCapWrap);
			keyCapObject = $id("keyScreenCapture");
		}
	}
};

events.addEvent(window,'load',function(){
	screenCapture.ctreteObject();
});

