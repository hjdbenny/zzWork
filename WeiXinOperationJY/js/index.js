var app = angular.module("monthReport", [])
app.controller("reportController", operation).filter(
	'to_trusted', ['$sce', function($sce) {
		return function(text) {
			return $sce.trustAsHtml(text);
		}
	}]
)

function operation($scope, $http,$timeout) {
	$('html').one('touchstart',function(){
		$("audio")[0].play();
		$(".music").addClass("playMusic")
	});
	$scope.canplay=true
	$scope.musicToggle=function(){
		if($scope.canplay){
			$(".music").removeClass("playMusic")
			$scope.canplay=false
			$("audio")[0].pause()
		}else{
			$(".music").addClass("playMusic")
			$scope.canplay=true
			$("audio")[0].play()
		}
	}
	$scope.totalSlider = $(".swiper-wrapper>li").length - 1
	var mySwiper = new Swiper('.swiper-container', {
		loop: false,
		direction: 'vertical',
		onSlideChangeStart: function(swiper) {
			if(swiper.activeIndex == $scope.totalSlider) { //切换结束时，告诉我现在是第几个slide
				mySwiper.lockSwipeToNext();
				$(".basicPanel").addClass("animated bounceInDown")
				$(".leftPanel").addClass("animated bounceInLeft")
				$(".rightPanel").addClass("animated bounceInRight")
			} else {
				mySwiper.unlockSwipeToNext();
				$(".basicPanel").removeClass("animated bounceInDown")
				$(".leftPanel").removeClass("animated bounceInLeft")
				$(".rightPanel").removeClass("animated bounceInRight")
			}
			if(swiper.activeIndex == 0) { //首页
				mySwiper.lockSwipeToPrev();
			} else {
				mySwiper.unlockSwipeToPrev();
			}
			if(swiper.activeIndex == 1) { //切换结束时，告诉我现在是第几个slide
				$(".jh").addClass("animated zoomIn")
			}else{
				$(".jh").removeClass("animated zoomIn")
			}
			if(swiper.activeIndex==2){
				$(".jl1").addClass("animated lightSpeedIn")
				$(".jl2").addClass("animated lightSpeedIn")
				$(".jl3").addClass("animated lightSpeedIn")
			}else{
				$(".jl1").removeClass("animated lightSpeedIn")
				$(".jl2").removeClass("animated lightSpeedIn")
				$(".jl3").removeClass("animated lightSpeedIn")
			}
			if(swiper.activeIndex==3||swiper.activeIndex==4||swiper.activeIndex==5){
				$(".trade_data li p").hide()
				$(".trade_data li p").fadeIn(1000)
				$(".fourth_name").addClass("shake-slow")
				var timer=$timeout(function(){
					$(".fourth_name").removeClass("shake-slow")
				},5000)
			}
			if(swiper.activeIndex == 6) { //切换结束时，告诉我现在是第几个slide
				hxtShow()
				$(".kh_totalInfo li").hide()
				$(".kh_totalInfo li").slideDown(1000)
				$(".yingli>ul>li div").hide()
				$(".yingli>ul>li div").fadeIn(1000)
				$(".kuisun>ul>li div").hide()
				$(".kuisun>ul>li div").fadeIn(1000)
			}
			if(swiper.activeIndex == 7) { //切换结束时，告诉我现在是第几个slide
				$(".sy_rank").addClass("animated lightSpeedIn")
				$(".ks_rank").addClass("animated lightSpeedIn")
			}else{
				$(".sy_rank").removeClass("animated lightSpeedIn")
				$(".ks_rank").removeClass("animated lightSpeedIn")
			}
			if(swiper.activeIndex == 8){
				$(".comments").addClass("animated rotateInDownLeft")			
			}else{
				$(".comments").removeClass("animated rotateInDownLeft")
			}
			if(swiper.activeIndex == 9){
				$(".reasons").addClass("animated rotateInDownRight")
			}else{
				$(".reasons").removeClass("animated rotateInDownRight")				
			}
			if(swiper.activeIndex == 10){
				$(".suggests").addClass("animated bounceInUp")
			}else{
				$(".suggests").removeClass("animated bounceInUp")
			}
		}
	});
	//获取url中的参数
	function getUrlParam(name) {
	 	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); //构造一个含有目标参数的正则表达式对象
	 	var r = window.location.search.substr(1).match(reg); //匹配目标参数
		 if (r != null) return unescape(r[2]); return null; //返回参数值
	}
	if(getUrlParam("date")!=null){
		strDate=getUrlParam("date")
	}else{
		strYear=new Date().getFullYear().toString()
		if(new Date().getMonth()<9){
			strmonth="0"+(new Date().getMonth()+1).toString()
		}else{
			strmonth=new Date().getMonth()+1
		}
		
		strDate=strYear+strmonth
	}
	$.ajax({
		type: "POST",
		url: "http://wx.zzfco.com/wxweb/api/monthlyReport/getMonthlyReport/"+strDate+".do",
		contentType: "application/json",
		async: true,
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			newData=JSON.parse(data.data.content)
			/*第一页参数*/
			$scope.first_middle = newData.firstMiddle
			$scope.first_bottom = newData.firstBottom	
			/*第二页参数*/
			$scope.page2_title=newData.page2Title
			$scope.jh=newData.page2Jh
			/*第三页参数*/
			$scope.page3_title=newData.page3Title
			$scope.jl_title=newData.page3JiTitle
			$scope.jl1=newData.page3Ji
			$scope.jl2=newData.page3Ji2
			$scope.jl3=newData.page3Ji3
			/*第四五六页参数*/
			$scope.analyst1=newData.analyst
			$scope.analyst2=newData.analyst2
			$scope.analyst3=newData.analyst3
			$scope.tg_name1=newData.tgName
			$scope.tg_depart1=newData.tgDepart
			$scope.tg_name2=newData.tgName2
			$scope.tg_depart2=newData.tgDepart2
			$scope.tg_name3=newData.tgName3
			$scope.tg_depart3=newData.tgDepart3
			$scope.records_left1=newData.recordsLeft
			$scope.records_right1=newData.recordsRight
			$scope.records_left2=newData.recordsLeft2
			$scope.records_right2=newData.recordsRight2
			$scope.records_left3=newData.recordsLeft3
			$scope.records_right3=newData.recordsRight3
			/*第七页参数*/
			$scope.page7_title=newData.page7Title
			$scope.totalInfo=newData.totalInfo
			$scope.yingliData=newData.yingliData
			$scope.kuisunData=newData.kuisunData
			/*第八页参数*/
			$scope.page8_title=newData.page8Title
			$scope.sy_records=newData.syRecords
			$scope.ks_records=newData.ksRecords
			/*第九页参数*/
			$scope.page9_title=newData.page9Title
			$scope.comments=newData.comments
			/*第十页参数*/			
			$scope.page10_title=newData.page10Title
			$scope.reasons=newData.reasons
			/*第十一页参数*/
			$scope.page11_title=newData.page11Title
			$scope.suggests=newData.suggests
			/*第十二页参数*/
			$scope.page12_title=newData.page12Title
			$scope.basicPanel=newData.basicPanel
			$scope.leftPanel=newData.leftPanel
			$scope.rightPanel=newData.rightPanel
			$scope.$digest()
		}
	});
	
	function getPer(str){
		len1=str.indexOf('">')+2
		len2=str.indexOf("%")+1
		strB=str.substring(len1,len2)
		return strB
	}
	function hxtShow() {
		$('.leftCircle .inner_circle').circleProgress({
			value: parseFloat(getPer($scope.yingliData[6].count)) / 100,
			emptyFill: "#19164d", //圆环背景色
			size: 50,
			fill: {
				gradient: ['#dc12c3', '#aa13d2']
			}
		})
		$('.leftCircle .outer_circle').circleProgress({
			value: parseFloat(getPer($scope.yingliData[7].count)) / 100,
			emptyFill: "#19164d", //圆环背景色
			size: 85,
			fill: {
				gradient: ['#dc12c3', '#aa13d2']
			}
		})
		$('.rightCircle .inner_circle').circleProgress({
			value: Math.abs(parseFloat(getPer($scope.kuisunData[6].count)) / 100),
			emptyFill: "#19164d", //圆环背景色
			size: 50,
			fill: {
				gradient: ['#14fddc', '#2c24d7']
			}
		})
		$('.rightCircle .outer_circle').circleProgress({
			value: Math.abs(parseFloat(getPer($scope.kuisunData[7].count)) / 100),
			emptyFill: "#19164d", //圆环背景色
			size: 85,
			fill: {
				gradient: ['#14fddc', '#2c24d7']
			}
		})
	}
}