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
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { ListGroupItem } from 'reactstrap';

import CardPropType from '@cubeartisan/client/proptypes/CardPropType.js';
import CubeAnalyticPropType from '@cubeartisan/client/proptypes/CubeAnalyticPropType.js';

import { compareStrings, SortableTable } from '@cubeartisan/client/components/SortableTable.js';
import ErrorBoundary from '@cubeartisan/client/components/ErrorBoundary.js';
import { cardName, mainboardRate, pickRate, encodeName } from '@cubeartisan/client/utils/Card.js';

import withAutocard from '@cubeartisan/client/components/hoc/WithAutocard.js';

const AutocardItem = withAutocard(ListGroupItem);

const renderCardLink = (card) => (
  <AutocardItem className="p-0" key={card.index} card={card} data-in-modal index={card.index}>
    <a href={`/card/${encodeName(card.cardID)}`} target="_blank" rel="noopener noreferrer">
      {cardName(card)}
    </a>
  </AutocardItem>
);

const renderPercent = (val) => {
  return <>{parseInt(val * 1000, 10) / 10}%</>;
};

const PlaytestData = ({ cards: allCards, cubeAnalytics }) => {
  const cardDict = useMemo(
    () => Object.fromEntries(allCards.map((card) => [cardName(card).toLowerCase(), card])),
    [allCards],
  );

  const data = useMemo(
    () =>
      cubeAnalytics.cards
        .filter((cardAnalytic) => cardDict[cardAnalytic.cardName])
        .map((analytic) => ({
          card: {
            exportValue: analytic.cardName,
            ...cardDict[analytic.cardName],
          },
          elo: Math.round(analytic.elo),
          mainboard: mainboardRate({ mainboards: analytic.mainboards, sideboards: analytic.sideboards }),
          pickrate: pickRate({ picks: analytic.picks, passes: analytic.passes }),
          picks: analytic.picks,
          mainboards: analytic.mainboards,
        })),
    [cubeAnalytics, cardDict],
  );

  return (
    <>
      <ErrorBoundary>
        <SortableTable
          columnProps={[
            {
              key: 'card',
              title: 'Card Name',
              heading: true,
              sortable: true,
              renderFn: renderCardLink,
            },
            { key: 'elo', title: 'Cube Elo', sortable: true, heading: false },
            { key: 'pickrate', title: 'Pick Rate', sortable: true, heading: false, renderFn: renderPercent },
            { key: 'picks', title: 'Pick Count', sortable: true, heading: false },
            { key: 'mainboard', title: 'Mainboard Rate', sortable: true, heading: false, renderFn: renderPercent },
            { key: 'mainboards', title: 'Mainboard Count', sortable: true, heading: false },
          ]}
          data={data}
          sortFns={{ label: compareStrings }}
        />
      </ErrorBoundary>
    </>
  );
};

PlaytestData.propTypes = {
  cards: PropTypes.arrayOf(CardPropType.isRequired).isRequired,
  cubeAnalytics: CubeAnalyticPropType.isRequired,
};

export default PlaytestData;
