import React from "react";

export default function ProfessionalProfileForm() {
  // TODO: Replace with real form state and handlers
  return (
    <form className="space-y-6 max-w-2xl mx-auto bg-white dark:bg-gray-900 p-6 rounded shadow border border-gray-100 dark:border-gray-800">
      <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input type="text" className="w-full input input-bordered" placeholder="Your name" defaultValue="Jane Doe" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" className="w-full input input-bordered" placeholder="you@email.com" defaultValue="jane@mixxfactory.com" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <textarea className="w-full input input-bordered min-h-[80px]" placeholder="Tell clients about yourself..." defaultValue="Experienced DJ and event professional." />
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Skills / Services</label>
          <input type="text" className="w-full input input-bordered" placeholder="e.g. DJ, MC, Sound Engineer" defaultValue="DJ, MC" />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Certifications</label>
          <input type="text" className="w-full input input-bordered" placeholder="e.g. Event Safety, Sound Tech" defaultValue="Event Safety" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Profile Photo</label>
        <input type="file" className="w-full" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Availability / Working Hours</label>
        <input type="text" className="w-full input input-bordered" placeholder="e.g. Mon-Fri 9am-6pm" defaultValue="Mon-Fri 9am-6pm" />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" className="btn btn-secondary">Preview</button>
        <button type="submit" className="btn btn-primary">Save Changes</button>
      </div>
    </form>
  );
}
