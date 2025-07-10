const nodemailer = require('nodemailer')
const config = require('../config')

class EmailService {
  constructor() {
    this.transporter = null
    this.initializeTransporter()
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: config.email.secure,
        auth: {
          user: config.email.user,
          pass: config.email.pass
        }
      })

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email service configuration error:', error)
        } else {
          console.log('✅ Email service is ready to send messages')
        }
      })
    } catch (error) {
      console.error('Failed to initialize email transporter:', error)
    }
  }

  async sendEmail(options) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized')
      }

      const mailOptions = {
        from: `"Linton Portals" <${config.email.user}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text
      }

      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', info.messageId)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error('Email sending failed:', error)
      throw error
    }
  }

  // Test email
  async sendTestEmail(toEmail) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Linton Portals</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Service Test</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">🎉 Email Service is Working!</h2>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin: 0 0 10px 0;">✅ Success</h3>
            <p style="margin: 0; color: #666;">
              Your email configuration is working perfectly! This test email confirms that:
            </p>
            <ul style="margin: 15px 0 0 0; color: #666;">
              <li>SMTP settings are correct</li>
              <li>Authentication is working</li>
              <li>Emails can be sent successfully</li>
            </ul>
          </div>
          
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin: 0 0 10px 0; color: #1976d2;">📧 Email Configuration</h4>
            <p style="margin: 0; color: #666; font-size: 14px;">
              <strong>Host:</strong> ${config.email.host}<br>
              <strong>Port:</strong> ${config.email.port}<br>
              <strong>Secure:</strong> ${config.email.secure}<br>
              <strong>User:</strong> ${config.email.user}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #666; font-size: 14px;">
              This is a test email from Linton Portals email service.<br>
              Sent at: ${new Date().toLocaleString()}
            </p>
          </div>
        </div>
        
        <div style="background: #f1f3f4; padding: 20px; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            © 2024 Linton Portals. All rights reserved.
          </p>
        </div>
      </div>
    `

    const text = `
Linton Portals - Email Service Test

🎉 Email Service is Working!

Your email configuration is working perfectly! This test email confirms that:
• SMTP settings are correct
• Authentication is working
• Emails can be sent successfully

Email Configuration:
• Host: ${config.email.host}
• Port: ${config.email.port}
• Secure: ${config.email.secure}
• User: ${config.email.user}

This is a test email from Linton Portals email service.
Sent at: ${new Date().toLocaleString()}

© 2024 Linton Portals. All rights reserved.
    `

    return await this.sendEmail({
      to: toEmail,
      subject: '✅ Linton Portals - Email Service Test',
      html,
      text
    })
  }

  // Password reset email
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${config.clientUrl}/auth/reset-password?token=${resetToken}`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Linton Portals</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">🔐 Password Reset</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Hello ${user.firstName},
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password for your Linton Portals account. 
            If you didn't make this request, you can safely ignore this email.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Reset Password
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ Important</h4>
            <p style="margin: 0; color: #856404; font-size: 14px;">
              This link will expire in 1 hour for security reasons. 
              If you need a new reset link, please request another password reset.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; word-break: break-all;">
            <p style="margin: 0; color: #667eea; font-size: 14px;">
              ${resetUrl}
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Linton Portals Team
          </p>
        </div>
        
        <div style="background: #f1f3f4; padding: 20px; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            © 2024 Linton Portals. All rights reserved.
          </p>
        </div>
      </div>
    `

    const text = `
Linton Portals - Password Reset Request

🔐 Password Reset

Hello ${user.firstName},

We received a request to reset your password for your Linton Portals account. 
If you didn't make this request, you can safely ignore this email.

To reset your password, click the following link:
${resetUrl}

⚠️ Important: This link will expire in 1 hour for security reasons.

If the link doesn't work, copy and paste it into your browser.

Best regards,
The Linton Portals Team

© 2024 Linton Portals. All rights reserved.
    `

    return await this.sendEmail({
      to: user.email,
      subject: '🔐 Reset Your Linton Portals Password',
      html,
      text
    })
  }

  // Email verification
  async sendEmailVerification(user, verificationToken) {
    const verificationUrl = `${config.clientUrl}/auth/verify-email?token=${verificationToken}`
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Linton Portals</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">✅ Verify Your Email</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Hello ${user.firstName},
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Welcome to Linton Portals! Please verify your email address to complete your account setup.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          
          <div style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
            <h4 style="margin: 0 0 10px 0; color: #155724;">🎉 Welcome!</h4>
            <p style="margin: 0; color: #155724; font-size: 14px;">
              Once verified, you'll have full access to all Linton Portals features.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            If the button doesn't work, you can copy and paste this link into your browser:
          </p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; word-break: break-all;">
            <p style="margin: 0; color: #667eea; font-size: 14px;">
              ${verificationUrl}
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Linton Portals Team
          </p>
        </div>
        
        <div style="background: #f1f3f4; padding: 20px; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            © 2024 Linton Portals. All rights reserved.
          </p>
        </div>
      </div>
    `

    const text = `
Linton Portals - Email Verification

✅ Verify Your Email

Hello ${user.firstName},

Welcome to Linton Portals! Please verify your email address to complete your account setup.

To verify your email, click the following link:
${verificationUrl}

🎉 Welcome! Once verified, you'll have full access to all Linton Portals features.

If the link doesn't work, copy and paste it into your browser.

Best regards,
The Linton Portals Team

© 2024 Linton Portals. All rights reserved.
    `

    return await this.sendEmail({
      to: user.email,
      subject: '✅ Verify Your Linton Portals Email',
      html,
      text
    })
  }

  // Welcome email
  async sendWelcomeEmail(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Linton Portals</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Welcome to Your New Portal</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">🎉 Welcome to Linton Portals!</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Hello ${user.firstName},
          </p>
          
          <p style="color: #666; line-height: 1.6;">
            Welcome to Linton Portals! We're excited to have you on board. 
            Your account has been successfully created and you're ready to start managing your projects.
          </p>
          
          <div style="background: #e8f5e8; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 15px 0; color: #2d5a2d;">🚀 Getting Started</h3>
            <ul style="margin: 0; color: #2d5a2d; line-height: 1.6;">
              <li>Complete your profile to personalize your experience</li>
              <li>Explore your dashboard to see project overview</li>
              <li>Create your first project to get started</li>
              <li>Invite team members to collaborate</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${config.clientUrl}/dashboard" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              Go to Dashboard
            </a>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">💡 Need Help?</h4>
            <p style="margin: 0; color: #856404; font-size: 14px;">
              Our support team is here to help you get the most out of Linton Portals. 
              Don't hesitate to reach out if you have any questions.
            </p>
          </div>
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Linton Portals Team
          </p>
        </div>
        
        <div style="background: #f1f3f4; padding: 20px; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            © 2024 Linton Portals. All rights reserved.
          </p>
        </div>
      </div>
    `

    const text = `
Linton Portals - Welcome!

🎉 Welcome to Linton Portals!

Hello ${user.firstName},

Welcome to Linton Portals! We're excited to have you on board. 
Your account has been successfully created and you're ready to start managing your projects.

🚀 Getting Started:
• Complete your profile to personalize your experience
• Explore your dashboard to see project overview
• Create your first project to get started
• Invite team members to collaborate

Go to Dashboard: ${config.clientUrl}/dashboard

💡 Need Help?
Our support team is here to help you get the most out of Linton Portals. 
Don't hesitate to reach out if you have any questions.

Best regards,
The Linton Portals Team

© 2024 Linton Portals. All rights reserved.
    `

    return await this.sendEmail({
      to: user.email,
      subject: '🎉 Welcome to Linton Portals!',
      html,
      text
    })
  }

  // Notification email
  async sendNotificationEmail(user, notification) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 28px;">Linton Portals</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Notification</p>
        </div>
        
        <div style="padding: 30px; background: #f8f9fa;">
          <h2 style="color: #333; margin-bottom: 20px;">🔔 New Notification</h2>
          
          <p style="color: #666; line-height: 1.6;">
            Hello ${user.firstName},
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin: 0 0 10px 0; color: #333;">${notification.title}</h3>
            <p style="margin: 0; color: #666; line-height: 1.6;">
              ${notification.message}
            </p>
          </div>
          
          ${notification.actionUrl ? `
          <div style="text-align: center; margin: 30px 0;">
            <a href="${notification.actionUrl}" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">
              View Details
            </a>
          </div>
          ` : ''}
          
          <p style="color: #666; line-height: 1.6;">
            Best regards,<br>
            The Linton Portals Team
          </p>
        </div>
        
        <div style="background: #f1f3f4; padding: 20px; text-align: center;">
          <p style="margin: 0; color: #666; font-size: 12px;">
            © 2024 Linton Portals. All rights reserved.
          </p>
        </div>
      </div>
    `

    const text = `
Linton Portals - Notification

🔔 New Notification

Hello ${user.firstName},

${notification.title}

${notification.message}

${notification.actionUrl ? `View Details: ${notification.actionUrl}` : ''}

Best regards,
The Linton Portals Team

© 2024 Linton Portals. All rights reserved.
    `

    return await this.sendEmail({
      to: user.email,
      subject: `🔔 ${notification.title}`,
      html,
      text
    })
  }
}

module.exports = new EmailService() 