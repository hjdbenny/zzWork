$(function() {

	var filterDepart = []
	$.ajax({
		type: "POST",
		url: "http://www.decaihui.com/wxdch/api/vip/groupIds.do",
		async: false,
		contentType: "application/json",
		success: function(data) {
			for(var i = 0; i < data.data.length; i++) {
				filterDepart.push(data.data[i].groupId)
			}
			allDepart = data.data
			$(".totalPeople").html(data.total)
		}
	});

	//所有营业部	
	for(var i = 0; i < allDepart.length; i++) {
		var lis = ""
		lis += "<li><span class='depart'>" + allDepart[i].groupId + "</span><span>" + allDepart[i].number + "人</span><img src='http://www.decaihui.com/wxdch/img/select.png'></li>"
		$(".middle ul").append($(lis))
	}
	$(".middle ul li").each(function() {
		$(this).click(function() {
			if($(this).find("img").is(":visible")) {
				$(this).css("background", "#FFFFFF")
				$(this).find("img").hide()
			} else {
				$(this).css("background", "#d8e9ee")
				$(this).find("img").show()
			}
		})
	})
	//营业部选择
	$(".filter").click(function() {
		$(".container").show()
		$(this).css("color", "#a47f47")
		$(".totalRatio").css("color", "#979797")
		$(".todayRatio").css("color", "#979797")
		$(".selectTotalRatio").hide()
		$(".todayRatio .up_arrow").css("border-bottom-color", "#969696")
		$(".todayRatio .down_arrow").css("border-top-color", "#969696")
		$("#selectMonth").html("请先选择月份：")
		$("#selectMonth").css("color", "#969696")
		$(".selectTotalRatio li img").hide()
	})
	//全选营业部
	$("#allSelect").click(function() {
		var allFlag = false
		$(".middle ul li").each(function() {
			if($(this).find("img").is(":hidden")) {
				allFlag = true
			}
		})
		if(allFlag) {
			$(".middle ul li").css("background", "#d8e9ee")
			$(".middle ul li").find("img").show()
		} else {
			$(".middle ul li").css("background", "#ffffff")
			$(".middle ul li").find("img").hide()
		}
	})
	urlArr = location.href.split("/")
	//	vipOpenId = urlArr[urlArr.length - 2]
	//	time = urlArr[urlArr.length - 1].substring(0, urlArr[urlArr.length - 1].indexOf(".do"))
	vipOpenId = localStorage.getItem("p")

	var calendar = new datePicker();
	cxMonth = ""

	function getNowFormatDate() {
		var date = new Date();
		var seperator1 = "-";
		var month = date.getMonth();
		var strDate = date.getDate();
		if(month == 0) {
			month = 12
		}
		if(month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if(strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
		}
		var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
		return currentdate;
	}
	var calendar = new datePicker();
	calendar.init({
		'trigger': '#selectMonth',
		/*按钮选择器，用于触发弹出插件*/
		'type': 'ym',
		/*模式：date日期；datetime日期时间；time时间；ym年月；*/
		'minDate': '2017-06-01',
		/*最小日期*/
		'maxDate': getNowFormatDate(),
		/*最大日期*/
		'onSubmit': function() { /*确认时触发事件*/
			var theSelectData = calendar.value;
			dataArr = theSelectData.split("-")
			$("#selectMonth").html("月份选择:" + dataArr[0] + "年" + dataArr[1] + "月")
			$("#selectMonth").css("color", "#a47f47")
			cxMonth = theSelectData.split("-")[0]+theSelectData.split("-")[1]
		},
		'onClose': function() { /*取消时触发事件*/ }
	});

	//筛选取消
	$(".cancel").click(function() {
		$(".container").hide()
		$(".filter").css("color", "#4e4e4e")
	})

	var mescroll = new MeScroll("mescroll", {
		page: {
			num: 1,
			size: 10
		},
		auto: true,
		up: {
			callback: function(page, mescroll) { //上拉回调,此处可简写; 相当于 callback: function (page, mescroll) { getListData(page); }
				getListData(page);
			},
		}
	})
	var pdType = 0
	historyRecord = JSON.parse(sessionStorage.getItem("historyRecord"))
	if(historyRecord == null || historyRecord == "" || historyRecord == undefined) {
		pdType = 0; //默认搜索0，筛选搜索1，关键字搜索2,关键字+营业部3//当日收益排序-正序4，当日收益排序-倒序5//累计收益排序-正序6，累计收益排序-倒序7
	} else {
		pdType = historyRecord.pdType
		keywords = historyRecord.key
		filterDepart = historyRecord.groupIds
		order = historyRecord.order
		cxMonth = historyRecord.month
		if(pdType == 6 || pdType == 7) {
			$("#selectMonth").html("月份选择:" + cxMonth.split("-")[0] + "年" + cxMonth.split("-")[1] + "月")
			$("#selectMonth").css("color", "#a47f47")
			$(".totalRatio").css("color", "#a47f47")
			if(order == 1) {
				$(".selectTotalRatio li[data-pdtype='6'] img").show()
			} else {
				$(".selectTotalRatio li[data-pdtype='7'] img").show()
			}
		}
		if(pdType == 4 || pdType == 5) {
			$(".todayRatio").css("color", "#a47f47")
			if(order == 1) {
				$(".todayRatio .up_arrow").css("border-bottom-color", "#a47f47")
				$(".todayRatio .down_arrow").css("border-top-color", "#969696")
			} else {
				$(".todayRatio .up_arrow").css("border-bottom-color", "#969696")
				$(".todayRatio .down_arrow").css("border-top-color", "#a47f47")
			}
		}
		for(var i = 0; i < filterDepart.length; i++) {
			$(".department li").each(function(j) {
				if(filterDepart[i] == $(this).find("span[class='depart']").text()) {
					$(this).css("background", "#d8e9ee")
					$(this).find("img").show()
				}
			})
		}
	}
	hasKey = false //判断是否有输关键字
	//	营业部选择确认
	$(".confirm").click(function() {
		filterDepart = []
		$(".middle ul li").each(function() {
			if($(this).find("img").is(":visible")) {
				filterDepart.push($(this).find("span[class='depart']").text())
			}
		})
		if(filterDepart.length == 0) {
			alert("请选择营业部！")
		} else {
			if(hasKey) { //关键字输入框是否为空
				pdType = 3;
			} else {
				pdType = 1
			}
			$("#mescroll ul").empty()
			$(".filter").css("color", "#4e4e4e")
			$(".container").hide()
			mescroll.resetUpScroll();
		}
	})
	keywords = $(".search input").val()

	$(".search input").change(function() {
		keywords = $(".search input").val()
		if(keywords != "") {
			hasKey = true
		} else {
			hasKey = false
		}
	})
	//关键字搜索
	$(".search span").click(function() {
		$("#mescroll ul").empty()
		keywords = $(".search input").val()
		pdType = 2
		mescroll.resetUpScroll();
	})
	$(".search").on("submit", function() {
		$("#mescroll ul").empty()
		keywords = $(".search input").val()
		pdType = 2
		mescroll.resetUpScroll();
	})
	//当日收益率排序
	$(".todayRatio").toggle(function() {
		//		正序
		$("#mescroll ul").empty()
		$(".todayRatio .up_arrow").css("border-bottom-color", "#a47f47")
		$(".todayRatio .down_arrow").css("border-top-color", "#969696")
		$(".totalRatio").css("color", "#979797")
		$(".filter").css("color", "#979797")
		$(".container").hide()
		$(".selectTotalRatio").hide()
		$(this).css("color", "#a47f47")
		$("#selectMonth").html("请先选择月份：")
		$("#selectMonth").css("color", "#969696")
		$(".selectTotalRatio li img").hide()
		pdType = 4
		order = 1
		mescroll.resetUpScroll();
	}, function() {
		//		倒序
		$("#mescroll ul").empty()
		$(".totalRatio").css("color", "#979797")
		$(".filter").css("color", "#979797")
		$(".container").hide()
		$(".selectTotalRatio").hide()
		$(this).css("color", "#a47f47")
		$(".todayRatio .up_arrow").css("border-bottom-color", "#969696")
		$(".todayRatio .down_arrow").css("border-top-color", "#a47f47")
		$("#selectMonth").html("请先选择月份：")
		$("#selectMonth").css("color", "#969696")
		$(".selectTotalRatio li img").hide()
		pdType = 5
		order = 0
		mescroll.resetUpScroll();
	})
	//累计收益率排序
	$(".totalRatio").click(function() {
		$(".selectTotalRatio").show()
		$(this).css("color", "#a47f47")
		$(".todayRatio .up_arrow").css("border-bottom-color", "#969696")
		$(".todayRatio .down_arrow").css("border-top-color", "#969696")
		$(".filter").css("color", "#979797")
		$(".todayRatio").css("color", "#979797")
		$(".container").hide()
	})
	$(".selectTotalRatio li:gt(0)").each(function() {
		$(this).click(function() {
			if(cxMonth == "") {
				alert("请先选择月份！")
			} else {
				$(".selectTotalRatio li:gt(0) img").hide()
				$(this).find("img").show()
				if($(this).data("pdtype") == "6") {
					pdType = 6
					order = 1
				} else if($(this).data("pdtype") == "7") {
					pdType = 7
					order = 0
				}
				$(".selectTotalRatio").hide()
				$("#mescroll ul").empty()
				mescroll.resetUpScroll()
			}
		})
	})
	$(".selectTotalRatio ul").click(function(e) {
		e.stopPropagation()
	})
	$(".selectTotalRatio").click(function() {
		if(cxMonth == "") {
			$(".totalRatio").css("color", "#969696")
		}
		$(".selectTotalRatio").hide()
	})

	function getListData(page) {
		//联网加载数据
		getListDataFromNet(pdType, page.num, page.size, function(curPageData) {
			//联网成功的回调,隐藏下拉刷新和上拉加载的状态;
			//mescroll会根据传的参数,自动判断列表如果无任何数据,则提示空;列表无下一页数据,则提示无更多数据;
			//方法一(推荐): 后台接口有返回列表的总页数 totalPage
			//mescroll.endByPage(curPageData.length, totalPage); //必传参数(当前页的数据个数, 总页数)
			//方法二(推荐): 后台接口有返回列表的总数据量 totalSize
			//			mescroll.endBySize(curPageData.length, totalSize); //必传参数(当前页的数据个数, 总数据量)
			//方法三(推荐): 您有其他方式知道是否有下一页 hasNext
			//mescroll.endSuccess(curPageData.length, hasNext); //必传参数(当前页的数据个数, 是否有下一页true/false)
			mescroll.endSuccess(curPageData.length);
			setListData(curPageData);
		}, function() {
			//联网失败的回调,隐藏下拉刷新和上拉加载的状态;
			mescroll.endErr();
		});
	}
	/*设置列表数据*/
	function setListData(curPageData) {
		for(var i = 0; i < curPageData.length; i++) {
			var lis = ""
			lis += "<li>"
			lis += "<div class='info'>"
			lis += "<p><span class='name'>" + curPageData[i].clientName + "</span> 资金账户 " + curPageData[i].investorId + "</p>"
			lis += "<p>" + curPageData[i].investorId + "</p>"
			lis += "<p><span>" + curPageData[i].groupId + "</span></p>"
			lis += "</div>"
			lis += "<div class='btn jy' data-clientcode='" + curPageData[i].investorId + "'>我的久赢</div>"
			lis += "<div class='btn report' data-clientcode='" + curPageData[i].investorId + "'>月报历史</div>"
			lis += "</li>"
			$("#mescroll ul").append($(lis))
		}
		//跳转到我的久赢
		$(".jy").each(function(i) {
			$(this).click(function() {
				var tzUrl = `http://www.decaihui.com/wxdch/api/vip/myjy/${$(this).data("clientcode")}.do`
				window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7806a150c562b73c&redirect_uri=" + encodeURIComponent(tzUrl) + "&response_type=code&scope=snsapi_base&connect_redirect=1#wechat_redirect"
			})
		})
		//跳转到月报历史列表
		$(".report").each(function(i) {
			$(this).click(function() {
				var tzUrl = `http://www.decaihui.com/wxdch/api/vip/history/${$(this).data("clientcode")}/mine.do`
				window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7806a150c562b73c&redirect_uri=" + encodeURIComponent(tzUrl) + "&response_type=code&scope=snsapi_base&connect_redirect=1#wechat_redirect"
			})
		})
	}

	function getListDataFromNet(pdType, pageNum, pageSize, successCallback, errorCallback) {
		if(pdType == 0) {//默认搜索0，
			var obj = {
				key: keywords,
				type:0,
				month:"",
				order:1,
				groupIds: filterDepart,
				begPageNo: pageNum,
				total: pageSize
			}
		} else if(pdType == 1) {//筛选搜索1，
			var obj = {
				key: keywords,
				type:0,
				month:"",
				order:1,
				groupIds: filterDepart,
				begPageNo: pageNum,
				total: pageSize
			}
		} else if(pdType == 2) {//关键字搜索2,
			var obj = {
				type:0,
				month:"",
				order:1,
				key: keywords,
				begPageNo: pageNum,
				total: pageSize
			}
		} else if(pdType == 3) {//关键字+营业部3
			var obj = {
				type:0,
				month:"",
				order:1,
				key: keywords,
				groupIds: filterDepart,
				begPageNo: pageNum,
				total: pageSize
			}
		} else if(pdType == 4) {////当日收益排序-正序4，
			var obj = {
				month:"",
				type: 0,
				order: order,
				key: keywords,
				groupIds: filterDepart,
				begPageNo: pageNum,
				total: pageSize
			}
		} else if(pdType == 5) {//当日收益排序-倒序5
			var obj = {
				month:"",
				type: 0,
				order: order,
				key: keywords,
				groupIds: filterDepart,
				begPageNo: pageNum,
				total: pageSize
			}
		} else if(pdType == 6) {//累计收益排序-正序6
			var obj = {
				type: 1,
				order: order,
				month: cxMonth,
				key: keywords,
				groupIds: filterDepart,
				begPageNo: pageNum,
				total: pageSize
			}
		} else if(pdType == 7) {//，累计收益排序-倒序7
			var obj = {
				type: 1,
				order: order,
				month: cxMonth,
				key: keywords,
				groupIds: filterDepart,
				begPageNo: pageNum,
				total: pageSize
			}
		}
//		if(pdType < 4) {
//			ajaxUrl = "http://www.decaihui.com/wxdch/api/vip/listUsers.do"
//		} else {
//			ajaxUrl = "http://www.decaihui.com/wxdch/api/vip/ratioListUsers.do"
//		}
		ajaxUrl="http://www.decaihui.com/wxdch/api/vip/listUsers.do"
		//延时一秒,模拟联网
		setTimeout(function() {
			var historyObj = obj
			historyObj.pdType = pdType
			sessionStorage.setItem("historyRecord", JSON.stringify(historyObj))
			$.ajax({
				type: "POST",
				url: ajaxUrl,
				async: true,
				contentType: "application/json",
				data: JSON.stringify(obj),
				success: function(data) {
					if(data.data.length == 0) {
						$(".error").css("opacity", "1")
						$("#mescroll").hide()
					} else {
						$(".error").css("opacity", "0")
						$("#mescroll").show()
						//添加显示数据
						successCallback(data.data);
					}
				},
				error: errorCallback
			});
		}, 1000)
	}
})