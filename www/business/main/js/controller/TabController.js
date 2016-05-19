
/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日16:01:59
 * 创建原因：tab控制器
 */
new AppModule()
  .group("app.business.tab.controller")
  .require([])
  .type("controller")
  .name("TabCtrl")
  .params(["$scope"])
  .action(function($scope){

  })
  .build();
