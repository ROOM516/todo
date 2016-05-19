
/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日16:51:30
 * 创建原因：设置控制器
 */
new AppModule()
  .group("app.business.account.controller")
  .require([])
  .type("controller")
  .name("AccountCtrl")
  .params(["$scope"])
  .action(function($scope){

    $scope.settings = {
      enableFriends: true
    };

  })
  .build();
