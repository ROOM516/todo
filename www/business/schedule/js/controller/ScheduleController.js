
/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日16:35:20
 * 创建原因：日程页控制器
 */
new AppModule()
  .group("app.business.schedule.controller")
  .require(["app.business.schedule.service", "app.business.scheduleDetail.controller"])
  .type("controller")
  .name("ScheduleCtrl")
  .params(["$scope", "$state", "ScheduleService"])
  .action(function($scope, $state, ScheduleService){

    var month=new Date().getMonth();
    var year=new Date().getFullYear();
    $scope.date = ScheduleService.getDate(year,month);
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
      $scope.date = ScheduleService.getDate(year,month);
    };

    //跳转详情
    $scope.toDetail = function(){
      $state.go("scheduleDetail");
    }

  })
  .build();
