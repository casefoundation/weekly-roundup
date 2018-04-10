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

class PreviewRoundup extends Component {
  componentDidMount() {
    this.props.getRoundup(this.props.match.params.id);
    // Get most updated user data
    this.props.checkAuth();
  }

  onCancel = () => {
    this.props.history.goBack();
  }
  
  onSend = () => {
    this.props.sendEmail(this.props.match.params.id);
  }

  formatRoundup = () => {
    const content = [];
    if (this.props.Roundup.roundup && this.props.Roundup.roundup.entities.roundups[this.props.Roundup.roundup.result].articleGroups) {
      const roundup = this.props.Roundup.roundup.entities.roundups[this.props.Roundup.roundup.result];
      roundup.articleGroups.forEach(agID => {
        const ag = this.props.Roundup.roundup.entities.articleGroups[agID];
        const articles = [];
        if (ag.articles) {
          ag.articles.forEach(aID => {
            const a = this.props.Roundup.roundup.entities.articles[aID];
            const source = <div style={{ fontWeight: 'bold' }}>{a.source}</div>;
            const title = <div style={{ color: '#007bff', fontSize: '24px', fontWeight: 'bold'}}>{a.title}</div>;
            let published;
            try {
              published = <div style={{ fontWeight: 'bold', color: '#6c757d' }}>{dateFormat(new Date(a.published), 'mm/dd/yyyy')}</div>;
            } catch (err) {
              published = '';
            }
            const summary = <div>{a.summary}</div>;
            articles.push( 
              <div key={a.id}>
                <a href={a.url}>{title}</a>
                {source}
                {published}
                {summary}
                <br />
              </div>
            );
          });
        }
        // Add Email Preface before articles
        if (roundup.preface) {
          content.push(
            <div key="-99">
              {roundup.preface}
            </div>
          );
        }
        // Only show article groups with articles
        if (articles.length > 0) {
          content.push(
            <div key={ag.id}>
              <br />
              <div style={{ textAlign: 'center', color: '#6c757d', fontSize: '36px', fontWeight: 'bold' }}>{ag.name}</div>
              <br />
              {articles}
              <hr />
            </div>
          );
        }
      });
    }

    const signature = [];
    if (this.props.Auth.user.signature) {
      this.props.Auth.user.signature.split('\n').forEach(line => {
        signature.push(<div key={line}>{line}</div>);
      });
    }

    return (
      <div>
        <div style={{ width: '100%', textAlign: 'center' }}>
          <img height="80" width="288" src={require('../../lib/images/case_foundation.jpg')} />
        </div>
        <div>
          {content}
        </div>
        <div>
          {signature}
        </div>
      </div>
    );
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
