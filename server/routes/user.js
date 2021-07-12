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
import express from 'express';
import bcrypt from 'bcryptjs';
import mailer from 'nodemailer';
import { body } from 'express-validator';
import Email from 'email-templates';
import path from 'path';
import { addNotification, handleRouteError, hasProfanity, wrapAsyncApi } from '@cubeartisan/server/serverjs/util.js';
import carddb from '@cubeartisan/server/serverjs/cards.js';
import { render } from '@cubeartisan/server/serverjs/render.js';

// Bring in models
import User from '@cubeartisan/server/models/user.js';

import PasswordReset from '@cubeartisan/server/models/passwordreset.js';
import Cube from '@cubeartisan/server/models/cube.js';
import Deck from '@cubeartisan/server/models/deck.js';
import Blog from '@cubeartisan/server/models/blog.js';

import {
  ensureAuth,
  csrfProtection,
  flashValidationErrors,
  jsonValidationErrors,
} from '@cubeartisan/server/routes/middleware.js';
import { getPackages } from '@cubeartisan/server/routes/package.js';
import { fileURLToPath } from 'url';

// eslint-disable-next-line no-underscore-dangle,prettier/prettier
const __filename = fileURLToPath(import.meta.url);
// eslint-disable-next-line no-underscore-dangle
const __dirname = path.dirname(__filename);

const getFeedItems = async (req, res) => {
  const items = await Blog.find({
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
    .skip(parseInt(req.params.skip, 10))
    .limit(5);

  return res.status(200).send({
    success: 'true',
    items,
  });
};

// For consistency between different forms, validate username through this function.
const usernameValid = [
  body('username', 'Username is required').notEmpty(),
  body('username', 'Username must be between 5 and 24 characters.').isLength({
    min: 5,
    max: 24,
  }),
  body('username', 'Username must only contain alphanumeric characters.').matches(/^[0-9a-zA-Z]*$/, 'i'),
  body('username', 'Username may not use profanity.').custom((value) => !hasProfanity(value)),
];

const getUserCubes = async (req, res) => {
  const cubes = await Cube.find({
    owner: req.params.id,
    ...(req.user && req.user._id.equals(req.params.id)
      ? {}
      : {
          isListed: true,
        }),
  }).lean();

  res.status(200).send({
    success: 'true',
    cubes,
  });
};

const saveShowTagColors = async (req, res) => {
  req.user.hide_tag_colors = !req.body.show_tag_colors;
  await req.user.save();

  return res.status(200).send({
    success: 'true',
  });
};

const viewNotification = async (req, res) => {
  try {
    const { user } = req;

    if (req.params.index > user.notifications.length) {
      req.flash('danger', 'Not Found');
      return res.redirect('/404');
    }

    const notification = user.notifications.splice(req.params.index, 1)[0];
    await user.save();

    if (!notification) {
      req.flash('danger', 'Not Found');
      return res.redirect('/404');
    }

    return res.redirect(notification.url);
  } catch (err) {
    req.logger.error(err);
    return res.status(500).send({
      success: 'false',
      message: err,
    });
  }
};

const clearNotifications = async (req, res) => {
  try {
    const { user } = req;

    user.notifications = [];
    await user.save();

    return res.status(200).send({
      success: 'true',
    });
  } catch (err) {
    req.logger.error(err);
    return res.status(500).send({
      success: 'false',
    });
  }
};

const followUser = async (req, res) => {
  try {
    const { user } = req;
    const other = await User.findById(req.params.id).exec();

    if (!other) {
      req.flash('danger', 'User not found');
      return res.redirect(303, '/404');
    }

    if (!other.users_following.includes(user.id)) {
      other.users_following.push(user.id);
    }
    if (!user.followed_users.includes(other.id)) {
      user.followed_users.push(other.id);
    }

    await addNotification(other, user, `/user/${user.id}`, `${user.username} has followed you!`);

    await Promise.all([user.save(), other.save()]);

    return res.redirect(303, `/user/${req.params.id}`);
  } catch (err) {
    req.logger.error(err);
    return res.status(500).send({
      success: 'false',
    });
  }
};

const unfollowUser = async (req, res) => {
  try {
    const { user } = req;
    const other = await User.findById(req.params.id).exec();

    if (!other) {
      req.flash('danger', 'User not found');
      return res.redirect(303, '/404');
    }

    other.users_following = other.users_following.filter((id) => !req.user._id.equals(id));
    user.followed_users = user.followed_users.filter((id) => id !== req.params.id);

    await Promise.all([user.save(), other.save()]);

    return res.redirect(303, `/user/${req.params.id}`);
  } catch (err) {
    req.logger.error(err);
    return res.status(500).send({
      success: 'false',
    });
  }
};

const viewResetPassword = async (req, res) => {
  // create a password reset page and return it here
  const passwordReset = PasswordReset.findById(req.params.id).lean();
  if (!passwordReset || passwordReset.expires < Date.now()) {
    req.flash('danger', 'Password recovery link expired');
    return res.redirect('/');
  }
  return render(req, res, 'PasswordResetPage');
};

const changePassword = async (req, res) => {
  if (!req.validated) {
    User.findById(req.user._id, () => {
      res.redirect(`/user/${req.user._id}/account`);
    });
  } else {
    User.findById(req.user._id, (_err, user) => {
      if (user) {
        bcrypt.compare(req.body.password, user.password, (_err2, isMatch) => {
          if (!isMatch) {
            req.flash('danger', 'Password is incorrect');
            return res.redirect(`/user/${req.user._id}/account?nav=password`);
          }
          if (req.body.password2 !== req.body.password3) {
            req.flash('danger', "New passwords don't match");
            return res.redirect(`/user/${req.user._id}/account?nav=password`);
          }
          return bcrypt.genSalt(10, (_err3, salt) => {
            bcrypt.hash(req.body.password2, salt, (err4, hash) => {
              if (err4) {
                req.logger.error(err4);
              } else {
                user.password = hash;
                user.save((err5) => {
                  if (err5) {
                    req.logger.error(err5);
                    req.flash('danger', 'Error saving user.');
                    return res.redirect(`/user/${req.user._id}/account?nav=password`);
                  }

                  req.flash('success', 'Password updated successfully');
                  return res.redirect(`/user/${req.user._id}/account?nav=password`);
                });
              }
            });
          });
        });
      }
    });
  }
};

const createUser = async (req, res) => {
  const email = req.body.email.toLowerCase();
  const { username, password } = req.body;

  const attempt = { email, username };

  if (!req.validated) {
    return render(req, res, 'RegisterPage', attempt);
  }
  const user = await User.findOne({
    username_lower: req.body.username.toLowerCase(),
  });

  if (user) {
    req.flash('danger', 'Username already taken.');
    return render(req, res, 'RegisterPage', attempt);
  }

  // check if user exists
  const user2 = await User.findOne({
    email: req.body.email.toLowerCase(),
  });

  if (user2) {
    req.flash('danger', 'Email already associated with an existing account.');
    return render(req, res, 'RegisterPage', attempt);
  }
  const newUser = new User({
    email,
    username,
    username_lower: username.toLowerCase(),
    password,
    confirm: 'false',
  });

  return bcrypt.genSalt(10, (_err3, salt) => {
    bcrypt.hash(newUser.password, salt, (err4, hash) => {
      if (err4) {
        req.logger.error(err4);
      } else {
        newUser.password = hash;
        newUser.confirmed = 'false';
        newUser.save((err5) => {
          if (err5) {
            req.logger.error(err5);
          } else {
            const smtpTransport = mailer.createTransport({
              name: process.env.SITE_HOSTNAME,
              secure: true,
              service: 'Gmail',
              auth: {
                user: process.env.EMAIL_CONFIG_USERNAME,
                pass: process.env.EMAIL_CONFIG_PASSWORD,
              },
            });
            const confirmEmail = new Email({
              message: {
                from: process.env.SUPPORT_EMAIL_FROM,
                to: email,
                subject: 'Confirm Account',
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

            confirmEmail
              .send({
                template: 'confirm_email',
                locals: {
                  id: newUser._id,
                },
              })
              .then(() => {
                // req.flash('success','Please check your email for confirmation link. It may be filtered as spam.');
                req.flash('success', 'Account successfully created. You are now able to login.');
                res.redirect(303, '/login');
              });
          }
        });
      }
    });
  });
};

const confirmUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user.confirmed === 'true') {
      req.flash('success', 'User already confirmed.');
      return res.redirect('/login');
    }
    user.confirmed = true;
    try {
      await user.save();
      req.flash('success', 'User successfully confirmed');
      return res.redirect(303, `/login`);
    } catch (err) {
      req.flash('danger', 'Failed to confirm user.');
      return res.redirect('/');
    }
  } catch (err) {
    req.flash('danger', 'Invalid confirmation link.');
    return res.redirect('/');
  }
};

const viewUserPage = async (req, res) => {
  try {
    let user = null;
    try {
      user = await User.findById(req.params.id, '_id username about users_following image_name image artist').lean();
      // eslint-disable-next-line no-empty
    } catch (err) {}

    if (!user) {
      user = await User.findOne(
        {
          username_lower: req.params.id.toLowerCase(),
        },
        '_id username about users_following image_name image artist',
      ).lean();
      if (!user) {
        req.flash('danger', 'User not found');
        return res.redirect('/404');
      }
    }

    const cubesQ = Cube.find({
      owner: user._id,
      ...(req.user && req.user._id.equals(user._id)
        ? {}
        : {
            isListed: true,
          }),
    }).lean();
    const followersQ = User.find(
      { _id: { $in: user.users_following } },
      '_id username image_name image artist users_following',
    ).lean();

    const [cubes, followers] = await Promise.all([cubesQ, followersQ]);

    const following = req.user && user.users_following ? user.users_following.includes(req.user.id) : false;
    delete user.users_following;

    return render(req, res, 'UserCubePage', {
      owner: user,
      cubes,
      followers,
      following,
    });
  } catch (err) {
    return handleRouteError(req, res, err, '/404');
  }
};

const viewUserDecks = async (req, res) => {
  try {
    const { userid } = req.params;
    const pagesize = 30;

    const userQ = User.findById(userid, '_id username users_following').lean();

    const decksQ = Deck.find(
      {
        owner: userid,
      },
      '_id seats date cube owner cubeOwner',
    )
      .sort({
        date: -1,
      })
      .skip(pagesize * Math.max(req.params.page, 0))
      .limit(pagesize)
      .lean();
    const numDecksQ = Deck.countDocuments({
      owner: userid,
    });

    const [user, numDecks, decks] = await Promise.all([userQ, numDecksQ, decksQ]);

    if (!user) {
      req.flash('danger', 'User not found');
      return res.redirect('/404');
    }

    const followers = await User.find(
      { _id: { $in: user.users_following } },
      '_id username image_name image artist users_following',
    );

    delete user.users_following;

    return render(req, res, 'UserDecksPage', {
      owner: user,
      followers,
      following: req.user && req.user.followed_users.includes(user.id),
      decks: decks || [],
      pages: Math.ceil(numDecks / pagesize),
      activePage: Math.max(req.params.page, 0),
    });
  } catch (err) {
    return handleRouteError(req, res, err, '/404');
  }
};

const viewUserBlog = async (req, res) => {
  try {
    const pagesize = 30;

    const user = await User.findById(req.params.userid, '_id username users_following').lean();

    const postsq = Blog.find({
      owner: user._id,
    })
      .sort({
        date: -1,
      })
      .skip(Math.max(req.params.page, 0) * pagesize)
      .limit(pagesize)
      .lean();

    const numBlogsq = Blog.countDocuments({
      owner: user._id,
    });

    const followersq = User.find(
      { _id: { $in: user.users_following } },
      '_id username image_name image artist users_following',
    );

    const [posts, numBlogs, followers] = await Promise.all([postsq, numBlogsq, followersq]);

    delete user.users_following;

    return render(
      req,
      res,
      'UserBlogPage',
      {
        owner: user,
        posts,
        canEdit: req.user && req.user._id.equals(user._id),
        followers,
        following: req.user && req.user.followed_users.includes(user.id),
        pages: Math.ceil(numBlogs / pagesize),
        activePage: Math.max(req.params.page, 0),
      },
      {
        title: user.username,
      },
    );
  } catch (err) {
    return handleRouteError(req, res, err, '/404');
  }
};

const updateUserInfo = async (req, res) => {
  try {
    const { user } = req;
    if (!req.validated) {
      return res.redirect(`/user/${user._id}/account`);
    }

    const duplicate = await User.findOne({
      username_lower: req.body.username.toLowerCase(),
      _id: {
        $ne: req.user._id,
      },
    });
    if (duplicate) {
      req.flash('danger', 'Username already taken.');
      return res.redirect(`/user/${user._id}/account`);
    }

    user.username = req.body.username;
    user.username_lower = req.body.username.toLowerCase();
    user.about = req.body.body;
    if (req.body.image) {
      const imageData = carddb.imagedict[req.body.image];
      if (imageData) {
        user.image = imageData.uri;
        user.artist = imageData.artist;
        user.image_name = req.body.image.replace(/ \[[^[\]]+]$/, '');
      }
    }
    const userQ = user.save();
    const cubesQ = Cube.updateMany(
      {
        owner: req.user._id,
      },
      {
        owner_name: req.body.username,
      },
    );
    await Promise.all([userQ, cubesQ]);

    req.flash('success', 'User information updated.');
    return res.redirect(`/user/${req.user._id}/account`);
  } catch (err) {
    return handleRouteError(req, res, err, `/user/${req.user._id}/account`);
  }
};

const updateDisplaySettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.theme = req.body.theme;
    user.hide_featured = req.body.hideFeatured === 'on';

    await user.save();

    req.flash('success', 'Your display preferences have been updated.');
    res.redirect(`/user/${user._id}/account`);
  } catch (err) {
    req.flash('danger', `Could not save preferences: ${err.message}`);
    res.redirect(`/user/${req.user.id}/account?nav=display`);
  }
};

const updateEmail = (req, res) => {
  User.findOne(
    {
      email: req.body.email.toLowerCase(),
    },
    (_err, user) => {
      if (user) {
        req.flash('danger', 'Email already associated with an existing account.');
        res.redirect(`/user/${req.user._id}/account?nav=email`);
      } else if (req.user) {
        req.user.email = req.body.email;
        req.user.save((err2) => {
          if (err2) {
            req.logger.error(err2);
            req.flash('danger', 'Error saving user.');
            res.redirect(`/user/${req.user._id}/account`);
          } else {
            req.flash('success', 'Your profile has been updated.');
            res.redirect(`/user/${req.user._id}/account`);
          }
        });
      } else {
        req.flash('danger', 'Not logged in.');
        res.redirect(`/user/${req.user._id}/account?nav=email`);
      }
    },
  );
};

const viewSocialPage = async (req, res) => {
  try {
    const followedCubesQ = Cube.find({ _id: { $in: req.user.followed_cubes } }, Cube.PREVIEW_FIELDS).lean();
    const followedUsersQ = User.find(
      { _id: { $in: req.user.followed_users } },
      '_id username image artist users_following',
    ).lean();
    const followersQ = User.find(
      { _id: { $in: req.user.users_following } },
      '_id username image artist users_following',
    ).lean();

    const [followedCubes, followedUsers, followers] = await Promise.all([followedCubesQ, followedUsersQ, followersQ]);

    return render(
      req,
      res,
      'UserSocialPage',
      {
        followedCubes,
        followedUsers,
        followers,
      },
      {
        title: 'Social',
      },
    );
  } catch (err) {
    return handleRouteError(req, res, err, '/');
  }
};

const viewAccountPage = async (req, res) => {
  return render(
    req,
    res,
    'UserAccountPage',
    {
      defaultNav: req.query.nav || 'profile',
    },
    {
      title: 'Account',
    },
  );
}

const router = express.Router();
router.use(csrfProtection);
router.get('/:id/cubes', getUserCubes);
router.get('/:id/feeditems/:skip', ensureAuth, getFeedItems);
router.put(
  '/:id/showtagcolors',
  ensureAuth,
  body('show_tag_colors').toBoolean(),
  jsonValidationErrors,
  wrapAsyncApi(saveShowTagColors),
);
router.get('/:id/notification/:index', ensureAuth, viewNotification);
router.delete('/:id/notification', ensureAuth, clearNotifications);
router.put('/:id/follow', ensureAuth, followUser);
router.delete('/:id/follow', ensureAuth, unfollowUser);
router.get('/:id/password/reset', viewResetPassword);
router.get('/', (req, res) => render(req, res, 'RegisterPage'));
router.post(
  '/',
  body('email', 'Email is required').notEmpty(),
  body('email', 'Email is not valid').isEmail(),
  body('email', 'Email must be between 5 and 100 characters.').isLength({
    min: 5,
    max: 100,
  }),
  body('password', 'Password is required').notEmpty(),
  body('password', 'Password must be between 8 and 24 characters.').isLength({
    min: 8,
    max: 24,
  }),
  ...usernameValid,
  flashValidationErrors,
  createUser,
);
router.get('/:id/confirm', confirmUser);
router.get('/:id', viewUserPage);
router.get('/:id/decks', (req, res) => res.redirect(`/user/${req.params.id}/decks/0`));
router.get('/:id/notifications', ensureAuth, (req, res) =>
  render(req, res, 'NotificationsPage', { notifications: req.user.old_notifications }),
);
router.get('/:userid/decks/:page', viewUserDecks);
router.get('/:userid/blog', (req, res) => res.redirect(`/user/${req.params.userid}/blog/0`));
router.get('/:userid/blog/:page', viewUserBlog);
router.put(
  '/:id/password',
  ensureAuth,
  body('password', 'Password must be between 8 and 24 characters.').isLength({
    min: 8,
    max: 24,
  }),
  flashValidationErrors,
  changePassword,
);
router.post('/:id', ensureAuth, ...usernameValid, flashValidationErrors, updateUserInfo);
router.post('/:id/email', ensureAuth, updateEmail);
router.post('/:id/display', ensureAuth, updateDisplaySettings);
router.get('/:id/social', ensureAuth, viewSocialPage);
router.get('/:id/packages/:page/:sort/:direction', (req, res) => getPackages(req, res, { userid: req.params.id }));
router.get('/:id/account', ensureAuth, viewAccountPage);
export default router;
