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
		url: "http://www.decaihui.com/wxdch/api/monthlyReport/getMonthlyReport/"+strDate+".do",
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
//	$scope.first_middle = "<div align='center'><font size='5' color='#fcfacc'>18%-42%</font><br>&nbsp;<font color='#f9f487'>模拟盘 年化收益 </font><br><font color='#f6f053'>2017-8</font></div>"
//	$scope.first_bottom = "<div align='center'><font color='#ffffff'>期货有风险，投资需谨慎</font></div>"
//
//	$scope.page2_title = "<div align='center'><b><font size='5' color='#ffbd2e'>中州期货久赢计划</font></b></div>"
//	$scope.jh = "<font color='#d5d5fe'>长久</font><br><font size='5' color='#ffffff'>结合基本面    专业建议<br><br></font><font color='#d5d5fe'>持续</font><br><font size='5' color='#ffffff'>99% 保证金     极低杠杆<br><br></font><font color='#d5d5fe'>稳健</font><br><font size='5' color='#ffffff'>贴合实际  大方向清晰</font>"
//
//	$scope.page3_title = "<div align='center'><b><font size='5'><font color='#ffbd2e'>风险</font><font color='#ffffff'>控制</font></font></b></div>"
//	$scope.jl_title = "<div align='center'><font size='6' color='#d5d5fe'>久赢纪律</font></div>"
//	$scope.jl1 = "<div align='center'><font color='#ffffff'>99%保证金比例 严格控制资金使用比例。</font></div>"
//	$scope.jl2 = "<div align='center'><font color='#ffffff'>基本面结合技术面 专业分析师服务，直触产品的扎实投研是持续盈利的导航。</font></div>"
//	$scope.jl3 = "<div align='center'><font color='#ffffff'>严守纪律 按计划交易 不受盘中干扰。</font></div>"
//
//	$scope.analyst1 = "<div align='center'><b><font size='5'><font color='#ffbd2e'>金牌分析师</font><font color='#ffffff'>月度业绩</font></font></b></div>"
//	$scope.analyst2= "<div align='center'><b><font size='5'><font color='#ffbd2e'>金牌分析师</font><font color='#ffffff'>月度业绩</font></font></b></div>"
//	$scope.analyst3= "<div align='center'><b><font size='5'><font color='#ffbd2e'>金牌分析师</font><font color='#ffffff'>月度业绩</font></font></b></div>"
//	$scope.tg_name1 = "大明"
//	$scope.tg_depart1 = "金牌分析师"
//	$scope.tg_name2 = "老王"
//	$scope.tg_depart2 = "金牌分析师"
//	$scope.tg_name3 = "华良"
//	$scope.tg_depart3 = "金牌分析师"
//	$scope.records_left1 = [{
//		"name": "期末资金",
//		"count": "1034,900元"
//	}, {
//		"name": "初始资金",
//		"count": "1000,000元"
//	}, {
//		"name": "月度开仓量",
//		"count": "25手"
//	}]
//	$scope.records_right1 = [{
//		"name": "年化收益率",
//		"count": "41.88%"
//	}, {
//		"name": "月度收益率",
//		"count": "3.49%"
//	}, {
//		"name": "月度开仓次数",
//		"count": "1"
//	}, {
//		"name": "日均开仓次数",
//		"count": "0.05"
//	}]
//	$scope.records_left2 = [{
//		"name": "期末资金",
//		"count": "1025,900元"
//	}, {
//		"name": "初始资金",
//		"count": "1000,000元"
//	}, {
//		"name": "月度开仓量",
//		"count": "60手"
//	}]
//	$scope.records_right2 = [{
//		"name": "年化收益率",
//		"count": "31.08%"
//	}, {
//		"name": "月度收益率",
//		"count": "2.59%"
//	}, {
//		"name": "月度开仓次数",
//		"count": "5"
//	}, {
//		"name": "日均开仓次数",
//		"count": "0.26"
//	}]
//	$scope.records_left3 = [{
//		"name": "期末资金",
//		"count": "1015,200元"
//	}, {
//		"name": "初始资金",
//		"count": "1000,000元"
//	}, {
//		"name": "月度开仓量",
//		"count": "35手"
//	}]
//	$scope.records_right3 = [{
//		"name": "年化收益率",
//		"count": "18.24%"
//	}, {
//		"name": "月度收益率",
//		"count": "1.52%"
//	}, {
//		"name": "月度开仓次数",
//		"count": "6"
//	}, {
//		"name": "日均开仓次数",
//		"count": "0.32"
//	}]
//
//	$scope.page7_title = "<div align='center'><b><font size='5'><font color='#ffffff'>久赢</font><font color='#ffbd2e'>客户情况</font></font></b></div>"
//	$scope.totalInfo = [{
//		"name": "本月开户数量",
//		"count": "82"
//	}, {
//		"name": "交易客户数量",
//		"count": "26"
//	}, {
//		"name": "入金客户数量",
//		"count": "38"
//	}, {
//		"name": "实时保证金",
//		"count": "2215,223"
//	}]
//	$scope.yingliData = [{
//		"name": "客户数量",
//		"count": "10"
//	}, {
//		"name": "累计盈利",
//		"count": "11,060"
//	}, {
//		"name": "开仓总数",
//		"count": "199"
//	}, {
//		"name": "平均开仓数量",
//		"count": "19.9"
//	}, {
//		"name": "日均开仓手数",
//		"count": "3.1"
//	}, {
//		"name": "累计日均权益",
//		"count": "590,062"
//	}, {
//		"name": "月度收益率",
//		"count": "1.7%"
//	}, {
//		"name": "年化收益率",
//		"count": "20.4%"
//	}]
//	$scope.kuisunData = [{
//		"name": "客户数量",
//		"count": "16"
//	}, {
//		"name": "累计亏损",
//		"count": "365,50"
//	}, {
//		"name": "开仓总数",
//		"count": "161"
//	}, {
//		"name": "平均开仓数量",
//		"count": "10.1"
//	}, {
//		"name": "日均开仓手数",
//		"count": "1.6"
//	}, {
//		"name": "累计日均权益",
//		"count": "698,323"
//	}, {
//		"name": "月度收益率",
//		"count": "-3.9%"
//	}, {
//		"name": "年化收益率",
//		"count": "-46.8%"
//	}]
//
//	$scope.page8_title = "<div align='center'><b><font size='5'><font color='#ffffff'>客户</font><font color='#ffbd2e'>排行榜</font></font></b></div>"
//	$scope.sy_records = [{
//		"rank": "1",
//		"name": "*杨",
//		"account": "*****27",
//		"profit": "3,305",
//		"profitRatio": "49%"
//	}, {
//		"rank": "2",
//		"name": "*易",
//		"account": "****66",
//		"profit": "13,670",
//		"profitRatio": "33%"
//	}, {
//		"rank": "3",
//		"name": "*兵",
//		"account": "*****93",
//		"profit": "4,890",
//		"profitRatio": "9%"
//	}, {
//		"rank": "4",
//		"name": "*民",
//		"account": "****66",
//		"profit": "6,480",
//		"profitRatio": "4%"
//	}, {
//		"rank": "5",
//		"name": "*丹",
//		"account": "*****37",
//		"profit": "510",
//		"profitRatio": "1%"
//	}]
//	$scope.ks_records = [{
//		"rank": "1",
//		"name": "*俊",
//		"account": "*****13",
//		"profit": "-7,790",
//		"profitRatio": "-14%"
//	}, {
//		"rank": "2",
//		"name": "*航",
//		"account": "*****21",
//		"profit": "-9,475",
//		"profitRatio": "-12%"
//	}, {
//		"rank": "3",
//		"name": "*君",
//		"account": "*****76",
//		"profit": "-3,790",
//		"profitRatio": "-9%"
//	}, {
//		"rank": "4",
//		"name": "*伟",
//		"account": "*****71",
//		"profit": "-3,280",
//		"profitRatio": "-7%"
//	}, {
//		"rank": "5",
//		"name": "*琦",
//		"account": "*****43",
//		"profit": "-2,910",
//		"profitRatio": "-7%"
//	}]
//
//	$scope.page9_title = "<div align='center'><b><font size='5'><font color='#ffffff'>久赢</font><font color='#ffbd2e'>月评服务</font></font></b></div>"
//	$scope.comments = "<font color='#ffffff'>金牌分析师收益在线，折合年化收益率</font><font size='5' color='#feb92d'>18%—42%</font><br><br><font color='#ffffff'>客户收益不在线，超 </font><font size='5' color='#feb92d'>50%</font> <font color='#ffffff'>客户未盈利</font><br><br><font color='#ffffff'>客户对分析师模拟盘操作采信度太低，从服务角度出发，期望的分析师模型应该是</font><font size='5' color='#feb92d'>客户盈利超过分析师</font><font color='#ffffff'>。</font>"
//
//	$scope.page10_title = "<div align='center'><b><font size='5'><font color='#ffbd2e'>客户亏损</font><font color='#ffffff'>几大主因</font></font></b></div>"
//	$scope.reasons = "<font color='#8D8DC6'>从</font><font size='5' color='#feb92d'>大数据分析</font><font color='#8D8DC6'>客户亏损几大主因</font><br><font color='#ffffff'><br>凭盘面和经验判断，逆势开仓，搞错方向<br><br>分析师服务中，缺乏明确的操作建议<br><br>很多亏损是在方向正确的时候，由于错误地设置止损导致 </font>"
//
//	$scope.page11_title = "<div align='center'><b><font size='5'><font color='#ffffff'>8月</font><font color='#ffbd2e'>建议</font></font></b></div>"
//	$scope.suggests = "<font size='5' color='#ffffff'>紧跟金牌分析师</font><br><font color='#8D8DC6'>以分析师模拟盘作为操作主依据，形成跟随模拟盘操作的简易模式</font><br><br><font size='5' color='#ffffff'>把握进场时机</font><br><font color='#8D8DC6'>低于分析师成本时考虑及时入场，高于分析师成本时认真分析，谨慎参与</font>"
//
//	$scope.page12_title = "<div align='center'><b><font size='5'><font color='#ffbd2e'>金牌分析师</font><font color='#ffffff'>实力</font></font></b></div>"
//	$scope.basicPanel = "<div align='center'><font size='5' color='#ffffff'>基本面</font><br></div><div align='center'><font color='#8D8DC6'>背靠复星集团资源  上海钢联的兄弟企业紧跟现货走势  第一手现货咨讯结合</font></div>"
//	$scope.leftPanel = "<div align='right'><font size='5' color='#ffffff'>技术面</font><br><font color='#8D8DC6'>超20年期货从业经历</font><br><font color='#8D8DC6'>完整经历期市大轮回</font><br><font color='#8D8DC6'>从盘面走势到合约轮换</font><br><font color='#8D8DC6'>均有独到见解</font></div>"
//	$scope.rightPanel = "<div align='left'><font size='5' color='#ffffff'>量化</font><br><font color='#8D8DC6'>大数据复盘</font><br><font color='#8D8DC6'>不同角度的数据分析</font><br><font color='#8D8DC6'>摆脱人为干扰</font><br><font color='#8D8DC6'>还原真实数据表现</font></div>"

	function getPer(str){
		len1=str.indexOf('">')+2
		len2=str.indexOf("%")+1
		strB=str.substring(len1,len2)
		return strB
	}
	function hxtShow() {
		$('.leftCircle .inner_circle').circleProgress({
//			value: 0.017,
			value: parseFloat(getPer($scope.yingliData[6].count)) / 100,
			emptyFill: "#19164d", //圆环背景色
			size: 50,
			fill: {
				gradient: ['#dc12c3', '#aa13d2']
			}
		})
		$('.leftCircle .outer_circle').circleProgress({
//			value: 0.204,
			value: parseFloat(getPer($scope.yingliData[7].count)) / 100,
			emptyFill: "#19164d", //圆环背景色
			size: 85,
			fill: {
				gradient: ['#dc12c3', '#aa13d2']
			}
		})
		$('.rightCircle .inner_circle').circleProgress({
//			value: 0.039,
			value: Math.abs(parseFloat(getPer($scope.kuisunData[6].count)) / 100),
			emptyFill: "#19164d", //圆环背景色
			size: 50,
			fill: {
				gradient: ['#14fddc', '#2c24d7']
			}
		})
		$('.rightCircle .outer_circle').circleProgress({
//			value: 0.468,
			value: Math.abs(parseFloat(getPer($scope.kuisunData[7].count)) / 100),
			emptyFill: "#19164d", //圆环背景色
			size: 85,
			fill: {
				gradient: ['#14fddc', '#2c24d7']
			}
		})
	}
}