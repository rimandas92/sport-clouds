const mongoose =require ('mongoose');
const mongooseAggregatePaginate = require ('mongoose-aggregate-paginate');
const mongoosePaginate = require ('mongoose-paginate');

const albumSchema =new mongoose.Schema({
    _id:{
        type : String,
        require : true 
    },
    name:{
        type : String,
        require : true
    } ,
    team_manager_id:{
        type : String,
        require : true,
    },
    team_id:{
        type : String,
        require : true,
        ref: 'team'
    },   
}, {
    timestamps: true
});

albumSchema.plugin(mongooseAggregatePaginate);
albumSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('albums',albumSchema)