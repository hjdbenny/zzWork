$(function() {
	//获取商品信息
	var commodityId=localStorage.getItem("productid")
	var productType=localStorage.getItem("productType")
	$.ajax({
		type: "POST",
		url: `http://www.decaihui.com/wxweb/api/jf/commodity/getCommodity/${commodityId}.do`,
		async: true,
		contentType: "application/json",
		success:function(data){
			$(".top>img").attr("src",data.data.detailPicture)
			$(".top>div").html(data.data.name)
			$(".info>p:first-of-type").html(data.data.description)
			$("#exchangePoints").html(`${data.data.point}积分`)
			$("#details").html(data.data.description)
			localStorage.setItem("commodityDescription",data.data.description)
			localStorage.setItem("commodityPoint",data.data.point)
			localStorage.setItem("commodityIcon",data.data.icon)
			setHeight()
		}
	});
	function setHeight(){
		$(".details").css("min-height", $("header").height() - $(".details").offset().top - parseInt($(".details").css("padding-top")) - parseInt($(".details").css("padding-bottom"))+ "px")	
	}
	$("footer").click(function() {
		window.location.href = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7806a150c562b73c&redirect_uri=" + encodeURIComponent("http://www.decaihui.com/wxweb/pointsMall/confirmOrder.html?isChild=true") + "&response_type=code&scope=snsapi_base&connect_redirect=1#wechat_redirect"
	})
})