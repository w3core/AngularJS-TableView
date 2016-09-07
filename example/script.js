var app = angular.module("app", ["tableview"]).config(function($tableViewProvider){
  //$tableViewProvider.theme = "material";
  //$tableViewProvider.templateUrl = "";
  //$tableViewProvider.template = {};
});
app.controller("Ctrl", function ($scope) {

  var request = {
    limit: 10,
    page: 1,
    order: [
      {field:"id", sorting:"ASC"},
      //{field:"name", sorting:"DESC"},
    ],
    like: {
      "name": "",
    }
  };

  $scope.tableviewOptions = {
    template: {
      "head.cell": null,
      "body.cell": null,
      "body.cell.edit": null,
      "foot": null,
      "pager": null,
      "pager.limit": null,
      "pager.selection": null,
      "pager.controls": null,
    },
    columns: [
      {
        field: "id", // used as identifier for sorting or filtering. creates CSS class "column-{{field}}"
        name: "id", // creates CSS class "column-{{name}}"
        title: "Id", // column title
        placeholder: "", // placeholder for filter input
        sortable:true,
        filterable:false,
        template: {
          "head.cell": null,
          "body.cell": "Ctrl.body.cell.id",
          "foot.cell": null,
        },
      },
      {
        field:"name",
        title:"User Name",
        sortable:true,
        filterable:true,
        editable: {
          type: "textarea", // text|textarea Default: text
          validate: fieldValidator,
          change: saveValidChangedField
        }
      },
      {field:"email", title:"E-Mail", sortable:true, filterable:true, editable:true, placeholder:"Filter by email..."},
      {name:"manage",title:"Manage", template:{"body.cell":"Ctrl.body.cell.manage"}}
    ],
    provider: dataProvider,
    request: request,
    selectableBy: "id",
    scrollable: {
      maxHeight: "300px"
    },
    multisorting: false,
    limits: [10, 25, 50, 100],
    theme: null,
    debug:true
  };

  function fieldValidator (column, row, field, value) {
    var status = typeof value == "string" && value.trim().length;
    return {
      message: status ? "" : "The field '" + column.title + "' can not be empty",
      status: status
    };
  }

  function saveValidChangedField (column, row, field, value) {
    console.log (
      arguments.callee.name + "(column, row, field, value) =>",
      field,
      "=",
      value,
      column,
      row
    );
  }

  $scope.tableviewOptionsMinimal = {
    columns: [
      {field: "id", },
      {field:"name", title:"Name"},
      {field:"email", title:"Email"}
    ],
    provider: dataProvider
  };

  $scope.myFn = function ($row) {
    alert ("$scope.myFn($row):\n" + JSON.stringify($row, null, "    "));
  };

  var amount = 1234;
  var db = [];
  for (var i=1; i<=amount; i++) {
    var name = randomname().trim();
    db.push({
      "id":i,
      name: name,
      email: name.toLowerCase().replace(/[^a-z]+/ig, ".") + "@mail.com"
    });
  }

  function dataProvider (request, callback) {
    console.log("##REQUEST", request);
    var data = db.slice(0);
    if (request.order.length && request.order[0] && request.order[0].field == "id") {
      data.sort(function(a, b) {
        return request.order[0].sorting == "ASC" ? a.id - b.id
             : request.order[0].sorting == "DESC" ? b.id - a.id
             : 0;
      });
    }
    else if (request.order.length && request.order[0] && ["name", "email"].indexOf(request.order[0].field) >= 0) {
      data.sort(function(a, b) {
        var A = (request.order[0].sorting == "ASC" ? a[request.order[0].field] : b[request.order[0].field]).toLowerCase();
        var B = (request.order[0].sorting == "ASC" ? b[request.order[0].field] : a[request.order[0].field]).toLowerCase();
        return A < B ? -1
             : A > B ? 1
             : 0
        ;
      });
    }
    if (request.like.name) {
      data = data.filter(function(o){
        return o.name && o.name.toLowerCase().indexOf(request.like.name.toLowerCase()) > -1;
      });
    }
    if (request.like.email) {
      data = data.filter(function(o){
        return o.email && o.email.toLowerCase().indexOf(request.like.email.toLowerCase()) > -1;
      });
    }
    var amount = data.length;
    var limit = request.limit > 0 ? request.limit : 10;
    var page = request.page > 0 &&  request.page*limit-limit <= amount ? request.page : 1;
    var begin = page * limit - limit;
    var end = begin + limit;
    var rows = data.slice(begin, end);
    var response = {
      page: page,
      limit: limit,
      amount: amount,
      rows: rows
    };
    callback(response);
  }
});