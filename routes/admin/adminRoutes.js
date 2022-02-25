'use strict';
var express = require("express");
var adminService = require('../../services/adminService');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var secretKey = config.secretKey;
var admin = express.Router();
admin.use(express.json());

admin.post('/adminSignup', function (req, res) {
    var adminData = req.body;
    adminService.adminSignup(adminData, function (response) {
        res.send(response);
    });
});
admin.post('/adminLogin', function (req, res) {
    var adminData = req.body;
    adminService.adminLogin(adminData, function (response) {
        res.send(response);
    });
});
admin.post('/adminForgotPassword', function (req, res) {
    var adminData = req.body;
    adminService.adminForgotPassword(adminData, function (response) {
        res.send(response);
    });
});



/******************************
 *  Middleware to check token
 ******************************/
admin.use(function (req, res, next) {
    var token = req.body.token || req.query.token || req.headers['x-access-token'];
    if (token) {
        jwt.verify(token, secretKey, function (err, decoded) {
            if (err) {
                res.send({
                    STATUSCODE: 4002,
                    success: false,
                    error: true,
                    message: "Failed to authenticate or token expired."
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {
        res.send({
            success: false,
            error: true,
            message: "Please provide token"
        });
    }
});
/******************************
 *  Middleware to check token
 ******************************/


admin.post('/adminChangePassword', function (req, res) {
    adminService.adminChangePassword(req.body, function (response) {
        res.send(response);
    });
});
admin.post('/create-organizer', function (req, res) {
    adminService.createOrganizer(req.body, function (response) {
        res.send(response);
    });
});
admin.post('/create-team', function (req, res) {
    adminService.createTeam(req.body, function (response) {
        res.send(response);
    });
});
// add  flage icon  for team schedule 
admin.post('/add-flag-icon', function (req, res) {
    adminService.addFlagIcon(req.body, req.files,function (response) {
        res.json(response);
    });
});
admin.post('/update-flag-icon', function (req, res) {
    adminService.updateFlagIcon(req.body, req.files,function (response) {
        res.json(response);
    });
});





// ************************Term and conition***************************************************//

admin.post('/add-term-condition', function (req, res) {
    gymService.addTermAndConditionService(req.body, function (response) {
        res.send(response);
    })
})

admin.get('/list-term-condition', function (req, res) {
    gymService.listTermAndConditionService(req.query, function (response) {
        res.send(response);
    })
})

admin.post('/update-term-condition', function (req, res) {
    gymService.updateTermAndConditionSercice(req.body, function (response) {
        res.send(response);
    })
})

// ***********************FAQ Routes*****************************************//


admin.post('/add-faq', function (req, res) {
    gymService.addFaq(req.body, function (response) {
        res.send(response);
    })
})

admin.get('/list-faq', function (req, res) {
    gymService.listFaq(req.query, function (response) {
        res.send(response);
    })
})

admin.post('/update-faq', function (req, res) {
    gymService.updateFaq(req.body, function (response) {
        res.send(response);
    })
})

admin.post('/delete-faq', function (req, res) {
    gymService.deleteFaq(req.body, function (response) {
        res.send(response);
    })
})

// ***********************Admin contact us details add********************************//

admin.post('/add-admin-contact', function (req, res) {
    gymService.addAdminContact(req.body, function (response) {
        res.send(response);
    })
})

admin.post('/update-admin-contact', function (req, res) {
    gymService.updateAdminContact(req.body, function (response) {
        res.send(response);
    })
})
admin.get('/list-admin-contact', function (req, res) {
    gymService.listAdminContact(req.query, function (response) {
        res.send(response);
    })
})



module.exports = admin;