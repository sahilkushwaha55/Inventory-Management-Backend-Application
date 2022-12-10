const mongoose = require("mongoose");

const itemSchema = mongoose.Schema({
    productName : {
        type : String,
        required : [true,"Must have a unique Product name"],
        unique : true,
        trim : true
    },
    quantity : {
        type : Number,
        default : 0
    },
    stockPrice : {
        type : Number,
        required : [true, "Item stock Price required"]
    },
    sellPrice : {
        type : Number,
        required : [true, "Item sel price required"]
    },
    deleted : {
        type : Boolean,
        default : false
    }
}, {timestamps : true});

module.exports = mongoose.model("item", itemSchema);