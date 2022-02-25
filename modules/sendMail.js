var nodemailer = require('nodemailer');
var config = require('../config');
//var pdf = require('html-pdf');
//var adminLoginNotification = require('./userLoginHtml');

module.exports = function (mailType) {

    var from = config.email.MAIL_USERNAME; // set default mail here

    // define mail types
    var mailDict = {
        "welcomeMail": {
            subject: "Welcome To Fit Trip",
            html: require('./welcomeUser'),
        },
        "sendOTPdMail": {
            subject: "OTP verification mail",
            html: require('./otpMail'),
        },
        "forgotPasswordOtpMail": {
            subject: "Forget password OTP verification mail",
            html: require('./forgotPasswordOtp'),
        },
      
        "changePassword": {
            subject: "Change  password mail",
            html: require('./changePassword'),
        },

        "forgotPasswordMail": {
            subject: "Reset password",
            html: require('./forgotPasswordMail'),
        },
        "organizerWelcomeMail": {
            subject: "Welcome to sports Cloud",
            html: require('./organizerWelcomeMail'),
        },
        "managerAddPlayerToRoster": {
            subject: "Welcome to sports Cloud",
            html: require('./managerAddPlayerToRoster'),
        },
           // "emailVerificationMail": {
        //     subject: "Email Verification ",
        //     html: require('./emailVerificationMail'),
        // },
        // define one mail for each type of case here
    }
    // create reusable transporter object using the default SMTP transport to send mail from this account
    var secretPass = config.email.MAIL_PASS;
    var transporter = nodemailer.createTransport(require('nodemailer-smtp-transport')({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        debug: true,
        auth: {
            user: config.email.MAIL_USERNAME,
            pass: Buffer.from(secretPass, 'base64').toString('ascii'),
            //xoauth2 : "U01UQ0tHczZuaVZGWUJnQ3BpbU5CQTVDWWwzYU1oNnJoNU9iMDFSVk5LMSszSURRY3pkTVVuOXo5WlJXMWpOc1o3YkhOc0kvMnBrPQ=="
        },
        maxMessages: 100,
        requireTLS: true,
    }));
    return function (to, data, sendPdf, pdfTemplate, multiUser) { // pass mailbody only when sendPdf is true
        var self = {
            send: function () {
                var mailOptions = mailDict[mailType];
                mailOptions.from = from;
                mailOptions.to = to; // to;
                mailOptions.html = self.handleVars(mailOptions.html, data);
                if (sendPdf) {
                    pdf.create(self.handleVars(pdfTemplate, data)).toBuffer(function (err, b) {
                        // template becomes pdf so pass mailbody
                        mailOptions.attachments = [{
                            filename: 'Monthly Statement.pdf',
                            contentType: 'application/pdf',
                            content: b
                        }];
                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log('Error sending mail');
                                console.log(error);
                                return;
                            }

                            console.log('Message sent with pdf: ' + info.response);
                        });
                    })
                } else if (multiUser) {
                    mailist = to;
                    mailist.forEach(function (mailid, index) {

                        mailOptions.to = mailid;

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log('Error sending mail');
                                console.log(error);
                                return;
                            }
                            console.log('Message sent: ' + info.response);
                        });
                    });


                } else {
                    // send mail with defined transport object
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log('Error sending mail');
                            console.log(error);
                            return;
                        }
                        console.log('Message sent: ' + info.response);
                    });
                }
            },
            transporter: transporter,
            getMappedValue: function (s, o) { // cannot handle arrays
                var l = s.split(".");
                var r = o;
                if (l.length > 0) {
                    l.forEach(function (v, i) {
                        if (v && r[v] !== undefined) {
                            r = r[v];
                        }
                    })
                    return r;
                }
                return undefined;
            },
            handleVars: function (html, o) {
                (html.match(/\{\{\s+([^}]*)\s+\}\}/g) || []).forEach(function (w, i) {
                    var s = w.replace(/^\{\{\s+/, "").replace(/\s+\}\}$/, "");
                    var v = self.getMappedValue(s, o);

                    // handle special cases that need processing
                    // date
                    if (s === 'publishedDate' && v != undefined) {
                        // locale format date
                        v = new Date(v).toString();
                    }
                    if (s === '@validUpto' && v === null) {
                        v = 'NA';
                    }
                    if (s === '@userTotalSpace' && v === null) {
                        v = 0;
                    }
                    if (s === '@userFreeSpace' && v === null) {
                        v = 0;
                    }
                    if (s === '@currentPlan' && v === null) {
                        v = 'Freedom';
                    }
                    if (s === '@userJunkSpace' && v === null) {
                        v = 0;
                    }
                    // replace
                    if (v !== undefined) {
                        html = html.replace(w, String(v));
                    }
                })
                return html;
            },
        };
        return self;
    }
}
// usage
// require("./modules/sendmail")('userSignupSuccess')("to@to.to", data).send();