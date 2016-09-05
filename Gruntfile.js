module.exports = function (grunt) {
  grunt.loadNpmTasks("grunt-contrib-uglify");
  grunt.loadNpmTasks("grunt-contrib-less");

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    uglify: {
      options: {
        mangle: false,
        banner:
          '/*!\n'
        + ' <%= pkg.description %> v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n'
        + ' (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %> <%= pkg.homepage %>\n'
        + ' License: <%= pkg.license %>\n'
        + '*/\n'
      },
      dist: {
        files: {
          "dist/angular.tableview.min.js": ["angular.tableview.js"]
        }
      }
    },
    less: {
      dist: {
        options: {
          compress: true,
          banner:
            '/*!\n'
          + ' <%= pkg.description %> v<%= pkg.version %> (<%= grunt.template.today("yyyy-mm-dd") %>)\n'
          + ' (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %> <%= pkg.homepage %>\n'
          + ' License: <%= pkg.license %>\n'
          + '*/\n'
        },
        files: {
          "dist/angular.tableview.min.css": "angular.tableview.less",
          "dist/angular.tableview.minimal.min.css": "angular.tableview.minimal.less"
        }
      }
    }
  });
   grunt.registerTask("default", ["uglify", "less"]);
   grunt.file.copy("angular.tableview.html", "dist/angular.tableview.html");
};