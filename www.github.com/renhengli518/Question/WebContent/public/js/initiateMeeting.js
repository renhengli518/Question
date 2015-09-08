	var checkVideoMeeting = 'N';
	var checkGroupPrepare = 'N';
	var checkInteractive = 'N';
	
	function getChild(pId,type,index) {
		var html = '';
		if(type == 'zs'){
			getSchoolByAreaId(pId, index);
			return;
		}
		$.post(ROOT+"/commons/getAreasAndLevelByParentId.do",{"parentId":pId},function(data){
			if (data && data.length > 0) {
				html += '<li class="fl"> <label class="fixed">&nbsp;'+data[0].levelName+'：</label><select class="selectArea'+index+' amxz_select2"><option data-type="all" value="'+pId+'">请选择</option>';
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
			html += '<li class="fl"> <label class="fixed">学校：</label><select data-areaid="'+areaId+'" class=" amxz_select2 selectSchool'+index+'"><option value="">请选择</option>';
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
		classroomName = '';
		if(checkVideoMeeting == 'Y') {
			if(index == 0) {
				classroomName = '主会场 :&nbsp;';
			} else {
				classroomName = '分会场 :&nbsp;';
			}
		} else if (checkGroupPrepare = 'Y') {
			if(index == 0) {
				classroomName = '主备室 :&nbsp;';
			} else {
				classroomName = '辅备室 :&nbsp;';
			}
		} else if (checkInteractive = 'Y') {
			if(index == 0) {
				classroomName = '主讲教室 :&nbsp;';
			} else {
				classroomName = '接收教室 :&nbsp;';
			}
		}
		
		var html2 = ' <li class="fl"><a href="javascript:void(0);" class="checkAppId'+index+'"><label class="fixed" style="width:229px;text-align:center;">预约状况 </label></a></li>';
		$(".select-school"+index).append(html2);
		$.post(ROOT+"/commons/getClassroomBySchoolId.do",{"schoolId":schoolId, "checkVideoMeeting":checkVideoMeeting, "checkGroupPrepare":checkGroupPrepare, "checkInteractive":checkInteractive},function(data){
			var html = '<li class="fl"><label class="fixed">'+classroomName+'</label><select class=" amxz_select2 selectClassroom'+index+'"><option value="">请选择</option>';
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
			$("#members"+index).html("");
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
			 $("#members"+index).html("");
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
			Win.open({
				mask:true,
				id:"checkApp",
				title : "预约状况",
				width : 550,
				height : 550,
				url : ROOT+"/meetingCommon/checkApp.html?schoolId="+schoolId+"&schoolName="+schoolName+"&appTime="+appTime
			});
		});
	}
	
	function chooseSingleMember(index){
		var title = '';
		if(checkVideoMeeting == 'Y') {
			title = '选择主讲人';
		} else if (checkGroupPrepare == 'Y') {
			title = '选择主备教师';
		}
		chooseMember(index, 'Y', title);
	}
	
	function chooseMulMember(index) {
		chooseMember(index, 'N', '选择参会者');
	}
	
	function chooseMember(index, isSingle, title) {
		var areaId = $("#areaId"+index).val();
		var schoolId = $("#schoolId"+index).val();
		
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
			url : ROOT+"/meetingCommon/chooseMember.html?areaId="+areaId+"&schoolId="+schoolId+"&index="+index+"&selectedMemberId="+selectedMemberId+"&isSingle="+isSingle
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
						html += '<li class="fl"> <label>'+data[0].levelName+'：</label><select id="'+curValue+index+'" class="selectArea'+index+' "><option data-type="all" value="'+pId+'">请选择</option>';
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
				   html += '<li class="fl"> <label>学校：</label><select data-areaid="'+areaId+'" class=" selectSchool'+index+'"><option value="">请选择</option>';
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
	

