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
import React, { useCallback, useEffect, useState } from 'react';
import {
  Col,
  Collapse,
  CustomInput,
  Form,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
} from 'reactstrap';

import AutocompleteInput from '@cubeartisan/client/components/AutocompleteInput.js';
import { ColorChecksAddon, ColorChecksControl } from '@cubeartisan/client/components/ColorCheck.js';
import CubeContext from '@cubeartisan/client/components/contexts/CubeContext.js';
import NumericField from '@cubeartisan/client/components/NumericField.js';
import TextField from '@cubeartisan/client/components/TextField.js';
import { makeFilter } from '@cubeartisan/client/filtering/FilterCards.js';
import useQueryParam from '@cubeartisan/client/hooks/useQueryParam.js';
import useToggle from '@cubeartisan/client/hooks/UseToggle.js';
import { CARD_CATEGORY_DETECTORS } from '@cubeartisan/client/utils/Card.js';

const allFields = [
  'name',
  'oracle',
  'mv',
  'mana',
  'type',
  'set',
  'tag',
  'status',
  'finish',
  'price',
  'priceFoil',
  'priceEur',
  'priceTix',
  'elo',
  'power',
  'toughness',
  'loyalty',
  'rarity',
  'legality',
  'artist',
  'is',
];
const numFields = [
  'mv',
  'price',
  'priceFoil',
  'priceEur',
  'priceTix',
  'elo',
  'power',
  'toughness',
  'loyalty',
  'rarity',
  'legality',
];
const colorFields = ['color', 'identity'];

// TODO: Port to @mui

const AdvancedFilterModal = ({ isOpen, toggle, apply, values, onChange, ...props }) => (
  <Modal isOpen={isOpen} toggle={toggle} size="lg" {...props}>
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        apply();
      }}
    >
      <ModalHeader toggle={toggle}>Advanced Filters</ModalHeader>
      <ModalBody>
        <TextField
          name="name"
          humanName="Card Name"
          placeholder={'Any words in the name, e.g. "Fire"'}
          value={values.name}
          onChange={onChange}
        />
        <TextField
          name="oracle"
          humanName="Oracle Text"
          placeholder={'Any text, e.g. "Draw a card"'}
          value={values.oracle}
          onChange={onChange}
        />
        <NumericField
          name="mv"
          humanName="Mana Value"
          placeholder={'Any value, e.g. "2"'}
          value={values.cmc}
          valueOp={values.cmcOp}
          onChange={onChange}
        />
        <InputGroup className="mb-3">
          <InputGroupAddon addonType="prepend">
            <InputGroupText>Color</InputGroupText>
          </InputGroupAddon>
          <ColorChecksAddon colorless prefix="color" values={values} onChange={onChange} />
          <CustomInput type="select" id="colorOp" name="colorOp" value={values.colorOp} onChange={onChange}>
            <option value="=">Exactly these colors</option>
            <option value=">=">Including these colors</option>
            <option value="<=">At most these colors</option>
          </CustomInput>
        </InputGroup>
        <InputGroup className="mb-3">
          <InputGroupAddon addonType="prepend">
            <InputGroupText>Color Identity</InputGroupText>
          </InputGroupAddon>
          <ColorChecksAddon colorless prefix="identity" values={values} onChange={onChange} />
          <CustomInput type="select" id="identityOp" name="identityOp" value={values.identityOp} onChange={onChange}>
            <option value="=">Exactly these colors</option>
            <option value=">=">Including these colors</option>
            <option value="<=">At most these colors</option>
          </CustomInput>
        </InputGroup>
        <TextField
          name="mana"
          humanName="Mana Cost"
          placeholder={'Any mana cost, e.g. "{1}{W}"'}
          value={values.mana}
          onChange={onChange}
        />
        <InputGroup className="mb-3">
          <InputGroupAddon addonType="prepend">
            <InputGroupText>Manacost Type</InputGroupText>
          </InputGroupAddon>
          <Input type="select" name="is" value={values.is} onChange={onChange}>
            {Object.keys(CARD_CATEGORY_DETECTORS).map((type) => (
              <option key={type}>{type}</option>
            ))}
          </Input>
        </InputGroup>
        <TextField
          name="type"
          humanName="Type Line"
          placeholder="Choose any card type, supertype, or subtypes to match"
          value={values.type}
          onChange={onChange}
        />
        <TextField
          name="set"
          humanName="Set"
          placeholder={'Any set code, e.g. "WAR"'}
          value={values.set}
          onChange={onChange}
        />
        <CubeContext.Consumer>
          {
            ({ cubeID }) =>
              cubeID && (
                <InputGroup className="mb-3" {...props}>
                  <InputGroupAddon addonType="prepend">
                    <InputGroupText>Tag</InputGroupText>
                  </InputGroupAddon>
                  <AutocompleteInput
                    treeUrl={`/cube/${cubeID}/cards/tags`}
                    treePath="tags"
                    type="text"
                    name="tag"
                    value={values.tag}
                    onChange={onChange}
                    placeholder={'Any text, e.g. "Zombie Testing"'}
                    autoComplete="off"
                    data-lpignore
                    className="tag-autocomplete-input"
                    wrapperClassName="tag-autocomplete-wrapper"
                  />
                </InputGroup>
              )
            // eslint-disable-next-line react/jsx-curly-newline
          }
        </CubeContext.Consumer>
        <Row className="row-mid-padding">
          <Col md={6}>
            <InputGroup className="mb-3">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>Status</InputGroupText>
              </InputGroupAddon>
              <Input type="select" name="status" value={values.status} onChange={onChange}>
                {['', 'Not Owned', 'Ordered', 'Owned', 'Premium Owned', 'Proxied'].map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </Input>
            </InputGroup>
          </Col>
          <Col md={6}>
            <InputGroup className="mb-3">
              <InputGroupAddon addonType="prepend">
                <InputGroupText>Finish</InputGroupText>
              </InputGroupAddon>
              <Input type="select" name="finish" value={values.finish} onChange={onChange}>
                {['', 'Foil', 'Non-foil'].map((finish) => (
                  <option key={finish}>{finish}</option>
                ))}
              </Input>
            </InputGroup>
          </Col>
        </Row>
        <Row className="row-mid-padding">
          <Col md={6}>
            <NumericField
              name="price"
              humanName="Price USD"
              placeholder={'Any decimal number, e.g. "3.50"'}
              value={values.price}
              valueOp={values.priceOp}
              onChange={onChange}
            />
          </Col>
          <Col md={6}>
            <NumericField
              name="priceFoil"
              humanName="Price USD Foil"
              placeholder={'Any decimal number, e.g. "14.00"'}
              value={values.priceFoil}
              valueOp={values.priceFoilOp}
              onChange={onChange}
            />
          </Col>
          <Col md={6}>
            <NumericField
              name="priceEur"
              humanName="Price EUR"
              placeholder={'Any decimal number, e.g. "14.00"'}
              value={values.priceEur}
              valueOp={values.priceEurOp}
              onChange={onChange}
            />
          </Col>
          <Col md={6}>
            <NumericField
              name="priceTix"
              humanName="MTGO TIX"
              placeholder={'Any decimal number, e.g. "14.00"'}
              value={values.priceTix}
              valueOp={values.priceTixOp}
              onChange={onChange}
            />
          </Col>
        </Row>
        <NumericField
          name="elo"
          humanName="Elo"
          placeholder={'Any integer number, e.g. "1200"'}
          value={values.elo}
          valueOp={values.eloOp}
          onChange={onChange}
        />
        <NumericField
          name="power"
          humanName="Power"
          placeholder={'Any value, e.g. "2"'}
          value={values.power}
          valueOp={values.powerOp}
          onChange={onChange}
        />
        <NumericField
          name="toughness"
          humanName="Toughness"
          placeholder={'Any value, e.g. "2"'}
          value={values.toughness}
          valueOp={values.toughnessOp}
          onChange={onChange}
        />
        <NumericField
          name="loyalty"
          humanName="Loyalty"
          placeholder={'Any value, e.g. "3"'}
          value={values.loyalty}
          valueOp={values.loyaltyOp}
          onChange={onChange}
        />
        <NumericField
          name="rarity"
          humanName="Rarity"
          placeholder={'Any rarity, e.g. "common"'}
          value={values.rarity}
          valueOp={values.rarityOp}
          onChange={onChange}
        />
        <InputGroup className="mb-3" {...props}>
          <InputGroupAddon addonType="prepend">
            <InputGroupText>Legality</InputGroupText>
          </InputGroupAddon>
          <CustomInput type="select" id="legalityOp" name="legalityOp" onChange={onChange}>
            <option value="=">legal</option>
            <option value="!=">not legal</option>
          </CustomInput>
          <Input type="select" name="legality" value={values.legality} onChange={onChange}>
            {[
              '',
              'Standard',
              'Pioneer',
              'Modern',
              'Legacy',
              'Vintage',
              'Brawl',
              'Historic',
              'Pauper',
              'Penny',
              'Commander',
            ].map((legality) => (
              <option key={legality}>{legality}</option>
            ))}
          </Input>
        </InputGroup>
        <TextField
          name="artist"
          humanName="Artist"
          placeholder={'Any text, e.g. "seb"'}
          value={values.artist}
          onChange={onChange}
        />
      </ModalBody>
      <ModalFooter>
        <Button color="warning" aria-label="Close" onClick={toggle}>
          Cancel
        </Button>
        <Button color="success" type="submit">
          Apply
        </Button>
      </ModalFooter>
    </Form>
  </Modal>
);
AdvancedFilterModal.propTypes = {
  isOpen: PropTypes.func.isRequired,
  toggle: PropTypes.func.isRequired,
  apply: PropTypes.func.isRequired,
  values: PropTypes.shape({
    name: PropTypes.string,
    oracle: PropTypes.string,
    cmc: PropTypes.string,
    cmcOp: PropTypes.string,
    color: PropTypes.arrayOf(PropTypes.string.isRequired),
    colorOp: PropTypes.string,
    identity: PropTypes.arrayOf(PropTypes.string.isRequired),
    identityOp: PropTypes.string,
    is: PropTypes.string,
    mana: PropTypes.string,
    type: PropTypes.string,
    set: PropTypes.string,
    tag: PropTypes.string,
    status: PropTypes.string,
    finish: PropTypes.string,
    price: PropTypes.string,
    priceOp: PropTypes.string,
    priceFoil: PropTypes.string,
    priceFoilOp: PropTypes.string,
    priceEur: PropTypes.string,
    priceEurOp: PropTypes.string,
    priceTix: PropTypes.string,
    priceTixOp: PropTypes.string,
    elo: PropTypes.string,
    eloOp: PropTypes.string,
    power: PropTypes.string,
    powerOp: PropTypes.string,
    toughness: PropTypes.string,
    toughnessOp: PropTypes.string,
    loyalty: PropTypes.string,
    loyaltyOp: PropTypes.string,
    rarity: PropTypes.string,
    rarityOp: PropTypes.string,
    legalityOp: PropTypes.string,
    legality: PropTypes.string,
    artist: PropTypes.string,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
};

const FilterCollapse = ({ filter, setFilter, numCards, numShown, defaultFilterText, noCount, ...props }) => {
  const [advancedOpen, toggleAdvancedOpen, , closeAdvanced] = useToggle(false);
  const [filterInput, setFilterInput] = useQueryParam('filter', defaultFilterText ?? '');
  const [values, setValues] = useState({
    ...Object.fromEntries(allFields.map((n) => [n, ''])),
    ...Object.fromEntries(numFields.map((n) => [`${n}Op`, '='])),
    ...Object.fromEntries(colorFields.map((n) => [`${n}Op`, '='])),
    ...Object.fromEntries(colorFields.flatMap((n) => Array.from('WUBRG', (c) => [n + c, false]))),
    typeQuick: '',
    cmcQuick: '',
    cmcQuickOp: '<=',
    textQuick: '',
  });

  const updateFilter = useCallback(
    async (filterValue) => {
      filterValue = filterValue ?? '';
      if (filterValue !== (filter?.stringify ?? '')) {
        if (filterValue === '') {
          setFilter(null);
        } else {
          const { filter: newFilter, err } = makeFilter(filterValue);
          if (err) {
            console.error(err);
          } else {
            setFilter(() => newFilter);
          }
        }
      }
    },
    [filter?.stringify, setFilter],
  );

  useEffect(() => {
    updateFilter(filterInput);
    // Disable since this is the proper way to ensure it only runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyAdvanced = async () => {
    // Advanced Filter change. Render to filter input.
    const tokens = [];
    for (const name of allFields) {
      if (values[name]) {
        const op = numFields.includes(name) ? values[`${name}Op`] || '=' : ':';
        let value = values[name].replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        if (value.indexOf(' ') > -1) {
          value = `"${value}"`;
        }
        tokens.push(`${name}${op}${value}`);
      }
    }
    for (const name of colorFields) {
      const colors = [];
      const op = values[`${name}Op`] || '=';
      for (const color of Array.from('WUBRG')) {
        if (values[name + color]) {
          colors.push(color);
        }
      }
      if (colors.length > 0) {
        tokens.push(`${name}${op}${colors.join('')}`);
      }
    }
    const advancedFilterInput = tokens.join(' ');
    closeAdvanced();
    setFilterInput(advancedFilterInput);
    updateFilter(advancedFilterInput);
  };

  const applyQuick = async (event) => {
    event.preventDefault();
    const tokens = [];
    if (values.cmcQuick) {
      tokens.push(`mv${values.cmcQuickOp}${values.cmcQuick}`);
    }
    if (values.typeQuick) {
      if (values.typeQuick.includes(' ')) {
        tokens.push(`type:"${values.typeQuick.replace(/"/g, '\\""')}"`);
      } else {
        tokens.push(`type:${values.typeQuick}`);
      }
    }
    if (values.textQuick) {
      if (values.textQuick.includes(' ')) {
        tokens.push(`text:"${values.textQuick.replace(/"/g, '\\""')}"`);
      } else {
        tokens.push(`type:${values.textQuick}`);
      }
    }
    const quickFilterInput = tokens.join(' ');
    setFilterInput(quickFilterInput);
    return updateFilter(quickFilterInput);
  };

  const handleChange = (event) => {
    const { target } = event;
    const value = ['checkbox', 'radio'].includes(target.type) ? target.checked : target.value;
    const { name } = target;
    setValues((oldValues) => ({ ...oldValues, [name]: value }));
  };

  const changeFilterInput = (event) => setFilterInput(event.target.value);

  const apply = (event) => {
    event.preventDefault();
    return updateFilter(filterInput);
  };

  const handleKeyDown = (event) => {
    if (event.keyCode === 13 /* ENTER */) {
      return apply(event);
    }
    return Promise.resolve(null);
  };

  const reset = () => {
    setFilterInput('');
    return updateFilter('');
  };

  const { err } = makeFilter(filterInput);
  const valid = !err;
  if (err) {
    console.warn('Error parsing', err);
  }
  const appliedText = `Filters applied${typeof numCards !== 'undefined' ? `: ${numCards} cards` : ''}${
    typeof numShown !== 'undefined' ? `, ${numShown} shown` : ''
  }.`;
  return (
    <Collapse className="px-3" {...props}>
      <Row>
        <Col>
          <Form>
            <InputGroup className="mb-3">
              <InputGroupAddon addonType="prepend">
                <InputGroupText htmlFor="filterInput">Filter</InputGroupText>
              </InputGroupAddon>
              <Input
                type="text"
                id="filterInput"
                name="filterInput"
                placeholder={'name:"Ambush Viper"'}
                valid={filterInput.length > 0 && valid}
                invalid={filterInput.length > 0 && !valid}
                value={filterInput}
                onChange={changeFilterInput}
                onKeyDown={handleKeyDown}
              />
              <InputGroupAddon addonType="append">
                <Button color="success" variant="contained" onClick={apply}>
                  Apply
                </Button>
              </InputGroupAddon>
            </InputGroup>
          </Form>
        </Col>
      </Row>
      <Row sx={{ margin: '0, -5' }}>
        <Form inline>
          <Col sx={{ padding: '0 5' }} xs="auto">
            <ColorChecksControl
              size="sm"
              className="mb-3"
              colorless
              prefix="colorQuick"
              values={values}
              onChange={handleChange}
            />
          </Col>
          <Col sx={{ padding: '0 5' }} xs="auto">
            <InputGroup size="sm" className="mb-3">
              <InputGroupAddon addonType="prepend">
                <InputGroupText htmlFor="cmcQuick">Mana Value</InputGroupText>
              </InputGroupAddon>
              <Input
                sx={{ alignText: 'center', maxWidth: '3.5rem' }}
                id="cmcQickOp"
                type="select"
                name="cmcQuickOp"
                value={values.cmcQuickOp}
                onChange={handleChange}
                bsSize="sm"
              >
                <option>{'>'}</option>
                <option>{'>='}</option>
                <option>=</option>
                <option>{'<='}</option>
                <option>{'<'}</option>
              </Input>
              <InputGroupAddon addonType="append">
                <Input
                  name="cmcQuick"
                  id="cmcQuick"
                  value={values.cmcQuick}
                  onChange={handleChange}
                  bsSize="sm"
                  className="square-left"
                  sx={{ maxWidth: '3rem' }}
                />
              </InputGroupAddon>
            </InputGroup>
          </Col>
          <Col sx={{ padding: '0 5' }} xs="auto">
            <InputGroup size="sm" className="mb-3">
              <InputGroupAddon addonType="prepend">
                <InputGroupText htmlFor="typeQuick">Type</InputGroupText>
              </InputGroupAddon>
              <Input
                name="typeQuick"
                id="typeQuick"
                value={values.typeQuick}
                onChange={handleChange}
                sx={{ width: '8rem' }}
              />
            </InputGroup>
          </Col>
          <Col sx={{ padding: '0 5' }} xs="auto">
            <InputGroup size="sm" className="mb-3">
              <InputGroupAddon addonType="prepend">
                <InputGroupText htmlFor="textQuick">Text</InputGroupText>
              </InputGroupAddon>
              <Input
                name="textQuick"
                id="textQuick"
                value={values.textQuick}
                onChange={handleChange}
                sx={{ width: '8rem' }}
              />
            </InputGroup>
          </Col>
          <Col sx={{ padding: '0 5' }} xs="auto">
            <Button type="submit" onClick={applyQuick} size="small" color="success" variant="outlined">
              Quick Filter
            </Button>
          </Col>
        </Form>
      </Row>
      <Row>
        <Col>
          {!noCount && <p>{!filter || filter.length === 0 ? <em>No filters applied.</em> : <em>{appliedText}</em>}</p>}
        </Col>
      </Row>
      <Row>
        <Col>
          <Button color="warning" variant="outlined" onClick={reset}>
            Reset Filters
          </Button>
          <Button color="primary" variant="outlined" onClick={toggleAdvancedOpen}>
            Advanced...
          </Button>
          <Button color="secondary" variant="outlined" href="/filters">
            Syntax Guide
          </Button>
        </Col>
      </Row>
      <AdvancedFilterModal
        isOpen={advancedOpen}
        toggle={toggleAdvancedOpen}
        apply={applyAdvanced}
        values={values}
        onChange={handleChange}
      />
    </Collapse>
  );
};
FilterCollapse.propTypes = {
  filter: PropTypes.func,
  setFilter: PropTypes.func.isRequired,
  numCards: PropTypes.number,
  numShown: PropTypes.number,
  defaultFilterText: PropTypes.string,
  noCount: PropTypes.bool,
};
FilterCollapse.defaultProps = {
  filter: null,
  numCards: 0,
  numShown: 0,
  defaultFilterText: null,
  noCount: false,
};
export default FilterCollapse;
