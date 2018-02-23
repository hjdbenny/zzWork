var app = angular.module("personalReport", [])
app.controller("reportController", operation).filter(
	'to_trusted', ['$sce', function($sce) {
		return function(text) {
			return $sce.trustAsHtml(text);
		}
	}]
)

function operation($scope, $http, $interval) {

	/*数字每隔3位，添加逗号*/
	function format_number(str) {
		var newStr = "";
		var count = 0;
		str = str.toString()
		if(str.indexOf(".") == -1) {
			for(var i = str.length - 1; i >= 0; i--) {
				if(count % 3 == 0 && count != 0) {
					newStr = str.charAt(i) + "," + newStr;
				} else {
					newStr = str.charAt(i) + newStr;
				}
				count++;
			}
			str = newStr + ".00"; //自动补小数点后两位
		} else {
			for(var i = str.indexOf(".") - 1; i >= 0; i--) {
				if(count % 3 == 0 && count != 0) {
					newStr = str.charAt(i) + "," + newStr;
				} else {
					newStr = str.charAt(i) + newStr; //逐个字符相接起来
				}
				count++;
			}
			str = newStr + (str + "00").substr((str + "00").indexOf("."), 3);
		}
		return str
	}
	//获取url中的参数
	function getUrlParam(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
		var r = window.location.search.substr(1).match(reg); //匹配目标参数
		if(r != null) return unescape(r[2]);
		return null; //返回参数值
	}

	urlArr = location.href.split("/")
	if(location.href.indexOf("/vip/") == -1) {
//		$scope.openID = urlArr[urlArr.length - 3]
//		$scope.effectiveTime = urlArr[urlArr.length - 2] //链接有效时间
//		//获取clientcode
//		$.ajax({
//			type: "post",
//			url: "http://www.decaihui.com/wxdch/api/total/investorId/" + $scope.openID + ".do ",
//			async: false,
//			success: function(data) {
//				$scope.investorId = data.data
//				$scope.date = urlArr[urlArr.length - 1].substring(0, urlArr[urlArr.length - 1].indexOf(".do"))
//				cxMonth = urlArr[urlArr.length - 1].substring(0, urlArr[urlArr.length - 1].indexOf(".do")).substring(0, 4) + "-" + urlArr[urlArr.length - 1].substring(0, urlArr[urlArr.length - 1].indexOf(".do")).substring(4, 6)
//			}
//		});
		sessionStorage.setItem("isVIP", "0")
	} else {
//		$scope.investorId = urlArr[urlArr.length - 5]
//		$scope.openID = urlArr[urlArr.length - 4]
//		$scope.date = urlArr[urlArr.length - 2]
//		$scope.effectiveTime = urlArr[urlArr.length - 3] //链接有效时间
//		cxMonth = urlArr[urlArr.length - 2].substring(0, 4) + "-" + urlArr[urlArr.length - 2].substring(4, 6)
		sessionStorage.setItem("isVIP", "1")
	}
	
	$.ajax({
		type: "POST",
		url: `http://www.decaihui.com/wxdch/api/dctotal/investorId/${urlArr[urlArr.length-2]}.do`,
		async: false,
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			$scope.investorId = data.data
		}
	})
	$scope.date = urlArr[urlArr.length-1].split(".")[0]
	cxMonth = urlArr[urlArr.length-1].split(".")[0]
	var obj = {
		investorId: $scope.investorId,
		month: cxMonth
	}
	function dateFormat(str){//格式化日期“yyyy-mm-dd”
		str=`${str.substring(0,4)}-${str.substring(4,6)}-${str.substring(6,8)}`
		return str
	}
	function judgeColor(data) {
		if(data >= 0) {
			$scope.isPositive = true
			$scope.isNegative = false
		} else {
			$scope.isPositive = false
			$scope.isNegative = true
		}
	}

	function judgeBgColor(data) {
		if(data >= 0) {
			var yColor = "#ff4342"
		} else {
			var yColor = "18c4b4"
		}
		return yColor;
	}
	//第一页数据
	//	用户个人信息
	$.ajax({
		type: "POST",
		url: `http://www.decaihui.com/wxdch/api/dcmonth/dcUserInfo.do`,
		async: true,
		data: JSON.stringify(obj),
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			$scope.khName = data.data.user.clientName
			$scope.account = data.data.user.investorId
			$scope.initialEntry = `&yen;  ${format_number(data.data.initialBalance)}` //初始入金
			$scope.monthStart_balance = `&yen; ${format_number(data.data.monthStartBalance)}` //月初权益
			$scope.monthEnd_balance = `&yen; ${format_number(data.data.monthEndBalance)}` //月末权益
			judgeColor(data.data.monthStartBalance)
			judgeColor(data.data.monthEndBalance)
			$scope.rank = data.data.monthRank
			$scope.currentTime = dateFormat(data.data.updateTime) 
			$scope.openTime = dateFormat(data.data.openTime)
			$scope.sumDays = data.data.sumDays
			$scope.number = "JY" + data.data.user.groupId
			if(data.data.rankChange >= 0) {
				$(".change_icon").attr("src", "http://www.decaihui.com/wxdch/img/up.png")
				$scope.rank_change = data.data.rankChange
			} else {
				$(".change_icon").attr("src", "http://www.decaihui.com/wxdch/img/down.png")
				$scope.rank_change = Math.abs(data.data.rankChange)
			}
			$scope.monthProfit = (parseFloat(data.data.monthProfitRatio) * 100).toFixed(2) + "%"
			$scope.total_profitRatio = (parseFloat(data.data.yearProfitRatio) * 100).toFixed(2) + "%"	
			$(".monthProfit").css("background", `linear-gradient(to right, ${judgeBgColor(data.data.monthProfitRatio)} 0%, #dfdfe5 ${$scope.monthProfit})`)
			$(".total_profitRatio").css("background", `linear-gradient(to right, ${judgeBgColor(data.data.yearProfitRatio)} 0%, #dfdfe5 ${$scope.total_profitRatio})`)
			$scope.$digest()
		}
	});

	//	$(".content a").css("margin-top", $(".charts").height() - 40)
	sessionStorage.setItem("investorId", $scope.investorId)
//	sessionStorage.setItem("openId", $scope.openID)
//	sessionStorage.setItem("effectiveTime", $scope.effectiveTime)
	sessionStorage.setItem("date", $scope.date)
	sessionStorage.setItem("month", cxMonth)
	$(".more").click(function(e) {
		e.preventDefault()
		window.location.href = `http://www.decaihui.com/wxdch/personalData_more.html?timestamp=${new Date().getTime()}&isChild=true`
	})
	//曲线图
	var chartObj = {
		investorId: $scope.investorId,
		dateType: 6,
		type: 1,
		order: 1
	}
	$.ajax({
		type: "POST",
		url: `http://www.decaihui.com/wxdch/api/dctotal/profitAndLossCurve.do`,
		async: true,
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		data: JSON.stringify(chartObj),
		success: function(data) {
			chartArr = []
			for(var i = 0; i < data.data.length; i++) {
				y = parseInt(data.data[i].tradingDay.substring(0, 4))
				m = parseInt(data.data[i].tradingDay.substring(4,6)) - 1
				d = parseInt(data.data[i].tradingDay.substring(6, 8))
				var totalProfit = parseFloat((parseFloat(data.data[i].totalProfit)).toFixed(2))
				chartArr.push([Date.UTC(y, m, d), totalProfit])
			}
			
			fh = "%"
			$(".qxt").highcharts({
				chart: {
					type: 'area',
					zoomType: 'x',
					marginTop: 1,
					spacing: [0, 0, 10, 0]
				},
				title: {
					text: ''
				},
				xAxis: {
					type: 'datetime',
					crosshair: true,
					dateTimeLabelFormats: {
						millisecond: '%H:%M:%S.%L',
						second: '%H:%M:%S',
						minute: '%H:%M',
						hour: '%H:%M',
						day: '%m-%d',
						week: '%m-%d',
						month: '%Y-%m',
						year: '%Y'
					},
					lineColor: '#ffbc74',
					labels: {
						style: {
							fontSize: "1rem"
						},
						y: 35,
						step: 1
					},
					reversed: true
				},
				tooltip: {
					dateTimeLabelFormats: {
						millisecond: '%H:%M:%S.%L',
						second: '%H:%M:%S',
						minute: '%H:%M',
						hour: '%H:%M',
						day: '%Y-%m-%d',
						week: '%m-%d',
						month: '%Y-%m',
						year: '%Y'
					},
					useHTML: true, //自定义提示框
					headerFormat: '<span style="font-size: 1rem">{point.key}</span><br/>',
					style: {
						padding: 10,
						fontSize: "1rem"
					},

				},
				yAxis: {
					title: {
						text: ''
					},

					showFirstLabel: false,
					crosshair: true,
					labels: { //y轴刻度文字标签  
						formatter: function() {
							return this.value.toFixed(0);
						},
						style: {
							fontSize: "1rem"
						}
					}
				},
				legend: {
					enabled: false
				},
				credits: {
					enabled: false //右下角图表版权信息不显示  
				},
				plotOptions: {
					area: {
						fillColor: {
							linearGradient: {
								x1: 0,
								y1: 0,
								x2: 0,
								y2: 1
							},
							stops: [
								[0, "#ffbc74"],
								[1, "#ffffff"]
							]
						},
						marker: {
							radius: 2
						},
						lineColor: "#ffbc74",
						lineWidth: 1,
						states: {
							hover: {
								lineWidth: 2
							}
						},
						threshold: null
					},
					line: {
						marker: {
							enabled: true
						}
					}
				},
				series: [{
					type: 'area',
					name: "每日盈亏",
					data: chartArr,
					color: "#ffbc74"
				}],
				exporting: { //去除打印
					enabled: false
				}
			});
		}
	});
	//获取文字内容数据
	var reportObj = {
		investorId: $scope.investorId,
		date: $scope.date
	}
	$.ajax({
		type: "POST",
		url: "http://www.decaihui.com/wxdch/api/personal/getMyMonthlyReport.do",
		async: false,
		contentType: "application/json",
		data: JSON.stringify(reportObj),
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			if(data.data.report == undefined || data.data.report == "" || data.data.report == null) {
				$(".bg2").hide()
			} else {
				var newData = JSON.parse(data.data.report.content)
				//第二页
				$scope.mainContract = newData.mainContract
				$scope.maxDeficit = newData.maxDeficit
				$scope.maxTitle = newData.maxTitle
				$scope.tradeDirection = newData.tradeDirection
				$scope.totalComment = newData.totalComment
				$scope.comment3 = newData.comment3
			}

			//第三页
			$('.roundabout_box>ul').roundabout({
				minScale: 0.6,
				autoplay: false,
				minOpacity: 0,
				maxOpacity: 1,
				reflect: true,
				startingChild: 0,
				enableDrag: true,
				dropCallback: function() {
					var index = $(".roundabout-in-focus").data("order") - 1
					$(".showPage>li").removeClass("showPage_on")
					$(".showPage>li").eq(index).addClass("showPage_on")
				},
				clickToFocusCallback: function() {
					var index = $(".roundabout-in-focus").data("order") - 1
					$(".showPage>li").removeClass("showPage_on")
					$(".showPage>li").eq(index).addClass("showPage_on")
				}
			});
			if(data.data.template == undefined || data.data.template == "" || data.data.template == null) {
				$(".bg3").hide()
				$(".bg4").hide()
			} else {

				var moduleData = JSON.parse(data.data.template.content)

				$scope.analyst1 = moduleData.analyst1_name
				$scope.analyst1_startBalance = moduleData.analyst1_startBalance
				$scope.analyst1_endBalance = moduleData.analyst1_endBalance
				$scope.analyst1_tradeType = moduleData.analyst1_tradeType
				$scope.analyst1_tradeNum = moduleData.analyst1_tradeNum
				$scope.analyst1_yearProfitRatio = moduleData.analyst1_yearProfitRatio
				$scope.analyst1_winningRatio = moduleData.analyst1_winningRatio
				$(".analyst1 .percent li:first-child").css("background", "linear-gradient(to right, #ff4242 0%, #dfdfe5 " + getNum($scope.analyst1_yearProfitRatio) + ")")
				$(".analyst1 .percent li:nth-child(3)").css("background", "linear-gradient(to right, #ff4242 0%, #dfdfe5 " + getNum($scope.analyst1_winningRatio) + ")")
				$scope.analyst1_monthProfitRatio = moduleData.analyst1_monthProfitRatio
				$scope.analyst1_totalProfitRatio = moduleData.analyst1_totalProfitRatio
				$(".analyst1_monthProfitRatio").html($scope.analyst1_monthProfitRatio)
				$(".analyst1_totalProfitRatio").html($scope.analyst1_totalProfitRatio)
				charts($(".analystMonthProfitRatio1"), parseFloat(getNum($scope.analyst1_monthProfitRatio)) / 100)
				charts($(".analystTotalProfitRatio1"), parseFloat(getNum($scope.analyst1_totalProfitRatio)) / 100)

				$scope.analyst2 = moduleData.analyst2_name
				$scope.analyst2_startBalance = moduleData.analyst2_startBalance
				$scope.analyst2_endBalance = moduleData.analyst2_endBalance
				$scope.analyst2_tradeType = moduleData.analyst2_tradeType
				$scope.analyst2_tradeNum = moduleData.analyst2_tradeNum
				$scope.analyst2_yearProfitRatio = moduleData.analyst2_yearProfitRatio
				$scope.analyst2_winningRatio = moduleData.analyst2_winningRatio
				$(".analyst2 .percent li:first-child").css("background", "linear-gradient(to right, #ff4242 0%, #dfdfe5 " + getNum($scope.analyst2_yearProfitRatio) + ")")
				$(".analyst2 .percent li:nth-child(3)").css("background", "linear-gradient(to right, #ff4242 0%, #dfdfe5 " + getNum($scope.analyst2_winningRatio) + ")")
				$scope.analyst2_monthProfitRatio = moduleData.analyst2_monthProfitRatio
				$scope.analyst2_totalProfitRatio = moduleData.analyst2_totalProfitRatio
				$(".analyst2_monthProfitRatio").html($scope.analyst2_monthProfitRatio)
				$(".analyst2_totalProfitRatio").html($scope.analyst2_totalProfitRatio)
				charts($(".analystMonthProfitRatio2"), parseFloat(getNum($scope.analyst2_monthProfitRatio)) / 100)
				charts($(".analystTotalProfitRatio2"), parseFloat(getNum($scope.analyst2_totalProfitRatio)) / 100)

				$scope.analyst3 = moduleData.analyst3_name
				$scope.analyst3_startBalance = moduleData.analyst3_startBalance
				$scope.analyst3_endBalance = moduleData.analyst3_endBalance
				$scope.analyst3_tradeType = moduleData.analyst3_tradeType
				$scope.analyst3_tradeNum = moduleData.analyst3_tradeNum
				$scope.analyst3_yearProfitRatio = moduleData.analyst3_yearProfitRatio
				$scope.analyst3_winningRatio = moduleData.analyst3_winningRatio
				$(".analyst3 .percent li:first-child").css("background", "linear-gradient(to right, #ff4242 0%, #dfdfe5 " + getNum($scope.analyst3_yearProfitRatio) + ")")
				$(".analyst3 .percent li:nth-child(3)").css("background", "linear-gradient(to right, #ff4242 0%, #dfdfe5 " + getNum($scope.analyst3_winningRatio) + ")")
				$scope.analyst3_monthProfitRatio = moduleData.analyst3_monthProfitRatio
				$scope.analyst3_totalProfitRatio = moduleData.analyst3_totalProfitRatio
				$(".analyst3_monthProfitRatio").html($scope.analyst3_monthProfitRatio)
				$(".analyst3_totalProfitRatio").html($scope.analyst3_totalProfitRatio)
				charts($(".analystMonthProfitRatio3"), parseFloat(getNum($scope.analyst3_monthProfitRatio)) / 100)
				charts($(".analystTotalProfitRatio3"), parseFloat(getNum($scope.analyst3_totalProfitRatio)) / 100)
				$(".roundabout-holder>li").on("dragend", function() {})
				//画圆环
				function charts(elem, val) {
					elem.circleProgress({
						value: val,
						emptyFill: "#e7e7eb", //圆环背景色
						size: elem.width(),
						fill: {
							color: '#f58d35'
						},
						animation: {
							duration: 1000,
							easing: 'linear'
						},
						thickness: '10',
						lineCap: "round"
					})
				}
				//第四页
				$scope.total_tradeType = moduleData.total_tradeType
				$scope.total_tradeNum = moduleData.total_tradeNum
				$scope.total_startBalance = moduleData.total_startBalance
				$scope.total_endBalance = moduleData.total_endBalance
				$scope.total_monthProfitRatio = moduleData.total_monthProfitRatio
				$scope.total_totalProfitRatio = moduleData.total_totalProfitRatio
				$(".total_percent li:first-child").css("background", "linear-gradient(to right, #ff4242 0%, #dfdfe5 " + getNum($scope.total_monthProfitRatio) + ")")
				$(".total_percent li:nth-child(3)").css("background", "linear-gradient(to right, #ff4242 0%, #dfdfe5 " + getNum($scope.total_totalProfitRatio) + ")")
				$scope.total_YearProfitRatio = moduleData.total_YearProfitRatio
				$scope.total_WinningRatio = moduleData.total_WinningRatio
				$(".total_YearProfitRatio").html($scope.total_YearProfitRatio)
				$(".total_WinningRatio").html($scope.total_WinningRatio)
				charts($(".totalYearProfitRatio"), parseFloat(getNum($scope.total_YearProfitRatio)) / 100)
				charts($(".totalWinningRatio"), parseFloat(getNum($scope.total_WinningRatio)) / 100)
			}
			//获取数值，百分比
			function getNum(text) {
				var len1 = text.indexOf("%") + 1
				var str = text.slice(0, len1)
				var len2 = str.lastIndexOf(">") + 1
				var value = text.slice(len2, len1)
				return value
			}
		},
		error:function(){
			$(".bg2").hide()
			$(".bg3").hide()
			$(".bg4").hide()
		}
	});
	//第五页
	$.ajax({
		type: "POST",
		url: `http://www.decaihui.com/wxdch/api/dcmonth/topThree/${cxMonth}.do`,
		async: true,
		contentType: "application/json",
		success: function(data) {
			for(var i = 0; i < data.data.length; i++) {
				var lis = ""
				lis += "<li>"
				lis += "<div class='liLeft'><img src='http://www.decaihui.com/wxdch/img/" + (i + 1) + "ST.png'/></div>"
				lis += "<div class='liRight'>"
				lis += "<p>交易品种:&nbsp;<span>" + data.data[i].instrumentCode.join(" ") + "</span></p>"
				lis += "<p>交易次数:&nbsp;<span>" + data.data[i].monthTradeNum + "</span></p>"
				lis += "<p>月初权益:&nbsp;<span style='color: #ab8c5f;'>&yen; " + format_number(data.data[i].monthStartBalance) + "</span>&nbsp;&nbsp;月末权益:&nbsp;<span style='color: #ab8c5f;'>&yen; " + format_number(data.data[i].monthEndBalance) + "</span></p>"
				lis += "<ul class='liData'>"
				lis += "<li><span>月收益率</span><span>" + (data.data[i].monthProfitRatio * 100).toFixed(2) + "%</span></li>"
				lis += "<li><span>年化收益率</span><span>" + (data.data[i].yearProfitRatio * 100).toFixed(2) + "%</span></li>"
				lis += "<li><span>总收益率</span><span>" + (data.data[i].totalProfitRatio * 100).toFixed(2) + "%</span></li>"
				lis += "<li><span>胜算率</span><span>" + (data.data[i].winRatio * 100).toFixed(2) + "%</span></li>"
				lis += "</ul>"
				lis += "</div>"
				lis += "</li>"
				$(".rank_bottom").append($(lis))
				$(".liData li:nth-child(1)").css("background", "linear-gradient(to right, #ff4242  0%, #e7e7eb " + $(".liData li:nth-child(1) span:last-child").html() + ")")
				$(".liData li:nth-child(2)").css("background", "linear-gradient(to right, #ff4242  0%, #e7e7eb " + $(".liData li:nth-child(2) span:last-child").html() + ")")
				$(".liData li:nth-child(3)").css("background", "linear-gradient(to right, #f74047  0%, #e7e7eb " + $(".liData li:nth-child(3) span:last-child").html() + ")")
				$(".liData li:nth-child(4)").css("background", "linear-gradient(to right, #ff4242  0%, #e7e7eb " + $(".liData li:nth-child(4) span:last-child").html() + ")")

			}
			if(data.data[0].user.clientName==""){
				$scope.top1_name = "匿名"
			}else{
				$scope.top1_name = data.data[0].user.clientName
			}
			$scope.toP1_monthProfitRatio = (data.data[0].monthProfitRatio * 100).toFixed(2) + "%"
			if(data.data[1].user.clientName==""){
				$scope.top2_name = "匿名"
			}else{
				$scope.top2_name = data.data[1].user.clientName
			}
			$scope.toP2_monthProfitRatio = (data.data[1].monthProfitRatio * 100).toFixed(2) + "%"
			if(data.data[2].user.clientName==""){
				$scope.top3_name = "匿名"
			}else{
				$scope.top3_name = data.data[2].user.clientName
			}
			$scope.toP3_monthProfitRatio = (data.data[2].monthProfitRatio * 100).toFixed(2) + "%"

			$scope.$apply()
		}
	});
	$scope.totalSlider = $(".swiper-wrapper>li").length - 1
	var mySwiper = new Swiper('.swiper-container-father', {
		loop: false,
		direction: 'vertical',
		mousewheelControl: true,
		autoHeight: true,
		onSlideChangeStart: function(swiper) {
			if(swiper.activeIndex == $scope.totalSlider) { //切换结束时，告诉我现在是第几个slide
				mySwiper.lockSwipeToNext();
			} else {
				mySwiper.unlockSwipeToNext();
			}
			if(swiper.activeIndex == 0) { //首页
				mySwiper.lockSwipeToPrev();
			} else {
				mySwiper.unlockSwipeToPrev();
			}
		}
	});

}