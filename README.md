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

All properties of the `CONFIGURATION` object except `columns` are `[optional]`
```javascript
$scope.configuration = {

  // (Object) [optional] The list of templates that should to be replaced
  // by using custom templates (see AngularJS ng-template).
  // The name of property is reserved word, that used to define replacement area
  // in  TableView template file.
  template: {
    "head.cell": "your/custom/angular/template.name.html",
    "body.cell": "embed.to.the.view.angular.template.id",
    "foot": null,
    "pager": null,
    "pager.limit": null,
    "pager.controls": null
  },

  // (Array) [required] Columns definition. Array of Objects with column definition
  columns: [

    {
      // (String) [optional] The name of field in DB
      // that can be used for sorting and filtering logic.
      // In additional it creates CSS class "column-{{field_name}}" that can be
      // used for UI customisation
      field: "field_name",

      // (String) [optional] The unique name of the field that can be used for UI
      // customisation from CSS via using of CSS class "column-{{name}}"
      name: "name",

      // (String) [optional] The column title
      title: "Id",

      // (String) [optional] Default:"Search...". Placeholder for the filter input
      placeholder: "Filter placeholder string",
      
      // (Boolean) [optional] Enables sorting logic for the column.
      // Requires "field" property.
      // In additional it creates CSS classes "sortable" and "sortable-{{asc|desc}}"
      // that can be used for UI customisation
      sortable:true,

      // (Boolean) [optional] Enables filtering logic for the column.
      // Requires "field" property.
      // In additional it creates CSS class "filterable" that can be used for UI customisation
      filterable:false,

      // (Object) [optional] The list of templates that should to be replaced
      // for the current column cell by using custom templates (see AngularJS ng-template).
      // The name of property is reserved word, that used to define replacement area
      // in TableView template file.
      template: {
        "head.cell": "your/custom/angular/template.name.html",
        "body.cell": "embed.to.the.view.angular.template.id",
        "foot.cell": null,
      },
    },

    // ...

  ],

  // (Function) [required] The function that provides response data
  // for the current instance of the TableView
  provider: function (request, callback) { callback(response); },

  // (Object) [optional] Initial custom request object
  // that can be used to provide stored request from previous user session.
  request: {/* see `REQUEST` structure */},

  // (Boolean) [optional] Turns on multicolumns sorting logic
  multisorting: false,

  // (Array) [optional] Default: [10, 25, 50, 100]. Custom list of limit numbers.
  limits: [10, 50, 100],

  // (Object) [optional] Turns on scrollable logic for the table area
  scrollable: {
    maxHeight: "400px"
  }
};
```
