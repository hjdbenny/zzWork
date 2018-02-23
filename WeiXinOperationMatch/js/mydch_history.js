var app = angular.module("personalData", [])
app.controller("historyController", operation)

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
	//页面载入默认
	loadData("http://www.decaihui.com/wxdch/api/dctotal/position.do", 1, 1, "unclosed")
	$(".navbar1 .orderByDate .up_arrow").css({
		"opacity": "1",
		"border-bottom-color": "#333333"
	})
	$(".navbar1 .orderByDate .down_arrow").css("opacity", "0")
	/******************按持仓查看***************************/
	//点击已平仓
	$(".closed").click(function() {
		$(".cc").show()
		$(".yk").hide()
		$(".nav li").removeClass("select_on")
		$(this).addClass("select_on")
		ajaxUrl = "http://www.decaihui.com/wxdch/api/dctotal/closePosition.do"
		loadData(ajaxUrl, 1, 1, "closed")
		$(".navbar1 .up_arrow").css("opacity", "0")
		$(".navbar1 .down_arrow").css({
			"opacity": "1",
			"border-top-color": "#666666"
		})
		$(".navbar1 .orderByDate .up_arrow").css({
			"opacity": "1",
			"border-bottom-color": "#333333"
		})
		$(".navbar1 .orderByDate .down_arrow").css("opacity", "0")
	})
	//点击未平仓
	$(".unclosed").click(function() {
		$(".cc").show()
		$(".yk").hide()
		$(".nav li").removeClass("select_on")
		$(this).addClass("select_on")
		ajaxUrl = "http://www.decaihui.com/wxdch/api/dctotal/position.do"
		loadData(ajaxUrl, 1, 1, "unclosed")
		$(".navbar1 .up_arrow").css("opacity", "0")
		$(".navbar1 .down_arrow").css({
			"opacity": "1",
			"border-top-color": "#666666"
		})
		$(".orderByDate .up_arrow").css({
			"opacity": "1",
			"border-bottom-color": "#333333"
		})
		$(".orderByDate .down_arrow").css("opacity", "0")
	})
	orderBy()

	function orderBy() {
		$(".navbar1 li").each(function() {
			$(this).toggle(function() {
				$(".navbar1 li").removeClass("navbar_on")
				$(this).addClass("navbar_on")
				$(".navbar1 .up_arrow").css("opacity", "0")
				$(".navbar1 .down_arrow").css({
					"opacity": "1",
					"border-top-color": "#666666"
				})
				$(this).find("span[class='down_arrow']").css({
					"opacity": "1",
					"border-top-color": "#333333"
				})
				$(this).find("span[class='up_arrow']").css("opacity", "0")
				loadData(getUrl(), $(this).data("type"), 2, $(".select_on").data("type"))
			}, function() {
				$(".navbar1 li").removeClass("navbar_on")
				$(this).addClass("navbar_on")
				$(".navbar1 .up_arrow").css("opacity", "0")
				$(".navbar1 .down_arrow").css({
					"opacity": "1",
					"border-top-color": "#666666"
				})
				$(this).find("span[class='up_arrow']").css({
					"opacity": "1",
					"border-bottom-color": "#333333"
				})
				$(this).find("span[class='down_arrow']").css("opacity", "0")
				loadData(getUrl(), $(this).data("type"), 1, $(".select_on").data("type"))
			})
		})
	}

	function getUrl() {
		if($(".select_on").data("type") == "closed") {
			orderUrl = "http://www.decaihui.com/wxdch/api/dctotal/closePosition.do"
		} else {
			orderUrl = "http://www.decaihui.com/wxdch/api/dctotal/position.do"
		}
		return orderUrl;
	}
	function dateFormat(str){//格式化日期“yyyy-mm-dd”
		str=`${str.substring(0,4)}-${str.substring(4,6)}-${str.substring(6,8)}`
		return str
	}
	function loadData(url, type, order, item) {
		var obj = {
			investorId: sessionStorage.getItem("investorId"),
			type: type,
			order: order
		}
		$.ajax({
			type: "POST",
			url: url,
			async: true,
			data: JSON.stringify(obj),
			contentType: "application/json",
			success: function(data) {
				var listArr = data.data.list
				$(".totalProfit").html("￥" + data.data.sumProfit)
				$(".totalTax").html("￥" + data.data.sumAllTax)
				if(listArr.length == 0) {
					$(".noData").show()
					$(".navType1").hide()
					$(".record").hide()
					if(item == "closed") {
						$(".noData").html("暂无已平仓记录")
					} else {
						$(".noData").html("暂无未平仓记录")
					}
					$(".record").hide()
				} else {
					$(".navType1").show()
					$(".record").show()
					$(".noData").hide()
					$(".history_content").empty()
					for(var i = 0; i < listArr.length; i++) {
						if(listArr[i].direction == 0) {
							imgSrc = "img/more.png"
						} else {
							imgSrc = "img/empty.png"
						}
						if(listArr[i].closeProfit >= 0 || listArr[i].settleProfit >= 0) {
							condition = "yl"
						} else {
							condition = "ks"
						}
						if(item == "closed") {
							showDiv1 = `<div>${dateFormat(listArr[i].openTradeDate)}</div><div>${dateFormat(listArr[i].closeTradeDate)}</div>`
							showDiv2 = `<div>买入${listArr[i].openAvgPrice}</div><div>卖出${listArr[i].closePrice}</div>`
							showDiv3 = `<div>${listArr[i].closeVolume}手</div><img src='${imgSrc}'>`
							showDiv4 = `<div>${listArr[i].instrumentCode}</div><div class='${condition}'>&yen;${listArr[i].closeProfit}</div><div>手续费：${listArr[i].tax}</div>`
						} else {
							showDiv1 = `<div>${dateFormat(listArr[i].openTradeDate)}</div>`
							showDiv2 = `<div>买入${listArr[i].openPrice}</div><div>剩余${listArr[i].restVolume}手</div>`
							showDiv3 = `<div>${listArr[i].openVolume}手<img src='${imgSrc}'></div><div>结算价 ${listArr[i].settlePrice}</div>`
							showDiv4 = `<div>${listArr[i].instrumentCode}</div><div class='${condition}'>&yen;${listArr[i].settleProfit}</div><div>手续费：${listArr[i].tax}</div>`
						}
						var hLis = ""
						hLis += "<li>"
						hLis += `<div>${showDiv1}</div>`
						hLis += `<div>${showDiv2}</div>`
						hLis += `<div>${showDiv3}</div>`
						hLis += `<div>${showDiv4}</div>`
						hLis += "</li>"
						$(".history_content").append($(hLis))
					}
				}
			}
		});
	}
	/******************按每日盈亏查看***************************/
	$(".profit").click(function() {
		$(".yk").show()
		$(".cc").hide()
		$(".nav li").removeClass("select_on")
		$(this).addClass("select_on")
		$(".preview").show()
		$(".details").hide()
	})

	function formatDate(now) { //时间戳转化时间日期
		var year = now.getFullYear();
		var month = now.getMonth() + 1;
		var date = now.getDate();
		var hour = now.getHours();
		var minute = now.getMinutes();
		var second = now.getSeconds();
		//		return "20"+year+"-"+month+"-"+date+" "+hour+":"+minute+":"+second; 
		return year + "-" + month + "-" + date
	}
	//	分阶段盈亏及累计收益率统计
	$.ajax({
		type: "POST",
		url: `http://www.decaihui.com/wxdch/api/dctotal/profitStage/${sessionStorage.getItem("investorId")}.do`,
		async: false,
		contentType: "application/json",
		success: function(data) {
			$(".selectCondition ul").empty()
			for(var i = 0; i < data.data.length; i++) {
				if(data.data[i].totalRatio >= 0) {
					imgSrc2 = "img/up.png"
				} else {
					imgSrc2 = "img/down.png"
				}
				if(data.data[i].sumProfit >= 0) {
					sumProfit = "+" + format_number(data.data[i].sumProfit)
					phaseProfit = "yl"
				} else {
					sumProfit = format_number(data.data[i].sumProfit)
					phaseProfit = "ks"
				}
				var lis = ""
				lis += "<li data-datetype = '" + (i + 1) + "'>"
				lis += "<div><span class='iconfont'>&#xe604;</span>" + data.data[i].stageName + "</div>"
				lis += "<div class='" + phaseProfit + "'>" + sumProfit + "</div>"
				lis += "<div><span class='phaseRatio'>" + (data.data[i].totalRatio * 100).toFixed(2) + "</span>%<img src='" + imgSrc2 + "'></div>"
				lis += "</li>"
				$(".selectCondition ul").append($(lis))
			}
		}
	})

	//点击查看具体每日盈亏排序
	$(".moreBtn").click(function() {
		$(".preview").hide()
		$(".details").show()
		loadProfitData(6, 1, 1)
		orderByProfit(6)
		$(".navbar2 .orderByDate").find("span[class='up_arrow']").css({
			"opacity": "1",
			"border-bottom-color": "#333333"
		})
		$(".navbar2 .orderByDate").find("span[class='down_arrow']").css("opacity", "0")
	})
	$(".selectCondition>ul>li").each(function() {
		$(this).click(function() {
			$(".preview").hide()
			$(".details").show()
			loadProfitData($(this).data("datetype"), 1, 1)
			orderByProfit($(this).data("datetype"))
		})
	})
	//	每日盈亏下的排序
	function orderByProfit(dateType) {
		$(".navbar2 li").each(function() {
			$(this).toggle(function() {
				$(".navbar2 li").removeClass("navbar_on")
				$(this).addClass("navbar_on")
				$(".navbar2 .up_arrow").css("opacity", "0")
				$(".navbar2 .down_arrow").css({
					"opacity": "1",
					"border-top-color": "#666666"
				})
				$(this).find("span[class='down_arrow']").css({
					"opacity": "1",
					"border-top-color": "#333333"
				})
				$(this).find("span[class='up_arrow']").css("opacity", "0")
				loadProfitData(dateType, $(this).data("type"), 2)
			}, function() {
				$(".navbar2 li").removeClass("navbar_on")
				$(this).addClass("navbar_on")
				$(".navbar2 .up_arrow").css("opacity", "0")
				$(".navbar2 .down_arrow").css({
					"opacity": "1",
					"border-top-color": "#666666"
				})
				$(this).find("span[class='up_arrow']").css({
					"opacity": "1",
					"border-bottom-color": "#333333"
				})
				$(this).find("span[class='down_arrow']").css("opacity", "0")
				loadProfitData(dateType, $(this).data("type"), 1)
			})
		})
	}

	function loadProfitData(dateType, type, order) {
		var profitObj = {
			investorId: sessionStorage.getItem("investorId"),
			type: type,
			order: order,
			dateType: dateType
		}
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxdch/api/dctotal/profitAndLossCurve.do",
			async: true,
			data: JSON.stringify(profitObj),
			contentType: "application/json",
			success: function(data) {
				$(".profit_content").empty()
				for(var i = 0; i < data.data.length; i++) {
					if(data.data[i].balance >= 0) {
						balanceClass = "balance_up"
					} else {
						balanceClass = "balance_down"
					}
					var plis = ""
					plis += "<li>"
					plis += "<div>" + dateFormat(data.data[i].tradingDay) + "</div>"
					plis += "<div class='" + balanceClass + "'>" + parseInt(data.data[i].balance) + "</div>"
					plis += "<div>￥" + parseInt(data.data[i].closeTotalProfit) + "</div>"
					plis += "<div>￥" + data.data[i].deposit + "</div>"
					plis += "</li>"
					$(".profit_content").append($(plis))
				}
			}
		});
	}
	//曲线图
	var balanceObj = {
		investorId: sessionStorage.getItem("investorId"),
		type: 1,
		order: 1,
		dateType: 6
	}
	$.ajax({
		type: "POST",
		url: "http://www.decaihui.com/wxdch/api/dctotal/profitAndLossCurve.do",
		async: true,
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		data: JSON.stringify(balanceObj),
		success: function(data) {
			chartArr = []
			//			var sortArr = []
			for(var i = 0; i < data.data.length; i++) {
				y = parseInt(data.data[i].tradingDay.substring(0, 4))
				m = parseInt(data.data[i].tradingDay.substring(4,6)) - 1
				d = parseInt(data.data[i].tradingDay.substring(6,8))
				balance = parseFloat(data.data[i].balance)
				chartArr.push([Date.UTC(y, m, d), balance])
				//				sortArr.push(balance)
			}
			//			fh = "%"
			$(".qxt").highcharts({
				chart: {
					type: 'areaspline',
					zoomType: 'x',
					backgroundColor: '#b59667'
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
					lineColor: '#d0b893',
					labels: {
						align: 'center',
						style: {
							color: '#e5d9c6',
							fontSize: "1rem"
						},
						y: 30,
						step: 2
					}
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
					//					valueSuffix: fh,
					useHTML: true, //自定义提示框
					//					headerFormat: '<span style="font-size: 1rem">{point.key}</span><br/>',
					//          		pointFormat: '<tr><td>{series.name}: </td>' +'<td style="text-align: right"><b>{point.y}</b></td></tr>',
					//          		footerFormat: '</table>',
					style: {
						padding: 10,
						fontSize: "1rem"
					},
					formatter: function() {
						return "<span>权益金：" + this.y + "</span><br/>" + "<span>" + formatDate(new Date(this.x)) + "</span>";
					}
				},
				yAxis: {
					title: {
						text: ''
					},
					crosshair: true,
					//					tickPixelInterval: 10,
					labels: { //y轴刻度文字标签  
						align: 'left',
						formatter: function() {

							return this.value; //y轴加上% 

						},
						style: {
							color: '#e5d9c6',
							fontSize: "1rem"
						},
						x: 0,
						y: 25
					},
					gridZIndex: 120
					//					startOnTick: false,
					//					tickPositioner: function() {
					//						var positions = [],
					//							tick = Math.floor(this.dataMin),
					//							increment = 10000
					//						for(tick; tick - increment <= this.dataMax; tick += increment) {
					//							positions.push(tick);
					//						}
					//						return positions;
					//					}
				},
				legend: {
					enabled: false
				},
				credits: {
					enabled: false //右下角图表版权信息不显示  
				},
				plotOptions: {
					areaspline: {
						fillColor: {
							linearGradient: {
								x1: 0,
								y1: 0,
								x2: 0,
								y2: 1
							},
							stops: [
								[0, "#ccb05e"],
								[1, "#c2a577"]
							]
						},
						marker: {
							radius: 5
						},
						lineColor: "#ffffff",
						lineWidth: 3,
						lineCap: "round",
						states: {
							hover: {
								lineWidth: 3
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
					type: 'areaspline',
					name: "权益金",
					data: chartArr,
					color: "#ffffff",
					marker: {
						radius: 5
					}
					//					threshold: Math.min.apply(null, sortArr)-10
				}],
				exporting: { //去除打印
					enabled: false
				}
			});
			$("tspan").eq(0).hide()
		}
	});
	//底部跳转
	$scope.openID = sessionStorage.getItem("openId")
	effectiveTime = sessionStorage.getItem("effectiveTime")
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