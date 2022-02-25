const mongoose =require ('mongoose');
const mongooseAggregatePaginate = require ('mongoose-aggregate-paginate');
const mongoosePaginate = require ('mongoose-paginate');

const scoreKeeperSchema =new mongoose.Schema({
    _id:{
        type : String,
        require : true 
    },
    game_event_id:{
        type : String,
        require : true,
        ref: 'events_and_games'
    },
    player_id : {
        type : String,
        require : true,
        ref: 'User'
    },
    availability :{
        type : String,
        enum : ['MAYBE', 'GOING', 'NO',''],
        default : ''
    },
    points_2: {
        type: Number,
        default: null
    },
    points_3: {
        type: Number,
        default: null
    },
    free_throw: {
        type: Number,
        default: null
    },
    member_type :{
        type : String,
        enum : ['PLAYER', 'NON-PLAYER'],
        default : 'PLAYER'
    },
}, {
    timestamps: true
});

scoreKeeperSchema.plugin(mongooseAggregatePaginate);
scoreKeeperSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('availability_and_score_keepers',scoreKeeperSchema)