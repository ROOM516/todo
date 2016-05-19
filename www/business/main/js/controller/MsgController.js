
/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日16:11:17
 * 创建原因：消息页控制器
 */
new AppModule()
  .group("app.business.msg.controller")
  .require(["app.business.msg.service", "app.business.msgDetail.service",
    "app.business.msgDetail.controller"])
  .type("controller")
  .name("MsgCtrl")
  .params(["$scope", "$state", "MsgService", "MsgDetailService"])
  .action(function($scope, $state, MsgService, MsgDetailService){

    //初始化获取
    MsgService.getList(function(data){
      $scope.msgList=data;
    });

    //跳转到详情
    $scope.toDetail = function(msgInfo){
      MsgDetailService.msgInfo = msgInfo;
      $state.go("msgDetail");
    }
  })
  .build();
