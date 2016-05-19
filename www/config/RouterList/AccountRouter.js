/*
 * 创建人：章剑飞
 * 创建原因：账号列表路由
 * 创建时间：2016年4月7日18:49:20
 * */

var ACCOUNT_ROUTER = {
  //个人中心路由
  account_tab : {
    url: '/account_tab',
    views: {
      'main_view': {
        templateUrl: 'business/account/index.html',
        controller: 'AccountCtrl'
      }
    }
  }
};
