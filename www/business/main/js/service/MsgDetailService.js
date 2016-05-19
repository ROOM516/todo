
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
