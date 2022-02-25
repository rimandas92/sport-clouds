const mongoose=require('mongoose');
const mongoosePaginate=require('mongoose-paginate');
const mongooseAggregatePaginate=require('mongoose-aggregate-paginate');

const userFileUploadSchema = new mongoose.Schema({
    _id:{
        type    : String,
        require : true
    },
    album_id:{
        type    : String,
        require : true,
        ref     :  'albums'
    },
    user_id:{
        type    : String,
        require : true,
        ref     :  'User'
    },
    title:{
        type    : String,
        default : null
    },
    file_type :{
        type    : String,
        enum    : ['VIDEO','IMAGE','FILE',null],
        default : null
    },
    file : {
        type    : String,
        default : null
    }
});

mongoose.plugin(mongoosePaginate);
mongoose.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('user_file_uploads',userFileUploadSchema)


