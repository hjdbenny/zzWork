//品种盈亏金字塔
	$("#pzChart").css("height", `30rem`)
	if($("#pzChart").height() < $(".charts").height()) {
		$("#pzChart").height($(".charts").height())
	}
	$("#pzChart").css("height", `30rem`)
	if($("#pzChart").height() < $(".charts").height()) {
		$("#pzChart").height($(".charts").height())
	}
	var pzChart = Highcharts.chart('pzChart', {
		chart: {
			type: 'bar',
			marginTop: 1,
			spacing: [0, 0, 10, 0],
			plotBackgroundColor: '#ffffff',
			backgroundColor: "#f5f7f6"
		},
		title: {
			text: ""
		},
		xAxis: [{
			title: {
				text: ''
			},
			reserveSpace: false,
			reversed: false,
			labels: {
//				enabled: false
			},
//			visible:false
		}, { // mirror axis on right side
			title: {
				text: ''
			},
			reserveSpace: false,
			opposite: true,
			reversed: false,
			linkedTo: 0,
			labels: {
//				enabled: false
			},
//			visible:false		
		}],
		yAxis: {
			title: {
				text: null
			},
			max:720000,
			min:-720000
		},
		tooltip: {
//			enabled: false
		},
		legend: {
			enabled: false
		},
		credits: {
			enabled: false //右下角图表版权信息不显示  
		},
		plotOptions: {
			bar:{
				dataLabels:{
					inside:true,
					style:{
						"color":"red"
					}
				},
				getExtremesFromAll:true
			},
			series: {
				pointWidth: 15
			}
		},
		series: [getPzData(1)],
		exporting: { //去除打印
			enabled: false
		}
	});