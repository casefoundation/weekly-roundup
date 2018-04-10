import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

import { login } from '../../actions/Auth/AuthActions';

class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
    };
  }

  onChangeText = (param) => {
    return (
      (e) => {
        const newState = {};
        newState[param] = e.target.value;
        this.setState(newState);
      }
    );
  }

  onLogin = (e) => {
    e.preventDefault();
    this.props.login(this.state.email, this.state.password);
  }

  render() {
    return (
      <div id="login" className="w-100 h-100 d-flex flex-row justify-content-center align-items-center">
        <div className="login-dialog bg-dark text-white p-3 text-center">
          <h1>WeeklyRoundup</h1>
          {
            this.props.Auth.isLoading ?

              <FontAwesome name="spinner" size="2x" spin />

              :
              
              <form onSubmit={this.onLogin}>
                <div className="input-group mt-3">
                  <input className="form-control" type="text" placeholder="Email" onChange={this.onChangeText('email')} />
                </div>
                <div className="input-group mt-3">
                  <input className="form-control" type="password" placeholder="Password" onChange={this.onChangeText('password')} />
                </div>
                <div className="mt-3">
                  <button type="submit" className="btn btn-primary">Login</button>
                </div>
                <div className="mt-3">
                  <Link to="/reset-password">Forgot Password</Link>
                </div>
                {
                  this.props.Auth.error &&
                  <div className="alert alert-danger mt-3">{this.props.Auth.error}</div>
                }
              </form>
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    Auth: state.Auth,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    login: (email, password) => {
      dispatch(login(email, password));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
