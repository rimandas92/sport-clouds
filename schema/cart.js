const mongoose =require ('mongoose');
const mongooseAggregatePaginate = require ('mongoose-aggregate-paginate');
const mongoosePaginate = require ('mongoose-paginate');

const cartSchema =new mongoose.Schema({
    _id:{
        type : String,
        require : true 
    },
    product_id:{
        type : String,
        ref: 'teamStore'
    },
    manager_id: {
        type : String,
        ref: 'User'
    },
    user_id : {
        type : String,
        require : true,
        ref: 'User'
    },
    number_of_product : {
        type : Number,
        default:1
    },

}, {
    timestamps: true
});

cartSchema.plugin(mongooseAggregatePaginate);
cartSchema.plugin(mongoosePaginate);
module.exports = mongoose.model('cart',cartSchema)