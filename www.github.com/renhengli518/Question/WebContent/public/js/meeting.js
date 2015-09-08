	var checkVideoMeeting = 'N';
	var checkGroupPrepare = 'N';
	var checkInteractive = 'N';
	
	var CAN_TRANS_TYPE="*.pdf;*.doc;*.ppt;*.docx;*.pptx;*.xls;*.xlsx;";
	CAN_TRANS_TYPE = CAN_TRANS_TYPE + CAN_TRANS_TYPE.toUpperCase();
	var checkTransDocTimer = new Array();
	
	function getChild(pId,type,index) {
		var html = '';
		if(type == 'zs'){
			getSchoolByAreaId(pId, index);
			return;
		}
		$.post(ROOT+"/commons/getAreasAndLevelByParentId.do",{"parentId":pId},function(data){
			if (data && data.length > 0) {
				html += '<li class="fl" style="margin-top:10px;"> <label>'+data[0].levelName+'：</label><select class="selectArea'+index+' amxz_select2 w160"><option data-type="all" value="'+pId+'">请选择</option>';
				$.each(data, function () {
					html += '<option data-type="normal" value="'+this.baseAreaId+'">'+this.areaName+'</option>';
				});
				
				if(pId){
					$.post(ROOT+"/commons/getAreaById.do",{"id":pId},function(datazs){
						if(datazs.hasDirectlySchool == 0){
							html += '</select></li>';
						} else {
							html += '<option data-type="zs" value="'+datazs.baseAreaId+'">直属校</option>';
						}
						$(".select-area"+index).append(html);
					},"json");
				}else{
					html += '</select></li>';
					$(".select-area"+index).append(html);
				}
			}else{
				getSchoolByAreaId(pId, index);
			}
		},"json");
	};
	
	function getSchoolByAreaId(areaId, index){
		var html = '';
		$.post(ROOT+"/commons/getSchoolByAreaId.do",{"areaId":areaId},function(data){
			html += '<li class="fl"> <label>学校：</label><select data-areaid="'+areaId+'" class="w160 amxz_select2 selectSchool'+index+'"><option value="">请选择</option>';
			$.each(data,function(){
				html += '<option value="'+this.id+'">'+this.name+'</option>';
			});
			html += '</select></li>';
			$(".select-school"+index).append(html);
		},"json");
	}
	
	function getClassroomBySchoolId(schoolId, index) {
		
		if(schoolId == '') {
			return;
		} 
		var interactRoomType = '';
		if(checkInteractive == 'Y') {
			var placeType = $("#placeType"+index).val();
			interactRoomType = placeType;
			if(placeType == 'JOIN') {
				return;
			}
		}
		classroomName = '';
		if(checkVideoMeeting == 'Y') {
			if(index == 0) {
				classroomName = '主会场 :&nbsp;';
			} else {
				classroomName = '分会场 :&nbsp;';
			}
		} else if (checkGroupPrepare == 'Y') {
			if(index == 0) {
				classroomName = '主备室 :&nbsp;';
			} else {
				classroomName = '辅备室 :&nbsp;';
			}
		} else if (checkInteractive == 'Y') {
			if(index == 0) {
				classroomName = '主讲教室 :&nbsp;';
			} else {
				classroomName = '接收教室 :&nbsp;';
			}
		}
		
		var html = ' <li class="fl"><a href="javascript:void(0);" class="checkAppId'+index+' green">预约状况</a></li>';
		$.post(ROOT+"/commons/getClassroomBySchoolId.do",{"schoolId":schoolId, "checkVideoMeeting":checkVideoMeeting, "checkGroupPrepare":checkGroupPrepare, "checkInteractive":checkInteractive, "interactRoomType" : interactRoomType},function(data){
			html += '<li><label>'+classroomName+'</label><select class="w160 amxz_select2 selectClassroom'+index+'"><option value="">请选择</option>';
			$.each(data,function(){
				html += '<option value="'+this.id+'">'+this.name+'</option>';
			});
			html += '</select></li>';
			$(".select-school"+index).append(html);
		},"json");
	}
	
	function attachChangeEvent(index) {
		$('.select-area'+index).on('change', '.selectArea'+index, function () {
			
			var areaText = $(".selectArea"+index+" option:selected").text();
			
			$("#areaId"+index).val($(this).val());
			//$("#areaName"+index).val(areaText);
			$("#schoolId"+index).val("");
			$("#schoolName"+index).val("");
			$("#classroomId"+index).val("");
			$("#classroomName"+index).val("");
			$("#singleMember"+index).html("");
			$("#singleMemberId"+index).val("");
			$("#members"+index).html("");
			$("#memberId"+index).val("");
			
			$(this).parent().nextAll("li").remove();
			$(".select-school"+index).html("");
			var type = $(this).find("option:selected").attr("data-type");
			
			if(type != 'zs') {//直属校不显示
				$("#areaName"+index).val(areaText);
			}
			if(type != 'all'){
				getChild($(this).val(),type,index);
			}
		});
		
		$('.select-school'+index).on('change', '.selectSchool'+index, function () {
			 var schoolId = $(this).val();
			 var schoolText = $(".selectSchool"+index+" option:selected").text();
			 $("#schoolId"+index).val(schoolId);
			 $("#schoolName"+index).val(schoolText);
			 //清空老师
			 $("#classroomId"+index).val("");
			 $("#classroomName"+index).val("");
			 
			 $("#singleMember"+index).html("");
			 $("#singleMemberId"+index).val("");
			 $("#members"+index).html("");
			 $("#memberId"+index).val("");
			 $(this).parent().nextAll("li").remove();
			 
			 getClassroomBySchoolId(schoolId, index);
		});
		
		$('.select-school'+index).on('change', '.selectClassroom'+index, function () {
			 var classroomId = $(this).val();
			 var classroomText = $(".selectClassroom"+index+" option:selected").text();
			 $("#classroomId"+index).val(classroomId);
			 $("#classroomName"+index).val(classroomText);
		});
		
		$('.select-school'+index).on('click', '.checkAppId'+index, function () {
			var beginTime = $("#beginTime").val();
			var endTime = $("#endTime").val();
			var appTime = '';
			if($.trim(beginTime) != '' || $.trim(endTime) != '')  {
				appTime = beginTime + ' 至  ' + endTime;
			}
			var schoolId = $(".selectSchool"+index).val();
			var schoolName = encodeURIComponent($(".selectSchool"+index+" option:selected").text());
			var interactRoomType = '';
			if(checkInteractive == 'Y') {
				if(index == 0) {
					interactRoomType = 'MAIN';
				} else {
					interactRoomType = 'RECEIVE';
				}
			}
			Win.open({
				mask:true,
				id:"checkApp",
				title : "预约状况",
				width : 550,
				height : 820,
				url : ROOT+"/meetingCommon/checkApp.html?schoolId="+schoolId+"&schoolName="+schoolName+"&appTime="+appTime+"&checkVideoMeeting="+checkVideoMeeting+"&checkGroupPrepare="+checkGroupPrepare+"&checkInteractive="+checkInteractive+"&interactRoomType="+interactRoomType
			});
		});
	}
	
	function chooseSingleMember(index, teaOnly){
		var title = '';
		if(checkVideoMeeting == 'Y') {
			title = '选择主讲人';
		} else if (checkGroupPrepare == 'Y') {
			title = '选择主备教师';
		} else if (checkInteractive == 'Y') {
			title = '选择教师';
		}
		
		chooseMember(index, 'Y', title, teaOnly);
	}
	
	function chooseMulMember(index, teaOnly) {
		var title = '选择参会者';
		if(checkInteractive == 'Y') {
			title = '选择听课端教师';
		}
		
		chooseMember(index, 'N', title, teaOnly);
	}
	
	function chooseMember(index, isSingle, title, teaOnly) {
		var areaId = $("#areaId"+index).val();
		var schoolId = $("#schoolId"+index).val();
		var isTea = 'N';
		if(teaOnly) {
			isTea = 'Y';
		}
		
		var selectedMemberId = '';
		if(isSingle == 'Y') {
			selectedMemberId = $("#singleMemberId"+index).val();
		} else {
			selectedMemberId = $("#memberId"+index).val();
		}
		
		
		if(areaId == ''){
			Win.alert("请选择地区");
			return;
		}
		
		Win.open({
			mask:true,
			id:"chooseMember",
			title : title,
			width : 550,
			height : 550,
			url : ROOT+"/meetingCommon/chooseMember.html?areaId="+areaId+"&schoolId="+schoolId+"&index="+index+"&selectedMemberId="+selectedMemberId+"&isSingle="+isSingle+"&isTea="+isTea
		});
	}
	
	//获取所有年级(如果有baseClasslevelId则选中)
	function getAllClasslevel(baseClasslevelId) {
		$.get(ROOT+"/commons/getAllClasslevels.do", function(result){
			result.unshift({"id":"", "name":"请选择"});
			$.each(result, function(index, json){
				$("#classlevelSelect").append("<option value='" + json.id + "'>" + json.name + "</option>");
			});
			if(baseClasslevelId) {
				$("#classlevelSelect").val(baseClasslevelId);
			}
		}, "json");
	}

	//年级改变获得学科
	function onClasslevelChange() {
		var classLevelId = $("#classlevelSelect").val();
		getSubjectByClasslevelId(classLevelId);
		
	}
	
	//根据年级获得学科(如果有baseSubjectId则选中)
	function getSubjectByClasslevelId(baseClasslevelId, baseSubjectId) {
		$("#subjectSelect").empty();
		$("#subjectSelect").append('<option value="">请选择</option>');
		
		if(baseClasslevelId != '') {
			$.get(ROOT+"/commons/getSubjectByClasslevelId.do",{"classLevelId":baseClasslevelId}, function(result){
				$.each(result, function(index, json){
					$("#subjectSelect").append("<option value='" + json.id + "'>" + json.name + "</option>");
				});
				if(baseSubjectId) {
					$("#subjectSelect").val(baseSubjectId);
				}
			}, "json");
		}
	}
	
	function getChildSyn(pId,type,index,curValue) {
		var html = '';
		if(type == 'zs'){
			getSchoolByAreaId(pId, index);
			return;
		}
		$.ajax({
			   type: "get",
			   url:ROOT+"/commons/getAreasAndLevelByParentId.do?parentId="+pId,
			   async:false,
			   dataType:"json",
			   success: function(data){
				   if (data && data.length > 0) {
						html += '<li class="fl" style="margin-top:10px;"> <label>'+data[0].levelName+'：</label><select id="'+curValue+index+'" class="selectArea'+index+' w160"><option data-type="all" value="'+pId+'">请选择</option>';
						$.each(data, function () {
							html += '<option data-type="normal" value="'+this.baseAreaId+'">'+this.areaName+'</option>';
						});
						
						if(pId){
							$.ajax({
								   type: "get",
								   url:ROOT+"/commons/getAreaById.do?id="+pId,
								   async:false,
								   dataType:"json",
								   success: function(datazs){
									   if(datazs.hasDirectlySchool == 0){
											html += '</select></li>';
										} else {
											html += '<option data-type="zs" value="'+datazs.baseAreaId+'">直属校</option>';
										}
										$(".select-area"+index).append(html);
								   }
							});
						}else{
							html += '</select></li>';
							$(".select-area"+index).append(html);
						}
						
						if(curValue) {
							$("#"+curValue+index).val(curValue);
							var areaText = $(".selectArea"+index+" option:selected").text();
							
							$("#areaId"+index).val(curValue);
							$("#areaName"+index).val(areaText);
						}
					}else{
						getSchoolByAreaId(pId, index);
					}
			   }
		});
		
	};
	
	function getSchoolByAreaIdSyn(areaId, index, curValue){
		var html = '';
		$.ajax({
			   type: "get",
			   url:ROOT+"/commons/getSchoolByAreaId.do?areaId="+areaId,
			   async:false,
			   dataType:"json",
			   success: function(data){
				   html += '<li class="fl"> <label>学校：</label><select data-areaid="'+areaId+'" class="w160 selectSchool'+index+'"><option value="">请选择</option>';
					$.each(data,function(){
						html += '<option value="'+this.id+'">'+this.name+'</option>';
					});
					html += '</select></li>';
					$(".select-school"+index).append(html);
					if(curValue) {
						$(".selectSchool"+index).val(curValue);
						 var schoolText = $(".selectSchool"+index+" option:selected").text();
						 $("#schoolId"+index).val(curValue);
						 $("#schoolName"+index).val(schoolText);
					}
			   }
		});
	}
	
	//点击星星打分
	function clickStar(cur) {
		var score = parseInt($(cur).attr("ratevalue"))/10;
		var meetingId = $("#meetingId").val();
		$.post(ROOT+"/meetingCommon/scoreByStar.do",{"meetingId":meetingId,"score":score},function(result){
			if(result.result) {
				Win.alert("评分成功,您的评分是"+score+"分");
				$(cur).addClass("disabled");
				$("#myscoreId").html(score+"分");
			} else {
				Win.alert(result.message);
			}
			
		},"json");
	}
	
	//点击爱心打分
	function clickAgree() {
		var num = $.trim($(".agreeNum").html());
		var meetingId = $("#meetingId").val();
		
		$.post(ROOT+"/meetingCommon/addAgree.do",{"meetingId":meetingId},function(result){
			if(result.result) {
				Win.alert("投票成功!");
				if(num == '') {
					num = 0;
				}
				$(".agreeNum").html(parseInt(num) + 1);
			} else {
				Win.alert(result.message);
			}
			
		},"json");
	}
	
	var commentSplit;
    function getComment() {
  	  var url = ROOT + "/meetingCommon/getComment.do";
  	  var meetingId = $("#meetingId").val();
  	  var data = {"meetingId" : meetingId};
  	  if(commentSplit == null) {
  		  commentSplit = new SplitPage({
    		    node : $id("commentPageNav"),
    		    url : url,
    		    data : data,
    		    count : 10,
    		    callback : showComment,
    		    type : 'post' //支持post,get,及jsonp跨站
    		});
  	  } else {
  		  commentSplit.search(url, data);
  	  }
  	 
    }
    
    function showComment(data,total) {
    	$(".commentCount").html(total);
    	var html = '';
    	var liLen = '900px';
    	if(checkVideoMeeting == 'Y') {
    		liLen = '1126px';
    	}
    	var userCenterHost = $("#userCenterHost").val();
    	$.each(data, function(index,json) {
    		html += ' <li style="width:'+liLen+';"> ' +
                '<label class="text"><a class="avatar mr10" href="'+userCenterHost+'/toUserIndex/'+json.baseUserId+'.html" target="_blank"><img width="80px" src="'+ROOT+'/images/'+json.headPic+'"></a></label>' +  
                '<span class="cont"><label class="cont_teacher"><a class="avatar mr10 green" href="'+userCenterHost+'/toUserIndex/'+json.baseUserId+'.html" target="_blank">'+json.realName+'</a></label><label class="cont_timer">'+json.strCreatetime+'</label>' +
                  '<p style="margin-left:6px;">'+json.content+'</p>' +
                '</span>' +
              '</li> ';
    	});
    	if(html == '') {
    		html = '<li style="width:'+liLen+';text-align:center;">无评论记录!</li>';
    	}
    	$("#commentbody").html(html);
    }
    
    var chattingSplit;
    function getChatting() {
  	  var url = ROOT + "/meetingCommon/getChatting.do";
  	  var meetingId = $("#meetingId").val();
  	  var data = {"meetingId" : meetingId};
  	  if(chattingSplit == null) {
  		chattingSplit = new SplitPage({
    		    node : $id("chattingPageNav"),
    		    url : url,
    		    data : data,
    		    count : 10,
    		    callback : showChatting,
    		    type : 'post' //支持post,get,及jsonp跨站
    		});
  	  } else {
  		chattingSplit.search(url, data);
  	  }
  	 
    }
    
    function showChatting(data,total) {
    	var html = '';
    	var createUserFlag = $("#createUserFlag").val();
    	var liLen = '900px';
    	if(checkVideoMeeting == 'Y') {
    		liLen = '1126px';
    	}
    	$.each(data, function(index,json) {
    		
    		var roomName = json.roomName;
    		var realName = json.realName;
    		var guestName = json.guestName;
    		var guestFlag = json.guestFlag;
    		var name = realName;
    		var place = json.schoolName;
    		if(guestFlag == 'Y') {
    			place = '来宾';
    			name = guestName;
    		} else if (roomName){
    			name = roomName;
    		}
    		
    		html += ' <li style="width:'+liLen+';"> '+
                '<span class="cont"><label class="cont_teacher">'+name+'</label><label class="cont_timer">'+json.strCreatetime+'</label>';
            if(createUserFlag == 'true') {
            	html += '<label class="cont_del"><a href="javascript:void(0);" onclick="deleteChatting(\''+json.meetChattingId+'\')">删除</a></label>';
            }    
            html += ' <p style="margin-left:6px;">'+json.content+'</p>'+
              '</span>'+
            '</li> '+
          '</ul>';
    	});
    	if(html == '') {
    		html = '<li style="width:'+liLen+';text-align:center;">无讨论记录!</li>';
    	}
    	$("#chattingbody").html(html);
    }
    
    function deleteChatting(meetChattingId) {
    	Win.confirm({id:"meetChattingId",html:"您确定要删除该聊天记录吗？"},function(){
			$.post(ROOT+"/meetingCommon/deleteChatting.do",{"meetChattingId":meetChattingId},function(data){
				if(data && data.result){
					Win.alert("删除成功！");
					getChatting();
				}else{
					Win.alert(data.message);
				}
			});
		},true);
    }
    
    function initCommentForm() {
    	 new BasicCheck({
				form: $id("commentform"),
				ajaxReq : function(){
					var comment = $("#comment").val();
			    	var meetingId = $("#meetingId").val();
					$.post(ROOT + '/meetingCommon/addComment.do', {"comment":comment, "meetingId":meetingId}, function(data){
						if(data.result){
							Win.alert("添加评论成功!");
							$("#comment").val('');
							$(".limitCount").html(150);
							getComment();
						}else{
							Win.alert(data.message);
						}
					}); 
				},
				warm: function warm(o, msg) {
					Win.alert(msg);
				}
		});
    }
    
    function initMeetDocUpload(){
     	  var params = {
     	        debug : 1,
     	        fileType : CAN_TRANS_TYPE + "*.jpg;*.gif;*.png;*.jpeg;*.bmp;",
     	        typeDesc : "office文档、图片、pdf文档",
     	        autoStart : false,
     	        sizeLimit: 20 * 1024 * 1024,
     	        server: encodeURIComponent(ROOT+"/file/upload.do?sizeLimit=20")
     		};
     	 	window.docUploadSwf = new UploadFile($id("docUploadCont"), "docUploadSwf", ROOT+"/public/upload/uploadFile.swf",params);
     	 	/* 注册一些自定义事件 */
     	 	docUploadSwf.uploadEvent.add("noticeTypeError",function(){
     	 		var data = arguments[0].message;
     	 	    Win.alert({width:350,height:150,html:"文件类型错误：只支持以下文件类型：" + data[1]});
     	 	});
     	 	docUploadSwf.uploadEvent.add("noticeSizeError",function(){
     	 		var limite =  arguments[0].message[1];				
       	 	    Win.alert("上传文件过大：限制大小：" + (limite/1024/1024).toFixed(0) +"MB");

     	 	});
     	 	docUploadSwf.uploadEvent.add("onSelect",function(){
     	 		var info = arguments[0].message;
     	         if(docUploadSwf.uploading){
     	         	Win.alert("正在上传文件，请稍候！");
     	         }else{
     	        	 docUploadSwf.startUpload();  //如未设置autoStart，此处正式调用上传,可传入server地址
     	         } 
     	 	});
     	 	docUploadSwf.uploadEvent.add("onOpen",function(){
     	 		var info = arguments[0].message[1];
     	 		var fileInfo = info.name.split('.');
				var fileext = fileInfo.pop();
     	 		var fileSize = parseInt($("#fileSize").val()) + 1;
     	 		$("#fileSize").val(fileSize);
     	 		var html = "<li id='fileLi"+fileSize+"' style='padding-left:30px;'>";
	  	   	 	html += "<span class='infoLabel'>";
	  	   	    html += "<b class='fileName mr10' title='"+info.name+"'>"+info.name+"</b>";
	  		   	//html += "<b class='fileSize mr10'>"+(info.size/1024/1024).toFixed(2)+"MB</b>";
	  		   	html += "<input type='hidden' id='fileext"+fileSize+"' name='fileext"+fileSize+"' value='"+fileext+"' />";
	  		   	html += "<input type='hidden' id='pageNum"+fileSize+"' name='pageNum"+fileSize+"' value='0' />";
	  		   	html += "<input type='hidden' id='fileRealName"+fileSize+"' name='fileRealName"+fileSize+"' value='"+info.name+"' />";
	  		   	html += "<input type='hidden' id='newFileName"+fileSize+"' name='newFileName"+fileSize+"' class='newFileName'/>";
	  			//html += "<input type='hidden' id='newFileSize"+fileSize+"' name='newFileSize"+fileSize+"' class='newFileSize' value='"+info.size+"'/>";
	  		   	html += "</span>&nbsp;";
	  		   	html += "<b class='progressBar mr10'>";
	  		   	html += "<em class='progressRate'>&nbsp;</em>";
	  		   	html += "</b>&nbsp;";
	  		   	html += "<span class='mr20'>已上传<b class='uploaded'>0%</b></span>";
	  		   	html += "&nbsp;<span class='uploadOperate'><a href='javascript:;' onclick='cancelProgress(docUploadSwf,this);'>取消上传</a></span>";
	  		   	html += '<span id="progress'+fileSize+'" style="display:none"></span>'+
	  					'<span id="cancelUploadBtn'+fileSize+'" style="display:none;margin-left:10px;"><a target="_self" href="javascript:;" onClick="cancleConvert('+fileSize+');return false;">取消转换</a></span>';
	  		   	html += "</li>";
  		   
     	 		$("#docUploadInfoBox").append(html);
  	   	});
     	 	docUploadSwf.uploadEvent.add("onCancel",function(){
     	 		var data = arguments[0].message;
     	 		console.log("取消选择框",data);
     	 	});
     	 	docUploadSwf.uploadEvent.add("onProgress",function(){
     	 		var fileSize = $("#fileSize").val();
	  	   	 	var c = arguments[0].message[1],
	   			t = arguments[0].message[2];
     			var myProgress = $class("progressRate",$id("fileLi"+fileSize)),
     				myUploaded = $class("uploaded",$id("fileLi"+fileSize));
     			myProgress[myProgress.length - 1].style.width = (c/t*100 >>0)+"%";
     			myUploaded[myUploaded.length - 1].innerHTML = (c/t*100 >>0)+"%";
     	 	});
     	 	docUploadSwf.uploadEvent.add("onComplete",function(){
     	 		var fileSize = $("#fileSize").val();
     	 		var data = arguments[0].message[1];
     			var myProgress = $class("progressRate",$id("fileLi"+fileSize)),
	  			myUploaded = $class("uploaded",$id("fileLi"+fileSize)),
	  			myUploadOperate = $class("uploadOperate",$id("fileLi"+fileSize));
     			var res = JSON.parse(data);
     			if(res.result){
     				myProgress[myProgress.length - 1].style.width = "100%";
  	   				myUploaded[myUploaded.length - 1].innerHTML = "100%";
  	   				var fileSize = $("#fileSize").val();
     				$("#docUploadInfoBox #newFileName"+fileSize).val(res.message);
     			} else {
     				myProgressBox[myProgressBox.length - 1].innerHTML = "上传失败！";			 		  
     			}		
     		    myUploadOperate[myUploadOperate.length - 1].innerHTML = "";
     		   
     		    convert(data, fileSize);
     	 	});
     	    docUploadSwf.uploadEvent.add("onFail",function(){
     	    var fileSize = $("#fileSize").val();
  	 		var myProgressBox = $class("progressBox",$id("fileLi"+fileSize)),
  	 			myUploadOperate = $class("uploadOperate",$id("fileLi"+fileSize));
	  	 		myProgressBox[myProgressBox.length - 1].innerHTML = "上传失败！";	
	  	 		myUploadOperate[myUploadOperate.length - 1].innerHTML = "<a href='javascript:;' onclick='removeFile(this);' class='delUploadFile'>删除</a>";
  	  	});
  	}
    
    function convert(a, index){
		var a = JSON.parse(a);
		if(a.result == false){
			Win.alert('文件类型与后缀名不符或者文件已损坏！');
			return;
		}
		
		var fileext = $("#fileext"+index).val();
		if(CAN_TRANS_TYPE.indexOf(fileext)>0){
			$("#progress"+index).show();
			$("#cancelUploadBtn"+index).show();
			var transferSize = parseInt($("#transferSize").val()) + 1;
			$("#transferSize").val(transferSize);
			var fileFullPath = a.message.split(",")[0],
				filePath = fileFullPath.replace("http://"+location.host+"/",""),
				realPath = filePath.replace("/0.jpg","."+fileext);
			//通知转换
			$.post(ROOT+"/meeting/doc/documentTrans.do",{fileName:a.message},function(a){
				if(a == "error"){
					cancleConvert(index);
				}else{
					checkTransDoc();
				}
			});
			//检测转换
			function checkTransDoc(){
				$.post(ROOT+"/meeting/doc/documentCheck.do",{fileName:a.message},function (t){
					if(t.length==2){
						if(t[0]){
							//$("#progress").html("已转换"+t[0]+" 页");
							$("#progress"+index).html("正在转换中");
						}else{
							$("#progress"+index).html("正在转换文档，可能需要1分钟左右，请耐心等待");
						}
						checkTransDocTimer[index] = setTimeout(function(){
							checkTransDoc();
						},1000);
					}else{
						//saveFileInfo(a,t[0]);
						myUploadOperate = $class("uploadOperate",$id("fileLi"+index));
						myUploadOperate[myUploadOperate.length - 1].innerHTML = "<a href='javascript:;' dir='doc' onclick='removeFile(this);' class='delUploadFile'>删除</a>";
						$("#progress"+index).hide();
						$("#cancelUploadBtn"+index).hide();
						var transferSize = parseInt($("#transferSize").val()) - 1;
						$("#transferSize").val(transferSize);
						$("#pageNum"+index).val(t[0]);
					}
				},"json");
			}
		}else{
			//saveFileInfo(a,0);
			myUploadOperate = $class("uploadOperate",$id("fileLi"+index));
			myUploadOperate[myUploadOperate.length - 1].innerHTML = "<a href='javascript:;' dir='doc' onclick='removeFile(this);' class='delUploadFile'>删除</a>";
			$("#progress"+index).hide();
			$("#cancelUploadBtn"+index).hide();
			var transferSize = parseInt($("#transferSize").val()) - 1;
			$("#transferSize").val(transferSize);
		}
	}
    
    function cancleConvert(index){
		clearTimeout(checkTransDocTimer[index]);
		myUploadOperate = $class("uploadOperate",$id("fileLi"+index));
		myUploadOperate[myUploadOperate.length - 1].innerHTML = "<a href='javascript:;' dir='doc' onclick='removeFile(this);' class='delUploadFile'>删除</a>";
		$("#fileLi"+index).remove();
		var transferSize = parseInt($("#transferSize").val()) - 1;
		$("#transferSize").val(transferSize);
	}
    
    function cancelProgress(progressObj,cancelBtn){
  	   progressObj.cancelUpload();
  	   $(cancelBtn).parent().parent().remove();
    }
    
    function removeFile(cur) {
    	 $(cur).parent().parent().remove();
    }
    
