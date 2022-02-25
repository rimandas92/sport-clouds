var AdminNotificationSchema = require('../schema/admin_notification');
var async = require("async");
var mongo = require('mongodb');
var ObjectID = mongo.ObjectID;
var config = require('../config');
var NotificationModels = {

    addNotification: function (data, callback) {
        if (data) {
            new AdminNotificationSchema(data).save(function (err, result) {
                if (err) {
                    callback({
                        "response_code": 5005,
                        "response_message": "INTERNAL DB ERROR",
                        "response_data": {}
                    });
                } else {
                    callback({
                        "response_code": 2000,
                        "response_message": "Notification has been added",
                        "response_data": {}
                    });
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
    //Admin Notification List
    listAdminNotification: async function (data, callback) {


        var page = 1,
            limit = 20,
            query = {};

        if (data.page) {
            page = parseInt(data.page);
        }
        if (data.limit) {
            limit = parseInt(data.limit);
        }
        if (data._id) {
            query['_id'] = data._id;

            await AdminNotificationSchema.updateOne({
                _id: data._id
            }, {
                $set: {
                    read_status: 'yes',
                }
            });
        }

        var aggregate = AdminNotificationSchema.aggregate();
        aggregate.match(query);

        aggregate.lookup({
            from: 'users',
            localField: 'user_id',
            foreignField: '_id',
            as: 'user'
        });

        aggregate.project({
            _id: 1,
            title: 1,
            message: 1,
            read_status: 1,
            user_type: 1,
            order: {
                $cond: {
                    if: {
                        $eq: ["$read_status", 'yes']
                    },
                    then: 2,
                    else: 1
                }
            },
            createdAt: 1,
            user_details: {
                '$arrayElemAt': [
                    [{
                        _id: {
                            '$arrayElemAt': ['$user._id', 0]
                        },
                        name: {
                            '$arrayElemAt': ['$user.name', 0]
                        },
                        type: {
                            '$arrayElemAt': ['$user.type', 0]
                        },
                        profile_image: {
                            $cond: {
                                if: {
                                    $in: ["NORMAL", "$user.type"]
                                },
                                then: {
                                    $cond: {
                                        if: {
                                            $in: [null, "$user.profile_image"]
                                        },
                                        then: config.liveUrl + config.userDemoPicPath,
                                        else: {
                                            $concat: [config.liveUrl, {
                                                "$arrayElemAt": ["$user.profile_image", 0]
                                            }]
                                            // "$arrayElemAt": ["$User.profile_image", 0]
                                        }
                                    }

                                },
                                else: {
                                    $cond: {
                                        if: {
                                            $eq: [{
                                                '$arrayElemAt': ['$user.socialLogin.image', 0]
                                            }, null]
                                        },
                                        then: config.liveUrl + config.userDemoPicPath,
                                        else: {
                                            '$arrayElemAt': ['$user.socialLogin.image', 0]

                                        }
                                    }
                                }
                            }
                        },

                    }], 0
                ]
            },

        });
        aggregate.sort({
            createdAt: -1,
            'order': 1
        })
        var options = {
            page: page,
            limit: limit
        }

        AdminNotificationSchema.aggregatePaginate(aggregate, options, async function (err, results, pageCount, count) {
            if (err) {
                callback({
                    "response_code": 5005,
                    "response_message": err,
                    "response_data": {}
                });

            } else {


                let total_unread_msg = await AdminNotificationSchema.find({
                    read_status: 'no'
                }).exec(function (err, result) {
                    if (err) {
                        callback({
                            "response_code": 5005,
                            "response_message": err,
                            "response_data": {}
                        });

                    } else {


                        var data = {
                            docs: results,
                            total_unread_msg: result.length,
                            pages: pageCount,
                            total: count,
                            limit: limit,
                            page: page
                        }
                        callback({
                            "response_code": 2000,
                            "response_message": "Admin Notification list.",
                            "response_data": data
                        });
                    }
                })



                // var data = {
                //     docs: results,
                //     total_unread_msg: total_unread_msg.length,
                //     pages: pageCount,
                //     total: count,
                //     limit: limit,
                //     page: page
                // }
                // callback({
                //     "response_code": 2000,
                //     "response_message": "Admin Notification list.",
                //     "response_data": data
                // });

            }
        });
    },
    //Delete Admin Notification
    deleteAdminNotification: async function (data, callback) {
        if (data) {

            AdminNotificationSchema.findOne({
                    _id: data._id
                },
                function (err, result) {
                    if (err) {
                        callback({
                            "response_code": 5005,
                            "response_message": "INTERNAL DB ERROR",
                            "response_data": {}
                        });
                    } else {
                        if (result == null) {
                            callback({
                                "response_code": 2008,
                                "response_message": "Notification not exist",
                                "response_data": result
                            });
                        } else {
                            AdminNotificationSchema.remove({
                                _id: data._id
                            }, function (err, result) {
                                if (err) {
                                    callback({
                                        "response_code": 5005,
                                        "response_message": "INTERNAL DB ERROR",
                                        "response_data": err
                                    });
                                } else {
                                    callback({
                                        "response_code": 2000,
                                        "response_message": "Admin Notification deleted."
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


}
module.exports = NotificationModels;