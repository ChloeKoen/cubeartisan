import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import {
  Col,
  Nav,
  NavLink,
  Row,
  Card,
  CardBody,
  Label,
  UncontrolledDropdown,
  DropdownToggle,
  DropdownItem,
  DropdownMenu,
} from 'reactstrap';

import CubeLayout from 'layouts/CubeLayout';

import DynamicFlash from 'components/DynamicFlash';
import ErrorBoundary from 'components/ErrorBoundary';

import Averages from 'analytics/Averages';
import Chart from 'analytics/Chart';
import Tokens from 'analytics/Tokens';
import PivotTable from 'analytics/PivotTable';
import Table from 'analytics/Table';
import Cloud from 'analytics/Cloud';
import HyperGeom from 'analytics/HyperGeom';
import Suggestions from 'analytics/Suggestions';
import { cardCmc, cardDevotion, cardFoilPrice, cardNormalPrice, cardPower, cardPrice, cardToughness } from 'utils/Card';
import { csrfFetch } from 'utils/CSRF';
import FilterCollapse from 'components/FilterCollapse';
import useToggle from 'hooks/UseToggle';
import { calculateAsfans } from 'utils/draftutil';
import Query from 'utils/Query';
import { fromEntries } from 'utils/Util';

const CubeAnalysisPage = ({ cube, cubeID, defaultFilterText, defaultTab, defaultFormatId }) => {
  const [filter, setFilter] = useState(null);
  const [activeTab, setActiveTab] = useState(defaultTab ?? 0);
  const [adds, setAdds] = useState([]);
  const [cuts, setCuts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCollapseOpen, toggleFilterCollapse] = useToggle(false);
  const [useAsfans, toggleUseAsfans] = useToggle(false);
  const [draftFormat, setDraftFormat] = useState(defaultFormatId ?? cube.defaultDraftFormat ?? -1);
  const didMountRef1 = useRef(false);
  const didMountRef2 = useRef(false);
  console.log(activeTab);

  const setStandardDraftFormat = useCallback(() => setDraftFormat(-1), [setDraftFormat]);

  const asfans = useMemo(() => {
    if (useAsfans) {
      try {
        return calculateAsfans(cube, draftFormat);
      } catch (e) {
        console.error('Invalid Draft Format', draftFormat, cube.draft_formats[draftFormat], e);
        return fromEntries(cube.cards.map((card) => [card.cardID, 0]));
      }
    }
    return fromEntries(cube.cards.map((card) => [card.cardID, 1]));
  }, [cube, draftFormat, useAsfans]);

  useEffect(() => {
    if (didMountRef1.current) {
      Query.set('tab', activeTab);
    } else {
      const queryTab = Query.get('tab');
      if (queryTab || queryTab === 0) {
        setActiveTab(queryTab);
      }
      didMountRef1.current = true;
    }
  }, [activeTab]);

  useEffect(() => {
    if (didMountRef2.current) {
      Query.set('formatId', draftFormat);
    } else {
      const queryFormat = Query.get('formatId');
      if (queryFormat || queryFormat === 0) {
        setDraftFormat(queryFormat);
      }
      didMountRef2.current = true;
    }
  }, [draftFormat]);

  const cards = useMemo(
    () => (filter ? cube.cards.filter(filter) : cube.cards).map((card) => ({ ...card, asfan: asfans[card.cardID] })),
    [asfans, cube, filter],
  );

  const characteristics = {
    CMC: cardCmc,
    Power: (card) => parseInt(cardPower(card), 10),
    Toughness: (card) => parseInt(cardToughness(card), 10),
    Elo: (card) => parseFloat(card.details.elo, 10),
    Price: (card) => parseFloat(cardPrice(card), 10),
    'Price Foil': (card) => parseFloat(cardFoilPrice(card)),
    'Non-Foil Price': (card) => parseFloat(cardNormalPrice(card)),
    'Devotion to White': (card) => cardDevotion(card, 'w'),
    'Devotion to Blue': (card) => cardDevotion(card, 'u'),
    'Devotion to Black': (card) => cardDevotion(card, 'b'),
    'Devotion to Red': (card) => cardDevotion(card, 'r'),
    'Devotion to Green': (card) => cardDevotion(card, 'g'),
  };

  const analytics = [
    {
      name: 'Averages',
      usesAsfan: true,
      component: (collection) => <Averages cards={collection} characteristics={characteristics} />,
    },
    {
      name: 'Table',
      usesAsfan: true,
      component: (collection) => <Table cards={collection} />,
    },
    {
      name: 'Chart',
      usesAsfan: true,
      component: (collection) => <Chart cards={collection} characteristics={characteristics} />,
    },
    {
      name: 'Recommender',
      usesAsfan: false,
      component: (collection, cubeObj, addCards, cutCards, isLoading) => (
        <Suggestions
          cards={collection}
          cube={cubeObj}
          adds={addCards}
          cuts={cutCards}
          filter={filter}
          loading={isLoading}
        />
      ),
    },
    {
      name: 'Tokens',
      usesAsfan: false,
      component: (collection, cubeObj) => <Tokens cards={collection} cube={cubeObj} />,
    },
    {
      name: 'Tag Cloud',
      usesAsfan: true,
      component: (collection) => <Cloud cards={collection} />,
    },
    {
      name: 'Pivot Table',
      usesAsfan: false,
      component: (collection) => <PivotTable cards={collection} />,
    },
    {
      name: 'Hypergeometric Calculator',
      usesAsfan: false,
      component: (collection) => <HyperGeom cards={collection} />,
    },
  ];

  async function getData(url = '') {
    // Default options are marked with *
    const response = await csrfFetch(url, {
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      headers: {
        'Content-Type': 'application/json',
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const val = await response.json(); // parses JSON response into native JavaScript objects
    return val.result;
  }

  useEffect(() => {
    getData(`/cube/api/adds/${cubeID}`).then(({ toCut, toAdd }) => {
      setAdds(toAdd);
      setCuts(toCut);
      setLoading(false);
    });
  }, [cubeID]);

  return (
    <CubeLayout cube={cube} cubeID={cubeID} canEdit={false} activeLink="analysis">
      <DynamicFlash />
      <Row className="mt-3">
        <Col xs="12" lg="2">
          <Nav vertical="lg" pills className="justify-content-sm-start justify-content-center mb-3">
            {analytics.map((analytic, index) => (
              <NavLink key={analytic.name} active={activeTab === index} onClick={() => setActiveTab(index)} href="#">
                {analytic.name}
              </NavLink>
            ))}
          </Nav>
        </Col>
        <Col xs="12" lg="10" className="overflow-x">
          <Card className="mb-3">
            <CardBody>
              <NavLink href="#" onClick={toggleFilterCollapse}>
                <h5>{filterCollapseOpen ? 'Hide Filter' : 'Show Filter'}</h5>
              </NavLink>
              <FilterCollapse
                defaultFilterText={defaultFilterText}
                filter={filter}
                setFilter={setFilter}
                numCards={cards.length}
                isOpen={filterCollapseOpen}
              />
            </CardBody>
          </Card>
          {analytics[activeTab].usesAsfan && (
            <Card className="mb-3">
              <CardBody>
                <Row>
                  <Col>
                    <Label>
                      <input type="checkbox" checked={useAsfans} onClick={toggleUseAsfans} /> Use expected count per
                      player in a draft format instead of card count.
                    </Label>
                  </Col>
                  <Col>
                    {useAsfans && (
                      <UncontrolledDropdown>
                        <DropdownToggle caret>
                          {draftFormat < 0 ? 'Standard Draft Format' : cube.draft_formats[draftFormat].title}
                        </DropdownToggle>
                        <DropdownMenu>
                          <DropdownItem onClick={setStandardDraftFormat}>Standard Draft Format</DropdownItem>
                          <DropdownItem header>Custom Formats</DropdownItem>
                          {cube.draft_formats.map((format, index) => (
                            <DropdownItem key={format._id} onClick={() => setDraftFormat(index)}>
                              {format.title}
                            </DropdownItem>
                          ))}
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    )}
                  </Col>
                </Row>
              </CardBody>
            </Card>
          )}
          <Card>
            <CardBody>
              <ErrorBoundary>{analytics[activeTab].component(cards, cube, adds, cuts, loading)}</ErrorBoundary>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </CubeLayout>
  );
};

CubeAnalysisPage.propTypes = {
  cube: PropTypes.shape({
    cards: PropTypes.arrayOf(PropTypes.shape({})),
    draft_formats: PropTypes.arrayOf(PropTypes.shape({ _id: PropTypes.string, title: PropTypes.string })),
    defaultDraftFormat: PropTypes.number,
  }).isRequired,
  cubeID: PropTypes.string.isRequired,
  defaultFilterText: PropTypes.string,
  defaultTab: PropTypes.number,
  defaultFormatId: PropTypes.number,
};

CubeAnalysisPage.defaultProps = {
  defaultFilterText: '',
  defaultTab: 0,
  defaultFormatId: null,
};

export default CubeAnalysisPage;
