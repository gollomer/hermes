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
/*
io.use(function(socket, next){
  //console.log(socket.request.headers.origin);

  if (socket.request.headers.origin) {
    var matches = url.parse(socket.request.headers.origin).host.match(/(([^.]+)\.)?prometheus\.com/);
    //var matches = origin.host.match(/(([^.]+)\.)?prometheus\.com/);

    var subdomain = null;
    if (matches !== null){
      subdomain = matches[2];

      // switch the namespace of the socket
      console.log(subdomain);
      socket.nsp.name='/'+subdomain;
      console.log(socket);
    }
  }
  //next(new Error('Authentication error'));
});
*/
//var nsp = io.of('/prometheus');
io.on('connection', function(socket){
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

        // switch the namespace of the socket
        socket.join('/'+socket.account+'/public');
        socket.emit('message','Welcome to projects4me');

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

    if (socket.account !== undefined)
    {
      var roomId = '/'+socket.account+'/public';
      if (ns) {
        for (var id in ns.connected) {
          if(roomId) {
            if(ns.connected[id].rooms.public !== undefined)
            {
                res.push(ns.connected[id].user);
                //console.log(ns.connected[id].rooms.public);
                //console.log(ns);
            }
          }
        }
      }
    }
    res = [socket.user];
    return res;
  });

  /**
   * This function handles the event 'joinRoom' and is used in order to join or
   * create a room for communication. Prometheus is allowed to create rooms for
   * projects as well as usres.
   *
   * @method joinRoom
   * @module chat
   * @submodule prometheus
   */
  socket.on('joinRoom',function(room){
    if (socket.account !== undefined)
    {
      socket.join('/'+socket.account+'/'+room);
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
    if (socket.account !== undefined)
    {
      for (var user in data.users) {
        if (data.hasOwnProperty(id)){
          // Find the user in the socket list

          // foundSocket.join(data.room);
        }
      }
    }
  });

  socket.on('messageRoom',function(data){
      io.to(data.room).emit('message',{user:socket.user,message:data.message});
  });

  /**
   * This function handles the event 'message' and is used in order to send
   * message (to whom?)
   *
   * @method message
   * @module chat
   * @submodule prometheus
   */
  socket.on('message',function(message){
    console.log('Sending message:"'+message+'" to room '+socket.room);
      io.to(socket.room).emit('message',{user:socket.user,message:message});
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






/*


  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('registerUser', function(data){
    console.log(data);
    socket.username = data.name;
    socket.room = data.id;
    socket.join(data.id);
    socket.emit('Welcome to projects4me','everyone');
  });

  socket.on('chat message', function(msg){
    io.to(socket.room).emit('chat message', socket.username +': '+msg);
  });


  socket.on('list', function(msg){
    var room = socket.room;
    //console.log(Object.key(io.nsps['/'].adapter.rooms['1'].sockets));
    var clients = io.sockets.clients();
    //io.to(socket.room).emit('chat message', clients);
    console.log(scoket.username);
  });
  */
});

//io.emit('some event', { for: 'everyone' });

http.listen(3000, function(){
  console.log('listening on *:3000');
});
