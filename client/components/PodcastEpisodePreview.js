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
import React, { useState, useCallback } from 'react';
import PodcastPropType from '@cubeartisan/client/proptypes/PodcastPropType.js';

import { Card } from 'reactstrap';
import TimeAgo from '@cubeartisan/client/components/TimeAgo.js';
import AspectRatioBox from '@cubeartisan/client/components/AspectRatioBox.js';
import htmlToText from 'html-to-text';

const PodcastEpisodePreview = ({ episode }) => {
  const [hover, setHover] = useState(false);
  const handleMouseOver = useCallback((event) => setHover(!event.target.getAttribute('data-sublink')), []);
  const handleMouseOut = useCallback(() => setHover(false), []);
  const handleClick = useCallback(
    (event) => {
      if (!event.target.getAttribute('data-sublink')) {
        window.location.href = `/creators/podcast/${episode.podcast}/episode/${episode._id}`;
      }
    },
    [episode],
  );

  const short = htmlToText
    .fromString(episode.description, {
      wordwrap: 130,
    })
    .substring(0, 200);

  return (
    <Card
      className={hover ? 'cube-preview-card hover' : 'cube-preview-card'}
      onClick={handleClick}
      onMouseOver={handleMouseOver}
      onFocus={handleMouseOver}
      onMouseOut={handleMouseOut}
      onBlur={handleMouseOut}
    >
      <AspectRatioBox ratio={2} className="text-ellipsis">
        <img className="content-preview-img" alt={episode.title} src={episode.image} />
        <h6 className="content-preview-banner podcast-preview-bg">
          <strong>Podcast</strong>
        </h6>
      </AspectRatioBox>
      <div className="w-100 pt-1 pb-1 px-2">
        <h6 className="text-muted text-ellipsis mt-0 mb-0 pb-1">{episode.title}</h6>
        <small>
          <p className="mb-0">{`${short}...`}</p>
        </small>
      </div>
      <div className={`w-100 pb-1 pt-0 px-2 m-0 ${hover ? 'preview-footer-bg-hover' : 'preview-footer-bg'}`}>
        <small className="float-left">
          By{' '}
          <a data-sublink href={`/user/${episode.owner}`}>
            {episode.username}
          </a>
        </small>
        <small className="float-right">
          <TimeAgo date={episode.date} />
        </small>
      </div>
    </Card>
  );
};

PodcastEpisodePreview.propTypes = {
  episode: PodcastPropType.isRequired,
};

export default PodcastEpisodePreview;
