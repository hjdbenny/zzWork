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
				if(elem == "#status") {
					if($(this).html() == "待编辑") {
						$(elem + ">div:first-of-type").attr("data-status", "2")
					} else if($(this).html() == "待发布") {
						$(elem + ">div:first-of-type").attr("data-status", "0")
					} else if($(this).html() == "已发布") {
						$(elem + ">div:first-of-type").attr("data-status", "1")
					}
				}
			})
		})
	}
	//子标签切换
	$(".listNav li").each(function(i){
		$(this).click(function(){
			$(".listNav li").removeClass("listNav-active")
			$(this).addClass("listNav-active")
			$(".container>section").hide()
			$(".container>section").eq(i).show()
		})
	})
})