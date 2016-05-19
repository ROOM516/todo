
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
