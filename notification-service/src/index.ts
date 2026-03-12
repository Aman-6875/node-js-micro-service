import 'dotenv/config';
import { startConsumer } from './events/consumer';


const start = async () => {
    console.log('Starting Notification Service...');
    await startConsumer();
};

start().catch(console.error)