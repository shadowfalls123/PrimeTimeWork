import React from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { cn } from '../../util/cn';

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  showFooter?: boolean;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showSidebar = false,
  showFooter = true,
  className
}) => {
  const location = useLocation();

  // Determine if sidebar should be shown based on route
  const shouldShowSidebar = showSidebar || [
    '/dashboards',
    '/dashboardtutor',
    '/mylearnings',
    '/mypacks',
    '/submittedpapers',
    '/createexam',
    '/createpackage',
    '/profile'
  ].some(path => location.pathname.startsWith(path));

  // Routes where footer should be hidden
  const hideFooterRoutes = [
    '/exam/',
    '/login',
    '/register'
  ];
  
  const shouldShowFooter = showFooter && !hideFooterRoutes.some(route => 
    location.pathname.startsWith(route)
  );

  return (
    <div className={cn('min-h-screen flex flex-col bg-gray-50', className)}>
      {/* Header */}
      <Header />

      {/* Main Content Area */}
      <div className="flex flex-1">
        {/* Sidebar */}
        {shouldShowSidebar && (
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      {shouldShowFooter && <Footer />}
    </div>
  );
};

// Layout variants for specific use cases
const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppLayout showSidebar={true} showFooter={false}>
    <div className="p-6">
      {children}
    </div>
  </AppLayout>
);

const ExamLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppLayout showSidebar={false} showFooter={false}>
    <div className="h-full">
      {children}
    </div>
  </AppLayout>
);

const PublicLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppLayout showSidebar={false} showFooter={true}>
    <div className="min-h-screen">
      {children}
    </div>
  </AppLayout>
);

const AuthLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-sage-50 to-wood-50 flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      {children}
    </div>
  </div>
);

export { 
  AppLayout, 
  DashboardLayout, 
  ExamLayout, 
  PublicLayout, 
  AuthLayout 
};