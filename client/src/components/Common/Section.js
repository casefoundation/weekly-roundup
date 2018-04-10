import React from 'react';
import FontAwesome from 'react-fontawesome';
import classnames from 'classnames';
import { TransitionGroup } from 'react-transition-group';
import SlideTransition from './SlideTransition';

export default function (props) {
  let headerLeft = (
    <div
      className="d-flex flex-row align-items-center"
      onClick={props.isCollapsed ? props.onExpand : props.onCollapse}
      role="button"
    >
      <FontAwesome name={props.isCollapsed ? 'chevron-down' : 'chevron-up'} />
      <h4 className={classnames('px-3 m-0', props.titleClassName)}>{props.title}</h4>
    </div>
  );
  if (!props.onExpand && !props.onCollapse) {
    headerLeft = (
      <div className="d-flex flex-row align-items-center">
        <h4 className={classnames('px-4 m-0', props.titleClassName)}>{props.title}</h4>
      </div>
    );
  }

  return (
    <div className={classnames('section', props.className)}>
      <div className="inner">
        <div className="header pb-3 d-flex flex-row justify-content-start align-items-center flex-wrap">
          {headerLeft}
          <div className="ml-auto">
            {props.headerRight}
          </div>
        </div>
        <TransitionGroup>
          {!props.isCollapsed &&
            <SlideTransition key={1}>
              <div className="content ml-1 ml-sm-4 pl-1">
                {props.children}
              </div>
            </SlideTransition>
          }
        </TransitionGroup>
      </div>
    </div>
  );
}
