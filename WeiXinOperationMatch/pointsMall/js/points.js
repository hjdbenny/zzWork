$(function() {
	//获取当前积分
	$.ajax({
		type: "POST",
		url: "http://www.decaihui.com/wxdch/api/jf/points/getCurUserPoints.do",
		async: true,
		contentType: "application/json",
		success: function(data) {
			if(data.data == null) {
				$("#currentPoint").html("--")
				$("#updateTime").html("暂未更新")
			} else {
				$("#currentPoint").html(data.data.point)
				$("#updateTime").html(data.data.updateTime)
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
					status: 1,
					begPageNo: pageNum,
					total: pageSize
				}
			} else {
				var obj = {
					status: 0,
					begPageNo: pageNum,
					total: pageSize
				}
			}
			$.ajax({
				type: "POST",
				url: "http://www.decaihui.com/wxdch/api/jf/points/listCurUserHistoryPoints.do",
				async: true,
				contentType: "application/json",
				data: JSON.stringify(obj),
				success: function(data) {
					if(data.data.length == 0) {
						$("#mescroll").hide()
						$("#noData").show()
						$("#orderContent").hide()
					} else {
						$("#noData").hide()
						$("#orderContent").show()
						$("#mescroll").show()
						//添加显示数据
						successCallback(data.data);
					}
				},
				error: errorCallback
			});

		}, 100)
	}

	function setListData(curPageData) {
		for(var i = 0; i < curPageData.length; i++) {
			curPageData[i].createTime = new Date(curPageData[i].createTime).Format("yyyy-MM-dd")
		}
		var newArr = restoreArr(curPageData)
		var hasShow=false
		$(".createTime").each(function(){
			if($(this).html()==newArr[0].createTime){
				hasShow=true
			}else{
				hasShow=false
			}
		})
		for(var i = 0; i < newArr.length; i++) {
			var lis = ""
			lis += `<li>`
			lis += `<ul class="record"></ul>`
			lis += "</li>"
			$("#mescroll>ul").append($(lis))
			if(!hasShow){
				var createTime=`<div class="createTime">${newArr[i].createTime}</div>`
				$(createTime).insertBefore($("#mescroll>ul>li:last-child .record"))
			}
			for(var j = 0; j < newArr[i].data.length; j++) {
				if(newArr[i].data[j].type == "0") {
					var imgSrc = "img/byInvite.png"
				} else {
					var imgSrc = "img/byGift.png"
				}
				if(newArr[i].data[j].status=="0"){
					var points=`-${newArr[i].data[j].points} 积分`
				}else{
					var points=`+${newArr[i].data[j].points} 积分`
				}
				var rLis = ""
				rLis += `<li>`
				rLis += `<div><img src="${imgSrc}" /></div>`
				rLis += `<div><span>${newArr[i].data[j].description}</span><span>${points}</span></div>`
				rLis += `</li>`
				$("#mescroll>ul>li:last-child .record").append($(rLis))
			}
		}
	}

	function restoreArr(arr) { //重新根据相同属性，划分数组
		var map = {},
			dest = [];
		for(var i = 0; i < arr.length; i++) {
			var ai = arr[i];
			if(!map[ai.createTime]) {
				dest.push({
					createTime: ai.createTime,
					data: [ai]
				});
				map[ai.createTime] = ai;
			} else {
				for(var j = 0; j < dest.length; j++) {
					var dj = dest[j];
					if(dj.createTime == ai.createTime) {
						dj.data.push(ai);
						break;
					}
				}
			}
		}
		return dest
	}
	// 对Date的扩展，将 Date 转化为指定格式的String
	// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符， 
	// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) 
	// 例子： 
	// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423 
	// (new Date()).Format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18 
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
})