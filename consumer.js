const amqp = require('amqplib');
exports.consumeMessages = async (routingKey) => {
  try {
      let message;
    const connection = await amqp.connect(process.env.RABBITURL);
    const channel = await connection.createChannel();

    await channel.assertExchange(process.env.RABBITEXCHANGE, 'direct');

    const q = await channel.assertQueue('announcementQueue', { durable: true });

    await channel.bindQueue(q.queue, process.env.RABBITEXCHANGE, routingKey);

    await channel.consume(q.queue, async (msg) => {
      const data = JSON.parse(msg.content.toString());
      message = data;
      console.log(data);

      //await decisionToRegistration(data.message);
      channel.ack(msg);
    },{
      noAck: false
    });

    console.log(`Waiting for messages in queue: ${q.queue}`);
  } catch (error) {
    console.error('Error in consumeMessages:', error);
  }
};