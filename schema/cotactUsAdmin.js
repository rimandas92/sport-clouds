var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var mongooseAggregatePaginate = require('mongoose-aggregate-paginate');
var adminContactSchema = new Schema({

    _id: {
        type: String,
        require: true
    },
    email: {
        type: String,
        required: true
    },
    phone_no: {
        type: String,
        required: true
    }

}, {
    timestamps: true
});

adminContactSchema.plugin(mongoosePaginate);
adminContactSchema.plugin(mongooseAggregatePaginate);
module.exports = mongoose.model('admin-contact', adminContactSchema);