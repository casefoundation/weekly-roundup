import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import classnames from 'classnames';

import { UIConfig } from '../../config';

export default class MenuButton extends Component {
  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    this.setState({
      update: this.state ? !this.state.update : true,
    });
  }

  render() {
    return (
      <div className={classnames('btn-menu', this.props.className)} role="button" onClick={this.props.onClick}>
        <FontAwesome name={this.props.name} />
        { // Only Show text on larger screens
          window.outerWidth >= UIConfig.mobileMaxWidth &&
          <span className="pl-1">{this.props.text}</span>
        }
      </div>
    );
  }
}
