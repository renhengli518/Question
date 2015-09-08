(function() {
	if(!UA.isIElt9) return;
	var e = "abbr,article,aside,audio,canvas,datalist,details,dialog,eventsource,figure,footer,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video".split(',');
	var l= e.length;
	while (l--){
		document.createElement(e[l]);
	}
})();

var CHATSTATE = 0;// 0为公聊1为私聊 , 根据需求切换 .
var logoutTimeout = [];
var usrtest = {}; //课堂练习
	usrtest.hassubmit = '';
	usrtest.has_submit_usrlist = '';
var documentTitle = document.title;
var hasNewMsg=function (say)
{
	var shake=6;
	clearInterval(window.NewMsg);
	var t = say || "你有新消息!";
	NewMsg=setInterval(function  ()
	{
		if(shake<=0){
			document.title=documentTitle;
			clearInterval(NewMsg);
			NewMsg=null;
			return;
		}
		document.title = document.title==t ? documentTitle : t;
		shake--;
	},500);
};

var sysMsgShow = function(config){
	if(typeof (config) == "string") {
		var html = config;
		config = {say: html};
	}
	$("#sysBox").append("<li>"+config.say+"<i class='time'>[" + now("h:i:s") + "]</i></li>");
	$id("sysBox").scrollTop = $id("sysBox").scrollHeight;
};


Codyy = {};
Codyy.Meet = {};
Codyy.User = {
	allOnlineUser : [],	
	loadUser : function(result){
		var _inID,
			_inName;
		for(var i=0; i<result.length;i++){
			_inID = result[i];
			_inName = JOINER[_inID] ? JOINER[_inID].truename : ""; //观摩者不在JOINER中
			Codyy.User.allOnlineUser.push(_inID);
			//if(INNERS_ID.indexOf(_inID)==-1){ //INNERS_ID人员列表与coco返回人员列表对比
				console.log("comeInMeet",_inName);
				comeInMeet(_inID,_inName);
			//}
			//addFaceTo(_inID, _inName);
		}
	},
	loginNotify : function(data){
		Codyy.User.allOnlineUser.push(data.from);
		comeInMeet(data.from, data.send_nick);
		clearTimeout(logoutTimeout[data.from]);
	},
	logoutNotify : function(user){
		Codyy.User.allOnlineUser.Remove(user);
		if(user == FROM_USER){
			location.href=(ROOT+"/cmeet/redirect/"+MEET_TYPE +"/"+USER_TYPE+"/"+MEET_ID +"/601.html?skey="+SKEY);
		};
		goOutMeet(user);
		clearTimeout(logoutTimeout[user]);
		logoutTimeout[user] = setTimeout(function(){
			if(IS_HOST && MAINSPEAKERS[user] != undefined) {
				Codyy.Meet.SpeakerSet.cancelSpeaker(user);
			}
		},15000);
	}
};

var smile ={
	emt : {
		"微笑":"weixiao",
		"呲牙":"ciya",
		"再见":"zaijian",
		"偷笑":"touxiao",
		"调皮":"tiaopi",
		"大哭":"daku",
		"擦汗":"cahan",
		"猪头":"zhutou",
		"得意":"deyi",
		"傲慢":"aoman",
		"发怒":"fanu",
		"害羞":"haixiu",
		"憨笑":"hanxiao",
		"汗":"han",
		"尴尬":"ganga",
		"抓狂":"zhuakuang",
		"花":"hua",
		"惊恐":"jingkong",
		"惊讶":"jingya",
		"可爱":"keai",
		"抠鼻":"koubi",
		"耍酷":"ku",
		"流泪":"liulei",
		"便便":"bianbian",
		"难过":"nanguo",
		"撇嘴":"piezui",
		"敲打":"qiaoda",
		"亲亲":"qinqin",
		"色":"se",
		"胜利":"shengli",
		"示爱":"shiai",
		"白眼":"baiyan",
		"耍酷":"shuaku",
		"衰":"shuai",
		"睡":"shui",
		"鄙视":"bishi",
		"吐":"tu",
		"嘘":"xu",
		"委屈":"weiqu",
		"炸弹":"zhadan",
		"心":"xin",
		"心裂":"xinlie",
		"菜刀":"caidao",
		"疑问":"yiwen",
		"阴险":"yinxian"
	},
	init : function(o,t) {
		smile.chatBtn = o;
		smile.chatArea = t;
		smile.box =  document.createElement("div");
		var litag ='<ul>';
			for(var k in smile.emt){
				litag+='<li><img src="'+ROOT+'/public/img/classroom/face/'+smile.emt[k]+'.gif" title="'+ k +'" /></li>';
			};
			litag += '</ul>';
		if(UA.isIE6){
			litag += '<iframe id="msgFace_ie6" frameborder="0" scrolling="no"></iframe>';
		};
		smile.box.id = "smileBox";
	    smile.box.innerHTML = litag;
	    smile.box.style.display = "none";
		document.body.appendChild(smile.box);
		events.delegate(smile.box, "li", "click", function(){
			if(CHAT_IS_CLOSE) return false;
			var event = arguments[0] || window.event,
				target = event.srcElement || event.target,
				imgVal = target.getAttribute("title");
			console.log($(smile.chatArea));
			$(smile.chatArea).insertAtCaret(smile.encodePubContent(imgVal));
			//try{(!-[1,]) ? document.selection.createRange().pasteHTML(h) : document.execCommand('InsertHtml','',h);}catch(e){};
			smile.box.style.display = "none";
		});
		events.addEvent(document, 'click', function(){
			smile.box.style.display = "none"; 
			return false;
		});
	},
	show : function(event){
		var pos = smile.chatBtn.getBoundingClientRect(),
			scrollL = document.documentElement.scrollLeft || document.body.scrollLeft;
		smile.box.style.cssText = "display:block;top:"+(pos.top - 198)+"px;left:"+(pos.left + scrollL - 4)+"px;";
		try{
			event.stopPropagation(); //阻止冒泡
		}catch(e){
			event.cancelBubble = true; //针对ie
		}
	},
	decodePubContent : function(content)
	{	
		 var imgReg = /\[(\W[^\[]*)\]/gim;  //匹配[酷][耶][大笑]这种格式
		 content =  content.replace(imgReg, function(all,$1){
		 	if(smile.emt[$1] == undefined){
		 		return all;
		 	};
		 	return "<img src='"+ROOT+"/public/img/classroom/face/"+smile.emt[$1]+".gif' title='"+ $1 +"' />";
		 });
		 return content;
	},
	encodePubContent : function(content)
	{
		// var imgReg =   /<img.*title=\"?([^\s]*)(?=(\s|\")).*?>/gim;
		// content = content.replace(imgReg,"[$1]");
		// return content;
		return "["+content+"]";
	}
};

/*判断触发的事件是否在某个范围内开始*/
var isTarget = (function() {

	var getParentNode = function(target, mark) {
		var parent = target.parentNode;
		var subject = null;

		if(parent && parent.className && parent.className.indexOf(mark)>-1) {
			subject = parent;
		}

		if(parent && parent.id && parent.id.indexOf(mark)>-1) {
			subject = parent;
		}

		if(!subject && parent && parent.parentNode) {
			subject = getParentNode(parent, mark);
		}

		return subject;
	};

	return function(target, mark) {
		var flag = false;

		if(target && target.className && target.className.indexOf(mark)>-1) {
			flag = true;
		}

		if(target && target.id && target.id.indexOf(mark)>-1) {
			flag = true;
		}

		if(!flag && target.parentNode) {
			var parent = getParentNode(target, mark);

			if(parent) {
				flag = true;
			}
		}

		return flag;
	}
})();
/*判断触发的事件是否在某个范围内结束*/

 
