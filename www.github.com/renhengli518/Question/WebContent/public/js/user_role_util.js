//将form表单中的数据转换为json字符串格式
function dataToJsonStr(formId) {
	var fid = "#" + formId;
	var str = $(fid).serialize();
	str = decodeURIComponent(str, true);
	str = str.replace(/&/g, "','");
	str = str.replace(/=/g, "':'");
	return "{'" + str + "'}";
	// str = "({'" + str + "'})";
	// return eval(str);
}

//将form表单中的数据转换为json格式
function dataToJson(formId) {
	var fid = "#" + formId;
	var str = $(fid).serialize();
	str = decodeURIComponent(str, true);
	str = str.replace(/&/g, "','");
	str = str.replace(/=/g, "':'");
	str = "({'" + str + "'})";
	return eval(str);
}

function transferNull(str) {
	if (str) {
		if (str == null || str == 'null' || str == '') {
			return '无';
		}
		return str;
	} else {
		return '无';
	}
}

function getState(locked) {
	if ('Y' == locked) {
		return '关闭';
	} else {
		return '开启';
	}
}