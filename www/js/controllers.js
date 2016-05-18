angular.module('starter.controllers', [])

.controller('MsgCtrl', function($scope,Msg) {
  Msg.getList(function(data){
    $scope.msgList=data;
  });
})
.controller('MsgDetailCtrl', function($scope, $stateParams, Msg) {
  $scope.msg = Msg.getMsg($stateParams.msgId);
})
.controller('ScheduleCtrl', function($scope, Schedule) {
  var month=new Date().getMonth();
  var year=new Date().getFullYear();
  $scope.date = Schedule.getDate(year,month);
  $scope.datevalue=new Date();
  $scope.dateInfo = function(datevalue,day){
    var ddd= new Date(datevalue);
    ddd.setDate(day);
    $scope.datevalue=ddd;

  };
  $scope.updateValue = function(datevalue){
    $scope.datevalue=datevalue;
    var newdate = new Date(datevalue);
    var month=newdate.getMonth();
    var year=newdate.getFullYear();
    $scope.date = Schedule.getDate(year,month);
  }
})
.controller('ScheduleDetailCtrl', function($scope, $stateParams, Schedule) {
  Schedule.get(function(data){
    $scope.datetodo=data;
  });
})
.controller('ScheduleAddCtrl', function($scope, $stateParams,$state,$ionicPopup,Schedule) {
  $scope.datetodo ={
    dateTime : $stateParams.dateTime,
    todo:'',
    remind:0
  };
  //提交todo
  $scope.submit = function(){
    Schedule.save(function(data){
      $ionicPopup.alert({ template: '提交成功'});
      $state.go('tab.schedule',{});
    },$scope.datetodo);
  };
})
.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
})
.controller('MyCtrl',function($scope,$ionicListDelegate){
  $scope.showDeleteButtons = function() {
    $ionicListDelegate.showDelete(true);
  };
});
