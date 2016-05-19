/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日15:54:55
 * 创建原因：模块构建器
 * */
var AppModule = function(){

  return {

    groupName : null,
    requireList : [],
    nameList : [],
    typeList : [],
    paramsList : [],
    actionList : [],

    group : function(name){
      this.groupName = name;
      return this;
    },

    require : function(require){
      this.requireList = require;
      return this;
    },

    name : function(name){
      this.nameList.push(name);
      return this;
    },

    type : function(name){
      this.typeList.push(name);
      return this;
    },

    params : function(params){
      this.paramsList.push(params);
      return this;
    },

    action : function(action){
      this.actionList.push(action);
      return this;
    },

    build : function(){

      var module = angular.module(this.groupName, this.requireList);

      while(this.nameList.length > 0){

        var name = this.nameList.pop();
        var type = this.typeList.pop();
        var action = this.actionList.pop();
        var params = this.paramsList.pop();

        //将 action 作为 params 的最后一个参数
        params.push(action);

        if(type == "controller"){

          module = module.controller(name, params);
        }else if (type == "service") {

          module = module.factory(name, params);
        }else if (type == "provider") {

          module = module.provider(name, params);
        }else if(type == "filter"){

          module = module.filter(name, params);
        }
      }
    }
  };

};

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

/**
 * 创建人：章剑飞
 * 创建原因：获取服务
 * 创建时间：2016年4月11日18:09:19
 *
 */

var APP_SYSTEM_HELPER = {

  // 获取简单服务
  getService : function(group, name){

    return angular.injector([group]).get(name);
  }
};

var LISTENER_TYPES = {
  VIEWS:{},
  DEVICE : {
    BACK_BUTTON : 'backButton'
  }
};


angular.module("app.framework.listPicker.directive", ['app.framework.listPicker.service'])
  .directive("appListPickerDirective",
  ['AppMessageService', 'AppListPickerService', '$ionicScrollDelegate',
    function (AppMessageService, AppListPickerService, $ionicScrollDelegate) {

      return {
        scope: {
          title: "@",
          cancelText: "@",
          okText: "@",
          data: "=",
          selectFinish: "&",
          bind: "&"
        },
        templateUrl: "framework/js/directive/list_picker/template/list_picker.html",
        replace: true,
        restrict: "A",
        controller: ['$scope', function ($scope) {

          //生成id
          $scope.id = new Date().getTime();

          //显示选择器
          $scope.show = function () {

            //设置默认值
            if ($scope.title == undefined) {
              $scope.title = "请选择";
            }

            $ionicScrollDelegate.$getByHandle("pickerScroller").scrollTop();
            AppListPickerService.showPicker($scope.id);
          };

          //选项单击
          $scope.itemClick = function (value) {

            $scope.selectFinish({
              params: {
                item: AppListPickerService.getItemByValue($scope.data, value)
              }
            });
            $scope.hide();
          };

          //隐藏
          $scope.hide = function () {

            AppListPickerService.hidePicker($scope.id);
          };

          //绑定元素和方法
          $scope.bind({
            params: $scope
          });
        }]
      };

    }]);


/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日17:07:33
 * 创建原因：选择器服务
 */
new AppModule()
  .group("app.framework.listPicker.service")
  .require([])
  .type("service")
  .name("AppListPickerService")
  .params(['$state', '$timeout', '$rootScope'])
  .action(function ($state, $timeout, $rootScope) {

    return {

      //显示选择器
      showPicker: function (id) {

        var picker = angular.element(document.getElementById("picker_" + id));
        var backdrop = angular.element(document.getElementById("picker_mask_" + id));

        picker.removeClass("framework-picker-down");
        backdrop.css("display", "block");
        backdrop.css("opacity", 0.7);
        picker.css("display", "block");
        picker.addClass("framework-picker-up");

        backdrop.removeClass("framework-picker-mask-hide");
        backdrop.addClass("framework-picker-mask-show");

        //处理首页tab栏
        if ($state.current.name.indexOf('_tab') > -1) {
          $rootScope.showTab = false;
        }
      },
      //隐藏选择器
      hidePicker: function (id) {

        var picker = angular.element(document.getElementById("picker_" + id));
        var backdrop = angular.element(document.getElementById("picker_mask_" + id));

        picker.removeClass("framework-picker-up");
        picker.addClass("framework-picker-down");

        backdrop.removeClass("framework-picker-mask-show");
        backdrop.addClass("framework-picker-mask-hide");
        //490ms 后 picker 隐藏，防止偶尔闪屏
        $timeout(function () {
          picker.css("display", "none");
          backdrop.css("display", "none");
        }, 490);
        //350ms后处理首页tab栏
        $timeout(function () {
          if ($state.current.name.indexOf('_tab') > -1) {
            $rootScope.showTab = true;
          }
        }, 350);
      },
      //根据值取出元素
      getItemByValue: function (items, value) {

        for (var item in items) {
          if (items[item].value == value) {
            return items[item];
          }
        }
        return {};
      }
    };
  })
  .build();

/*
 * 创建人：章剑飞
 * 创建原因：缓存服务
 * 创建时间：2016年05月18日16:23:32
 * */

var MEMORY_CACHE = {
  //用户信息
  userInfo: {},
  //token
  token: ''
};

new AppModule()
  .group("app.framework.cache.service")
  .require([])
  .type("service")
  .name("AppCacheService")
  .params([])
  .action(function () {

    return {

      //设置内存缓存
      setMemoryCache: function (key, value) {

        MEMORY_CACHE[key] = value;
      },

      //获取内存缓
      getMemoryCache: function (key) {
        return MEMORY_CACHE[key];
      },

      //清除内存缓存
      removeMemoryCache: function (key) {
        MEMORY_CACHE[key] = undefined;
      },

      //设置本地缓存
      setStorageCache: function (key, value) {
        var jsonValue = angular.toJson(value);
        localStorage.setItem(key, jsonValue);
      },

      //获取本地缓存
      getStorageCache: function (key) {
        var jsonValue = localStorage.getItem(key);
        return angular.fromJson(jsonValue);
      },

      //清除缓存
      removeStorageCache: function (key) {
        localStorage.removeItem(key);
      }
    };
  })
  .build();

/*
 * 创建人：章剑飞
 * 创建原因：请求服务
 * 创建时间：2016年05月18日16:23:07
 * */
new AppModule()
  .group("app.framework.http.service")
  .require([])
  .type("service")
  .name("AppHttpService")
  .params(['$http', 'AppMessageService'])
  .action(function ($http, AppMessageService) {

    return {

      isInit: true,

      /**
       * 构造 url
       *
       * @param url
       * @param params
       * @returns {*}
       */
      buildUrl: function (url, params) {

        var me = this;

        if (!params) return url;
        var parts = [];
        me._forEachSorted(params, function (value, key) {
          if (value === null || angular.isUndefined(value)) return;
          if (!angular.isArray(value)) value = [value];

          angular.forEach(value, function (v) {
            if (angular.isObject(v)) {
              if (angular.isDate(v)) {
                v = v.toISOString();
              } else {
                v = angular.toJson(v);
              }
            }
            parts.push(me._encodeUriQuery(key) + '=' +
              me._encodeUriQuery(v));
          });
        });
        if (parts.length > 0) {
          url += ((url.indexOf('?') == -1) ? '?' : '&') + parts.join('&');
        }
        return url;
      },

      _prepareParams: function (config) {

        var params = {};
        if (AppConfig.DEFAULT_PARAMS != undefined) {
          for (var name in AppConfig.DEFAULT_PARAMS) {
            params[name] = AppConfig.DEFAULT_PARAMS[name];
          }
        }
        if (config != undefined) {
          for (var name in config) {
            params[name] = config[name];
          }
        }

        return params;
      },

      _forEachSorted: function (obj, iterator, context) {

        var me = this;

        var keys = Object.keys(obj).sort();
        for (var i = 0; i < keys.length; i++) {
          iterator.call(context, obj[keys[i]], keys[i]);
        }
        return keys;
      },

      _encodeUriQuery: function (val, pctEncodeSpaces) {
        return encodeURIComponent(val).
          replace(/%40/gi, '@').
          replace(/%3A/gi, ':').
          replace(/%24/g, '$').
          replace(/%2C/gi, ',').
          replace(/%3B/gi, ';').
          replace(/'/gi, '%27').
          replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
      },

      /**
       * 检查 JSON 是否包含语法错误
       *
       * @param jsonString
       * @returns {boolean}
       */
      isJSONError: function (jsonString) {

        var checkResult = false;

        if (jsonString == undefined || jsonString == null || jsonString == "") {
          return checkResult;
        }

        try {

          //不要使用 var 声明，以免变量重复
          eval("kyee_json_test_result=" + jsonString + ";");

          checkResult = false;
        } catch (e) {

          checkResult = true;
        } finally {

          return checkResult;
        }
      },

      _initConfig: function (cfg) {
        var me = this;

        var config = {
          //默认使用 GET 请求
          type: cfg.type == undefined ? "GET" : cfg.type,
          url: AppConfig.SERVER_URL + cfg.url,
          showLoading: cfg.showLoading == undefined ? true : cfg.showLoading,
          autoHideLoading: cfg.autoHideLoading == undefined ? true : cfg.autoHideLoading,
          params: me._prepareParams(cfg.params),
          responseType: "json",
          responseSyntaxCheck: true,
          timeout: cfg.timeout,  //如果 cfg.timeout 没有定义，则使用框架默认值
          onBefore: function (config) {

            if (cfg.onBefore != undefined) {
              cfg.onBefore(config);
            }
          },
          onSuccess: function (resp) {

            if (cfg.onSuccess != undefined) {
              cfg.onSuccess(resp);
            }
          },
          onError: function (type) {

            if (cfg.onError != undefined) {
              cfg.onError(type);
            }
          }
        };


        //解析参数值为函数类型的参数
        if (config.params != undefined) {

          for (var name in config.params) {

            if (typeof config.params[name] == "function") {

              config.params[name] = config.params[name]();
            }
          }
        }

        return config;
      },

      /**
       * 初始化
       *
       * 应用程序生命周期中仅需要执行一次
       */
      init: function () {

        var me = this;

        //设置 post 请求默认 header 值
        $http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";

        me.isInit = false;
      },

      send: function (cfg) {
        var me = this;

        if (me.isInit) {
          me.init();
        }

        //处理请求配置
        var config = me._initConfig(cfg);

        //如果 url 中包含双斜线，则替换为单斜线
        config.url = config.url.replace(/\/\//g, "/").replace("http:/", "http://");

        //设置 timeout
        config.timeout = config.timeout == undefined ? 30000 : config.timeout;

        //请求类型
        var type = config.type == undefined ? "GET" : config.type;

        //http 配置对象
        var httpConfig = {
          method: type,
          url: config.url,
          transformRequest: function (data) {

            //对 POST 类型执行参数序列化
            if (type == "POST") {
              return me.buildUrl("", data).substring(1);
            }

            return data;
          },
          //注意：
          //由于 angular 调用了 JSON.parse 执行 json 反序列化，
          //JSON.parse 要求 key 必须使用双引号，因此统一采用 text 处理，然后在 onSuccess 中执行类型转换
          //使用 transformResponse 函数要求 angular 不要对 response 做任何处理，直接返回字符串
          transformResponse: function (data) {
            return data;
          },
          //注意：
          //由于 angular 调用了 JSON.parse 执行 json 反序列化，
          //JSON.parse 要求 key 必须使用双引号，因此统一采用 text 处理，然后在 onSuccess 中执行类型转换
          responseType: "text",
          timeout: config.timeout
        };

        //如果是 GET 请求，参数追加到 url 上，如果使用 POST 请求，使用 data 属性发送
        //注意，对于 get 类型请求，没有使用 angualr 中的 params 参数，因为需要操作最终的带参数的 url
        if (type == "GET") {

          //直接使用jsonp方式请求
          httpConfig.url = me.buildUrl(config.url, config.params);
          httpConfig.urlParamsString = httpConfig.url.substring(httpConfig.url.indexOf("?") + 1);
        } else if (type == "POST") {

          httpConfig.data = config.params;
        }

        //本地加载无需显示加载提示
        if (config.showLoading !== undefined && config.showLoading == true && config.url.indexOf("http://") != -1) {

          //显示时间应 >= http timeout
          AppMessageService.loading({
            content: cfg.loadingText,
            mask: false,
            duration: cfg.timeout
          });
        }

        //执行 onBefore 方法
        if (config.onBefore != undefined) {
          config.onBefore(httpConfig);
        }

        $http(httpConfig).success(function (data) {

          //执行语法检查，以免服务器响应的 json 格式错误
          //仅当从服务器请求数据时启用语法检查，排除本地加载页面的情况
          if (config.responseSyntaxCheck == true && config.url.indexOf("http://") != -1) {

            var isError = me.isJSONError(data);
            if (isError) {

              console.error("检测到服务器返回结果语法错误，已回调 onError 方法！");

              if (config.onError != undefined) {
                config.onError("RESPONSE_SYNTAX_ERROR");
              }
              return;
            }
          }

          //注意：
          //由于 angular 调用了 JSON.parse 执行 json 反序列化，
          //JSON.parse 要求 key 必须使用双引号，因此统一采用 text 处理，然后在 onSuccess 中执行类型转换
          var _data = data;
          //responseType 默认值为 text
          if (config.responseType != undefined && config.responseType == "json") {
            eval("var result=" + data + ";");
            _data = result;
          }

          //隐藏加载提示
          if (config.showLoading != undefined && config.showLoading == true && config.autoHideLoading != false && config.url.indexOf("http://") != -1) {
            AppMessageService.hideLoading();
          }

          if (config.onSuccess != undefined) {

            config.onSuccess(_data);
          }

        }).error(function () {

          //隐藏加载提示
          if (config.showLoading != undefined && config.showLoading == true && config.autoHideLoading != false && config.url.indexOf("http://") != -1) {
            AppMessageService.hideLoading();
          }

          if (config.onError != undefined) {
            config.onError(config);
          }
        });

      }
    };
  })
  .build();


/*
 * 创建人：章剑飞
 * 创建原因：监听服务
 * 创建时间：2016年05月18日16:27:50
 * */

new AppModule()
  .group("app.framework.listener.service")
  .require([])
  .type("service")
  .name("AppListenerService")
  .params([])
  .action(function () {

    return {

      ListenerTable: {},

      onceListenerTable: {},

      //注册监听事件
      regist: function (config) {

        var key = config.page + '|' + config.when;
        this.ListenerTable[key] = config;
      },

      //查询页面指定事件
      queryHandler: function (page, when) {

        var key = page + "|" + when;
        return this.ListenerTable[key] == undefined ? null : this.ListenerTable[key];
      },

      //注册一次性事件
      once: function (config) {

        this.onceListenerTable[config.when] = config;
      },

      //卸载一次性事件
      uninstallOnce: function (when) {

        this.onceListenerTable[when] = undefined;
      },

      //查询一次性事件处理器
      queryOnceHandler: function (when) {

        return this.onceListenerTable[when] == undefined ? null : this.onceListenerTable[when];
      }

    };
  })
  .build();


/*
 * 创建人：章剑飞
 * 创建原因：消息服务
 * 创建时间：2016年05月18日16:27:41
 * */
new AppModule()
  .group("app.framework.message.service")
  .require([])
  .type("service")
  .name("AppMessageService")
  .params(['$ionicPopup', '$ionicLoading', '$timeout'])
  .action(function ($ionicPopup, $ionicLoading, $timeout) {

    return {

      //现在正在显示的对话框
      curPopup: null,
      //记录是否初始化过appToast
      isAppToastInit: false,
      //延时计时器
      appToastTimeout: null,

      //是否有弹出窗口正在显示
      isPopupShown: function () {

        var me = this;

        return me.curPopup != null && me.curPopup.$$state.status == 0;
      },

      //关闭当前正在显示的弹出窗口
      closePopup: function () {

        var me = this;

        if (me.curPopup != null) {

          me.curPopup.close();
          me.curPopup = null;
        }
      },

      //Popup 显示前动作
      beforePopupShownAction: function () {

        var me = this;

        if (me.isPopupShown()) {
          me.closePopup();
        }
      },

      //显示通知
      _showAppToast: function (config) {
        var me = this;
        var delay = 0;
        var duration = 3000;
        if (config.delay) {
          delay = config.delay;
        }
        if (config.duration) {
          duration = config.duration;
        }
        //延迟显示
        $timeout(function () {
          angular.element(document.getElementById('appToast')).css("display", "block");
          angular.element(document.getElementById('appToastContent')).html(config.content);
          angular.element(document.getElementById('appToast')).css("left", (window.innerWidth / 2 - 260 / 2) + "px");
          if (config.top !== undefined) {
            angular.element(document.getElementById('appToast')).css("top", config.top);
          }
          //停止之前正在运行的定时器
          if (me.appToastTimeout != null) {
            $timeout.cancel(me.appToastTimeout);
          }
          //持续几秒后消失
          me.appToastTimeout = $timeout(function () {
            angular.element(document.getElementById('appToast')).css("display", "none");
            me.appToastTimeout = null;
          }, duration);
        }, delay);
      },

      //通知
      appToast: function (config) {
        var me = this;
        //初始化时创建元素
        if (!me.isAppToastInit) {
          var html =
            '<div id="appToast" style="position: absolute;top: 50%; margin-top:-16px;width:260px;z-index: 9999;text-align: center;display: none;background-color: black;opacity:0.7;border-radius: 5px;padding: 5px;">' +
            '<span id="appToastContent" style="color: white;opacity: 1;font-size: 14px;"></span>' +
            '</div>';
          angular.element(document.body).append(html);
          me.isAppToastInit = true;
        }
        me._showAppToast(config);
      },

      //确认对话框
      confirm: function (config) {

        var me = this;

        me.beforePopupShownAction();

        me.curPopup = $ionicPopup.confirm({
          title: config.title ? config.title : '消息',
          template: config.content,
          okText: config.okText ? config.okText : '确定',
          cancelText: config.cancelText ? config.cancelText : '取消'
        });
        me.curPopup.then(function (res) {
          config.onSelect(res);
        });
        return me.curPopup;
      },

      //提示框
      alert: function (config) {

        var me = this;

        me.beforePopupShownAction();

        me.curPopup = $ionicPopup.alert({
          title: config.title ? config.title : '消息',
          template: config.content,
          okText: config.okText ? config.okText : '确定'
        });

        if (config.onSelect) {
          me.curPopup.then(function (res) {
            config.onSelect(res);
          });
        }
        return me.curPopup;
      },

      //自定义对话框
      dialog: function (config) {
        var me = this;

        me.beforePopupShownAction();

        var buttonList = [];
        for (var i in config.buttons) {

          var button = config.buttons[i];

          buttonList.push({
            text: button.text,
            type: button.class ? button.class : 'button-positive',
            onTap: function (e) {

              if (button.onSelect) {
                button.onSelect(e);
              }
            }
          });
        }

        me.curPopup = $ionicPopup.show({
          template: config.content,
          title: config.title ? config.title : '消息',
          scope: config.scope,
          buttons: buttonList
        });
        return me.curPopup;
      },
      //加载
      loading: function (config) {

        var html = "";
        if (config != undefined && config.content != undefined && config.content != "") {

          html += "<div class='row' style='margin:0;padding: 0;'>" +
            "	 <div class='col' style='margin:0;padding: 0;'><ion-spinner icon='android'></ion-spinner></div>" +
            "</div>" +
            "<div class='row' style='margin:0;'>" +
            "    <div class='col' style='margin:0;padding: 0;color:#cccccc;'>" + config.content + "</div>" +
            "</div>";
        } else {

          html = "<ion-spinner icon='android'></ion-spinner>";
        }

        $ionicLoading.show({
          template: html,
          hideOnStateChange: true,
          noBackdrop: config == undefined || config.mask == undefined ? false : !config.mask,
          //如果没有配置，则默认时间较长，避免出现使用在网络加载情境中提前隐藏的问题
          duration: config == undefined || config.duration == undefined ? 30000 : config.duration,
          delay: config == undefined || config.delay == undefined ? 0 : config.delay
        });
      },
      //隐藏加载
      hideLoading: function () {
        $ionicLoading.hide();
      }

    }
  })
  .build();

/*
 * 创建人：章剑飞
 * 创建原因：工具服务
 * 创建时间：2016年05月18日16:27:34
 * */
new AppModule()
  .group("app.framework.utils.service")
  .require([])
  .type("service")
  .name("AppUtilsService")
  .params(['$interval', 'AppHttpService', 'AppMessageService', '$ionicLoading'])
  .action(function ($interval, AppHttpService, AppMessageService, $ionicLoading) {

    return {

      //定时循环
      interval: function (config) {

        return $interval(config.action, config.time);
      },

      //取消定时循环
      cancelInterval: function (timer) {

        $interval.cancel(timer);
      },

      //检查电话号码格式 -1：电话号码为空 0：格式错误 1：电话号码正确
      checkPhoneNum: function (phoneNum) {
        if (phoneNum.trim() === '') {
          //电话号码为空
          return 0;
        } else {
          var patrn = /^(\+86)?1[3|5|4|7|8]\d{9}$/;
          //检验手机格式
          if (!patrn.test(phoneNum.trim())) {
            //格式或长度错误
            return -1;
          }
        }
        return 1;
      },

      //外部调用检查更新
      updateVersion: function (callBack) {
        var me = this;
        try {
          me._updateVersion(callBack);
        } catch (e) {
          //非设备
        }
      },

      //检查更新
      _updateVersion: function (callBack) {

        var me = this;
        if (cordova.getAppVersion) {

          //获取版本号  检查更新
          cordova.getAppVersion.getVersionNumber().then(function (version) {
            AppConfig.DEFAULT_PARAMS.APP_VERSION = version;
            var device = ionic.Platform.platform();
            //1：安卓，2：ios
            var deviceCode = 1;
            if (device == 'ios') {
              deviceCode = 2;
              //return;
            }
            AppHttpService.send({
              url: 'index.php?c=Login&f=Init_Version',
              showLoading: false,
              params: {
                device: deviceCode
              },
              onSuccess: function (data) {
                if (data.code == 1000) {
                  //如果有最新版本
                  if (data.datas.version > version) {

                    var content = data.datas.update_info.split(';');
                    var contentStr = '';
                    for (var index in content) {
                      contentStr = contentStr + content[index] + ';<br/>';
                    }
                    AppMessageService.confirm({
                      content: '检查到最新版本，更新内容为：<br/>' + contentStr + '是否需要升级？',
                      okText: '是',
                      cancelText: '否',
                      onSelect: function (confirm) {
                        if (confirm) {
                          if(deviceCode == 1){

                            //更新版本
                            me.downLoadApk(data);
                          } else if(deviceCode == 2){
                            window.open(data.datas.download_url, '_blank', 'location=yes');
                          }
                        } else {
                          //不升级
                          if (data.datas.levelUp == 'force') {
                            //强制升级
                            ionic.Platform.exitApp();
                          }
                        }
                      }
                    });
                  } else {
                    //当前版本为最新版本
                    if(callBack){

                      callBack();
                    }
                  }
                } else {
                  AppMessageService.appToast({
                    content: data.msg
                  });
                }
              }
            });
          });
        }
      },

      //下载最新版本
      downLoadApk: function (data) {

        var fileUrl = 'file:///storage/emulated/0/fangao/fangaowuliu.apk';
        var fileTransfer = new FileTransfer();
        var uri = encodeURI(data.datas.download_url);
        //下载
        fileTransfer.download(
          uri,
          fileUrl,
          function (entry) {
            //console.log("download complete: " + entry.toURL());
            //下载成功后打开apk
            cordova.plugins.fileOpener2.open(
              fileUrl,
              'application/vnd.android.package-archive',
              {
                error: function (e) {
                  alert('打开apk失败！');
                }
              }
            );
          },
          function (error) {

          },
          false,
          {
            headers: {
              "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
            }
          }
        );
        //升级进度条
        fileTransfer.onprogress = function (progress) {

          var downloadProgress = progress.loaded / progress.total * 100;
          $ionicLoading.show({
            template: "已经下载：" + Math.floor(downloadProgress) + "%"
          });
          if (downloadProgress > 99) {
            $ionicLoading.hide();
          }
        }
      }
    };
  })
  .build();

/*
* 创建人：章剑飞
* 创建原因：APP配置
* 创建时间：2016年05月18日14:47:47
* */

var AppConfig = {
  //请求服务器地址
  SERVER_URL: 'http://localhost:8100/api/',
  //请求公用参数
  DEFAULT_PARAMS : {

    //APP版本号
    APP_VERSION : '0.0.1',
    token : function(){
      var AppCacheService = APP_SYSTEM_HELPER.getService('app.framework.cache.service', 'AppCacheService');
      return AppCacheService.getMemoryCache('token');
    }
  }
};

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


/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日16:13:30
 * 创建原因：消息服务层
 */
new AppModule()
  .group("app.business.msgDetail.service")
  .require([])
  .type("service")
  .name("MsgDetailService")
  .params([])
  .action(function(){

    return {

      msgInfo : {}
    };
  })
  .build();


/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日16:13:30
 * 创建原因：消息服务层
 */
new AppModule()
  .group("app.business.msg.service")
  .require([])
  .type("service")
  .name("MsgService")
  .params(["AppHttpService"])
  .action(function(AppHttpService){
    var msgList=[];

    return {

      getList: function(callback) {
        AppHttpService.send({
          type: 'GET',
          url: "todo/msgList",
          params: {},
          onSuccess: function (data) {
            msgList=data;
            callback(data);
          },
          onError: function () {
          }
        });
      },
      getMsg: function(id) {
        for (var i = 0; i < msgList.length; i++) {
          if (msgList[i].id ==id) {
            return msgList[i];
          }
        }
        return null;
      }
    };
  })
  .build();


/**
 * 创建人：章剑飞
 * 创建时间：2016年05月19日09:31:25
 * 创建原因：添加日程控制器
 */
new AppModule()
  .group("app.business.scheduleAdd.controller")
  .require(["app.business.scheduleAdd.service"])
  .type("controller")
  .name("ScheduleAddCtrl")
  .params(["$scope", "$state", "ScheduleAddService"])
  .action(function($scope, $state, ScheduleAddService){

    $scope.datetodo ={
      dateTime : "",
      todo:'',
      remind:0
    };
    //提交todo
    $scope.submit = function(){
      ScheduleAddService.save(function(data){
        $state.go('tab.schedule',{});
      },$scope.datetodo);
    };
  })
  .build();


/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日16:35:20
 * 创建原因：日程页控制器
 */
new AppModule()
  .group("app.business.schedule.controller")
  .require(["app.business.schedule.service", "app.business.scheduleDetail.controller"])
  .type("controller")
  .name("ScheduleCtrl")
  .params(["$scope", "$state", "ScheduleService"])
  .action(function($scope, $state, ScheduleService){

    var month=new Date().getMonth();
    var year=new Date().getFullYear();
    $scope.date = ScheduleService.getDate(year,month);
    $scope.datevalue=new Date();
    $scope.dateInfo = function(datevalue,day){
      var ddd= new Date(datevalue);
      ddd.setDate(day);
      $scope.datevalue=ddd;

    };

    $scope.updateValue = function(datevalue){
      $scope.datevalue=datevalue;
      var newdate = new Date(datevalue);
      var month=newdate.getMonth();
      var year=newdate.getFullYear();
      $scope.date = ScheduleService.getDate(year,month);
    };

    //跳转详情
    $scope.toDetail = function(){
      $state.go("scheduleDetail");
    }

  })
  .build();


/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日20:44:32
 * 创建原因：日程详情控制器
 */
new AppModule()
  .group("app.business.scheduleDetail.controller")
  .require(["app.business.scheduleDetail.service"])
  .type("controller")
  .name("ScheduleDetailCtrl")
  .params(["$scope", "ScheduleDetailService"])
  .action(function($scope, ScheduleDetailService){

    ScheduleDetailService.get(function(data){
      $scope.datetodo=data;
    });

    $scope.toDetail = function(){

    }

  })
  .build();

/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日16:38:01
 * 创建原因：日程服务层
 */
new AppModule()
  .group("app.business.scheduleAdd.service")
  .require([])
  .type("service")
  .name("ScheduleAddService")
  .params(["AppHttpService", "AppMessageService"])
  .action(function (AppHttpService, AppMessageService) {
    return {
      dateTime : "",
      save: function (callback, data) {
        console.log(data);
        var me = this;
        AppHttpService.send({
          type: 'POST',
          url: "todo/saveSchedule",
          params: {
            dateTime : me.dateTime,
            todo : data.todo,
            remind : data.remind
          },
          onSuccess: function (data) {

            AppMessageService.appToast({
              content : "提交成功"
            });
            callback(data);
          },
          onError: function () {
          }
        });
      }
    };
  })
  .build();

/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日20:51:26
 * 创建原因：日程详情服务层
 */
new AppModule()
  .group("app.business.scheduleDetail.service")
  .require([])
  .type("service")
  .name("ScheduleDetailService")
  .params(["AppHttpService"])
  .action(function (AppHttpService) {
    return {
      get: function (callback) {

        AppHttpService.send({
          type: 'GET',
          url: "todo/schedule",
          params: {},
          onSuccess: function (data) {
            callback(data);
          },
          onError: function () {
          }
        });
      }
    };
  })
  .build();


/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日16:38:01
 * 创建原因：日程服务层
 */
new AppModule()
  .group("app.business.schedule.service")
  .require([])
  .type("service")
  .name("ScheduleService")
  .params([])
  .action(function(){
    return {
      getDate: function(year,month) {
        var date=[];
        var initDate = new Date();
        var currentDay=0;
        initDate.setYear(year);
        initDate.setMonth(month);
        initDate.setDate(1);
        var startDay = initDate.getDay();
        initDate.setMonth(month+1);
        initDate.setDate(1);
        var endDay = new Date(initDate.getTime()-1000*60*60*24).getDate();
        for(var i=0;i<6;i++){
          var daterow=[];
          for(var j=0;j<7;j++){
            if(currentDay==0&&startDay>j||currentDay==endDay){
              daterow.push('');
            }else{
              currentDay++;
              daterow.push(currentDay);
            }
          }
          date.push(daterow);
        }
        return date;
      }
    };
  })
  .build();


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
