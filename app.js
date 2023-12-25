const express = require('express');
const app = express();

const cookieParser = require("cookie-parser");
const bodyParser = require('body-parser')
const mongoose = require('mongoose')

var cors = require('cors')
require('./models/User')
require('dotenv').config();

app.use(bodyParser.json())

app.use(cookieParser());

app.use(cors())
     

mongoose.connect(process.env.DATABASE_URL,{
}).then(()=>{
    console.log("MongoDb Connected")
}).catch((err)=>{
    console.log(err)
})

//Import the routes
const userRoutes = require("./routes/User")
const ownerRoutes = require("./routes/Owner")
const pitchRoutes = require("./routes/Pitch")

//Using routes  
app.use("/user",userRoutes)
app.use("/owner",ownerRoutes)
app.use("/pitch",pitchRoutes)

    

const port = process.env.PORT || 3000;


app.listen(port,()=>{
    console.log(`Server Running On ${port}`)
})