const path = "./config.env";
require('dotenv').config({ path });

const amqp = require('amqplib');

class Producer {
    channel;
  
    async createChannel() {
      const connection = await amqp.connect(process.env.RABBITURL);
      this.channel = await connection.createChannel(); // await ekleyerek kanalı oluşturma işleminin tamamlanmasını bekliyoruz
    }
  
    async publishMessage(routingKey, message) {
        console.log('burda teneke 2')
      if (!this.channel) {
        await this.createChannel();
      }
  
      await this.channel.assertExchange(process.env.RABBITEXCHANGE, 'direct');
      
      this.channel.publish(
        process.env.RABBITEXCHANGE,
        routingKey,
        Buffer.from(
          JSON.stringify({
            logType: routingKey,
            message: message,
            dateTime: new Date(),
          })
        )
      );
      console.log(
        `The message "${message}" is sent to exchange ${process.env.RABBITEXCHANGE}`
      );
    }
  }
  
  module.exports = Producer;