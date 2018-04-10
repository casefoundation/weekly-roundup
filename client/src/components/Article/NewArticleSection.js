import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import classnames from 'classnames';

export default class NewArticleGroupSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      links: [''],
    };
  }

  onAddArticle = () => {
    this.setState({
      links: this.state.links.concat(''),
    });
  };

  onAnalyze = () => {
    this.props.onAnalyze(this.state.links.map(x => x.trim()).filter(x => x));
    this.setState({
      links: [''],
    });
  };

  onChangeText = (index) => {
    return (
      (e) => {
        const links = this.state.links.slice();
        links[index] = e.target.value;
        this.setState({
          links,
        });
      }
    );
  }

  onDeleteLink = (index) => {
    return () => {
      const links = this.state.links.slice();
      links.splice(index, 1);
      if (links.length === 0) {
        links.push('');
      }
      this.setState({
        links,
      });
    };
  }

  render() {
    const linksMarkup = [];
    for (let i = 0; i < this.state.links.length; i++) {
      const link = this.state.links[i];
      linksMarkup.push(
        <div key={i} className="input-group pb-3">
          <input
            className="form-control"
            type="text"
            placeholder="New Article URL"
            value={link}
            onChange={this.onChangeText(i)}
          />
          <div className={classnames('input-group-append input-group-addon', (i === 0 ? 'd-none' : ''))}>
            <span className="input-group-text">
              <FontAwesome name="close" role="button" onClick={this.onDeleteLink(i)} />
            </span>
          </div>
        </div>
      );
    }

    let content = (
      <div>
        <FontAwesome name="spinner" size="2x" spin /> <span className="font-weight-bold">Analyzing Links...</span>
      </div>
    );
    if (!this.props.isLoading) {
      content = (
        <div className="clearfix">
          {linksMarkup}
          {
            this.state.links.length < 10
            &&
            <div className="text-secondary" role="button" onClick={this.onAddArticle}>
              <FontAwesome name="plus" /> Add Another Article
            </div>
          }
          <button className="float-right btn btn-success mt-2" onClick={this.onAnalyze}>Analyze &amp; Add</button>
        </div>
      );
    }

    return (
      <div className={classnames('section py-3', this.props.className)}>
        <div className="inner">
          {content}
        </div>
      </div>
    );
  }
}
