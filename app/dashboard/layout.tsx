"use client";

import { Inter } from 'next/font/google';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Bell, 
  Users, 
  Settings, 
  LogOut,
  Building,
  User,
  ChevronDown,
  Shield
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useUser } from '@/app/utils/UserContext';
import NotificationsButton from '@/app/components/NotificationsButton';
import ProtectRoute from '@/app/utils/auth/protectRoute';

const inter = Inter({ subsets: ['latin'] });

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile, logout } = useUser();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Announcements', href: '/dashboard/announcements', icon: Bell },
    { name: 'Organizations', href: '/dashboard/organizations', icon: Building, 
      subItems: [
        { name: 'Progress', href: '/dashboard/organizations?tab=progress' }
      ] 
    },
    { name: 'RBAC Demo', href: '/dashboard/rbac-demo', icon: Shield },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <ProtectRoute>
      <div className={`${inter.className} flex h-screen bg-[#e9e2fe]`}>
        {/* Sidebar */}
        <div className="w-[200px] bg-white flex flex-col shadow-sm">
          <div className="p-4 border-b flex items-center justify-center">
            <Image 
              src="/images/main-logo.png" 
              alt="Knowbie Logo" 
              width={100} 
              height={30} 
              priority
            />
          </div>
          <nav className="flex-1 py-6 flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <div key={item.name} className="mb-1">
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md ${
                      isActive 
                        ? 'bg-[#e9e2fe] text-[#3a2a6d] font-medium' 
                        : 'text-gray-500 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                  {item.subItems && isActive && (
                    <div className="ml-11 mt-2 space-y-2">
                      {item.subItems.map((subItem) => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className={`block text-sm py-1.5 ${
                            pathname === subItem.href || 
                            (pathname === item.href && subItem.href.includes('?tab=progress'))
                              ? 'text-[#3a2a6d] font-medium'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* User Profile item - added after Settings tab */}
            <div className="mb-1 relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center gap-3 px-4 py-2.5 mx-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <div className="w-5 h-5 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  {userProfile?.profilePicture ? (
                    <img 
                      src={userProfile.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User className="h-3 w-3 text-gray-500" />
                  )}
                </div>
                <span className="text-sm">{userProfile?.name || 'User'}</span>
                <ChevronDown size={16} className="ml-auto text-gray-500" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute left-0 mt-1 w-[200px] bg-white shadow-lg z-50">
                  <div className="p-4 border-b">
                    <p className="text-lg font-medium">{userProfile?.name || 'User'}</p>
                    <p className="text-sm text-gray-500">{userProfile?.email || 'user@example.com'}</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      href="/dashboard/settings" 
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                    <Link 
                      href="/dashboard/settings?tab=profile" 
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Your Profile
                    </Link>
                    <Link 
                      href="/dashboard/settings?tab=notifications" 
                      className="block px-4 py-3 text-gray-700 hover:bg-gray-100"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Notifications
                    </Link>
                  </div>
                  <div className="border-t">
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-3 text-red-600 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </nav>
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-red-500 hover:bg-gray-100 rounded-md"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-sm">Sign out</span>
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto relative">
          {children}
          <NotificationsButton />
        </div>
      </div>
    </ProtectRoute>
  );
}
