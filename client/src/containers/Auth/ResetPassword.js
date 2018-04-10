import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import { passwordCodeReset, passwordReset } from '../../actions/Auth/AuthActions';

import { getError } from '../../common/util';

import Section from '../../components/Common/Section';

class ResetPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      code: '',
    };
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

  onResetCode = () => {
    this.props.resetPasswordCode(this.state.email);
  }

  onResetPassword = () => {
    this.props.resetPassword(this.state.code);
  }

  render() {
    let content;
    if (this.props.Auth.isPasswordReset) {
      // Step 3: Show success and direct user to Login
      content = (
        <Section title="Password Reset Success" className="bar-section mt-3">
          <Link className="btn btn-success" to="/">Login</Link>
        </Section>
      );
    } else if (!this.props.Auth.isCodeReset) {
      // Step 1: Get email to reset password code
      content = (
        <Section title="Email" className="bar-section mt-3">
          <div className="input-group mb-3">
            <input
              className="form-control"
              placeholder="email"
              maxLength="255"
              type="text"
              value={this.state.email}
              onChange={this.onChangeValue('email')}
            />
          </div>
          <button className="btn btn-success" onClick={this.onResetCode}>Get Code</button>
        </Section>
      );
    } else {
      // Step 2: Verify code and send new password email
      content = (
        <Section title="Reset Code" className="bar-section mt-3">
          <div className="input-group mb-3">
            <input
              className="form-control"
              placeholder="reset code"
              maxLength="36"
              type="text"
              value={this.state.code}
              onChange={this.onChangeValue('code')}
            />
          </div>
          <button className="btn btn-success" onClick={this.onResetPassword}>Reset Password</button>
        </Section>
      );
    }
    return (
      <div className="p-4">
        <h1>Reset Password</h1>
        {
          this.props.Auth.message &&
          <div className="alert alert-success">
            {this.props.Auth.message}
          </div>
        }
        {
          this.props.Auth.error &&
          <div className="alert alert-error">
            {getError(this.props.Auth.error)}
          </div>
        }
        {content}
      </div>
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
    resetPasswordCode: (email) => {
      dispatch(passwordCodeReset(email));
    },
    resetPassword: (code) => {
      dispatch(passwordReset(code));
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ResetPassword));
