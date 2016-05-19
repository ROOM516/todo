
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
