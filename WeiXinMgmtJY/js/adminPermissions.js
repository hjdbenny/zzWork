$(function() {
	//权限控制
	currentQx=JSON.parse(sessionStorage.getItem("qxTotalArr"))
	for (var i=0;i<currentQx.length;i++) {
		if(currentQx[i].canShow=="1"){
			$(".left ul li[data-level='"+currentQx[i].level+"']").show()
		}
	}
	loaded()
	isNewFlag=false
	$.ajax({
		type: "POST",
		url: "http://wx.zzfco.com/wxmgmt/api/mgmtUserAuthority/listModuleFunctions.do",
		async: false,
		contentType: "application/json",
		xhrFields: {
			withCredentials: true
		},
		success: function(data) {
			for(var i = 0; i < data.data.length; i++) {
				var lis = "<li data-mod='"+data.data[i]+"'><div class='circle1'><div class='circle2'></div></div>可编辑" + data.data[i] + "</li>"
				$(".qxSelect").append($(lis))
			}
		}
	});
	$(".qxSelect .circle1").each(function() {
		$(this).click(function() {
			if($(this).find("div[class='circle2']").is(":visible")) {
				$(this).find("div[class='circle2']").hide()
			} else {
				$(this).find("div[class='circle2']").show()
			}
		})
	})

	function loaded() {
		obj = {
			begPageNo: 1,
			total: 20
		}
		$.ajax({
			type: "POST",
			url: "http://wx.zzfco.com/wxmgmt/api/mgmtUserAuthority/listCommMgmtUsers.do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			data: JSON.stringify(obj),
			success: function(data) {
				loadReview(data.data)
				$totalData = data.total
				totalPage = Math.ceil($totalData / 20) //总页数	
				$("#count").html($totalData)
				if(totalPage > 1) {
					$(".M-box1").show()
					$(".M-box1").pagination({
						totalData: $totalData,
						showData: 20,
						coping: true,
						callback: function(api) {
							obj.begPageNo = api.getCurrent().toString()
							$.ajax({
								type: "POST",
								url: "http://wx.zzfco.com/wxmgmt/api/mgmtUserAuthority/listCommMgmtUsers.do",
								async: true,
								contentType: "application/json",
								data: JSON.stringify(obj),
								xhrFields: {
									withCredentials: true
								},
								success: function(data) {
									loadReview(data.data)
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

	function getNowFormatDate(date) {
		var seperator1 = "-";
		var month = date.getMonth() + 1;
		var strDate = date.getDate();
		if(month >= 1 && month <= 9) {
			month = "0" + month;
		}
		if(strDate >= 0 && strDate <= 9) {
			strDate = "0" + strDate;
		}
		var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate
		return currentdate;
	}

	function loadReview(arr) {
		$(".container table tr:gt(0)").remove()
		for(var i = 0; i < arr.length; i++) {
			var tlis = ""
			tlis += "<tr>"
			tlis += "<td>" + arr[i].account + "</td>"
			tlis += "<td>" + arr[i].name + "</td>"
			tlis += "<td>" + getNowFormatDate(new Date(arr[i].createDate)) + "</td>"
			tlis += "<td data-id='" + arr[i].id + "'><a href='###'>编辑</a><a href='###'>删除</a></td>"
			tlis += "</tr>"
			$(".container table").append($(tlis))
		}
		//编辑
		$("table a:first-of-type").each(function() {
			$(this).click(function(e) {
				e.preventDefault()
				isNewFlag=false
				var currentid=$(this).parent().data("id")
				$(".edit_bg").show()
				$(".edit_title").html("编辑管理员")
				$(".qxSelect .circle2").hide()
				$.ajax({
					type: "POST",
					url: "http://wx.zzfco.com/wxmgmt/api/mgmtUserAuthority/getCommMgmtUser/" + $(this).parent().data("id") + ".do",
					async: true,
					contentType: "application/json",
					xhrFields: {
						withCredentials: true
					},
					success: function(data) {
						for (var i=0;i<data.data.modfuns.length;i++) {
							$(".qxSelect li").each(function(){
								if($(this).data("mod")==data.data.modfuns[i]){
									$(this).find("div[class='circle2']").show()
								}
							})
						}	
						$(".edit").attr("data-id",currentid)
						$("#account").val(data.data.account)
						$(".num1").html($("#account").val().length)
						if(data.data.password==null){
							$("#password").val("******")	
						}else{
							$("#password").val("密码出错")
						}
						$(".num2").html($("#password").val().length)
						$("#name").val(data.data.name)
						$(".num3").html($("#name").val().length)
						$("#email").val(data.data.email)
					}
				});
			})
		})
		//删除
		$("table a:last-of-type").each(function() {
			$(this).click(function(){
				$.ajax({
					type: "POST",
					url: "http://wx.zzfco.com/wxmgmt/api/mgmtUserAuthority/deleteCommMgmtUser/"+$(this).parent().data("id")+".do",
					async: true,
					contentType: "application/json",
					xhrFields: {
						withCredentials: true
					},
					success:function(data){
						if(data.code=="000"){
							alert("删除成功！")
							loaded()
						}else{
							alert("删除出错！错误代码："+data.code)
						}
					}
				});
			})
		})
	}
	$(".newAdd").click(function() {
		isNewFlag=true
		$(".edit").attr("data-id","")
		$(".edit_bg").show()
		$(".edit_title").html("新建管理员")
		$("#account").val("")
		$(".num1").html("0")
		$("#password").val("")
		$(".num2").html("0")
		$("#name").val("")
		$(".num3").html("0")
		$("#email").val("")
		$(".qxSelect .circle2").hide()
	})
	$(".edit input").each(function() {
		$(this).keyup(function() {
			$(this).next().children()[0].innerHTML = $(this).val().length
		})
	})
	//管理员权限修改或新增
	$(".edit_save").click(function(){
		var modfunsArr=[]
		$(".edit .circle2:visible").each(function(){
			modfunsArr.push($(this).parent().parent().data("mod"))
		})
		if($("#password").val()=="******"){
			var nowPwd=null
		}else{
			var nowPwd=$("#password").val()
		}
		var modifyObj={
			name:$("#name").val(),
			account:$("#account").val(),
			email:$("#email").val(),
			password:nowPwd,
			modfuns:modfunsArr
		}
		if($(".edit").attr("data-id")==""){
			delete modifyObj.id
		}else{
			modifyObj.id=$(".edit").attr("data-id")
		}
		if(modifyObj.name==""||modifyObj.password==""){
			alert("账号或者密码不能为空！")
		}else{	
			modifyManger(modifyObj)
		}
	})
	
	function modifyManger(modifyObj) {
		$.ajax({
			type: "POST",
			url: "http://wx.zzfco.com/wxmgmt/api/mgmtUserAuthority/saveOrUpdateCommMgmtUser.do",
			async: true,
			contentType: "application/json",
			xhrFields: {
				withCredentials: true
			},
			data:JSON.stringify(modifyObj),
			success:function(data){
				if(data.code=="000"){
					$(".edit_bg").hide()
					loaded()
				}else{
					alert("新增或修改失败！错误代码："+data.code)
				}
			}
		});
	}

	$(".edit_cancel,.edit_close").click(function() {
		$(".edit_bg").hide()
	})
	$(".edit_bg").height($(".right2").height() + $(".top").height())
})