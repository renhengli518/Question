
//年级活动分布
function showActive1(data){
		$('#statistics1').highcharts({
			chart: {
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: false
			},
			title: {
				text: '学科课程数'
			},
			credits: {
				enabled:false
			},
			tooltip: {
				pointFormat: '{series.name}: <b>{point.y}</b>'
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: true,
						color: '#000000',
						connectorColor: '#000000',
						format: '<b>{point.name}</b>: {point.percentage:.0f}%'
					},
					showInLegend: true
				}
			},
			lang: {
	            noData: "抱歉，未查询到相关记录。"
	        },
	        noData: {
	            style: {
	                fontWeight: 'bold',
	                fontSize: '15px',
	                color: '#303030'
	            }
	        },
			series: [{
				type: 'pie',
				name: '课程数',
				data: data
			}]
		});
}

//学科活动分布
function showActive4(data){
	//if(data.subjectStatistics.length>0){
	$('#statistics4').highcharts({
		 chart: {
             plotBackgroundColor: null,
             plotBorderWidth: null,
             plotShadow: false
         },
         title: {
             text: '学科活动分布'
         },
         credits: {
	          enabled:false
		},
         tooltip: {
     	    pointFormat: '{series.name}: <b>{point.y}</b>'
         },
         plotOptions: {
             pie: {
                 allowPointSelect: true,
                 cursor: 'pointer',
                 dataLabels: {
                     enabled: true,
                     color: '#000000',
                     connectorColor: '#000000',
                     format: '<b>{point.name}</b>: {point.percentage:.0f}%'
                 },
                 showInLegend: true
             }
         },
         lang: {
	            noData: "抱歉，未查询到相关记录。"
	        },
	        noData: {
	            style: {
	                fontWeight: 'bold',
	                fontSize: '15px',
	                color: '#303030'
	            }
	        },
         series: [{
             type: 'pie',
             name: '活动数',
             data: data.subjectStatistics
         }]
     });
	/*}else{
		$('#statistics4').html("");
	}*/
}

//学校top10
function showActive5(data){
	$("#schoolTop").html("");
	var schoolTop = data.schoolTop;
	var html = '';
	for(var i=0;i<schoolTop.length;i++){
		html += '<tr>';
		html += '<td>'+(i+1)+'</td>';
		html += '<td>'+schoolTop[i].schoolName+'</td>';
		html += '<td>'+schoolTop[i].sum+'</td>';
		html += '</tr>';
	}
	$("#schoolTop").append(html);
}

//老师top10
function showActive6(data){
	$("#teacherTop").html("");
	var teacherTop = data.teacherTop;
	var html = '';
	for(var i=0;i<teacherTop.length;i++){
		html += '<tr>';
		html += '<td>'+(i+1)+'</td>';
		html += '<td>'+teacherTop[i].teaName+'</td>';
		html += '<td>'+teacherTop[i].schoolName+'</td>';
		html += '<td>'+teacherTop[i].sum+'</td>';
		html += '</tr>';
	}
	$("#teacherTop").append(html);
}
