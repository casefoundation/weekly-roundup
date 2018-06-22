import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import dotprop from 'dot-prop-immutable';
import { TransitionGroup } from 'react-transition-group';

import { roundupGet, roundupDelete, roundupUpdate } from '../../actions/Roundup/RoundupActions';
import { articleGroupCreate, articleGroupDelete, articleGroupUpdate } from '../../actions/ArticleGroup/ArticleGroupActions';
import { articleCreate, articleDelete, articleUpdate } from '../../actions/Article/ArticleActions';

import { getError } from '../../common/util';

import Dashboard from '../../components/Layout/Dashboard';
import Modal from '../../components/Common/Modal';
import MailSettingsSection from '../../components/Roundup/MailSettingsSection';
import ArticleGroupSection from '../../components/ArticleGroup/ArticleGroupSection';
import NewArticleGroupSection from '../../components/ArticleGroup/NewArticleGroupSection';
import FadeTransition from '../../components/Common/FadeTransition';
import MenuButton from '../../components/Button/MenuButton';

class ViewRoundup extends Component {
  constructor(props) {
    super(props);

    this.state = {
      collapsedArticles: {},              // collapsed article sections hash
      collapsedArticleGroups: {},         // collapsed article group sections hash
      isSettingsCollapsed: false,         // is mail settings collapsed

      selectedArticleGroupId: null,       // selected article group id (for modals)
      selectedArticleId: null,            // selected article id (for modals)
      selectedArticleGroupName: null,
      selectedArticleName: null,
      showDeleteArticleGroupModal: false,
      showDeleteArticleModal: false,
      showDeleteRoundupModal: false,
      showEditArticleTitleModal: false,
      showEditArticleGroupTitleModal: false,
    };
  }

  componentDidMount() {
    this.props.getRoundup(this.props.match.params.id);
  }

  componentDidUpdate() {
    // Redirect to Archive after deletion
    if (this.props.Roundup.deleted && !this.props.Roundup.isLoading) {
      this.props.history.push('/');
    }
  }

  // ARTICLE HANDLERS

  onCollapseArticle = (id) => {
    this.setState(dotprop.set(this.state, `collapsedArticles.${id}`, true));
  }

  onDeleteArticle = (id) => {
    this.setState({
      showDeleteArticleModal: false,
    });
    this.props.deleteArticle(id);
  }

  onExpandArticle = (id) => {
    this.setState(dotprop.delete(this.state, `collapsedArticles.${id}`));
  }

  onUpdateArticleTitle = () => {
    const article = this.props.Roundup.roundup.entities.articles[this.state.selectedArticleId];
    this.props.updateArticle(
      article.id,
      this.state.selectedArticleName,
      article.url,
      article.published,
      article.source,
      article.summary,
      0
    );
    this.setState({
      showEditArticleTitleModal: false,
    });
  }

  // ARTICLE GROUP HANDLERS

  onAddArticleGroup = (name) => {
    if (this.props.Roundup.roundup && this.props.Roundup.roundup.result) {
      let lastOrder = 0;
      if (this.props.Roundup.roundup.entities.articleGroups) {
        const articleGroups = Object.values(this.props.Roundup.roundup.entities.articleGroups);
        articleGroups.forEach(grp => {
          if (grp.roundup_order > lastOrder) {
            lastOrder = grp.roundup_order;
          }
        });
      }
      this.props.createArticleGroup(this.props.match.params.id, name, lastOrder + 1);
    }
  }

  onCollapseArticleGroup = (id) => {
    this.setState(dotprop.set(this.state, `collapsedArticleGroups.${id}`, true));
  }

  onDeleteArticleGroup = (id) => {
    this.setState({
      showDeleteArticleGroupModal: false,
    });
    this.props.deleteArticleGroup(id);
  }

  onExpandArticleGroup = (id) => {
    this.setState(dotprop.delete(this.state, `collapsedArticleGroups.${id}`));
  }

  onUpdateArticleGroupTitle = () => {
    const articleGroup = this.props.Roundup.roundup.entities.articleGroups[this.state.selectedArticleGroupId];
    this.props.updateArticleGroup(articleGroup.id, this.state.selectedArticleGroupName, 0);
    this.setState({
      showEditArticleGroupTitleModal: false,
    });
  }

  // MAIL SETTINGS HANDLERS

  onCollapseSettings = () => {
    this.setState({
      isSettingsCollapsed: true,
    });
  }

  onExpandSettings = () => {
    this.setState({
      isSettingsCollapsed: false,
    });
  }

  onUpdateSettings = (subject, to, cc, preface) => {
    const toArr = to.split(/(,|;)/).map(x => x.trim()).filter(x => x !== ';' && x !== ',' && x);
    const ccArr = cc.split(/(,|;)/).map(x => x.trim()).filter(x => x !== ';' && x !== ',' && x);
    this.props.updateRoundup(this.props.Roundup.roundup.result, subject, toArr, ccArr, preface);
  }

  // ROUNDUP MENU BUTTON HANDLERS

  onCollapseAll = () => {
    if (this.props.Roundup.roundup && this.props.Roundup.roundup.result) {
      const newState = {
        collapsedArticleGroups: {},
        collapsedArticles: {},
        isSettingsCollapsed: true,
      };
      if (this.props.Roundup.roundup.entities.articleGroups) {
        Object.values(this.props.Roundup.roundup.entities.articleGroups).forEach(ag => {
          newState.collapsedArticleGroups[ag.id] = true;
        });
      }
      if (this.props.Roundup.roundup.entities.articles) {
        Object.values(this.props.Roundup.roundup.entities.articles).forEach(a => {
          newState.collapsedArticles[a.id] = true;
        });
      }
      this.setState(newState);
    }
  }

  onExpandAll = () => {
    this.setState({
      collapsedArticleGroups: {},
      collapsedArticles: {},
      isSettingsCollapsed: false,
    });
  }

  onPreview = () => {
    this.props.history.push(`/roundup/edit/${this.props.match.params.id}/preview`);
  }

  render() {
    let content;
    let buttons;
    let modal;
    if (this.props.Roundup.roundup && this.props.Roundup.roundup.result) {
      // Get entities
      const roundup = this.props.Roundup.roundup.entities.roundups[this.props.Roundup.roundup.result];
      const articleGroups = this.props.Roundup.roundup.entities.articleGroups;
      const articles = this.props.Roundup.roundup.entities.articles;

      // Format roundup email settings
      const to = roundup.to.map(x => x.email).join(', ');
      const cc = roundup.cc.map(x => x.email).join(', ');

      // Get Markup for article groups & articles
      const articleGroupsMarkup = [];
      roundup.articleGroups.forEach(agID => {
        // Find article group
        const ag = articleGroups[agID];
        // Find articles for article group
        const articleGroupArticles = ag.articles.map(aID => articles[aID]);
        const lastArticleOrder = articleGroupArticles.length === 0 ? 0 : articleGroupArticles[articleGroupArticles.length - 1].group_order;
        
        // Add Article Group Markup
        articleGroupsMarkup.push(
          <FadeTransition key={ag.id}>
            <ArticleGroupSection
              articleGroup={ag}
              articles={articleGroupArticles}
              isLoadingArticles={this.props.Roundup.loadingArticleGroups.filter(id => id === ag.id).length > 0}

              isCollapsed={this.state.collapsedArticleGroups[ag.id]}
              collapsedArticles={this.state.collapsedArticles}
              onCollapse={() => this.onCollapseArticleGroup(ag.id)}
              onExpand={() => this.onExpandArticleGroup(ag.id)}
              onCollapseArticle={this.onCollapseArticle}
              onExpandArticle={this.onExpandArticle}

              onDelete={() => this.setState({
                showDeleteArticleGroupModal: true,
                selectedArticleGroupId: ag.id,
              })}
              onEditClick={() => this.setState({
                showEditArticleGroupTitleModal: true,
                selectedArticleGroupId: ag.id,
                selectedArticleGroupName: ag.name,
              })}
              onUpdate={this.props.updateArticleGroup}

              onAnalyze={(urls) => this.props.createArticle(ag.id, urls, lastArticleOrder)}
              onDeleteArticle={(id) => this.setState({
                showDeleteArticleModal: true,
                selectedArticleId: id,
              })}
              onEditArticleClick={(article) => this.setState({
                showEditArticleTitleModal: true,
                selectedArticleId: article.id,
                selectedArticleName: article.title,
              })}
              onUpdateArticle={this.props.updateArticle}
            />
          </FadeTransition>
        );
      });

      // Menu Buttons Markup
      buttons = (
        <div>
          <MenuButton className="px-3" onClick={this.onExpandAll} name="chevron-down" text="Expand All" />
          <MenuButton className="px-3" onClick={this.onCollapseAll} name="chevron-up" text="Collapse All" />
          <MenuButton className="px-3" onClick={() => this.setState({ showDeleteRoundupModal: true })} name="trash" text="Delete" />
          <MenuButton className="px-3" onClick={this.onPreview} name="paper-plane" text="Preview &amp; Send" />
        </div>
      );

      // Modals Markup
      if (this.state.showDeleteArticleGroupModal) {
        modal = (
          <Modal
            okText="Delete"
            cancelText="Cancel"
            title="Delete Article Group"
            onOk={() => this.onDeleteArticleGroup(this.state.selectedArticleGroupId)}
            onCancel={() => this.setState({ showDeleteArticleGroupModal: false })}
          >
            <div>Are you sure you want to delete the Article Group?</div>
          </Modal>
        );
      } else if (this.state.showDeleteArticleModal) {
        modal = (
          <Modal
            okText="Delete"
            cancelText="Cancel"
            title="Delete Article"
            onOk={() => this.onDeleteArticle(this.state.selectedArticleId)}
            onCancel={() => this.setState({ showDeleteArticleModal: false })}
          >
            <div>Are you sure you want to delete the Article?</div>
          </Modal>
        );
      } else if (this.state.showDeleteRoundupModal) {
        modal = (
          <Modal
            okText="Delete"
            cancelText="Cancel"
            title="Delete Roundup"
            onOk={() => this.props.deleteRoundup(this.props.Roundup.roundup.result)}
            onCancel={() => this.setState({ showDeleteRoundupModal: false })}
          >
            <div>Are you sure you want to delete the Roundup?</div>
          </Modal>
        );
      } else if (this.state.showEditArticleTitleModal) {
        modal = (
          <Modal
            okText="Save"
            cancelText="Cancel"
            title="Edit Article Title"
            onOk={this.onUpdateArticleTitle}
            onCancel={() => this.setState({ showEditArticleTitleModal: false })}
          >
            <div className="input-group my-3">
              <input
                className="form-control"
                type="text"
                placeholder="Article Name"
                value={this.state.selectedArticleName}
                onChange={(e) => this.setState({ selectedArticleName: e.target.value })}
              />
            </div>
          </Modal>
        );
      } else if (this.state.showEditArticleGroupTitleModal) {
        modal = (
          <Modal
            okText="Save"
            cancelText="Cancel"
            title="Edit Article Group Title"
            onOk={this.onUpdateArticleGroupTitle}
            onCancel={() => this.setState({ showEditArticleGroupTitleModal: false })}
          >
            <div className="input-group my-3">
              <input
                className="form-control"
                type="text"
                placeholder="Article Group Name"
                value={this.state.selectedArticleGroupName}
                onChange={(e) => this.setState({ selectedArticleGroupName: e.target.value })}
              />
            </div>
          </Modal>
        );
      }

      // Main Content Markup
      content = (
        <TransitionGroup>
          <MailSettingsSection
            subject={roundup.subject}
            to={to}
            cc={cc}
            preface={roundup.preface}
            isCollapsed={this.state.isSettingsCollapsed}
            onCollapse={this.onCollapseSettings}
            onExpand={this.onExpandSettings}
            onUpdate={this.onUpdateSettings}
          />
          {articleGroupsMarkup}
          <NewArticleGroupSection onAdd={this.onAddArticleGroup} isLoading={this.props.Roundup.articleGroupCreating} />
        </TransitionGroup>
      );
    }

    return (
      <Dashboard
        title="Roundup"
        right={buttons}
        isLoading={this.props.Roundup.isLoading}
        error={getError(this.props.Roundup.error)}
        onLogout={this.props.onLogout}
        isAdmin={this.props.isAdmin}
      >
        {modal}
        {content}
      </Dashboard>
    );
  }
}

const mapStateToProps = state => {
  return {
    Roundup: state.Roundup,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    // Roundup
    deleteRoundup: (id) => {
      dispatch(roundupDelete(id));
    },
    getRoundup: (id) => {
      dispatch(roundupGet(id));
    },
    updateRoundup: (id, subject, to, cc, preface) => {
      dispatch(roundupUpdate(id, subject, to, cc, preface));
    },

    // Articles
    createArticle: (article_group_id, urls, group_order_start) => {
      dispatch(articleCreate(article_group_id, urls, group_order_start));
    },
    deleteArticle: (id) => {
      dispatch(articleDelete(id));
    },
    updateArticle: (id, title, url, published, source, summary, group_order_shift) => {
      dispatch(articleUpdate(id, title, url, published, source, summary, group_order_shift));
    },

    // Article Groups
    createArticleGroup: (roundup_id, name, roundup_order) => {
      dispatch(articleGroupCreate(roundup_id, name, roundup_order));
    },
    deleteArticleGroup: (id) => {
      dispatch(articleGroupDelete(id));
    },
    updateArticleGroup: (id, name, roundup_order_shift) => {
      dispatch(articleGroupUpdate(id, name, roundup_order_shift));
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewRoundup));
