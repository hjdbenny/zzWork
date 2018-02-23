$(function() {
	//获取左侧列表
	$.ajax({
		type: "POST",
		url: "http://www.decaihui.com/wxmgmt/api/dailyView/listDetailDailyViews/"+getEditDate()+".do",
		async: false,
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			$(".content_left tr:gt(0)").empty()
			for(var i = 0; i < data.data.length; i++) {
				if(data.data[i].status == 0) {
					var status = "待发布"
					statusClass = "statusClass0"
				} else if(data.data[i].status == 1) {
					var status = "已发布"
					statusClass = "statusClass1"
				} else if(data.data[i].status == 2) {
					var status = "待编辑"
					statusClass = "statusClass2"
				}
				var trs = "<tr data-id='" + data.data[i].id + "'>"
				trs += "<td><div class='circle1'><div class='circle2'></div></div></td>"
				trs += "<td>" + data.data[i].name + "</td>"
				trs += "<td class='" + statusClass + "'>" + status + "</td>"
				trs += "<td><span class='edit'>编辑</span> <span class='del'>删除</span></td>"
				trs += "</tr>"
				$(".content_left").append($(trs))
			}
		}
	});

	$("table tr:first-child .circle1").click(function() {
		if($(this).find("div[class='circle2']").is(":visible")) {
			$("table .circle2").hide()
		} else {
			$("table .circle2").show()
		}
	})
	$("table tr:gt(0) .circle1").each(function() {
		$(this).click(function() {
			if($(this).find("div[class='circle2']").is(":visible")) {
				$(this).find("div[class='circle2']").hide()
				$("table tr:first-child .circle2").hide()
			} else {
				$(this).find("div[class='circle2']").show()
			}
		})
	})
	//左侧列表删除按钮
	$(".content_left .del").each(function() {
		$(this).click(function() {
			$.ajax({
				type: "POST",
				url: "http://www.decaihui.com/wxmgmt/api/dailyView/deleteDailyView/" + $(this).parent().parent().data("id") + ".do",
				async: true,
				contentType: "application/json",
				xhrFields: {
					withCredentials: true
				},
				success: function(data) {
					window.location.reload()
				}
			});
		})
	})
	//批量发布
	$(".publish").click(function() {
		var dailyViewIds=[]
		$(".content_left tr:gt(0) .circle2:visible").each(function(){
			dailyViewIds.push($(this).parent().parent().parent().data("id"))
		})
		var publishObj={
			status:1,
			dailyViewIds:dailyViewIds
		}
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/dailyView/changeDailyViewStatus.do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			data:JSON.stringify(publishObj),
			success: function(data) {
				if(data.code=="000"){
					alert("发布成功")
					window.location.reload()
				}else{
					alert("发布失败，错误代码"+data.code)	
				}
			}
		});
	})

	//编辑或保存小贴士
	$(".plan textarea").val("")
	$(".plan textarea").keyup(function() {
		$(".plan .currentCount").html($(this).val().length)
	})
	$(".wysiwyg-editor").keyup(function() {
		if($(this).text().length > 60) {
			$(this).text(($(this).text().substring(0, 60)));
		}
		$(".content_right .currentCount").html($(this).text().length)
	})
	//获取小贴士内容
	function getEditDate() {
		if(sessionStorage.getItem("editDate")==""||sessionStorage.getItem("editDate")==null||sessionStorage.getItem("editDate")==undefined){
			var today = new Date()
			var y = today.getFullYear()
			var m = today.getMonth() + 1
			if(m < 10) {
				m = "0" + m
			}
			var d = today.getDate()
			if(d<10){
				d="0"+d
			}
			return y.toString() + m.toString() + d.toString()
		}else{
			return sessionStorage.getItem("editDate")
		}	
	}
	var tipId = null //判断是否新增小贴士
	$.ajax({
		type: "POST",
		url: "http://www.decaihui.com/wxmgmt/api/dailyView/getDailyViewGuide/" + getEditDate() + ".do",
		async: true,
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			if(data.data.length != 0||data.data!=null) {
				tipId = data.data.id
				ue.setContent(data.data.guide)
			} else {
				ue.setContent("")
			}
		}
	})

	//小贴士保存
	$(".tip_save").click(function() {
		var tipObj = {
			id: tipId,
			guide: ue.getContent(),
			viewDate: getEditDate(),
		}
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/dailyView/saveOrUpdateDailyViewGuide.do",
			async: true,
			contentType: "application/json",
			data: JSON.stringify(tipObj),
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				if(data.code == "000") {
					alert("小贴士保存成功")
				} else {
					alert("保存失败，错误代码" + data.code+",文本格式有误")
					window.location.reload()
				}
			}
		})
	})
	positionCondition = null //持仓情况	
	var viewId = null //判断是否新增小贴士
	//第一步编辑或修改保存	
	//新建
	$(".newAdd").click(function() {
		$(".content").hide()
		$(".editStep").show()
		$(".edit_title div:first-of-type").html("新建")
		$(".top_notice span").html("分析师列表是发布当日内容。")
		$(".nav .btn").hide()
		viewId = null
	})
	$(".content_left .edit").each(function() {
		$(this).click(function() {
			$(".content").hide()
			$(".editStep").show()
			$(".edit_title div:first-of-type").html("编辑分析师")
			viewId = $(this).parent().parent().data("id")
			$(".nav .btn").hide()
			//获取卡片基本信息,获取每日观点
			$.ajax({
				type: "POST",
				url: "http://www.decaihui.com/wxmgmt/api/dailyView/getDailyView/" + viewId + ".do",
				async: true,
				contentType: "application/json",
				xhrFields: {
					withCredentials: true
				},
				success: function(data) {
					var newContent = JSON.parse(data.data.content)
					$(".analystName").val(newContent.analystName),
						$(".box_bottom p:first-of-type img[data-position='" + newContent.positionCondition + "']").css("opacity", "1")
					$(".analyst_startBalance").val(newContent.startBalance),
						$(".analyst_startDate").val(newContent.startDate),
						$(".analyst_currentBalance").val(newContent.currentBalance),
						$(".analyst_currentDate").val(newContent.currentDate),
						$(".analyst_profitRatio input").val(newContent.profitRatio),
						$(".analyst_yearProfitRatio input").val(newContent.yearProfitRatio),
						$(".analyst_plan").val(newContent.plan)
				}
			})
		})
	})
	$(".box_bottom p:first-of-type img").each(function() {
		$(this).click(function() {
			$(".box_bottom p:first-of-type img").css("opacity", "0.4")
			$(this).css("opacity", "1")
		})
	})

	//	保存第一步卡片内容
	function cardSave() {
		$(".box_bottom p:first-of-type img").each(function() {
			if($(this).css("opacity") == "1") {
				positionCondition = $(this).data("position")
			}
		})
		cardContent = {
			analystName: $(".analystName").val(),
			positionCondition: positionCondition,
			startBalance: $(".analyst_startBalance").val(),
			startDate: $(".analyst_startDate").val(),
			currentBalance: $(".analyst_currentBalance").val(),
			currentDate: $(".analyst_currentDate").val(),
			profitRatio: $(".analyst_profitRatio input").val(),
			yearProfitRatio: $(".analyst_yearProfitRatio input").val(),
			plan: $(".analyst_plan").val()
		}
		var cardObj = {
			id: viewId,
			status: 0,
			name: $(".analystName").val(),
			isDisplay: 0,
			content: JSON.stringify(cardContent),
			viewDate: getEditDate(),
		}
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/dailyView/saveOrUpdateDailyView.do",
			async: false,
			contentType: "application/json",
			data: JSON.stringify(cardObj),
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				viewId = data.data
			}
		})
	}

	//第二步编辑或修改保存
	$(".next").click(function() {
		cardSave()
		$(".firstStep_box").hide()
		$(".secondStep_box").show()
		$(".delLabel").show()
		$(".top_notice span").html("点击“+”创建今日标的物。")
		//获取具体每日观点
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/dailyView/listDailyViewAnalysis/" + viewId + ".do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				$(".labelUl li[data-matchid]").remove()
				$(".textareaUl li[data-matchid]").remove()
				for(var i = 0; i < data.data.length; i++) {
					var newLabel = ""
					newLabel += "<li data-matchid=''>"
					newLabel += "<span class='labelName'>" + data.data[i].title + "</span>"
					newLabel += "<div class='deltab'><span class='iconfont'>&#xe608;</span></div>"
					newLabel += "</li>"
					$(newLabel).insertBefore($(".createLabel"))
					var newTextarea = ""
					newTextarea += "<li data-matchid=''>"
					newTextarea += "<textarea class='analystView' placeholder='请在此输入...'></textarea>"
					newTextarea += "<textarea class='suggests' placeholder='请在此输入...'></textarea>"
					newTextarea += "</li>"
					$(newTextarea).insertBefore($(".defaultTextarea"))
					$(".defaultTextarea").prev().find("textarea[class='analystView']").val(data.data[i].situationAnalysis)
					$(".defaultTextarea").prev().find("textarea[class='suggests']").val(data.data[i].futureAnalysis)
				}
				$(".labelUl li[data-matchid]:first").addClass("label_on")
				$(".textareaUl li").hide()
				$(".textareaUl li[data-matchid]:first").show()
				selectLabel()
				delLabel()
			}
		});
	})
	$(".prev").click(function() {
		$(".firstStep_box").show()
		$(".secondStep_box").hide()
		$(".delLabel").hide()
	})
	$(".secondStep_bottom>ul>li").each(function() {
		$(this).keyup(function() {
			$(".secondStep_bottom .currentCount").html($(".analystView").val().length + $(".suggests").val().length)
		})
	})

	//新增标签和对应的文本域
	$(".newLabel").click(function() {
		$(".createLabel").show()
		$(".createLabel input").val("")
		$(".createLabel input").focus()
		$(".labelUl li[data-matchid]").removeClass()
		var newTextarea = ""
		newTextarea += "<li data-matchid=''>"
		newTextarea += "<textarea class='analystView' placeholder='请在此输入...'></textarea>"
		newTextarea += "<textarea class='suggests' placeholder='请在此输入...'></textarea>"
		newTextarea += "</li>"
		$(newTextarea).insertBefore($(".defaultTextarea"))
		$(".textareaUl li").hide()
		$(".textareaUl li:nth-last-child(2)").show()
	})
	$(".createLabel input").blur(function() {
		$(".createLabel").hide()
		var newLabel = ""
		newLabel += "<li data-matchid=''>"
		newLabel += "<span class='labelName'>" + $(".createLabel input").val() + "</span>"
		newLabel += "<div class='deltab'><span class='iconfont'>&#xe608;</span></div>"
		newLabel += "</li>"
		$(newLabel).insertBefore($(".createLabel"))
		$(".labelUl li[data-matchid]").removeClass()
		$(".labelUl li[data-matchid]:last").addClass("label_on")
		selectLabel()
		delLabel()
	})

	function selectLabel() {
		$(".labelUl li[data-matchid]").each(function(i) {
			$(this).click(function() {
				$(".labelUl li[data-matchid]").removeClass("label_on")
				$(this).addClass("label_on")
				$(".textareaUl li").hide()
				$(".textareaUl li").eq(i).show()
			})
		})
	}
	//删除标签
	$(".delLabel").click(function(e) {
		$(".deltab").show()
		e.stopPropagation()
	})

	function delLabel() {
		$(".deltab").each(function(i) {
			$(this).click(function(e) {
				e.stopPropagation()
				$(this).parent().remove()
				$(".textareaUl li").eq(i).remove()
				$(".labelUl li[data-matchid]").removeClass("label_on")
				$(".labelUl li[data-matchid]").eq(0).addClass("label_on")
				$(".textareaUl li[data-matchid]").hide()
				$(".textareaUl li[data-matchid]:first").show()
				if($(".labelUl li[data-matchid]").length == 0) {
					$(".defaultTextarea").show()
				}
			})
		})
	}
	$(document).click(function() {
		$(".deltab").hide()
		selectLabel()
	})
	//编辑或保存，具体观点分析，标签和对应文本域
	$(".comment_save").click(function() {
		dailyViewAnalysisArray = []
		$(".labelUl li[data-matchid]").each(function(i) {
			var situationAnalysis = $(".textareaUl li[data-matchid]").eq(i).find("textarea[class='analystView']").val()
			var futureAnalysis = $(".textareaUl li[data-matchid]").eq(i).find("textarea[class='suggests']").val()
			var labelObj = {
				title: $(this).find("span[class='labelName']").html(),
				situationAnalysis: situationAnalysis,
				futureAnalysis: futureAnalysis
			}
			dailyViewAnalysisArray.push(labelObj)
		})
		specificObj = {
			dailyViewId: viewId,
			dailyViewAnalysisArray: dailyViewAnalysisArray
		}
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/dailyView/batchSaveDailyViewAnalysis.do",
			async: true,
			contentType: "application/json",
			data: JSON.stringify(specificObj),
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				if(data.code == "000") {
					alert("具体观点分析保存成功")
					window.location.reload()
				} else {
					alert("保存失败，错误代码" + data.code)
				}
			}
		})
	})
	
	//编辑小贴士
	//编辑器配置
	var ue = UE.getEditor('test', {
		toolbars: [
			['source', 'undo', '|', 'bold', 'italic', 'underline', '|', 'fontfamily', '|', 'fontsize', '|','indent', 'forecolor', '|', 'removeformat', 'formatmatch', '|', 'justifyleft', 'justifyright', 'justifycenter', 'justifyjustify']
		],
		elementPathEnabled: false,
		wordCount: false,
		autoHeightEnabled: false
	});
})