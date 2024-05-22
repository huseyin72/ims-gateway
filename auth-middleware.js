const axios = require('axios');
var jwt = require('jsonwebtoken');

const path = "./config.env"
require('dotenv').config({path:path});



exports.checkAuth = async(req,res,next) =>{
    try {
        //console.log('here');
        //console.log(process.env.SECRET_KEY)
        const token = req.cookies.token;
        console.log(token);
        if(!token){
            throw new Error('Authentication token not found');
        }
        const decoded = await jwt.verify(token,process.env.SECRET_KEY);
        console.log(decoded);
        next();

    } catch (error) {
        res.status(401).json({ success: 'false' });
    }
}



