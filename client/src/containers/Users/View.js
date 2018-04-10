import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Pagination from 'react-js-pagination';
import FontAwesome from 'react-fontawesome';

import { userCreate, usersGet, userDelete, userUpdate } from '../../actions/Users/UsersActions';

import { getError } from '../../common/util';

import Dashboard from '../../components/Layout/Dashboard';
import MenuButton from '../../components/Button/MenuButton';
import UserModal from '../../components/Users/UserModal';
import Modal from '../../components/Common/Modal';

class ViewUsers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedUser: null,
      showDeleteModal: false,
      showEditModal: false,
      showCreateModal: false,
      error: '',
    };
  }

  componentDidMount() {
    const page = this.props.match.params.page > 0 ? parseInt(this.props.match.params.page) : 1;
    this.props.getPage(page);
  }

  componentDidUpdate() {
    // Refetch Users if a user was updated/added/deleted
    if (this.props.Users.updatedUser || this.props.Users.newUser || this.props.Users.deletedUser) {
      const page = this.props.match.params.page > 0 ? parseInt(this.props.match.params.page) : 1;
      this.props.getPage(page);
    }
  }

  onCreate = (user) => {
    if (user.password1 !== user.password2) {
      this.setState({
        error: 'Passwords must match.',
      });
    } else {
      this.props.createUser(
        user.email,
        user.role,
        user.password1
      );
      this.setState({
        showCreateModal: false,
      });
    }
  }

  onCreateClick = () => {
    this.setState({
      showCreateModal: true,
    });
  }

  onDelete = (id) => {
    this.props.deleteUser(id);
    this.setState({
      selectedUser: null,
      showDeleteModal: false,
    });
  }

  onDeleteClick = (user) => {
    this.setState({
      selectedUser: user,
      showDeleteModal: true,
    });
  }

  onEdit = (user) => {
    if (user.password1 !== user.password2) {
      this.setState({
        error: 'Passwords must match.',
      });
    } else {
      this.props.updateUser(
        user.id,
        user.email,
        user.role,
        user.password1
      );
      this.setState({
        selectedUser: null,
        showEditModal: false,
      });
    }
  }

  onEditClick = (user) => {
    this.setState({
      selectedUser: user,
      showEditModal: true,
    });
  }

  onPageChange = (pageNum) => {
    this.props.history.push(`/users/${pageNum}`);
    this.props.getPage(pageNum);
  }

  render() {
    // Users Pagination module
    const pagination = (
      <Pagination
        activePage={this.props.Users.page}
        itemsCountPerPage={10}
        totalItemsCount={this.props.Users.totalCount}
        pageRangeDisplayed={5}
        onChange={this.onPageChange}
      />
    );

    // Users Menu Buttons
    const buttons = (
      <div>
        <MenuButton name="plus" text="New User" onClick={this.onCreateClick} />
      </div>
    );

    // Users Create, Update, Delete Modals
    let modal;
    if (this.state.showCreateModal) {
      modal = (
        <UserModal
          title="New User"
          onOk={this.onCreate}
          onCancel={() => this.setState({ showCreateModal: false })}
        />
      );
    } else if (this.state.showEditModal) {
      modal = (
        <UserModal
          title="Edit User"
          user={this.state.selectedUser}
          onOk={this.onEdit}
          onCancel={() => this.setState({ showEditModal: false })}
        />
      );
    } else if (this.state.showDeleteModal) {
      modal = (
        <Modal
          title="Delete User"
          okText="Delete"
          cancelText="Cancel"
          onOk={() => this.onDelete(this.state.selectedUser.id)}
          onCancel={() => this.setState({ showDeleteModal: false })}
        >
          <div>Are you sure you want to delete the User?</div>
        </Modal>
      );
    }

    // Users Table Row Markup
    const usersMarkup = [];
    if (this.props.Users.users.result) {
      Object.values(this.props.Users.users.result).forEach(user => {
        usersMarkup.push(
          <tr key={user.id}>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>
              <FontAwesome className="p-2" role="button" name="wrench" onClick={() => this.onEditClick(user)} />
              <FontAwesome className="p-2" role="button" name="trash" onClick={() => this.onDeleteClick(user)} />
            </td>
          </tr>
        );
      });
    }

    return (
      <Dashboard
        title="Users"
        middle={pagination}
        right={buttons}
        isLoading={this.props.Users.isLoading}
        error={getError(this.props.Users.error)}
        onLogout={this.props.onLogout}
        isAdmin={this.props.isAdmin}
      >
        {modal}
        <table className="table">
          <thead className="thead-dark">
            <th scope="col">Email</th>
            <th scope="col">Role</th>
            <th scope="col" />
          </thead>
          <tbody>
            {usersMarkup}
          </tbody>
        </table>
      </Dashboard>
    );
  }
}

const mapStateToProps = state => {
  return {
    Users: state.Users,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    getPage: (pageNum) => {
      dispatch(usersGet(pageNum));
    },
    createUser: (email, role, password) => {
      dispatch(userCreate(email, role, password));
    },
    deleteUser: (id) => {
      dispatch(userDelete(id));
    },
    updateUser: (id, email, role, password) => {
      dispatch(userUpdate(id, email, role, password));
    },
  };
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ViewUsers));
