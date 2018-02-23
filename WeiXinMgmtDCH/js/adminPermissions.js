$(function() {
	obj = {
		begPageNo: 1,
		total: 20
	}

	//	加载列表
	loaded(obj)

	function loaded(obj) {
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/mgmtUserAuthority/listCommMgmtUsers.do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			data: JSON.stringify(obj),
			success: function(data) {
				loadReview(data.data)
				$totalData = data.total
				totalPage = Math.ceil($totalData / 20) //总页数	
				$("#count").html($totalData)
				if(totalPage > 1) {
					$(".M-box1").show()
					$(".M-box1").pagination({
						totalData: $totalData,
						showData: 20,
						coping: true,
						callback: function(api) {
							obj.begPageNo = api.getCurrent().toString()
							$.ajax({
								type: "POST",
								url: "http://www.decaihui.com/wxmgmt/api/mgmtUserAuthority/listCommMgmtUsers.do",
								async: true,
								contentType: "application/json",
								data: JSON.stringify(obj),
								xhrFields: {
									withCredentials: true
								},
								success: function(data) {
									loadReview(data.data)
								}
							});
						}
					})
				} else {
					$(".M-box1").hide()
				}
			}
		});
	}
	//加载列表数据
	function loadReview(arr) {
		$(".container table tr:gt(0)").remove()
		for(var i = 0; i < arr.length; i++) {
			var tlis = ""
			tlis += "<tr>"
			tlis += "<td>" + arr[i].account + "</td>"
			tlis += "<td>" + arr[i].name + "</td>"
			tlis += "<td>" + new Date(arr[i].createDate).Format("yyyy-MM-dd") + "</td>"
			tlis += "<td data-id='" + arr[i].id + "'><a href='###' class='modify'>编辑</a><a href='###' class='del'>删除</a></td>"
			tlis += "</tr>"
			$(".container table").append($(tlis))
		}
		toModify()
		toDel()
	}
	//列表搜索
	$(".search").click(function() {
		if($("#keywords input").val() == "") {
			delete obj.keyword
		} else {
			obj.keyword = $("#keywords input").val()
		}
		if($("#from").val() == "") {
			delete obj.begDate
		} else {
			obj.begDate = $("#from").val()
		}
		if($("#to").val() == "") {
			delete obj.endDate
		} else {
			obj.endDate = $("#to").val()
		}
		loaded(obj)
	})
	var modFuns = []
	var pwdNoChange = true
	var preArr = []
	var objUnassigned = {
		begPageNo: 1,
		total: 10
	}
	var currentId=null
	//新建
	$(".newAdd").click(function() {
		initPop()
		currentId=null
	})
	//修改
	function toModify() {
		$(".modify").each(function() {
			$(this).click(function() {
				initPop()
				currentId=$(this).parent().data("id")
				$.ajax({
					type: "POST",
					url: `http://www.decaihui.com/wxmgmt/api/mgmtUserAuthority/getCommMgmtUser/${$(this).parent().data("id")}.do`,
					async: true,
					contentType: "application/json",
					success: function(data) {
						$("#account").val(data.data.account)
						$("#accountName").val(data.data.name)
						$("#pwd").val("******")
						$("#remarks").val(data.data.remarks)
						modFuns = data.data.modfuns
						pwdNoChange = true
						$(".modFuns>li").each(function() {
							for(var i = 0; i < modFuns.length; i++) {
								if(modFuns[i] == $(this).data("modfun")) {
									$(this).addClass("hasFun")
									$(this).find("img").show()
								}
							}
						})
						$(".accountChildFun>li").each(function() {
							for(var i = 0; i < modFuns.length; i++) {
								if(modFuns[i] == $(this).data("modfun")) {
									$(this).trigger("click")
								}
							}
						})
						modFuns=[]
						for(var i = 0; i < data.data.jyUsers.length; i++) {
							var nowObj = {
								name: data.data.jyUsers[i].name,
								id: data.data.jyUsers[i].id,
								mobile: data.data.jyUsers[i].mobile
							}
							preArr.push(nowObj)
						}
						loadPreview(preArr)
						//						preArr=//获取已分配的人
					}
				});
			})
		})
	}
	//删除
	function toDel() {
		$(".del").each(function() {
			$(this).click(function() {
				if(confirm("确认删除所选项？")){
					$.ajax({
						type: "POST",
						url: `http://www.decaihui.com/wxmgmt/api/mgmtUserAuthority/deleteCommMgmtUser/${$(this).parent().data("id")}.do`,
						async: true,
						contentType: "application/json",
						success: function(data) {
							if(data.code == "000") {
								loaded(obj)
							} else {
								alert("删除失败!" + data.code)
							}
						}
					});
				}		
			})
		})
	}
	//初始化弹框
	function initPop() {
		$(".popup_bg").show()
		$(".popup_bg").width($(document).width())
		$(".popup_bg").height($(document).height())
		$(".step1").show()
		$(".step2").hide()
		$(".step3").hide()
		$("#account").val("")
		$("#accountName").val("")
		$("#pwd").val("")
		$("#remarks").val("")
		$(".preList").empty()
		modFuns = []
		preArr = []
		$(".modFuns>li").each(function() {
			$(this).removeClass("hasFun")
			$(this).find("img").hide()
		})
		$(".parentFun").each(function() {
			$(this).removeClass("childHasFun")
			$(this).find("img").hide()
		})
		$(".childFuns .circle2").each(function() {
			$(this).hide()
		})
		$(".search-box input").val("")
		objUnassigned = {
			begPageNo: 1,
			total: 10
		}
		getUnassignedPeople(objUnassigned)
	}
	//弹框关闭
	$(".pop-close").click(function() {
		$(".popup_bg").hide()
	})
	//清空
	$(".clear").click(function() {
		$(".textInput input").val("")
	})
	//跳转到第二步
	$(".step1 .next").click(function() {
		var confirmFlag = true
		if($("#account").val().trim() == "" && $("#accountName").val().trim() == "" && $("#pwd").val().trim() == "") {
			alert("基本信息不完整，请重新填写!")
			confirmFlag = false
		} else {
			if($("#account").val().trim() == "") {
				alert("账号不能为空!")
				confirmFlag = false
			}
			if($("#accountName").val().trim() == "") {
				alert("姓名不能为空!")
				confirmFlag = false
			}
			if($("#pwd").val().trim() == "") {
				alert("密码不能为空!")
				confirmFlag = false
			}
		}

		if(confirmFlag) {
			$(".step1").hide()
			$(".step2").show()
			$(".step3").hide()
			$(".modFuns>li").eq(3).trigger("click")
			$(".accountChildFun").trigger("mouseleave")
		}
	})
	//选择功能
	$(".modFuns>li").each(function() {
		$(this).click(function() {
			if($(this).hasClass("accoutParentFun")) {
				$(".accountChildFun").show()
			} else {
				if($(this).hasClass("hasFun")) {
					$(this).removeClass("hasFun")
					$(this).find("img").hide()
				} else {
					$(this).addClass("hasFun")
					$(this).find("img").show()
				}
			}
		})
	})
	//子功能1-----用户管理选择
	$(".accountChildFun>li").each(function() {
		$(this).click(function() {
			if($(this).find("div[class='circle2']").is(":visible")) {
				$(this).find("div[class='circle2']").hide()
			} else {
				$(this).find("div[class='circle2']").show()
			}
		})
	})
	//子功能选择关闭
	$(".accountChildFun").mouseleave(function() {
		var tempStr = []
		if($(".accountChildFun .circle2:visible").length == 0) {
			$(".accoutFunName").html("用户管理")
			$(".accoutParentFun").removeClass("childHasFun")
			$(".accoutParentFun").find("img").hide()
		} else {
			$(".accountChildFun .circle2:visible").each(function() {
				if($(".accountChildFun .circle2:visible").length == $(".accountChildFun .circle2").length) {
					$(".accoutFunName").html("用户管理")
				} else if($(".accountChildFun .circle2:visible").length == 1) {
					$(".parentFunName").html($(this).parent().next().html())
				} else {
					tempStr.push($(this).parent().next().html())
					$(".accoutFunName").html(tempStr.join("<br/>"))
				}
			})
			$(".accoutParentFun").addClass("childHasFun")
			$(".accoutParentFun").find("img").show()
		}
		$(".childFuns .circle2").each(function() {
			if($(this).is(":visible")){
				modFuns.push($(this).parent().parent().data("modfun"))
			}else{
				for (var k=0;k<modFuns.length;k++) {
					if($(this).parent().parent().data("modfun")==modFuns[k]){
						modFuns.splice(k,1)
					}
				}
			}	
		})
		$(".accountChildFun").hide()
	})
	//返回第一步
	$(".step2 .prev").click(function() {
		$(".step1").show()
		$(".step2").hide()
		$(".step3").hide()
	})
	//跳转到第三步
	$(".step2 .next").click(function() {
		$(".step1").hide()
		$(".step2").hide()
		$(".step3").show()
		$(".modFuns>li[class='hasFun']").each(function() {
			modFuns.push($(this).data("modfun"))
		})
		modFuns=$.dedupe(modFuns)
	})
	//返回第二步
	$(".step3 .prev").click(function() {
		$(".step1").hide()
		$(".step2").show()
		$(".step3").hide()
	})
	//检测密码是否改变
	$("#pwd").change(function() {
		pwdNoChange = false
	})
	//第三步下的人员搜索
	$(".optionSearch").click(function() {
		if($(".search-box input").val().trim() == "") {
			delete objUnassigned.keyword
		} else {
			objUnassigned.keyword = $(".search-box input").val().trim()
		}
		getUnassignedPeople(objUnassigned)
	})
	//提交保存
	$(".save").click(function() {
		if(pwdNoChange) {
			var nowPwd = null
		} else {
			var nowPwd = $("#pwd").val()
		}
		var jyUserIdsArr = []
		for(var i = 0; i < preArr.length; i++) {
			jyUserIdsArr.push(preArr[i].id)
		}
		var objAdmin = {
			id:currentId,
			modfuns: modFuns,
			name: $("#accountName").val(),
			password: nowPwd,
			account: $("#account").val(),
			remark: $("#remarks").val(),
			jyUserIds: jyUserIdsArr
		}
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/mgmtUserAuthority/saveOrUpdateCommMgmtUser.do",
			async: true,
			contentType: "application/json",
			data: JSON.stringify(objAdmin),
			success: function(data) {
				if(data.code == "000") {
					$(".popup_bg").hide()
					loaded(obj)
				} else {
					alert("提交失败")
				}
			}
		});
	})
	//查询未被分配管理的人
	function getUnassignedPeople(objUnassigned) {
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/mgmtUserAuthority/listUnAssignedJyUser.do",
			async: true,
			contentType: "application/json",
			data: JSON.stringify(objUnassigned),
			success: function(data) {
				loadUnassignedPeople(data.data)
				var popTotalData = data.total
				var totalPage = Math.ceil(popTotalData / 10) //总页数	
				if(totalPage > 1) {
					$(".M-box2").show()
					$(".M-box2").pagination({
						totalData: popTotalData,
						showData: 10,
						coping: true,
						count: 1,
						callback: function(api) {
							objUnassigned.begPageNo = api.getCurrent().toString()
							$.ajax({
								type: "POST",
								url: "http://www.decaihui.com/wxmgmt/api/mgmtUserAuthority/listUnAssignedJyUser.do",
								async: true,
								contentType: "application/json",
								data: JSON.stringify(objUnassigned),
								success: function(data) {
									loadUnassignedPeople(data.data)
								}
							});
						}
					})
				} else {
					$(".M-box2").hide()
				}
			}
		});
	}
	//载入未被分配管理的人名单
	function loadUnassignedPeople(arr) {
		$(".people .list").empty()
		for(var i = 0; i < arr.length; i++) {
			var lis = `<li data-code="${arr[i].id}" data-name="${arr[i].name}" data-mobile="${arr[i].mobile}">`
			lis += `<div class="circle1"><div class="circle2"></div></div>`
			lis += `<div>${arr[i].id}&nbsp;&nbsp;${arr[i].name}&nbsp;&nbsp;(${dictionary(arr[i].department)})&nbsp;&nbsp;${arr[i].mobile}</div>`
			lis += `</li>`
			$(".people .list").append($(lis))
		}
		selectPeople()
	}
	//选择人员
	function selectPeople() {
		$(".people .list>li").each(function() {
			$(this).click(function() {
				$(this).find("div[class='circle2']").show()
				var perObj = {
					name: $(this).data("name"),
					id: $(this).data("code"),
					mobile: $(this).data("mobile")
				}
				preArr.push(perObj)
				preArr = $.reduceArray(preArr)
				loadPreview(preArr)
			})
		})
	}
	//人员预览框添加
	function loadPreview(arr) {
		$(".preList").empty()
		for(var i = 0; i < arr.length; i++) {
			var lis = `<li data-id="${arr[i].id}">`
			lis += `${arr[i].id}&nbsp;&nbsp;${arr[i].name}&nbsp;&nbsp;${arr[i].mobile}&nbsp;&nbsp;<img src="img/preDel.png" class="preDel">`
			lis += `</li>`
			$(".preList").append($(lis))
		}
		$(".preShow span").html(arr.length)
		preDel()
	}
	//人员预览框删除(有问题待修改)
	function preDel() {
		$(".preList .preDel").each(function() {
			$(this).click(function() {
				for(var i = 0; i < preArr.length; i++) {
					if(preArr[i].id == $(this).parent().data("id")) {
						preArr.splice(i, 1)
					}
				}
				loadPreview(preArr)
				var parentId=$(this).parent().data("id")
				$(".people .list>li").each(function(){
					if($(this).data("code")==parentId){
						$(this).find("div[class='circle2']").hide()
					}
				})
			})
		})
	}
	//	查询日期范围
	$.findTimeRange($("#from"), $("#to"))
	//	}
	//营业部字典
	function dictionary(n) {
		var depart = ""
		if(n.indexOf("营业部") != -1) {
			return depart = n.split("营业部")[0];
		}
		if(n.indexOf("分公司") != -1) {
			return depart = n.split("分公司")[0];
		}
	}
//	$.ajax({
//		type: "POST",
//		url: "http://www.decaihui.com/wxmgmt/api/mgmtUserAuthority/listModuleFunctions.do",
//		async: true,
//		contentType: "application/json",
//		data: JSON.stringify(objUnassigned),
//		success: function(data) {
//			console.log(data)
//		}
//	});
})