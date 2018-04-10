import React from 'react';

export default function (props) {
  return (
    <div className="modal-backdrop bg">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{props.title}</h5>
            <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={props.onCancel}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            {props.children}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={props.onOk}>{props.okText}</button>
            <button type="button" className="btn btn-secondary" data-dismiss="modal" onClick={props.onCancel}>{props.cancelText}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
