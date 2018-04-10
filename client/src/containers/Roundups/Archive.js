import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';
import Pagination from 'react-js-pagination';

import { archiveGet } from '../../actions/Archive/ArchiveActions';

import { getError } from '../../common/util';

import Dashboard from '../../components/Layout/Dashboard';
import MenuButton from '../../components/Button/MenuButton';
import RoundupCard from '../../components/Roundup/RoundupCard';

class Archive extends Component {
  componentDidMount() {
    const page = this.props.match.params.page > 0 ? parseInt(this.props.match.params.page) : 1;
    this.props.getPage(page);
  }

  onPageChange = (pageNum) => {
    this.props.history.push(`/roundup/archive/${pageNum}`);
    this.props.getPage(pageNum);
  };

  render() {
    let pagination;
    if (this.props.Archive.totalCount) {
      pagination = (
        <Pagination
          activePage={this.props.Archive.page}
          itemsCountPerPage={10}
          totalItemsCount={this.props.Archive.totalCount}
          pageRangeDisplayed={5}
          onChange={this.onPageChange}
        />
      );
    }

    const buttons = (
      <div>
        <Link to="/roundup/new">
          <MenuButton name="plus" text="New Mail" />
        </Link>
      </div>
    );

    const roundupMarkup = [];
    if (this.props.Archive.archive.result && this.props.Archive.archive.entities.roundups) {
      Object.values(this.props.Archive.archive.entities.roundups).forEach(roundup => {
        let articleCount = 0;
        roundup.articleGroups.forEach(agID => {
          articleCount += this.props.Archive.archive.entities.articleGroups[agID].articles.length;
        });
        roundupMarkup.push(
          <li key={roundup.id} className="mb-3">
            <RoundupCard roundup={roundup} to={`/roundup/edit/${roundup.id}`} articleCount={articleCount} />
          </li>
        );
      });
    }

    let content;
    if (roundupMarkup.length === 0) {
      content = (
        <div className="jumbotron display-4 text-center">
          Click "New Mail" to get started!
        </div>
      );
    } else {
      content = (
        <ul className="list-unstyled">
          {roundupMarkup}
        </ul>
      );
    }

    return (
      <Dashboard
        title="Archive"
        middle={pagination}
        right={buttons}
        isLoading={this.props.Archive.isLoading}
        error={getError(this.props.Archive.error)}
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
    Archive: state.Archive,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getPage: (pageNum) => {
      dispatch(archiveGet(pageNum));
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Archive));
