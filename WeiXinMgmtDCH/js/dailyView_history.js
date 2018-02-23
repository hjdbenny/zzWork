$(function() {
	//	查询日期
	$.findTimeRange($("#from"), $("#to"))
	$(".left li:nth-child(6) a").addClass("select_on")
	
	$("#cx").click(function() {
		cxObj = {
			begDate: $("#from").val().split("-").join(""),
			endDate: $("#to").val().split("-").join("")
		}
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/dailyView/listDailyViews.do",
			async: false,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			data: JSON.stringify(cxObj),
			beforeSend: function() {
				$(".loading").show()
			},
			complete: function() {
				$(".loading").hide()
			},
			success: function(data) {
				cxAllDate = getAllDate($("#from").val(), $("#to").val()) //查询出来的所有日期(已剔除周六周日)总数	
				$("table tr:gt(0)").remove()
				if(data.data.length == 0) {
					alert("未查询到记录")
				}
				for(var i = 0; i < cxAllDate.length; i++) {
					for(var j = 0; j < data.data.length; j++) {
						if(data.data[j].viewDate == cxAllDate[i]) {
							cxAllDate[i] = data.data[j]
						}
					}
				}
			}
		});
		loadData()
	})

	function getDate(datestr) {
		var temp = datestr.split("-");
		var date = new Date(datestr)
		return date;
	}
	//查询所选时间段内的所有日期（不包括周六周日）
	function getAllDate(start, end) {
		var startTime = getDate(start);
		var endTime = getDate(end);
		var allDateArr = []
		while((endTime.getTime() - startTime.getTime()) >= 0) {
			var year = startTime.getFullYear();
			var month = startTime.getMonth().toString().length == 1 ? "0" + (startTime.getMonth() + 1).toString() : startTime.getMonth() + 1;
			var day = startTime.getDate().toString().length == 1 ? "0" + startTime.getDate() : startTime.getDate();
			allDateArr.push(year + "-" + month + "-" + day);
			startTime.setDate(startTime.getDate() + 1);
		}
		var workDateArr = []
		for(var i = 0; i < allDateArr.length; i++) {
			var dt = new Date(allDateArr[i]);
			if(dt.getDay() != 0 && dt.getDay() != 6) {
				workDateArr.push(allDateArr[i].split("-").join(""))
			}
		}
		return workDateArr
	}

	function loadData() {
		result = $.array_chunk(cxAllDate, 20)
		loadList(result[0])
		display()
		totalPage = result.length //总页数	
		$("#count").html(cxAllDate.length)
		if(totalPage > 1) {
			$(".M-box1").show()
			$(".M-box1").pagination({
				totalData: cxAllDate.length,
				showData: 20,
				coping: true,
				callback: function(api) {
					pageNo = api.getCurrent().toString()
					loadList(result[pageNo - 1])
				}
			})
		} else {
			$(".M-box1").hide()
		}
	}

	function display() {
		$(".visible").each(function() {
			$(this).click(function() {
				var displayObj = {
					viewDate: $(this).parent().prev().data("viewdate"),
					isDisplay: 0
				}
				changeDisplay(displayObj)
			})
		})
		$(".hidden").each(function() {
			$(this).click(function() {
				var displayObj = {
					viewDate: $(this).parent().prev().data("viewdate"),
					isDisplay: 1
				}
				changeDisplay(displayObj)
			})
		})
	}

	function changeDisplay(displayObj) {
		$.ajax({
			type: "POST",
			url: "http://www.decaihui.com/wxmgmt/api/dailyView/changeDailyViewDisplay.do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			data: JSON.stringify(displayObj),
			success: function(data) {
				$("#cx").trigger("click")
			}
		});
	}

	function loadList(arr) {
		$("table tr:gt(0)").remove()
		for(var i = 0; i < arr.length; i++) {
			var trs = ""
			if(typeof(arr[i]) == "object") {
				var strDate1 = arr[i].viewDate.substring(0, 4) + "-" + arr[i].viewDate.substring(4, 6) + "-" + arr[i].viewDate.substring(6, 8)
				trs += `<tr data-display="${arr[i].isDisplay}">`
				trs += `<td data-viewdate="${arr[i].viewDate}">${strDate1}</td>`
				if(arr[i].isDisplay == 0) {
					trs += "<td><span class='visible activeStatus'>显示</span><span class='hidden'>隐藏</span><span class='edit'>编辑</span></td>"
				} else {
					trs += "<td><span class='visible'>显示</span><span class='hidden activeStatus'>隐藏</span><span class='edit'>编辑</span></td>"
				}
				trs += "</tr>"

			} else {
				var strDate2 = arr[i].substring(0, 4) + "-" + arr[i].substring(4, 6) + "-" + arr[i].substring(6, 8)
				trs += "<tr>"
				trs += `<td data-viewdate="${arr[i]}">${strDate2}</td>`
				//				trs += "<td>" + arr[i] + "</td>"
				trs += "<td><span class='edit'>追加</span></td>"
				trs += "</tr>"
			}
			$("table").append($(trs))
		}
		$(".edit").each(function() {
			$(this).click(e => {
				sessionStorage.setItem("editDate", $(this).parent().prev().data("viewdate"))
				window.location.href = "dailyView_list.html"
			})
		})
	}
})