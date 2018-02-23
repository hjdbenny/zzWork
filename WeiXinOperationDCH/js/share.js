$(function() {
	// 自定义创建随机串 自定义个数0 < ? < 32 
	function create_noncestr() {
		var str = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		var val = "";
		for(var i = 0; i < 16; i++) {
			val += str.substr(Math.round((Math.random() * 10)), 1);
		}
		return val;
	}
	// 自定义创建时间戳
	function create_timestamp() {
		return Date.parse(new Date());
	}
	var $noncestr = create_noncestr()
	var $timestamp = create_timestamp()

	function create_signature() {
		var signature = ""
		var obj = {
			noncestr: $noncestr,
			timestamp: $timestamp,
			url: window.location.href.split('#')[0]
		}
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxservice/wxapi/sign.do",
			async: false,
			data: JSON.stringify(obj),
			contentType: "application/json",
			success: function(data) {
				signature = data.data
			}
		})
		return signature
	}
	wx.config({
		debug: false,
		appId: 'wx7806a150c562b73c',
		timestamp: $timestamp,
		nonceStr: $noncestr,
		signature: create_signature(),
		jsApiList: [
			'checkJsApi',
			'onMenuShareTimeline',
			'onMenuShareAppMessage',
			'onMenuShareQQ',
			'onMenuShareWeibo',
			'onMenuShareQZone',
			'hideMenuItems'
		]
	});
	function getUrlParam(name) { //获取url中的参数
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
		var r = window.location.search.substr(1).match(reg); //匹配目标参数
		if(r != null) return unescape(r[2]);
		return null; //返回参数值
	}
	title = $("title").html()
	desc = ""
	wx.ready(function() {
		if(getUrlParam("isChild")) {
			wx.hideMenuItems({
				menuList: [
					'menuItem:share:appMessage',
					'menuItem:share:qq',
					'menuItem:share:timeline',
					'menuItem:share:weiboApp',
					'menuItem:share:QZone'
				]
			})
		}
		// 1 判断当前版本是否支持指定 JS 接口，支持批量判断
		wx.checkJsApi({
			jsApiList: [
				'getNetworkType',
				'previewImage'
			],
			success: function(res) {
				console.log(JSON.stringify(res));
			}
		});
		var shareHasGift=false//判断是否为分享有礼的页面
		if(getUrlParam("before")!=null||getUrlParam("before")!=undefined) {
			shareHasGift=true
		}else{
			shareHasGift=false
		}
		if(shareHasGift){
			var shareUrl = window.location.href
			var shareLink = `http://www.decaihui.com/wxweb/shareTransition.html?timestamp=${new Date().getTime()}&before=${getUrlParam("before")}`
		}else{
			var shareUrl = window.location.href.slice(33)
			var shareLink = `http://www.decaihui.com/wxweb/shareTransition.html?timestamp=${new Date().getTime()}&shareUrl=${shareUrl}`
		}	
		var shareData = {
			title: title,
			desc: desc,
			link: shareLink,
			imgUrl: "http://www.decaihui.com/wxweb/img/shareLogo.jpg",
			success: function(res) {
				//记录分享次数
				var shareObj = {
					url: window.location.href.split('?')[0]
				}
				$.ajax({
					type: "POST",
					url: "http://www.decaihui.com/wxweb/api/monthlyReport/addShareTimes.do",
					async: true,
					data: JSON.stringify(shareObj),
					contentType: "application/json",
					xhrFields: {
						withCredentials: true
					},
					success: function(data) {
						
					}
				});
			}
		};
		wx.onMenuShareAppMessage(shareData); // 监听“分享给朋友”
		wx.onMenuShareTimeline(shareData); // 监听“分享到朋友圈”
		wx.onMenuShareQQ(shareData); //监听“分享到QQ”
		wx.onMenuShareWeibo(shareData) //监听“分享到微博”
		wx.onMenuShareQZone(shareData) //监听“分享QQ空间”
	});
	wx.error(function(res) {
		console.log(res)
		//		alert("出错了" + res.errMsg);
	});
})