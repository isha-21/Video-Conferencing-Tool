const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3001;
const path = require('path');
const mysql = require('mysql');
const cors = require("cors");
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieparser = require("cookie-parser")
const session = require("express-session");
const Salting = 10;

let socketList = {};

app.use(express.static(path.join(__dirname, 'public')));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.get('/ping', (req, res) => {
  res
    .send({
      success: true,
    })
    .status(200);
});

io.on('connection', (socket) => {

  socket.on('disconnect', () => {
    socket.disconnect();
  });

  socket.on('BackEndEvent-check-user', ({ roomId, PName }) => {
    let error = false;

    io.sockets.in(roomId).clients((err, clients) => {
      clients.forEach((client) => {
        if (socketList[client] == PName) {
          error = true;
        }
      });
      socket.emit('FrontEvent-error-user-exist', { error });
    });
  });

  socket.on('BackEndEvent-join-room', ({ roomId, PName }) => {
    socket.join(roomId);
    socketList[socket.id] = { PName, video: true, audio: true};

     io.sockets.in(roomId).clients((err, clients) => {
      try {
        const users = [];
        clients.forEach((client) => {
           users.push({ userId: client, info: socketList[client] });
        });
        socket.broadcast.to(roomId).emit('FrontEvent-user-join', users);
       } catch (e) {
        io.sockets.in(roomId).emit('FrontEvent-error-user-exist', { err: true });
      }
    });
  });

  socket.on('BackEndEvent-call-user', ({ userToCall, from, signal }) => {
    io.to(userToCall).emit('FrontEvent-receive-call', {
      signal,
      from,
      info: socketList[socket.id],
    });
  });

  socket.on('BackEndEvent-accept-call', ({ signal, to }) => {
    io.to(to).emit('FrontEvent-call-accepted', {
      signal,
      answerId: socket.id,
    });
  });

  socket.on('BackEndEvent-send-message', ({ roomId, msg, sender }) => {
    io.sockets.in(roomId).emit('FrontEvent-receive-message', { msg, sender });
  });

  socket.on('BackEndEvent-leave-room', ({ roomId, leaver }) => {
    delete socketList[socket.id];
    socket.broadcast
      .to(roomId)
      .emit('FrontEvent-user-leave', { userId: socket.id, PName: [socket.id] });
    io.sockets.sockets[socket.id].leave(roomId);
  });

  socket.on('BackEndEvent-toggle-camera-audio', ({ roomId, switchTarget }) => {
    if (switchTarget === 'video') {
      socketList[socket.id].video = !socketList[socket.id].video;
    } else {
      socketList[socket.id].audio = !socketList[socket.id].audio;
    }
    socket.broadcast
      .to(roomId)
      .emit('FrontEvent-toggle-camera', { userId: socket.id, switchTarget });
  });
});

http.listen(PORT, () => {
  console.log('Connected : 3001');
});


app.use(cors({
    origin:"http://localhost:3001",
    credentials:true,
}));
app.use(express.json());
app.use(cookieparser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    key:"userId",
    secret:"pass",
    resave:false,
    saveUninitialized:false,
    
}))

const db=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'login_react'
})

app.get("/",(req,res)=>{
    res.send("hi");
})

app.post("/register",(req,res)=>{
    const email=req.body.email;
    const password=req.body.password;
    bcrypt.hash(password,Salting,(errr,hash)=>{
        const data={
       
            email:req.body.email,
            password:hash,        
       
       };
       if(errr)
       {
        console.log(err);
       }
       else{
        let sqll=`select * from users where email='${email}'`;
        db.query(sqll,(er,ress)=>{
            if(ress.length > 0)
            {
                res.send({msg:"User Email Already Present"})

            }
            else{
                let sql="INSERT INTO `users` SET ?";
                db.query(sql,data,(err,result)=>{
                    if(err)
                    {
                        console.log(err)
                    }
                    else{
                      
                         res.send(result);
                                  
                    }
                })
            }
        })
       }
    })     
})

app.post("/login",(req,res)=>{
   const email=req.body.email;
    const password=req.body.password;

          
      
        let sql=`select * from users where email='${email}'`;
          db.query(sql,(err,result)=>{
            if(err)
            {
                  console.log(err);
            }
            else{
              
               if(result.length > 0)
               {
                bcrypt.compare(password,result[0].password,(errr,response)=>{
                    if(response)
                    {
                        req.session.user=result;
                       
                     res.send({login:true,useremail:email});
                    }
                    else{
                     res.send({login:false,msg:"Wrong Password"});
                    
                    }
                })

                

               }
               else{
                    res.send({login:false,msg:"User Email Not Exits"});
                 }
                
    
            }
        })
})
app.get("/login",(req,res)=>{
    if(req.session.user)
    {
        res.send({login:true,user:req.session.user});
    }
    else{
        res.send({login:false});
    }
})

