'use strict';
var express = require("express");
var apiService = require('../../services/apiService');
var jwt = require('jsonwebtoken');
var config = require('../../config');
const { response } = require("express");
var secretKey = config.secretKey;
var api = express.Router();
api.use(express.json());
// app.use(
//     express.urlencoded({
//       extended: true
//     })
//   )
//Register
api.post('/register', function (req, res) {
    apiService.register(req.body, function (response) {
        res.send(response);
    });
});
//generate otp
api.post('/generate-otp', function (req, res) {
    apiService.generateOTP(req.body, function (response) {
        res.send(response);
    });
});
// verify otp 
api.post('/verify-otp', function (req, res) {
    apiService.verifyOTP(req.body, function (response) {
        res.send(response);
    });
});
//login
api.post('/login', function (req, res) {

    apiService.login(req.body, function (response) {
        res.send(response);
    });
});
//reset password
api.post('/reset-password', function (req, res) {
    apiService.resetPassword(req.body, function (response) {
        res.send(response);
    });
});




/******************************
 *  Middleware to check token
 ******************************/
api.use(function (req, res, next) {

    //console.log('req.body------>',req.body)
    //console.log('req.headers------>',req.headers)
    //console.log('req.query------>',req.query)

    var token = req.body.authtoken || req.query.authtoken || req.headers['x-access-token'];
    //console.log('token--------------->', token)
    if (token) {
        jwt.verify(token, secretKey, function (err, decoded) {
            //console.log(decoded)
            if (err) {
                res.send({
                    response_code: 4000,
                    response_message: "Session timeout! Please login again.",
                    response_data: err
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.send({
            "response_code": 5002,
            "response_message": "Please provide required information"
        });
    }
});
/******************************
 *  Middleware to check token
 ******************************/

//Reset password
api.post('/reset-password', function (req, res) {
    req.body.id = req.decoded.id;
    apiService.resetPassword(req.body, function (response) {
        res.send(response);
    });
});
//user join team by unique code
api.post('/join-member-by-unique-team-code', function (req, res) {
    apiService.addMemberByUniqueTeamCode(req.body,function (response) {
        res.json(response);
    });
});
//manager create team  //manager end api
api.post('/create-team', function (req, res) {
    apiService.createTeam(req.body, function (response) {
        res.send(response);
    });
});
//get my team list //manager end api
api.get('/my-team-list', function (req, res) {
    //console.log('query --->',req.query);
    apiService.myTeamList(req.query, function (response) {
        res.send(response);
    });
});
// update team profile pic.  //manager end api
api.post('/team-details-update', function (req, res) {
    apiService.teamDetailsUpdate(req.body, req.files,function (response) {
        res.json(response);
    });
});
// get player list by team id //manager end api
api.get('/player-list-by-team-id', function (req, res) {
    apiService.playerListbyTeamId(req.query, function (response) {
        res.send(response);
    });
});
// update player own  profile pic. //player end api 
api.post('/update-player-profile-image', function (req, res) {
    apiService.updatePlayerProfileImage(req.body, req.files,function (response) {
        res.json(response);
    });
});
//get my joined  team list //player end api
api.get('/player-joined-team-list', function (req, res) {
    apiService.playerJoinedTeamList(req.query, function (response) {
        res.send(response);
    });
});
// invite player to a team . //manager end api 
api.post('/invite-players-to-team', function (req, res) {
    apiService.invitePlayerToTeam(req.body,function (response) {
        res.json(response);
    });
});
//get player team invitaion list //player end api
api.get('/player-team-invitation-list', function (req, res) {
    apiService.playerTeamInvitationList(req.query, function (response) {
        res.send(response);
    });
});
// change invitation status , accept or reject . //player end api 
api.post('/change-invitation-status', function (req, res) {
    apiService.changeInvitationStatus(req.body,function (response) {
        res.json(response);
    });
});
//  add player roster //manager end api
api.post('/add-player-roster', function (req, res) {
    req.body.manager_id = req.decoded.id;
    apiService.addPlayerRoster(req.body,function (response) {
        res.json(response);
    });
});
// get players by manager id //manager end api
api.get('/get-players-by-managr-id', function (req, res) {
    req.body.manager_id = req.decoded.id;
    apiService.getPlayerByManagerId(req.body,function (response) {
        res.json(response);
    });
});
// get player details by player id //manager end api
api.post('/get-player-details-by-player-id', function (req, res) {
    req.body.manager_id = req.decoded.id;
    apiService.getPlayerDetailsByPlayerId(req.body,function (response) {
        res.json(response);
    });
});
//update  player details //manager end api
api.post('/update-player-details', function (req, res) {
    apiService.updatePlayerDetails(req.body,function (response) {
        res.json(response);
    });
});

//add update player details  //manager end api
api.post('/add-update-player-profile-image', function (req, res) {
    apiService.addUpdatePlayerProfileImage(req.body, req.files, function (response) {
        res.send(response);
    });
});

//delete player  //manager end api
api.post('/delete-player', function (req, res) {
    apiService.deletePlayer(req.body, function (response) {
        res.send(response);
    });
});

//update  player information //manager end api
api.post('/update-player-information', function (req, res) {
    apiService.updatePlayerInformation(req.body,function (response) {
        res.json(response);
    });
});


//get user details  //manager end api
api.get('/get-user-details', function (req, res) {
    req.body.id = req.decoded.id;
    apiService.getUserDetails(req.body, function (response) {
        res.send(response);
    });
});
//edit user details  //manager end api
api.post('/edit-user-details', function (req, res) {
    req.body.id = req.decoded.id;
    apiService.editUserDetails(req.body, function (response) {
        res.send(response);
    });
});
//delete user details  //manager end api
api.post('/update-user-profile-image', function (req, res) {
    req.body.id = req.decoded.id;
    apiService.updateUserProfileImage(req.body, req.files, function (response) {
        res.send(response);
    });
});
// get player details with position joursey number player type ,player name,address    //member end api
api.get('/get-player-details', function (req, res) {
    apiService.getPlayerDetails(req.query, function (response) {
        res.send(response);
    });
});
//add game and events //manager end api
api.post('/add-game-event', function (req, res) {
    apiService.addGameEvents(req.body,function (response) {
        res.json(response);
    });
});
//edit game and events //manager end api
api.post('/edit-game-event', function (req, res) {
    apiService.editGameEvents(req.body,function (response) {
        res.json(response);
    });
});
//delete game and events //manager end api
api.post('/delete-game-event', function (req, res) {
    req.body.manager_id = req.decoded.id;
    apiService.deleteGameEvent(req.body,function (response) {
        res.json(response);
    });
});
// get game and event list  //manager end api
api.get('/get-game-event-list', function (req, res) {
    apiService.getGameEventList(req.query, function (response) {
        res.send(response);
    });
});
api.post('/game-event-calender-by-month-year', function (req, res) {
    req.body.manager_id = req.decoded.id;
    apiService.gameEventCalenderByMonthYear(req.body, function (response) {
        res.send(response);
    });
});
api.post('/game-event-calender-data', function (req, res) {
    req.body.manager_id = req.decoded.id;
    apiService.gameEventCalenderView(req.body, function (response) {
        res.send(response);
    });
});
// all flag list to select  //manager end api 
api.get('/all-flag-list', function (req, res) {
    apiService.allFlagList(req.query, function (response) {
        res.send(response);
    });
});
// get event details by id   //manager end api 
api.get('/get-event-by-id', function (req, res) {
    apiService.getEventDetailsById(req.query, function (response) {
        res.send(response);
    });
});
// team  player availability  list for manager //manager end api
api.get('/team-player-availability-list', function (req, res) {
    apiService.teamPlayerAvailabilityList(req.query, function (response) {
        res.send(response);
    });
});
// change player availability manager end api 
api.post('/change-player-availability', function (req, res) {
    apiService.changerPlayerAvailability(req.body,function (response) {
        res.json(response);
    });
});
//team availability api// get game event list  by player id //manager end api
api.get('/eventGame-list-by-playerid', function (req, res) {
    apiService.eventGameListByPlayerId(req.query,function (response) {
        res.json(response);
    });
});
// get game and event list  //player end api
api.get('/get-game-event-list-for-player', function (req, res) {
    apiService.getGameEventListForPlayer(req.query, function (response) {
        res.send(response);
    });
});
// get game and event list  calender view  //player end api

api.get('/game-event-calendar-data-for-player', function (req, res) {
    apiService.gameEventCalenderViewForPlayer(req.query, function (response) {
        res.send(response);
    });
});

// add assignment //player end api
api.post('/add-assignment', (req, res) =>{
    apiService.addAssignment(req.body,(response)=>{
        res.json(response);
    });
});
// get assignment //player end api
api.get('/get-assignment-list', (req, res) =>{
    apiService.getAssignmentList(req.query,(response)=>{
        res.json(response);
    });
});
// update assignment //player end api
api.post('/update-assignment', (req, res) =>{
    apiService.updateAssignment(req.body,(response)=>{
        res.json(response);
    });
});
// update assignment //player end api
api.post('/delete-assignment', (req, res) =>{
    apiService.deleteAssignment(req.body,(response)=>{
        res.json(response);
    });
});

// player add album  //player ends api
api.post('/add-album',(req,res)=>{
    apiService.addAlbum(req.body,(response)=>{
        res.json(response);
    });
});
// player edit album  //player ends api
api.post('/edit-album',(req,res)=>{
    apiService.editAlbum(req.body,(response)=>{
        res.json(response);
    });
});
// player delete album  //player ends api
api.post('/delete-album',(req,res)=>{
    apiService.deleteAlbum(req.body,(response)=>{
        res.json(response);
    });
});
// get all albums list // player end api
api.get('/get-album-list',(req,res)=>{
    apiService.getAllAlbumList(req.query,(response)=>{
        res.json(response);
    });
});
// player add file  //player ends api
api.post('/add-photo-to-album',(req,res)=>{
    req.body.user_id = req.decoded.id;
    apiService.addPhotoToAlbum(req.body,req.files,(response)=>{
        res.json(response);
    });
});
// player delete file  //player ends api
api.post('/delete-photo-from-album',(req,res)=>{
    req.body.user_id = req.decoded.id;
    apiService.deletePhotoFromAlbum(req.body,(response)=>{
        res.json(response);
    });
});
//player file list // player end api
api.get('/get-user-media-list',(req,res)=>{
    apiService.userMediaList(req.query,(response)=>{
        res.json(response);
    });
});
//organizer add tournament //organizer api
api.post('/add-tournament',(req,res)=>{
    apiService.addTournament(req.body,(response)=>{
        res.json(response);
    });
});
// add location by manager //manager end api
api.post('/add-location',(req,res)=>{
    apiService.addLocation(req.body,(response)=>{
        res.json(response);
    });
});
api.get('/get-location-list',(req,res)=>{
    apiService.getLocationList(req.query,(response)=>{
        res.json(response)
    })
})
// delete location by manager //manager end api
api.post('/delete-location',(req,res)=>{
    apiService.deleteLocation(req.body,(response)=>{
        res.json(response);
    });
});
//manager add  store image and details // manager end api
api.post('/add-store-image',(req,res)=>{
    req.body.manager_id = req.decoded.id;
    apiService.addStoreImage(req.body,req.files,(response)=>{
        res.json(response);
    });
});
//manager update  store image and details // manager end api
api.post('/edit-store-image',(req,res)=>{
    apiService.editStoreImage(req.body,req.files,(response)=>{
        res.json(response);
    });
});
//team get list of his store product list // manager end api
api.get('/team-store-product-list',(req,res)=>{
    apiService.teamStoreProductList(req.query,(response)=>{
        res.json(response);
    });
});

//manager get list of his store product list // manager end api
api.get('/manager-store-product-list',(req,res)=>{
    req.body.manager_id = req.decoded.id;
    apiService.managerStoreProductList(req.body,(response)=>{
        res.json(response);
    });
});

//get store product by id // manager end api
api.post('/store-product-by-id',(req,res)=>{
    apiService.storeProductById(req.body,(response)=>{
        res.json(response);
    });
});

//delete store product by id // manager end api
api.post('/delete-store-product-by-id',(req,res)=>{
    apiService.deleteStoreProductById(req.body,(response)=>{
        res.json(response);
    });
});

// player add product to cart // player end api
api.post('/add-to-cart-item',(req,res)=>{
    apiService.addToCart(req.body,(response)=>{
        res.json(response);
    });
});
//list cart item //player  end api
api.get('/list-cart-item',(req,res)=>{
    apiService.listCartItem(req.query,(response)=>{
        res.json(response);
    });
});
//list cart item //player  end api
api.get('/all-player-list-by-team-id',(req,res)=>{
    apiService.allPlayerListByTeamId(req.query,(response)=>{
        res.json(response);
    });
});

/***** Dibyendu Dutta *****/

// //manager profile image update // manager end api
// api.post('/edit-manager-profile-image',(req,res)=>{
//     apiService.editMnagerProfileImage(req.decoded,req.files,(response)=>{
//         res.json(response);
//     });
// });
// // manager View Profile
// api.get('/view-manager-profile', function (req, res) {
//     apiController.viewManagerProfile(req.decoded, function (response) {
//         res.send(response);
//     })
// });
// //manager profile update // manager end api
// api.post('/edit-manager-profile',(req,res)=>{
//     apiService.editMnagerProfile(req.body, req.decoded,(response)=>{
//         res.json(response);
//     });
// });


// api.get('/player-list-by-team-id', function (req, res) {
//     apiService.playerListbyTeamId(req.query, function (response) {
//         res.send(response);
//     });
// });


module.exports = api