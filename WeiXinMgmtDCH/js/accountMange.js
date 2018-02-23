$(function() {
	//下拉选择
	function selectOption(elem) {
		$(elem + ">div:last-of-type").click(function() {
			$(elem + ">ul").show()
		})
		$(elem + ">ul li").each(function() {
			$(this).click(function() {
				$(this).parent().hide()
				$(elem + ">div:first-of-type").html($(this).html())
				if(elem == ".serviceTerm>div") {
					$("#serviceTime").val(parseInt($(this).html()))
				}
			})
		})
	}
	selectOption(".status>div")
	var obj = {
		begPageNo: 1,
		total: 10
	}
	var ajaxUrl = "http://www.decaihui.com/wxmgmt/api/mgmtUser/listJyUsers.do"
	var wxAjaxUrl = "http://www.decaihui.com/wxmgmt/api/mgmtUser/listUnBlackWxUsers.do"

	function loaded(obj, ajaxUrl, elem, flag) { //flag:0为用户列表，1为兑换支出列表，2为兑换收入列表，3为成功邀请,4为订阅用户列表
		$.ajax({
			type: "POST",
			url: ajaxUrl,
			async: false,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			data: JSON.stringify(obj),
			beforeSend: function() {
				$(`${elem} .loading`).show()
			},
			complete: function() {
				$(`${elem} .loading`).hide()
			},
			success: function(data) {
				if(data.data.length == 0) {
					if(flag == 1 || flag == 2) {
						$(".more-record .noData").show()
					} else if(flag == 3) {
						$(".more-invitation .noData").show()
					}
				}
				if(flag == 0) {
					loadReview(data.data) //加载用户列表
				} else if(flag == 1) {
					loadHistoryOut(data.data) //加载历史兑换支出列表
				} else if(flag == 2) {
					loadHistoryIn(data.data) //加载历史兑换收入列表
				} else if(flag == 3) {
					loadInvitationList(data.data) //加载成功邀请列表
				} else if(flag == 4) {
					loadWxList(data.data) //加载订阅用户列表			
				} else if(flag == 5) {
					loadUserHistory(data.data) //加载订阅用户相关历史
				}
				$totalData = data.total
				totalPage = Math.ceil($totalData / 10) //总页数	
				$(`${elem} .countNum`).html($totalData)
				if(totalPage > 1) {
					$(`${elem} .M-box1`).show()
					$(`${elem} .M-box1`).pagination({
						totalData: $totalData,
						showData: 10,
						coping: true,
						callback: function(api) {
							obj.begPageNo = api.getCurrent().toString()
							$.ajax({
								type: "POST",
								url: ajaxUrl,
								async: false,
								contentType: "application/json",
								xhrFields: {
									withCredentials: true
								},
								data: JSON.stringify(obj),
								beforeSend: function() {
									$(`${elem} .loading`).show()
									$(".pagefoot").hide()
								},
								complete: function() {
									$(`${elem} .loading`).hide()
									$(".pagefoot").show()
								},
								success: function(data) {
									if(flag == 0) {
										loadReview(data.data) //加载用户列表
									} else if(flag == 1) {
										loadHistoryOut(data.data) //加载历史兑换支出列表
									} else if(flag == 2) {
										loadHistoryIn(data.data) //加载历史兑换收入列表
									} else if(flag == 3) {
										loadInvitationList(data.data) //加载成功邀请列表
									} else if(flag == 4) {
										loadWxList(data.data) //加载订阅用户列表
									} else if(flag == 5) {
										loadUserHistory(data.data) //加载订阅用户相关历史
									}
								}
							});
						}
					})
				} else {
					$(`${elem} .M-box1`).hide()
				}
			}
		})
	}
	//加载久赢用户列表
	function loadReview(arr) {
		$(".container .accountTable tr:gt(0)").remove()
		for(var i = 0, len = arr.length; i < len; i++) {
			if(arr[i].wxHeadimgurl == null) {
				var wxHeadimgurl = "img/default.jpg"
			} else {
				var wxHeadimgurl = arr[i].wxHeadimgurl
			}
			if(arr[i].jfPoints == null) {
				var jfPoints = "0"
			} else {
				var jfPoints = arr[i].jfPoints
			}
			var tlis = ""
			tlis += `<tr>`
			tlis += `<td><img src="${wxHeadimgurl}"></td>`
			tlis += `<td>${arr[i].clientCode}</td>`
			tlis += `<td>JY${arr[i].contestJyUserId}</td>`
			tlis += `<td>${arr[i].name}</td>`
			tlis += `<td>营业部未知</td>`
			tlis += `<td>${arr[i].mobile}</td>`
			tlis += `<td>${jfPoints}</td>`
			tlis += `<td>关联时间未知</td>`
			tlis += "<td><a href='###' class='toMore'>更多操作</a></td>"
			tlis += "</tr>"
			$(".container .accountTable").append($(tlis))
		}
		$(".container .accountTable td").each(function() {
			if($(this).html() == "未绑定") {
				$(this).addClass("unbind")
			}
		})
		toMore()
	}
	//加载订阅用户列表
	function loadWxList(arr) {
		$(".wxTable tr:gt(0)").remove()
		for(var i = 0, len = arr.length; i < len; i++) {
			if(arr[i].isVip) {
				var isVip = "VIP"
			} else {
				var isVip = "普通"
			}
			var tlis = ""
			tlis += `<tr data-openid="${arr[i].openId}">`
			tlis += `<td><div class='circle1'><div class='circle2'></div></div></td>`
			tlis += `<td><img src="${arr[i].headImgUrl}"></td>`
			tlis += `<td>${arr[i].nickName}</td>`
			tlis += `<td>${arr[i].remark}</td>`
			tlis += `<td>${arr[i].country}</td>`
			tlis += `<td>${isVip}</td>`
			tlis += "<td><a href='###' class='toEdit'>编辑</a><a href='###' class='addToBlack'>加入黑名单</a></td>"
			tlis += "</tr>"
			$(".wxTable").append($(tlis))
		}
		$(".wxTable .circle1").each(function() {
			$(this).click(function() {
				if($(this).find("div[class='circle2']").is(":visible")) {
					$(this).find("div[class='circle2']").hide()
					$("#allAgree .circle2").hide()
				} else {
					$(this).find("div[class='circle2']").show()
				}
			})
		})
		toRemarks()
		addToBlack()
	}
	//列表全选
	$("#allAgree .circle1").click(function() {
		if($("#allAgree .circle2").is(":hidden")) {
			$(".wxTable tr:gt(0) .circle2").show()
		} else {
			$(".wxTable tr:gt(0) .circle2").hide()
		}
	})
	//加载历史兑换支出列表
	function loadHistoryOut(arr) {
		$(".recordTable-out tr:gt(0)").remove()
		for(var i = 0, len = arr.length; i < len; i++) {
			var tlis = ""
			tlis += `<td>${arr[i].createTime}</td>`
			tlis += `<td>${arr[i].jfOrderId}</td>`
			tlis += `<td>${arr[i].commodityName}</td>`
			tlis += `<td>${arr[i].points}</td>`
			$(".recordTable-out").append($(tlis))
		}
	}
	//加载历史兑换收入列表
	function loadHistoryIn(arr) {
		$(".recordTable-in tr:gt(0)").remove()
		for(var i = 0, len = arr.length; i < len; i++) {
			var tlis = ""
			tlis += `<td>${arr[i].createTime}</td>`
			tlis += `<td>${arr[i].commodityName}</td>`
			tlis += `<td>${arr[i].points}</td>`
			$(".recordTable-in").append($(tlis))
		}
	}
	//加载成功邀请列表
	function loadInvitationList(arr) {
		$(".invitationTable tr:gt(0)").remove()
		for(var i = 0, len = arr.length; i < len; i++) {
			var tlis = ""
			tlis += `<td>${arr[i].createTime}</td>`
			tlis += `<td>${arr[i].name}</td>`
			$(".invitationTable").append($(tlis))
		}
	}
	//加载用户相关历史
	function loadUserHistory(arr) {
		$(".historyTable tr:gt(0)").remove()
		for(var i = 0, len = arr.length; i < len; i++) {
			var tlis = ""
			tlis += `<td>${arr[i].createTime}</td>`
			tlis += `<td>${arr[i].status}</td>`
			tlis += `<td class="toLook">查看</td>`
			$(".historyTable").append($(tlis))
		}
	}
	//久赢用户列表更多操作
	var historyObj = {
		begPageNo: 1,
		total: 10
	}
	var historyAjaxUrl_jy = ""
	var historyAjaxUrl_report = ""
	var historyAjaxUrl_message = ""

	function toMore() {
		$(".toMore").each(function(i) {
			$(this).click(function() {
				$(".container").hide()
				$(".container-more").show()
				$(".more-edit").show()
				$(".more-record").hide()
				$(".more-invitation").hide()
				$(".more-userList").hide()
				$(".recordTitle").hide()
				$(".invitationTitle").hide()
				var clientCode = $(`.accountTable tr:nth-child(${i+2}) td:nth-child(2)`).html()
				$(".container-more").attr("data-clientcode", clientCode)
				loadModifyContent(clientCode)
				loaded(historyObj, historyAjaxUrl_jy, ".more-edit", 5)
			})
		})
	}
	//久赢账户列表
	$(".listNav li:first-child").click(function() {
		$(".container-more").hide()
		$(".container").show()
		$(".accountTable").show()
		$(".wxTable").hide()
		$(".listNav li").removeClass("listNav-active")
		$(this).addClass("listNav-active")
		$(".searchGroups2").hide()
		$(".searchGroups").show()
		$(".levelSet").hide()
		$(".black-box").hide()
		$(".userBindCount").show()
		obj.begPageNo = 1
		delete obj.keyword
		loaded(obj, ajaxUrl, ".container", 0)

	})
	//订阅用户列表
	$(".listNav li:last-child").click(function() {
		$(".accountTable").hide()
		$(".wxTable").show()
		$(".listNav li").removeClass("listNav-active")
		$(this).addClass("listNav-active")
		$(".searchGroups").hide()
		$(".searchGroups2").show()
		$(".levelSet").hide()
		$(".black-box").show()
		$(".userBindCount").hide()
		countBlackList()
		obj.begPageNo = 1
		delete obj.keyword
		loaded(obj, wxAjaxUrl, ".container", 4)
	})
	//子权限功能开启
	var currentQx = JSON.parse(sessionStorage.getItem("qxTotalArr"))
	if(currentQx[3].children[0].canShowChild == "0") {
		$(".listNav>li:first-child").hide()
		$(".listNav li:last-child").trigger("click")
	} else {
		loaded(obj, ajaxUrl, ".container", 0)
		bindNum(bindFrom, bindTo)
		bindRatio() 
	}
	if(currentQx[3].children[1].canShowChild == "0") {
		$(".listNav li:last-child").hide()
	}
	if(currentQx[3].children[2].canShowChild == "1") {
		$(".setVip").show()
		$(".setCommon").show()
	}

	//	久赢用户列表
	$(".search").click(function() {
		if($("#keywords input").val().indexOf("j") != -1 || $("#keywords input").val().indexOf("J") != -1) {
			if($("#keywords input").val().indexOf("y") != -1 || $("#keywords input").val().indexOf("Y") != -1) {
				obj.keyword = $("#keywords input").val().slice(2)
			} else {
				obj.keyword = $("#keywords input").val().slice(1)
			}
		} else {
			obj.keyword = $("#keywords input").val()
		}
		loaded(obj, ajaxUrl, ".container", 0)
	})
	//微信订阅用户搜索
	$(".search2").click(function() {
		if($("#keywords2 input").val().trim() == "") {
			delete obj.keyword
		} else {
			obj.keyword = $("#keywords2 input").val()
		}
		loaded(obj, wxAjaxUrl, ".container", 4)
	})
	//统计绑定率
	function bindRatio() {
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/mgmtUser/bindingRate.do`,
			async: true,
			contentType: "application/json",
			success: function(data) {
				$("#totalBindNum").html(data.data.bindingNum + "人")
				$("#totalPeople").html(data.data.jyUserNum + "人")
				$("#bindRatio").html((parseFloat(data.data.bindingRate) * 100).toFixed(2) + "%")
			}
		})
	}

	//查询绑定人数时间
	var bindFrom = new Date().Format("yyyy-MM-dd")
	var bindTo = new Date().Format("yyyy-MM-dd")
	//查询时间段绑定人数
	function bindNum(time1, time2) {
		var timeObj = {
			begDate: time1,
			endDate: time2
		}
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/mgmtUser/bindingNum.do`,
			async: true,
			contentType: "application/json",
			data: JSON.stringify(timeObj),
			success: function(data) {
				$("#todayBindNum").html(`${data.data}人`)
			}
		});
	}
	//选择营业部
	$.ajax({
		type: "POST",
		url: "http://www.decaihui.com/wxmgmt/api/myMonthlyReport/listAllDepartments.do",
		async: false,
		contentType: "application/json",
		success: function(data) {
			$(".allDepartment").empty()
			var sum = 0
			for(var i = 0; i < data.data.length; i++) {
				var lis = "<li><div class='circle1'><div class='circle2'></div></div> <span class='departname'>" + data.data[i].name + "</span> <span>(" + data.data[i].total + "人)</span></li>"
				$(".allDepartment").append($(lis))
				sum += data.data[i].total
			}
			$("#allDepartToatal").html(sum)
		}
	});
	//部门全选
	$("#allAgreeDepart .circle1").toggle(function() {
		$(this).find("div[class='circle2']").show()
		$(".allDepartment .circle2").show()
	}, function() {
		$(this).find("div[class='circle2']").hide()
		$(".allDepartment .circle2").hide()
	})
	$(".allDepartment li .circle1").each(function() {
		$(this).click(function() {
			if($(this).find("div[class='circle2']").is(":visible")) {
				$(this).find("div[class='circle2']").hide()
				$("#allAgreeDepart .circle2").hide()
			} else {
				$(this).find("div[class='circle2']").show()
			}
		})
	})
	$("#selectDepart").click(function() {
		$(".department_bg").show()
		$(".department_bg").height($(document).height())
		$(".department_bg").width($(document).width())
	})
	$(".depart_close,.depart_cancel").click(function() {
		$(".department_bg").hide()
	})
	$(".depart_confirm").click(function() {
		departments = []
		$(".allDepartment li .circle2:visible").each(function() {
			departments.push($(this).parent().parent().find("span[class='departname']").html())
		})
		if(departments.length == 0) {
			$(".currentDepart").html("请选择营业部")
		} else {
			$(".currentDepart").html(departments.join(","))
		}
		$(".department_bg").hide()
	})
	//级别提示框
	$(".levelTip").hover(function() {
		$(".levelInfo").show()
	}, function() {
		$(".levelInfo").hide()
	})
	//统计黑名单用户总数
	function countBlackList() {
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/mgmtUser/countBlackUser.do`,
			async: true,
			contentType: "application/json",
			success: function(data) {
				$("#black-list").html(data.data + "人")
			}
		});
	}
	var removeBlackArr = [] //待移出黑名单列表
	//打开黑名单
	$("#showBlackList").click(function() {
		$(".wxSet-title span").html("黑名单")
		$(".wxSet_bg").height($(document).height())
		$(".wxSet_bg").width($(document).width())
		$(".wxSet_bg").show()
		$("#blackList").show()
		$("#remarks").hide()
		removeBlackArr = []
		loadBlackList()
	})
	//黑名单列表
	function loadBlackList() {
		$(".nameList").empty()
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/mgmtUser/listBlackUsers.do`,
			async: true,
			contentType: "application/json",
			success: function(data) {
				for(var i = 0, len = data.data.length; i < len; i++) {
					if(data.data[i].headimgurl == "" || data.data[i].headimgurl == null) {
						var headImg = "img/default.jpg"
					} else {
						var headImg = data.data[i].headimgurl
					}
					if(data.data[i].nickname == "" || data.data[i].nickname == null) {
						var nickname = "匿名"
					} else {
						var nickname = data.data[i].nickname
					}
					var lis = ``
					lis += `<li data-openid="${data.data[i].openid}">`
					lis += `<img src="${headImg}"/>`
					lis += `<span>${nickname}</span>`
					lis += `<img class="blackDel" src="img/blackDelIcon.png">`
					lis += `</li>`
					$(".nameList").append($(lis))
				}
				blackToDel()
			}
		});
	}
	//黑名单删除
	function blackToDel() {
		$(".blackDel").each(function() {
			$(this).click(function() {
				$(this).parent().remove()
				removeBlackArr.push($(this).parent().data("openid"))
			})
		})
	}
	//加入黑名单
	function addToBlack() {
		var openids = []
		$(".addToBlack").each(function() {
			$(this).click(function() {
				openids.push($(this).parent().parent().data("openid"))
				updateBlackList(0, openids)
			})
		})
	}
	//更改黑名单用户
	function updateBlackList(isBlack, openids) { //isBlack:是否加入黑名单(0 是   1不是)
		var blackObj = {
			isBlack: isBlack,
			openIds: openids
		}
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/mgmtUser/changeBlackUsers.do`,
			async: true,
			contentType: "application/json",
			data: JSON.stringify(blackObj),
			success: function(data) {
				loaded(obj, wxAjaxUrl, ".container", 4)
				countBlackList()
			}
		});
	}
	//添加修改微信备注
	function toRemarks() {
		$(".toEdit").each(function() {
			$(this).click(function() {
				$(".wxSet-title span").html("编辑")
				$(".wxSet_bg").height($(document).height())
				$(".wxSet_bg").show()
				$("#blackList").hide()
				$("#remarks").show()
				$("#remarks").attr("data-openid", $(this).parent().parent().data("openid"))
				$("#remarksContent").val($(this).parent().prev().prev().prev().html())
			})
		})
	}
	//微信用户操作保存和取消
	$(".wx_cancel,.wxSet-close").click(function() {
		$(".wxSet_bg").hide()
	})
	$(".wx_save").click(function() {
		if($(".wxSet-title span").html() == "黑名单") {
			if(removeBlackArr.length != 0) {
				updateBlackList(1, removeBlackArr)
			}
			$(".wxSet_bg").hide()
		} else {
			var remarkObj = {
				openId: $("#remarks").attr("data-openid"),
				remark: $("#remarksContent").val()
			}
			$.ajax({
				type: "POST",
				url: `http://www.decaihui.com/wxmgmt/api/mgmtUser/modifyRemark.do`,
				async: true,
				contentType: "application/json",
				data: JSON.stringify(remarkObj),
				success: function(data) {
					$(".wxSet_bg").hide()
					loaded(obj, wxAjaxUrl, ".container", 4)
				}
			});
		}
	})
	//设置为Vip
	$(".setVip").click(function() {
		setVip("true")
	})
	//设置为普通
	$(".setCommon").click(function() {
		setVip("false")
	})
	//批量设置VIP
	function setVip(flag) {
		var openids = []
		$(".wxTable tr:gt(0) .circle2:visible").each(function() {
			var idItem = $(this).parent().parent().parent().data("openid")
			openids.push(idItem)
		})
		var isVipObj = {
			isVip: flag,
			openIds: openids
		}
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/mgmtUser/batchSetVip.do`,
			async: true,
			contentType: "application/json",
			data: JSON.stringify(isVipObj),
			success: function(data) {
				loaded(obj, wxAjaxUrl, ".container", 4)
			}
		});
	}
	//加载修改页面内容
	function loadModifyContent(clientCode) {
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/mgmtUser/getJyUser/${clientCode}.do`,
			async: true,
			contentType: "application/json",
			success: function(data) {
				if(data.data.wxNickname == null) {
					var wxNickname = "未绑定"
				} else {
					var wxNickname = data.data.wxNickname
				}
				if(data.data.wxCountry == null) {
					var wxCountry = "未绑定"
				} else {
					var wxCountry = data.data.wxCountry
				}
				if(data.data.wxHeadimgurl == null) {
					var wxHeadimgurl = "img/default.jpg"
				} else {
					var wxHeadimgurl = data.data.wxHeadimgurl
				}
				if(data.data.jfPoints == null) {
					var jfPoints = "0"
				} else {
					var jfPoints = data.data.jfPoints
				}
				$("#headImg").attr("src", wxHeadimgurl)
				$("#nickName").html(wxNickname)
				$("#accountName").html(data.data.name)
				$("#clientCode").html(data.data.clientCode)
				$("#jyUserId").html(`JY${data.data.contestJyUserId}`)
				$("#city").html(wxCountry)
				$("#tel").html(data.data.mobile)
				$("#modifyPoint").val(jfPoints)
				$(".totalPoint>div:last-of-type span").html(jfPoints)
				$("#inviteNum").html(data.data.invitedCount)
				if(data.data.wxOpenid == null) {
					$(".slider").css("left", "0%")
					$(".bindBtn").css("background", "#c3c3c3")
					$(".bindBtn").prev().html("未绑定")
				} else {
					$(".slider").css("left", "50%")
					$(".bindBtn").css("background", "#4759a3")
					$(".bindBtn").prev().html("已绑定")
				}
				getAttachCount()
			}
		})
	}
	//修改总积分
	var oldPoints = ""
	$(".totalPoint>div:last-of-type").click(function(e) {
		e.stopPropagation()
		$(".totalPoint>div:last-of-type span").hide()
		$("#modifyPoint").val($(".totalPoint>div:last-of-type span").html())
		oldPoints = $(".totalPoint>div:last-of-type span").html()
		$("#modifyPoint").show()
		$("#modifyPoint").focus()
	})
	$("#modifyPoint").blur(function(e) {
		e.stopPropagation()
		modifyPoints($(this))
	})

	function modifyPoints(elem) {
		$(".totalPoint>div:last-of-type span").show()
		var newVal = parseInt(elem.val())
		if(isNaN(newVal)) {
			$(".totalPoint>div:last-of-type span").html(oldPoints)
		} else {
			$(".totalPoint>div:last-of-type span").html(newVal)
		}
		elem.hide()
		var modifyObj = {
			clientCode: $(".container-more").attr("data-clientCode"),
			points: $(".totalPoint>div:last-of-type span").html()
		}
		modifyJyUser(modifyObj)
	}
	//微信解绑
	$(".bindBtn").click(function() {
		if($(".bindBtn").prev().html() == "已绑定") {
			$(this).prev().html("未绑定")
			$(this).css("background", "#c3c3c3")
			$("#slider").css("left", "0")
			var modifyObj = {
				clientCode: $(".container-more").attr("data-clientCode"),
				isUnWxBind: true
			}
			modifyJyUser(modifyObj)
		}
	})
	//修改积分和解绑微信
	function modifyJyUser(modifyObj) {
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/mgmtUser/modifyJyUser.do`,
			async: true,
			contentType: "application/json",
			data: JSON.stringify(modifyObj),
			success: function(data) {
				loadModifyContent($(".container-more").attr("data-clientCode"))
			}
		});
	}
	//获取附属人个数
	function getAttachCount() {
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/mgmtUser/listAttachWxUsers/${$(".container-more").attr("data-clientCode")}.do`,
			async: true,
			contentType: "application/json",
			success: function(data) {
				if(data.data.length == 0) {
					$("#attachTitle").html("")
				} else {
					$("#attachTitle").html(`${data.data.length}个`)
				}
			}
		});
	}
	//绑定操作弹框
	var objWx = {
		begPageNo: 1,
		total: 16
	}

	var wxPeopleArr = [] //非绑定久赢账号的微信用户的待预览组
	//附属绑定弹框
	$(".toAttach").click(function() {
		var objWx = {
			begPageNo: 1,
			total: 16
		}
		$(".popup_bg").show()
		$(".popup_bg").height($(document).height())
		$(".popup_bg").width($(document).width())
		$(".wxList .list").empty()
		$(".preWxPeople").empty()
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/mgmtUser/listAttachWxUsers/${$(".container-more").attr("data-clientCode")}.do`,
			async: true,
			contentType: "application/json",
			success: function(data) {
				if(data.data.length == 0) {
					wxPeopleArr = []
				} else {
					wxPeopleArr = []
					for(var i = 0; i < data.data.length; i++) {
						var newobj2 = {
							name: data.data[i].nickname,
							openid: data.data[i].openid
						}
						wxPeopleArr.push(newobj2)
					}
					loadPreview(wxPeopleArr)
				}
				getListData(objWx)
			}
		});
	})
	//搜索非绑定久赢账号的微信用户  
	function getListData(objWx) {
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/mgmtUser/listUnBindWxUsers.do",
			async: true,
			contentType: "application/json",
			data: JSON.stringify(objWx),
			success: function(data) {
				setListData(data.data)
				var popTotalData = data.total
				totalPage = Math.ceil(popTotalData / 16) //总页数	
				if(totalPage > 1) {
					$(".M-box2").show()
					$(".M-box2").pagination({
						totalData: popTotalData,
						showData: 16,
						coping: true,
						count: 1,
						callback: function(api) {
							objWx.begPageNo = api.getCurrent().toString()
							$.ajax({
								type: "POST",
								url: "http://www.decaihui.com/wxmgmt/api/mgmtUser/listUnBindWxUsers.do",
								async: true,
								contentType: "application/json",
								data: JSON.stringify(objWx),
								success: function(data) {
									setListData(data.data)
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

	function setListData(curPageData) {
		$(".wxList .list").empty()
		for(var i = 0; i < curPageData.length; i++) {
			var lis = ''
			lis += `<li data-openid="${curPageData[i].openid}">`
			lis += `<div class="circle1">`
			lis += `<div class="circle2"></div>`
			lis += `</div>`
			lis += `<div class="liName">${curPageData[i].nickname}</div>`
			lis += `</li>`
			$(".wxList .list").append($(lis))
		}
		selectWxPeople()
	}
	//非绑定久赢账号的微信用户选择
	function selectWxPeople() {
		$(".wxList .list>li").each(function() {
			$(this).click(function() {
				var wxObj = {
					name: $(this).find("div[class='liName']").html(),
					openid: $(this).data("openid")
				}
				wxPeopleArr.push(wxObj)
				wxPeopleArr = $.reduceArray(wxPeopleArr)
				loadPreview(wxPeopleArr)
				//				$(this).find("div[class='circle2']").show()
				preOperation()
			})
		})
	}
	//非绑定久赢账号的微信用户选择的预览框加载
	function loadPreview(arr) {
		$(".preWxPeople").empty()
		for(var i = 0; i < arr.length; i++) {
			var lis = `<li data-openid="${arr[i].openid}">`
			lis += arr[i].name
			lis += `<img src="img/preDel.png"/ class="preDel">`
			lis += "</li>"
			$(".preWxPeople").append($(lis))
			preDel()
		}
		$(".preShow span").html(arr.length)
	}
	//非绑定久赢账号的微信用户选择的预览框删除----未绑定的
	function preDel() {
		$(".preDel").each(function() {
			$(this).click(function() {
				for(var i = 0; i < wxPeopleArr.length; i++) {
					if(wxPeopleArr[i].openid == $(this).parent().data("openid")) {
						wxPeopleArr.splice(i, 1)
					}
				}
				loadPreview(wxPeopleArr)
				preOperation()
			})
		})
	}
	//预览框添加删除
	function preOperation() {
		var newSaveArr = []
		if($(".preWxPeople>li").length != 0) {
			$(".preWxPeople>li").each(function() {
				newSaveArr.push($(this).data("openid"))
			})
		}
		var saveObj = {
			clientCode: $(".container-more").attr("data-clientCode"),
			openIds: newSaveArr
		}
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/mgmtUser/attachWxUsers.do`,
			async: true,
			contentType: "application/json",
			data: JSON.stringify(saveObj),
			success: function(data) {
				$(".wxList .list").empty()
				getListData(objWx)
			}
		});
	}
	//非绑定久赢账号的微信用户选择----提交保存
	$(".gSave").click(function() {
		var newSaveArr = []
		$(".preWxPeople>li").each(function() {
			newSaveArr.push($(this).data("openid"))
		})
		var saveObj = {
			clientCode: $(".container-more").attr("data-clientCode"),
			openIds: newSaveArr
		}
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/mgmtUser/attachWxUsers.do`,
			async: true,
			contentType: "application/json",
			data: JSON.stringify(saveObj),
			success: function(data) {
				if(data.code == "000") {
					$(".popup_bg").hide()
					getAttachCount()
				} else {
					alert("绑定失败!" + data.code)
				}
			}
		});
	})
	//绑定操作弹框关闭
	$(".cancel,.pop-close").click(function() {
		$(".popup_bg").hide()
	})
	//查看相关历史选择
	$(".lookNav>ul>li").each(function(i) {
		$(this).click(function() {
			$(".lookNav>ul>li").removeClass("lookNav-active")
			$(this).addClass("lookNav-active")
			if(i == 0) {
				loaded(historyObj, historyAjaxUrl_jy, ".more-edit", 5)
			} else if(i == 1) {
				loaded(historyObj, historyAjaxUrl_report, ".more-edit", 5)
			} else if(i == 2) {
				loaded(historyObj, historyAjaxUrl_message, ".more-edit", 5)
			}
		})
	})

	//跳转到兑换记录
	var exchangeObj = {
		begPageNo: 1,
		total: 10
	}
	var exachangeAjaxUrl = "http://www.decaihui.com/wxmgmt/api/mgmtUser/listPointsHistroy.do"
	$(".totalPoint>div:first-of-type").click(function() { //支出
		$(".more-edit").hide()
		$(".more-record").show()
		$(".more-invitation").hide()
		$(".more-userList").hide()
		$(".recordTitle").show()
		$(".invitationTitle").hide()
		$(".more-record .pl input").val("")
		delete exchangeObj.keyword
		delete exchangeObj.orderId
		delete exchangeObj.begDate
		delete exchangeObj.endDate
		$(".record-top>div").removeClass("record-on")
		$(".record-top>div:first-of-type").addClass("record-on")
		$(".orderNum").show()
		$(".recordTable-out").show()
		$(".recordTable-in").hide()
		exchangeObj.clientCode = $(".container-more").attr("data-clientcode")
		exchangeObj.status = 0
		loaded(exchangeObj, exachangeAjaxUrl, ".more-record", 1)
	})
	$(".record-top>div:first-of-type").click(function() {
		$(".totalPoint>div:first-of-type").trigger("click")
	})
	$(".record-top>div:last-of-type").click(function() { //收入
		$(".record-top>div").removeClass("record-on")
		$(this).addClass("record-on")
		$(".orderNum").hide()
		$(".recordTable-in").show()
		$(".recordTable-out").hide()
		exchangeObj.status = 1
		loaded(exchangeObj, exachangeAjaxUrl, ".more-record", 2)
	})
	//历史兑换搜索
	$(".record-search").click(function() {
		if($("#keywords-order").val() != "") {
			exchangeObj.keyword = $("#keywords-order").val()
		} else {
			delete exchangeObj.keyword
		}

		if($("#recordFrom").val() != "") {
			exchangeObj.begDate = $("#recordFrom").val().split("-").join("")
		} else {
			delete exchangeObj.begDate
		}
		if($("#recordTo").val() != "") {
			exchangeObj.endDate = $("#recordTo").val().split("-").join("")
		} else {
			delete exchangeObj.endDate
		}
		if($(".record-top>div:first-of-type").hasClass("record-on")) {
			if($("#orderNum").val() != "") {
				exchangeObj.orderId = $("#orderNum").val()
			} else {
				delete exchangeObj.orderId
			}
			loaded(exchangeObj, exachangeAjaxUrl, ".more-record", 1)
		} else {
			loaded(exchangeObj, exachangeAjaxUrl, ".more-record", 2)
		}
	})

	//跳转到邀请记录
	var inviteObj = {
		begPageNo: 1,
		total: 10
	}
	var inviteAjaxUrl = "http://www.decaihui.com/wxmgmt/api/mgmtUser/listInvitedPeople.do"
	$(".invitation>div:first-of-type").click(function() {
		$(".more-edit").hide()
		$(".more-record").hide()
		$(".more-invitation").show()
		$(".more-userList").hide()
		$(".recordTitle").hide()
		$(".invitationTitle").show()
		$(".more-invitation .pl input").val("")
		inviteObj.clientCode = $(".container-more").attr("data-clientcode")
		delete inviteObj.begDate
		delete inviteObj.endDate
		loaded(inviteObj, inviteAjaxUrl, ".more-invitation", 3)
	})
	//历史邀请记录搜索
	$(".invite-search").click(function() {
		if($("#inviteFrom").val() != "") {
			inviteObj.begDate = $("#inviteFrom").val().split("-").join("")
		} else {
			delete inviteObj.begDate
		}
		if($("#inviteTo").val() != "") {
			inviteObj.endDate = $("#inviteTo").val().split("-").join("")
		} else {
			delete inviteObj.endDate
		}
		loaded(inviteObj, inviteAjaxUrl, ".more-invitation", 3)
	})
	//跳转到全部
	$(".more-top>div:nth-of-type(1),.cancel").click(function() {
		$(".container-more").hide()
		$(".container").show()
		obj.begPageNo = 1
		delete obj.keyword
		loaded(obj, ajaxUrl, ".container", 0)
	})
	//跳转到修改编辑
	$(".more-top>div:nth-of-type(3)").click(function() {
		$(".more-edit").show()
		$(".more-record").hide()
		$(".more-invitation").hide()
		$(".more-userList").hide()
		$(".recordTitle").hide()
		$(".invitationTitle").hide()
	})
	//同步用户
	$(".synchronization").click(function() {
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/mgmtUser/synchronizeWxUsers.do`,
			async: true,
			contentType: "application/json",
			success: function(data) {
				if(data.code == "000") {
					loaded(obj, wxAjaxUrl, ".container", 4)
				} else {
					alert("同步失败！" + data.code)
				}
			}
		});
	})
	//	查询日期
	$.findTimeRange($("#recordFrom"), $("#recordTo"))
	$.findTimeRange($("#inviteFrom"), $("#inviteTo"))

})