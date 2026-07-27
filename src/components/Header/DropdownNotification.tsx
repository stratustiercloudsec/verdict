import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import ClickOutside from '../ClickOutside';

// ─── Constants ────────────────────────────────────────────────────────────────
const API_BASE = 'https://jdig9yqazd.execute-api.us-east-1.amazonaws.com/prod';
const STORAGE_KEY = 'verdict_notifications';
const POLL_INTERVAL_MS = 10000; // Poll every 10 seconds

// ─── Types ────────────────────────────────────────────────────────────────────
type JobType = 'coverage' | 'estimator';
type JobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'ERROR';

interface NotificationJob {
  id: string;           // auditId
  type: JobType;
  projectName: string;
  status: JobStatus;
  timestamp: string;    // ISO string — when submitted
  completedAt?: string; // ISO string — when COMPLETED
  seen: boolean;        // whether user has opened the dropdown since completion
  score?: number;
  title?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Read all tracked jobs from localStorage */
function loadJobs(): NotificationJob[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Persist jobs to localStorage */
function saveJobs(jobs: NotificationJob[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

/**
 * Public helper — call this from CoverageReport.tsx and
 * ProductionSuccessEstimator.tsx right after receiving the auditId
 * so the notification system starts tracking it immediately.
 *
 * Usage:
 *   import { registerNotificationJob } from '../components/Header/DropdownNotification';
 *   registerNotificationJob({ id: auditId, type: 'coverage', projectName: 'Heat' });
 */
export function registerNotificationJob(job: {
  id: string;
  type: JobType;
  projectName: string;
}): void {
  const jobs = loadJobs();
  // Avoid duplicates
  if (jobs.find((j) => j.id === job.id)) return;
  jobs.unshift({
    ...job,
    status: 'QUEUED',
    timestamp: new Date().toISOString(),
    seen: false,
  });
  // Keep only the latest 20 jobs
  saveJobs(jobs.slice(0, 20));
}

/** Format ISO timestamp → human-readable "12 May, 2025" */
function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

/** Status pill colour */
function statusColor(status: JobStatus): string {
  switch (status) {
    case 'COMPLETED': return 'text-meta-3';           // green
    case 'QUEUED':
    case 'PROCESSING': return 'text-warning';          // amber
    case 'FAILED':
    case 'ERROR': return 'text-meta-1';                // red
    default: return 'text-bodydark';
  }
}

/** Feature icon */
function typeIcon(type: JobType): string {
  return type === 'coverage' ? '📄' : '📊';
}

/** Feature label */
function typeLabel(type: JobType): string {
  return type === 'coverage' ? 'Coverage Report' : 'Success Estimator';
}

/** Deep-link destination once COMPLETED */
function detailLink(job: NotificationJob): string {
  if (job.type === 'coverage') {
    return `/audit-detail/${job.id}`;
  }
  return `/estimator-detail/${job.id}?projectName=${encodeURIComponent(job.projectName)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
const DropdownNotification = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [jobs, setJobs] = useState<NotificationJob[]>(loadJobs);

  // Derived: how many unseen COMPLETED jobs exist
  const unseenCount = jobs.filter(
    (j) => (j.status === 'COMPLETED' || j.status === 'FAILED' || j.status === 'ERROR') && !j.seen
  ).length;

  // ── Poll active jobs ────────────────────────────────────────────────────────
  const pollJobs = useCallback(async () => {
    const current = loadJobs();
    const pending = current.filter(
      (j) => j.status === 'QUEUED' || j.status === 'PROCESSING'
    );
    if (!pending.length) return;

    const updated = [...current];

    await Promise.allSettled(
      pending.map(async (job) => {
        try {
          let url = '';
          if (job.type === 'coverage') {
            url = `${API_BASE}/get-audit?auditId=${job.id}`;
          } else {
            url = `${API_BASE}/get-estimator?auditId=${job.id}&projectName=${encodeURIComponent(job.projectName)}`;
          }

          const res = await fetch(url);
          if (!res.ok) return;
          const data = await res.json();
          const newStatus: JobStatus = data.status ?? 'QUEUED';

          const idx = updated.findIndex((j) => j.id === job.id);
          if (idx === -1) return;

          if (newStatus !== updated[idx].status) {
            updated[idx] = {
              ...updated[idx],
              status: newStatus,
              score: data.score ?? updated[idx].score,
              title: data.title ?? data.projectName ?? updated[idx].title,
              completedAt:
                newStatus === 'COMPLETED'
                  ? new Date().toISOString()
                  : updated[idx].completedAt,
              // Mark unseen only when freshly completed
              seen:
                newStatus === 'COMPLETED' || newStatus === 'FAILED' || newStatus === 'ERROR'
                  ? false
                  : updated[idx].seen,
            };
          }
        } catch {
          // Network error — silently skip this cycle
        }
      })
    );

    saveJobs(updated);
    setJobs([...updated]);
  }, []);

  // Start polling on mount, clear on unmount
  useEffect(() => {
    pollJobs(); // immediate first check
    const interval = setInterval(pollJobs, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [pollJobs]);

  // Mark all as seen when dropdown opens
  const handleOpen = () => {
    setDropdownOpen((prev) => {
      const opening = !prev;
      if (opening) {
        const updated = loadJobs().map((j) => ({ ...j, seen: true }));
        saveJobs(updated);
        setJobs(updated);
      }
      return opening;
    });
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <ClickOutside onClick={() => setDropdownOpen(false)} className="relative">
      <li>
        {/* Bell button */}
        <Link
          onClick={handleOpen}
          to="#"
          className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
        >
          {/* Unread badge */}
          {unseenCount > 0 && (
            <span className="absolute -top-0.5 right-0 z-1 h-2 w-2 rounded-full bg-meta-1">
              <span className="absolute -z-1 inline-flex h-full w-full animate-ping rounded-full bg-meta-1 opacity-75" />
            </span>
          )}

          {/* Bell icon */}
          <svg
            className="fill-current duration-300 ease-in-out"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M16.1999 14.9343L15.6374 14.0624C15.5249 13.8937 15.4687 13.7249 15.4687 13.528V7.67803C15.4687 6.01865 14.7655 4.47178 13.4718 3.31865C12.4312 2.39053 11.0812 1.7999 9.64678 1.6874V1.1249C9.64678 0.787402 9.36553 0.478027 8.9999 0.478027C8.6624 0.478027 8.35303 0.759277 8.35303 1.1249V1.65928C8.29678 1.65928 8.24053 1.65928 8.18428 1.6874C4.92178 2.05303 2.4749 4.66865 2.4749 7.79053V13.528C2.44678 13.8093 2.39053 13.9499 2.33428 14.0343L1.7999 14.9343C1.63115 15.2155 1.63115 15.553 1.7999 15.8343C1.96865 16.0874 2.2499 16.2562 2.55928 16.2562H8.38115V16.8749C8.38115 17.2124 8.6624 17.5218 9.02803 17.5218C9.36553 17.5218 9.6749 17.2405 9.6749 16.8749V16.2562H15.4687C15.778 16.2562 16.0593 16.0874 16.228 15.8343C16.3968 15.553 16.3968 15.2155 16.1999 14.9343ZM3.23428 14.9905L3.43115 14.653C3.5999 14.3718 3.68428 14.0343 3.74053 13.6405V7.79053C3.74053 5.31553 5.70928 3.23428 8.3249 2.95303C9.92803 2.78428 11.503 3.2624 12.6562 4.2749C13.6687 5.1749 14.2312 6.38428 14.2312 7.67803V13.528C14.2312 13.9499 14.3437 14.3437 14.5968 14.7374L14.7655 14.9905H3.23428Z"
              fill=""
            />
          </svg>
        </Link>

        {/* Dropdown panel */}
        {dropdownOpen && (
          <div className="absolute -right-27 mt-2.5 flex h-90 w-75 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:right-0 sm:w-80">
            {/* Header */}
            <div className="flex items-center justify-between px-4.5 py-3">
              <h5 className="text-sm font-medium text-bodydark2">
                Notifications
              </h5>
              {jobs.length > 0 && (
                <span className="text-xs text-bodydark">
                  {jobs.filter((j) => j.status === 'COMPLETED').length} completed
                </span>
              )}
            </div>

            {/* Notification list */}
            <ul className="flex h-auto flex-col overflow-y-auto">
              {jobs.length === 0 ? (
                <li className="flex flex-col items-center justify-center gap-2 px-4.5 py-8 text-center">
                  <span className="text-2xl">🔔</span>
                  <p className="text-sm text-bodydark">
                    No activity yet. Submit a Coverage Report or Success Estimator to get started.
                  </p>
                </li>
              ) : (
                jobs.map((job) => (
                  <li key={job.id}>
                    <Link
                      className={`flex flex-col gap-1.5 border-t border-stroke px-4.5 py-3 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4 ${
                        !job.seen && (job.status === 'COMPLETED' || job.status === 'FAILED')
                          ? 'bg-gray-2 dark:bg-meta-4'
                          : ''
                      }`}
                      to={job.status === 'COMPLETED' ? detailLink(job) : '#'}
                    >
                      {/* Type + Status row */}
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-black dark:text-white uppercase tracking-wider">
                          <span>{typeIcon(job.type)}</span>
                          {typeLabel(job.type)}
                        </span>
                        <span className={`text-xs font-bold uppercase tracking-widest ${statusColor(job.status)}`}>
                          {job.status === 'QUEUED' || job.status === 'PROCESSING' ? (
                            <span className="flex items-center gap-1">
                              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-warning" />
                              {job.status}
                            </span>
                          ) : job.status === 'COMPLETED' ? (
                            <span className="flex items-center gap-1">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-meta-3" />
                              COMPLETE
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <span className="inline-block h-1.5 w-1.5 rounded-full bg-meta-1" />
                              {job.status}
                            </span>
                          )}
                        </span>
                      </div>

                      {/* Project name + score */}
                      <p className="text-sm text-black dark:text-white font-medium truncate">
                        {job.title || job.projectName}
                        {job.status === 'COMPLETED' && job.score !== undefined && (
                          <span className="ml-2 text-xs font-bold text-meta-3">
                            Score: {job.score}
                          </span>
                        )}
                      </p>

                      {/* Description line */}
                      <p className="text-xs text-bodydark leading-relaxed">
                        {job.status === 'QUEUED' || job.status === 'PROCESSING'
                          ? `${typeLabel(job.type)} is being processed by the AI engine.`
                          : job.status === 'COMPLETED'
                          ? `Analysis complete. Click to view the full executive report.`
                          : `Analysis encountered an error. Please resubmit.`}
                      </p>

                      {/* Timestamp */}
                      <p className="text-xs text-bodydark2">
                        {job.status === 'COMPLETED' && job.completedAt
                          ? formatDate(job.completedAt)
                          : formatDate(job.timestamp)}
                      </p>
                    </Link>
                  </li>
                ))
              )}
            </ul>

            {/* Footer — clear history */}
            {jobs.length > 0 && (
              <div className="border-t border-stroke px-4.5 py-2.5 dark:border-strokedark">
                <button
                  onClick={() => {
                    saveJobs([]);
                    setJobs([]);
                  }}
                  className="text-xs text-bodydark hover:text-meta-1 transition-colors"
                >
                  Clear history
                </button>
              </div>
            )}
          </div>
        )}
      </li>
    </ClickOutside>
  );
};

export default DropdownNotification;