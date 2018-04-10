import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';

import Section from './Section';

export default class SectionEditable extends Component {
  render() {
    const buttons = (
      <div className="text-nowrap">
        <FontAwesome className="p-2" role="button" name="wrench" onClick={this.props.onEditClick} />
        <FontAwesome className="p-2" role="button" name="arrow-up" onClick={this.props.onUp} />
        <FontAwesome className="p-2" role="button" name="arrow-down" onClick={this.props.onDown} />
        <FontAwesome className="p-2" role="button" name="trash" onClick={this.props.onDelete} />
      </div>
    );

    return (
      <Section
        className={this.props.className}
        title={this.props.title}
        isCollapsed={this.props.isCollapsed}
        headerRight={buttons}
        onCollapse={this.props.onCollapse}
        onExpand={this.props.onExpand}
      >
        {this.props.children}
      </Section>
    );
  }
}
