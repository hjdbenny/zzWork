$(function() {
	$(window).scroll(function() {
		if($(document).scrollTop() > $("header").height()) {
			$("nav").css({
				"top": "0",
				"position": "fixed"
			})
		} else {
			$("nav").css({
				"top": "10rem",
				"position": "absolute"
			})
		}
	})
//获取当前积分
	$.ajax({
		type: "POST",
		url: "http://www.decaihui.com/wxdch/api/jf/points/getCurUserPoints.do",
		async: true,
		contentType: "application/json",
		success:function(data){
			if(data.data==null){
				$("#points").html("0")
			}else{
				$("#points").html(data.data.points)
			}
		}
	});
	var mescroll = new MeScroll("mescroll", {
		page: {
			num: 1,
			size: 10
		},
		down:{
			use:false
		},
		up: {
			auto: true,
			callback: function(page, mescroll) { //上拉回调,此处可简写; 相当于 callback: function (page, mescroll) { getListData(page); }
				getListData(page);
			}
		}
	})

	function getListData(page) {
		//联网加载数据
		getListDataFromNet(page.num, page.size, function(curPageData) {
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

	function getListDataFromNet(pageNum, pageSize, successCallback, errorCallback) {
		var obj = {
			begPageNo: pageNum,
			total: pageSize
		}
		//延时一秒,模拟联网
		setTimeout(function() {
			$.ajax({
				type: "POST",
				url: "http://www.decaihui.com/wxdch/api/jf/commodity/listCommodities.do",
				async: true,
				contentType: "application/json",
				data: JSON.stringify(obj),
				success: function(data) {
					if(data.data.length == 0) {
						$("#mescroll").hide()
					} else {
						$("#mescroll").show()
						//添加显示数据
						successCallback(data.data);
					}
				},
				error: errorCallback
			});
		}, 1000)
	}

	function setListData(curPageData) {
		for(var i = 0; i < curPageData.length; i++) {
			var lis = ""
			lis += `<li data-productid="${curPageData[i].id}">`
			lis += `<div>${curPageData[i].point}积分</div>`
			lis += `<div>${curPageData[i].name}</div>`
			lis += `<div>${curPageData[i].description}</div>`
			lis += `<div class="zz"></div>`
			lis += "</li>"
			$("#mescroll ul").append($(lis))
			$("#mescroll ul li:last-child .zz").css({
				"background": `url(${curPageData[i].icon}) no-repeat center right`,
				"background-size": "100% 100%"
			})
		}
	}

})