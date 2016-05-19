/*
* 创建人：章剑飞
* 创建原因：主页路由
* 创建时间：2016年05月18日15:27:17
*
* */
var MAIN_ROUTER = {
  //消息路由
  msg_tab : {
    url:"/msg_tab",
    views:{
      "main_view":{
        templateUrl: 'business/main/index.html',
        controller: 'MsgCtrl'
      }
    }
  },
  //消息详情
  msgDetail : {
    url: '/msgDetail',
    views: {
      'main_view': {
        templateUrl: 'business/main/views/msg_detail.html',
        controller: 'MsgDetailCtrl'
      }
    }
  }
};
