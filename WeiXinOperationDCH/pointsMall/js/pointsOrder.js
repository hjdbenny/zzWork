$(function() {
	$(window).scroll(function() {
		if($(document).scrollTop() >= $("header").height()) {
			$("nav").css({
				"top": "0",
				"position": "fixed"
			})
			$("#orderNav").css({
				"top": "4.5rem",
				"position": "fixed"
			})
		} else {
			$("nav").css({
				"top": "10rem",
				"position": "absolute"
			})
			$("#orderNav").css({
				"top": "14.5rem",
				"position": "absolute"
			})	
			
		}
	})
	//获取当前积分
	$.ajax({
		type: "POST",
		url: "http://www.decaihui.com/wxweb/api/jf/points/getCurUserPoints.do",
		async: true,
		contentType: "application/json",
		success: function(data) {
			if(data.data == null) {
				$("#points").html("0")
			} else {
				$("#points").html(data.data.points)
			}
		}
	});

	var pdType = 0
	var mescroll = new MeScroll("mescroll", {
		page: {
			num: 1,
			size: 10
		},
		down: {
			use: false
		},
		up: {
			auto: true,
			callback: function(page, mescroll) { //上拉回调,此处可简写; 相当于 callback: function (page, mescroll) { getListData(page); }
				getListData(page);
			},
			onScroll:function(mescoll,y,isup){
				$(document).scrollTop(y)
			}
		}
	})
	$(".orderNav li").each(function() {
		$(this).click(function() {
			$(".orderNav li").removeClass("order_active")
			$(this).addClass("order_active")
			pdType = $(this).data("type")
			$("#mescroll ul").empty()
			mescroll.resetUpScroll();
		})
	})

	function getListData(page) {
		//联网加载数据
		getListDataFromNet(pdType, page.num, page.size, function(curPageData,totalSize) {
			//联网成功的回调,隐藏下拉刷新和上拉加载的状态;
			//mescroll会根据传的参数,自动判断列表如果无任何数据,则提示空;列表无下一页数据,则提示无更多数据;
			//方法一(推荐): 后台接口有返回列表的总页数 totalPage
			//mescroll.endByPage(curPageData.length, totalPage); //必传参数(当前页的数据个数, 总页数)
			//方法二(推荐): 后台接口有返回列表的总数据量 totalSize
			//			mescroll.endBySize(curPageData.length, totalSize); //必传参数(当前页的数据个数, 总数据量)
			//方法三(推荐): 您有其他方式知道是否有下一页 hasNext
			//mescroll.endSuccess(curPageData.length, hasNext); //必传参数(当前页的数据个数, 是否有下一页true/false)
			mescroll.endBySize(curPageData.length, totalSize);
			setListData(curPageData);
		}, function() {
			//联网失败的回调,隐藏下拉刷新和上拉加载的状态;
			mescroll.endErr();
		});
	}

	function setListData(curPageData) {
		for(var i = 0; i < curPageData.length; i++) {
			var orderTime = new Date(curPageData[i].orderTime).Format("yyyy-MM-dd");
			if(curPageData[i].orderStatus == "1") {
				var orderStatus = "已发货"
			} else {
				var orderStatus = "待发货"
			}
			var lis = ""
			lis += `<li data-orderid="${curPageData[i].orderId}">`
			lis += `<img src="${curPageData[i].commodityIcon}"/>`
			lis += `<div><p>${i}.${curPageData[i].commodityName}</p><p>-${curPageData[i].points}积分</p><p>消费时间${orderTime}</p><div class="orderStatus">${orderStatus}</div></div>`
			lis += "</li>"
			$("#mescroll ul").append($(lis))
			if(curPageData[i].orderStatus == "1") {
				$("#mescroll ul li:last-child .orderStatus").addClass("hasSend")
			} else {
				$("#mescroll ul li:last-child .orderStatus").addClass("noSend")
			}
		}
		$("#mescroll ul li").each(function() {
			$(this).click(function() {
				localStorage.setItem("orderId", $(this).data("orderid"))
				window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7806a150c562b73c&redirect_uri=" + encodeURIComponent("http://www.decaihui.com/wxweb/pointsMall/orderDetails.html?isChild=true") + "&response_type=code&scope=snsapi_base&connect_redirect=1#wechat_redirect"
			})
		})
	}

	function getListDataFromNet(pdType, pageNum, pageSize, successCallback, errorCallback) {
		//延时一秒,模拟联网
		setTimeout(function() {
			if(pdType == "0") {
				var obj = {
					status: null,
					begPageNo: pageNum,
					total: pageSize
				}
			} else if(pdType == "1") {
				var obj = {
					status: 0,
					begPageNo: pageNum,
					total: pageSize
				}
			} else {
				var obj = {
					status: 1,
					begPageNo: pageNum,
					total: pageSize
				}
			}
			$.ajax({
				type: "POST",
				url: "http://www.decaihui.com/wxweb/api/jf/order/listCurUserOrders.do",
				async: true,
				contentType: "application/json",
				data: JSON.stringify(obj),
				success: function(data) {
					if(data.data.length == 0) {
						$("#mescroll").hide()
						$("#orderContent").hide()
						$("#noData").show()
					} else {
						$("#mescroll").show()
						$("#orderContent").show()
						$("#noData").hide()
						//添加显示数据
						successCallback(data.data,data.total);
					}
				},
				error: errorCallback
			});

		}, 1000)
	}
})