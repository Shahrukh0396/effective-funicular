require('dotenv').config()
const nodemailer = require('nodemailer')

// GoDaddy Professional Email SMTP configurations
const professionalConfigs = [
  {
    name: 'GoDaddy Professional SSL (Port 465)',
    host: 'smtpout.secureserver.net',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  {
    name: 'GoDaddy Professional TLS (Port 587)',
    host: 'smtpout.secureserver.net',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  {
    name: 'GoDaddy Professional Alternative (Port 25)',
    host: 'smtpout.secureserver.net',
    port: 25,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  },
  // Try with different authentication methods
  {
    name: 'GoDaddy Professional with STARTTLS',
    host: 'smtpout.secureserver.net',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  }
]

async function testGoDaddyProfessional() {
  console.log('📧 Testing GoDaddy Professional Email SMTP...')
  console.log('')
  console.log('ℹ️  GoDaddy Professional Email vs Microsoft 365:')
  console.log('   • Professional Email: Uses secureserver.net')
  console.log('   • Microsoft 365: Uses outlook.office365.com')
  console.log('   • You have: Professional Email')
  console.log('')
  console.log('User:', process.env.EMAIL_USER)
  console.log('Pass:', process.env.EMAIL_PASS ? '***configured***' : '❌ NOT CONFIGURED')
  console.log('')

  for (const config of professionalConfigs) {
    console.log(`🔍 Testing: ${config.name}`)
    console.log(`   Host: ${config.host}:${config.port}`)
    console.log(`   Secure: ${config.secure}`)
    
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        requireTLS: config.requireTLS || false,
        auth: {
          user: config.auth.user,
          pass: config.auth.pass
        }
      })

      // Test connection
      await transporter.verify()
      console.log(`   ✅ Connection successful!`)
      
      // Test sending email
      const testEmail = process.argv[2] || 'ashahrukh0396@gmail.com'
      console.log(`   📧 Sending test email to: ${testEmail}`)
      
      const mailOptions = {
        from: `"Linton Portals" <${config.auth.user}>`,
        to: testEmail,
        subject: `✅ Linton Portals - Professional Email Test`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Linton Portals</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Email Test</p>
            </div>
            
            <div style="padding: 30px; background: #f8f9fa;">
              <h2 style="color: #333; margin-bottom: 20px;">🎉 GoDaddy Professional Email Working!</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <h3 style="color: #28a745; margin: 0 0 10px 0;">✅ Success</h3>
                <p style="margin: 0; color: #666;">
                  Your GoDaddy Professional Email configuration is working perfectly!
                </p>
                <p style="margin: 15px 0 0 0; color: #666;">
                  <strong>Configuration:</strong> ${config.name}
                </p>
              </div>
              
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #1976d2;">📧 Email Configuration</h4>
                <p style="margin: 0; color: #666; font-size: 14px;">
                  <strong>Provider:</strong> GoDaddy Professional Email<br>
                  <strong>Host:</strong> ${config.host}<br>
                  <strong>Port:</strong> ${config.port}<br>
                  <strong>Secure:</strong> ${config.secure}<br>
                  <strong>User:</strong> ${config.auth.user}
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
        `,
        text: `
Linton Portals - Professional Email Test

🎉 GoDaddy Professional Email Working!

Your GoDaddy Professional Email configuration is working perfectly!

Configuration: ${config.name}
• Host: ${config.host}
• Port: ${config.port}
• Secure: ${config.secure}
• User: ${config.auth.user}

This is a test email from Linton Portals email service.
Sent at: ${new Date().toLocaleString()}

© 2024 Linton Portals. All rights reserved.
        `
      }
      
      const info = await transporter.sendMail(mailOptions)
      console.log(`   ✅ Email sent successfully!`)
      console.log(`   📧 Message ID: ${info.messageId}`)
      console.log(`   ✅ Use this configuration in your .env file!`)
      console.log('')
      
      // If we get here, this configuration works
      console.log('🎉 SUCCESS! Found working configuration:')
      console.log(`   EMAIL_HOST=${config.host}`)
      console.log(`   EMAIL_PORT=${config.port}`)
      console.log(`   EMAIL_SECURE=${config.secure}`)
      console.log(`   EMAIL_USER=${config.auth.user}`)
      console.log(`   EMAIL_PASS=${config.auth.pass}`)
      
      return // Exit after first successful configuration
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`)
      console.log('')
    }
  }
  
  console.log('❌ All GoDaddy Professional Email configurations failed.')
  console.log('')
  console.log('🔧 GoDaddy Professional Email Troubleshooting:')
  console.log('1. Verify your email and password are correct')
  console.log('2. Check if SMTP is enabled in your GoDaddy Professional Email settings')
  console.log('3. Try logging into your email via webmail first')
  console.log('4. Contact GoDaddy support to enable SMTP for Professional Email')
  console.log('5. Some Professional Email accounts require SMTP to be enabled manually')
  console.log('')
  console.log('💡 Professional Email vs Microsoft 365:')
  console.log('   • Professional Email: smtpout.secureserver.net')
  console.log('   • Microsoft 365: smtp.office365.com')
  console.log('   • You have: Professional Email (correct settings used)')
}

// Run the test
testGoDaddyProfessional() 