import React, { useState } from 'react';
import './About.css';

const About: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => {
    setIsModalOpen((prev) => !prev);
  };

  return (
    <>
      {/* About Button */}
      <button className="about-button" onClick={toggleModal}>
        About
      </button>

      {/* Modal Window */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={toggleModal}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
          >
            <button className="close-button" onClick={toggleModal}>
              &times;
            </button>
            <h2>About Pollcat</h2>
            
            <p>Created by <a href='https://github.com/NightKoneko'>NightKoneko</a></p>

            {/* Footer */}
            <div className="footer px-8 py-16 flex flex-col md:flex-row">
              <div className="flex flex-col justify-center text-sm font-light text-gray-400">

                  {/* GitHub Icon */}
                  <a href="https://github.com/NightKoneko/pollcat" target="_blank" rel="noopener noreferrer" className="tech-icon">
                    <svg
                      viewBox="0 0 24 24"
                      style={{ width: '2rem', height: '2rem', fill: 'currentColor' }}
                    >
                      <path d="M12,2A10,10 0 0,0 2,12C2,16.42 4.87,20.17 8.84,21.5C9.34,21.58 9.5,21.27 9.5,21C9.5,20.77 9.5,20.14 9.5,19.31C6.73,19.91 6.14,17.97 6.14,17.97C5.68,16.81 5.03,16.5 5.03,16.5C4.12,15.88 5.1,15.9 5.1,15.9C6.1,15.97 6.63,16.93 6.63,16.93C7.5,18.45 8.97,18 9.54,17.76C9.63,17.11 9.89,16.67 10.17,16.42C7.95,16.17 5.62,15.31 5.62,11.5C5.62,10.39 6,9.5 6.65,8.79C6.55,8.54 6.2,7.5 6.75,6.15C6.75,6.15 7.59,5.88 9.5,7.17C10.29,6.95 11.15,6.84 12,6.84C12.85,6.84 13.71,6.95 14.5,7.17C16.41,5.88 17.25,6.15 17.25,6.15C17.8,7.5 17.45,8.54 17.35,8.79C18,9.5 18.38,10.39 18.38,11.5C18.38,15.32 16.04,16.16 13.81,16.41C14.17,16.72 14.5,17.33 14.5,18.26C14.5,19.6 14.5,20.68 14.5,21C14.5,21.27 14.66,21.59 15.17,21.5C19.14,20.16 22,16.42 22,12A10,10 0 0,0 12,2Z" />
                    </svg>
                  </a>
                  <h3 className="mb-2 text-gray-500">Made With:</h3>
                <div className="tech-icons flex space-x-4">
                  {/* React Icon */}
                  <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer" className="tech-icon">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg"
                      alt="React"
                      className="w-8 h-8"
                      style={{ width: '2rem', height: '2rem', fill: 'currentColor'}}
                    />
                  </a>
                  {/* Node.js Icon */}
                  <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer" className="tech-icon">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg"
                      alt="Node.js"
                      className="w-8 h-8"
                      style={{ width: '2rem', height: '2rem', fill: 'currentColor' }}
                    />
                  </a>
                  {/* Vercel Icon */}
                  <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="tech-icon">
                    <img
                      src="https://assets.vercel.com/image/upload/front/favicon/vercel/favicon.ico"
                      alt="Node.js"
                      className="w-8 h-8"
                      style={{ width: '2rem', height: '2rem', fill: 'currentColor' }}
                    />
                  </a>
                  {/* Render Icon */}
                  <a href="https://render.com" target="_blank" rel="noopener noreferrer" className="tech-icon">
                    <img
                      src="https://cdn.sanity.io/images/hvk0tap5/production/0ea63c1b6854bd803489557afb4ea54b85239418-128x128.png"
                      alt="Node.js"
                      className="w-8 h-8"
                      style={{ width: '2rem', height: '2rem', fill: 'currentColor' }}
                    />
                  </a>
                  {/* MongoDB Icon */}
                  <a href="https://mongodb.com" target="_blank" rel="noopener noreferrer" className="tech-icon">
                    <img
                      src="https://www.mongodb.com/assets/images/global/favicon.ico"
                      alt="Node.js"
                      className="w-8 h-8"
                      style={{ width: '2rem', height: '2rem', fill: 'currentColor' }}
                    />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default About;
