import React, { Component } from 'react';
import FontAwesome from 'react-fontawesome';
import { TransitionGroup } from 'react-transition-group';

import Sidebar from '../../components/Layout/Sidebar';
import Menubar from '../../components/Layout/Menubar';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import FadeTransition from '../../components/Common/FadeTransition';

import { UIConfig } from '../../config';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      hideErrorClicked: false,
      isMobile: window.outerWidth < UIConfig.mobileMaxWidth,
      showSidebar: false,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.error) {
      this.setState({
        hideErrorClicked: false,
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onHideError = () => {
    this.setState({
      hideErrorClicked: true,
    });
  }

  onHideSidebar = () => {
    this.setState({
      showSidebar: false,
    });
  }

  onShowSidebar = () => {
    this.setState({
      showSidebar: true,
    });
  }

  onResize = () => {
    this.setState({
      isMobile: window.outerWidth < UIConfig.mobileMaxWidth,
    });
  }

  render() {
    if (this.props.isLoading) {
      return <LoadingSpinner />;
    }

    // Mobile/Non-Mobile style
    const dashboardRightStyle = {
      marginLeft: 0,
    };
    const errorStyle = {
      left: 0,
    };
    if (!this.state.isMobile) {
      dashboardRightStyle.marginLeft = `${UIConfig.sidebarWidth}px`;
      errorStyle.left = `${UIConfig.sidebarWidth}px`;
    }

    return (
      <div id="dashboard">
        <Sidebar
          onLogout={this.props.onLogout}
          isAdmin={this.props.isAdmin}
          isMobile={this.state.isMobile}
          isExpanded={window.outerWidth >= UIConfig.mobileMaxWidth || this.state.showSidebar}
          onCollapseClick={this.onHideSidebar}
        />
        <div className="dashboard-right" style={dashboardRightStyle}>
          <Menubar
            title={this.props.title}
            middle={this.props.middle}
            right={this.props.right}
            isMobile={this.state.isMobile}
            onMobileMenuClick={this.onShowSidebar}
          />
          <TransitionGroup>
            {
              this.props.error && !this.state.hideErrorClicked
              &&
              <FadeTransition>
                <div className="dashboard-alert alert alert-danger" style={errorStyle}>
                  <div className="float-right">
                    <FontAwesome name="close" role="button" onClick={this.onHideError} />
                  </div>
                  {this.props.error}
                </div>
              </FadeTransition>
            }
          </TransitionGroup>
          <div id="main-content" className="wrap">
            <div id="main-content-inner" className="py-4">
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
