const mongoose=require('mongoose');
const mongoosePaginate=require('mongoose-paginate');
const mongooseAggregatePaginate=require('mongoose-aggregate-paginate');

const tournamentSchema = new mongoose.Schema({
    _id:{
        type    : String,
        require : true
    },
    name:{
        type    : String,
        default : null
    },
    division:{
        type    : String,
        default : null
    },
    sports : {
        type    : String,
        default : null
    },
    startDate:{
        type    : Date,
        default : null
    },
    gameType:{
        type    : String,
        default : null
    },
    numberOfGames:{
        type    : Number,
        default : null
    },
    gameClockStops:{
        type    : String,
        default : null
    },
    ageGrade:{
        type    : String,
        default : null
    },
    quaters:{
        type    : String,
        default : null
    },
    halves:{
        type    : String,
        default : null
    },
    autoConfiguration:{
        type    : String,
        enum    : ['ON','OFF',''],
        default : ''
    },
    teamEntryFee:{
        type    : Number,
        default : null
    },
    playerType:{
        type    : String,
        default : null
    },
    preSale:{
        type    : Date,
        default : null
    },
    onlineRegistration:{
        type    : String,
        enum    : ['ON','OFF',''],
        default : ''
    },
    registrationStartDate:{
        type    : Date,
        default : null
    },
    registrationEndDate:{
        type    : Date,
        default : null
    },
    location:{
        lat :  {
            type    : Number,
            default : null
        },
        long : {
            type    : Number,
            default : null
        },
    },
    availableCourts:{
        type    : Number,
        default : null
    },
    refs:{
        type    : Number,
        default : null
    },

    scoreKeepers:{
        type    : Number,
        default : null
    },

    operationalStaff:{
        type    : String,
        default : null
    }, 
   
});

mongoose.plugin(mongoosePaginate);
mongoose.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('tournaments',tournamentSchema)


