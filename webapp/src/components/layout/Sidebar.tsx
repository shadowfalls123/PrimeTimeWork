import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  BookOpen,
  FileText,
  Package,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  User,
  PlusCircle,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../common/Auth/AuthContext';
import { cn } from '../../util/cn';

interface SidebarProps {
  className?: string;
}

interface MenuItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles?: string[];
  children?: MenuItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user, userRoles } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const menuItems: MenuItem[] = [
    {
      label: 'Home',
      path: '/',
      icon: <Home size={20} />,
    },
    {
      label: 'My Learnings',
      path: '/mylearnings',
      icon: <BookOpen size={20} />,
      roles: ['StudentRole', 'tutor', 'admin'],
    },
    {
      label: 'Profile',
      path: '/profile',
      icon: <User size={20} />,
      roles: ['StudentRole', 'tutor', 'admin'],
    },
    {
      label: 'Tutor Tools',
      path: '/tutor',
      icon: <PlusCircle size={20} />,
      roles: ['tutor', 'admin'],
      children: [
        {
          label: 'Create Exam',
          path: '/createexam',
          icon: <FileText size={16} />,
        },
        {
          label: 'Create Package',
          path: '/createpackage',
          icon: <Package size={16} />,
        },
        {
          label: 'My Papers',
          path: '/submittedpapers',
          icon: <FileText size={16} />,
        },
        {
          label: 'My Packs',
          path: '/mypacks',
          icon: <Package size={16} />,
        },
      ],
    },
    {
      label: 'Dashboards',
      path: '/dashboards',
      icon: <BarChart3 size={20} />,
      roles: ['tutor', 'admin'],
      children: [
        {
          label: 'Student Dashboard',
          path: '/dashboards',
          icon: <BarChart3 size={16} />,
        },
        {
          label: 'Tutor Dashboard',
          path: '/dashboardtutor',
          icon: <BarChart3 size={16} />,
        },
      ],
    },
    {
      label: 'Contact Us',
      path: '/contact',
      icon: <MessageSquare size={20} />,
    },
  ];

  const hasAccess = (item: MenuItem): boolean => {
    if (!item.roles) return true;
    if (!user) return false;
    if (!userRoles || userRoles.length === 0) {
      // Default to StudentRole if user exists but has no roles
      return item.roles.includes('StudentRole');
    }
    return userRoles.some(role => item.roles!.includes(role));
  };

  const isActive = (path: string): boolean => {
    return location.pathname === path;
  };

  const isParentActive = (item: MenuItem): boolean => {
    if (isActive(item.path)) return true;
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return false;
  };

  const toggleExpanded = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label)
        ? prev.filter(item => item !== label)
        : [...prev, label]
    );
  };

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    if (!hasAccess(item)) return null;

    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const active = isParentActive(item);

    if (hasChildren) {
      return (
        <div key={item.label} className="mb-1">
          <button
            onClick={() => toggleExpanded(item.label)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors duration-200',
              active
                ? 'bg-sage-100 text-sage-800'
                : 'text-gray-700 hover:bg-sage-50',
              isChild && 'pl-8'
            )}
          >
            <div className="flex items-center">
              {item.icon}
              {!isCollapsed && <span className="ml-3">{item.label}</span>}
            </div>
            {!isCollapsed && (
              <ChevronRight
                size={16}
                className={cn(
                  'transition-transform duration-200',
                  isExpanded && 'rotate-90'
                )}
              />
            )}
          </button>

          {isExpanded && !isCollapsed && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children?.map(child => renderMenuItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.label}
        to={item.path}
        className={cn(
          'flex items-center px-3 py-2 rounded-lg transition-colors duration-200 mb-1',
          active
            ? 'bg-sage-100 text-sage-800'
            : 'text-gray-700 hover:bg-sage-50',
          isChild && 'pl-8'
        )}
      >
        {item.icon}
        {!isCollapsed && <span className="ml-3">{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        'bg-white border-r border-gray-200 transition-all duration-300 flex flex-col',
        isCollapsed ? 'w-16' : 'w-64',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          )}
          <button
            onClick={toggleCollapsed}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            PrimeTime Learning Platform
          </div>
        </div>
      )}
    </aside>
  );
};

export { Sidebar };