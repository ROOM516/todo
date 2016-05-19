/*
* 创建人：章剑飞
* 创建原因：登录路由
* 创建时间：2016年4月6日10:28:09
* */

var SCHEDULE_ROUTER = {

  //日程路由
  schedule_tab : {
    url: '/schedule_tab',
    views: {
      'main_view': {
        templateUrl: 'business/schedule/index.html',
        controller: 'ScheduleCtrl'
      }
    }
  },
  //日程详情路由
  scheduleDetail : {
    url: '/scheduleDetail',
    views: {
      'main_view': {
        templateUrl: 'business/schedule/views/schedule_detail.html',
        controller: 'ScheduleDetailCtrl'
      }
    }
  }
};
