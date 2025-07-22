import React, { useEffect, useState } from 'react';
import './About.css';

const About = () => {
  const [content, setContent] = useState('');
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/about`)
      .then(res => res.json())
      .then(data => setContent(data.content || ''));
  }, []);
  return (
    <div className="about-container">
      <h1>About Us</h1>
      <div className="about-content">
        {content
          ? content.split('\n').map((line, i) => <p key={i}>{line}</p>)
          : <p>No content yet.</p>}
      </div>
    </div>
  );
};
export default About; 