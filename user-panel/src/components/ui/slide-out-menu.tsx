
// MobileNavigation.tsx
import React, { useState } from 'react';
import styles from './MobileNav.module.css';

const MobileNavigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Bottom Bar */}
      <nav className={styles.mobile_bottom_nav}>
        <button onClick={() => window.scrollTo(0,0)}>Home</button>
        <button onClick={() => setIsOpen(true)}>Categories</button>
        <button>Search</button>
        <button>Profile</button>
      </nav>

      {/* Drawer Overlay */}
      {isOpen && (
        <div className={styles.drawer_overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.drawer_content} onClick={e => e.stopPropagation()}>
            <div className={styles.drawer_header}>
              <h3>Categories</h3>
              <button onClick={() => setIsOpen(false)}>Close</button>
            </div>
            <ul className={styles.category_list}>
              {/* These items were extracted from your .sticky-menu_root */}
              <li><a href="/all">All games</a></li>
              <li><a href="/new">New</a></li>
              <li><a href="/slots">Slots</a></li>
              <li><a href="/roulette">Roulette</a></li>
              {/* ... more items */}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};