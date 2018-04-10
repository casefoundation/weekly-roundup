import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router';
import { Redirect } from 'react-router-dom';

// actions
import { checkAuth, logout } from '../../actions/Auth/AuthActions';

// containers
import Login from '../Auth/Login';
import ResetPassword from '../Auth/ResetPassword';
import Archive from '../Roundups/Archive';
import NewRoundup from '../Roundups/New';
import ViewRoundup from '../Roundups/View';
import PreviewRoundup from '../Roundups/Preview';
import ViewSettings from '../Settings/View';
import ViewUsers from '../Users/View';

import LoadingSpinner from '../../components/Common/LoadingSpinner';

class App extends Component {  
  componentDidMount() {
    this.props.checkAuth();
  }

  onLogout = () => {
    this.props.logout();
    this.props.history.push('/');
  }

  render() {
    if (this.props.Auth.isCheckingAuth) {
      return <LoadingSpinner />;
    }

    return (
      !this.props.Auth.isLoggedIn ?
      
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/reset-password" component={ResetPassword} />
          <Route path="*" render={() => <Redirect to="/" />} />
        </Switch>

        :
      
        <Switch>
          <Route exact path="/" render={() => <Redirect to="/roundup/archive" />} />
          <Route path="/roundup/archive/:page?" render={() => <Archive onLogout={this.onLogout} isAdmin={this.props.Auth.isAdmin} />} />
          <Route path="/roundup/new" render={() => <NewRoundup onLogout={this.onLogout} isAdmin={this.props.Auth.isAdmin} />} />
          <Route path="/roundup/edit/:id/preview" render={() => <PreviewRoundup onLogout={this.onLogout} isAdmin={this.props.Auth.isAdmin} />} />
          <Route path="/roundup/edit/:id" render={() => <ViewRoundup onLogout={this.onLogout} isAdmin={this.props.Auth.isAdmin} />} />
          <Route path="/settings" render={() => <ViewSettings onLogout={this.onLogout} isAdmin={this.props.Auth.isAdmin} />} />

          { // Only Admins can view users page
            this.props.Auth.isAdmin &&
            <Route path="/users/:page?" render={() => <ViewUsers onLogout={this.onLogout} isAdmin={this.props.Auth.isAdmin} />} />
          }

          <Route path="*" render={() => <Redirect to="/roundup/archive" />} />
        </Switch>
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
    checkAuth: () => {
      dispatch(checkAuth());
    },
    logout: () => {
      dispatch(logout());
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
