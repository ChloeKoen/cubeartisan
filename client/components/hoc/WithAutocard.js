import { Box, Stack, Tooltip, tooltipClasses, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { forwardRef, useContext } from 'react';

import CardImage from '@cubeartisan/client/components/CardImage.js';
import DisplayContext from '@cubeartisan/client/components/contexts/DisplayContext.js';
import TagContext from '@cubeartisan/client/components/contexts/TagContext.js';
import CardPropType from '@cubeartisan/client/proptypes/CardPropType.js';
import { cardFullName, cardTags } from '@cubeartisan/client/utils/Card.js';

const placeholderClass = () => '';

/**
 * @typedef {{ card?: import('@cubeartisan/client/proptypes/CardPropType.js').Card, front?: string, back?: string, tags?: string[] }} AutocardProps
 */

/**
 * @template {object} P
 * @param {import('react').ComponentType<P>} Tag - The tag for the autocard components
 * @returns {React.ForwardRefExoticComponent<AutocardProps & P>}
 */
const withAutocard = (Tag) => {
  /**
   * @typedef {import('react').ForwardRefExoticComponent<AutocardProps & P>} ComponentType
   * @type ComponentType
   */
  // @ts-ignore
  const WithAutocard = forwardRef(({ card, front, back, tags, ...props }, ref) => {
    const tagContext = useContext(TagContext);
    const tagColorClass = tagContext?.tagColorClass ?? placeholderClass;
    const { autoCardSize } = useContext(DisplayContext);
    tags = tags ?? cardTags(card) ?? [];
    const name = cardFullName(card);
    const width = back ? `calc(${autoCardSize} * 2)` : autoCardSize;
    const cardRender = (
      <Box sx={{ backgroundColor: 'background.darker', width }}>
        <Typography variant="subtitle1" noWrap sx={{ padding: 1, width: '100%' }}>
          {name}
        </Typography>
        <Stack direction="row">
          <CardImage key="front" card={card} width={autoCardSize} />
          {back && <CardImage key="back" card={card} width={autoCardSize} back />}
        </Stack>
        {tags && tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row', width: '100%', padding: 1 }}>
            {tags.map((tag, idx) => (
              <Typography
                sx={{
                  width: 'fit-content',
                  backgroundColor: tagColorClass(tag.trim()),
                  padding: 0.5,
                  margin: 0.5,
                  border: '1px solid',
                  borderRadius: '0.5rem',
                }}
                variant="body2"
                key={`${tag}-${idx}` /* eslint-disable-line */}
              >
                {tag.trim()}
              </Typography>
            ))}
          </Box>
        )}
      </Box>
    );
    return (
      <Tooltip
        title={cardRender}
        followCursor
        placement="right-end"
        sx={{
          [`& .${tooltipClasses.tooltip}`]: {
            width,
            padding: 0,
            backgroundColor: 'background.paper',
          },
        }}
      >
        <Tag ref={ref} card={card} {...props} />
      </Tooltip>
    );
  });
  WithAutocard.propTypes = {
    card: CardPropType.isRequired,
    front: PropTypes.string,
    back: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string.isRequired),
    ...Tag.propTypes,
  };
  WithAutocard.defaultProps = {
    card: null,
    front: null,
    back: null,
    tags: null,
    ...Tag.defaultProps,
  };
  if (typeof Tag === 'string') {
    WithAutocard.displayName = `${Tag}WithAutocard`;
  } else if (Tag.displayName) {
    WithAutocard.displayName = `${Tag.displayName}WithAutocard`;
  } else if (Tag.name) {
    WithAutocard.displayName = `${Tag.name}WithAutocard`;
  } else {
    WithAutocard.displayName = 'WithAutocard';
  }
  return WithAutocard;
};
export default withAutocard;
