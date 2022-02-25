const mongoose =require ('mongoose');
const mongooseAggregatePaginate = require ('mongoose-aggregate-paginate');
const mongoosePaginate = require ('mongoose-paginate');
const teamSchema = new mongoose.Schema({
    _id:{
        type : String,
        require : true 
    },
    team_manager_id:{
        type : String,
        require : true,
    },
    team_name : {
        type : String,
        require : true
    },
    sports : {
        type : String,
        require : false,
        default :null
    },
    time_zone : {
        type : String,
        require : false,
        default :null
    },
    country : {
        type : String,
        require : false,
        default :null
    },
    zip : {
        type : String,
        require : false,
        default :null
    },
    language : {
        type : String,
        require : false,
        default :null
    },
    uniqueCode:{
        type : String,
        require : true,
    },
    image:{
        type : String,
        require : false,
        default :null
    }
},{
    timestamps:true
});

teamSchema.plugin(mongooseAggregatePaginate);
teamSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('team', teamSchema);


