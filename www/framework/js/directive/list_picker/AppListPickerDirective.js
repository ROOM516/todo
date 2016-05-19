
angular.module("app.framework.listPicker.directive", ['app.framework.listPicker.service'])
  .directive("appListPickerDirective",
  ['AppMessageService', 'AppListPickerService', '$ionicScrollDelegate',
    function (AppMessageService, AppListPickerService, $ionicScrollDelegate) {

      return {
        scope: {
          title: "@",
          cancelText: "@",
          okText: "@",
          data: "=",
          selectFinish: "&",
          bind: "&"
        },
        templateUrl: "framework/js/directive/list_picker/template/list_picker.html",
        replace: true,
        restrict: "A",
        controller: ['$scope', function ($scope) {

          //生成id
          $scope.id = new Date().getTime();

          //显示选择器
          $scope.show = function () {

            //设置默认值
            if ($scope.title == undefined) {
              $scope.title = "请选择";
            }

            $ionicScrollDelegate.$getByHandle("pickerScroller").scrollTop();
            AppListPickerService.showPicker($scope.id);
          };

          //选项单击
          $scope.itemClick = function (value) {

            $scope.selectFinish({
              params: {
                item: AppListPickerService.getItemByValue($scope.data, value)
              }
            });
            $scope.hide();
          };

          //隐藏
          $scope.hide = function () {

            AppListPickerService.hidePicker($scope.id);
          };

          //绑定元素和方法
          $scope.bind({
            params: $scope
          });
        }]
      };

    }]);
