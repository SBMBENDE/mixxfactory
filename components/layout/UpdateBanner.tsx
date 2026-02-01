import React from 'react';

export default function UpdateBanner({ onRefresh }: { onRefresh: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-black p-4 flex justify-between items-center z-50">
      <span>New version available!</span>
      <button
        className="bg-black text-white px-3 py-1 rounded"
        onClick={onRefresh}
      >
        Refresh
      </button>
    </div>
  );
}
