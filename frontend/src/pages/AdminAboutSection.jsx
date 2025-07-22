import React, { useEffect, useState } from 'react';

const AdminAboutSection = ({ token }) => {
  const [content, setContent] = useState('');
  const [input, setInput] = useState('');
  const [msg, setMsg] = useState('');
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/about`)
      .then(res => res.json())
      .then(data => {
        setContent(data.content || '');
        setInput(data.content || '');
      });
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/about`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ content: input })
    });
    const data = await res.json();
    if (res.ok) {
      setContent(input);
      setMsg('About content updated!');
    } else {
      setMsg(data.message || 'Error updating content');
    }
  };
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h2>Edit About Page</h2>
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          rows={10}
          style={{ width: '100%', fontSize: '1rem', padding: 8, borderRadius: 8, border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ marginTop: 12, padding: '8px 24px', background: '#4f46e5', color: '#fff', border: 'none', borderRadius: 8 }}>Save</button>
      </form>
      {msg && <div style={{ marginTop: 10, color: msg.includes('updated') ? 'green' : 'red' }}>{msg}</div>}
    </div>
  );
};
export default AdminAboutSection; 