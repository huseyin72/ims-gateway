const axios = require('axios');
const Producer = require('./producer');
const producer = new Producer();

const login = async (req,res,role) =>{
    try {
        const response = await axios.post(`http://localhost:3001/ims/auth-service/api/${role}/login`,req.body);
        //console.log(response.data);
        res.cookie('token',response.data.token,{httpOnly:true,secure:true});

        
        res.status(200).json({
            status:response.data.status,
            user:response.data.loggedUser,
            role:role,
            token:response.data.token

        })
    } catch (error) {
            res.status(401).json({
            error:error
        });
    }
}



//student login
exports.studentLogin = async(req,res) =>{
    try {
        const response = await axios.post('http://localhost:3001/ims/auth-service/api/login',req.body);
        res.cookie('token',response.data.token,{httpOnly:true,secure:true});
        res.status(200).json({
            status:'success',
            student:response.data.loggedStudent,
            role:'student',
            token:response.data.token


        })
    } catch (error) {
            res.status(401).json({
            error:error
        });
    }
}

//company login
exports.companyLogin = async(req,res) =>{

    await login(req,res,'company');
}

//coordinator login
exports.coordinatorLogin = async(req,res) =>{
    await login(req,res,'coordinator');
}

//secretariat login
exports.secretariatLogin = async(req,res) =>{
    await login(req,res,'secretariat');
}



//company register
exports.companyRegister = async (req,res) =>{
    try {
        const response = await axios.post(`http://localhost:3001/ims/auth-service/api/company/register`,req.body);
        //console.log(response)
        res.status(200).json({
            status:response.data.status,
            newCompany:response.data.newCompany

        })
        
    } catch (error) {
        
        res.status(400).json({
            error:error
        });
    }
}


// logout
exports.logout = async(req,res) =>{
    try {
    
        //inaktif token
        res.cookie('token', '', { httpOnly: true, maxAge: 0 });
        res.status(200).json({
            status:'success',
            message:"logout successfull"
        })
        
    } catch (error) {
        res.status(400).json({
            error:error
        });
    }
}






//get not approved list
exports.getNotApprovedList = async (req,res) =>{ 
    try {
        const response = await axios.get("http://localhost:3001/ims/auth-service/api/company/notApprovedList");
        //console.log(response);

        res.status(200).json({
            status:response.data.status,
            notApprovedCompanies:response.data.notApprovedCompanies
        })

    } catch (error) {
                
        res.status(400).json({
            error:error
        });
    }
}



//accept with rabbit mq
exports.evaluateRegistration = async (req,res) =>{
    //body = {companyMail:mail, karar:approve}
    try {
        const message = req.body

        await producer.publishMessage('notApprovedCompany',message)

        res.status(200).json({
            status:'success',
        });
    } catch (error) {
        res.status(400).json({
            error:error
        });
    }



}