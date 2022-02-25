const  mongoose = require('mongoose');
const  mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const  mongoosePaginate = require('mongoose-paginate');

const assignmentSchema = new mongoose.Schema({
    _id:{
        type : String ,
        require : true
    },
    date:{
        type : Date ,
        default : null
    },
    time:{
        type : String ,
        default : null
    },
    assignment:{
        type : String ,
        default : null
    },
    game_event_id:{
        type : String ,
        default : null,
        ref: 'events_and_games'
    },
    location:{
        type : String ,
        default : null
    },
    volunteer:{
        type : String ,
        default : null,
        ref: 'User'
    },
    assigner_id:{
        type : String ,
        default : null,
        ref: 'User'
    }
})

mongoose.plugin (mongooseAggregatePaginate);
mongoose.plugin(mongoosePaginate);
module.exports = mongoose.model('assignments',assignmentSchema)