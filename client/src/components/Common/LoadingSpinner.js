import React from 'react';
import FontAwesome from 'react-fontawesome';

export default function () {
  return (
    <div className="w-100 h-100 text-dark d-flex flex-column justify-content-center align-items-center">
      <FontAwesome name="spinner" size="4x" spin />
    </div>
  );
}
