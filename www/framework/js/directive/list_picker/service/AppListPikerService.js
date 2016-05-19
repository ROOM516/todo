
/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日17:07:33
 * 创建原因：选择器服务
 */
new AppModule()
  .group("app.framework.listPicker.service")
  .require([])
  .type("service")
  .name("AppListPickerService")
  .params(['$state', '$timeout', '$rootScope'])
  .action(function ($state, $timeout, $rootScope) {

    return {

      //显示选择器
      showPicker: function (id) {

        var picker = angular.element(document.getElementById("picker_" + id));
        var backdrop = angular.element(document.getElementById("picker_mask_" + id));

        picker.removeClass("framework-picker-down");
        backdrop.css("display", "block");
        backdrop.css("opacity", 0.7);
        picker.css("display", "block");
        picker.addClass("framework-picker-up");

        backdrop.removeClass("framework-picker-mask-hide");
        backdrop.addClass("framework-picker-mask-show");

        //处理首页tab栏
        if ($state.current.name.indexOf('_tab') > -1) {
          $rootScope.showTab = false;
        }
      },
      //隐藏选择器
      hidePicker: function (id) {

        var picker = angular.element(document.getElementById("picker_" + id));
        var backdrop = angular.element(document.getElementById("picker_mask_" + id));

        picker.removeClass("framework-picker-up");
        picker.addClass("framework-picker-down");

        backdrop.removeClass("framework-picker-mask-show");
        backdrop.addClass("framework-picker-mask-hide");
        //490ms 后 picker 隐藏，防止偶尔闪屏
        $timeout(function () {
          picker.css("display", "none");
          backdrop.css("display", "none");
        }, 490);
        //350ms后处理首页tab栏
        $timeout(function () {
          if ($state.current.name.indexOf('_tab') > -1) {
            $rootScope.showTab = true;
          }
        }, 350);
      },
      //根据值取出元素
      getItemByValue: function (items, value) {

        for (var item in items) {
          if (items[item].value == value) {
            return items[item];
          }
        }
        return {};
      }
    };
  })
  .build();
