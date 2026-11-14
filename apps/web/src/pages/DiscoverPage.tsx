import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuth } from '../context/AuthContext';
import { REALTIME_URL } from '../services/socket';
import { AiQuizStudioModal } from '../components/creator/AiQuizStudioModal';
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
  ShieldCheck,
  Users,
  QrCode,
  Search,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Zap,
  Check,
  Award,
  Filter,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────────────────
 * DISCOVER ACTIVITIES DATA (Curated Academic Learning Collections)
 * ─────────────────────────────────────────────────────────────────────────── */

interface DiscoverActivity {
  id: string;
  title: string;
  subject: string;
  courseCode: string;
  category: 'Computer Science' | 'Mathematics' | 'Engineering' | 'Academic Learning';
  level: string;
  description: string;
  questionCount: number;
  timeEstimate: string;
  plays: string;
  rating: number;
  illustrationType: 'graph' | 'tree' | 'calculus' | 'os' | 'discrete' | 'circuits' | 'energizer' | 'pulse';
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
    level: 'Undergraduate Core',
    description: 'Master optimal substructure, memoization vs tabulation, and overlapping subproblems in advanced algorithms.',
    questionCount: 4,
    timeEstimate: '4 mins',
    plays: '2.4k',
    rating: 4.9,
    illustrationType: 'graph',
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
    level: 'Undergraduate Core',
    description: 'Rapid-fire concept checks on tree balancing, graph traversal (BFS/DFS), and worst-case time complexities.',
    questionCount: 3,
    timeEstimate: '3 mins',
    plays: '1.9k',
    rating: 4.8,
    illustrationType: 'tree',
    questions: [
      {
        text: 'What is the worst-case lookup time in an unbalanced Binary Search Tree of N elements?',
        type: 'multiple_choice',
        options: ['O(N)', 'O(log N)', 'O(1)', 'O(N log N)'],
        correctIndex: 0,
        timeLimit: 20,
        points: 1000,
      },
      {
        text: 'Breadth-First Search (BFS) on an unweighted graph always finds the shortest path.',
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
    level: 'Engineering Core',
    description: 'Concept verification on partial derivatives, Green theorem, gradient vectors, and divergence.',
    questionCount: 3,
    timeEstimate: '3 mins',
    plays: '1.6k',
    rating: 4.9,
    illustrationType: 'calculus',
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
    title: 'Operating Systems: Threads, Locks & Deadlocks',
    subject: 'Engineering',
    courseCode: 'CSE 312',
    category: 'Engineering',
    level: 'Undergraduate Advanced',
    description: 'Diagnose race conditions, Coffman deadlock conditions, virtual memory paging, and semaphore semantics.',
    questionCount: 3,
    timeEstimate: '3 mins',
    plays: '1.2k',
    rating: 4.7,
    illustrationType: 'os',
    questions: [
      {
        text: 'Which of the following is NOT one of Coffman four conditions for deadlock?',
        type: 'multiple_choice',
        options: ['Preemption', 'Mutual Exclusion', 'Hold and Wait', 'Circular Wait'],
        correctIndex: 0,
        timeLimit: 25,
        points: 1000,
      },
      {
        text: 'In virtual memory, page fault handling is performed entirely in user mode.',
        type: 'true_false',
        options: ['False', 'True'],
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
    id: 'disc-discrete-05',
    title: 'Discrete Mathematics & Graph Theory',
    subject: 'Mathematics',
    courseCode: 'MATH 205',
    category: 'Mathematics',
    level: 'Foundational',
    description: 'Explore Euler paths, bipartite graph testing, mathematical induction, and pigeonhole principle applications.',
    questionCount: 3,
    timeEstimate: '3 mins',
    plays: '1.4k',
    rating: 4.8,
    illustrationType: 'discrete',
    questions: [
      {
        text: 'A connected graph has an Euler circuit if and only if every vertex has an even degree.',
        type: 'true_false',
        options: ['True', 'False'],
        correctIndex: 0,
        timeLimit: 20,
        points: 1000,
      },
      {
        text: 'Which condition guarantees that a simple graph is bipartite?',
        type: 'multiple_choice',
        options: ['It contains no odd-length cycles', 'All vertices have even degree', 'It is planar', 'It has at least 3 components'],
        correctIndex: 0,
        timeLimit: 25,
        points: 1000,
      },
      {
        text: 'What is the sum of degrees of all vertices in any graph with E edges?',
        type: 'multiple_choice',
        options: ['2E', 'E', 'E^2', 'E / 2'],
        correctIndex: 0,
        timeLimit: 20,
        points: 1000,
      },
    ],
  },
  {
    id: 'disc-circuits-06',
    title: 'Electrical Circuits & Kirchhoff Laws',
    subject: 'Engineering',
    courseCode: 'ECE 201',
    category: 'Engineering',
    level: 'Engineering Core',
    description: 'Solve nodal voltage, mesh current equations, Thevenin equivalent circuits, and capacitor charging curves.',
    questionCount: 3,
    timeEstimate: '3 mins',
    plays: '980',
    rating: 4.7,
    illustrationType: 'circuits',
    questions: [
      {
        text: 'Kirchhoff Current Law (KCL) is a direct consequence of the conservation of electric charge.',
        type: 'true_false',
        options: ['True', 'False'],
        correctIndex: 0,
        timeLimit: 20,
        points: 1000,
      },
      {
        text: 'In steady-state DC analysis, an ideal inductor behaves as a:',
        type: 'multiple_choice',
        options: ['Short circuit (0V drop)', 'Open circuit (infinite impedance)', 'Resistor of value L', 'Voltage source'],
        correctIndex: 0,
        timeLimit: 25,
        points: 1000,
      },
      {
        text: 'Thevenin resistance Rth is computed by deactivating all independent sources (voltages shorted, currents opened).',
        type: 'true_false',
        options: ['True', 'False'],
        correctIndex: 0,
        timeLimit: 20,
        points: 1000,
      },
    ],
  },
  {
    id: 'disc-energizer-07',
    title: 'Morning Energizer: Speed Trivia & STEM Facts',
    subject: 'General STEM',
    courseCode: 'ICE 101',
    category: 'Academic Learning',
    level: 'All Levels',
    description: 'High-speed academic learning energizer to kick off your morning lecture and awaken student minds.',
    questionCount: 3,
    timeEstimate: '2 mins',
    plays: '3.1k',
    rating: 5.0,
    illustrationType: 'energizer',
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
  {
    id: 'disc-pulse-08',
    title: 'Interactive Concept Pulse & Lecture Checkpoint',
    subject: 'Academic Pedagogy',
    courseCode: 'GEN 100',
    category: 'Academic Learning',
    level: 'Mid-Lecture Check',
    description: 'Quick formative check to uncover lecture confusion and gather immediate classroom sentiment.',
    questionCount: 3,
    timeEstimate: '2 mins',
    plays: '2.8k',
    rating: 4.9,
    illustrationType: 'pulse',
    questions: [
      {
        text: 'How confident do you feel applying today core concept on homework or lab problems?',
        type: 'multiple_choice',
        options: ['Completely confident (Mastered)', 'Somewhat confident (Need 1 more example)', 'A bit confused on derivation', 'Lost (Please recap)'],
        correctIndex: 0,
        timeLimit: 25,
        points: 1000,
      },
      {
        text: 'Does peer discussion with your neighboring student clarify complex conceptual traps?',
        type: 'true_false',
        options: ['True', 'False'],
        correctIndex: 0,
        timeLimit: 20,
        points: 1000,
      },
      {
        text: 'Which topic requires the deepest recap at the start of next class?',
        type: 'multiple_choice',
        options: ['Mathematical proofs', 'Real-world code implementation', 'Edge cases & boundary checks', 'Nothing, ready for next topic'],
        correctIndex: 0,
        timeLimit: 25,
        points: 1000,
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
 * SVG ILLUSTRATION COMPONENTS (Rich visual headers for cards)
 * ─────────────────────────────────────────────────────────────────────────── */

const CardIllustration: React.FC<{ type: DiscoverActivity['illustrationType'] }> = ({ type }) => {
  switch (type) {
    case 'graph':
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#2E0854] via-[#46178F] to-[#1E053A] flex items-center justify-center overflow-hidden">
          {/* Subtle grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff18_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <svg className="w-full h-full p-4 opacity-70 group-hover:scale-105 group-hover:opacity-90 transition-all duration-300" viewBox="0 0 240 120" fill="none">
            <line x1="40" y1="60" x2="100" y2="30" stroke="#00E5FF" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="40" y1="60" x2="100" y2="90" stroke="#00E5FF" strokeWidth="2" />
            <line x1="100" y1="30" x2="160" y2="40" stroke="#FFD600" strokeWidth="2" />
            <line x1="100" y1="90" x2="160" y2="80" stroke="#FFD600" strokeWidth="2" />
            <line x1="160" y1="40" x2="210" y2="60" stroke="#00E676" strokeWidth="2.5" />
            <line x1="160" y1="80" x2="210" y2="60" stroke="#00E676" strokeWidth="2.5" />
            {/* Nodes */}
            <circle cx="40" cy="60" r="10" fill="#46178F" stroke="#00E5FF" strokeWidth="3" />
            <circle cx="100" cy="30" r="12" fill="#46178F" stroke="#FFD600" strokeWidth="3" />
            <circle cx="100" cy="90" r="12" fill="#46178F" stroke="#00E5FF" strokeWidth="3" />
            <circle cx="160" cy="40" r="11" fill="#46178F" stroke="#FF80AB" strokeWidth="3" />
            <circle cx="160" cy="80" r="11" fill="#46178F" stroke="#FFD600" strokeWidth="3" />
            <circle cx="210" cy="60" r="14" fill="#00E676" stroke="#FFFFFF" strokeWidth="3" />
            <text x="210" y="64" textAnchor="middle" fill="#063E19" fontSize="10" fontWeight="900" fontFamily="sans-serif">OPT</text>
          </svg>
        </div>
      );

    case 'tree':
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B3B70] via-[#1368CE] to-[#062447] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff18_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <svg className="w-full h-full p-4 opacity-75 group-hover:scale-105 group-hover:opacity-95 transition-all duration-300" viewBox="0 0 240 120" fill="none">
            {/* Binary Search Tree */}
            <line x1="120" y1="25" x2="70" y2="65" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="120" y1="25" x2="170" y2="65" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="70" y1="65" x2="40" y2="100" stroke="#80D8FF" strokeWidth="2" />
            <line x1="70" y1="65" x2="95" y2="100" stroke="#80D8FF" strokeWidth="2" />
            <line x1="170" y1="65" x2="145" y2="100" stroke="#80D8FF" strokeWidth="2" />
            <line x1="170" y1="65" x2="200" y2="100" stroke="#80D8FF" strokeWidth="2" />
            <circle cx="120" cy="25" r="12" fill="#FFD600" stroke="#FFFFFF" strokeWidth="2.5" />
            <circle cx="70" cy="65" r="10" fill="#00E5FF" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="170" cy="65" r="10" fill="#00E5FF" stroke="#FFFFFF" strokeWidth="2" />
            <circle cx="40" cy="100" r="8" fill="#FFFFFF" />
            <circle cx="95" cy="100" r="8" fill="#FFFFFF" />
            <circle cx="145" cy="100" r="8" fill="#FFFFFF" />
            <circle cx="200" cy="100" r="8" fill="#FFFFFF" />
            {/* Big O Symbol */}
            <text x="215" y="32" textAnchor="middle" fill="#FFD600" fontSize="16" fontWeight="900" fontFamily="monospace">O(log N)</text>
          </svg>
        </div>
      );

    case 'calculus':
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#800F21] via-[#E21B3C] to-[#4A0510] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff18_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <svg className="w-full h-full p-4 opacity-80 group-hover:scale-105 group-hover:opacity-95 transition-all duration-300" viewBox="0 0 240 120" fill="none">
            {/* Axis */}
            <line x1="20" y1="100" x2="220" y2="100" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4" />
            <line x1="30" y1="15" x2="30" y2="105" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.4" />
            {/* Sine wave curve */}
            <path d="M 30 70 Q 70 10, 110 60 T 190 60 T 230 40" stroke="#FFEB3B" strokeWidth="3" fill="none" />
            {/* Shaded Integral Area */}
            <path d="M 70 35 Q 90 20, 110 60 T 150 78 L 150 100 L 70 100 Z" fill="#FFFFFF" fillOpacity="0.2" />
            {/* Integral symbol */}
            <text x="50" y="45" fill="#FFFFFF" fontSize="32" fontWeight="300" fontFamily="serif">∫</text>
            <text x="175" y="30" fill="#FFFFFF" fontSize="14" fontWeight="bold" fontFamily="monospace">∇f = 0</text>
          </svg>
        </div>
      );

    case 'os':
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#003B46] via-[#007E8A] to-[#002229] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff18_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <svg className="w-full h-full p-4 opacity-80 group-hover:scale-105 group-hover:opacity-95 transition-all duration-300" viewBox="0 0 240 120" fill="none">
            {/* CPU chip */}
            <rect x="75" y="25" width="90" height="70" rx="8" fill="#002D36" stroke="#00E5FF" strokeWidth="2.5" />
            <rect x="90" y="40" width="25" height="20" rx="3" fill="#00E5FF" fillOpacity="0.2" stroke="#00E5FF" strokeWidth="1.5" />
            <rect x="125" y="40" width="25" height="20" rx="3" fill="#00E5FF" fillOpacity="0.2" stroke="#00E5FF" strokeWidth="1.5" />
            <rect x="90" y="65" width="25" height="20" rx="3" fill="#00E5FF" fillOpacity="0.2" stroke="#00E5FF" strokeWidth="1.5" />
            <rect x="125" y="65" width="25" height="20" rx="3" fill="#00E5FF" fillOpacity="0.2" stroke="#00E5FF" strokeWidth="1.5" />
            {/* Pins */}
            <line x1="50" y1="40" x2="75" y2="40" stroke="#FFD600" strokeWidth="2" />
            <line x1="50" y1="60" x2="75" y2="60" stroke="#FFD600" strokeWidth="2" />
            <line x1="50" y1="80" x2="75" y2="80" stroke="#FFD600" strokeWidth="2" />
            <line x1="165" y1="40" x2="190" y2="40" stroke="#FFD600" strokeWidth="2" />
            <line x1="165" y1="60" x2="190" y2="60" stroke="#FFD600" strokeWidth="2" />
            <line x1="165" y1="80" x2="190" y2="80" stroke="#FFD600" strokeWidth="2" />
            <text x="120" y="18" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="monospace">CORE ARCHITECTURE</text>
          </svg>
        </div>
      );

    case 'discrete':
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#803E00] via-[#E66C1C] to-[#4D2400] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff18_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <svg className="w-full h-full p-4 opacity-80 group-hover:scale-105 group-hover:opacity-95 transition-all duration-300" viewBox="0 0 240 120" fill="none">
            {/* Hexagonal Graph Lattice */}
            <polygon points="120,20 160,45 160,85 120,110 80,85 80,45" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />
            <line x1="120" y1="20" x2="120" y2="110" stroke="#FFD600" strokeWidth="2" strokeDasharray="3 3" />
            <line x1="80" y1="45" x2="160" y2="85" stroke="#FFD600" strokeWidth="2" />
            <line x1="80" y1="85" x2="160" y2="45" stroke="#FFD600" strokeWidth="2" />
            <circle cx="120" cy="20" r="7" fill="#FFEB3B" />
            <circle cx="160" cy="45" r="7" fill="#FFEB3B" />
            <circle cx="160" cy="85" r="7" fill="#FFEB3B" />
            <circle cx="120" cy="110" r="7" fill="#FFEB3B" />
            <circle cx="80" cy="85" r="7" fill="#FFEB3B" />
            <circle cx="80" cy="45" r="7" fill="#FFEB3B" />
            <text x="200" y="35" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold" fontFamily="monospace">2^N</text>
          </svg>
        </div>
      );

    case 'circuits':
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1E293B] via-[#334155] to-[#0F172A] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff18_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <svg className="w-full h-full p-4 opacity-80 group-hover:scale-105 group-hover:opacity-95 transition-all duration-300" viewBox="0 0 240 120" fill="none">
            {/* Circuit Schematic */}
            <rect x="40" y="25" width="160" height="70" fill="none" stroke="#38BDF8" strokeWidth="2.5" />
            {/* Resistor zig-zag */}
            <path d="M 85 25 L 90 15 L 100 35 L 110 15 L 120 35 L 125 25" stroke="#FDE047" strokeWidth="3" fill="none" />
            {/* Capacitor parallel lines */}
            <line x1="120" y1="85" x2="120" y2="105" stroke="#FFFFFF" strokeWidth="3" />
            <line x1="128" y1="85" x2="128" y2="105" stroke="#FFFFFF" strokeWidth="3" />
            <circle cx="40" cy="60" r="14" fill="#0F172A" stroke="#4ADE80" strokeWidth="2.5" />
            <text x="40" y="65" textAnchor="middle" fill="#4ADE80" fontSize="14" fontWeight="bold">V</text>
            <text x="180" y="20" fill="#38BDF8" fontSize="11" fontWeight="bold" fontFamily="monospace">∑ I_in = 0</text>
          </svg>
        </div>
      );

    case 'energizer':
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#144705] via-[#26890C] to-[#0B2E02] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff18_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <svg className="w-full h-full p-4 opacity-85 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300" viewBox="0 0 240 120" fill="none">
            {/* Lightning bolt */}
            <path d="M 125 15 L 95 65 L 120 65 L 105 105 L 150 50 L 125 50 Z" fill="#FFEB3B" stroke="#FFFFFF" strokeWidth="2" />
            {/* Energy rays */}
            <circle cx="60" cy="35" r="4" fill="#FFFFFF" />
            <circle cx="180" cy="35" r="4" fill="#FFFFFF" />
            <circle cx="50" cy="85" r="5" fill="#FFE082" />
            <circle cx="190" cy="85" r="5" fill="#FFE082" />
            <text x="120" y="115" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="900" letterSpacing="2">SPEED TRIVIA</text>
          </svg>
        </div>
      );

    case 'pulse':
    default:
      return (
        <div className="absolute inset-0 bg-gradient-to-br from-[#3B0764] via-[#6F2DBD] to-[#1E053A] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff18_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />
          <svg className="w-full h-full p-4 opacity-80 group-hover:scale-105 group-hover:opacity-95 transition-all duration-300" viewBox="0 0 240 120" fill="none">
            {/* Sound / sentiment frequency bars */}
            <rect x="50" y="60" width="10" height="30" rx="3" fill="#F43F5E" />
            <rect x="70" y="40" width="10" height="50" rx="3" fill="#FB923C" />
            <rect x="90" y="25" width="10" height="65" rx="3" fill="#FACC15" />
            <rect x="110" y="15" width="10" height="75" rx="3" fill="#4ADE80" />
            <rect x="130" y="30" width="10" height="60" rx="3" fill="#38BDF8" />
            <rect x="150" y="45" width="10" height="45" rx="3" fill="#818CF8" />
            <rect x="170" y="60" width="10" height="30" rx="3" fill="#C084FC" />
            <line x1="30" y1="95" x2="210" y2="95" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.4" />
            <text x="120" y="112" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">CLASS CONFIDENCE PULSE</text>
          </svg>
        </div>
      );
  }
};

/* ─────────────────────────────────────────────────────────────────────────────
 * MAIN COMPONENT: DISCOVER PAGE
 * ─────────────────────────────────────────────────────────────────────────── */

export const DiscoverPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [previewActivity, setPreviewActivity] = useState<DiscoverActivity | null>(null);
  const [isLaunchingId, setIsLaunchingId] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Hero Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);

  const CAROUSEL_SLIDES = [
    {
      id: 'slide-stem',
      badge: '⭐ FEATURED ACADEMIC CURRICULUM',
      title: 'University STEM Concept Inventory',
      desc: 'Calibrated conceptual checks designed to uncover cognitive traps in Algorithms, Linear Algebra, and System Engineering.',
      actionLabel: 'Launch Algorithms Live',
      secondaryLabel: 'Browse All 8 Modules',
      gradient: 'from-[#46178F] via-[#350F6E] to-[#1E053A]',
      accent: '#00E5FF',
      actTarget: DISCOVER_ACTIVITIES[0],
    },
    {
      id: 'slide-ai',
      badge: '🤖 ENTERPRISE AI QUIZ STUDIO',
      title: 'Instant Question Synthesis with Grok-2 & Gemini',
      desc: 'Transform raw lecture notes, slide PDFs, or course syllabi into interactive multiple-choice assessments in under 15 seconds.',
      actionLabel: 'Open AI Studio',
      secondaryLabel: 'Explore Examples',
      gradient: 'from-[#0B3B70] via-[#1368CE] to-[#041D3B]',
      accent: '#FFD600',
      isAiAction: true,
    },
    {
      id: 'slide-proxy',
      badge: '🛡️ INTEGRITY & PARTICIPATION',
      title: 'Zero-Proxy Institutional Roster Protection',
      desc: 'Lock live rooms strictly to verified student roll numbers. Prevent outside guest joins and phantom attendance with one-click whitelisting.',
      actionLabel: 'Manage Class Rosters',
      secondaryLabel: 'Learn More',
      gradient: 'from-[#144705] via-[#26890C] to-[#092403]',
      accent: '#69F0AE',
      navigateTarget: '/dashboard',
    },
  ];

  const currentSlide = CAROUSEL_SLIDES[carouselIndex];

  const filterTabs = [
    { label: 'All Collections', value: 'All', icon: Sparkles },
    { label: 'Computer Science', value: 'Computer Science', icon: Cpu },
    { label: 'Mathematics', value: 'Mathematics', icon: Calculator },
    { label: 'Engineering', value: 'Engineering', icon: Layers },
    { label: 'Academic Learning', value: 'Academic Learning', icon: GraduationCap },
  ];

  // Filtering
  const filteredActivities = DISCOVER_ACTIVITIES.filter((act) => {
    const matchesCat = activeCategory === 'All' || act.category === activeCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      act.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Launch live session
  const handleLaunchLive = async (act: DiscoverActivity) => {
    setIsLaunchingId(act.id);
    try {
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
        {/* Left Sidebar Navigation */}
        <Sidebar
          className="hidden lg:flex shrink-0"
          onStartLive={() => handleLaunchLive(DISCOVER_ACTIVITIES[0])}
        />

        {/* Main Content Feed */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-6xl space-y-6">
          {/* Top Hero Carousel (Kahoot-Style Featured Spotlight) */}
          <div className="relative rounded-3xl overflow-hidden shadow-md text-white transition-all">
            <div className={`p-6 sm:p-10 bg-gradient-to-r ${currentSlide.gradient} flex flex-col md:flex-row items-start md:items-center justify-between gap-6 min-h-[220px] sm:min-h-[240px]`}>
              <div className="space-y-3 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider border border-white/20">
                  <span>{currentSlide.badge}</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-heading font-black tracking-tight leading-tight">
                  {currentSlide.title}
                </h1>
                <p className="text-xs sm:text-sm text-white/85 leading-relaxed font-normal max-w-xl">
                  {currentSlide.desc}
                </p>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (currentSlide.isAiAction) {
                        setIsAiModalOpen(true);
                      } else if (currentSlide.actTarget) {
                        handleLaunchLive(currentSlide.actTarget);
                      } else if (currentSlide.navigateTarget) {
                        navigate(currentSlide.navigateTarget);
                      }
                    }}
                    className="py-2.5 px-5 rounded-xl bg-white hover:bg-slate-100 text-[#46178F] font-heading font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer border-b-2 border-slate-300 active:translate-y-0.5"
                  >
                    <Play className="w-4 h-4 fill-current text-[#46178F]" />
                    <span>{currentSlide.actionLabel}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (currentSlide.actTarget) {
                        setPreviewActivity(currentSlide.actTarget);
                      } else {
                        setActiveCategory('All');
                      }
                    }}
                    className="py-2.5 px-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white font-heading font-semibold text-xs sm:text-sm backdrop-blur-md transition-all cursor-pointer"
                  >
                    <span>{currentSlide.secondaryLabel}</span>
                  </button>
                </div>
              </div>

              {/* Slide Navigation Controls */}
              <div className="flex md:flex-col items-center gap-2 self-end md:self-center shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCarouselIndex((prev) => (prev === 0 ? CAROUSEL_SLIDES.length - 1 : prev - 1))
                    }
                    className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/20 active:scale-95"
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCarouselIndex((prev) => (prev === CAROUSEL_SLIDES.length - 1 ? 0 : prev + 1))
                    }
                    className="w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/20 active:scale-95"
                    aria-label="Next slide"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                {/* Dots */}
                <div className="flex items-center gap-1.5 pt-1">
                  {CAROUSEL_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCarouselIndex(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        carouselIndex === idx ? 'w-6 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Educator Toolbar (Exact Kahoot 4-Card Purple Toolbar) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base sm:text-lg font-heading font-bold text-[#252525] tracking-tight">
                Educator toolbar
              </h2>
              <span className="text-xs font-semibold text-[#46178F] hover:underline cursor-pointer" onClick={() => navigate('/dashboard')}>
                View faculty workspace →
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Card 1: AI Question Synthesis */}
              <div
                onClick={() => setIsAiModalOpen(true)}
                className="p-4 rounded-2xl bg-[#46178F] hover:bg-[#3E147F] text-white shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between border border-white/10 min-h-[140px] group"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md">
                    <Sparkles className="w-5 h-5 text-[#FFD600]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm leading-tight text-white group-hover:text-amber-200 transition-colors">
                      AI Question Synthesis
                    </h3>
                    <p className="text-[11px] text-white/80 line-clamp-2 mt-1 font-normal leading-relaxed">
                      Auto-generate curriculum-aligned slides using Grok-2 & Gemini 2.0.
                    </p>
                  </div>
                </div>
                <div className="pt-2 text-[11px] font-bold text-white/90 group-hover:text-white flex items-center gap-1">
                  <span>Open Studio</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 2: Anti-Proxy Protection */}
              <div
                onClick={() => navigate('/dashboard')}
                className="p-4 rounded-2xl bg-[#46178F] hover:bg-[#3E147F] text-white shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between border border-white/10 min-h-[140px] group"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md">
                    <ShieldCheck className="w-5 h-5 text-[#69F0AE]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm leading-tight text-white group-hover:text-emerald-200 transition-colors">
                      Anti-Proxy Whitelist
                    </h3>
                    <p className="text-[11px] text-white/80 line-clamp-2 mt-1 font-normal leading-relaxed">
                      Lock live rooms strictly to verified institutional student roll numbers.
                    </p>
                  </div>
                </div>
                <div className="pt-2 text-[11px] font-bold text-white/90 group-hover:text-white flex items-center gap-1">
                  <span>Upload Roster</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 3: Harvard Peer Instruction */}
              <div
                onClick={() => {
                  setActiveCategory('Academic Learning');
                }}
                className="p-4 rounded-2xl bg-[#46178F] hover:bg-[#3E147F] text-white shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between border border-white/10 min-h-[140px] group"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md">
                    <Users className="w-5 h-5 text-[#80D8FF]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm leading-tight text-white group-hover:text-sky-200 transition-colors">
                      Peer Instruction Round
                    </h3>
                    <p className="text-[11px] text-white/80 line-clamp-2 mt-1 font-normal leading-relaxed">
                      Eric Mazur Harvard methodology for consensus debate on tricky traps.
                    </p>
                  </div>
                </div>
                <div className="pt-2 text-[11px] font-bold text-white/90 group-hover:text-white flex items-center gap-1">
                  <span>View Pedagogies</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>

              {/* Card 4: Live Projector Mode */}
              <div
                onClick={() => handleLaunchLive(DISCOVER_ACTIVITIES[0])}
                className="p-4 rounded-2xl bg-[#46178F] hover:bg-[#3E147F] text-white shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between border border-white/10 min-h-[140px] group"
              >
                <div className="space-y-2">
                  <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md">
                    <QrCode className="w-5 h-5 text-[#FF80AB]" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm leading-tight text-white group-hover:text-pink-200 transition-colors">
                      Live Projector Stage
                    </h3>
                    <p className="text-[11px] text-white/80 line-clamp-2 mt-1 font-normal leading-relaxed">
                      Dual-screen presenter mode with auto-joining QR code for lecture halls.
                    </p>
                  </div>
                </div>
                <div className="pt-2 text-[11px] font-bold text-white/90 group-hover:text-white flex items-center gap-1">
                  <span>Launch Live</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar & Subject Filter Strips */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Category Pills Strip */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
                {filterTabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeCategory === tab.value;
                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => setActiveCategory(tab.value)}
                      className={`px-4 py-2 rounded-full text-xs font-heading font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#46178F] text-white shadow-sm'
                          : 'bg-white hover:bg-[#FAFAFA] text-[#252525] border border-[#E5E5E5] hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-[#626262]'}`} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* In-Feed Quick Search Input */}
              <div className="relative min-w-[220px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#626262]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by concept, code..."
                  className="w-full pl-9 pr-8 py-2 rounded-full bg-white border border-[#E5E5E5] text-xs font-medium text-[#252525] placeholder:text-[#888888] focus:outline-none focus:border-[#46178F] shadow-xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Featured Classroom Activities Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-heading font-bold text-[#252525] tracking-tight">
                  Featured Classroom Activities
                </h2>
                <p className="text-xs text-[#626262] font-normal mt-0.5">
                  Curated academic assessment decks ready to host on your lecture projector screen.
                </p>
              </div>
              <span className="text-xs font-semibold text-[#626262] bg-white px-3 py-1 rounded-full border border-[#E5E5E5]">
                {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
              </span>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-[#E5E5E5] space-y-3">
                <Compass className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-heading font-bold text-base text-[#252525]">
                  No activities found
                </h3>
                <p className="text-xs text-[#626262]">
                  Try clearing your search query or selecting a different subject filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setActiveCategory('All');
                  }}
                  className="btn-tactile-primary text-xs px-4 py-2"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredActivities.map((act) => (
                  <div
                    key={act.id}
                    className="bg-white rounded-2xl border border-[#E5E5E5] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:-translate-y-1"
                  >
                    {/* Top 16:9 Thumbnail Area with SVG Graphic & Glass Badges */}
                    <div
                      onClick={() => setPreviewActivity(act)}
                      className="relative w-full h-44 overflow-hidden"
                    >
                      <CardIllustration type={act.illustrationType} />

                      {/* Top Glass Badge Bar */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                        <span className="px-2.5 py-1 rounded-full bg-black/45 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider border border-white/20">
                          {act.category}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-white/95 text-[#252525] text-[11px] font-mono font-black shadow-xs">
                          {act.courseCode}
                        </span>
                      </div>

                      {/* Bottom Glass Badge Bar */}
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/55 backdrop-blur-md text-white text-[11px] font-bold">
                          <Clock className="w-3.5 h-3.5 text-amber-300" />
                          <span>{act.questionCount} Qs • {act.timeEstimate}</span>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600/90 text-white text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-[#626262]">
                          <span>{act.subject}</span>
                          <span className="text-amber-500 font-bold flex items-center gap-1">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                            {act.rating} ({act.plays})
                          </span>
                        </div>

                        <h3
                          onClick={() => setPreviewActivity(act)}
                          className="font-heading font-black text-base text-[#252525] group-hover:text-[#46178F] transition-colors leading-snug line-clamp-2"
                        >
                          {act.title}
                        </h3>

                        <p className="text-xs text-[#626262] font-normal leading-relaxed line-clamp-2">
                          {act.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between text-[11px] text-[#626262]">
                        <span className="font-medium">
                          Target: <strong className="text-[#252525]">{act.level}</strong>
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          RKGlobal EdTech
                        </span>
                      </div>
                    </div>

                    {/* Bottom Action Button Bar (Tactile 3D Buttons) */}
                    <div className="p-4 pt-0 grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaunchLive(act);
                        }}
                        disabled={isLaunchingId === act.id}
                        className="w-full py-2.5 px-3 rounded-xl bg-[#1368CE] hover:bg-[#0E58B3] border-b-4 border-[#093D7E] active:border-b-0 active:translate-y-1 text-white font-heading font-black text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isLaunchingId === act.id ? 'Starting...' : 'Host Live'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewActivity(act);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-[#E5E5E5] border-b-2 border-b-[#D0D0D0] active:border-b-0 active:translate-y-0.5 text-[#252525] font-heading font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#626262]" />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Question Preview Modal (Clean Light Kahoot Theme) */}
      {previewActivity && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setPreviewActivity(null);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none"
        >
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-scale-in max-h-[90vh] overflow-y-auto border-2 border-slate-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#46178F]/10 text-[#46178F] font-heading font-black text-[11px] uppercase tracking-wider">
                    {previewActivity.category}
                  </span>
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {previewActivity.courseCode}
                  </span>
                </div>
                <h3 className="font-heading font-black text-lg sm:text-xl text-[#252525] mt-1.5 leading-snug">
                  {previewActivity.title}
                </h3>
                <p className="text-xs text-[#626262] mt-1">
                  {previewActivity.description}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewActivity(null)}
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer border border-slate-200"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Questions List */}
            <div className="space-y-3.5">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                <span>Included Questions ({previewActivity.questions.length})</span>
                <span>{previewActivity.timeEstimate} total</span>
              </div>

              {previewActivity.questions.map((q, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-[#F8F9FA] border border-[#E5E5E5] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#252525]">
                      Question {idx + 1}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      {q.timeLimit}s • {q.points} pts
                    </span>
                  </div>
                  <p className="font-heading font-bold text-sm text-[#252525] leading-snug">
                    {q.text}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correctIndex;
                      return (
                        <div
                          key={oIdx}
                          className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border ${
                            isCorrect
                              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                              : 'bg-white text-slate-700 border-[#E5E5E5]'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black ${
                            isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {oIdx + 1}
                          </span>
                          <span className="truncate">{opt}</span>
                          {isCorrect && <Check className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Bottom Action Footer */}
            <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setPreviewActivity(null)}
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 font-heading font-bold text-xs cursor-pointer"
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
                className="py-2.5 px-5 rounded-xl bg-[#1368CE] hover:bg-[#0E58B3] border-b-4 border-[#093D7E] active:border-b-0 active:translate-y-1 text-white font-heading font-black text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Host This Activity Live</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Quiz Studio Modal */}
      {isAiModalOpen && (
        <AiQuizStudioModal
          isOpen={isAiModalOpen}
          onClose={() => setIsAiModalOpen(false)}
          onImport={(quiz) => {
            setIsAiModalOpen(false);
            navigate('/create', { state: { importedQuiz: quiz } });
          }}
        />
      )}
    </div>
  );
};

export default DiscoverPage;
