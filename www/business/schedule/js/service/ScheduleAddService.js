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
