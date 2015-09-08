$(function(){
	var $box = $('#category');
	var getChild = function (pId,type) {
		var html = '';
		if(type == 'zs'){
			getSchoolByAreaId(pId);
			return;
		}
		$.post(ROOT+"/commons/getAreasAndLevelByParentId.do",{"parentId":pId},function(data){
			if (data && data.length > 0) {
				html += '<span><label class="labelText">'+data[0].levelName+'：</label><select class="selectArea"><option data-type="all" value="'+pId+'">请选择</option>';
				$.each(data, function () {
					html += '<option data-type="normal" value="'+this.baseAreaId+'">'+this.areaName+'</option>';
				});
				if(pId){
					$.post(ROOT+"/commons/getAreaById.do",{"id":pId},function(datazs){
						if(datazs.hasDirectlySchool == 0){
							html += '</select></span>';
						} else {
							html += '<option data-type="zs" value="'+datazs.baseAreaId+'">直属校</option>';
						}
						$box.append(html);
					},"json");
				}else{
					html += '</select></span>';
					$box.append(html);
				}
			}else{
				getSchoolByAreaId(pId);
			}
		},"json");
	};
	
	
	if($box.hasClass('schedule')){
		$('#category').on('change', '.selectSchool', function () {
			var schoolId = $(this).val();
				$.post(ROOT+'/schedule/classRoomList.do',{'schoolId':schoolId},function(data){
					var html = '<option value="-1">请选择</option>';
					for(var i = 0,j = data.length; i<j; i++){
						html += '<option value="'+data[i].clsClassroomId+'">'+data[i].roomName+'</option>';
					}
					$("#classRoomId").html(html);
				},'json');
		});
	}
	
	if($box.hasClass('eva')){
		$('#category').on('change', '.selectSchool', function () {
			 var schoolId = $(this).val();
			 $("#schoolId").val(schoolId);
			 
			 //清空老师
			 $("#teaIds").val("");
			 $("#teaNames").val("");
			 $("#teas").html("");
		});
	}
	
	$('#category').on('change', '.selectArea', function () {
		$(this).parent().nextAll("span").remove();
		var type = $(this).find("option:selected").attr("data-type");
		if(type != 'all'){
			getChild($(this).val(),type);
		}
	});
	getChild(userAreaId);
	
	function getSchoolByAreaId(areaId){
		var html = '';
		$.post(ROOT+"/commons/getSchoolByAreaId.do",{"areaId":areaId},function(data){
			html += '<span><label class="labelText">学校：</label><select data-areaid="'+areaId+'" class="mr20 selectSchool"><option value="">请选择</option>';
			$.each(data,function(){
				html += '<option value="'+this.id+'">'+this.name+'</option>';
			});
			html += '</select></span>';
			$box.append(html);
		},"json");
	}
	
	
});

function getSearchHtml(){
	var $searchSel = $('#category').find("span:last select");
	var value = '';
	if($searchSel[0]){
		var searchId = $searchSel.val();
		if($searchSel.hasClass('selectArea')){
			value += '&searchId=' + $searchSel.val() + '&type=area';
		}else if($searchSel.hasClass('selectSchool')){
			if(searchId){
				value += '&searchId=' + $searchSel.val() + '&type=school';
			}else{
				value += '&searchId=' + $searchSel.attr("data-areaid") + '&type=schoolAll';
			}
		}
	}
	return value;
}

function initcategory( i ){
	var $box = $('#category'+i);
	var getChild = function (pId,type) {
		var html = '';
		if(type == 'zs'){
			getSchoolByAreaId(pId);
			return;
		}
		$.post(ROOT+"/commons/getAreasAndLevelByParentId.do",{"parentId":pId},function(data){
			if (data && data.length > 0) {
				html += '<span><label class="labelText">'+data[0].levelName+'：</label><select class="selectArea'+i+'"><option data-type="all" value="'+pId+'">请选择</option>';
				$.each(data, function () {
					html += '<option data-type="normal" value="'+this.baseAreaId+'">'+this.areaName+'</option>';
				});
				
				if(pId){
					$.post(ROOT+"/commons/getAreaById.do",{"id":pId},function(datazs){
						if(datazs.hasDirectlySchool == 0){
							html += '</select></span>';
						} else {
							html += '<option data-type="zs" value="'+datazs.baseAreaId+'">直属校</option>';
						}
						$box.append(html);
					},"json");
				}else{
					html += '</select></span>';
					$box.append(html);
				}
			}else{
				getSchoolByAreaId(pId);
			}
		},"json");
	};
	
	$('#category'+i).on('change', '.selectSchool'+i, function () {
		 var schoolId = $(this).val();
		 $("#schoolId"+i).val(schoolId);
		 //清空老师
		 $("#teaIds"+i).val("");
		 $("#teaNames"+i).val("");
		 $("#teas"+i).html("");
	});
	
	$('#category'+i).on('change', '.selectArea'+i, function () {
		$(this).parent().nextAll("span").remove();
		var type = $(this).find("option:selected").attr("data-type");
		if(type != 'all'){
			getChild($(this).val(),type);
		}
	});
	
	
	getChild(userAreaId);
	
	function getSchoolByAreaId(areaId){
		var html = '';
		$.post(ROOT+"/commons/getSchoolByAreaId.do",{"areaId":areaId},function(data){
			html += '<span><label class="labelText">学校：</label><select data-areaid="'+areaId+'" class="mr20 selectSchool'+i+'"><option value="">请选择</option>';
			$.each(data,function(){
				html += '<option value="'+this.id+'">'+this.name+'</option>';
			});
			html += '</select></span>';
			$box.append(html);
		},"json");
	}
	
}

