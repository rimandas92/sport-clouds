'use strict';
var config = require('../config');
var async = require("async");
var mongo = require('mongodb');
var jwt = require('jsonwebtoken');
var fs = require('fs')
var ObjectID = mongo.ObjectID;

var mailProperty = require('../modules/sendMail');
var UserModels = require('../models/user');
var UserModels2nd = require('../models/user2nd');

var AdminModels = require('../models/admin');

var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

var apiService = {

    //Rgister
    register: function (data, callback) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!data.email || typeof data.email === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide email",
                "response_data": {}
            });
        } else if (!re.test(String(data.email).toLowerCase())) {
            callback({
                "response_code": 5002,
                "response_message": "please provide valid email address",
                "response_data": {}
            });
        } else if (!data.password || typeof data.password === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide password",
                "response_data": {}
            });
            // } else if (!data.apptype || typeof data.apptype === undefined) {
            //     callback({
            //         "response_code": 5002,
            //         "response_message": "please provide app type",
            //         "response_data": {}
            //     });
        } else {
            data._id = new ObjectID;
            data.email = String(data.email).toLowerCase();
            UserModels.register(data, function (result) {
                callback(result);
            });
        }
    },
    // generate otp 
    generateOTP: (data, callback) => {

        if (!data.email || typeof data.email === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide email",
                "response_data": {}
            });
        } else if (!re.test(String(data.email).toLowerCase())) {
            callback({
                "response_code": 5002,
                "response_message": "please provide valid email address",
                "response_data": {}
            });
        } else if (!data.otp_type || typeof data.otp_type === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide otp type",
                "response_data": {}
            });
        } else {
            data._id = new ObjectID;
            UserModels.generateOTP(data, function (result) {
                callback(result);
            });
        }
    },
    verifyOTP: (data, callback) => {

        if (!data.email || typeof data.email === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide email",
                "response_data": {}
            });
        } else if (!re.test(String(data.email).toLowerCase())) {
            callback({
                "response_code": 5002,
                "response_message": "please provide valid email address",
                "response_data": {}
            });
        } else if (!data.otp || typeof data.otp === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide otp",
                "response_data": {}
            });
        } else if (!data.otp_type || typeof data.otp_type === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide otp type",
                "response_data": {}
            });
        } else {
            UserModels.verifyOTP(data, function (result) {
                callback(result);
            });
        }
    },
    // Reset password
    resetPassword: (data, callback) => {
        if (!data.id || typeof data.id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide user id",
                "response_data": {}
            });
        } else if (!data.password || typeof data.password === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide password",
                "response_data": {}
            });
        } else {
            UserModels.resetPassword(data, function (result) {
                callback(result);
            });
        }
    },
    //login 
    login: (data, callback) => {
        if (!data.email || typeof data.email === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide email address",
                "response_data": {}
            });
        } else if (!data.password || typeof data.password === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide password",
                "response_data": {}
            });
        } else if (!data.devicetoken || typeof data.devicetoken === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide devicetoken",
                "response_data": {}
            });
        } else if (!data.apptype || typeof data.apptype === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide apptype",
                "response_data": {}
            });
        } else {
            UserModels.login(data, function (result) {
                callback(result);
            });
        }
    },

    // join team with team code
    addMemberByUniqueTeamCode: (data, callback) => {
        UserModels.addMemberByUniqueTeamCode(data, function (result) {
            callback(result);
        });
    },
    createTeam: function (data, callback) {
        if (!data.team_name || typeof data.team_name === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide team name",
                "response_data": {}
            });
        } else {
            data._id = new ObjectID;
            UserModels.createTeam(data, function (result) {
                callback(result);
            });
        }
    },
    myTeamList: function (data, callback) {
        if (!data.team_manager_id || typeof data.team_manager_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide team manager id",
                "response_data": {}
            });
        } else {
            UserModels.myTeamList(data, function (result) {
                callback(result);
            });
        }
    },
    teamDetailsUpdate: function (data, fileData, callback) {
        if (!data.team_id || typeof data.team_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide team  id",
                "response_data": {}
            });
        } else {
            UserModels.teamDetailsUpdate(data, fileData, function (result) {
                callback(result);
            });
        }
    },
    playerListbyTeamId: function (data, callback) {
        if (!data.team_id || typeof data.team_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide team  id",
                "response_data": {}
            });
        } else {
            UserModels.playerListbyTeamId(data, function (result) {
                callback(result);
            });
        }
    },
    updatePlayerProfileImage: function (data, fileData, callback) {
        if (!data.player_id || typeof data.player_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide player id ",
                "response_data": {}
            });
        } else {
            UserModels.updatePlayerProfileImage(data, fileData, function (result) {
                callback(result);
            });
        }
    },
    playerJoinedTeamList: function (data, callback) {
        if (!data.player_id || typeof data.player_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide player  id",
                "response_data": {}
            });
        } else {
            UserModels.playerJoinedTeamList(data, function (result) {
                callback(result);
            });
        }
    },
    invitePlayerToTeam: function (data, callback) {
        if (!data.manager_id || typeof data.manager_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide manager  id",
                "response_data": {}
            });
        } else if (!data.team_id || typeof data.team_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide team id",
                "response_data": {}
            });
        } else if (!data.player_id || typeof data.player_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide players id",
                "response_data": {}
            });
        } else {
            UserModels.invitePlayerToTeam(data, function (result) {
                callback(result);
            });
        }
    },
    playerTeamInvitationList: function (data, callback) {
        if (!data.player_id || typeof data.player_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide player  id",
                "response_data": {}
            });
        } else {
            UserModels.playerTeamInvitationList(data, function (result) {
                callback(result);
            });
        }
    },
    changeInvitationStatus: function (data, callback) {
        if (!data.player_id || typeof data.player_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide player id",
                "response_data": {}
            });
        } else if (!data.team_id || typeof data.team_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide team id",
                "response_data": {}
            });
        } else if (!data.invitation_id || typeof data.invitation_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide invitation id",
                "response_data": {}
            });
        } else if (!data.invitation_status || typeof data.invitation_status === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide invitation starus",
                "response_data": {}
            });
        } else {
            UserModels.changeInvitationStatus(data, function (result) {
                callback(result);
            });
        }
    },
    addPlayerRoster: function (data, callback) {
        if (!data.manager_id || typeof data.manager_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide manager id",
                "response_data": {}
            });
        } else if (!data.team_id || typeof data.team_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide team id",
                "response_data": {}
            });
        } else if (!data.email || typeof data.email === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide email id",
                "response_data": {}
            });
        } else if (!data.fname || typeof data.fname === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide first name",
                "response_data": {}
            });
        } else if (!data.lname || typeof data.lname === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide last name",
                "response_data": {}
            });
        } else if (!data.member_type || typeof data.member_type === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide member type",
                "response_data": {}
            });
        } else {
            UserModels.addPlayerRoster(data, function (result) {
                callback(result);
            });
        }
    },
    getUserDetails: function (data, callback) {
        if (!data.id || typeof data.id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide user id",
                "response_data": {}
            });
        } else {
            UserModels.getUserDetails(data, function (result) {
                callback(result);
            });
        }
    },
    getPlayerDetails: function (data, callback) {
        if (!data.member_id || typeof data.member_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide user id",
                "response_data": {}
            });
        } else if (!data._id || typeof data._id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide  id",
                "response_data": {}
            });
        } else {
            UserModels.getPlayerDetails(data, function (result) {
                callback(result);
            });
        }
    },
    getPlayerByManagerId: function (data, callback) {
        if (!data.manager_id || typeof data.manager_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide manager id ",
                "response_data": {}
            });
        } else {
            UserModels.getPlayerByManagerId(data, function (result) {
                callback(result);
            });
        }
    },
    getPlayerDetailsByPlayerId: function (data,callback){
        if (!data.manager_id || typeof data.manager_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide manager id ",
                "response_data": {}
            });
        } else if(!data.player_id || typeof data.player_id === undefined){
            callback({
                "response_code": 5002,
                "response_message": "please provide player id ",
                "response_data": {}
            });
        }else {
            UserModels.getPlayerDetailsByPlayerId(data, function (result) {
                callback(result);
            });
        }
    },
    updatePlayerDetails: function (data, callback) {
        if (!data.player_id || typeof data.player_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide player id ",
                "response_data": {}
            });
        }else {
            UserModels.updatePlayerDetails(data, function (result) {
                callback(result);
            });
        }
    },
    addUpdatePlayerProfileImage: function (data, fileData, callback) {
        	console.log("player image===============> ", data);
	console.log("image file===============> ",fileData);
        if(!data.player_id || typeof data.player_id === undefined){
            callback({
                "response_code": 5002,
                "response_message": "please provide player id",
                "response_data": {}
            });
        }else if (!fileData || typeof fileData === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide image file",
                "response_data": {}
            });
        }else{
            UserModels2nd.addUpdatePlayerProfileImage(data, fileData, (result) => {
                callback(result);
            })
        }
    },
    deletePlayer: function (data,callback){
        if(!data.player_id || typeof data.player_id === undefined){
            callback({
                "response_code": 5002,
                "response_message": "please provide player id",
                "response_data": {}
            });
        }else{
            UserModels.deletePlayer(data, (result) => {
                callback(result);
            })
        }        
    },
    updatePlayerInformation: function (data, callback) {
        if (!data.player_id || typeof data.player_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide player id ",
                "response_data": {}
            });
        }else {
            UserModels.updatePlayerInformation(data, function (result) {
                callback(result);
            });
        }
    },
    addGameEvents: function (data, callback) {
        if (!data.team_id || typeof data.team_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide team id ",
                "response_data": {}
            });
        } else if (!data.manager_id || typeof data.manager_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide manager id",
                "response_data": {}
            });
        } else {
            data._id = new ObjectID;
            UserModels.addGameEvents(data, function (result) {
                callback(result);
            });
        }
    },
    editGameEvents: function (data, callback) {
        if (!data._id || typeof data._id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide event id",
                "response_data": {}
            });
        } else {
            UserModels.editGameEvents(data, function (result) {
                callback(result);
            });
        }
    },
    deleteGameEvent: function (data, callback){
        if (!data.id || typeof data.id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide event id",
                "response_data": {}
            });
        } else if(!data.manager_id || typeof data.manager_id === undefined){
            callback({
                "response_code": 5002,
                "response_message": "please provide manager id",
                "response_data": {}
            });
        }else {
            UserModels.deleteGameEvent(data, function (result) {
                callback(result);
            });
        }
    },
    getGameEventList: function (data, callback) {
        if (!data.team_id || typeof data.team_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide team id ",
                "response_data": {}
            });
        } else if (!data.manager_id || typeof data.manager_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide manager id",
                "response_data": {}
            });
        } else {
            UserModels.getGameEventList(data, function (result) {
                callback(result);
            });
        }
    },
    allFlagList: function (data, callback) {
        UserModels.allFlagList(data, function (result) {
            callback(result);
        });
    },
    gameEventCalenderView: function (data, callback) {
        UserModels.gameEventCalenderView(data, function (result) {
            callback(result);
        });
    },
    getEventDetailsById: function (data, callback) {
        UserModels.getEventDetailsById(data, function (result) {
            callback(result);
        });
    },
    teamPlayerAvailabilityList: function (data, callback) {
        if (!data.game_event_id || typeof data.game_event_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide game/event id ",
                "response_data": {}
            });

        } else {
            UserModels.teamPlayerAvailabilityList(data, function (result) {
                callback(result);
            });
        }
    },
    changerPlayerAvailability: function (data, callback) {
        if (!data._id || typeof data._id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide player id ",
                "response_data": {}
            });
        } else {
            UserModels.changerPlayerAvailability(data, function (result) {
                callback(result);
            });
        }
    },
    eventGameListByPlayerId: function (data, callback) {
        if (!data.player_id || typeof data.player_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide player id ",
                "response_data": {}
            });
        } else {
            UserModels.eventGameListByPlayerId(data, function (result) {
                callback(result);
            });
        }
    },
    getGameEventListForPlayer: function (data, callback) {
        if (!data.user_id || typeof data.user_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide user id ",
                "response_data": {}
            });
        } else {
            UserModels.getGameEventListForPlayer(data, function (result) {
                callback(result);
            });
        }
    },
    gameEventCalenderViewForPlayer: function (data, callback) {
        if (!data.user_id || typeof data.user_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide user id ",
                "response_data": {}
            });
        } else {
            UserModels.gameEventCalenderViewForPlayer(data, function (result) {
                callback(result);
            });
        }

    },
    gameEventCalenderViewForPlayer: function (data, callback) {
        if (!data.user_id || typeof data.user_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide user id ",
                "response_data": {}
            });
        } else {
            UserModels.gameEventCalenderViewForPlayer(data, function (result) {
                callback(result);
            });
        }

    },
    addAssignment: (data, callback) => {
        if (!data.assignment || typeof data.assignment === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide assignment name  ",
                "response_data": {}
            });
        } else {
            data._id = new ObjectID;
            UserModels.addAssignment(data, (result) => {
                callback(result);
            })
        }
    },
    getAssignmentList: (data, callback) => {
        UserModels.getAssignmentList(data, (result) => {
            callback(result);
        })
    },
    updateAssignment: (data, callback) => {
        if (!data.assignment || typeof data.assignment === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide assignment name  ",
                "response_data": {}
            });
        } else if (!data._id || typeof data._id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide assignment  id",
                "response_data": {}
            });
        } else {
            UserModels.updateAssignment(data, (result) => {
                callback(result);
            })
        }
    },
    deleteAssignment: (data, callback) => {
        if (!data._id || typeof data._id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide assignment id  ",
                "response_data": {}
            });
        } else {
            UserModels.deleteAssignment(data, (result) => {
                callback(result);
            })
        }
    },
    addPhotoToAlbum: (data, fileData, callback) => {
        if (!fileData || typeof fileData === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide image file",
                "response_data": {}
            });
        } else if (!data.user_id || typeof data.user_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide user id  ",
                "response_data": {}
            });
        } else if (!data.album_id || typeof data.album_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide album id  ",
                "response_data": {}
            });
        } else {
            UserModels2nd.addPhotoToAlbum(data, fileData, (result) => {
                callback(result);
            })
        }
    },
    deletePhotoFromAlbum: (data, callback) => {
        if (!data._id || typeof data._id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide  id  ",
                "response_data": {}
            });
        } else if (!data.album_id || typeof data.album_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide album id  ",
                "response_data": {}
            });
        } else {
            UserModels2nd.deletePhotoFromAlbum(data, (result) => {
                callback(result);
            })
        }
    },
    userMediaList: (data, callback) => {
        if (!data.album_id || typeof data.album_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide album id  ",
                "response_data": {}
            });
        } else {
            UserModels2nd.userMediaList(data, (result) => {
                callback(result);
            })
        }
    },
    addTournament: (data, callback) => {
        if (!data.name || typeof data.name === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide tournament name  ",
                "response_data": {}
            });
        } else {
            UserModels2nd.addTournament(data, (result) => {
                callback(result);
            })
        }
    },
    addAlbum: (data, callback) => {
        if (!data.name || typeof data.name === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide album name  ",
                "response_data": {}
            });
        } else {
            UserModels2nd.addAlbum(data, (result) => {
                callback(result);
            })
        }
    },
    editAlbum: (data, callback) => {
        if (!data._id || typeof data._id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide album id  ",
                "response_data": {}
            });
        } else if (!data.name || typeof data.name === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide user id  ",
                "response_data": {}
            });
        } else {
            UserModels2nd.editAlbum(data, (result) => {
                callback(result);
            })
        }
    },
    deleteAlbum: (data, callback) => {
        if (!data._id || typeof data._id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide album id  ",
                "response_data": {}
            });
        } else {
            UserModels2nd.deleteAlbum(data, (result) => {
                callback(result);
            })
        }
    },
    getAllAlbumList: (data, callback) => {
        if (!data.team_id || typeof data.team_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide team id  ",
                "response_data": {}
            });

        } else {
            UserModels2nd.getAllAlbumList(data, (result) => {
                callback(result);
            })
        }
    },
    addStoreImage: (data, fileData, callback) => {
        if (!fileData || typeof fileData === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide image file then hit submit button ",
                "response_data": {}
            });
        } else if (!data.name || typeof data.name === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide name  ",
                "response_data": {}
            });
        } else if (!data.manager_id || typeof data.manager_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide manager id  ",
                "response_data": {}
            });
        } else if (!data.team_id || typeof data.team_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide team id  ",
                "response_data": {}
            });
        } else if (!data.description || typeof data.description === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide description  ",
                "response_data": {}
            });
        } else {
            UserModels2nd.addStoreImage(data, fileData, (result) => {
                callback(result);
            })
        }
    },
    editStoreImage: (data, fileData, callback) => {
        if (!data.id || typeof data.id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide  id  ",
                "response_data": {}
            });
        } else if (!data.name || typeof data.name === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide name  ",
                "response_data": {}
            });
        } else {
            UserModels2nd.editStoreImage(data, fileData, (result) => {
                callback(result);
            })
        }
    },
    teamStoreProductList: (data, callback) => {
        UserModels2nd.teamStoreProductList(data, (result) => {
            callback(result);
        })
    },
    managerStoreProductList: (data, callback) => {
        if(!data.manager_id || typeof data.manager_id === undefined){
            callback({
                "response_code": 5002,
                "response_message": "please provide manager id",
                "response_data": {}
            });
        }else{
            UserModels2nd.managerStoreProductList(data, (result) => {
                callback(result);
            })
        }
    },
    storeProductById : (data, callback) => {
        if(!data.id || typeof data.id === undefined){
            callback({
                "response_code": 5002,
                "response_message": "please provide id",
                "response_data": {}
            });
        }else{
            UserModels2nd.storeProductById(data, (result) => {
                callback(result);
            })
        }
    },
    deleteStoreProductById: (data, callback) => {
        if(!data.id || typeof data.id === undefined){
            callback({
                "response_code": 5002,
                "response_message": "please provide id",
                "response_data": {}
            });
        }else{
            UserModels2nd.deleteStoreProductById(data, (result) => {
                callback(result);
            })
        }
    },
    addToCart: (data, callback) => {
        if (!data.product_id || typeof data.product_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide  product id  ",
                "response_data": {}
            });
        } else if (!data.manager_id || typeof data.manager_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide  manager id",
                "response_data": {}
            });
        } else if (!data.user_id || typeof data.user_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide  user id",
                "response_data": {}
            });
        } else {
            UserModels2nd.addToCart(data, (result) => {
                callback(result);
            })
        }
    },
    listCartItem: (data, callback) => {
        UserModels2nd.listCartItem(data, (result) => {
            callback(result);
        })
    },
    addLocation: (data, callback) => {
        if (!data.locationName || typeof data.locationName === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide location name  ",
                "response_data": {}
            });
        } else {
            UserModels2nd.addLocation(data, (result) => {
                callback(result);
            })
        }
    },
    getLocationList: (data, callback) => {
            UserModels2nd.getLocationList(data, (result) => {
                callback(result);
            })
    },
    deleteLocation: (data, callback) => {
        if (!data._id || typeof data._id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide location id  ",
                "response_data": {}
            });
        } else {
            UserModels2nd.deleteLocation(data, (result) => {
                callback(result);
            })
        }
    },
    allPlayerListByTeamId: (data, callback) => {
        if (!data.team_id || typeof data.team_id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide team id",
                "response_data": {}
            });
        } else {
            UserModels2nd.allPlayerListByTeamId(data, (result) => {
                callback(result);
            })
        }
    },
    // editMnagerProfileImage: (data,fileData, callback) => {
    //     if (!data.id || typeof data.id === undefined) {
    //         callback({
    //             "response_code": 5002,
    //             "response_message": "please provide manager id",
    //             "response_data": {}
    //         });
    //     } else if (!fileData || typeof fileData === undefined) {
    //         callback({
    //             "response_code": 5002,
    //             "response_message": "please provide image file then hit submit button ",
    //             "response_data": {}
    //         });
    //     } else {
    //         UserModels.editMnagerProfileImage(data,fileData, (result) => {
    //             callback(result);
    //         })
    //     }
    // },
    // viewManagerProfile: (data, callback) => {
    //     if (!data.id || typeof data.id === undefined) {
    //         callback({
    //             "response_code": 5002,
    //             "response_message": "please provide manager id",
    //             "response_data": {}
    //         });
    //     } else {
    //         UserModels.viewManagerProfile(data, (result) => {
    //             callback(result);
    //         })
    //     }
    // },
    
    // playerListbyTeamId: (data, callback) => {
    //     UserModels2nd.playerListbyTeamId(data, (result) => {
    //         callback(result);
    //     });
    // },
    editUserDetails: function (data, callback) {
        if(!data.id || typeof data.id === undefined){
            callback({
                "response_code": 5002,
                "response_message": "please provide manager id",
                "response_data": {}
            });
        }else if(!data.firstName || typeof data.firstName === undefined){
            callback({
                "response_code": 5002,
                "response_message": "please provide manager firstName",
                "response_data": {}
            });
        }else if(!data.lastName || typeof data.lastName === undefined){
            callback({
                "response_code": 5002,
                "response_message": "please provide manager lastName",
                "response_data": {}
            });
        }else if(!data.dob || typeof data.dob === undefined){
            callback({
                "response_code": 5002,
                "response_message": "please provide manager dob",
                "response_data": {}
            });
        }else if(!data.gender || typeof data.gender === undefined){
            callback({
                "response_code": 5002,
                "response_message": "please provide manager gender",
                "response_data": {}
            });
        }else if(!data.email || typeof data.email === undefined){
            callback({
                "response_code": 5002,
                "response_message": "please provide manager email",
                "response_data": {}
            });
        }else if(!data.phone || typeof data.phone === undefined){
            callback({
                "response_code": 5002,
                "response_message": "please provide manager phone",
                "response_data": {}
            });
        }else{
            UserModels.editUserDetails(data, (result) => {
                callback(result);
            })
        }
    },
    updateUserProfileImage: function (data, fileData, callback) {
        if(!data.id || typeof data.id === undefined){
            callback({
                "response_code": 5002,
                "response_message": "please provide manager id",
                "response_data": {}
            });
        }else if (!fileData || typeof fileData === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide image file",
                "response_data": {}
            });
        }else{
            UserModels2nd.updateUserProfileImage(data, fileData, (result) => {
                callback(result);
            })
        }
    }
};
module.exports = apiService;