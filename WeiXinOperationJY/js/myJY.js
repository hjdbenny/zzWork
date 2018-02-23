var app = angular.module("personalData", [])
app.controller("totalController", operation)

function operation($scope, $http, $interval, $timeout) {
	urlArr = location.href.split("/")
	$scope.effectiveTime = urlArr[urlArr.length - 1].substring(0, urlArr[urlArr.length - 1].indexOf(".do")) //链接有效时间
	if(location.href.indexOf("/vip/") == -1) {
		$scope.openID = urlArr[urlArr.length - 2]
		//获取clientcode
		$.ajax({
			type: "post",
			url: "http://wx.zzfco.com/wxweb/api/total/clientCode/" + $scope.openID + ".do ",
			async: false,
			success: function(data) {
				$scope.clientCode = data.data
			}
		});
		sessionStorage.setItem("isVIP", "0")
	} else {
		var urlArr=window.location.href.split("/")
		$scope.clientCode = urlArr[urlArr.length-1].split(".")[0]
		sessionStorage.setItem("isVIP", "1")
	}

	//获取更新时间
	$.ajax({
		type: "POST",
		url: "http://wx.zzfco.com/wxweb/api/total/updateTime.do",
		async: false,
		data: JSON.stringify(obj),
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			$scope.endDate = data.data
		}
	});
	$scope.currentTime = $scope.endDate
	var obj = {
		clientCode: $scope.clientCode,
		endDate: $scope.endDate
	}
	//	用户个人信息
	$.ajax({
		type: "POST",
		url: "http://wx.zzfco.com/wxweb/api/total/endDatePersonalInfo.do",
		async: false,
		data: JSON.stringify(obj),
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			$scope.khName = data.data.name
			$scope.account = data.data.clientCode
			$scope.monthStart_balance = `¥ ${$.format_number(data.data.startBalance)}` //期初权益
			$scope.monthEnd_balance = `¥ ${$.format_number(data.data.endBalance)}` //期末权益
			$scope.openTime = data.data.openTime
			$scope.netValue = parseFloat(data.data.netValue).toFixed(2)
			$scope.riskDegree = (parseFloat(data.data.riskDegree) * 100).toFixed(2) + "%"
			$scope.sumDays = data.data.sumDays
			$scope.number = "JY" + data.data.userNo
			flag = (parseFloat(data.data.totalProfitRatio) * 100).toFixed(2) + "%"
			if(parseFloat(flag) > 0) {
				$(".up").show()
				$(".centerCircle").css("left", "calc((100% - 7rem)/2)")
				timerRight = $interval(function() {
					$scope.totalProfit = rnd(0, 100) + "." + rnd(0, 99) + "%"
				}, 100)
				$timeout(function() {
					$interval.cancel(timerRight)
					$scope.totalProfit = flag
				}, 3000)
			} else if(parseFloat(flag) < 0) {
				$(".down").show()
				$(".centerCircle").css("right", "calc((100% - 7rem)/2)")
				timerLeft = $interval(function() {
					$scope.totalProfit = rnd(-100, 0) + "." + rnd(0, 99) + "%"
				}, 100)
				$timeout(function() {
					$interval.cancel(timerLeft)
					$scope.totalProfit = flag
				}, 3000)
			} else {
				$(".centerCircle").css({
					"right": "0",
					"left": "0"
				})
				$(".bubbles").show()
				$(".arrow").show()
				$(".zero").show()
				timerLeft = $interval(function() {
					$scope.totalProfit = rnd(-100, 100) + "." + rnd(0, 99) + "%"
				}, 100)
				$timeout(function() {
					$interval.cancel(timerLeft)
					$scope.totalProfit = flag
				}, 3000)
			}
		}
	});
	//获取随机数
	function rnd(min, max) {
		var tmp = min;
		if(max < min) {
			min = max;
			max = tmp;
		}
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
	//当前排名及其变化
	getRank($("td:first-child").data("type"))
	$("td").each(function() {
		$(this).click(function() {
			$("td").removeClass("select_on")
			$(this).addClass("select_on")
			getRank($(this).data("type"))
		})
	})

	function getRank(type) {
		obj.type = type
		$.ajax({
			type: "POST",
			url: "http://wx.zzfco.com/wxweb/api/total/rankByType.do",
			async: true,
			contentType: "application/json",
			data: JSON.stringify(obj),
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				$scope.rank = data.data.rank
				if(data.data.rankChange >= 0) {
					$(".change_icon").attr("src", "http://wx.zzfco.com/wxweb/img/up.png")
					$scope.rank_change = data.data.rankChange
				} else {
					$(".change_icon").attr("src", "http://wx.zzfco.com/wxweb/img/down.png")
					$scope.rank_change = Math.abs(data.data.rankChange)
				}
				$scope.$digest()
			}
		});
	}
	sessionStorage.setItem("openId", $scope.openID)
	sessionStorage.setItem("clientCode", $scope.clientCode)
	sessionStorage.setItem("endDate", $scope.endDate)
	sessionStorage.setItem("effectiveTime", $scope.effectiveTime)
	//曲线图
	$.ajax({
		type: "POST",
		url: "http://wx.zzfco.com/wxweb/api/total/totalProfitRatioCurve/" + $scope.clientCode + ".do",
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
					headerFormat: '<span style="font-size: 1rem">{point.key}</span><br/>',
					//          		pointFormat: '<tr><td>{series.name}: </td>' +'<td style="text-align: right"><b>{point.y}</b></td></tr>',
					//          		footerFormat: '</table>',
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
	$.footerSkip()
}