import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Menu, Home, Search, ShoppingCart, User, LogOut } from 'lucide-react';
import { useAuth } from '../common/Auth/AuthContext';
import { Button } from '../ui/Button';
import { Badge, NotificationBadge } from '../ui/Badge';
import { cn } from '../../util/cn';
import { signOut } from 'aws-amplify/auth';

interface HeaderProps {
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ className }) => {
  const { user, userRoles } = useAuth();
  const { items } = useSelector((state: any) => state.cart);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  const handleSearchClick = () => {
    navigate('/searchpack');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const getMenuItems = () => {
    if (!user) {
      return [
        { label: 'Home', path: '/' },
        { label: 'Login', path: '/login' },
      ];
    }

    const baseItems = [
      { label: 'Home', path: '/' },
      { label: 'My Account', path: '/profile' },
      { label: 'My Learnings', path: '/mylearnings' },
      { label: 'Contact Us', path: '/contact' },
    ];

    if (userRoles?.includes('tutor') || userRoles?.includes('admin')) {
      return [
        ...baseItems,
        { label: 'Dashboards', path: '/dashboards' },
        { divider: true },
        { label: 'Create Exam', path: '/createexam' },
        { label: 'Create Package', path: '/createpackage' },
        { label: 'My Papers', path: '/submittedpapers' },
        { label: 'My Packs', path: '/mypacks' },
        { label: 'Tutor Dashboard', path: '/dashboardtutor' },
      ];
    }

    return baseItems;
  };

  return (
    <header className={cn('bg-sage-500 shadow-lg', className)}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <Link
              to="/"
              className="flex items-center space-x-2 text-white hover:text-sage-100 transition-colors duration-200"
            >
              <Home size={28} />
              <span className="text-xl font-bold hidden sm:block">PrimeTime</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSearchClick}
              className="text-white hover:bg-sage-600"
            >
              <Search size={20} />
              <span className="ml-2">Search</span>
            </Button>

            <Link to="/cart" className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-sage-600 relative"
              >
                <ShoppingCart size={20} />
                {items.length > 0 && (
                  <NotificationBadge
                    count={items.length}
                    className="absolute -top-2 -right-2"
                  />
                )}
              </Button>
            </Link>

            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleUserMenu}
                  className="text-white hover:bg-sage-600"
                >
                  <User size={20} />
                  <span className="ml-2">{user.username || 'Account'}</span>
                </Button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                    {getMenuItems().map((item, index) =>
                      item.divider ? (
                        <hr key={`divider-${index}`} className="my-2 border-gray-200" />
                      ) : (
                        <Link
                          key={item.label}
                          to={item.path}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-sage-50 transition-colors duration-200"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      )
                    )}
                    <hr className="my-2 border-gray-200" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  Login
                </Button>
              </Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link to="/cart" className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-sage-600 p-2"
              >
                <ShoppingCart size={20} />
                {items.length > 0 && (
                  <NotificationBadge
                    count={items.length}
                    className="absolute -top-1 -right-1"
                  />
                )}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="text-white hover:bg-sage-600 p-2"
            >
              <Menu size={24} />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-sage-600 rounded-lg mt-2 py-2">
            <div className="px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSearchClick}
                className="w-full justify-start text-white hover:bg-sage-700"
              >
                <Search size={20} className="mr-3" />
                Search
              </Button>
            </div>

            {getMenuItems().map((item, index) =>
              item.divider ? (
                <hr key={`divider-${index}`} className="my-2 border-sage-500" />
              ) : (
                <Link
                  key={item.label}
                  to={item.path}
                  className="block px-4 py-2 text-white hover:bg-sage-700 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}

            {user && (
              <>
                <hr className="my-2 border-sage-500" />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-white hover:bg-sage-700 transition-colors duration-200 flex items-center"
                >
                  <LogOut size={16} className="mr-3" />
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {(isMenuOpen || isUserMenuOpen) && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-40"
          onClick={() => {
            setIsMenuOpen(false);
            setIsUserMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};

export { Header };