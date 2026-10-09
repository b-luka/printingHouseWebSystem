import nodemailer from 'nodemailer';

export const notifyPrintersAboutProcurement = async (printerEmails: string[], procurementId: string, items: any[]) => {
    try {
        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        const itemListHtml = items.map(i => `<li><b>${i.name}</b> (${i.category}) - ${i.quantity} kom.</li>`).join('');
        
        const mailOptions = {
            from: '"PrintPlatform" <no-reply@printplatform.com>',
            to: printerEmails.length > 0 ? printerEmails.join(', ') : 'test-printer@printplatform.com',
            subject: '🔔 New Procurement - Open Bidding!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Dear,</h2>
                    <p>A new public procurement (Procurement ID: <b>${procurementId}</b>) has been opened, and you can submit your offer within the next 10 minutes.</p>
                    <h3>List of requested products:</h3>
                    <ul>${itemListHtml}</ul>
                    <p>Please log in to the system to submit your total bid.</p>
                    <hr>
                    <small>This email was automatically generated for testing purposes.</small>
                </div>
            `
        };

        let info = await transporter.sendMail(mailOptions);

        console.log('--- ETHEREAL EMAIL SENT ---');
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        console.log('----------------------------');

    } catch (error: any) {
        console.error('Error while sending Ethereal email:', error.message);
    }
};

export const sendInvoiceEmail = async (userEmail: string, username: string, pdfBuffer: Buffer) => {
    try {
        let testAccount = await nodemailer.createTestAccount();

        let transporter = nodemailer.createTransport({
            host: testAccount.smtp.host,
            port: testAccount.smtp.port,
            secure: testAccount.smtp.secure,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });

        const mailOptions = {
            from: '"PrintPlatform" <no-reply@printplatform.com>',
            to: userEmail,
            subject: '✅ Your invoice is ready!',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                    <h2>Dear ${username},</h2>
                    <p>Thank you for your purchase. Please find the PDF invoice for your recent order attached to this email.</p>
                    <hr>
                    <small>This email was automatically generated for testing purposes.</small>
                </div>
            `,
            attachments: [
                {
                    filename: `Invoice_${Date.now()}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        };

        let info = await transporter.sendMail(mailOptions);

        console.log('--- ETHEREAL EMAIL SENT ---');
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        console.log('----------------------------');

    } catch (error: any) {
        console.error('Error while sending Ethereal email:', error.message);
    }
};