import { useContext } from 'react';
import PropTypes from 'prop-types';

import { Collapse, Spinner } from 'reactstrap';

import UserContext from '@hypercube/client/contexts/UserContext';
import CommentList from '@hypercube/client/components/PagedCommentList';
import LinkButton from '@hypercube/client/components/LinkButton';
import CommentEntry from '@hypercube/client/components/CommentEntry';
import useToggle from '@hypercube/client/hooks/UseToggle';
import useComments from '@hypercube/client/hooks/UseComments';

const CommentsSection = ({ parent, parentType, collapse }) => {
  const user = useContext(UserContext);
  const userid = user && user.id;

  const [expanded, toggle] = useToggle(!collapse);
  const [replyExpanded, toggleReply] = useToggle(false);
  const [comments, addComment, loading, editComment] = useComments(parentType, parent);

  if (loading) {
    return (
      <div className="centered py-3">
        <Spinner className="position-absolute" />
      </div>
    );
  }

  return (
    <>
      {userid && (
        <div className="p-2 border-bottom">
          <Collapse isOpen={!replyExpanded}>
            <h6>
              <LinkButton className="ml-1" onClick={toggleReply}>
                Add a Comment
              </LinkButton>
            </h6>
          </Collapse>
          <CommentEntry submit={addComment} expanded={replyExpanded} toggle={toggleReply} />
        </div>
      )}
      {comments.length > 0 && (
        <>
          {collapse && (
            <div className="p-2 border-bottom">
              <h6>
                <LinkButton className="ml-1" onClick={toggle}>
                  {`${expanded ? 'Hide' : 'View'} Comments (${comments.length})`}
                </LinkButton>
              </h6>
            </div>
          )}
          <Collapse isOpen={expanded}>
            <CommentList comments={comments} editComment={editComment} />
          </Collapse>
        </>
      )}
    </>
  );
};

CommentsSection.propTypes = {
  parent: PropTypes.string.isRequired,
  parentType: PropTypes.string.isRequired,
  collapse: PropTypes.bool,
};

CommentsSection.defaultProps = {
  collapse: true,
};

export default CommentsSection;
