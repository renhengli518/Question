var CSL = (function($) {
	return {
		"changeLayoutType": function(type, selectId, anth) {
			var optionList = [];//获取新选择的类型（“同等大小”、“一大多小”）对应的画面数量下拉框的中的所有选项
			$("#"+selectId + " option").each(function() {
				optionList.push($(this).val());
			});
			var v = $("#"+selectId).val();//获取新选择的类型（“同等大小”、“一大多小”）对应的画面数量下拉框的中的值
			var vm = this.getCount();//获取主持人和发言人总数量
			
			//判断当前下拉框中的值是否大于发言人和主持人总数
			//如果当前下拉框中的值小于发言人和主持人总数，判断当前的下拉框所有选项中是否存在发言人和主持人总数值
			//如果当前下拉框选项中存在发言人和主持人总数值，将发言人和主持人总数值赋于当前下拉框
			//如果不存在，获取主持人和发言人总数，从当前下拉框中获取一个最小且大于主持人和发言人总数的值
			if(v<MAINSPEAKERSARR.length+1) {
				if(v<vm.speakerCount) {
					$("#"+selectId).val(this.getSuitCount(MAINSPEAKERSARR.length+1));
				} else {
					for(var i=0; i<MAINSPEAKERSARR.length; ) {
						if(MAINSPEAKERSARR[i]=="") {
							MAINSPEAKERSARR.splice(i, 1);
						} else {
							i++
						}
					}
				}
			}
			
			var data = {
				type: type,
				num: $("#"+selectId).val()
			};
			setScreenOptions(data.num, data.type);
			COCO.callAll("setScreenOptions", data.num, data.type);
			changeLayout();
			COCO.callAll("changeLayout");
			this.updateFrames(data, "type");
			sl.resize();
			COCO.callAll("sl.resize");
		},
		"changeScreenCount": function(_select, type) {
			if(type!=SCREEN_SET_TYPE) return ;
			var data = {
				"type": type,
				"num": $(_select).val()
			}
			var vm = this.getCount();//计算当前发言人和主持人总数
			
			//如果当前发言人和主持人总数大于当前所选择画面个数，那么提示画面个数不能小于发言人各主持人总数，并且将原值赋于当前下拉框
			if(data.num<MAINSPEAKERSARR.length+1) {
				if(data.num<vm.speakerCount) {
					Win.alert("画面个数不能小于发言人和主持人总数");
					$(_select).val(SCREEN_COUNT);
					return ;
				} else {
					for(var i=0; i<MAINSPEAKERSARR.length; ) {
						if(MAINSPEAKERSARR[i]=="") {
							MAINSPEAKERSARR.splice(i, 1);
						} else {
							i++
						}
					}
				}
			}
			
			setScreenOptions(data.num, data.type);
			COCO.callAll("setScreenOptions", SCREEN_COUNT, SCREEN_SET_TYPE);
			changeLayout();
			COCO.callAll("changeLayout");
			this.updateFrames(data, "count", (vm.lastSpeaker>data.num)?true:false);
			sl.resize();
			COCO.callAll("sl.resize");
		},
		"getSuitCount": function(num) {
			var list1 = [1, 2, 4, 6, 9];
			var list2 = [1, 3, 6, 9];
			if("same"!=SCREEN_SET_TYPE) {
				if($.inArray(num, list1)!=-1) return num;
				else {
					for(var i=0, len=list1.length; i<len; i++) {
						if(num<list1[i]) {
							return list1[i];
						}
					}
				}
			} else {
				if($.inArray(num, list2)) return num;
				else {
					for(var i=0, len=list2.length; i<len; i++) {
						if(num<list2[i]) {
							return list2[i];
						}
					}
				}
			}
		},
		"getCount": function() {//计算发言人和主持人总数，以及最后一个发言人的位置
			var vm = {
					"lastSpeaker": 0,
					"speakerCount" : 1,
					"blockCount": 0
			}
			for(var i=0, len=MAINSPEAKERSARR.length; i<len; i++) {
				if(MAINSPEAKERSARR[i]!="") {
					vm.lastSpeaker = i+2;
					vm.speakerCount++;
				} else {
					vm.blockCount++;
				}
			}
			return vm;
		},
		"updateFrames": function(data, type) {
			var f =  arguments[2] || false;
			$.post(ROOT+"/meeting/updateFramesOrder.do", {'speakers':MAINSPEAKERSARR.join(",")}, function(e) {
				if("type"==type || f) {
					location.reload();
					COCO.callAll("location.reload");
				}
			});
			$.post(ROOT+"/meeting/updateFrames.do",data);
		}
	};
})(jQuery);

function setScreenOptions() {
	SCREEN_COUNT = arguments[0];
	SCREEN_SET_TYPE = arguments[1];
}