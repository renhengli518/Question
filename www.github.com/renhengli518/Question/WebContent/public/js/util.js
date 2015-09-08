var util = (function($) {
    var exports = {};
    var $win = $(window);
    var $doc = $(document);
    var doc = document;

    var flashId = 1;
    var getRandomFlashId = function() {
        return "coddyFlash" + (flashId++);
    }
    var getUUID = function() {
        return flashId++;
    }
    var noop = function() {};

    var flashPlayer = function(wrap, url, id, cssText) {
        id = id || getRandomFlashId();
        cssText = cssText || 'style="width:100%;height:100%;"';
        var wrapBox = wrap || doc.body;
        var f = (url.indexOf("?") > 0 ? url : url + "?").split("?");
        var u = [f.shift(), f.join("?")];
        var html = '<embed src="' + u[0] + '" name="' + id + '" pluginspage="http://www.macromedia.com/shockwave/download/index.cgi?P1_Prod_Version=ShockwaveFlash"  type="application/x-shockwave-flash" allownetworking="all" allowfullscreen="true" allowFullscreenInteractive="false" allowscriptaccess="always" FlashVars="' + u[1] + '" ' + cssText + ' wmode="opaque" ></embed>';
        html = '<object classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000" codebase="http://fpdownload.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=11,0,0,0" ' + cssText + ' id="' + id + '"><param name="wmode" value="opaque" ><param value="true" name="allowFullScreen"><param value="always" name="allowScriptAccess"><param name="AllowNetworking" value="all"><param name="movie" value="' + u[0] + '" ><param name="FlashVars" value="' + u[1] + '">' + html + '</object>';
        $(wrapBox).append(html);
        return document[id];
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(val) {
            for (var i = 0, l = this.length; i < l; i++) {
                if (this[i] === val) return i;
            }
            return -1;
        }
    }
    Array.prototype.indexOf2 = function(val) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (this[i] == val) return i;
        }
        return -1;
    }
    if (!Function.prototype.bind) {
        Function.prototype.bind = function(other) {
            var args = Array.prototype.slice.call(arguments, 1);
            var fn = this;
            var CFn = function() {};
            var res = function() {
                return fn.apply(this instanceof CFn && other ? this : other, args.concat(Array.prototype.slice.call(arguments)));
            };
            CFn.prototype = this.prototype;
            res.prototype = new CFn();
            return res;
        };
    }
    Function.prototype.before = function(func) {
        var self = this;
        return function() {
            if (func.apply(this, arguments) === false) {
                return false;
            }
            return self.apply(this, arguments);
        }
    }
    Function.prototype.after = function(func) {
        var self = this;
        return function() {
            var ret = self.apply(this, arguments);
            if (ret === false) {
                return false;
            }
            func.apply(this, arguments);
            return ret;
        }
    }

    function Listener(obj) {
        this._listener = [];
        this._thisObj = obj;
    }
    Listener.prototype = {
        add: function(fn, position) {
            position = position || 'after';
            if (position == 'after') {
                this._listener.push(fn);
            } else {
                this._listener.unshift(fn);
            }
        },
        clear: function () {
        	this._listener.length = 0;
        },
        remove: function(fn) {
            if (fn) {
                var index = this._listener.indexOf(fn);
                if (index != -1) {
                    this._listener.splice(index, 1);
                }
            } else {
                this._listener = [];
            }
        },
        fire: function() {
            for (var i = 0, len = this._listener.length; i < len; i++) {
                if (this._listener[i].apply(this._thisObj, arguments) === false) {
                    return;
                }
            }
        }
    };

    //cookie
    (function($) {
        var pluses = /\+/g;

        function encode(s) {
            return config.raw ? s : encodeURIComponent(s);
        }

        function decode(s) {
            return config.raw ? s : decodeURIComponent(s);
        }

        function stringifyCookieValue(value) {
            return encode(config.json ? JSON.stringify(value) : String(value));
        }

        function parseCookieValue(s) {
            if (s.indexOf('"') === 0) {
                // This is a quoted cookie as according to RFC2068, unescape...
                s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
            }
            try {
                // Replace server-side written pluses with spaces.
                // If we can't decode the cookie, ignore it, it's unusable.
                s = decodeURIComponent(s.replace(pluses, ' '));
            } catch (e) {
                return;
            }
            try {
                // If we can't parse the cookie, ignore it, it's unusable.
                return config.json ? JSON.parse(s) : s;
            } catch (e) {}
        }

        function read(s, converter) {
            var value = config.raw ? s : parseCookieValue(s);
            return $.isFunction(converter) ? converter(value) : value;
        }
        var config = $.cookie = function(key, value, options) {
            if (value !== undefined && !$.isFunction(value)) {
                options = $.extend({}, config.defaults, options);
                if (typeof options.expires === 'number') {
                    var days = options.expires,
                        t = options.expires = new Date();
                    t.setDate(t.getDate() + days);
                }
                return (document.cookie = [
                    encode(key), '=', stringifyCookieValue(value),
                    options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
                    options.path ? '; path=' + options.path : '',
                    options.domain ? '; domain=' + options.domain : '',
                    options.secure ? '; secure' : ''
                ].join(''));
            }
            var result = key ? undefined : {};
            var cookies = document.cookie ? document.cookie.split('; ') : [];
            for (var i = 0, l = cookies.length; i < l; i++) {
                var parts = cookies[i].split('=');
                var name = decode(parts.shift());
                var cookie = parts.join('=');
                if (key && key === name) {
                    result = read(cookie, value);
                    break;
                }
                if (!key && (cookie = read(cookie)) !== undefined) {
                    result[name] = cookie;
                }
            }
            return result;
        };
        config.defaults = {};
        $.removeCookie = function(key, options) {
            if ($.cookie(key) !== undefined) {
                $.cookie(key, '', $.extend({}, options, {
                    expires: -1
                }));
                return true;
            }
            return false;
        };
    })($);

    var template = (function() {
        var noMatch = /(.)^/;
        var escapes = {
            "'": "'",
            '\\': '\\',
            '\r': 'r',
            '\n': 'n',
            '\t': 't',
            '\u2028': 'u2028',
            '\u2029': 'u2029'
        };
        var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
        var settings = {
            evaluate: /<@([\s\S]+?)@>/g,
            interpolate: /<@=([\s\S]+?)@>/g,
            escape: /<@-([\s\S]+?)@>/g
        };

        var matcher = new RegExp([(settings.escape || noMatch).source, (settings.interpolate || noMatch).source, (settings.evaluate || noMatch).source].join('|') + '|$', 'g');

        return function(text, data) {
            var render;
            var index = 0;
            var source = "__p+='";
            text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
                source += text.slice(index, offset).replace(escaper, function(match) {
                    return '\\' + escapes[match];
                });
                if (escape) {
                    source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
                }
                if (interpolate) {
                    source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
                }
                if (evaluate) {
                    source += "';\n" + evaluate + "\n__p+='";
                }
                index = offset + match.length;
                return match;
            });
            source += "';\n";
            if (!settings.variable)
                source = 'with(obj||{}){\n' + source + '}\n';
            source = "var __t,__p='',__j=Array.prototype.join," + "print=function(){__p+=__j.call(arguments,'');};\n" + source + "return __p;\n";

            try {
                render = new Function(settings.variable || 'obj', source);
            } catch (e) {
                e.source = source;
                throw e;
            }

            if (data)
                return render(data);
            var template = function(data) {
                return render.call(this, data);
            };
            template.source = 'function(' + (settings.variable || 'obj') + '){\n' + source + '}';
            return template;
        };
    })();

    var getParam = function(search) {
        search = search.replace(/#.+$/, '');
        var re = {};
        if (search == "" || typeof search == "undefined") {
            return {};
        } else {
            search = search.substr(1).split('&');
            for (var i = 0, len = search.length; i < len; i++) {
                var tmp = search[i].split('=');
                if (i == 0 && tmp.length == 1) { //?132141
                    return {
                        '__search__': tmp[0]
                    };
                }
                re[tmp.shift()] = tmp.join('=');
            }
            return re;
        }
    };
    var _param = getParam(window.location.search);

    var runLoad = function(opts) {
        var callList = [];
        var state = 'init';
        return {
            load: function(callback) {
                if (state == 'load') {
                    callback && callback(this.data);
                } else if (state == 'init') {
                    state = 'loading';
                    callback && callList.push(callback);
                    opts.fun.call(this);
                } else if (state == 'loading') {
                    callback && callList.push(callback);
                }
            },
            init: function() {
                state = 'init';
            },
            done: function(data) {
                this.data = data;
                state = 'load';
                if (callList.length > 0) {
                    for (var i = 0, len = callList.length; i < len; i++) {
                        callList[i](this.data);
                    }
                    callList = [];
                }
            }
        }
    };

    var runReady = function(obj, name) {
        var fun = obj[name];
        var _ready = false;
        var _list = [];
        obj[name] = function() {
            if (_ready == false) {
                _list.push(arguments);
            } else {
                fun.apply(obj, arguments);
            }
        };
        obj[name].setReady = function() {
            if (_ready == false) {
                _ready = true;
                while (_list.length > 0) {
                    fun.apply(obj, _list.shift());
                }
            }
        };
    };
    var loadScript = function(url, callback) {
        var doc = document;
        var head = doc.head || doc.getElementsByTagName("head")[0] || doc.documentElement;
        var node = document.createElement("script");

        var supportOnload = "onload" in node;
        if (supportOnload) {
            node.onload = onload;
            node.onerror = function() {
                onload()
            };
        } else {
            node.onreadystatechange = function() {
                if (/loaded|complete/.test(node.readyState)) {
                    onload();
                }
            }
        }

        function onload() {
            node.onload = node.onerror = node.onreadystatechange = null
            head.removeChild(node)
            node = null;
            if (callback) callback()
        };
        node.async = true;
        node.src = url;
        head.appendChild(node);
    };

    var brower = (function() {
        var w = window,
            ver = w.opera ? (opera.version().replace(/\d$/, "") - 0) : parseFloat((/(?:IE |fox\/|ome\/|ion\/)(\d+\.\d)/.exec(navigator.userAgent) || [, 0])[1]);
        return {
            //测试是否为ie或内核为trident，是则取得其版本号
            ie: !!w.VBArray && Math.max(document.documentMode || 0, ver), //内核trident
            //测试是否为firefox，是则取得其版本号
            firefox: !!w.netscape && ver, //内核Gecko
            //测试是否为opera，是则取得其版本号
            opera: !!w.opera && ver, //内核 Presto 9.5为Kestrel 10为Carakan
            //测试是否为chrome，是则取得其版本号
            chrome: !!w.chrome && ver, //内核V8
            //测试是否为safari，是则取得其版本号
            safari: /apple/i.test(navigator.vendor) && ver // 内核 WebCore
        }
    })();

    var addEvent = doc.attachEvent ? function(element, event, fn) {
        element.attachEvent('on' + event, fn);
    } : function(element, event, fn) {
        element.addEventListener(event, fn, false);
    };

    var getSelectHtml = function(obj, config) {
        var key, text, value, filter;
        if ($.isPlainObject(config)) {
            key = config.key;
            text = config.text;
            value = config.value;
            filter = config.filter;
        } else {
            key = config;
        }
        var html = [];
        if ($.isArray(obj)) {
            $.each(obj, function(index) {
                var val = index;
                if (value) {
                    val = this[value];
                }
                if (filter) {
                    if (filter(this, index) == false) return;
                }
                html.push('<option value="' + val + '" ' + (key == val ? " selected " : "") + ' >' + html2Escape(text ? this[text] : this) + '</option>');
            })
        } else {
            for (var index in obj) {
                if (!obj[index]) return;
                var val = index;
                if (value) {
                    val = obj[index][value];
                }
                if (filter) {
                    if (filter(obj[index], index) == false) continue;
                }
                html.push('<option value="' + val + '" ' + (key == val ? " selected " : "") + ' >' + html2Escape(text ? obj[index][text] : obj[index]) + '</option>');
            }
        }
        return html.join('');
    };

    /* RTMP发布接收类 */
    var Speaker = (function() {
        var defaultOpts = {
            debug: 1,
            fullimg: ROOT+"/public/img/speakvideo/fullBtn.png", //全屏按钮
            bgcolor: "0xaac7e7",
            bgimg: ROOT+"/public/img/speakvideo/speaker.jpg", //背景图
            waterimg: ROOT+"/public/img/speakvideo/logo.png" //水印
        };

        var fn = function(wrap, namespace, url, params, call) {
            namespace = namespace || getRandomFlashId();
            var self = this;
            this.opts = $.extend({
                nameSpace: namespace
            }, defaultOpts, params);
            this.wrap = wrap;
            this.url = url;
            for (var key in call) {
                if (jQuery.isFunction(call[key])) {
                    call[key] = call[key].bind(this);
                }
            }
            $.extend(this, call);
            window[namespace] = this;
            this.init();
            runReady(this, 'play');
        }
        fn.prototype = {
            init: function() {
                var opts = this.opts;
                var paramStr = "";
                for (var key in opts) {
                    paramStr += key + "=" + opts[key] + "&";
                };
                this.obj = flashPlayer(this.wrap, this.url + "?" + paramStr);
                var self = this;
                if (self.setSize) {
                    self.setSize(640);
                    $win.bind('resize', function() {
                        self.setSize(-1);
                    })
                };
            },
            connect: function(sUrl) {
                this.obj.connect(sUrl);
            },
            publish: function(audio) {
                this.obj.publish(audio === "audio");
            },
            purePublish: function() {
                this.obj.purePublish(); //纯发布流，不在本地video显示
            },
            unPublish: function(audio) {
                this.obj.unPublish(audio === "audio");
            },
            play: function(uid, uname) {
                this.playUid = uid || this.playUid;
                this.obj.playStream(this.playUid, uname); //uname用于显示名字
            },
            playAudio: function(uid) {
                this.playUid = uid || this.playUid;
                this.obj.playStream(this.playUid, '', true); //接收音频流（不会放入video）
            },
            stop: function(uid) {
                //console.log('stop', uid);
                uid = uid || this.playUid;
                this.obj.stopStream(uid);
            },
            togglePause: function() {
                this.obj.togglePause(); //录播流的暂停/播放
            },
            seek: function(t) {
                this.obj.seek(t); //录播流跳播
            },
            selectCam: function(name) {
                this.obj.selectCamera(name);
            },
            setCamera: function(width, fps, quality, keyFrame) {
                keyFrame = keyFrame || 48;
                this.obj.setCamera(width, fps, quality, keyFrame);
            },
            setMicVolume: function(v) {
                this.obj.setMicVolume(v);
            },
            setSoundVolume: function(v) {
                this.obj.setSoundVolume(v / 50);
            },
            applyH264: function(profile, level) {
                this.obj.h264(profile, level);
            },
            applyCodec: function(value) {
                this.obj.codec(value);
            },
            setRate: function(value) {
                this.obj.setRate(value);
            },
            applyEnhanced: function(value) {
                this.obj.applyEnhanced(value);
            },
            setEchoPath: function(value) {
                this.obj.setEchoPath(value);
            },
            recordSet: function(type) {
                this.obj.recordSet(type);
            },
            receiveSet: function(type) {
                this.obj.receiveSet(type);
            },
            getDeviceInfo: function(uid) {
                this.obj.getDeviceInfo(); //获取摄像头，麦克风设置的信息
            },
            getStreamInfo: function(uid) {
                return this.obj.getStreamInfo(uid); //接收方实时获取流信息，如果播的是主持人流或者录播流，不用传uid
            },
            quitFull: function() { //退出flash全屏
                this.obj.quitFull();
            }
        };
        return fn;
    })();

    var getFormData = function($box) {
        var json = {};
        $box.find('input,select,textarea').each(function() {
            var name = this.getAttribute('name');
            if (!name) return;
            var type = this.getAttribute('type');
            if (type == 'radio' || type == "checkbox") {
                if (!this.checked) return;
            }
            var obj = json;
            if (name.indexOf('.') != -1) {
                var tab = name.split('.');
                for (var i = 0, len = tab.length - 1; i < len; i++) {
                    obj[tab[i]] = obj[tab[i]] || {};
                    obj = obj[tab[i]];
                    name = tab[i + 1];
                }
            }
            if (obj[name]) {
                obj[name] += ',' + this.value;
            } else {
                obj[name] = this.value;
            }
        })
        return json;
    }

    var getKeyData = function(map, key) {
        var res = {};
        $.each(key.split(','), function() {
            res[this] = map[this] || '';
        })
        return res;
    }

    function UploadFile(wrap, namespace, url, params, call) {
        namespace = namespace || ('UploadFile' + getUUID());
        params = $.extend({
            nameSpace: namespace,
            debug: 0,
            fileType: "*.jpg;*.gif;*.png;*.jpeg;*.bmp;",
            typeDesc: "图片",
            multiSelect: false,
            sizeLimit: 20 * 1024 * 1024,
            server: "/"
        }, params);
        $.extend(this, call || {});
        this.init = function() {
            var paramStr = "";
            for (var i in params) {
                paramStr += i + "=" + params[i] + "&";
            };
            this.obj = FlashPlayer(wrap, url + "?" + paramStr,{wmode:"Opaque"});
        };
        this.startUpload = function() {
            this.obj.upload();
        };
        this.cancelUpload = function() {
            this.obj.cancel();
        };
        this.init();
        /*
		var self = this;
		var myParams = extendCopy(params || {}, {
			nameSpace : namespace,
			debug : 0,
			fileType : "*.jpg;*.gif;*.png;*.jpeg;*.bmp;",
			typeDesc : "图片",
			multiSelect : false,
			sizeLimit : 20*1024*1024,
			server: "/"
		}); 
		if(call){
			this.noticeTypeError = call.noticeTypeError; 
			this.noticeSizeError = call.noticeSizeError; 
			this.onCancel = call.onCancel;
            this.onSelect = call.onSelect;
			this.onOpen = call.onOpen; 
			this.onProgress = call.onProgress; 
			this.onComplete = call.onComplete; 
		}
		this.init = function(){
			var paramVars = "";
			for(var i in myParams){
				paramVars += i+"="+myParams[i]+"&";
			};
			this.obj = FlashPlayer(wrap, url+"?"+paramVars, {wmode:"Opaque"});
		};
        this.startUpload = function(){
            this.obj.upload();
        };
		this.cancelUpload = function(){
            this.obj.cancel();
		};
		this.init();*/
        window[namespace] = this;
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
    var countMap = function(map) {
        var i = 0;
        for (var key in map) {
            i++;
        }
        return i;
    };

    (function($, undefined) {

        var slice = Array.prototype.slice;
        var defaults = {
            getHtml: function() {
                var str = [];
                $.each(this.data, function() {
                    str.push('<li>' + html2Escape(this.text) + '</li>')
                })
                return str.join('');
            },
            setValue: function(v) {
                var self = this;
                var flag = false;
                $.each(this.data, function(index) {
                    if (this.value == v) {
                        flag = true;
                        self.selectIndex = index;
                        return true;
                    }
                })
                if (!flag) {
                    self.selectIndex = undefined;
                }
            },
            getValue: function(index) {
                return this.data[index];
            },
            getSelText: function() {
                this.selectIndex = this.selectIndex || 0;
                return html2Escape(this.data[this.selectIndex].text);
            },
            change: noop,
            click: noop,
            beforeChange: noop,
            clickSelect: function() {
                var $elm = this.$elm
                if ($elm.hasClass('disable')) {
                    var msg = $elm.attr('data-disableMsg');
                    if (msg) {
                        Win.alert(msg);
                    }
                    return false;
                }
            }
        };
        var showObj;
        $(document).on('click', function() {
            if (showObj) showObj.close();
        });

        function JsSelect($elm, options) {
            options.$elm = this.$elm = $elm;
            this.options = options;
            this.init();
        }
        JsSelect.prototype = {
            init: function() {
                var self = this;
                var options = this.options;
                if (!this.$box) {
                    this.isShow = false;
                    var $elm = this.$elm.addClass('jsSelect-warper').html('<div class="jsSelect-select clearfix"><span>' + options.getSelText() + '</span><div class="jsSelect-btn"></div></div><ul class="jsSelect-box"></ul>');
                    this.$select = this.$elm.find(".jsSelect-select span");
                    this.$box = this.$elm.find(".jsSelect-box");
                    this.$elm.on('click', '.jsSelect-select', function() {
                        if (showObj && showObj != self) showObj.close();
                        if (options.clickSelect() === false) {
                            return false;
                        }
                        self.toggleShow();
                        return false;
                    });
                    this.$box.on('click', 'li', function() {
                        self._click($(this).index());
                        return false;
                    }).on('mouseenter', 'li', function() {
                        $(this).addClass('sel').siblings().removeClass('sel');
                    })
                }
            },
            val: function(v) {
                var options = this.options;
                if (v === undefined) {
                    return options.getValue(options.selectIndex);
                } else {
                    options.setValue(v);
                    this.$select.html(options.getSelText());
                }
            },
            disable: function(msg) {
                this.$elm.addClass('disable');
            },
            enable: function() {
                this.$elm.removeClass('disable');
            },
            disable2: function(msg) {
                this.$elm.addClass('disable2');
            },
            enable2: function() {
                this.$elm.removeClass('disable2');
            },
            isDisable: function() {
                return this.$elm.hasClass('disable2') || this.$elm.hasClass('disable');
            },
            toggleShow: function() {
                if (this.isShow) {
                    this.close();
                } else {
                    this.show();
                }
            },
            _click: function(index) {
                var flag = false;
                var options = this.options;
                if (options.selectIndex !== index) {
                    flag = true;
                }
                if (flag) {
                    if (options.beforeChange(options.getValue(index)) === false) {
                        this.close();
                        return;
                    }
                }

                options.selectIndex = index;
                this.$select.html(options.getSelText());
                this.close();
                if (flag)
                    options.change(options.getValue(index));
                options.click(options.getValue(index));
            },
            show: function() {
                showObj = this;
                var options = this.options;
                this.init();
                this.isShow = true;
                this.$box.html(options.getHtml()).show();
            },
            close: function() {
                this.isShow = false;
                this.$box.hide().html('');
            },
            extendOpt: function(opt) {
                if (typeof opt == "object") {
                    $.extend(this.options, opt);
                } else {
                    return this.options[opt];
                }
            }
        }

        $.fn.jsSelect = function(options) {
            var args = slice.call(arguments, 1);
            var res;
            var flag = false;
            this.each(function() {
                var $elm = $(this);
                var jsSelect = $elm.data('jsSelect');
                if (typeof options == "string") {
                    if (jsSelect && jsSelect[options]) {
                        res = jsSelect[options].apply(jsSelect, args);
                        if (res !== undefined) {
                            flag = true;
                            return true;
                        }
                    }
                } else {
                    $elm.data('jsSelect', new JsSelect($elm, $.extend({}, defaults, options)));
                }
            })
            if (flag) {
                return res;
            } else {
                return this;
            }
        }
    })(jQuery);

    (function($) {
    	var slice = Array.prototype.slice;
        var defaults = {
            value: 1,
            warn: function (type) {
            	if (type == "formatError") {
            		Win.alert("请输入有效数量", 1500);
            	} else if (type == "gtMax") {
            		Win.alert("课表一共" + this.options.max + "周", 1500);
            	}
            },
            onCheck: function () {

            },
            onChange: function () {

            },
            html: '<a class="jsCount-lt" href="javascript:;">&lt;</a><input class="jsCount-ipt"><a class="jsCount-gt" href="javascript:;">&gt;</a>'
        };

        function JsCount($elm, options) {
            this.$elm = $elm;
            this.options = options;
            this.init();
        }
        JsCount.prototype = {
            init: function() {
            	var options = this.options;
                var $elm = this.$elm.addClass('jsCount').html(options.html);
                var $ipt = this.$ipt = $elm.find('.jsCount-ipt').val(this.options.value);
                var $cutBtn = this.$cutBtn = $elm.find('.jsCount-lt');
                var $addBtn = this.$addBtn = $elm.find('.jsCount-gt');
                if (options.max === 0 || options.max === "0") {
                    options.max = 0;
                } else {
                    options.max = options.max || -1;
                }
                var self = this;
                $cutBtn.click(function() {
                    if (!$cutBtn.hasClass('disable'))
                        self.cut();
                });
                $addBtn.click(function() {
                    if (!$addBtn.hasClass('disable'))
                        self.add();
                });
                $ipt.keyup(function() {
                    self.change();
                });
                this.check(this.getVal(), true);
            },
            reset: function(v, m) {
                this.options.max = m || -1;
                this.setVal(v, true);
            },
            setVal: function(val, flag) {
                this.$ipt.val(val);
                return this.check(val, flag);
            },
            getVal: function() {
                return parseInt($.trim(this.$ipt.val()), 10);
            },
            add: function() {
                return this.check(this.getVal() + 1);
            },
            cut: function() {
                return this.check(this.getVal() - 1);
            },
            change: function() {
                return this.check(this.getVal());
            },
            check: function(val, checkVal) {
                checkVal = checkVal || false;
                var flag = true;
                var options = this.options;
                var $cutBtn = this.$cutBtn;
                var $addBtn = this.$addBtn;
                var max = options.max;
                var warn = options.warn;
                if (!/^\d+$/.test(val)) {
                	options.warn.call(this,'formatError');
                   	val = parseInt(val, 10) || 1;
                    flag = false;
                }
                this.$cutBtn.removeClass('disable');
                this.$addBtn.removeClass('disable');
                if (val <= 1) {
                    $cutBtn.addClass('disable');
                }
                if (max >= 0 && val >= max) {
                    $addBtn.addClass('disable');
                }
                if (val < 1) {
                    val = 1;
                    flag = false;
                }
                if (max >= 0 && val > max) {
                    val = max;
                    options.warn.call(this,'gtMax');
                    flag = false;
                }
                this.$ipt.val(val);
                if (!checkVal)
                	this.options.onChange(val);
                return flag;
            }
        }

        $.fn.jsCount = function(options) {
            var args = slice.call(arguments, 1);
            var res;
            var flag = false;
            this.each(function() {
                var $elm = $(this);
                var jsCount = $elm.data('jsCount');
                if (typeof options == "string") {
                    if (jsCount && jsCount[options]) {
                        res = jsCount[options].apply(jsCount, args);
                        if (res !== undefined) {
                            flag = true;
                            return true;
                        }
                    }
                } else {
                    $elm.data('jsCount', new JsCount($elm, $.extend({}, defaults, options)));
                }
            })
            if (flag) {
                return res;
            } else {
                return this;
            }
        }
    })(jQuery);



    var countTool = function(opt) {
        var $div = opt.$div;
        var max;
        if (opt.max === 0 || opt.max === "0") {
            max = 0;
        } else {
            max = opt.max || -1; //<0 没有限制
        }
        $div.html(['<a class="count-btn-cut buttonbox" href="javascript:;">&lt;</a>',
            '<input type="text" class="count-input" value="' + (opt.value || 1) + '"/>',
            '<a class="count-btn-add buttonbox" href="javascript:;">&gt;</a> 周'
        ].join(''));
        var $input = $div.find('.count-input');
        var $cutBtn = $div.find('.count-btn-cut');
        var $addBtn = $div.find('.count-btn-add');

        return {
            reset: function(v, m) {
                max = m;
                this.setVal(v, true);
            },
            init: function() {
                var self = this;
                $cutBtn.click(function() {
                    if (!$cutBtn.hasClass('disable'))
                        self.cut();
                });
                $addBtn.click(function() {
                    if (!$addBtn.hasClass('disable'))
                        self.add();
                });
                $input.keyup(function() {
                    self.change();
                });
                self.change(); //初始化数据，按钮状态
            },
            setVal: function(val, flag) {
                $input.val(val);
                return this.check(val, flag);
            },
            getVal: function() {
                return parseInt($.trim($input.val()), 10);
            },
            add: function() {
                return this.check(this.getVal() + 1);
            },
            cut: function() {
                return this.check(this.getVal() - 1);
            },
            change: function() {
                return this.check($.trim($input.val())); //用户可能输入非数字
            },
            check: function(val, isNoCheck) {
                isNoCheck = isNoCheck || false;
                var v = val;
                var flag = true;
                if (!/^\d+$/.test(val)) {
                    Win.alert("请输入有效数量", 1500);
                    v = val = parseInt(val, 10) || 1;
                    flag = false;
                }
                $cutBtn.removeClass('disable');
                $addBtn.removeClass('disable');
                if (val <= 1) {
                    $cutBtn.addClass('disable');
                }
                if (max >= 0 && val >= max) {
                    $addBtn.addClass('disable');
                }
                if (val < 1) {
                    v = 1;
                    flag = false;
                }
                if (max >= 0 && val > max) {
                    v = max;
                    Win.alert("课表一共" + max + "周", 1500);
                    flag = false;
                }

                $input.val(v);
                if (!isNoCheck)
                    this.onCheck && this.onCheck(v);
                return flag;
            }
        }
    };

	var ary2Map = function(ary, key) {
        key = key || 'id';
        var res = {};
        for (var i = 0, len = ary.length; i < len; i++) {
			var obj = ary[i];
        	if (typeof obj == "string" ||typeof obj == "number") {
        		res[obj] = obj;
        	} else {
        		res[obj[key]] = obj;
        	}
        }
        return res;
    };
    
    var parent2Child = function(childTab, key) {
        key = key || 'id';
        var res = {};
        $.each(childTab, function() {
            res[this[key]] = res[this[key]] || [];
            res[this[key]].push(this)
        })
        return res;
    };


    return $.extend(exports, {
    	runReady: runReady,
        template: template,
        getParam: getParam,
        _param: _param,
        runLoad: runLoad,
        loadScript: loadScript,
        flashPlayer: flashPlayer,
        brower: brower,
        Listener: Listener,
        getUUID: getUUID,
        getSelectHtml: getSelectHtml,
        Speaker: Speaker,
        getFormData: getFormData,
        getKeyData: getKeyData,
        UploadFile: UploadFile,
        html2Escape: html2Escape,
        countMap: countMap,
        parent2Child: parent2Child,
        ary2Map: ary2Map,
        pos2Html: function (obj) {
			if (obj.pos == -1) {
				return obj.x + ',' + obj.y;
			} else {
				return ['左上','右上','左下','右下'][obj.pos] || "未知";
			}
		}
    });
})(jQuery);
