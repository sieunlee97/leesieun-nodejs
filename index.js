const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

var app = express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  //.listen(PORT, () => console.log(`Listening on ${ PORT }`))

  // 푸시기능, 차트 실시간 렌더링하는 소켓앱 시작
  // http서버 객체를 생성 시 app(express) 프레임워크 전달
  var http = require('http').createServer(app);
  // socket.io 소켓 통신 객체 생성 시, http를 객체로 전달
  var io = require('socket.io').listen(http);
  // .listen은 클라이언트에서 서버로 접속을 받기 위해 대기하는 명령
  http.listen(PORT, function(){
    console.log('앱이 시작되었습니다. 포트번호 : '+PORT);
  });
  var jsonMsg = {msg:''}; //io서버와 스프링간의 메세지 전송 담는 변수
  //.on 함수는 클라이언트에서 서버로 소켓통신의 이벤트를 대기하는 명령
  io.on('connection', function(socket){
    console.log(socket.id + ' user connected');
    io.emit('OnOff', jsonMsg); //스프링의 Model같은 역할. 접속한 client 소켓에 OnOff변수명으로 msg전송
    // client가 접속을 끊었을 때
    //결과확인은 http://localhost:5000/socket.io.socket.io.js
    socket.on('disconnect', function(){
      console.log(socket.id + ' user disconnected');
    });
    socket.on('OnOff', function(jsonMsg){ //1:1통신 받은 내용
      console.log('소켓으로 받은 메세지는 '+ jsonMsg.msg);
      jsonMsg={msg:jsonMsg.msg};
      if(jsonMsg.msg=="updateRender"){
        io.emit('OnOff', jsonMsg); //1:n 통신으로 보낸다.
      }
    });
  });
  