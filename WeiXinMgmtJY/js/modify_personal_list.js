$(function() {
	//权限控制
	currentQx = JSON.parse(sessionStorage.getItem("qxTotalArr"))
	for(var i = 0; i < currentQx.length; i++) {
		if(currentQx[i].canShow == "1") {
			$(".left ul li[data-level='" + currentQx[i].level + "']").show()
		}
	}
	var departments = []
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
	selectOption("#status")
	selectOption("#year")
	selectOption("#month")

	function setDefaultDate() {
		currentDate = new Date()
		if(currentDate.getMonth() == 0) {
			currentMonth = 12
		} else {
			currentMonth = currentDate.getMonth()
		}
		$(".showYear").html(currentDate.getFullYear() + "年")
		$(".showMonth").html(currentMonth + "月")
	}
	setDefaultDate()

	function getReportDate() {
		var reportYear = parseInt($(".showYear").html())
		if(parseInt($(".showMonth").html()) < 10) {
			var reportMonth = "0" + parseInt($(".showMonth").html())
		} else {
			var reportMonth = parseInt($(".showMonth").html()).toString()
		}
		return reportYear + "-" + reportMonth
	}
	if(sessionStorage.getItem("filterStatus") == null || sessionStorage.getItem("filterStatus") == "" || sessionStorage.getItem("filterStatus") == undefined) {
		obj = {
			begPageNo: 1,
			total: 20,
			reportDate: getReportDate()
		}
	} else {
		obj = JSON.parse(sessionStorage.getItem("filterStatus"))
		$("#keywords input").val(obj.keyword)
		if(obj.status == "2") {
			$(".showStuts").html("待编辑")
		} else if(obj.status == "1") {
			$(".showStuts").html("已发布")
		} else if(obj.status == "0") {
			$(".showStuts").html("待发布")
		}
		if(obj.departments == undefined || obj.departments == "" || obj.departments == null) {
			$(".currentDepart").html("请选择营业部")
		} else {
			$(".currentDepart").html(obj.departments.join(","))
		}
		$(".showYear").html(obj.reportDate.split("-")[0] + "年")
		$(".showMonth").html(parseInt(obj.reportDate.split("-")[1]) + "月")
	}

	loaded(obj)

	function loaded(obj) {
		$.ajax({
			type: "POST",
			url: "http://wx.zzfco.com/wxmgmt/api/myMonthlyReport/listUsers.do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			beforeSend: function() {
				$(".loading").show()
			},
			complete: function() {
				$(".loading").hide()
			},
			data: JSON.stringify(obj),
			success: function(data) {
				sessionStorage.setItem("filterStatus", JSON.stringify(obj))
				loadReview(data.data.users)
				var currentCount = {
					done: 0,
					undone: 0
				};
				for(var i = 0; i < data.data.allStatus.length; i++) {
					if(data.data.allStatus[i].status == null) {
						currentCount.undone = data.data.allStatus[i].total;
					}
					if(data.data.allStatus[i].status == 1) {
						currentCount.done = data.data.allStatus[i].total;
					}
				}
				$("#statusCount2").html(currentCount.undone)
				$("#statusCount1").html(currentCount.done)
				$("#allcount").html(data.total)
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
								url: "http://wx.zzfco.com/wxmgmt/api/myMonthlyReport/listUsers.do",
								async: true,
								contentType: "application/json",
								data: JSON.stringify(obj),
								xhrFields: {
									withCredentials: true
								},
								beforeSend: function() {
									$(".loading").show()
								},
								complete: function() {
									$(".loading").hide()
								},
								success: function(data) {
									loadReview(data.data.users)
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

	function loadReview(arr) {
		$(".container table tr:gt(0)").remove()
		for(var i = 0; i < arr.length; i++) {
			if(arr[i].status == "2" || arr[i].status == null) {
				currentStatus = "待编辑"
				statusClass = "statusClass2"
			} else if(arr[i].status == "0") {
				currentStatus = "待发布"
				statusClass = "statusClass0"
			} else if(arr[i].status == "1") {
				currentStatus = "已发布"
				statusClass = "statusClass1"
			}
			if(arr[i].modifyDate != null) {
				var modifyDate = new Date(arr[i].modifyDate).getFullYear() + "年" + (new Date(arr[i].modifyDate).getMonth() + 1) + "月" + new Date(arr[i].modifyDate).getDate() + "日"
			} else {
				var modifyDate = "暂未更新"
			}
			var tlis = ""
			tlis += "<tr data-reportid='" + arr[i].reportId + "'>"
			tlis += "<td><div class='circle1'><div class='circle2'></div></div></td>"
			tlis += "<td class='clientCode'>" + arr[i].clientCode + "</td>"
			tlis += "<td class='accountname'>" + arr[i].name + "</td>"
			tlis += "<td>" + arr[i].department + "</td>"
			tlis += "<td>" + arr[i].mobile + "</td>"
			tlis += "<td class='" + statusClass + "' data-status='" + arr[i].status + "'>" + currentStatus + "</td>"
			tlis += `<td>${modifyDate}</td>`
			tlis += "<td><a href='###'>编辑</a></td>"
			tlis += "</tr>"
			$(".container table").append($(tlis))
		}
		$(".department_bg").height($(document).height())
		$("table .circle1").each(function() {
			$(this).click(function() {
				if($(this).find("div[class='circle2']").is(":visible")) {
					$(this).find("div[class='circle2']").hide()
					$("#allAgree .circle2").hide()
				} else {
					$(this).find("div[class='circle2']").show()
				}
			})
		})
		$("table a").each(function() {
			$(this).click(function(e) {
				e.preventDefault()
				sessionStorage.setItem("status", $(this).parent().prev().data("status"))
				sessionStorage.setItem("clientCode", $(this).parent().parent().find("td[class='clientCode']").html())
				sessionStorage.setItem("accountname", $(this).parent().parent().find("td[class='accountname']").html())
				window.location.href = "modify_personal_edit.html"
			})
		})
	}
	//列表全选
	$("#allAgree .circle1").click(function() {
		if($("#allAgree .circle2").is(":hidden")) {
			$("table tr:gt(0) .circle2").show()
		} else {
			$("table tr:gt(0) .circle2").hide()
		}
	})
	//发布
	$(".publish").click(function() {
		var count = $("table tr:gt(0) .circle2:visible").length
		publishFlag = false
		if(count == 0) {
			publishFlag = false
		} else {
			$("table tr:gt(0) .circle2:visible").each(function() {
				if($(this).parent().parent().next().next().next().next().html() != "待发布") {
					publishFlag = true
				}
			})
		}
		if(publishFlag) {
			var idsArray = []
			$("table tr:gt(0) .circle2:visible").each(function() {
				idsArray.push($(this).parent().parent().parent().data("reportid"))
			})
			modifyReportStatus(idsArray, 1)
		} else {
			alert("您还未选择需要发布的月报或选择有误：只有状态为待发布的月报可以发布！")
		}
	})
	//修改月报状态
	function modifyReportStatus(idArr, status) {
		var changeObj = {
			ids: idArr,
			status: status
		}
		$.ajax({
			type: "post",
			url: "http://wx.zzfco.com/wxmgmt/api/myMonthlyReport/changeStatus.do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			data: JSON.stringify(changeObj),
			success: function(data) {
				window.location.reload()
			}
		});
	}
	//选择营业部
	$.ajax({
		type: "POST",
		url: "http://wx.zzfco.com/wxmgmt/api/myMonthlyReport/listAllDepartments.do",
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
	})
	$(".depart_close,.depart_cancel").click(function() {
		$(".department_bg").hide()
	})
	$(".depart_confirm").click(function() {
		departments = []
		$(".allDepartment li .circle2:visible").each(function() {
			departments.push($(this).parent().parent().find("span[class='departname']").html())
		})
		$(".currentDepart").html(departments.join(","))
		$(".department_bg").hide()
	})
	//	搜索
	$("#search").click(function() {
		obj = {
			keyword: $("#keywords input").val(),
			status: $(".showStuts").attr("data-status"),
			departments: departments,
			begPageNo: 1,
			total: 20,
			reportDate: getReportDate()
		}
		loaded(obj)
	})
})