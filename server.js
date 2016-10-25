var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var url = require("url");

app.get('/', function(req, res){
  res.sendFile('/var/www/projects/projects4me/htdocs/hermes/view.html');
});

app.get('/admin', function(req, res){
  res.sendFile('/var/www/projects/projects4me/htdocs/hermes/admin.html');
});

/**
 * This is the io for Prometheus
 *
 * @module chat
 * @submodule prometheus
 */
var prometheus = io.of('/');
prometheus.on('connection', function(socket){
  console.log('a user connected');

  /**
   * This function handles the event 'register' and is used in order to register
   * a new user. While registering the user the function also adds them to the
   * public room but in the public room of the client in order to allow
   * multi-tenancy support
   *
   * @method register
   * @module chat
   * @submodule prometheus
   */
  socket.on('register',function(data){

    // User information
    var user = {
        id:data.id,
        name:data.name,
    };
    console.log('Registering user:'+user.name+" with id:"+user.id);

    // Register the user information in the system
    socket.user = user;

    // Add the user to the public room based on the tenant information
    if (socket.request.headers.origin) {
      var matches = url.parse(socket.request.headers.origin).host.match(/(([^.]+)\.)?prometheus\.com/);

      if (matches !== null){
        socket.account = matches[2];
        socket.account = "abc";
        // switch the namespace of the socket
        socket.join('/'+socket.account+'/public');
        socket.emit('message',{user:{id:'alpha',name:'system'},message:'Welcome to projects4me, Sailor!!'});

        io.to('/'+socket.account+'/public').emit('userJoined',user);
      }
    }

    // Send the user a welcome message
  });

  /**
   * This function handles the event 'list' and is used in order to retrieve
   * a list of users in the public room of the tenant that the user belongs to.
   *
   * @method list
   * @module chat
   * @submodule prometheus
   */
  socket.on('list',function(){
    var res = [];
    var ns = io.of("/");

    // If we know the domain of the user who is trying to connect then
    if (socket.account !== undefined)
    {
      // initiate the public roomId for the socket
      var roomId = '/'+socket.account+'/public';

      // If we had the namespace initiated
      if (ns) {
        // Figure out all the connected users in the namespace
        for (var id in ns.connected) {
          // If they are connected in the public room then add them to the list.
          if(ns.connected[id].rooms[roomId] !== undefined)
          {
              res.push(ns.connected[id].user);
          }
        }
      }
    }
    socket.emit('userList',res);
    console.log(res);
    //return res;
  });

  /**
   * This function handles the event 'joinRoom' and is used in order to join or
   * create a room for communication. Prometheus is allowed to create rooms for
   * projects as well as usres.
   *
   * @method joinRoom
   * @module chat
   * @submodule prometheus
   * @todo validate the room name
   */
  socket.on('joinRoom',function(room){
    if (socket.account !== undefined)
    {
      if (true) // validate the room name
      {
        socket.join('/'+socket.account+'/'+room);
      }
    }
  });

  /**
   * This function handles the event 'invite' and is used in order to invite
   * users to a room
   *
   * @method invite
   * @module chat
   * @submodule prometheus
   *//*
  socket.on('invite',function(data){
    if (socket.account !== undefined)
    {

      for (var user in data.users) {
        if (data.users[user].hasOwnProperty('id')){
          userId = data.users[user].id;
          // Find the user in the socket list
          var ns = io.of("/");
          for (var identifier in ns.connected) {

            // If user is defined
            if (ns.connected[identifier].user !== undefined)
            {
              // and the id registered with in the socket is found
              if (ns.connected[identifier].user.id == userId)
              {
                // then add the user to the room
                ns.connected[identifier].join(data.room);
              }
            }
          }
        }
      }
    }
  });*/

  /**
   * This function handles the event 'messageRoom' and is used in order to send
   * message to a room.
   *
   * @method message
   * @module chat
   * @submodule prometheus
   * @todo room validation, should be defined and cannot be public rooms
   */
  socket.on('messageRoom',function(data){
      console.log('Sending message:"'+data.message+'" to room '+data.room);
      io.to(data.room).emit('message',{user:socket.user,message:data.message});
  });

  /**
   * This function handles the event 'message' and is used in order to send
   * receive message from Prometheus
   *
   * @method message
   * @module chat
   * @submodule prometheus
   */
  socket.on('message',function(message){
    console.log('Sending message:"'+message+'" to room '+socket.room);
      //io.to(socket.room).emit('message',{user:socket.user,message:message});
  });


  /**
   * This function handles the event 'disconnect' and is used in order to
   * disconnect the user from the system and send out a public message
   * indicating that the user has left.
   *
   * @method invite
   * @module chat
   * @submodule prometheus
   */
  socket.on('disconnect',function(){
    if (socket.account !== undefined)
    {
      io.to('/'+socket.account+'/public').emit('userLeft',{user:socket.user});
    }
  });
});


var admin = io.of('/admin');
admin.on('connection', function(socket){
  console.log('An admin connected');

  socket.on('register',function(data){

    // User information
    var user = {
        id:data.id,
        name:data.name,
    };
    console.log('Registering user:'+user.name+" with id:"+user.id);

    // Register the user information in the system
    socket.user = user;
    socket.join('public');
    socket.emit('message',{user:{id:'alpha',name:'system'},message:'Welcome to projects4me, Captain!!'});
    io.to('public').emit('userJoined',user);
    // Send the user a welcome message
  });

});

var gaia = io.of('/gaia');
gaia.on('connection', function(socket){
  console.log('Gaia has reached out');

  socket.on('listUsers',function(data){

  });

  socket.on('listRooms',function(data){

  });

  /**
   * This function handles the event 'createRoom' and is used in order to create
   * a room and add a user in it
   *
   * @method invite
   * @module chat
   * @submodule prometheus
   * @todo a concern can be with multi-tenancy and growing number of users as the for loop below can be very long
   */
  socket.on('createRoom',function(data){
    console.log(data);


    // Get the namespace for prometheus
    var ns = io.of("/");

    // Traverse through all the connected users and find the socket we need
    for (var identifier in ns.connected) {
      // If user is defined
      if (ns.connected[identifier].user !== undefined)
      {
        console.log("A user is defined with id:"+ns.connected[identifier].user.id );
        // and the id registered with in the socket is found
        if (ns.connected[identifier].user.id == data.user)
        {
          console.log('Adding '+data.user+' in the room /'+data.tenant+'/'+data.room);
          // then add the user to the room
          ns.connected[identifier].join('/'+data.tenant+'/'+data.room);
        }
      }
    }
  });

  /**
   * This function handles the event 'invite' and is used in order to invite
   * users to a room
   *
   * @method invite
   * @module chat
   * @submodule prometheus
   */
  socket.on('invite',function(data){
    // Get the namespace for prometheus
    var ns = io.of("/");

    // Traverse through all the connected users and find the socket we need
    for (var identifier in ns.connected) {
      // If user is defined
      if (ns.connected[identifier].user !== undefined)
      {
        // and the id registered with in the socket is found
        if (ns.connected[identifier].user.id == data.user)
        {
          console.log('Adding '+data.user+' in the room /'+data.tenant+'/'+data.room);
          // then add the user to the room
          ns.connected[identifier].join('/'+data.tenant+'/'+data.room);
        }
      }
    }
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
