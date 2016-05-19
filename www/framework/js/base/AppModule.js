/**
 * 创建人：章剑飞
 * 创建时间：2016年05月18日15:54:55
 * 创建原因：模块构建器
 * */
var AppModule = function(){

  return {

    groupName : null,
    requireList : [],
    nameList : [],
    typeList : [],
    paramsList : [],
    actionList : [],

    group : function(name){
      this.groupName = name;
      return this;
    },

    require : function(require){
      this.requireList = require;
      return this;
    },

    name : function(name){
      this.nameList.push(name);
      return this;
    },

    type : function(name){
      this.typeList.push(name);
      return this;
    },

    params : function(params){
      this.paramsList.push(params);
      return this;
    },

    action : function(action){
      this.actionList.push(action);
      return this;
    },

    build : function(){

      var module = angular.module(this.groupName, this.requireList);

      while(this.nameList.length > 0){

        var name = this.nameList.pop();
        var type = this.typeList.pop();
        var action = this.actionList.pop();
        var params = this.paramsList.pop();

        //将 action 作为 params 的最后一个参数
        params.push(action);

        if(type == "controller"){

          module = module.controller(name, params);
        }else if (type == "service") {

          module = module.factory(name, params);
        }else if (type == "provider") {

          module = module.provider(name, params);
        }else if(type == "filter"){

          module = module.filter(name, params);
        }
      }
    }
  };

};
