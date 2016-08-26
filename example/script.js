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
        placeholder: "", // placeholder for filter input
        sortable:true,
        filterable:false,
        template: {
          "head.cell": null,
          "body.cell": "Ctrl.body.cell.id",
          "foot.cell": null,
        },
      },
      {field:"name", title:"User Name", sortable:true, filterable:true},
      {field:"email", title:"E-Mail", sortable:true, filterable:true, placeholder:"Filter by email..."},
      {title:"Manage", template:{"body.cell":"Ctrl.body.cell.manage"}}
    ],
    provider: dataProvider,
    request: request,
    scrollable: {
      maxHeight: "300px"
    },
    multisorting: false,
    limits: [10, 25, 50, 100],
    debug:true
  };

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
    var name = randomname();
    //if (i%2) name += " Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut viverra sit amet elit at euismod. Mauris vulputate a enim eget eleifend. In quis enim a diam elementum interdum. Donec sagittis erat ac aliquet egestas. Fusce viverra ut odio eget vulputate. Mauris id ex orci. Donec justo ipsum, congue sit amet magna a, tincidunt iaculis urna. Donec lacus odio, mattis in ornare sit amet, feugiat ut dolor. Duis aliquam a urna vitae bibendum. Integer rhoncus tortor nisl, ut faucibus ligula blandit quis.";
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
        return o.name && o.name.indexOf(request.like.name) > -1;
      });
    }
    if (request.like.email) {
      data = data.filter(function(o){
        return o.email && o.email.indexOf(request.like.email) > -1;
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