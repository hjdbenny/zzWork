$(function() {
	$.ajax({
		type: "POST",
		url: `http://www.decaihui.com/wxweb/api/jf/order/getCurUserDetailOrder/${localStorage.getItem("orderId")}.do`,
		async: true,
		contentType: "application/json",
		success: function(data) {
			$("header img").attr("src", data.data.commodity.icon)
			$("header>div").html(data.data.commodity.name)
			$("#usePoints").html(`-${data.data.order.points}积分`)
			$("#useTime").html(`消费时间 ${new Date(data.data.order.createTime).Format("yyyy-MM-dd")}`)
			var type = data.data.commodity.type   //type:1 实物  2 票券  3 服务
			if(type == 2) {
				$(".ticket").show()
				$("#username").html("Michel")
				$("#ticketNum").html(format_number_trim("9659086702"))
				if(data.data.order.status == "0") {
					var statusDiv = `<div class="noSend">已发送</div>`
					$(".orderStatus").append($(statusDiv))
				} else {
					var statusDiv = `<div class="hasUsed">已使用</div>`
					$(".orderStatus").append($(statusDiv))
					$("#ticketNum").addClass("beUsed")
				}
			} else if(type == 3) {
				if(data.data.order.status == "0") {
					var statusDiv = `<div class="hasUsed">已使用</div><div class="arriveTime">服务期限12个月</div>`
					$(".orderStatus").append($(statusDiv))
				} else {
					var statusDiv = `<div class="hasSend">已生效</div><div class="arriveTime">服务期限12个月</div>`
					$(".orderStatus").append($(statusDiv))
				}
			} else if(type == 1) {
				if(data.data.order.status == "0") {
					var statusDiv = `<div class="noSend">待发货</div>`
					$(".orderStatus").append($(statusDiv))
					$(".preparing").show()
				} else {
					var statusDiv = `<div class="hasSend">已发货</div>`
					$(".orderStatus").append($(statusDiv))
					$("#wlcomany").html(data.data.order.logCompany)
					$("#orderNumber").html(data.data.order.logOrderNum)
					$(".logistics").show()
				}
			}
			setHeight()
			$(".detailsInfo").html(data.data.commodity.detail)
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

	function setHeight() {
		$(".details").css("min-height", $(window).height() - $(".details").offset().top + "px")
	}
	/*数字每隔4位，添加空格*/
	function format_number_trim(str) {
		var newStr = "";
		var count = str.length;
		str = str.split(" ").join("")
		str = str.toString()
		for(var i = str.length - 1; i >= 0; i--) {
			if(count % 4 == 0 && count != 0) {
				newStr = str.charAt(i) + " " + newStr;
			} else {
				newStr = str.charAt(i) + newStr;
			}
			count--;
		}
		str = newStr;
		return str
	}
})