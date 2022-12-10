const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;

const grnSchema = mongoose.Schema({
    invoiceNumber : {
        type : String,
        required : [true,"Must have a invoice number"],
        unique : true,
        trim : true
    },
    vendorName : {
        type : String,
        required : [true,"Vendor name is required"]
    },
    vendorFullAddress : {
        type : String,
        required : [true, "Vendor address is required"]
    },
    grnLineItems :{type : [ObjectId], ref : "grnLineItem", required : [true, "Must have grnItemId"]},
    status : {
        type : String,
        enum : ["GENERATED","COMPLETED", "CANCELLED"],
        required : true,
        default : "GENERATED"
    },
    date : {
        type : Date,
        required : [true, "Date required"]
    }
}, { timestamps : true});

module.exports = mongoose.model("grn",grnSchema);