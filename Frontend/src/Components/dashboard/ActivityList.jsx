import React from 'react';

export default function ActivityList({ title, activities }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {activities.length > 0 ? (
          activities.map((activity, index) => (
            <div key={index} className="flex items-center justify-between border-b pb-4 last:border-b-0">
            <div>
              <p className="font-medium">{activity.title}</p>
                {activity.subtitle && (
                  <p className="text-xs text-gray-500">{activity.subtitle}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">{activity.time}</p>
                {activity.description && (
                  <p className="text-sm text-gray-700 mt-1">{activity.description}</p>
                )}
            </div>
              <div className="flex flex-col items-end">
                {activity.status && (
                  <span className={`px-3 py-1 ${activity.statusColor} rounded-full text-xs mb-1`}>
                {activity.status}
              </span>
                )}
                {activity.value && (
                  <span className={`font-medium text-${activity.valueColor || 'green'}-600`}>
                    {activity.prefix || ''}{activity.value}
                  </span>
                )}
                {activity.valueCaption && (
                  <span className="text-xs text-gray-500 mt-1">
                    ₹{activity.valueCaption}
              </span>
            )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No {title.toLowerCase()} to display
          </div>
        )}
      </div>
    </div>
  );
} 