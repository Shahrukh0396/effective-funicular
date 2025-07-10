const nodemailer = require('nodemailer')

async function testGoDaddyEmail() {
  try {
    console.log('📧 Testing GoDaddy email service...')
    
    // Create transporter with GoDaddy Professional Email
    const transporter = nodemailer.createTransport({
      host: 'smtpout.secureserver.net',
      port: 587,
      secure: false,
      auth: {
        user: 'arthur@linton-tech.com',
        pass: 'qwerty090078601'
      }
    })

    // Verify connection
    await transporter.verify()
    console.log('✅ GoDaddy email connection verified')

    // Send test email
    const mailOptions = {
      from: '"Linton Portals" <arthur@linton-tech.com>',
      to: 'ashahrukh0396@gmail.com',
      subject: '🚀 Linton Portals - Multi-Tenant Platform Ready!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px;">🚀 Linton Portals</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Multi-Tenant Platform Launch</p>
          </div>
          
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333; margin-bottom: 20px;">🎉 Platform Transformation Complete!</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="color: #28a745; margin: 0 0 10px 0;">✅ Multi-Tenant Architecture</h3>
              <p style="margin: 0; color: #666;">
                Your project has been successfully transformed into a market-disrupting multi-tenant white-label SaaS platform!
              </p>
            </div>
            
            <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 15px 0; color: #1976d2;">🚀 Key Features Implemented</h4>
              <ul style="margin: 0; color: #666; line-height: 1.6;">
                <li><strong>Multi-tenant Database:</strong> Vendor isolation and data security</li>
                <li><strong>White-Label System:</strong> Custom branding, colors, domains</li>
                <li><strong>Vendor Onboarding:</strong> Step-by-step setup flow</li>
                <li><strong>Usage Limits:</strong> Enforced quotas and subscription management</li>
                <li><strong>Business Model:</strong> $7M+ revenue potential in Year 3</li>
              </ul>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 15px 0; color: #856404;">💰 Market Disruption Potential</h4>
              <p style="margin: 0; color: #856404; line-height: 1.6;">
                <strong>HubSpot + Jira + QuickBooks + Slack + Zoom = ALL IN ONE</strong><br>
                Addressable market: $50+ billion<br>
                Target: 2000+ vendors by Year 3
              </p>
            </div>
            
            <div style="background: #d1ecf1; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 15px 0; color: #0c5460;">🎯 Next Steps</h4>
              <ol style="margin: 0; color: #0c5460; line-height: 1.6;">
                <li>Test demo vendor (demo@acmedigital.com)</li>
                <li>Deploy to staging environment</li>
                <li>Launch beta with 10-20 vendors</li>
                <li>Scale to 1000+ vendors</li>
              </ol>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 14px;">
                This could be a <strong>market-crashing platform</strong> that revolutionizes how service businesses operate! 🚀
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
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ Email sent successfully!')
    console.log('📧 Message ID:', info.messageId)
    console.log('📧 Check ashahrukh0396@gmail.com for the email')
    
  } catch (error) {
    console.error('❌ Error sending email:', error)
  }
}

// Run the test
testGoDaddyEmail() 