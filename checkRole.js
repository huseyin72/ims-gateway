var jwt = require('jsonwebtoken');

const path = "./config.env"
require('dotenv').config({path:path});


const checkRole = async (token) =>{


    //console.log(decoded);

    return decoded
}


const isFnc = async (req,res,next,role) =>{
    const token = req.cookies.token;
    if(!token){
        throw new Error('Authentication token not found');
    }
    const decoded = await jwt.verify(token,process.env.SECRET_KEY);
    console.log(decoded.role)
    if(decoded.role===role){
        console.log('here idiot');
        next();
    }else{ 
        throw new Error('no permission')
    }
    

}




exports.isCoordinator = async(req,res,next) =>{ 
    try {
        await isFnc(req,res,next,'Coordinator')
    } catch (error) {
        res.status(401).json({ success: 'false' });
    }

}

exports.isStudent = async(req,res,next) =>{ 
    try {
        await isFnc(req,res,next,'Student')
    } catch (error) {
        res.status(401).json({ success: 'false' });
    }

}

exports.isCompany = async(req,res,next) =>{ 
    try {
        console.log('ananı sikerim gir ')
        await isFnc(req,res,next,'Company')
    } catch (error) {
        res.status(401).json({ success: 'false' });
    }

}

exports.isSecretariat = async(req,res,next) =>{ 
    try {
        await isFnc(req,res,next,'Department Secretariat')
    } catch (error) {
        res.status(401).json({ success: 'false' });
    }

}