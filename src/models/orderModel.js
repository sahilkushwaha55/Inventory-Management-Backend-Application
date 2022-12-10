const mongoose = require("mongoose");

const orderSchema = mongoose.Schema({
    invoiceNumber : {
        type : String,
        required : [true,"Invoice Number required"],
        unique : true,
        trim : true
    },
    customerName : {
        type : String,
        required : [true,"Cunstomer name required"],
        trim : true
    },
    customerFullAddress : {
        type : String,
        required : [true, "Customer Address required"],
        trim : true
    },
    orderLineItems : {
        type : [mongoose.Schema.Types.ObjectId],
        ref : "orderLineItem",
        required : [true, "Must have ordrLineId"],
    },
    date : {
        type : Date,
        required : [true, "Date required"]
    }
}, { timestamps : true});

module.exports = mongoose.model("order",orderSchema);