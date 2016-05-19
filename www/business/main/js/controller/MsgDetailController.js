
/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日20:22:17
 * 创建原因：消息详情页控制器
 */
new AppModule()
  .group("app.business.msgDetail.controller")
  .require([])
  .type("controller")
  .name("MsgDetailCtrl")
  .params(["$scope", "MsgDetailService"])
  .action(function($scope, MsgDetailService){

    $scope.msg = MsgDetailService.msgInfo;

  })
  .build();
