import React from 'react';

export function SkeletonBox({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', className = '', style = {} }) {
  return (
    <span
      className={`skeleton-box ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function SkeletonCircle({ size = 48, className = '', style = {} }) {
  return (
    <span
      className={`skeleton-box skeleton-circle ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        ...style,
      }}
    />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="container" style={{ paddingBottom: '5rem' }}>
      {/* Top Banner Skeleton */}
      <div
        className="card"
        style={{
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '2.5rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <SkeletonCircle size={64} />
            <div>
              <SkeletonBox width="220px" height="28px" style={{ marginBottom: '0.5rem' }} />
              <SkeletonBox width="160px" height="18px" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <SkeletonBox width="120px" height="42px" borderRadius="var(--radius-md)" />
            <SkeletonBox width="140px" height="42px" borderRadius="var(--radius-md)" />
          </div>
        </div>

        <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <SkeletonBox width="140px" height="16px" />
          <SkeletonBox width="180px" height="16px" />
          <SkeletonBox width="120px" height="16px" />
        </div>
      </div>

      {/* Stats Row Skeleton */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {[1, 2, 3, 4].map(idx => (
          <div key={idx} className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <SkeletonBox width="90px" height="14px" />
              <SkeletonCircle size={28} />
            </div>
            <SkeletonBox width="130px" height="32px" style={{ marginBottom: '0.5rem' }} />
            <SkeletonBox width="100%" height="12px" />
          </div>
        ))}
      </div>

      {/* Main Grid: Left PDF Downloader & Right Curriculum */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr',
          gap: '2rem',
        }}
      >
        {/* Left Column: Download Vault */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <SkeletonBox width="180px" height="24px" style={{ marginBottom: '0.5rem' }} />
              <SkeletonBox width="260px" height="16px" />
            </div>
            <SkeletonBox width="90px" height="24px" borderRadius="var(--radius-full)" />
          </div>

          <div
            style={{
              padding: '1.75rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-main)',
              marginBottom: '2rem',
              display: 'flex',
              gap: '1.5rem',
              alignItems: 'center',
            }}
          >
            <SkeletonBox width="90px" height="120px" borderRadius="var(--radius-sm)" />
            <div style={{ flex: 1 }}>
              <SkeletonBox width="220px" height="20px" style={{ marginBottom: '0.5rem' }} />
              <SkeletonBox width="100%" height="14px" style={{ marginBottom: '0.5rem' }} />
              <SkeletonBox width="70%" height="14px" style={{ marginBottom: '1rem' }} />
              <SkeletonBox width="180px" height="38px" borderRadius="var(--radius-md)" />
            </div>
          </div>

          <SkeletonBox width="100%" height="60px" borderRadius="var(--radius-md)" style={{ marginBottom: '1rem' }} />
          <SkeletonBox width="100%" height="60px" borderRadius="var(--radius-md)" />
        </div>

        {/* Right Column: Module Action List */}
        <div className="card" style={{ padding: '2rem' }}>
          <SkeletonBox width="160px" height="22px" style={{ marginBottom: '0.5rem' }} />
          <SkeletonBox width="220px" height="14px" style={{ marginBottom: '1.5rem' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-surface)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                <SkeletonCircle size={24} />
                <div style={{ flex: 1 }}>
                  <SkeletonBox width="75%" height="16px" style={{ marginBottom: '0.4rem' }} />
                  <SkeletonBox width="45%" height="12px" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
