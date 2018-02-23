$(function() {
	var H = $(window).height();
	$("section").height(H - 3)

	var qxTotalArr = [{
		"canShow": "0",
		"name": "久赢月报",
		"level": "0",
		"url": "modify.html"
	}, {
		"canShow": "0",
		"name": "我的月报",
		"level": "1",
		"url": "modify_personal_module.htmlml"
	}, {
		"canShow": "0",
		"name": "微信回复消息",
		"level": "2",
		"url": "autoReceive.html"
	}, {
		"canShow": "0",
		"name": "用户管理",
		"level": "3",
		"url": "accountMange.html",
		"children": [{
			"canShowChild": "0",
			"name": "用户管理_久赢账户管理"
		}, {
			"canShowChild": "0",
			"name": "用户管理_微信粉丝管理"
		}, {
			"canShowChild": "0",
			"name": "用户管理_VIP权限管理"
		}]
	}, {
		"canShow": "0",
		"name": "普通通用户权限控制",
		"level": "4",
		"url": "adminPermissions.html"
	}, {
		"canShow": "0",
		"name": "每日观点",
		"level": "5",
		"url": "dailyView_list.html"
	}, {
		"canShow": "0",
		"name": "微信模板消息管理",
		"level": "6",
		"url": "messageMange.html"
	}, {
		"canShow": "0",
		"name": "票券管理",
		"level": "7",
		"url": "ticketNumber.html"
	}, {
		"canShow": "0",
		"name": "商品管理",
		"level": "8",
		"url": "commodityManage.html"
	}, {
		"canShow": "0",
		"name": "交易管理",
		"level": "9",
		"url": "tradeMange.html"
	}, {
		"canShow": "0",
		"name": "积分设置",
		"level": "10",
		"url": "pointsSet.html"
	}]
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
			checkCode.className = "code1";
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
	//登陆
	$("#login").click(function(e) {
		e.preventDefault()
		ok1 = ok2 = false
		ok3 = validateCode()
		if($("#userName").val() == "") {
			alert("用户名不能为空!")
			ok1 = false
		} else {
			ok1 = true
		}
		if($("#password").val() == "") {
			alert("密码不能为空!")
			ok2 = false
		} else {
			ok2 = true
		}
		obj = {
			account: $("#userName").val(),
			password: $("#password").val()
		}

		if(ok1 && ok2 && ok3) {
			$.ajax({
				type: "POST",
				url: "http://www.decaihui.com/wxmgmt/api/mgmtUser/login.do",
				async: true,
				data: JSON.stringify(obj),
				contentType: "application/json",
				xhrFields: {
					withCredentials: true
				},
				success: function(data) {
					if(data.code == "000") {
						sessionStorage.setItem("account", obj.account)
						$.ajax({
							type: "POST",
							url: "http://www.decaihui.com/wxmgmt/api/mgmtUser/getCurrentUser.do",
							async: false,
							contentType: "application/json",
							xhrFields: {
								withCredentials: true
							},
							success: function(data) {
								if(data.data.type == "1") {
									if(data.data.modfuns.length == 0) {
										alert("该账号没有被分配权限，请联系超级管理员")
									}
									for(var i = 0; i < data.data.modfuns.length; i++) { //判断主功能
										for(var j = 0; j < qxTotalArr.length; j++) {
											if(data.data.modfuns[i] == qxTotalArr[j].name) {
												qxTotalArr[j].canShow = "1"
											}
										}
									}
									qxTotalArr[3].canShow = "0"
									for(var i = 0; i < data.data.modfuns.length; i++) { //判断子功能
										for(var j = 0; j < qxTotalArr[3].children.length; j++) {
											if(data.data.modfuns[i] == qxTotalArr[3].children[j].name) {
												qxTotalArr[3].children[j].canShowChild = "1"
												qxTotalArr[3].canShow = "1"
											}
										}
									}
									qxTotalArr.sort(function(a, b) { //根据左侧导航栏，对数组排序
										return a.level - b.level;
									})
									for(var i = 0; i < qxTotalArr.length; i++) {
										if(qxTotalArr[i].canShow == "1") {
											window.location.href = qxTotalArr[i].url
											break;
										}
									}
								} else {
									for(var i = 0; i < qxTotalArr.length; i++) {
										qxTotalArr[i].canShow = "1"
										if(i == 3) {
											for(var j = 0; j < qxTotalArr[i].children.length; j++) {
												qxTotalArr[i].children[j].canShowChild = "1"
											}
										}
									}
									window.location.href = "modify.html"
								}
								sessionStorage.setItem("qxTotalArr", JSON.stringify(qxTotalArr))
								sessionStorage.setItem("account", $("#userName").val())
							}
						});
					} else {
						alert("用户名或密码错误，请重新输入！")
						$("#userName").val(""),
							$("#password").val("")
						$("#code").val("")
						createCode()
					}
				}
			});
		}
	})
})