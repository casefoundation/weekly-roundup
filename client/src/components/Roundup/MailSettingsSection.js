import React, { Component } from 'react';

import Section from '../Common/Section';

export default class MailSettingsSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      subject: props.subject,
      cc: props.cc,
      to: props.to,
      preface: props.preface,
      timeout: null,
      focusCount: 0,
    };
  }

  onBlur = () => {
    this.props.onUpdate(this.state.subject, this.state.to, this.state.cc, this.state.preface);
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
      this.setState({
        timeout: null,
      });
    }
  }

  onChangeValue = (stateProp) => {
    return (e) => {
      const newState = {};
      newState[stateProp] = e.target.value;
      this.setState(newState);
      this.updateTimeout();
    };
  }

  updateTimeout = () => {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }
    this.setState({
      timeout: setTimeout(() => {
        this.props.onUpdate(this.state.subject, this.state.to, this.state.cc, this.state.preface);
        this.setState({
          timeout: null,
        });
      }, 15000),
    });
  }

  render() {
    return (
      <Section
        className="bar-section"
        titleClassName="font-weight-bold"
        title="Mail Settings"
        isCollapsed={this.props.isCollapsed}
        onCollapse={this.props.onCollapse}
        onExpand={this.props.onExpand}
      >
        <div className="input-group my-3">
          <input className="form-control" type="text" placeholder="Subject" value={this.state.subject} onChange={this.onChangeValue('subject')} onBlur={this.onBlur} onFocus={this.onFocus} />
        </div>
        <div className="input-group mb-3">
          <input className="form-control" type="text" placeholder="Recipients, comma-separated" value={this.state.to} onChange={this.onChangeValue('to')} onBlur={this.onBlur} onFocus={this.onFocus}  />
        </div>
        <div className="input-group my-3">
          <textarea className="form-control" maxLength="4166" rows="5" placeholder="Preface Text" value={this.state.preface} onChange={this.onChangeValue('preface')} onBlur={this.onBlur} onFocus={this.onFocus} />
        </div>
      </Section>
    );
  }
}
