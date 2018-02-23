$(function() {
	//下拉选择
	function selectOption(elem) {
		$(elem + ">div:last-of-type").click(function(e) {
			e.stopPropagation()
			$(elem + ">ul").show()
		})
		$(elem + ">ul li").each(function() {
			$(this).click(function(e) {
				$(this).parent().hide()
				$(elem + ">div:first-of-type").html($(this).html())
			})
		})
	}
	selectOption(".status>div")
	var obj = {
		begPageNo: 1,
		total: 10
	}
	var allFlag = false //全选
	var messageUrl = "http://www.decaihui.com/wxmgmt/api/wxTempMsg/listWxTemplateMsgs.do"
	var groupUrl = "http://www.decaihui.com/wxmgmt/api/wxTempMsg/statisticsWxUserGroups.do"
	loaded(obj, messageUrl, "#moduleEdit", 0)
	//子标签切换
	$(".listNav li").each(function(i) {
		$(this).click(function() {
			$(".listNav li").removeClass("listNav-active")
			$(this).addClass("listNav-active")
			$(".container>section").hide()
			$(".container>section").eq(i).show()
			if(i == 0) {
				loaded(obj, messageUrl, "#moduleEdit", 0)
			} else {
				loaded(obj, groupUrl, "#userList", 1)
			}
		})
	})

	function loaded(obj, ajaxUrl, elem, flag) { //flag:0为消息列表，1为分组管理列表
		$.ajax({
			type: "POST",
			url: ajaxUrl,
			async: false,
			contentType: "application/json",
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
					loadMessageList(data.data) //加载消息列表
				} else if(flag == 1) {
					loadRecipientList(data.data) //加载分组管理列表
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
										loadMessageList(data.data) //加载消息列表
									} else if(flag == 1) {
										loadRecipientList(data.data) //加载分组管理列表
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
	//加载消息列表
	function loadMessageList(arr) {
		$("#messageTable tr:gt(0)").remove()
		for(var i = 0, len = arr.length; i < len; i++) {
			if(arr[i].status == 0) {
				var status = `<td style="color:#999999">已推送</td>`
				var oprea = `<td><span class="messageLook" style="color:#3a688c;margin-right:10px">查看</span><span class="messageDel" style="color:#d93535">删除</span></td>`
			} else {
				var status = `<td style="color:#da821a">待推送</td>`
				var oprea = `<td><span class="messageModify" style="color:#da821a;margin-right:10px">修改</span><span class="messageDel" style="color:#d93535">删除</span></td>`
			}

			var groupsArr = []
			if(arr[i].groups == null) {
				var groups = "组已被删"
			} else {
				for(var j = 0; j < arr[i].groups.length; j++) {
					groupsArr.push(`${arr[i].groups[j].name}(${arr[i].groups[j].total})`)
				}
				var groups = groupsArr.join("/")
			}
			var tlis = ""
			tlis += `<tr data-id="${arr[i].id}">`
			if(arr[i].remark == null) {
				tlis += `<td>无</td>`
			} else {
				tlis += `<td>${arr[i].remark}</td>`
			}
			tlis += `<td>${groups}</td>`
			tlis += `<td>${new Date(arr[i].sendDate).Format("yyyy-MM-dd")}</td>`
			tlis += status
			tlis += oprea
			tlis += "</tr>"
			$("#messageTable").append($(tlis))
		}
		toModifyMessage()
		toDelMessage()
		toLookMessage()
	}
	//加载分组管理列表
	function loadRecipientList(arr) {
		$("#groupTable tr:gt(0)").remove()
		for(let i = 0, len = arr.length; i < len; i++) {
			var tlis = ""
			tlis += `<tr data-id="${arr[i].id}">`
			tlis += `<td>${arr[i].name}</td>`
			tlis += `<td>${arr[i].total}</td>`
			tlis += `<td>${new Date(arr[i].createDate).Format("yyyy-MM-dd")}</td>`
			tlis += `<td><span class="groupModify" style="color:#3a4a8d;margin-right:10px">修改</span><span class="groupDel" style="color:#d93535">删除</span></td>`
			tlis += "</tr>"
			$("#groupTable").append($(tlis))
		}
		toModifyGroup()
		toDelGroup()
	}
	//新建消息
	var messageContent = ""
	var preGroupTemp = []
	var prePeopleTemp = []
	$(".newMessage").click(function() {
		$(".pop-title").html("新建")
		$(".popup_bg").show()
		$(".messagePop").show()
		$(".lookPop").hide()
		$(".groupPop").hide()
		$(".mStep1").show()
		$(".mStep2").hide()
		setPopupHeight()
		$(".circle2").hide()
		$("#pTitle").html("您订阅的久赢早讯新闻出炉啦!")
		$("#mtilte").val("您订阅的久赢早讯新闻出炉啦!")
		$("#pProductName").html("中州久赢")
		$("#productName").val("中州久赢")
		$("#pReportName").html("久赢每日早讯")
		$("#reportName").val("久赢每日早讯")
		$("#pReportDesc").html("")
		$("#reportDesc").val("")
		$("#sendDate").val("")
		$("#sendHour").val("00")
		$("#sendMin").val("00")
		$(".preGroup").empty()
		$(".prePeople").empty()
		var messageContent = ""
		$(".messagePop").attr("data-id", "")
		preGroupTemp = []
		prePeopleTemp = []
	})

	//修改消息	
	function toModifyMessage() {
		$(".messageModify").each(function() {
			$(this).click(function() {
				$(".pop-title").html("修改")
				$(".popup_bg").show()
				$(".messagePop").show()
				$(".lookPop").hide()
				$(".groupPop").hide()
				$(".mStep1").show()
				$(".mStep2").hide()
				setPopupHeight()
				$(".preGroup").empty()
				$(".prePeople").empty()
				$(".messagePop").attr("data-id", $(this).parent().parent().data("id"))
				$.ajax({
					type: "POST",
					url: `http://www.decaihui.com/wxmgmt/api/wxTempMsg/getWxTemplateMsg/${$(this).parent().parent().data("id")}.do`,
					async: true,
					contentType: "application/json",
					success: function(data) {
						var newContent = JSON.parse(data.data.content)
						$("#pTitle").html(newContent.data.first.value.split(",")[1])
						$("#mtilte").val(newContent.data.first.value.split(",")[1])
						$("#pProductName").html(newContent.data.keyword1.value)
						$("#productName").val(newContent.data.keyword1.value)
						$("#pReportName").html(newContent.data.keyword2.value)
						$("#reportName").val(newContent.data.keyword2.value)
						$("#pReportDesc").html(newContent.data.keyword4.value)
						$("#reportDesc").val(newContent.data.keyword4.value)
						$("#sendDate").val(new Date(data.data.sendDate).Format("yyyy-MM-dd"))
						$("#sendHour").val(new Date(data.data.sendDate).getHours())
						$("#sendMin").val(new Date(data.data.sendDate).getMinutes())
						$("#pSendTime").html(new Date(data.data.sendDate).Format("yyyy-MM-dd"))
						prePeopleTemp=[]
//						for(var i=0;i<data.data.users.length;i++){
//							var newobj = {
//								name: data.data.users[i].jyName,
//								id: data.data.users[i].wxUserId
//							}
//							prePeopleTemp.push(newobj)
//						}
					}
				})
			})
		})
	}
	//消息查看
	function toLookMessage() {
		$(".messageLook").each(function() {
			$(this).click(function() {
				$(".pop-title").html("查看")
				$(".popup_bg").show()
				$(".messagePop").hide()
				$(".lookPop").show()
				$(".groupPop").hide()
				setPopupHeight()
				$(".lookPop").attr("data-id", $(this).parent().parent().data("id"))
				$.ajax({
					type: "POST",
					url: `http://www.decaihui.com/wxmgmt/api/wxTempMsg/getWxTemplateMsg/${$(this).parent().parent().data("id")}.do`,
					async: true,
					contentType: "application/json",
					success: function(data) {
						var newContent = JSON.parse(data.data.content)
						$("#pTitle2").html(newContent.data.first.value.split(",")[1])
						$("#pProductName2").html(newContent.data.keyword1.value)
						$("#pReportName2").html(newContent.data.keyword2.value)
						$("#pReportDesc2").html(newContent.data.keyword4.value)
						$("#pSendTime2").html(new Date(data.data.sendDate).Format("yyyy-MM-dd"))
					}
				})
			})
		})
	}
	//删除消息
	function toDelMessage() {
		$(".messageDel").each(function() {
			$(this).click(function() {
				if(confirm("确认删除所选项？")){
					$.ajax({
						type: "POST",
						url: `http://www.decaihui.com/wxmgmt/api/wxTempMsg/deleteTemplateMsg/${$(this).parent().parent().data("id")}.do`,
						async: true,
						contentType: "application/json",
						success: function(data) {
							if(data.code == "000") {
								loaded(obj, messageUrl, "#moduleEdit", 0)
							} else {
								alert("删除失败!错误代码:" + data.code)
							}
						}
					});
				}	
			})
		})
	}
	//消息弹框的下一步
	$(".mNext").click(function() {
		$(".mStep2").show()
		$(".mStep1").hide()
		$(".sGroup").show()
		if($("#sendDate").val() == "") {
			var nowSendDate1 = new Date().Format("yyyy-MM-dd")
		} else {
			var nowSendDate1 = $("#sendDate").val()
		}

		var messageContentObj = {
			template_id: "h-NAsKzEuIN_TK-VfA6y6ZOqliK-0jwnYLgcENcb_8Y",
			touser: "#touser#",
			url: "#url#",
			data: {
				"first": {
					"value": `#username#,${$("#mtilte").val()}`,
					"color": "#ab8c5f"
				},
				"keyword1": {
					"value": $("#productName").val()
				},
				"keyword2": {
					"value": $("#reportName").val()
				},
				"keyword3": {
					"value": nowSendDate1,
					"color": "#949494"
				},
				"keyword4": {
					"value": $("#reportDesc").val(),
					"color": "#bd0000"
				},
				"remark": {
					"value": ""
				}
			}
		}
		messageContent = JSON.stringify(messageContentObj)
		searchGroup()

	})
	//消息弹框的上一步
	$(".mPrev").click(function() {
		$(".mStep1").show()
		$(".mStep2").hide()
	})

	//搜索组别
	function searchGroup() {
		var searchGroupObj = {
			begPageNo: 1,
			total: 10
		}
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/wxTempMsg/statisticsWxUserGroups.do`,
			async: true,
			contentType: "application/json",
			success: function(data) {
				$(".sGroup .list").empty()
				for(var i = 0; i < data.data.length; i++) {
					var lis = ""
					lis += `<li data-id="${data.data[i].id}">`
					lis += `<div class="circle1">`
					lis += `<div class="circle2"></div>`
					lis += `</div>`
					lis += `<div class="liName">${data.data[i].name}&nbsp;(${data.data[i].total})</div>`
					lis += `</li>`
					$(".sGroup .list").append($(lis))
				}
				selectGroup()
			}
		})
	}
	//选择分组
	function selectGroup() {
		$(".sGroup .list>li").each(function() {
			$(this).click(function() {
				var newobj = {
					name: $(this).find("div[class='liName']").html(),
					id: $(this).data("id")
				}
				preGroupTemp.push(newobj)
				preGroupTemp = $.reduceArray(preGroupTemp)
				$(this).find("div[class='circle2']").show()
				loadGroupPreview(preGroupTemp)
			})
		})
	}
	//分组预览框添加
	function loadGroupPreview(arr) {
		$(".preGroup").empty()
		for(var i = 0; i < arr.length; i++) {
			var lis = `<li data-id="${arr[i].id}">`
			lis += arr[i].name
			lis += `<img src="img/preDel.png"/ class="preDel">`
			lis += "</li>"
			$(".preGroup").append($(lis))
			preGroupDel()
			groupPreview()
			$(".preGroup>li").each(function() {
				$(this).trigger("click")
			})
		}
	}
	//分组预览框删除
	function preGroupDel() {
		$(".preGroup .preDel").each(function() {
			$(this).click(function() {
				for(var i = 0; i < preGroupTemp.length; i++) {
					if(preGroupTemp[i].id == $(this).parent().data("id")) {
						preGroupTemp.splice(i, 1)
					}
				}
				loadGroupPreview(preGroupTemp)
				var parentId = $(this).parent().data("id")
				$(".sGroup .list>li").each(function() {
					if($(this).data("id") == parentId) {
						$(this).find("div[class='circle2']").hide()
					}
				})
				prePeopleTemp=[]
				$(".preGroup>li").each(function() {
					$(this).trigger("click")
				})
				if($(".preGroup .preDel").length==0){
					$(".prePeople").empty()
					prePeopleTemp=[]
				}
			})
		})
	}
	//单个组内人员预览
	function groupPreview() {
		$(".preGroup>li").each(function() {
			$(this).click(function() {
				$.ajax({
					type: "POST",
					url: `http://www.decaihui.com/wxmgmt/api/wxTempMsg/getWxUserGroup/${$(this).data("id")}.do`,
					async: true,
					contentType: "application/json",
					success: function(data) {
						for(var i=0;i<data.data.wxUsers.length;i++){
							var newobj = {
								name: data.data.wxUsers[i].jyUserName,
								id: data.data.wxUsers[i].wxUserId
							}
							prePeopleTemp.push(newobj)
						}
						prePeopleTemp = $.reduceArray(prePeopleTemp)
						loadPeoplePreview(prePeopleTemp)
					}
				});
			})
		})
	}
	//人员预览框添加
	function loadPeoplePreview(arr) {
		$(".prePeople").empty()
		for(var i = 0; i < arr.length; i++) {
			var lis = `<li data-id="${arr[i].id}">`
			lis += arr[i].name
			lis += "</li>"
			$(".prePeople").append($(lis))
		}
	}
	//消息列表弹框的保存
	$(".mSave").click(function() {
		var wxUserIdsArr = []
		$(".prePeople>li").each(function() {
			wxUserIdsArr.push($(this).data("id"))
		})
		if($("#sendDate").val() == "") {
			var nowSendDate = new Date().getTime() + 5000
		} else {
			var nowSendDate = new Date(`${$("#sendDate").val()} ${$("#sendHour").val()}:${$("#sendMin").val()}:00`).getTime()
		}
		if($("#test").is(":checked")) {
			var istest = 0
		} else {
			var istest = 1
		}
		var saveObj = {
			content: messageContent,
			sendDate: nowSendDate,
			wxUserIds: wxUserIdsArr,
			remark: $("#reportDesc").val(),
			isTest: istest
		}
		if($(".messagePop").attr("data-id") == "") {
			delete saveObj.tempId
		} else {
			saveObj.tempId = $(".messagePop").attr("data-id")
		}
		if(wxUserIdsArr.length == 0 && wxUserGroupIdsArr == 0) {
			alert("请至少选择一个微信组或微信用户!")
		} else {
			$.ajax({
				type: "POST",
				url: `http://www.decaihui.com/wxmgmt/api/wxTempMsg/saveOrUpdateTemplateMsg.do`,
				async: true,
				contentType: "application/json",
				data: JSON.stringify(saveObj),
				success: function(data) {
					if(data.code == "000") {
						$(".popup_bg").hide()
						loaded(obj, messageUrl, "#moduleEdit", 0)
					} else {
						alert("提交失败!错误代码:" + data.code)
					}
				}
			});
		}
	})
	//消息列表下的全选
	$(".sGroup .all").click(function() {
		allFlag = true
		$(this).find("div[class='circle2']").show()
		$(".sGroup .list>li").each(function() {
			$(this).trigger("click")
		})
	})
	//消息列表的搜索
	$(".search").click(function() {
		if($("#keywords input").val() == "") {
			delete obj.remark
		} else {
			obj.remark = $("#keywords input").val()
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
		loaded(obj, messageUrl, "#moduleEdit", 0)
	})
	//新建分组
	var modifyGroupsMember = []
	$(".newGroup").click(function() {
		$(".pop-title").html("新建")
		$(".popup_bg").show()
		$(".messagePop").hide()
		$(".lookPop").hide()
		$(".groupPop").show()
		$("#gtilte").val("")
		setPopupHeight()
		$(".preGroupPeople").empty()
		$(".gPeople .list").empty()
		$(".gDepart").show()
		$(".gPeople").show()
		$(".circle2").hide()
		allFlag = false
		var modifyGroupsMember = []
		$(".groupPop").attr("data-id", "")
		searchDepart()

	})
	//修改分组
	function toModifyGroup() {
		$(".groupModify").each(function() {
			$(this).click(function() {
				$(".pop-title").html("修改")
				$(".popup_bg").show()
				$(".messagePop").hide()
				$(".lookPop").hide()
				$(".groupPop").show()
				setPopupHeight()
				$(".gDepart").show()
				$(".gPeople").show()
				$(".preGroupPeople").empty()

				$(".groupPop").attr("data-id", $(this).parent().parent().data("id"))
				$.ajax({
					type: "POST",
					url: `http://www.decaihui.com/wxmgmt/api/wxTempMsg/getWxUserGroup/${$(this).parent().parent().data("id")}.do`,
					async: true,
					contentType: "application/json",
					success: function(data) {
						$("#gtilte").val(data.data.groupName)
						modifyGroupsMember = data.data.wxUsers
						searchDepart()
					}
				})
			})
		})
	}

	//删除组
	function toDelGroup() {
		$(".groupDel").each(function() {
			$(this).click(function() {
				$.ajax({
					type: "POST",
					url: `http://www.decaihui.com/wxmgmt/api/wxTempMsg/deleteWxUserGroup/${$(this).parent().parent().data("id")}.do`,
					async: true,
					contentType: "application/json",
					success: function(data) {
						if(data.code == "000") {
							loaded(obj, groupUrl, "#userList", 1)
						} else {
							alert("删除失败!错误代码:" + data.code)
						}
					}
				});
			})
		})
	}
	//分组管理的搜索
	$(".searchGroup").click(function() {
		if($("#keywordsGroup input").val() == "") {
			delete obj.name
		} else {
			obj.name = $("#keywordsGroup input").val()
		}
		if($("#createFrom").val() == "") {
			delete obj.begDate
		} else {
			obj.begDate = $("#createFrom").val()
		}
		if($("#createTo").val() == "") {
			delete obj.endDate
		} else {
			obj.endDate = $("#createTo").val()
		}
		loaded(obj, groupUrl, "#userList", 1)
	})
	//分组管理弹框的保存
	$(".gSave").click(function() {
		var wxUserIdsArr = []
		$(".preGroupPeople>li").each(function() {
			wxUserIdsArr.push($(this).data("id"))
		})
		var saveObj = {
			name: $("#gtilte").val(),
			wxUserIds: wxUserIdsArr
		}
		if($(".groupPop").attr("data-id") == "") {
			delete saveObj.id
		} else {
			saveObj.id = $(".groupPop").attr("data-id")
		}
		if($("#gtilte").val().trim() == "") {
			alert("新建组名不能为空!")
		} else {
			$.ajax({
				type: "POST",
				url: `http://www.decaihui.com/wxmgmt/api/wxTempMsg/saveOrUpdateWxUserGroup.do`,
				async: true,
				contentType: "application/json",
				data: JSON.stringify(saveObj),
				success: function(data) {
					if(data.code == "000") {
						$(".popup_bg").hide()
						loaded(obj, groupUrl, "#userList", 1)
					} else {
						alert("提交失败!错误代码:" + data.code)
					}
				}
			});
		}
	})
	//分组管理下的全选
	$(".gDepart .all").click(function() {
		allFlag = true
		$(this).find("div[class='circle2']").show()
		$(".gDepart .list>li").each(function() {
			$(this).trigger("click")
			$(".gPeople .list>li").each(function() {
				$(this).trigger("click")
			})
		})
	})
	$(".gPeople .all").click(function() {
		//		allFlag = true
		$(this).find("div[class='circle2']").show()
		$(".gPeople .list>li").each(function() {
			$(this).trigger("click")
		})
		$(".gDepart .list>li").each(function() {
			if($(this).data("depart") == $(".gPeople .list>li").eq(0).data("depart")) {
				$(this).find("div[class='circle2']").show()
			}
		})
	})

	//搜索营业部
	var departArr = []

	function searchDepart() {
		$.ajax({
			type: "POST",
			url: 'http://www.decaihui.com/wxmgmt/api/wxTempMsg/statisticsAllJyWxUserByDepartment.do',
			async: true,
			contentType: "application/json",
			success: function(data) {
				$(".gDepart .list").empty()
				for(var i = 0; i < data.data.length; i++) {
					var lis = ''
					lis += `<li data-id="${i}" data-depart="${data.data[i].department}">`
					lis += `<div class="circle1">`
					lis += `<div class="circle2"></div>`
					lis += `</div>`
					lis += `<div class="liName">${data.data[i].department}&nbsp;(${data.data[i].total})</div>`
					lis += `</li>`
					$(".gDepart .list").append($(lis))
					var departObj = {
						departName: data.data[i].department,
						departPeople: []
					}
					departArr.push(departObj)
				}
				selectDepart()
			}
		});
	}
	//营业部列表选择
	function selectDepart() {
		$(".gDepart .list>li").each(function() {
			$(this).click(function() {
				var parentNode = $(this)
				$.ajax({
					type: "POST",
					url: `http://www.decaihui.com/wxmgmt/api/wxTempMsg/listJyWxUsers/${$(this).data("depart")}.do`,
					async: true,
					contentType: "application/json",
					success: function(data) {
						$(".gPeople .list").empty()
						for(var i = 0; i < data.data.length; i++) {
							var lis = ''
							lis += `<li data-id="${data.data[i].wxUserId}" data-depart="${parentNode.data("depart")}">`
							lis += `<div class="circle1">`
							lis += `<div class="circle2"></div>`
							lis += `</div>`
							lis += `<div class="liName">${data.data[i].jyName}</div>`
							lis += `</li>`
							$(".gPeople .list").append($(lis))
						}
						selectPeople()
					}
				})
			})
		})
	}
	//营业部下的人员选择
	function selectPeople() {
		$(".gPeople .list>li").each(function() {
			$(this).click(function() {
				$(this).find("div[class='circle2']").show()
				for(var j = 0; j < departArr.length; j++) {
					if($(this).data("depart") == departArr[j].departName) {
						var tempObj = {
							name: $(this).find("div[class='liName']").html(),
							id: $(this).data("id")
						}
						departArr[j].departPeople.push(tempObj)
					}
				}
				$(".preGroupPeople").empty()
				for(var m = 0; m < departArr.length; m++) {
					departArr[m].departPeople = $.dedupe(departArr[m].departPeople)
					for(n = 0; n < departArr[m].departPeople.length; n++) {
						var lis = `<li data-id="${departArr[m].departPeople[n].id}">`
						lis += departArr[m].departPeople[n].name
						lis += `<img src="img/preDel.png"/ class="preDel">`
						lis += "</li>"
						$(".preGroupPeople").append($(lis))
					}
				}
			})
		})
	}
	//弹出框高度
	function setPopupHeight() {
		$(".popup_bg").height($(document).height())
		$(".popup_bg").width($(document).width())
	}
	//关闭弹出框
	$(".pop-close,.cancel").click(function() {
		$(".popup_bg").hide()
	})
	//输入框计数
	$(".messageContent input").each(function() {
		$(this).keyup(function() {
			$(this).parent().next().find("span").html($(this).val().length)
			$("#pTitle").html($("#mtilte").val())
			$("#pProductName").html($("#productName").val())
			$("#pReportName").html($("#reportName").val())
			$("#pReportDesc").html($("#reportDesc").val())
		})
	})
	//选择时分计数
	$(".countBox>div:first-of-type").each(function() { //时间+++
		$(this).click(function() {
			if($(this).parent().prev().val() == 23 && $(this).parent().prev().hasClass("isHour")) {
				$(this).parent().prev().val("23")
			} else if($(this).parent().prev().val() == 59 && $(this).parent().prev().hasClass("isMin")) {
				$(this).parent().prev().val("59")
			} else {
				var upNum = parseInt($(this).parent().prev().val()) + 1
				if(upNum < 10) {
					$(this).parent().prev().val("0" + upNum)
				} else {
					$(this).parent().prev().val(upNum)
				}
			}
		})
	})
	$(".countBox>div:last-of-type").each(function() { //时间---
		$(this).click(function() {
			if($(this).parent().prev().val() == "00") {
				$(this).parent().prev().val("00")
			} else {
				var downNum = parseInt($(this).parent().prev().val()) - 1
				if(downNum < 10) {
					$(this).parent().prev().val("0" + downNum)
				} else {
					$(this).parent().prev().val(downNum)
				}
			}
		})
	})
	//	查询日期范围
	var dateFormat = "dd/mm/yy"
	$.findTimeRange($("#from"), $("#to"))
	$.findTimeRange($("#createFrom"), $("#createTo"))

	$("#sendDate").datepicker({
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
			$("#pSendTime").html(selectedDate)
		}
	});

	//点击空白隐藏
	$(document).click(function(e) {
		$("#statusType").hide()
	})
})