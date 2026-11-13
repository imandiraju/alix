import React from 'react';
import { Link } from 'react-router-dom';
import AlixLogo from '../common/AlixLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-alix-slate-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Brand Column */}
        <div className="md:col-span-2 space-y-4">
          <AlixLogo size="md" withTagline={true} />
          <p className="text-sm text-alix-slate-500 max-w-sm leading-relaxed">
            A premium, modern, interactive classroom learning platform designed to
            transform traditional lectures into engaging, collaborative and measurable
            learning experiences.
          </p>
          <div className="text-xs text-alix-slate-400">
            &copy; {new Date().getFullYear()} ALIX (Active Learning & Interactive Experience). All rights reserved.
          </div>
        </div>

        {/* Modules Column */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-alix-indigo mb-3">
            Product Modules
          </h4>
          <ul className="space-y-2 text-sm text-alix-slate-600">
            <li>
              <Link to="/play/demo" className="hover:text-alix-violet-600 transition-colors">
                ALIX Play
              </Link>
            </li>
            <li>
              <Link to="/poll" className="hover:text-alix-violet-600 transition-colors">
                ALIX Poll
              </Link>
            </li>
            <li>
              <Link to="/think" className="hover:text-alix-violet-600 transition-colors">
                ALIX Think
              </Link>
            </li>
            <li>
              <Link to="/teams" className="hover:text-alix-violet-600 transition-colors">
                ALIX Teams
              </Link>
            </li>
            <li>
              <Link to="/insights" className="hover:text-alix-violet-600 transition-colors">
                ALIX Insights
              </Link>
            </li>
            <li>
              <Link to="/create" className="hover:text-alix-violet-600 transition-colors">
                ALIX Create
              </Link>
            </li>
          </ul>
        </div>

        {/* Classroom Experience */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-alix-indigo mb-3">
            Interactive Modes
          </h4>
          <ul className="space-y-2 text-sm text-alix-slate-600">
            <li>
              <Link to="/join" className="hover:text-alix-violet-600 transition-colors">
                Join ALIX (Student PIN)
              </Link>
            </li>
            <li>
              <Link to="/host/session-demo" className="hover:text-alix-violet-600 transition-colors">
                ALIX Live Projector
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-alix-violet-600 transition-colors">
                Teacher Dashboard
              </Link>
            </li>
            <li>
              <Link to="/create" className="hover:text-alix-violet-600 transition-colors">
                My ALIX Activities
              </Link>
            </li>
          </ul>
        </div>

        {/* Values / Principles */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-alix-indigo mb-3">
            Philosophy
          </h4>
          <p className="text-xs text-alix-slate-500 leading-relaxed mb-3">
            Where Every Learner Participates. Built for high-engagement universities,
            STEM laboratories, and collaborative seminar rooms globally.
          </p>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-alix-slate-100 text-[11px] font-medium text-alix-indigo">
            <span className="w-1.5 h-1.5 rounded-full bg-alix-cyan-500" />
            Global EdTech Architecture
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
