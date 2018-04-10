import React from 'react';
import { NavLink } from 'react-router-dom';
import FontAwesome from 'react-fontawesome';

export default function (props) {
  return (
    <NavLink
      to={props.to}
      className="text-secondary"
    >
      <FontAwesome name={props.name} size="2x" />
    </NavLink>
  );
}
