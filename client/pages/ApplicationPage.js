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
import React from 'react';
import PropTypes from 'prop-types';

import { Card, CardHeader, CardBody, Input, Button } from 'reactstrap';

import DynamicFlash from '@cubeartisan/client/components/DynamicFlash.js';
import CSRFForm from '@cubeartisan/client/components/CSRFForm.js';
import MainLayout from '@cubeartisan/client/layouts/MainLayout.js';
import RenderToRoot from '@cubeartisan/client/utils/RenderToRoot.js';

export const AdminDashboardPage = ({ loginCallback, siteCustomizations }) => (
  <MainLayout loginCallback={loginCallback} siteCustomizations={siteCustomizations}>
    <DynamicFlash />
    <Card className="my-3 mx-4">
      <CSRFForm method="POST" action="/application" autoComplete="off">
        <CardHeader>
          <h5>Apply to be a {siteCustomizations.siteName} Content Creator Partner</h5>
        </CardHeader>
        <CardBody>
          <p>
            Content Creator Partners have access to post articles, videos, and podcasts on {siteCustomizations.siteName}
            . If you have more questions about the program, please reach out <a href="/contact">here</a>.
          </p>
          <p>
            Please explain why you want to become a content creator partner. Links to existing content are appreciated.
            If you do not have any existing content, what are your goals, and what sort of content are you looking to
            create?
          </p>
          <Input
            type="textarea"
            className="w-100 mb-3"
            id="info"
            name="info"
            placeholder="Please list as much info as you can here."
          />
          <Button color="success" block outline>
            Submit
          </Button>
        </CardBody>
      </CSRFForm>
    </Card>
  </MainLayout>
);

AdminDashboardPage.propTypes = {
  loginCallback: PropTypes.string,
  siteCustomizations: PropTypes.shape({
    discordUrl: PropTypes.string.isRequired,
    siteName: PropTypes.string.isRequired,
    sourceRepo: PropTypes.string.isRequired,
    supportEmail: PropTypes.string.isRequired,
  }).isRequired,
};

AdminDashboardPage.defaultProps = {
  loginCallback: '/',
};

export default RenderToRoot(AdminDashboardPage);
