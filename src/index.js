const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const router = require("./routes/route");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
dotenv.config({path : 'config.env'});

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_CLUSTER,{ useNewUrlParser : true })
.then(() => console.log("Mongodb connected"))
.catch(err => console.log(err));

app.use("/",router)

app.listen(process.env.PORT,() =>{
    console.log("App running on port " + process.env.PORT)
})