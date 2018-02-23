$(function() {
	// 对Date的扩展，将 Date 转化为指定格式的String
	// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
	// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
	// 例子： 
	// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
	// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
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
	$.ajax({
		type: "POST",
		url: `http://www.decaihui.com/wxdch/api/jf/order/getCurUserDetailOrder/${localStorage.getItem("orderId")}.do`,
		async: true,
		contentType: "application/json",
		success: function(data) {
			console.log(data.data.commodity)
			$("header>div").html(data.data.commodity.name)
			$(".status>p:first-of-type").html(`-${data.data.order.points}积分`)
			$(".status>p:last-of-type").html(`消费时间${new Date(data.data.order.createTime).Format("yyyy-MM-dd")}`)
			if(data.data.order.status=="0"){
				$(".orderStatus").html("待发货")
				$(".orderStatus").addClass("noSend")
			}else{
				$(".orderStatus").html("已发货")
				$(".orderStatus").addClass("hasSend")
			}
			$("#wlcompany").html(data.data.order.logCompany)
			$("#orderNumber").html(data.data.order.logOrderNum)
			$(".detailsInfo").html(data.data.commodity.detail)
			$("header img").attr("src",data.data.commodity.icon)
			
			if(data.data.order.logOrderNum == ""&&data.data.order.status=="0") {
				$(".preparing").show()
			}
			if(data.data.order.status=="1"&&data.data.order.logOrderNum != ""){
				$(".logistics").show()
			}
		}
	});

	/* 复制到剪切板
	 * @see https://github.com/zenorocha/clipboard.js
	 */
	if(typeof Clipboard != 'function') {
		return false; /*避免未引入Clipboard抛错*/
	}
	var clipboard = new Clipboard('.copy', {
		text: function(trigger) {
			return $("#orderNumber").html();
		}
	});
	clipboard.on('success', function(e) {
		//		console.info('Action:', e.action);
		//		console.info('Text:', e.text);
		//		console.info('Trigger:', e.trigger);
		alert("复制成功")
		e.clearSelection();
	});

	clipboard.on('error', function(e) {
		alert("复制失败")
		//		console.error('Action:', e.action);
		//		console.error('Trigger:', e.trigger);
	});

	$(".details").css("min-height", $(window).height() - $(".details").offset().top + "px")
})