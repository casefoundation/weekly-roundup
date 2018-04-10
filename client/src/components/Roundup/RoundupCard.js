import React from 'react';
import { Link } from 'react-router-dom';
import dateFormat from 'dateformat';

export default function (props) {
  const dateSent = dateFormat(new Date(props.roundup.date_sent));
  const title = props.roundup.subject ? props.roundup.subject : 'No Subject';
  return (
    <Link to={props.to} className={`roundup-card w-100 ${props.roundup.date_sent ? '' : 'draft'}`}>
      <div className="inner">
        <h5>{title}</h5>
        <div className="text-secondary pb-2">{props.articleCount} Articles</div>
        <span className={props.roundup.date_sent ? '' : 'text-danger'}>
          {props.roundup.date_sent ? dateSent : 'Draft - Not Yet Sent'}
        </span>
      </div>
    </Link>
  );
}
