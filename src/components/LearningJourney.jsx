import React from 'react';
import {
  BookOpen,
  ArrowRight,
  Flame,
  Clock,
  Compass,
  CheckCircle2,
  Circle,
  Award,
  Sparkles,
} from 'lucide-react';
import { formatRelativeActivity, TOTAL_BOOK_PAGES } from '../services/readingProgress';

export default function LearningJourney({
  progress = {},
  onResumeReading,
}) {
  const {
    lastPage = 1,
    totalPages = TOTAL_BOOK_PAGES,
    progressPercentage = 0,
    completedChapters = 0,
    currentChapterTitle = 'Introduction: The Social Freedom Mindset',
    currentChapterNumber = 1,
    lastOpenedAt = null,
    totalReadingTimeSeconds = 0,
    readingStreak = 0,
    isStarted = false,
  } = progress;

  // Format reading time nicely (e.g., "12 mins", "1.4 hrs")
  const formatReadingTime = (seconds = 0) => {
    if (!seconds || seconds < 60) return isStarted ? '< 1 min' : '0 mins';
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} mins`;
    const hrs = (mins / 60).toFixed(1);
    return `${hrs} hrs`;
  };

  // 5 Real, calculated reading milestones
  const milestones = [
    { id: 'start', label: 'First Step', targetPage: 1, achieved: isStarted && lastPage >= 1, desc: 'Began the manual' },
    { id: 'q1', label: '25% Mark', targetPage: 23, achieved: lastPage >= 23, desc: 'Foundations laid' },
    { id: 'half', label: 'Halfway', targetPage: 45, achieved: lastPage >= 45, desc: 'Conversation Engine' },
    { id: 'q3', label: '75% Mark', targetPage: 68, achieved: lastPage >= 68, desc: 'Advanced composure' },
    { id: 'finish', label: 'Mastery', targetPage: 90, achieved: lastPage >= 90, desc: 'Field Guide Complete' },
  ];

  return (
    <div className="card learning-journey-card" style={{ padding: 'clamp(1.25rem, 3vw, 1.75rem)' }}>
      {/* ==================================================================
          A. HEADER
          ================================================================== */}
      <div className="learning-journey-header" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: 'var(--red-subtle)',
                color: 'var(--red-primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={16} />
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'var(--red-primary)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              Personalized Reading Companion
            </span>
          </div>

          {isStarted && (
            <span
              style={{
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-muted)',
              }}
            >
              Last active: {formatRelativeActivity(lastOpenedAt)}
            </span>
          )}
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.45rem',
            fontWeight: 700,
            color: 'var(--text-main)',
            margin: '0 0 0.25rem 0',
            letterSpacing: '-0.01em',
          }}
        >
          YOUR LEARNING JOURNEY
        </h3>

        <div style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: '0.2rem' }}>
          &ldquo;Small steps. Real progress. Lasting change.&rdquo;
        </div>

        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
          Your progress is built one page at a time.
        </p>
      </div>

      {/* ==================================================================
          D. CONTINUE READING HERO CARD (PRIMARY INTERACTIVE ELEMENT)
          ================================================================== */}
      <div
        className="learning-resume-box"
        style={{
          background: 'linear-gradient(145deg, #FFFDFB 0%, #F9F5EE 100%)',
          border: '1.5px solid var(--border-main)',
          borderRadius: 'var(--radius-md)',
          padding: '1.15rem 1.25rem',
          marginBottom: '1.25rem',
          boxShadow: '0 4px 16px rgba(36, 23, 15, 0.05)',
        }}
      >
        {!isStarted ? (
          /* Empty State: Journey Starts Here */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <Sparkles size={16} color="var(--red-primary)" />
              <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)' }}>
                Your journey starts here.
              </div>
            </div>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 1rem 0' }}>
              Every page you read brings you closer to mastering social confidence. Open page 1 to begin.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onResumeReading(1)}
              style={{
                width: '100%',
                padding: '0.8rem 1.2rem',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>Start Reading (Page 1)</span>
              <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          /* Active Reading State */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'var(--red-primary)',
                  backgroundColor: 'var(--red-subtle)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--red-subtle-border)',
                }}
              >
                CURRENT CHAPTER
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Page {lastPage} of {totalPages}
              </span>
            </div>

            <div
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                fontFamily: 'var(--font-display)',
                lineHeight: 1.35,
                marginBottom: '0.35rem',
              }}
            >
              {currentChapterTitle}
            </div>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              The Mentico Mastery Blueprint (Course) • Chapter {currentChapterNumber}
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onResumeReading(lastPage)}
              id="btn-resume-reading"
              style={{
                width: '100%',
                padding: '0.85rem 1.35rem',
                fontWeight: 800,
                fontSize: '0.92rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.55rem',
                boxShadow: '0 4px 18px rgba(220, 38, 38, 0.22)',
              }}
            >
              <span>Resume Reading (Page {lastPage})</span>
              <ArrowRight size={17} />
            </button>
          </div>
        )}
      </div>

      {/* ==================================================================
          B. READING PROGRESS BAR
          ================================================================== */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
            Overall Reading Progress
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 800,
              fontSize: '0.92rem',
              color: 'var(--red-primary)',
            }}
          >
            {progressPercentage}% Complete
          </span>
        </div>

        {/* Outer Bar */}
        <div
          style={{
            width: '100%',
            height: '9px',
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            border: '1px solid var(--border-main)',
          }}
        >
          <div
            style={{
              width: `${progressPercentage}%`,
              height: '100%',
              backgroundColor: 'var(--red-primary)',
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          <span>{isStarted ? `${lastPage} of ${totalPages} pages read` : `0 of ${totalPages} pages read`}</span>
          <span>{isStarted ? `${Math.max(0, totalPages - lastPage)} pages remaining` : `${totalPages} pages total`}</span>
        </div>
      </div>

      {/* ==================================================================
          C. LEARNING STATISTICS (3 COMPACT CARDS)
          ================================================================== */}
      <div
        className="learning-stats-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.65rem',
          marginBottom: '1.25rem',
        }}
      >
        {/* Stat 1: Chapters Completed */}
        <div
          style={{
            padding: '0.75rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            Modules
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {completedChapters}/7
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            Completed
          </div>
        </div>

        {/* Stat 2: Reading Streak */}
        <div
          style={{
            padding: '0.75rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            Streak
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--red-primary)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
            <Flame size={14} />
            <span>{readingStreak}d</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            {readingStreak > 0 ? 'Active' : 'Start Today'}
          </div>
        </div>

        {/* Stat 3: Total Reading Time */}
        <div
          style={{
            padding: '0.75rem 0.65rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            Invested
          </div>
          <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
            {formatReadingTime(totalReadingTimeSeconds)}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
            Reading Time
          </div>
        </div>
      </div>

      {/* ==================================================================
          E. LEARNING MILESTONES
          ================================================================== */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Award size={14} color="var(--red-primary)" />
            <span>Learning Milestones</span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            {milestones.filter((m) => m.achieved).length} of 5 Achieved
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {milestones.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: m.achieved ? 'var(--red-subtle)' : 'var(--bg-surface)',
                border: m.achieved ? '1px solid var(--red-subtle-border)' : '1px solid var(--border-subtle)',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0 }}>
                {m.achieved ? (
                  <CheckCircle2 size={16} color="var(--red-primary)" style={{ flexShrink: 0 }} />
                ) : (
                  <Circle size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                )}
                <div>
                  <span
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: m.achieved ? 700 : 500,
                      color: m.achieved ? 'var(--text-main)' : 'var(--text-secondary)',
                    }}
                  >
                    {m.label}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '0.35rem' }}>
                    • {m.desc}
                  </span>
                </div>
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: m.achieved ? 'var(--red-primary)' : 'var(--text-muted)',
                  flexShrink: 0,
                }}
              >
                p.{m.targetPage}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

