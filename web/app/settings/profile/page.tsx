export default function ProfilePage() {
    return (
      <div className="w-full max-w-2xl">
        <div className="border-b border-gray-200 pb-2 mb-6">
          <h2 className="text-2xl font-normal text-gray-900">Public profile</h2>
        </div>
  
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Name</label>
            <input
              type="text"
              defaultValue="Aman Mishra"
              // FIX: !bg-white ensures background is white
              // FIX: !text-gray-900 ensures text is black (overriding globals)
              // FIX: border-gray-300 makes the box visible
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm !bg-white !text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Bio</label>
            <textarea
              rows={4}
              placeholder="Tell us about yourself"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm !bg-white !text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
  
          <button 
            className="px-4 py-2 bg-[#2da44e] text-white text-sm font-medium rounded-md hover:bg-[#2c974b]"
          >
            Update profile
          </button>
        </form>
      </div>
    );
  }