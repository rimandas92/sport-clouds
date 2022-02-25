var express = require("express");
var bcrypt = require('bcrypt');
var async = require("async");
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var config = require('../config');
var jwt = require('jsonwebtoken');
var fs = require('fs');
var secretKey = config.secretKey;

var AdminModels = require('../models/admin');
var UserModels = require('../models/user');
var NotificationModels = require('../models/admin_notification');
// var mailProperty = require('../modules/sendMail');

createToken = (admin) => {
    var tokenData = {
        id: admin._id
    };
    var token = jwt.sign(tokenData, secretKey, {
        expiresIn: 86400
    });
    return token;
};

var adminService = {
    adminSignup: function (data, callback) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        if (!data.name || typeof data.name === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide name",
                "response_data": {}
            });
        } else if (!data.email || typeof data.email === undefined) {
            callback(null, {
                "response_code": 5002,
                "response_message": "please provide email address",
                "response_data": {}
            });
        } else if (!re.test(String(data.email).toLowerCase())) {
            callback(null, {
                "response_code": 5002,
                "response_message": "please provide valid email address",
                "response_data": {}
            });
        } else if (!data.password || typeof data.password === undefined) {
            callback(null, {
                "response_code": 5002,
                "response_message": "please provide password",
                "response_data": {}
            });
        } else {

            data._id = new ObjectID;
            data.email = String(data.email).toLowerCase();

            AdminModels.register(data, function (result) {
                callback(result);
            });

        }
    },
    adminLogin: function (data, callback) {
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
        } else {
            AdminModels.login(data, function (result) {
                callback(result);
            });
        }
    },
    adminForgotPassword: (data, callback) => {
        if (!data.email || typeof data.email === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide email address",
                "response_data": {}
            });
        } else {
            AdminModels.forgotPassword(data, function (result) {
                callback(result);
            });
        }
    },
    adminChangePassword: function (data, callback) {

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
        } else {
            AdminModels.changePassword(data, function (result) {
                callback(result);
            });
        }

    },
    createOrganizer: function (data, callback) {
        if (!data.email || typeof data.email === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide email address",
                "response_data": {}
            });
        } else {
            data._id = new ObjectID;
            AdminModels.createOrganizer(data, function (result) {
                callback(result);
            });
        }
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
            AdminModels.createTeam(data, function (result) {
                callback(result);
            });
        }
    },
    addFlagIcon: function (data, fileData, callback) {
        if (!fileData || typeof fileData === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide flag image",
                "response_data": {}
            });
        } else {
            AdminModels.addFlagIcon(data,fileData, function (result) {
                callback(result);
            });
        }
    },
    updateFlagIcon: function (data, fileData, callback) {
        if (!data._id || typeof data._id === undefined) {
            callback({
                "response_code": 5002,
                "response_message": "please provide id",
                "response_data": {}
            });
        } else {
            AdminModels.updateFlagIcon(data,fileData, function (result) {
                callback(result);
            });
        }
    },
  
};
module.exports = adminService;