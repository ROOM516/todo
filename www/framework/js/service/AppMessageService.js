/*
 * 创建人：章剑飞
 * 创建原因：消息服务
 * 创建时间：2016年05月18日16:27:41
 * */
new AppModule()
  .group("app.framework.message.service")
  .require([])
  .type("service")
  .name("AppMessageService")
  .params(['$ionicPopup', '$ionicLoading', '$timeout'])
  .action(function ($ionicPopup, $ionicLoading, $timeout) {

    return {

      //现在正在显示的对话框
      curPopup: null,
      //记录是否初始化过appToast
      isAppToastInit: false,
      //延时计时器
      appToastTimeout: null,

      //是否有弹出窗口正在显示
      isPopupShown: function () {

        var me = this;

        return me.curPopup != null && me.curPopup.$$state.status == 0;
      },

      //关闭当前正在显示的弹出窗口
      closePopup: function () {

        var me = this;

        if (me.curPopup != null) {

          me.curPopup.close();
          me.curPopup = null;
        }
      },

      //Popup 显示前动作
      beforePopupShownAction: function () {

        var me = this;

        if (me.isPopupShown()) {
          me.closePopup();
        }
      },

      //显示通知
      _showAppToast: function (config) {
        var me = this;
        var delay = 0;
        var duration = 3000;
        if (config.delay) {
          delay = config.delay;
        }
        if (config.duration) {
          duration = config.duration;
        }
        //延迟显示
        $timeout(function () {
          angular.element(document.getElementById('appToast')).css("display", "block");
          angular.element(document.getElementById('appToastContent')).html(config.content);
          angular.element(document.getElementById('appToast')).css("left", (window.innerWidth / 2 - 260 / 2) + "px");
          if (config.top !== undefined) {
            angular.element(document.getElementById('appToast')).css("top", config.top);
          }
          //停止之前正在运行的定时器
          if (me.appToastTimeout != null) {
            $timeout.cancel(me.appToastTimeout);
          }
          //持续几秒后消失
          me.appToastTimeout = $timeout(function () {
            angular.element(document.getElementById('appToast')).css("display", "none");
            me.appToastTimeout = null;
          }, duration);
        }, delay);
      },

      //通知
      appToast: function (config) {
        var me = this;
        //初始化时创建元素
        if (!me.isAppToastInit) {
          var html =
            '<div id="appToast" style="position: absolute;top: 50%; margin-top:-16px;width:260px;z-index: 9999;text-align: center;display: none;background-color: black;opacity:0.7;border-radius: 5px;padding: 5px;">' +
            '<span id="appToastContent" style="color: white;opacity: 1;font-size: 14px;"></span>' +
            '</div>';
          angular.element(document.body).append(html);
          me.isAppToastInit = true;
        }
        me._showAppToast(config);
      },

      //确认对话框
      confirm: function (config) {

        var me = this;

        me.beforePopupShownAction();

        me.curPopup = $ionicPopup.confirm({
          title: config.title ? config.title : '消息',
          template: config.content,
          okText: config.okText ? config.okText : '确定',
          cancelText: config.cancelText ? config.cancelText : '取消'
        });
        me.curPopup.then(function (res) {
          config.onSelect(res);
        });
        return me.curPopup;
      },

      //提示框
      alert: function (config) {

        var me = this;

        me.beforePopupShownAction();

        me.curPopup = $ionicPopup.alert({
          title: config.title ? config.title : '消息',
          template: config.content,
          okText: config.okText ? config.okText : '确定'
        });

        if (config.onSelect) {
          me.curPopup.then(function (res) {
            config.onSelect(res);
          });
        }
        return me.curPopup;
      },

      //自定义对话框
      dialog: function (config) {
        var me = this;

        me.beforePopupShownAction();

        var buttonList = [];
        for (var i in config.buttons) {

          var button = config.buttons[i];

          buttonList.push({
            text: button.text,
            type: button.class ? button.class : 'button-positive',
            onTap: function (e) {

              if (button.onSelect) {
                button.onSelect(e);
              }
            }
          });
        }

        me.curPopup = $ionicPopup.show({
          template: config.content,
          title: config.title ? config.title : '消息',
          scope: config.scope,
          buttons: buttonList
        });
        return me.curPopup;
      },
      //加载
      loading: function (config) {

        var html = "";
        if (config != undefined && config.content != undefined && config.content != "") {

          html += "<div class='row' style='margin:0;padding: 0;'>" +
            "	 <div class='col' style='margin:0;padding: 0;'><ion-spinner icon='android'></ion-spinner></div>" +
            "</div>" +
            "<div class='row' style='margin:0;'>" +
            "    <div class='col' style='margin:0;padding: 0;color:#cccccc;'>" + config.content + "</div>" +
            "</div>";
        } else {

          html = "<ion-spinner icon='android'></ion-spinner>";
        }

        $ionicLoading.show({
          template: html,
          hideOnStateChange: true,
          noBackdrop: config == undefined || config.mask == undefined ? false : !config.mask,
          //如果没有配置，则默认时间较长，避免出现使用在网络加载情境中提前隐藏的问题
          duration: config == undefined || config.duration == undefined ? 30000 : config.duration,
          delay: config == undefined || config.delay == undefined ? 0 : config.delay
        });
      },
      //隐藏加载
      hideLoading: function () {
        $ionicLoading.hide();
      }

    }
  })
  .build();
