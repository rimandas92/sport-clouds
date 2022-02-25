var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var Schema = mongoose.Schema;
var userScema = new Schema({
    _id: {
        type: String,
        required: true
    },
    user_type: {
        type: String,
        enum: ['player','manager','organizer'],
        default: ''
    },
    manager_id:{
        type: String,
        default: null,
        ref: "User"
    },
    fname: {
        type: String,
        default: null
    },
    lname: {
        type: String,
        default: null
    },
    team_name: {
        type: String,
        default: null
    },
    email: {
        type: String,
        default: null
    },
    sports: {
        type: String,
        default: null
    },
    parent_name: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: ''
    },
    
    profile_image: {
        type: String,
        default: null
    },
    profile_image_updated: {
        type: Boolean,
        enum: [true, false],
        default: false
    },
    type: {
        type: String,
        enum: ['FACEBOOK', 'GOOGLE', 'NORMAL'],
        default: 'NORMAL'
    },
    devicetoken: {
        type: String,
        default: null
    },
    apptype: {
        type: String,
        enum: ['IOS', 'ANDROID', 'BROWSER',null],
        default: null
    },
    is_blocked: {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
    },
    email_verify: {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
    },
    forgot_password_otp: {
        type: String,
        default : null
    },
    otp: {
        type: String,
        default : null
    },
    phone: {
        type: Number,
        default : null
    },
    alternative_phone: {
        type: Number,
        default : null
    },
    address_line_one: {
        type: String,
        default : null
    },
    address_line_two: {
        type: String,
        default : null
    },
    city: {
        type: String,
        default : null
    },
    state: {
        type: String,
        default : null
    },
    zip: {
        type: Number,
        default : null
    },
    country: {
        type: String,
        default : null
    },
    dob: {
        type: Date,
        default : null
    },
    gender: {
        type: String,
        enum: ['MALE', 'FEMALE'],
        default: null
    },
    hide_age : {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
    },
    email_is_private : {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
    },
    phone_is_private : {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
    },
    alternative_phone_is_private : {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
    },
    address_is_private : {
        type: String,
        enum: ['yes', 'no'],
        default: 'no'
    },
    jersey_number: {
        type: Number,
        default: null
    },
    position: {
        type: String,
        default: null
    },
    family_member:[{
            _id:{
                type:String,
                require : require
            },
            name:{
                type:String,
                default: null
            },
            email:{
                type:String,
                default: null
            },
            phone:{
                type:Number,
                default: null
            },
            relation:{
                type:String,
                default: null
            }
    }]


}, {
    timestamps: true
});
userScema.pre('save', function (next) {
    var user = this;
    if (!user.isModified('password'))
        return next();

    const saltRounds = 10;
    bcrypt.hash(user.password, saltRounds, function (err, hash) {
        // Store hash in your password DB.
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
});
userScema.plugin(mongoosePaginate);
userScema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('User', userScema);