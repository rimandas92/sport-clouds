const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const mongoosePaginate = require ('mongoose-paginate');
const playerInvitationSchema = new mongoose.Schema({
    _id:{
        type : String,
        require : true 
    },
    team_id:{
        type : String,
        require : true ,
        ref : 'team'
    },
    manager_id:{
        type : String,
        require : true ,
        ref : 'User'
    },
    player_id:{
        type : String,
        require : true ,
        ref : 'User'
    },
    invitation_status:{
        type : String,
        require : true ,
        enum: ['ACCEPTED','REJECTED', 'NONE'],
        default: 'NONE'
    }
},{
    timestamps:true
});

mongoose.plugin(mongooseAggregatePaginate);
mongoose.plugin(mongoosePaginate);
module.exports = mongoose.model('player-invitation',playerInvitationSchema);



