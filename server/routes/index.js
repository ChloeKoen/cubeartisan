/**
 * This file is part of CubeArtisan.
 *
 * CubeArtisan is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * CubeArtisan is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with CubeArtisan.  If not, see <https://www.gnu.org/licenses/>.
 *
 * Modified from the original version in CubeCobra. See LICENSE.CubeCobra for more information.
 */
import winston from '@cubeartisan/server/serverjs/winstonConfig.js';

import express from 'express';
import ConnectFlash from 'connect-flash';
import ExpressMessages from 'express-messages';
import path from 'path';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import session from 'express-session';
import passport from 'passport';
import http from 'http';
import fileUpload from 'express-fileupload';
import compression from 'compression';
import MongoDBStoreFactory from 'connect-mongodb-session';
import schedule from 'node-schedule';
import dotenv from 'dotenv';
import { Server as SocketIO } from 'socket.io';

import updatedb from '@cubeartisan/server/serverjs/updatecards.js';
import carddb from '@cubeartisan/server/serverjs/cards.js';
import CardRating from '@cubeartisan/server/models/cardrating.js';
import CardHistory from '@cubeartisan/server/models/cardHistory.js';
import { render } from '@cubeartisan/server/serverjs/render.js';
import DevRoutes from '@cubeartisan/server/routes/dev.js';
import CardRoutes from '@cubeartisan/server/routes/card.js';
import CubeRoutes from '@cubeartisan/server/routes/cube/index.js';
import InfoRoutes from '@cubeartisan/server/routes/info.js';
import UserRoutes from '@cubeartisan/server/routes/user.js';
import CommentRoutes from '@cubeartisan/server/routes/comment.js';
import AdminRoutes from '@cubeartisan/server/routes/admin.js';
import ContentRoutes from '@cubeartisan/server/routes/content.js';
import PackagesRoutes from '@cubeartisan/server/routes/package.js';
import DraftRoutes from '@cubeartisan/server/routes/draft.js';
import GridDraftRoutes from '@cubeartisan/server/routes/griddraft.js';
import DeckRoutes from '@cubeartisan/server/routes/deck.js';
import passportConfig from '@cubeartisan/server/config/passport.js';
import { handleRouteError, wrapAsyncApi } from '@cubeartisan/server/serverjs/util.js';
import Blog from '@cubeartisan/server/models/blog.js';
import Cube from '@cubeartisan/server/models/cube.js';
import Deck from '@cubeartisan/server/models/deck.js';
import User from '@cubeartisan/server/models/user.js';
import Article from '@cubeartisan/server/models/article.js';
import Video from '@cubeartisan/server/models/video.js';
import PasswordReset from "@cubeartisan/server/models/passwordreset.js";
import Comment from '@cubeartisan/server/models/comment.js'
import PodcastEpisode from '@cubeartisan/server/models/podcastEpisode.js';
import { makeFilter } from '@cubeartisan/server/serverjs/filterCubes.js';
import {
  ensureAuth,
  flashValidationErrors,
  requestLogging,
  timeoutMiddleware
} from "@cubeartisan/server/routes/middleware.js";
import { getCubeId } from '@cubeartisan/server/serverjs/cubefn.js';

import { fileURLToPath } from 'url';
import { body } from "express-validator";
import mailer from "nodemailer";
import Email from "email-templates";
import bcrypt from "bcryptjs";
import manageWebsocketDraft from "@cubeartisan/server/routes/websockets/wsDraft.js";

// eslint-disable-next-line no-underscore-dangle,prettier/prettier
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(__filename);
const MongoDBStore = MongoDBStoreFactory(session);
dotenv.config();

// Connect db
const connectionQ = mongoose.connect(
  `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}:${process.env.MONGODB_PORT}/${process.env.DBNAME}?replicaSet=${process.env.MONGODB_REPLICASET}&authSource=${process.env.MONGODB_AUTH_DB}`,
  {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
);

const db = mongoose.connection;
db.once('open', () => {
  winston.info('Connected to Mongo.');
});

// Check for db errors
db.on('error', (err) => {
  winston.error(err);
});

const store = new MongoDBStore(
  {
    uri: process.env.MONGODB_URL,
    collection: 'session_data',
  },
  (err) => {
    if (err) {
      winston.error('Store failed to connect to mongoDB.', { error: err });
    }
  },
);

// scryfall updates this data at 9, so his will minimize staleness
schedule.scheduleJob('0 10 * * *', async () => {
  winston.info('String midnight cardbase update...');

  const ratings = await CardRating.find({}, 'name elo embedding').lean();
  const histories = await CardHistory.find({}, 'oracleId current.total current.picks').lean();
  updatedb.updateCardbase(ratings, histories);
});

const CUBE_PREVIEW_FIELDS =
  '_id shortID image_uri image_name image_artist name owner owner_name type card_count overrideCategory categoryPrefixes categoryOverride';

const redirectToLandingOrDash = (req, res) =>
  req.user ? res.redirect(302, '/dashboard') : res.redirect(302, '/landing');

const getChildComments = async (req, res) => {
  const comments = await Comment.find({
    $and: [{ parent: req.params.parent }, { parentType: req.params.type }],
  }).lean();

  return res.status(200).send({
    success: 'true',
    comments,
  });
};

const showDowntimePage = (req, res) => {
  return render(req, res, 'DownTimePage', {
    title: 'Down for Maintenance',
  });
};

const exploreCubes = async (req, res) => {
  const recentsq = Cube.find(
    {
      card_count: {
        $gt: 200,
      },
      isListed: true,
    },
    CUBE_PREVIEW_FIELDS,
  )
    .lean()
    .sort({
      date_updated: -1,
    })
    .limit(12)
    .exec();

  const featuredq = Cube.find(
    {
      isFeatured: true,
    },
    CUBE_PREVIEW_FIELDS,
  )
    .lean()
    .exec();

  const draftedq = Cube.find(
    {
      isListed: true,
    },
    CUBE_PREVIEW_FIELDS,
  )
    .lean()
    .sort({
      numDecks: -1,
    })
    .limit(12)
    .exec();

  const decksq = Deck.find()
    .lean()
    .sort({
      date: -1,
    })
    .limit(10)
    .exec();

  const [recents, featured, drafted, decks] = await Promise.all([recentsq, featuredq, draftedq, decksq]);

  const recentlyDrafted = await Cube.find({ _id: { $in: decks.map((deck) => deck.cube) } }, CUBE_PREVIEW_FIELDS).lean();

  return render(req, res, 'ExplorePage', {
    recents,
    featured,
    drafted,
    recentlyDrafted,
  });
};

const showRandomCube = async (_, res) => {
  const lastMonth = () => {
    const ret = new Date();
    ret.setMonth(ret.getMonth() - 1);
    return ret;
  };

  const [randCube] = await Cube.aggregate()
    .match({ isListed: true, card_count: { $gte: 360 }, date_updated: { $gte: lastMonth() } })
    .sample(1);
  res.redirect(303, `/cube/${encodeURIComponent(getCubeId(randCube))}`);
};

const viewDashboard = async (req, res) => {
  try {
    const cubesq = Cube.find(
      {
        owner: req.user._id,
      },
      CUBE_PREVIEW_FIELDS,
    )
      .lean()
      .sort({
        date_updated: -1,
      });
    const postsq = Blog.find({
      $or: [
        {
          cube: {
            $in: req.user.followed_cubes,
          },
        },
        {
          owner: {
            $in: req.user.followed_users,
          },
        },
        {
          dev: 'true',
        },
      ],
    })
      .sort({
        date: -1,
      })
      .limit(10);

    const featuredq = Cube.find(
      {
        isFeatured: true,
      },
      CUBE_PREVIEW_FIELDS,
    ).lean();

    const articlesq = Article.find({ status: 'published' }).sort({ date: -1 }).limit(10);
    const episodesq = PodcastEpisode.find().sort({ date: -1 }).limit(10);
    const videosq = Video.find({ status: 'published' }).sort({ date: -1 }).limit(10);

    // We can do these queries in parallel
    const [cubes, posts, articles, videos, episodes, featured] = await Promise.all([
      cubesq,
      postsq,
      articlesq,
      videosq,
      episodesq,
      featuredq,
    ]);

    const content = [];

    for (const article of articles) {
      content.push({
        type: 'article',
        date: article.date,
        content: article,
      });
    }
    for (const video of videos) {
      content.push({
        type: 'video',
        date: video.date,
        content: video,
      });
    }
    for (const episode of episodes) {
      content.push({
        type: 'episode',
        date: episode.date,
        content: episode,
      });
    }

    content.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateB - dateA;
    });

    content.splice(10);

    const decks = await Deck.find({
      cubeOwner: req.user._id,
    })
      .sort({
        date: -1,
      })
      .lean()
      .limit(12);

    return render(req, res, 'DashboardPage', { posts, cubes, decks, content, featured });
  } catch (err) {
    return handleRouteError(req, res, err, '/landing');
  }
};

const dashboardDecks = async (req, res) => {
  try {
    const pagesize = 30;
    const { page } = req.params;
    const { user } = req;
    if (!user) {
      return res.redirect(401, '/landing');
    }

    const decks = await Deck.find({
      cubeOwner: user._id,
    })
      .sort({
        date: -1,
      })
      .skip(pagesize * page)
      .limit(pagesize)
      .lean()
      .exec();

    const numDecks = await Deck.countDocuments({
      cubeOwner: user._id,
    })
      .lean()
      .exec();

    return render(req, res, 'RecentDraftsPage', {
      decks,
      currentPage: parseInt(page, 10),
      totalPages: Math.ceil(numDecks / pagesize),
      count: numDecks,
    });
  } catch (err) {
    req.logger.error(err);
    return res.status(500).send(err);
  }
};

const viewLanding = async (req, res) => {
  const cubeq = Cube.estimatedDocumentCount().exec();
  const deckq = Deck.estimatedDocumentCount().exec();
  const userq = User.estimatedDocumentCount().exec();

  const [cube, deck, user] = await Promise.all([cubeq, deckq, userq]);

  return render(req, res, 'LandingPage', {
    numusers: user.toLocaleString('en-US'),
    numcubes: cube.toLocaleString('en-US'),
    numdrafts: deck.toLocaleString('en-US'),
    version: process.env.SITE_VERSION,
  });
};

const getVersion = (req, res) => {
  return render(req, res, 'VersionPage', {
    version: process.env.SITE_VERSION,
    host: process.env.SITE_ROOT,
  });
};

const viewSearchPage = (req, res) => {
  return render(req, res, 'SearchPage', {
    query: '',
    cubes: [],
  });
};

const searchResultsPage = async (req, res) => {
  try {
    const perPage = 36;
    const page = Math.max(0, Math.max(req.params.page, 0));

    const { order } = req.query;

    let sort = {
      date_updated: -1,
    };

    switch (order) {
      case 'pop':
        sort = {
          numDecks: -1,
        };
        break;
      case 'alpha':
        sort = {
          name: -1,
        };
        break;
      default:
        break;
    }

    const query = await makeFilter(req.params.query, carddb);

    if (query.error) {
      req.flash('danger', `Invalid Search Syntax: ${query.error}`);

      return render(req, res, 'SearchPage', {
        query: req.params.query,
        cubes: [],
        count: 0,
        perPage: 0,
        page: 0,
      });
    }

    if (query.warnings) {
      for (const warning of query.warnings) {
        req.flash('danger', `Warning: ${warning}`);
      }
      delete query.warnings;
    }

    query.isListed = true;

    const count = await Cube.countDocuments(query);

    const cubes = await Cube.find(query, CUBE_PREVIEW_FIELDS)
      .lean()
      .sort(sort)
      .skip(perPage * page)
      .limit(perPage);

    return render(req, res, 'SearchPage', {
      query: req.params.query,
      cubes,
      count,
      perPage,
      page,
      order,
    });
  } catch (err) {
    req.logger.error(err);
    req.flash('danger', 'Invalid Search Syntax');

    return render(req, res, 'SearchPage', {
      query: req.params.query,
      cubes: [],
      count: 0,
      perPage: 0,
      page: 0,
    });
  }
};

const showLeavePage = (req, res) => {
  return render(req, res, 'LeaveWarningPage', {
    url: req.query.url,
  });
};

const showErrorPage = (req, res) => {
  return render(req, res, 'ErrorPage', {
    requestId: req.uuid,
    title: '404: Page not found',
  });
};

const browsePackages = (req, res) => render(req, res, 'BrowsePackagesPage', {});

const loginUser = (req, res, next) => {
  const query = {
    [req.body.username.includes('@') ? 'email' : 'username_lower']: req.body.username.toLowerCase(),
  };
  // find by email
  User.findOne(query, (_err, user) => {
    if (!user) {
      req.flash('danger', 'Incorrect username or email address.');
      res.redirect('/login');
    } else {
      req.body.username = user.username;
      // TODO: fix confirmation and check it here.
      let redirect = '/';
      if (req.body.loginCallback) {
        redirect = req.body.loginCallback;
      }
      passport.authenticate('local', {
        successRedirect: redirect,
        failureRedirect: '/login',
        failureFlash: true,
      })(req, res, next);
    }
  });
};

const logoutUser = (req, res) => {
  req.logout();
  req.flash('success', 'You have been logged out');
  res.redirect('/');
};

const addMinutes = (date, minutes)  => {
  return new Date(new Date(date).getTime() + minutes * 60000);
}

const submitLostPassword = async (req, res) => {
  try {
    if (!req.validated) {
      return render(req, res, 'LostPasswordPage');
    }
    const recoveryEmail = req.body.email.toLowerCase();
    await PasswordReset.deleteOne({
      email: recoveryEmail,
    });

    const passwordReset = new PasswordReset();
    passwordReset.expires = addMinutes(Date.now(), 15);
    passwordReset.email = recoveryEmail;
    passwordReset.code = Math.floor(1000000000 + Math.random() * 9000000000);
    await passwordReset.save();

    const smtpTransport = mailer.createTransport({
      name: process.env.SITE_HOSTNAME,
      secure: true,
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_CONFIG_USERNAME,
        pass: process.env.EMAIL_CONFIG_PASSWORD,
      },
    });

    const email = new Email({
      message: {
        from: process.env.SUPPORT_EMAIL_FROM,
        to: passwordReset.email,
        subject: 'Password Reset',
      },
      send: true,
      juiceResources: {
        webResources: {
          relativeTo: path.join(__dirname, '..', 'public'),
          images: true,
        },
      },
      transport: smtpTransport,
    });

    await email.send({
      template: 'password_reset',
      locals: {
        id: passwordReset.id,
        code: passwordReset.code,
      },
    });

    req.flash('success', `Password recovery email sent to ${recoveryEmail}`);
    return res.redirect('/user/lostpassword');
  } catch (err) {
    return handleRouteError(req, res, err, `/user/lostpassword`);
  }
};

const resetPassword = async (req, res) => {
  try {
    if (!req.validated) {
      return render(req, res, 'PasswordResetPage');
    }
    const recoveryEmail = req.body.email.toLowerCase();
    const passwordreset = await PasswordReset.findOne({
      code: req.body.code,
      email: recoveryEmail,
    });

    if (!passwordreset) {
      req.flash('danger', 'Incorrect email and recovery code combination.');
      return render(req, res, 'PasswordResetPage');
    }
    const user = await User.findOne({
      email: recoveryEmail,
    });

    if (!user) {
      req.flash('danger', 'No user with that email found! Are you sure you created an account?');
      return render(req, res, 'PasswordResetPage');
    }

    if (req.body.password2 !== req.body.password) {
      req.flash('danger', "New passwords don't match");
      return render(req, res, 'PasswordResetPage');
    }

    return bcrypt.genSalt(10, (err4, salt) => {
      if (err4) {
        return handleRouteError(req, res, err4, `/`);
      }
      return bcrypt.hash(req.body.password2, salt, async (err5, hash) => {
        if (err5) {
          return handleRouteError(req, res, err5, `/`);
        }
        user.password = hash;
        try {
          await user.save();
          req.flash('success', 'Password updated successfully');
          return res.redirect('/user/login');
        } catch (err6) {
          return handleRouteError(req, res, err6, `/`);
        }
      });
    });
  } catch (err) {
    return handleRouteError(req, res, err, `/`);
  }
};

const checkPasswordsMatch = (value, { req }) => {
  if (value !== req.body.password2) {
    throw new Error('Password confirmation does not match password');
  }

  return true;
}

// Init app
const app = express();
// gzip middleware
app.use(compression());
// request timeout middleware
app.use(timeoutMiddleware);
// per-request logging configuration
app.use(requestLogging);
// upload file middleware
app.use(fileUpload());
// Body parser middleware
app.use(
  bodyParser.urlencoded({
    limit: '200mb',
    extended: true,
  }),
);
app.use(
  bodyParser.json({
    limit: '200mb',
    extended: true,
  }),
);
// Load view engine
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');
// Set Public Folder
app.use(express.static(path.join(__dirname, '../public')));
app.use('/js', express.static(path.join(__dirname, '../../client/dist')));
// Express session middleware
const sessionConfig = session({
      secret: process.env.SESSION,
      store,
      resave: true,
      saveUninitialized: true,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7 * 52, // 1 year
      },
    });
app.use(sessionConfig);
app.use(ConnectFlash());
app.use((req, res, next) => {
  res.locals.messages = ExpressMessages(req, res);
  res.locals.node_env = app.get('env');
  next();
});
// Passport config and middleware
passportConfig(passport);
const passportInitialized = passport.initialize();
const passportSession = passport.session();
app.use(passportInitialized);
app.use(passportSession);
app.use('/', InfoRoutes);
// check for downtime
if (process.env.DOWNTIME_ACTIVE === 'true') {
  app.use(showDowntimePage);
}
app.use('/', CardRoutes);
app.use('/', ContentRoutes);
app.use('/admin', AdminRoutes);
app.use('/comment', CommentRoutes);
app.use('/cube', CubeRoutes);
app.use('/dev', DevRoutes);
app.use('/', PackagesRoutes);
app.use('/user', UserRoutes);
app.get('/', redirectToLandingOrDash);
app.use('/draft', DraftRoutes);
app.use('/griddraft', GridDraftRoutes);
app.use('/deck', DeckRoutes);
app.get('/comments/:parent/:type', wrapAsyncApi(getChildComments));
app.get('/cubes/explore', wrapAsyncApi(exploreCubes));
app.get('/cubes/random', wrapAsyncApi(showRandomCube));
app.get('/dashboard', ensureAuth, wrapAsyncApi(viewDashboard));
app.get('/dashboard/decks/:page', wrapAsyncApi(dashboardDecks));
app.get('/landing', wrapAsyncApi(viewLanding));
app.get('/version', getVersion);
app.get('/cubes/search', viewSearchPage);
app.get('/cubes/search/:query/:page', searchResultsPage);
app.get('/leave', showLeavePage);
app.get('/packages', browsePackages);
app.get('/login', (req, res) => render(req, res, 'LoginPage'));
app.post('/login', loginUser);
app.post('/logout', logoutUser);
app.get('/lostpassword', (req, res) => render(req, res, 'LostPasswordPage'));
app.post('/lostpassword', body('email', 'Email is required').isEmail(), flashValidationErrors, submitLostPassword);
app.post('/lostpassword/reset',
  body('password', 'Password must be between 8 and 24 characters.').isLength({ min: 8, max: 24 }),
  body('password', 'New passwords must match.').custom(checkPasswordsMatch),
  flashValidationErrors,
  resetPassword,
);
app.get('/404', showErrorPage);
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  req.logger.error(err);
  if (!res.statusCode) {
    res.status(500);
  }
  return render(req, res, 'ErrorPage', {
    error: err.message,
    requestId: req.uuid,
    title: 'Oops! Something went wrong.',
  });
});
app.use((_req, res) => res.redirect(303, '/404'));

const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
// Start server after carddb is initialized.
connectionQ.then(() => carddb.initializeCardDb()).then(() => {
  const httpServer = http.createServer(app);
  const wsServer = new SocketIO(httpServer, { cors: { origin: process.env.SITE_ROOT } });
  wsServer.use(wrap(sessionConfig));
  wsServer.use(wrap(passportInitialized));
  wsServer.use(wrap(passportSession));
  // wsServer.use(wrap(requestLogging));
  wsServer.use((socket, next) => {
    if (socket.request.isAuthenticated()) return next();
    return next(new Error("Authentication is required to use websockets."));
  });
  const draftingWsRoute = wsServer.of('/wsdraft');
  draftingWsRoute.use(wrap(sessionConfig));
  draftingWsRoute.use(wrap(passportInitialized));
  draftingWsRoute.use(wrap(passportSession));
  draftingWsRoute.use((socket, next) => {
    if (socket.request.isAuthenticated()) return next();
    return next(new Error("Authentication is required to use websockets."));
  });
  draftingWsRoute.on('connection', manageWebsocketDraft)
  httpServer.listen(process.env.PORT ?? 5000, process.env.LISTEN_ADDR, () => {
    winston.info(`Server started on port ${process.env.PORT || 5000}...`);
  });
});
