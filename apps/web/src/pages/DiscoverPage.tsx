import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { REALTIME_URL } from '../services/socket';
import {
  Compass,
  Play,
  Eye,
  Sparkles,
  BookOpen,
  GraduationCap,
  Cpu,
  Layers,
  Calculator,
  Flame,
  CheckCircle2,
  X,
  ArrowRight,
} from 'lucide-react';

interface DiscoverActivity {
  id: string;
  title: string;
  subject: string;
  courseCode: string;
  category: string;
  description: string;
  questionCount: number;
  timeEstimate: string;
  gradient: string;
  accentColor: string;
  questions: Array<{
    text: string;
    type?: 'multiple_choice' | 'true_false';
    options: string[];
    correctIndex: number;
    timeLimit: number;
    points: number;
  }>;
}

const DISCOVER_ACTIVITIES: DiscoverActivity[] = [
  {
    id: 'disc-dp-01',
    title: 'Dynamic Programming & Algorithmic Substructure',
    subject: 'Computer Science',
    courseCode: 'CSE 301',
    category: 'Computer Science',
    description: 'Master optimal substructure, memoization vs tabulation, and overlapping subproblems in advanced algorithms.',
    questionCount: 4,
    timeEstimate: '4 mins',
    gradient: 'from-[#0F0524] to-[#331166]',
    accentColor: '#864CBF',
    questions: [
      {
        text: 'Which algorithmic technique guarantees the optimal substructure in DP?',
        type: 'multiple_choice',
        options: ['Memoization', 'Greedy Choice', 'Randomization', 'Backtracking'],
        correctIndex: 0,
        timeLimit: 30,
        points: 1000,
      },
      {
        text: 'Dynamic programming is applicable only when subproblems are dependent and overlap.',
        type: 'true_false',
        options: ['True', 'False'],
        correctIndex: 0,
        timeLimit: 20,
        points: 1000,
      },
      {
        text: 'What is the time complexity of the standard bottom-up 0/1 Knapsack DP solution?',
        type: 'multiple_choice',
        options: ['O(N * W)', 'O(2^N)', 'O(N log N)', 'O(W^2)'],
        correctIndex: 0,
        timeLimit: 30,
        points: 1000,
      },
      {
        text: 'In Tabulation (bottom-up DP), recursion call stack overhead is completely avoided.',
        type: 'true_false',
        options: ['True', 'False'],
        correctIndex: 0,
        timeLimit: 20,
        points: 1000,
      },
    ],
  },
  {
    id: 'disc-algo-02',
    title: 'Data Structures: Big-O, Trees & Graphs',
    subject: 'Algorithms',
    courseCode: 'CSE 204',
    category: 'Computer Science',
    description: 'Rapid-fire concept checks on tree balancing, graph traversal (BFS/DFS), and worst-case time complexities.',
    questionCount: 3,
    timeEstimate: '3 mins',
    gradient: 'from-[#1368CE] to-[#0A3870]',
    accentColor: '#1368CE',
    questions: [
      {
        text: 'What is the worst-case search complexity in an unbalanced Binary Search Tree (BST)?',
        type: 'multiple_choice',
        options: ['O(N)', 'O(log N)', 'O(N log N)', 'O(1)'],
        correctIndex: 0,
        timeLimit: 25,
        points: 1000,
      },
      {
        text: 'Breadth-First Search (BFS) is guaranteed to find the shortest path in unweighted graphs.',
        type: 'true_false',
        options: ['True', 'False'],
        correctIndex: 0,
        timeLimit: 20,
        points: 1000,
      },
      {
        text: 'Which data structure underlies standard Dijkstra algorithm for optimal performance?',
        type: 'multiple_choice',
        options: ['Min-Heap (Priority Queue)', 'Circular Queue', 'Hash Table', 'Stack'],
        correctIndex: 0,
        timeLimit: 25,
        points: 1000,
      },
    ],
  },
  {
    id: 'disc-math-03',
    title: 'Higher Education: Calculus & Vector Calculus',
    subject: 'Mathematics',
    courseCode: 'MATH 202',
    category: 'Mathematics',
    description: 'Concept verification on partial derivatives, Green theorem, gradient vectors, and divergence.',
    questionCount: 3,
    timeEstimate: '3 mins',
    gradient: 'from-[#E21B3C] to-[#800F21]',
    accentColor: '#E21B3C',
    questions: [
      {
        text: 'The gradient vector ∇f always points in the direction of maximum rate of increase.',
        type: 'true_false',
        options: ['True', 'False'],
        correctIndex: 0,
        timeLimit: 20,
        points: 1000,
      },
      {
        text: 'What is the divergence of the curl of any twice continuously differentiable vector field?',
        type: 'multiple_choice',
        options: ['Always 0', '1', 'Depends on coordinates', 'Equal to magnitude'],
        correctIndex: 0,
        timeLimit: 25,
        points: 1000,
      },
      {
        text: 'Green Theorem transforms a line integral around a simple closed curve into a double integral.',
        type: 'true_false',
        options: ['True', 'False'],
        correctIndex: 0,
        timeLimit: 20,
        points: 1000,
      },
    ],
  },
  {
    id: 'disc-os-04',
    title: 'Operating Systems & Concurrency',
    subject: 'Engineering',
    courseCode: 'CSE 310',
    category: 'Engineering',
    description: 'Locks, race conditions, deadlocks, and virtual memory page replacement algorithms.',
    questionCount: 3,
    timeEstimate: '3 mins',
    gradient: 'from-[#D89E00] to-[#735400]',
    accentColor: '#D89E00',
    questions: [
      {
        text: 'Which of the following is NOT a necessary condition for a system deadlock?',
        type: 'multiple_choice',
        options: ['Preemption allowed', 'Mutual exclusion', 'Hold and wait', 'Circular wait'],
        correctIndex: 0,
        timeLimit: 30,
        points: 1000,
      },
      {
        text: 'Belady Anomaly can cause FIFO page replacement to incur MORE page faults when given more frames.',
        type: 'true_false',
        options: ['True', 'False'],
        correctIndex: 0,
        timeLimit: 20,
        points: 1000,
      },
      {
        text: 'Semaphores initialized to 1 can be used to achieve mutual exclusion between threads.',
        type: 'true_false',
        options: ['True', 'False'],
        correctIndex: 0,
        timeLimit: 20,
        points: 1000,
      },
    ],
  },
  {
    id: 'disc-energizer-05',
    title: 'Morning Energizer: Speed Trivia & STEM Facts',
    subject: 'General STEM',
    courseCode: 'ICE 101',
    category: 'Active Learning',
    description: 'High-speed active learning energizer to kick off your morning lecture and awaken student minds.',
    questionCount: 3,
    timeEstimate: '2 mins',
    gradient: 'from-[#26890C] to-[#124505]',
    accentColor: '#26890C',
    questions: [
      {
        text: 'Light travels faster in vacuum than through optical glass fibers.',
        type: 'true_false',
        options: ['True', 'False'],
        correctIndex: 0,
        timeLimit: 15,
        points: 1000,
      },
      {
        text: 'Which element has the highest electrical conductivity of all metals at room temperature?',
        type: 'multiple_choice',
        options: ['Silver', 'Copper', 'Gold', 'Aluminum'],
        correctIndex: 0,
        timeLimit: 20,
        points: 1000,
      },
      {
        text: 'Binary search requires an already sorted array to function in O(log N) time.',
        type: 'true_false',
        options: ['True', 'False'],
        correctIndex: 0,
        timeLimit: 15,
        points: 1000,
      },
    ],
  },
];

const DISCOVER_PAGES = [
  { name: 'Higher Education', desc: 'University curricula & engineering', gradient: 'from-[#864CBF] to-[#51277A]' },
  { name: 'Computer Science', desc: 'Algorithms, systems & AI/ML', gradient: 'from-[#E21B3C] to-[#990F24]' },
  { name: 'Mathematics', desc: 'Calculus, discrete & linear algebra', gradient: 'from-[#D89E00] to-[#805E00]' },
  { name: 'Social & Energizers', desc: 'Icebreakers & morning trivia', gradient: 'from-[#26890C] to-[#144705]' },
  { name: 'Engineering', desc: 'Circuits, thermodynamics & robotics', gradient: 'from-[#1368CE] to-[#0B3E7D]' },
  { name: 'Interactive Polls', desc: 'Real-time sentiment & pulse checks', gradient: 'from-[#0F0524] to-[#2B1055]' },
];

export const DiscoverPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('All');
  const [previewActivity, setPreviewActivity] = useState<DiscoverActivity | null>(null);
  const [isLaunchingId, setIsLaunchingId] = useState<string | null>(null);

  const filterTabs = [
    'All',
    'Computer Science',
    'Mathematics',
    'Engineering',
    'Active Learning',
  ];

  const filteredActivities = DISCOVER_ACTIVITIES.filter((a) => {
    if (activeCategory === 'All') return true;
    return a.category.toLowerCase() === activeCategory.toLowerCase();
  });

  const handleLaunchLive = async (act: DiscoverActivity) => {
    setIsLaunchingId(act.id);
    try {
      // Create quiz in database so host room loads it seamlessly
      const res = await fetch(`${REALTIME_URL}/api/quizzes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: user?.id,
          title: act.title,
          subject: act.subject,
          courseCode: act.courseCode,
          description: act.description,
          questions: act.questions,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.quiz?._id) {
          navigate(`/host/${data.quiz._id}`);
          return;
        }
      }
      // Fallback
      navigate(`/host/${act.id}`);
    } catch (err) {
      console.error('Launch error:', err);
      navigate(`/host/${act.id}`);
    } finally {
      setIsLaunchingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F3F3]">
      <Navbar />

      <div className="flex-1 flex max-w-[1440px] w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar className="hidden lg:flex shrink-0" onStartLive={() => handleLaunchLive(DISCOVER_ACTIVITIES[0])} />

        {/* Main Discover Feed */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-6xl space-y-8">
          {/* In-page Filter Category Pills Strip */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveCategory(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
                  activeCategory === tab
                    ? 'bg-[#46178F] text-white font-semibold shadow-xs'
                    : 'bg-white hover:bg-[#F3F3F3] text-[#252525] border border-[#E5E5E5] font-normal'
                }`}
              >
                {tab === 'All' ? 'Top picks for all' : tab}
              </button>
            ))}
          </div>

          {/* Explore Discover Pages (Kahoot exact 6-card banner) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-heading font-semibold text-[#252525] tracking-tight">
                Explore Discover pages
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {DISCOVER_PAGES.map((dp) => (
                <div
                  key={dp.name}
                  onClick={() => {
                    if (dp.name.includes('Computer')) setActiveCategory('Computer Science');
                    else if (dp.name.includes('Math')) setActiveCategory('Mathematics');
                    else if (dp.name.includes('Engineering')) setActiveCategory('Engineering');
                    else if (dp.name.includes('Social') || dp.name.includes('Energizer')) setActiveCategory('Active Learning');
                    else setActiveCategory('All');
                  }}
                  className={`p-3.5 rounded-2xl bg-gradient-to-br ${dp.gradient} text-white shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between min-h-[90px]`}
                >
                  <h3 className="font-heading font-semibold text-xs leading-snug">
                    {dp.name}
                  </h3>
                  <p className="text-[10px] text-white/80 line-clamp-1 mt-1 font-normal">
                    {dp.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Content Activities Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-semibold text-[#252525] tracking-tight">
                  Featured Classroom Activities
                </h2>
                <p className="text-xs text-[#626262] font-normal mt-0.5">
                  Ready to host immediately on your lecture projector screen.
                </p>
              </div>
              <span className="text-xs font-normal text-[#626262]">
                {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredActivities.map((act) => (
                <div
                  key={act.id}
                  className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  {/* Top Graphic Card Banner */}
                  <div className={`p-5 bg-gradient-to-br ${act.gradient} text-white relative min-h-[120px] flex flex-col justify-between overflow-hidden`}>
                    <div className="flex items-center justify-between relative z-10">
                      <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-semibold tracking-wider uppercase border border-white/20">
                        {act.subject}
                      </span>
                      <span className="text-[11px] font-mono font-medium text-white/90">
                        {act.courseCode}
                      </span>
                    </div>

                    <div className="relative z-10 pt-2">
                      <h3 className="font-heading font-semibold text-base text-white leading-tight group-hover:text-cyan-200 transition-colors">
                        {act.title}
                      </h3>
                    </div>

                    {/* Subtle decorative glow */}
                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <p className="text-xs text-[#626262] font-normal leading-relaxed mb-4">
                      {act.description}
                    </p>

                    <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between text-xs text-[#626262] mb-4">
                      <span className="font-semibold text-[#252525]">
                        {act.questionCount} Questions
                      </span>
                      <span className="font-mono text-[#626262]">
                        ~{act.timeEstimate}
                      </span>
                    </div>

                    {/* Action Buttons: Host Live + Preview */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleLaunchLive(act)}
                        disabled={isLaunchingId === act.id}
                        className="w-full py-2 px-3 rounded-lg bg-[#1368CE] hover:bg-[#0F52A4] text-white font-semibold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isLaunchingId === act.id ? 'Starting...' : 'Host Live'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPreviewActivity(act)}
                        className="w-full py-2 px-3 rounded-lg bg-white hover:bg-[#F3F3F3] border border-[#E5E5E5] text-[#252525] font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#626262]" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Question Preview Modal */}
      {previewActivity && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewActivity(null);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-alix-violet-700 bg-alix-violet-50 px-2 py-0.5 rounded-full">
                  {previewActivity.subject} • {previewActivity.courseCode}
                </span>
                <h3 className="font-heading font-black text-lg text-slate-900 mt-1">
                  {previewActivity.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewActivity(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Included Questions ({previewActivity.questions.length})
              </h4>
              {previewActivity.questions.map((q, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-700">
                      Q{idx + 1}: {q.text}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {q.timeLimit}s
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correctIndex;
                      return (
                        <div
                          key={oIdx}
                          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold truncate flex items-center gap-1.5 ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isCorrect && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                          <span className="truncate">{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPreviewActivity(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={() => {
                  const act = previewActivity;
                  setPreviewActivity(null);
                  handleLaunchLive(act);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#26890C] hover:bg-[#20740A] text-white font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Host This Activity Live</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;
