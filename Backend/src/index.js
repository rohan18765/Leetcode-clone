const express = require('express')
const app = express();
require('dotenv').config();
const main =  require('./config/db')
const cookieParser =  require('cookie-parser');
const authRouter = require('./routes/userAuth.js');
const redisClient = require('./config/redis');
const problemRouter = require("./routes/problemroute.js");
const submitRouter = require("./routes/submit.js");
const aiRouter = require("./routes/aiChatting");
const cors = require('cors');
const videoRouter = require("./routes/videoCreator.js");

app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials :true 
}))

app.use(express.json());
app.use(cookieParser());

app.use('/user', authRouter);
app.use('/problem', problemRouter);
app.use('/submission' , submitRouter);
app.use('/ai', aiRouter);
app.use("/video" , videoRouter);
const InitializeConnection = async ()=>{
    try{

        await Promise.all([main(),redisClient.connect()]);
        console.log("DB Connected");

        const PORT = process.env.PORT || 4000;

        
        app.listen(PORT , ()=>{
            console.log("Server listening at port number: "+ PORT);
        })

    }
    catch(err){
        console.log("Error: "+err);
    }
}


InitializeConnection();

