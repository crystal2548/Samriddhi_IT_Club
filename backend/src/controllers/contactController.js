const { Resend } = require('resend');
const supabase = require('../config/supabase');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendContactEmail = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // 1. Save to Supabase using Service Role Key (bypasses RLS)
    let dbSuccess = false;
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        full_name: name,
        email: email,
        subject: subject,
        message: message,
      });

    if (dbError) {
      console.error('Supabase Error:', dbError.message);
      // If table doesn't exist, we still want to send the email!
      const isMissingTable = 
        dbError.code === '42P01' || 
        dbError.message?.includes('relation') || 
        dbError.message?.includes('not found') ||
        dbError.message?.includes('schema cache');

      if (isMissingTable) {
        console.warn('Table contact_messages does not exist or not found. Proceeding with email only.');
      } else {
        return res.status(500).json({ error: 'Failed to save message to database: ' + dbError.message });
      }
    } else {
      dbSuccess = true;
    }

    // 2. Send email via Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'itclub.samriddhi@gmail.com',
      replyTo: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #00D4FF;">New Contact Message</h2>
          <p><strong>From:</strong> ${name} (&lt;${email}&gt;)</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background: #f4f4f4; padding: 15px; border-radius: 8px; margin-top: 10px;">
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="margin-top: 20px; border: 0; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #999;">This message was sent from the Samriddhi IT Club contact form.</p>
        </div>
      `
    });

    if (emailError) {
      console.error('Resend Error:', emailError);
      
      // Specific handling for 'Authorized Recipient' error
      if (emailError.message?.includes('Authorized Recipient') || emailError.name === 'restriction_error') {
        return res.status(403).json({ 
          error: "Resend Email Restriction: The recipient 'itclub.samriddhi@gmail.com' is not an authorized recipient in your Resend account. To fix this, either verify your domain or add this email as an 'Authorized Recipient' in your Resend dashboard.",
          dbSaved: dbSuccess
        });
      }

      return res.status(400).json({ 
        error: 'Failed to send email: ' + emailError.message,
        dbSaved: dbSuccess
      });
    }

    res.status(200).json({ 
      message: 'Message sent successfully', 
      emailId: emailData.id,
      dbSaved: dbSuccess
    });
  } catch (err) {
    console.error('Server Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { sendContactEmail };
