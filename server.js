const express=require('express')
const app=express()
const db=require('./db')
require('dotenv').config()

const bodyParser=require('body-parser')
app.use(bodyParser.json())
const PORT= process.env.PORT || 3000

//router files
const userRoutes=require('./routes/userRoutes')
const candidateRoutes=require('./routes/candidateRoutes')

//use the routers
app.use('api/user',userRoutes)
app.use('api/candidates',candidateRoutes)

app.listen(PORT,()=>{
    console.log("listening on port 3000");
})