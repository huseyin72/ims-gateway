const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const path = "./config.env"
require('dotenv').config({path:path});


// initialize app
const app = express();


//cors options
const corsOptions = {
    origin: 'http://localhost:3001', // Sadece React uygulamasının URL'si
    optionsSuccessStatus: 200, // İsteğin başarı durumu
    credentials: true, // Kimlik bilgilerini kabul et
  };

app.use(cors(corsOptions)); // CORS ayarlarını kullan




//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//cookie parser
app.use(cookieParser());

const router = require('./routes');

//login
app.use('/ims',router);




//404 not found
app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!")
})



app.listen(process.env.PORT,() =>{
    console.log(`listenin on port ${process.env.PORT}`);
})