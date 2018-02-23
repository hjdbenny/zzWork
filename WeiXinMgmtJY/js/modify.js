var app = angular.module("monthReport", [])
app.controller("reportController", operation).filter(
	'to_trusted', ['$sce', function($sce) {
		return function(text) {
			return $sce.trustAsHtml(text);
		}
	}]
)

function operation($scope, $http, $timeout, $http) {
	//权限控制
	currentQx=JSON.parse(sessionStorage.getItem("qxTotalArr"))
	for (var i=0;i<currentQx.length;i++) {
		if(currentQx[i].canShow=="1"){
			$(".left ul li[data-level='"+currentQx[i].level+"']").show()
		}
	}
	//	/*以下是管理界面js*/
	Array.prototype.unique = function() {
		var res = [];
		var json = {};
		for(var i = 0; i < this.length; i++) {
			if(!json[this[i]]) {
				res.push(this[i]);
				json[this[i]] = 1;
			}
		}
		return res;
	}
	addFlag = false
	$.ajax({
		type: "POST",
		url: "http://wx.zzfco.com/wxmgmt/api/jyMonthlyReport/listMonthDates.do",
		async: true,
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
//			console.log(data)
			var years = []
			var dateObj = []
			for(var i = 0; i < data.data.length; i++) {
				years.push(data.data[i].monthDate.substring(0, 4))
			}
			for(var i = 0; i < data.data.length; i++) {
				var temp = {}
				temp.reportId = data.data[i].id
				temp.year = data.data[i].monthDate.substring(0, 4)
				temp.month = data.data[i].monthDate.substring(4, 6)
				dateObj.push(temp)
			}
			years = years.unique()
			for(var i = 0; i < years.length; i++) {
				var ylis = ""
				ylis += "<li><span class='treeTitle' data-tip='" + years[i] + "'><span class='treeIcon'>+</span>" + years[i] + "年</span><ul class='treeNode'></ul></li>"
				$(".tree").append($(ylis))
			}
			for(var i = 0; i < dateObj.length; i++) {
				var mlis = ""
				if(dateObj[i].month < 10) {
					var treemonth = dateObj[i].month.slice(1)
				} else {
					var treemonth = dateObj[i].month
				}
				var treedate = dateObj[i].year + dateObj[i].month
				mlis += "<li data-treedate='" + treedate + "' data-reportid='" + dateObj[i].reportId + "'>" + treemonth + "</li>"
				$(".treeTitle").each(function() {
					if($(this).attr("data-tip") == dateObj[i].year) {
						$(this).parent().find("ul[class='treeNode']").append($(mlis))
					}
				})
			}
			$(".treeTitle").each(function() {
				$(this).toggle(function() {
					$(this).find("span[class='treeIcon']").html("-")
					$(this).parent().find("ul[class='treeNode']").slideDown()
				}, function() {
					$(this).find("span[class='treeIcon']").html("+")
					$(this).parent().find("ul[class='treeNode']").slideUp()
				})
			})
			$(".tree li:last-child ul li:last-child ").addClass("active")
			loadData($(".tree li:last-child ul li:last-child ").data("treedate"))
			//分享地址
			$scope.shareDate = $(".treeNode li[class='active']").data("treedate")
			$scope.shareAddress = "分享链接地址：http://wx.zzfco.com/wxweb/index.html?date=" + $scope.shareDate
			$(".treeNode li").each(function() {
				$(this).click(function() {
					$(".treeNode li").removeClass("active")
					$(this).addClass("active")
					addFlag = false
					loadData($(this).data("treedate"))
					//分享地址
					$scope.shareDate = $(".treeNode li[class='active']").data("treedate")
					$scope.shareAddress = "分享链接地址：http://wx.zzfco.com/wxweb/index.html?date=" + $scope.shareDate
				})
			})
		}
	});

	function getStrDate(str) {
		var strDateArr = str.split("-")
		if(strDateArr[1] > 0 && strDateArr[1] < 13) {
			strDate = strDateArr[0] + strDateArr[1]
			return strDate
		} else {
			alert("请输入正确的时间(格式：YYYY-MM)!!!")
		}

	}

	$scope.totalSlider = $(".swiper-wrapper>li").length - 1
	var mySwiper = new Swiper('.swiper-container', {
		loop: false,
		direction: 'vertical',
		mousewheelControl: true,
		onSlideChangeStart: function(swiper) {
			if(swiper.activeIndex == $scope.totalSlider) { //切换结束时，告诉我现在是第几个slide
				mySwiper.lockSwipeToNext();
			} else {
				mySwiper.unlockSwipeToNext();
			}
			if(swiper.activeIndex == 0) { //首页
				mySwiper.lockSwipeToPrev();
			} else {
				mySwiper.unlockSwipeToPrev();
			}
			if(swiper.activeIndex == 6) { //切换结束时，告诉我现在是第几个slide
				hxtShow()
			}
		}
	});
	$("#test").wysiwyg({
		position: 'top',
		buttons: {
			fontsize: {
				title: '字体大小',
				image: '\uf034', // <img src="path/to/image.png" width="16" height="16" alt="" />
				popup: function($popup, $button, $editor) {
					var list_fontsizes = {
						// Name : Size
						'Huge': 7,
						'Larger': 6,
						'Large': 5,
						'Normal': 4,
						'Small': 3,
						'Smaller': 2,
						'Tiny': 1
					};
					var $list = $('<div/>').addClass('wysiwyg-toolbar-list')
						.attr('unselectable', 'on');
					$.each(list_fontsizes, function(name, size) {
						var $link = $('<a/>').attr('href', '#')
							//							.css('font-size', (8 + (size * 3)) + 'px')
							.html(name)
							.click(function(event) {
								$("#test").wysiwyg('fontsize', size);
								$("#test").wysiwyg('close-popup');
								// prevent link-href-#
								event.stopPropagation();
								event.preventDefault();
								return false;
							});
						$list.append($link);
					});
					$popup.append($list);
				}
				//showstatic: true,    // wanted on the toolbar
				//showselection: true    // wanted on selection
			},
			bold: {
				title: '加粗 (Ctrl+B)',
				image: '\uf032', // <img src="path/to/image.png" width="16" height="16" alt="" />
				hotkey: 'b'
			},
			italic: {
				title: '斜体 (Ctrl+I)',
				image: '\uf033', // <img src="path/to/image.png" width="16" height="16" alt="" />
				hotkey: 'i'
			},
			underline: {
				title: '下划线 (Ctrl+U)',
				image: '\uf0cd', // <img src="path/to/image.png" width="16" height="16" alt="" />
				hotkey: 'u'
			},
			strikethrough: {
				title: '删除线 (Ctrl+S)',
				image: '\uf0cc', // <img src="path/to/image.png" width="16" height="16" alt="" />
				hotkey: 's'
			},

			forecolor: {
				title: '字体颜色',
				image: '\uf1fc' // <img src="path/to/image.png" width="16" height="16" alt="" />
			},
			alignleft: {
				title: '左对齐',
				image: '\uf036', // <img src="path/to/image.png" width="16" height="16" alt="" />
				//showstatic: true,    // wanted on the toolbar
				showselection: false // wanted on selection
			},
			aligncenter: {
				title: '居中',
				image: '\uf037', // <img src="path/to/image.png" width="16" height="16" alt="" />
				//showstatic: true,    // wanted on the toolbar
				showselection: false // wanted on selection
			},
			alignright: {
				title: '右对齐',
				image: '\uf038', // <img src="path/to/image.png" width="16" height="16" alt="" />
				//showstatic: true,    // wanted on the toolbar
				showselection: false // wanted on selection
			},
			alignjustify: {
				title: '两端对齐',
				image: '\uf039', // <img src="path/to/image.png" width="16" height="16" alt="" />
				//showstatic: true,    // wanted on the toolbar
				showselection: false // wanted on selection
			},
			unorderedList: {
				title: '无序列表',
				image: '\uf0ca', // <img src="path/to/image.png" width="16" height="16" alt="" />
				//showstatic: true,    // wanted on the toolbar
				showselection: false // wanted on selection
			},
			save: {
				title: '保存',
				image: '\uf0c7', // <img src="path/to/image.png" width="16" height="16" alt="" />
				//showstatic: true,    // wanted on the toolbar
				showselection: false // wanted on selection
			}
		}
	})
	//显示编辑区域
	$scope.showEdit = function(str, event) {
		event.stopPropagation()
		$(".canEdit").each(function() {
			if($(this).css("opacity") == 0) {
				$(this).css("opacity", "1")
			}
		})
		$(".wysiwyg-editor").attr("data-name", str)
		$(".wysiwyg-editor").html(getVar(str))
		editorWidth = $("." + str).width()
		editorHeight = $("." + str).height() + 35
		$(".modify").width(editorWidth)
		$(".modify").height(editorHeight)
		$(".modify").width(editorWidth + 2)
		$(".modify").height(editorHeight + 2)
		editorLeft = $("." + str).offset().left - $(".modifyPanel").offset().left
		editorTop = $("." + str).offset().top - $(".modifyPanel").offset().top - 35
		$(".modify").css({
			"left": editorLeft + "px",
			"top": editorTop + "px"
		})
		$("." + str).css("opacity", "0")
		$scope.sClass = str
		$(".modify").show()
	}
	//编辑工具栏保存
	$(".wysiwyg-toolbar a:last-of-type").click(function() {
		$(".modify").hide()
		$("." + $scope.sClass).css("opacity", "1")
		name = $(".wysiwyg-editor").attr("data-name")
		setVar(name)
		$("." + $scope.sClass).html($(".wysiwyg-editor").html())
	})
	//阻止冒泡事件
	$(".modify").click(function(e) {
		e.stopPropagation()
	})
	/*点击非编辑区域隐藏修改框*/
	$(document).click(function(e) {
		if($(".modify")[0].style.display == "block") {
			$(".modify").hide()
			$("." + $scope.sClass).css("opacity", "1")
			name = $(".wysiwyg-editor").attr("data-name")
			setVar(name)
			$("." + $scope.sClass).html($(".wysiwyg-editor").html())
		}
		$(".wx").fadeOut("slow")
	})
	$(document).keyup(function() {
		if($(".wysiwyg-editor").html() == "") {
			$(".wysiwyg-editor").html("请输入内容...")
		}
	})
	//保存提交
	$scope.btn = function() {
		var obj = {
			id: $scope.monthReportId,
			description: $("h1").html(),
			firstMiddle: $scope.first_middle,
			firstBottom: $scope.first_bottom,
			page2Title: $scope.page2_title,
			page2Jh: $scope.jh,
			page3Title: $scope.page3_title,
			page3JiTitle: $scope.jl_title,
			page3Ji: $scope.jl1,
			page3Ji2: $scope.jl2,
			page3Ji3: $scope.jl3,
			analyst: $scope.analyst1,
			analyst2: $scope.analyst2,
			analyst3: $scope.analyst3,
			tgName: $scope.tg_name1,
			tgDepart: $scope.tg_depart1,
			tgName2: $scope.tg_name2,
			tgDepart2: $scope.tg_depart2,
			tgName3: $scope.tg_name3,
			tgDepart3: $scope.tg_depart3,
			recordsLeft: $scope.records_left1,
			recordsRight: $scope.records_right1,
			recordsLeft2: $scope.records_left2,
			recordsRight2: $scope.records_right2,
			recordsLeft3: $scope.records_left3,
			recordsRight3: $scope.records_right3,
			page7Title: $scope.page7_title,
			totalInfo: $scope.totalInfo,
			yingliData: $scope.yingliData,
			kuisunData: $scope.kuisunData,
			page8Title: $scope.page8_title,
			syRecords: $scope.sy_records,
			ksRecords: $scope.ks_records,
			page9Title: $scope.page9_title,
			comments: $scope.comments,
			page10Title: $scope.page10_title,
			reasons: $scope.reasons,
			page11Title: $scope.page11_title,
			suggests: $scope.suggests,
			page12Title: $scope.page12_title,
			basicPanel: $scope.basicPanel,
			leftPanel: $scope.leftPanel,
			rightPanel: $scope.rightPanel
		}
		if(addFlag) {
			delete obj.id
			obj.monthDate = getStrDate($("h1").html())
		}
		$.ajax({
			type: "post",
			url: "http://wx.zzfco.com/wxmgmt/api/jyMonthlyReport/saveOrUpdate.do",
			async: true,
			contentType: "application/json",
			data: JSON.stringify(obj),
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				if(data.code == "000") {
					window.location.reload()
				} else {
					alert("提交失败!!!错误代码:" + data.code)
				}
			}
		});
	}
	//	//删除月报,该功能暂未添加
	$scope.del = function() {
		delObj = []
		delObj.push($("a[class='active']").data("reportid"))
		$.ajax({
			type: "post",
			url: "http://wx.zzfco.com/wxmgmt/api/jyMonthlyReport/monthlyReport/delete.do",
			async: true,
			contentType: "application/json",
			data: JSON.stringify(delObj),
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				window.location.reload()
			}
		});
	}

	//新增
	$scope.newAdd = function() {
		addFlag = true
		$(".moduel_title").removeAttr("disabled")
		$(".moduel_title").val("")
		$(".moduelInfo").show()
	}
	//保持模板信息
	$scope.saveInfo = function() {
		$("h1").html($(".moduel_title").val())
	}
	//关闭模版信息
	$scope.closeInfo = function() {
		$(".moduelInfo").hide()
	}
	//打开发布信息
	$scope.send = function() {
		$scope.first_step=false
		$scope.second_step=false
		$scope.third_step=false
		$(".publish_bg").show()
		$(".mangePanel").addClass("blur")	
	}
	//关闭发布信息
	$scope.publish_close = function() {
		$(".publish_bg").hide()
		$(".mangePanel").removeClass("blur")			
	}
	
	//发布信息第一步，上传缩略图
	$scope.publish_first_next=function(){
		$.ajax({
			url:"http://wx.zzfco.com:9091/weixin-service/wxapi/uploadMediaFile.do",
			type: 'POST',
			cache: false,
			data: new FormData($('#uploadForm')[0]),
			processData: false,
			contentType: false,
			success:function(data){
				$scope.imageMediaId=data.data.media_id		
			}
		})
		$scope.first_step=true
		$scope.second_step=true	
		$scope.third_step=false		
	}
	//发布信息第二步，编辑群发内容
	$scope.publish_second_prev=function(){
		$scope.first_step=false
		$scope.second_step=false	
		$scope.third_step=false	
	}	
	$scope.publish_second_next=function(){
		var contentArr=[]
		var contentObj={
			thumb_media_id:$scope.imageMediaId,
			author:$("#author").val(),
			title:$("#post_title").val(),
			content_source_url:"http://wx.zzfco.com/wxweb/index.html?date=" + $scope.shareDate,
			content:$("#con_content").val(),
			digest:$("#content_digest").val(),
			show_cover_pic:0
		}
		contentArr.push(contentObj)
		$.ajax({
			type: "post",
			url:"http://wx.zzfco.com/wxservice/wxapi/uploadMassSendNews.do",
			async: true,
			contentType: "application/json",
			data: JSON.stringify(contentArr),
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				$scope.mediaId=JSON.parse(data.data.json).media_id	
			}
		});
		publishDateYear=$(".treeNode li[class='active']").data("treedate").toString().substring(0,4)
		publishDateMonth=$(".treeNode li[class='active']").html()
		$scope.publish_notice="确定发布"+publishDateYear+"年"+publishDateMonth+"月久赢月报吗？"
		$scope.first_step=true
		$scope.second_step=false	
		$scope.third_step=true		
	}
	//发布信息第三步
	$scope.publish_third_prev=function(){
		$scope.first_step=true
		$scope.second_step=true	
		$scope.third_step=false	
	}	
	$scope.publish= function() {
		var publishObj={
			isPreview:1,
//			previewOpenId:"okHBNwyZhpQxsQXq0V82HgiXzRZM",
			msgtype:"mpnews",
			sendIgnoreReprint:1,
			mediaId:$scope.mediaId
		}
		$.ajax({
			type: "post",
			url: "http://wx.zzfco.com/wxservice/wxapi/sendMonthlyReport.do",
			async: true,
			contentType: "application/json",
			data: JSON.stringify(publishObj),
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
//				console.log(data)
				if(data.code=="000"){
//					console.log(JSON.parse(data.data.json))
					if(data.data.errorCode==0){
						alert("发布成功")
						$(".publish_bg").hide()
						$scope.first_step=false
						$scope.second_step=false
						$scope.third_step=false
						$(".mangePanel").removeClass("blur")									
					}else{
						alert("发布失败!!!错误代码"+data.data.errorCode)						
					}
				}else{
					alert("发布失败!!!错误代码"+data.code)
				}
			},
			error:function(){
					alert("接口出错，发布失败!!!")			
			}
		});
	}
	//分享
	$scope.share = function() {
		$(".share_bg").show()
		$('.Smohan_Layer_box').animate({
			opacity: 'show',
			marginTop: '0'
		}, "slow", function() {
			$('.Smohan_Layer_Shade').show();
			$('.Smohan_Layer_box .loading').hide();
		});
		$(".mangePanel").addClass("blur")
	}
	$('.Smohan_Layer_box .close').click(function(e) {
		$('.Smohan_Layer_box').animate({
			opacity: 'hide',
			marginTop: '-300px'
		}, "slow", function() {
			$(".share_bg").hide()
			$(".mangePanel").removeClass("blur")
			$('.Smohan_Layer_Shade').hide();
			$('.Smohan_Layer_box .loading').show();
		});
	});
	/*图标效果*/
	$('#Share li').each(function() {
		$(this).hover(function(e) {
			$(this).find('a').animate({
				marginTop: 2
			}, 'easeInOutExpo');
			$(this).find('span').animate({
				opacity: 0.2
			}, 'easeInOutExpo');
		}, function() {
			$(this).find('a').animate({
				marginTop: 12
			}, 'easeInOutExpo');
			$(this).find('span').animate({
				opacity: 1
			}, 'easeInOutExpo');
		});
	});
	var share_url = encodeURIComponent("http://wx.zzfco.com/wxweb/index.html?date=" + $scope.shareDate);
	var share_title = encodeURIComponent("久赢月报");
	var share_pic = ""; //默认的分享图片
	var share_from = encodeURIComponent("久赢月报"); //分享自（仅用于QQ空间和朋友网，新浪的只需更改appkey 和 ralateUid就行）
	//Qzone
	$('#Share li a.share1').click(function(e) {
		var share_url = encodeURIComponent("http://wx.zzfco.com/wxweb/index.html?date=" + $scope.shareDate);
		window.open("http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?url=" + share_url + "&title=" + share_title + "&pics=" + share_pic + "&site=" + share_from + "", "newwindow");
	});
	//Sina Weibo
	$('#Share li a.share2').click(function(e) {
		var share_url = encodeURIComponent("http://wx.zzfco.com/wxweb/index.html?date=" + $scope.shareDate);
		var param = {
			url: share_url,
			//			appkey: '678438995',
			title: share_title,
			pic: share_pic,
			//			ralateUid: '3061825921',
			rnd: new Date().valueOf()
		}
		var temp = [];
		for(var p in param) {
			temp.push(p + '=' + encodeURIComponent(param[p] || ''))
		}
		window.open('http://v.t.sina.com.cn/share/share.php?' + temp.join('&'));
	});
	//weixin
	$('#Share li a.share6').click(function(e) {
		$(".wx").fadeIn("slow")
		e.stopPropagation()
	})
	//载入数据
	function loadData(strDate) {
		$.ajax({
			type: "POST",
			url: "http://wx.zzfco.com/wxmgmt/api/jyMonthlyReport/getMonthlyReport/" + strDate + ".do",
			contentType: "application/json",
			async: true,
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				newData = JSON.parse(data.data.content)
				$scope.monthReportId = data.data.id
				$scope.monthTitle = data.data.description
				$(".moduel_title").val(data.data.description)
				$(".moduel_title").attr("disabled", "disabled")
				$(".moduelInfo").show()

				/*第一页参数*/
				$scope.first_middle = newData.firstMiddle
				$scope.first_bottom = newData.firstBottom
				/*第二页参数*/
				$scope.page2_title = newData.page2Title
				$scope.jh = newData.page2Jh
				/*第三页参数*/
				$scope.page3_title = newData.page3Title
				$scope.jl_title = newData.page3JiTitle
				$scope.jl1 = newData.page3Ji
				$scope.jl2 = newData.page3Ji2
				$scope.jl3 = newData.page3Ji3
				/*第四五六页参数*/
				$scope.analyst1 = newData.analyst
				$scope.analyst2 = newData.analyst2
				$scope.analyst3 = newData.analyst3
				$scope.tg_name1 = newData.tgName
				$scope.tg_depart1 = newData.tgDepart
				$scope.tg_name2 = newData.tgName2
				$scope.tg_depart2 = newData.tgDepart2
				$scope.tg_name3 = newData.tgName3
				$scope.tg_depart3 = newData.tgDepart3
				$scope.records_left1 = newData.recordsLeft
				$scope.records_right1 = newData.recordsRight
				$scope.records_left2 = newData.recordsLeft2
				$scope.records_right2 = newData.recordsRight2
				$scope.records_left3 = newData.recordsLeft3
				$scope.records_right3 = newData.recordsRight3
				/*第七页参数*/
				$scope.page7_title = newData.page7Title
				$scope.totalInfo = newData.totalInfo
				$scope.yingliData = newData.yingliData
				$scope.kuisunData = newData.kuisunData
				/*第八页参数*/
				$scope.page8_title = newData.page8Title
				$scope.sy_records = newData.syRecords
				$scope.ks_records = newData.ksRecords
				/*第九页参数*/
				$scope.page9_title = newData.page9Title
				$scope.comments = newData.comments
				/*第十页参数*/
				$scope.page10_title = newData.page10Title
				$scope.reasons = newData.reasons
				/*第十一页参数*/
				$scope.page11_title = newData.page11Title
				$scope.suggests = newData.suggests
				/*第十二页参数*/
				$scope.page12_title = newData.page12Title
				$scope.basicPanel = newData.basicPanel
				$scope.leftPanel = newData.leftPanel
				$scope.rightPanel = newData.rightPanel
				$scope.$digest()
			}
		});
	}

	function getPer(str) {
		len1 = str.indexOf('">') + 2
		len2 = str.indexOf("%") + 1
		strB = str.substring(len1, len2)
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

	function getVar(str) {
		switch(str) {
			case "first_middle":
				strA = $scope.first_middle;
				break;
			case "first_bottom":
				strA = $scope.first_bottom;
				break;
			case "page2_title":
				strA = $scope.page2_title;
				break;
			case "jh":
				strA = $scope.jh;
				break;
			case "page3_title":
				strA = $scope.page3_title;
				break;
			case "jl_title":
				strA = $scope.jl_title;
				break;
			case "jl1":
				strA = $scope.jl1;
				break;
			case "jl2":
				strA = $scope.jl2;
				break;
			case "jl3":
				strA = $scope.jl3;
				break;
			case "analyst1":
				strA = $scope.analyst1;
				break;
			case "tg_name1":
				strA = $scope.tg_name1
				break;
			case "tg_depart1":
				strA = $scope.tg_depart1
				break;
			case "records_left1_count0":
				strA = $scope.records_left1[0].count
				break;
			case "records_left1_count1":
				strA = $scope.records_left1[1].count
				break;
			case "records_left1_count2":
				strA = $scope.records_left1[2].count
				break;
			case "records_right1_count0":
				strA = $scope.records_right1[0].count
				break;
			case "records_right1_count1":
				strA = $scope.records_right1[1].count
				break;
			case "records_right1_count2":
				strA = $scope.records_right1[2].count
				break;
			case "records_right1_count3":
				strA = $scope.records_right1[3].count
				break;
			case "analyst2":
				strA = $scope.analyst2;
				break;
			case "tg_name2":
				strA = $scope.tg_name2
				break;
			case "tg_depart2":
				strA = $scope.tg_depart2
				break;
			case "records_left2_count0":
				strA = $scope.records_left2[0].count
				break;
			case "records_left2_count1":
				strA = $scope.records_left2[1].count
				break;
			case "records_left2_count2":
				strA = $scope.records_left2[2].count
				break;
			case "records_right2_count0":
				strA = $scope.records_right2[0].count
				break;
			case "records_right2_count1":
				strA = $scope.records_right2[1].count
				break;
			case "records_right2_count2":
				strA = $scope.records_right2[2].count
				break;
			case "records_right2_count3":
				strA = $scope.records_right2[3].count
				break;
			case "analyst3":
				strA = $scope.analyst3;
				break;
			case "tg_name3":
				strA = $scope.tg_name3
				break;
			case "tg_depart3":
				strA = $scope.tg_depart3
				break;
			case "records_left3_count0":
				strA = $scope.records_left3[0].count
				break;
			case "records_left3_count1":
				strA = $scope.records_left3[1].count
				break;
			case "records_left3_count2":
				strA = $scope.records_left3[2].count
				break;
			case "records_right3_count0":
				strA = $scope.records_right3[0].count
				break;
			case "records_right3_count1":
				strA = $scope.records_right3[1].count
				break;
			case "records_right3_count2":
				strA = $scope.records_right3[2].count
				break;
			case "records_right3_count3":
				strA = $scope.records_right3[3].count
				break;
			case "page7_title":
				strA = $scope.page7_title;
				break;
			case "totalInfo0":
				strA = $scope.totalInfo[0].count
				break;
			case "totalInfo1":
				strA = $scope.totalInfo[1].count
				break;
			case "totalInfo2":
				strA = $scope.totalInfo[2].count
				break;
			case "totalInfo3":
				strA = $scope.totalInfo[3].count
				break;
			case "yingliData0":
				strA = $scope.yingliData[0].count
				break;
			case "yingliData1":
				strA = $scope.yingliData[1].count
				break;
			case "yingliData2":
				strA = $scope.yingliData[2].count
				break;
			case "yingliData3":
				strA = $scope.yingliData[3].count
				break;
			case "yingliData4":
				strA = $scope.yingliData[4].count
				break;
			case "yingliData5":
				strA = $scope.yingliData[5].count
				break;
			case "yingliData6":
				strA = $scope.yingliData[6].count
				break;
			case "yingliData7":
				strA = $scope.yingliData[7].count
				break;
			case "kuisunData0":
				strA = $scope.kuisunData[0].count
				break;
			case "kuisunData1":
				strA = $scope.kuisunData[1].count
				break;
			case "kuisunData2":
				strA = $scope.kuisunData[2].count
				break;
			case "kuisunData3":
				strA = $scope.kuisunData[3].count
				break;
			case "kuisunData4":
				strA = $scope.kuisunData[4].count
				break;
			case "kuisunData5":
				strA = $scope.kuisunData[5].count
				break;
			case "kuisunData6":
				strA = $scope.kuisunData[6].count
				break;
			case "kuisunData7":
				strA = $scope.kuisunData[7].count
				break;
			case "page8_title":
				strA = $scope.page8_title;
				break;
			case "sy_records_name0":
				strA = $scope.sy_records[0].name
				break;
			case "sy_records_account0":
				strA = $scope.sy_records[0].account
				break;
			case "sy_records_profit0":
				strA = $scope.sy_records[0].profit
				break;
			case "sy_records_profitRatio0":
				strA = $scope.sy_records[0].profitRatio
				break;
			case "sy_records_name1":
				strA = $scope.sy_records[1].name
				break;
			case "sy_records_account1":
				strA = $scope.sy_records[1].account
				break;
			case "sy_records_profit1":
				strA = $scope.sy_records[1].profit
				break;
			case "sy_records_profitRatio1":
				strA = $scope.sy_records[1].profitRatio
				break;
			case "sy_records_name2":
				strA = $scope.sy_records[2].name
				break;
			case "sy_records_account2":
				strA = $scope.sy_records[2].account
				break;
			case "sy_records_profit2":
				strA = $scope.sy_records[2].profit
				break;
			case "sy_records_profitRatio2":
				strA = $scope.sy_records[2].profitRatio
				break;
			case "sy_records_name3":
				strA = $scope.sy_records[3].name
				break;
			case "sy_records_account3":
				strA = $scope.sy_records[3].account
				break;
			case "sy_records_profit3":
				strA = $scope.sy_records[3].profit
				break;
			case "sy_records_profitRatio3":
				strA = $scope.sy_records[3].profitRatio
				break;
			case "sy_records_name4":
				strA = $scope.sy_records[4].name
				break;
			case "sy_records_account4":
				strA = $scope.sy_records[4].account
				break;
			case "sy_records_profit4":
				strA = $scope.sy_records[4].profit
				break;
			case "sy_records_profitRatio4":
				strA = $scope.sy_records[4].profitRatio
				break;
			case "ks_records_name0":
				strA = $scope.ks_records[0].name
				break;
			case "ks_records_account0":
				strA = $scope.ks_records[0].account
				break;
			case "ks_records_profit0":
				strA = $scope.ks_records[0].profit
				break;
			case "ks_records_profitRatio0":
				strA = $scope.ks_records[0].profitRatio
				break;
			case "ks_records_name1":
				strA = $scope.ks_records[1].name
				break;
			case "ks_records_account1":
				strA = $scope.ks_records[1].account
				break;
			case "ks_records_profit1":
				strA = $scope.ks_records[1].profit
				break;
			case "ks_records_profitRatio1":
				strA = $scope.ks_records[1].profitRatio
				break;
			case "ks_records_name2":
				strA = $scope.ks_records[2].name
				break;
			case "ks_records_account2":
				strA = $scope.ks_records[2].account
				break;
			case "ks_records_profit2":
				strA = $scope.ks_records[2].profit
				break;
			case "ks_records_profitRatio2":
				strA = $scope.ks_records[2].profitRatio
				break;
			case "ks_records_name3":
				strA = $scope.ks_records[3].name
				break;
			case "ks_records_account3":
				strA = $scope.ks_records[3].account
				break;
			case "ks_records_profit3":
				strA = $scope.ks_records[3].profit
				break;
			case "ks_records_profitRatio3":
				strA = $scope.ks_records[3].profitRatio
				break;
			case "ks_records_name4":
				strA = $scope.ks_records[4].name
				break;
			case "ks_records_account4":
				strA = $scope.ks_records[4].account
				break;
			case "ks_records_profit4":
				strA = $scope.ks_records[4].profit
				break;
			case "ks_records_profitRatio4":
				strA = $scope.ks_records[4].profitRatio
				break;
			case "page9_title":
				strA = $scope.page9_title;
				break;
			case "comments":
				strA = $scope.comments;
				break;
			case "page10_title":
				strA = $scope.page10_title;
				break;
			case "reasons":
				strA = $scope.reasons;
				break;
			case "page11_title":
				strA = $scope.page11_title;
				break;
			case "suggests":
				strA = $scope.suggests;
				break;
			case "page12_title":
				strA = $scope.page12_title;
				break;
			case "basicPanel":
				strA = $scope.basicPanel;
				break;
			case "leftPanel":
				strA = $scope.leftPanel;
				break;
			case "rightPanel":
				strA = $scope.rightPanel;
				break;
		}
		return strA;
	}

	function setVar(str) {
		switch(str) {
			case "first_middle":
				$scope.first_middle = $(".wysiwyg-editor").html()
				break;
			case "first_bottom":
				$scope.first_bottom = $(".wysiwyg-editor").html()
				break;
			case "page2_title":
				$scope.page2_title = $(".wysiwyg-editor").html()
				break;
			case "jh":
				$scope.jh = $(".wysiwyg-editor").html()
				break;
			case "page3_title":
				$scope.page3_title = $(".wysiwyg-editor").html()
				break;
			case "jl_title":
				$scope.jl_title = $(".wysiwyg-editor").html()
				break;
			case "jl1":
				$scope.jl1 = $(".wysiwyg-editor").html()
				break;
			case "jl2":
				$scope.jl2 = $(".wysiwyg-editor").html()
				break;
			case "jl3":
				$scope.jl3 = $(".wysiwyg-editor").html()
				break;
			case "analyst1":
				$scope.analyst1 = $(".wysiwyg-editor").html()
				break;
			case "tg_name1":
				$scope.tg_name1 = $(".wysiwyg-editor").html()
				break;
			case "tg_depart1":
				$scope.tg_depart1 = $(".wysiwyg-editor").html()
				break;
			case "records_left1_count0":
				$scope.records_left1[0].count = $(".wysiwyg-editor").html()
				break;
			case "records_left1_count1":
				$scope.records_left1[1].count = $(".wysiwyg-editor").html()
				break;
			case "records_left1_count2":
				$scope.records_left1[2].count = $(".wysiwyg-editor").html()
				break;
			case "records_right1_count0":
				$scope.records_right1[0].count = $(".wysiwyg-editor").html()
				break;
			case "records_right1_count1":
				$scope.records_right1[1].count = $(".wysiwyg-editor").html()
				break;
			case "records_right1_count2":
				$scope.records_right1[2].count = $(".wysiwyg-editor").html()
				break;
			case "records_right1_count3":
				$scope.records_right1[3].count = $(".wysiwyg-editor").html()
				break;
			case "analyst2":
				$scope.analyst2 = $(".wysiwyg-editor").html()
				break;
			case "tg_name2":
				$scope.tg_name2 = $(".wysiwyg-editor").html()
				break;
			case "tg_depart2":
				$scope.tg_depart2 = $(".wysiwyg-editor").html()
				break;
			case "records_left2_count0":
				$scope.records_left2[0].count = $(".wysiwyg-editor").html()
				break;
			case "records_left2_count1":
				$scope.records_left2[1].count = $(".wysiwyg-editor").html()
				break;
			case "records_left2_count2":
				$scope.records_left2[2].count = $(".wysiwyg-editor").html()
				break;
			case "records_right2_count0":
				$scope.records_right2[0].count = $(".wysiwyg-editor").html()
				break;
			case "records_right2_count1":
				$scope.records_right2[1].count = $(".wysiwyg-editor").html()
				break;
			case "records_right2_count2":
				$scope.records_right2[2].count = $(".wysiwyg-editor").html()
				break;
			case "records_right2_count3":
				$scope.records_right2[3].count = $(".wysiwyg-editor").html()
				break;
			case "analyst3":
				$scope.analyst3 = $(".wysiwyg-editor").html()
				break;
			case "tg_name3":
				$scope.tg_name3 = $(".wysiwyg-editor").html()
				break;
			case "tg_depart3":
				$scope.tg_depart3 = $(".wysiwyg-editor").html()
				break;
			case "records_left3_count0":
				$scope.records_left3[0].count = $(".wysiwyg-editor").html()
				break;
			case "records_left3_count1":
				$scope.records_left3[1].count = $(".wysiwyg-editor").html()
				break;
			case "records_left3_count2":
				$scope.records_left3[2].count = $(".wysiwyg-editor").html()
				break;
			case "records_right3_count0":
				$scope.records_right3[0].count = $(".wysiwyg-editor").html()
				break;
			case "records_right3_count1":
				$scope.records_right3[1].count = $(".wysiwyg-editor").html()
				break;
			case "records_right3_count2":
				$scope.records_right3[2].count = $(".wysiwyg-editor").html()
				break;
			case "records_right3_count3":
				$scope.records_right3[3].count = $(".wysiwyg-editor").html()
				break;
			case "page7_title":
				$scope.page7_title = $(".wysiwyg-editor").html()
				break;
			case "totalInfo0":
				$scope.totalInfo[0].count = $(".wysiwyg-editor").html()
				break;
			case "totalInfo1":
				$scope.totalInfo[1].count = $(".wysiwyg-editor").html()
				break;
			case "totalInfo2":
				$scope.totalInfo[2].count = $(".wysiwyg-editor").html()
				break;
			case "totalInfo3":
				$scope.totalInfo[3].count = $(".wysiwyg-editor").html()
				break;
			case "yingliData0":
				$scope.yingliData[0].count = $(".wysiwyg-editor").html()
				break;
			case "yingliData1":
				$scope.yingliData[1].count = $(".wysiwyg-editor").html()
				break;
			case "yingliData2":
				$scope.yingliData[2].count = $(".wysiwyg-editor").html()
				break;
			case "yingliData3":
				$scope.yingliData[3].count = $(".wysiwyg-editor").html()
				break;
			case "yingliData4":
				$scope.yingliData[4].count = $(".wysiwyg-editor").html()
				break;
			case "yingliData5":
				$scope.yingliData[5].count = $(".wysiwyg-editor").html()
				break;
			case "yingliData6":
				$scope.yingliData[6].count = $(".wysiwyg-editor").html()
				break;
			case "yingliData7":
				$scope.yingliData[7].count = $(".wysiwyg-editor").html()
				break;
			case "kuisunData0":
				$scope.kuisunData[0].count = $(".wysiwyg-editor").html()
				break;
			case "kuisunData1":
				$scope.kuisunData[1].count = $(".wysiwyg-editor").html()
				break;
			case "kuisunData2":
				$scope.kuisunData[2].count = $(".wysiwyg-editor").html()
				break;
			case "kuisunData3":
				$scope.kuisunData[3].count = $(".wysiwyg-editor").html()
				break;
			case "kuisunData4":
				$scope.kuisunData[4].count = $(".wysiwyg-editor").html()
				break;
			case "kuisunData5":
				$scope.kuisunData[5].count = $(".wysiwyg-editor").html()
				break;
			case "kuisunData6":
				$scope.kuisunData[6].count = $(".wysiwyg-editor").html()
				break;
			case "kuisunData7":
				$scope.kuisunData[7].count = $(".wysiwyg-editor").html()
				break;
			case "page8_title":
				$scope.page8_title = $(".wysiwyg-editor").html()
				break;
			case "sy_records_name0":
				$scope.sy_records[0].name = $(".wysiwyg-editor").html()
				break;
			case "sy_records_account0":
				$scope.sy_records[0].account = $(".wysiwyg-editor").html()
				break;
			case "sy_records_profit0":
				$scope.sy_records[0].profit = $(".wysiwyg-editor").html()
				break;
			case "sy_records_profitRatio0":
				$scope.sy_records[0].profitRatio = $(".wysiwyg-editor").html()
				break;
			case "sy_records_name1":
				$scope.sy_records[1].name = $(".wysiwyg-editor").html()
				break;
			case "sy_records_account1":
				$scope.sy_records[1].account = $(".wysiwyg-editor").html()
				break;
			case "sy_records_profit1":
				$scope.sy_records[1].profit = $(".wysiwyg-editor").html()
				break;
			case "sy_records_profitRatio1":
				$scope.sy_records[1].profitRatio = $(".wysiwyg-editor").html()
				break;
			case "sy_records_name2":
				$scope.sy_records[2].name = $(".wysiwyg-editor").html()
				break;
			case "sy_records_account2":
				$scope.sy_records[2].account = $(".wysiwyg-editor").html()
				break;
			case "sy_records_profit2":
				$scope.sy_records[2].profit = $(".wysiwyg-editor").html()
				break;
			case "sy_records_profitRatio2":
				$scope.sy_records[2].profitRatio = $(".wysiwyg-editor").html()
				break;
			case "sy_records_name3":
				$scope.sy_records[3].name = $(".wysiwyg-editor").html()
				break;
			case "sy_records_account3":
				$scope.sy_records[3].account = $(".wysiwyg-editor").html()
				break;
			case "sy_records_profit3":
				$scope.sy_records[3].profit = $(".wysiwyg-editor").html()
				break;
			case "sy_records_profitRatio3":
				$scope.sy_records[3].profitRatio = $(".wysiwyg-editor").html()
				break;
			case "sy_records_name4":
				$scope.sy_records[4].name = $(".wysiwyg-editor").html()
				break;
			case "sy_records_account4":
				$scope.sy_records[4].account = $(".wysiwyg-editor").html()
				break;
			case "sy_records_profit4":
				$scope.sy_records[4].profit = $(".wysiwyg-editor").html()
				break;
			case "sy_records_profitRatio4":
				$scope.sy_records[4].profitRatio = $(".wysiwyg-editor").html()
				break;
			case "ks_records_name0":
				$scope.ks_records[0].name = $(".wysiwyg-editor").html()
				break;
			case "ks_records_account0":
				$scope.ks_records[0].account = $(".wysiwyg-editor").html()
				break;
			case "ks_records_profit0":
				$scope.ks_records[0].profit = $(".wysiwyg-editor").html()
				break;
			case "ks_records_profitRatio0":
				$scope.ks_records[0].profitRatio = $(".wysiwyg-editor").html()
				break;
			case "ks_records_name1":
				$scope.ks_records[1].name = $(".wysiwyg-editor").html()
				break;
			case "ks_records_account1":
				$scope.ks_records[1].account = $(".wysiwyg-editor").html()
				break;
			case "ks_records_profit1":
				$scope.ks_records[1].profit = $(".wysiwyg-editor").html()
				break;
			case "ks_records_profitRatio1":
				$scope.ks_records[1].profitRatio = $(".wysiwyg-editor").html()
				break;
			case "ks_records_name2":
				$scope.ks_records[2].name = $(".wysiwyg-editor").html()
				break;
			case "ks_records_account2":
				$scope.ks_records[2].account = $(".wysiwyg-editor").html()
				break;
			case "ks_records_profit2":
				$scope.ks_records[2].profit = $(".wysiwyg-editor").html()
				break;
			case "ks_records_profitRatio2":
				$scope.ks_records[2].profitRatio = $(".wysiwyg-editor").html()
				break;
			case "ks_records_name3":
				$scope.ks_records[3].name = $(".wysiwyg-editor").html()
				break;
			case "ks_records_account3":
				$scope.ks_records[3].account = $(".wysiwyg-editor").html()
				break;
			case "ks_records_profit3":
				$scope.ks_records[3].profit = $(".wysiwyg-editor").html()
				break;
			case "ks_records_profitRatio0":
				$scope.ks_records[3].profitRatio = $(".wysiwyg-editor").html()
				break;
			case "ks_records_name4":
				$scope.ks_records[4].name = $(".wysiwyg-editor").html()
				break;
			case "ks_records_account4":
				$scope.ks_records[4].account = $(".wysiwyg-editor").html()
				break;
			case "ks_records_profit4":
				$scope.ks_records[4].profit = $(".wysiwyg-editor").html()
				break;
			case "ks_records_profitRatio4":
				$scope.ks_records[4].profitRatio = $(".wysiwyg-editor").html()
				break;
			case "page9_title":
				$scope.page9_title = $(".wysiwyg-editor").html()
				break;
			case "comments":
				$scope.comments = $(".wysiwyg-editor").html()
				break;
			case "page10_title":
				$scope.page10_title = $(".wysiwyg-editor").html()
				break;
			case "reasons":
				$scope.reasons = $(".wysiwyg-editor").html()
				break;
			case "page11_title":
				$scope.page11_title = $(".wysiwyg-editor").html()
				break;
			case "suggests":
				$scope.suggests = $(".wysiwyg-editor").html()
				break;
			case "page12_title":
				$scope.page12_title = $(".wysiwyg-editor").html()
				break;
			case "basicPanel":
				$scope.basicPanel = $(".wysiwyg-editor").html()
				break;
			case "leftPanel":
				$scope.leftPanel = $(".wysiwyg-editor").html()
				break;
			case "rightPanel":
				$scope.rightPanel = $(".wysiwyg-editor").html()
				break;
		}
	}
}