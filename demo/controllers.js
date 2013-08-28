function controller($scope, $http){
	$scope.item = { child : 'david' };	
	$scope.phones = [
		{"name": "Nexus S", "snippet": "Fast just got faster with Nexus S."},
		{"name": "Motorola XOOM™ with Wi-Fi", "snippet": "The Next, Next Generation tablet."},
		{"name": "MOTOROLA XOOM™", "snippet": "The Next, Next Generation tablet."}
    ];
    $scope.click    = function(){
        console.log('click'); 
        $http({
            "url"   : "data.json",
            "dataType"  : "json"
        }).success(function(data){
            console.log(data); 
        });
    }
}

function controller2($scope){
	$scope.phones   = [
		{"name": "Nexus S", "snippet": "Fast just got faster with Nexus S.", "img":"logo.png"},
		{"name": "Motorola  XOOM™ with Wi-Fi", "snippet": "The Next, Next Generation tablet."},
		{"name": "MOTOROLA XOOM™", "snippet": "The Next, Next Generation tablet."}
    ];
    $scope.class    = {a: "hi"}
	
}
