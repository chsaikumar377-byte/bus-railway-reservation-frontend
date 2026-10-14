import React from 'react';
import { Bus, Train, Shield, HelpCircle, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer no-print">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#fff', marginBottom: '0.75rem', fontWeight: 700, fontSize: '1.2rem' }}>
              <Bus size={22} style={{ color: '#2dd4bf' }} />
              <Train size={22} style={{ color: '#38bdf8' }} />
              TravelGo System
            </div>
            <p style={{ lineHeight: 1.6, marginBottom: '1rem' }}>
              A full-stack, enterprise-grade Bus and Railway Reservation System providing seamless schedule search, visual seat selection, concurrent transactional booking, and administrative route management.
            </p>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              Built with Spring Boot 3.3, MySQL 8, React & Vite.
            </div>
          </div>

          <div className="footer-col">
            <h5>Popular Routes</h5>
            <ul>
              <li>Mumbai &harr; Pune</li>
              <li>Delhi &harr; Jaipur</li>
              <li>Bangalore &harr; Chennai</li>
              <li>Hyderabad &harr; Bangalore</li>
            </ul>
          </div>

          <div className="footer-col">
            <h5>Demo System Notice</h5>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
              This web application is developed for educational and demonstration purposes. All fares, schedules, train numbers, and simulated payments are mock demo records.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            &copy; {new Date().getFullYear()} TravelGo Bus & Railway Reservation System. All rights reserved.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748b' }}>
            College Project Edition
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
