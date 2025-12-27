
"use client";
const mockStats = {
  avgRating: 4.8,
  totalReviews: 23,
  responseRate: 98,
  completionRate: 100,
  badges: ['Top Rated', 'Fast Responder'],
};

const mockReviews = [
  { id: 'r1', client: 'Alice Smith', rating: 5, date: '2025-12-12', comment: 'Amazing DJ! Made our wedding unforgettable.' },
  { id: 'r2', client: 'Bob Lee', rating: 4, date: '2026-01-06', comment: 'Great music selection and very professional.' },
  { id: 'r3', client: 'Acme Corp', rating: 5, date: '2025-12-21', comment: 'Corporate event was a hit. Highly recommend.' },
];

export default function ProfessionalReviewsPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-2">Reviews & Performance</h1>
      <p className="text-gray-600 mb-4">View your client ratings, reviews, and performance stats.</p>

      {/* Ratings & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-gray-500 text-sm mb-1">Average Rating</div>
          <div className="text-2xl font-bold text-yellow-500 flex items-center justify-center gap-2">
            {mockStats.avgRating} <span className="text-lg">★</span>
          </div>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-gray-500 text-sm mb-1">Total Reviews</div>
          <div className="text-2xl font-bold text-blue-600">{mockStats.totalReviews}</div>
        </div>
        <div className="bg-white rounded shadow p-4 text-center">
          <div className="text-gray-500 text-sm mb-1">Badges</div>
          <div className="flex flex-wrap gap-2 justify-center mt-1">
            {mockStats.badges.map(badge => (
              <span key={badge} className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">{badge}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 max-w-2xl">
        <div className="bg-white rounded shadow p-4">
          <div className="text-gray-500 text-sm mb-1">Response Rate</div>
          <div className="text-xl font-bold text-blue-700">{mockStats.responseRate}%</div>
        </div>
        <div className="bg-white rounded shadow p-4">
          <div className="text-gray-500 text-sm mb-1">Completion Rate</div>
          <div className="text-xl font-bold text-green-700">{mockStats.completionRate}%</div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white rounded shadow p-4 max-w-2xl">
        <h2 className="text-lg font-semibold mb-2">Recent Reviews</h2>
        <ul>
          {mockReviews.map(r => (
            <li key={r.id} className="mb-4 border-b pb-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold">{r.client}</span>
                <span className="text-yellow-500 font-bold">{'★'.repeat(r.rating)}</span>
                <span className="text-xs text-gray-400">{r.date}</span>
              </div>
              <div className="text-gray-700">{r.comment}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
