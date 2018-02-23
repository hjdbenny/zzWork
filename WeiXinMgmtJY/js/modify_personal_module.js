$(function() {
	//权限控制
	currentQx = JSON.parse(sessionStorage.getItem("qxTotalArr"))
	for(var i = 0; i < currentQx.length; i++) {
		if(currentQx[i].canShow == "1") {
			$(".left ul li[data-level='" + currentQx[i].level + "']").show()
		}
	}

	function selectOption(elem) {
		$(elem + ">div:last-of-type").click(function() {
			$(elem + ">ul").show()
		})
		$(elem + ">ul li").each(function() {
			$(this).click(function() {
				$(this).parent().hide()
				$(elem + ">div:first-of-type").html($(this).html())
				if(elem=="#year"){
					$(".showYear").html($(this).html())
				}else if(elem=="#month"){
					$(".showMonth").html($(this).html())
				}
			})
		})
	}
//	/设置选择的年份
	function setDefaultDropdown(){
		var currentDate=new Date()
		$(".showYear").html(`${currentDate.getFullYear()}年`)
		$(".showMonth").html(`${currentDate.getMonth()}月`)
		$("#selectYear").empty()
		var stepYear=currentDate.getFullYear()-2016
		for (i=0;i<stepYear;i++) {
			var lis=`<li>${2017+i}年</li>`
			$("#selectYear").append($(lis))
		}
		selectOption("#year")
		selectOption("#month")
	}
	
	status = sessionStorage.getItem("status")
	clientCode = sessionStorage.getItem("clientCode")
	var addFlag = false
	var contentArr = []
	var previewArr = []
	$.ajax({
		type: "POST",
		url: "http://wx.zzfco.com/wxmgmt/api/myMonthlyReport/listAllTemplates.do",
		async: false,
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		beforeSend: function() {
			$(".loading").show()
		},
		complete: function() {
			$(".loading").hide()
		},
		success: function(data) {
			$(".content>ul").empty()
			for(var i = 0; i < data.data.length; i++) {
				var moduleData = JSON.parse(data.data[i].content)
				var lis = ""		
				lis += `<li data-id="${data.data[i].id}" data-tempdate="${data.data[i].tempDate}">`
				lis += `<div class="hoverBg"><div class="itemBox"><div class="childBox"><div class="square toPreview"><img src="img/reviewIcon.png"/></div><div class="text">预览</div></div><div class="childBox"><div class="square toDel"><img src="img/delIcon.png"/></div><div class="text">删除</div></div><div class="childBox"><div class="square toModify"><img src="img/editIcon.png"/></div><div class="text">编辑</div></div></div></div>`
				lis += `<div class="liTop"><ul>${moduleData.post}</ul></div>`
				lis += `<div class="liBottom">${data.data[i].description}</div>`
				lis += `</li>`
				$(".content>ul").append($(lis))
				contentArr.push(data.data[i].content)
				var previwObj = {
					prewview1: moduleData.prewview1,
					prewview2: moduleData.prewview2
				}
				previewArr.push(previwObj)
			}
		}
	});
	//鼠标经过
	$(".content>ul>li").each(function() {
		$(this).hover(function() {
			$(this).find("div[class='hoverBg']").fadeIn()
		}, function() {
			$(this).find("div[class='hoverBg']").fadeOut()
		})
	})
	//预览
	$(".toPreview").each(function(i) {
		$(this).click(function() {
			$(".review_bg ul").empty()
			$(".review_bg").show()
			$(".review_bg ul").append($(previewArr[i].prewview1 + previewArr[i].prewview2))
			charts($(".analystMonthProfitRatio1"), 0.5)
			charts($(".analystTotalProfitRatio1"), 0.5)
			charts($(".analystMonthProfitRatio2"), 0.5)
			charts($(".analystTotalProfitRatio2"), 0.5)
			charts($(".analystMonthProfitRatio3"), 0.5)
			charts($(".analystTotalProfitRatio3"), 0.5)
			charts($(".totalYearProfitRatio"), 0.5)
			charts($(".totalWinningRatio"), 0.5)
		})
	})
	$(".review_bg").click(function() {
		$(".review_bg").hide()
	})
	//模板删除
	$(".toDel").each(function() {
		$(this).click(function() {
			$.ajax({
				type: "post",
				url: `http://wx.zzfco.com/wxmgmt/api/myMonthlyReport/deleteTemplate/${$(this).parent().parent().parent().parent().data("id")}.do`,
				async: true,
				contentType: "application/json",
				success: function(data) {
					if(data.code == "000") {
						window.location.reload()
					} else {
						alert(`删除失败，错误代码${data.code}`)
					}
				}
			});
		})
	})
	//显示编辑界面
	//新建
	$("#newAdd").click(function() {
		$(".content").hide()
		$(".modifyBox").css("opacity", "1")
		$(".btns button").show()
		$(".btns button:last-of-type").hide()
		addFlag = true
		setDefaultDropdown()
//		$(".description").html("")
		$(".modifyBox .analyst1_name").html("请输入")
		$(".modifyBox .analyst1_startBalance").html("请输入")
		$(".modifyBox .analyst1_tradeType").html("请输入")
		$(".modifyBox .analyst1_endBalance").html("请输入")
		$(".modifyBox .analyst1_tradeNum").html("请输入")
		$(".modifyBox .analyst1_yearProfitRatio").html("请输入")
		$(".modifyBox .analyst1_winningRatio").html("请输入")
		$(".modifyBox .analyst1_monthProfitRatio").html("请输入")
		$(".modifyBox .analyst1_totalProfitRatio").html("请输入")
		$(".modifyBox .analyst2_name").html("请输入")
		$(".modifyBox .analyst2_startBalance").html("请输入")
		$(".modifyBox .analyst2_tradeType").html("请输入")
		$(".modifyBox .analyst2_endBalance").html("请输入")
		$(".modifyBox .analyst2_tradeNum").html("请输入")
		$(".modifyBox .analyst2_yearProfitRatio").html("请输入")
		$(".modifyBox .analyst2_winningRatio").html("请输入")
		$(".modifyBox .analyst2_monthProfitRatio").html("请输入")
		$(".modifyBox .analyst2_totalProfitRatio").html("请输入")
		$(".modifyBox .analyst3_name").html("请输入")
		$(".modifyBox .analyst3_startBalance").html("请输入")
		$(".modifyBox .analyst3_tradeType").html("请输入")
		$(".modifyBox .analyst3_endBalance").html("请输入")
		$(".modifyBox .analyst3_tradeNum").html("请输入")
		$(".modifyBox .analyst3_yearProfitRatio").html("请输入")
		$(".modifyBox .analyst3_winningRatio").html("请输入")
		$(".modifyBox .analyst3_monthProfitRatio").html("请输入")
		$(".modifyBox .analyst3_totalProfitRatio").html("请输入")
		$(".modifyBox .total_tradeType").html("请输入")
		$(".modifyBox .total_tradeNum").html("请输入")
		$(".modifyBox .total_startBalance").html("请输入")
		$(".modifyBox .total_endBalance").html("请输入")
		$(".modifyBox .total_monthProfitRatio").html("请输入")
		$(".modifyBox .total_totalProfitRatio").html("请输入")
		$(".modifyBox .total_YearProfitRatio").html("请输入")
		$(".modifyBox .total_WinningRatio").html("请输入")
	})
	//编辑
	$(".toModify").each(function(i) {
		$(this).click(function() {
			var newData = JSON.parse(contentArr[i])
			$(".content").hide()
			$(".modifyBox").css("opacity", "1")
			$(".btns button").show()
			$(".btns button:last-of-type").hide()
			addFlag = false
			var currentTempDate=$(this).parent().parent().parent().parent().data("tempdate")
			var cureentShowYear=parseInt(currentTempDate.toString().substring(0,4))
			var cureentShowMonth=parseInt(currentTempDate.toString().substring(4,6))
			
			$(".modifyBox .showYear").html(`${cureentShowYear}年`)
			$(".modifyBox .showMonth").html(`${cureentShowMonth}月`)
			$(".modifyBox .card").attr("data-moduleid", $(this).parent().parent().parent().parent().data("id"))
			$(".modifyBox .analyst1_name").html(newData.analyst1_name)
			$(".modifyBox .analyst1_startBalance").html(newData.analyst1_startBalance)
			$(".modifyBox .analyst1_tradeType").html(newData.analyst1_tradeType)
			$(".modifyBox .analyst1_endBalance").html(newData.analyst1_endBalance)
			$(".modifyBox .analyst1_tradeNum").html(newData.analyst1_tradeNum)
			$(".modifyBox .analyst1_yearProfitRatio").html(newData.analyst1_yearProfitRatio)
			$(".modifyBox .analyst1_winningRatio").html(newData.analyst1_winningRatio)
			$(".modifyBox .analyst1_monthProfitRatio").html(newData.analyst1_monthProfitRatio)
			$(".modifyBox .analyst1_totalProfitRatio").html(newData.analyst1_totalProfitRatio)
			$(".modifyBox .analyst2_name").html(newData.analyst2_name)
			$(".modifyBox .analyst2_startBalance").html(newData.analyst2_startBalance)
			$(".modifyBox .analyst2_tradeType").html(newData.analyst2_tradeType)
			$(".modifyBox .analyst2_endBalance").html(newData.analyst2_endBalance)
			$(".modifyBox .analyst2_tradeNum").html(newData.analyst2_tradeNum)
			$(".modifyBox .analyst2_yearProfitRatio").html(newData.analyst2_yearProfitRatio)
			$(".modifyBox .analyst2_winningRatio").html(newData.analyst2_winningRatio)
			$(".modifyBox .analyst2_monthProfitRatio").html(newData.analyst2_monthProfitRatio)
			$(".modifyBox .analyst2_totalProfitRatio").html(newData.analyst2_totalProfitRatio)
			$(".modifyBox .analyst3_name").html(newData.analyst3_name)
			$(".modifyBox .analyst3_startBalance").html(newData.analyst3_startBalance)
			$(".modifyBox .analyst3_tradeType").html(newData.analyst3_tradeType)
			$(".modifyBox .analyst3_endBalance").html(newData.analyst3_endBalance)
			$(".modifyBox .analyst3_tradeNum").html(newData.analyst3_tradeNum)
			$(".modifyBox .analyst3_yearProfitRatio").html(newData.analyst3_yearProfitRatio)
			$(".modifyBox .analyst3_winningRatio").html(newData.analyst3_winningRatio)
			$(".modifyBox .analyst3_monthProfitRatio").html(newData.analyst3_monthProfitRatio)
			$(".modifyBox .analyst3_totalProfitRatio").html(newData.analyst3_totalProfitRatio)
			$(".modifyBox .total_tradeType").html(newData.total_tradeType)
			$(".modifyBox .total_tradeNum").html(newData.total_tradeNum)
			$(".modifyBox .total_startBalance").html(newData.total_startBalance)
			$(".modifyBox .total_endBalance").html(newData.total_endBalance)
			$(".modifyBox .total_monthProfitRatio").html(newData.total_monthProfitRatio)
			$(".modifyBox .total_totalProfitRatio").html(newData.total_totalProfitRatio)
			$(".modifyBox .total_YearProfitRatio").html(newData.total_YearProfitRatio)
			$(".modifyBox .total_WinningRatio").html(newData.total_WinningRatio)
		})
	})
	$(".orderBtns>div").each(function() {
		$(this).click(function() {
			$(this).parent().next().next().children().children().hide()
			var index = parseInt($(this).html()) - 1
			$($(this).parent().next().next().children().children()[index]).show()
		})
	})
	//第三页
	$('.roundabout_box>ul').roundabout({
		minScale: 0.6,
		autoplay: false,
		minOpacity: 0,
		maxOpacity: 1,
		reflect: true,
		startingChild: 0,
		enableDrag: true,
		dropCallback: function() {
			var index = $(".roundabout-in-focus").data("order") - 1
			$(".showPage>li").removeClass("showPage_on")
			$(".showPage>li").eq(index).addClass("showPage_on")
		},
		clickToFocusCallback: function() {
			var index = $(".roundabout-in-focus").data("order") - 1
			$(".showPage>li").removeClass("showPage_on")
			$(".showPage>li").eq(index).addClass("showPage_on")
		}
	});
	//	保存
	$("#saveModule").click(function(e) {
		var contentObj = {
			analyst1_name: $(".modifyBox .analyst1_name").html(),
			analyst1_startBalance: $(".modifyBox .analyst1_startBalance").html(),
			analyst1_tradeType: $(".modifyBox .analyst1_tradeType").html(),
			analyst1_endBalance: $(".modifyBox .analyst1_endBalance").html(),
			analyst1_tradeNum: $(".modifyBox .analyst1_tradeNum").html(),
			analyst1_yearProfitRatio: $(".modifyBox .analyst1_yearProfitRatio").html(),
			analyst1_winningRatio: $(".modifyBox .analyst1_winningRatio").html(),
			analyst1_monthProfitRatio: $(".modifyBox .analyst1_monthProfitRatio").html(),
			analyst1_totalProfitRatio: $(".modifyBox .analyst1_totalProfitRatio").html(),
			analyst2_name: $(".modifyBox .analyst2_name").html(),
			analyst2_startBalance: $(".modifyBox .analyst2_startBalance").html(),
			analyst2_tradeType: $(".modifyBox .analyst2_tradeType").html(),
			analyst2_endBalance: $(".modifyBox .analyst2_endBalance").html(),
			analyst2_tradeNum: $(".modifyBox .analyst2_tradeNum").html(),
			analyst2_yearProfitRatio: $(".modifyBox .analyst2_yearProfitRatio").html(),
			analyst2_winningRatio: $(".modifyBox .analyst2_winningRatio").html(),
			analyst2_monthProfitRatio: $(".modifyBox .analyst2_monthProfitRatio").html(),
			analyst2_totalProfitRatio: $(".modifyBox .analyst2_totalProfitRatio").html(),
			analyst3_name: $(".modifyBox .analyst3_name").html(),
			analyst3_startBalance: $(".modifyBox .analyst3_startBalance").html(),
			analyst3_tradeType: $(".modifyBox .analyst3_tradeType").html(),
			analyst3_endBalance: $(".modifyBox .analyst3_endBalance").html(),
			analyst3_tradeNum: $(".modifyBox .analyst3_tradeNum").html(),
			analyst3_yearProfitRatio: $(".modifyBox .analyst3_yearProfitRatio").html(),
			analyst3_winningRatio: $(".modifyBox .analyst3_winningRatio").html(),
			analyst3_monthProfitRatio: $(".modifyBox .analyst3_monthProfitRatio").html(),
			analyst3_totalProfitRatio: $(".modifyBox .analyst3_totalProfitRatio").html(),
			total_tradeType: $(".modifyBox .total_tradeType").html(),
			total_tradeNum: $(".modifyBox .total_tradeNum").html(),
			total_startBalance: $(".modifyBox .total_startBalance").html(),
			total_endBalance: $(".modifyBox .total_endBalance").html(),
			total_monthProfitRatio: $(".modifyBox .total_monthProfitRatio").html(),
			total_totalProfitRatio: $(".modifyBox .total_totalProfitRatio").html(),
			total_YearProfitRatio: $(".modifyBox .total_YearProfitRatio").html(),
			total_WinningRatio: $(".modifyBox .total_WinningRatio").html(),
			post: `<li class="swiper-slide bg3">${$(".modifyBox .bg3")[0].innerHTML.split('canEdit').join("")}</li>`,
			prewview1: `<li class="swiper-slide bg3">${$(".modifyBox .bg3")[0].innerHTML.split('canEdit').join("")}</li>`,
			prewview2: `<li class="swiper-slide bg4">${$(".modifyBox .bg4")[0].innerHTML.split('canEdit').join("")}</li>`,
		}
		var tempDateY=parseInt($(".showYear").html())
		if(parseInt($(".showMonth").html())<10){
			var tempDateM=`0${parseInt($(".showMonth").html())}`
		}else{
			var tempDateM=parseInt($(".showMonth").html())
		}
		var tempDate=tempDateY.toString()+tempDateM.toString()
		var saveObj = {
			description: $(".description").text(),
			content: JSON.stringify(contentObj),
			tempDate:tempDate
		}
		if(addFlag) {
			saveObj.id = null;
		} else {
			saveObj.id = $(".modifyBox .card").attr("data-moduleid")
		}
		if(confirm(`确认保存${$(".description").text()}?`)){
			$.ajax({
				type: "post",
				url: "http://wx.zzfco.com/wxmgmt/api/myMonthlyReport/saveOrUpdateTemplate.do",
				async: true,
				contentType: "application/json",
				data: JSON.stringify(saveObj),
				success: function(data) {
					if(data.code == "000") {
						alert("保存成功！")
						window.location.reload()
					} else {
						alert(`保存失败，错误代码${data.code}`)
					}
				}
			})
		}else{
			e.preventDefault()
		}
	})

	modifyFlag = false //判断是否有变化
	//显示编辑区域
	initialContent = ""
	$(".canEdit").each(function() {
		$(this).click(function(e) {
			e.stopPropagation()
			toSave()
			$(this).addClass("editing")
			$(".canEdit").css("opacity", "1")
			$(this).css("opacity", "0")
			editorWidth = $(this).width()
			editorHeight = $(this).height() + 35
			editorLeft = $(this).offset().left - $(".left").width() - parseInt($(".container-wrappr").css("margin-left"))
			editorTop = $(this).offset().top - $(".modifyBox").offset().top - 35
			editorFontSize = $(this).css("font-size")
			$(".modify").height(editorHeight)
			$(".modify").width(editorWidth)
			$(".modify").show()
			$(".modify").css({
				"left": editorLeft,
				"top": editorTop,
				"opacity": "1",
				"font-size": editorFontSize
			})
			$(".wysiwyg-editor").html($(this).text())
			initialContent = $(this).html()
		})
	})
	//编辑工具栏保存
	$(".wysiwyg-toolbar a:last-of-type").click(function() {
		toSave()
	})
	//阻止冒泡事件
	$(".modify").click(function(e) {
		e.stopPropagation()
	})
	//编辑器保存方法
	function toSave() {
		$(".editing").html($(".wysiwyg-editor").html())
		lastContent = $(".editing").html()
		if(initialContent != lastContent && lastContent != undefined) {
			modifyFlag = true
		} else {
			modifyFlag = false
		}
		$(".canEdit").css("opacity", "1")
		$(".canEdit").each(function() {
			$(this).removeClass("editing")
			if($(this).html() == "<br>") {
				$(this).html("请输入内容...")
			}
		})
		$(".modify").css("opacity", "0")
		$(".modify").hide()
	}
	/*点击非编辑区域隐藏修改框*/
	$(document).click(function(e) {
		toSave()
	})
	$(".left a").click(function(e) { //离开页面的提示
		if(modifyFlag) {
			if(!confirm("离开此页面吗，系统不会保存您所做的修改?")) {
				e.preventDefault()
			}
		}
	})
	charts($(".analystMonthProfitRatio1"), 0.5)
	charts($(".analystTotalProfitRatio1"), 0.5)
	charts($(".analystMonthProfitRatio2"), 0.5)
	charts($(".analystTotalProfitRatio2"), 0.5)
	charts($(".analystMonthProfitRatio3"), 0.5)
	charts($(".analystTotalProfitRatio3"), 0.5)
	charts($(".totalYearProfitRatio"), 0.5)
	charts($(".totalWinningRatio"), 0.5)
	//画圆环
	function charts(elem, val) {
		elem.circleProgress({
			value: val,
			emptyFill: "#e7e7eb", //圆环背景色
			size: elem.width(),
			fill: {
				color: '#f58d35'
			},
			animation: {
				duration: 1000,
				easing: 'linear'
			},
			thickness: '10',
			lineCap: "round"
		})
	}
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
})