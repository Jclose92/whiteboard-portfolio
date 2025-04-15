import React from 'react';

const RedOverlay: React.FC = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'red',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <button
        style={{
          backgroundColor: 'white',
          color: 'red',
          padding: '15px 30px',
          border: '2px solid red',
          borderRadius: '8px',
          fontSize: '18px',
          cursor: 'pointer',
        }}
        onClick={() => window.history.back()}
      >
        Back to Main Page
      </button>
    </div>
  );
};

export default RedOverlay;
