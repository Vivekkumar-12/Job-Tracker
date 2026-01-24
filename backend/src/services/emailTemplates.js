/**
 * Email template generators for Job Hunt Hub
 */

/**
 * Generate HTML email template for reminder notifications
 */
export const generateReminderEmailHTML = ({ 
  title, 
  description, 
  company, 
  reminderDate, 
  type,
  userName = "User"
}) => {
  const typeEmoji = {
    interview: '🎯',
    followup: '📧',
    deadline: '⏰',
    other: '📋'
  };

  const typeLabel = {
    interview: 'Interview',
    followup: 'Follow-up',
    deadline: 'Deadline',
    other: 'Reminder'
  };

  const emoji = typeEmoji[type] || '📋';
  const label = typeLabel[type] || 'Reminder';

  const formattedDate = new Date(reminderDate).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            line-height: 1.6;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: 600;
          }
          .header p {
            font-size: 16px;
            opacity: 0.95;
          }
          .content {
            padding: 40px 30px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 25px;
            color: #333;
          }
          .reminder-card {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-left: 5px solid #667eea;
            padding: 25px;
            border-radius: 8px;
            margin: 30px 0;
          }
          .reminder-type {
            display: inline-block;
            font-size: 28px;
            margin-bottom: 15px;
          }
          .reminder-title {
            font-size: 22px;
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
          }
          .reminder-details {
            margin-top: 20px;
          }
          .detail-row {
            display: flex;
            align-items: center;
            margin-bottom: 12px;
            font-size: 15px;
            color: #555;
          }
          .detail-label {
            font-weight: 600;
            min-width: 100px;
            margin-right: 15px;
            color: #667eea;
          }
          .detail-value {
            color: #333;
          }
          .description {
            background: white;
            padding: 15px;
            border-radius: 6px;
            margin-top: 15px;
            border-left: 3px solid #764ba2;
            font-style: italic;
            color: #666;
          }
          .action-section {
            background: #f8f9fa;
            padding: 30px;
            margin-top: 30px;
            border-radius: 8px;
            text-align: center;
          }
          .action-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 12px 40px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 5px;
            transition: transform 0.2s;
          }
          .action-button:hover {
            transform: translateY(-2px);
          }
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #999;
            border-top: 1px solid #e0e0e0;
          }
          .footer-text {
            margin-bottom: 10px;
          }
          .divider {
            height: 2px;
            background: linear-gradient(90deg, transparent, #667eea, transparent);
            margin: 25px 0;
          }
          .badge {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 15px;
          }
          .time-warning {
            background: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 6px;
            margin-top: 20px;
            font-size: 14px;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>📌 Job Hunt Hub Reminder</h1>
            <p>You have an upcoming ${label.toLowerCase()}</p>
          </div>

          <!-- Content -->
          <div class="content">
            <div class="greeting">
              Hello ${userName},
            </div>

            <p style="color: #666; margin-bottom: 20px;">
              This is a reminder about an important event in your job search journey.
            </p>

            <div class="divider"></div>

            <!-- Reminder Card -->
            <div class="reminder-card">
              <div class="reminder-type">${emoji}</div>
              <div class="badge">${label.toUpperCase()}</div>
              <div class="reminder-title">${title}</div>
              
              <div class="reminder-details">
                ${company ? `
                  <div class="detail-row">
                    <span class="detail-label">🏢 Company:</span>
                    <span class="detail-value">${company}</span>
                  </div>
                ` : ''}
                
                <div class="detail-row">
                  <span class="detail-label">📅 Date & Time:</span>
                  <span class="detail-value">${formattedDate}</span>
                </div>
              </div>

              ${description ? `
                <div class="description">
                  ${description}
                </div>
              ` : ''}
            </div>

            <div class="time-warning">
              ⏱️ Make sure you're prepared! This reminder was sent to give you adequate time to get ready.
            </div>

            <div class="divider"></div>

            <!-- Action Section -->
            <div class="action-section">
              <p style="margin-bottom: 20px; color: #666;">
                Want to manage your reminders?
              </p>
              <a href="${process.env.APP_URL || 'https://jobhunthub.com'}/reminders" class="action-button">
                View All Reminders
              </a>
            </div>

            <p style="text-align: center; margin-top: 25px; color: #999; font-size: 13px;">
              Keep pushing forward! You've got this! 💪
            </p>
          </div>

          <!-- Footer -->
          <div class="footer">
            <div class="footer-text">
              © 2026 Job Hunt Hub - Your Personal Job Search Assistant
            </div>
            <div class="footer-text" style="font-size: 12px; margin-top: 10px;">
              This is an automated reminder email. Please do not reply to this message.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};

/**
 * Generate HTML email template for OTP
 */
export const generateOtpEmailHTML = ({ code, userName = "User" }) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          .content {
            padding: 40px 30px;
            text-align: center;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 30px;
            color: #333;
          }
          .otp-section {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            padding: 40px;
            border-radius: 10px;
            margin: 30px 0;
          }
          .otp-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 2px;
          }
          .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: #667eea;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin-bottom: 20px;
            word-break: break-all;
          }
          .expiry {
            font-size: 13px;
            color: #d9534f;
            font-weight: 600;
          }
          .info {
            background: #e8f4f8;
            border-left: 4px solid #5bc0de;
            padding: 15px;
            border-radius: 6px;
            margin: 30px 0;
            font-size: 14px;
            color: #31708f;
            text-align: left;
          }
          .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #999;
            border-top: 1px solid #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Verification Code</h1>
          </div>

          <div class="content">
            <div class="greeting">
              Hi ${userName},
            </div>

            <p style="color: #666; margin-bottom: 30px;">
              Your verification code is ready. Enter this code to complete your verification:
            </p>

            <div class="otp-section">
              <div class="otp-label">Your Verification Code</div>
              <div class="otp-code">${code}</div>
              <div class="expiry">⏱️ This code expires in 10 minutes</div>
            </div>

            <div class="info">
              <strong>🔒 Security Tip:</strong> Never share this code with anyone. Job Hunt Hub staff will never ask for your verification code.
            </div>

            <p style="color: #999; font-size: 13px;">
              If you didn't request this code, please ignore this email or contact support.
            </p>
          </div>

          <div class="footer">
            <div>© 2026 Job Hunt Hub - Your Personal Job Search Assistant</div>
            <div style="margin-top: 10px; font-size: 12px;">
              This is an automated email. Please do not reply to this message.
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
};
