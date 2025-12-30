import { useNotification } from '../contexts/NotificationContext';

// Custom hook with additional utility methods
export const useNotifications = () => {
  const notification = useNotification();

  // Enhanced methods with common use cases
  const notifyApiError = (error, customMessage = null) => {
    const message = customMessage || 
                   error?.response?.data?.message || 
                   error?.message || 
                   'An unexpected error occurred';
    
    return notification.showError(message, {
      title: 'Error',
      duration: 6000
    });
  };

  const notifyApiSuccess = (message, title = 'Success') => {
    return notification.showSuccess(message, {
      title,
      duration: 4000
    });
  };

  const notifyPermissionDenied = (permission) => {
    return notification.showWarning(
      `${permission} permission was denied. Please enable it in your browser settings.`,
      {
        title: 'Permission Required',
        duration: 8000,
        action: {
          label: 'Learn How',
          onClick: () => {
            // Could open a help modal or redirect to help page
            console.log('Show permission help');
          }
        }
      }
    );
  };

  const notifyConnectionIssue = () => {
    return notification.showError(
      'Connection lost. Please check your internet connection and try again.',
      {
        title: 'Connection Error',
        duration: 0, // Don't auto-dismiss
        action: {
          label: 'Retry',
          onClick: () => {
            window.location.reload();
          }
        }
      }
    );
  };

  const notifyMeetingJoined = (meetingId) => {
    return notification.showSuccess(
      `Successfully joined meeting ${meetingId}`,
      {
        title: 'Meeting Joined',
        duration: 3000
      }
    );
  };

  const notifyUserJoined = (userName) => {
    return notification.showInfo(
      `${userName} joined the meeting`,
      {
        duration: 3000
      }
    );
  };

  const notifyUserLeft = (userName) => {
    return notification.showInfo(
      `${userName} left the meeting`,
      {
        duration: 3000
      }
    );
  };

  const notifyMediaEnabled = () => {
    return notification.showSuccess(
      'Camera and microphone enabled successfully',
      {
        title: 'Media Enabled',
        duration: 3000
      }
    );
  };

  const notifyMediaDisabled = () => {
    return notification.showInfo(
      'Camera and microphone disabled',
      {
        duration: 2000
      }
    );
  };

  const notifyScreenShareStarted = () => {
    return notification.showInfo(
      'Screen sharing started',
      {
        duration: 2000
      }
    );
  };

  const notifyScreenShareStopped = () => {
    return notification.showInfo(
      'Screen sharing stopped',
      {
        duration: 2000
      }
    );
  };

  const notifyMessageSent = () => {
    return notification.showSuccess(
      'Message sent',
      {
        duration: 1500
      }
    );
  };

  const notifyLoginSuccess = (userName) => {
    return notification.showSuccess(
      `Welcome back, ${userName}!`,
      {
        title: 'Login Successful',
        duration: 3000
      }
    );
  };

  const notifyLogoutSuccess = () => {
    return notification.showInfo(
      'You have been logged out successfully',
      {
        title: 'Logged Out',
        duration: 3000
      }
    );
  };

  const notifyRegistrationSuccess = () => {
    return notification.showSuccess(
      'Account created successfully! Welcome to NexusMeet.',
      {
        title: 'Registration Complete',
        duration: 4000
      }
    );
  };

  const confirmLeaveMeeting = (onConfirm) => {
    return notification.showWarning(
      'Are you sure you want to leave the meeting? This action cannot be undone.',
      {
        title: 'Leave Meeting',
        duration: 0, // Don't auto-dismiss
        action: {
          label: 'Leave Meeting',
          onClick: () => {
            // Remove this notification first
            notification.clearAllNotifications();
            // Show leaving notification
            notification.showInfo('Leaving meeting...', { duration: 2000 });
            // Execute the leave action
            onConfirm();
          }
        }
      }
    );
  };

  const notifyMeetingLeft = () => {
    return notification.showSuccess(
      'You have left the meeting successfully',
      {
        title: 'Meeting Left',
        duration: 3000
      }
    );
  };

  const notifyMeetingError = (action) => {
    return notification.showError(
      `Failed to ${action} properly, but you will be redirected`,
      {
        title: 'Meeting Error',
        duration: 4000
      }
    );
  };

  return {
    // Original methods
    ...notification,
    
    // Enhanced utility methods
    notifyApiError,
    notifyApiSuccess,
    notifyPermissionDenied,
    notifyConnectionIssue,
    notifyMeetingJoined,
    notifyUserJoined,
    notifyUserLeft,
    notifyMediaEnabled,
    notifyMediaDisabled,
    notifyScreenShareStarted,
    notifyScreenShareStopped,
    notifyMessageSent,
    notifyLoginSuccess,
    notifyLogoutSuccess,
    notifyRegistrationSuccess,
    notifyMeetingLeft,
    notifyMeetingError,
    confirmLeaveMeeting,
    confirmAction
  };
};

export default useNotifications;
  const confirmAction = (message, title, onConfirm, confirmLabel = 'Confirm') => {
    return notification.showWarning(message, {
      title,
      duration: 0, // Don't auto-dismiss
      action: {
        label: confirmLabel,
        onClick: () => {
          notification.clearAllNotifications();
          onConfirm();
        }
      }
    });
  };