$(function() {

	Array.prototype.unique = function() {
		var res = [];
		var json = {};
		for(var i = 0; i < this.length; i++) {
			if(!json[this[i]]) {
				res.push(this[i]);
				json[this[i]] = 1;
			}
		}
		return res;
	}
	urlArr = location.href.split("/")
	visitType = 0 //当前访问类型,普通查看个人历史月报0，vip查看个人历史月报1，久赢公众查看历史月报2
	if(location.href.indexOf("jy") != -1) {
		visitType = 2
	} else {
		if(location.href.indexOf("/vip/") == -1) {
			visitType = 0
			openId = urlArr[urlArr.length - 2]
		} else {
			visitType = 1
			clientCode = urlArr[urlArr.length - 4]
			openId = urlArr[urlArr.length - 3]
		}
	}
	time = urlArr[urlArr.length - 2]
	if(visitType == 2) {
		$.ajax({//查看久赢历史月报
			type: "POST",
			url: "http://www.decaihui.com/wxdch/api/monthlyReport/listMonthDates.do",
			async: false,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				setList(data.data,visitType)
			}
		});
	} else if(visitType==0) {
		$.ajax({ //查看VIP个人历史月报
			type: "POST",
			url: "http://www.decaihui.com/wxdch/api/personal/listMyHistoryMonthlyReports/"+openId+".do",
			async: false,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				setList(data.data,visitType)		
			}
		});
	}else if(visitType==1){
		$.ajax({ //查看个人历史月报
			type: "POST",
			url: "http://www.decaihui.com/wxdch/api/vip/listMyHistoryMonthlyReports/" + clientCode + ".do",
			async: false,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				setList(data.data,visitType)
			}
		});
	}

	function setList(arr,currentType) {
		if(arr.length == 0) {
			$(".info").show()
		}
		dateArr = []
		for(var i = 0; i < arr.length; i++) {
			var dateObj = {
				year: arr[i].reportDate.substring(0, 4),
				date: arr[i].reportDate
			}
			dateArr.push(dateObj)
		}
		yearArr = []
		for(var i = 0; i < arr.length; i++) {
			yearArr.push(dateArr[i].year)
		}
		yearArr = yearArr.unique()
		$(".year").empty()
		for(var i = 0; i < yearArr.length; i++) {
			var yLis = ""
			yLis += "<li data-year='" + yearArr[i] + "'>" + yearArr[i] + "年<img src='http://www.decaihui.com/wxdch/img/moreIcon.png' /></li>"
			$(".year").append($(yLis))
		}
		$(".year li").each(function() {
			$(this).click(function() {
				var monthArr = []
				for(var i = 0; i < dateArr.length; i++) {
					if($(this).data("year") == dateArr[i].year) {
						monthArr.push(dateArr[i].date)
					}
				}
				$(".month").empty()
				for(var i = 0; i < monthArr.length; i++) {
					var mLis = ""
					mLis += "<li data-date='" + monthArr[i] + "'>" + monthArr[i].substring(0, 4) + "-" + monthArr[i].substring(4, 6) + "月月报<img src='http://www.decaihui.com/wxdch/img/moreIcon.png' /></li>"
					$(".month").append($(mLis))
				}
				$(".nav li").removeClass("on")
				$(".nav li:last-child").addClass("on")
				$("#wrapper1").show()
				$("#wrapper2").hide()
				if(currentType==0){
					$(".month li").each(function() {
						$(this).click(function() {
							var tzUrl = "http://www.decaihui.com/wxdch/api/view/monthlyReport/" + openId + "/" + $(this).data("date") + ".do"	
							window.location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7806a150c562b73c&redirect_uri="+encodeURIComponent(tzUrl)+"&response_type=code&scope=snsapi_base&connect_redirect=1#wechat_redirect"
						})
					})
				}else if(currentType==1){
					$(".month li").each(function() {
						$(this).click(function() {	
							var tzUrl = "http://www.decaihui.com/wxdch/api/vip/one/" + clientCode + "/" + openId + "/" + time + "/" + $(this).data("date") + "/mine.do"
							window.location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7806a150c562b73c&redirect_uri="+encodeURIComponent(tzUrl)+"&response_type=code&scope=snsapi_base&connect_redirect=1#wechat_redirect"
						})
					})
				}else if(currentType==2){
					$(".month li").each(function() {
						$(this).click(function() {	
							var tzUrl = "http://www.decaihui.com/wxdch/index.html?date="+$(this).data("date")
							window.location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7806a150c562b73c&redirect_uri="+encodeURIComponent(tzUrl)+"&response_type=code&scope=snsapi_base&connect_redirect=1#wechat_redirect"
						})
					})
				}
			})
		})
	}

	$(".nav li:last-child").click(function() {
		console.log(1)
		$(".nav li").removeClass("on")
		$(this).addClass("on")
		$("#wrapper1").show()
		$("#wrapper2").hide()
		if($(".month li").length == 0) {
			$(".nav li").removeClass("on")
			$(".nav li:first-child").addClass("on")
			$("#wrapper2").show()
			$("#wrapper1").hide()
		}
	})
	$(".nav li:first-child").click(function() {
		$(".nav li").removeClass("on")
		$(this).addClass("on")
		$("#wrapper2").show()
		$("#wrapper1").hide()
	})

})