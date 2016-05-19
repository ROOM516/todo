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
