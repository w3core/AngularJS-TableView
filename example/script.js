var app = angular.module("app", ["tableview"]);
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
      "foot": null,
      "pager": null,
      "pager.limit": null,
      "pager.controls": null
    },
    columns: [
      {
        field: "id", // used as identifier for sorting or filtering. creates CSS class "column-{{field}}"
        name: "id", // creates CSS class "column-{{name}}"
        title: "Id", // column title
        placeholder: "Please enter ID", // placeholder for filter input
        sortable:true,
        filterable:false,
        template: {
          "head.cell": null,
          "body.cell": "Ctrl.body.cell.id",
          "foot.cell": null,
        },
      },
      {field:"name", title:"User Name", sortable:false, filterable:true},
      {title:"Manage", template:{"body.cell":"Ctrl.body.cell.manage"}}
    ],
    provider: dataProvider,
    request: request,
    multisorting: true,
    limits: [10, 25, 50, 100],
    debug:true
  };

  $scope.tableviewOptionsMinimal = {
    columns: [
      {field: "id"},
      {field:"name", title:"Name"},
      {field:"email", title:"Email"}
    ],
    provider: dataProvider
  };

  $scope.myFn = function () {
    console.log("###myFn", arguments);
  };

  var amount = 123;
  var db = [];
  for (var i=1; i<=amount; i++) {
    db.push({
      "id": i, name:"User "+i+" Name", email:"user"+i+"@mail.com"
    });
  }

  function dataProvider (request, callback) {
    console.log("##REQUEST", request);
    var data = db.slice(0);
    if (request.order.length && request.order[0] && request.order[0].field == "id" && request.order[0].sorting == "DESC") {
      data.sort(function(a, b) {return b.id - a.id;});
    }
    if (request.like.name) {
      data = data.filter(function(o){
        return o.name && o.name.indexOf(request.like.name) > -1;
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