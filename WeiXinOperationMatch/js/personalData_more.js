var app = angular.module("personalData", [])
app.controller("moreController", operation)

function operation($scope, $http, $interval) {
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
	//获取url中的参数, code
	function getUrlParam(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
		var r = window.location.search.substr(1).match(reg); //匹配目标参数
		if(r != null) return unescape(r[2]);
		return null; //返回参数值
	}

//	effectiveTime = sessionStorage.getItem("effectiveTime")
	$scope.investorId = sessionStorage.getItem("investorId")
	month = sessionStorage.getItem("month")
//	$scope.openID = sessionStorage.getItem("openId")
	$scope.date = sessionStorage.getItem("date")
	var obj = {
		investorId: $scope.investorId,
		month: month
	}
	$.ajax({
		type: "POST",
		url: "http://www.decaihui.com/wxdch/api/dcmonth/varietiesInfo.do",
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
					var tzUrl=`http://www.decaihui.com/wxdch/api/view/monthlyReport.do`
					window.location.href = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7806a150c562b73c&redirect_uri=${encodeURIComponent(tzUrl)}&response_type=code&scope=snsapi_base&state=123#wechat_redirect`
				} else {
//					window.location.href = "http://www.decaihui.com/wxdch/api/vip/one/" + $scope.investorId + "/" + $scope.openID + "/" + effectiveTime + "/" + $scope.date + "/mine.do"
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
			lis += `<p>最大单笔盈利: &yen;${format_number(arr[i].maxProfit)}</p>`
			lis += `<p>最大单笔亏损: &yen;${format_number(Math.abs(arr[i].maxLoss))}</p>`
//			lis += `<p>最大保证金: &yen;${format_number(arr[i].maxMargin)}</p>`
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