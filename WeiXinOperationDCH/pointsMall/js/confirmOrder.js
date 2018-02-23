$(function() {
	$("#orderNum").html(new Date().getTime())
	$("#createTime").html(new Date().Format("yyyy-MM-dd"))
	$("#commodityPic").attr("src", localStorage.getItem("commodityIcon"))
	$("#commodityInfo").html(localStorage.getItem("commodityDescription"))
	$("#commodityPoints span").html(`${localStorage.getItem("commodityPoint")} 积分`)
	$("#exchangePoints").html(localStorage.getItem("commodityPoint"))
	$("#balance").html(`${localStorage.getItem("currentPoints")}积分`)

	var orderObj = {
		jfCommodityId: localStorage.getItem("productid"),
		orderNumber: $("#orderNum").html()
	}
	var productType = localStorage.getItem("productType") //type:1 实物  2 票券  3 服务
	var statusType1 = false //实物订单
	var statusType2 = false //虚拟订单-票券类
	var statusType3 = false //虚拟订单-服务类
	if(productType == 1) { //1 实物
		$(".physical").show()
		$(".ticket").hide()
		$(".service").hide()
		$(".middle-b").html("实物商品")
	} else if(productType == 2) { //2 票券 
		$(".ticket").show()
		$(".service").hide()
		$(".physical").hide()
		$(".middle-b").html("电子票券")
	} else if(productType == 3) { // 3 服务
		$(".service").show()
		$(".ticket").hide()
		$(".physical").hide()
		$(".middle-b").html("管家服务")
	}

	if($(".ticket").is(":visible")) {
		infoStatus(".ticket input")
		$(".ticket input").each(function() {
			$(this).keyup(function() {
				infoStatus(".ticket input")
			})
		})
		statusType2 = true
		findAddress()
	} else if($(".service").is(":visible")) {
		$("#infoStatus").attr("src", "img/all.png")
		$("#infoStatus").removeClass("infoLoss")
		statusType3 = true
	} else if($(".physical").is(":visible")) {
		infoStatus(".physical input")
		$(".physical input").each(function() {
			$(this).keyup(function() {
				infoStatus(".physical input")
			})
		})
		statusType1 = true
		findAddress()
	}
	//信息状态，是否完整
	function infoStatus(elem) {
		var hasEmpty = false
		$(elem).each(function() {
			if($(this).val().trim() == "") {
				hasEmpty = true;
			}
		})
		if(hasEmpty) {
			$("#infoStatus").attr("src", "img/noall.png")
			$("#infoStatus").addClass("infoLoss")
		} else {
			$("#infoStatus").attr("src", "img/all.png")
			$("#infoStatus").removeClass("infoLoss")
		}
	}
	$("#city-picker").cityPicker({
		title: "选择省市区/县",
		onChange: function(picker, values, displayValues) {
			var str1 = $("#tel-physical").val().trim()
			var str2 = $("#recipient-physical").val().trim()
			var str3 = $("#address-physical").val().trim()

			if(str1 != "" && str2 != "" && str3 != "") {
				$("#infoStatus").attr("src", "img/all.png")
				$("#infoStatus").removeClass("infoLoss")
			} else {
				$("#infoStatus").attr("src", "img/noall.png")
				$("#infoStatus").addClass("infoLoss")
			}
		}
	});
	//提交订单
	$(".submit").click(function() {
		var re1 = /^0?(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])[0-9]{8}$/
		var mobile_virtual = $("#tel-virtual").val()
		var mobile_physical = $("#tel-physical").val()
		var ok1 = false
		var ok2 = false

		if($("#infoStatus").hasClass("infoLoss")) {
			alert("信息不全，请先补充完整信息")
		} else {
			if(statusType2) {
				if(re1.test(mobile_virtual)) {
					ok1 = true
				} else {
					ok1 = false
					alert("请输入11位手机号！！！")
					$("#tel-virtual").val("")
					$("#infoStatus").attr("src", "img/noall.png")
					$("#infoStatus").addClass("infoLoss")
				}
				if(ok1) {
					orderObj.province = ""
					orderObj.city = ""
					orderObj.district = ""
					orderObj.address = ""
					orderObj.recipient = $("#recipient-virtual").val()
					orderObj.phone = $("#tel-virtual").val()
					pay(orderObj)
				}
			} else if(statusType3) {
				orderObj.province = ""
				orderObj.city = ""
				orderObj.district = ""
				orderObj.address = ""
				orderObj.recipient = ""
				orderObj.phone = ""
				pay(orderObj)
			} else if(statusType1) {
				if(re1.test(mobile_physical)) {
					ok2 = true
				} else {
					ok2 = false
					alert("请输入11位手机号！！！")
					$("#tel-physical").val("")
					$("#infoStatus").attr("src", "img/noall.png")
					$("#infoStatus").addClass("infoLoss")
				}
				if(ok2) {
					orderObj.province = $("#city-picker").val().split(" ")[0]
					orderObj.city = $("#city-picker").val().split(" ")[1]
					orderObj.district = $("#city-picker").val().split(" ")[2]
					orderObj.address = $("#address-physical").val()
					orderObj.recipient = $("#recipient-physical").val()
					orderObj.phone = $("#tel-physical").val()
					pay(orderObj)
				}
			}
		}
	})
	//最终支付
	function pay(orderObj) {
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxweb/api/jf/commodity/convertCommodity.do`,
			async: true,
			contentType: "application/json",
			data: JSON.stringify(orderObj),
			success: function(data) {
				if(data.code == "111") {
					$(".payFail").show()
					$("footer>div:first-of-type>div:last-of-type").css("color", "#f23333")
					setTimeout(function() {
						$(".payFail").hide()
					}, 1000)
				} else if(data.code == "000") {
					sessionStorage.setItem("orderNum", $("#orderNum").html())
					window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7806a150c562b73c&redirect_uri=" + encodeURIComponent("http://www.decaihui.com/wxweb/pointsMall/orderSuccess.html?isChild=true") + "&response_type=code&scope=snsapi_base&connect_redirect=1#wechat_redirect"
				}
			}
		});
	}
	//查询收货地址
	function findAddress() {
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxweb/api/jf/commodity/getAddress.do`,
			async: true,
			contentType: "application/json",
			success: function(data) {
				if(data.data.recipient != null) {
					$("#recipient-virtual").val(data.data.recipient)
					$("#recipient-physical").val(data.data.recipient)
				}
				if(data.data.phone != null) {
					$("#tel-virtual").val(data.data.phone)
					$("#tel-physical").val(data.data.phone)
				}
				if(data.data.province != null) {
					$("#city-picker").val(`${data.data.province} ${data.data.city} ${data.data.district}`)
				}
				if(data.data.address != null) {
					$("#address-physical").val(data.data.addresse)
				}
			}
		});
	}
})