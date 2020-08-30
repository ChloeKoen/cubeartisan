// Load Environment Variables
require('dotenv').config();

const express = require('express');
const mailer = require('nodemailer');
const path = require('path');
const Email = require('email-templates');
const { ensureAuth, csrfProtection } = require('./middleware');

const User = require('../models/user');
const Report = require('../models/report');
const Application = require('../models/application');
const Comment = require('../models/comment');
const { render } = require('../serverjs/render');

const router = express.Router();

router.use(csrfProtection);

router.get('/dashboard', ensureAuth, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user || !user.roles.includes('Admin')) {
    return res.redirect('/404');
  }

  const commentReportCount = await Report.countDocuments();
  const applicationCount = await Application.countDocuments();

  return render(req, res, 'AdminDashboardPage', { commentReportCount, applicationCount });
});

const PAGE_SIZE = 10;

router.get('/comments', async (req, res) => {
  return res.redirect('/admin/comments/0');
});

router.get('/comments/:page', ensureAuth, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user || !user.roles.includes('Admin')) {
    return res.redirect('/404');
  }

  const count = await Comment.countDocuments();
  const comments = await Comment.find()
    .sort({ timePosted: -1 })
    .skip(req.params.page * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  return render(req, res, 'AdminCommentsPage', { comments, count, page: req.params.page });
});

router.get('/commentreports', async (req, res) => {
  return res.redirect('/admin/commentreports/0');
});

router.get('/commentreports/:page', ensureAuth, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user || !user.roles.includes('Admin')) {
    return res.redirect('/404');
  }

  const count = await Report.countDocuments();
  const reports = await Report.find()
    .sort({ timePosted: -1 })
    .skip(req.params.page * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  return render(req, res, 'CommentReportsPage', { reports, count, page: req.params.page });
});

router.get('/applications', async (req, res) => {
  return res.redirect('/admin/applications/0');
});

router.get('/applications/:page', ensureAuth, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user || !user.roles.includes('Admin')) {
    return res.redirect('/404');
  }

  const count = await Application.countDocuments();
  const applications = await Application.find()
    .sort({ timePosted: -1 })
    .skip(req.params.page * PAGE_SIZE)
    .limit(PAGE_SIZE)
    .lean();

  return render(req, res, 'ApplicationsPage', { applications, count, page: req.params.page });
});

router.get('/ignorereport/:id', ensureAuth, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user || !user.roles.includes('Admin')) {
    return res.redirect('/404');
  }

  const report = await Report.findById(req.params.id);

  await Report.deleteMany({ commentid: report.commentid });

  req.flash('success', 'All reports for this comment have been deleted.');
  return res.redirect('/admin/commentreports/0');
});

router.get('/removecomment/:id', ensureAuth, async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user || !user.roles.includes('Admin')) {
    return res.redirect('/404');
  }

  const report = await Report.findById(req.params.id);

  const comment = await Comment.findById(report.commentid);

  comment.owner = null;
  comment.ownerName = null;
  comment.image =
    'https://img.scryfall.com/cards/art_crop/front/0/c/0c082aa8-bf7f-47f2-baf8-43ad253fd7d7.jpg?1562826021';
  comment.artist = 'Allan Pollack';
  comment.updated = true;
  comment.content = '[removed by moderator]';
  // the -1000 is to prevent weird time display error
  comment.timePosted = Date.now() - 1000;

  await comment.save();

  req.flash('success', 'This comment has been deleted.');
  return res.redirect(`/admin/ignorereport/${report._id}`);
});

router.get('/application/approve/:id', ensureAuth, async (req, res) => {
  const caller = await User.findById(req.user.id);

  if (!caller || !caller.roles.includes('Admin')) {
    return res.redirect('/404');
  }

  const application = await Application.findById(req.params.id);

  const user = await User.findById(application.userid);
  if (!user.roles) {
    user.roles = [];
  }
  if (!user.roles.includes('ContentCreator')) {
    user.roles.push('ContentCreator');
  }
  await user.save();

  await Application.deleteOne({ _id: application._id });

  const smtpTransport = mailer.createTransport({
    name: 'CubeCobra.com',
    secure: true,
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_CONFIG_USERNAME,
      pass: process.env.EMAIL_CONFIG_PASSWORD,
    },
  });

  const email = new Email({
    message: {
      from: 'Cube Cobra Team <support@cubecobra.com>',
      to: user.email,
      subject: 'Cube Cobra Content Creator',
    },
    juiceResources: {
      webResources: {
        relativeTo: path.join(__dirname, '..', 'public'),
        images: true,
      },
    },
    transport: smtpTransport,
  });

  email.send({
    template: 'application_approve',
    locals: {},
  });

  req.flash('success', `Application for ${user.username} approved.`);
  return res.redirect(`/admin/applications/0`);
});

router.get('/application/decline/:id', ensureAuth, async (req, res) => {
  const caller = await User.findById(req.user.id);

  if (!caller || !caller.roles.includes('Admin')) {
    return res.redirect('/404');
  }

  const application = await Application.findById(req.params.id);

  await Application.deleteOne({ _id: application._id });

  const user = await User.findById(application.userid);

  const smtpTransport = mailer.createTransport({
    name: 'CubeCobra.com',
    secure: true,
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_CONFIG_USERNAME,
      pass: process.env.EMAIL_CONFIG_PASSWORD,
    },
  });

  const email = new Email({
    message: {
      from: 'Cube Cobra Team <support@cubecobra.com>',
      to: user.email,
      subject: 'Cube Cobra Content Creator',
    },
    juiceResources: {
      webResources: {
        relativeTo: path.join(__dirname, '..', 'public'),
        images: true,
      },
    },
    transport: smtpTransport,
  });

  email.send({
    template: 'application_decline',
    locals: {},
  });

  req.flash('danger', `Application declined.`);
  return res.redirect(`/admin/applications/0`);
});

module.exports = router;
