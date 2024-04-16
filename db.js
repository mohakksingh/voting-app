const mongoose = require("mongoose");
require('dotenv').config()

const mongoUrl=process.env.MONGODB_URL
mongoose.connect(mongoUrl);

const db=mongoose.connection

db.on('connected',()=>{
    console.log('connected to mongo db');
})
db.on('error',()=>{
    console.log('error in mongo db');
})
db.on('disconnected',()=>{
    console.log('disconnected to mongo db');
})

module.exports=db;