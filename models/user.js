const UserSchema = require('../schema/user');
const AdminSchema = require('../schema/admin');
const teamSchema = require('../schema/team');
const teamMemberSchema = require('../schema/teamMember');
const playerInvitationSchema = require('../schema/player_invitation');
const eventAndGameSchema = require('../schema/events_and_games');
const flagIconSchema = require('../schema/flags_icon');
const scoreAndTeamAvailabilitySchema = require('../schema/scoreAndTeamAvailability');
const assignmentSchema = require('../schema/assignments');


const config = require('../config');
const mongo = require('mongodb');
const ObjectID = mongo.ObjectID;
const bcrypt = require('bcrypt');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const mailProperty = require('../modules/sendMail');
const secretKey = config.secretKey;
const AdminNotificationModels = require('../models/admin_notification');
const common = require("../utility/common");
// const dateFormat = require("dateformat");
const { STATUS_CONSTANTS, STATUS_MESSAGES, URL_PATHS, PATH_LOCATIONS, CONSTANTS } = require('../utility/constant');
const pushNotification = require('../modules/pushNotification');
const assignments = require('../schema/assignments');

//create auth token
createToken = (admin) => {
    var tokenData = {
        id: admin._id
    };
    var token = jwt.sign(tokenData, secretKey, {
        // expiresIn: 86400  // expires in 24 hours
        expiresIn: '30d'
    });
    return token;
};
function generateOtp(){
    return Math.floor(1000 + Math.random() * 9000);
}

var UserModels = {

    //register user
    register: async function (data, callback) {
        if (data) {
            UserSchema.findOne({
                    email: data.email
                }, {
                    _id: 1,
                    email: 1,
                },
                async function (err, result) {
                    if (err) {
                        callback({
                            "response_code": 5005,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data":  {'error':err}
                        });
                    } else {
                        if (result != null) {
                            callback({
                                "response_code": 2008,
                                "response_message": "Email address already exist",
                                "response_data": result
                            });
                        } else {
                            new UserSchema(data).save(function (err, result) {
                                if (err) {
                                    callback({
                                        "response_code": 5005,
                                        "response_message": "INTERNAL DB ERROR",
                                        "response_data":  {'error':err}
                                    });
                                } else {
                                    var tokenId = createToken(result);
                                    // mailProperty('welcomeMail')(data.email, {
                                    //     name: "User",
                                    //     email: data.email,
                                    //     email_validation_url: `${config.baseUrl}#/activate-account/${tokenId}`,
                                    //     site_url: config.liveUrl,
                                    //     date: new Date()
                                    // }).send();

                                    callback({
                                        "response_code": 2000,
                                        "response_message": "You have registered successfully.Please verify your email account."
                                    });
                                }
                            });
                        }
                    }
                });
        } else {
            callback({
                "response_code": 5005,
                "response_message": "INTERNAL DB ERROR",
                "response_data": {}
            });
        }
    },
    // generate otp after registration
    generateOTP: async function (data, callback){
        if (data) {
            if(data.otp_type=='email_verification'){
                UserSchema.findOne({email:data.email}, async (err, user) => 
                {
                    if (err) {
                        callback({
                            "response_code": 5005,
                            "response_message": err,
                            "response_data": {}
                        });
                    } else {

                        if (user != null) {

                            if (user.email_verify == 'yes') {
                                callback({
                                    "response_code": 5002,
                                    "response_message": "Email id already verified.",
                                    "response_data": {}
                                });
                            }else {

                                let generatedOTP = generateOtp();

                                const saltRounds = 10;
        
                                await bcrypt.hash(JSON.stringify(generatedOTP), saltRounds, function (err, hash) {
                                
                                newGeneratedOTP =hash;
        
                                UserSchema.updateOne({
                                    _id: user._id
                                }, {
                                    $set: {
                                        otp: newGeneratedOTP
                                    }
                                }, function (err, resUpdate) {
        
                                        if(err){
                                            callback({
                                                                "response_code": 5005,
                                                                "response_message": "INTERNAL DB ERROR",
                                                                "response_data":  {'error':err}
                                                    });
                                        }else{
        
                                            mailProperty('sendOTPdMail')(data.email, {
                                                fname: user.fname,
                                                lname: user.lname,
                                                otp: generatedOTP,
                                                site_url: config.liveUrl,
                                                date: new Date()
                                            }).send();
        
                                            callback({
                                                "response_code": 2000,
                                                "response_message": "An OTP verification mail has been send to your email Id,Please check "
                                            });
                                        }
        
                                    })
                                });
        
                            }

                        

                        } else {

                            callback({
                                "response_code": 5002,
                                "response_message": "No user found with this email id .",
                                "response_data": {}
                            });
                        }
                    
                    }
                })
            }
            if(data.otp_type=='forgot_password'){
                        
                UserSchema.findOne({email:data.email}, async (err, user) => 
                {
                    if (err) {
                        callback({
                            "response_code": 5005,
                            "response_message": err,
                            "response_data":  {'error':err}
                        });
                    } else {

                            if (user != null) {

                                let generatedOTP = generateOtp();

                                const saltRounds = 10;

                                await bcrypt.hash(JSON.stringify(generatedOTP), saltRounds, function (err, hash) {
                                
                                newGeneratedOTP =hash;

                                UserSchema.updateOne({
                                    _id: user._id
                                }, {
                                    $set: {
                                        forgot_password_otp: newGeneratedOTP
                                    }
                                }, function (err, resUpdate) {

                                        if(err){
                                            callback({
                                                        "response_code": 5005,
                                                        "response_message": "INTERNAL DB ERROR",
                                                        "response_data":  {'error':err}
                                                    });
                                        }else{

                                            mailProperty('forgotPasswordOtpMail')(data.email, {
                                                fname: user.fname,
                                                lname: user.lname,
                                                forgot_password_otp : generatedOTP,
                                                site_url: config.liveUrl,
                                                date: new Date()
                                            }).send();

                                            callback({
                                                "response_code": 2000,
                                                "response_message": "An OTP verification mail has been send to your email Id,Please check "
                                            });
                                        }

                                    })
                                });

                            } else {
                                callback({
                                    "response_code": 5002,
                                    "response_message": "No user found  with this email id,Please try again",
                                    "response_data": {}
                                });
                            }
                        }
                    })
            }
        } else {
            callback({
                "response_code": 5005,
                "response_message": "INTERNAL DB ERROR",
                "response_data":  {'error':err}
            });
        }
    },
    //verify user email by otp
    verifyOTP: (data, callback) => {
    if (data) {
        if(data.otp_type=='email_verification'){

            UserSchema.findOne({email:data.email}, (err, user) => 
            {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": err,
                        "response_data":  {'error':err}
                    });
                } else {
    
                    if (user != null) {
    
                        bcrypt.compare(data.otp.toString(), user.otp, function (err, response) {
    
                            if (response == true) {
    
                                UserSchema.updateOne({
                                    _id: user._id
                                }, {
                                    $set: {
                                        email_verify : "yes"
                                    }
                                }, async function (err, resUpdate) {
                                    if (err) {
                                        callback({
                                            "response_code": 5005,
                                            "response_message": "INTERNAL DB ERROR",
                                            "response_data":  {'error':err}
                                        });
                                    } else {
    
                                            callback({
                                                    "response_code": 2000,
                                                    "response_message": "Account verified successfully",
                                                    "response_data": []
                                                });
                                    }
                                });
    
                            }else {
                                callback({
                                    "response_code": 5002,
                                    "response_message": "Invalid OTP ,Please try again",
                                    "response_data": {}
                                });
                            }
                        })
                        
    
                        
                    } else {
                        callback({
                            "response_code": 5002,
                            "response_message": "User is not exists.",
                            "response_data": {}
                        });
    
                    }
                
                }
            })
        }
        if(data.otp_type=='forgot_password'){
            UserSchema.findOne({email:data.email}, (err, user) => 
            {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": err,
                        "response_data": {}
                    });
                } else {

                    if (user != null) {

                        bcrypt.compare(data.otp.toString(), user.forgot_password_otp, function (err, response) {

                            if (response == true) {

                                UserSchema.updateOne({
                                    _id: user._id
                                }, {
                                    $set: {
                                        email_verify : "yes"
                                    }
                                }, async function (err, resUpdate) {
                                    if (err) {
                                        callback({
                                            "response_code": 5005,
                                            "response_message": "INTERNAL DB ERROR",
                                            "response_data": {}
                                        });
                                    } else {

                                        callback({
                                                    "response_code": 2000,
                                                    "response_message": "Email Id verified successfully",
                                                    "response_data": {'email': user.email, '_id':  user._id}
                                                });
                                    }
                                });

                            }else {
                                callback({
                                    "response_code": 5002,
                                    "response_message": "Invalid OTP ,Please try again",
                                    "response_data": {}
                                });
                            }
                        })
                        

                    
                    } else {
                        callback({
                            "response_code": 5002,
                            "response_message": "User is not exists.",
                            "response_data": {}
                        });

                    }
                
                }
            })
        }
    } else {
        callback({
            "response_code": 5005,
            "response_message": "INTERNAL DB ERROR",
            "response_data": {}
        });
    }
    },
    // reset password api
    resetPassword: function (data, callback) {
        if (data) {
            UserSchema.findOne({
                    _id: data.id
                }, {
                    _id: 1,
                    email:1,
                    fname:1,
                    lname:1
                },
                function (err, result) {
                    if (err) {
                        callback({
                            "response_code": 5005,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data":  {'error':err}
                        });
                    } else {
                        if (result != null) {

                            const saltRounds = 10;
                            bcrypt.hash(data.password.toString(), saltRounds, function (err, hash) {

                                if (err) {
                                    callback({
                                        "response_code": 5005,
                                        "response_message": "INTERNAL DB ERROR",
                                        "response_data":  {'error':err}
                                    });
                                } else {
                                    UserSchema.updateOne({
                                        _id: result._id
                                    }, {
                                        $set: {
                                            password: hash
                                        }
                                    }, function (err, resUpdate) {
                                        if (err) {
                                            callback({
                                                "response_code": 5005,
                                                "response_message": "INTERNAL DB ERROR",
                                                "response_data":  {'error':err}
                                            });
                                        } else {

                                            mailProperty('changePassword')(result.email, {
                                                        fname: result.fname,
                                                        lname: result.lname,
                                                        site_url: config.liveUrl,
                                                        date: new Date()
                                                    }).send();

                                            callback({
                                                "response_code": 2000,
                                                "response_message": "Password has been changed. You can login your account."
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            callback({
                                "response_code": 5002,
                                "response_message": "User is not valid.",
                                "response_data": {}
                            });
                        }

                    }
                });
        } else {
            callback({
                "response_code": 5005,
                "response_message": "INTERNAL DB ERROR",
                "response_data": {}
            });
        }
    },
    //user  login
    login: async function (data, callback) {
        if (data) {

            let user = await UserSchema.findOne({
                email: data.email
            }, async function (err, result) {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": err,
                        "response_data": {}
                    });

                } else {
                    if (result == null) {

                        callback({
                            "response_code": 5002,
                            "response_message": "Wrong password or email. Please provide registered details.",
                            "response_data": {}
                        });


                    } else {

                        if (result.email_verify == 'no') {
                            var all_result = {
                                authtoken: '',
                                _id: result._id,
                                name: result.name,
                                email: result.email
                            }
                            callback({
                                "response_code": 5010,
                                "response_message": "Your account is not activated. Please activate your account.",
                                "response_data": all_result
                            });
                        } else if (result.is_blocked == 'yes') {
                            var all_result = {
                                authtoken: '',
                                _id: result._id,
                                name: result.name,
                                email: result.email
                            }
                            callback({
                                "response_code": 5002,
                                "response_message": "Your account is temporarily blocked. Please contact admin.",
                                "response_data": all_result
                            });
                        } else {

                            bcrypt.compare(data.password.toString(), result.password, async function (err, response) {
                                // result == true
                                if (response == true) {

                                    var token = createToken(result);
                                    UserSchema.updateOne({
                                        _id: result._id
                                    }, {
                                        $set: {
                                            devicetoken: data.devicetoken,
                                            pushtoken: data.pushtoken,
                                            apptype: data.apptype,
                                        }
                                    }, async function (err, resUpdate) {
                                        if (err) {
                                            callback({
                                                "response_code": 5005,
                                                "response_message": "INTERNAL DB ERROR",
                                                "response_data":  {'error':err}
                                            });
                                        } else {

                                            if (result.profile_image_updated == true) {
                                                result.profile_image = config.liveUrl + result.profile_image;
                                            } else {
                                                result.profile_image = config.liveUrl + config.userDemoPicPath;
                                            }

                                            var all_result = {
                                                authtoken    : token,
                                                _id          : result._id,
                                                fname         : result.fname,
                                                lname         : result.lname,
                                                email        : result.email,
                                                user_type    : result.user_type,
                                                profile_image: result.profile_image
                                            }

                                            callback({
                                                "response_code": 2000,
                                                "response_message": "Logged your account",
                                                "response_data": all_result
                                            });

                                        }
                                    });
                                } else {
                                    callback({
                                        "response_code": 5002,
                                        "response_message": "Wrong password. Please provide correct password.",
                                        "response_data": {}
                                    });
                                }
                            });


                        }


                    }
                }
            })

        } else {
            callback({
                "response_code": 5005,
                "response_message": "INTERNAL DB ERROR",
                "response_data": {}
            });
        }
    },
    // join team with unique team code
    addMemberByUniqueTeamCode: async function (data, callback) {
        if (data) 
        {
            let teamDetails = await teamSchema.findOne({ uniqueCode : data.uniqueCode });

            if (teamDetails === null) 
            {
                callback({
                    "response_code": 5002,
                    "response_message": "Code is not valid.",
                    "response": {},
                    'success': false,
                    'error': true, 
                });
            } else {

                let teamMemberDetails = await teamMemberSchema.findOne({
                    team_id   : teamDetails._id,
                    member_id : data.member_id
                });
                
                if (teamMemberDetails === null) 
                {
                        obj = {
                            _id       :  new ObjectID,
                            team_id   :  teamDetails._id,
                            member_id :  data.member_id
                        }
                        new teamMemberSchema(obj).save(function (err3, result) {
                            if (err3) {
                                callback({
                                    "response_code": 5005,
                                    "response_message":err3,
                                    'success': false,
                                    'error': true, 
                                    "response_data": {}
                                });
                            } else {
                                callback({
                                    "response_code": 2000,
                                    "response_message": "Team joined successfully.",
                                    'success': true,
                                    'error': false, 
                                });
                            }
                        });
                } else {
                    callback({
                        "response_code": 5002,
                        "response_message": "You have already joined in this team try different team code.",
                        "response_data": {},
                        'success': false,
                        'error': true, 
                    });
                }
            }

        } else {
            callback({
                "response_code": 5005,
                "response_message": "INTERNAL DB ERROR",
                "response_data": {},
                'success': false,
                'error': true, 
            });
        }

    },
    createTeam: async function (data, callback) {
            if (data) {

                let uniqueCode =  common.generateString(6);
                data.uniqueCode = uniqueCode;
                let findTeam = await teamSchema.findOne({team_name: data.team_name, team_manager_id : data.team_manager_id });

                if(findTeam === null){
                        new teamSchema(data).save(function(err,res){
                            
                            if (err) {
                                callback({
                                    "response_code": 5005,
                                    "response_message": "INTERNAL DB ERROR",
                                    "response_data":  {'error':err}
                                });
                            } else {
                                callback({
                                    "response_code": 2000,
                                    "response_message": "Team created successfully."
                                });
                            }
                        })
                    }else{
                        callback({
                            "response_code": 5002,
                            "response_message": "Team name already exists, please try with different name",
                            "response_data": {}
                        });
                    }

            } else {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data":  {'error':err}

                    });
            }
    },
    myTeamList : async function (data,callback){
        teamSchema.find(
                 { 
                     team_manager_id : data.team_manager_id 
                 },{ _id : 1 ,team_name : 1 ,image : 1},(err,res)=>{
                        if (err) {
                            callback({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data":  {'error':err}
                            });
                        } else {
                            callback({
                                "response_code": 2000,
                                "response_message": "Team list found.",
                                "response_data": res
                            });
                        }
                 }
            );
    },
    teamDetailsUpdate:(data, fileData, callback)=>
    {
            if(!fileData || typeof fileData === undefined){
                    teamSchema.updateOne({
                        _id: data.team_id
                    }, {
                        $set: {
                            team_name  : data.team_name,
                            sports     : data.sports,
                            time_zone  : data.time_zone,
                            country    : data.country,
                            zip        : data.zip,
                            language   : data.language
                        }
                    }, function (err, resUpdate) 
                    {
                        if (err) {
                            callback({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "error":err,
                                "success" : false,
                                "error" : true,
                            });
                        } else {
                            callback({
                                "success" : true,
                                "error" : false,
                                "response_message" :"Team updated successfully",
                                "response_code": 2000,
                                // "response_data": PATH_LOCATIONS.user_profile_pic_path_view + data.profile_image
                            });
                        }
                    });

            }else
            {
                function removePreviousImage()
                {
                        var imageFile      = fileData.image;
                        var timeStamp      = Date.now();
                        var fileName       = timeStamp + imageFile.name;
                        var folderpath     = PATH_LOCATIONS.uploadTeamProfilePicPath ;
                        let profilepicPath = PATH_LOCATIONS.teamProfilePicPath;
                        let split          = imageFile
                                            .mimetype
                                            .split("/");
                                            
                        if (split[1] = "jpeg" || "png" || "jpg") 
                        {
                            imageFile.mv(
                                folderpath + fileName,
                                function (err) {
                                    if (err) {
                                        callback({
                                            "response_code": 5005,
                                            "response_message": "INTERNAL DB ERROR",
                                            "response_data": err,
                                            "success" : false,
                                            "error" : true,
                                        });
                                    } else {
            
                                         teamSchema.findOne({
                                                    _id: data.team_id
                                                }, {
                                                    image: 1
                                                },
                                                function (err, result) 
                                                {
                                                    
                                                    if (result != null) {
                                                        if (result.image !== null) {
                                    
                                                            let pf_image = `./public/${result.image}`;
                                                            fs.unlink(pf_image, (err) => {
                                                                if (err) {
                                                                    console.log('error while image delete===>', err);
                                                                } else {
                                                                    console.log(result.image + ' was deleted');
                                                                }
                                                            });
                                                        }
                                                    } 
                                                    
                                                });
            
                                                data.image =  profilepicPath + fileName;  
                                                data._id =data.team_id ; 
                                                updateProfileImage(data);
                                    }
                                }
                            )
                        } else {
                            callback({
                                status: 5002,
                                message: "MIME type not allowed please upload jpg or png file"
                            })
                        }
                    
                };
                function updateProfileImage(data)
                {
    
                    teamSchema.updateOne({
                        _id: data._id
                    }, {
                        $set: {
                            image      : data.image,
                            // team_name  : data.team_name,
                            // sports     : data.sports,
                            // time_zone  : data.time_zone,
                            // country    : data.country,
                            // zip        : data.zip,
                            // language   : data.language
                        }
                    }, function (err, resUpdate) 
                    {
                        if (err) {
                            callback({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "error":err,
                                "success" : false,
                                "error" : true,
                            });
                        } else {
                            callback({
                                "success" : true,
                                "error" : false,
                                "response_message" :"Team updated successfully",
                                "response_code": 2000,
                                "response_data": config.liveUrl + data.image
                            });
                        }
                    });
    
                };
                async function callmethods (){
                    await removePreviousImage();
                }
                callmethods();
            }
    },
    playerListbyTeamId : async function (data,callback){
      
          let TeamNonPlayerMember = 
            await teamMemberSchema.find({  team_id : data.team_id ,member_type :'NON-PLAYER' },{ team_id:1, member_id:1, _id:1,member_type :1 ,jersey_number:1 ,position :1}).
            populate('team_id','team_name image').
            populate('member_id','fname lname email  family_member gender profile_image ').
            exec();

            let TeamPlayerMember = 
            await teamMemberSchema.find({  team_id : data.team_id ,member_type :'PLAYER' },{ team_id:1, member_id:1, _id:1,member_type :1, jersey_number:1 ,position :1 }).
            populate('team_id','team_name image').
            populate('member_id','fname lname email  family_member gender profile_image').
            exec(function (err, playerList) {

                    if (err) {
                        callback({
                            "response_code": 5005,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data":  {'error':err}
                        });
                    } else {
                        let result = {
                            'NON_PLAYER'       : TeamNonPlayerMember,
                            'TOTAL_NON_PLAYER' : TeamNonPlayerMember.length,
                            'PLAYER'           : playerList,
                            'TOTAL_PLAYER'     : playerList.length,

                        }
                        callback({
                            "response_code": 2000,
                            "response_message": "Team list found.",
                            "response_data": result
                        });

                    }
            });
           

    },
    updatePlayerProfileImage:(data, fileData, callback)=>
    {
            if(!fileData || typeof fileData === undefined){
                callback({
                    "response_code": 5002,
                    "response_message": "please provide image file then hit submit button ",
                    "response_data": {}
                });
            }else
            {
                function removePreviousImage()
                {
                        var imageFile      = fileData.profile_image;
                        var timeStamp      = Date.now();
                        var fileName       = timeStamp + imageFile.name;
                        var folderpath     = PATH_LOCATIONS.uploadPlayerProfilePicPath ;
                        let profilepicPath = PATH_LOCATIONS.playerProfilePicPath;
                        let split          = imageFile
                                            .mimetype
                                            .split("/");
                                            
                        if (split[1] = "jpeg" || "png" || "jpg") 
                        {
                            imageFile.mv(
                                folderpath + fileName,
                                function (err) {
                                    if (err) {
                                        callback({
                                            "response_code": 5005,
                                            "response_message": "INTERNAL DB ERROR",
                                            "response_data":  {'error':err},
                                            "success" : false,
                                            "error" : true,
                                        });
                                    } else {
            
                                         UserSchema.findOne({
                                                    _id: data.player_id
                                                }, {
                                                    profile_image: 1
                                                },
                                                function (err, result) 
                                                {
                                                    if (result != null) {
                                                        if (result.profile_image !== null) {
                                    
                                                            let pf_image = `./public/${result.profile_image}`;
                                                            fs.unlink(pf_image, (err) => {
                                                                if (err) {
                                                                    console.log('error while image delete===>', err);
                                                                } else {
                                                                    console.log(result.profile_image + ' was deleted');
                                                                }
                                                            });
                                                        }
                                                    } 
                                                    
                                                });
            
                                                data.profile_image =  profilepicPath + fileName;  
                                                data._id =data.team_id ; 
                                                updateProfileImage(data);
                                    }
                                }
                            )
                        } else {
                            callback({
                                status: 5002,
                                message: "MIME type not allowed please upload jpg or png file"
                            })
                        }
                    
                };
                function updateProfileImage(data)
                {
    
                    UserSchema.updateOne({
                        _id: data.player_id
                    }, {
                        $set: {
                            profile_image          : data.profile_image,
                            profile_image_updated  : true
                        }
                    }, function (err, resUpdate) 
                    {
                        if (err) {
                            callback({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "error":err,
                            });
                        } else {
                            callback({
                                "response_message" :"Team updated successfully",
                                "response_code": 2000,
                                "response_data": config.liveUrl + data.profile_image
                            });
                        }
                    });
    
                };
                async function callmethods (){
                    await removePreviousImage();
                }
                callmethods();
            }
    },
    playerJoinedTeamList : async function (data,callback)
    {
        teamMemberSchema.find({  member_id : data.player_id  },{ team_id:1, member_id:1, _id:1 }).
        populate('team_id','team_name image').
        populate('member_id','fname lname email').
        exec(function (err, res) {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": {'error':err}
                    });
                } else {
                    callback({
                        "response_code": 2000,
                        "response_message": "Team list found.",
                        "response_data": res
                    });
                }
        });
    },
    invitePlayerToTeam : async function (data,callback)
    {
        let players_id =[];
            players_id= (data.player_id);

        var count = 0;
        
        for(const player_id of players_id){
                
                let obj = {
                    manager_id : data.manager_id ,
                    team_id    : data.team_id ,
                    player_id  : player_id 
                };
                let projectData = {
                    manager_id : 1,
                    team_id    : 1, 
                    player_id  : 1 
                }

                playerInvitationSchema.findOne( obj, projectData, (err,res)=>{
                    if (err) {
                                callback({
                                    "response_code": 5005,
                                    "response_message": "INTERNAL DB ERROR1",
                                    "response_data": {'error':err}
                                });
                    } else {
                        
                        if(res === null){
                                obj._id = new ObjectID;
                                new playerInvitationSchema(obj).save((err,result)=>{
                                    if (err) {
                                        callback({
                                            "response_code": 5005,
                                            "response_message": "INTERNAL DB ERROR2",
                                            "response_data": {}
                                        });
                                    } else {
                                        ++count;
                                        if(players_id.length === count){
                                                callback({
                                                            "response_code": 2000,
                                                            "response_message": "Invitation sent successfully.",
                                                            "response_data": {}
                                                    });
                                        }
                                    }
                                });
                        }else{
                            ++count;
                            if(players_id.length === count){
                                callback({
                                            "response_code": 2000,
                                            "response_message": "Invitation sent successfully.",
                                            "response_data": {}
                                    });
                             }
                        }
                        
                    }
            });

        }
      
    },
    playerTeamInvitationList : async function (data,callback)
    {
        if(!data.invitation_status){
            data.invitation_status = 'NONE';
        }

        playerInvitationSchema.find(
            {  player_id : data.player_id , invitation_status: data.invitation_status  },
            { team_id:1, manager_id:1, player_id:1 , invitation_status:1 })
        .populate('team_id','team_name image')
        .populate('manager_id','fname lname email')
        .populate('player_id','fname lname email')
        .exec(function (err, res) {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": {'error':err}
                    });
                } else {
                    callback({
                        "response_code": 2000,
                        "response_message": "Team list found.",
                        "response_data": res
                    });
                }
        });
    },
    changeInvitationStatus : async function (data,callback)
    {
           let updateData = await playerInvitationSchema.updateOne(
                { _id : data.invitation_id },
                { $set:
                    { invitation_status : data.invitation_status }
                },(err,res)=>{
                    if (err) {
                                callback({
                                    "response_code": 5005,
                                    "response_message": "INTERNAL DB ERROR",
                                    "response_data": {}
                                });
                            } else {
                                console.log(`player invitation status change to : ${data.invitation_status}`);
                                 if(data.invitation_status == 'REJECTED'){
                                        callback({
                                            "response_code": 2000,
                                            "response_message": "You have denied to join the team",
                                            "response_data": {}
                                        });
                                 }
                            }
                    });
            
        if(data.invitation_status == 'ACCEPTED'){

            let teamMemberDetails = await teamMemberSchema.findOne(
                { 
                    team_id : data.team_id,
                    member_id : data.player_id
                 });

            if(teamMemberDetails == null)
            {
                teamSchema.findOne(
                {    _id         : data.team_id 
                },
                {
                    team_id:1,
                    manager_id:1, 
                    player_id:1 ,
                    invitation_status:1
                }).exec(function (err, res) {
                        if (err) {
                            callback({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data": {'error':err}

                            });
                        } else {
                            if(res === null){
                                callback({
                                    "response_code": 5002,
                                    "response_message": "Team does not exist",
                                    "response_data": {}
                                })
                            }else{
                                let obj = {
                                    _id               : new ObjectID,
                                    member_id         : data.player_id,
                                    team_id           : data.team_id
                                }
                                new teamMemberSchema(obj).save((err,result)=>{
                                    if (err) {
                                        callback({
                                            "response_code": 5005,
                                            "response_message": "INTERNAL DB ERROR",
                                            "response_data": {'error':err}

                                        });
                                    } else {
                                        callback({
                                            "response_code": 2000,
                                            "response_message": "You have join the team successfully",
                                            "response_data": {}
                                        });
                                    }
                                })
                            }
                        }
                });
            }else{
                callback({
                    "response_code": 5002,
                    "response_message": "You are already in this team , no need to join again",
                    "response_data": {}
                })
            }
        }
    },
    addPlayerRoster: async function (data, callback) {
        if (data) {
            UserSchema.findOne({
                    email: data.email
                }, {
                    _id: 1,
                    email: 1,
                },
                async function (err, result) {
                    if (err) {
                        callback({
                            "response_code": 5005,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data": {'error':err}
                        });
                    } else {
                        if (result != null) {
                            callback({
                                "response_code": 2008,
                                "response_message": "Email address already registered",
                                "response_data": result
                            });
                        } else {

                            let temp_password = common.generateString(8);
                            
                            data.password = temp_password;
                            data.user_type = "player";
                            data._id = new ObjectID;
                            
                            new UserSchema(data).save(function (err, result) {
                                if (err) {
                                    callback({
                                        "response_code": 5005,
                                        "response_message": "INTERNAL DB ERROR",
                                        "response_data": {'error':err}
                                    });
                                } else {
                                    mailProperty('managerAddPlayerToRoster')(data.email, {
                                        fname        : data.fname,
                                        lname        : data.lname,
                                        email        : data.email,
                                        password     : data.password,
                                        site_url     : config.liveUrl,
                                        date: new Date()
                                    }).send();

                                    let obj = {
                                        _id               : new ObjectID,
                                        member_id         : data._id,
                                        team_id           : data.team_id,
                                        member_type       : data.member_type,
                                        jersey_number     : data.jersey_number,
                                        position          : data.position,

                                    }
                                    new teamMemberSchema(obj).save((err,result)=>{
                                        if (err) {
                                            callback({
                                                "response_code": 5005,
                                                "response_message": "INTERNAL DB ERROR",
                                                "response_data": {'error':err}
                                            });
                                        } else {
                                            callback({
                                                "response_code": 2000,
                                                "response_message": "Player added to team roster successfully."
                                            });
                                        }
                                    })
                                   
                                }
                            });
                        }
                    }
                });
        } else {
            callback({
                "response_code": 5005,
                "response_message": "INTERNAL DB ERROR",
                "response_data": {}

            });
        }
    },
    getUserDetails: async function(data,callback){
        UserSchema.findOne({
            _id: data.id
        },
        async function (err, result) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {'error':err}
                });
            } else {
                if (result == null) {
                    callback({
                        "response_code": 2008,
                        "response_message": "User does not exist ",
                        "response_data": result
                    });
                } else {
                    callback({
                        "response_code": 2000,
                        "response_message": "User details found",
                        "response_data":result
                    }); 
                }
            }
        });
    },
    getPlayerDetails: async function(data,callback){

        let getTeamMemberData = await teamMemberSchema.findOne({_id: data._id});

        UserSchema.findOne({
            _id: data.member_id,
            user_type: "player"
        },
        async function (err, result) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {'error':err}
                });
            } else {
                if (result == null) {
                    callback({
                        "response_code": 2008,
                        "response_message": "User does not exist ",
                        "response_data": result
                    });
                } else {

                    resdata = {
                        UserDetails : result,
                        teamDetails : getTeamMemberData
                    }

                    callback({
                        "response_code": 2000,
                        "response_message": "User details found",
                        "response_data":resdata
                    }); 
                }
            }
        });
    },
    updatePlayerDetails: async function(data, callback){
        await UserSchema.updateOne(
            {_id : data.player_id},
            {
                $set:{
                    email             : data.email,
                    fname             : data.fname,
                    lname             : data.lname,
                    gender            : data.gender,
                    city              : data.city,
                    zip               : data.zip,
                    dob               : data.dob,
                    state             : data.state,
                    address_line_one  : data.address_line_one,
                    address_line_two  : data.address_line_two,
                    phone             : data.phone,
                    position          : data.position,
                    jersey_number     : data.jersey_number,
                    family_member     : data.family_member
                }
            }, 
            function(err, resUpdate){
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "error":err,
                    });
                }else{
                    callback({
                        "response_message" :"Availability  updated  successfully",
                        "response_code": 2000,
                        "response_data": resUpdate
                    });
                }
            }
        )
    },
    deletePlayer: function(data, callback){
        UserSchema.deleteOne(
            {_id: data.player_id}, 
            (error,result) => {
                if (error) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "error":error,
                    });
                }else{
                    callback({
                        "response_message" :"Availability  updated  successfully",
                        "response_code": 2000,
                        "response_data": result
                    });
                }
            }
        )
    },
    updatePlayerInformation:async function(data, callback){
    
        let updateTeamMemberSchema =  await teamMemberSchema.updateOne({
            _id: data._id
        }, {
            $set: {
                member_type    : data.member_type,
                position       : data.position,
                jersey_number  : data.jersey_number,
            }
        }, function (err, resUpdate) 
        {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "error":err,
                });
            } else {
                
                    UserSchema.updateOne({
                        _id: data.player_id
                    }, {
                        $set: {
                            email          : data.email,
                            fname          : data.fname,
                            lname          : data.lname,
                            gender         : data.gender,
                            city           : data.city,
                            zip            : data.zip,
                            dob            : data.dob,
                            state          : data.state,
                            address        : data.address,
                            phone          : data.phone,
                            family_member  : data.family_member
                        }
                    }, function (err, resUpdate) 
                    {
                        if (err) {
                            callback({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "error":err,
                            });
                        } else {
                            callback({
                                "response_message" :"Player details updated successfully",
                                "response_code": 2000,
                                "response_data": resUpdate
                            });
                        }
                    });
            }
        });
                       
               
    },
    addGameEvents: async function (data, callback) {
        if (data) {
                    new eventAndGameSchema(data).save(function(err,res){
                        if (err) {
                            callback({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data":  {'error':err}
                            });
                        } else {
                            teamMemberSchema.find(
                                {team_id : data.team_id},
                                {member_id :1,member_type:1 },((err2,res2)=>
                            {
                                if(err2){
                                    callback({
                                        "response_code": 5005,
                                        "response_message": "INTERNAL DB ERROR",
                                        "response_data":  {'error':err}
                                    });
                                }else{
                                    if(res2.length>0)
                                    {
                                        let count = 0;
                                        for(user of res2){
                                            let obj = {
                                                _id           : new ObjectID,
                                                member_type   : user.member_type,
                                                points_2      : 0,
                                                points_3      : 0,
                                                free_throw    : 0,
                                                player_id     : user.member_id,
                                                game_event_id : data._id,
                                            }
                                            
                                            new scoreAndTeamAvailabilitySchema(obj).save((err,result)=>{
                                                if(err){
                                                    callback({
                                                        "response_code": 5005,
                                                        "response_message": "INTERNAL DB ERROR",
                                                        "response_data":  {'error':err}
                                                    });
                                                }else{
                                                     ++count;
                                                    if(res2.length == count ){
                                                        callback({
                                                            "response_code": 2000,
                                                            "response_message": `${data.event_type} CREATED SUCCESSFULLY.`
                                                        });
                                                    }
                                                }
                                            })
                                        }
                                    }else{
                                            callback({
                                                "response_code": 2000,
                                                "response_message": `${data.event_type} CREATED SUCCESSFULLY.`
                                            });
                                    }
                                }
                            })
                            )
                        }
                    })

        } else {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data":  {'error':err}

                });
        }
    },
    editGameEvents: async function (data, callback) {
           eventAndGameSchema.updateOne({
                _id: data._id
            }, {
                $set: {
                    name                 : data.name,
                    short_label          : data.short_label,
                    opponent             : data.opponent,
                    event_type           : data.event_type,
                    date                 : data.date,
                    time                 : data.time,
                    location             : data.location,
                    location_details     : data.location_details,
                    home_or_away         : data.home_or_away,
                    uniform              : data.uniform,
                    arrival_time         : data.arrival_time,
                    extra_label          : data.extra_label,
                    notes                : data.notes,
                    assignment           : data.assignment,
                    notify_team          : data.notify_team,
                    display_icon         : data.display_icon,
                }
            }, function (err, resUpdate) 
            {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "error":err,
                    });
                } else {
                    callback({
                        "response_message" :`${data.event_type} UPDATED SUCCESSFULLY.`,
                        "response_code": 2000,
                        "response_data": resUpdate
                    });
                }
            });
    },
    deleteGameEvent: async (data, callback) => {
        eventAndGameSchema.deleteOne(
            {_id: data.id, manager_id: data.manager_id},
            function(err, resDelete){
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "error":err,
                    });
                } else {
                    callback({
                        "response_message" :`DELETED SUCCESSFULLY.`,
                        "response_code": 2000,
                        "response_data": resDelete
                    });
                }
            }
        )
    },
    getGameEventList: async (data,callback)=>{

            var page = 1,
                limit = 30,
                query = {};

            if(data.team_id){
                query['team_id'] = data.team_id;
            }
            if(data.manager_id){
                query['manager_id'] = data.manager_id;
            }
            if(data.event_type){
                query['event_type'] = data.event_type;
            }
            
            var aggregate = eventAndGameSchema.aggregate();
            aggregate.match(query);

            aggregate.lookup({
                from: 'flag-icons',
                localField: 'display_icon',
                foreignField: '_id',
                as: 'flagDetails'
            });

            aggregate.unwind({
                path: "$flagDetails",
                preserveNullAndEmptyArrays: true
            });

            aggregate.project({
                _id              : 1,
                time             : 1,
                event_type       : 1,
                date             : 1,
                opponent         : 1,
                location         : 1,
                location_details : 1,
                home_or_away     : 1,
                uniform          : 1,
                arrival_time     : 1,
                extra_label      : 1,
                notes            : 1,
                assignment       : 1,
                notify_team      : 1,
                name             : 1,
                short_label      : 1,
                team_id          : 1,
                manager_id       : 1,
                display_icon:{
                    _id          : "$flagDetails._id",
                    name         : "$flagDetails.name",
                    image        : { $concat : [ config.liveUrl , '$flagDetails.image']}
                }
            });
            aggregate.sort({
                'createdAt': -1
            })
            var options = {
                page: page,
                limit: limit,
            }
            eventAndGameSchema.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": err,
                        "response_data": {}
                    });

                } else {
                    var data = {
                        docs: results,
                        pages: pageCount,
                        total: count,
                        limit: limit,
                        page: page
                    }
                    callback({
                        "response_code": 2000,
                        "response_message": "Evends and games list",
                        "response_data": data
                    });
                }
            });
    },
    gameEventCalenderByMonthYear: async (data,callback) => {
        let endDateofMonth = common.getDaysInMonth(data.month,data.year);
        let startDate = data.year+"-"+data.month+"-"+"01";
        let endDate   = data.year+"-"+data.month+"-"+endDateofMonth;
        await eventAndGameSchema.find({manager_id : data.manager_id, team_id:data.team_id, $and:[{date:{$gt:startDate}}, {date:{$lt:endDate}}]}, function(err,result){
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": err,
                    "response_data": {}
                });

            } else {
                callback({
                    "response_code": 2000,
                    "response_message": "Evends and games list",
                    "response_data": result
                });
            }
        })
    },
    gameEventCalenderView: async(data, callback)=>
    {
               var  endDateofMonth;
               if(!data.year){
                var d = new Date();
                data.year = d.getFullYear();
               }
               if(data.year){
                   if(data.month){
                    endDateofMonth = common.getDaysInMonth(data.month,data.year);
                   }
               }

            let query = {};
            
            let startdate = data.year +'-'+data.month +'-'+ 1 ;
            var start = new Date(startdate);
            start.setHours(0,0,0,0); 
            let enddate = data.year +'-'+data.month +'-'+ endDateofMonth ;
            var end = new Date(enddate);
            end.setHours(23,59,59,999);


            query['date'] =  { $gte: start, $lt: end };
            query['team_id'] = data.team_id;
            query['manager_id'] = data.manager_id;
            
            project = { 
                _id              : 1,
                time             : 1,
                event_type       : 1,
                date             : 1,
                opponent         : 1,
                location         : 1,
                location_details : 1,
                home_or_away     : 1,
                uniform          : 1,
                arrival_time     : 1,
                extra_label      : 1,
                notes            : 1,
                assignment       : 1,
                notify_team      : 1,
                display_icon     : 1,
                name             : 1,
                short_label      : 1,
                team_id          : 1,
                manager_id       : 1,
                display_icon     : 1
            }
        
            let TeamPlayerMember = 
            await eventAndGameSchema.find(query,project)
           .populate('team_id','team_name image')
           .populate('display_icon','name image _id')
           .exec(function (err, result) {

                    if (err) {
                        callback({
                            "response_code": 5005,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data":  {'error':err}
                        });
                    } else {
                       
                        callback({
                            "response_code": 2000,
                            "response_message": "Events and goals calender view data.",
                            "response_data": result
                        });
                    }
            });
    },
    allFlagList:(data,callback)=>{
        flagIconSchema.find((err,response)=>{
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": err,
                    "response_data": {}
                });
            } else {
                callback({
                    "response_code": 2000,
                    "response_message": "Flag List ",
                    "response_data": response
                });
            }
        })   
    },
    getEventDetailsById: async function(data,callback){
        eventAndGameSchema.findOne({
            _id: data._id
        },
        async function (err, result) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data": {'error':err}
                });
            } else {
                if (result == null) {
                    callback({
                        "response_code": 2008,
                        "response_message": "Game/Event does not exist ",
                        "response_data": result
                    });
                } else {
                    callback({
                        "response_code": 2000,
                        "response_message": "Game/Event details found",
                        "response_data":result
                    }); 
                }
            }
        });
    },
    teamPlayerAvailabilityList: async (data,callback)=>{

        var page = 1,
            limit = 30,
            query = {};

        if(data.game_event_id){
            query['game_event_id'] = data.game_event_id;
        }
        if(data.member_type){
            query['member_type'] = data.member_type;
        }
        if(data.player_id){
            query['player_id'] = data.player_id;
        }
        
        var aggregate = scoreAndTeamAvailabilitySchema.aggregate();
        aggregate.match(query);

        aggregate.lookup({
            from: 'users',
            localField: 'player_id',
            foreignField: '_id',
            as: 'userDetails'
        });

        aggregate.unwind({
            path: "$userDetails",
            preserveNullAndEmptyArrays: true
        });

        aggregate.project({
            _id                      : 1,
            availability             : 1,
            member_type              : 1,
            player_id                : 1,
            game_event_id            : 1,
            userDetails:{
                _id            : "$userDetails._id",
                fname          : "$userDetails.fname" ,
                lname          : "$userDetails.lname" ,
                gender         : "$userDetails.gender",
                image          : { $concat : [ config.liveUrl , '$userDetails.image']}
            }
        });
        aggregate.sort({
            'createdAt': -1
        })
        var options = {
            page: page,
            limit: limit,
        }
        scoreAndTeamAvailabilitySchema.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": err,
                    "response_data": {}
                });

            } else {
                var data = {
                    docs: results,
                    pages: pageCount,
                    total: count,
                    limit: limit,
                    page: page
                }
                callback({
                    "response_code": 2000,
                    "response_message": "Team playeravailability  list",
                    "response_data": data
                });
            }
        });
    },
    changerPlayerAvailability:async function(data, callback){
    
        scoreAndTeamAvailabilitySchema.updateOne({
            _id: data._id
        }, {
            $set: {
                availability          :  data.availability,
            }
        }, function (err, resUpdate) 
        {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "error":err,
                });
            } else {
                callback({
                    "response_message" :"Availability  updated  successfully",
                    "response_code": 2000,
                    "response_data": resUpdate
                });
            }
        });
               
    },
    eventGameListByPlayerId : async function (data,callback){
      
        let TeamNonPlayerMember = 
          await scoreAndTeamAvailabilitySchema.find({ player_id : data.player_id },{ _id :1, game_event_id:1, _id:1,member_type :1 , availability:1 ,member_type : 1})
          .populate('game_event_id','name event_type time date  location_details location  arrival_time  assignment ')
          .exec(function (err, playerList) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data":  {'error':err}
                });
            } else {
              
                callback({
                    "response_code": 2000,
                    "response_message": "Team list found.",
                    "response_data": playerList
                });

            }
    });
    },
    getGameEventListForPlayer: async function (data,callback){

        let getTeamList =  await teamMemberSchema.find({member_id : data.user_id},{ team_id : 1 });

        new Promise(function(resolve, reject){
            let teamArray =[];
            getTeamList.map(element => {
                teamArray.push(element.team_id)
            });
            resolve(teamArray);
        }).then(function (result){
                var page = 1,
                limit = 30,
                query = {};

                if(result){
                    query['team_id'] = { $in : result };
                }
                if(data.manager_id){
                    query['manager_id'] = data.manager_id;
                }
                if(data.event_type){
                    query['event_type'] = data.event_type;
                }
                
                
                var aggregate = eventAndGameSchema.aggregate();
                aggregate.match(query);

                aggregate.lookup({
                    from: 'flag-icons',
                    localField: 'display_icon',
                    foreignField: '_id',
                    as: 'flagDetails'
                });

                aggregate.unwind({
                    path: "$flagDetails",
                    preserveNullAndEmptyArrays: true
                });

                aggregate.project({
                    _id              : 1,
                    time             : 1,
                    event_type       : 1,
                    date             : 1,
                    opponent         : 1,
                    location         : 1,
                    location_details : 1,
                    home_or_away     : 1,
                    uniform          : 1,
                    arrival_time     : 1,
                    extra_label      : 1,
                    notes            : 1,
                    assignment       : 1,
                    notify_team      : 1,
                    name             : 1,
                    short_label      : 1,
                    team_id          : 1,
                    manager_id       : 1,
                    display_icon:{
                        _id          : "$flagDetails._id",
                        name         : "$flagDetails.name",
                        image        : { $concat : [ config.liveUrl , '$flagDetails.image']}
                    }
                });
                aggregate.sort({
                    'createdAt': -1
                })
                var options = {
                    page: page,
                    limit: limit,
                }
                eventAndGameSchema.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
                    if (err) {
                        callback({
                            "response_code": 5005,
                            "response_message": err,
                            "response_data": {}
                        });

                    } else {
                        var data = {
                            docs: results,
                            pages: pageCount,
                            total: count,
                            limit: limit,
                            page: page
                        }
                        callback({
                            "response_code": 2000,
                            "response_message": "Evends and games list",
                            "response_data": data
                        });
                    }
                });
                
        }).catch(function(error){
            console.log('error',error);
            callback({
                "response_code": 5005,
                "response_message": 'some error occured',
                "response_data": error
            });
        })
    },
    gameEventCalenderViewForPlayer: async(data, callback)=>
    {
        let getTeamList =  await teamMemberSchema.find({member_id : data.user_id},{ team_id : 1 });

        new Promise(function(resolve, reject){
                let teamArray =[];
                getTeamList.map(element => {
                    teamArray.push(element.team_id)
                });
                resolve(teamArray);
        }).then(function (result){

                var  endDateofMonth;
                if(!data.year){
                var d = new Date();
                data.year = d.getFullYear();
                }
                if(data.year){
                    
                    if(data.month){
                    endDateofMonth = common.getDaysInMonth(data.month,data.year);
                    }
                }
                let query = {};
                
                let startdate = data.year +'-'+data.month +'-'+ 1 ;
                var start = new Date(startdate);
                start.setHours(0,0,0,0); 
                let enddate = data.year +'-'+data.month +'-'+ endDateofMonth ;
                var end = new Date(enddate);
                end.setHours(23,59,59,999);

                query['date'] =  { $gte: start, $lt: end };
                query['team_id'] = { $in : result };
                
                project = { 
                    _id              : 1,
                    time             : 1,
                    event_type       : 1,
                    date             : 1,
                    opponent         : 1,
                    location         : 1,
                    location_details : 1,
                    home_or_away     : 1,
                    uniform          : 1,
                    arrival_time     : 1,
                    extra_label      : 1,
                    notes            : 1,
                    assignment       : 1,
                    notify_team      : 1,
                    display_icon     : 1,
                    name             : 1,
                    short_label      : 1,
                    team_id          : 1,
                    manager_id       : 1,
                    display_icon     : 1
                }
            
                let TeamPlayerMember = 
                eventAndGameSchema.find(query,project)
                .populate('team_id','team_name image')
                .populate('display_icon','name image _id')
                .exec(function (err, result) {

                        if (err) {
                            callback({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data":  {'error':err}
                            });
                        } else {
                        
                            callback({
                                "response_code": 2000,
                                "response_message": "Events and goals calender view data.",
                                "response_data": result
                            });
                        }
                });
                
        }).catch(function(error){
            console.log('error',error);
            callback({
                "response_code": 5005,
                "response_message": 'some error occured',
                "response_data": error
            });
        })

    },
    addAssignment : async (data,callback)=>{
        new assignmentSchema(data).save((err,res)=>{
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "response_data":  {'error':err}
                });
            } else {
                callback({
                    "response_code": 2000,
                    "response_message": "Assignment added successfully."
                });
            }

        })
    },
    getAssignmentList: async (data,callback)=>{

        var page = 1,
            limit = 30,
            query = {};

        if(data.assigner_id){
            query['assigner_id'] = data.assigner_id;
        }
        if(data.volunteer){
            query['volunteer'] = data.volunteer;
        }
        
        var aggregate = assignmentSchema.aggregate();
        aggregate.match(query);

        aggregate.lookup({
            from: 'users',
            localField: 'volunteer',
            foreignField: '_id',
            as: 'userDetails'
        });
        aggregate.lookup({
            from: 'events_and_games',
            localField: 'game_event_id',
            foreignField: '_id',
            as: 'eventGameDetails'
        });

        aggregate.unwind({
            path: "$userDetails",
            preserveNullAndEmptyArrays: true
        });
        aggregate.unwind({
            path: "$eventGameDetails",
            preserveNullAndEmptyArrays: true
        });

        aggregate.project({
            _id                       : 1,
            date                      : 1,
            time                      : 1,
            assignment                : 1,
            game_event_id             : 1,
            volunteer                 : 1,
            assigner_id               : 1,
            location                  : 1,

            volunteerDetails:{
                _id            : "$userDetails._id",
                fname          : "$userDetails.fname" ,
                lname          : "$userDetails.lname" ,
                gender         : "$userDetails.gender",
                image          : { $concat : [ config.liveUrl , '$userDetails.image']}
            },
            eventGameDetails:{
                _id            : "$eventGameDetails._id",
                event_type     : "$eventGameDetails.event_type" ,
                name           : "$eventGameDetails.name" ,
            }
        });
        aggregate.sort({
            'createdAt': -1
        })
        var options = {
            page: page,
            limit: limit,
        }
        assignmentSchema.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": err,
                    "response_data": {}
                });

            } else {
                var data = {
                    docs: results,
                    pages: pageCount,
                    total: count,
                    limit: limit,
                    page: page
                }
                callback({
                    "response_code": 2000,
                    "response_message": "Assignment list",
                    "response_data": data
                });
            }
        });
    },
    updateAssignment : async(data,callback)=>{

        assignmentSchema.updateOne({
            _id: data._id
        }, {
            $set: {
                assignment: data.assignment,
                location: data.location,
                time: data.time,
                date: data.date,
                volunteer: data.volunteer,
            }
        }, function (err, resUpdate) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": err,
                    "response_data": {}
                });
            }else{
                callback({
                    "response_code": 2000,
                    "response_message": "Assignment updated successfully",
                    "response_data": data
                });
            }
        });
    },
    deleteAssignment : async(data,callback)=>{
        
        assignmentSchema.deleteOne({_id : data._id},(err,res)=>{
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": err,
                    "response_data": {}
                });
            }else{
                callback({
                    "response_code": 2000,
                    "response_message": "Assignment deleted successfully",
                    "response_data": data
                });
            }
        })
    },
    editUserDetails: async (data, callback) => {
        UserSchema.updateOne(
            {_id : data.id},
            {$set:{
                fname : data.firstName,
                lname : data.lastName,
                email : data.email,
                dob   : data.dob,
                gender: data.gender,
                phone : data.phone,
                alternative_phone: data.alternative_phone,
                address_line_one: data.address_line_one,
                address_line_two: data.address_line_two,
                city: data.city,
                state: data.state,
                zip: data.zip,
                country: data.country,
                hide_age : (!data.hide_age || data.hide_age == null || data.hide_age == undefined)? "no" : "yes",
                email_is_private : (!data.email_is_private || data.email_is_private == null || data.email_is_private == undefined)? "no" : "yes",
                alternative_phone_is_private : (!data.alternative_phone_is_private || data.alternative_phone_is_private == null || data.alternative_phone_is_private == undefined)? "no" : "yes",
                phone_is_private : (!data.phone_is_private || data.phone_is_private == null || data.phone_is_private == undefined)? "no" : "yes",
                address_is_private : (!data.address_is_private || data.address_is_private == null || data.address_is_private == undefined) ? "no" : "yes",
            }},
            function(err,resUpdate){
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "error":err,
                    });
                } else {
                    callback({
                        "response_message" :"Availability  updated  successfully",
                        "response_code": 2000,
                        "response_data": resUpdate
                    });
                }
            }
        );
    },
    getPlayerByManagerId : async (data, callback) => {
        UserSchema.find({manager_id: data.manager_id, user_type: "player"}, function (err, result) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "error":err,
                });
            } else {
                callback({
                    "response_message" :"get players by manager id successfully",
                    "response_code": 2000,
                    "response_data": result
                });
            }
        })
    },
    getPlayerDetailsByPlayerId: async (data, callback) => {
        UserSchema.findOne({manager_id: data.manager_id, _id: data.player_id}, function (err, result) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": "INTERNAL DB ERROR",
                    "error":err,
                });
            } else {
                callback({
                    "response_message" :"get players details",
                    "response_code": 2000,
                    "response_data": result
                });
            }
        })
    }
    //************ */ This user model crossed  2600 lines and file size becomes larger now ,
    // that is why creating another model named as 'User2nd.js*******************************'
    
};
module.exports = UserModels;