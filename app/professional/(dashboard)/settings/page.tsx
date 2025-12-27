
"use client";
import { useState } from 'react';

const mockAccount = {
  name: 'DJ MixxMaster',
  email: 'djmixx@example.com',
  phone: '+1234567890',
};

export default function ProfessionalSettingsPage() {
  const [account, setAccount] = useState(mockAccount);
  const [editing, setEditing] = useState(false);
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifSMS, setNotifSMS] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSave = () => {
    setEditing(false);
    setMsg('Account info updated! (Mock)');
    setTimeout(() => setMsg(''), 2000);
  };
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) {
      setMsg('Passwords do not match!');
      return;
    }
    setPassword('');
    setPassword2('');
    setMsg('Password changed! (Mock)');
    setTimeout(() => setMsg(''), 2000);
  };

  return (
    <div className="p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-2">Settings & Security</h1>
      <p className="text-gray-600 mb-4">Update your account settings, password, and notification preferences.</p>

      {/* Account Info */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Account Info</h2>
        <form className="space-y-3" onSubmit={e => { e.preventDefault(); handleSave(); }}>
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={account.name}
              onChange={e => setAccount({ ...account, name: e.target.value })}
              disabled={!editing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={account.email}
              onChange={e => setAccount({ ...account, email: e.target.value })}
              disabled={!editing}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input
              className="border rounded px-3 py-2 w-full"
              value={account.phone}
              onChange={e => setAccount({ ...account, phone: e.target.value })}
              disabled={!editing}
            />
          </div>
          <div className="flex gap-2 mt-2">
            {!editing ? (
              <button type="button" className="px-4 py-2 bg-blue-600 text-white rounded" onClick={() => setEditing(true)}>
                Edit
              </button>
            ) : (
              <>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Save</button>
                <button type="button" className="px-4 py-2 bg-gray-300 text-gray-800 rounded" onClick={() => { setEditing(false); setAccount(mockAccount); }}>Cancel</button>
              </>
            )}
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Change Password</h2>
        <form className="space-y-3" onSubmit={handlePasswordChange}>
          <div>
            <label className="block text-sm font-medium mb-1">New Password</label>
            <input
              type="password"
              className="border rounded px-3 py-2 w-full"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              className="border rounded px-3 py-2 w-full"
              value={password2}
              onChange={e => setPassword2(e.target.value)}
            />
          </div>
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Change Password</button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">Notification Preferences</h2>
        <div className="flex items-center gap-4 mb-2">
          <input type="checkbox" id="notifEmail" checked={notifEmail} onChange={e => setNotifEmail(e.target.checked)} />
          <label htmlFor="notifEmail" className="text-sm">Email Notifications</label>
        </div>
        <div className="flex items-center gap-4">
          <input type="checkbox" id="notifSMS" checked={notifSMS} onChange={e => setNotifSMS(e.target.checked)} />
          <label htmlFor="notifSMS" className="text-sm">SMS Notifications</label>
        </div>
      </div>

      {msg && <div className="mt-4 p-3 bg-green-100 text-green-800 rounded">{msg}</div>}
    </div>
  );
}
