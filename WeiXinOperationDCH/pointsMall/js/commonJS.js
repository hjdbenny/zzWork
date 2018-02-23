/*以iPhone6 375*667尺寸为基准 1rem=10px */
(function(doc, win) {
	console.log("dpr:" + win.devicePixelRatio);
	var docEle = doc.documentElement,
		isIos = navigator.userAgent.match(/iphone|ipod|ipad/gi),
		dpr = Math.min(win.devicePixelRatio, 3);
	scale = 1 / dpr,

		resizeEvent = 'orientationchange' in window ? 'orientationchange' : 'resize';

	docEle.dataset.dpr = dpr;

	var metaEle = doc.createElement('meta');
	metaEle.name = 'viewport';
	metaEle.content = 'initial-scale=' + scale + ',maximum-scale=' + scale;
	docEle.firstElementChild.appendChild(metaEle);

	var recalCulate = function() {
		var width = docEle.clientWidth;
		if(width / dpr > 640) {
			width = 640 * dpr;
		}
		docEle.style.fontSize = 20 * (width / 750) + 'px';
	};

	recalCulate()

	if(!doc.addEventListener) return;
	win.addEventListener(resizeEvent, recalCulate, false);
})(document, window);
//公共插件
(function($) {
	$.fn.toggle = function(fn, fn2) { //点击来回切换
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
		"getUrlParam": function(name) { //获取url中的参数
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
			var r = window.location.search.substr(1).match(reg); //匹配目标参数
			if(r != null) return unescape(r[2]);
			return null; //返回参数值
		},
		"dedupe": function(array) { //普通数组去重
			return Array.from(new Set(array));
		},
		"format_number": function(str) { /*数字每隔3位，添加逗号*/
			var newStr = "";
			var count = 0;
			str = str.toString()
			if(str.indexOf(".") == -1) {
				for(var i = str.length - 1; i >= 0; i--) {
					if(count % 3 == 0 && count != 0) {
						newStr = str.charAt(i) + "," + newStr;
					} else {
						newStr = str.charAt(i) + newStr;
					}
					count++;
				}
				str = newStr + ".00"; //自动补小数点后两位
			} else {
				for(var i = str.indexOf(".") - 1; i >= 0; i--) {
					if(count % 3 == 0 && count != 0) {
						newStr = str.charAt(i) + "," + newStr;
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