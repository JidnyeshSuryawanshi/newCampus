import React from 'react';

export default function ActivityList({ title, activities }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between border-b pb-2">
            <div>
              <p className="font-medium">{activity.title}</p>
              <p className="text-sm text-gray-500">{activity.time}</p>
            </div>
            {activity.status ? (
              <span className={`px-3 py-1 ${activity.statusColor} rounded-full`}>
                {activity.status}
              </span>
            ) : (
              <span className={`text-${activity.valueColor || 'green'}-600`}>
                {activity.prefix || '₹'}{activity.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 