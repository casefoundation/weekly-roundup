import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';
import dateFormat from 'dateformat';

import { roundupSend, roundupGet } from '../../actions/Roundup/RoundupActions';
import { checkAuth } from '../../actions/Auth/AuthActions';

import { getError } from '../../common/util';

import Dashboard from '../../components/Layout/Dashboard';
import MenuButton from '../../components/Button/MenuButton';
import { axiosReq } from '../../actions/util';

class PreviewRoundup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      preview: '',
    };
  }

  componentDidMount() {
    this.props.getRoundup(this.props.match.params.id);
    // Get most updated user data
    this.props.checkAuth();
    this.loadPreview();
  }

  onCancel = () => {
    this.props.history.goBack();
  }
  
  onSend = () => {
    this.props.sendEmail(this.props.match.params.id);
  }

  loadPreview = () => {
    axiosReq().get(`/api/roundup/${this.props.match.params.id}/preview`)
      .then(response => {
        this.setState({
          preview: response.data
        });
      });
  }

  formatRoundup = () => {
    return this.state.preview ? (<div dangerouslySetInnerHTML={{ __html: this.state.preview }} />) : null;
  }

  render() {
    let content;
    let buttons;

    if (this.props.Roundup.isSending) {
      return (
        <Dashboard
          title="Preview"
          isLoading
          onLogout={this.props.onLogout}
          isAdmin={this.props.isAdmin}
        />
      );
    } else if (this.props.Roundup.isSent) {
      return (
        <Dashboard
          title="Success"
          onLogout={this.props.onLogout}
          isAdmin={this.props.isAdmin}
        >
          <div className="w-100 h-100 d-flex flex-column justify-content-center align-items-center">
            <FontAwesome className="text-success" name="check-circle" size="5x" />
            <div className="display-4 text-success mb-3">Mail Successfully Sent!</div>
            <Link to="/" className="btn btn-info">View Archive</Link>
          </div>
        </Dashboard>
      );
    } else if (this.props.Roundup.roundup) {
      const roundup = this.props.Roundup.roundup.entities.roundups[this.props.Roundup.roundup.result];
      content = (
        <div className="p-4">
          <div>
            <div>
              <span className="roundup-field">Subject:</span><span>{roundup.subject}</span>
            </div>
            <div>
              <span className="roundup-field">To:</span><span>{roundup.to.map(x => x.email).join('; ')}</span>
            </div>
          </div>
          <hr />
          {this.formatRoundup()}
        </div>
      );

      buttons = (
        <div>
          <MenuButton className="px-3" onClick={this.onCancel} name="close" text="Cancel" />
          <MenuButton className="px-3" onClick={this.onSend} name="paper-plane" text="Send" />
        </div>
      );
    } else {
      content = (
        <div>
          Unable to Load Roundup
        </div>
      );
    }

    return (
      <Dashboard
        title="Preview"
        right={buttons}
        isLoading={this.props.Roundup.isLoading}
        error={getError(this.props.Roundup.error)}
        onLogout={this.props.onLogout}
        isAdmin={this.props.isAdmin}
      >
        {content}      
      </Dashboard>
    );
  }
}

const mapStateToProps = state => {
  return {
    Roundup: state.Roundup,
    Auth: state.Auth,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    sendEmail: (roundup_id) => {
      dispatch(roundupSend(roundup_id));
    },
    getRoundup: (id) => {
      dispatch(roundupGet(id));
    },
    checkAuth: () => {
      dispatch(checkAuth());
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(PreviewRoundup));
