import React from 'react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  Download,
  Calendar,
  Sparkles,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const misconceptions = [
    {
      question: 'Q3: Minimum Raft nodes for 2 crash failures',
      misconception: '34% of students answered "3 nodes" instead of 5 (2f + 1 formula missed)',
      recommendation: 'Review quorum formula during the next lecture opening summary.',
      severity: 'high',
    },
    {
      question: 'Q6: Byzantine Generals vs Crash Faults',
      misconception: '21% confused crash-stop models with arbitrary message manipulation',
      recommendation: 'Add comparison slide between Paxos and PBFT.',
      severity: 'medium',
    },
  ];

  const studentPerformance = [
    { name: 'Zoe Chen', participation: '100%', accuracy: '92%', score: 9480 },
    { name: 'Marcus Taylor', participation: '100%', accuracy: '85%', score: 8120 },
    { name: 'Priya Sharma', participation: '100%', accuracy: '83%', score: 7890 },
    { name: 'David Kim', participation: '90%', accuracy: '78%', score: 7210 },
    { name: 'Alex Rivera', participation: '100%', accuracy: '75%', score: 7150 },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-alix-slate-50">
      <Navbar />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar className="hidden lg:flex" />

        <main className="flex-1 p-6 sm:p-8 max-w-5xl">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-alix-violet-700 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Pedagogical Analytics</span>
              </div>
              <h1 className="text-3xl font-heading font-extrabold text-alix-indigo">
                ALIX Insights
              </h1>
              <p className="text-alix-slate-600 text-sm mt-1">
                Real-time active learning analytics, question diagnostic metrics, and misconception detection.
              </p>
            </div>

            <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-alix-slate-300 hover:border-alix-indigo text-alix-indigo text-sm font-bold shadow-sm transition-all">
              <Download className="w-4 h-4 text-alix-violet-600" />
              <span>Export CSV Report</span>
            </button>
          </div>

          {/* Top Analytics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
            <div className="p-6 rounded-2xl bg-white border border-alix-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-alix-slate-400">
                Participation Rate
              </span>
              <div className="text-3xl font-heading font-extrabold text-alix-indigo mt-2">
                98.4%
              </div>
              <p className="text-xs text-emerald-600 mt-1 font-semibold">
                71 of 72 students answered all questions
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-alix-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-alix-slate-400">
                Average Cohort Score
              </span>
              <div className="text-3xl font-heading font-extrabold text-alix-indigo mt-2">
                79.2%
              </div>
              <p className="text-xs text-alix-cyan-600 mt-1 font-semibold">
                Target mastery threshold (&gt;75%) achieved
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-alix-slate-200 shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-alix-slate-400">
                Identified Misconceptions
              </span>
              <div className="text-3xl font-heading font-extrabold text-alix-coral-500 mt-2">
                2 Critical
              </div>
              <p className="text-xs text-alix-slate-500 mt-1">
                Flags generated for targeted peer instruction
              </p>
            </div>
          </div>

          {/* Misconception Diagnostic Section */}
          <section className="bg-white rounded-2xl border border-alix-slate-200 shadow-sm p-6 mb-8">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-alix-slate-100">
              <AlertTriangle className="w-5 h-5 text-alix-coral-500" />
              <h2 className="text-lg font-heading font-bold text-alix-indigo">
                Misconception Detection Alerts
              </h2>
            </div>

            <div className="space-y-4">
              {misconceptions.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-orange-50/60 border border-orange-200/80 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-orange-950">
                      {item.question}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-200 text-orange-800">
                      {item.severity} severity
                    </span>
                  </div>
                  <p className="text-xs text-orange-900 font-medium">
                    {item.misconception}
                  </p>
                  <div className="text-xs text-alix-indigo font-semibold bg-white p-2.5 rounded-lg border border-orange-200/50">
                    💡 <strong>Pedagogy Advice:</strong> {item.recommendation}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Student Performance Table */}
          <section className="bg-white rounded-2xl border border-alix-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-alix-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-heading font-bold text-alix-indigo">
                Cohort Performance Breakdown
              </h2>
              <span className="text-xs text-alix-slate-400 font-medium">
                Showing top active participants
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-alix-slate-50 text-alix-slate-500 text-xs uppercase font-semibold border-b border-alix-slate-100">
                  <tr>
                    <th className="py-3 px-6">Learner Name</th>
                    <th className="py-3 px-6">Participation</th>
                    <th className="py-3 px-6">Accuracy</th>
                    <th className="py-3 px-6 text-right">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-alix-slate-100">
                  {studentPerformance.map((s, idx) => (
                    <tr key={idx} className="hover:bg-alix-slate-50/80">
                      <td className="py-4 px-6 font-bold text-alix-indigo">
                        {s.name}
                      </td>
                      <td className="py-4 px-6 text-alix-slate-600">
                        {s.participation}
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {s.accuracy}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-mono font-bold text-alix-indigo">
                        {s.score.toLocaleString()} pts
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default InsightsPage;
