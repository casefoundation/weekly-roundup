import React from 'react';
import FontAwesome from 'react-fontawesome';
import SidebarIconLink from './SidebarIconLink';
import { UIConfig } from '../../config';

export default function (props) {
  // Mobile/Non-mobile styles
  let style;
  if (!props.isExpanded) {
    style = {
      marginLeft: `-${UIConfig.sidebarWidth}px`,
    };
  }

  return (
    <nav id="sidebar" className="text-white bg-dark" style={style}>
      <ul className="p-0 w-100 h-100 d-flex flex-column align-items-center">

        { // Hide Mobile Menu Button 
          props.isMobile && props.isExpanded &&
          <li className="mt-4"><FontAwesome name="arrow-left" role="button" onClick={props.onCollapseClick} /></li>
        }

        <li className="mt-3">
          <div>
            <div>Weekly</div>
            <div className="small">Roundup</div>
          </div>
        </li>
        <li className="mt-4"><SidebarIconLink to="/roundup" name="folder-open" /></li>
        <li className="mt-4"><SidebarIconLink to="/settings" name="cog" /></li>

        { // only Admins can modify users
          props.isAdmin &&
          <li className="mt-4"><SidebarIconLink to="/users" name="user" /></li>
        }
        
        <li className="mt-auto mb-3"><span className="small text-white" role="button" onClick={props.onLogout}>Logout</span></li>
      </ul>        
    </nav>
  );
}
