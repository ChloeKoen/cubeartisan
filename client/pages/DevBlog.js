import { useContext } from 'react';
import PropTypes from 'prop-types';

import { Card, CardBody, FormGroup, Label, Input, Button } from 'reactstrap';

import UserContext from '@hypercube/client/contexts/UserContext';
import Paginate from '@hypercube/client/components/Paginate';
import BlogPost from '@hypercube/client/components/BlogPost';
import CSRFForm from '@hypercube/client/components/CSRFForm';
import MainLayout from '@hypercube/client/layouts/MainLayout';
import RenderToRoot from '@hypercube/client/utils/RenderToRoot';
import DynamicFlash from '@hypercube/client/components/DynamicFlash';

const DevBlog = ({ blogs, pages, activePage, loginCallback }) => {
  const user = useContext(UserContext);

  return (
    <MainLayout loginCallback={loginCallback}>
      <DynamicFlash />
      <div className="mt-3">
        <h3 className="centered">Developer Blog</h3>
        {user && user.roles.includes('Admin') && (
          <Card>
            <CardBody>
              <h5>Create New Blog Post</h5>
              <CSRFForm method="POST" action="/dev/blogpost/">
                <FormGroup>
                  <Label>Title:</Label>
                  <Input maxLength="200" name="title" type="text" />
                </FormGroup>
                <FormGroup>
                  <Label>HTML:</Label>
                  <Input name="html" type="textarea" />
                </FormGroup>
                <Button type="submit" color="success" block outline>
                  Submit
                </Button>
              </CSRFForm>
            </CardBody>
          </Card>
        )}
        {pages > 1 && (
          <Paginate count={parseInt(pages, 10)} active={parseInt(activePage, 10)} urlF={(i) => `/dev/blog/${i}`} />
        )}
        {blogs.length > 0 ? (
          blogs.map((post) => <BlogPost key={post._id} post={post} />)
        ) : (
          <h5>No developer blogs have been posted.</h5>
        )}
        {pages > 1 && (
          <Paginate count={parseInt(pages, 10)} active={parseInt(activePage, 10)} urlF={(i) => `/dev/blog/${i}`} />
        )}
      </div>
    </MainLayout>
  );
};

DevBlog.propTypes = {
  blogs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  pages: PropTypes.number.isRequired,
  activePage: PropTypes.number.isRequired,
  loginCallback: PropTypes.string,
};

DevBlog.defaultProps = {
  loginCallback: '/',
};

export default RenderToRoot(DevBlog);
