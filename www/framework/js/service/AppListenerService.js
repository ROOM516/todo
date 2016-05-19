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

