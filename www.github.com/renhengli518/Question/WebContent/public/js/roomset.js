(function() {
	if (!window['USER_AREA']) {
		USER_AREA = 0;
	}
    var ary2Map = util.ary2Map;
    var parent2Child = util.parent2Child;
    SCHOOL_MAP = ary2Map(SCHOOL_TAB, 'sgid');
    CLASS_ROOM_MAP = ary2Map(CLASS_ROOM_TAB, 'sid');
    AREA_MAP = ary2Map(AREA_TAB, 'aid');
    if (REMOVE_ROOM_TAB == "") {
    	REMOVE_MAP = {};
    } else {
    	REMOVE_MAP = ary2Map(REMOVE_ROOM_TAB.split(','));
    }
    

    SCHOOL_TO_ROOMS = parent2Child(CLASS_ROOM_TAB, 'sgid');
    AREA_TO_SCHOOLS = parent2Child(SCHOOL_TAB, 'aid');
    AREA_TO_AREAS = parent2Child(AREA_TAB, 'paid');

    var addClassRooms = function($selectRoom) {
        var $addRoom = $('#addClassRoom h5.classRoom');
        if ($selectRoom.length + $addRoom.length > 3) {
            Win.alert("抱歉，最多只能添加3个教室作为接收教室。");
            return false;
        }
        var map = {};
        $addRoom.each(function() {
            map[this.getAttribute('data-sid')] = 1;
        })
        var hasRooms = [];
        var classRooms = [];
        $selectRoom.each(function() {
            var sid = this.getAttribute('data-sid');
            if (map[sid]) {
                hasRooms.push(SCHOOL_MAP[CLASS_ROOM_MAP[sid].sgid].sname + '--' + this.innerHTML);
                return true;
            }
            classRooms.push(sid)
        })
        if (hasRooms.length > 0) {
            Win.alert({
                width: 300,
                html: hasRooms.join(',') + " 已被选择，不可重复添加！"
            });
        } else {
            addClassRoomHTML(classRooms);
            $selectRoom.removeClass('sel');
        }
    };
	var addClassRoomHTML = function(tab) {
        var html = [];
        $.each(tab, function() {
			var room = CLASS_ROOM_MAP[this];
			if (room) {
				var school = SCHOOL_MAP[room.sgid];
            	html.push('<li><h5 class="school " data-type="school" data-sgid="' + school.sgid + '" title="' + school.sname + '" >' + school.sname + '</h5><ul>');
            	html.push('<li><h5 class="classRoom " data-type="classRoom" data-sid="' + room.sid + '" title="' + room.ename + '" >' + room.ename + '</h5></li></ul></li>');
			}
        })
        $('#addClassRoom').append(html.join(''));
    };

    var getChilds = function($h5, $ul) {
        var dataType = $h5.attr('data-type') || "area";
        var html = [];
        if (dataType == "area") {
            var aid = $h5.attr('data-aid');
            $.each(AREA_TO_SCHOOLS[aid] || [], function() {
                html.push('<li><h5 class="school  expand" data-type="school" data-sgid="' + this.sgid + '"  title="' + this.sname + '" >' + this.sname + '</h5><ul class="hide"></ul></li>');
            })
            $.each(AREA_TO_AREAS[aid] || [], function() {
                html.push('<li><h5 id="area_' + this.aid + '" class="area  expand" data-type="area" data-aid="' + this.aid + '" >' + this.aname + '</h5><ul class="hide"></ul></li>');
            })
        } else if (dataType == "school") {
            var sgid = $h5.attr('data-sgid');
            $.each(SCHOOL_TO_ROOMS[sgid] || [], function() {
            	if (!REMOVE_MAP[this.sid]) {
                    html.push('<li><h5 class="classRoom " data-type="classRoom" data-sid="' + this.sid + '"  title="' + this.ename + '" >' + this.ename + '</h5></li>');
            	}
            })
        }
        $ul.html(html.join(''));
    }

    var clickH5 = function($h5) {
        var $ul = $h5.next('ul');
        var dataType = $h5.attr('data-type') || "area";
        if (dataType == 'classRoom') {
            $h5.toggleClass('sel')
            return;
        }
        if ($ul.hasClass('hide')) {
            $ul.removeClass("hide");
            $h5.removeClass("expand");
            if ($ul.html() == '') {
                getChilds($h5, $ul);
            }
        } else {
            $ul.addClass("hide");
            $h5.addClass("expand");
        }
    }

    var search = (function() {
        var $ipt = $('#roomsetSearch');
        var defaultText = '请输入学校名称...';
        var lastSearch;
        var $ul = $('#searchResult');
        var $box = $('.roomset-list-search');
        return {
            init: function() {
                $ipt.focus(function() {
                    if ($ipt.val() == defaultText) {
                        $ipt.val('');
                    }
                }).blur(function() {
                    if ($ipt.val() == '') {
                        $ipt.val(defaultText);
                    }
                }).keyup(function() {
                    var schtext = $.trim($ipt.val());
                    if (lastSearch == schtext) {
                        return;
                    }
                    lastSearch = schtext;
                    if (schtext == '') {
                        search.hide();
                        return;
                    }
                    var re = eval("/(\\B" + schtext + "|\\b" + schtext + ")/gi");
                    var html = [];
                    if (schtext != defaultText) {
                        $.each(SCHOOL_TAB, function() {
                            var rooms = SCHOOL_TO_ROOMS[this.sgid] || [];
                            if (rooms.length > 0) {
                            	var same = htmldecode(this.sname);
                                if (same.match(re) != null) { //学校匹配
                                	var flag = false;
                                	var h = ['<li><h5 class="school" data-type="school" data-sgid="' + this.sgid + '" >' + this.sname.replace(re, "<font color=\"#F18200\">$1</font>") + '</h5><ul>'];
                                    $.each(rooms, function() {
                                    	if (!REMOVE_MAP[this.sid]) {
                                    		flag = true;
                                    		h.push('<li><h5 class="classRoom" data-type="classRoom" data-sid="' + this.sid + '">' + this.ename.replace(re, "<font color=\"#F18200\">$1</font>") + '</h5></li>');
                                    	}
                                    })
                                    if (flag) {
                                    	html.push(h.join(''));
                                    	html.push('</ul></li>');
                                    }
                                    
                                } else {
                                    var _html = [];
                                    $.each(rooms, function() {
                                    	if (!REMOVE_MAP[this.sid]) {
                                    		var same = htmldecode(this.sname);
                                    		var ename = htmldecode(this.ename);
	                                        if (same.match(re) != null || ename.match(re) != null) { //学校下面教室匹配
	                                            _html.push('<li><h5 class="classRoom" data-type="classRoom" data-sid="' + this.sid + '">' + this.ename.replace(re, "<font color=\"#F18200\">$1</font>") + '</h5></li>');
	                                        }
                                    	}
                                    })
                                    if (_html.length > 0) {
                                        html.push('<li><h5 class="school" data-type="school" data-sgid="' + this.sgid + '" >' + this.sname.replace(re, "<font color=\"#F18200\">$1</font>") + '</h5><ul>');
                                        html.push(_html.join(''));
                                        html.push('</ul></li>');
                                    }
                                }
                            }
                        })
                        if (html.length == 0) {
                            $ul.html('无');
                        } else {
                            $ul.html(html.join(''));
                        }
                        $box.show();
                    }
                });
                $(document).on('click', function(event) {
                    if (event.target.id != 'roomsetSearch') {
                        search.hide();
                    }
                });
                $ul.on('click', 'h5.classRoom', function() {
                    addClassRooms($(this));
                    return false;
                })
            },
            hide: function() {
                $box.hide();
                //$ul.html('');
            }
        }
    })();

    var loadUserArea = function() {
        if (USER_AREA != 0 && AREA_MAP[USER_AREA] && AREA_MAP[USER_AREA].paid) {
            var areas = [USER_AREA];
            var paid = AREA_MAP[USER_AREA].paid;
            while (paid != 0 && paid != -1) {
                areas.push(paid);
                paid = AREA_MAP[paid].paid;
            }
            var len = areas.length;
            while (len--) {
                clickH5($('#area_' + areas[len]));
            }
            $('#selectClassRoom').scrollTop($('#area_' + USER_AREA).offset().top - 65)
        }
    };
    var closeMe = function () {
    	var domid = frameElement.getAttribute("domid");
        parent.Win.wins[domid].close();
    };
    var page = {
        init: function() {
            search.init();
			if (SHOW_CLASS_ROOM) {
				addClassRoomHTML(SHOW_CLASS_ROOM.split(','));
			}
            loadUserArea();
            //默认展开用户所在地区

            //左侧节点点击
            $('#selectClassRoom').on('click', 'h5', function() {
                    clickH5($(this));
                })
                .on('dblclick', 'h5.classRoom', function() {
                    addClassRooms($(this));
                });
            $('#addClassRoom').on('click', 'h5.classRoom', function() {
                $(this).toggleClass('sel');
            }).on('dblclick', 'h5.classRoom', function() {
                $(this).parent().parent().parent().remove();
            });
            $('#addSelectdBtn').click(function() {
                addClassRooms($('#selectClassRoom h5.classRoom.sel'));
            })
            $('#delSelectdBtn').click(function() {
                var $addRoom = $('#addClassRoom h5.classRoom.sel');
                $addRoom.each(function() {
                    $(this).parent().parent().parent().remove();
                })
            });
            $('#okBtn').on('click', function() {
                var sids = '';
                $("#addClassRoom  h5.classRoom").each(function() {
                    sids += ',' + $(this).attr('data-sid');
                });
                if (CALL_BACK && parent[CALL_BACK]) {
                	parent[CALL_BACK](sids.substr(1));
                } 
                Win.alert('设置成功！');
                closeMe();
            });
            $('#cancelBtn').on('click', function() {
            	closeMe();
            });
        }
    };
    page.init();
})();



