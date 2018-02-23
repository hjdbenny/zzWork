$(function() {
	//权限控制
	var currentQx = JSON.parse(sessionStorage.getItem("qxTotalArr"))
	for(var i = 0; i < currentQx.length; i++) {
		if(currentQx[i].canShow == "1") {
			$(".left ul li[data-level='" + currentQx[i].level + "']").show()
		}
	}
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
	var obj = {
		begPageNo: 1,
		total: 10
	}
	var ajaxUrl = "http://wx.zzfco.com/wxmgmt/api/mgmtUser/listJyUsers.do"
	var wxAjaxUrl = "http://wx.zzfco.com/wxmgmt/api/mgmtUser/listUnBlackWxUsers.do"
	loaded(obj, ajaxUrl, ".container", 0)

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
			if(arr[i].wxCountry == null) {
				var wxCountry = "未绑定"
			} else {
				var wxCountry = arr[i].wxCountry
			}
			var isVip = ""
			if(arr[i].wxOpenid == null) {
				isVip = "未绑定"
			} else {
				$.ajax({
					type: "POST",
					url: `http://wx.zzfco.com/wxmgmt/api/mgmtUser/stateVip/${arr[i].wxOpenid}.do`,
					async: false,
					contentType: "application/json",
					xhrFields: {
						withCredentials: true
					},
					success: function(data) {
						if(data.data == "0") {
							isVip = "普通"
						} else {
							isVip = "VIP"
						}
					}
				});
			}
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
			tlis += `<td>${wxCountry}</td>`
			tlis += `<td>${arr[i].mobile}</td>`
			tlis += `<td>${jfPoints}</td>`
			tlis += `<td>${isVip}</td>`
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

	//久赢用户列表更多操作
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
		$(".blackList").hide()
		$(".levelSet").hide()
		$(".userBindCount").show()
		$(".status").show()
		$("#keywords input").attr("placeholder", "姓名/资金帐户/手机号/编号")
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
		$(".blackList").show()
		$(".levelSet").show()
		$(".userBindCount").hide()
		$(".status").hide()
		$("#keywords input").attr("placeholder", "昵称/备注")
		countBlackList()
		obj.begPageNo = 1
		delete obj.keyword
		loaded(obj, wxAjaxUrl, ".container", 4)
	})
	//	久赢用户列表/微信订阅用户搜索
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

		if($(".listNav li:first-child").hasClass("listNav-active")) {
			loaded(obj, ajaxUrl, ".container", 0)
		} else {
			loaded(obj, wxAjaxUrl, ".container", 4)
		}
	})
	//统计绑定率
	$.ajax({
		type: "POST",
		url: `http://wx.zzfco.com/wxmgmt/api/mgmtUser/bindingRate.do`,
		async: true,
		contentType: "application/json",
		success: function(data) {
			$("#bindingNum").html(data.data.bindingNum)
			$("#jyUserNum").html(data.data.jyUserNum)
			$("#bindingRate").html((parseFloat(data.data.bindingRate) * 100).toFixed(2) + "%")
		}
	})
	//查询绑定人数时间
	var bindFrom = new Date().Format("yyyy-MM-dd")
	var bindTo = new Date().Format("yyyy-MM-dd")
	$("#bindFrom").val(bindFrom)
	$("#bindTo").val(bindTo)
	//查询时间段绑定人数
	bindNum(bindFrom, bindTo)
	$(".bindSearch").click(function() {
		bindNum($("#bindFrom").val(), $("#bindTo").val())
	})

	function bindNum(time1, time2) {
		var timeObj = {
			begDate: time1,
			endDate: time2
		}
		$.ajax({
			type: "POST",
			url: `http://wx.zzfco.com/wxmgmt/api/mgmtUser/bindingNum.do`,
			async: true,
			contentType: "application/json",
			data: JSON.stringify(timeObj),
			success: function(data) {
				var todayFrom = new Date().Format("yyyy-MM-dd")
				var todayTo = new Date().Format("yyyy-MM-dd")
				if(time1 == todayFrom && time2 == todayTo) {
					$("#timeSlotNum").html(`今日已绑定: ${data.data}人`)
				} else {
					$("#timeSlotNum").html(`${time1} 至 ${time2} 绑定: ${data.data}人`)
				}
			}
		});
	}
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
			url: `http://wx.zzfco.com/wxmgmt/api/mgmtUser/countBlackUser.do`,
			async: true,
			contentType: "application/json",
			success: function(data) {
				$(".blackList span").html(data.data)
			}
		});
	}
	var removeBlackArr = [] //待移出黑名单列表
	//打开黑名单
	$(".blackList").click(function() {
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
			url: `http://wx.zzfco.com/wxmgmt/api/mgmtUser/listBlackUsers.do`,
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
			url: `http://wx.zzfco.com/wxmgmt/api/mgmtUser/changeBlackUsers.do`,
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
				url: `http://wx.zzfco.com/wxmgmt/api/mgmtUser/modifyRemark.do`,
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
			url: `http://wx.zzfco.com/wxmgmt/api/mgmtUser/batchSetVip.do`,
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
			url: `http://wx.zzfco.com/wxmgmt/api/mgmtUser/getJyUser/${clientCode}.do`,
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
				toBind()
				getAttachCount()
			}
		})
	}
	//获取附属人个数
	function getAttachCount() {
		$.ajax({
			type: "POST",
			url: `http://wx.zzfco.com/wxmgmt/api/mgmtUser/listAttachWxUsers/${$(".container-more").attr("data-clientCode")}.do`,
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
	function toBind() {
		$(".bindBtn").click(function() {
			if($(".bindBtn").prev().html() == "已绑定") {
				$(this).prev().html("未绑定")
				$(this).css("background", "#c3c3c3")
				$("#slider").css("left", "0")
			}
		})
	}
	var wxPeopleArr = [] //非绑定久赢账号的微信用户的待预览组
	var objWx = {
		begPageNo: 1,
		total: 16
	}
	//附属绑定弹框
	$(".toAttach").click(function() {
		$(".popup_bg").show()
		$(".popup_bg").height($(document).height())
		$(".popup_bg").width($(document).width())
		$(".wxList .list").empty()
		$(".preWxPeople").empty()
		$.ajax({
			type: "POST",
			url: `http://wx.zzfco.com/wxmgmt/api/mgmtUser/listAttachWxUsers/${$(".container-more").attr("data-clientCode")}.do`,
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
				getListData()
			}
		});
	})
	//搜索非绑定久赢账号的微信用户  
	function getListData() {
		$.ajax({
			type: "POST",
			url: "http://wx.zzfco.com/wxmgmt/api/mgmtUser/listUnBindWxUsers.do",
			async: false,
			contentType: "application/json",
			data: JSON.stringify(objWx),
			success: function(data) {
				setListData(data.data)
				var totalData = data.total
				totalPage = Math.ceil(totalData / 16) //总页数	
				$(".wxList .countNum").html(totalData)
				if(totalPage > 1) {
					$(".wxList .M-box1").show()
					$(".wxList .M-box1").pagination({
						totalData: totalData,
						showData: 16,
						coping: true,
						callback: function(api) {
							objWx.begPageNo = api.getCurrent().toString()
							$.ajax({
								type: "POST",
								url: "http://wx.zzfco.com/wxmgmt/api/mgmtUser/listUnBindWxUsers.do",
								async: false,
								contentType: "application/json",
								data: JSON.stringify(objWx),
								success: function(data) {
									setListData(data.data)
								}
							});
						}
					})
				} else {
					$(".wxList .M-box1").hide()
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
				wxPeopleArr = reduceArray(wxPeopleArr)
				loadPreview(wxPeopleArr)
				$(this).find("div[class='circle2']").show()
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
					url: `http://wx.zzfco.com/wxmgmt/api/mgmtUser/attachWxUsers.do`,
					async: true,
					contentType: "application/json",
					data: JSON.stringify(saveObj),
					success: function(data) {
						$(".wxList .list").empty()
						getListData()
					}
				});

			})
		})
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
			url: `http://wx.zzfco.com/wxmgmt/api/mgmtUser/attachWxUsers.do`,
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
	//对象数组去重
	function reduceArray(arr) {
		var hash = {};
		arr = arr.reduce(function(item, next) {
			hash[next.name] ? '' : hash[next.name] = true && item.push(next);
			return item
		}, [])
		return arr
	}
	//绑定操作弹框关闭
	$(".cancel,.pop-close").click(function() {
		$(".popup_bg").hide()
	})

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
	$(document).click(function() {
		$(".totalPoint>div:last-of-type span").show()
		var newVal = parseInt($("#modifyPoint").val())
		if(isNaN(newVal)) {
			$(".totalPoint>div:last-of-type span").html(oldPoints)
		} else {
			$(".totalPoint>div:last-of-type span").html(newVal)
		}
		$("#modifyPoint").hide()
	})
	$("#modifyPoint").blur(function(e) {
		$(".totalPoint>div:last-of-type span").show()
		var newVal = parseInt($(this).val())
		if(isNaN(newVal)) {
			$(".totalPoint>div:last-of-type span").html(oldPoints)
		} else {
			$(".totalPoint>div:last-of-type span").html(newVal)
		}
		$(this).hide()
	})
	//修改确认
	$(".confirm").click(function() {
		var clientCode = $(".container-more").attr("data-clientcode")
		var modifyObj = {
			clientCode: clientCode,
			points: $(".totalPoint>div:last-of-type span").html()
		}
		if($(".bindBtn").prev().html() == "未绑定") {
			modifyObj.isUnWxBind = true
		} else {
			modifyObj.isUnWxBind = false
		}
		$.ajax({
			type: "POST",
			url: `http://wx.zzfco.com/wxmgmt/api/mgmtUser/modifyJyUser.do`,
			async: true,
			contentType: "application/json",
			data: JSON.stringify(modifyObj),
			success: function(data) {
				$(".container-more").hide()
				$(".container").show()
				obj.begPageNo = 1
				loaded(obj, ajaxUrl, ".container", 0)
			}
		});
	})
	//跳转到兑换记录
	var exchangeObj = {
		begPageNo: 1,
		total: 10
	}
	var exachangeAjaxUrl = "http://wx.zzfco.com/wxmgmt/api/mgmtUser/listPointsHistroy.do"
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
	var inviteAjaxUrl = "http://wx.zzfco.com/wxmgmt/api/mgmtUser/listInvitedPeople.do"
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
			url: `http://wx.zzfco.com/wxmgmt/api/mgmtUser/synchronizeWxUsers.do`,
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
	var dateFormat = "dd/mm/yy"
	cxDate("#recordFrom", "#recordTo")
	cxDate("#inviteFrom", "#inviteTo")
	cxDate("#bindFrom", "#bindTo")

	function cxDate(elem1, elem2) {
		$(elem1).datepicker({
			changeYear: true,
			changeMonth: true,
			numberOfMonths: 1,
			dateFormat: 'yy-mm-dd',
			monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
			monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
			monthStatus: '选择月份',
			yearStatus: '选择年份',
			weekHeader: '周',
			weekStatus: '年内周次',
			dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
			dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
			dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
			dayStatus: '设置 DD 为一周起始',
			dateStatus: '选择 m月 d日, DD',
			onClose: function(selectedDate) {
				$(elem2).datepicker("option", "minDate", selectedDate);
			}
		});
		$(elem2).datepicker({
			numberOfMonths: 1,
			changeYear: true,
			changeMonth: true,
			numberOfMonths: 1,
			dateFormat: 'yy-mm-dd',
			monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
			monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
			monthStatus: '选择月份',
			yearStatus: '选择年份',
			weekHeader: '周',
			weekStatus: '年内周次',
			dayNames: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
			dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
			dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
			dayStatus: '设置 DD 为一周起始',
			dateStatus: '选择 m月 d日, DD',
			onClose: function(selectedDate) {
				$(elem1).datepicker("option", "maxDate", selectedDate);
			}
		});
	}

})