const playerAlbumPhotoSchema = require('../schema/playerAlbumPhoto');
const tournamentSchema = require('../schema/tournaments');
const locationSchema = require('../schema/location');
const albumSchema = require('../schema/album');
const teamStoreSchema = require('../schema/teamStore');
const cartSchema = require('../schema/teamStore');
const teamMemberSchema = require('../schema/teamMember');
const teamSchema = require('../schema/team');
const UserSchema = require('../schema/user');

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
const { Promise } = require('mongoose');

var UserModels2nd = {
    addPhotoToAlbum:async (data, fileData, callback)=>
    {
        
        var promises = [];
        var folderpath     = PATH_LOCATIONS.uploadUserFiles ;
        let profilepicPath = PATH_LOCATIONS.userFilesPath;
        var multiBanner = (file) => new Promise( (resolve,reject) => { 
            let split_banner = file
                .mimetype
                .split("/");

            if (split_banner[1] == "jpeg" || "png" || "jpg" ) {
                
                var ext = file.name.slice(file.name.lastIndexOf('.'));
                var fileName = `${file.name}_${Date.now()}_${ext}`;
                file.mv(folderpath + fileName, function (err) {
                    if (err) {
                        console.log('A file failed to process');
                        reject({
                            "response_code": 500,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data": err
                        })
                    } else {
                        
                        
                        let obj = { 
                            _id          : new ObjectID,
                            user_id      : data.user_id,
                            file       : profilepicPath + fileName,
                            album_id     : data.album_id
                        };
                        
                        new playerAlbumPhotoSchema(obj).save((err,res)=>{
                            if (err) {
                                callback({
                                    "response_code": 5005,
                                    "response_message": "INTERNAL DB ERROR",
                                    "error":err,
                                });
                            } 
                        })

                        resolve(profilepicPath + fileName);
                    }
                });
            } else {
                reject({
                    "response_code": 405,
                    "response_message": "MIME type not allowed please upload jpg or png file"
                })
               
            }
        });
        if (fileData.file.length != undefined) {

            for(i=0; i < fileData.file.length; i++){
                var file = fileData.file[i];
                promises.push(multiBanner(file));
            }
            

        } else {
            
            var file = fileData.file;
            promises.push(multiBanner(file));
            
        }
        await Promise.all(promises)
            .then(value => { 
                
                callback({
                    "response_message" :`UPLOADED SUCCESSFULLT`,
                    "response_code": 2000,
                    "response_data": {}
                });
                
            }).catch((error)=>{
                console.log('error occured', error);
            });
        // new Promise ((resolve,reject)=>{

        //     var imageFile      = fileData.file;
        //     var timeStamp      = Date.now();
        //     var fileName       = timeStamp + imageFile.name;
        //     var folderpath     = PATH_LOCATIONS.uploadUserFiles ;
        //     let profilepicPath = PATH_LOCATIONS.userFilesPath;
        //         imageFile.mv(
        //             folderpath + fileName,
        //             function (err) {
        //                 if (err) {
        //                     callback({
        //                         "response_code": 5005,
        //                         "response_message": "INTERNAL DB ERROR",
        //                         "response_data":  {'error':err},
        //                     });
        //                 } else {
        //                         data.file =  profilepicPath + fileName;  
        //                         resolve(data)
        //                 }
        //             })

        // }).then((data)=>{

        //     let obj = { 
        //         _id          : new ObjectID,
        //         user_id      : data.user_id,
        //         file_type    : data.file_type,
        //         file         : data.file,
        //         title        : data.title,
        //         album_id     : data.album_id
        //     }
        //     new playerAlbumPhotoSchema(obj).save((err,res)=>{
        //         if (err) {
        //             callback({
        //                 "response_code": 5005,
        //                 "response_message": "INTERNAL DB ERROR",
        //                 "error":err,
        //             });
        //         } else {
        //             callback({
        //                 "response_message" :`${data.file_type} UPLOADED SUCCESSFULLT `,
        //                 "response_code": 2000,
        //                 "response_data": config.liveUrl + data.file
        //             });
        //         }
        //     })
        // }).catch((error)=>{
        //     console.log('error occured', error);
        // });
         
    },
    deletePhotoFromAlbum:async (data, callback)=>
    {
        let photo = await playerAlbumPhotoSchema.findOne({
            _id: data._id,
            album_id: data.album_id
        }, function (err, result) {
            if (err) {
                callback({
            
                    response_code: 505,
                    response_message: "INTERNAL DB ERROR",
                    response_data: {}
                });

            }
        });

        if(photo == null){

            callback({
                "response_code": 404,
                "response_message": "Record not found.",
                "response_data": {}
            });

            return;
        }

        playerAlbumPhotoSchema.deleteOne({_id : data._id},(err,res)=>{
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": err,
                    "response_data": {}
                });
            }else{
                callback({
                    "response_code": 2000,
                    "response_message": "Deleted successfully",
                    "response_data": data
                });

                if (photo.file !== null) {
                    let pf_image = `./public/${photo.file}`;
                    fs.unlink(pf_image, (err) => {
                        if (err) {
                            console.log('error while image delete===>', err);
                        } else {
                            console.log('Image is deleted');
                        }
                    });
                }
            }
        })

        // new Promise ((resolve,reject)=>{
        //     if(!fileData || typeof fileData === undefined){
        //         let obj = {
        //             file_type    : data.file_type,
        //             file         : data.file,
        //             title        : data.title,
        //             album_id     : data.album_id
        //         }
        //         resolve(obj);
        //     }else{
        //         var imageFile      = fileData.file;
        //         var timeStamp      = Date.now();
        //         var fileName       = timeStamp + imageFile.name;
        //         var folderpath     = PATH_LOCATIONS.uploadUserFiles ;
        //         let profilepicPath = PATH_LOCATIONS.userFilesPath;
                                    
        //             imageFile.mv(
        //                 folderpath + fileName,
        //                 function (err) {
        //                     if (err) {
        //                         callback({
        //                             "response_code": 5005,
        //                             "response_message": "INTERNAL DB ERROR",
        //                             "response_data":  {'error':err},
        //                         });
        //                     } else {

        //                         playerAlbumPhotoSchema.findOne({
        //                                     _id: data._id
        //                                 }, {
        //                                     file: 1
        //                                 },
        //                                 function (err, result) 
        //                                 {
        //                                     if (result != null) {
        //                                         if (result.file !== null) {
        //                                             let pf_image = `./public/${result.file}`;
        //                                             fs.unlink(pf_image, (err) => {
        //                                                 if (err) {
        //                                                     console.log('error while image delete===>', err);
        //                                                 } else {
        //                                                     console.log(result.file + ' was deleted');
        //                                                 }
        //                                             });
        //                                         }
        //                                     } 
                                            
        //                                 });
        //                                 data.file =  profilepicPath + fileName;  
        //                                 let obj = {
        //                                     file_type    : data.file_type,
        //                                     file         : data.file,
        //                                     title        : data.title,
        //                                     album_id     : data.album_id
        //                                 }
        //                                 resolve(obj);
        //                     }
        //                 })
        //         }
            
        // }).then((obj)=>{
        //     playerAlbumPhotoSchema.updateOne({
        //         _id: data._id
        //     }, {
        //         $set: obj
        //     }, function (err, resUpdate) 
        //     {
        //         if (err) {
        //             callback({
        //                 "response_code": 5005,
        //                 "response_message": "INTERNAL DB ERROR",
        //                 "error":err,
        //             });
        //         } else {
        //             callback({
        //                 "response_message" :`${obj.file_type} UPDATE SUCCESSFULLY`,
        //                 "response_code": 2000,
        //                 "response_data": config.liveUrl + obj.file
        //             });
        //         }
        //     });
        // }).catch((error)=>{
        //     console.log('error occured', error);
        // });
         
    },
    userMediaList: async (data,callback)=>{

        var page = 1,
            limit = 30,
            query = {};

        if(data.file_type){
            query['file_type'] = data.file_type;
        }
        if(data.user_id){
            query['user_id'] = data.user_id;
        }
        if(data.album_id){
            query['album_id'] = data.album_id;
        }
        
        var aggregate = playerAlbumPhotoSchema.aggregate();
        aggregate.match(query);

        aggregate.lookup({
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'userDetails'
        });

        aggregate.unwind({
            path: "$userDetails",
            preserveNullAndEmptyArrays: true
        });

        aggregate.project({
            _id              : 1,
            user_id          : 1,
            // title            : 1,
            // file_type        : 1,
            file             : {
                $cond: {
                    if: {
                        $eq: ["$file", null]
                    },
                    then: null,
                    else: {
                        $concat: [config.liveUrl, "$file"]
                    }

                }
            },
            userDetails:{
                _id                  : "$userDetails._id",
                fname                : "$userDetails.fname",
                lname                : "$userDetails.lname",
                profile_image        : { $concat : [ config.liveUrl , '$userDetails.profile_image']}
            }
        });
        aggregate.sort({
            'createdAt': -1
        })
        var options = {
            page: page,
            limit: limit,
        }
        playerAlbumPhotoSchema.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
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
                    "response_message": "User File list",
                    "response_data": data
                });
            }
        });
    },
    addTournament : async (data,callback)=>{
        data._id = new ObjectID;
        new tournamentSchema(data).save((err, result)=>{
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message" : err,
                    "response_data": {}
                });
            } else {
                callback({
                    "response_code": 2000,
                    "response_message": "Tournament added successfully.",
                });
            }
        });
    },
    addAlbum : async (data,callback)=>{
        
        let team = await teamSchema.findOne({
            _id: data.team_id
        }, function (err, result) {
            if (err) {
                callback({
            
                    response_code: 505,
                    response_message: "INTERNAL DB ERROR",
                    response_data: {}
                });

            }
        });

        if(team == null){

            callback({
                "response_code": 404,
                "response_message": "Team not found.",
                "response_data": {}
            });

            return;
        }
        data._id = new ObjectID;
        data.team_manager_id = team.team_manager_id;
        new albumSchema(data).save((err, result)=>{
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message" : err,
                    "response_data": {}
                });
            } else {
                callback({
                    "response_code": 2000,
                    "response_message": "Album created successfully.",
                });
            }
        });
    },
    editAlbum : async (data,callback)=>{
        albumSchema.updateOne(
            { _id : data._id},
            { $set : 
                { name : data.name } 
            },(err,res)=>{
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message" : err,
                        "response_data": {}
                    });
                } else {
                    callback({
                        "response_code": 2000,
                        "response_message": "Album updated successfully.",
                    });
                }
            })
    },
    deleteAlbum : async (data,callback)=>{
        albumSchema.deleteOne({_id : data._id},(err,res)=>{
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": err,
                    "response_data": {}
                });
            }else{
                callback({
                    "response_code": 2000,
                    "response_message": "album deleted successfully",
                    "response_data": data
                });
            }
        })
    },
    getAllAlbumList: async (data,callback)=>{
        var page = 1,
            limit =1000,
            query = {};

        if(data.team_id){
            query['team_id'] = data.team_id;
        }
        if(data._id){
            query['_id'] = data._id;
        }
        
        var aggregate = albumSchema.aggregate();
        aggregate.match(query);
        aggregate.project({
            _id              : 1,
            team_id          : 1,
            team_manager_id  : 1,
            name            : 1,
        });
        aggregate.sort({
            'createdAt': -1
        })
        var options = {
            page: page,
            limit: limit,
        }
        albumSchema.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
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
                    "response_message": "All album list",
                    "response_data": data
                });
            }
        });
    },
    addStoreImage:(data, fileData, callback)=>
    {
        new Promise ((resolve,reject)=>{

            var imageFile      = fileData.image;
            var timeStamp      = Date.now();
            var fileName       = timeStamp + imageFile.name;
            var folderpath     = PATH_LOCATIONS.uploadTeamStore ;
            let profilepicPath = PATH_LOCATIONS.teamStorePath;
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
                                    });
                                } else {
                                        data.image =  profilepicPath + fileName;  
                                        resolve(data)
                                }
                            })
                    } else {
                        callback({
                            status: 5002,
                            message: "MIME type not allowed please upload jpg or png file"
                        })
                    }

        }).then((data)=>{

            let obj = { 
                _id             : new ObjectID,
                image           : data.image,
                team_id         : data.team_id,
                manager_id      : data.manager_id,
                name            : data.name,
                jersey_number   : data.jersey_number,
                description     : data.description,
                price           : data.price,
                brand           : data.brand,
                color           : data.color,
                material        : data.material,
                size            : data.size,
            }
            new teamStoreSchema(obj).save((err,res)=>{
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "error":err,
                    });
                } else {
                    callback({
                        "response_message" :`Image uploaded successfully.`,
                        "response_code": 2000,
                        "response_data": res
                    });
                }
            })
        }).catch((error)=>{
            console.log('error occured', error);
        });
         
    },
    editStoreImage:(data, fileData, callback)=>
    {
        new Promise ((resolve,reject)=>{
            if(!fileData || typeof fileData === undefined){
                let obj = {
                    name            : data.name,
                    jersey_number   : data.jersey_number,
                    description     : data.description,
                    price           : data.price,
                    brand           : data.brand,
                    color           : data.color,
                    material        : data.material,
                    size            : data.size,
                    team_id         : data.team_id
                }
                resolve(obj);
            }else{
                var imageFile      = fileData.image;
                var timeStamp      = Date.now();
                var fileName       = timeStamp + imageFile.name;
                var folderpath     = PATH_LOCATIONS.uploadTeamStore ;
                let profilepicPath = PATH_LOCATIONS.teamStorePath;
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
                                    });
                                } else {
                                    teamStoreSchema.findOne({
                                                _id: data.id
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
                                            let obj = {
                                                image           : data.image,
                                                name            : data.name,
                                                jersey_number   : data.jersey_number,
                                                description     : data.description,
                                                price           : data.price,
                                                brand           : data.brand,
                                                color           : data.color,
                                                material        : data.material,
                                                size            : data.size,
                                                team_id         : data.team_id
                                            }
                                            resolve(obj);
                                }
                            })
                    } else {
                        callback({
                            status: 5002,
                            message: "MIME type not allowed please upload jpg or png file"
                        })
                    }
                     
                }
            
        }).then((obj)=>{
            teamStoreSchema.updateOne({
                _id: data.id
            }, {
                $set: obj
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
                        "response_message" :`Image updated successfully`,
                        "response_code": 2000,
                        "response_data": resUpdate
                    });
                }
            });
        }).catch((error)=>{
            console.log('error occured', error);
        });
         
    },
    teamStoreProductList: async (data,callback)=>{

        var page = 1,
            limit = 30,
            query = {};

        if(data.manager_id){
            query['manager_id'] = data.manager_id;
        }
        if(data.team_id){
            query['team_id'] = data.team_id;
        }
        if(data._id){
            query['_id'] = data._id;
        }
        
        var aggregate = teamStoreSchema.aggregate();
        aggregate.match(query);

        aggregate.sort({
            'createdAt': -1
        })
        var options = {
            page: page,
            limit: limit,
        }
        teamStoreSchema.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
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
                    "response_message": "Team Store Product list",
                    "response_data": data
                });
            }
        });
    },
    managerStoreProductList: async (data,callback) =>{
        await teamStoreSchema.find({manager_id: data.manager_id}, function (err, result){
            if(err){
                callback({
                    "response_code": 5005,
                    "response_message": err,
                    "response_data": {}
                });
            }else{
                callback({
                    "response_code": 2000,
                    "response_message": "Manager Store Product list",
                    "response_data": result
                });
            }
        })
    },
    storeProductById: async (data,callback)=>{
        await teamStoreSchema.findOne({_id: data.id}, function (err, result){
            if(err){
                callback({
                    "response_code": 5005,
                    "response_message": err,
                    "response_data": {}
                });
            }else{
                callback({
                    "response_code": 2000,
                    "response_message": "Store Product details",
                    "response_data": result
                });
            }
        })
    },
    deleteStoreProductById: async (data,callback) => {
        await teamStoreSchema.deleteOne({_id: data.id}, function (err, result){
            if(err){
                callback({
                    "response_code": 5005,
                    "response_message": err,
                    "response_data": {}
                });
            }else{
                callback({
                    "response_code": 2000,
                    "response_message": "Store Product deleted",
                    "response_data": result
                });
            }
        })
    },
    addToCart : async (data,callback)=>{
        data._id = new ObjectID;
        new cartSchema(data).save((err, result)=>{
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message" : err,
                    "response_data": {}
                });
            } else {
                callback({
                    "response_code": 2000,
                    "response_message": "Tournament added successfully.",
                });
            }
        });
    },
    listCartItem: async (data,callback)=>{

        var page = 1,
            limit = 30,
            query = {};

        if(data.user_id){
            query['user_id'] = data.user_id;
        }
        if(data.manager_id){
            query['manager_id'] = data.manager_id;
        }
        if(data.product_id){
            query['product_id'] = data.product_id;
        }
        
        var aggregate = cartSchema.aggregate();
        aggregate.match(query);

        aggregate.lookup({
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'userDetails'
        });

        aggregate.unwind({
            path: "$userDetails",
            preserveNullAndEmptyArrays: true
        });

        aggregate.project({
            _id                    : 1,
            user_id                : 1,
            number_of_product      : 1,
            manager_id             : 1,
            product_id             : 1,
            userDetails:{
                _id                  : "$userDetails._id",
                fname                : "$userDetails.fname",
                lname                : "$userDetails.lname",
                profile_image        : { $concat : [ config.liveUrl , '$userDetails.profile_image']}
            }
        });
        aggregate.sort({
            'createdAt': -1
        })
        var options = {
            page: page,
            limit: limit,
        }
        cartSchema.aggregatePaginate(aggregate, options, function (err, results, pageCount, count) {
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
                    "response_message": "Cart item list",
                    "response_data": data
                });
            }
        });
    },
    addLocation : async (data,callback)=>{
        data._id = new ObjectID;
        new locationSchema(data).save((err, result)=>{
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message" : err,
                    "response_data": {}
                });
            } else {
                callback({
                    "response_code": 2000,
                    "response_message": "Location added successfully.",
                });
            }
        });
    },
    getLocationList : async (data,callback)=>{
        
        let query = {};
        if(data.locationName){
            query['locationName'] = new RegExp(data.locationName,'i');
        };
        if(data.address){
            query['address'] = new RegExp(data.address,'i') ;
        };
        if(data._id){
            query['_id'] = data._id ;
        };

        locationSchema.find(query,(err, result)=>{
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message" : err,
                    "response_data": {}
                });
            } else {
                callback({
                    "response_code": 2000,
                    "response_message": "List location ",
                    "response_data": result

                });
            }
        });
    },
    deleteLocation : async (data,callback)=>{
        locationSchema.deleteOne({_id : data._id},(err,res)=>{
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": err,
                    "response_data": {}
                });
            }else{
                callback({
                    "response_code": 2000,
                    "response_message": "location deleted successfully",
                    "response_data": data
                });
            }
        })
    },
    allPlayerListByTeamId : async (data,callback)=>{
        
        let TeamPlayerMember = 
        await teamMemberSchema.find({team_id : data.team_id }, { team_id:1, member_id:1,_id:0  }).
        populate('member_id','fname lname email  family_member gender profile_image ').
        exec(function (err, playerList) {

                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data":  {'error':err}
                    });
                } else {
                   
                    callback({
                        "response_code": 2000,
                        "response_message": "All player list by team id.",
                        "response_data": playerList
                    });

                }
        });
  
    },
    updateUserProfileImage: async (data, fileData, callback)=> {
        var folderpath = PATH_LOCATIONS.uploadProfilePicPath ;
        var file       = fileData.profile_image;
        var fileType   = file.mimetype;
        var fileSize   = file.size;
        var fileName   = `${Date.now()}_${file.name}`;

        if(fileType === "image/jpeg" || fileType === "image/jpg" || fileType === "image/png"){
            if(fileSize <= (1024*1024*3)){
                file.mv(folderpath + fileName, function (err) {
                    if (err) {
                        console.log('A file failed to process');
                        reject({
                            "response_code": 500,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data": err
                        })
                    } else {
                        UserSchema.updateOne(
                            {_id : data.id},
                            {$set:{
                                profile_image : fileName
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
                                        "response_message" :"Profile image update successfully",
                                        "response_code": 2000,
                                        "response_data": resUpdate
                                    });
                                }
                            }
                        );
                    }
                })
            }else{
                callback({
                    "response_code": 5005,
                    "response_message": "Accepted file size maximum 3MB",
                });
            }
        }else{
            callback({
                "response_code": 5005,
                "response_message": "Accepted file types jpeg, jpg, png",
            });
        }
    },

    addUpdatePlayerProfileImage: async (data, fileData, callback)=> {
        var folderpath = PATH_LOCATIONS.uploadProfilePicPath ;
        var file       = fileData.profile_image;
        var fileType   = file.mimetype;
        var fileSize   = file.size;
        var fileName   = `${Date.now()}_${file.name}`;

        if(fileType === "image/jpeg" || fileType === "image/jpg" || fileType === "image/png"){
            if(fileSize <= (1024*1024*3)){
                file.mv(folderpath + fileName, function (err) {
                    if (err) {
                        console.log('A file failed to process');
                        reject({
                            "response_code": 500,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data": err
                        })
                    } else {
                        UserSchema.updateOne(
                            {_id : data.player_id},
                            {$set:{
                                profile_image : fileName
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
                                        "response_message" :"Profile image update successfully",
                                        "response_code": 2000,
                                        "response_data": resUpdate
                                    });
                                }
                            }
                        );
                    }
                })
            }else{
                callback({
                    "response_code": 5005,
                    "response_message": "Accepted file size maximum 3MB",
                });
            }
        }else{
            callback({
                "response_code": 5005,
                "response_message": "Accepted file types jpeg, jpg, png",
            });
        }
    },
};
module.exports = UserModels2nd;

