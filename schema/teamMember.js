const mongoose =require ('mongoose');
const mongooseAggregatePaginate = require ('mongoose-aggregate-paginate');
const mongoosePaginate = require ('mongoose-paginate');

const teamMemberSchema =new mongoose.Schema({
    _id:{
        type : String,
        require : true 
    },
    team_id:{
        type : String,
        require : true,
        ref: 'team'
    },
    member_id : {
        type : String,
        require : true,
        ref: 'User'
    },
    member_type :{
        type : String,
        enum : ['PLAYER', 'NON-PLAYER'],
        default : 'PLAYER'
    },
    jersey_number: {
        type: Number,
        default: null
    },
    position: {
        type: String,
        default: null
    },
    manager_access:{
        type : Boolean,
        default : false
    }
}, {
    timestamps: true
});

teamMemberSchema.plugin(mongooseAggregatePaginate);
teamMemberSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('team-member',teamMemberSchema)