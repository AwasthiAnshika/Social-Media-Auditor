const sgMail = require('@sendgrid/mail');
const env = require('../config/env');

// Set SendGrid API key
if (env.sendgridApiKey) {
  sgMail.setApiKey(env.sendgridApiKey);
}

const sendReportReadyEmail = async (toEmail, username, platform, pdfBuffer = null, userEmailForAdmin = null) => {
  if (!env.sendgridApiKey) {
    console.warn('SendGrid API key not configured, skipping email');
    return null;
  }

  const fromEmail = `noreply@buildwithdivyanshu.co.in`;
  const platformNames = {
    youtube: 'YouTube',
    instagram: 'Instagram',
    tiktok: 'TikTok'
  };

  const hasPdf = pdfBuffer !== null && pdfBuffer !== undefined;
  const pdfNote = hasPdf 
    ? '<p><strong>PDF Report:</strong> The detailed analytics report is attached to this email as a PDF.</p>'
    : '<p><strong>PDF Report:</strong> PDF generation encountered an issue. Please check the system logs.</p>';
  
  const pdfNoteText = hasPdf
    ? 'PDF Report: The detailed analytics report is attached to this email as a PDF.'
    : 'PDF Report: PDF generation encountered an issue. Please check the system logs.';

  const msg = {
    to: toEmail,
    from: fromEmail,
    subject: `New User Audit Request - ${platformNames[platform] || platform} - @${username}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { 
              font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif; 
              line-height: 1.6; 
              color: #000000; 
              background-color: #f5f5f5;
              margin: 0;
              padding: 20px;
            }
            .container { 
              max-width: 900px; 
              margin: 0 auto; 
              background-color: #FFFFFF;
              border: 3px solid #B40C00;
              border-radius: 8px;
              overflow: hidden;
            }
            .header { 
              background-color: #FFFFFF; 
              color: #000000; 
              padding: 30px; 
              text-align: center; 
              border-bottom: 3px solid #B40C00;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              color: #B40C00;
            }
            .content { 
              background-color: #FFFFFF; 
              padding: 40px; 
            }
            .content h2 {
              color: #B40C00;
              font-size: 24px;
              font-weight: 700;
              margin-top: 0;
              margin-bottom: 20px;
            }
            .info-section {
              background-color: #FFFFFF;
              border: 2px solid #B40C00;
              border-radius: 8px;
              padding: 25px;
              margin: 20px 0;
            }
            .info-row {
              margin: 15px 0;
              padding: 12px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              font-weight: 600;
              color: #B40C00;
              display: inline-block;
              min-width: 150px;
            }
            .info-value {
              color: #000000;
              font-weight: 400;
            }
            .accent-text {
              color: #B40C00;
              font-weight: 700;
            }
            .footer {
              background-color: #FFFFFF;
              padding: 20px 40px;
              text-align: center;
              border-top: 2px solid #B40C00;
              color: #000000;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Social Media Auditor</h1>
            </div>
            <div class="content">
              <h2>New User Audit Request Received</h2>
              <p>Hello Admin,</p>
              <p>We have received a new user audit request. Please find the details below:</p>
              
              <div class="info-section">
                <div class="info-row">
                  <span class="info-label">Username:</span>
                  <span class="info-value accent-text">@${username}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Social Platform:</span>
                  <span class="info-value accent-text">${platformNames[platform] || platform}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">User Email:</span>
                  <span class="info-value accent-text">${userEmailForAdmin || 'Not provided'}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Data Submitted:</span>
                  <span class="info-value">User has submitted their ${platformNames[platform] || platform} profile for analysis</span>
                </div>
              </div>
              
              ${pdfNote}
              
              <p style="margin-top: 30px;">Please review the attached PDF report and follow up with the user accordingly.</p>
              
              <p style="margin-top: 20px;">Best regards,<br><strong>The Social Media Auditor System</strong></p>
            </div>
            <div class="footer">
              <p style="margin: 0; font-size: 14px;">This is an automated notification from Social Media Auditor</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      New User Audit Request Received
      
      Hello Admin,
      
      We have received a new user audit request. Please find the details below:
      
      Username: @${username}
      Social Platform: ${platformNames[platform] || platform}
      User Email: ${userEmailForAdmin || 'Not provided'}
      Data Submitted: User has submitted their ${platformNames[platform] || platform} profile for analysis
      
      ${pdfNoteText}
      
      Please review the attached PDF report and follow up with the user accordingly.
      
      Best regards,
      The Social Media Auditor System
    `,
  };

  // Attach PDF if provided
  if (pdfBuffer) {
    const platformNames = {
      youtube: 'YouTube',
      instagram: 'Instagram',
      tiktok: 'TikTok'
    };
    
    msg.attachments = [
      {
        content: pdfBuffer.toString('base64'),
        filename: `${platformNames[platform] || platform}_Report_${username}.pdf`,
        type: 'application/pdf',
        disposition: 'attachment',
      },
    ];
  }

  try {
    await sgMail.send(msg);
    console.log(`Email sent successfully to ${toEmail}${pdfBuffer ? ' with PDF attachment' : ''}`);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    throw error;
  }
};

module.exports = {
  sendReportReadyEmail,
};

