const mongoose = require("mongoose");

const grnLineItemSchema = mongoose.Schema({
    productName : {
        type : String,
        required : [true,"Product Name required"]
    },
    quantity : {
        type : Number,
        default : 0
    },
    stockPrice : {
        type : Number,
        default : 0
    },
    deleted : {
        type : Boolean,
        default : false
    }
}, { timestamps : true});

module.exports = mongoose.model("grnLineItem",grnLineItemSchema);