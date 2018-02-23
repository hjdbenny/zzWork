var app = angular.module("personalData", [])
app.controller("moreController", operation)

function operation($scope, $http, $interval) {
	var effectiveTime = sessionStorage.getItem("effectiveTime")
	$scope.clientCode = sessionStorage.getItem("clientCode")
	month = sessionStorage.getItem("month")
	$scope.openID = sessionStorage.getItem("openId")
	$scope.date = sessionStorage.getItem("date")
	var obj = {
		clientCode: $scope.clientCode,
		month: month
	}
	$.ajax({
		type: "POST",
		url: "http://wx.zzfco.com/wxweb/api/month/typeDetails.do",
		async: true,
		data: JSON.stringify(obj),
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			if(data.data.length == 0) {
				alert("暂无更多交易数据，点击确定返回")
				if(sessionStorage.getItem("isVIP") == "0") {
					window.location.href = "http://wx.zzfco.com/wxweb/api/view/myMonthlyReport/" + $scope.openID + "/" + effectiveTime + "/" + $scope.date + ".do"
				} else {
					window.location.href = "http://wx.zzfco.com/wxweb/api/vip/one/" + $scope.clientCode + "/" + $scope.openID + "/" + effectiveTime + "/" + $scope.date + "/mine.do"
				}
			}
			loadData(data.data)
		}
	});

	function loadData(arr) {
		$(".more").empty()

		for(var i = 0; i < arr.length; i++) {
			instrumentIDs = arr[i].instrumentCode.join(" ")
			if(arr[i].mainDirection == "多") {
				imgSrc = "img/more.png"
			} else if(arr[i].mainDirection == "空") {
				imgSrc = "img/empty.png"
			} else if(arr[i].mainDirection == "平") {
				imgSrc = "img/flat.png"
			}
			var lis = ""
			lis += `<li>`
			lis += `<p><span class='tradeVariety'>${arr[i].contractName}</span><span class='instrumentID'>${instrumentIDs}</span></p>`
			lis += `<p><img src='img/more.png' /> <span class='count'>${arr[i].manyTradeNum}</span> 次交易 <img src='img/empty.png' /> <span class='count'>${arr[i].emptyTradeNum}</span> 次交易</p>`
			lis += `<p>主要方向: <img src='${imgSrc}' /></p>`
			lis += `<p class="line"></p>`
			lis += `<p>最大单笔盈利: &yen;${$.format_number(arr[i].maxProfit)}</p>`
			lis += `<p>最大单笔亏损: &yen;${$.format_number(Math.abs(arr[i].maxLoss))}</p>`
//			lis += `<p>最大保证金: &yen;${$.format_number(arr[i].maxMargin)}</p>`
			lis += `<div class='hy'><img src='img/arrow.png' /><ul><li>${(parseFloat(arr[i].winRatio) * 100).toFixed(2)}%</li><li>胜算率</li></ul></div>`
			lis += `</li>`
			$(".more").append($(lis))
			$(".hy").eq(i).circleProgress({
				value: arr[i].winRatio,
				emptyFill: "#e7e7e7", //圆环背景色
				size: $(".hy").eq(i).width(),
				fill: {
					color: "#ceb385"
				},
				animation: {
					duration: 1000,
					easing: 'linear'
				},
				thickness: '10',
				lineCap: "round"
			})
		}
		var height = $(window).height();
		if($(".more").height() > height) {
			var noMore = ""
			noMore += "<li class='nomore' style='margin-top: 10rem;'><span class='circle'></span><p>没有更多了</p></li>"
			$(".more").append($(noMore))
		}
		$(".hy").each(function(i) {
			$(this).click(function() {
				sessionStorage.setItem("contractName", arr[i].contractName)
				sessionStorage.setItem("winRatio", arr[i].winRatio)
				sessionStorage.setItem("maxProfit", arr[i].maxProfit)
				sessionStorage.setItem("maxLoss", arr[i].maxLoss)
				sessionStorage.setItem("manyTradeNum", arr[i].manyTradeNum)
				sessionStorage.setItem("emptyTradeNum", arr[i].emptyTradeNum)
				sessionStorage.setItem("mainDirection", arr[i].mainDirection)
				sessionStorage.setItem("instrumentIDs", arr[i].instrumentCode)
				window.location.href = "personalData_detailed.html?timestamp=" + new Date().getTime()
			})
		})
	}
}