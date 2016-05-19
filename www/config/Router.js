/*
* 创建人：章剑飞
* 创建原因：路由集
* 创建时间：2016年05月18日14:41:33
*
* */
var APP_ROUTER = {
  //获取路由集
  getTables : function() {
    return [
      //首页路由
      MAIN_ROUTER,
      //日程路由
      SCHEDULE_ROUTER,
      //设置路由
      ACCOUNT_ROUTER
    ];
  }
};
