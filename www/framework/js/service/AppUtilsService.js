/*
 * 创建人：章剑飞
 * 创建原因：工具服务
 * 创建时间：2016年05月18日16:27:34
 * */
new AppModule()
  .group("app.framework.utils.service")
  .require([])
  .type("service")
  .name("AppUtilsService")
  .params(['$interval', 'AppHttpService', 'AppMessageService', '$ionicLoading'])
  .action(function ($interval, AppHttpService, AppMessageService, $ionicLoading) {

    return {

      //定时循环
      interval: function (config) {

        return $interval(config.action, config.time);
      },

      //取消定时循环
      cancelInterval: function (timer) {

        $interval.cancel(timer);
      },

      //检查电话号码格式 -1：电话号码为空 0：格式错误 1：电话号码正确
      checkPhoneNum: function (phoneNum) {
        if (phoneNum.trim() === '') {
          //电话号码为空
          return 0;
        } else {
          var patrn = /^(\+86)?1[3|5|4|7|8]\d{9}$/;
          //检验手机格式
          if (!patrn.test(phoneNum.trim())) {
            //格式或长度错误
            return -1;
          }
        }
        return 1;
      },

      //外部调用检查更新
      updateVersion: function (callBack) {
        var me = this;
        try {
          me._updateVersion(callBack);
        } catch (e) {
          //非设备
        }
      },

      //检查更新
      _updateVersion: function (callBack) {

        var me = this;
        if (cordova.getAppVersion) {

          //获取版本号  检查更新
          cordova.getAppVersion.getVersionNumber().then(function (version) {
            AppConfig.DEFAULT_PARAMS.APP_VERSION = version;
            var device = ionic.Platform.platform();
            //1：安卓，2：ios
            var deviceCode = 1;
            if (device == 'ios') {
              deviceCode = 2;
              //return;
            }
            AppHttpService.send({
              url: 'index.php?c=Login&f=Init_Version',
              showLoading: false,
              params: {
                device: deviceCode
              },
              onSuccess: function (data) {
                if (data.code == 1000) {
                  //如果有最新版本
                  if (data.datas.version > version) {

                    var content = data.datas.update_info.split(';');
                    var contentStr = '';
                    for (var index in content) {
                      contentStr = contentStr + content[index] + ';<br/>';
                    }
                    AppMessageService.confirm({
                      content: '检查到最新版本，更新内容为：<br/>' + contentStr + '是否需要升级？',
                      okText: '是',
                      cancelText: '否',
                      onSelect: function (confirm) {
                        if (confirm) {
                          if(deviceCode == 1){

                            //更新版本
                            me.downLoadApk(data);
                          } else if(deviceCode == 2){
                            window.open(data.datas.download_url, '_blank', 'location=yes');
                          }
                        } else {
                          //不升级
                          if (data.datas.levelUp == 'force') {
                            //强制升级
                            ionic.Platform.exitApp();
                          }
                        }
                      }
                    });
                  } else {
                    //当前版本为最新版本
                    if(callBack){

                      callBack();
                    }
                  }
                } else {
                  AppMessageService.appToast({
                    content: data.msg
                  });
                }
              }
            });
          });
        }
      },

      //下载最新版本
      downLoadApk: function (data) {

        var fileUrl = 'file:///storage/emulated/0/fangao/fangaowuliu.apk';
        var fileTransfer = new FileTransfer();
        var uri = encodeURI(data.datas.download_url);
        //下载
        fileTransfer.download(
          uri,
          fileUrl,
          function (entry) {
            //console.log("download complete: " + entry.toURL());
            //下载成功后打开apk
            cordova.plugins.fileOpener2.open(
              fileUrl,
              'application/vnd.android.package-archive',
              {
                error: function (e) {
                  alert('打开apk失败！');
                }
              }
            );
          },
          function (error) {

          },
          false,
          {
            headers: {
              "Authorization": "Basic dGVzdHVzZXJuYW1lOnRlc3RwYXNzd29yZA=="
            }
          }
        );
        //升级进度条
        fileTransfer.onprogress = function (progress) {

          var downloadProgress = progress.loaded / progress.total * 100;
          $ionicLoading.show({
            template: "已经下载：" + Math.floor(downloadProgress) + "%"
          });
          if (downloadProgress > 99) {
            $ionicLoading.hide();
          }
        }
      }
    };
  })
  .build();
