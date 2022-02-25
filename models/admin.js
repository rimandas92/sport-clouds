var AdminSchema = require('../schema/admin');
var teamSchema = require('../schema/team');
var flagIconSchema = require('../schema/flags_icon');

var AdminNotificationSchema = require('../schema/admin_notification');
var config = require('../config');
var faqSchema = require('../schema/faq');
var termAndConditionSchema = require('../schema/term_and_condition');
var UserSchema = require('../schema/user');
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var bcrypt = require('bcrypt');
var fs = require('fs');
var jwt = require('jsonwebtoken');
var mailProperty = require('../modules/sendMail');
var secretKey = config.secretKey;
const common = require("../utility/common");
const { STATUS_CONSTANTS, STATUS_MESSAGES, URL_PATHS, PATH_LOCATIONS, CONSTANTS } = require('../utility/constant');

createToken = (admin) => {
    var tokenData = {
        id: admin._id
    };
    var token = jwt.sign(tokenData, secretKey, {
        expiresIn: 86400
    });
    return token;
};

var adminModels = {

    //register employee
    register: function (data, callback) {
        if (data) {
            AdminSchema.findOne({
                    email: data.email
                }, {
                    _id: 1,
                    email: 1,
                },
                function (err, result) {
                    if (err) {
                        callback({
                            "response_code": 5005,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data": {}
                        });
                    } else {
                        if (result != null) {
                            callback({
                                "response_code": 2008,
                                "response_message": "Email address already exist",
                                "response_data": result
                            });
                        } else {
                            new AdminSchema(data).save(function (err, result) {
                                if (err) {
                                    callback({
                                        "response_code": 5005,
                                        "response_message": "INTERNAL DB ERROR",
                                        "response_data": {}
                                    });
                                } else {

                                    callback({
                                        "response_code": 2000,
                                        "response_message": "You have registered successfully."
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
    //login
    login: async function (data, callback) {
        if (data) {

            let admin = await AdminSchema.findOne({
                email: data.email
            }, {
                email: 1,
                password: 1
            }, function (err, result) {
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

                        bcrypt.compare(data.password.toString(), result.password, function (err, response) {
                            // result == true
                            if (response == true) {

                                var token = createToken(result);

                                var all_result = {
                                    authtoken: token,
                                    _id: result._id,
                                    name: result.name,
                                    email: result.email,

                                }
                                callback({
                                    "response_code": 2000,
                                    "response_message": "Logged your account",
                                    "response_data": all_result
                                });

                            } else {
                                callback({
                                    "response_code": 5002,
                                    "response_message": "Wrong password or email. Please provide registered details.",
                                    "response_data": {}
                                });
                            }
                        });



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
    //Forgotpassword
    forgotPassword: function (data, callback) {
        if (data) {
            AdminSchema.findOne({
                    email: data.email
                },
                function (err, resDetails) {
                    if (err) {
                        callback({
                            "response_code": 5005,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data": {}
                        });
                    } else {
                        if (resDetails == null) {
                            callback({
                                "response_code": 5002,
                                "response_message": "User does not exist.",
                                "response_data": {}
                            });
                        } else {
                            var random = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 6);
                            const saltRounds = 10;
                            bcrypt.hash(random, saltRounds, function (err, hash) {

                                var new_password = hash;
                                var conditions = {
                                        _id: resDetails._id
                                    },
                                    fields = {
                                        password: new_password
                                    },
                                    options = {
                                        upsert: false
                                    };
                                AdminSchema.updateOne(conditions, fields, options, function (err, affected) {
                                    if (err) {
                                        callback({
                                            response_code: 5005,
                                            response_message: "INTERNAL DB ERROR",
                                            response_data: err
                                        });
                                    } else {
                                        mailProperty('forgotPasswordMail')(data.email, {
                                            name: 'Admin',
                                            password: random,
                                            email: data.email,
                                            site_url: config.liveUrl,
                                            date: new Date()
                                        }).send();
                                        callback({
                                            response_code: 2000,
                                            response_message: "New password will be sent to your mail.",
                                        });
                                    }
                                });

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
    //Forgotpassword
    changePassword: function (data, callback) {
        if (data) {
            AdminSchema.findOne({
                    email: data.email
                },
                function (err, resDetails) {
                    if (err) {
                        callback({
                            "response_code": 5005,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data": {}
                        });
                    } else {
                        if (resDetails == null) {
                            callback({
                                "response_code": 5002,
                                "response_message": "User does not exist.",
                                "response_data": {}
                            });
                        } else {

                            const saltRounds = 10;
                            bcrypt.hash(data.password.toString(), saltRounds, function (err, hash) {

                                var new_password = hash;

                                AdminSchema.updateOne({
                                    _id: resDetails._id
                                }, {
                                    $set: {
                                        password: new_password
                                    }
                                }, function (err, resUpdate) {
                                    if (err) {
                                        callback({
                                            "response_code": 5005,
                                            "response_message": "INTERNAL DB ERROR",
                                            "response_data": {}
                                        });
                                    } else {
                                        callback({
                                            response_code: 2000,
                                            response_message: "Password Update successfully.",
                                        });
                                    }
                                });


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
    createOrganizer: async function (data, callback) {
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

                            data.password = data.email;
                            data.user_type = "organizer";

                            new UserSchema(data).save(function (err, result) {
                                if (err) {
                                    callback({
                                        "response_code": 5005,
                                        "response_message": "INTERNAL DB ERROR",
                                        "response_data": {'error':err}
                                    });
                                } else {
                                    mailProperty('organizerWelcomeMail')(data.email, {
                                        fname        : data.fname,
                                        lname        : data.lname,
                                        email        : data.email,
                                        password     : data.password,
                                        site_url     : config.liveUrl,
                                        date: new Date()
                                    }).send();

                                    callback({
                                        "response_code": 2000,
                                        "response_message": "Organizer is  registered successfully."
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
    createTeam: async function (data, callback) {
        if (data) {

            let uniqueCode =  common.generateString(6);
            data.uniqueCode = uniqueCode;
            let findTeam = await teamSchema.findOne({team_name: data.team_name});

            console.log('findTeam == \n',findTeam);

            if(findTeam === null){
                    new teamSchema(data).save(function(err,res){
                        console.log('data == \n',data);
                        if (err) {
                            callback({
                                "response_code": 5005,
                                "response_message": "INTERNAL DB ERROR",
                                "response_data": {}
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
                    "response_data": {}

                });
        }
    },
    addFlagIcon : async function (data, fileData, callback ){

        var imageFile      = fileData.image;
        var timeStamp      = Date.now();
        var fileName       = timeStamp + imageFile.name;
        var folderpath     = PATH_LOCATIONS.uploadFlagIcon ;
        let imagePath      = PATH_LOCATIONS.flagIconPath;
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
                        });
                    } else {
                                data.image =  imagePath + fileName;  
                                let obj = {
                                    _id     : new ObjectID,
                                    image   : data.image,
                                    name    : data.name,
                                }

                                new flagIconSchema(obj).save(function (err, resUpdate) 
                                {
                                    if (err) {
                                        callback({
                                            "response_code": 5005,
                                            "response_message": "INTERNAL DB ERROR",
                                            "error":err,
                                        });
                                    } else {
                                        callback({
                                            "message" :"Flag added successfully",
                                            "response_code": 2000,
                                            "response_data": config.liveUrl + data.image
                                        });
                                    }
                                });
                    }
                }
            )
        } else {
            callback({
                status: 5002,
                message: "MIME type not allowed please upload jpg or png file"
            })
        }
    },
    updateFlagIcon:(data, fileData, callback)=>
    {
            if(!fileData || typeof fileData === undefined){
                flagIconSchema.updateOne({
                        _id: data._id
                    }, {
                        $set: {
                            name  : data.name,
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
                                "message" :"Flag updated successfully",
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
                        var folderpath     = PATH_LOCATIONS.uploadFlagIcon ;
                        let imagePath      = PATH_LOCATIONS.flagIconPath;
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
                                        });
                                    } else {
            
                                        flagIconSchema.findOne({
                                                    _id: data._id
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
            
                                                data.image =  imagePath + fileName;  
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
                    flagIconSchema.updateOne({
                        _id: data._id
                    }, {
                        $set: {
                            image      : data.image,
                            name       : data.name,
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
                                "message" :"Flag updated successfully",
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
};
module.exports = adminModels;