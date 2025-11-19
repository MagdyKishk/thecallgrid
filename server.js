/**
 * Core Express server for TheCallGrid marketing site.
 * Renders Pug views from /views and serves static assets from /public.
 */

require('dotenv').config();

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const SITE_NAME = process.env.SITE_NAME || 'TheCallGrid';
const SITE_URL = (process.env.SITE_URL || 'https://www.thecallgrid.com').replace(/\/$/, '');
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'info@thecallgrid.com';
const COMPANY_PHONE = process.env.COMPANY_PHONE || '+1 (307) 000-0000';
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || 'Cheyenne, Wyoming, USA';
const TWITTER_HANDLE = process.env.TWITTER_HANDLE || '@thecallgrid';
const INSTAGRAM_HANDLE = process.env.INSTAGRAM_HANDLE || '@thecallgrid';
const FACEBOOK_HANDLE = process.env.FACEBOOK_HANDLE || 'thecallgrid';
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/logo.svg`;

app.enable('trust proxy');
app.disable('x-powered-by');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/fonts/fontawesome', express.static(path.join(__dirname, 'node_modules/@fortawesome/fontawesome-free')));

app.use((req, res, next) => {
  res.locals.siteName = SITE_NAME;
  res.locals.siteUrl = SITE_URL;
  res.locals.companyEmail = COMPANY_EMAIL;
  res.locals.companyPhone = COMPANY_PHONE;
  res.locals.companyAddress = COMPANY_ADDRESS;
  res.locals.twitterHandle = TWITTER_HANDLE;
  res.locals.instagramHandle = INSTAGRAM_HANDLE;
  res.locals.facebookHandle = FACEBOOK_HANDLE;
  res.locals.nodeEnv = NODE_ENV;
  next();
});

const defaultMeta = {
  description:
    'Professional lead generation and call services powered by experienced C1+ callers averaging 4+ years on the phone.',
  keywords:
    'lead generation, appointment setting, call center, solar leads, real estate leads, cold calling services',
  ogImage: DEFAULT_OG_IMAGE,
  siteName: SITE_NAME,
};

const renderPage = (view, overrides = {}) => (req, res, next) => {
  try {
    const canonicalPath =
      typeof overrides.canonical === 'string'
        ? overrides.canonical
        : req.path === '/' ? '' : req.path;

    const pageData = {
      ...defaultMeta,
      pageClass: 'page-default',
      canonical: canonicalPath,
      ...overrides,
    };

    res.render(view, pageData);
  } catch (error) {
    next(error);
  }
};

app.get(
  '/',
  renderPage('index', {
    title: 'TheCallGrid | Professional Lead Generation & Call Services',
    description:
      'Unlock a dedicated team of seasoned US-based callers delivering qualified leads and booked appointments for solar, roofing, and real estate.',
    pageClass: 'page-home',
    ogType: 'website',
    canonical: '',
  })
);

app.get(
  '/services',
  renderPage('services', {
    title: 'Our Services | TheCallGrid',
    description:
      'Explore TheCallGrid’s managed caller pods, data enrichment, and appointment-setting services tailored to high-intent campaigns.',
    pageClass: 'page-services',
    canonical: '/services',
  })
);

app.get(
  '/about',
  renderPage('about', {
    title: 'About TheCallGrid | Meet the Team Behind the Calls',
    description:
      'Learn about TheCallGrid’s mission, leadership team, and proven process for building scalable calling operations for growth teams.',
    pageClass: 'page-about',
    canonical: '/about',
  })
);

app.get(
  '/contact',
  renderPage('contact', {
    title: 'Contact TheCallGrid | Book a Discovery Call',
    description:
      'Ready to scale outbound performance? Contact TheCallGrid to schedule a discovery call and receive a custom playbook for your pipeline.',
    pageClass: 'page-contact',
    canonical: '/contact',
  })
);

// SEO Routes
// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`# robots.txt for ${SITE_NAME}
# ${SITE_URL}/robots.txt

User-agent: *
Allow: /

# Sitemap location
Sitemap: ${SITE_URL}/sitemap.xml`);
});

// Sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const currentDate = new Date().toISOString().split('T')[0];
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${SITE_URL}/contact</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${SITE_URL}/services</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${SITE_URL}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
  
  res.type('application/xml');
  res.send(sitemap);
});

// Email configuration
const emailUser = process.env.EMAIL_USER || 'magdykishk314@gmail.com';
const emailPassword = (process.env.EMAIL_PASSWORD || '').replace(/\s+/g, '');

// Configure Nodemailer
const createTransporter = () => {
  // Gmail SMTP configuration
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPassword,
    },
  });
};

// Contact form submission endpoint
app.post(
  '/api/contact/submit',
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('email')
      .trim()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    body('phone')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 20 })
      .withMessage('Phone number is too long'),
    body('company')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 100 })
      .withMessage('Company name is too long'),
    body('industry')
      .trim()
      .notEmpty()
      .withMessage('Please select an industry'),
    body('subject')
      .optional({ checkFalsy: true })
      .trim()
      .isLength({ max: 200 })
      .withMessage('Subject is too long'),
    body('message')
      .trim()
      .isLength({ min: 10, max: 5000 })
      .withMessage('Message must be between 10 and 5000 characters'),
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          errors: errors.array().map((err) => err.msg),
        });
      }

      const { name, email, phone, company, industry, subject, message } = req.body;

      const logoUrl = `${SITE_URL}/assets/logo.svg`;
      const servicesUrl = `${SITE_URL}/services`;
      const aboutUrl = `${SITE_URL}/about`;

      // Email template helper function
      const createEmailTemplate = (type, data) => {
        if (type === 'client') {
          // Client confirmation email
          return `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a202c; background-color: #f7fafc; }
                  .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                  .email-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
                  .logo { max-width: 200px; height: auto; margin-bottom: 20px; }
                  .email-header h1 { color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 10px; }
                  .email-header p { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
                  .email-content { padding: 40px 30px; }
                  .greeting { font-size: 18px; font-weight: 600; color: #1a202c; margin-bottom: 20px; }
                  .message { font-size: 16px; color: #4a5568; margin-bottom: 30px; line-height: 1.8; }
                  .cta-section { background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%); padding: 30px; border-radius: 8px; margin: 30px 0; }
                  .cta-title { font-size: 20px; font-weight: 700; color: #667eea; margin-bottom: 15px; }
                  .cta-text { font-size: 15px; color: #4a5568; margin-bottom: 20px; line-height: 1.7; }
                  .cta-buttons { display: flex; gap: 15px; flex-wrap: wrap; }
                  .cta-button { display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 15px; }
                  .cta-button:hover { opacity: 0.9; }
                  .about-section { margin-top: 30px; padding-top: 30px; border-top: 2px solid #e2e8f0; }
                  .about-title { font-size: 18px; font-weight: 700; color: #1a202c; margin-bottom: 15px; }
                  .about-text { font-size: 15px; color: #4a5568; line-height: 1.7; margin-bottom: 15px; }
                  .features { list-style: none; margin: 20px 0; }
                  .features li { padding: 8px 0; padding-left: 25px; position: relative; font-size: 15px; color: #4a5568; }
                  .features li:before { content: '✓'; position: absolute; left: 0; color: #667eea; font-weight: 700; }
                  .email-footer { background: #1a202c; padding: 30px; text-align: center; }
                  .footer-text { color: rgba(255, 255, 255, 0.8); font-size: 14px; margin-bottom: 10px; }
                  .footer-links { margin-top: 15px; }
                  .footer-links a { color: rgba(255, 255, 255, 0.9); text-decoration: none; margin: 0 10px; font-size: 14px; }
                  .footer-links a:hover { color: #667eea; }
                  @media only screen and (max-width: 600px) {
                    .email-content { padding: 30px 20px; }
                    .email-header { padding: 30px 20px; }
                    .cta-buttons { flex-direction: column; }
                    .cta-button { width: 100%; text-align: center; }
                  }
                </style>
              </head>
              <body>
                <div class="email-wrapper">
                  <div class="email-header">
                    <img src="${logoUrl}" alt="${SITE_NAME}" class="logo" />
                    <h1>Thank You for Your Interest!</h1>
                    <p>We've received your message and will get back to you soon</p>
                  </div>
                  <div class="email-content">
                    <div class="greeting">Hello ${name},</div>
                    <div class="message">
                      Thank you for reaching out to ${SITE_NAME}! We've received your inquiry and our team will review it carefully. We typically respond within 24 hours, and we're excited to help transform your lead generation.
                    </div>
                    <div class="cta-section">
                      <div class="cta-title">Explore Our Services</div>
                      <div class="cta-text">
                        While you wait, learn more about how we can help scale your business with C1+ professional callers.
                      </div>
                      <div class="cta-buttons">
                        <a href="${servicesUrl}" class="cta-button">View Our Services</a>
                        <a href="${aboutUrl}" class="cta-button">Learn About Us</a>
                      </div>
                    </div>
                    <div class="about-section">
                      <div class="about-title">Why Choose ${SITE_NAME}?</div>
                      <div class="about-text">
                        We're Wyoming-based excellence powered by C1+ callers with 4+ years of experience. Our mission is to deliver exceptionally high-quality lead generation with absolutely no risk to our clients—you only pay for results.
                      </div>
                      <ul class="features">
                        <li>C1+ Language Proficiency - Fluent or native English speaking</li>
                        <li>4+ Years Average Experience - Experienced professionals</li>
                        <li>No Upfront Fees - You only pay for results</li>
                        <li>Industry-Specialized Teams - Real Estate, Solar, Roofing & More</li>
                        <li>Complete Transparency - Daily leads and weekly reports</li>
                        <li>Fast Deployment - Start calling in 24-48 hours</li>
                      </ul>
                    </div>
                  </div>
                  <div class="email-footer">
                    <div class="footer-text">© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.</div>
                    <div class="footer-text">${COMPANY_ADDRESS}</div>
                    <div class="footer-links">
                      <a href="${SITE_URL}">Website</a> | 
                      <a href="${SITE_URL}/contact">Contact</a> | 
                      <a href="mailto:${COMPANY_EMAIL}">${COMPANY_EMAIL}</a>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `;
        } else {
          // Company notification email
          return `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  * { margin: 0; padding: 0; box-sizing: border-box; }
                  body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #1a202c; background-color: #f7fafc; }
                  .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
                  .email-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
                  .logo { max-width: 200px; height: auto; margin-bottom: 20px; }
                  .email-header h1 { color: #ffffff; font-size: 28px; font-weight: 700; margin-bottom: 10px; }
                  .email-header p { color: rgba(255, 255, 255, 0.9); font-size: 16px; }
                  .email-content { padding: 40px 30px; }
                  .alert-badge { display: inline-block; background: #10b981; color: #ffffff; padding: 6px 12px; border-radius: 4px; font-size: 12px; font-weight: 600; text-transform: uppercase; margin-bottom: 20px; }
                  .field-group { margin-bottom: 25px; }
                  .field-label { font-weight: 700; color: #667eea; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }
                  .field-value { padding: 12px 15px; background: #f7fafc; border-left: 4px solid #667eea; border-radius: 4px; font-size: 16px; color: #1a202c; }
                  .field-value a { color: #667eea; text-decoration: none; }
                  .field-value a:hover { text-decoration: underline; }
                  .message-box { background: #f7fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #764ba2; margin-top: 10px; }
                  .message-text { font-size: 15px; color: #4a5568; line-height: 1.8; white-space: pre-wrap; }
                  .action-button { display: inline-block; margin-top: 30px; padding: 12px 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; }
                  .email-footer { background: #1a202c; padding: 20px; text-align: center; }
                  .footer-text { color: rgba(255, 255, 255, 0.6); font-size: 12px; }
                  @media only screen and (max-width: 600px) {
                    .email-content { padding: 30px 20px; }
                    .email-header { padding: 30px 20px; }
                  }
                </style>
              </head>
              <body>
                <div class="email-wrapper">
                  <div class="email-header">
                    <img src="${logoUrl}" alt="${SITE_NAME}" class="logo" />
                    <h1>New Contact Form Submission</h1>
                    <p>You have received a new inquiry from your website</p>
                  </div>
                  <div class="email-content">
                    <span class="alert-badge">New Lead</span>
                    <div class="field-group">
                      <div class="field-label">Name</div>
                      <div class="field-value">${name}</div>
                    </div>
                    <div class="field-group">
                      <div class="field-label">Email</div>
                      <div class="field-value"><a href="mailto:${email}">${email}</a></div>
                    </div>
                    ${phone ? `
                    <div class="field-group">
                      <div class="field-label">Phone</div>
                      <div class="field-value"><a href="tel:${phone}">${phone}</a></div>
                    </div>
                    ` : ''}
                    ${company ? `
                    <div class="field-group">
                      <div class="field-label">Company</div>
                      <div class="field-value">${company}</div>
                    </div>
                    ` : ''}
                    <div class="field-group">
                      <div class="field-label">Industry</div>
                      <div class="field-value">${industry}</div>
                    </div>
                    ${subject ? `
                    <div class="field-group">
                      <div class="field-label">Subject</div>
                      <div class="field-value">${subject}</div>
                    </div>
                    ` : ''}
                    <div class="field-group">
                      <div class="field-label">Message</div>
                      <div class="message-box">
                        <div class="message-text">${message.replace(/\n/g, '\n')}</div>
                      </div>
                    </div>
                    <a href="mailto:${email}?subject=Re: ${subject || 'Your inquiry to ' + SITE_NAME}" class="action-button">Reply to ${name}</a>
                  </div>
                  <div class="email-footer">
                    <div class="footer-text">This email was sent from ${SITE_NAME} contact form</div>
                  </div>
                </div>
              </body>
            </html>
          `;
        }
      };

      // Create text versions
      const createTextEmail = (type, data) => {
        if (type === 'client') {
          return `
Thank You for Your Interest in ${SITE_NAME}!

Hello ${name},

Thank you for reaching out to ${SITE_NAME}! We've received your inquiry and our team will review it carefully. We typically respond within 24 hours, and we're excited to help transform your lead generation.

Explore Our Services:
${servicesUrl}

Learn About Us:
${aboutUrl}

Why Choose ${SITE_NAME}?
- C1+ Language Proficiency
- 4+ Years Average Experience
- No Upfront Fees
- Industry-Specialized Teams
- Complete Transparency
- Fast Deployment (24-48 hours)

© ${new Date().getFullYear()} ${SITE_NAME}
${COMPANY_ADDRESS}
${COMPANY_EMAIL}
          `.trim();
        } else {
          return `
New Contact Form Submission

Name: ${name}
Email: ${email}
${phone ? `Phone: ${phone}` : ''}
${company ? `Company: ${company}` : ''}
Industry: ${industry}
${subject ? `Subject: ${subject}` : ''}

Message:
${message}
          `.trim();
        }
      };

      const transporter = createTransporter();

      // Send email to company
      const companyEmailOptions = {
        from: `"${SITE_NAME}" <${emailUser}>`,
        to: COMPANY_EMAIL || 'info@thecallgrid.com',
        replyTo: email,
        subject: subject || `New Contact Form Submission - ${industry}`,
        html: createEmailTemplate('company', { name, email, phone, company, industry, subject, message }),
        text: createTextEmail('company', { name, email, phone, company, industry, subject, message }),
      };

      // Send confirmation email to client
      const clientEmailOptions = {
        from: `"${SITE_NAME}" <${emailUser}>`,
        to: email,
        subject: `Thank You for Contacting ${SITE_NAME}!`,
        html: createEmailTemplate('client', { name }),
        text: createTextEmail('client', { name }),
      };

      // Send both emails
      await Promise.all([
        transporter.sendMail(companyEmailOptions),
        transporter.sendMail(clientEmailOptions),
      ]);

      res.status(200).json({
        success: true,
        message: 'Thank you for your message! We will get back to you within 24 hours.',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to send message. Please try again later or contact us directly.',
      });
    }
  }
);

app.use((req, res) => {
  res.status(404);
  res.render('error', {
    statusCode: 404,
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist or has moved.',
    pageClass: 'page-error',
    canonical: req.path,
  });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode);
  res.render('error', {
    statusCode,
    title: statusCode === 404 ? 'Page Not Found' : 'Something Went Wrong',
    message:
      statusCode === 404
        ? 'We could not find the page you were looking for.'
        : 'An unexpected error occurred. Please try again later.',
    pageClass: 'page-error',
    canonical: req.path,
    error: NODE_ENV === 'development' ? err : undefined,
  });
});

app.listen(PORT, HOST, () => {
  // Server started
});

