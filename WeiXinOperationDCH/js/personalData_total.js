var app = angular.module("personalReport", [])
app.controller("reportController", operation).filter(
	'to_trusted', ['$sce', function($sce) {
		return function(text) {
			return $sce.trustAsHtml(text);
		}
	}]
)

function operation($scope, $http, $interval) {
	urlArr = location.href.split("/")
	if(location.href.indexOf("/vip/") == -1) {
		$scope.openID = urlArr[urlArr.length - 3]
		$scope.effectiveTime = urlArr[urlArr.length - 2] //链接有效时间
		//获取clientcode
		$.ajax({
			type: "post",
			url: `http://www.decaihui.com/wxweb/api/total/clientCode/${$scope.openID}.do `,
			async: false,
			success: function(data) {
				$scope.clientCode = data.data
				$scope.date = urlArr[urlArr.length - 1].substring(0, urlArr[urlArr.length - 1].indexOf(".do"))
				cxMonth = urlArr[urlArr.length - 1].substring(0, urlArr[urlArr.length - 1].indexOf(".do")).substring(0, 4) + "-" + urlArr[urlArr.length - 1].substring(0, urlArr[urlArr.length - 1].indexOf(".do")).substring(4, 6)
			}
		});
		sessionStorage.setItem("isVIP", "0")
	} else {
		var urlArr=window.location.href.split("/")
		$scope.clientCode = urlArr[urlArr.length-3]
		$scope.date = urlArr[urlArr.length-2]
		cxMonth = $scope.date.substring(0,4) + "-" + $scope.date.substring(4,6)
		sessionStorage.setItem("isVIP", "1")
	}

	var obj = {
		clientCode: $scope.clientCode,
		month: cxMonth
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
	//第一页数据
	//	用户个人信息
	$.ajax({
		type: "POST",
		url: "http://www.decaihui.com/wxweb/api/month/personalInfo.do",
		async: true,
		data: JSON.stringify(obj),
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			$scope.khName = data.data.name
			$scope.account = data.data.clientCode
			$scope.initialEntry = `&yen;  ${$.format_number(data.data.initialBalance)}` //初始入金
			$scope.monthStart_balance = `&yen; ${$.format_number(data.data.monthStartBalance)}` //月初权益
			$scope.monthEnd_balance = `&yen; ${$.format_number(data.data.monthEndBalance)}` //月末权益
			judgeColor(data.data.monthStartBalance)
			judgeColor(data.data.monthEndBalance)
			$scope.rank = data.data.monthRank
			$scope.currentTime = data.data.updateTime
			$scope.openTime = data.data.openTime
			$scope.sumDays = data.data.sumDays
			$scope.number = "JY" + data.data.userNo
			if(data.data.rankChange >= 0) {
				$(".change_icon").attr("src", "http://www.decaihui.com/wxweb/img/up.png")
				$scope.rank_change = data.data.rankChange
			} else {
				$(".change_icon").attr("src", "http://www.decaihui.com/wxweb/img/down.png")
				$scope.rank_change = Math.abs(data.data.rankChange)
			}

			$(".monthProfit").html((parseFloat(data.data.monthProfitRatio) * 100).toFixed(2) + "%")
			$(".totalProfit").html((parseFloat(data.data.yearProfitRatio) * 100).toFixed(2) + "%")

			if(parseFloat($(".monthProfit").html()) > 0) {
				monthColor = "#f69434"
				$(".monthProfit").css("color", "#f69434")
			} else {
				monthColor = "#28e89f"
				$(".monthProfit").css("color", "#28e89f")
			}
			if(parseFloat($(".totalProfit").html()) > 0) {
				totalColor = "#f69434"
				$(".totalProfit").css("color", "#f69434")
			} else {
				totalColor = "#28e89f"
				$(".totalProfit").css("color", "#28e89f")
			}
			$scope.$digest()
			//圆环
			$(".month_profitRatio").circleProgress({
				value: Math.abs(parseFloat($(".monthProfit").html()) / 100),
				emptyFill: "#e7e7e7", //圆环背景色
				size: $(".month_profitRatio").width(),
				fill: {
					color: monthColor
				},
				animation: {
					duration: 1000,
					easing: 'linear'
				},
				thickness: '10',
				lineCap: "round"
			})
			$(".total_profitRatio").circleProgress({
				value: Math.abs(parseFloat($(".totalProfit").html()) / 100),
				emptyFill: "#e7e7e7", //圆环背景色
				size: $(".total_profitRatio").width(),
				fill: {
					color: totalColor
				},
				animation: {
					duration: 1000,
					easing: 'linear'
				},
				thickness: '10',
				lineCap: "round"
			})
		}
	});

	sessionStorage.setItem("clientCode", $scope.clientCode)
	sessionStorage.setItem("openId", $scope.openID)
	sessionStorage.setItem("effectiveTime", $scope.effectiveTime)
	sessionStorage.setItem("date", $scope.date)
	sessionStorage.setItem("month", cxMonth)
	$(".more").click(function(e) {
		e.preventDefault()
		window.location.href = `http://www.decaihui.com/wxweb/personalData_more.html?timestamp=${new Date().getTime()}&isChild=true`
	})
	//曲线图
	$.ajax({
		type: "POST",
		url: `http://www.decaihui.com/wxweb/api/total/totalProfitRatioCurve/${$scope.clientCode}.do`,
		async: true,
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			chartArr = []
			for(var i = 0; i < data.data.length; i++) {
				y = parseInt(data.data[i].endDate.substring(0, 4))
				m = parseInt(data.data[i].endDate.substring(5, 7)) - 1
				d = parseInt(data.data[i].endDate.substring(8, 10))
				totalRatio = parseFloat((parseFloat(data.data[i].totalRatio) * 100).toFixed(2))
				chartArr.push([Date.UTC(y, m, d), totalRatio])
			}
			fh = "%"
			$(".qxt").highcharts({
				chart: {
					type: 'area',
					zoomType: 'x'
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
					lineColor: '#ffbc74'
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
					valueSuffix: fh,
					useHTML: true, //自定义提示框
					headerFormat: '<span style="font-size: 1rem">{point.key}</span><table>',
					pointFormat: '<tr><td>{series.name}: </td>' + '<td style="text-align: right"><b>{point.y}</b></td></tr>',
					footerFormat: '</table>',
					style: {
						padding: 10,
						fontSize: "1rem"
					},

				},
				yAxis: {
					title: {
						text: ''
					},
					crosshair: true,
					//					tickPixelInterval: 10,
					labels: { //y轴刻度文字标签  
						formatter: function() {
							return this.value + '%'; //y轴加上% 
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
					name: "累计收益率",
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
		clientCode: $scope.clientCode,
		date: $scope.date
	}
	$.ajax({
		type: "POST",
		url: "http://www.decaihui.com/wxweb/api/personal/getMyMonthlyReport.do",
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
				$(".analyst1 .percent li:first-child").css("background", "linear-gradient(to right, #f37323 0%, #dfdfe5 " + getNum($scope.analyst1_yearProfitRatio) + ")")
				$(".analyst1 .percent li:nth-child(3)").css("background", "linear-gradient(to right, #f37323 0%, #dfdfe5 " + getNum($scope.analyst1_winningRatio) + ")")
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
				$(".analyst2 .percent li:first-child").css("background", "linear-gradient(to right, #f37323 0%, #dfdfe5 " + getNum($scope.analyst2_yearProfitRatio) + ")")
				$(".analyst2 .percent li:nth-child(3)").css("background", "linear-gradient(to right, #f37323 0%, #dfdfe5 " + getNum($scope.analyst2_winningRatio) + ")")
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
				$(".analyst3 .percent li:first-child").css("background", "linear-gradient(to right, #f37323 0%, #dfdfe5 " + getNum($scope.analyst3_yearProfitRatio) + ")")
				$(".analyst3 .percent li:nth-child(3)").css("background", "linear-gradient(to right, #f37323 0%, #dfdfe5 " + getNum($scope.analyst3_winningRatio) + ")")
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
				$(".total_percent li:first-child").css("background", "linear-gradient(to right, #f37323 0%, #dfdfe5 " + getNum($scope.total_monthProfitRatio) + ")")
				$(".total_percent li:nth-child(3)").css("background", "linear-gradient(to right, #f37323 0%, #dfdfe5 " + getNum($scope.total_totalProfitRatio) + ")")
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
		}
	});
	//第五页
	$.ajax({
		type: "POST",
		url: `http://www.decaihui.com/wxweb/api/month/topThree/${cxMonth}.do`,
		async: true,
		contentType: "application/json",
		success: function(data) {
			for(var i = 0; i < data.data.length; i++) {
				var lis = ""
				lis += "<li>"
				lis += "<div class='liLeft'><img src='http://www.decaihui.com/wxweb/img/" + (i + 1) + "ST.png'/></div>"
				lis += "<div class='liRight'>"
				lis += "<p>交易品种:&nbsp;<span>" + data.data[i].instrumentCode.join(" ") + "</span></p>"
				lis += "<p>交易次数:&nbsp;<span>" + data.data[i].totalTradeNum + "</span></p>"
				lis += "<p>月初权益:&nbsp;<span style='color: #ab8c5f;'>&yen; " + $.format_number(data.data[i].monthStartBalance) + "</span>&nbsp;&nbsp;月末权益:&nbsp;<span style='color: #ab8c5f;'>&yen; " + $.format_number(data.data[i].monthEndBalance) + "</span></p>"
				lis += "<ul class='liData'>"
				lis += "<li><span>月收益率</span><span>" + (data.data[i].monthProfitRatio * 100).toFixed(2) + "%</span></li>"
				lis += "<li><span>年化收益率</span><span>" + (data.data[i].yearProfitRatio * 100).toFixed(2) + "%</span></li>"
				lis += "<li><span>总收益率</span><span>" + (data.data[i].totalProfitRatio * 100).toFixed(2) + "%</span></li>"
				lis += "<li><span>胜算率</span><span>" + (data.data[i].winRatio * 100).toFixed(2) + "%</span></li>"
				lis += "</ul>"
				lis += "</div>"
				lis += "</li>"
				$(".rank_bottom").append($(lis))
				$(".liData li:nth-child(1)").css("background", "linear-gradient(to right, #f37323 0%, #e7e7eb " + $(".liData li:nth-child(1) span:last-child").html() + ")")
				$(".liData li:nth-child(2)").css("background", "linear-gradient(to right, #f37323 0%, #e7e7eb " + $(".liData li:nth-child(2) span:last-child").html() + ")")
				$(".liData li:nth-child(3)").css("background", "linear-gradient(to right, #ee2b31 0%, #e7e7eb " + $(".liData li:nth-child(3) span:last-child").html() + ")")
				$(".liData li:nth-child(4)").css("background", "linear-gradient(to right, #f37323 0%, #e7e7eb " + $(".liData li:nth-child(4) span:last-child").html() + ")")

			}
			$scope.top1_name = data.data[0].name
			$scope.toP1_monthProfitRatio = (data.data[0].monthProfitRatio * 100).toFixed(2) + "%"

			$scope.top2_name = data.data[1].name
			$scope.toP2_monthProfitRatio = (data.data[1].monthProfitRatio * 100).toFixed(2) + "%"

			$scope.top3_name = data.data[2].name
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