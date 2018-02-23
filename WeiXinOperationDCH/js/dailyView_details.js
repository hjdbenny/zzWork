$(function() {
	var viewId = sessionStorage.getItem("viewId")
	var viewDate = sessionStorage.getItem("viewDate")
	var analystName=sessionStorage.getItem("analystName")
	$(".time").html(viewDate)
	$(".analystName").html(analystName)
	if(viewId == "" || viewId == undefined || viewId == null) {
		window.location.href = "dailyView.html"
	}
	var dataArr=[]
	$.ajax({
		type: "POST",
		url: "http://www.decaihui.com/wxweb/api/dailyView/listDailyViewAnalysis/" + viewId + ".do",
		contentType: "application/json",
		async: false,
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			console.log(data)
			dateArr=data.data
			$(".swiper-wrapper").empty()
			for(var i = 0; i < dateArr.length; i++) {
				var lis = "<li class='swiper-slide'>" + dateArr[i].title + "</li>"
				$(".swiper-wrapper").append($(lis))
			}
			$(".swiper-wrapper li:first-child").addClass("on")
			$(".situationAnalysis").html(dateArr[0].situationAnalysis)
			$(".futureAnalysis").html(dateArr[0].futureAnalysis)
		}
	});

	var mySwiper = new Swiper('.swiper-container', {
		spaceBetween: 15,
		slidesPerView: "auto",
		slidesOffsetBefore: 15
	})
	$(".swiper-wrapper li").each(function(i) {
		$(this).click(function() {
			$(".swiper-wrapper li").removeClass("on")
			$(this).addClass("on")
			$(".situationAnalysis").html(dateArr[i].situationAnalysis)
			$(".futureAnalysis").html(dateArr[i].futureAnalysis)
		})
	})
})