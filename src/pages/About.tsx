import React from 'react';

const About: React.FC = () => {
  return (
    <div style={{
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto',
      fontFamily: 'WhiteboardFont, sans-serif',
    }}>
      <h1 style={{
        fontFamily: 'WhiteboardFont, sans-serif',
      }}>About Page</h1>
      <p style={{
        fontFamily: 'WhiteboardFont, sans-serif',
      }}>This is the about page.</p>
      <a href="/" style={{
        display: 'inline-block',
        marginTop: '1rem',
        padding: '0.5rem 1rem',
        background: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '4px',
        textAlign: 'center',
        fontFamily: 'WhiteboardFont, sans-serif',
      }}>
        Back to Home
      </a>
    </div>
  );
};

export default About;
