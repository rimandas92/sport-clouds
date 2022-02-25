const mongoose =require ('mongoose');
const mongooseAggregatePaginate = require ('mongoose-aggregate-paginate');
const mongoosePaginate = require ('mongoose-paginate');

const eventGameSchema =new mongoose.Schema({
    _id:{
        type : String,
        require : true 
    },
    name:{
        type : String,
        require : true
    },
    short_label:{
        type : String,
        require : null
    },
    team_id:{
        type : String,
        require : true,
        ref: 'team'
    },
    manager_id : {
        type : String,
        require : true,
        ref: 'User'
    },
    event_type :{
        type : String,
        enum : ['EVENT', 'GAME'],
        default : null
    },
    date: {
        type: Date,
        default: null
    },
    time: {
        startTime : {
            type: String,
            default: null
        },
        endTime : {
            type: String,
            default: null
        },
    },
    opponent: {
        type: String,
        default: null
    },
    location: {
        type: String,
        default: null
    },
    location_details: {
        type: String,
        default: null
    },
    home_or_away: {
        type : String,
        enum : ['HOME', 'AWAY'],
        default : null
    },
    uniform: {
        type: String,
        default: null
    },
    arrival_time: {
        type: String,
        default: null
    },
    extra_label: {
        type: String,
        default: null
    },
    notes: {
        type: String,
        default: null
    },
    assignment: {
        type: String,
        default: null
    },
   
    notify_team:{
        type: Boolean,
        default: false
    },
    display_icon:{
        type: String,
        require : true,
        ref: 'flag-icons'
    }
},{
    timestamps:true
});

eventGameSchema.plugin(mongooseAggregatePaginate);
eventGameSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('events_and_games',eventGameSchema)