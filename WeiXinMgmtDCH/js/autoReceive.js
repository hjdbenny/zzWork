$(function() {
	idFlag = false

	function loaded() {
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/wxapi/listReplyMessages/0.do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				loadReview(data.data)
			}
		});
	}
	loaded()
	//时间戳转化为时间格式
	function fmtDate(obj) {
		var date = new Date(obj);
		return date.toJSON().substring(0, 10);
	}
	countNum=3//新增图文的起始序号
	function loadReview(arr) {
		$(".review_content table tr:gt(0)").remove()
		var x2js = new X2JS();
		for(var i = 0; i < arr.length; i++) {
			var keyStr = ""
			for(var j = 0; j < arr[i].keywords.length; j++) {
				keyStr += "<span class='show_kw'>" + arr[i].keywords[j].keyword + "</span>"
			}
			for(var j = 0; j < arr[i].keywords.length; j++) {
				if(arr[i].keywords[j].description == "" || arr[i].keywords[j].description == null || arr[i].keywords[j].description == undefined) {
					var rule_title = "未命名"
				} else {
					var rule_title = arr[i].keywords[j].description
				}
			}
			var tlis = ""
			tlis += "<tr data-type='' data-id='" + arr[i].replyMessage.id + "'>"
			tlis += "<td>" + (i + 1) + "</td>"
			tlis += "<td>" + rule_title + "</td>"
			tlis += "<td>" + keyStr + "</td>"
			tlis += "<td><a href='#' class='edit'>编辑</a><a href='#' class='del'>删除</a></td>"
			tlis += "</tr>"
			$(".review_content table").append($(tlis))
		}
		$("table .circle1").each(function() {
			$(this).toggle(function() {
				$(this).find("div[class='circle2']").show()
			}, function() {
				$(this).find("div[class='circle2']").hide()
			})
		})
		$(".edit").each(function(i) {
			$(this).click(function() {
				idFlag = true
				$(".newReceive_top span").html("编辑关键字回复设置 ")
				$(".newReceive_title li").removeClass("title_on")
				$(".newReceive_title li:first-child").addClass("title_on")
				$(".news_title").val("")
				$(".news_description").val("")
				$(".news_url").val("")
				$(".text_content").val("")
				$(".newReceive_bg").show()
				$(".edit_ruleName").show()
				$(".edit_keyword").hide()
				$(".edit_reply").hide()
				$(".mangePanel").addClass("blur")
				$(".prev").attr("disabled", "disabled")
				$(".next").removeAttr("disabled")
				$(".save").hide()
				step = 0;
				$(".ruleName").val($(this).parent().prev().prev().html()) //获取规则名
				//获取当前关键字
				$(".keyword_bottom").empty()
				for(var j = 0; j < arr[i].keywords.length; j++) {
					var c_spans = ""
					c_spans += "<span class='kw'>" + arr[i].keywords[j].keyword + "<span class='kw_del'></span></span>"
					$(".keyword_bottom").append($(c_spans))
				}
				delKeyword()
				//				根据类型编辑
				jsonObj2 = x2js.xml_str2json(arr[i].replyMessage.content)
				sessionStorage.setItem("modifyID", arr[i].replyMessage.id)
				if(jsonObj2.xml.MsgType == "news") {
					$(".reply_text").hide()
					$(".reply_pic").hide()
					$(".reply_news").show()
					$(".newsAll").remove()
					$(".newsMore").remove()
					if(jsonObj2.xml.ArticleCount > 1) {
						for(var j = 0; j < jsonObj2.xml.ArticleCount; j++) {
							var nlis = ""
							nlis += "<div class='reply_bottom reply_news newsAll' data-order='" + (j + 3) + "'>"
							nlis += "<ul class='news_config'>"
							nlis += "<li>"
							nlis += "<label>标题:</label>"
							nlis += "<input class='news_title' type='text' value='" + jsonObj2.xml.Articles.item[j].Title + "'/>"
							nlis += "</li>"
							nlis += "<li class='news_post'>"
							nlis += "<label>尺寸:</label>"
							nlis += "<span style='color: #b3b3b3;'>900像素 * 500像素</span>"
							nlis += "<div class='newsPic_btn'>上传封面</div>"
							nlis += "<form class='uploadArticlePic' enctype='multipart/form-data' method='post'>"
							nlis += `<input name='file' class='article_pic' type='file' data-url='${jsonObj2.xml.Articles.item[j].PicUrl}'>`
							nlis += "</form>"
							nlis += "</li>"
							nlis += "<li>"
							nlis += "<label>摘要:</label>"
							nlis += "<input class='news_description' type='text' value='" + jsonObj2.xml.Articles.item[j].Description + "' />"
							nlis += "</li>"
							nlis += "<li>"
							nlis += "<label>跳转Url:</label>"
							nlis += "<input class='news_url' type='text' value='" + jsonObj2.xml.Articles.item[j].Url + "' />"
							nlis += "</li>"
							nlis += "</ul>"
							nlis += "</div>"
							$(".reply_container").append($(nlis))
						}
						for(var k = 0; k < jsonObj2.xml.ArticleCount; k++) {
							var navli = "<li class='style_news newsMore'><img src='img/news.png'></li>"
							$(navli).insertBefore($(".addNews"))
						}
					} else {
						var nlis = ""
						nlis += "<div class='reply_bottom reply_news newsAll' data-order='3'>"
						nlis += "<ul class='news_config'>"
						nlis += "<li>"
						nlis += "<label>标题:</label>"
						nlis += "<input class='news_title' type='text' value='" + jsonObj2.xml.Articles.item.Title + "'/>"
						nlis += "</li>"
						nlis += "<li class='news_post'>"
						nlis += "<label>尺寸:</label>"
						nlis += "<span style='color: #b3b3b3;'>900像素 * 500像素</span>"
						nlis += "<div class='newsPic_btn'>上传封面</div>"
						nlis += "<form class='uploadArticlePic' enctype='multipart/form-data' method='post'>"
						nlis += `<input name='file' class='article_pic' type='file' data-url='${jsonObj2.xml.Articles.item.PicUrl}'>`
						nlis += "</form>"
						nlis += "</li>"
						nlis += "<li>"
						nlis += "<label>摘要:</label>"
						nlis += "<input class='news_description' type='text' value='" + jsonObj2.xml.Articles.item.Description + "' />"
						nlis += "</li>"
						nlis += "<li>"
						nlis += "<label>跳转Url:</label>"
						nlis += "<input class='news_url' type='text' value='" + jsonObj2.xml.Articles.item.Url + "' />"
						nlis += "</li>"
						nlis += "</ul>"
						nlis += "</div>"
						$(".reply_container").append($(nlis))
						var navli = "<li class='style_news newsMore'><img src='img/news.png'></li>"
						$(navli).insertBefore($(".addNews"))
					}
					$(".newsAll").eq(0).show()
					selectType()
					$(".reply_pic img").attr("src", "img/addPic.png")
					$(".reply_top ul li").removeClass("brightness")
					$(".style_news").eq(0).addClass("brightness")
				} else if(jsonObj2.xml.MsgType == "image") {
					$(".reply_top ul li").removeClass("brightness")
					$(".style_pic").addClass("brightness")
					$(".reply_text").hide()
					$(".reply_pic").show()
					$(".reply_news").hide()
					imageMediaId = jsonObj2.xml.Image.MediaId
					$(".reply_pic img").attr("src", "http://www.decaihui.com/wxservice/wxapi/getMediaFile/" + jsonObj2.xml.Image.MediaId + ".do")
				} else if(jsonObj2.xml.MsgType == "text") {
					$(".reply_top ul li").removeClass("brightness")
					$(".style_text").addClass("brightness")
					$(".reply_text").show()
					$(".reply_pic").hide()
					$(".reply_news").hide()
					$(".text_content").val(jsonObj2.xml.Content)
					$(".reply_pic img").attr("src", "img/addPic.png")

				}
			})
		})
		$(".del").each(function() {
			$(this).click(function() {
				if(confirm("确认删除所选项？")){
					var delArr = []
					delArr.push($(this).parent().parent().data("id"))
					$.ajax({
						type: "POST",
						url: "http://www.decaihui.com/wxmgmt/api/wxapi/deleteReplyMessages.do",
						async: true,
						contentType: "application/json",
						xhrFields: {
							withCredentials: true
						},
						data: JSON.stringify(delArr),
						success: function(data) {
							loaded()
						}
					});
				}		
			})
		})
	}

	//打开新增
	var step = 0;
	$(".newAdd").click(function() {
		idFlag = false
		$(".newReceive_top span").html("新增关键字回复设置 ")
		$(".newReceive_title li").removeClass("title_on")
		$(".newReceive_title li:first-child").addClass("title_on")
		$(".news_title").val("")
		$(".news_description").val("")
		$(".news_url").val("")
		$(".text_content").val("")
		$(".keyword_bottom").empty()
		$(".newReceive_bg").show()
		$(".edit_ruleName").show()
		$(".edit_keyword").hide()
		$(".edit_reply").hide()
		$(".mangePanel").addClass("blur")
		$(".prev").attr("disabled", "disabled")
		$(".next").removeAttr("disabled")
		$(".save").hide()
		step = 0;
		$(".reply_news").remove()
		$(".style_news").remove()
		addNews()
		selectType()
	})
//多个图文消息添加
	$(".addNews").click(function() {
		addNews()
	})
	function addNews() {
		var nlis = ""
		nlis += "<div class='reply_bottom reply_news newsAll' data-order='" + countNum + "'>"
		nlis += "<ul class='news_config'>"
		nlis += "<li>"
		nlis += "<label>标题:</label>"
		nlis += "<input class='news_title' type='text' value='' placeholder='请输入标题,最多60个字... ...' />"
		nlis += "</li>"
		nlis += "<li class='news_post'>"
		nlis += "<label>尺寸:</label>"
		nlis += "<span style='color: #b3b3b3;'>900像素 * 500像素</span>"
		nlis += "<div class='newsPic_btn'>上传封面</div>"
		nlis += "<form class='uploadArticlePic' enctype='multipart/form-data' method='post'>"
		nlis += "<input name='file' class='article_pic' type='file'>"
		nlis += "</form>"
		nlis += "</li>"
		nlis += "<li>"
		nlis += "<label>摘要:</label>"
		nlis += "<input class='news_description' type='text' value='' placeholder='选填，如果不填写会默认抓取正文54个字符...' />"
		nlis += "</li>"
		nlis += "<li>"
		nlis += "<label>跳转Url:</label>"
		nlis += "<input class='news_url' type='text' value='' placeholder='http://' />"
		nlis += "</li>"
		nlis += "</ul>"
		nlis += "</div>"
		$(".reply_container").append($(nlis))
		countNum++
		var navli = "<li class='style_news newsMore'><img src='img/news.png'></li>"
		$(navli).insertBefore($(".addNews"))
		uploadArticPic()
	}
	//关闭新增
	$("#newAddClose").click(function() {
		idFlag = false
		$(".newReceive_bg").hide()
		$(".mangePanel").removeClass("blur")
		step = 0;
		$(".prev").attr("disabled", "disabled")
		$(".next").removeAttr("disabled")
	})
	//	下一步
	$(".next").click(function() {
		$(".prev").removeAttr("disabled")
		if(step < 2) {
			step++
			$("div[data-step='" + step + "']").show()
			$(".newReceive_title li").removeClass("title_on")
			$(".newReceive_title li").eq(step).addClass("title_on")
			$("div[data-step='" + (step - 1) + "']").hide()
		}
		if(step == 2) {
			$(this).attr("disabled", "disabled")
			$(".save").show()
			uploadArticPic()
		}
	})
	//	上一步
	$(".prev").click(function() {
		$(".next").removeAttr("disabled")
		$(".save").hide()
		if(step > 0) {
			step--
			$("div[data-step='" + step + "']").show()
			$(".newReceive_title li").removeClass("title_on")
			$(".newReceive_title li").eq(step).addClass("title_on")
			$("div[data-step='" + (step + 1) + "']").hide()
		}
		if(step == 0) {
			$(this).attr("disabled", "disabled")
		}
	})

	function selectType() {
		$(".reply_top>ul>li").each(function(i) {
			$(this).click(function() {
				$(".reply_top ul li").removeClass("brightness")
				$(this).addClass("brightness")
				$(".reply_bottom").hide()
				$(".reply_bottom[data-order]").eq(i).show()
			})
		})
	}

	/*新增图片消息的图片预览*/
	imageType = /image.*/;
	getOnloadFunc = function(aImg) {
		return function(evt) {
			aImg.src = evt.target.result;
		};
	}
	$(".post_pic").change(function() {
		for(var i = 0, numFiles = $(this)[0].files.length; i < numFiles; i++) {
			var file = $(this)[0].files[i];
			if(!file.type.match(imageType)) {
				continue;
			}
			var reader = new FileReader();
			reader.onload = getOnloadFunc($(".reply_pic img")[0]);
			reader.readAsDataURL(file);
		}
		$.ajax({
			url: "http://www.decaihui.com/wxservice/wxapi/uploadMediaFile.do",
			type: 'POST',
			cache: false,
			data: new FormData($('#uploadForm')[0]),
			processData: false,
			contentType: false,
			success: function(data) {
				imageMediaId = data.data.media_id
			}
		})
	})
	//	新增图文消息的上传封面
	function uploadArticPic(){
		$(".article_pic").each(function(i) {
			$(this).change(function() {
				$(".news_post span").html($(this)[0].files[0].name)
				var self=$(this)
				$.ajax({
					url: "http://www.decaihui.com/wxservice/wxapi/uploadMassSendImage.do",
					type: 'POST',
					cache: false,
					//				data: new FormData($('#uploadArticlePic')[0]),
					data: new FormData($(this).parent()[0]),
					processData: false,
					contentType: false,
					success: function(data) {
						self.attr("data-url",data.data.url)
					}
				})
			})
		})
	}

	//	编辑关键字
	$(".keyword_top").keyup(function(e) {
		if(e.keyCode == 13) {
			var spans = ""
			spans += "<span class='kw'>" + $(this).val() + "<span class='kw_del'></span></span>"
			$(".keyword_bottom").append($(spans))
			$(this).val("")
		}
		delKeyword()
	})

	function delKeyword() {
		$(".kw_del").click(function() {
			$(this).parent().remove()
		})
	}

	$(".save").click(function() {
		var ok1 = false
		var ok2 = false
		if($(".ruleName").val() == "") {
			alert("规则名不能为空!!!")
			ok1 = false
		} else {
			ok1 = true
		}
		var keywordsArr = []
		$(".kw").each(function(i) {
			keywordsArr.push($.trim($(this).text()))
		})
		if(keywordsArr.length < 1) {
			alert("请输入至少一个关键字!!!")
			ok2 = false
		} else {
			ok2 = true
		}
		if(ok1 && ok2) {
			if(idFlag) {
				messageId = sessionStorage.getItem("modifyID")
			} else {
				messageId = null
			}
			newObj = {
				keywords: keywordsArr,
				id: messageId,
				createTime: new Date().getTime(),
				keywordType: 0,
				keywordDescription: $(".ruleName").val()
			}
			if($(".reply_text").is(":visible")) { //新增文本消息
				newObj.msgType = "text"
				newObj.content = $(".text_content").val()
				delete newObj.mediaId
				delete newObj.articles
				delete newObj.articleCount
			} else if($(".reply_pic").is(":visible")) { //新增图片消息
				newObj.msgType = "image"
				newObj.mediaId = imageMediaId
				delete newObj.articles
				delete newObj.articleCount
				delete newObj.content
			} else if($(".reply_news").is(":visible")) { //新增图文消息
				newObj.msgType = "news"
				var itemsArr = []
				$(".newsAll").each(function(i) {
					var itemObj = {
						description: $(this).find("input[class='news_description']").val(),
						picUrl: $(this).find("input[class='article_pic']").attr("data-url"),
						title: $(this).find("input[class='news_title']").val(),
						url: $(this).find("input[class='news_url']").val()
					}
					itemsArr.push(itemObj)
				})
				newObj.articles = {
					items: itemsArr
				}
				newObj.articleCount = $(".newsAll").length
				delete newObj.content
				delete newObj.mediaId
			}
			newAddConfirm(newObj, 0)
		}
	})

	//新增确定
	function newAddConfirm(obj, replyTpye) { //replyTpye消息回复类型，1为消息自动回复，0为关键字回复
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/wxapi/saveOrUpdateReplyMessage.do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			data: JSON.stringify(obj),
			success: function(data) {
				if(data.code == "000") {
					if(idFlag) {
						alert("修改成功!!!")
					} else {
						alert("新增自动回复成功!!!")
					}
					$(".newReceive_bg").hide()
					$(".mangePanel").removeClass("blur")
					if(replyTpye == 0) {
						loaded()
					} else if(replyTpye == 1) {
						loadAutoReply()
					}
				} else {
					alert(data.message)
				}
			}
		});
	}
	//	回复类型切换
	var startHeight = $(".right2").height()
	$(".pl li:first-child").click(function() {
		$(".pl li").removeClass("pl_on")
		$(this).addClass("pl_on")
		$(".messageAuto").show()
		$(".keywordTable").hide()
		$(".newAdd").hide()
	})
	$(".pl li:last-child").click(function() {
		$(".pl li").removeClass("pl_on")
		$(this).addClass("pl_on")
		$(".messageAuto").hide()
		$(".keywordTable").show()
		$(".newAdd").show()
		$(".newReceive_bg").height($(document).height())
	})

	//消息自动回复操作
	$(".type_text").click(function() {
		$(".messageAuto_top ul li").removeClass("brightness")
		$(this).addClass("brightness")
		$(".auto_text").show()
		$(".auto_pic").hide()
	})
	$(".type_pic").click(function() {
		$(".messageAuto_top ul li").removeClass("brightness")
		$(this).addClass("brightness")
		$(".auto_text").hide()
		$(".auto_pic").show()
	})

	//消息自动回复的上传图片
	$(".message_pic").change(function() {
		for(var i = 0, numFiles = $(this)[0].files.length; i < numFiles; i++) {
			var file = $(this)[0].files[i];
			if(!file.type.match(imageType)) {
				continue;
			}
			var reader = new FileReader();
			reader.onload = getOnloadFunc($(".auto_pic img")[0]);
			reader.readAsDataURL(file);
		}
		$(".clear_auto").removeAttr("disabled")
		$.ajax({
			url: "http://www.decaihui.com/wxservice/wxapi/uploadMediaFile.do",
			type: 'POST',
			cache: false,
			data: new FormData($('#uploadAutoPic')[0]),
			processData: false,
			contentType: false,
			success: function(data) {
				auto_imageMediaId = data.data.media_id
			}
		})
	})
	$(".auto_text_content").keyup(function() {
		if($(this).val() != "") {
			$(".clear_auto").removeAttr("disabled")
		} else {
			$(".clear_auto").attr("disabled", "disabled")
		}
	})
	//	清空
	$(".clear_auto").click(function() {
		if($(".auto_text").is(":visible")) {
			$(".auto_text_content").val("")
		} else if($(".auto_pic").is(":visible")) {
			$(".auto_pic img").attr("src", "img/addPic.png")
			auto_imageMediaId = null
		}
		$(".clear_auto").attr("disabled", "disabled")
	})
	//获取消息自动回复数据
	function loadAutoReply() {
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/wxapi/getAutoReplyMessage.do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			success: function(data) {
				var x2js2 = new X2JS();
				jsonObj3 = x2js2.xml_str2json(data.data.content)
				if(jsonObj3.xml.MsgType == "text") {
					$(".messageAuto_top ul li").removeClass("brightness")
					$(".type_text").addClass("brightness")
					auto_imageMediaId = null
					$(".auto_text").show()
					$(".auto_pic").hide()
					$(".auto_text_content").val(jsonObj3.xml.Content)
					$(".auto_pic img").attr("src", "img/addPic.png")
				} else if(jsonObj3.xml.MsgType == "image") {
					$(".messageAuto_top ul li").removeClass("brightness")
					$(".type_pic").addClass("brightness")
					auto_imageMediaId = jsonObj3.xml.Image.MediaId
					$(".auto_text").hide()
					$(".auto_pic").show()
					$(".auto_text_content").val("")
					$(".auto_pic img").attr("src", "http://www.decaihui.com/wxservice/wxapi/getMediaFile/" + jsonObj3.xml.Image.MediaId + ".do")
				}
			}
		});
	}
	loadAutoReply()
	//	自动回复保存
	$(".save_auto").click(function() {
		var autoKeywordsArr = ["all"]
		idFlag = true
		autoObj = {
			keywords: autoKeywordsArr,
			id: 54,
			createTime: new Date().getTime(),
			keywordType: 1,
			keywordDescription: "系统默认被动回复"
		}
		if($(".auto_text").is(":visible")) { //新增文本消息
			autoObj.msgType = "text"
			autoObj.content = $(".auto_text_content").val()
			delete autoObj.mediaId
		} else if($(".auto_pic").is(":visible")) { //新增图片消息
			autoObj.msgType = "image"
			autoObj.mediaId = auto_imageMediaId
			delete autoObj.content
		}
		newAddConfirm(autoObj, 1)
	})
})