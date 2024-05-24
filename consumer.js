const path = "./config.env";
require('dotenv').config({ path });

const amqp = require('amqplib');

class Consumer{
  channel;

  async createChannel() {
    const connection = await amqp.connect(process.env.RABBITURL);
    this.channel =  await connection.createChannel();
  }



  
}

module.exports = Consumer;