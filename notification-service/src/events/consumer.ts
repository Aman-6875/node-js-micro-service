import amqp from 'amqplib';
import { transporter } from '../config/mailer';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

const sendVerificationEmail = async (data: {
    name: string;
    email: string;
    verificationToken: string;
}) => {
    const verificationLink = `${process.env.APP_URL}/api/users/verify-email/${data.verificationToken}`;

    await transporter.sendMail({
        from: process.env.MAIL_FROM || 'noreply@example.com',
        to: data.email,
        subject: 'Verify Your Email',
        html: `
            <p>Hi ${data.name},</p>
            <p>Thank you for registering. Please click the link below to verify your email:</p>
            <a href="${verificationLink}">Verify Email</a>
            <p>If you did not register, please ignore this email.</p>
            <p> This Link will expire in 24 hours. </p>
        `,
    });
};

export const startConsumer = async () => {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    const verificationQueue = 'user_registered';
    const verificationEmailResentQueue = 'verification_email_resent';

    await channel.assertQueue(verificationQueue, { durable: true });
    console.log(`Waiting for messages in ${verificationQueue}...`);


    channel.consume(verificationQueue, async (msg: amqp.ConsumeMessage | null) => {
        if (msg) {
            const data = JSON.parse(msg.content.toString());
            console.log('Received user_registered event:', data);
            
            try {
                await sendVerificationEmail(data);
                console.log(`Verification email sent to ${data.email}`);
                channel.ack(msg);
            } catch (error) {
                console.error('Failed to send verification email:', error);
                // Optionally, you can implement retry logic here
                channel.nack(msg, false, true); // Requeue the message for retry
            }
        }
    }); 

    channel.assertQueue(verificationEmailResentQueue, { durable: true });
    console.log(`Waiting for messages in ${verificationEmailResentQueue}...`);

    channel.consume(verificationEmailResentQueue, async (msg: amqp.ConsumeMessage | null) => {
        if (msg) {
            const data = JSON.parse(msg.content.toString());
            console.log('Received verification_email_resent event:', data);
            
            try {
                await sendVerificationEmail(data);
                console.log(`Verification email resent to ${data.email}`);
                channel.ack(msg);
            } catch (error) {
                console.error('Failed to resend verification email:', error);
                // Optionally, you can implement retry logic here
                channel.nack(msg, false, true); // Requeue the message for retry
            }
        }
    }); 
};