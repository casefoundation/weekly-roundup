import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';

import { settingsGet, settingsUpdate } from '../../actions/Settings/SettingsActions';

import { getError } from '../../common/util';

import Dashboard from '../../components/Layout/Dashboard';
import MenuButton from '../../components/Button/MenuButton';
import Section from '../../components/Common/Section';

class ViewSettings extends Component {
  constructor(props) {
    super(props);

    this.state = {
      signature: null,
      new_password1: null,
      new_password2: null,
      old_password: null,
      error: null,
    };
  }

  componentDidMount() {
    this.props.getSettings(this.props.Auth.user.id);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      signature: nextProps.Settings.settings.signature,
    });
  }

  onCancel = () => {
    this.props.history.goBack();
  }

  onChangeValue = (param) => {
    return (
      (e) => {
        const newState = {};
        newState[param] = e.target.value;
        this.setState(newState);
      }
    );
  }

  onSave = () => {
    if (this.state.new_password1 !== this.state.new_password2) {
      this.setState({
        error: 'New Passwords don\'t Match',
      });
    } else {
      this.props.updateSettings(this.state.signature, this.state.old_password, this.state.new_password1);
    }
  }

  render() {
    const buttons = (
      <div>
        <MenuButton name="close" text="Cancel" onClick={this.onCancel} />
        <MenuButton name="check" className="px-3" text="Save" onClick={this.onSave} />
      </div>
    );

    return (
      <Dashboard
        title="Settings"
        right={buttons}
        isLoading={this.props.Settings.isLoading}
        error={getError(this.props.Settings.error, this.props.Auth.error)}
        onLogout={this.props.onLogout}
        isAdmin={this.props.isAdmin}
      >
        <Section title="Email Signature" className="bar-section mb-3">
          <div className="input-group">
            <textarea
              className="form-control"
              placeholder="Signature"
              maxLength="512"
              rows="4"
              value={this.state.signature}
              onChange={this.onChangeValue('signature')}
            />
          </div>
          <small className="text-secondary px-2">Signature only accepts text. HTML won't render.</small>
        </Section>
        <Section title="Password Reset" className="bar-section mt-5">
          <div className="input-group mb-3">
            <input
              className="form-control"
              placeholder="Old Password"
              maxLength="64"
              type="password"
              value={this.state.old_password}
              onChange={this.onChangeValue('old_password')}
            />
          </div>
          <div className="input-group mb-3">
            <input
              className="form-control"
              placeholder="New Password"
              maxLength="64"
              type="password"
              value={this.state.new_password1}
              onChange={this.onChangeValue('new_password1')}
            />
          </div>
          <div className="input-group mb-3">
            <input
              className="form-control"
              placeholder="Repeat New Password"
              maxLength="64"
              type="password"
              value={this.state.new_password2}
              onChange={this.onChangeValue('new_password2')}
            />
          </div>
        </Section>
      </Dashboard>
    );
  }
}

const mapStateToProps = state => {
  return {
    Settings: state.Settings,
    Auth: state.Auth,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getSettings: (id) => {
      dispatch(settingsGet(id));
    },
    updateSettings: (signature, old_password, new_password) => {
      dispatch(settingsUpdate(signature, old_password, new_password));
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewSettings));
