/*
 AngularJS TableView v1.0
 (c) 2016 Max Chuhryaev <w3core@gmail.com> https://github.com/w3core/AngularJS-TableView
 License: MIT
*/
angular
.module("tableview", [])
.directive("tableview", function($compile, $http) {

  var MODULE_NAME = "angular.tableview";
  var MODULE_URL = getModuleURL();
  var MODULE_TPL = MODULE_URL + MODULE_NAME + ".html";

  function getModuleURL () {
    var js = document.querySelector("script[src*='" + MODULE_NAME + "']");
    if (js) return js.src.replace(/[^\/]*$/, ''); 
  }

  return {
    restrict: "A",
    scope: {
      tableview: "="
    },
    templateUrl: function ($element, $attr) {
      return $attr.tableviewTemplateUrl || MODULE_TPL;
    },
    compile: function ($element, $attr) {
      return function ($scope, $element, $attr) {
        $scope.$scope = $scope.$parent;
        $scope.Math = Math;
        $scope.tableview.rows = [];
        $scope.tableview.amount = 0;
        $scope.tableview.pages = 1;

        $scope.tableview.limits = $scope.tableview.limits || [10, 25, 50, 100];

        function updateOptions () {
          $scope.tableview.selection = $scope.tableview.selection || [];
          $scope.tableview.request = $scope.tableview.request || {};
          $scope.tableview.request.page = $scope.tableview.request.page || 1;
          $scope.tableview.request.limit = $scope.tableview.request.limit || $scope.tableview.limits[0];
          $scope.tableview.request.order = $scope.tableview.request.order || [];
          $scope.tableview.request.like = $scope.tableview.request.like || {};
        }

        $scope.exec = function () {
          updateOptions();
          for (var i in $scope.tableview.columns) {
            if ($scope.tableview.columns[i].sortable) {
              var v = $scope.getSort($scope.tableview.columns[i].field);
              $scope.tableview.columns[i].sorting = v && v.value ? v.value : undefined;
            }
            else delete $scope.tableview.columns[i].sorting;
          }
          $scope.tableview.provider($scope.tableview.request, function (response) {
            $scope.tableview.rows = response.rows;
            $scope.tableview.amount = response.amount;
            $scope.tableview.pages = Math.ceil(response.amount/(response.limit || 1));
            $scope.tableview.request.page = response.page;
            $scope.tableview.request.limit = response.limit;
            var $node = $element[0], $scroller = $node.querySelector(".scrollable");
            if ($scroller && $scroller.parentNode == $node) $scroller.scrollTop = 0;
          });          
        };
        // Execution function sharing for external calls (filters extending logic)
        $scope.tableview.exec = $scope.exec;

        $scope.getColumnConfigByField = function (field) {
          var columns = $scope.tableview.columns;
          for (var i in columns) {
            if (columns[i].field == field) return {index:i*1, config:columns[i]};
          }
        };

        $scope.getSort = function (field) {
          var column = $scope.getColumnConfigByField(field);
          if (column && column.config.sortable) {
            var r = $scope.tableview.request.order;
            for (var i in r) {
              if (r[i] && r[i].field && r[i].field == field) return {index:i*1, value:r[i].sorting};
            }
            return false;
          }
        };

        $scope.switchSort = function (field) {
          var column = $scope.getColumnConfigByField(field);
          if (column && column.config.sortable) {
            var v = {field:field};
            var sorting = $scope.getSort(field);
            if (sorting === false) { // Sortable but not sorted
              // set DESC
              v.sorting = "DESC";
              if (!$scope.tableview.multisorting) {
                $scope.tableview.request.order = [v];
              }
              else $scope.tableview.request.order.push(v);
            }
            else if (sorting && sorting.value == "DESC") {
              // set ASC
              v.sorting = "ASC";
              if (!$scope.tableview.multisorting) {
                $scope.tableview.request.order = [v];
              }
              else $scope.tableview.request.order[sorting.index] = v;
            }
            else if (sorting && sorting.value == "ASC") {
              // remove
              if (!$scope.tableview.multisorting) {
                $scope.tableview.request.order = [];
              }
              else $scope.tableview.request.order.splice(sorting.index, 1);
            }
            $scope.exec();
          }
        };

        $scope.like = function ($index) {
          var field = $scope.tableview.columns[$index].field;
          if (!field || !$scope.tableview.columns[$index].filterable) return;
          if (
            typeof $scope.tableview.request.like[field] == "string"
            && !$scope.tableview.request.like[field].trim()
          ) delete $scope.tableview.request.like[field];
          $scope.tableview.request.page = 1;
          $scope.exec();
        };

        $scope.next = function () {
          $scope.tableview.request.page++;
          $scope.exec();
        };

        $scope.prev = function () {
          $scope.tableview.request.page--;
          $scope.exec();
        };

        $scope.limit = function () {
          $scope.tableview.request.page = 1;
          $scope.tableview.request.limit *= 1;
          $scope.exec();
        };

        $scope.getRowSelectionIndex = function ($row) {
          if (
            typeof $scope.tableview.selectableBy != "string"
            || !$scope.tableview.selectableBy.trim().length
            || typeof $row[$scope.tableview.selectableBy] == "undefined"
          ) return;
          var key = $scope.tableview.selectableBy;
          var val = $row[$scope.tableview.selectableBy];
          for (var i=0; i<$scope.tableview.selection.length; i++) {
            if ($scope.tableview.selection[i][key] == val) return i*1;
          }
          return -1;
        };

        $scope.switchRowSelection = function ($row, sign) {
          var index = $scope.getRowSelectionIndex($row);
          if (typeof index != "number") return;
          if (typeof sign == "boolean") {
            if (index < 0 && sign) $scope.tableview.selection.push(angular.copy($row));
            else if (index >= 0 && !sign) $scope.tableview.selection.splice(index, 1);
          }
          else {
            if (index < 0) $scope.tableview.selection.push(angular.copy($row));
            else $scope.tableview.selection.splice(index, 1);
          }
        };

        $scope.isRowSelected = function ($row) {
          var i = $scope.getRowSelectionIndex($row);
          return !!(typeof i == "number" && i >= 0);
        };

        $scope.isRowsSelected = function () {
          var $rows = $scope.tableview.rows.slice(0, $scope.tableview.request.limit);
          if (!$rows.length || !$scope.tableview.selection.length) return false;
          for (var i=0; i<$rows.length; i++) {
            if (!$scope.isRowSelected($rows[i])) return false;
          }
          return true;
        };

        $scope.onSelectPageRows = function ($event) {
          var sign = $event.target.checked;
          var $rows = $scope.tableview.rows.slice(0, $scope.tableview.request.limit);
          for (var i=0; i<$rows.length; i++) {
            $scope.switchRowSelection($rows[i], sign);
          }
        };

        $scope.exec();
      };
    }
  };
});
