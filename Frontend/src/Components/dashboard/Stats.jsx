import React from 'react';

export default function Stats({ items }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map((item, index) => (
        <div key={index} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
          <p className={`text-3xl font-bold ${item.colorClass}`}>
            {item.prefix || ''}{item.value}{item.suffix || ''}
          </p>
        </div>
      ))}
    </div>
  );
} 