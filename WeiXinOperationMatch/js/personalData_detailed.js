var app = angular.module("personalData", [])
app.controller("detailedController", operation)

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
	//获取url中的参数, code
	function getUrlParam(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
		var r = window.location.search.substr(1).match(reg); //匹配目标参数
		if(r != null) return unescape(r[2]);
		return null; //返回参数值
	}
	//	胜算率
	$scope.winningRatio = sessionStorage.getItem("winRatio")
	$(".progress").circleProgress({
		value: $scope.winningRatio,
		emptyFill: "transparent", //圆环背景色
		size: $(".progress").width(),
		fill: {
			color: "#866128"
		},
		animation: {
			duration: 1000,
			easing: 'linear'
		}
	})
	$(".outer").animate({
		rotateDeg: Math.abs(parseFloat($scope.winningRatio)) / 1 * 360
	}, {
		step: function(now, fx) {
			$(".outer").css({
				"transform": "rotate(" + now + "deg)",
				"-webkit-transform": "rotate(" + now + "deg)"
			})

		},
		duration: 1000,
		easing: "linear"
	});
	$(".win span").animate({
		winningRatio: Math.abs(parseFloat($scope.winningRatio)) * 100
	}, {
		step: function(now) {
			$(".win span").html(parseFloat(now).toFixed(2))
		},
		duration: 1000,
		easing: "linear"
	});
	$scope.moreCount = sessionStorage.getItem("manyTradeNum")
	$scope.emptyCount = sessionStorage.getItem("emptyTradeNum")
	$scope.max_profit = format_number(sessionStorage.getItem("maxProfit"))
	$scope.max_deficit = format_number(Math.abs(sessionStorage.getItem("maxLoss")))
	$scope.mainDirection = sessionStorage.getItem("mainDirection")
	if($scope.mainDirection == "多") {
		$("#direction").attr("src", "img/mainMore.png")
	} else if($scope.mainDirection == "空") {
		$("#direction").attr("src", "img/mainEmpty.png")
	} else if($scope.mainDirection == "平") {
		$("#direction").attr("src", "img/mainFlat.png")
	}
	$scope.instrumentIDs = sessionStorage.getItem("instrumentIDs").split(",")

	function loadNav(arr) {
		for(var i = 0; i < arr.length; i++) {
			var lis = ""
			lis += "<li class='swiper-slide'>|</li>"
			lis += "<li class='swiper-slide'>" + arr[i] + "</li>"
			$(".nav").append($(lis))
		}
		$(".nav li:first-child").remove()
		loadInstrumentCode($(".nav li:first-child").html())
		$(".nav li:first-child").addClass("select_on")
		$(".nav li:nth-child(2n+1)").each(function() {
			$(this).click(function() {
				loadInstrumentCode($(this).html())
				$(".nav li").removeClass("select_on")
				$(this).addClass("select_on")
			})
		})
	}
	loadNav($scope.instrumentIDs)

	function loadInstrumentCode(instrumentCode) {
		var queryObj = {
			investorId: sessionStorage.getItem("investorId"),
			instrumentCode: instrumentCode
		}
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxdch/api/dctotal/instrumentInfo.do",
			async: true,
			data: JSON.stringify(queryObj),
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				$(".mainDirection").html(data.data.mainDirection)
				$(".tradeNumber").html(data.data.tradeNumber)
				$(".profit").html(format_number(data.data.profit))
			}
		});
	}
	$scope.totalSlider = $(".swiper-wrapper>li").length - 1
	if($scope.totalSlider > 4) {
		$(".nav_container").css("width", "36.5rem")
	} else {
		$(".nav_container").css("width", "35.5rem")
	}
	if($scope.totalSlider > 3) {
		$scope.slidesPerView = 4.5
	} else {
		$scope.slidesPerView = 3
	}
	var mySwiper = new Swiper('.swiper-container', {
		loop: false,
		mousewheelControl: true,
		slidesPerView: $scope.slidesPerView
	});
}