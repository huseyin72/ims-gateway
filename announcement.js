const Producer = require('./producer');
const producer = new Producer();
const consumer = require('./consumer');




exports.companyCreateInternshipAnnouncement = async (req,res) =>{ 
    const msg = req.body;
    await producer.publishMessage('company.internship-announcements.create',msg)
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

exports.getInternshipAnnouncement = async (req,res) =>{ 
    const msg = req.body;
    await producer.publishMessage('company.internship-announcements.get',msg)
    await consumer.consumeMessages('company.internship-announcements.get')
    
}