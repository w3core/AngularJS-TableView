# AngularJS TableView ([example])

[AngularJS]: https://angularjs.org/
[ng-template]: https://docs.angularjs.org/api/ng/directive/script
[example]: https://rawgit.com/w3core/AngularJS-TableView/master/example/index.html

A data grid for [AngularJS].

* Native [AngularJS] implementation, no jQuery
* Plugin architecture allows you to use only the features you need
* Complete customisation by using [AngularJS] templates (aka. [ng-template]) and directive configuration.



## Quick Start

**Dependencies**
* No dependencies

Make sure to embed it in your HTML document:
```html
<script src="path/to/angular.js"></script>
<script src="path/to/angular.tableview.js"></script>
<!-- You can compile "angular.tableview.less" if you need. -->
<script src="path/to/your/tableview.css"></script>
```

Turn on `tableview` module in the your awesome `application`:
```javascript
var application = angular.module("app", ["tableview"]);
```

Pass grid `configuration` via `tableview` attribute:
```html
<div tableview="configuration"></div>
```

In the case if you need to completely change default template of `tableview` directive, you can define path to your template via `tableview-template-url` attribute:
```html
<div tableview="configuration" tableview-template-url="path/to/your/template.html"></div>
```

Directive attributes:

|       Attribute        |  Type  | Details                                                    |
|:-----------------------|:------:|:-----------------------------------------------------------|
| tableview              | Object | `[required]` TableView instance configuration object       |
| tableview-template-url | String | `[optional]` Path to your custom template of the TableView |

All that you needed is to define `configuration` and data `provider` function in your controller.

**Minimal application example:**

`[index.html]`
```html
<html ng-app="app">
  <head>
    <script type="text/javascript" src="angular.min.js"></script>
    <script type="text/javascript" src="angular.tableview.js"></script>
    <script type="text/javascript" src="script.js"></script>
    <link rel="stylesheet" type="text/css" href="angular.tableview.css" />
  </head>
  <body ng-controller="Ctrl">
    <h1>AngularJS TableView Example</h1>
    <div tableview="configuration"></div>
  </body>
</html>
```

`[script.js]`
```javascript
angular
.module("app", ["tableview"]);
.controller("Ctrl", function ($scope) {

  $scope.configuration = {
    columns: [
      {field: "id"},
      {field: "name", title:"Name"},
      {field: "email", title:"Email"}
    ],
    provider: provider
  };

  function provider (request, callback) {
    someAsyncCall(request, function(response){
      callback(response);
    });
  }

});
```

## Reference API

**`REQUEST` structure**

All properties of the `REQUEST` object are `[optional]`
```javascript
var request = {

  // (Int) How many entries should to be requested from the server
  // to show in the TableView
  limit: 10,

  // (Int) The page number, that should be requested from the server
  // considering to limit
  page: 1,

  // (Array) The list of the fields with sorting order
  // by which should be sorted result entries
  order: [
    {field:"field_1", sorting:"ASC"},
    {field:"field_2", sorting:"DESC"},
    // ...
  ],

  // (Object) The list of the fields with query string
  // by which the result should to be filtered
  like: {
    "field_1": "User typed query string 1",
    "field_2": "User typed query string 2",
    // ...
  }
};
```

**`RESPONSE` structure**
```javascript
var response = {

  // (Int) Limit that was returned from the server
  // to show in the TableView
  limit: 10,

  // (Int) The page number, that was returned from the server
  // considering to limit
  page: 1,

  // (Int) Summary amount of the records that available by the sent request
  amount: 12345,

  // (Array) Array of objects (entries) by the sent request
  rows: []

};
```

**`CONFIGURATION` structure**

All properties of the `CONFIGURATION` object except `columns` and `provider` are `[optional]`

| Property                     | Type                | Details                                                                                                                                                                                                                                     |
|:-----------------------------|:-------------------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| provider                     | `required` Function | The function that provides `response` data for the current instance of the TableView                                                                                                                                                        |
| columns                      | `required` Array    | Array of `column` Objects with definitions of visible columns                                                                                                                                                                               |
| column.field                 | `optional` String   | The name of field in DB that can be used for the sorting and filtering logic. In additional it creates CSS class "column-{{field_name}}" that can be used for UI customisation                                                              |
| column.name                  | `optional` String   | An unique name of the field that can be used for UI customisation from CSS via using of CSS class "column-{{name}}" when `field` is not defined                                                                                             |
| column.title                 | `optional` String   | The column title                                                                                                                                                                                                                            |
| column.placeholder           | `optional` String   | Placeholder for the filter input. Default: "Search..."                                                                                                                                                                                      |
| column.sortable              | `optional` Boolean  | Enables sorting logic for the column. Requires `field` property. In additional it creates CSS classes "sortable" and "sortable-{{asc|desc}}" that can be used for UI customisation                                                          |
| column.filterable            | `optional` Boolean  | Enables filtering logic for the column. Requires "field" property. In additional it creates CSS class "filterable" that can be used for UI customisation                                                                                    |
| column.template              | `optional` Object   | The list of templates that should to be replaced for the current column cell by using custom templates (see AngularJS [ng-template]). The name of property is reserved word, that used to define replacement area in TableView template file. |
| column.template["head.cell"] | `optional` String   | An identifier of template to be used as cell of table header                                                                                                                                                                                |
| column.template["body.cell"] | `optional` String   | An identifier of template to be used as cell of table body                                                                                                                                                                                  |
| column.template["foot.cell"] | `optional` String   | An identifier of template to be used as cell of table footer. Requires of `template["foot"]` generic template implementation.                                                                                                               |
| template                     | `optional` Object   | The list of templates that should to be replaced by using custom templates (see AngularJS [ng-template]). The name of property is reserved word, that used to define replacement area in TableView template file.                             |
| template["head.cell"]        | `optional` String   | An identifier of the generic template to be used as cell of table header                                                                                                                                                                    |
| template["head.cell.select"] | `optional` String   | An identifier of the template that contains implementation of toggle selection logic for all rows on the page when selectable logic used                                                                                                    |
| template["body.cell"]        | `optional` String   | An identifier of the generic template to be used as cell of table body                                                                                                                                                                      |
| template["body.cell.select"] | `optional` String   | An identifier of the template that contains implementation of  toggle selection logic for the current row when selectable logic used                                                                                                        |
| template["foot"]             | `optional` String   | An identifier of the generic template to be used as table header. Not implemented by default                                                                                                                                                |
| template["pager"]            | `optional` String   | An identifier of the generic template to be used as pager section of the table                                                                                                                                                              |
| template["pager.limit"]      | `optional` String   | An identifier of the generic template to be used as pager limit section of the pager                                                                                                                                                        |
| template["pager.controls"]   | `optional` String   | An identifier of the generic template to be used as pager limit controls section of the pager                                                                                                                                               |
| request                      | `optional` Object   | Initial custom request object that can be used to provide stored request from previous user session                                                                                                                                         |
| multisorting                 | `optional` Boolean  | Turns on multicolumns sorting logic                                                                                                                                                                                                         |
| selectableBy                 | `optional` String   | Turns on rows selection logic by primary key field                                                                                                                                                                                          |
| scrollable                   | `optional` Object   | Turns on scrollable logic for the table area and allows to provide custom styles for scrollable area such as `{maxHeight: "400px"}`                                                                                                         |
| limits                       | `optional` Array    | Default: [10, 25, 50, 100]. Custom list of limit numbers                                                                                                                                                                                    |

Configuration object example:

```javascript
$scope.configuration = {
  template: {
    "head.cell": "your/custom/angular/template.name.html",
    "body.cell": "embed.to.the.view.angular.template.id",
  },
  columns: [
    {
      field: "field_name",
      name: "name",
      title: "Id",
      placeholder: "Filter placeholder string",
      sortable:true,
      filterable:false,
      template: {
        "head.cell": "your/custom/angular/template.name.html",
        "body.cell": "embed.to.the.view.angular.template.id",
      },
    },
    // ...
  ],
  provider: function (request, callback) { callback(response); },
  request: {/* see `REQUEST` structure */},
  multisorting: false,
  limits: [10, 50, 100],
  scrollable: {
    maxHeight: "400px"
  },
  selectableBy: "id"
};
```
