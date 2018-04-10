import React, { Component } from 'react';
import { TransitionGroup } from 'react-transition-group';

import SectionEditable from '../Common/SectionEditable';
import ArticleSection from '../Article/ArticleSection';
import NewArticleSection from '../Article/NewArticleSection';
import FadeTransition from '../Common/FadeTransition';

export default class ArticleGroupSection extends Component {
  onDown = () => {
    const articleGroup = this.props.articleGroup;
    this.props.onUpdate(articleGroup.id, articleGroup.name, 1);
  }

  onUp = () => {
    const articleGroup = this.props.articleGroup;
    this.props.onUpdate(articleGroup.id, articleGroup.name, -1);
  }

  render() {
    const articleGroup = this.props.articleGroup;
    const articleSections = [];
    this.props.articles.forEach(a => {
      articleSections.push(
        <FadeTransition key={a.id}>
          <ArticleSection
            article={a}
            isCollapsed={this.props.collapsedArticles[a.id]}
            onUpdate={this.props.onUpdateArticle}
            onCollapse={this.props.onCollapseArticle}
            onExpand={this.props.onExpandArticle}
            onDelete={this.props.onDeleteArticle}
            onEditClick={this.props.onEditArticleClick}
          />
        </FadeTransition>
      );
    });

    return (
      <SectionEditable
        className="bar-section mt-5"
        titleClassName="font-weight-bold"
        title={`${articleGroup.name} (${articleGroup.articles.length})`}
        isCollapsed={this.props.isCollapsed}
        onCollapse={this.props.onCollapse}
        onExpand={this.props.onExpand}
        onUp={this.onUp}
        onDown={this.onDown}
        onDelete={this.props.onDelete}
        onEditClick={this.props.onEditClick}
      >
        <TransitionGroup>
          {articleSections}
        </TransitionGroup>
        <NewArticleSection onAnalyze={this.props.onAnalyze} isLoading={this.props.isLoadingArticles} />
      </SectionEditable>
    );
  }
}
