var page = (function (undefined) {
	var MAIN_ROOM = {};
	var slice = Array.prototype.slice;
	var $win = $(window);
	var $doc = $(document);
	var noop = function () {};
	
	var isFlashRoom = function () {
		return false;
		if (ROLE == 0 || (STYPE == "MASTER" && ROLE == 1)) {
			console.log('isFlashRoom', false);
			return false;
		} else {
			console.log('isFlashRoom', true);
			return true;
		}
	}
	var getImgFullUrl = function (url) {
		return location.protocol + '//' + location.host  + ROOT + url;
	};
	var hasRemote = function () {
		return !!IS_REMOTE && ROLE == 0;
	};
	var vidoName2Class = {
		'教师跟踪': 'teaFollow',
		'教师全景': 'teaAll',
		'学生跟踪': 'stuFollow',
		'学生全景': 'stuAll',
		'教师板书': 'blackboard',
		'VGA': 'vga'
	}
	var lessonMode = window.lessonMode  = (function () {
		var currMode;
		var bbtMouse = (function () {
			var timeId;
			var recoverTime = BBT_MOUSE_RECOVER_TIME;
			return {
				move: function () {
					if (recoverTime == -1) return;
					if (currMode == 2 || currMode == 1) return;
					lessonMode.setMode(1, "BBT_MOUSE_MOVE");
					clearTimeout(timeId);
					if (recoverTime) {
						timeId = setTimeout(function () {
							lessonMode.setMode(0, "BBT_MOUSE_MOVE");
						}, recoverTime * 60 * 1000);
					}
				},
				stop: function () {
					clearTimeout(timeId);
				}
			}
		})();
		
		var vga = (function () {
			var lastMode; 
			return {
				lock: function () {
					if (currMode != 1) {
						lastMode = currMode;
						lessonMode.setMode(1);
					}
				},
				unLock: function () {
					if (currMode == 1) {
						lessonMode.setMode((lastMode || 0));
					}
				}
			}
		})();
			
		return {
			getCurrMode: function () {
				return currMode || 0;
			},
			init: function () {
				var self = this;
				window.transferLoaded = function () {
					console.log('transferLoaded');
					self.plugin = $id("transferObject");
					self.pluginLoad();
				}
				$('body').append('<object id="transferObject" type="application/x-codyytransfer" width="1" height="1" >\
					<param name="onload" value="transferLoaded" />\
				</object>');
			},
			pluginLoad: function () {
				console.log('codyytransfer pluginLoad');
				var plugin = this.plugin;
				var self = this;
				plugin.classroomMode = ROLE;
				plugin.lessonMode = 0;
				var map = {
					'HK_MAIN_CLASSROOM': 'mainClass',
					'HK_SUB1': 'sub1',
					'HK_SUB2': 'sub2',
					'HK_SUB3': 'sub3',
					'HK_PICTURE_MODE': 'winMode',
					'HK_INTERATION_MODE': 'interactMode',
					'HK_MYVIDEO_MODE': 'myVideoMode',
					'HK_LEFT': 'left',
					'HK_RIGHT': 'right',
					'HK_UP': 'up',
					'HK_DOWN': 'down',
					'HK_OK': 'ok',
					'HK_IN': 'recordON',
					'HK_STOP': 'recordOff',
					'HK_SOURCE1': 'source1',
					'HK_SOURCE2': 'source2',
					'HK_SOURCE3': 'source3',
					'HK_SOURCE4': 'source4',
					'HK_SOURCE5': 'source5',
					'HK_SOURCE6': 'source6'
				};
				events.addEvent(plugin, 'hotkeyNotify', function(code){
					console.log('hotkeyNotify', code, map[code]);
					var key = map[code];
					if (key) {
						page.keydownListener.fire(key);
					}
				});
				events.addEvent(plugin, 'keyboardmouseNotify', function(code){
					bbtMouse.move();
				});
				events.addEvent(plugin, 'ControlInfoFromCenterConsole', function (aType, channel, action) {
					console.log('ControlInfoFromCenterConsole', aType, channel, action);
					if (channel == 0) {
						if (recordState.state != 'on') {
							recordState.next();
						}
					} else if (channel == 1) {
						if (recordState.state == 'on') {
							recordState.next();
						}
					} else if (channel == 2) {
						if (recordState.state != 'stop') {
							recordState.stop();
						}
					} else if (channel == 3) {
						if (currMode == 1) {
							vga.unLock();
						} else {
							vga.lock();
						}
					}
				});
			},
			setMode: function (mode, isDirector) {
				isDirector = isDirector || false;
				this.plugin.lessonMode = mode;
				currMode = mode;
				if (isDirector != "BBT_MOUSE_MOVE") {
					bbtMouse.stop();
				}
			},
			pptPage: function (l) {
				l = l || 'up';
				if (l == 'up') {
					this.plugin.pgUp();
				} else {
					this.plugin.pgDn();
				}	
			}
		}
	})();
	
	var ePadMode = window.ePadMode = (function () {
		var $pad;
		return {
			initPageMode: function () {
				$pad = $("#ePad");
				var self = this;
				$('.closePad').on('click', function () {
					//self.offPageMode();
					pageMode.popPageMode();
				})
				this.loadEpad({
					phphost: MEET_SERVER_HOST,
					meetId: parseInt(MID.substr(0,6),16).toString(10),
					myID: UID,
					myNick: UNAME,
					apihost : ROOT + "/" +FILE_API,
					auth: ROLE=="0"?1:0
				});
				$('#setPad').on('click', function () {
					if (PADSHOW) {
						//self.offPageMode();
						pageMode.popPageMode();
					} else {
						//self.onPageMode();
						pageMode.setPageMode("ePadMode");
					}
				})
				
				if (!window.Codyy) window.Codyy = {};
				if (!window.Codyy.Meet) window.Codyy.Meet = {};
				
				window.Codyy.Meet.sendMsg = function(arg){
			    	COCO.send(arg);
			    };				
				COCO.cocoEvent.add('receiveAll',function(){
				    var data = arguments[0].message;
				    if(data.from != UID){
				    	if(data.o == "wp") self.plugin.doPad(data);
					}
				});
			},
			loadEpad: function(params){
				var paramStr = ROOT + "/public/flash/CR_writepad/Pad4Java.swf?";
				$.each(params, function(k, v){
					paramStr += '&' + k + '=' + v;
				});
				this.plugin = FlashPlayer($pad[0], paramStr, {id:"docPad"});
			},
			onPageMode: function () {
				console.log('onPageMode', 'ePadMode');
				$pad.css('visibility', 'visible');
				PADSHOW = true;
				if (ROLE == 0) {
					$.post(ROOT + '/class/schoolTeaching/setPadStatus.do', {status: 1, mid: MID});
					try {
						COCO.callAll("ePadMode.onPageMode"); 
					} catch(e) {}
				}
			},
			offPageMode: function () {
				console.log('offPageMode', 'ePadMode');
				$pad.css('visibility', 'hidden');
				PADSHOW = false;
				pageMode.setPageMode("teachingMode");
				if (ROLE == 0) {
					$.post(ROOT + '/class/schoolTeaching/setPadStatus.do', {status: 0, mid: MID});
					COCO.callAll("ePadMode.offPageMode");
				}
			},
			winSize: noop
		}
	})();
	
	var workMode = window.workMode =  (function () {//iframe 调用 workMode.close()
		var url = ROOT + "/class/classWork/toClassWork.do?clsClassroomId=" + UID + "&mid=" + MID + "&type=" + (URL_PATH != '/class/schoolTeaching/' ? "LIVE": "ONLINE_CLASS");
		var $iframe = $('<iframe id="homeWorkIframe" frameborder="no" border="0" allowtransparency="true" src="' + url + '"></iframe>').appendTo('body');
		var iframeWin = $iframe[0].contentWindow;
		return {
			initPageMode: function () {
				$('#homeWorkBtn').on('click', function () {
					pageMode.setPageMode("workMode");
				})
			},
			close: function () {
				pageMode.popPageMode();
			},
			onPageMode: function () {
				$iframe.show();
				iframeWin.search();
			},
			offPageMode: function () {
				$iframe.hide();
			},
			winSize: noop
		}
	})();
	
	var $headerInner = $('.headerInner');
	var $wrapperAll = $('#wrapperAll');	
	var $modeBtn = $('.modeBtn');
	var teachingMode = window.teachingMode = (function () {
		var className = 'teaching';
		var speakId;
		var connectFn = function (id) {
			if (id == "speakOn") {
				console.log("speakOn", this);
				var playid = this.playid;
				if (speakId != playid) {
					teachingMode.setSpeak(playid);
				} else {
					teachingMode.setSpeak();
				}
			}
		};
		var keydown = function (key) {
			var videoData = director.module.videoBar.getInitData();
			var videoMap = videoData.videoBarData.map;
			var videoMain = videoData.videoBarData.videoMain;
			if (videoMap[videoMain].title.toLowerCase() == 'vga') {
				if (key == 'left' || key == 'up') {
					lessonMode.pptPage('up');
				} else if (key == 'right' || key == 'down') {
					lessonMode.pptPage('down')
				} 
			}
		};
		var lastVideoMain;
		return {
			setSpeak: function (playid, isInit) {
				isInit = isInit || false;
				if (playid) {
					if (!isInit) {
						if (!COCO.connected) {
							return Win.alert("正在连接通讯服务器！", 1000);
						}
						if (COCO.users[playid] !== true) {
							return Win.alert("所选教室未在线！", 1000);
						}
					}
					if (!speakId) {
						lastVideoMain = director.videoMain();
					} else {
						receiveGruop.oneCallFn(speakId, 'callSpeaker', 'updateElement', "speakOn", getImgFullUrl('/public/img/green/audio.png'));
					}
					speakId = playid;
					var receiveVideo = receiveGruop.getReceiveVideo(playid);
					if (receiveVideo.videoIndex) {
						director.videoMain(receiveVideo.videoIndex);
					}
					receiveGruop.oneCallFn(playid, 'callSpeaker', 'updateElement', "speakOn", getImgFullUrl('/public/img/green/audio2.png'));
					$.post(ROOT  + URL_PATH + 'setMainScreen.do', {mid: MID, uid: playid});
					if (ROLE == 0) {
						COCO.callAll("teachingMode.setSpeak2", playid);
					}
				} else {
					if (speakId) {
						receiveGruop.oneCallFn(speakId, 'callSpeaker', 'updateElement', "speakOn", getImgFullUrl('/public/img/green/audio.png'));
						speakId = null;
						director.videoMain(lastVideoMain);
						$.post(ROOT  + URL_PATH + 'setMainScreen.do', {mid: MID, uid: -1});
						if (ROLE == 0) {
							COCO.callAll("teachingMode.setSpeak2", "");
						}
					}
				}
				this.winSize();
			},
			setSpeak2: function (playid, isWinSize) {
				if (playid == UID || !playid) {
					speakId = MAIN_SPEAK;
				} else {
					speakId = playid;
				}
				if (!isWinSize)
					this.winSize();
			},
			initPageMode: function () {
				$('#teachingBtn').on('click', function () {
					if ($(this).hasClass('cur')) return;
					pageMode.setPageMode('teachingMode');
				})
				if (ROLE == 0) {
					receiveGruop.eachCallFn(function () {
						console.log('this.mouseDownListener.add(connectFn)')
						console.log(this, this.mouseDownListener);
						this.mouseDownListener.add(connectFn);
					});
				} else {
					//this.setSpeak2(MAIN_SCREEN, true);
				}
			},
			onPageMode: function () {
				console.log('onPageMode', 'teachingMode', speakId);
				$wrapperAll.addClass(className);
				$('#teachingBtn').addClass('cur');
				$('.pluginTarget').removeClass('pluginTarget');
				$('.video4Mode .videoCont').addClass('pluginTarget');
				if (ROLE == 0) {
					receiveGruop.eachCallFn('callSpeaker', 'removeElm', "speakOn");
					receiveGruop.eachCallFn('callSpeaker', 'addIcon', "speakOn", getImgFullUrl('/public/img/green/audio.png'), -1, -1, 33, 5, 25, 25);
					page.keydownListener.add(keydown);
				}
			},
			offPageMode: function (pType) {
				console.log('offPageMode', 'teachingMode');
				$wrapperAll.removeClass(className);
				if("show"!=pType) $('#teachingBtn').removeClass('cur');
				if (ROLE == 0) {
					receiveGruop.eachCallFn('callSpeaker', 'removeElm', "speakOn");
					if (pType == 'mode') {
						this.setSpeak();
					}
					page.keydownListener.remove(keydown);
				}
			},
			winSize: function () {
				var roomXY = page.roomXY;		
				var wheight =  $win.height() - 40, wWidth = $win.width() - 80;//顶上，两边至少空40
				var x2y = 16/9;
				var x = roomXY[0], y = roomXY[1];
				var boxh = ((wWidth / x - 10) /x2y + 10)* y;
				var warpWidth, videoY;
				if (boxh > wheight) {
					videoY = wheight/y - 10;
					warpWidth = (videoY * x2y + 10) * x;	
				} else {
					videoY = (wWidth / x - 10) /x2y;
					warpWidth = wWidth;
				}
				
				if (speakId) {
					$('.videoWrap').css({width: 11});
					$('.videoCont').css({height: 1});
					$('#player' + speakId).css({width: '100%'}).find('.videoCont').css({height: videoY*2 + 6});
				} else {
					$('.videoCont').css({height: videoY})
					$('.videoWrap').css('width', ((100/x)>>0) + '%');
				}
				$wrapperAll.css('width', warpWidth);
				$headerInner.css('width', warpWidth);		
				publishVideo.winSize();
			}
		}
	})();
	
	var myVideoMode2 = (function () {
		var className = 'myVideo2';
		return {
			initPageMode: function () {
				var self = this;
				$('#myVideoBtn').on('click', function () {
					if ($(this).hasClass('cur')) return;
					pageMode.setPageMode('myVideoMode');
				})
			},
			onPageMode: function () {
				console.log('onPageMode', 'myVideoMode');
				$modeBtn.removeClass('cur');
				$('#myVideoBtn').addClass('cur');
				$wrapperAll.addClass(className);
			},
			offPageMode: function () {
				$('#myVideoBtn').removeClass('cur');
				$wrapperAll.removeClass(className);
			},
			winSize: function () {
				teachingMode.winSize();
				var height = $wrapperAll.height()-32;
				var $items = $('.publish-item');
				if ($items.length) {
					if ($items.length * 180 < height) {
						$items.css({height: 180, width: 320});
					} else {
						var h = height/$items.length;
						$items.css({height: h, width: h/9*16});
					}
				}
			}
		}
	})();
	
	var myVideoMode = (function () {
		var className = 'myVideo';
		var videoChange;
		var keydown;
		var lastDirectorMode;
		return {
			initPageMode: function () {
				var self = this;
				videoChange = function (from, index) {
					self.use(self.$box.find('[data-key=' + index + ']'), index);
				}
				$('#myVideoBtn').on('click', function () {
					if ($(this).hasClass('cur')) return;
					console.log("pageMode.setPageMode('myVideoMode')");
					pageMode.setPageMode('myVideoMode');
				})
			},
			onPageMode: function () {
				console.log('onPageMode', 'myVideoMode');
				director.videoMainChangeListener.add(videoChange);
				$wrapperAll.addClass(className);
				lastDirectorMode = director.directorMode();
				director.directorMode("manual");
				$modeBtn.removeClass('cur');
				$('#myVideoBtn').addClass('cur');
				$('.pluginTarget').removeClass('pluginTarget');
				$('.videoMenuMode .videoCont').addClass('pluginTarget');
				
				this.showVideoList();
				var self = this;
				var $box = this.$box = $('.myVideoRightVideo').on('click', 'li', function () {
					var $elm = $(this);
					var action = $elm.attr('data-action');
					self[action]($elm, $elm.attr('data-key'), 'MainRoomWeb');
				})
				var $items = this.$items = this.$box.find('li');
				var len = $items.length;
				keydown = function (key) {
					//console.log($items, $items.find('.sel'), $items.find('.sel').next());
					var index = $box.find('.sel').index();
					console.log('myVideoMode', 'keydown', key, index);;
					if (key == 'up') {
						self.sel($items.eq(--index%len));
					} else if (key == 'down') {
						self.sel($items.eq(++index%len));
					} else if (key == 'ok') {
						$box.find('.sel').click();
					} else if (key.indexOf('source') == 0) {
						self.keySel(key);
						return false;
					}
				};
				page.keydownListener.add(keydown, 'first');
			},
			offPageMode: function () {
				console.log('offPageMode', 'myVideoMode');
				page.keydownListener.remove(keydown);
				director.directorMode(lastDirectorMode);
				keydown = lastDirectorMode = null;
				$('#myVideoBtn').removeClass('cur');
				$wrapperAll.removeClass(className);
				director.videoMainChangeListener.remove(videoChange);
				this.$box = this.$items = null;
			},
			quite: function () { 
				pageMode.popPageMode();
			},
			keySel: function (key) {
				var index = key.replace('source', '') - 1;
				if (index < this.$items.length - 1) {
					this.sel(this.$items.eq(index));	
				}
			},
			sel: function ($item) {
				this.$items.removeClass('sel');
				$item.addClass('sel');
			},
			use: function ($item, key, from) {
				this.$items.removeClass('use');
				$item.addClass('use');
				if ('MainRoomWeb' == from) {
					this.sel($item);
					director.videoMain(key*1);
					pageMode.setPageMode('teachingMode');
				}
			},
			showVideoList: function () {
				var videoData = director.module.videoBar.getInitData();
				var videoMap = videoData.videoBarData.map;
				var videoMain = videoData.videoBarData.videoMain;
				var obj;
				var html = ['<ul class="rightVideoList myVideoRightVideo">'];
				for (var i = 1; i < 10; i++) {
					obj = videoMap[i];
					if (!obj) break;
					if (!obj.isReceiver)
						html.push('<li data-action="use" data-key="' + i + '" class="' + (videoMain == i ? ' sel use ': '')  + vidoName2Class[obj.title] + '">' + obj.title + '</li>')
				}
				html.push('<li data-action="quite" class="quite">退出</li>')
				html.push('</ul>');
				$('.rightMenus').html(html.join(''));
				this.selectMenus = [];
				this.videoSelectIndex = this.videoUseIndex = videoMain;
			},
			winSize: function () {
				var roomXY = page.roomXY;		
				var wheight =  $win.height() - 40, wWidth = $win.width() - 80;//顶上，两边至少空40
				var x2y = 16/9;
				var x = roomXY[0], y = roomXY[1];
				var receiveNum = x * y - 1;
				var boxh = ((wWidth / x - 10) /x2y + 10)* y;
				var warpWidth, videoY;
				if (boxh > wheight) {
					videoY = wheight/y - 10;
					warpWidth = (videoY * x2y + 10) * x;	
				} else {
					warpWidth = wWidth;
				}
				var videoWith = warpWidth - 250;
				var boxh = (videoWith-10)/x2y + 10;
				var pluginY, menuW;
				if (boxh > wheight) {
					pluginY = wheight - 10;					
				} else {
					pluginY = boxh - 10;
				}
				videoW = pluginY * x2y;
				$('.rightMenus').css({width: 250});
				$('.pluginTarget').css({height: pluginY});
				$('.videoReceive').css({
					width: 11
				});
				$('.videoReceive .videoCont').css({
					height: 1
				});
				$('.videoMenuMode').css({width: '100%'});
				$wrapperAll.css('width', warpWidth);
				$headerInner.css('width', warpWidth);
				publishVideo.winSize();
			}
		}
	})();
	
	var interactMode = window.interactMode = (function () {
		var className = 'interact';
		var speakId;
		var isSpeaking = false;
		var VNCFn = function (id) {
			if (id == "vncOn") {
				var playid = this.playid;
				if (speakId != playid) {
					interactMode.setSpeak(playid);
				} else {
					interactMode.setSpeak();
				}
			}
		};
		var keydown = function (key) {
			if (key == 'left') {
				
			} else if (key == 'right') {
				
			} 
		};
		return {
			hasSpeaking: function () {
				return !!speakId;
			},
			setSpeak: function (playid) {
				if (playid) {
					if (!COCO.connected) {
						return Win.alert("正在连接通讯服务器！", 1000);
					}
					if (COCO.users[playid] !== true) {
						return Win.alert("所选教室未在线！", 1000);
					}
					if (speakId) {
						receiveGruop.oneCallFn(speakId, 'callSpeaker', 'updateElement', "vncOn", getImgFullUrl('/public/img/green/vga.png'));
						COCO.callOne(speakId, "interactMode.EndVNC", lessonMode.plugin.vncIP);
					}
					speakId = playid;
					receiveGruop.oneCallFn(playid, 'callSpeaker', 'updateElement', "vncOn", getImgFullUrl('/public/img/green/vga2.png'));
					COCO.callOne(playid, "interactMode.StartVNC", lessonMode.plugin.vncIP);
				} else {
					if (speakId) {
						receiveGruop.oneCallFn(speakId, 'callSpeaker', 'updateElement', "vncOn", getImgFullUrl('/public/img/green/vga.png'));
						COCO.callOne(speakId, "interactMode.EndVNC", lessonMode.plugin.vncIP);
						speakId = null;
					}
				}
			},
			StartVNC: function (ip) {
				console.log('StartVNC');
				window.scrollTo(0, 1000); //滚动到最下方
				Win.alert("您现在获取了操作主课堂电脑的权限。");
				lessonMode.plugin.StartVNC(ip);
				isSpeaking = true;
			},
			EndVNC:  function () {
				if (isSpeaking) {
					console.log('EndVNC');
					Win.alert("您现在取消了操作主课堂电脑的权限。");
					lessonMode.plugin.EndVNC();
					isSpeaking = false;
				}
			},
			initPageMode: function () {
				var self = this;
				$('#interactModeBtn').on('click', function () {
					pageMode.setPageMode('interactMode');
				})
				receiveGruop.eachCallFn(function () {
					console.log('this.mouseDownListener.add(VNCFn)')
					this.mouseDownListener.add(VNCFn);
				});
			},
			onPageMode: function () {
				console.log('onPageMode', 'interactMode');
				lessonMode.setMode(2);
				$wrapperAll.addClass(className);
				$modeBtn.removeClass('cur');
				$('.pluginTarget').removeClass('pluginTarget');
				$('.video4Mode .videoCont').addClass('pluginTarget');
				
				receiveGruop.eachCallFn('callSpeaker', 'removeElm', "vncOn");
				receiveGruop.eachCallFn('callSpeaker', 'addIcon', "vncOn", getImgFullUrl('/public/img/green/vga.png'), -1, -1, 33, 5, 25, 25);
				page.keydownListener.add(keydown);
			},
			offPageMode: function (pType) {
				console.log('offPageMode', 'interactMode', pType);
				if (pType == 'mode') {
					lessonMode.setMode(0);
					this.setSpeak();
				}
				$wrapperAll.removeClass(className);
				receiveGruop.eachCallFn('callSpeaker', 'removeElm', "vncOn");
				page.keydownListener.remove(keydown);
			},
			winSize: teachingMode.winSize
		}
	})();

	var f2fMode = (function () {
		var className = 'f2fMode';
		var keydown;
		var f2fFn = function (key) {
			console.log('f2fFn', key, this);
			if (key == '_none_elements_region') {
				$('.videoWrap').removeClass('sel');
				this.$warp.parent().addClass('sel');
				director.f2fVideoIndex(this.videoIndex);
			}
		};
		return {
			initPageMode: function () {
				
			},
			onPageMode: function () {
				//director.videoStitchMode(3);
				console.log('onPageMode', 'f2fMode');
				$wrapperAll.addClass(className);
				$modeBtn.removeClass('cur');
				$('#teachingBtn').addClass('cur');
				$('.pluginTarget').removeClass('pluginTarget');
				$('.videoMenuMode .videoCont').addClass('pluginTarget');
				this.showVideoList();
				var self = this;
				var $box = this.$box = $('.f2fRightVideo').on('click', 'li', function () {
					var action = this.getAttribute('data-action');
					self[action]($(this), this.getAttribute('data-key'), 'MainRoomWeb');
				})
				var $items = this.$items = this.$box.find('li');
				var len = $items.length;
				keydown = function (key) {
					var index = $box.find('.sel').index();
					console.log('f2fMode', 'keydown', key, index);
					if (key == 'up') {
						if (index == -1) {
							index = 0;
						}
						self.sel($items.eq(--index%len));
					} else if (key == 'down') {
						self.sel($items.eq(++index%len));
					} else if (key == 'ok') {
						$box.find('.sel').click();
					} else if (key == 'left') {
						var hl = director.f2fVideoHighlight();
						if (hl == -1) {
							hl = 0;
						}
						director.f2fVideoHighlight((hl+1)%2);
					} else if (key == 'right') {
						var hl = director.f2fVideoHighlight();
						director.f2fVideoHighlight((hl+1)%2);
					} else if (key.indexOf('source') == 0) {
						var index = key.replace('source', '') - 1;
						if (index < $items.length - 1) {
							var $e = $items.eq(index);
							self.use($e, $e.attr('data-key'), 'MainRoomWeb');
						}
						return false;
					} else if (key.indexOf('sub') == 0) {
						var index = key.replace('sub', '') - 1;
						var $e = $('.videoReceive:eq(' +  index + ')');
						if($e.length > 0) {
							var key = $e.attr('data-key');
							if (key) {
								$('.videoWrap').removeClass('sel');
								$e.addClass('sel');
								director.f2fVideoIndex(key);
							}
						}
						return false;
					}
				};
				page.keydownListener.add(keydown, 'first');
		
				receiveGruop.eachCallFn(function () {
					console.log('this.mouseDownListener.add(f2fFn)')
					this.mouseDownListener.add(f2fFn);
				});
				if (ROLE == 0) {
					$.post(ROOT + '/class/schoolTeaching/setPageMode.do', {status: "f2fMode", mid: MID});
				}
			},
			showVideoList: function () {
				var videoData = director.module.videoBar.getInitData();
				var videoMap = videoData.videoBarData.map;
				var obj;
				var html = ['<ul class="rightVideoList f2fRightVideo">'];
				for (var i = 1; i < 10; i++) {
					obj = videoMap[i];
					if (!obj) break;
					if (!obj.isReceiver) {
						html.push('<li data-action="use" data-key="' + i + '" class="'  + vidoName2Class[obj.title] + '">' + obj.title + '</li>');
					}
				}
				html.push('<li data-action="quite" class="quite">退出</li>')
				html.push('</ul>');
				$('.rightMenus').html(html.join(''));
				this.selectMenus = [];
			},			
			offPageMode: function (pType) {
				console.log('offPageMode', 'f2fMode');
				$wrapperAll.removeClass(className);
				page.keydownListener.remove(keydown);
				
				keydown = null;
				receiveGruop.eachCallFn(function () {
					this.mouseDownListener.remove(f2fFn);
				});
				$('.videoWrap').removeClass('sel');
				if (pType == 'mode') {
					director.videoStitchMode(f2fMode.lastMode);
				}
				if (ROLE == 0) {
					$.post(ROOT + '/class/schoolTeaching/setPageMode.do', {status: "teachingMode", mid: MID});
				}
			},
			winSize: function () {
				var roomXY = page.roomXY;		
				var wheight =  $win.height() - 40, wWidth = $win.width() - 80;//顶上，两边至少空40
				var x2y = 16/9;
				var x = roomXY[0], y = roomXY[1];
				var receiveNum = x * y - 1;
				var boxh = ((wWidth / x - 10) /x2y + 10)* y;
				var warpWidth, videoY;
				if (boxh > wheight) {
					videoY = wheight/y - 10;
					warpWidth = (videoY * x2y + 10) * x;	
				} else {
					warpWidth = wWidth;
				}
				
				var roomXY = page.roomXY;		
				var wheight =  $win.height() - 40, wWidth = $win.width() - 80;//顶上，两边至少空40
				var x2y = 16/9;
				var x = roomXY[0], y = roomXY[1];
				var receiveNum = x * y - 1;
				var boxh = ((wWidth / x - 10) /x2y + 10)* y;
				var warpWidth, videoY;
				if (boxh > wheight) {
					videoY = wheight/y - 10;
					warpWidth = (videoY * x2y + 10) * x;	
				} else {
					warpWidth = wWidth;
				}
				
				if (receiveNum == 0) {
					return myVideoMode.winSize();
				}
				
				var videoWith = warpWidth - 250;
				var boxh = (videoWith-10)/x2y + 10 + (videoWith/receiveNum - 10 )/x2y + 10;
				var pluginY, menuW;
				if (boxh > wheight) {
					videoY = ((x2y*wheight) - 20 * x2y + 10 - 10 * receiveNum)/(receiveNum + 1)/x2y;
					menuW = warpWidth - (videoY*x2y + 10) * receiveNum;
					pluginY = ((videoY*x2y + 10) * receiveNum - 10)/x2y;
				} else {
					videoY = (videoWith/receiveNum - 10 )/x2y;
					pluginY = (videoWith-10)/x2y;
					menuW = 250;
				}
				$('.rightMenus').css({width: menuW});
				$('.pluginTarget').css({height: pluginY});
				$('.videoReceive .videoCont').css({height: videoY});
				$('.videoMenuMode').css({width: '100%'});
				$('.videoReceive').css({
					width: 100/receiveNum + '%'
				})
				$wrapperAll.css('width', warpWidth);
				$headerInner.css('width', warpWidth);
				publishVideo.winSize();
			},
			quite: function () { 
				pageMode.setPageMode('teachingMode');
			},
			sel: function ($item) {
				this.$items.removeClass('sel');
				$item.addClass('sel');
			},
			use: function ($item, key, from) {
				this.$items.removeClass('use');
				$item.addClass('use');
				if ('MainRoomWeb' == from) {
					this.sel($item);
					director.f2fVideoIndex(key);
				}
			}
		}
	})();

	var winMode = (function () {
		var className = 'winMode';
		var modeChange;
		var keydown;
		return {
			initPageMode: function () {
				var self = this;
				$('#winModeBtn').on('click', function () {
					pageMode.setPageMode('winMode');
				})
				modeChange = function (index) {
					self.use(self.$box.find('[data-key=' + index + ']'), index);
				}
			},
			onPageMode: function () {
				console.log('onPageMode', 'winMode');
				var self = this;
				$wrapperAll.addClass(className);
				$('.pluginTarget').removeClass('pluginTarget');
				$('.videoMenuMode .videoCont').addClass('pluginTarget');
				this.showModeList();
				var $box = this.$box = $('.winModeRightVideo').on('click', 'li', function () {
					var action = this.getAttribute('data-action');
					self[action]($(this), this.getAttribute('data-key'), 'MainRoomWeb');
				})
				var $items = this.$items = this.$box.find('li');
				director.videoModeChangeListener.add(modeChange);
				var len = $items.length;
				keydown = function (key) {
					//console.log($items, $items.find('.sel'), $items.find('.sel').next());
					var index = $box.find('.sel').index();
					console.log('winMode', 'keydown', key, index);;
					if (key == 'up') {
						self.sel($items.eq(--index%len));
					} else if (key == 'down') {
						self.sel($items.eq(++index%len));
					} else if (key == 'ok') {
						$box.find('.sel').click();
					} else if (key.indexOf('source') == 0) {
						var index = key.replace('source', '') - 1;
						if (index < $items.length - 1) {
							self.sel($items.eq(index));	
						}
						return false;
					}
				};
				page.keydownListener.add(keydown, 'first');		
			},
			offPageMode: function () {
				console.log('offPageMode', 'winMode');
				$wrapperAll.removeClass(className);
				director.videoModeChangeListener.remove(modeChange);
				page.keydownListener.remove(keydown);
				keydown = null;
			},
			showModeList: function () {
				var videoMode = director.videoStitchMode();
				var html = ['<ul class="rightVideoList winModeRightVideo">'];
				var len = 3;
				if (ROLE == 0) {
					len = 4;
				}
				for (var i = 0; i < len; i++) {
					html.push('<li data-action="use" data-key="' + i + '" class="' + (videoMode == i ? ' sel use videoMode': 'videoMode')  + i + '"></li>')
				}
				html.push('<li data-action="quite" class="quite">退出</li>')
				html.push('</ul>');
				$('.rightMenus').html(html.join(''));
			},
			quite: function () { 
				pageMode.popPageMode();
			},
			sel: function ($item) {
				this.$items.removeClass('sel');
				$item.addClass('sel');
			},
			use: function ($item, key, from) {
				this.$items.removeClass('use');
				$item.addClass('use');
				if ('MainRoomWeb' == from) {
					this.sel($item);
					var lastMode = director.videoStitchMode();
					director.videoStitchMode(key*1);
					if (key == 3) {
						f2fMode.lastMode = lastMode;
						pageMode.setPageMode('f2fMode');
					} else {
						pageMode.setPageMode('teachingMode');
					}
				}
			},
			winSize: myVideoMode.winSize
		}
	})();
	
	var pageMode = window.pageMode = (function () {
		var pModeMap = {};
		var pModeList = [];
		return {
			getMode: function () {
				var l = pModeList.length;
				while(l--) {
					if (pModeMap[pModeList[l]].pageType == 'mode')
						return pModeList[l];
				}
			},
			add: function (key, obj, t)  {
				pModeMap[key] = obj;
				obj.pageType = t || 'mode';
			},
			init: function () {
				this.add('teachingMode', teachingMode);
				if (isFlashRoom()) {
					this.add('myVideoMode', myVideoMode2, 'show');
				} else {
					this.add('myVideoMode', myVideoMode, 'show');
				}
				this.add('interactMode', interactMode);
				this.add('ePadMode', ePadMode, 'show');
				this.add('workMode', workMode, 'show');
				
				this.add('f2fMode', f2fMode);
				this.add('winMode', winMode, 'show');

				for (var key in pModeMap) {
					pModeMap[key].initPageMode();
				}
				
				var self = this;
				director.pageMode = function (p) {
					if (p === void 0) {
						var l = pModeList.length;
						while(l--) {
							if (pModeMap[pModeList[l]].pageType == 'mode')
								return pModeList[l];
						}
					} else {
						remote.call('pageMode', p);
					}
				}
			},
			setPageMode: function (key) {
				var pLen = pModeList.length;
				var pMode = pModeList[pLen-1];
				if (key == pMode) return;
				var newPMode = pModeMap[key];
				var newPageType = newPMode.pageType;
				
				var tmp;
				if (newPageType == 'mode') {
					tmp = pModeList.pop();
					while (tmp) {
						tmp = pModeMap[tmp];
						tmp.offPageMode(newPageType);
						if (tmp.pageType == 'mode') {
							break;
						}
						tmp = pModeList.pop();
					}
				} else if (pMode) {
					if (pModeMap[pMode].pageType == 'mode') {
						pModeMap[pMode].offPageMode(newPageType);
					} else {
						tmp = pModeList.pop();
						pModeMap[tmp].offPageMode(newPageType);
					}
				}
				newPMode.onPageMode();
				if (newPageType == 'mode' && this.getMode() != key) {
					director.pageMode(key);
				}
				if (pModeList[pModeList.length-1] != key)
					pModeList.push(key);
				this.winSize();
				console.log(pModeList);
			},
			popPageMode: function () {
				console.log('popPageMode');
				var l = pModeList.length;
				var mode;
				while(l--) {
					if (pModeMap[pModeList[l]].pageType == 'mode') {
						mode = pModeList[l];
						break;
					}
				}
				this.setPageMode(mode||'teachingMode');
			},
			winSize: function () {
				var pMode = pModeList[pModeList.length-1];
				pModeMap[pMode].winSize();
			}
		}
	})();
	
	var RECEIVE_TEXT_MAP = {
		0: 'none',
		1: 'video',
		2: 'audio',
		3: 'all',
		all: '',
		none: "（音视频已关闭）",
		video: "（音频已关闭）",
		audio: "（视频已关闭）"
	};
	var receiveVideo = function ($warp, opt) {
		$.extend(this, opt);
		this.$warp = $warp;
		if (this.playid == MAIN_SPEAK) {
			this.streamName = "class_" + MAIN_SPEAK + "_u_" + MID + "__main";
		} else {   
			this.streamName = "class_" + MAIN_SPEAK + "_u_" + MID + "_" + this.playid;
		}
		this.mouseDownListener = new util.Listener(this);
		this.callSpeaker = function (fnName) {
			var args = slice.call(arguments, 1);
			var speaker = this.speaker;
			if (speaker[fnName]) {
				speaker[fnName].apply(speaker, args);
			}
		};
		util.runReady(this, 'callSpeaker');
		this.init();
	}
	receiveVideo.prototype = {
		play: function () {
			this.speaker.play(this.streamName);
		},
		getVideoTitle: function () {
			return htmldecode(this.videoName) + RECEIVE_TEXT_MAP[this.receiveType];
		},
		init: function () {
			var self = this;
			this.getPMS(function (pms) {
				self.run(pms);
			})
		},
		getPMS: function (run) {
			if (window.DMC) { //DMC获取流服务器地址
				$jsonp(DMC, {
					method : "play",
					stream : this.streamName,
					domain : window.DMC_DOMAIN || "",
					confid : MID
				}, function (url) {
					if (!url) {
						Win.alert("DMC服务器错误！");
					} else {
						run(url);
					}
				});
			} else {
				run(PMS);
			}
		},
		getPlugin: function (module, params) {
			var pKey = 'play_' + this.playid;
			var self = this;
			var module = 'plugin';
			if (module == 'plugin') {
				var speaker = this.speaker = window[pKey] = new PSpeaker(this.$warp[0], pKey, '', params, {
					load: function () {
						var obj = this.obj;
						var speaker = this;
						events.addEvent(obj, 'mouse_down', function(id){
							if ( id == "speakerFull") {
								obj.SwitchToFullScreen(1); 
							}
							self.mouseDownListener.fire(id);
						});
						obj.recordFileType = RECORD_FILE_TYPE;
						obj.classroomName = "接收教室_" + 
						obj.SetBackgroundColor(115, 165, 63);
						obj.AddIcon("speakerFull", getImgFullUrl('/public/img/green/fullBtn.png'), -1, -1, 5, 5, 25, 25);
						obj.AddText("", self.getVideoTitle(), 0, -1, -1, 0, 16);
						this.play();
						
						self.callSpeaker.setReady();
					}
				});
			} else {
				var speaker = this.speaker = window[pKey] = new Speaker(this.$warp[0], pKey, ROOT + '/public/stream/streamPlayer.swf', params);
				$(speaker.wrap).append('<h5>' + self.getVideoTitle() + '</h5>')
								.on('click', '.videoContBtn', function () {
									var id = this.getAttribute('data-id');
									if (id) {
										self.mouseDownListener.fire(id);
									}
								})
				this.callSpeaker.setReady();
				$win.on('beforeunload', function() {
					speaker.stop();
				});
			}
		},
		run: function (pms) {
			this.pms = pms;
			this.getPlugin(PLAYER2_MODULE, {
					id: "player_" + this.playid,
					url: pms,
					receiveType: this.receiveType,
					buffer : MEET_BUFFER,
					bufferMax : MEET_BUFFERMAX,
					bgimg : getImgFullUrl("/public/img/green/bg" + (this.index + 1) + ".png"),
					file : this.streamName
				});
		},
		setNetInfo: function (info) {
			var title = ["当前教室网络状况很差。", "当前教室网络状况较差。", "当前教室网络状况一般。", "当前教室网络状况较好。", "当前教室网络状况很好。"];
			this.speaker.setNetInfo(info, title[info-1], getImgFullUrl('/public/img/green/network' + info + '.png'));
		}
	}
	
	var receiveGruop = window.receiveGruop = (function () {
		var tab = [];
		var map = {};
		return {
			push: function (recVideo, playid) {
				tab.push(recVideo);
				map[playid] = recVideo;
			},
			loadVideos: function () {
				var rooms = RECEIVE_ROOMS;
				for (var i = 0, len = rooms.length; i < len; i++) {
					console.log(rooms[i]);
					this.push(new receiveVideo($('#player' + rooms[i].clsClassroomId + ' .videoCont'), {
							playid: rooms[i].clsClassroomId,
							videoName: rooms[i].schoolName,
							receiveType: rooms[i].receiveType,
							index: i
						}), rooms[i].clsClassroomId);
						
				}
			},
			getReceiveVideo: function (playid) {
				//console.log(map);
				return map[playid];
			},
			getReceiveVideoTab: function (index) {
				return tab[index];
			},
			receiverNames: function () {
				var tab = [];
				var rooms = RECEIVE_ROOMS;
				for (var i = 0, len = rooms.length; i < len; i++) {
					tab.push(rooms[i].schoolName);			
				}
				return tab.join(',')
			},
			eachCallFn: function (fnName) {
				var args = slice.call(arguments, 1);
				if ($.isFunction(fnName)) {
					for (var playid in map) {
						fnName.apply(map[playid], args);
					}
				} else {
					for (var playid in map) {
						map[playid][fnName].apply(map[playid], args);
					}
				}
				
			},
			oneCallFn: function (playid, fnName) {
				var args = slice.call(arguments, 2);
				if ($.isFunction(fnName)) {
					fnName.apply(map[playid], args);
				} else {
					if (map[playid] && map[playid][fnName]) {
						map[playid][fnName].apply(map[playid], args);
					}
				}				
			},
			oneCallFnIndex: function (index, fnName) {
				var args = slice.call(arguments, 2);
				console.log(tab[index], tab[index][fnName]);
				if (tab[index] && tab[index][fnName]) {
					tab[index][fnName].apply(map[index], args);
				}				
			}
		}
	})();
	
	var publishVideo = (function () {
		var myHDPlugin;
		return {
			init: function () {
				if (ROLE == 2) {
					this.winSize = noop;
					return;
				}
				window.ViceClassEvent = noop;			
				var self = this;
				if (ROLE == 0) {
					this.streamName = "class_" + MAIN_SPEAK + "_u_" + MID + "__main";
				} else {
					this.streamName = "class_" + MAIN_SPEAK + "_u_" + MID + "_" + UID; 
				}
				if (isFlashRoom()) {
					this.$box = $('<div class="publish-list"></div>').appendTo('.myWrapper');
				} else {
					this.$box = $('<div class="pluginBox"></div>').appendTo('body');
				}
				this.getPMS(function (pms) {
					self.run(pms);
				})
			},
			getPMS: receiveVideo.prototype.getPMS,
			getPlugin2: function () {
				var params = {
					meetType : 'mix',
					code : 'class',
					width : ViceResolution,
					quality : ViceQuality,
					fps : ViceFrame,
					url : this.pms,
					mid : MAIN_SPEAK,
					gain : 100,
					useEnhMic : UseEnhMic,
					echoPath : EchoPath,
					myid : MID + "_" + UID,
					isSpeaker: 1
				};
				if (PUBLISH2_CODEC) {
					params.codec = PUBLISH2_CODEC;
				}
				
				var self = this;
				self.publishIndex = 0;
				this.speakerMap = {};
				self.createSpeaker(0, params);
				events.addEvent(window, 'beforeunload', function(){
					if (self.publishSpeaker) {
						self.publishSpeaker.unPublish();
					}
				});
				if (CV5 == 1) {
					setInterval(function () {
						if (self.publishSpeaker) {
							var json = self.publishSpeaker.getStreamInfo();
							if (json.bufferLength == 0) return;
							COCO.callOne(MAIN_SPEAK, "ViceClassEvent", 1, UID, [json.bufferLength,json.bufferTime,json.bufferTimeMax].join(','), +new Date());
						}
					}, 5000);
				}
				this.winSize = noop;
				/*
				$doc.on('click', '.publish-item-cover', function () {
					console.log('.publish-item-cover');
					self.cameraIndex = $(this).parent().attr('data-cameraIndex');
					self.publish();
				})*/
			},
			publish: function () {
				if (this.publishSpeaker) {
					this.publishSpeaker.unPublish();
				}
				this.publishSpeaker = this.speakerMap['play_' + MAIN_SPEAK + '_' + this.cameraIndex];
				if (MAIN_ROOM.receiveType == 'all') this.publishSpeaker.publish();
			},
			createSpeaker: function(cameraIndex, params) {
				var pkey = 'play_' + MAIN_SPEAK + '_' + cameraIndex;
				var self = this;
				var $elm = $('<div class="publish-item" data-cameraIndex="' + cameraIndex + '"><div class="publish-select"></div>').appendTo(this.$box);
				var cameraNames;
				$elm.on('change', 'select', function () {
					speaker.selectCam(this.value);
				})
				var speaker = this.speakerMap[pkey] =  window["asdasdasd1"] = new Speaker($elm[0], "asdasdasd1", ROOT + "/public/stream/speakerVideo.swf", params, {
					linkup: function() {
						//if (speaker.cameraIndex == self.publishIndex) {
							self.publish();
						//}
					},
					onInsufficientBW: function () {
						if (CV5 == 1) {
							if (speaker.cameraIndex == self.publishIndex) {
								COCO.callOne(MAIN_SPEAK, "ViceClassEvent", 2, UID, "warning");
							}
						}
					},
					load: function() {
						setTimeout(function() {
							if (self.cameraNames === undefined) {
								
								cameraNames = self.cameraNames = speaker.obj.getCameraNames();
								var cameraNum = self.cameraNum  = speaker.obj.getCameraNum();
								speaker.selectCam(cameraIndex);
								console.log('self.cameraNames', cameraNames);
								var html = [];
								for (var i = 0; i< cameraNum; i++) {
									html.push('<option value="' + i + '"' + (i == cameraIndex?'selected':'') + '>' + cameraNames[i] + '</option>')
								}
								
								$elm.find('.publish-select').html('<select class="publish-camera">' + html.join('') + '</select>');
								/*if (cameraNum > 1) {
									for (var i = 1; i < cameraNum; i++) {
										self.createSpeaker(i, params)
									}
								}*/
							}
						}, 0); 
					}
				});
				speaker.cameraIndex = cameraIndex;
			},
			getPlugin: function () {
				var self = this;
				
				window.hdPluginLoaded = function () {
					self.plugin = $id("hdPlugin");
					self.pluginLoad();
				}
				this.$box.html('<object id="hdPlugin" type="application/x-codyymultihd" width="100%" height="100%" >\
						<param name="onload" value="hdPluginLoaded" />\
						<param name="pluginType" value="publisher" />\
					</object>');
			},
			winSize: function () {
				var $elm = $('.pluginTarget');
				var offset = $elm.offset();
				//console.log(this.$box);
				this.$box.css({
					left: offset.left + 1,
					top: offset.top + 1,
					width: $elm.width(),
					height: $elm.height()
				})
			},
			run: function (pms) {
				this.pms = pms;
				console.log(ROLE, STYPE);
				if (isFlashRoom()) {
					this.getPlugin2();
				} else {
					this.getPlugin();
				}
			},
			netCheck2: function () {
				//网络情况返回
				var lowTimeId = 0;
				var netWorkConfirm;
				window.ViceClassEventBack = function (res, lowTimes) {
					var $elm = $(".network");//显示在title上面
					var info = ["当前教室网络状况很差。", "当前教室网络状况较差。", "当前教室网络状况一般。", "当前教室网络状况较好。", "当前教室网络状况很好。"];
					var l = Math.ceil(res/20);
					if (l == 0) {
						l = 1;
					}
					$elm[0].className = "network network" + l;
					$elm.attr('title', info[l-1]);
					if (lowTimes == 5) {
						//暂时不开启
						if (getcookie("netWorkConfirm") != "off") {
							if (Win.wins["netWorkConfirm"]) return;
							netWorkConfirm = Win.open({
								id: 'netWorkConfirm',
								width: 312,
								title: "温馨提示",
								html: '<div class="networkWarp">\
										<span class="networkBox">\
											<div >老师您好，目前网络状况【<span class="networkLow">较差</span>】</div>\
											<div ><span class="networkCkBox">&nbsp;</span>不再提醒</div>\
											<div class="networkBtns"><a onclick="return false;" href="javascript:;" class="cancelBtn"><span>确定</span></a></div>\
										</span>\
										</div>'
							});
							var $networkCkBox = $('.networkCkBox', netWorkConfirm.dom).on('click', function () {
								var $elm = $(this);
								if ($elm.hasClass('sel')) {
									$elm.removeClass('sel');
								} else {
									$elm.addClass('sel');
								}
							})
							$('.cancelBtn', netWorkConfirm.dom).on('click', function () {
								clearTimeout(lowTimeId);
								netWorkConfirm.close();
								if ($networkCkBox.hasClass('sel')) {
									setcookie("netWorkConfirm", 'off', {expires: 7 * 24 * 60 * 60 * 1000})
								}
							})
							lowTimeId = setTimeout(function () {
								netWorkConfirm.close();
							}, 5000);
						}
					}
				}
			},
			netCheck: function () {
				var NETWORK_LOW_TIMES = 0;
				var lowTimeId = 0;
				var netWorkConfirm;
				window.ViceClassEvent = function (type, playid , pars, time) {
					if (type == 1) {
						pars = pars.replace(/(\d+)(\.\d+)?(,|$)/g, function (a,b,c,d){
						  return b + (c||".0") + d
						})
					}
					var res = myHDPlugin.ViceClassEvent(type, playid , pars, ""+time);
					var info = Math.ceil(res/20);
					if (info == 0) {
						info = 1;
					}
					if (info == 1) {
						NETWORK_LOW_TIMES++;
					} else {
						NETWORK_LOW_TIMES = 0;
					}
					receiveGruop.getReceiveVideo(playid).setNetInfo(info);
					
					if (NETWORK_LOW_TIMES == 5) {//5次提示
						if (getcookie("netWorkConfirm") != "off") {
							if (Win.wins["netWorkConfirm"]) return;//框存在
							netWorkConfirm = Win.open({
								id: 'netWorkConfirm',
								width: 400,
								title: "温馨提示",
								html: '<div class="networkWarp">\
										<span class="networkBox">\
											<div >老师您好，目前' + receiveGruop.getReceiveVideo(playid).videoName + '的网络状况【<span class="networkLow">较差</span>】</div>\
											<div ><span class="networkCkBox">&nbsp;</span>不再提醒</div>\
											<div class="networkBtns"><a onclick="return false;" href="javascript:;" class="cancelBtn"><span>确定</span></a></div>\
										</span>\
										</div>'
							});
							var $networkCkBox = $('.networkCkBox', netWorkConfirm.dom).on('click', function () {
								var $elm = $(this);
								if ($elm.hasClass('sel')) {
									$elm.removeClass('sel');
								} else {
									$elm.addClass('sel');
								}
							})
							$('.cancelBtn', netWorkConfirm.dom).on('click', function () {
								clearTimeout(lowTimeId);
								netWorkConfirm.close();
								if ($networkCkBox.hasClass('sel')) {
									setcookie("netWorkConfirm", 'off', {expires: 7 * 24 * 60 * 60 * 1000})
								} else {
									NETWORK_LOW_TIMES = 0;
								}
							})
							lowTimeId = setTimeout(function () {
								netWorkConfirm.close();
							}, 5000);
						}
					}
					COCO.callOne(playid, "ViceClassEventBack", res, NETWORK_LOW_TIMES);
				}
			},
			pluginLoad: function () {
				var plugin = this.plugin;
				if (ROLE == 0) {
					try {
						plugin.Update = parseInt("<?=$isUpdate?>"||0, 10); //设置自动更新
						var freeSpace = plugin.FreeSpace; //录制磁盘空间剩余
						switch(true){
							case freeSpace <= 200 :
								Win.notice("<span class='orange'>磁盘空间过低，系统将暂停录制，请及时清理磁盘空间,保证空间2G以上。</span>",5000);
								break;
							case freeSpace > 200 && freeSpace <= 500 :
								Win.notice("<span class='orange'>磁盘空间已不足500M，如不清理，将影响录制。</span>",5000);
								break;
							case freeSpace > 500 && freeSpace <= 1024 :
								Win.notice("磁盘空间已不足1G，请注意清理。",5000);
								break;
						}
					} catch (e) {}
					//以下两个属性用于设置本地录制的文件夹
					if (CV5 == 1) {
						plugin.UploadServer = UPLOAD_SERVER;
						plugin.UploadCallBack = UPLOAD_HOST + URL_PATH + 'updateVideoUpload.do?mid=' + MID;			
						this.netCheck();					
					}
				}
				
				plugin.isVideoStitch = (SKEY == 2? 0: SKEY);//***是不是主讲教室，有没有机位，后台;
				LAST_CLASSROOM_ID = plugin.classroomId;
				plugin.classroomId = MID;
				plugin.classroomName = UNAME;
				plugin.userId  = UID;
				
				if (ROLE == 0) {
					plugin.receiverNames = receiveGruop.receiverNames();
					events.addEvent(plugin, 'ReceShareMem', function (index, shareName) {
						console.log('ReceShareMem', index, shareName);
						receiveGruop.oneCallFnIndex(index, 'callSpeaker', 'setSharedName', shareName);
					});
					plugin.recordFileType = RECORD_FILE_TYPE;//***1: 录制为"flv"; 2：录制为"mp4";
					//***recordTime 页面获取，显示
					plugin.recordFolderName = DATETIME + '朱颜(第2节)' ;//***录制文件文件夹;
					plugin.webUploadUrl = WEN_UPLOAD_URL;
				}
				console.log(this.pms, this.streamName);
				plugin.SetRtmpUrl(this.pms);
				plugin.SetRtmpStream(this.streamName);
				//***plugin.SetResolution(w, h);设置分辨率
				//***PreviewWindow没调
				
				console.log("pluginLoad pluginLoad");
				director.hasRemote = hasRemote;
				director.init();
				director.setPlugin();
				if (hasRemote()) {			
					director.remoteRtmpUrl(PMS_REMOTE_URL);
					for (var i = 0; i < 10; i++) {
						director.remoteRtmpStream(i, "class_" + UID + "_u_" + MID + "_" + i + "__main");
					}					
				}
				
				if (MAIN_ROOM.receiveType == 'all') plugin.Run();
				receiveGruop.eachCallFn('callSpeaker', 'recordFileType', RECORD_FILE_TYPE);
				receiveGruop.eachCallFn('callSpeaker', 'recordFilePath', plugin.recordFilePath);
				
				//if (hasRemote()) {			
					director.onPluginLoaded();
				//}
				if (ROLE == 0) {
					recordState.onPluginLoaded(IS_RECORD, LAST_CLASSROOM_ID!=MID);
					recordState.initPage(director.module.recordState.getInitData());
				}
				events.addEvent(plugin, 'FullScreen', function (videoMain) {
					keyControl.clickMainSpeaker()
				});
				
				if (ROLE == 0) {
					
					if (PAGE_MODE == 'f2fMode') {
						pageMode.setPageMode('f2fMode');
					}
					
					setTimeout(function () {
						var videoData = director.module.videoBar.getInitData();
						var videoMap = videoData.videoBarData.map;
						var obj;
						var j = 0;
						for (var i = 1; i < 10; i++) {
							obj = videoMap[i];
							if (!obj) break;
							if (obj.isReceiver) {
								var $video = $('.videoReceive:eq(' + j + ')');
								var playid = $video.attr('playid');
								if ($video.length > 0) {
									$video.attr('data-key', i);							
									var receiveVideo = receiveGruop.getReceiveVideo(playid);
									receiveVideo.videoIndex = i;
								}
								j++;
							}
						}
					}, 3000);
					if (MAIN_SCREEN) {
						teachingMode.setSpeak(MAIN_SCREEN);
					}	
				}
			}
		}
	})();
	
	
	var recordState = (function (undefine) {
		var $record, $stop, $recordTime, $warp;
		var timeId;
		var stateMap = ['on', 'pause', 'stop'];
		var getTimeStr = function (n) {
			var ary = [];
			for (var i = 2; i >= 0; i--) {
				var m = n % 60;
				ary[i] = m < 10? ('0' + m) : m;
				n = (n /60) >> 0;
			}
			return ary.join(':');
		}
		window.NEXT_RECORD_STATE = 500;
		var recordState = {
			state: 'stop',
			isDisabled: false,
			time: 0,
			/*
			changeListener: new util.Listener(),
			extendDirector: function (director) {
				var self = this;
				director.isRecord = function () {
					return self.state != 'stop';
				}
			},*/
			disabled: function () {
				if (!this.isDisabled) {
					this.isDisabled = true;
					$record.addClass('disabled');
					$record.attr('_title', $record.attr('title'));
					$record.attr('title', "请先清理内存，保证2G以上");
				}
			},
			enabled: function () {
				if (this.isDisabled) {
					this.isDisabled = false;
					$record.removeClass('disabled');
					$record.attr('title', $record.attr('_title'));
					$record.attr('_title', null);
				}
			},
			html: function (flag) {
				var state = this.state;
				if (state == 'on') {
					$record[0].className = 'copy ing';
					$stop[0].className = 'stop enable';
					$record.attr('title', "正在录制中,点击暂停");
				} else if (state == 'pause') {
					$record[0].className = 'copy pause';
					$stop[0].className = 'stop enable';
					$record.attr('title', "已暂停,点击继续");
				} else if (state == 'stop') {
					if (this.isDisabled) {
						$record[0].className = 'copy disabled';
						$stop[0].className = 'stop';
						$record.attr('_title', "点击开始录制");
					} else {
						$record[0].className = 'copy';
						$stop[0].className = 'stop';
						$record.attr('title', "点击开始录制");
					}
				}
				var self = this;			
				if (state == 'on') {
					if (!timeId) {
						timeId = setInterval(function () {
							if (self.state != 'stop' && self.state != 'pause') {
								$recordTime.html(getTimeStr(++self.time));
							}
						}, 1000);
					}
				} else {
					if (timeId) {
						clearInterval(timeId);
						timeId = 0;
					}
				}
				$warp.show();
				setTimeout(function () {
					$warp.hide();
				}, NEXT_RECORD_STATE);
				if (!flag) {
					director.recordState(stateMap.indexOf(this.state));
					//remote.call('recordState', stateMap.indexOf(this.state));
				}
			},
			next: function () {
				if (this.isDisabled)  {
					return;
				}
				var state = this.state;
				if (state == 'stop') {
					this.state = 'on';
					$recordTime.html(getTimeStr(0));
				} else if (state == 'on') {
					this.state = 'pause';
				} else if (state == 'pause') {
					this.state = 'on';
				}
				//this.changeListener.fire(this.state);
				this.html();
			},
			stop: function () {
				if (this.state != 'stop') {
					this.state = "stop";
					this.time = 0;
					this.html();
					//this.changeListener.fire(this.state);
				}
			},
			init: function () {
				var self = this;
				$record = $('.control-box .copy').on('click', function () {
					self.next();
				});
				$stop = $('.control-box .stop').on('click', function () {
					self.stop();
				});
				$recordTime = $('#recordTime');
				$warp = $('.control-box-warp');
				director.recordStateChangeListener.add(function (state) {
					self.initPage(this.getInitData());
				})
			},
			onPluginLoaded: function (isRecord, isNewRoom) {
				this.initPage({recordTime:0, recordState: 2});
				if (isNewRoom) {
					if (isRecord) {//开始录制
						this.next();
					}
				} else {
					if (director.recordState() == 0) {//开始录制
						this.next();
					}
				}
			},
			initPage: function (json) {
				this.time = json.recordTime || 0;
				this.state = stateMap[json.recordState];
				this.html(true);
			}
		}
		if (ROLE == 0) {
			recordState.init();
		}
		return recordState;
	})();
	
	
	var SHOW_CLASS_ROOM = [];
	var moreMenu = window.moreMenu = (function () {
		var $menu = $('#moreOpts'); 
		var $item = $('#moreApps');
		return {
			init: function () {
				$doc.on('click', function () {
					$item.addClass("hidden");
				});
				$menu.on('click', function () {
					if ($item.hasClass("hidden")) {
						$item.removeClass("hidden");
					} else {
						$item.addClass("hidden");
					}
					return false;
				})
				this.addBranch();
				this.openRecordFile();
				this.talkSet();
				this.picMode();
				this.finishClass();
				this.quitClass();
			},
			addBranch: function () {
				for (var i = 0, len = RECEIVE_ROOMS.length; i < len; i++) {
					SHOW_CLASS_ROOM.push(RECEIVE_ROOMS[i].clsClassroomId);
				}
				window.selectReceiveRooms = function (roomIds) {
					$.post(ROOT + URL_PATH + "editReceiveClassroomSave.do", {
						mid: MID,
						classroomIdStr: roomIds
					}, function (data) {
						COCO.callAll("location.reload()");
						setTimeout(function(){
							location.reload(true);
						}, 300);
					});
				};
				$('#addBranchBtn').on('click', function () {
					Win.open({
						id: 'addBranchWin',
						width: 600,
						height: 600,
						title: '添加接收教室',
						url: ROOT  + URL_PATH + 'editReceiveClassroom.html?callback=selectReceiveRooms&mid=' + MID + '&classRooms=' + SHOW_CLASS_ROOM.join(',') + '&reomveRooms=' + UID
					});
				});
			},
			openRecordFile: function () {
				$('#openRecordFileBtn').on('click', function () {
					director.openRecordFileDir();
				});
			},
			picMode: function () {
				var self = this;
				var $dialog;
				var getSelectHtml = util.getSelectHtml;
				var tmpl = util.template($('#picModeTmpl').html());
				var trTmpl = util.template($('#picModeTrTmpl').html());
				var picModeDataTmp;
				var mainData;
				$('#picModeBtn').on('click', function () {
					mainData = director.module.videoBar.getInitData();
					var picModeData = director.getPicModeData().picModeData;

					var barNum = director.getMaxIndex(mainData.videoBarData.map) -1;
					var winTab = [1,2,3,4,5,6,7,8,9];
					winTab.length = barNum;				
					var dialog = Win.open({
						title: "画面模式设置",
						width: 760,
						mask: true,
						html: tmpl({data: picModeData, videoBarData: mainData.videoBarData, winTab: winTab, action: 'pip'})
					});
					$dialog = $(dialog.dom);
					$dialog.on('click', '.dialog-add-btn', function () {
						var action = $dialog.find('.pop-tab-nav a.selected').attr('data-action');					
						var num = picModeData[action + 'Num'];
						var map = {};
						$dialog.find('tr').each(function (index) {
							if (index > 0) {
								var winIndex = this.getAttribute('data-winIndex');
								var tab = map[winIndex] = [];
								$(this).find('.picmode-select').each(function () {
									tab.push(this.value);
								})
								map[winIndex] = tab;
							}	
						});
						picModeData[action + 'Map'] = map;
						var pos = picModeData[action + 'Pos'] = $dialog.find("input:checked").val();
						director.updatePicMode(action, num, map, pos);
						dialog.close();
					}).on('click', '.dialog-close-btn', function () {
						dialog.close();
					}).on('click', '.pop-tab-nav a', function () {
						var $elm = $(this);
						var action = $elm.attr('data-action');
						if (!$elm.hasClass('selected')) {
							$elm.addClass('selected').siblings().removeClass('selected');
							$dialog.find('.dialog_Cont').html(tmpl({data: picModeData, videoBarData: mainData.videoBarData, winTab: winTab, action: action}));
						}
					});
					picModeDataTmp = $.extend(true, {}, picModeData);
				});
				
				$doc.on('change', '.picmode-select', function () {
					var action = $dialog.find('.pop-tab-nav a.selected').attr('data-action');
					var $tr = $(this).parents('tr');
					var winIndex = $tr.attr('data-winIndex');
					var tab = [];
					var _v = this.value;
					var elm = this;
					$tr.find('.picmode-select').each(function (index) {
						if (_v != '-1' && _v == this.value && elm != this) {
							tab.push(-1);
						} else {
							tab.push(this.value);
						}
					})
					picModeDataTmp[action + 'Map'][winIndex] = tab;
					$tr.html(trTmpl({
						action: action,
						winTab: [winIndex],
						data: picModeDataTmp, 
						videoBarData: mainData.videoBarData
					}));
				});
			},
			talkSet: function () {
				$('#talkSetBtn').on('click', function () {
					var html = ['<div class="setTalk"><h2>您可以选择停止接收以下学校的音视频信号</h2>'];
					if (RECEIVE_ROOMS.length > 0) {
						html.push('<ul class="setTalk-list">');
						var isCheckAll = true;
						for (var i = 0, len = RECEIVE_ROOMS.length; i < len; i++) {
							if (RECEIVE_ROOMS[i].receiveType != 'all' && RECEIVE_ROOMS[i].clsClassroomId != UID) {
								isCheckAll = false;
								break;
							}
						}
						html.push('<li>\
										<label class="room-type"></label>\
									   	<label class="room-title"></label>\
									   	<label><input type="checkbox" class="sel-all" ' + (isCheckAll?' checked ':'') + '>全选</label>\
									   	<label></label>\
									   </li>')
						//clsClassroomId
						var lastGroupName = "";
						for (var i = 0, len = RECEIVE_ROOMS.length; i < len; i++) {
							var room = RECEIVE_ROOMS[i];
							var gName = room.isMain? '主讲教室' : '接收教室';
							html.push('<li>\
										<label class="room-type">' + (gName==lastGroupName?'':gName) + '</label>\
									   	<label title="' + room.schoolName + '" class="room-title">' + room.schoolName + ' : </label>\
									   	<label><input type="checkbox" value="' + room.clsClassroomId + '" ' + (room.receiveType == 'all'||room.receiveType == 'audio'?' checked ':'') + ' name="audio">音频信号</label>\
									   	<label><input type="checkbox" value="' + room.clsClassroomId + '" ' + (room.receiveType == 'all'||room.receiveType == 'video'?' checked ':'') + ' name="video">视频信号</label>\
									   </li>');
							lastGroupName = gName;
						}
						html.push('</ul>');
					}
					if (ROLE != 2) {
						html.push('<div class="setTalk-self"><em>本地音视频信号 : </em>\
									<span>\
										<label><input name="selfTalk" type="radio" ' + (MAIN_ROOM.receiveType == 'all'? ' checked ':'') + ' value="all" >开启</label>\
										<label><input name="selfTalk" type="radio" ' + (MAIN_ROOM.receiveType != 'all'? ' checked ':'') + ' value="" >关闭</label>\
									</span>\
								</div>\
								<p class="setTalk-mess">说明：本地音视频关闭后，其他教室将无法接收到您的信号.</p>\
								<p>\
									<a href="javascript:;" class="btn set-btn">确定</a>\
								</p>');
					} else {
						html.push('<div class="setTalk-self" style="height: 0;"></div>\
							<p>\
								<a href="javascript:;" class="btn set-btn">确定</a>\
							</p>');
					}
					var dialog = Win.open({
						id: 'talkSetWin',
						title: '音视频设置',
						width: 600,
						html: html.join('')
					});
					var $dialog = $(dialog.dom);
					var $items = $dialog.find('.setTalk-list input:gt(0)');
					var $selAll = $dialog.find('.sel-all').on('click', function () {
						var checked = this.checked;
						$items.each(function () {
							this.checked = checked;
						})
					})
					$items.on('click', function () {
						var checked = this.checked;
						var flag = true;
						$items.each(function () {
							if (this.checked != checked) {
								flag = false;
								return false;
							}
						})
						$selAll[0].checked = flag?checked: false;
					})
					$dialog.find('.set-btn').on('click', function () {
						var res = {
							audio: [],
							video: []
						};
						$items.each(function () {
							if (!this.checked)
								res[this.name].push(this.value);
						})
						$('.setTalk-self input').each(function () {
							if (this.checked) {
								if (this.value != 'all') {
									res.audio.push('self')
									res.video.push('self')
								}
							}
						})
						setcookie("signalOffAudio" + MID, res.audio.join(','));
						setcookie("signalOffVideo" + MID, res.video.join(','));
						window.location.reload(true);
					})
				})
			},
			finishClass: function () {
				$('.closeClassBtn').on('click', function () {
					if (interactMode.hasSpeaking()) {
						return Win.alert("当前为互动课堂模式，请先取消互动课堂再结束！");
					}
					Win.confirm({
						html:"<p class='noticeWrap'><span>确定要结束课堂吗？</span></p>",
						id:'confirm',
						width:250
					}, function() {
						$.post(ROOT + URL_PATH + 'finishCourse.do',{type: 'master', mid: MID}, function(data) {
							if (data.result) {
								COCO.callAll('moreMenu.finishClass2');
								if(URL_PATH == "/live/appointment/") {
									location.replace(ROOT + '/live/appointment/liveIndex.html');
								} else {
									location.replace(ROOT + '/class/room/onlineClass/' + data.message + '.html');
								}
							}
						});
					}, function(){});
				})
			},
			finishClass2: function () {
				if (ROLE == 1) {
					Win.confirm("对不起，该课堂已结束！", function() {
						if(URL_PATH == "/live/appointment/") {
							location.replace(ROOT + '/live/appointment/liveIndex.html');
						} else {
							location.replace(ROOT + '/class/room/onlineClass/' + SKEY + '.html');
						}
					});
				} else {
					Win.confirm("对不起，该课堂已结束！", function() {
						location.reload();
					});
				}	
			},
			quitClass: function(){
				$('.quitClassBtn').on('click', function () {
					Win.confirm({
						html: "<p class='noticeWrap'><span>确定要退出课堂吗？</span></p>",
						id: 'confirm',
						width: 250
					}, function () {
						if (ROLE == 2) {
							$.post(ROOT+ URL_PATH +'finishCourse.do', {type: 'guest', mid: MID}, function(data) {
								if (data.result) {
									if(WORKSPACE == 1) {
										window.close();
									} else {
										location.replace(ROOT + URL_PATH +'guestLoginOut.do?mid=' + MID);
									}
								} 
							},'json');
						} else if (ROLE == 1) {
							$.post(ROOT+ URL_PATH +'finishCourse.do', {type: 'receive', mid: MID}, function(data){
								if (data.result) {
									if(URL_PATH == "/live/appointment/") {
										location.replace(ROOT + '/live/appointment/liveIndex.html');
									} else {
										location.replace(ROOT + '/class/room/onlineClass/' + data.message + '.html');
									}
									
								} 
							},'json');
						}
					}, function(){});
				})
				
			}
		}
	})();
	return {
		addVideos: function () {
			var i = 0;
			var html = [];
			if (RECEIVE_ROOMS.length> 0) {//多个教室，4分屏幕
				this.roomXY = [2, 2];
				html.push('<div class="videoWrap videoMenuMode"><div class="videoCont"></div></div>');
				var len = RECEIVE_ROOMS.length;
				len = len < 3 ? "3" : len; 
				for (i = 0; i < len; i++) {
					var obj = RECEIVE_ROOMS[i];
					if (obj) {
						html.push('<div class="videoWrap videoReceive" id="player' + obj.clsClassroomId + '"  playid="' + obj.clsClassroomId + '">\
										<div class="videoCont"></div>\
									</div>')
					} else {
						html.push('<div class="videoWrap videoReceive"><div class="videoCont"></div></div>');
					}
				}
				html.push('<div class="videoWrap video4Mode"><div class="videoCont"></div></div>');
			} else {
				this.roomXY = [1, 1];
				html.push('<div class="videoWrap videoMenuMode"><div class="videoCont"></div></div>');
				html.push('<div class="videoWrap video4Mode"><div class="videoCont"></div></div>');
			}		
			$('.leftVideos').append(html.join(''));
		},
		winSize: function () {//根据videoWrap，进行处理
			//var _reSizeTime;
			$win.on("resize", function() {
				//clearTimeout(_reSizeTime);
				//_reSizeTime = setTimeout(function(){
				pageMode.winSize();
				//}, 200);
			})
			//pageMode.winSize();
		},
		talkSetInit: function () {
			var audio = ',' + getcookie("signalOffAudio" + MID) + ',';
			var video = ',' + getcookie("signalOffVideo" + MID) + ',';
			for (var i = 0, len = RECEIVE_ROOMS.length; i < len; i++) {
				var id = ',' + RECEIVE_ROOMS[i].clsClassroomId + ',';
				var receiveType = 3;
				if (audio.indexOf(id) != -1) {
					receiveType -= 2;
				}
				if (video.indexOf(id) != -1) {
					receiveType -= 1;
				}
				RECEIVE_ROOMS[i].receiveType = RECEIVE_TEXT_MAP[receiveType];
			}
			var receiveType = 3;
			if (audio.indexOf(',self,') != -1) {
				receiveType -= 2;
			}
			if (video.indexOf(',self,') != -1) {
				receiveType -= 1;
			}
			MAIN_ROOM.receiveType = RECEIVE_TEXT_MAP[receiveType];
		},
		keydown: function () {
			var keydownListener = this.keydownListener = new util.Listener();
			var keyMap = {
				37: 'left',
				38: 'up',
				39: 'right',
				40: 'down',
				13: 'ok'
			}
			$doc.on('keydown', function (e) {
				var nodeName = e.target.tagName.toLowerCase();
				if (nodeName == 'input' || nodeName == 'textarea') {
					return;
				}
				if ($('#masker').length > 0) return;//有弹出层时，不响应键盘操作
				//console.log(e.which);
				keydownListener.fire(keyMap[e.which] || e.which);
				return false;
			});
			keydownListener.add(function (key) {
				var playid;
				switch (key) {
					case 'mainClass':
						pageMode.setPageMode('teachingMode');
						teachingMode.setSpeak();
						break;
					case 'sub1':
					case 'sub2':
					case 'sub3':
						var index = key.replace('sub', '') - 1;
						var playid = $('.videoReceive:eq(' + index + ')').attr('playid');
						pageMode.setPageMode('teachingMode');
						if (playid) {
							teachingMode.setSpeak(playid);
						}
						break;
					case 'source1':
					case 'source2':
					case 'source3':
					case 'source4':
					case 'source5':
					case 'source6':
						var index = key.replace('source', '') - 1;
						pageMode.setPageMode("myVideoMode");
						myVideoMode.keySel(key);
						break;
					case 'winMode':
					case 'interactMode':
					case 'myVideoMode':
						pageMode.setPageMode(key);
						break;
					case 'recordON':
						$('.control-box .copy').click();
						break;
					case 'recordOff':
						$('.control-box .stop').click();
						break;
				}
			})
		},
		init: function () {
			this.talkSetInit();
			this.addVideos();
			lessonMode.init();
			
			publishVideo.init();
			
			receiveGruop.loadVideos();
			pageMode.init();
			this.keydown();
			
			if (PADSHOW) {
				pageMode.setPageMode("ePadMode");
			} else {
				pageMode.setPageMode('teachingMode');
				/*
				if (PAGE_MODE == 'f2fMode' && ROLE == 0) {
					pageMode.setPageMode('f2fMode');
				} else {
					pageMode.setPageMode('teachingMode');
				}*/
			}
			
			moreMenu.init();
			this.winSize();
			//Screen.setMainScreen("${mainScreenId}");
			
			director.recordStateChangeListener.add(function (state) {
				receiveGruop.eachCallFn('callSpeaker', "recordState", state);
			})
			if(ROLE==0 || ROLE==1){
				setInterval(function(){
		       		$.post(ROOT + URL_PATH + "updateLeftTime.do", {mid: MID, uid: UID, role: ROLE},function(msg){
		       			if(msg.result == false) {
		       				location.reload(true);
		       			}
		       		},'json');
		    	}, refreshTime*1000);
			}
			if(ROLE == 2){
				//定时更新来宾离开时间
				setInterval(function(){
			        $.post(ROOT+URL_PATH+"updateGuestEndTime.do",{guestId:guestId},function(){});
			    },refreshTime*1000);
			}
			
			if (ROLE == 0) {
				if (MAIN_SCREEN) {
					//teachingMode.setSpeak(MAIN_SCREEN);
				}
			} else {
				teachingMode.setSpeak2(MAIN_SCREEN);
			}
			return this;
		}
	}
})();
page.init();