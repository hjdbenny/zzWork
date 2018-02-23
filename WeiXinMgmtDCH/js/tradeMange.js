$(function() {
	//下拉选择
	function selectOption(elem) {
		$(elem + ">div:last-of-type").click(function() {
			$(elem + ">ul").show()
		})
		$(elem + ">ul li").each(function() {
			$(this).click(function() {
				$(this).parent().hide()
				$(elem + ">div:last-of-type").prev().html($(this).html())
			})
		})
	}
	selectOption(".logistics-company")
	//	查询日期
	$.findTimeRange($("#from"),$("#to"))
	var obj = {
		begPageNo: 1,
		total: 10
	}
	loadList(obj)

	function loadList(obj) {
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/jf/tradeMgmt/listOrders.do",
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
								url: "http://www.decaihui.com/wxmgmt/api/jf/tradeMgmt/listOrders.do",
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
			if(arr[i].logCompany != null && arr[i].logOrderNum != null) {
				if(arr[i].logCompany != "" && arr[i].logOrderNum != "") {
					var logstatus = `<span>${arr[i].logCompany}</span><span>${arr[i].logOrderNum}</span>`
				} else {
					var logstatus = `<span class='noSend'>物流信息有误</span><span class='noSend'>值为空</span>`
				}
			} else {
				var logstatus = "<span class='noSend'>未发货</span>"
			}
			var trs = ``
			trs += `<tr>`
			trs += `<td>${arr[i].orderId}</td>`
			trs += `<td><img src="${arr[i].icon}"></td>`
			trs += `<td>${arr[i].commodityName}</td>`
			trs += `<td>JY${arr[i].jyUserId}</td>`
			trs += `<td>${arr[i].createTime}</td>`
			trs += `<td>${logstatus}</td>`
			trs += `<td><a href="#####" class="modify">编辑</a></td>`
			trs += `</tr>`
			$(".container table").append($(trs))
		}
		toModify()
	}
	$(".btns>ul>li").each(function() {
		$(this).click(function() {
			$(".btns>ul>li").removeClass("btn-active")
			$(this).addClass("btn-active")
		})
	})
	//编辑
	function toModify() {
		$(".modify").each(function(i) {
			$(this).click(function() {
				$(".edit_title").html("编辑")
				$(".edit_bg").show()
			})
		})
	}
	$(".edit_close,.cancel").click(function() {
		$(".edit_bg").hide()
	})
	$(".edit_bg").height($(document).height())
	//搜索
	$(".search").click(function(){	
		if($("#keywords").val()!=""){
			obj.keyword=$("#keywords").val()
		}else{
			delete obj.keyword
		}
		if($("#orderNum").val()!=""){
			obj.orderId=$("#orderNum").val()
		}else{
			delete obj.orderId
		}
		if($("#buyerNum").val()!=""){
			if($("#buyerNum").val().indexOf("jy")!=-1||$("#buyerNum").val().indexOf("JY")!=-1||$("#buyerNum").val().indexOf("Jy")!=-1||$("#buyerNum").val().indexOf("jY")!=-1){
				obj.jyUserId=$("#buyerNum").val().substring(2)
				if(obj.jyUserId==""){
					delete obj.jyUserId
				}
			}else{
				obj.jyUserId=$("#buyerNum").val()
			}
		}else{
			delete obj.jyUserId
		}
		
		if($("#from").val()!=""){
			obj.begDate=$("#from").val()
		}else{
			delete obj.begDate
		}
		if($("#to").val()!=""){
			obj.endDate=$("#to").val()
		}else{
			delete obj.endDate
		}
		loadList(obj)
	})
})