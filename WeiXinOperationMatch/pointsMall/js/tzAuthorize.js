$(function(){
	//跳转授权
	function tzSq(str){
		var shareUrl=str
		window.location.href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx7806a150c562b73c&redirect_uri=" + encodeURIComponent(shareUrl) + "&response_type=code&scope=snsapi_base&connect_redirect=1#wechat_redirect"
	}
	$(".rule").click(e=>{
		e.preventDefault()
		tzSq("http://www.decaihui.com/wxdch/pointsMall/rule.html?isChild=true")
	})
	$(".toMall").click(e=>{
		e.preventDefault()
		tzSq("http://www.decaihui.com/wxdch/api/view/pointsMall.do")
	})
	$(".toOrder").click(e=>{
		e.preventDefault()
		tzSq("http://www.decaihui.com/wxdch/pointsMall/pointsOrder.html?isChild=true")
	})
	$(".toInvitation").click(e=>{
		e.preventDefault()
		tzSq("http://www.decaihui.com/wxdch/pointsMall/invitation.html?isChild=true")
	})
	$(".points_box").click(e=>{
		e.preventDefault()
		tzSq("http://www.decaihui.com/wxdch/pointsMall/points.html?isChild=true")
	})
})
