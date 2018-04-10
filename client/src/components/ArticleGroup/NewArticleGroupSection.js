import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';

export default class NewArticleGroupSection extends Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
    };
  }

  onAdd = () => {
    this.props.onAdd(this.state.name);
    this.setState({
      name: '',
    });
  };

  onChangeText = (param) => {
    return (
      (e) => {
        const newState = {};
        newState[param] = e.target.value;
        this.setState(newState);
      }
    );
  }

  render() {
    if (this.props.isLoading) {
      return (
        <div className="py-4">
          <FontAwesome name="spinner" size="2x" spin /> <span className="font-weight-bold">Adding Article Group...</span>
        </div>
      );
    }

    return (
      <div className="gray-section mt-5">
        <div className="inner clearfix">
          <div className="input-group">
            <input
              className="form-control"
              type="text"
              placeholder="New Article Group Name"
              onChange={this.onChangeText('name')}
              value={this.state.name}
            />
          </div>
          <button className="float-right btn btn-success mt-4" onClick={this.onAdd}>Add Article Group</button>
        </div>
      </div>
    );
  }
}
