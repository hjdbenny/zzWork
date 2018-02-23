var app = angular.module("bindInfo", [])
app.controller("bindInfoController", operation)

function operation($scope, $http,$interval) {
	$scope.code=sessionStorage.getItem("code")
	if($scope.code=="000"){
		$scope.title_top="绑定成功！"
		$scope.title_bottom=""
		$(".view3").show()
		$(".view1").hide()
		$(".view2").hide()
	}else if($scope.code=="003"){
		$scope.title_top="您的账户已被绑定过了"
		$scope.title_bottom=""
		$(".view1").show()
		$(".view2").hide()
		$(".view3").hide()
	}else if($scope.code=="001"){
		$scope.title_top="找不到您的资金帐户"
		$scope.title_bottom="系统找不到您在中州期货的资金账户"
		$(".view2").show()
		$(".view1").hide()
		$(".view3").hide()
	}else if($scope.code==null){
		window.location.href="bind.html"	
	}
}