$(function() {
	//获取url中的参数
	function getUrlParam(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
		var r = window.location.search.substr(1).match(reg); //匹配目标参数
		if(r != null) return unescape(r[2]);
		return null; //返回参数值
	}
	//日期格式化
	Date.prototype.Format = function(fmt) { //author: meizz 
		var o = {
			"M+": this.getMonth() + 1, //月份 
			"d+": this.getDate(), //日 
			"h+": this.getHours(), //小时 
			"m+": this.getMinutes(), //分 
			"s+": this.getSeconds(), //秒 
			"q+": Math.floor((this.getMonth() + 3) / 3), //季度 
			"S": this.getMilliseconds() //毫秒 
		};
		if(/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
		for(var k in o)
			if(new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
		return fmt;
	}
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
	var t= getUrlParam("t")
	var p = getUrlParam("p")
	$("#search").focus(function() {
		var tzUrl = `http://www.decaihui.com/wxdch/api/view/vipsearch.do`		
		window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7806a150c562b73c&redirect_uri=${encodeURIComponent(tzUrl)}&response_type=code&scope=snsapi_base&state=123#wechat_redirect`
	})
	//开户统计曲线图
	var khChartData = getKhData(1)
	$("#khChart").css("width", `${khChartData.len*3}rem`)
	if($("#khChart").width() < $(".charts").width()) {
		$("#khChart").width($(".charts").width())
	}
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
			categories:khChartData.categories,
			labels: {
				style: {
					fontSize: "1rem"
				},
				y:35
			},
			reversed:true
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
				pointWidth:40
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
			spacing: [0, 0, 10, 0],
			plotBackgroundColor: '#ffffff',
			backgroundColor: "#f5f7f6"
		},
		title: {
			text: ""
		},
		xAxis: {
			type: 'datetime',
			dateTimeLabelFormats: {
				day: '%d',
				month: '%m'
			},
			gridLineColor: '#197F07',
			labels: {
				style: {
					fontSize: "1rem"
				},
				y:35,
				step:1
			},
			reversed:true
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
				return `<span>${new Date(this.x).Format("yyyy-MM-dd")}</span><br/><span>${this.series.name}:${format_number(this.y)}</span>`
			},
			style: {
				fontSize: "1rem"
			},
			backgroundColor: "#ffffff",
			borderColor: "#ffffff",
			borderRadius: 10,
			borderWidth: 0,
			shadow: false
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
			lis += `<div class="left-box"><div><span class=profitData>${barObj.negativeArr[i].loss}</span></div></div>`
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
		$(".left-box").next().each(function(){
			$(this).addClass("leftStatus")
		})
		$(".right-box").find("div").each(function() {
			var currentVal = Math.abs($(this).find("span").html()) / Math.abs(barObj.max)
			$(this).animate({
				"width": currentVal * 100 + "%"
			}, 1000)
			if(currentVal * 100 < 40) {
				$(this).find("span").css({
					"right": `-5rem`,
					"color": "#f4572f"
				})
			}
		})
		$(".right-box").prev().each(function(){
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
				$("#khChart").css("width", `${updateKhChartData.len*3}rem`)
				if($("#khChart").width() < $(".charts").width()) {
					$("#khChart").width($(".charts").width())
				}
				khChart.reflow();
				khChart.get('kh').remove()
				khChart.addSeries(updateKhChartData);
			} else if($(".labelNav_on").data("type") == "yk") {
				var updateYkChartData = getYkData(i + 1)
				$("#ykChart").css("width", `${updateYkChartData.len*3}rem`)
				if($("#ykChart").width() < $(".charts").width()) {
					$("#ykChart").width($(".charts").width())
				}
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
		var categories=[]
		$.ajax({
			type: "POST",
			url: `http://www.decaihui.com/wxdch/api/vip/openNum/${index}.do`,
			async: false,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				//获取柱状图数据数组
				if(index == 1) {
					var listArr = data.data.listDay
				}else if(index == 2){
					var listArr = data.data.listWeek
				} else {
					var listArr = data.data.listMonth
				}
				
				for(var i=0;i<listArr.length;i++){
					openNum = parseFloat(listArr[i].openNum)
					chartArr.push(openNum)
					if(index == 1) {
						categories.push(listArr[i].openDate.substring(6,8))
					}else if(index == 2){
						categories.push(listArr[i].openDate)
					}else{
						categories.push(listArr[i].openDate.substring(4,6))
					}
					
				}
				//根据月季年，显示开户人数
				$(".kh_content ul").empty()
				if(index == 1) {
					var lastMonth=data.data.updateTime.substring(4,6)
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
					for(var i = 0; i < data.data.listMonth.length; i++) {
						var month = data.data.listMonth[i].openDate.substring(6,8)
						var lis = ""
						lis += `<li>`
						lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>${month}月</div></div>`
						lis += `<div>总开户人数</div>`
						lis += `<div>${data.data.listMonth[i].openNum}人</div>`
						lis += `</li>`
						$(".kh_content ul").append($(lis))
					}
				} else {
					for(var i = 0; i < data.data.listYear.length; i++) {
						var month = data.data.listYear[i].openDate
						var lis = ""
						lis += `<li>`
						lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>${month}年</div></div>`
						lis += `<div>总开户人数</div>`
						lis += `<div>${data.data.listYear[i].openNum}人</div>`
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
			categories:categories
		}
		return khObj
	}
	//盈亏统计图标数据
	function getYkData(index) {
		var chartArr1 = []
		var chartArr2 = []
		var categories=[]
		$.ajax({
			type: "POST",
			url:  `http://www.decaihui.com/wxdch/api/vip/balanceAndProfit/${index}.do`,
			async: false,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				if(index != 3) {
					var listArr = data.data.listDay
				} else {
					var listArr = data.data.listMonth
				}
				for(var i = 0; i < listArr.length; i++) {
					var y = parseInt(listArr[i].tradingDay.substring(0,4))
					var m = parseInt(listArr[i].tradingDay.substring(4,6)) - 1
					var d = parseInt(listArr[i].tradingDay.substring(6,8))
					var sumProfit = parseFloat(listArr[i].sumProfit)
					if(index != 3) {
						var sumBalance = parseFloat(listArr[i].sumBalance.toFixed(2))
						chartArr1.push([Date.UTC(y, m, d), sumBalance])
						chartArr2.push([Date.UTC(y, m, d), sumProfit])
					} else {
						chartArr2.push([Date.UTC(y, m), sumProfit])
					}
				}
				//根据月季年，显示盈亏统计
				$(".yk_content ul").empty()
				if(index == 1) {
					var lastMonth=data.data.updateTime.substring(4,6)
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
					for(var i = 0; i < data.data.listMonth.length; i++) {
						var month = data.data.listMonth[i].tradingDay.substring(4,6)
						var lis = ""
						lis += `<li>`
						lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>${month}月</div></div>`
						lis += `<div>累计盈亏</div>`
						lis += `<div>&yen;${data.data.listMonth[i].sumProfit}</div>`
						lis += `</li>`
						$(".yk_content ul").append($(lis))
					}
					var flis = `<li><div>总用户权益</div><div></div><div>&yen;${data.data.todayBalance}</div></li>`
					$(flis).insertBefore($(".yk_content ul li:first-child"))
				} else {
					for(var i = 0; i < data.data.listYear.length; i++) {
						var month = data.data.listYear[i].tradingDay
						var lis = ""
						lis += `<li>`
						lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>${month}年</div></div>`
						lis += `<div>累计盈亏</div>`
						lis += `<div>&yen;${data.data.listMonth[i].sumProfit}</div>`
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
			len: len
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
			url: `http://www.decaihui.com/wxdch/api/vip/varietiesProfit/${index}.do`,
			async: false,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				var lossArr=data.data.lossList
				if(lossArr.length<6){
					pzChartArrNegative=lossArr
				}else{
					for(var i=0,len=5;i<len;i++){
						pzChartArrNegative.push(lossArr[i])
					}
				}
				for (var i=0,len=pzChartArrNegative.length;i<len;i++) {
					minNegative.push(pzChartArrNegative[i].loss)
				}
				var profitArr=data.data.profitList.reverse()
				if(profitArr.length<6){
					pzChartArrPositive=profitArr
				}else{
					for(var i=0,len=5;i<len;i++){
						pzChartArrPositive.push(profitArr[i])
					}
				}
				for (var i=0,len=pzChartArrPositive.length;i<len;i++) {
					maxPositive.push(pzChartArrPositive[i].profit)
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
			url: `http://www.decaihui.com/wxdch/api/vip/sumProfit/${index}.do`,
			async: false,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				//根据月季年，显示开户人数
				$(".pz_content ul").empty()
				if(index == 1) {
					var lastMonth=data.data.updateTime.substring(4,6)
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
					for(var i = 0; i < data.data.listMonth.length; i++) {
						var month = data.data.listMonth[i].tradingDay.substring(4,6)
						var lis = ""
						lis += `<li>`
						lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>${month}月</div></div>`
						lis += `<div>总盈亏</div>`
						lis += `<div>&yen;${data.data.listMonth[i].sumProfit}</div>`
						lis += `</li>`
						$(".pz_content ul").append($(lis))
					}
				} else {
					for(var i = 0; i < data.data.listYear.length; i++) {
						var month = data.data.listYear[i].tradingDay
						var lis = ""
						lis += `<li>`
						lis += `<div><div><span class='iconfont'>&#xe60a;</span></div><div>${month}年</div></div>`
						lis += `<div>总盈亏</div>`
						lis += `<div>&yen;${data.data.listYear[i].sumProfit}</div>`
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
					[.8, "#ffffff"]
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
					[.8, "#ffffff"]
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
					[.8, "#ffffff "]
				]
			}
		}
		return colors
	}
})