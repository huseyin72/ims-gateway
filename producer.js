const path = "./config.env";
require('dotenv').config({ path });

const amqp = require('amqplib');
const { v4: uuidv4 } = require('uuid');

class Producer {
  channel;

  async createChannel() {
    const connection = await amqp.connect(process.env.RABBITURL);
    this.channel = await connection.createChannel();
  }

  async publishMessage(routingKey, message) {
    console.log('burda teneke 2')
    if (!this.channel) {
      await this.createChannel();
    }

    await this.channel.assertExchange(process.env.RABBITEXCHANGE, 'direct');

    const messageObject = {
      logType: routingKey,
      message: message,
      dateTime: new Date(),
    };

    this.channel.publish(
      process.env.RABBITEXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify(messageObject))
    );
    console.log(
      `The message "${message}" is sent to exchange ${process.env.RABBITEXCHANGE}`
    );
  }

  async consumeMessages(queue, routingKey, callback) {
    if (!this.channel) {
      await this.createChannel();
    }

    await this.channel.assertExchange(process.env.RABBITEXCHANGE, 'direct');
    const q = await this.channel.assertQueue(queue, { durable: false });
    await this.channel.bindQueue(q.queue, process.env.RABBITEXCHANGE, routingKey);

    this.channel.consume(q.queue, (msg) => {
      if (msg !== null) {
        const content = JSON.parse(msg.content.toString());
        //console.log(content);
        callback(content);
        this.channel.ack(msg);
        this.channel.close(); // Kanalı kapat
        this.channel = null; // Kanal referansını temizle

      }
    }, { noAck: false });
  }
}

module.exports = Producer;
