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
import { Button } from '@mui/material';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Card, Input, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';

import FilterCollapse from '@cubeartisan/client/components/FilterCollapse.js';
import TextField from '@cubeartisan/client/components/TextField.js';
import CSRFForm from '@cubeartisan/client/components/utils/CSRFForm.js';
import useToggle from '@cubeartisan/client/hooks/UseToggle.js';

const ResizeModal = ({ cubeID }) => {
  const [open, toggleOpen] = useToggle(false);
  const [size, setSize] = useState('720');
  const [filter, setFilter] = useState('');
  const [valid, setValid] = useState(true);

  useEffect(() => {
    /* eslint-disable-next-line */
    setValid(!isNaN(parseInt(size, 10)) && isFinite(size));
  }, [size]);

  return (
    <>
      <Button color="success" onClick={toggleOpen}>
        Resize
      </Button>
      <Modal isOpen={open} toggle={toggleOpen} size="lg">
        <ModalHeader toggle={toggleOpen}>Resize Cube</ModalHeader>
        <CSRFForm method="POST" action={`/cube/${cubeID}/resize/${size}`} encType="multipart/form-data">
          <ModalBody>
            <p>
              Resize your cube to the set size. This will add or remove cards from the suggestions found in the
              recommender analysis tab in order to reach the requested size. For best results, don't use large deltas
              (20 to 360 won't be great).
            </p>
            <TextField
              name="size"
              humanName="New Size"
              value={size}
              valid={size.length > 0 && valid}
              invalid={size.length > 0 && !valid}
              onChange={(event) => setSize(event.target.value)}
            />
            <Input type="hidden" name="filter" value={filter?.stringify} />
            <Card className="p-3">
              <h5>Filter for restrictions:</h5>
              <p>
                If you include a filter, this will only add or remove cards that match the filter. If there are not
                enough cards found to add or remove, your target size may not be reached.
              </p>
              <FilterCollapse defaultFilterText="" filter={filter} setFilter={setFilter} isOpen />
            </Card>
          </ModalBody>
          <ModalFooter>
            <Button color="success" type="submit" disabled={!valid}>
              Resize
            </Button>
            <Button color="secondary" onClick={toggleOpen}>
              Close
            </Button>
          </ModalFooter>
        </CSRFForm>
      </Modal>
    </>
  );
};

ResizeModal.propTypes = {
  cubeID: PropTypes.string.isRequired,
};

export default ResizeModal;
