
new AppStarter()
  .name('starter')
  .defaultUrl(['msg_tab'])
  .require([
    /**
     * 框架级
     * */
    'ionic',
    //请求服务
    'app.framework.http.service',
    //缓存服务
    'app.framework.cache.service',
    //事件监听服务
    'app.framework.listener.service',
    //消息服务
    'app.framework.message.service',
    //工具类服务
    'app.framework.utils.service',
    //选择器组件
    'app.framework.listPicker.directive',
    /**
     * 业务级
     * */
    //消息
    'app.business.msg.controller',
    //日程
    'app.business.schedule.controller',
    //个人中心
    'app.business.account.controller',
    //页签
    'app.business.tab.controller'
  ])
  .homePartners(['schedule_tab', 'account_tab'])
  .listeners({

    //跳转页面之前
    onStateChangeStart: function (params) {
      var stateName = params.toState.name;

      if (stateName.indexOf('_tab') >= 0) {

        params.rootScope.showTab = true;
      } else {
        params.rootScope.showTab = false;
      }
    },
    //初始化之前
    onInit: function (params) {

    },
    //初始化结束
    onFinish: function (params) {

    }
  })
  .build();
