import React, { Component } from 'react';

import Modal from '../Common/Modal';

export default class UserModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      id: props.user ? props.user.id : null,
      email: props.user ? props.user.email : '',
      role: props.user ? props.user.role : 'user',
      password1: '',
      password2: '',
      error: '',
    };
  }

  onChangeText = (param) => {
    return (
      (e) => {
        const newState = {};
        newState[param] = e.target.value;
        this.setState(newState);
      }
    );
  }

  onSave = () => {
    if (this.state.password1 === this.state.password2) {
      this.props.onOk(this.state);
    } else {
      this.setState({
        error: 'Passwords don\'t match.',
      });
    }
  }

  render() {
    return (
      <Modal
        okText="Save"
        cancelText="Cancel"
        title={this.props.title}
        onOk={this.onSave}
        onCancel={this.props.onCancel}
      >
        <div className="input-group mt-3">
          <input className="form-control" type="text" placeholder="Email" value={this.state.email} onChange={this.onChangeText('email')} />
        </div>
        <div className="input-group mt-3">
          <select className="form-control" onChange={this.onChangeText('role')} value={this.state.role}>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
        <div className="input-group mt-3">
          <input className="form-control" type="password" placeholder="Password" value={this.state.password1} onChange={this.onChangeText('password1')} />
        </div>
        <div className="input-group mt-3">
          <input className="form-control" type="password" placeholder="Re-enter Password" value={this.state.password2} onChange={this.onChangeText('password2')} />
        </div>
        <small className="text-secondary p-2">Empty Passwords will be ignored.</small>
        {
          this.state.error
          &&
          <div className="alert alert-danger">
            {this.state.error}
          </div>
        }
      </Modal>
    );
  }
}
