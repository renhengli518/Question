var remote = (function (undefined) {
		var callBackMap = {};
		var uuid = 1;
		var slice = Array.prototype.slice;
		return {
			call: function (fnName, p) {
				var args = slice.call(arguments, 0);
				var uid = uuid++;
				var needCallback = 0;
				if (args.length > 0 && $.isFunction(args[args.length-1])) {
					needCallback = 1;
					callBackMap[uid] = args.pop();
				}
				this.send('S', uid, needCallback, args);
			},
			send: function (opt, uid, needCallback, data) {
				/*COCO.send({
					to: "remote_admin_" + MID, 
					api:"remoteGet",
					type:'text', 
					opt: opt, 
					uid: uid, 
					needCallback: 
					needCallback, 
					data: JSON.stringify(data).replace(/([\u4E00-\uFA29]|[\uE7C7-\uE7F3])+/g, function (str) {
						return encodeURIComponent(str)
					})
				});
				COCO.send({
					to: "remote_admin", 
					api:"remoteGet", 
					type:'text', 
					opt: opt, 
					uid: uid, 
					needCallback: needCallback, 
					data: JSON.stringify(data).replace(/([\u4E00-\uFA29]|[\uE7C7-\uE7F3])+/g, function (str) {
						return encodeURIComponent(str)
					})
				});*/
				try {
					COCO.callOne("remote_admin_" + MID, "remote.get", opt, uid, needCallback, data);
				} catch(e) {}
				
				//COCO.callOne("remote_admin", "remote.get", opt, uid, needCallback, data);
			},
			get: function (opt, uid, needCallback, data) {
				//console.timeStamp();
				if (opt == 'S') {
					var fnName = data.shift();
					var res = director[fnName].apply(director, data);
					//console.timeStamp();
					if (needCallback == 1) {
						remote.send('B', uid, needCallback, res)
					}
				} else if (opt == "B") {
					callBackMap[uid].call(null, data);
					callBackMap[uid] = null;
				}
			}
		}
	})();
	
	var director = (function (undefined) {
		var Listener = util.Listener;
		var slice = Array.prototype.slice;
		var plugin;
		var rtmpUrl = "";
		var rtmpNames = {};
		var presetPos = {};
		var module = {};
		var _color2rgba = function (color) {
			return parseInt(color.replace('#', ''), 16);
		};
		var _rgba2color =  function (rgba) {
			if (rgba < 0) {
				rgba = 4294967296 + rgba; 
			}
			var str = '000000' + rgba.toString(16);
			return '#' + str.substr(-6);
		};
		
		
		var _director = {
			module: module,
			getMaxIndex: function (map) {
				var max = 0;
				for (var index in map) {
					if (index * 1 > max) {
						max = index * 1;
					}
				}
				return max+1;
			},
			delMap: function (info, replaceFn, delFn) {
				var tabNew = info[0];
				var tabOld = info[1];
				for (var i = 0, len = tabOld.length, len2 = tabNew.length;i< len; i++) {
					if (i > len2 - 1) {
						delFn(tabOld[i]);//删除tabOld[i]
					} else if (tabOld[i] != tabNew[i]) {
						replaceFn(tabNew[i], tabOld[i]);//取tabNew[i]设置tabOld[i]
					}
				}
			},
			getTabDelInfo: function (map, ids) {
				var tabOld = [];
				var tabNew = [];
				ids = ids.split(',');
				var m = {};
				$.each(ids, function () {
					m["" + this] = 1;
				})
				for (var key in map) {
					tabOld.push(key * 1);
					if (!m[key]) {
						tabNew.push(key * 1);
					}
				}
				tabOld.sort(function (a, b) {
					return a - b;
				});
				tabNew.sort(function (a, b) {
					return a - b;
				});
				return [tabNew, tabOld];
			},
			loginNotify: function (from) {//上线
				if (from.indexOf('remote_admin') == 0) {
					this.initPage();
				}
			},
			logoutNotify: function () {
			},
			isMain: function () {
				return true;
			},
			addModule: function (key, obj) {
				//this[key] = obj;
				module[key] = obj;
				if (obj.extendDirector) {
					obj.extendDirector(this);
				}
			},
			setPlugin: function () {
				plugin = $id("hdPlugin");
				if (ROLE == 0) {
					COCO.cocoEvent.add('linkDown',function(json){
						//director.logoutNotify2();
					});
					COCO.cocoEvent.add('linkup',function(){
						director.linkup();
					});
					COCO.cocoEvent.add('loginNotify', function(json){
						var message = json.message;
						director.loginNotify(message.from);
					});
					COCO.cocoEvent.add('logoutNotify', function(json){
						var message = json.message;
						director.logoutNotify(message.from);
					});
					COCO.cocoEvent.add('receiveAll', function(json){
						var data = json.message;
						if (data.api == "remoteGet") {
							remote.get(data.opt, data.uid, data.needCallback, JSON.parse(decodeURIComponent(data.data)));
						}
					});
					director.linkup();
				}
			},
			initPage: function (flag) {
				flag = flag || false;
				plugin = $id("hdPlugin");
								
				var self = this;
				(function () {					
					//logoData	
					var logoMap = {}; 
					var logoList = self.getLogoList();
					if (logoList !== "" && logoList !== ",") {
						var tab = logoList.split(',');
						for (var i = 0, len = tab.length;i< len; i++) {
							var index = tab[i];
							if (index !== "") {
								index = index * 1;
								logoMap[index*1] = self.logoInfo(index);
								//delete logoMap[index].path; 编辑的时候需要路径进行预览
							}
						}
					}
					var data = {
						logoData: {
							logoUseIndex: self.logo(),
							map: logoMap
						}	
					};
					console.log('logoData', data);
					remote.call('initPage', 'logo', data, LAST_CLASSROOM_ID == MID);
				})();
				
				
				
				(function () {			
					var headMap = {};
					var tmp;
					var movieHeadList = self.getMovieHeadList();
					if (movieHeadList !== "" && movieHeadList !== ",") {
						var tab = movieHeadList.split(',');
						for (var i = 0, len = tab.length;i< len; i++) {
							var index = tab[i];
							if (index !== "") {
								index = index * 1;
								tmp = self.movieHeadInfo(index);
								if (LAST_CLASSROOM_ID != MID && tmp.mode == 1) {
									self.delHeadInfo(index);
								} else {
									//delete tmp.path;//编辑的时候需要路径进行预览
									headMap[index] = tmp;
								}
							}
						}
					}
					//有问题
					var data = {
						headData: {
							headUseIndex: self.movieHead(),
							map: headMap
						}
					};
					remote.call('initPage', 'headend', data, LAST_CLASSROOM_ID == MID);
				})();
				
				
				(function () {
					var endMap = {};
					var tmp;
					var movieTailList = self.getMovieTailList();
					if (movieTailList !== "" && movieTailList !== ",") {
						var tab = movieTailList.split(',');
						for (var i = 0, len = tab.length;i< len; i++) {
							var index = tab[i];
							if (index !== "") {
								index = index * 1;
								tmp = self.movieTailInfo(index);
								if (LAST_CLASSROOM_ID != MID && tmp.mode == 1) {
									self.delTailInfo(index);
								} else {
									//delete tmp.path;//编辑的时候需要路径进行预览
									endMap[index] = tmp;
								}
							}
						}
					}
					var data = {
						endData: {
							endUseIndex: self.movieTail(),
							map: endMap
						}
					};
					remote.call('initPage', 'headend', data, LAST_CLASSROOM_ID == MID);
				})();
				
				
				(function () {
					//subtitle
					var subtitleMap = {};
					var subtitleList = self.getSubtitleList();
					if (subtitleList !== '' && subtitleList !== ',') {
						var tab = subtitleList.split(',');
						for (var i = 0, len = tab.length;i< len; i++) {
							var index = tab[i];
							if (index !== "") {
								index = index * 1;
								subtitleMap[index] = self.subtitleInfo(index);
							}
						}
					}
					var data = {
						subtitleData: {
							subtitleUseIndex: self.subtitle(),
							map: subtitleMap
						}
					};	
					console.log('subtitle', data);
					remote.call('initPage', 'subtitle', data, LAST_CLASSROOM_ID == MID);
				})();
				
				
				(function () {
					//subtitle
					var subtitleMap = {};
					var subtitleList = self.getSubtitleList();
					if (subtitleList !== '' && subtitleList !== ',') {
						var tab = subtitleList.split(',');
						for (var i = 0, len = tab.length;i< len; i++) {
							var index = tab[i];
							if (index !== "") {
								index = index * 1;
								subtitleMap[index] = self.subtitleInfo(index);
							}
						}
					}
					var data = {
						subtitleData: {
							subtitleUseIndex: self.subtitle(),
							map: subtitleMap
						}
					};	
					console.log('subtitle', data);
					remote.call('initPage', 'subtitle', data, LAST_CLASSROOM_ID == MID);
				})();
				
				
				
				
				(function () {
					//shotCut
					var data = JSON.parse(self.configString('shortCut')||"{}");
					remote.call('initPage', 'shortCut', {shortCut: data}, LAST_CLASSROOM_ID == MID);
				})();
				
				
				setTimeout(function () {
					remote.call('initPage', 'videoBar', module['videoBar'].getInitData(), LAST_CLASSROOM_ID == MID);
	
					var data = self.getPicModeData();
					if (flag) {
						var picModeData = data.picModeData;
						var videoMain = self.videoMain();
						self.videoMain(videoMain);//插件逻辑处理
						self.videoStitchMode(picModeData.picModeUseIndex);
						if (picModeData.picModeUseIndex == 1) {
							self.pipSource(videoMain, picModeData.pipMap);
						} else if (picModeData.picModeUseIndex == 2) {
							self.popSource(videoMain, picModeData.popMap);
						}
					}
					remote.call('initPage', 'picMode', data, LAST_CLASSROOM_ID == MID);
					
					
					var data = {};
					data.recordMode = self.recordMode();
					data.lessonMode = lessonMode.getCurrMode() || 0;
					for (var key in module) {
						if (key != "videoBar") {
							var obj = module[key];
							if (obj.initPage) {
								obj.initPage();
							}
							$.extend(data, obj.getInitData());
						}
					}				
					var sceneStyle = self.sceneStyle();
					data.sceneData = {
						sceneSelectIndex: sceneStyle,
						sceneUseIndex: sceneStyle
					};
					data.pageMode = self.pageMode();
					remote.call('initPage', 'all', data, LAST_CLASSROOM_ID == MID);
					LAST_CLASSROOM_ID = MID;
				}, 1500);
			},
			bindAttribute: function (keyStr) {
				var self = this;
				$.each(keyStr.split(','), function () {
				  var key = this;
					self[key] = function (p) {
						if (p === undefined) {
							return plugin[key];
						} else {
							plugin[key] = p;
						}
					}
				});
			},
			getMovieTailList: function () {
				return plugin.GetMovieTailList();
			},
			getMovieHeadList: function () {
				return plugin.GetMovieHeadList();
			},
			getPicModeData: function () {
				var self = this;
				var data = {};
				var cameraNum = self.cameraNum();
				var pipMap = {};
				var popMap = {};
				var pipNum = self.pipSourceNum();
				if (pipNum != cameraNum) {
					self.pipSourceNum(cameraNum);
				}
				var popNum = self.popSourceNum();
				if (popNum != cameraNum) {
					self.popSourceNum(cameraNum);
				}
				pipNum = popNum = cameraNum;
				for (var j = 1; j <= cameraNum; j++) {
					pipMap[j] = self.pipSource(j, pipNum-1);
					popMap[j] = self.popSource(j, popNum-1);
				}
				/*
				return {"picModeData":{
							"popMap":{
							"1":[3,5,2,4],
							"2":[1,3,4,5],
							"3":[1,2,4,5],
							"4":[3,2,1,5],
							"5":[3,4,1,2]
						},
						"pipNum":5,
						pipPos: 1,
						"picModeUseIndex":1,
						"pipMap":{"1":[3,4,2,5],"2":[1,-1,-1,4],"3":[1,-1,-1,2],"4":[1,-1,-1,2],"5":[2,-1,-1,1]},
						popPos: 1,
						"popNum":5}};*/
				return {
					picModeData: {
						picModeUseIndex: self.videoStitchMode(),
						cameraNum: cameraNum,
						pipPos: self.pipSourcePostion(),
						pipNum: pipNum,
						pipMap: pipMap,
						popPos: self.popSourcePostion(),
						popNum: popNum,
						popMap: popMap
					}
				}
			},
			configString: function (key, str) {
				if (str === undefined) {
					return plugin.GetShortCutKey(key);
				} else {
					plugin.SetShortCutKey(key, str);
				}
			},
			//type:0图片/1视频  isEnable:启用/不启用  index:0默认/自定义1/自定义2/...
			movieHead: function (index) {
				if (index === undefined) {
					return plugin.GetMovieHead();
				} else {
					plugin.SetMovieHead(index);
				}
			},
			//type:0图片/1视频  seconds:秒  path:文件名  index:0默认/1自定义2自定义/...
			movieHeadInfo: function  (index, p) {
				if (p === undefined) { 
					var seconds = plugin.GetMovieHeadShowTime(index);
					if (seconds < 0) {
						seconds = 0;
					}
					return {
						mode: plugin.GetMovieHeadMode(index),
						title: plugin.GetMovieHeadTitle(index),
						type: plugin.GetMovieHeadType(index),
						seconds: seconds,
						path:  plugin.GetMovieHeadFilePath(index).replace(/\\/g, "\\\\"),
						outputPath:  plugin.GetMovieHeadOutputFilePath(index).replace(/\\/g, "\\\\"),
						state: 1
					}					
				} else {
					plugin.SetMovieHeadInfo(index, p.mode, p.title, p.type, p.seconds, p.path.replace(/\\+/g, "\\"));
				}
			},
			movieHeadInfo2: function  (index, p) {
				plugin.SetMovieHeadInfo2(index, p.mode, p.title, p.type, p.seconds, p.path.replace(/\\+/g, "\\"));
			},
			movieEnd: function (index) {
				if (index === undefined) {
					return plugin.GetMovieTail();
				} else {
					plugin.SetMovieTail(index);
				}
			},
			movieTail: function (index) {
				if (index === undefined) {
					return plugin.GetMovieTail();
				} else {
					plugin.SetMovieTail(index);
				}
			},
			movieTailInfo: function  (index, p) {
				if (p === undefined) {  
					var seconds = plugin.GetMovieTailShowTime(index);
					if (seconds < 0) {
						seconds = 0;
					}
					return {
						mode: plugin.GetMovieTailMode(index),
						title: plugin.GetMovieTailTitle(index),
						type: plugin.GetMovieTailType(index),
						seconds: seconds,
						path:  plugin.GetMovieTailFilePath(index).replace(/\\/g, "\\\\"),
						outputPath:  plugin.GetMovieTailOutputFilePath(index).replace(/\\/g, "\\\\"),
						state: 1
					}					
				} else {
					plugin.SetMovieTailInfo(index, p.mode, p.title, p.type, p.seconds, p.path);
				}
			},
			movieTailInfo2: function  (index, p) {
				plugin.SetMovieTailInfo2(index, p.mode, p.title, p.type, p.seconds, p.path.replace(/\\+/g, "\\"));
			},
			delTailInfo: function (index) {
				return plugin.DelMovieTail(index*1);
			},
			delHeadInfo: function (index) {
				return plugin.DelMovieHead(index*1);
			},
			//台标
			logo: function  (index) {
				if (index === undefined) {
					return plugin.GetLogoIndex();
				} else {
					plugin.SetLogo(index);
				}
			},
			getLogoList: function () {
				return plugin.GetLogoList();
			},
			delLogoInfo: function (index) {
				plugin.DelLogoInfo(index*1);
			},
			logoInfo: function (index, p) {
				if (p === undefined) { 
					var pos = this.logoPostion(index);
					return {
						path: plugin.GetLogoPath(index).replace(/\\/g, "\\\\"),
						title: plugin.GetLogoTitle(index),
						pos: pos.pos,
						x: pos.x,
						y: pos.y
					}
				} else {
					plugin.SetLogoInfo(index, p.path, p.title);
					this.logoPostion(index, p)
				}
			},
			/*
			logoInfoPos: function (index, p, pos) {
				plugin.SetLogoInfo(index, p.path, p.title);
				this.logoPostion(index, pos);//****修改
			},*/
			logoPostion: function (index, p) {
				if (p === undefined) { 
					var res = plugin.GetLogoPostion(index).split(',');
					var posX = res[0], posY = res[1];
					if (posX < 0 || posX > 1920) {
						res[0] = 0;
					}
					if (posY < 0 || posY > 1080) {
						res[1] = 0;
					}
					return {
						x: res[0],
						y: res[1],
						pos: res[2]
					}
				} else {
					if (p.pos === undefined || p.pos == -1) {
						plugin.SetLogoPostion(index, -1, p.x*1, p.y*1);
					} else {
						plugin.SetLogoPostion(index, p.pos*1, 0, 0);
					}
				}
			},	
			//视频列表
			cameraNum: function () {
				return plugin.GetCameraNum();
			},
			cameraName: function (index) {
				return plugin.GetCameraName(index);
			},
			directorMode: function (mode) {
				var map = {"3": "autoManual","2": "manual", "1": 'auto', 'auto': 1, "manual": 2, "autoManual": 3};
				if (mode === undefined) {
					return map[plugin.directorMode];
				} else {
					plugin.directorMode = map[mode];
				}
			},
			remoteRtmpUrl: function (url) {
				if (url === undefined) {
					return rtmpUrl;
				} else {
					rtmpUrl = url;
					plugin.SetRemoteRtmpUrl(url);
				}
			},
			f2fVideoHighlight: function (p) {
				if (p === undefined) {
					return plugin.GetF2FVideoHighlight();
				} else {
					plugin.SetF2FVideoHighlight(p);
				}
			},
			f2fVideoIndex: function (p) {
				plugin.SetF2FVideoIndex(p);
			},
			remoteRtmpStream: function (index, name) {
				if (name === undefined) {
					return rtmpNames[index];
				} else {
					rtmpNames[index] = name;
					plugin.SetRemoteRtmpStream(index, name);
				}
			},
			videoRecord: function (index, isRecord) {
				if (isRecord === undefined) {
					return plugin.GetVideoRecord(index);
				} else {
					plugin.SetVideoRecord(index, isRecord);
				}
			},
			videoBitrate: function (index, bitrate) {
				if (bitrate === undefined) {
					return plugin.GetVideoBitrate(index);
				} else {
					plugin.SetVideoBitrate(index, bitrate);
				}
			},
			
			subtitleFontColor: function (index, color) {
				if (color === undefined) {
					var color = plugin.GetSubtitleFontColor(index);
					if (color == 0 || color == -1) {
						this.subtitleFontColor(index, "#ff0000")
						return "#ff0000";
					} else {
						return _rgba2color(color);
					}
				} else {
					if (color == -1) {
						plugin.SetSubtitleFontColor(index, 0, 0);
					} else {
						plugin.SetSubtitleFontColor(index, 255, _color2rgba(color));
					}
				}
			},
			subtitleBackgroundColor: function (index, color) {
				if (color === undefined) {
					var color = plugin.GetSubtitleBackgroundColor(index);
					if (color == 0 || color == -1) {
						return -1;
					} else {
						return _rgba2color(color);
					}
				} else {
					if (color == -1) {
						plugin.SetSubtitleBackgroundColor(index, 0, 0);
					} else {
						plugin.SetSubtitleBackgroundColor(index, 255, _color2rgba(color));
					}
				}
			},
			//特效
			sceneStyle: function  (index) {
				if (index === undefined) {
					var res = plugin.GetSceneStyle();
					return (res==5?-1:res);
				} else {
					index = index*1;
					plugin.SetSceneStyle((index == -1?5: index));
				}
			},
			//字幕
			subtitle: function  (index) {
				if (index === undefined) {
					return plugin.GetSubtitleIndex();
				} else {
					plugin.SetSubtitle(index);
				}
			},
			subtitleFontStyle: function (index, p) {
				/*
					void SetFontStyle(int type,int value); //type:  0字体(宋体..幼圆..)  1字号(9..10..)  2字形(斜体..下划线..)
					//type:0  value：SONGTI = 0,   KAITI,   FANGSONGTI,   YOUYUAN,   HUAWENXIHEI,   HUAWENXINWEI,   HUAWENCAIYUN,   UNKNOWN
					//type:1  value：SIZE_8 = 0,   SIZE_9,   SIZE_10,   SIZE_11,   SIZE_12,   SIZE_14,   SIZE_16,   SIZE_18,   SIZE_20,   SIZE_24,   SIZE_36,   SIZE_72,   SIZE_UNKNOWN
					//type:2  value：NORMAL = 1,   ITALIC = 2,   UNDERLINE = 4,   ITALIC_UNDERLINE = 8,   UNKNOWN = 9
				*/
				if (p === undefined) {
					return {
						'subtitleFontFamily': plugin.GetFontStyle(index, 0),
						'subtitleFontSize': plugin.GetFontStyle(index, 1),
						'subtitleFontStyle': plugin.GetFontStyle(index, 2)
					}
				} else {
					var map = {'subtitleFontFamily': '0', 'subtitleFontSize': '1', 'subtitleFontStyle': '2',
							'fontFamily': '0', 'fontSize': '1', 'fontStyle': '2',
							};
					for (key in p) {
						if (key in map) {
							console.log('plugin.SetFontStyle', map[key]*1, p[key]*1);
							plugin.SetFontStyle(index, map[key]*1, p[key]*1);
						}
					}
				}
			},
			getSubtitleList: function () {
				return plugin.GetSubtitleList();
			},
			delSubtitleInfo: function (index) {
				plugin.DelSubtitle(index*1);
			},
			subtitleInfo: function (index, p) {
				if (p === undefined) {
					var pos = this.subtitlePostion(index);
					var scrollTimes = this.subtitleScrollTimes(index);
					if (scrollTimes < 0) {
						scrollTimes = 0;
					}
					var style = this.subtitleFontStyle(index);
					var scrollMode = this.subtitleScrollMode(index);
					//0横向不滚动  1横向右滚动  2横向向左滚动  3纵向不滚动  4纵向向上滚动 5纵向向下滚动					
					return {
						title: plugin.GetSubtitleTitle(index),
						desc: plugin.GetSubtitleDescription(index),
						pos: pos.pos,
						x: pos.x,
						y: pos.y,
						scrollTimes: scrollTimes,
						scrollDir: scrollMode.scrollDir,
						scrollMode: scrollMode.scrollMode,
						fontColor: this.subtitleFontColor(index),
						backgroundColor: this.subtitleBackgroundColor(index),
						fontFamily: style.subtitleFontFamily,
						fontSize: style.subtitleFontSize,
						fontStyle: style.subtitleFontStyle
					}
				} else {
					plugin.SetSubtitleInfo(index, p.title, p.desc);
					this.subtitlePostion(index, p);
					this.subtitleScrollMode(index, p);
					this.subtitleScrollTimes(index, p.scrollTimes);
					this.subtitleFontColor(index, p.fontColor);
					this.subtitleBackgroundColor(index, p.backgroundColor);
					this.subtitleFontStyle(index, p);
				}

			},
			subtitlePostion: function (index, p) {
				if (p === undefined) { 
					var res = plugin.GetSubtitlePostion(index).split(',');
					var posX = res[0]||'0', posY = res[1]||'0';
					if (posX < 0 || posX > 1920) {
						res[0] = 0;
					}
					if (posY < 0 || posY > 1080) {
						res[1] = 0;
					}
					return {
						x: res[0],
						y: res[1],
						pos: res[2]
					}
				} else {
					if (p.pos === undefined || p.pos == -1) {
						plugin.SetSubtitlePostion(index, -1, p.x, p.y);
					} else {
						plugin.SetSubtitlePostion(index, p.pos, 0, 0);
					}
				}
			},
			pipSource: function  (index, p) {
				if ($.isArray(p)) {
					plugin.SetPIPSource(index, p[0]||-1, p[1]||-1, p[2]||-1, p[3]||-1, p[4]||-1);
				} else {
					//读取插件，从1开始，页面js逻辑以0开始
					var tab = [];
					for (var i =1; i<= p; i++) {
						tab.push(plugin.GetPIPSource(index, i));
					}
					return tab;
				}
			},
			popSource: function  (index, p) {
				if ($.isArray(p)) {
					plugin.SetPOPSource(index, p[0]||-1, p[1]||-1, p[2]||-1, p[3]||-1, p[4]||-1);
				} else {
					//读取插件，从1开始，页面js逻辑以0开始
					var tab = [];
					for (var i =1; i<= p; i++) {
						tab.push(plugin.GetPOPSource(index, i));
					}
					return tab;
				}
			},
			videoMain: function  (p, isVGA) {
				if (p === undefined) {
					return plugin.GetCurrentMainVideoChannel();
				} else {
					plugin.SetClickVideoDirector(p);
				}
			},
			presetPosition: function(index, p) {
				if (p === undefined) {
					return presetPos[index];
				} else {
					presetPos[index] = p;
					plugin.SetPresetPosition(index, p);
				}
			},
			presetNum: function (index) {
				return plugin.GetPresetNUM(index);
			},
			pizEnable: function (index) {
				return plugin.GetPTZEnable(index);
			},
			SetSubViewCenter: function (index, x, y, w, h) {
				return plugin.SetSubViewCenter(index, x, y, w, h);
			},
			videoMove: function(index, action, dir) {
				var key = action + ':' + dir;
				switch (key) {
					case 'near:down': plugin.SetPTZ_FocusNear_Press(index);break;
					case 'near:up': plugin.SetPTZ_FocusNear_Release(index);break;
					case 'far:down': plugin.SetPTZ_FocusFAR_Press(index);break;
					case 'far:up': plugin.SetPTZ_FocusFAR_Release(index);break;
					
					case 'in:down': plugin.SetPTZ_ZoomIn_Press(index);break;
					case 'in:up': plugin.SetPTZ_ZoomIn_Release(index);break;
					case 'out:down': plugin.SetPTZ_ZoomOut_Press(index);break;
					case 'out:up': plugin.SetPTZ_ZoomOut_Release(index);break;
					
					case 'up:down': plugin.SetPTZ_Up_Press(index);break;
					case 'up:up': plugin.SetPTZ_Up_Release(index);break;
					case 'down:down': plugin.SetPTZ_Down_Press(index);break;
					case 'down:up': plugin.SetPTZ_Down_Release(index);break;
					
					case 'left:down': plugin.SetPTZ_Left_Press(index);break;
					case 'left:up': plugin.SetPTZ_Left_Release(index);break;
					case 'right:down': plugin.SetPTZ_Right_Press(index);break;
					case 'right:up': plugin.SetPTZ_Right_Release(index);break;
				}
			},
			subtitleScrollTimes: function(index, p) {
				if (p === undefined) {
					return plugin.GetSubtitleScrollTimes(index);
				} else {
					plugin.SetSubtitleScrollTimes(index, p);
				}
			},
			subtitleScrollTimes: function(index, p) {
				if (p === undefined) {
					return plugin.GetSubtitleScrollTimes(index);
				} else {
					plugin.SetSubtitleScrollTimes(index, p);
				}
			},
			subtitleScrollMode: function(index, p) {
				//var scrollMode = this.subtitleScrollMode(index);
					//0横向不滚动  1横向右滚动  2横向向左滚动  3纵向不滚动  4纵向向上滚动 5纵向向下滚动	
				if (p === undefined) {
					var res = plugin.GetSubtitleScrollMode(index);
					var scrollDir = 0;//0横向,1纵向
					if (res == 3 || res == 4 || res == 5) {
						scrollDir = 1;
					}
					return {
						scrollDir: scrollDir,
						scrollMode: res%3
					}
				} else {
					plugin.SetSubtitleScrollMode(index, p.scrollDir * 3 + p.scrollMode*1);
				}
			},
			openRecordFileDir: function () {
				plugin.openRecordFileDir();
			},
			videoStitchMode: function (p) {
				if (p === undefined) {
					return plugin.videoStitchMode;
				} else {
					plugin.videoStitchMode = p;
					this.videoModeChangeListener.fire(p);
				}
			}
		}
		_director.videoModeChangeListener = new Listener(_director);
		_director.bindAttribute('recordMode,popSourceNum,pipSourceNum,videoStitchMode,pipSourcePostion,popSourcePostion,recordTime');
		
		var recordState = (function () {
			var timeId;
			return {
				extendDirector: function (director) {
					var self = this;
					var recordStateChangeListener = director.recordStateChangeListener = new Listener(this);
					director.recordState = function (p) {
						if (p  === undefined) {
							return plugin.recordState;
						} else {
							self.saveTime(p);
							plugin.recordState = p;
							recordStateChangeListener.fire(p);
						}
					}
				},
				saveTime: function (state) {		
					if (state == 0) {
						clearInterval(timeId);
						timeId = setInterval(function () {
							var rbt = $.cookie(MID + '_rbt');
							rbt = rbt? rbt*1 :0;
							rbt += 1000;
							$.cookie(MID + '_rbt', rbt, {expires: 7});
						}, 1000)
					} else if (state == 1) {
						clearInterval(timeId);
					} else if (state == 2) {
						clearInterval(timeId);
						$.cookie(MID + '_rbt', 0, {expires: 7});
					}
				},
				getInitData: function () {
					var state = _director.recordState();
					this.saveTime(state);
					var rbt = $.cookie(MID + '_rbt');
					rbt = rbt? rbt*1 :0;
					return {
						recordState: state,
						recordTime: plugin.recordTime,
						freeDiskSpace: plugin.freeDiskSpace,
						freeRecordTime: plugin.freeRecordTime
					}
					/*
					return {
						recordState: state,
						recordTime: (state == 2? 0:(rbt/1000)>>0),
						freeDiskSpace: plugin.freeDiskSpace,
						freeRecordTime: plugin.freeRecordTime
					}*/
				}
			}
		})();
		_director.addModule('recordState', recordState);
		
		
		var videoBar = (function () {
			return {
				getInitData: function () {
					
					var map = {};
					var num = _director.cameraNum();
					if (num > 10) {
						num = 10;
					}
					//_director.remoteRtmpUrl(PMS);   
					$.each(new Array(num + 1), function (index) {
						//_director.remoteRtmpStream(key, "class_" + UID + "_u_" + MID + "_" + key + "__main");
						//_director.videoBitrate(index, 2000);
						if (index > 0) {
							map[index] = {
								title: _director.cameraName(index),
								videoRecord: _director.videoRecord(index),
								videoBitrate: _director.videoBitrate(index),
								presetNum: _director.presetNum(index),
								pizEnable: _director.pizEnable(index),
								isReceiver: plugin.GetVideoIsReceiver(index)
							}
						}
					})
					var videoMain = _director.videoMain();
					return {
						videoBarData: {
							directorMode: _director.directorMode(),
							videoMain: videoMain,
							videoControl: videoMain,
							map: map
						}
					}
				}
			}
		})();
		_director.addModule('videoBar', videoBar);
		
		var freeId20, freeFlag, freeId5;
		$.extend(_director, {
			hasRemote: function () {
				return true;
			},
			init: function () {
				if (this.hasRemote() && (PMS_REMOTE_URL == "" || WEN_UPLOAD_URL == "")) {
					Win.alert({
						html: "缺少导播服务器配置，请联系管理员！",
						mask: true,
						width: 320
					}, 5000);
				}
			},
			linkup: function () {
				if (director.hasRemote()) {
					director.initPage(true);
					freeId20 = setInterval(self.free, 20 * 1000);
				}
				director.linkup = function () {};
			},
			onPluginLoaded: function () {
				var self = this;
				var videoMainChangeListener = this.videoMainChangeListener = new Listener(this);
				events.addEvent(plugin, 'MainVideoChangeNotify', function (videoMain) {
					remote.call('changeMainVideo', videoMain);
					videoMainChangeListener.fire(videoMain);
				});
				events.addEvent(plugin, 'MovieHeadEncodeOver', function (index) {
					remote.call('MovieEncodeOver', 0, index, self.movieHeadInfo(index));
				});
				events.addEvent(plugin, 'MovieEndEncodeOver', function (index) {
					remote.call('MovieEncodeOver', 1, index, self.movieTailInfo(index));
				});
				events.addEvent(plugin, 'BitrateChange', function (index) {
					var num = _director.cameraNum();
					var map = {};
					$.each(new Array(num + 1), function (index) {
						if (index > 0) {
							map[index] = {
								videoBitrate: _director.videoBitrate(index)
							}
						}
					})
					remote.call('BitrateChange', map);
				});
				this.recordStateChangeListener.add(function (state) {
					remote.call('recordStateChange', this.getInitData());
				})
				this.videoModeChangeListener.add(function (index) {
					remote.call('picModeChange', index);
				})
			},
			//远程点击，实现有点绕远
			setMode: function (mode) {
				remote.call('setMode', mode);
			},
			free2: function () {
				var freeDiskSpace = plugin.freeDiskSpace;
				if (freeDiskSpace === undefined) return;
				if (freeDiskSpace > 200) {
					remote.call('free', freeDiskSpace, plugin.freeRecordTime);
					clearInterval(freeId5);
					freeId5 = null;
				}
			},
			free: function (flag) {
				var freeDiskSpace = plugin.freeDiskSpace;
				if (freeDiskSpace === undefined) return;
				remote.call('free', freeDiskSpace, plugin.freeRecordTime);
				if (freeDiskSpace <= 200) {
					if (!freeId5) {
						freeId5 = setInterval(this.free2, 5 * 1000);
					}
				}
				/*
				flag = flag || false;
				if (flag) {
					remote.call('free', plugin.freeDiskSpace, plugin.freeRecordTime);
					return;
				}
				if (_director.recordState() == 0) {//正在录播中
					freeFlag = true;
					remote.call('free', plugin.freeDiskSpace, plugin.freeRecordTime);
				} else {
					if (freeFlag) {
						freeFlag = false;
						remote.call('free', plugin.freeDiskSpace, plugin.freeRecordTime);
					}
				}*/
			},
			delLogo: function (indexs) {
				var self = this;
				$.each(indexs.split(','), function () {
					self.delLogoInfo(this);
				})
			},
			delLogo2: function (delInfo, changeUseIndex) {
				var self = this;
				self.delMap(delInfo, function (nIndex, oIndex) {
					self.logoInfo(oIndex, self.logoInfo(nIndex));
				}, function (index) {
					self.delLogoInfo(index);
				})
				if (changeUseIndex != -1) {
					//self.logo(changeUseIndex);
				}
			},
			delSubtitle2: function (delInfo, changeUseIndex) {
				var self = this;
				self.delMap(delInfo, function (nIndex, oIndex) {
					self.subtitleInfo(oIndex, self.subtitleInfo(nIndex));
				}, function (index) {
					self.delSubtitleInfo(index);
				})
				if (changeUseIndex != -1) {
					//self.subtitle(changeUseIndex);
				}
			},
			delSubtitle: function (indexs) {
				var self = this;
				$.each(indexs.split(','), function () {
					self.delSubtitleInfo(this);
				})
			},
			updateSubtitle: function (p) {
				
				this.subtitleBackgroundColor(p.subtitleBackgroundColor);
				this.subtitleFontColor(p.subtitleFontColor);
				this.subtitleFontStyle(p);

				var subtitleIndex = this.subtitle();
				if (subtitleIndex != -1) {
					var title = plugin.GetSubtitleTitle(subtitleIndex);
					var desc = plugin.GetSubtitleDescription(subtitleIndex);
					plugin.SetSubtitleInfo(subtitleIndex, title, desc);
					//this.subtitle(subtitleIndex);
				}
				
				console.log('this.subtitlePostion', {pos: p.subtitlePos, x: p.subtitlePosX, y : p.subtitlePosY});
				this.subtitlePostion({pos: p.subtitlePos, x: p.subtitlePosX, y : p.subtitlePosY});
				this.subtitleScrollTimes(p.subtitleScrollTimes*1);
				this.subtitleScrollMode(p.subtitleScrollMode*1);
				
				if (subtitleIndex != -1) {
					this.subtitle(subtitleIndex);
				}
				//this.subtitle(p.subtitleUseIndex);
			},
			addHeadEnd: function ( maxHead, headData, maxEnd, endData) {
				if (!!headData) {
					this.movieHeadInfo(maxHead, headData);
				} 
				if (!!endData) {
					this.movieTailInfo(maxEnd, endData);
				} 
			},
			delHeadEnd: function (headIndexs, endIndexs) {
				var self = this;
				if (headIndexs) {
					$.each(headIndexs.split(','), function () {
						self.delHeadInfo(this);
					})
				}
				if (endIndexs) {
					$.each(endIndexs.split(','), function () {
						self.delTailInfo(this);
					})
				}
			},
			delHeadEnd2: function (headDelInfo, changeHeadUseIndex, headIndexs, endDelInfo, changeEndUseIndex, endIndexs) {
				var self = this;
				if (headDelInfo) {
					var map = {};
					$.each(headIndexs.split(','), function () {
						map[this] = 1;
						self.delHeadInfo(this);
					})
					self.delMap(headDelInfo, function (nIndex, oIndex) {
						self.movieHeadInfo2(oIndex, self.movieHeadInfo(nIndex));
					}, function (index) {
						if (!map[index]) {
							self.delHeadInfo(index);
						}
					})
					if (changeHeadUseIndex != -1) {
						//self.movieHead(changeHeadUseIndex);
					}
				}
				if (endDelInfo) {
					var map = {};
					$.each(endIndexs.split(','), function () {
						map[this] = 1;
						self.delTailInfo(this);
					})
					self.delMap(endDelInfo, function (nIndex, oIndex) {
						self.movieTailInfo2(oIndex, self.movieTailInfo(nIndex));
					}, function (index) {
						if (!map[index])
							self.delTailInfo(index);
					})
					if (changeEndUseIndex != -1) {
						//self.movieEnd(changeEndUseIndex);
					}
				}
			},
			updatePicMode: function (mode, num, map, pos) {
				if (mode == 'pip') {
					this.pipSourceNum(num);
					for (var i in map) {
						this.pipSource(i, map[i]);
					}
					this.pipSourcePostion(pos);
				} else if (mode == 'pop') {
					this.popSourceNum(num);
					for (var i in map) {
						this.popSource(i, map[i]);
					}
					this.popSourcePostion(pos);
				}
			},
			changeRecordMode: function (mode, flag) {
				this.recordMode(mode);
				if (flag) {
					var num = this.cameraNum();
					if (mode == 0) {
						for (var i = 1; i <= num ; i++) {
							this.videoRecord(i, false);
						}
					} else {
						for (var i = 1; i <= num ; i++) {
							this.videoRecord(i, true);
						}
					}
				}
			}
		});		
		return _director;
	})();