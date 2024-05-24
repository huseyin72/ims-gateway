const Producer = require('./producer');
const producer = new Producer();
//const consumer = require('./consumer');
const { v4: uuidv4 } = require('uuid');


//create internship
exports.companyCreateInternshipAnnouncement = async (req,res) =>{ 
    try {
        const msg = req.body;
        await producer.publishMessage('company.internship-announcements.create',msg)
        await producer.consumeMessages()
    } catch (error) {
        
    }

}

exports.companyUpdateInternshipAnnouncement = async (req,res) =>{ 
    const msg = req.body;
    await producer.publishMessage('company.internship-announcements.update',msg)
}

exports.companyDeleteInternshipAnnouncement = async (req,res) =>{ 
    const msg = req.body;
    await producer.publishMessage('company.internship-announcements.delete',msg)
}

exports.adminApproveAnnouncement = async (req,res) =>{ 
    const msg = req.body;
    await producer.publishMessage('admin.waiting-announcements.approve',msg)
}

exports.adminRejectAnnouncement = async (req,res) =>{ 
    const msg = req.body;
    await producer.publishMessage('admin.waiting-announcements.reject',msg)
}


// get one internship
exports.getInternshipAnnouncement = async (req,res) =>{ 
    try {
        console.log('here')
        const msg = req.body;
        const uuid = uuidv4();  // UUID oluştur
        console.log(uuid);
        const messageWithUuid = { ...msg, uuid };  // Mesaja UUID'yi ekle
        console.log(messageWithUuid);
        await producer.publishMessage('company.internship-announcements.get',messageWithUuid)
        await producer.consumeMessages('announcementsBack','company.internship-announcements.getBack',(content) =>{
            console.log(content);
            
            if(content.message.uuid === uuid){
                console.log('content back')
                console.log(content)
                res.status(200).json({ 
                    status:'success',
                    message:content.message
                })
                
            }

        })
        //await consumer.consumeMessages('get.internship-announcements.get')
        
    } catch (error) {
        res.status(400).json({
            status:'error',
            error:error

        })
        
    }

}