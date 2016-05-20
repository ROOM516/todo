
/**
 * 创建人：章剑飞
 * 创建时间：2016年05月19日09:31:25
 * 创建原因：添加日程控制器
 */
new AppModule()
  .group("app.business.scheduleAdd.controller")
  .require(["app.business.scheduleAdd.service"])
  .type("controller")
  .name("ScheduleAddCtrl")
  .params(["$scope", "$state", "ScheduleAddService"])
  .action(function($scope, $state, ScheduleAddService){

    ScheduleAddService.loadData(function(data){
      $scope.scheduleList = data;
    });

    $scope.datetodo ={
      dateTime : "",
      todo:'',
      remind:0
    };
    //提交todo
    $scope.submit = function(){

      ScheduleAddService.save(function(data){
        $state.go('tab.schedule',{});
      },$scope.datetodo);
    };
  })
  .build();
