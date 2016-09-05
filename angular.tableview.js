/*
 AngularJS TableView v1.0
 (c) 2016 Max Chuhryaev <w3core@gmail.com> https://github.com/w3core/AngularJS-TableView
 License: MIT
*/
angular
.module("tableview", [])
.directive("tableviewAutofocus", function ($timeout) {
  return {
    restrict: "A",
    link: function ($scope, $element, $attributes) {
      if ($scope.$eval($attributes.autoFocus) !== false) {
        var element = $element[0];
        $timeout(function() {
          $scope.$emit("focus", element);
          element.focus();
        });
      }
    }
  };
})
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

        if (navigator.userAgent.toLowerCase().indexOf("mobile") > 0) {
          $element.addClass("-mobile-");
        }

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

        $scope.validate = function ($index, $row, $mode) {
          var column = $scope.tableview.columns[$index];
          var valid = function() {return {message: "", status: true};};
          if (!column.editable || typeof column.editable != "object") {
            $mode.validation = valid();
            return true;
          }
          else if (typeof column.editable.validate != "function") {
            column.editable.validate = valid;
          }
          var result = column.editable.validate(column, $row, column.field, $mode.value);
          if (typeof result == "boolean") {
            result = result ? valid() : {message: "", status: false};
          }
          result = result && typeof result == "object" ? result : {};
          result.status = !!result.status;
          result.message = typeof result.message == "string" ? result.message : "";
          $mode.validation = result;
          return result.status;
        };

        $scope.edition = function ($index, $row, $mode) {
          var column = $scope.tableview.columns[$index];
          var validation = $scope.validate($index, $row, $mode);
          var changed = !!($mode.value !== $row[column.field]);
          if (column.editable && validation) $row[column.field] = $mode.value;
          else $mode.value = $row[column.field];
          if (
            validation
            && changed
            && column.editable
            && typeof column.editable == "object"
            && typeof column.editable.change == "function"
          ) column.editable.change(column, $row, column.field, $row[column.field]);
          $mode.edition = false;
          $mode.validation = {message: "", status: true};
          return true;
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