import amqp from 'amqplib';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';

let connection: Awaited<ReturnType<typeof amqp.connect>>;
let channel: Awaited<ReturnType<typeof connection.createChannel>>;

export const connectRabbitMQ = async (): Promise<void> => {
  connection = await amqp.connect(RABBITMQ_URL);
  channel = await connection.createChannel();
  console.log('RabbitMQ connected');
};

export const publishEvent = async (queue: string, data: object): Promise<void> => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }

  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)));
  console.log(`Event published to queue: ${queue}`, data);
};
