import Link from 'next/link';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // FORCE Light Mode on this specific wrapper
    <div className="min-h-screen !bg-white !text-gray-900 font-sans">
      <div className="max-w-[1012px] mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 border-b border-gray-200 pb-4">
           <img 
            src="https://github.com/AmanM006.png" 
            alt="Profile" 
            className="w-8 h-8 rounded-full border border-gray-200"
          />
          <h1 className="text-xl">
            <span className="font-semibold">AmanM006</span> / Settings
          </h1>
        </div>

        {/* Layout Container - Removed 'flex-col' to FORCE side-by-side */}
        <div className="flex flex-row gap-8 items-start">
          
          {/* Sidebar */}
          <aside className="w-64 shrink-0">
            <nav className="flex flex-col space-y-1 text-sm">
              <SidebarLink href="/settings/profile">Public profile</SidebarLink>
              <SidebarLink href="/settings/account">Account</SidebarLink>
              <SidebarLink href="/settings/appearance">Appearance</SidebarLink>
              <SidebarLink href="/settings/notifications">Notifications</SidebarLink>
              
              <div className="mt-8 border-t border-gray-200 pt-4">
                 <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase mb-2">Access</h3>
                 <SidebarLink href="/settings/billing">Billing and plans</SidebarLink>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href}
      className="block px-3 py-2 rounded-md hover:bg-gray-100 !text-gray-700 hover:!text-gray-900 transition-colors"
    >
      {children}
    </Link>
  );
}