import PropTypes from 'prop-types';
import ArticlePropType from '@hypercube/client/proptypes/ArticlePropType';

import { Row, Col } from 'reactstrap';

import DynamicFlash from '@hypercube/client/components/DynamicFlash';
import ArticlePreview from '@hypercube/client/components/ArticlePreview';
import Paginate from '@hypercube/client/components/Paginate';
import MainLayout from '@hypercube/client/layouts/MainLayout';
import RenderToRoot from '@hypercube/client/utils/RenderToRoot';

const PAGE_SIZE = 24;

const ArticlesPage = ({ loginCallback, articles, count, page }) => (
  <MainLayout loginCallback={loginCallback}>
    <DynamicFlash />
    <h4>Articles</h4>
    <Row>
      {articles.map((article) => (
        <Col className="mb-3" xs="12" sm="6" lg="4">
          <ArticlePreview article={article} />
        </Col>
      ))}
    </Row>
    {count > PAGE_SIZE && (
      <Paginate
        count={Math.ceil(count / PAGE_SIZE)}
        active={parseInt(page, 10)}
        urlF={(i) => `/content/articles/${i}`}
      />
    )}
  </MainLayout>
);

ArticlesPage.propTypes = {
  loginCallback: PropTypes.string,
  articles: PropTypes.arrayOf(ArticlePropType).isRequired,
  count: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
};

ArticlesPage.defaultProps = {
  loginCallback: '/',
};

export default RenderToRoot(ArticlesPage);
