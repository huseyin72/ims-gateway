const axios = require('axios');
const Producer = require('./producer');
const producer = new Producer();
//const Consumer = require('./consumer');
//const consumer = new Consumer();

const login = async (req,res,role) =>{
    try {
        if(role ==="secretariat"){
            req.body.departmentMail = req.body.secretariatMail;
            delete req.body.secretariatmail;
            

        }
        const response = await axios.post(`http://localhost:3001/ims/auth-service/api/${role}/login`,req.body);
        console.log(response);
        if(role==='secretariat'){

            response.data.loggedUser[`${role}Name`] = response.data.loggedUser.firstName + ' ' + response.data.loggedUser.lastName
            console.log(response.data.loggedUser);
        }

        if(role==='coordinator'){

            response.data.loggedUser[`${role}Name`] = response.data.loggedUser.firstName + ' ' + response.data.loggedUser.lastName
            console.log(response.data.loggedUser);
        }
       
        //console.log(response.data);
        if(role==='company'){
            if(response.data.loggedUser.status==='not approved'){
                return res.status(402).json({
                    error:'Registration not approved yet'
                });
            }
        }
        res.cookie('token',response.data.token,{httpOnly:true,secure:true});

        if(role ==="secretariat"){
            console.log('here amk ')
            response.data.loggedUser.secretariatMail =  response.data.loggedUser.departmentMail;
            console.log(response.data.loggedUser.secretariatMail);
            delete response.data.loggedUser.departmentMail;

        }
        return res.status(200).json({
            status:response.data.status,
            user:response.data.loggedUser,
            role:role,
            token:response.data.token

        })
    } catch (error) {
            return res.status(401).json({
            error:error
        });
    }
}



//student login
exports.studentLogin = async(req,res) =>{
    try {
        //console.log()
        
        
        const response = await axios.post('http://localhost:3001/ims/auth-service/api/login',{email:req.body.studentMail,password:req.body.password});
        response.data.loggedStudent['studentName'] = response.data.loggedStudent.firstName + ' ' + response.data.loggedStudent.lastName

        res.cookie('token',response.data.token,{httpOnly:true,secure:true});
        res.status(200).json({
            status:'success',
            user:response.data.loggedStudent,
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
        var feedback;
        await producer.publishMessage('notApprovedCompany',message)
        await producer.consumeMessages('registrationDecisionBack','notApprovedCompanyBack',(content)=>{
            
            console.log('Received message from service:', content);
            console.log('********')
            feedback = content
            res.status(200).json({
                status:'success',
                feedback:feedback
            });
        })

    } catch (error) {
        res.status(400).json({
            error:error
        });
    }



}