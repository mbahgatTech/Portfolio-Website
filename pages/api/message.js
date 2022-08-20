const nodemailer = require('nodemailer');

/**
 * Api endpoint that attempts sending an email to a target account. It takes 
 * in the name, email and message of the user (sender) and creates an email that
 * is sent using nodemailer.
 */
const SendEmail = (req, res) => {
    let { name, email, message } = req.body;

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
        subject: 'Messag from ' + name + '.',
        text: `${message}\n You can send them an email at ${email}.`
    };
    
    // attempt sending the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return res.status(500).send('We could not send your message, please try again later.');
        return res.status(200).send('Your message has been sent.');
    });
}

export default SendEmail;