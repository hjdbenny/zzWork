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
				if(elem == "#status") {
					if($(this).html() == "待编辑") {
						$(elem + ">div:first-of-type").attr("data-status", "2")
					} else if($(this).html() == "待发布") {
						$(elem + ">div:first-of-type").attr("data-status", "0")
					} else if($(this).html() == "已发布") {
						$(elem + ">div:first-of-type").attr("data-status", "1")
					}
				}
			})
		})
	}
	selectOption(".status")
	var obj = {
		begPageNo: 1,
		total: 10
	}
	//标签选择
	$(".btns>li").each(function(i) {
		$(this).click(function() {
			$(".btns>li").removeClass("btns-on")
			$(this).addClass("btns-on")
			$(".container>section").hide()
			$(".container>section").eq(i).show()
			$(".edit_bottom>section").hide()
			$(".edit_bottom>section").eq(i).show()
			if(i == 4) {
				loadRule(obj)
				$(".newRule").css("top","-40px")
			} else {
				findRule(i)
				$(".newRule").css("top","10px")
			}
			pointsFormat()
		})
	})
	//载入其他规则
	function loadRule(obj) {
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/jf/points/listPointsSchedule.do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			data: JSON.stringify(obj),
			beforeSend: function() {
				$(`.loading`).show()
				$(".pagefoot").hide()
			},
			complete: function() {
				$(`.loading`).hide()
				$(".pagefoot").show()
			},
			success: function(data) {
				if(data.data.length == 0) {
					$(".noData").show()
				}else{
					$(".noData").hide()
				}
				loadRuleTable(data.data)
				$totalData = data.total
				totalPage = Math.ceil($totalData / 10) //总页数	
				$(`.countNum`).html($totalData)
				if(totalPage > 1) {
					$(`.M-box1`).show()
					$(`.M-box1`).pagination({
						totalData: $totalData,
						showData: 10,
						coping: true,
						callback: function(api) {
							obj.begPageNo = api.getCurrent().toString()
							$.ajax({
								type: "POST",
								url: "",
								async: true,
								contentType: "application/json",
								xhrFields: {
									withCredentials: true
								},
								data: JSON.stringify(obj),
								beforeSend: function() {
									$(`.loading`).show()
									$(".pagefoot").hide()
								},
								complete: function() {
									$(`.loading`).hide()
									$(".pagefoot").show()
								},
								success: function(data) {
									loadRuleTable(data.data)
								}
							});
						}
					})
				} else {
					$(`.M-box1`).hide()
				}
			}
		})
	}
	//加载其他规则列表
	function loadRuleTable(arr) {
		$(".ruleTable tr:gt(0)").remove()
		for(var i = 0, len = arr.length; i < len; i++) {
			if(arr[i].status == 1) {
				var curStatus = "已发送"
				var operation = "<div class='undo'>撤销</div>"
			} else {
				var curStatus = "待发送"
				var operation = "<div class='toEdit'>修改</div><div class='undo'>撤销</div>"
			}
			var tlis = ""
			tlis += `<tr data-id="${arr[i].id}">`
			tlis += `<td>${arr[i].sendDate.substring(0,4)}-${arr[i].sendDate.substring(4,6)}-${arr[i].sendDate.substring(6,8)}</td>`
			tlis += `<td>赠送<div><div>${arr[i].points}</div>积分</div></td>`
			tlis += `<td>${arr[i].description}</td>`
			tlis += `<td>${arr[i].mgmtName}</td>`
			tlis += `<td>${new Date(arr[i].createDate).Format("yyyy-MM-dd")}</td>`
			tlis += `<td>${curStatus}</td>`
			tlis += `<td>${operation}</td>`
			tlis += `</tr>`
			$(".ruleTable").append($(tlis))
		}
		$(".ruleTable tr td:nth-child(6)").each(function() {
			if($(this).html() == "待发送") {
				$(this).addClass("preSend")
				$(this).next().addClass("preSend")
			}
		})
		toEdit()
		toUndo()
	}
	//其他规则列表操作-修改
	function toEdit() {
		$(".toEdit").each(function(i) {
			$(this).click(function() {
				$(".edit_bg").show()
				$(".edit_title").html("修改-其他规则")
				$(".edit_bottom>section").hide()
				$(".edit_bottom>section").eq(4).show()
				$(".newOther>div:first-of-type input").val($(".ruleTable tr>td:nth-child(2)>div>div").eq(i).html())
				$("#sendDate").val($(".ruleTable tr>td:nth-child(5)").eq(i).html())
				$("#remarks").val($(".ruleTable tr>td:nth-child(3)").eq(i).html())
				$("#allAccount").attr("data-id", $(this).parent().parent().data("id"))
			})
		})
	}
	//其他规则列表操作-撤销
	function toUndo() {
		$(".undo").each(function() {
			$(this).click(function() {
				$.ajax({
					type: "POST",
					url: `http://www.decaihui.com/wxmgmt/api/jf/points/cancelPointsSchedule/${$(this).parent().parent().data("id")}.do`,
					async: true,
					contentType: "application/json",
					success: function(data) {
						if(data.code=="000"){
							loadRule(obj)
						}else{
							alert(`撤销失败,错误代码:${data.code}`)
						}
					}
				});
			})
		})
	}
	//其他规则列表搜索
	$(".search").click(function() {
		if($("#keywords").val() != "") {
			obj.keyword = $("#keywords").val()
		} else {
			delete obj.keyword
		}
		if($(".showStuts").html()=="待发送"){
			obj.status="0"
		}else if($(".showStuts").html()=="已发送"){
			obj.status="1"
		}else{
			delete obj.status
		}
		if($("#recordFrom").val() != "") {
			obj.begDate = $("#recordFrom").val()
		} else {
			delete obj.begDate
		}
		if($("#recordTo").val() != "") {
			obj.endDate = $("#recordTo").val()
		} else {
			delete obj.endDate
		}
		loadRule(obj)
	})
	//关闭新建规则
	$(".edit_close").click(function() {
		$(".edit_bg").hide()
	})
	//新建规则
	$(".newRule").each(function(i) {
		$(this).click(function() {
			$(".edit_bg").show()
			$(".edit_bg input,.edit_bg textarea").val("")
			if(i == 0) {
				$(".edit_title").html("新建-入金积分规则")
			} else if(i == 1) {
				$(".edit_title").html("新建-客户转介绍规则")
			} else if(i == 2) {
				$(".edit_title").html("新建-当月收益率排名规则")
			} else if(i == 3) {
				$(".edit_title").html("新建-当月收益率排名提升规则")
			} else if(i == 4) {
				$(".edit_title").html("新建-其他规则")
				$("#allAccount").attr("data-id", "null")
			}
			pointsFormat()
		})
	})
	//新建规则保存
	$(".edit_save").each(function(i) {
		$(this).click(function() {
			if(i == 0) {
				var str1 = $(".newGold>div:first-of-type>div:first-of-type>input").val()
				var str2 = $(".newGold>div:first-of-type>div:last-of-type>input").val()
				goldList(str1, str2)
				$(".edit_bg").hide()
			} else if(i == 1) {
				var str1 = $(".newIntro>div:first-of-type>div:first-of-type>input").val()
				var str2 = $(".newIntro>div:first-of-type>div:last-of-type>input").val()
				introList(str1, str2)
				$(".edit_bg").hide()
			} else if(i == 2) {
				var str1 = $(".newRank>div:first-of-type>div:first-of-type>input").val()
				var str2 = $(".newRank>div:first-of-type>div:nth-of-type(2)>input").val()
				var str3 = $(".newRank>div:first-of-type>div:last-of-type>input").val()
				rankList(str1, str2, str3)
				$(".edit_bg").hide()
			} else if(i == 3) {
				var str1 = $(".newChange>div:first-of-type>div:first-of-type>input").val()
				var str2 = $(".newChange>div:first-of-type>div:last-of-type>input").val()
				changeList(str1, str2)
				$(".edit_bg").hide()
			} else if(i == 4) {
				modifyOtherRule()
			}
			pointsFormat()
		})
	})
	//新建规则取消
	$(".edit_cancel").each(function() {
		$(this).click(function() {
			$(".edit_bg").hide()
		})
	})
	findRule(0)
	//查找积分规则
	function findRule(id) {
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/jf/points/listPointsRule/${id}.do`, //类型（0 入金积分  1客户转介绍积分 2当月收益率排名 3当月收益率排名提升）
			async: true,
			contentType: "application/json",
			success: function(data) {
				if(id == 0) { //载入入金规则
					$(".goldPoints>ul").empty()
					var firstLi = ``
					firstLi += `<li>`
					firstLi += `<div><input type="text" class="desc" value="0" disadled="disabled" />首次开户</div>`
					firstLi += `<span>赠送</span>`
					firstLi += `<div><input type="text" class="val"  value="${data.data[0].points}"/><label>积分</label></div>`
					firstLi += `</li>`
					$(".goldPoints>ul").append($(firstLi))
					for(var i = 1, len = data.data.length; i < len; i++) {
						goldList(data.data[i].conditions[0].value, data.data[i].points)
					}
				} else if(id == 1) { //载入客户转介绍积分规则
					$(".introPoints>ul").empty()
					for(var i = 0, len = data.data.length; i < len; i++) {
						introList(data.data[i].conditions[0].value, data.data[i].points)
					}
				} else if(id == 2) { //载入当月收益率排名规则
					$(".monthRank>ul").empty()
					for(var i = 0, len = data.data.length; i < len; i++) {
						var startRank = ""
						var endRank = ""
						for(var j = 0, len2 = data.data[i].conditions.length; j < len2; j++) {
							if(data.data[i].conditions[j].description == "start") {
								startRank = data.data[i].conditions[j].value
							} else if(data.data[i].conditions[j].description == "end") {
								endRank = data.data[i].conditions[j].value
							}
						}
						rankList(startRank, endRank, data.data[i].points)
					}
				} else if(id == 3) { //载入当月收益率排名提升规则
					$(".rankChange>ul").empty()
					for(var i = 0, len = data.data.length; i < len; i++) {
						changeList(data.data[i].conditions[0].value, data.data[i].points)
					}
				}
				pointsFormat()
			}
		});
	}
	//保存规则按钮
	$(".save").each(function(i) {
		$(this).click(function() {
			saveRule(i)
		})
	})
	//保存修改积分规则
	function saveRule(id) { //0 入金积分  1客户转介绍积分 2当月收益率排名 3当月收益率排名提升
		var pointsArr = []
		if(id == 0) {
			$(".goldPoints>ul>li").each(function(i) {
				var ruleObj = {
					points: $(this).find("input[class='val']").val().split(" ").join(""),
					conditions: [{
						value: $(this).find("input[class='desc']").val(),
						description: "desc"
					}]
				}
				pointsArr.push(ruleObj)
			})
		} else if(id == 1) {
			$(".introPoints>ul>li").each(function(i) {
				var ruleObj = {
					points: $(this).find("input[class='val']").val().split(" ").join(""),
					conditions: [{
						value: $(this).find("input[class='desc']").val(),
						description: "desc"
					}]
				}
				pointsArr.push(ruleObj)
			})
		} else if(id == 2) {
			$(".monthRank>ul>li").each(function(i) {
				var ruleObj = {
					points: $(this).find("input[class='val']").val().split(" ").join(""),
					conditions: [{
						value: $(this).find("input[class='desc1']").val(),
						description: "start"
					}, {
						value: $(this).find("input[class='desc2']").val(),
						description: "end"
					}]
				}
				pointsArr.push(ruleObj)
			})
		} else if(id == 3) {
			$(".rankChange>ul>li").each(function(i) {
				var ruleObj = {
					points: $(this).find("input[class='val']").val().split(" ").join(""),
					conditions: [{
						value: $(this).find("input[class='desc']").val(),
						description: "desc"
					}]
				}
				pointsArr.push(ruleObj)
			})
		}
		var saveObj = {
			type: id,
			pointsRules: pointsArr
		}
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/jf/points/modifyPointsRules.do`,
			async: true,
			contentType: "application/json",
			data: JSON.stringify(saveObj),
			success: function(data) {
				findRule(id)
			}
		});
	}
	//添加入金规则列表
	function goldList(str1, str2) {
		var newlis = `<li>`
		newlis += `<div><label>达到</label><input type="text" class="desc" value="${str1}" /></div>`
		newlis += `<span>赠送</span>`
		newlis += `<div><input type="text" value="${str2}" class="val" /><label>积分</label></div>`
		newlis += `</li>`
		$(".goldPoints>ul").append($(newlis))
	}
	//添加客户转介绍规则列表
	function introList(str1, str2) {
		var newlis = `<li>`
		newlis += `<div><label>介绍</label><input type="text" class="desc" value="${str1}" /><label>人</label></div>`
		newlis += `<span>赠送</span>`
		newlis += `<div><input type="text" value="${str2}" class="val"/><label>积分</label></div>`
		newlis += `</li>`
		$(".introPoints>ul").append($(newlis))
	}
	//添加当月收益率排名规则列表
	function rankList(str1, str2, str3) {
		var newlis = `<li>`
		newlis += `<div><label>第</label><input type="text" class="desc1" value="${str1}" /><label>名</label></div>`
		newlis += `<span>至</span>`
		newlis += `<div><label>第</label><input type="text" class="desc2" value="${str2}" /><label>名</label></div>`
		newlis += `<span>赠送</span>`
		newlis += `<div><input type="text" value="${str3}" class="val" /><label>积分</label></div>`
		newlis += `</li>`
		$(".monthRank>ul").append($(newlis))
	}
	//添加当月收益率排名提升规则列表
	function changeList(str1, str2) {
		var newlis = `<li>`
		newlis += `<div><label>提升&ge;</label><input type="text" class="desc" value="${str1}"/>%</div>`
		newlis += `<span>赠送</span>`
		newlis += `<div><input type="text" value="${str2}" class="val" /><label>积分</label></div>`
		newlis += `</li>`
		$(".rankChange>ul").append($(newlis))
	}

	//新增或修改其他规则
	function modifyOtherRule(id) {
		var str1 = $(".newOther>div:first-of-type input").val()
		var sendDate = $("#sendDate").val().split("-").join("")
		var remark = $("#remarks").val()
		var newOtherObj = {
			points: str1,
			description: remark,
			sendDate: sendDate
		}
		if($("#allAccount").attr("data-id") == "null") {
			newOtherObj.id = null
		} else {
			newOtherObj.id = $("#allAccount").attr("data-id")
		}
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxmgmt/api/jf/points/saveOrUpdatePointsSchedule.do`,
			async: true,
			contentType: "application/json",
			data: JSON.stringify(newOtherObj),
			success: function(data) {
				if(data.code == "000") {
					$(".edit_bg").hide()
					loadRule(obj)
				} else {
					alert(`错误代码:${data.code},${data.message}`)
				}
			}
		})
	}
	$("#remarks").keyup(function() {
		$(".curNum").html($(this).val().length)
	})
	$(".edit_bg").height($(document).height())
	//	查询日期
	$("#sendTime").html(new Date().Format("yyyy-MM-dd"))
	$.findTimeRange($("#recordFrom"),$("#recordTo"))
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
			$("#sendTime").html(selectedDate)
		}
	});

	function pointsFormat() {
		$("input[class='val']").each(function() {
			$(this).blur(function() {
				$(this).val($.format_number_trim($(this).val()))
			})
			$(this).val($.format_number_trim($(this).val()))
		})
	}
})