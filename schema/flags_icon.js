const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
const mongoosePaginate = require ('mongoose-paginate');
const flagIconSchema = new mongoose.Schema({
    _id:{
        type : String,
        require : true 
    },
    name:{
        type : String,
        default : null
    },
    image:{
        type : String,
        default : null
    }
},{
    timestamps:true
});

mongoose.plugin(mongooseAggregatePaginate);
mongoose.plugin(mongoosePaginate);
module.exports = mongoose.model('flag-icons',flagIconSchema);



