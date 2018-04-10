import React from 'react';
import FontAwesome from 'react-fontawesome';
import { UIConfig } from '../../config';

export default function (props) {
  // Mobile/Non-mobile styles
  const style = {
    left: 0,
  };
  if (!props.isMobile) {
    style.left = UIConfig.sidebarWidth;
  }

  return (
    <nav id="menubar" className="py-2 border-bottom bg-white" style={style}>
      <div className="wrap m-auto d-flex flex-column flex-sm-row justify-content-between align-items-center">

        { // Mobile Menu Button
          props.isMobile &&
          <FontAwesome name="ellipsis-v" className="mobile-menu-ellipsis" size="2x" role="button" onClick={props.onMobileMenuClick} />
        }

        <h3>{props.title}</h3>
        <div>{props.middle}</div>
        <div>{props.right}</div>
      </div>
    </nav>
  );
}
