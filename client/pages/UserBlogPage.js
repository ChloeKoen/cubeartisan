import PropTypes from 'prop-types';

import UserLayout from '@hypercube/client/layouts/UserLayout';
import BlogPost from '@hypercube/client/components/BlogPost';
import Paginate from '@hypercube/client/components/Paginate';
import DynamicFlash from '@hypercube/client/components/DynamicFlash';
import MainLayout from '@hypercube/client/layouts/MainLayout';
import RenderToRoot from '@hypercube/client/utils/RenderToRoot';

const UserBlogPage = ({ followers, following, posts, owner, loginCallback, pages, activePage }) => (
  <MainLayout loginCallback={loginCallback}>
    <UserLayout user={owner} followers={followers} following={following} activeLink="blog">
      <DynamicFlash />

      {pages > 1 && (
        <Paginate count={pages} active={parseInt(activePage, 10)} urlF={(i) => `/user/blog/${owner._id}/${i}`} />
      )}
      {posts.length > 0 ? (
        posts.slice(0).map((post) => <BlogPost key={post._id} post={post} loggedIn />)
      ) : (
        <p>This user has no blog posts!</p>
      )}

      {pages > 1 && (
        <Paginate count={pages} active={parseInt(activePage, 10)} urlF={(i) => `/user/blog/${owner._id}/${i}`} />
      )}
    </UserLayout>
  </MainLayout>
);

UserBlogPage.propTypes = {
  owner: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }).isRequired,
  followers: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  following: PropTypes.bool.isRequired,
  posts: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  pages: PropTypes.number.isRequired,
  activePage: PropTypes.number.isRequired,
  loginCallback: PropTypes.string,
};

UserBlogPage.defaultProps = {
  loginCallback: '/',
};

export default RenderToRoot(UserBlogPage);
