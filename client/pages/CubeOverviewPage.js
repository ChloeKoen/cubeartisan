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
import React, { useState, useContext } from 'react';
import PropTypes from 'prop-types';
import styled from '@cubeartisan/client/utils/styledHelper.js';
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Col,
  Nav,
  Navbar,
  NavbarToggler,
  NavItem,
  NavLink,
  Row,
  UncontrolledAlert,
  UncontrolledCollapse,
} from 'reactstrap';
import { LinkExternalIcon, QuestionIcon } from '@primer/octicons-react';

import CubePropType from '@cubeartisan/client/proptypes/CubePropType.js';
import { csrfFetch } from '@cubeartisan/client/utils/CSRF.js';
import { getCubeId, getCubeDescription } from '@cubeartisan/client/utils/Util.js';
import BlogPost from '@cubeartisan/client/components/BlogPost.js';
import CSRFForm from '@cubeartisan/client/components/CSRFForm.js';
import CubeIdModal from '@cubeartisan/client/components/modals/CubeIdModal.js';
import CubeOverviewModal from '@cubeartisan/client/components/modals/CubeOverviewModal.js';
import CubeSettingsModal from '@cubeartisan/client/components/modals/CubeSettingsModal.js';
import CustomizeBasicsModal from '@cubeartisan/client/components/modals/CustomizeBasicsModal.js';
import DeleteCubeModal from '@cubeartisan/client/components/modals/DeleteCubeModal.js';
import DynamicFlash from '@cubeartisan/client/components/DynamicFlash.js';
import FollowersModal from '@cubeartisan/client/components/modals/FollowersModal.js';
import Markdown from '@cubeartisan/client/components/markdown/Markdown.js';
import TextBadge from '@cubeartisan/client/components/TextBadge.js';
import Tooltip from '@cubeartisan/client/components/Tooltip.js';
import withModal from '@cubeartisan/client/components/hoc/WithModal.js';
import UserContext from '@cubeartisan/client/components/contexts/UserContext.js';
import CubeLayout from '@cubeartisan/client/layouts/CubeLayout.js';
import MainLayout from '@cubeartisan/client/layouts/MainLayout.js';
import RenderToRoot from '@cubeartisan/client/utils/RenderToRoot.js';

const CubeOverviewModalLink = withModal(NavLink, CubeOverviewModal);
const FollowersModalLink = withModal('a', FollowersModal);
const CubeSettingsModalLink = withModal(NavLink, CubeSettingsModal);
const DeleteCubeModalLink = withModal(NavLink, DeleteCubeModal);
const CustomizeBasicsModalLink = withModal(NavLink, CustomizeBasicsModal);
const CubeIdModalLink = styled(withModal('span', CubeIdModal))`
  position: relative;
  top: 5px;
`; // the icon needs to be pulled down.

const SpacedHeader = styled.h6`
  margin-top: 10px;
`;
const CubeIdContainer = styled.div`
  padding-top: 3px;
  margin-right: 0.25rem;
`;

const CubeOverview = ({ post, priceOwned, pricePurchase, cube, followed, followers, loginCallback }) => {
  const user = useContext(UserContext);

  const [alerts, setAlerts] = useState([]);
  const [cubeState, setCubeState] = useState(cube);
  const [followedState, setFollowedState] = useState(followed);

  const addAlert = (color, message) => {
    setAlerts([...alerts, { color, message }]);
  };

  const onCubeUpdate = (updated) => {
    addAlert('success', 'Update Successful');
    setCubeState(updated);
  };

  const follow = async () => {
    setFollowedState(true);

    const response = await csrfFetch(`/cube/${cube._id}/follow`, {
      method: 'POST',
      headers: {},
    });
    if (!response.ok) console.error(response);
  };

  const unfollow = async () => {
    setFollowedState(false);

    const response = await csrfFetch(`/cube/${cube._id}/follow`, {
      method: 'DELETE',
      headers: {},
    });
    if (!response.ok) {
      console.error(response);
    }
  };
  return (
    <MainLayout loginCallback={loginCallback}>
      <CubeLayout cube={cubeState} activeLink="overview">
        {user && cubeState.owner === user.id ? (
          <Navbar expand="md" light className="usercontrols mb-3">
            <NavbarToggler
              className="ml-auto"
              id="cubeOverviewNavbarToggler"
              aria-controls="cubeOverviewNavbarCollapse"
            />
            <UncontrolledCollapse navbar id="cubeOverviewNavbarCollapse" toggler="#cubeOverviewNavbarToggler">
              <Nav navbar>
                <NavItem>
                  <CubeOverviewModalLink
                    modalProps={{
                      cube: cubeState,
                      cubeID: cubeState._id,
                      onError: (message) => addAlert('danger', message),
                      onCubeUpdate,
                    }}
                  >
                    Edit Overview
                  </CubeOverviewModalLink>
                </NavItem>
                <NavItem>
                  <CubeSettingsModalLink cube={cubeState} modalProps={{ addAlert, onCubeUpdate }}>
                    Edit Settings
                  </CubeSettingsModalLink>
                </NavItem>
                <NavItem>
                  <CustomizeBasicsModalLink
                    modalProps={{
                      cube: cubeState,
                      onError: (message) => {
                        addAlert('danger', message);
                      },
                      updateBasics: (basics) => {
                        const deepClone = JSON.parse(JSON.stringify(cubeState));
                        deepClone.basics = basics;
                        onCubeUpdate(deepClone);
                      },
                    }}
                  >
                    Customize Basics
                  </CustomizeBasicsModalLink>
                </NavItem>
                <NavItem>
                  <DeleteCubeModalLink modalProps={{ cubeid: cubeState._id }}>Delete Cube</DeleteCubeModalLink>
                </NavItem>
              </Nav>
            </UncontrolledCollapse>
          </Navbar>
        ) : (
          <Row className="mb-3" />
        )}
        <DynamicFlash />
        {alerts.map(({ color, message }, index) => (
          <UncontrolledAlert color={color} key={/* eslint-disable-line react/no-array-index-key */ index}>
            {message}
          </UncontrolledAlert>
        ))}
        <Row>
          <Col md="4" className="mb-3">
            <Card>
              <CardHeader>
                <Row>
                  <Col>
                    <h3>{cubeState.name}</h3>
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <SpacedHeader className="card-subtitle mb-2">
                      <FollowersModalLink href="#" modalProps={{ followers }}>
                        {cubeState.users_following.length}{' '}
                        {cubeState.users_following.length === 1 ? 'follower' : 'followers'}
                      </FollowersModalLink>
                    </SpacedHeader>
                  </Col>
                  <CubeIdContainer className="float-right">
                    <TextBadge name="Cube ID">
                      <Tooltip text="Click to copy to clipboard">
                        <button
                          type="button"
                          className="cube-id-btn"
                          onKeyDown={() => {}}
                          onClick={(e) => {
                            navigator.clipboard.writeText(getCubeId(cubeState));
                            e.target.blur();
                            addAlert('success', 'Cube ID copied to clipboard.');
                          }}
                        >
                          {getCubeId(cubeState)}
                        </button>
                      </Tooltip>
                    </TextBadge>
                  </CubeIdContainer>
                  <CubeIdModalLink
                    modalProps={{ fullID: cube._id, shortID: getCubeId(cubeState), alert: addAlert }}
                    aria-label="Show Cube IDs"
                    className="mr-2"
                  >
                    <QuestionIcon size="18" />
                  </CubeIdModalLink>
                </Row>
              </CardHeader>
              <div className="position-relative">
                <img className="card-img-top w-100" alt={cubeState.image_name} src={cubeState.image_uri} />
                <em className="cube-preview-artist">Art by {cubeState.image_artist}</em>
              </div>
              <CardBody className="pt-2 px-3 pb-3">
                {cube.type && <p className="mb-1">{getCubeDescription(cubeState)}</p>}
                <h6 className="mb-2">
                  <i>
                    Designed by
                    <a href={`/user/${cubeState.owner}`}> {cubeState.owner_name}</a>
                  </i>{' '}
                  • <a href={`/cube/${cubeState._id}/rss`}>RSS</a>
                </h6>
                <p>
                  <a href={`https://luckypaper.co/resources/cube-map/?cube=${cubeState._id}`}>
                    View in Cube Map <LinkExternalIcon size={16} />
                  </a>
                </p>
                {!cubeState.privatePrices && (
                  <Row noGutters className="mb-1">
                    {Number.isFinite(priceOwned) && (
                      <TextBadge name="Owned" className="mr-2">
                        <Tooltip text="TCGPlayer Market Price as owned (excluding cards marked Not Owned)">
                          ${Math.round(priceOwned).toLocaleString()}
                        </Tooltip>
                      </TextBadge>
                    )}
                    {Number.isFinite(pricePurchase) && (
                      <TextBadge name="Buy">
                        <Tooltip text="TCGPlayer Market Price for cheapest version of each card">
                          ${Math.round(pricePurchase).toLocaleString()}
                        </Tooltip>
                      </TextBadge>
                    )}
                  </Row>
                )}
                {user && user.roles.includes('Admin') && (
                  <CSRFForm
                    method={cubeState.isFeatured ? 'DELETE' : 'POST'}
                    id="featuredForm"
                    action={`/cube/${cubeState._id}/feature`}
                    className="mt-2"
                  >
                    <Button color="success" type="submit">
                      {' '}
                      {cubeState.isFeatured ? 'Remove from Featured' : 'Add to Featured'}
                    </Button>
                  </CSRFForm>
                )}
              </CardBody>
              {user &&
                cubeState.owner !== user.id &&
                (followedState ? (
                  <Button outline color="danger" className="rounded-0" onClick={unfollow}>
                    Unfollow
                  </Button>
                ) : (
                  <Button color="success" className="rounded-0" onClick={follow}>
                    Follow
                  </Button>
                ))}
            </Card>
          </Col>
          <Col>
            <Card>
              <CardHeader>
                <h5 className="card-title">Description</h5>
              </CardHeader>
              <CardBody>
                <Markdown markdown={cubeState.description || ''} />
              </CardBody>
              {cubeState.tags && cubeState.tags.length > 0 && (
                <CardFooter>
                  <div className="autocard-tags">
                    {cubeState.tags.map((tag) => (
                      <a href={`/cubes/search/tag:"${tag}"/0`}>
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      </a>
                    ))}
                  </div>
                </CardFooter>
              )}
            </Card>
          </Col>
        </Row>
        <div className="mb-3">{post && <BlogPost key={post._id} post={post} loggedIn={user !== null} />}</div>
      </CubeLayout>
    </MainLayout>
  );
};

CubeOverview.propTypes = {
  post: PropTypes.shape({
    _id: PropTypes.string.isRequired,
  }),
  priceOwned: PropTypes.number,
  pricePurchase: PropTypes.number,
  cube: CubePropType.isRequired,
  followed: PropTypes.bool.isRequired,
  followers: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
    }),
  ),
  loginCallback: PropTypes.string,
};

CubeOverview.defaultProps = {
  post: null,
  priceOwned: null,
  pricePurchase: null,
  followers: [],
  loginCallback: '/',
};

export default RenderToRoot(CubeOverview);
