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
