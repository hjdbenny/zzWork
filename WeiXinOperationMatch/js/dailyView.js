$(function() {
	$(".nav li:first-child").click(function() {
		$(".nav li").removeClass("on")
		$(this).addClass("on")
		$("#wrapper1").show()
		$("#wrapper2").hide()
	})
	$(".nav li:last-child").click(function() {
		$(".nav li").removeClass("on")
		$(this).addClass("on")
		$("#wrapper2").show()
		$("#wrapper1").hide()
		cxPublishedDate()
	})

	function getDate() {
		var today = new Date()
		var y = today.getFullYear()
		var m = today.getMonth() + 1
		if(m < 10) {
			m = "0" + m
		}
		var d = today.getDate()
		if(d < 10) {
			d = "0" + d
		}
		return y.toString() + m.toString() + d.toString()
	}
	if(sessionStorage.getItem("cxDate") == null || sessionStorage.getItem("cxDate") == "" || sessionStorage.getItem("cxDate") == undefined) {
		cxDate = getDate()
	} else {
		cxDate = sessionStorage.getItem("cxDate")
	}
	viewDate = cxDate.substring(0, 4) + "-" + cxDate.substring(4, 6) + "-" + cxDate.substring(6, 8)
	$(".title").html(viewDate)
	//获取今日观点
	$.ajax({
		type: "POST",
		url: `http://www.decaihui.com/wxdch/api/dailyView/listReleasedDisplayDailyViews/${cxDate}.do`,
		contentType: "application/json",
		async: false,
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			loadCardData(data.data)
		}
	});
	//加载卡片数据
	function loadCardData(arr) {
		arr.reverse()
		$(".swiper-wrapper").empty()
		for(var i = 0; i < arr.length; i++) {
			var newContent = JSON.parse(arr[i].content)
			if(newContent.positionCondition == 0) {
				imgSrc = "img/more.png"
			} else if(newContent.positionCondition == 1) {
				imgSrc = "img/empty.png"
			} else if(newContent.positionCondition == 2) {
				imgSrc = "img/flat.png"
			}
			var lis = ""
			lis += "<li class='swiper-slide' data-id='" + arr[i].id + "'>"
			lis += "<div class='box_top'>"
			lis += "<div class='wave -one'></div>"
			lis += "<div class='wave -two'></div>"
			lis += "<div class='analystTitle'>"
			lis += "<p>模拟分析师</p>"
			lis += "<p class='analystName'>" + newContent.analystName + "</p>"
			lis += "<img src='img/rotate.png' class='analyst_level_bg' />"
			lis += "<img src='img/expert.png' class='analyst_level' />"
			lis += "</div>"
			lis += "</div>"
			lis += "<div class='box_bottom'>"
			lis += "<p>模拟盘持仓情况：<img src='" + imgSrc + "'/></p>"
			lis += "<p>初始资金：<span class='money zj'>" + newContent.startBalance + "</span>&nbsp;<span class='pzh'>---</span>&nbsp;<span class='date'>" + newContent.startDate + "</span></p>"
			lis += "<p>当前市值：<span class='money sz'>" + newContent.currentBalance + "</span>&nbsp;<span class='pzh'>---</span>&nbsp;<span class='date'>" + newContent.currentDate + "</span></p>"
			lis += "<p class='profitRatio bg'>" + newContent.profitRatio + "</p>"
			lis += "<p>收益率</p>"
			lis += "<p class='yearProfitRatio bg'>" + newContent.yearProfitRatio + "</p>"
			lis += "<p>预期年化</p>"
			lis += "<div class='plan'>"
			lis += "<span class='plan_title'>计划概况：</span><br>"
			lis += "<span>" + newContent.plan + "</span>"
			lis += "</div>"
			lis += "</div>"
			lis += "</li>"
			$(".swiper-wrapper").append($(lis))
			$(".profitRatio").eq(i).css("background", "linear-gradient(to right,#f37223 0%,#dfdfe5 " + $(".profitRatio").eq(i).text() + ")")
			$(".yearProfitRatio").eq(i).css("background", "linear-gradient(to right,#f37223 0%,#dfdfe5 " + $(".yearProfitRatio").eq(i).text() + ")")
		}
		//		console.log(mySwiper)
		mySwiper = new Swiper('.swiper-container', {
			centeredSlides: true,
			spaceBetween: 20,
			slidesPerView: "auto"
		})
	}

	//加载小贴士
	getTips(cxDate)

	function getTips(strDate) {
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxdch/api/dailyView/getDailyViewGuide/" + strDate + ".do",
			contentType: "application/json",
			async: false,
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				if(data.data != null) {
					$("#tip").html(data.data.guide)
				}
			}
		});
	}

	//	/历史部分/
	/*日期插件事件*/
	$("#datepicker").datepicker({
		//		changeMonth: true,
		//		changeYear: true,
		prevText: '< 上月',
		prevStatus: '显示上月',
		prevBigText: '<<',
		prevBigStatus: '显示上一年',
		nextText: '下月>',
		nextStatus: '显示下月',
		nextBigText: '>>',
		nextBigStatus: '显示下一年',
		currentText: '今天',
		currentStatus: '显示本月',
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
		dateFormat: 'yy-mm-dd'
	});

	function tz() {
		$(".swiper-wrapper>li").each(function() {
			$(this).click(function() {
				sessionStorage.setItem("viewId", $(this).data("id"))
				sessionStorage.setItem("viewDate", viewDate)
				sessionStorage.setItem("analystName", $(this).find("p[class='analystName']").html())
				window.location.href = "http://www.decaihui.com/wxdch/dailyView_detials.html"
			})
		})
	}
	tz()

	var currentY = $("#datepicker").datepicker("getDate").getFullYear()
	var currentM = $("#datepicker").datepicker("getDate").getMonth() + 1
	$("#date").html(currentY + "-" + currentM)

	var calendar = new datePicker();
	calendar.init({
		'trigger': '#selectDate',
		/*按钮选择器，用于触发弹出插件*/
		'type': 'ym',
		/*模式：date日期；datetime日期时间；time时间；ym年月；*/
		//		'minDate': '2017-06-01',
		/*最小日期*/
		//		'maxDate': getNowFormatDate(),
		/*最大日期*/
		'onSubmit': function() { /*确认时触发事件*/
			var theSelectData = calendar.value;
			$("#datepicker").datepicker('setDate', theSelectData + "-01")
			$("#date").html(theSelectData.substring(0, 7))
			$(".nav li:last-child").trigger("click")
			cxPublishedDate()
		},
		'onClose': function() { /*取消时触发事件*/ }
	});
	//查找某月已发布的每日观点日期
	function cxPublishedDate() {
		strDate = $("#date").html().substring(0, 4) + $("#date").html().substring(5, 7)
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxdch/api/dailyView/listReleasedDisplayViewDates/" + strDate + ".do",
			contentType: "application/json",
			async: false,
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				dateArr = []
				for(var i = 0; i < data.data.length; i++) {
					dateArr.push(parseInt(data.data[i].substring(6)).toString())
				}
				$("#datepicker").find("a").each(function() {
					for(var i = 0; i < dateArr.length; i++) {
						if($(this).html() == dateArr[i]) {
							$(this)[0].classList.add("dateSelected")
						}
					}
				})
			}
		});
		$("#datepicker td a").each(function() {
			$(this).click(function(e) {
				e.stopPropagation()
				e.preventDefault()
				if($(this).hasClass("dateSelected")) {
					var selectDay = parseInt($(this).html())
					if(selectDay < 10) {
						selectDay = "0" + selectDay
					} else {
						selectDay = selectDay.toString()
					}
					selectDate = $("#date").html().substring(0, 4) + $("#date").html().substring(5, 7) + selectDay
					sessionStorage.setItem("cxDate", selectDate)
					window.location.reload()
				}
			})
		})
	}
	$("#datepicker table,#datepicker table tr").click(function(e) {
		e.stopPropagation()
		e.preventDefault()
	})

})