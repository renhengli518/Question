(function() {
	if(!UA.isIElt9) return;
	var e = "abbr,article,aside,audio,canvas,datalist,details,dialog,eventsource,figure,footer,header,hgroup,mark,menu,meter,nav,output,progress,section,time,video".split(',');
	var l= e.length;
	while (l--){
		document.createElement(e[l]);
	}
})();

/**
 * 获取第index周的开始日期和结束日期（周一开始，周日结束）
 * @param index
 * @returns {___anonymous556_565}
 */
function getWeekStartDtAndEndDt(index){
	var week ={
			
	};
	console.log("index==="+index);
	var today  = new Date();
	var day = today.getDay();
	if(day==0){//对星期天特殊处理
		day=7
	}
	var millisecond = 1000* 60 *60 *24;
	var addDays = index*7-day+1;
	var mondayDt = new Date(today.getTime()+ addDays*millisecond);
	var sundayDt = new Date(today.getTime()+ (addDays+6)*millisecond);	
	week.startDt = now('y-m-d',mondayDt.getTime());
	week.endDt = now('y-m-d',sundayDt.getTime());
	return week;
}

function formatJavaParam(json, res, pkey) {
	res = res || {};
	pkey = pkey || '';
	for (var key in json) {
		if (typeof json[key] == "string" || typeof json[key] == "number") {
			res[pkey + key] = json[key];
		} else if ($.isArray(json[key])) {
			$.each(json[key], function(index) {
				formatJavaParam(this, res, pkey + key + "[" + index + "].")
			})
		}
	}
	return res;
}

$(function() {
    //table中的全选框
	$(".selectAll").click(function() {
        var checkValue = this.checked,
            checkboxs = $(this).parents(".tableBox").find(".childChk");
        for (var i = 0, l = checkboxs.length; i < l; i++) {
        	if(checkboxs[i].disabled) continue;
        	checkboxs[i].checked = checkValue;
        };
    });

    events.delegate($tag("body"), ".childChk", "click", function() {
        var e = arguments[0] || window.event,
            target = e.target || e.srcElement;
        var checkValue = target.checked;
        var tableBox = $(target).parents(".tableBox"),
            childChks = $class("childChk", tableBox[0]),
            selectAll = $class("selectAll", tableBox[0])[0];
        if (checkValue) {
            for (var i = 0; i < childChks.length; i++) {
                if (!childChks[i].checked) return;
            }
            selectAll.checked = true;
        } else {
            selectAll.checked = false;
        }
    });

    //删除当前item
    events.delegate($tag("body"), ".itemDel", "click", function() {
        var e = arguments[0] || window.event,
            target = e.target || e.srcElement;
        if(hasClass(target,"itemDel") && target.getAttribute("customDel") == null){
        	 target.parentNode.removeChild(target);
        }
    });
    
    //切换
    $(".tabRange a").click(function(){
    	if($(this).hasClass("firstRange")){
    		$(this).parent().removeClass("tabCoverRange");
    	}else{
    		if($(this).hasClass("secondRange")) $(this).parent().addClass("tabCoverRange");
    	}
    });
    
    //首页（综合）导航切换
    $('.navTabs a').click(function(){
    	if($(this).hasClass("selected"))
    		{
    		  return;
    		}else{
    		  $(this).addClass("selected").siblings().removeClass("selected");
    	   }
    });
    //首页二维码处的js代码
    $(".sweepIt").click(function(){
		$(".codes").show();
	});
	$(document).click(function(event){
		$(".codes").hide();
	});
	events.addEvent($class("sweepIt"),"click",function(e){
		e = e || window.event;
        if (e.stopPropagation){
            e.stopPropagation();    
        } else {
            e.cancelBubble=true;
        }
		// e.preventDefault();
		// e.stopPropagation();
	 });
   $(".closeIt").click(function(){
	   $(this).parent(".dimensionalCode").hide(); 
   });

    $(".gn_tabs a").click(function(){
    	if(!$(this).hasClass("selected"))
    		{
    		$(".gn_tabs a").removeClass("selected");
    		  $(this).addClass("selected")
    		}
    });

    $(".gn-RecommendList li").each(function(){
    	 var $this=$(this);
    	 $this.hover(function(){
    		 $(".gn-RecommendList li").find('span.gn-resourcesDesc').stop(true).css("bottom","-80px");
    		 $(this).find('span.gn-resourcesDesc').css("bottom","-80px").animate({"bottom":0},500)
    	 },function(){
    		 $(this).find('span.gn-resourcesDesc').animate({"bottom":"-80px"},500)
    	 })
    });

    //头部 地区切换
    $(".gn-nowCityWithClick").click(function(e){
    	e = e || window.event;
		$(this).parent(".gn-area").addClass("active");
		 //e.preventDefault();
		if (e.stopPropagation){
            e.stopPropagation();    
        } else {
            e.cancelBubble=true;
        }
	 });

	 $(".gn-area .btnGreen").click(function(){
		 $(this).parents(".gn-area").removeClass("active");
	 });

	 $(document).click(function(){
		 $(".gn-area").removeClass("active")
	 });

	 events.addEvent($class("gn-area"),"click",function(e){
		e = e || window.event;
        if (e.stopPropagation){
            e.stopPropagation();    
        } else {
            e.cancelBubble=true;
        }
		// e.preventDefault();
		// e.stopPropagation();
	 });

    //字数统计
    $("body").on("keyup input propertychange",".counterBox textarea",function(){
    	var realValue = String.trim ? this.value.trim() : this.value.replace(/(^\s*)|(\s*$)/g, ""),
    		//len = realValue.replace(/[\u4e00-\u9fa5]/g, 'xx').length/2>>0,
    		len = realValue.length,
	    	limit = this.getAttribute("limit-len");
    	$(this).parent(".counterBox").find(".limitCount").html(limit-len);
    });

	//星星评分
    events.addEvent($class("starRate"),"mousemove",function(){
    	if(hasClass(this,"disabled")) return;
    	var e = arguments[0] || window.event,
    		posX = e.offsetX || e.layerX,
    		allW = this.offsetWidth,
    		rate = posX/allW*10,
    		integer = Math.floor(rate),
    		decimal = rate - integer,
    		rateValue;
		if(hasClass(this,"starRateTenDouble")) {
			rateValue = integer*10 - 0 + ((decimal * 10) > 5 ? 10 : 5);
		}else{
			if(hasClass(this,"starRateSingle")){
				
			}else{
				rateValue = Math.round(rate)*10;
			}
		}
		this.setAttribute("rateValue",rateValue);
		this.id = "star"+rateValue;
    });
    events.addEvent($class("starRate"),"mouseleave",function(){
    	if(hasClass(this,"disabled")) return;
    	this.id = "";
    });
    events.addEvent($class("starRate"),"click",function(){
    	if(hasClass(this,"disabled")) return;
    	var rateValue = this.getAttribute("rateValue");
    	$tag("a",this)[0].className = "star"+rateValue;
    	var inputBox = $tag("input[name=starValue]",this);
    	if(inputBox.length > 0){
    		inputBox[0].value = rateValue;
    	}else{
    		inputBox = document.createElement("INPUT");
    		inputBox.name = "starValue";
    		inputBox.type = "hidden";
    		inputBox.value = rateValue;
    		this.appendChild(inputBox);
    	}
    });


    var $subMenu = $('.secondMenu');
    var $mainMenus = $('.mainMenu li');
    var $subMenuGroups = $('.secondMenu ul');
    var $secondMenus = $('.secondMenu li');
    //页面左侧菜单逻辑
    $('.mainMenu').on('mouseenter', 'li', function() {
        var $elm = $(this);
        var group = $elm.attr('data-group');
        var floor = $elm.attr('data-floor');
        $mainMenus.removeClass('hover');
        $elm.addClass('hover');
        
        var elm =  $elm.parents(".mainMenu")[0];
        elm.className = elm.className.replace(/floor\d+_MainMenu/g, '') + ' floor' + floor + '_MainMenu ';
        
        $subMenuGroups.hide();
        $('.secondMenu-' + group).show();
    });
    
    $('.secondMenu').on('mouseenter', 'li', function() {
    	$secondMenus.removeClass('hover');
        $(this).addClass('hover');
    });

    var menuAnimateTimeId = 0;    
    $('.menu').on('mouseleave', function () {
    	$mainMenus.removeClass('hover');
    	$secondMenus.removeClass('hover');
    	
    	var $elm = $('.mainMenu').find('li.selected');
    	var elm =  $elm.parents(".mainMenu")[0];
    	elm.className = elm.className.replace(/floor\d+_MainMenu/g, '') + ' floor' + $elm.attr('data-floor') + '_MainMenu '	
    	var group = $elm.attr('data-group');
    	$subMenuGroups.hide();
        $('.secondMenu-' + group).show();
    });

    MENU_NOW = window['MENU_NOW'] || 'menuSchedule';
    if (MENU_NOW == 'null') {
    	var $secondMenu = $('#menuSchedule').parents().show();
        $('.mainMenu>li').removeClass('selected');
    } else {
    	var $secondMenu = $('#' + MENU_NOW).addClass('selected').parents().show();
        var group = $secondMenu.attr('data-group');
        //$('.mainMenu').addClass(group+"_MainMenu");
       var $mianMenu =  $('.mainMenu>li[data-group=' + group + ']').addClass('selected');
       $mianMenu.siblings().removeClass('selected');
       $('.mainMenu').addClass('floor' + $mianMenu.attr('data-floor') + '_MainMenu');
    }

	/*工作台导航栏选中加样式开始*/
    var eventManager = (function() {
		var reg = new RegExp("nav_item_clicked", "g");
		
		//移除前面节点的样式class
		var removePreClass = function(target) {
			var preNode = null;
			
			if(target.previousElementSibling) {
				preNode = target.previousElementSibling;
			} else {
				preNode = target.previousSibling;
			}
			
			if(preNode && preNode.className && -1!=preNode.className.indexOf("nav_item_clicked")) {
				preNode.className = preNode.className.replace(reg, "");
			}
			
			if(preNode) {
				removePreClass(preNode);
			}
		};
		
		//移除下一个节点的样式class
		var removeNextClass = function(target) {
			var nextNode = null;
			
			if(target.nextElementSibling) {
				nextNode = target.nextElementSibling;
			} else {
				nextNode = target.nextSibling;
			}
			
			if(nextNode && nextNode.className && -1!=nextNode.className.indexOf("nav_item_clicked")) {
				nextNode.className = nextNode.className.replace(reg, "");
			}
			
			if(nextNode) {
				removeNextClass(nextNode);
			}
		};
		
		return {
			bindEvent: function(e) {
				var node = e.target || e.srcElement;
				
				if(node.className.indexOf("nav_item_clicked")==-1) {
					node.className = node.className + " nav_item_clicked";
				}
				
				removePreClass(node);
				
				removeNextClass(node);
			}
		};
	})();
	/*工作台导航栏选中加样式结束*/
	
	events.addEvent($class("nav_item"), "click", function(e) {
		eventManager.bindEvent(e);
    });
	
	events.addEvent($class("magnify"), "click", function(e) {

		if(e && e.preventDefault) {
			e.preventDefault();
			e.stopPropagation();
		} else {
			window.event.cancelBubble = true;
			window.event.returnValue = false;
		}

		var searchBoxWrap = document.getElementById("search_box_id");
		
		if(!searchBoxWrap) {
			return ;
		}
		
		if(searchBoxWrap.className.indexOf("search_wrap_spread")==-1) {
			searchBoxWrap.className = searchBoxWrap.className + " search_wrap_spread";
		}
		
		$class("search_box")[0].focus();
    });
	
	events.addEvent($class("search_box"), "click", function(e) {
		e.preventDefault();
		e.stopPropagation();
	});
	
	events.addEvent(document, "click", function(e) {
		var searchBoxWrap = document.getElementById("search_box_id");
		if (!searchBoxWrap) return;
		var reg = new RegExp("search_wrap_spread", "g");
		if(-1!=searchBoxWrap.className.indexOf("search_wrap_spread")) {
			searchBoxWrap.className = searchBoxWrap.className.replace(reg, "");
		}
	});

	$(".easy_tab").on("click","a",function(){
		$(this).siblings().removeClass("tab_item_selected");
		$(this).addClass("tab_item_selected");
	});

	/*easyTab*/
	var tabIndex=0;
    $(".gn-sourceTabs").on("click","a",function(){
    	tabIndex=$(this).index();
    	if(!$(this).hasClass("gn-TopArrowSelected")){
			$(this).addClass("gn-TopArrowSelected").siblings("a").removeClass("gn-TopArrowSelected");
			$(".contentDetail").eq(tabIndex).show().siblings(".contentDetail").hide()
		}
    });
    
	/*导航栏中的地址悬浮框管理器开始*/
	var addressDialogManager = (function() {
		var ele = null;
		var reg1 = new RegExp("hide", "g");
		var reg2 = new RegExp("hidden", "g");
		var _tar = null;
		var _mark = "";

		var show = function(target, mark, newMark) {
			if(!ele) {
				ele = getEle(mark);
			}

			if(!_tar) {
				_tar = target;
			}

			if(!_mark) {
				_mark = newMark;
			}

			if(ele.className.indexOf("hide")>-1) {
				ele.className = ele.className.replace(reg1, "");
			}

			if(ele.className.indexOf("hidden")>-1) {
				ele.className = ele.className.replace(reg2, "");
			}
		};

		var hide = function(mark) {
			if(!ele) {
				ele = getEle(mark);
			}

			if(_tar && _mark) {
				var reg = new RegExp(_mark, "g");

				if(_tar.className.indexOf(_mark)>-1) {
					_tar.className = _tar.className.replace(reg, "");
				}

			}

			if(ele) {
				ele.className = ele.className + " hide";
			}
		};

		var getEle = function(mark) {
			ele = $id(mark);

			if(!ele) {
				ele = $class(mark)[0];
			}

			return ele;
		};

		return {
			show: show,
			hide: hide
		};
	})();
	/*导航栏中的地址悬浮框管理器结束*/

	/*判断触发的事件是否在某个范围内开始*/
	var isTarget = (function() {

		var getParentNode = function(target, mark) {
			var parent = target.parentNode;
			var subject = null;

			if(parent && parent.className && parent.className.indexOf && parent.className.indexOf(mark)>-1) {
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

			if(target && target.className && target.className.indexOf && target.className.indexOf(mark)>-1) {
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

//	events.addEvent($id("address"), "click", function(e) {
//		e.stopPropagation();
//		e.preventDefault();
//		addressDialogManager.show(e.target, "address_dialog_wrap", "address_cl");
//		e.target.className = e.target.className + " address_cl";
//	});
//
//	events.addEvent($tag("body"), "click", function(e) {
//		if(!isTarget(e.target, "address_dialog_wrap")) {
//			addressDialogManager.hide("address_dialog_wrap");
//		}
//	});

	events.addEvent($id("search_box_id"), "click", function(e) {
		var reg = new RegExp("coffee", 'g');
		if($id("search_box_id").className.indexOf("coffee")!=-1) {
			$id("search_box_id").className = $id("search_box_id").className.replace(reg, "");
			$("#search_box_id").removeClass("search_wrap1");
			$("#search_box_id").parent(".header_item_search").removeClass("selected");
		} else {
			$id("search_box_id").className = $id("search_box_id").className + " coffee";
			$("#search_box_id").addClass("search_wrap1");

			$("#search_box_id").parent(".header_item_search").addClass("selected");
		}
		var _className = $class("search_box")[0].className;
		var regExp = new RegExp(-1!=_className.indexOf("hide")?"hide":"show", 'g');
		_className = _className.replace(regExp, -1!=_className.indexOf("hide")?"show":"hide");
		$class("search_box")[0].className = _className;
	});

	$(document).on("click", function(e) {
		if(!isTarget(e.target, "header_item_search") && $class("search_box")[0] && $class("search_box")[0].className.indexOf("show")!=-1) {
			$id("search_box_id").click();
		}
	});
});

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
				litag+='<li><img src="'+ROOT+'/public/img/face/'+smile.emt[k]+'.gif" title="'+ k +'" /></li>';
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
			var event = arguments[0] || window.event,
				target = event.srcElement || event.target,
				imgVal = target.getAttribute("title");
			$(smile.chatArea).insertAtCaret(smile.encodePubContent(imgVal));
			smile.box.style.display = "none";
		});
		events.addEvent(document, 'click', function(){
			smile.box.style.display = "none"; 
			return false;
		});
	},
	show : function(event){
		var pos = smile.chatBtn.getBoundingClientRect(),
			scrollTop = document.body.scrollTop || document.documentElement.scrollTop;
		smile.box.style.cssText = "display:block;top:"+(pos.top +scrollTop - 198)+"px;left:"+(pos.left-4)+"px;";
		try{
			event.stopPropagation(); //阻止冒泡
		}catch(e){
			event.cancelBubble = true; //针对ie
		}
	},
	decodePubContent : function(content){
		 var imgReg = /\[(\W[^\[]*)\]/gim;  //匹配[酷][耶][大笑]这种格式
		 content =  content.replace(imgReg, function(all,$1){
		 	if(smile.emt[$1] == undefined){
		 		return all;
		 	};
		 	return "<img src='"+ROOT+"/public/img/face/"+smile.emt[$1]+".gif'  class='smile-icon' title='"+ $1 +"' />";
		 });
		 return content;
	},
	encodePubContent : function(content) {
		return "["+content+"]";
	}
};
var html2Escape = function(str) {
    return str.replace(/[<>&"]/g, function(c) {
        return {
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;'
        }[c];
    });
};
/*****二期js*****/
$(function(){
	   var index=0;
	   $(".commentsKinds").on("click","a",function(){
		   var $this=$(this);
		   $this.addClass("active").siblings("a").removeClass("active")
		   index=$this.index();
		   $this.parent().siblings(".commentContent").eq(index).addClass("show").siblings(".commentContent").removeClass("show")
	   })
})