var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile('/var/www/projects/projects4me/htdocs/hermes/view.html');
});

//var nsp = io.of('/clienta');
io.on('connection', function(socket){
  console.log('a user connected');

  /**
   * register
   */
  socket.on('register',function(data){
    // namespace
    /*
    if (data.namespace !== undefined &&  data.namespace !== '')
    {
        socket.namespace = data.namespace;
    }
    */

    // User information
    var user = {
        id:data.id,
        name:data.name,
    };
    console.log('Registering user:'+user.name+" with id:"+user.id);

    // Register the user information in the system
    socket.user = user;

    // Add the user to the public room
    socket.join('public');

    // Send the user a welcome message
    socket.emit('message','Welcome to projects4me');

    io.to('public').emit('userJoined',user);
  });

  socket.on('list',function(){
    /**
      Get the list of all the users in the system and return that
     */
     console.log('Servig request for list');
     return [socket.user];
  });

  socket.on('joinRoom',function(room){
      socket.join(room);
  });

  socket.on('invite',function(data){
      for (var user in data.users) {
        if (data.hasOwnProperty(id)){
          // Find the user in the socket list


          // foundSocket.join(data.room);
        }
      }
  });

  socket.on('createRoom',function(room){
      if (room !== 'public')
        socket.join(room);
  });

  socket.on('messageRoom',function(data){
      io.to(data.room).emit('message',{user:socket.user,message:data.message});
  });

  socket.on('message',function(message){
    console.log('Sending message:"'+message+'" to room '+socket.room);
      io.to(socket.room).emit('message',{user:socket.user,message:message});
  });

  socket.on('disconnect',function(){
    io.to('public').emit('userLeft',{user:socket.user});
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
