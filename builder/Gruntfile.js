//包装函数
module.exports = function(grunt){
  //任务配置，所有插件的配置信息
  grunt.initConfig({
    //获取package.json的信息
    pkg:grunt.file.readJSON('package.json'),

    //合并
    concat: {
      task1:{
        src:[
          //'../www/framework/lib/ionic/js/ionic.bundle.js',
          '../www/framework/js/**/*.js',
          '../www/config/**/*.js',
          '../www/config/*.js',
          '../www/business/**/*.js',
          '../www/starter/app.js'
        ],
        dest:'../www/build/js/app.build.all.js'
      }
    },
    //压缩js
    uglify:{
      build : {
        src: '../www/build/js/app.build.all.js',
        dest: '../www/build/js/app.build.all.js.min.js'
      }
    }
  });

  //告诉grunt我们要使用插件
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  //先合并再压缩
  grunt.registerTask('default',['concat','uglify']);
};

