import React, { useState } from 'react';
import { Container,Button } from 'mc-ui-comatv';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { name: 'Projects', href: '#new Project' },
    { name: 'New Projects', href: '#projects' },
    { name: 'Big projects', href: '#Big projects' }
  ];

  return (
    <Container variant="white" style={{ width: '100%', margin: 0, transform: 'translateX(0)' }}>
      <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl text-gray-800 minecraft-font">
                Coma TV
            </h1>
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                {menuItems.map((item) => (
                  <h1
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm transition-colors"
                  >
                    {item.name}
                  </h1>
                ))}
              </div>
            </div>

            <div className="hidden md:block">
              <Button 
                variant="green"
                label="Contact" 
                onClick={() => setIsMenuOpen(false)}
              />
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-green-600 focus:outline-none focus:text-green-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div>
                {menuItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <Button 
                    variant="green"
                    label="Contact" 
                    width="100%"
                    onClick={() => setIsMenuOpen(false)}
                />
              </div>
            </div>
          )}
    </Container>
  );
};

export default Navbar; 