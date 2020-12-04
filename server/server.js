const http = require('http');
const path = require('path');
const express = require('express');
const socketIO = require('socket.io');
const {generateMessage,generateLocationMessage} = require("./utils/message")
const {isValidString} = require('./utils/checkString')
const {Users} = require('./utils/User')
var users = new Users();

const publicPath = path.join(__dirname+'/../public');
const port = process.env.PORT || 3000;
var app = express();
let server = http.createServer(app);
var io = socketIO(server);
app.use(express.static(publicPath))

io.on('connection',(socket)=>{
  console.log("new connection");

  socket.on('text',function(message){
    const user = users.getUser(socket.id);
    socket.emit('text',generateMessage('You',message.msg))
    socket.broadcast.to(user.room).emit('text',generateMessage(user.name,message.msg));
  });

  socket.on('join',function(params,callback){
    if(!isValidString(params.name) || !isValidString(params.room)){
      callback('Name and room is required');
      return;
    }
    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id,params.name,params.room);
    socket.emit('text',generateMessage('Admin',`Welcome ${params.name} to Chat App room ${params.room}`));
    socket.broadcast.to(params.room).emit('text',generateMessage('Admin',`${params.name} joined`));
    callback();
  });

  socket.on('Location',function(coords){
    const user = users.getUser(socket.id);
    socket.emit('Location',generateLocationMessage('You',coords.lat,coords.lng));
    socket.broadcast.to(user.room).emit('Location',generateLocationMessage(user.name,coords.lat,coords.lng));
  })

  socket.on('disconnect',function(){
    console.log("user disconnected");
    const user = users.getUser(socket.id);
    users.removeUser(socket.id);
    socket.broadcast.to(user.room).emit('text',generateMessage('Admin',`${user.name} left`));
  })
});

server.listen(port,()=>{
  console.log(`Server listening on port ${port}`);
});
