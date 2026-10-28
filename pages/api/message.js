import nodemailer from 'nodemailer';
import { withObservability } from '../../utils/server/observability';

const isFilled = (value) => typeof value === 'string' && value.trim() !== '';

/**
 * Api endpoint that attempts sending an email to a target account. It takes 
 * in the name, email and message of the user (sender) and creates an email that
 * is sent using nodemailer. Only a POST with all three fields is accepted; send
 * failures are logged and reported by withObservability.
 */
const SendEmail = async (req) => {
    if (req.method !== 'POST') {
        return { status: 405, headers: { Allow: 'POST' }, body: 'Method Not Allowed' };
    }
    const { name, email, message } = req.body || {};
    if (![name, email, message].every(isFilled)) {
        return { status: 400, body: 'A name, email and message are required.' };
    }

    // setup source email credentials
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL,
          pass: process.env.GMAIL_PASSWORD
        }
    });
      
    // setup the email object 
    let mailOptions = {
        from: process.env.GMAIL,
        to: process.env.TARGET_EMAIL,
        subject: 'Message from ' + name + '.',
        text: `${message}\n You can send them an email at ${email}.`
    };
    
    // attempt sending the email
    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        return { status: 500, body: 'We could not send your message, please try again later.', error };
    }
    return { status: 200, body: 'Your message has been sent.' };
}

export default withObservability('/api/message', SendEmail);
