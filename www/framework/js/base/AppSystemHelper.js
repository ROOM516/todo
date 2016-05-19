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
