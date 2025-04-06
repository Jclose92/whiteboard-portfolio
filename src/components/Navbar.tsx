import React from 'react';

const Navbar: React.FC = () => {
  return (
    <nav style={{
      backgroundColor: '#333',
      padding: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontFamily: 'WhiteboardFont, sans-serif',
    }}>
      <div style={{
        color: 'white',
        fontSize: '1.5rem',
      }}>
        Whiteboard Portfolio
      </div>
      <div style={{
        display: 'flex',
        gap: '2rem',
      }}>
        <a href="/" style={{
          color: 'white',
          textDecoration: 'none',
          fontSize: '1rem',
          fontFamily: 'WhiteboardFont, sans-serif',
        }}>
          Home
        </a>
        <a href="/about" style={{
          color: 'white',
          textDecoration: 'none',
          fontSize: '1rem',
          fontFamily: 'WhiteboardFont, sans-serif',
        }}>
          About
        </a>
      </div>
    </nav>
  );
};

export default Navbar;
