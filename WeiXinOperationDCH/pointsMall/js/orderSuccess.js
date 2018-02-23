$(function() {
	$("#orderNum").html(sessionStorage.getItem("orderNum"))
	$("footer").click(function() {
		window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7806a150c562b73c&redirect_uri=" + encodeURIComponent("http://www.decaihui.com/wxweb/pointsMall/index.html") + "&response_type=code&scope=snsapi_base&connect_redirect=1#wechat_redirect"
	})
})