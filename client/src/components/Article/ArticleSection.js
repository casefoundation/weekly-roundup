import React, { Component } from 'react';
import dateFormat from 'dateformat';

import SectionEditable from '../Common/SectionEditable';

export default class ArticleSection extends Component {
  constructor(props) {
    super(props);

    const article = this.props.article;
    let datePublished;
    try {
      datePublished = article.published ? dateFormat(new Date(article.published), 'yyyy-mm-dd') : '';
    } catch (err) {
      datePublished = '';
    }
    
    this.state = {
      url: article.url,
      source: article.source,
      published: datePublished,
      summary: article.summary,
    };
  }

  onBlur = () => {
    this.props.onUpdate(
      this.props.article.id,
      this.props.article.title,
      this.state.url,
      this.state.published,
      this.state.source,
      this.state.summary,
      0);
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
      this.setState({
        timeout: null,
      });
    }
  }

  onChangeValue = (stateProp) => {
    return (e) => {
      const newState = {};
      newState[stateProp] = e.target.value;
      this.setState(newState);
      this.updateTimeout();
    };
  }

  onDown = () => {
    this.props.onUpdate(
      this.props.article.id,
      this.props.article.title,
      this.state.url,
      this.state.published,
      this.state.source,
      this.state.summary,
      1);
  }

  onUp = () => {
    this.props.onUpdate(
      this.props.article.id,
      this.props.article.title,
      this.state.url,
      this.state.published,
      this.state.source,
      this.state.summary,
      -1);
  }

  updateTimeout = () => {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
    }
    this.setState({
      timeout: setTimeout(() => {
        this.props.onUpdate(
          this.props.article.id,
          this.props.article.title,
          this.state.url,
          this.state.published,
          this.state.source,
          this.state.summary,
          0
        );
      }, 15000),
    });
  }

  render() {
    const article = this.props.article;

    return (
      <SectionEditable
        className="mb-3"
        title={article.title}
        isCollapsed={this.props.isCollapsed}
        onCollapse={() => this.props.onCollapse(this.props.article.id)}
        onExpand={() => this.props.onExpand(this.props.article.id)}
        onEdit={this.props.onEdit}
        onEditClick={() => this.props.onEditClick(this.props.article)}
        onUp={this.onUp}
        onDown={this.onDown}
        onDelete={() => this.props.onDelete(this.props.article.id)}
      >
        <div className="input-group mb-3">
          <input
            className="form-control"
            type="text"
            placeholder="Url"
            maxLength="2080"
            value={this.state.url}
            onChange={this.onChangeValue('url')}
            onBlur={this.onBlur}
          />
        </div>
        <div className="input-group mb-3">
          <input
            className="form-control"
            type="text"
            placeholder="Source"
            maxLength="64"
            value={this.state.source}
            onChange={this.onChangeValue('source')}
            onBlur={this.onBlur}
          />
        </div>
        <div className="input-group mb-3">
          <input
            className="form-control"
            type="date"
            placeholder="Date Published"
            value={this.state.published}
            onChange={this.onChangeValue('published')}
            onBlur={this.onBlur}
          />
        </div>
        <div className="input-group mb-3">
          <textarea
            className="form-control"
            placeholder="Summary"
            maxLength="2080"
            rows="5"
            value={this.state.summary}
            onChange={this.onChangeValue('summary')}
            onBlur={this.onBlur}
          />
        </div>
      </SectionEditable>
    );
  }
}
