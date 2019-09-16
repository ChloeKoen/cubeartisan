import React, { Component } from 'react';

import {
  Collapse,
  Nav, NavItem, NavLink, Navbar, NavbarToggler,
} from 'reactstrap';

import FilterCollapse from './FilterCollapse';
import SortCollapse from './SortCollapse';

class CubeCompareNavbar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: false,
      openCollapse: null
    };

    this.toggle = this.toggle.bind(this);
    this.handleOpenCollapse = this.handleOpenCollapse.bind(this);
  }

  toggle() {
    event.preventDefault();
    this.setState(({ isOpen }) => ({
      isOpen: !isOpen
    }));
  }

  handleOpenCollapse(event) {
    event.preventDefault();
    const target = event.target;
    const collapse = target.getAttribute('data-target');
    this.setState(({ openCollapse }) => ({
      openCollapse: openCollapse === collapse ? null : collapse,
    }));
  }

  render() {
    return (
      <div className="usercontrols">
        <Navbar expand="md" className="navbar-light">
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav navbar>
              <NavItem>
                <NavLink href="#" data-target="sort" onClick={this.handleOpenCollapse}>Sort</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#" data-target="filter" onClick={this.handleOpenCollapse}>Filter</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#" onClick={/* global */ tagColorsModal}>
                  View Tag Colors
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
        <SortCollapse isOpen={this.state.openCollapse === 'sort'} />
        <FilterCollapse isOpen={this.state.openCollapse === 'filter'} />
      </div>
    );
  }
}

export default CubeCompareNavbar;
