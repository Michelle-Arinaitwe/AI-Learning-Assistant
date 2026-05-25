import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Spinner from '../../components/common/Spinner';
import * as dashboardService from '../../services/dashboardService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { FileText, BookOpen, Bot, Brain, Clock } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await dashboardService.getOverview();
        setOverview(res.data || res);
      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error('Dashboard error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const summary = overview?.summary ?? {
    totalDocuments: 0,
    totalFlashcardSets: 0,
    totalFlashcards: 0,
    totalQuizzes: 0,
  };

  const recentActivity = overview?.recentActivity ?? {
    documents: [],
    quizzes: [],
  };

  const stats = [
    {
      label: 'Documents',
      value: summary.totalDocuments,
      icon: FileText,
      bg: 'bg-sky-50',
      iconColor: 'text-sky-500',
      ring: 'ring-sky-100',
    },
    {
      label: 'Flashcard Sets',
      value: summary.totalFlashcardSets,
      icon: BookOpen,
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-500',
      ring: 'ring-emerald-100',
    },
    {
      label: 'Quizzes Taken',
      value: summary.totalQuizzes,
      icon: Brain,
      bg: 'bg-violet-50',
      iconColor: 'text-violet-500',
      ring: 'ring-violet-100',
    },
    
  ];

  const activityItems = [
    ...(recentActivity.documents || []).map((doc) => ({
      id: doc._id,
      title: doc.title,
      description: doc.title,
      timestamp: doc.uploadDate,
      link: `/documents/${doc._id}`,
      type: 'document',
    })),
    ...(recentActivity.quizzes || []).map((quiz) => ({
      id: quiz._id,
      title: quiz.title,
      description: quiz.title,
      timestamp: quiz.completedAt || quiz.createdAt,
      link: `/quizzes/${quiz._id}`,
      type: 'quiz',
    })),
  ].sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">

        {/*header*/}
        <div className="mb-6">
          <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">Dashboard</h1>
          <p className="text-sm text-slate-500">
            Track your learning progress and activity.
          </p>
        </div>

        {/*Stats Grid*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-5">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={`${stat.label}-${index}`}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-sky-200 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    <p className="mt-3 text-2xl font-bold text-slate-900">{stat.value}</p>
                  </div>
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg} ${stat.ring} ring-1`}>
                    <Icon className={`h-5 w-5 ${stat.iconColor}`} strokeWidth={2} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Clock className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
              <p className="text-sm text-slate-500">
                Your latest document and quiz activity.
              </p>
            </div>
          </div>

          {activityItems.length > 0 ? (
            <div className="space-y-3">
              {activityItems.map((activity, index) => (
                <div
                  key={activity.id || index}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 hover:border-sky-200 hover:bg-sky-50 hover:shadow-sm transition-all duration-200"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {activity.type === 'document' ? 'Accessed Document: ' : 'Attempted Quiz: '}
                      <span className="font-normal text-slate-600">{activity.description}</span>
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {activity.link && (
                    <Link
                      to={activity.link}
                      className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-sky-600 transition-colors duration-200 shrink-0"
                    >
                      View
                    </Link>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500">
              <p>No recent activity yet.</p>
              <p>Start a session to see your progress grow.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
