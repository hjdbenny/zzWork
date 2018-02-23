$(function() {
	$(".comments").height(520 - $(".comments").position().top)
	status = sessionStorage.getItem("status")
	clientCode = sessionStorage.getItem("clientCode")
	$(".name").html(sessionStorage.getItem("accountname"))
	$(".remarks").val(sessionStorage.getItem("name"))
	$("#moduleName").html(getLastDate())
	$(".left li:nth-child(2) a").addClass("select_on")
	if(status == 2) {
		addFlag = true
	} else {
		addFlag = false
	}
	//	历史列表
	$.ajax({
		type: "POST",
		url: "http://www.decaihui.com/wxmgmt/api/myMonthlyReport/listHistoryMonthlyReports/" + clientCode + ".do",
		async: false,
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			var tempDate = getLastDate().substring(0, 4) + getLastDate().substring(5, 7)
			if(data.data.length == 0) {
				reportId = ""
			} else {
				for(var i = 0; i < data.data.length; i++) {
					if(data.data[i].reportDate == tempDate) {
						reportId = data.data[i].id
					} else {
						reportId = ""
					}
				}
			}
			$(".card").attr("data-reportid", reportId)
			$(".card").attr("data-status", sessionStorage.getItem("status"))
			var years = []
			var j = new Date().getFullYear() - 2017 + 1
			for(var i = 0; i < j; i++) {
				years.push(2017 + i)
			}
			years.reverse()
			for(var i = 0; i < years.length; i++) {
				var ylis = ""
				ylis += "<li data-year='" + years[i] + "'><span class='treeTitle'><span class='treeIcon'>+</span>" + years[i] + "年</span><ul class='treeNode'></ul></li>"
				$(".tree").append($(ylis))
			}
			for(var i = 12; i > 0; i--) {
				var mlis = ""
				if(i < 10) {
					var liMonth = "0" + i
				} else {
					var liMonth = i
				}
				mlis += "<li data-month='" + liMonth + "'>" + i + "月<span class='badge'></span></li>"
				$(".treeTitle").each(function() {
					$(this).parent().find("ul[class='treeNode']").append($(mlis))
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

			$(".tree li:last-child ul li:nth-child(" + (13 - parseInt(getLastDate().substring(5, 7))) + ") ").addClass("active")
			$(".treeNode li").each(function() {
				$(this).attr("data-date", $(this).parent().parent().data("year") + "-" + $(this).data("month").toString())
				$(this).attr("data-status", "2")
				$(this).attr("data-reportid", "")
				//设置历史月报的显示状态和id
				if(data.data.length == 0) {
					$(this).attr("data-reportid", "")
					$(".card").attr("data-reportid", "")
					$(".card").attr("data-status", "2")
					$(this).attr("data-status", "2")
				} else {
					for(var i = 0; i < data.data.length; i++) {
						if(data.data[i].reportDate == ($(this).data("date").substring(0, 4) + $(this).data("date").substring(5, 7))) {
							if(data.data[i].status == 0) {
								$(this).find("span[class='badge']").css("background", "#f5c106")
							} else if(data.data[i].status == 1) {
								$(this).find("span[class='badge']").css("background", "transparent")
							}
							$(this).attr("data-reportid", data.data[i].id)
							$(this).attr("data-status", data.data[i].status)
						}
					}
				}

				$(this).click(function() {
					$(".card").attr("data-reportid", $(this).data("reportid"))
					$(".card").attr("data-status", $(this).data("status"))
					$(".treeNode li").removeClass("active")
					$(this).addClass("active")
					$("#moduleName").html($(this).data("date"))
					if($(this).data("status") == 2) {
						addFlag = true
					} else {
						addFlag = false
					}
					if($(this).data("reportid") != null) {
						treeReportId = $(this).data("reportid")
					} else {
						treeReportId = ""
					}
					if(modifyFlag) {
						if(confirm("离开此页面吗，系统不会保存您所做的修改?")) {
							loadData(treeReportId)
							modifyFlag = false
						}
					} else {
						loadData(treeReportId)
						modifyFlag = false
					}
				})
			})
		}
	});
	//	$(".comments div").height($(".comments").height())
	modifyFlag = false //判断是否有变化
	//显示编辑区域
	var clearFlag = false
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
			editorLeft = $(this).offset().left - $(".left").width() - parseInt($(".container").css("margin-left"))
			editorTop = $(this).offset().top - $(".content").offset().top - 35
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
			$(".wysiwyg-editor").html($(this).html())
			$(".wysiwyg-editor").height($(this).height())
			initialContent = $(this).html()
			clearStyle()
			toolbarSave()

		})
	})
	//编辑工具栏-清空样式
	function clearStyle() {
		$(".wysiwyg-toolbar a[title='清空样式']").click(function() {
			$(".wysiwyg-editor").html($(".wysiwyg-editor").text())
		})
	}
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
		$(".comments").height(520 - $(".comments").position().top)
	}
	//编辑工具栏保存
	function toolbarSave() {
		$(".wysiwyg-toolbar a[title='保存']").click(function() {
			toSave()
		})
	}
	//自动首行缩进
	$(".modify").keyup(function(e){
		if(e.keyCode==13){
			$(".wysiwyg-toolbar a[title='首行缩进']").trigger("click")
		}
	})
	//阻止冒泡事件
	$(".modify").click(function(e) {
		e.stopPropagation()
	})
	/*点击非编辑区域隐藏修改框*/
	$(document).click(function(e) {
		toSave()
	})
	//保存提交,待发布
	$(".save").click(e => {
		toSave()
		var contentObj = {
			maxTitle: $(".maxTitle").html(),
			mainContract: $(".mainContract").html(),
			maxDeficit: $(".maxDeficit").html(),
			tradeDirection: $(".tradeDirection").html(),
			totalComment: $(".totalComment").html(),
			comment3: $(".comment3").html()
		}
		//		if($(".card").attr("data-status") == 1) {
		//			var currentStatus = 1
		//		} else {
		//			var currentStatus = 0
		//		}
		var saveObj = {
			name: $("#moduleName").html(),
			description: $(".description").val(),
			clientCode: sessionStorage.getItem("clientCode"),
			status: 0,
			reportDate: $("#moduleName").html().split("-").join(""),
			content: JSON.stringify(contentObj)
		}
		if(addFlag) {
			delete saveObj.id
		} else {
			saveObj.id = $(".card").attr("data-reportid")
		}
		$.ajax({
			type: "post",
			url: "http://www.decaihui.com/wxmgmt/api/myMonthlyReport/saveOrUpdate.do",
			async: true,
			contentType: "application/json",
			data: JSON.stringify(saveObj),
			success: function(data) {
				if(data.code == "000") {
					alert("保存成功！")
				} else {
					alert(`保存失败，错误代码${data.code}`)
				}
			}
		})
	})
	//发布
	$(".publish").click(function() {
		var flagPublish = $(".card").attr("data-reportid")
		if(flagPublish == "") {
			alert("发布失败：只能发布状态为待发布的月报，请先保存")
		} else {
			if(confirm("确认发布当前月报？")) {
				var idsArr1 = []
				idsArr1.push($(".card").data("reportid"))
				modifyReportStatus(idsArr1, 1)
			}
		}

	})
	$(".left a").click(function(e) { //离开页面的提示
		if(modifyFlag) {
			if(!confirm("离开此页面吗，系统不会保存您所做的修改?")) {
				e.preventDefault()
			}
		}
	})
	$(".review").click(function() {
		$(".review_bg").show()
		preview();
	})
	$(".review_bg").click(function() {
		$(".review_bg").hide()
	})
	//预览功能
	function preview() {
		var bdhtml = window.document.body.innerHTML; //获取当前页的html代码 
		var startStr = "<!--startprint-->"; //设置打印开始区域 
		var endStr = "<!--endprint-->"; //设置打印结束区域 
		var printHtml = bdhtml.substring(bdhtml.indexOf(startStr) + startStr.length, bdhtml.indexOf(endStr)); //从标记里获取需要打印的页面 
		printHtml = printHtml.split('canEdit').join("")
		$(".review_bg").html(printHtml); //需要打印的页面 
	}

	//修改月报状态
	function modifyReportStatus(idArr, status) {
		var changeObj = {
			ids: idArr,
			status: status
		}
		$.ajax({
			type: "post",
			url: "http://www.decaihui.com/wxmgmt/api/myMonthlyReport/changeStatus.do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			data: JSON.stringify(changeObj),
			success: function(data) {
				if(status == 0) {
					window.location.reload()
				} else if(status == 1) {
					alert("发布成功！")
					window.location.href = "modify_personal_list.html"
				}
			}
		});
	}

	function getLastDate() {
		var date = new Date()
		var year = date.getFullYear()
		if(date.getMonth() == 0) {
			var month = 12
		} else {
			if(date.getMonth() < 10) {
				var month = "0" + date.getMonth()
			} else {
				var month = date.getMonth()
			}
		}
		return year + "-" + month
	}
	loadData(reportId)
	//载入数据
	function loadData(reportId) {
		if(reportId != "") {
			$.ajax({
				type: "POST",
				url: `http://www.decaihui.com/wxmgmt/api/myMonthlyReport/getMonthlyReport/${reportId}.do`,
				async: true,
				contentType: "application/json",
				success: function(data) {
					var newData = JSON.parse(data.data.content)
					$(".maxTitle").html(newData.maxTitle)
					$(".mainContract").html(newData.mainContract)
					$(".maxDeficit").html(newData.maxDeficit)
					$(".tradeDirection").html(newData.tradeDirection)
					$(".totalComment").html(newData.totalComment)
					$(".comment3").html(newData.comment3)
					$(".description").val(data.data.description)
				}
			});
		} else {
			$(".maxTitle").html("XXXX")
			$(".mainContract").html("XXXX")
			$(".maxDeficit").html("XXXX")
			$(".tradeDirection").html("X")
			$(".totalComment").html("请输入...")
			$(".comment3").html("请输入...")
			$(".description").val("")
		}
	}

	$("#test").wysiwyg({
		position: 'top',
		buttons: {
			eraser: {
				title: '清空样式',
				image: "&#xf12d;", // <img src="path/to/image.png" width="16" height="16" alt="" />
				//showstatic: true,    // wanted on the toolbar
				showselection: false // wanted on selection
			},
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
			},
			indent:{
				title: '首行缩进',
				image: '\uf0c7', // <img src="path/to/image.png" width="16" height="16" alt="" />
				//showstatic: true,    // wanted on the toolbar
				showselection: false // wanted on selection
			}
		}
	})
})