var jwt = require('jsonwebtoken');

const path = "./config.env"
require('dotenv').config({path:path});


const checkRole = async (token) =>{


    //console.log(decoded);

    return decoded
}

exports.isCoordinator = async(req,res,next) =>{ 
    try {
        const token = req.cookies.token;
        if(!token){
            throw new Error('Authentication token not found');
        }
        const decoded = await jwt.verify(token,process.env.SECRET_KEY);
        const role = decoded.role
        console.log(role)
        if(role==='Coordinator'){
            console.log('here idiot');
            next();
        }else{ 
            throw new Error('no permission')
        }
        
    } catch (error) {
        res.status(401).json({ success: 'false' });
    }

}