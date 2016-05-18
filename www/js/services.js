angular.module('starter.services', [])
.factory('Schedule',function($http,ApiEndpoint){
  return {
    getDate: function(year,month) {
      var date=[];
      var initDate = new Date();
      var currentDay=0;
      initDate.setYear(year);
      initDate.setMonth(month);
      initDate.setDate(1);
      var startDay = initDate.getDay();
      initDate.setMonth(month+1);
      initDate.setDate(1);
      var endDay = new Date(initDate.getTime()-1000*60*60*24).getDate();
      for(var i=0;i<6;i++){
        var daterow=[];
        for(var j=0;j<7;j++){
          if(currentDay==0&&startDay>j||currentDay==endDay){
            daterow.push('');
          }else{
            currentDay++;
            daterow.push(currentDay);
          }
        }
        date.push(daterow);
      }
      return date;
    },
    get: function(callback) {
      $http.get(ApiEndpoint.url+"/todo/schedule").success( 
        function(data) {
         callback(data); 
        }
      );
    },
    save: function(callback,data){
      console.log(data);
      $http.post(ApiEndpoint.url+"/todo/saveSchedule",data).success( 
        function(data) {
         callback(data); 
        }
      );
    }
  };
})
.factory('Msg', function($http,ApiEndpoint) {
  var msgList=[];
  
  return {
    getList: function(callback) {
      $http.get(ApiEndpoint.url+"/todo/msgList").success( 
        function(data) {
         msgList=data;
         callback(data); 
        }
      );
    },
    getMsg: function(id) {
      for (var i = 0; i < msgList.length; i++) {
        if (msgList[i].id ==id) {
          return msgList[i];
        }
      }
      return null;
    }
  };
})
.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }];

  return {
    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }
  };
});
