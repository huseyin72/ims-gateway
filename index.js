const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const amqp = require('amqplib/callback_api');
const checkRole = require('./checkRole');


const path = "./config.env"
require('dotenv').config({path:path});


// initialize app
const app = express();


//cors options
const corsOptions = {
    origin: 'http://localhost:5173', // Sadece React uygulamasının URL'si
    optionsSuccessStatus: 200, // İsteğin başarı durumu
    credentials: true, // Kimlik bilgilerini kabul et
  };

app.use(cors(corsOptions)); // CORS ayarlarını kullan




//body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//cookie parser
app.use(cookieParser());

// define rabbit mq variables
const rabbitMQUrl = process.env.RABBITURL;
let channel;
let queue;



// Store response handlers for pending RPC calls
const responseHandlers = {};


// Generate a unique UUID for each request
function generateUuid() {
    return Math.random().toString() + Math.random().toString() + Math.random().toString();
}

amqp.connect(rabbitMQUrl, function(error0, connection) {
    if (error0) throw error0;

    connection.createChannel(function(error1, ch) {
        if (error1) throw error1;

        channel = ch;
        const exchange = process.env.RABBITEXCHANGE;
        const queueName = 'applicationQueue2';
        const routingKeys = ['error', 'success'];
        
        channel.assertExchange(exchange, 'direct', { durable: false });
        channel.assertQueue(queueName, { exclusive: true }, function(error2, q) {
            if (error2) throw error2;
            
            queue = q.queue;
            console.log(`[*] Waiting for messages in queue ${queueName}. To exit press CTRL+C`);

            routingKeys.forEach(routingKey => {
                channel.bindQueue(q.queue, exchange, routingKey);
                console.log(`[*] Bound queue ${queueName} to exchange ${exchange} with routing key ${routingKey}`);
            });

            // Set up a single consumer to handle responses
            channel.consume(q.queue, (msg) => {
                console.log(`[x] Received message with routing key ${msg.fields.routingKey}: '${msg.content.toString()}'`);
                const correlationId = msg.properties.correlationId;
                const content = msg.content.toString();
                if(msg.fields.routingKey === 'success'){
                if (responseHandlers[correlationId]) {
                    responseHandlers[correlationId](content);
                    delete responseHandlers[correlationId];
                }}
            }, { noAck: true });

            console.log("RabbitMQ channel and exchange setup completed");
        });
    });
});

// Emit message with correlationId for RPC
function emitMessageCorrelationId(routingKey, message, correlationId) {
    const exchange = 'direct_logs';
    channel.publish(exchange, routingKey, Buffer.from(message), { correlationId, replyTo: queue });
    console.log(`[x] Sent message with routing key ${routingKey}: '${message}'`);
}



// Function to wait for a response
function waitForResponse(correlationId) {
    return new Promise((resolve) => {
        responseHandlers[correlationId] = (content) => {
            resolve(content);
        };
    });
}


const router = require('./routes');



app.post('/ims/evaluvate-registration',checkRole.isCoordinator, async (req,res) =>{
    console.log('buraya girdi');
    const content = req.body;
    const msg = JSON.stringify(content);
    const correlationId = generateUuid();
    emitMessageCorrelationId('decision/to/registration/', msg, correlationId);
    const response = await waitForResponse(correlationId);
    console.log(response);
    res.send(response);



});



//**************************serhat ********************** */
app.post('/student/applyToInternship', async(req, res) => { // to send application letter
    const content = req.body;
    const msg = JSON.stringify(content);
    const correlationId = generateUuid();
    emitMessageCorrelationId('/student/applyToInternship', msg, correlationId);
    const response = await waitForResponse(correlationId);
   
  
    value = JSON.parse(response);
    if (value.status === 200){
        res.status(200).json(value.message);
    }else{
        res.status(400).json(value.message);
    }   
});



app.post('/student/sendApplicationForm', async(req, res) => { 
    const content = req.body;
    const msg = JSON.stringify(content);
    const correlationId = generateUuid();
    emitMessageCorrelationId('/student/sendApplicationForm', msg, correlationId);
    const response = await waitForResponse(correlationId);
    value = JSON.parse(response);
    if (value.status === 200){
        res.status(200).json(value.message);
    }else{
        res.status(400).json(value.message);}
  
});

app.put('/company/acceptApplicationLetter', async(req, res) => { 
    const content = req.body;
    const msg = JSON.stringify(content);
    //emitMessage('/company/acceptApplicationLetter', msg);
    const correlationId = generateUuid();
    emitMessageCorrelationId('/company/acceptApplicationLetter', msg, correlationId);
    //res.send('Application letter is accepted by company');
    const response = await waitForResponse(correlationId);
    value = JSON.parse(response);
    if (value.status === 200){
        res.status(200).json(value.message);
    }else{
        res.status(400).json(value.message);}
});

app.put('/company/rejectApplicationLetter', async(req, res) => { 
    const content = req.body;
    const msg = JSON.stringify(content);
    //emitMessage('/company/rejectApplicationLetter', msg);
    const correlationId = generateUuid();
    emitMessageCorrelationId('/company/rejectApplicationLetter', msg, correlationId);
    const response = await waitForResponse(correlationId);
    value = JSON.parse(response);
    if (value.status === 200){
        res.status(200).json(value.message);
    }else{
        res.status(400).json(value.message);}
});

app.put('/company/rejectApplicationForm', async(req, res) => { 
    const content = req.body;
    const msg = JSON.stringify(content);
    const correlationId = generateUuid();
    //emitMessage('/company/rejectApplicationForm', msg);
    emitMessageCorrelationId('/company/rejectApplicationForm', msg, correlationId);
    const response = await waitForResponse(correlationId);
    value = JSON.parse(response);
    if (value.status === 200){
        res.status(200).json(value.message);
    }else{
        res.status(400).json(value.message);}
    //res.send('Application form is rejected by company');
});


app.put('/summerPractiseCoordinator/rejectApplicationForm', async(req, res) => { 
    const content = req.body;
    const msg = JSON.stringify(content);
    const correlationId = generateUuid();
    //emitMessage('/summerPractiseCoordinator/rejectApplicationForm', msg);
    emitMessageCorrelationId('/summerPractiseCoordinator/rejectApplicationForm', msg, correlationId);
    const response = await waitForResponse(correlationId);
    value = JSON.parse(response);
    if (value.status === 200){
        res.status(200).json(value.message);
    }else{
        res.status(400).json(value.message);}
    //res.send('Application form is rejected by summer practise coordinator');
});

app.put('/company/acceptApplicationForm', async(req, res) => { 
    const content = req.body;
    const msg = JSON.stringify(content);
    const correlationId = generateUuid();
    //emitMessage('/company/acceptApplicationForm', msg);
    emitMessageCorrelationId('/company/acceptApplicationForm', msg, correlationId);
    const response = await waitForResponse(correlationId);
    value = JSON.parse(response);
    if (value.status === 200){
        res.status(200).json(value.message);
    }else{
        res.status(400).json(value.message);}
    //res.send('Application form is accepted by company');
});


app.put('/summerPractiseCoordinator/acceptApplicationForm', async(req, res) => { 
    const content = req.body;
    const msg = JSON.stringify(content);
    const correlationId = generateUuid();
    emitMessageCorrelationId('/summerPractiseCoordinator/acceptApplicationForm', msg, correlationId);
    const response = await waitForResponse(correlationId);
    value = JSON.parse(response);
    if (value.status === 200){
        res.status(200).json(value.message);
    }else{
        res.status(400).json(value.message);}
});


// Additional routes for handling various application actions...

// Handle GET request for application letter
app.get('/applicationLetter', async (req, res) => {
    const content = req.query;
    const msg = JSON.stringify(content);
    const correlationId = generateUuid();
    emitMessageCorrelationId('/applicationLetter', msg, correlationId);
    const response = await waitForResponse(correlationId);
    value = JSON.parse(response);
    if (value.status === 200){
        res.status(200).json(value);
    }else{
        res.status(400).json(value);}
});

app.get('/student/status', async (req, res) => {
    const content = req.body;
    const msg = JSON.stringify(content);
    const correlationId = generateUuid();
    emitMessageCorrelationId('/student/status', msg, correlationId);
    const response = await waitForResponse(correlationId);
    value = JSON.parse(response);
    if (value.status === 200){
        res.status(200).json(value);
    }else{
        res.status(400).json(value);}
});

app.get('/applicationForm', async (req, res) => {
    const content = req.query;
    const msg = JSON.stringify(content);
    const correlationId = generateUuid();
    emitMessageCorrelationId('/applicationForm', msg, correlationId);
    const response = await waitForResponse(correlationId);
    value = JSON.parse(response);
    if (value.status === 200){
        res.status(200).json(value);
    }else{
        res.status(400).json(value);}
});


app.post('/sendFeedback', async(req, res) => { 
    const content = req.body;
    const msg = JSON.stringify(content);
    const correlationId = generateUuid();
    emitMessageCorrelationId('/sendFeedback', msg, correlationId);
    const response = await waitForResponse(correlationId);
    value = JSON.parse(response);
    if (value.status === 200){
        res.status(200).json(value.message);
    }else{
        res.status(400).json(value.message);}
});

app.put('/student/cancelApplication', async(req, res) => { 
    const content = req.body;
    const msg = JSON.stringify(content);
    const correlationId = generateUuid();
    emitMessageCorrelationId('/student/cancelApplication', msg, correlationId);
    const response = await waitForResponse(correlationId);
    value = JSON.parse(response);
    if (value.status === 200){
        res.status(200).json(value.message);
    }else{
        res.status(400).json(value.message);}
});


app.put('/student/cancelApplicationForm', async(req, res) => { 
    const content = req.body;
    const msg = JSON.stringify(content);
    const correlationId = generateUuid();
    emitMessageCorrelationId('/student/cancelApplicationForm', msg, correlationId);
    const response = await waitForResponse(correlationId);
    value = JSON.parse(response);
    if (value.status === 200){
        res.status(200).json(value.message);
    }else{
        res.status(400).json(value.message);}
});




app.put('/summerPracticeCoordinator/deleteApplication', async(req, res) => { 
    const content = req.body;
    const msg = JSON.stringify(content);
    const correlationId = generateUuid();
    emitMessageCorrelationId('/summerPracticeCoordinator/deleteApplication', msg, correlationId);
    const response = await waitForResponse(correlationId);
    value = JSON.parse(response);
    if (value.status === 200){
        res.status(200).json(value.message);
    }else{
        res.status(400).json(value.message);}
});


// ******************Announcement *****************************
app.get('/ims/company/get-announcement', async(req, res) => { 
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('company.internship-announcements.get', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(200).json({
            status:'success',
            content:parsedResponse.message
        });
    }
    catch(error){
        res.status(400).send(error);
    }
});

app.get('/ims/company/announcement-list', async(req, res) => { 
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('company.internship-announcements.list', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    } 
    catch(error){
        res.status(400).send(error);
    }
});


app.get('/ims/admin/get-announcement', async(req, res) => { 
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('admin.internship-announcements.get', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
    
});

app.get('/ims/admin/internship-announcement-list', async(req, res) => { 
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('admin.internship-announcements.list', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
    
});

app.get('/ims/admin/delete-announcement', async(req, res) => { 
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('admin.internship-announcements.delete', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
    
});

app.get('/ims/admin/waiting-announcement-list', async(req, res) => { 
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('admin.waiting-announcements.list', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
    
});


app.get('/ims/student/get-announcement', async(req, res) => { 
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('student.internship-announcements.get', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
});

app.get('/ims/student/announcement-list', async(req, res) => { 
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('student.internship-announcements.list', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
});

app.post('/ims/company/create-announcement', async(req, res) => { // to send application letter
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('company.internship-announcements.create', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
});

app.put('/ims/company/update-announcement', async(req, res) => { // to send application letter
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('company.internship-announcements.update', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
});

app.delete('/ims/company/delete-announcement', async(req, res) => { // to send application letter
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('company.internship-announcements.delete', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message); 
    }
    catch(error){
        res.status(400).send(error);
    }
});

app.put('/ims/admin/approve-announcement', async(req, res) => { // to send application letter
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('admin.waiting-announcements.approve', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
});

app.delete('/ims/admin/reject-announcement', async(req, res) => { // to send application letter
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('admin.waiting-announcements.reject', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
});

app.post('/ims/admin/upload-announcement', async(req, res) => { 
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('admin.coordinator-announcement.create', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
});

app.put('/ims/admin/update-announcement', async(req, res) => { 
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('admin.coordinator-announcement.update', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
});

app.delete('/ims/admin/delete-announcement', async(req, res) => { 
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('admin.coordinator-announcement.delete', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
});



app.get('/ims/admin/coordinator-announcements', async(req, res) => { 
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('admin.coordinator-announcements.list', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
});

app.get('/ims/admin/coordinator-announcement', async(req, res) => { 
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('admin.coordinator-announcement.get', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
});

app.get('/ims/student/coordinator-announcements', async(req, res) => { 
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('student.coordinator-announcements.list', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
});

app.get('/ims/student/coordinator-announcement', async(req, res) => { 
    try{
        const content = req.body;
        const msg = JSON.stringify(content);
        const correlationId = generateUuid();
        emitMessageCorrelationId('student.coordinator-announcement.get', msg, correlationId);
        const response = await waitForResponse(correlationId);
        const parsedResponse = JSON.parse(response);
        res.status(parsedResponse.status).send(parsedResponse.message);
    }
    catch(error){
        res.status(400).send(error);
    }
});




//login-register
app.use('/ims',router);




//decision to registration request




//404 not found
app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!")
})



app.listen(process.env.PORT,() =>{
    console.log(`listenin on port ${process.env.PORT}`);
})