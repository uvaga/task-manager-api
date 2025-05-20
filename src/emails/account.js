const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {
    // sgMail.send({
    //     to: email,
    //     cc: 'uvaga.up@gmail.com',
    //     from: 'andrew@mead.io',
    //     subject: 'Welcome email',
    //     text: `Welcome, ${name} to the app`,
    //     html: `Welcome, <b>${name}</b> to the app`
    // })
}

const sendCancelEmail = (email, name) => {
    // sgMail.send({
    //     to: email,
    //     cc: 'uvaga.up@gmail.com',
    //     from: 'andrew@mead.io',
    //     subject: 'Cancellation email',
    //     text: `${name} Tell, why did you cancel your subscription?`,
    //     html: `<b>${name}</b> Tell, why did you cancel your subscription?`
    // })
}

module.exports = {
    sendWelcomeEmail,
    sendCancelEmail
}