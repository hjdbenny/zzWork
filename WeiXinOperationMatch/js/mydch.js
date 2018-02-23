var app = angular.module("personalData", [])
app.controller("totalController", operation)

function operation($scope, $http, $interval, $timeout) {
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
	if(location.href.indexOf("/vip/") == -1) {
		sessionStorage.setItem("isVIP", "0")
	} else {
		sessionStorage.setItem("isVIP", "1")
	}
	urlArr = location.href.split("/")
	$scope.openID=urlArr[urlArr.length-1].split(".")[0]
	
	$.ajax({
		type: "POST",
		url: `http://www.decaihui.com/wxdch/api/dctotal/investorId/${$scope.openID}.do`,
		async: false,
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			console.log(data)
			$scope.investorId = data.data
		}
	})
	
	function dateFormat(str){//格式化日期“yyyy-mm-dd”
		str=`${str.substring(0,4)}-${str.substring(4,6)}-${str.substring(6,8)}`
		return str
	}
	//	用户个人信息
	$.ajax({
		type: "POST",
		url: `http://www.decaihui.com/wxdch/api/dctotal/dcUserInfo/${$scope.investorId}.do`,
		async: false,
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			$scope.khName = data.data.user.clientName
			$scope.account = data.data.user.investorId
			$scope.sumDays = data.data.sumDays
			$scope.currentTime = dateFormat(data.data.updateTime)
			$scope.openTime = dateFormat(data.data.openTime)
			$scope.monthStart_balance = `¥ ${format_number(data.data.preBalance.toFixed(2))}` //期初权益
			$scope.monthEnd_balance = `¥ ${format_number(data.data.balance.toFixed(2))}` //期末权益

			//			$scope.netValue=parseFloat(data.data.netValue).toFixed(2)
			//			$scope.riskDegree=(parseFloat(data.data.riskDegree)*100).toFixed(2)+"%"
			$scope.sumDays = data.data.sumDays
			$scope.number = data.data.user.groupId
			//			flag = (parseFloat(data.data.totalProfitRatio) * 100).toFixed(2) + "%"
			//			if(parseFloat(flag) > 0) {
			//				$(".up").show()
			//				$(".centerCircle").css("left", "calc((100% - 7rem)/2)")
			//				timerRight = $interval(function() {
			//					$scope.totalProfit = rnd(0, 100) + "." + rnd(0, 99) + "%"
			//				}, 100)
			//				$timeout(function() {
			//					$interval.cancel(timerRight)
			//					$scope.totalProfit = flag
			//				}, 3000)
			//			} else if(parseFloat(flag) < 0) {
			//				$(".down").show()
			//				$(".centerCircle").css("right", "calc((100% - 7rem)/2)")
			//				timerLeft = $interval(function() {
			//					$scope.totalProfit = rnd(-100, 0) + "." + rnd(0, 99) + "%"
			//				}, 100)
			//				$timeout(function() {
			//					$interval.cancel(timerLeft)
			//					$scope.totalProfit = flag
			//				}, 3000)
			//			} else {
			//				$(".centerCircle").css({
			//					"right": "0",
			//					"left": "0"
			//				})
			//				$(".bubbles").show()
			//				$(".arrow").show()
			//				$(".zero").show()
			//				timerLeft = $interval(function() {
			//					$scope.totalProfit = rnd(-100, 100) + "." + rnd(0, 99) + "%"
			//				}, 100)
			//				$timeout(function() {
			//					$interval.cancel(timerLeft)
			//					$scope.totalProfit = flag
			//				}, 3000)
			//			}
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
		var obj = {
			investorId: $scope.investorId,
			type: type
		}
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxdch/api/dctotal/rankByType.do",
			async: true,
			contentType: "application/json",
			data: JSON.stringify(obj),
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				$scope.rank = data.data.rank
				if(data.data.rankChange >= 0) {
					$(".change_icon").attr("src", "http://www.decaihui.com/wxdch/img/up.png")
					$scope.rank_change = data.data.rankChange
				} else {
					$(".change_icon").attr("src", "http://www.decaihui.com/wxdch/img/down.png")
					$scope.rank_change = Math.abs(data.data.rankChange)
				}
				$scope.$digest()
			}
		});
	}
	sessionStorage.setItem("openId", $scope.openID)
	sessionStorage.setItem("investorId", $scope.investorId)
	sessionStorage.setItem("endDate", $scope.endDate)
	sessionStorage.setItem("effectiveTime", $scope.effectiveTime)
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
	//底部跳转
	$scope.openID = sessionStorage.getItem("openId")
	$(".toHome").click(function() {
		if(sessionStorage.getItem("isVIP") == "0") {
			var shareUrl = `http://www.decaihui.com/wxdch/api/view/mydch/${$scope.openID }.do`
			window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7806a150c562b73c&redirect_uri=${encodeURIComponent(shareUrl)}&response_type=code&scope=snsapi_base&state=123#wechat_redirect`
		} else {
			window.location.href = "http://www.decaihui.com/wxdch/api/vip/mydch/" + $scope.openID + "/" + $scope.investorId + "/" + $scope.effectiveTime + ".do"
		}
	})
	$(".toContract").click(function() {
		window.location.href = `http://www.decaihui.com/wxdch/mydch_more.html?timestamp=${new Date().getTime()}&isChild=true`
	})
	$(".toHistory").click(function() {
		window.location.href = `http://www.decaihui.com/wxdch/mydch_history.html?timestamp=${new Date().getTime()}&isChild=true`
	})
}