import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect, withRouter } from 'react-router';

import { roundupCreate } from '../../actions/Roundup/RoundupActions';

import { getError } from '../../common/util';

import Dashboard from '../../components/Layout/Dashboard';
import LoadingSpinner from '../../components/Common/LoadingSpinner';

class NewRoundup extends Component {
  componentDidMount() {
    this.props.createRoundup();
  }

  render() {
    if (this.props.Roundup && this.props.Roundup.roundup && this.props.Roundup.isNew) {
      return <Redirect to={`/roundup/edit/${this.props.Roundup.roundup.id}`} />;
    }
    if (this.props.Roundup && this.props.Roundup.error) {
      return (
        <Dashboard
          title="Error"
          error={getError(this.props.Roundup.error)}
          onLogout={this.props.onLogout}
        />
      );
    }

    return <LoadingSpinner />;
  }
}

const mapStateToProps = state => {
  return {
    Roundup: state.Roundup,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createRoundup: () => {
      dispatch(roundupCreate());
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NewRoundup));
