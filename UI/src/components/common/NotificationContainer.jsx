import React from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimes, FaExclamationCircle } from 'react-icons/fa';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) {
    return null;
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500" />;
      case 'error':
        return <FaExclamationCircle className="text-red-500" />;
      case 'warning':
        return <FaExclamationTriangle className="text-yellow-500" />;
      case 'info':
      default:
        return <FaInfoCircle className="text-blue-500" />;
    }
  };

  const getNotificationStyles = (type) => {
    const baseStyles = "border-l-4 shadow-lg rounded-r-lg";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-50 border-green-500 text-green-800`;
      case 'error':
        return `${baseStyles} bg-red-50 border-red-500 text-red-800`;
      case 'warning':
        return `${baseStyles} bg-yellow-50 border-yellow-500 text-yellow-800`;
      case 'info':
      default:
        return `${baseStyles} bg-blue-50 border-blue-500 text-blue-800`;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationStyles(notification.type)} p-4 animate-slide-in-right`}
        >
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-3 mt-0.5">
              {getNotificationIcon(notification.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              {notification.title && (
                <h4 className="font-semibold text-sm mb-1">
                  {notification.title}
                </h4>
              )}
              <p className="text-sm leading-relaxed">
                {notification.message}
              </p>
              {(notification.action || notification.actions) && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {notification.action && (
                    <button
                      onClick={notification.action.onClick}
                      className="notification-action-button notification-primary-button text-xs font-medium px-4 py-2 rounded-md shadow-sm"
                    >
                      {notification.action.label}
                    </button>
                  )}
                  {notification.actions && notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className={`notification-action-button text-xs font-medium px-4 py-2 rounded-md shadow-sm ${
                        action.type === 'primary' 
                          ? 'notification-primary-button'
                          : 'notification-secondary-button'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                  {/* Cancel button for confirmations */}
                  {notification.type === 'warning' && notification.action && (
                    <button
                      onClick={() => removeNotification(notification.id)}
                      className="notification-action-button notification-secondary-button text-xs font-medium px-4 py-2 rounded-md shadow-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
          </div>
          
          {/* Progress bar for timed notifications */}
          {notification.duration > 0 && (
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-current h-1 rounded-full animate-progress"
                style={{ 
                  animationDuration: `${notification.duration}ms`,
                  animationTimingFunction: 'linear'
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;