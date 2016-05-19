/*
 * 创建人：章剑飞
 * 创建原因：启动构建器
 * 创建时间：2016年05月18日14:43:01
 * */

var AppStarter = function () {
  return {
    //
    groupName: '',
    requireList: [],
    defaultUrlList: [],
    listenerList: {},
    homePartnerList: [],

    name: function (name) {
      this.groupName = name;
      return this;
    },

    require: function (require) {
      this.requireList = require;
      return this;
    },

    defaultUrl: function (defaultUrl) {
      this.defaultUrlList = defaultUrl;
      return this;
    },

    listeners: function (listeners) {
      this.listenerList = listeners;
      return this;
    },

    homePartners: function (homePartners) {
      this.homePartnerList = homePartners;
      return this;
    },

    _registListeners: function ($rootScope, $state) {
      var me = this;
      //全局监听器，跳转页面监听
      $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

        //获取缓存服务
        var AppCacheService = APP_SYSTEM_HELPER.getService('app.framework.cache.service', 'AppCacheService');

        var listener = me.listenerList.onStateChangeStart;
        if (listener != undefined) {

          listener({
            event: event,
            toState: toState,
            toParams: toParams,
            fromState: fromState,
            fromParams: fromParams,
            rootScope: $rootScope,
            state: $state,
            AppCacheService: AppCacheService
          });
        }
      });

    },

    //构建
    build: function () {
      var me = this;

      angular.module(this.groupName, this.requireList)
        .constant('ApiEndpoint',{
          url:'http://localhost:8100/api'
        })
        .run(['$ionicPlatform', '$rootScope', '$location', 'AppMessageService', '$state',
          '$ionicHistory', 'AppListenerService', 'AppHttpService', '$ionicLoading', '$timeout', 'AppUtilsService',
          function ($ionicPlatform, $rootScope, $location, AppMessageService, $state,
                    $ionicHistory, AppListenerService, AppHttpService, $ionicLoading, $timeout, AppUtilsService) {
            //初始显示页签
            $rootScope.showTab = true;
            $rootScope.platform = ionic.Platform.platform();

            if (me._registListeners) {
              me._registListeners($rootScope, $state);
            }

            //初始化时需要的参数
            var _parmaList = {
              urlParams: $location.search(),
              AppMessageService : AppMessageService,
              AppListenerService : AppListenerService,
              AppUtilsService : AppUtilsService
            };

            //执行初始化方法
            if (me.listenerList.onInit != null) {
              me.listenerList.onInit(_parmaList);
            }

            $ionicPlatform.ready(function () {
              // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
              // for form inputs)
              if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
              }

              try{

                if ($rootScope.platform == 'android') {
                  StatusBar.backgroundColorByHexString("#333");
                } else {
                  StatusBar.overlaysWebView(false);
                  StatusBar.styleLightContent();
                  StatusBar.backgroundColorByHexString("#fff");
                }
              } catch(e){
                //非设备
              }
              //检查更新
              AppUtilsService.updateVersion();

              if (navigator.splashscreen != undefined) {
                navigator.splashscreen.hide();
              }
              try {
                //重写wondow.open方法
                window.open = cordova.InAppBrowser.open;
              } catch (e) {
                //需要打包后使用
              }
              if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
              }

              if (me.listenerList.onFinish != undefined) {
                me.listenerList.onFinish(_parmaList);
              }
            });

            //注册默认物理返回按钮事件
            var isBackBtnFirstPressed = false;  //记录返回按钮是否第一次被单击，用于双击退出的判断
            $ionicPlatform.registerBackButtonAction(function (e) {

              //终止默认事件
              e.preventDefault();

              //当前页面路由
              var currState = $state.current.name;

              //触发物理返回键监听事件
              var handler = AppListenerService.queryHandler(currState, LISTENER_TYPES.DEVICE.BACK_BUTTON);
              if (handler != null) {

                var isContinue = true;
                handler.action({
                  stopAction: function () {
                    isContinue = false;
                  }
                });

                if (!isContinue) {
                  return;
                }
              }

              //主页面提示退出
              if (me.defaultUrlList.indexOf(currState) != -1) {

                if(!isBackBtnFirstPressed){

                  isBackBtnFirstPressed = true;

                  //2 s 内再次单击有效
                  AppMessageService.appToast({
                    content : "再次单击退出应用",
                    duration : 2000
                  });
                  //
                  $timeout(function(){
                    isBackBtnFirstPressed = false;
                  }, 2000);
                }else{

                  ionic.Platform.exitApp();
                }
              } else {

                //如果是主页伙伴，则直接跳转到主页
                if (me.homePartnerList.indexOf(currState) != -1) {

                  $state.go(me.defaultUrlList[0]);
                } else {

                  //非伙伴页面返回历史
                  $ionicHistory.goBack();
                }
              }
            }, 501);
          }])

        .config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider',
          function ($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

            //统一指定 tab 的样式
            $ionicConfigProvider.tabs.position("bottom");
            $ionicConfigProvider.tabs.style("standard");

            //统一取消导航返回按钮的文字
            $ionicConfigProvider.backButton.text("");
            $ionicConfigProvider.backButton.previousTitleText(false);

            //使用js滚动方式
            $ionicConfigProvider.scrolling.jsScrolling(true);

            //统一指定导航返回按钮的图标
            $ionicConfigProvider.backButton.icon("ion-chevron-left back-btn");

            //最大缓存的视图数（过小需要频繁的重新编译视图，过大可导致整体试图切换缓慢）
            $ionicConfigProvider.views.maxCache(10);

            //禁用 ios 手势返回（会造成界面问题）
            $ionicConfigProvider.views.swipeBackEnabled(false);


            //注册路由
            var tables = APP_ROUTER.getTables();
            for (var index in tables) {
              //路由列表
              var table = tables[index];

              for (var item in table) {
                $stateProvider.state(item, table[item]);
              }
            }

            // if none of the above states are matched, use this as the fallback
            $urlRouterProvider.otherwise(me.defaultUrlList[0]);

          }]);
    }
  };
};
