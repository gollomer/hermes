var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
  res.sendFile('/var/www/projects/projects4me/htdocs/hermes/view.html');
});

io.on('connection', function(socket){
  console.log('a user connected');

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
});

io.emit('some event', { for: 'everyone' });

http.listen(3000, function(){
  console.log('listening on *:3000');
});
