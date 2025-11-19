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

const app = express();
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const SITE_NAME = process.env.SITE_NAME || 'TheCallGrid';
const SITE_URL = (process.env.SITE_URL || 'https://www.thecallgrid.com').replace(/\/$/, '');
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || 'hello@thecallgrid.com';
const COMPANY_PHONE = process.env.COMPANY_PHONE || '+1 (307) 000-0000';
const COMPANY_ADDRESS = process.env.COMPANY_ADDRESS || 'Cheyenne, Wyoming, USA';
const TWITTER_HANDLE = process.env.TWITTER_HANDLE || '@thecallgrid';
const INSTAGRAM_HANDLE = process.env.INSTAGRAM_HANDLE || '@thecallgrid';
const FACEBOOK_HANDLE = process.env.FACEBOOK_HANDLE || 'thecallgrid';
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/images/og-image.jpg`;

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

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() });
});

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

