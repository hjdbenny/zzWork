//公共插件
(function($) {
	$.fn.toggle = function(fn, fn2) {		//点击来回切换
		var args = arguments,
			guid = fn.guid || $.guid++,
			i = 0,
			toggle = function(event) {
				var lastToggle = ($._data(this, "lastToggle" + fn.guid) || 0) % i;
				$._data(this, "lastToggle" + fn.guid, lastToggle + 1);
				event.preventDefault();
				return args[lastToggle].apply(this, arguments) || false;
			};
		toggle.guid = guid;
		while(i < args.length) {
			args[i++].guid = guid;
		}
		return this.click(toggle);
	};
	$.extend({
		"findTimeRange": function(elem1, elem2) { //查询时间范围
			elem1.datepicker({
				changeYear: true,
				changeMonth: true,
				numberOfMonths: 1,
				dateFormat: 'yy-mm-dd',
				monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
				monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
				monthStatus: '选择月份',
				yearStatus: '选择年份',
				weekHeader: '周',
				weekStatus: '年内周次',
				dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
				dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
				dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
				dayStatus: '设置 DD 为一周起始',
				dateStatus: '选择 m月 d日, DD',
				onClose: function(selectedDate) {
					elem2.datepicker("option", "minDate", selectedDate);
				}
			});
			elem2.datepicker({
				numberOfMonths: 1,
				changeYear: true,
				changeMonth: true,
				numberOfMonths: 1,
				dateFormat: 'yy-mm-dd',
				monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
				monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
				monthStatus: '选择月份',
				yearStatus: '选择年份',
				weekHeader: '周',
				weekStatus: '年内周次',
				dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
				dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
				dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
				dayStatus: '设置 DD 为一周起始',
				dateStatus: '选择 m月 d日, DD',
				onClose: function(selectedDate) {
					elem1.datepicker("option", "maxDate", selectedDate);
				}
			});
		},
		"dedupe": function(array) { //普通数组去重
			return Array.from(new Set(array));
		},
		"reduceArray": function reduceArray(arr) { //对象数组去重
			var hash = {};
			arr = arr.reduce(function(item, next) {
				hash[next.name] ? '' : hash[next.name] = true && item.push(next);
				return item
			}, [])
			return arr
		},
		"array_chunk": function(input, size, preserve_keys) { //一个数组分割为多个数组
			var x, p = '',
				i = 0,
				c = -1,
				l = input.length || 0,
				n = [];

			if(size < 1) {
				return null;
			}

			if(Object.prototype.toString.call(input) === '[object Array]') {
				if(preserve_keys) {
					while(i < l) {
						(x = i % size) ? n[c][i] = input[i]: n[++c] = {}, n[c][i] = input[i];
						i++;
					}
				} else {
					while(i < l) {
						(x = i % size) ? n[c][x] = input[i]: n[++c] = [input[i]];
						i++;
					}
				}
			} else {
				if(preserve_keys) {
					for(p in input) {
						if(input.hasOwnProperty(p)) {
							(x = i % size) ? n[c][p] = input[p]: n[++c] = {}, n[c][p] = input[p];
							i++;
						}
					}
				} else {
					for(p in input) {
						if(input.hasOwnProperty(p)) {
							(x = i % size) ? n[c][x] = input[p]: n[++c] = [input[p]];
							i++;
						}
					}
				}
			}
			return n;
		},
		"format_number_trim": function(str) { /*数字每隔3位，添加空格*/
			if(str.indexOf("%") != -1) {
				return str;
			}
			var newStr = "";
			var count = 0;
			str = str.split(" ").join("")
			str = str.toString()
			if(str.indexOf(".") == -1) {
				for(var i = str.length - 1; i >= 0; i--) {
					if(count % 3 == 0 && count != 0) {
						newStr = str.charAt(i) + " " + newStr;
					} else {
						newStr = str.charAt(i) + newStr;
					}
					count++;
				}
				str = newStr;
			} else {
				for(var i = str.indexOf(".") - 1; i >= 0; i--) {
					if(count % 3 == 0 && count != 0) {
						newStr = str.charAt(i) + " " + newStr;
					} else {
						newStr = str.charAt(i) + newStr; //逐个字符相接起来
					}
					count++;
				}
				str = newStr + (str + "00").substr((str + "00").indexOf("."), 3);
			}
			return str
		}
	});
})(window.jQuery);
//日期格式化
Date.prototype.Format = function(fmt) { //author: meizz 
	var o = {
		"M+": this.getMonth() + 1, //月份 
		"d+": this.getDate(), //日 
		"h+": this.getHours(), //小时 
		"m+": this.getMinutes(), //分 
		"s+": this.getSeconds(), //秒 
		"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
		"S": this.getMilliseconds() //毫秒 
	};
	if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
	for(var k in o)
		if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
	return fmt;
}
$(function() {
	//登陆和登出，权限控制
	//			登陆和登出
	var mName = sessionStorage.getItem("account")
	if(mName == "" || mName == null || mName == undefined) {
		window.location.href = "login.html"
	}
	$("#userName").html("欢迎你 " + sessionStorage.getItem("account") + " !")
	$("#logout").click(function() {
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/mgmtUser/loginOut.do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				sessionStorage.clear()
				window.location.href = "login.html"
			}
		})
	})
	//			权限控制
	var currentQx = JSON.parse(sessionStorage.getItem("qxTotalArr"))
	$(".left ul").empty()
	var lis = ""
	lis += `<li data-level="0"><a href="modify.html">公众月报</a></li>`
	lis += `<li data-level="1"><a href="modify_personal_module.html">个人月报</a></li>`
	lis += `<li data-level="2"><a href="autoReceive.html">自动回复</a></li>`
	lis += `<li data-level="3"><a href="accountMange.html">用户管理</a></li>`
	lis += `<li data-level="4"><a href="adminPermissions.html">管理员权限</a></li>`
	lis += `<li data-level="5"><a href="dailyView_list.html">每日观点</a></li>`
	lis += `<li data-level="6"><a href="messageMange.html">模板消息管理</a></li>`
	lis += `<li data-level="7"><a href="ticketNumber.html">票券管理</a></li>`
	lis += `<li data-level="8"><a href="commodityManage.html">商品管理</a></li>`
	lis += `<li data-level="9"><a href="tradeMange.html">交易管理</a></li>`
	lis += `<li data-level="10"><a href="pointsSet.html">积分设置</a></li>`
	var urlArr = window.location.href.split("/")
	$(".left ul").append($(lis))
	$(".left ul li").each(function() {
		$(".left ul>li").removeClass("select_on")
		if($(this).find("a").attr("href") == urlArr[urlArr.length - 1].split("#")[0]) {
			$(this).find("a").addClass("select_on")
		}
	})
	for(var i = 0; i < currentQx.length; i++) {
		if(currentQx[i].canShow == "1") {
			$(`.left ul li[data-level='${currentQx[i].level}']`).show()
		}
	}

})