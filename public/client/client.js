
var socket = io();

socket.on('connect', () => {
  console.log("connected to server")
  var searchQuery = window.location.search.substring(1);
  console.log(searchQuery);
  var params = JSON.parse('{"'+decodeURI(searchQuery).replace(/&/g,'","').replace(/\+/g,'" "').replace(/=/g,'":"')+'"}');
  socket.emit('join',params,function(err){
    if(err){
      alert(err);
      window.location.href = "/";
    }else{
      console.log("No error");
    }
  })
});

socket.on('text',function(message){
  console.log(message);
  const formattedTime = moment(message.createdAt).format('LT');
  console.log(formattedTime);
  let li = document.createElement('li');
  li.innerText = `${formattedTime} ${message.from}: ${message.msg}`

  document.querySelector('body').appendChild(li);
})

socket.on('Location',function(loc){
  const formattedTime = moment(loc.createdAt).format('LT')
  let li = document.createElement('li');
  li.innerText = `${formattedTime} ${loc.from}: `
  let a = document.createElement('a');
  a.setAttribute('target','_blank');
  a.setAttribute('href',loc.url);
  a.innerText = 'user Location';
  li.appendChild(a);

  document.querySelector('body').appendChild(li);
})

socket.on('disconnect',function(){
  console.log("disconnected from server");
})

document.querySelector('#submit-btn').addEventListener('click',function(e){
  e.preventDefault();

  socket.emit('text',{
    from:"user",
    msg:document.querySelector('input[name=message]').value,
    createdAt:new Date().getTime()
  })
});

document.querySelector('#send-Location').addEventListener('click',function(e){
  if(!navigator.geolocation){
    return alert('geolocation is not supported in your browser');
  }
  navigator.geolocation.getCurrentPosition(function(position){
      socket.emit('Location',{from:"user",
      lat:position.coords.latitude,
      lng:position.coords.longitude
    });
  },function(){

  })
});
