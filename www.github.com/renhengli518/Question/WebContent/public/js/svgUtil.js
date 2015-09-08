var svgUtil = (function($) {
    var exports = {};
    var $win = $(window);
    var $doc = $(document);
    var doc = document;

    var noop = function() {};
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
    
    var $win = $(window);
    var $doc = $(document);
    var userAgent = navigator.userAgent;
    var detect = {
        isAndroidClient: function () {
            return userAgent && userAgent.toLowerCase().indexOf("android") > -1
        },
        isIos: function () {
            return userAgent && userAgent.toLowerCase().indexOf("iphone") > -1
        },
        getBrowserInfo: function () {
            var a = userAgent;
            var b = {
                    os: "iphone",
                    version: 6,
                    browser: "safari",
                    keyboardHeight: 250,
                    ios6: function () {
                        return "iphone" === this.os && this.version >= 6
                    },
                    lowLevel: function () {
                        return !1
                    }
                },
                c = a.toUpperCase(),
                d = c.indexOf("IPHONE") >= 0 || c.indexOf("IPOD") >= 0 || c.indexOf("IPAD") >= 0;
            c.indexOf("IPAD") >= 0 && (b.keyboardHeight = 450),
            d || (b.os = "android");
            var e = a.match(/UC\sAppleWebKit\/([\d.]+)/),
                f = a.match(/(UCWEB)(\d.+?(?=\/))/);
            if (e || f ? b.browser = "uc" : a.match(/MQQBrowser/) ? b.browser = "qq" : a.match(/(Chrome)|(CriOS)/) && (b.browser = "chrome"), "iphone" === b.os) b.version = parseFloat(("" + (/CPU.*OS ([0-9_]{1,5})|(CPU like).*AppleWebKit.*Mobile/i.exec(navigator.userAgent) || [0, ""])[1]).replace("undefined", "3_2").replace("_", ".").replace("_", "")) || 6;
            else if ("android" === b.os) {
                var g = a.indexOf("Android "),
                    h = a.substr(g + 8, 6),
                    i = h.split(/_|\./);
                b.version = parseFloat(i.join("."))
            }
            return d || (b.keyboardHeight = .8 * window.innerWidth), b
        }
    };
    
    
    return $.extend(exports, {
        template: template,
        getParam: getParam,
        _param: _param,
        detect: detect
    });
})($);
