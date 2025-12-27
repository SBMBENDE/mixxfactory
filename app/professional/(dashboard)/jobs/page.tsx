"use client";
import { useState } from 'react';

interface Job {
  id: string;
  title: string;
  client: string;
  date: string;
  status: 'pending' | 'active' | 'completed';
}

const mockJobs: Job[] = [
  { id: '1', title: 'Wedding DJ', client: 'Alice Smith', date: '2025-12-10', status: 'completed' },
  { id: '2', title: 'Corporate Event', client: 'Acme Corp', date: '2025-12-20', status: 'active' },
  { id: '3', title: 'Birthday Party', client: 'Bob Lee', date: '2026-01-05', status: 'pending' },
];

export default function ProfessionalJobsPage() {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const handleMarkComplete = (id: string) => {
    setJobs(jobs => jobs.map(job => job.id === id ? { ...job, status: 'completed' } : job));
    if (selectedJob && selectedJob.id === id) {
      setSelectedJob({ ...selectedJob, status: 'completed' });
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Jobs & Projects</h1>
      <p className="text-gray-600 mb-4">View and manage your job requests, ongoing and completed projects.</p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Jobs List */}
        <div className="flex-1">
          <div className="mb-2 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Your Jobs</h2>
            <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm" disabled>
              + Add New (coming soon)
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Client</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => (
                  <tr key={job.id} className="border-b hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium">{job.title}</td>
                    <td className="px-3 py-2">{job.client}</td>
                    <td className="px-3 py-2">{job.date}</td>
                    <td className="px-3 py-2">
                      <span className={
                        job.status === 'completed' ? 'text-green-600 font-semibold' :
                        job.status === 'active' ? 'text-blue-600 font-semibold' :
                        'text-yellow-600 font-semibold'
                      }>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        className="text-blue-600 hover:underline mr-2"
                        onClick={() => setSelectedJob(job)}
                      >
                        View
                      </button>
                      {job.status !== 'completed' && (
                        <button
                          className="text-green-600 hover:underline"
                          onClick={() => handleMarkComplete(job.id)}
                        >
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Job Details */}
        <div className="flex-1 min-w-[260px]">
          {selectedJob ? (
            <div className="bg-white rounded shadow p-4">
              <h3 className="text-lg font-bold mb-2">Job Details</h3>
              <div className="mb-2"><span className="font-semibold">Title:</span> {selectedJob.title}</div>
              <div className="mb-2"><span className="font-semibold">Client:</span> {selectedJob.client}</div>
              <div className="mb-2"><span className="font-semibold">Date:</span> {selectedJob.date}</div>
              <div className="mb-2"><span className="font-semibold">Status:</span> <span className={
                selectedJob.status === 'completed' ? 'text-green-600 font-semibold' :
                selectedJob.status === 'active' ? 'text-blue-600 font-semibold' :
                'text-yellow-600 font-semibold'
              }>{selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}</span></div>
              <button
                className="mt-2 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
                onClick={() => setSelectedJob(null)}
              >
                Close
              </button>
            </div>
          ) : (
            <div className="text-gray-500 italic">Select a job to view details.</div>
          )}
        </div>
      </div>
    </div>
  );
}
