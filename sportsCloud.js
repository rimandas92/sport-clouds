var express = require('express');
var fileUpload = require('express-fileupload');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var path = require('path');
var methodOverride = require('method-override');
var _ = require('lodash');
var config = require("./config");
var https = require('https');
var fs = require('fs');


// var rp = require('request-promise');
// var adminService = require('./services/adminService');
// var apiService = require('./services/apiService');


var app = express();
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.json());

// var io = require('socket.io').listen(server);

//==============Add middleware necessary for REST API's===============
app.use(fileUpload());
app.use(cookieParser());
app.use(methodOverride('X-HTTP-Method-Override'));
//==========Add module to recieve file from angular to node===========
app.use(express.static(__dirname + '/public'));
app.use('/profilepic', express.static('public/uploads/profilepic/'));
app.use('/roster', express.static('public/uploads/team_store/'));
//===========================CORS support==============================
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, Authorization");
    res.setHeader("Access-Control-Allow-Credentials", true);
    if ('OPTIONS' == req.method) {
    res.sendStatus(200);
    } else {
    next();
    }
});

//=========================Load the routes===============================

app.get('/', function (req, res) {
    const hello = {
        url: 'localhost:1447'
    }
    res.send(hello);
});

// app.get('*', function(req, res){
//     res.send('Wrong routes');
// });

var apiRoutes = require('./routes/api/apiRoutes.js');
app.use('/api', apiRoutes);

var adminRoutes = require('./routes/admin/adminRoutes.js');
app.use('/admin', adminRoutes);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//     var err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

//===========================Connect to MongoDB==========================
if (config.dbAccess == 'server') {
    var db = config.database['server'];
    // producation config or local config
    var producationString = "mongodb://" + db.username + ":" + db.password + "@" + db.host + ":" + db.port + "/" + db.dbName + "?authSource=" + db.authDb;
    //var producationString = config.local.database;

    var options = {
        useUnifiedTopology: true,
        useCreateIndex: true,
        useNewUrlParser: true
    };

    var db = mongoose.connect(producationString, options, function (err) {
        if (err) {
            console.log(err + "connection failed");
        } else {
            console.log('Connected to database ');
        }
    });
    //mongo on connection emit
    mongoose.connection.on('connected', function (err) {
        console.log("mongo Db conection successfull");
    });
    //mongo on error emit
    mongoose.connection.on('error', function (err) {
        console.log("MongoDB Error: ", err);
    });
    //mongo on dissconnection emit
    mongoose.connection.on('disconnected', function () {
        console.log("mongodb disconnected and trying for reconnect");
        mongoose.connectToDatabase();
    });
} else {
    var db = config.database['local'];
    var connectionString = "mongodb://" + db.host + ":" + db.port + "/" + db.dbName
    mongoose.connect(connectionString, function (err) {
        if (err) {
            console.log(err)
        } else {
            console.log('Connected to database ' + db.dbName);
        }
    });
}
connected_user = [];
// io.sockets.on('connection', function (socket) {
//     console.log(socket.id + 'a user connected');

//     socket.on('user_join', function (data, callback) {

//         //console.log("connected------>", nicknames)


//         socket.join(data.user_id);

//         // const index = connected_user.indexOf(data.user_id);

//         // if (index == -1) {
//         //     connected_user.push(data.user_id);
//         // }

//         // updateNicknames();
//     });

//     socket.on('gym_join', function (data, callback) {

//         //console.log("connected------>", nicknames)


//         socket.join(data.user_id);

//     });



//     //new user 
//     socket.on('newUser', function (data, callback) {

//         console.log(data);
//         socket.join(data.user_id);

//         const index = connected_user.indexOf(data.user_id);

//         if (index == -1) {
//             connected_user.push(data.user_id);
//         }

//         updateNicknames();

//     });
//     socket.on('removeUser', function (data, callback) {


//         const index = connected_user.indexOf(data.user_id);
//         if (index > -1) {
//             connected_user.splice(index, 1);
//         }
//         console.log("removeUser", connected_user);
//         updateNicknames();

//     });

//     function updateNicknames() {
//         console.log("connected_user", connected_user);
//         io.sockets.emit('userList', connected_user);

//     }



//     // For Admin Panel Only
//     socket.on('getChatUserList', function (data) {


//         let obj = {
//             admin_id: data.adminId
//         }
//         adminService.getChatUserList(obj, function (repos) {

//             if (repos.response_code == 2000) {
//                 io.sockets.in(data.adminId).emit('chatUserList', repos);

//             }
//         })
//     });

//     // send message 

//     socket.on('send message', function (data) {

//         //console.log("send message data", data);

//         const index = connected_user.indexOf(data.to_user);
//         let user_online = false;
//         if (index > -1) {
//             user_online = true;
//         }

//         var options = {
//             method: 'POST',
//             uri: config.liveUrl + 'api/add-chat',
//             form: {
//                 to_user: data.to_user,
//                 from_user: data.from_user,
//                 text: data.text,
//                 user_online: user_online
//             },
//             headers: {
//                 'content-type': 'application/x-www-form-urlencoded',
//                 'x-access-token': data.authToken
//             },
//             json: true,
//             rejectUnauthorized: false,
//             requestCert: true
//         };
//         rp(options)
//             .then(function (repos) {

//                 if (repos.response_code === 2000) {

//                     let obj = {
//                         from_user: data.from_user,
//                         to_user: data.to_user,
//                         page: 1,
//                         limit: 10
//                     }
//                     apiService.getChat(obj, function (repos) { //5eb0ed31304bd5159e05d8c3

//                         if (repos.response_code === 2000) {
//                             io.sockets.in(data.to_user).emit('chat list', repos);
//                             io.sockets.in(data.from_user).emit('chat list', repos);
//                             socket.emit('chat list', repos);
//                             //console.log('chat list------------>', repos.response_data.docs);
//                         }
//                     })

//                     // var options = {
//                     //     method: 'POST',
//                     //     uri: config.liveUrl + 'api/get-chat',
//                     //     form: {
//                     //         to_user: data.to_user,
//                     //         from_user: data.from_user
//                     //     },
//                     //     headers: {
//                     //         'content-type': 'application/x-www-form-urlencoded',
//                     //         'x-access-token': data.authToken
//                     //     },
//                     //     json: true,
//                     //     rejectUnauthorized: false,
//                     //     requestCert: true
//                     // };

//                     // rp(options)
//                     //     .then(function (repos) {

//                     //         if (repos.response_code === 2000) {

//                     //             // io.to(data.to_user).to(data.from_user).emit('chat list', repos);
//                     //             io.sockets.in(data.to_user).emit('chat list', repos);
//                     //             io.sockets.in(data.from_user).emit('chat list', repos);
//                     //             //socket.emit('chat list', repos);
//                     //             console.log('chat list', repos);
//                     //         }
//                     //     })
//                     //     .catch(function (err) {

//                     //         console.log('err', err);
//                     //     });


//                 }
//             })
//             .catch(function (err) {

//                 console.log('err', err);
//             });
//     });


//     socket.on('disconnect', function (data) {
//         console.log(socket.id + 'a user connected');


//         updateNicknames();

//     });

// });
//===========================Connect to MongoDB==========================

if(config.env === 'DEVELOPMENT') {
    var credentials = {
        key: fs.readFileSync('/etc/letsencrypt/live/nodeserver.mydevfactory.com/privkey.pem', 'utf8'),
        cert: fs.readFileSync('/etc/letsencrypt/live/nodeserver.mydevfactory.com/fullchain.pem', 'utf8')
    };
    const server = https.createServer(credentials, app)
    server.listen(config.port, () =>
        console.log(`Server started at ${config.liveUrl}:${config.port}`)
    );
} else {
    const baseUrl = 'http://localhost:1447/';
    app.listen(config.port, () => 
        console.log('Server started at ' + baseUrl)
    );
}
