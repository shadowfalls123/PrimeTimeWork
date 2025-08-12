import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  CardHeader, 
  CardContent, 
  CardFooter, 
  Input, 
  Modal, 
  Badge, 
  NotificationBadge, 
  StatusBadge 
} from '../ui';
import { Search, Plus, Settings, Bell, User } from 'lucide-react';

const UIShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value.length < 3) {
      setInputError('Must be at least 3 characters');
    } else {
      setInputError('');
    }
  };

  return (
    <div className="container-padding content-max-width section-padding">
      <div className="space-y-12">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            PrimeTime UI Components
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A showcase of our new design system components with sage green and wood accent colors.
          </p>
        </div>

        {/* Buttons Section */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Buttons</h2>
            <p className="text-gray-600">Various button styles and states</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Primary</h3>
                <Button variant="primary" size="sm">Small</Button>
                <Button variant="primary" size="md">Medium</Button>
                <Button variant="primary" size="lg">Large</Button>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Secondary</h3>
                <Button variant="secondary" size="sm">Small</Button>
                <Button variant="secondary" size="md">Medium</Button>
                <Button variant="secondary" size="lg">Large</Button>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Outline</h3>
                <Button variant="outline" size="sm">Small</Button>
                <Button variant="outline" size="md">Medium</Button>
                <Button variant="outline" size="lg">Large</Button>
              </div>
              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Ghost</h3>
                <Button variant="ghost" size="sm">Small</Button>
                <Button variant="ghost" size="md">Medium</Button>
                <Button variant="ghost" size="lg">Large</Button>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-4">
              <Button variant="primary" loading>
                Loading...
              </Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
              <Button variant="primary">
                <Plus size={16} className="mr-2" />
                With Icon
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Cards Section */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Cards</h2>
            <p className="text-gray-600">Different card layouts and styles</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card hover>
                <CardContent>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive Card</h3>
                  <p className="text-gray-600">This card has hover effects and is interactive.</p>
                </CardContent>
              </Card>

              <Card 
                title="Card with Header"
                subtitle="This card has a header section"
                actions={<Button variant="ghost" size="sm"><Settings size={16} /></Button>}
              >
                <p className="text-gray-600">Content goes here with proper spacing and typography.</p>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold text-gray-900">Custom Header</h3>
                  <p className="text-sm text-gray-500">With custom styling</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">This card uses the CardHeader component for more control.</p>
                </CardContent>
                <CardFooter>
                  <Button variant="primary" size="sm">Action</Button>
                  <Button variant="outline" size="sm">Cancel</Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Inputs Section */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Form Inputs</h2>
            <p className="text-gray-600">Input fields with validation and accessibility</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Input
                  label="Basic Input"
                  placeholder="Enter some text..."
                  helperText="This is a helper text"
                />
                
                <Input
                  label="Required Input"
                  placeholder="This field is required"
                  required
                  value={inputValue}
                  onChange={handleInputChange}
                  error={inputError}
                />

                <Input
                  label="Input with Icon"
                  placeholder="Search..."
                  leftIcon={<Search size={16} />}
                />
              </div>

              <div className="space-y-4">
                <Input
                  label="Disabled Input"
                  placeholder="This is disabled"
                  disabled
                  value="Disabled value"
                />

                <Input
                  label="Input with Right Icon"
                  placeholder="Username"
                  rightIcon={<User size={16} />}
                />

                <Input
                  type="password"
                  label="Password"
                  placeholder="Enter password"
                  helperText="Password must be at least 8 characters"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges Section */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Badges</h2>
            <p className="text-gray-600">Status indicators and notification badges</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Basic Badges</h3>
                <div className="flex flex-wrap gap-3">
                  <Badge variant="default">Default</Badge>
                  <Badge variant="success">Success</Badge>
                  <Badge variant="warning">Warning</Badge>
                  <Badge variant="error">Error</Badge>
                  <Badge variant="info">Info</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Sizes</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="default" size="sm">Small</Badge>
                  <Badge variant="default" size="md">Medium</Badge>
                  <Badge variant="default" size="lg">Large</Badge>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Notification Badges</h3>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="relative">
                    <Bell size={24} className="text-gray-600" />
                    <NotificationBadge count={3} className="absolute -top-2 -right-2" />
                  </div>
                  <div className="relative">
                    <Bell size={24} className="text-gray-600" />
                    <NotificationBadge count={99} className="absolute -top-2 -right-2" />
                  </div>
                  <div className="relative">
                    <Bell size={24} className="text-gray-600" />
                    <NotificationBadge count={150} max={99} className="absolute -top-2 -right-2" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Status Badges</h3>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-2">
                    <StatusBadge status="online" />
                    <span className="text-sm text-gray-600">Online</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="away" />
                    <span className="text-sm text-gray-600">Away</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="busy" />
                    <span className="text-sm text-gray-600">Busy</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status="offline" />
                    <span className="text-sm text-gray-600">Offline</span>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <StatusBadge status="online" showText />
                  <StatusBadge status="away" showText />
                  <StatusBadge status="busy" showText />
                  <StatusBadge status="offline" showText />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal Section */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Modal</h2>
            <p className="text-gray-600">Modal dialogs with focus management</p>
          </CardHeader>
          <CardContent>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>

            <Modal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              title="Example Modal"
              size="md"
            >
              <div className="space-y-4">
                <p className="text-gray-600">
                  This is an example modal with proper focus management and accessibility features.
                </p>
                <Input
                  label="Modal Input"
                  placeholder="Try tabbing through elements..."
                />
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={() => setIsModalOpen(false)}>
                    Confirm
                  </Button>
                </div>
              </div>
            </Modal>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card>
          <CardHeader>
            <h2 className="text-2xl font-semibold text-gray-900">Color Palette</h2>
            <p className="text-gray-600">Our sage green and wood accent color system</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Sage Green (Primary)</h3>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div key={shade} className="text-center">
                      <div 
                        className={`w-full h-12 rounded-lg bg-sage-${shade} border border-gray-200`}
                      />
                      <span className="text-xs text-gray-500 mt-1 block">{shade}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-4">Wood (Secondary)</h3>
                <div className="grid grid-cols-5 gap-2">
                  {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                    <div key={shade} className="text-center">
                      <div 
                        className={`w-full h-12 rounded-lg bg-wood-${shade} border border-gray-200`}
                      />
                      <span className="text-xs text-gray-500 mt-1 block">{shade}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UIShowcase;