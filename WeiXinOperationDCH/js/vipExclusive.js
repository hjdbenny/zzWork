$(function() {
	var t = $.getUrlParam("t")
	var p = $.getUrlParam("p")
	$("#search").focus(function() {
		var tzUrl = `http://www.decaihui.com/wxweb/api/vip/vipsearch.do`
		window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7806a150c562b73c&redirect_uri=${encodeURIComponent(tzUrl)}&response_type=code&scope=snsapi_base&state=123#wechat_redirect`
	})
	//久赢绑定率
	$.ajax({
		type: "POST",
		url: `http://www.decaihui.com/wxweb/api/vip/bindingRate.do`,
		async: false,
		contentType: "application/json",
		success: function(data) {
			$("#careNum").html(data.data.careNum+"人")
			$("#jyUserNum").html(data.data.jyUserNum+"人")
			$("#bindingNum").html(data.data.bindingNum+"人")
			$("#bindingRate").html((parseFloat(data.data.bindingRate)*100).toFixed(2)+"%")
		}
	})
	//开户统计曲线图
	var khChartData = getKhData(1)
	var khChart = Highcharts.chart('khChart', {
		chart: {
			type: 'column',
			marginTop: 1,
			spacing: [0, 10, 10, 10],
			plotBackgroundColor: '#ffffff',
			backgroundColor: "#f5f7f6"
		},
		title: {
			text: ""
		},
		xAxis: {
			categories: khChartData.categories,
			labels: {
				style: {
					fontSize: "1rem"
				},
				y: 35
			},
			tickmarkPlacement: 'on', //在刻度中间能显示
			tickPosition: 'inside', //在刻度显示位置朝里面
			reversed: true
		},
		yAxis: {
			title: {
				text: ''
			},
			labels: {
				enabled: false,
				reserveSpace: false
			}
		},
		tooltip: {
			enabled: false
		},
		legend: {
			enabled: false
		},
		credits: {
			enabled: false //右下角图表版权信息不显示  
		},
		plotOptions: {
			column: {
				dataLabels: {
					align: 'center',
					enabled: true,
					shadow: false,
					style: {
						color: "#333333",
						fontSize: "1rem",
						width: "2rem"
					},
					y: 0,
					x: 0
				},
				pointWidth: 40
			}
			//			series: {
			//				pointWidth: 30
			//			}
		},
		series: [khChartData],
		exporting: { //去除打印
			enabled: false
		}
	});
	//盈亏统计曲线图
	var ykChartData = getYkData(1)
	var ykChart = Highcharts.chart('ykChart', {
		chart: {
			//			type: 'line',
			marginTop: 1,
			spacing: [0, 5, 10, 5],
			plotBackgroundColor: '#ffffff',
			backgroundColor: "#f5f7f6",
			zoomType: 'x',
			panning: true
		},
		title: {
			text: ""
		},
		xAxis: {
			categories: ykChartData.categories,
			gridLineColor: '#197F07',
			labels: {
				style: {
					fontSize: "1rem"
				},
				y: 35,
				step: 1,
				formatter: function() {
					if(this.value.length > 7) {
						var str = this.value.split("-")[2]
					} else if(this.value.length > 4) {
						var str = `${this.value.split("-")[0].slice(2)}.${this.value.split("-")[1]}`;
					} else {
						var str = this.value;
					}
					return str;
				}
			}
			//			reversed:true
		},
		yAxis: [{
			lineWidth: 1,
			title: {
				text: ''
			},
			labels: {
				align: "left",
				x: 5,
				y: 25,
				formatter: function() {
					return this.value.toFixed(0);
				},
				style: {
					fontSize: "1rem"
				}
			},
			showFirstLabel: false,
			gridZIndex: 10,
			gridLineColor: "transparent"
		}, {
			lineWidth: 1,
			opposite: true,
			title: {
				text: ''
			},
			labels: {
				align: "right",
				enabled: true,
				x: -5,
				y: 25,
				formatter: function() {
					return this.value.toFixed(0);
				},
				style: {
					fontSize: "1rem"
				}
			},
			showFirstLabel: false,
			gridZIndex: 10,
			gridLineColor: "transparent"
		}],
		tooltip: {
			useHTML: true, //自定义提示框
			formatter: function() {
				if(this.x.indexOf("-") == -1) {
					var str = `<span>${this.x}年</span><br/><span>${this.series.name}:${$.format_number(this.y)}</span>`

				} else {
					if(this.x.length > 7) {
						var str = `<span>${this.x}</span><br/><span>${this.series.name}:${$.format_number(this.y)}</span>`
					} else {
						var str = `<span>${this.x.split("-")[0]}年第${parseInt(this.x.split("-")[1])}季度</span><br/><span>${this.series.name}:${$.format_number(this.y)}</span>`
					}

				}
				return str
			},
			style: {
				fontSize: "1rem"
			},
			backgroundColor: "#ffffff",
			borderColor: "#ffffff",
			borderRadius: 10,
			borderWidth: 0,
			shadow: false,
			followTouchMove: false
		},
		legend: {
			enabled: false
		},
		credits: {
			enabled: false //右下角图表版权信息不显示  
		},
		plotOptions: {
			area: {
				marker: {
					enabled: false,
					symbol: "round",
					fillColor: '#a47f47',
					lineWidth: 1,
					lineColor: '#a47f47',
					radius: 1
				},
				lineColor: "#d6ae72",
				lineWidth: 1,
				states: {
					hover: {
						lineWidth: 2
					}
				},
				threshold: null
			},
			line: {
				lineWidth: 2,
				marker: {
					enabled: false,
					symbol: "round",
					fillColor: '#a47f47',
					lineWidth: 1,
					lineColor: '#a47f47',
					radius: 1
				},
				lineColor: "#f3dab6",
			},
			series: {
				fillOpacity: 0.1
			}
		},
		series: [ykChartData.ykObj1, ykChartData.ykObj2],
		exporting: { //去除打印
			enabled: false
		}
	});
	//品种盈亏金字塔
	function paintBar(barObj) {
		$("#pzChart ul").empty()
		for(var i = 0; i < barObj.negativeArr.length; i++) {
			var lis = ""
			lis += `<li>`
			lis += `<div class="left-box"><div><span class=profitData>${barObj.negativeArr[i].profit}</span></div></div>`
			lis += `<div class="middle-box">${barObj.negativeArr[i].name}</div>`
			lis += `</li>`
			$("#pzChart ul").append($(lis))
		}
		for(var i = 0; i < barObj.positiveArr.length; i++) {
			var lis = ""
			lis += `<li>`
			lis += `<div class="middle-box">${barObj.positiveArr[i].name}</div>`
			lis += `<div class="right-box"><div><span class=profitData>${barObj.positiveArr[i].profit}</span></div></div>`
			lis += `</li>`
			$("#pzChart ul").append($(lis))
		}
		$(".left-box").find("div").each(function(i) {
			var currentVal = Math.abs($(this).find("span").html()) / Math.abs(barObj.min)
			$(this).animate({
				"width": currentVal * 100 + "%"
			}, 1000)
			if(currentVal * 100 < 40) {
				$(this).find("span").css({
					"left": `-${$(this).find("span").width()+10}px`,
					"color": "#02d687"
				})
			}
		})
		$(".left-box").next().each(function() {
			$(this).addClass("leftStatus")
		})
		$(".right-box").find("div").each(function() {
			var currentVal = Math.abs($(this).find("span").html()) / Math.abs(barObj.max)
			$(this).animate({
				"width": currentVal * 100 + "%"
			}, 1000)
			if(currentVal * 100 < 40) {
				$(this).find("span").css({
					"right": `-4rem`,
					"color": "#f4572f"
				})
			}
		})
		$(".right-box").prev().each(function() {
			$(this).addClass("rightStatus")
		})
	}

	//	根据月季年显示相应的图表和数据
	$(".select li").each(function(i) {
		$(this).click(e => {
			$(".select li").removeClass("select_on")
			$(this).addClass("select_on")

			if($(".labelNav_on").data("type") == "kh") {
				var updateKhChartData = getKhData(i + 1)
				khChart.xAxis[0].setCategories(updateKhChartData.categories)
				khChart.reflow();
				khChart.get('kh').remove()
				khChart.addSeries(updateKhChartData);
			} else if($(".labelNav_on").data("type") == "yk") {
				if(i == 0) {
					$(".showBalance").show()
				} else {
					$(".showBalance").hide()
				}
				var updateYkChartData = getYkData(i + 1)
				ykChart.xAxis[0].setCategories(updateYkChartData.categories)
				ykChart.reflow();
				ykChart.get('yk1').remove()
				ykChart.get('yk2').remove()
				ykChart.addSeries(updateYkChartData.ykObj1);
				ykChart.addSeries(updateYkChartData.ykObj2);

			} else {
				paintBar(getPzData(i + 1))
				getPzConent(i + 1)
			}
		})
	})

	function setProfitColor(elem) {
		$(`${elem}>ul>li>div:last-of-type`).each(function() {
			if($(this).html().substring(1) >= 0) {
				$(this).addClass("numUp")
			} else {
				$(this).addClass("numDown")
			}
		})
	}

	//	切换选择类型

	$(".labelNav li").each(function(i) {
		$(this).click(e => {
			$(".labelNav li").removeClass("labelNav_on")
			$(this).addClass("labelNav_on")
			$(".charts>div").hide()
			$(`#${$(this).data("type")}Chart`).show()
			if($(this).data("type") == "yk") {
				$(".showBalance").show()
			}
			$(".content").hide()
			$(`.${$(this).data("type")}_content`).show()
			$(".select li").eq(0).trigger("click")
		})
	})

	//开户统计图标数据
	function getKhData(index) {
		var chartArr = []
		var categories = []
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxweb/api/vip/openNum/${index}.do`,
			async: false,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				//获取柱状图数据数组
				if(index == 1) {
					var listArr = data.data.listDay
				} else if(index == 2) {
					var listArr = data.data.listWeek
				} else {
					var listArr = data.data.listMonth
				}

				for(var i = 0; i < listArr.length; i++) {
					openNum = parseFloat(listArr[i].openNum)
					chartArr.push(openNum)
					if(index == 1) {
						categories.push(listArr[i].openDate.split("-")[2])
					} else if(index == 2) {
						categories.push(listArr[i].openDate)
					} else {
						categories.push(listArr[i].openDate.split("-")[1])
					}

				}
				//根据月季年，显示开户人数
				$(".kh_content ul").empty()
				if(index == 1) {
					var lastMonth = data.data.updateTime.split("-")[1]
					var lis = ""
					lis += `<li>`
					lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>${lastMonth}月</div></div>`
					lis += `<div>总开户人数</div>`
					lis += `<div>${data.data.openNumMonth}人</div>`
					lis += `</li>`
					lis += `<li>`
					lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>上一周</div></div>`
					lis += `<div>总开户人数</div>`
					lis += `<div>${data.data.openNumWeek}人</div>`
					lis += `</li>`
					$(".kh_content ul").append($(lis))
				} else if(index == 2) {
					var showList = data.data.listMonth.reverse()
					for(var i = 0; i < showList.length; i++) {
						var month = showList[i].openDate.split("-")[1]
						var lis = ""
						lis += `<li>`
						lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>${month}月</div></div>`
						lis += `<div>总开户人数</div>`
						lis += `<div>${showList[i].openNum}人</div>`
						lis += `</li>`
						$(".kh_content ul").append($(lis))
					}
				} else {
					var showList = data.data.listYear.reverse()
					for(var i = 0; i < showList.length; i++) {
						var month = showList[i].openDate
						var lis = ""
						lis += `<li>`
						lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>${month}年</div></div>`
						lis += `<div>总开户人数</div>`
						lis += `<div>${showList[i].openNum}人</div>`
						lis += `</li>`
						$(".kh_content ul").append($(lis))
					}
				}
			}
		})

		var khObj = {
			id: "kh",
			color: getColors(index),
			data: chartArr,
			len: chartArr.length,
			categories: categories
		}
		return khObj
	}
	//盈亏统计图标数据
	function getYkData(index) {
		var chartArr1 = []
		var chartArr2 = []
		var categories = []
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxweb/api/vip/balanceAndProfit/${index}.do`,
			async: false,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				if(index == 1) {
					var listArr = data.data.listDay
				} else if(index == 2) {
					var listArr = data.data.listQuarter
				} else {
					var listArr = data.data.listYear
				}
				for(var i = 0; i < listArr.length; i++) {			
					sumProfit = parseFloat(listArr[i].sumProfit)
					if(index == 1) {
						sumBalance = parseFloat(listArr[i].sumBalance.toFixed(2))
						chartArr1.push(sumBalance)
						chartArr2.push(sumProfit)
						categories.push(listArr[i].tradeDate)
					} else {
						chartArr2.push(sumProfit)
						categories.push(listArr[i].tradeDate)
					}
				}
				//根据月季年，显示盈亏统计
				$(".yk_content ul").empty()
				if(index == 1) {
					var lastMonth = data.data.updateTime.split("-")[1]
					var lis = ""
					lis += `<li>`
					lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>${lastMonth}月</div></div>`
					lis += `<div>累计盈亏</div>`
					lis += `<div>&yen;${data.data.proWeek}</div>`
					lis += `</li>`
					lis += `<li>`
					lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>上一周</div></div>`
					lis += `<div>累计盈亏</div>`
					lis += `<div>&yen;${data.data.proMonth}</div>`
					lis += `</li>`
					$(".yk_content ul").append($(lis))
					var flis = `<li><div>总用户权益</div><div></div><div>&yen;${data.data.todayBalance}</div></li>`
					$(flis).insertBefore($(".yk_content ul li:first-child"))
				} else if(index == 2) {
					var showList = listArr.reverse()
					for(var i = 0; i < listArr.length; i++) {
						var month = showList[i].tradeDate.split("-")
						var lis = ""
						lis += `<li>`
						lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>${month[0]}第${parseInt(month[1])}季度</div></div>`
						lis += `<div>累计盈亏</div>`
						lis += `<div>&yen;${showList[i].sumProfit}</div>`
						lis += `</li>`
						$(".yk_content ul").append($(lis))
					}
					var flis = `<li><div>总用户权益</div><div></div><div>&yen;${data.data.todayBalance}</div></li>`
					$(flis).insertBefore($(".yk_content ul li:first-child"))
				} else {
					var showList = listArr.reverse()
					for(var i = 0; i < showList.length; i++) {
						var month = showList[i].tradeDate
						var lis = ""
						lis += `<li>`
						lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>${month}年</div></div>`
						lis += `<div>累计盈亏</div>`
						lis += `<div>&yen;${showList[i].sumProfit}</div>`
						lis += `</li>`
						$(".yk_content ul").append($(lis))
					}
					var flis = `<li><div>总用户权益</div><div></div><div>&yen;${data.data.todayBalance}</div></li>`
					$(flis).insertBefore($(".yk_content ul li:first-child"))
				}
				setProfitColor(".yk_content")
			}
		})
		if(chartArr1.length > chartArr2.length) {
			var len = chartArr1.length
		} else {
			var len = chartArr2.length
		}
		var ykObj1 = {
			type: "line",
			id: "yk1",
			name: "用户权益",
			color: "#f3dab6",
			data: chartArr1,
			yAxis: 1,
			zIndex: 5
		}
		var ykObj2 = {
			type: "area",
			id: "yk2",
			name: "累计盈亏",
			fillColor: getColors2(index),
			data: chartArr2,
			yAxis: 0
		}
		var ykObj = {
			ykObj1: ykObj1,
			ykObj2: ykObj2,
			len: len,
			categories: categories
		}
		return ykObj
	}
	//品种盈亏数据
	function getPzData(index) {
		var pzChartArrPositive = [] //正数
		var pzChartArrNegative = [] //负数
		var maxPositive = []
		var minNegative = []
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxweb/api/vip/varietiesProfit/${index}.do`,
			async: false,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				for(var i = 0; i < data.data.length; i++) {
					if(data.data[i].profit >= 0) {
						var positiveObj = {
							name: data.data[i].name,
							profit: data.data[i].profit
						}
						pzChartArrPositive.push(positiveObj)
						maxPositive.push(positiveObj.profit)
					} else {
						var negativeObj = {
							name: data.data[i].name,
							profit: data.data[i].profit
						}
						pzChartArrNegative.push(negativeObj)
						minNegative.push(negativeObj.profit)
					}
				}
			}
		})
		var max = Math.max.apply(null, maxPositive); //最大值
		var min = Math.min.apply(null, minNegative); //最小值
		var pzObj = {
			positiveArr: pzChartArrPositive,
			negativeArr: pzChartArrNegative,
			max: max,
			min: min
		}
		return pzObj
	}

	function getPzConent(index) {
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxweb/api/vip/sumProfit/${index}.do`,
			async: false,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				//根据月季年，显示开户人数
				$(".pz_content ul").empty()
				if(index == 1) {
					var lastMonth = data.data.updateTime.split("-")[1]
					var lis = ""
					lis += `<li>`
					lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>${lastMonth}月</div></div>`
					lis += `<div>总盈亏</div>`
					lis += `<div>&yen;${data.data.sumMonth}</div>`
					lis += `</li>`
					lis += `<li>`
					lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>上一周</div></div>`
					lis += `<div>总盈亏</div>`
					lis += `<div>&yen;${data.data.sumWeek}</div>`
					lis += `</li>`
					$(".pz_content ul").append($(lis))
				} else if(index == 2) {
					var showList = data.data.listQuarter.reverse()
					for(var i = 0; i < showList.length; i++) {
						var month = showList[i].stageName.split("-")
						var lis = ""
						lis += `<li>`
						lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>${month[0]}第${parseInt(month[1])}季度</div></div>`
						lis += `<div>总盈亏</div>`
						lis += `<div>&yen;${showList[i].sumProfit}</div>`
						lis += `</li>`
						$(".pz_content ul").append($(lis))
					}
				} else {
					var showList = data.data.listYear.reverse()
					for(var i = 0; i < showList.length; i++) {
						var month = showList[i].stageName
						var lis = ""
						lis += `<li>`
						lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>${month}年</div></div>`
						lis += `<div>总盈亏</div>`
						lis += `<div>&yen;${showList[i].sumProfit}</div>`
						lis += `</li>`
						$(".pz_content ul").append($(lis))
					}
				}
				setProfitColor(".pz_content")
			}
		});
	}
	//	是否显示用户权益
	$(".showBalance").click(e => {
		var series = ykChart.series[0];
		if(series.visible) {
			series.hide();
			$(".showBalance").css({
				"color": "#adadad",
				"border": "1px solid #adadad"
			})
		} else {
			series.show();
			$(".showBalance").css({
				"color": "#ab8c5f",
				"border": "1px solid #ab8c5f"
			})
		}
	})
	//	开户统计的三种背景色
	function getColors(index) {
		if(index == 1) {
			var colors = {
				linearGradient: {
					x1: 0,
					y1: 0,
					x2: 0,
					y2: 1
				},
				stops: [
					[0, "#ff824e"],
					[1, "#feb071"]
				]
			}
		} else if(index == 2) {
			var colors = {
				linearGradient: {
					x1: 0,
					y1: 0,
					x2: 0,
					y2: 1
				},
				stops: [
					[0, "#facb32"],
					[1, "#f7e9a4"]
				]
			}
		} else {
			var colors = {
				linearGradient: {
					x1: 0,
					y1: 0,
					x2: 0,
					y2: 1
				},
				stops: [
					[0, "#fb5555"],
					[1, "#ff9580"]
				]
			}
		}
		return colors
	}
	//	盈亏统计的三种背景色
	function getColors2(index) {
		if(index == 1) {
			var colors = {
				linearGradient: {
					x1: 0,
					y1: 0,
					x2: 0,
					y2: 1
				},
				stops: [
					[0, "#ff986c"],
					[.9, "#ffffff"]
				]
			}
		} else if(index == 2) {
			var colors = {
				linearGradient: {
					x1: 0,
					y1: 0,
					x2: 0,
					y2: 1
				},
				stops: [
					[0, "#ffea9e"],
					[.9, "#ffffff"]
				]
			}
		} else {
			var colors = {
				linearGradient: {
					x1: 0,
					y1: 0,
					x2: 0,
					y2: 1
				},
				stops: [
					[0, "#fd7466"],
					[.9, "#ffffff "]
				]
			}
		}
		return colors
	}
})