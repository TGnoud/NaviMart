import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationsApi } from '../api';
import type { AppNotification } from '../api';

function relativeTime(value?: string) {
  if (!value) return '';
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Hôm qua';
  return `${days} ngày trước`;
}

function iconFor(type: string) {
  if (type.includes('expir')) return { icon: 'warning', color: 'text-error' };
  if (type.includes('recipe') || type.includes('meal')) return { icon: 'restaurant', color: 'text-secondary' };
  if (type.includes('family')) return { icon: 'group', color: 'text-primary' };
  if (type.includes('shopping') || type.includes('list')) return { icon: 'shopping_cart', color: 'text-primary' };
  return { icon: 'notifications', color: 'text-on-surface-variant' };
}

export default function NotificationDropdown() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleOpen = () => {
    if (!open) setLoading(true);
    setOpen(!open);
  };

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    notificationsApi
      .list({ limit: 5 })
      .then((data) => {
        if (!cancelled) setNotifications(data);
      })
      .catch(() => {
        if (!cancelled) setNotifications([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnOutsideClick);
    return () => document.removeEventListener('mousedown', closeOnOutsideClick);
  }, [open]);

  const hasUnread = notifications.some((notification) => !notification.readAt);

  const markAsRead = async (notification: AppNotification) => {
    if (notification.readAt) return;
    try {
      const updated = await notificationsApi.markAsRead(notification.id);
      setNotifications((items) =>
        items.map((item) => (item.id === notification.id ? updated : item)),
      );
    } catch {
      // Không chặn thao tác người dùng nếu đánh dấu đọc thất bại.
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={toggleOpen}
        className="relative text-on-surface-variant hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors p-2 rounded-full flex items-center justify-center active:opacity-80 active:scale-95 duration-150"
        aria-label="Mở thông báo"
        aria-expanded={open}
      >
        <span className="material-symbols-outlined">notifications</span>
        {hasUnread && <span className="absolute right-2 top-2 w-2 h-2 rounded-full bg-primary" />}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[340px] max-w-[calc(100vw-2rem)] rounded-xl border border-outline-variant/50 bg-surface-container-lowest shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-outline-variant/30 flex items-center justify-between">
            <h2 className="font-headline-sm text-[18px] leading-6 font-bold text-on-surface">Thông báo gần đây</h2>
            <Link
              to="/notifications"
              onClick={() => setOpen(false)}
              className="font-label-sm text-label-sm font-semibold text-primary hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-14 rounded-lg bg-surface-container-low animate-pulse" />
                ))}
              </div>
            ) : notifications.length > 0 ? (
              notifications.map((notification, index) => {
                const { icon, color } = iconFor(notification.type);
                const createdAt = (notification as AppNotification & { createdAt?: string }).createdAt;
                return (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => markAsRead(notification)}
                    className={`w-full text-left px-4 py-3 hover:bg-surface-container-low transition-colors ${
                      index !== notifications.length - 1 ? 'border-b border-outline-variant/20' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`material-symbols-outlined text-[20px] mt-0.5 ${color}`}>{icon}</span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-body-md text-body-md font-bold text-on-surface truncate">{notification.title}</p>
                          {!notification.readAt && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                        </div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant line-clamp-2 mt-0.5">
                          {notification.body}
                        </p>
                        {createdAt && (
                          <p className="font-label-sm text-[12px] leading-4 text-outline mt-1">{relativeTime(createdAt)}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2">notifications_off</span>
                <p className="font-body-md text-body-md">Chưa có thông báo mới.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
