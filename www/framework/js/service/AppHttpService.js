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

