import React from 'react';
import { CSSTransition } from 'react-transition-group';

export default function (props) {
  return (
    <CSSTransition
      {...props}
      classNames="slide"
      timeout={1000}
    >
      {props.children}
    </CSSTransition>
  );
}
