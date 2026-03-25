import React, { useState, useEffect, useRef } from 'react';
import { useUser, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { BlurFade } from '../components/magicui/BlurFade';

const API_BASE = 'http://localhost:3000';

const FORGE_STEPS = [
  { icon: 'psychology',     text: 'Analyzing your learning goal...',       color: '#a78bfa' },
  { icon: 'auto_awesome',   text: 'Designing personalized curriculum...',  color: '#22c55e' },
  { icon: 'travel_explore', text: 'Finding best YouTube tutorials...',     color: '#3b82f6' },
  { icon: 'video_library',  text: 'Curating top-rated video lessons...',   color: '#f59e0b' },
  { icon: 'checklist',      text: 'Building your learning planner...',     color: '#ec4899' },
  { icon: 'rocket_launch',  text: 'Launching your course!',               color: '#22c55e' },
];

const CARD_GRADIENTS = [
  'linear-gradient(135deg,#0c8de4 0%,#22c9d0 100%)',
  'linear-gradient(135deg,#7c3aed 0%,#a78bfa 100%)',
  'linear-gradient(135deg,#059669 0%,#34d399 100%)',
  'linear-gradient(135deg,#db2777 0%,#f472b6 100%)',
  'linear-gradient(135deg,#d97706 0%,#fcd34d 100%)',
  'linear-gradient(135deg,#0284c7 0%,#67e8f9 100%)',
];

/* ──────────── Forge Progress Panel ──────────── */
function ForgeProgressPanel() {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const iv = setInterval(() =>
      setActiveStep(p => (p < FORGE_STEPS.length - 1 ? p + 1 : p)), 2800);
    return () => clearInterval(iv);
  }, []);
  const pct = ((activeStep + 1) / FORGE_STEPS.length) * 100;
  return (
    <div className="panel-card p-6 h-full">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: FORGE_STEPS[activeStep].color, borderTopColor: 'transparent' }} />
        <span className="font-label text-xs font-bold uppercase tracking-widest" style={{ color: FORGE_STEPS[activeStep].color }}>
          AI Forging Path
        </span>
      </div>
      <div className="space-y-3 mb-5">
        {FORGE_STEPS.map((step, i) => (
          <div key={i} className="flex items-center gap-3 transition-all duration-500"
            style={{ opacity: i <= activeStep ? 1 : 0.2 }}>
            <span className="material-symbols-outlined text-base" style={{
              color: i < activeStep ? '#22c55e' : i === activeStep ? step.color : 'var(--theme-text-faint)'
            }}>{i < activeStep ? 'check_circle' : step.icon}</span>
            <span className="font-body text-sm" style={{
              color: i === activeStep ? 'var(--theme-text-heading)' : 'var(--theme-text-muted)',
              fontWeight: i === activeStep ? 600 : 400
            }}>{step.text}</span>
          </div>
        ))}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--theme-border)' }}>
        <div className="h-full rounded-full progress-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/* ──────────── Course Card ──────────── */
function CourseCard({ course, gradient, onOpen }) {
  const pct = course.progress;
  const isCompleted = pct === 100;
  const isActive = pct > 0 && pct < 100;
  const statusLabel = isCompleted ? 'Completed' : isActive ? 'On Progress' : 'New';

  return (
    <div
      onClick={onOpen}
      className="course-card shrink-0 w-[220px] rounded-2xl overflow-hidden cursor-pointer flex flex-col"
      style={{ background: gradient, minHeight: '220px' }}
    >
      <div className="flex-1 p-5">
        <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-white text-xl">
            {isCompleted ? 'emoji_events' : isActive ? 'play_circle' : 'school'}
          </span>
        </div>
        <h3 className="font-headline text-base font-bold italic text-white leading-tight mb-3 line-clamp-3">
          {course.course_title}
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white/90 text-[10px] font-label">
            {course.totalModules} Modules
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white/90 text-[10px] font-label">
            {course.completedSubtopics}/{course.totalSubtopics} done
          </span>
        </div>
      </div>
      <div className="px-5 pb-5">
        <div className="h-1.5 rounded-full bg-white/25 overflow-hidden mb-2">
          <div className="h-full rounded-full bg-white transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-white/75 text-[10px] font-label">{statusLabel}</span>
          <span className="text-white font-label text-xs font-bold">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

/* ──────────── CSS Activity Bar Chart ──────────── */
function ActivityBars({ activityData }) {
  const last7 = activityData.slice(-7);
  const maxVal = Math.max(...last7.map(d => d.subtopicsCompleted), 1);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex items-end justify-between gap-1.5 h-28 px-1">
      {last7.map((day, i) => {
        const pct = (day.subtopicsCompleted / maxVal) * 100;
        const dateObj = new Date(day.date + 'T00:00:00');
        const dayLabel = days[(dateObj.getDay() + 6) % 7];
        const todayStr = new Date().toISOString().slice(0, 10);
        const isToday = day.date === todayStr;

        return (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <span className="font-label text-[9px] font-bold" style={{ color: isToday ? '#22c55e' : 'var(--theme-text-muted)' }}>
              {day.subtopicsCompleted > 0 ? day.subtopicsCompleted : ''}
            </span>
            <div className="relative w-full rounded-lg overflow-hidden" style={{ height: '80px', background: 'var(--theme-border)' }}>
              <motion.div
                className="absolute bottom-0 left-0 right-0 rounded-lg"
                style={{ background: isToday ? '#22c55e' : 'rgba(129,140,248,0.7)' }}
                initial={{ height: 0 }}
                animate={{ height: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: 'easeOut' }}
              />
              {isToday && (
                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white" />
              )}
            </div>
            <span className="font-label text-[9px]" style={{ color: isToday ? '#22c55e' : 'var(--theme-text-faint)', fontWeight: isToday ? 700 : 400 }}>
              {dayLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────── Mini Calendar ──────────── */
function MiniCalendar({ activityData }) {
  const [date, setDate] = useState(new Date());
  const today = new Date();
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthName = date.toLocaleString('default', { month: 'long' });
  const firstDay = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Build lookup: date string → subtopics completed
  const activityByDate = {};
  activityData.forEach(a => { activityByDate[a.date] = a.subtopicsCompleted; });

  const getDateStr = (d) => {
    const m = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${m}-${dd}`;
  };

  const isToday = (d) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <span className="font-label text-sm font-bold" style={{ color: 'var(--theme-text-heading)' }}>
          {monthName} {year}
        </span>
        <div className="flex gap-1.5">
          <button onClick={() => setDate(new Date(year, month - 1, 1))} className="calender-nav-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>chevron_left</span>
          </button>
          <button onClick={() => setDate(new Date(year, month + 1, 1))} className="calender-nav-btn">
            <span className="material-symbols-outlined" style={{ fontSize: 13 }}>chevron_right</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 mb-1.5">
        {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => (
          <div key={d} className="text-center font-label text-[10px]" style={{ color: 'var(--theme-text-faint)' }}>{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1 flex-1">
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const dateStr = getDateStr(d);
          const count = activityByDate[dateStr] || 0;
          const hasActivity = count > 0;
          const todayCell = isToday(d);

          return (
            <div key={i} className="flex items-center justify-center">
              <div className="relative w-7 h-7 rounded-full flex items-center justify-center"
                style={{
                  background: todayCell ? 'var(--color-primary)' : hasActivity ? 'rgba(34,197,94,0.18)' : 'transparent',
                  boxShadow: todayCell ? '0 0 10px rgba(34,197,94,0.5)' : 'none',
                }}>
                <span className="font-label text-[11px]" style={{
                  color: todayCell ? '#fff' : hasActivity ? 'var(--color-primary)' : 'var(--theme-text-body)',
                  fontWeight: todayCell || hasActivity ? 700 : 400,
                }}>{d}</span>
                {hasActivity && !todayCell && (
                  <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: 'var(--color-primary)' }} />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────── Course Progress Rows ──────────── */
function CourseProgressRows({ courses }) {
  if (!courses.length) return (
    <p className="text-center py-8 font-body text-sm" style={{ color: 'var(--theme-text-faint)' }}>No courses yet</p>
  );

  const statusColor = (c) => c.progress === 100 ? '#22c55e' : c.progress > 0 ? '#818cf8' : '#64748b';

  return (
    <div className="space-y-4 overflow-y-auto max-h-52 custom-scroll pr-1">
      {courses.map((course, i) => {
        const color = statusColor(course);
        return (
          <div key={course._id}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="font-label text-xs font-semibold truncate max-w-[70%]" style={{ color: 'var(--theme-text-heading)' }}>
                {course.course_title}
              </p>
              <span className="font-label text-xs font-bold shrink-0 ml-2" style={{ color }}>{course.progress}%</span>
            </div>
            <div className="relative h-2 rounded-full overflow-hidden" style={{ background: 'var(--theme-border)' }}>
              <motion.div className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
              />
            </div>
            <div className="flex gap-2 mt-1">
              {course.progress === 100 ? (
                <span className="text-[10px] font-label" style={{ color: '#22c55e' }}>● Completed</span>
              ) : course.progress > 0 ? (
                <span className="text-[10px] font-label" style={{ color: '#818cf8' }}>● In Progress</span>
              ) : (
                <span className="text-[10px] font-label" style={{ color: '#64748b' }}>● New</span>
              )}
              <span className="text-[10px] font-label" style={{ color: 'var(--theme-text-faint)' }}>
                {course.completedSubtopics}/{course.totalSubtopics} subtopics
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ──────────── MAIN ──────────── */
export default function Dashboard() {
  const { user, isLoaded } = useUser();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ totalCourses: 0, completedSubtopics: 0, totalSubtopics: 0 });
  const [activityData, setActivityData] = useState([]);
  const [activityMeta, setActivityMeta] = useState({ streak: 0, totalThisWeek: 0 });
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');
  const nav = useNavigate();

  useEffect(() => {
    if (!isLoaded || !user) return;
    fetchAll();
  }, [isLoaded, user]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchCourses(), fetchActivity()]);
    setLoading(false);
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/course/user/${user.id}`);
      const data = await res.json();
      if (data.success) { setCourses(data.courses); setStats(data.stats); }
    } catch (err) { console.error('Failed to fetch courses:', err); }
  };

  const fetchActivity = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/activity/${user.id}?days=30`);
      const data = await res.json();
      if (data.success) {
        setActivityData(data.activity);
        setActivityMeta({ streak: data.streak, totalThisWeek: data.totalThisWeek });
      }
    } catch (err) { console.error('Failed to fetch activity:', err); }
  };

  const handleCreateCourse = async () => {
    if (!query.trim() || creating) return;
    try {
      setCreating(true);
      const genRes = await fetch(`${API_BASE}/topic-generator`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() })
      });
      const curriculum = await genRes.json();
      const saveRes = await fetch(`${API_BASE}/api/course/create`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: user.id,
          userName: user.firstName || user.fullName || 'Learner',
          llmCurriculum: {
            course_query: query.trim(), course_title: curriculum.course_title,
            modules: curriculum.modules.map(mod => ({
              module_id: mod.module_id, module_title: mod.module_title,
              subtopics: mod.subtopics.map(sub => ({
                subtopic_id: sub.subtopic_id, subtopic_title: sub.subtopic_title,
                Youtube_query: sub.youtube_search_query
              }))
            }))
          }
        })
      });
      const saveData = await saveRes.json();
      if (saveData.success) { setQuery(''); await fetchCourses(); }
    } catch (err) { console.error('Failed to create course:', err); }
    finally { setCreating(false); }
  };

  if (!isLoaded) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--color-background)' }}>
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }} />
    </div>
  );

  const completedCourses = courses.filter(c => c.progress === 100).length;
  const activeCourses = courses.filter(c => c.progress > 0 && c.progress < 100).length;
  const progressPct = stats.totalSubtopics > 0
    ? Math.round((stats.completedSubtopics / stats.totalSubtopics) * 100) : 0;

  return (
    <>
      <Navbar />
      <SignedIn>
        <div className="fixed inset-0 z-0" style={{ background: 'var(--color-background)' }} />

        <main className="relative z-10 min-h-screen pt-24 pb-20 px-6 max-w-[1400px] mx-auto">

          {/* ══════════════════════════════════════
            HEADER
          ══════════════════════════════════════ */}
          <BlurFade delay={0} duration={0.5}>
            <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
              <div>
                <p className="font-body text-sm mb-1 flex items-center gap-2" style={{ color: 'var(--theme-text-muted)' }}>
                  Welcome back, {user?.firstName || 'Learner'} 👋
                </p>
                <h1 className="font-headline text-4xl md:text-5xl font-bold italic forge-gradient-text leading-tight">
                  Let's Make Learning Fun!
                </h1>
              </div>

              {/* Streak badge */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <span className="text-lg">🔥</span>
                  <div>
                    <p className="font-label text-xs font-bold leading-none" style={{ color: '#22c55e' }}>
                      {activityMeta.streak} day streak
                    </p>
                    <p className="font-label text-[10px] leading-none mt-0.5" style={{ color: 'var(--theme-text-muted)' }}>
                      {activityMeta.totalThisWeek} topics this week
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </BlurFade>

          {/* ══════════════════════════════════════
            HERO SECTION 1: ONGOING COURSES
          ══════════════════════════════════════ */}
          <BlurFade delay={0.06} duration={0.5}>
            <div className="panel-card p-6 mb-5">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(12,141,228,0.12)' }}>
                    <span className="material-symbols-outlined text-xl" style={{ color: '#0c8de4' }}>school</span>
                  </div>
                  <div>
                    <h2 className="font-label text-base font-bold" style={{ color: 'var(--theme-text-heading)' }}>
                      Ongoing Courses
                    </h2>
                    <p className="font-body text-xs" style={{ color: 'var(--theme-text-muted)' }}>
                      {courses.length} total · {activeCourses} active · {completedCourses} completed
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1.5 rounded-full font-label text-xs font-bold"
                  style={{ background: 'rgba(12,141,228,0.1)', color: '#0c8de4', border: '1px solid rgba(12,141,228,0.2)' }}>
                  +{courses.length} Class
                </span>
              </div>

              {/* Cards scroll */}
              {loading ? (
                <div className="flex gap-4">
                  {[0,1,2].map(i => (
                    <div key={i} className="w-[220px] shrink-0 rounded-2xl skeleton" style={{ height: '220px' }} />
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <div className="py-12 text-center">
                  <span className="material-symbols-outlined text-5xl mb-3 block" style={{ color: 'var(--theme-text-faint)' }}>school</span>
                  <p className="font-body text-sm" style={{ color: 'var(--theme-text-muted)' }}>
                    No courses yet — forge your first path below!
                  </p>
                </div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-2 custom-scroll-x">
                  {courses.map((course, i) => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      gradient={CARD_GRADIENTS[i % CARD_GRADIENTS.length]}
                      onOpen={() => nav(`/course/${course._id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </BlurFade>

          {/* ══════════════════════════════════════
            HERO SECTION 2: FORGE A NEW PATH
          ══════════════════════════════════════ */}
          <BlurFade delay={0.1} duration={0.5}>
            <AnimatePresence mode="wait">
              {creating ? (
                <motion.div key="progress"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  className="mb-5">
                  <ForgeProgressPanel />
                </motion.div>
              ) : (
                <motion.div key="forge-input"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="mb-5">
                  <div className="panel-card p-6 relative overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.07) 0%, rgba(139,92,246,0.07) 100%)' }}>
                    {/* Ambient glow */}
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(34,197,94,0.06), transparent 60%)' }} />
                    <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-5">
                      {/* Left copy */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(34,197,94,0.12)' }}>
                            <span className="material-symbols-outlined text-xl" style={{ color: '#22c55e' }}>bolt</span>
                          </div>
                          <h2 className="font-label text-base font-bold" style={{ color: 'var(--theme-text-heading)' }}>
                            Forge a New Path
                          </h2>
                        </div>
                        <p className="font-body text-sm ml-11" style={{ color: 'var(--theme-text-muted)' }}>
                          Type any topic — AI will design a complete adaptive curriculum just for you.
                        </p>
                      </div>

                      {/* Input + button */}
                      <div className="flex gap-3 w-full md:w-auto md:flex-1 md:max-w-xl">
                        <input
                          type="text"
                          className="flex-1 px-5 py-3.5 rounded-2xl font-body text-sm outline-none transition-all border"
                          placeholder="What do you want to master today?  e.g. Machine Learning, React..."
                          value={query}
                          onChange={e => setQuery(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && handleCreateCourse()}
                          style={{
                            background: 'var(--theme-glass-bg)',
                            borderColor: 'var(--theme-border-strong)',
                            color: 'var(--theme-text-heading)',
                          }}
                        />
                        <button
                          onClick={handleCreateCourse}
                          disabled={!query.trim()}
                          className="forge-btn-primary px-7 py-3.5 rounded-2xl font-label text-sm font-black text-on-primary disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform cursor-pointer flex items-center gap-2 shrink-0 whitespace-nowrap"
                        >
                          <span className="material-symbols-outlined text-sm">rocket_launch</span>
                          Forge Path
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </BlurFade>

          {/* ══════════════════════════════════════
            BOTTOM GRID: Stats, Activity, Calendar, Progress
          ══════════════════════════════════════ */}
          <div className="grid grid-cols-12 gap-5">

            {/* ── Stat cards column ── */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-3 flex flex-col gap-4">
              {[
                { icon: 'auto_stories', label: 'Total Courses', value: courses.length, color: '#0c8de4', bg: 'rgba(12,141,228,0.1)' },
                { icon: 'task_alt',     label: 'Topics Done',   value: stats.completedSubtopics, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
                { icon: 'emoji_events', label: 'Completed',     value: completedCourses, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                { icon: 'local_fire_department', label: 'Day Streak', value: activityMeta.streak, color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
              ].map(({ icon, label, value, color, bg }, i) => (
                <BlurFade key={label} delay={0.13 + i * 0.04} duration={0.4}>
                  <div className="panel-card p-4 flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                      <span className="material-symbols-outlined text-xl" style={{ color }}>{icon}</span>
                    </div>
                    <div>
                      <p className="font-headline text-2xl font-bold italic leading-none" style={{ color: 'var(--theme-text-heading)' }}>{value}</p>
                      <p className="font-label text-[10px] uppercase tracking-wide mt-1" style={{ color: 'var(--theme-text-muted)' }}>{label}</p>
                    </div>
                  </div>
                </BlurFade>
              ))}
            </div>

            {/* ── Learning Activity Chart ── */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <BlurFade delay={0.18} duration={0.4}>
                <div className="panel-card p-5 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(129,140,248,0.12)' }}>
                        <span className="material-symbols-outlined text-sm" style={{ color: '#818cf8' }}>bar_chart_4_bars</span>
                      </div>
                      <span className="font-label text-sm font-bold" style={{ color: 'var(--theme-text-heading)' }}>Learning Hours</span>
                    </div>
                    <span className="font-label text-[10px] px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--theme-glass-bg)', border: '1px solid var(--theme-border)', color: 'var(--theme-text-muted)' }}>
                      Weekly
                    </span>
                  </div>

                  {activityData.length > 0 ? (
                    <ActivityBars activityData={activityData} />
                  ) : (
                    <div className="h-28 flex items-center justify-center">
                      <p className="font-body text-xs" style={{ color: 'var(--theme-text-faint)' }}>No activity yet</p>
                    </div>
                  )}

                  <div className="mt-4 pt-4 flex gap-3" style={{ borderTop: '1px solid var(--theme-border)' }}>
                    {courses.slice(0, 2).map((c, i) => {
                      const colors = ['#0c8de4', '#818cf8'];
                      return (
                        <div key={c._id} className="flex items-center gap-2 flex-1">
                          <div className="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center"
                            style={{ background: `${colors[i]}18` }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 12, color: colors[i] }}>school</span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-label text-[10px] font-bold truncate" style={{ color: 'var(--theme-text-heading)' }}>
                              {c.course_title.split(' ').slice(0, 2).join(' ')}
                            </p>
                            <p className="font-label text-[9px]" style={{ color: 'var(--theme-text-muted)' }}>
                              {c.completedSubtopics} done
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </BlurFade>
            </div>

            {/* ── Calendar ── */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <BlurFade delay={0.22} duration={0.4}>
                <div className="panel-card p-5 h-full">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
                      <span className="material-symbols-outlined text-sm" style={{ color: '#3b82f6' }}>calendar_month</span>
                    </div>
                    <span className="font-label text-sm font-bold" style={{ color: 'var(--theme-text-heading)' }}>Calendar</span>
                  </div>
                  <MiniCalendar activityData={activityData} />
                </div>
              </BlurFade>
            </div>

            {/* ── Course Progress ── */}
            <div className="col-span-12 sm:col-span-6 lg:col-span-3">
              <BlurFade delay={0.26} duration={0.4}>
                <div className="panel-card p-5 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(245,158,11,0.1)' }}>
                        <span className="material-symbols-outlined text-sm" style={{ color: '#f59e0b' }}>timeline</span>
                      </div>
                      <span className="font-label text-sm font-bold" style={{ color: 'var(--theme-text-heading)' }}>Course Progress</span>
                    </div>
                    <span className="font-label text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                      {progressPct}% overall
                    </span>
                  </div>
                  {loading ? (
                    <div className="space-y-3">
                      {[0,1,2].map(i => <div key={i} className="h-8 skeleton rounded-xl" />)}
                    </div>
                  ) : (
                    <CourseProgressRows courses={courses} />
                  )}
                </div>
              </BlurFade>
            </div>

          </div>
        </main>
      </SignedIn>
      <SignedOut><RedirectToSignIn redirectUrl="/" /></SignedOut>
    </>
  );
}
