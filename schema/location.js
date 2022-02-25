const mongoose=require('mongoose');
const mongoosePaginate=require('mongoose-paginate');
const mongooseAggregatePaginate=require('mongoose-aggregate-paginate');

const locationSchema = new mongoose.Schema({
    _id:{
        type    : String,
        require : true
    },
    locationName:{
        type    : String,
        default : null
    },
    link:{
        type    : String,
        default : null
    },
    address : {
        type    : String,
        default : null
    },
    note : {
        type    : String,
        default : null
    },
    lat : {
        type    : Number,
        default : null
    },
    long : {
        type    : Number,
        default : null
    },
});

mongoose.plugin(mongoosePaginate);
mongoose.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('locations',locationSchema)


