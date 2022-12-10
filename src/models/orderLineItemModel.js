const mongoose = require("mongoose");

const orderLineSchema = mongoose.Schema({
    productName : {
        type : String,
        required : [true,"Product name required"],
        trim : true
    },
    quantity : {
        type : Number,
        required : [true,"Product quantity required"]
    },
    sellPrice : {
        type : Number,
        required : [true,"Producted sell price required"]
    },
    deleted : {
        type : Boolean,
        default : false
    }
}, { timestamps : true});

module.exports = mongoose.model("orderLineItem",orderLineSchema);