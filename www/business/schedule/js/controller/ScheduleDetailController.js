
/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日20:44:32
 * 创建原因：日程详情控制器
 */
new AppModule()
  .group("app.business.scheduleDetail.controller")
  .require(["app.business.scheduleDetail.service"])
  .type("controller")
  .name("ScheduleDetailCtrl")
  .params(["$scope", "ScheduleDetailService"])
  .action(function($scope, ScheduleDetailService){

    ScheduleDetailService.get(function(data){
      $scope.datetodo=data;
    });

    $scope.toDetail = function(){

    }

  })
  .build();
