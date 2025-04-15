import React from 'react';
import { useNavigate } from 'react-router-dom';

const RedOverlayButton: React.FC = () => {
  const navigate = useNavigate();

  return (
    <button
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'red',
        color: 'white',
        padding: '15px 30px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        cursor: 'pointer',
        zIndex: 1000,
      }}
      onClick={() => navigate('/red-overlay')}
    >
      Go to Red Overlay
    </button>
  );
};

export default RedOverlayButton;
