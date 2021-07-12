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
import React, { useCallback, useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';

import DeckDeleteModal from '@cubeartisan/client/components/modals/DeckDeleteModal.js';
import CardPropType from '@cubeartisan/client/proptypes/CardPropType.js';

import { Collapse, Nav, Navbar, NavbarToggler, NavItem, NavLink, Input } from 'reactstrap';

import CSRFForm from '@cubeartisan/client/components/CSRFForm.js';
import CustomImageToggler from '@cubeartisan/client/components/CustomImageToggler.js';
import { buildDeck } from '@cubeartisan/client/drafting/deckutil.js';
import BasicsModal from '@cubeartisan/client/components/modals/BasicsModal.js';
import withModal from '@cubeartisan/client/components/hoc/WithModal.js';

const DeleteDeckModalLink = withModal(NavLink, DeckDeleteModal);
const BasicsModalLink = withModal(NavLink, BasicsModal);

const DeckbuilderNavbar = ({ deck, addBasics, name, description, className, setSideboard, setDeck, ...props }) => {
  const { basics } = deck;
  const [isOpen, setIsOpen] = useState(false);

  const toggleNavbar = useCallback(
    (event) => {
      event.preventDefault();
      setIsOpen(!isOpen);
    },
    [isOpen],
  );

  const saveForm = useRef(null);
  const saveDeck = useCallback(
    (event) => {
      event.preventDefault();
      if (saveForm.current) {
        saveForm.current.submit();
      }
    },
    [saveForm],
  );

  const stripped = useMemo(() => {
    const res = JSON.parse(JSON.stringify(deck));

    for (const collection of [res.playerdeck, res.playersideboard]) {
      for (const row of collection) {
        for (const column of row) {
          column.forEach((card, index) => {
            if (!Number.isFinite(card)) {
              column[index] = deck.cards.findIndex((deckCard) => deckCard.cardID === card.cardID);
            }
          });
        }
      }
    }
    const result = JSON.stringify({
      playersideboard: res.playersideboard,
      playerdeck: res.playerdeck,
    });

    return result;
  }, [deck]);

  const autoBuildDeck = useCallback(async () => {
    let main = deck.seats[0].pickorder;
    if (main.length <= 0) {
      main = Array.from(deck.seats[0].deck.flat(3)).concat(...deck.seats[0].sideboard.flat(3));
    }
    const { sideboard: side, deck: newDeck } = await buildDeck(deck.cards, main, basics);
    const newSide = side.map((row) => row.map((col) => col.map((ci) => deck.cards[ci])));
    const newDeckCards = newDeck.map((row) => row.map((col) => col.map((ci) => deck.cards[ci])));
    setSideboard(newSide);
    setDeck(newDeckCards);
  }, [deck, basics, setDeck, setSideboard]);

  return (
    <Navbar expand="md" light className={`usercontrols ${className}`} {...props}>
      <NavbarToggler onClick={toggleNavbar} className="ml-auto" />
      <Collapse isOpen={isOpen} navbar>
        <Nav navbar>
          <NavItem>
            <NavLink href="#" onClick={saveDeck}>
              Save Deck
            </NavLink>
            <CSRFForm className="d-none" innerRef={saveForm} method="POST" action={`/deck/${deck._id}`}>
              <Input type="hidden" name="draftraw" value={stripped} />
              <Input type="hidden" name="name" value={JSON.stringify(name)} />
              <Input type="hidden" name="description" value={JSON.stringify(description)} />
            </CSRFForm>
          </NavItem>
          <NavItem>
            <DeleteDeckModalLink modalProps={{ deckID: deck._id, cubeID: deck.cube }}>Delete Deck</DeleteDeckModalLink>
          </NavItem>
          <NavItem>
            <BasicsModalLink
              modalProps={{
                basics,
                addBasics,
                deck: deck.playerdeck.flat(3).map(({ index }) => index),
                cards: deck.cards,
              }}
            >
              Add Basic Lands
            </BasicsModalLink>
          </NavItem>
          <NavItem>
            <NavLink href="#" onClick={autoBuildDeck}>
              Build for Me
            </NavLink>
          </NavItem>
          <CustomImageToggler />
        </Nav>
      </Collapse>
    </Navbar>
  );
};

DeckbuilderNavbar.propTypes = {
  deck: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    cube: PropTypes.string.isRequired,
    playerdeck: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.arrayOf(CardPropType.isRequired).isRequired).isRequired)
      .isRequired,
    playersideboard: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.object)).isRequired,
    cards: PropTypes.arrayOf(PropTypes.shape({ cardID: PropTypes.string })).isRequired,
    basics: PropTypes.arrayOf(PropTypes.number.isRequired).isRequired,
    seats: PropTypes.arrayOf(
      PropTypes.shape({
        pickorder: PropTypes.arrayOf(PropTypes.number).isRequired,
        deck: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
        sideboard: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
      }).isRequired,
    ).isRequired,
  }).isRequired,
  addBasics: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  className: PropTypes.string,
  setDeck: PropTypes.func.isRequired,
  setSideboard: PropTypes.func.isRequired,
};

DeckbuilderNavbar.defaultProps = {
  className: null,
};

export default DeckbuilderNavbar;
