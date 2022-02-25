const mongoose = require ('mongoose');
const mongooseAggregatePaginate= require ('mongoose-aggregate-paginate');
const mongoosePaginate= require ('mongoose-paginate');

const teamStoreSchema = new mongoose.Schema({
    _id:{
        type : String , 
        require  : true
    },
    team_id: {
        type: String,
        default: null
    },
    manager_id: {
        type: String,
        default: null
    },
    image: {
        type: String,
        default: null
    },
    name: {
        type: String,
        default: null
    },
    jersey_number: {
        type: Number,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    price: {
        type: Number,
        default: null
    },
    brand: {
        type: String,
        default: null
    },
    color: {
        type: String,
        default: null
    },
    material: {
        type: String,
        default: null
    },
    size: {
        type: String,
        default: null
    },
});
mongoose.plugin(mongooseAggregatePaginate);
mongoose.plugin(mongoosePaginate);
module.exports = mongoose.model ('teamStore',teamStoreSchema); 