import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import App from './App';
import About from './pages/About';
import Navbar from './components/Navbar';

const Routing: React.FC = () => {
  return (
    <Router>
      <div style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Navbar />
        <main style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
        }}>
          <Switch>
            <Route path="/" render={() => <App />} exact />
            <Route path="/about" render={() => <About />} />
          </Switch>
        </main>
      </div>
    </Router>
  );
};

export default Routing;
