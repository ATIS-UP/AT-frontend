import { useEffect } from 'react';
import { useNotificationStore } from '../../stores/notification.store';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const iconMap = {
  success: <CheckCircle className="h-5 w-5 text-green-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  info: <Info className="h-5 w-5 text-blue-500" />,
};

const bgMap = {
  success: 'bg-green-50 border-green-200',
  error: 'bg-red-50 border-red-200',
  warning: 'bg-yellow-50 border-yellow-200',
  info: 'bg-blue-50 border-blue-200',
};

function ToastItem({ id, type, message, duration = 5000 }: {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}) {
  const remove = useNotificationStore((s) => s.remove);

  useEffect(() => {
    const timer = setTimeout(() => remove(id), duration);
    return () => clearTimeout(timer);
  }, [id, duration, remove]);

  return (
    <div
      role="alert"
      onClick={() => remove(id)}
      className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-md cursor-pointer transition-opacity hover:opacity-80 ${bgMap[type]}`}
    >
      {iconMap[type]}
      <p className="text-sm text-gray-800 flex-1">{message}</p>
      <button
        aria-label="Dismiss notification"
        className="text-gray-400 hover:text-gray-600"
        onClick={(e) => {
          e.stopPropagation();
          remove(id);
        }}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const notifications = useNotificationStore((s) => s.notifications);
  // show max 5 visible at once
  const visible = notifications.slice(-5);

  if (visible.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {visible.map((n) => (
        <ToastItem key={n.id} {...n} />
      ))}
    </div>
  );
}
