$(function() {
	//手机端虚拟键盘弹出使界面布局混乱解决方法
	　$('body').height($('body')[0].clientHeight);
//	验证码
	$.createCode()
	var code = $("#confirm").html()

	$("#confirm").click($.createCode)

	function validateCode() {
		var inputCode = $("#code").val();
		if(inputCode.length <= 0) {
			alert("请输入验证码！");
			return false

		} else if(inputCode.toUpperCase() != code.toUpperCase()) {
			alert("验证码输入有误！");
			$("#code").val("")
			$.createCode()
			return false
		} else {
			return true;
		}
	}
	//发送短信验证码
	$(".sendMessage").click(function() {
		var ok1 = false
		var ok2 = validateCode()
		var re1 = /^0?(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])[0-9]{8}$/
		var mobile = $("#mobile").val()
		if(mobile == "") {
			alert("手机号不能为空！！！")
			ok1 = false
		} else {
			if(re1.test(mobile)) {
				ok1 = true
			} else {
				ok1 = false
				alert("请输入11位手机号！！！")
				$("#mobile").val("")
			}
		}
		if(ok1 && ok2) {
			$(this).attr("disabled", "disabled")
			$(this).css("background", "#cccccc")
			$.ajax({
				type: "POST",
				url: "http://www.decaihui.com/wxweb/api/personal/sendPhoneVerificationCode/" + mobile + ".do",
				async: true,
				contentType: "application/json",
				xhrFields: {
					withCredentials: true
				},
				success: function(data) {
					$("footer").removeClass("disclick")
					if(data.code == 0) {
						alert("验证码已发出,请注意查收!");
					} else {
						alert("验证码获取失败");
					}
				},
				error: function() {
					alert('出错了!');
				}
			});
			var t = 60
			$(this).html("60S后重新获取")
			var timer = setInterval(function() {
				t--
				$(".sendMessage").html(t + "S后重新获取")
				if(t == 0) {
					clearInterval(timer)
					$(".sendMessage").removeAttr("disabled")
					$(".sendMessage").html("重新发送")
					$(".sendMessage").css("color","#ba0f0e")		
				}
			}, 1000)
		}
	})
	$("footer").click(function() {
		if(!$(this).hasClass("disclick")) {
			var bindObj = {
				phoneNumber: $("#mobile").val(),
				code: $("#messageCode").val()
			}
			$.ajax({
				type: "POST",
				url: "http://www.decaihui.com/wxweb/api/personal/bind.do",
				async: true,
				contentType: "application/json",
				data: JSON.stringify(bindObj),
				xhrFields: {
					withCredentials: true
				},
				success: function(data) {
					if(data.code == "000") {
						sessionStorage.setItem("code", "000")
						window.location.href = "bindInfo.html"
					} else if(data.code == "003") {
						sessionStorage.setItem("code", "003")
						window.location.href = "bindInfo.html"
					} else {
						sessionStorage.setItem("code", "001")
						window.location.href = "bindInfo.html"
					}
				}
			});
		}
	})
})