var app = angular.module("findPassword", [])
app.controller("findPasswordController", operation)

function operation($scope, $http, $interval) {
	$scope.showView=true
	//验证码
	createCode()
	var code = $("#confirm").html()

	function createCode() {
		code = "";
		var codeLength = 4; //验证码的长度
		var checkCode = document.getElementById("confirm");
		var codeChars = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
			'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
			'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'); //所有候选组成验证码的字符，当然也可以用中文的
		for(var i = 0; i < codeLength; i++) {
			var charNum = Math.floor(Math.random() * 52);
			code += codeChars[charNum];
		}
		if(checkCode) {
			//			checkCode.className = "code1";
			checkCode.innerHTML = code;
		}
	}
	$("#confirm").click(createCode)

	function validateCode() {
		var inputCode = $("#code").val();
		if(inputCode.length <= 0) {
			alert("请输入验证码！");
			return false

		} else if(inputCode.toUpperCase() != code.toUpperCase()) {
			alert("验证码输入有误！");
			$("#code").val("")
			createCode();
			return false
		} else {
			return true;
		}
	}
	//发送短信验证码
	$scope.sendMessage = function() {
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
			$(".sendMessage").attr("disabled", "disabled")
			$(".sendMessage").css("background", "#cccccc")
			$scope.messageCode="8888"
			
			$.ajax({
				type: "get",
				url: "http://202.102.90.20:9090/api/user/sendVerification.do?mobile=15951759137",
				async: false,
				success: function(data) {
					console.log(data);
					if(data.errcode == 0) {
//						alert("验证码已发出,请注意查收!");

					} else {
//						alert("验证码获取失败");
					}
				},
				error: function() {
//					alert('出错了!');
				}
			});
			var t = 60
			$(".sendMessage").html("60S后重新获取")
			var timer = $interval(function() {
				t--
				$(".sendMessage").html(t + "S后重新获取")
				if(t == 0) {
					$interval.cancel(timer)
					$(".sendMessage").removeAttr("disabled")
					$(".sendMessage").html("获取短信验证码")
					$(".sendMessage").css("background", "#c2a577")
				}
			}, 1000)
		}
	}
	//下一步
	$scope.next=function(){
		console.log($scope.messageCode)
			if($("#messageCode").val()==""){
				alert("手机验证码不能为空!!!")
			}else if($scope.messageCode==$("#messageCode").val()){
				$scope.showView=false
			}else{
				alert("短信验证码输入有误，请重新输入!!!")
				$("#messageCode").html("")
			}
			
		
	}
	$("#newPassword1").blur(function(){
		if($("#newPassword1").val()!=""){
			$(this).next().show()
		}
	})
	$("#newPassword2").blur(function(){
		if($("#newPassword1").val()==$("#newPassword2").val()){
			$(this).next().show()
			$(this).next().attr("src","img/correct.png")
		}else{
			$(this).next().show()
			$(this).next().attr("src","img/wrong.png")
		}
	})
	$scope.toSubmit=function(){
		var ok3=false
		var ok4=false
		if($("#newPassword1").val()==""){
			alert("新密码不能为空!!!")
			ok3=false
		}else{
			ok3=true
		}
		if($("#newPassword1").val()!=$("#newPassword2").val()){
			alert("两次输入的不一致，请重新输入!!!")
			$("#newPassword2").val("")
			ok4=false
		}else{
			ok4=true
		}
		if(ok3&&ok4){
			console.log("确认提交")
		}
	}
}