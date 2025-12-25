'use client';

export default function Announcements({ items }) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <h3 style={{ 
        fontSize: '0.75rem', 
        textTransform: 'uppercase', 
        letterSpacing: '1px',
        color: 'var(--text-muted)',
        marginBottom: '0.75rem'
      }}>
        Announcements
      </h3>
      {items.map((item) => (
        <div key={item.id} className="announcement">
          <div className="announcement-title">{item.title}</div>
          <div className="announcement-content">{item.content}</div>
          <div className="announcement-date">
            Posted: {new Date(item.created_at).toLocaleDateString('en-GB')}
            {item.expiry_date && ` • Expires: ${new Date(item.expiry_date).toLocaleDateString('en-GB')}`}
          </div>
        </div>
      ))}
    </div>
  );
}
