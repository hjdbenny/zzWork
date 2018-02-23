$(function() {
	var locationHref = window.location.href
	if(locationHref.indexOf("before") != -1) {
		$(".shareGuide").show()
	}
	//	判断手机号
	function judgeMobile() {
		var ok1 = false
		var re1 = /^0?(13[0-9]|15[012356789]|17[013678]|18[0-9]|14[57])[0-9]{8}$/
		var mobile = $("#mobile").val()
		if(mobile == "") {
			alert("手机号不能为空！")
			ok1 = false
		} else {
			if(re1.test(mobile)) {
				ok1 = true
			} else {
				ok1 = false
				alert("请输入正确11位手机号！！！")
				$("#mobile").val("")
			}
		}
		return ok1
	}
	//发送验证码
	$(".sendMessage").click(function() {

		if(judgeMobile()) {
			$(".sendMessage").attr("disabled", "disabled")
			$.ajax({
				type: "POST",
				url: `http://www.decaihui.com/wxdch/api/personal/sendPhoneVerificationCode/${$("#mobile").val()}.do`,
				async: false,
				contentType: "application/json",
				xhrFields: {
					withCredentials: true
				},
				success: function(data) {
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
			$(".sendMessage").html("已发送")
			$(".sendMessage").css("color", "#5a5959")
			var t = 60
			var timer = setInterval(function() {
				t--
				$(".sendMessage").html(t + "S后重新获取")
				if(t == 0) {
					clearInterval(timer)
					$(".sendMessage").removeAttr("disabled")
					$(".sendMessage").html("重新发送")
					$(".sendMessage").css("color", "#ba0f0e")
				}
			}, 1000)
		}
	})
	//领取新人奖励
	$(".btn").click(function() {
		var ok3=judgeMobile()
		var ok2 = false
		var messageCode = $("#code").val()
		if(messageCode == "") {
			alert("验证码不能为空！")
			ok2 = false
		} else {
			ok2 = true
		}
		if(ok3 && ok2) {
			var bindObj = {
				hostClientCode: getUrlParam("after"),
				phoneNumber: $("#mobile").val(),
				code: messageCode,
			}
			$.ajax({
				type: "POST",
				url: "http://www.decaihui.com/wxdch/api/jf/invite/bind.do",
				async: false,
				contentType: "application/json",
				data:JSON.stringify(bindObj),
				xhrFields: {
					withCredentials: true
				},
				success: function(data) {
					if(data.code=="000"){
						alert("绑定成功")
						$(".toBind").hide()
						$(".toSuccess").show()
					}else{
						alert(data.message)
					}
				}
			});
		}
	})
	console.log(getUrlParam("after"))
	//获取url中的参数, code
	function getUrlParam(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
		var r = window.location.search.substr(1).match(reg); //匹配目标参数
		if(r != null) return unescape(r[2]);
		return null; //返回参数值
	}
	$(".shareGuide").height($(".container-wrapper").height())
})