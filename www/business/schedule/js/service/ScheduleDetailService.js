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
