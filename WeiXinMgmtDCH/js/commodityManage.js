$(function() {
	//下拉选择
	function selectOption(elem) {
		$(elem + ">div:last-of-type").click(function() {
			$(elem + ">ul").show()
		})
		$(elem + ">ul li").each(function() {
			$(this).click(function() {
				$(this).parent().hide()
				$(elem + ">div:first-of-type").html($(this).html())
				if(elem == ".serviceTerm>div") {
					$("#serviceTime").val(parseInt($(this).html()))
				}
			})
		})
	}
	selectOption(".status")
	selectOption(".commodityType")
	//	查询日期范围
	$.findTimeRange($("#from"), $("#to"))
	$.findTimeRange($("#startTime"), $("#endTime"))

	var obj = {
		begPageNo: 1,
		total: 10
	}
	loadList(obj)

	function loadList(obj) {
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/jf/mgmtCommodity/listCommodities.do",
			async: true,
			contentType: "application/json",
			data: JSON.stringify(obj),
			beforeSend: function() {
				$(".loading").show()
			},
			complete: function() {
				$(".loading").hide()
			},
			success: function(data) {
				$totalData = data.total
				totalPage = Math.ceil($totalData / 10) //总页数	
				$("#count").html($totalData)
				loadData(data.data)
				if(totalPage > 1) {
					$(".M-box1").show()
					$(".M-box1").pagination({
						totalData: $totalData,
						showData: 10,
						coping: true,
						callback: function(api) {
							obj.begPageNo = api.getCurrent().toString()
							$.ajax({
								type: "POST",
								url: "http://www.decaihui.com/wxmgmt/api/jf/mgmtCommodity/listCommodities.do",
								async: true,
								contentType: "application/json",
								data: JSON.stringify(obj),
								beforeSend: function() {
									$(".loading").show()
								},
								complete: function() {
									$(".loading").hide()
								},
								success: function(data) {
									loadData(data.data)
								}
							});
						}
					})
				} else {
					$(".M-box1").hide()
				}
			}
		});
	}

	function loadData(arr) {
		$(".container table tr:gt(0)").remove()
		for(var i = 0, len = arr.length; i < len; i++) {
			var trs = ``
			if(arr[i].status == 0) {
				var statusColor = "onShelf"
				var status = "已上架"
			} else {
				var statusColor = "offShelf"
				var status = "未上架"
			}

			trs += `<tr data-id="${arr[i].id}" data-type="${arr[i].type}">`
			trs += `<td><div class='circle1'><div class='circle2'></div></div></td>`
			trs += `<td><input tpye="text" value="${arr[i].weight}" ></td>`
			trs += `<td><img src="${arr[i].icon}"></td>`
			trs += `<td>${arr[i].name}</td>`
			trs += `<td>${arr[i].point}</td>`
			trs += `<td>${arr[i].totalExchange}</td>`
			trs += `<td>${new Date(arr[i].createDate).Format("yyyy-MM-dd")}</td>`
			trs += `<td class="${statusColor}">${status}</td>`
			trs += `<td><a href="#####" class="modify">编辑</a></td>`
			trs += `</tr>`
			$(".container table").append($(trs))
		}
		toModify()
		toSelect()
		toWeight()
	}
	//搜索
	$(".search").click(function() {
		if($("#keywords").val() != "") {
			obj.keyword = $("#keywords").val()
		} else {
			delete obj.keyword
		}
		if($(".showStuts").html() == "已上架") {
			obj.status = 0
		} else if($(".showStuts").html() == "已下架") {
			obj.status = 1
		} else {
			delete obj.status
		}
		if($("#from").val() != "") {
			obj.begDate = $("#from").val()
		} else {
			delete obj.begDate
		}
		if($("#to").val() != "") {
			obj.endDate = $("#to").val()
		} else {
			delete obj.endDate
		}
		loadList(obj)
	})
	//全选
	$("table tr:first-child .circle1").click(function() {
		if($(this).find("div[class='circle2']").is(":visible")) {
			$("table .circle2").hide()
		} else {
			$("table .circle2").show()
		}
	})
	//复选框
	function toSelect() {
		$("table tr:gt(0) .circle1").each(function() {
			$(this).click(function() {
				if($(this).find("div[class='circle2']").is(":visible")) {
					$(this).find("div[class='circle2']").hide()
					$("table tr:first-child .circle2").hide()
				} else {
					$(this).find("div[class='circle2']").show()
				}
			})
		})
	}

	//编辑
	function toModify() {
		$(".modify").each(function(i) {
			$(this).click(function() { //1 实物  2 票券  3 服务
				var curType = $(this).parent().parent().data("type")
				$(".effectTime").hide()
				$(".serviceTerm").hide()
				$("#serviceTime").remove()
				$(".modfuns").remove()
				$("#begEffectDate").remove()
				$("#endEffectDate").remove()
				$(".step3").hide()
				$(".step2").hide()
				$(".step1").show()
				if(curType == "2") {
					$(".edit_title").html("票券类-商品新建")
					$(".edit_title").attr("data-type", "2")
					$("#comType").val("2")
					$(".step1-top img").attr("src", "img/progress1.png")
					$(".step2-top img").attr("src", "img/progress2.png")
					var ticketTime = `<input type="text" name="begEffectDate" id="begEffectDate" />`
					ticketTime += `<input type="text" name="endEffectDate" id="endEffectDate" />`
					$(ticketTime).insertAfter($("#comType"))
					$(".effectTime").show()
				} else if(curType == "3") {
					$(".edit_title").html("服务类-商品新建")
					$(".edit_title").attr("data-type", "3")
					$("#comType").val("3")
					$(".step1-top img").attr("src", "img/progress-service1.png")
					$(".step2-top img").attr("src", "img/progress-service3.png")
					var serviceTime = `<input type="text" name="serviceTime" id="serviceTime" />`
					$(serviceTime).insertAfter($("#comType"))
					selectOption(".serviceTerm>div")
					modFuns()
					$(".serviceTerm").show()
				} else if(curType == "1") {
					$(".edit_title").html("实物类-商品新建")
					$(".edit_title").attr("data-type", "1")
					$("#comType").val("1")
					$(".step1-top img").attr("src", "img/progress1.png")
					$(".step2-top img").attr("src", "img/progress2.png")
				}
				var currentId = $(this).parent().parent().data("id")
				$.ajax({
					type: "post",
					url: `http://www.decaihui.com/wxmgmt/api/jf/mgmtCommodity/getCommodity/${currentId}.do`,
					async: true,
					contentType: "application/json",
					xhrFields: {
						withCredentials: true
					},
					success: function(data) {
						$("#commodityId").val(data.data.id)
						$(".commodityName input").val(data.data.name)
						$(".pointPrice input").val(data.data.point)
						$(".commodityDescription input").val(data.data.description)
						if(data.data.homePicture != null) {
							$(".syPic img").attr("src", data.data.homePicture)
							$(".syPic .after-show").show()
						} else {
							$(".syPic img").attr("src", "img/addpic1.png")
						}
						if(data.data.detailPicture != null) {
							$(".detailPic img").attr("src", data.data.detailPicture)
							$(".detailPic .after-show").show()
						} else {
							$(".detailPic img").attr("src", "img/addpic2.png")
						}
						if(data.data.icon != null) {
							$(".tumbPic img").attr("src", data.data.icon)
							$(".tumbPic .after-show").show()
						} else {
							$(".tumbPic img").attr("src", "img/addpic3.png")
						}
						if(curType == "2") {
							var begDate = new Date(data.data.begEffectDate).Format("yyyy-MM-dd")
							var begHour = new Date(data.data.begEffectDate).getHours();
							var begMin = new Date(data.data.begEffectDate).getSeconds();
							var endDate = new Date(data.data.endEffectDate).Format("yyyy-MM-dd")
							var endHour = new Date(data.data.endEffectDate).getHours();
							var endMin = new Date(data.data.endEffectDate).getSeconds();
							$("#startTime").val(begDate)
							$("#startHour").val(begHour)
							$("#startMin").val(begMin)
							$("#begEffectDate").val(`${begDate} ${begHour}:${begMin}:00`)
							$("#endTime").val(endDate)
							$("#endHour").val(endHour)
							$("#endMin").val(endMin)
							$("#endEffectDate").val(`${endDate} ${endHour}:${endMin}:00`)
						} else if(curType == "3") {
							$("#serviceTime").val(data.data.serviceTime)
							$(".showTerm").html(`${data.data.serviceTime}个月`)
							$(".optionList li img").hide()
							$(".optionList li").addClass("option-off")
							for(var i = 0, len = data.data.commodityServices.length; i < len; i++) {
								var newOption = `<input type="text" name="modfuns" class="modfuns" value="${data.data.commodityServices[i].modfun}" />`
								$(newOption).insertAfter($("#comType"))
								$(".optionList li").each(function() {
									if($(this).data("type") == data.data.commodityServices[i].modfun) {
										$(this).find("img").show()
										$(this).removeClass("option-off")
									}
								})
							}
						}
						$(".edit_bg").show()
						ue.setContent(data.data.detail)
						toSave()
					}
				});
			})
		})
	}
	$(".edit_close,.cancel").click(function() {
		$(".edit_bg").hide()
	})
	//新建
	$(".newAdd").click(function() {
		$("#newType").show()
	})
	$("#newType li").each(function() { //1 实物  2 票券  3 服务
		$(this).click(function() {
			$("#newType").hide()
			$("form input").each(function() {
				$(this).val("")
			})
			$(".effectTime").hide()
			$(".serviceTerm").hide()
			$("#serviceTime").remove()
			$(".modfuns").remove()
			$("#begEffectDate").remove()
			$("#endEffectDate").remove()
			$(".syPic img").attr("src", "img/addpic1.png")
			$(".detailPic img").attr("src", "img/addpic2.png")
			$(".tumbPic img").attr("src", "img/addpic3.png")
			$(".after-show").hide()
			$(".picFile").css({
				"width": "100%",
				"height": "100%",
				"left": "0"
			})
			ue.setContent("")
			$(".step3").hide()
			$(".step2").hide()
			$(".step1").show()
			if($(this).data("type") == "2") {
				$(".edit_title").html("票券类-商品新建")
				$(".edit_title").attr("data-type", "2")
				$("#comType").val("2")
				$(".step1-top img").attr("src", "img/progress1.png")
				$(".step2-top img").attr("src", "img/progress2.png")
				var ticketTime = `<input type="text" name="begEffectDate" id="begEffectDate" />`
				ticketTime += `<input type="text" name="endEffectDate" id="endEffectDate" />`
				$(ticketTime).insertAfter($("#comType"))
				$("#startHour").val("00")
				$("#startMin").val("00")
				$("#endHour").val("00")
				$("#endMin").val("00")
				$(".effectTime").show()
			} else if($(this).data("type") == "3") {
				$(".edit_title").html("服务类-商品新建")
				$(".edit_title").attr("data-type", "3")
				$("#comType").val("3")
				$(".step1-top img").attr("src", "img/progress-service1.png")
				$(".step2-top img").attr("src", "img/progress-service3.png")
				var serviceTime = `<input type="text" name="serviceTime" id="serviceTime" />`
				$(serviceTime).insertAfter($("#comType"))
				$(".showTerm").html("12个月")
				selectOption(".serviceTerm>div")
				$("#serviceTime").val(parseInt($(".showTerm").html()))
				initialOption()
				$(".serviceTerm").show()
			} else {
				$(".edit_title").html("实物类-商品新建")
				$(".edit_title").attr("data-type", "1")
				$("#comType").val("1")
				$(".step1-top img").attr("src", "img/progress1.png")
				$(".step2-top img").attr("src", "img/progress2.png")
			}
			$(".edit_bg").show()
			toSave()
		})
	})
	//	计数
	$(".commodityName input").keyup(function() {
		$("#count1").html($(this).val().length)
	})
	$(".commodityDescription input").keyup(function() {
		$("#count2").html($(this).val().length)
	})
	$(".edit_bg").height($(document).height())
	//上传图片
	imageType = /image.*/;
	getOnloadFunc = function(aImg) {
		return function(evt) {
			aImg.src = evt.target.result;
		};
	}
	$(".picFile").each(function() {
		$(this).change(function() {
			for(var i = 0, numFiles = $(this)[0].files.length; i < numFiles; i++) {
				var file = $(this)[0].files[i];
				if(!file.type.match(imageType)) {
					continue;
				}
				var reader = new FileReader();
				reader.onload = getOnloadFunc($(this).prev()[0]);
				reader.readAsDataURL(file);
			}
			$(this).parent().find("div[class='after-show']").show()
			$(this).css({
				"width": "80px",
				"height": "30px",
				"left": "158px"
			})

		}).hover(function() {
			$(this).parent().find("div[class='reupload']").css("background", "#bf7823")
		}, function() {
			$(this).parent().find("div[class='reupload']").css("background", "rgba(37,65,87,.9)")
		})
	})
	//保存
	function toSave() {
		$(".save").click(function() {
			saveStyle("1")
		})
		$(".saveAndOnShelf").click(function() {
			saveStyle("0")
		})
	}

	//	保存状态类型，0为保存并上架，1为只保存
	function saveStyle(status) {
		var detailsEditor=ue.getContent()
		var flag2=false
		if(detailsEditor==""){
			alert("详情内容不能为空！")
			flag2=false
		}else{
			flag2=true
		}
		if(flag2){
			$("#commodityStatus").val(status)
			$.ajax({
				url: "http://www.decaihui.com/wxmgmt/api/jf/mgmtCommodity/saveOrUpdateCommodity.do",
				type: 'POST',
				cache: false,
				data: new FormData($('#uploadAutoPic')[0]),
				processData: false,
				contentType: false,
				success: function(data) {
					if(data.code == "000") {
						window.location.reload()
					} else {
						alert("保存出错!错误代码：" + data.code)
					}
				}
			})
		}	
	}
	//删除
	$(".del").click(function() {
		if(confirm("确认删除所选项？")){
			var delArr = []
			$("table tr:gt(0) .circle2:visible").each(function() {
				delArr.push($(this).parent().parent().parent().data("id"))
			})
			$.ajax({
				type: "post",
				url: "http://www.decaihui.com/wxmgmt/api/jf/mgmtCommodity/batchDelete.do",
				async: true,
				contentType: "application/json",
				xhrFields: {
					withCredentials: true
				},
				data: JSON.stringify(delArr),
				success: function(data) {
					window.location.reload()
				}
			});
		}
	})
	//批量上/下架商品
	$(".onTheShelf").click(function() { //上架
		updateStatus("0")
	})
	$(".offTheShelf").click(function() { //下架
		updateStatus("1")
	})

	function updateStatus(status) {
		var updateArr = []
		$("table tr:gt(0) .circle2:visible").each(function() {
			updateArr.push($(this).parent().parent().parent().data("id"))
		})
		var updateObj = {
			ids: updateArr,
			status: status
		}
		$.ajax({
			type: "post",
			url: "http://www.decaihui.com/wxmgmt/api/jf/mgmtCommodity/updateStatus.do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			data: JSON.stringify(updateObj),
			success: function(data) {
				window.location.reload()
			}
		});
	}
	//修改权重
	function toWeight() {
		$("td input").each(function() {
			$(this).blur(function() {
				var currentCommodityId = $(this).parent().parent().data("id")
				var currentWeight = $(this).val()
				if(isNaN(parseInt(currentWeight))) {
					alert("请输入正确的数字！！")
					loadList(obj)
				} else {
					updateWeight(currentCommodityId, currentWeight)
				}
			})
		})
	}

	function updateWeight(id, weight) {
		var weightObj = {
			id: id,
			weight: weight
		}
		$.ajax({
			type: "post",
			url: "http://www.decaihui.com/wxmgmt/api/jf/mgmtCommodity/updateWeight.do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			data: JSON.stringify(weightObj),
			success: function(data) {
				loadList(obj)
			}
		});
	}
	//下一步
	$(".step1 .next").click(function() {
		var commodityName = $(".commodityName input").val().trim()
		var pointPrice = $(".pointPrice input").val().trim()
		var commodityDescription = $(".commodityDescription input").val().trim()
		var syPic = $(".syPic img").attr("src")
		var detailPic = $(".detailPic img").attr("src")
		var tumbPic = $(".tumbPic img").attr("src")
		var flag = false
		var priceFlag = false
		if(commodityName != "" && pointPrice != "" && commodityDescription != "" && syPic != "img/addpic1.png" && detailPic != "img/addpic2.png" && tumbPic != "img/addpic3.png") {
			flag = true
			if(isNaN(parseInt(pointPrice))) {
				alert("商品价格只能是数字！")
				priceFlag = false
				$(".pointPrice input").val("")
			} else {
				priceFlag = true
			}
		} else {
			alert("商品信息不完整或有误，请修改")
			flag = false
		}

		if(flag && priceFlag) {
			if($(".edit_title").attr("data-type") == "3") {
				$(".step1").hide()
				$(".step2").hide()
				$(".step3").show()
			} else if($(".edit_title").attr("data-type") == "2") {
				if($("#begEffectDate").val() == "" || $("#endEffectDate").val() == "") {
					alert("有效时间错误！")
				} else {
					var begStr = $("#begEffectDate").val().split(" ")
					begStr[1] = `${$("#startHour").val()}:${$("#startMin").val()}:00`
					begStr = begStr.join(" ")
					$("#begEffectDate").val(begStr)
					var endStr = $("#endEffectDate").val().split(" ")
					endStr[1] = `${$("#endHour").val()}:${$("#endMin").val()}:00`
					endStr = endStr.join(" ")
					$("#endEffectDate").val(endStr)
					$(".step1").hide()
					$(".step2").show()
					$(".step3").hide()
				}
			} else {
				$(".step1").hide()
				$(".step2").show()
				$(".step3").hide()
			}
		}
	})
	$(".step3 .next").click(function() {
		$(".step1").hide()
		$(".step2").show()
		$(".step3").hide()
	})
	//上一步
	$(".step2 .prev").click(function() {
		if($(".edit_title").attr("data-type") == "3") {
			$(".step3").show()
			$(".step2").hide()
			$(".step1").hide()
		} else {
			$(".step3").hide()
			$(".step2").hide()
			$(".step1").show()
		}
	})
	$(".step3 .prev").click(function() {
		$(".step1").show()
		$(".step2").hide()
		$(".step3").hide()
	})
	//初始化服务类功能
	function initialOption() {
		$(".optionList li").each(function(i) {
			var self = $(this).data("type")
			var initialOption = `<input type="text" name="modfuns" class="modfuns" value="${self}" />`
			$(initialOption).insertAfter($("#comType"))
		})
		modFuns()
	}

	//服务类的功能选择
	function modFuns() {
		$(".optionList li").each(function(i) {
			$(this).click(function() {
				if($(this).find("img").is(":visible")) {
					$(this).find("img").hide()
					$(this).addClass("option-off")
					var self = $(this).data("type")
					$(".modfuns").each(function() {
						if($(this).val() == self) {
							$(this).remove()
						}
					})
				} else {
					$(this).find("img").show()
					$(this).removeClass("option-off")
					var self = $(this).data("type")
					var newOption = `<input type="text" name="modfuns" class="modfuns" value="${self}" />`
					$(newOption).insertAfter($("#comType"))
				}
			})
		})
	}
	//选择时分计数
	$(".countBox>div:first-of-type").each(function() { //时间+++
		$(this).click(function() {
			if($(this).parent().prev().val() == 23 && $(this).parent().prev().hasClass("isHour")) {
				$(this).parent().prev().val("23")
			} else if($(this).parent().prev().val() == 59 && $(this).parent().prev().hasClass("isMin")) {
				$(this).parent().prev().val("59")
			} else {
				var upNum = parseInt($(this).parent().prev().val()) + 1
				if(upNum < 10) {
					$(this).parent().prev().val("0" + upNum)
				} else {
					$(this).parent().prev().val(upNum)
				}
			}
		})
	})
	$(".countBox>div:last-of-type").each(function() { //时间---
		$(this).click(function() {
			if($(this).parent().prev().val() == "00") {
				$(this).parent().prev().val("00")
			} else {
				var downNum = parseInt($(this).parent().prev().val()) - 1
				if(downNum < 10) {
					$(this).parent().prev().val("0" + downNum)
				} else {
					$(this).parent().prev().val(downNum)
				}
			}
		})
	})
	$(".dateBox2 input").each(function() {
		$(this).change(function() {
			if(isNaN(parseInt($(this).val()))) {
				alert("输入时间点有误！")
				$(this).val("00")
			}
			if($(this).val() >= 23 && $(this).hasClass("isHour")) {
				$(this).val("23")
			} else if($(this).val() >= 59 && $(this).hasClass("isMin")) {
				$(this).val("59")
			}
			if($(this).val() < 10) {
				$(this).val("0" + $(this).val())
			}
		})
	})

	//编辑器配置
	var ue = UE.getEditor('details-container', {
		toolbars: [
			['source', 'undo', '|', 'bold', 'italic', 'underline', '|', 'fontfamily', '|', 'fontsize', '|', 'forecolor', '|', 'backcolor', '|', 'simpleupload',
				'inserttable', 'autotypeset', '|', 'removeformat', 'formatmatch', '|', 'justifyleft', 'justifyright', 'justifycenter', 'justifyjustify'
			]
		],
		elementPathEnabled: false,
		wordCount: false,
		autoHeightEnabled: false
	});
})