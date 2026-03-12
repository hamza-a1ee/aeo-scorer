import { Toaster, ToastBar } from 'react-hot-toast';

export function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      toastOptions={{
        className: 'font-uncut-sans',
        style: {
          background: 'var(--card)',
          color: 'var(--card-foreground)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: '12px 16px',
          fontSize: '14px',
          maxWidth: 'min(560px, 95vw)',
        },
        success: {
          style: {
            borderLeft: '4px solid var(--primary-green-50)',
          },
          iconTheme: {
            primary: 'var(--primary-green-50)',
            secondary: 'var(--profile-completed-bg)',
          },
        },
        error: {
          style: {
            borderLeft: '4px solid var(--destructive)',
          },
          iconTheme: {
            primary: 'var(--destructive)',
            secondary: 'var(--card)',
          },
        },
      }}
    >
      {t => (
        <ToastBar
          toast={t}
          style={{
            ...t.style,
            animation: t.visible
              ? 'toast-slide-in-right 0.2s ease-out'
              : 'toast-slide-out-right 0.1s ease-in forwards',
          }}
        />
      )}
    </Toaster>
  );
}
