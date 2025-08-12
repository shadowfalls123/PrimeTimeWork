import React from 'react';
import { Authenticator } from '@aws-amplify/ui-react';
import { Button } from './Button';
import { Input } from './Input';
import { Card, CardContent } from './Card';

interface AuthenticatorWrapperProps {
  onUserAuthenticated?: (user: any) => void;
  isLoading?: boolean;
  onSignOut?: () => void;
}

const AuthenticatorWrapper: React.FC<AuthenticatorWrapperProps> = ({
  onUserAuthenticated,
  isLoading = false,
  onSignOut
}) => {
  return (
    <div className="w-full min-h-[350px] flex flex-col items-center justify-start">
      <style jsx global>{`
        /* Hide default Amplify styling completely */
        .amplify-authenticator {
          --amplify-colors-brand-primary-10: rgb(246, 247, 246);
          --amplify-colors-brand-primary-80: rgb(143, 188, 143);
          --amplify-colors-brand-primary-90: rgb(107, 142, 107);
          --amplify-colors-brand-primary-100: rgb(86, 115, 86);
          --amplify-radii-small: 0.5rem;
          --amplify-radii-medium: 0.75rem;
          --amplify-space-small: 0.5rem;
          --amplify-space-medium: 1rem;
          --amplify-space-large: 1.5rem;
          --amplify-fonts-default: 'Inter', ui-sans-serif, system-ui, sans-serif;
        }

        /* Completely override Amplify tabs */
        .amplify-tabs {
          border: none !important;
          background: transparent !important;
        }

        .amplify-tabs__list {
          display: flex !important;
          border-bottom: 1px solid rgb(229, 231, 235) !important;
          margin-bottom: 1.5rem !important;
          background: transparent !important;
          padding: 0 !important;
        }

        .amplify-tabs__item {
          flex: 1 !important;
          padding: 0.75rem 1rem !important;
          text-align: center !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          color: rgb(107, 114, 128) !important;
          border-bottom: 2px solid transparent !important;
          background: transparent !important;
          border-radius: 0 !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
        }

        .amplify-tabs__item:hover {
          color: rgb(55, 65, 81) !important;
          border-bottom-color: rgb(209, 213, 219) !important;
        }

        .amplify-tabs__item--active {
          color: rgb(143, 188, 143) !important;
          border-bottom-color: rgb(143, 188, 143) !important;
          background: transparent !important;
        }

        /* Form field styling */
        .amplify-field {
          margin-bottom: 1rem !important;
          width: 100% !important;
        }

        .amplify-label {
          display: block !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          color: rgb(55, 65, 81) !important;
          margin-bottom: 0.5rem !important;
        }

        .amplify-input {
          display: block !important;
          width: 100% !important;
          border-radius: 0.5rem !important;
          border: 1px solid rgb(209, 213, 219) !important;
          padding: 0.5rem 0.75rem !important;
          font-size: 1rem !important;
          color: rgb(17, 24, 39) !important;
          background-color: white !important;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
          transition: all 0.2s ease !important;
        }

        .amplify-input::placeholder {
          color: rgb(156, 163, 175) !important;
        }

        .amplify-input:focus {
          outline: none !important;
          border-color: rgb(143, 188, 143) !important;
          box-shadow: 0 0 0 1px rgb(143, 188, 143) !important;
        }

        /* Button styling */
        .amplify-button--primary {
          width: 100% !important;
          background-color: rgb(143, 188, 143) !important;
          color: white !important;
          font-weight: 500 !important;
          padding: 0.5rem 1rem !important;
          border-radius: 0.5rem !important;
          border: none !important;
          font-size: 1rem !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
        }

        .amplify-button--primary:hover {
          background-color: rgb(107, 142, 107) !important;
        }

        .amplify-button--primary:focus {
          outline: none !important;
          box-shadow: 0 0 0 2px rgb(143, 188, 143, 0.5) !important;
        }

        /* Google sign-in button */
        .federated-sign-in-button {
          width: 100% !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 0.5rem 1rem !important;
          border: 1px solid rgb(209, 213, 219) !important;
          border-radius: 0.5rem !important;
          background-color: white !important;
          font-size: 0.875rem !important;
          font-weight: 500 !important;
          color: rgb(55, 65, 81) !important;
          transition: all 0.2s ease !important;
          cursor: pointer !important;
          margin-bottom: 1rem !important;
        }

        .federated-sign-in-button:hover {
          background-color: rgb(249, 250, 251) !important;
        }

        .federated-sign-in-button:focus {
          outline: none !important;
          box-shadow: 0 0 0 2px rgb(143, 188, 143, 0.5) !important;
        }

        .federated-sign-in-icon {
          width: 1.25rem !important;
          height: 1.25rem !important;
          margin-right: 0.75rem !important;
        }

        /* Divider styling */
        .amplify-divider {
          margin: 1.5rem 0 !important;
          border-color: rgb(229, 231, 235) !important;
          position: relative !important;
        }

        .amplify-divider[data-label="or"]::before {
          content: "or" !important;
          position: absolute !important;
          left: 50% !important;
          top: 50% !important;
          transform: translate(-50%, -50%) !important;
          background-color: white !important;
          color: rgb(107, 114, 128) !important;
          padding: 0 0.75rem !important;
          font-size: 0.875rem !important;
        }

        /* Password field styling */
        .amplify-passwordfield .amplify-field-group {
          position: relative !important;
        }

        .amplify-passwordfield .amplify-input {
          padding-right: 3rem !important;
        }

        .amplify-field__show-password {
          position: absolute !important;
          right: 0.75rem !important;
          top: 50% !important;
          transform: translateY(-50%) !important;
          background: transparent !important;
          border: none !important;
          color: rgb(156, 163, 175) !important;
          cursor: pointer !important;
          padding: 0.25rem !important;
          border-radius: 0.25rem !important;
        }

        .amplify-field__show-password:hover {
          color: rgb(107, 114, 128) !important;
        }

        /* Remove default margins and ensure full width and centering */
        .amplify-flex {
          width: 100% !important;
          margin: 0 auto !important;
        }

        .amplify-flex[style*="flex-direction: column"] {
          gap: 1rem !important;
        }

        /* Center all Amplify containers */
        [data-amplify-authenticator] {
          width: 100% !important;
          max-width: none !important;
          margin: 0 auto !important;
        }

        [data-amplify-container] {
          width: 100% !important;
          margin: 0 auto !important;
        }

        [data-amplify-router] {
          width: 100% !important;
          margin: 0 auto !important;
        }

        [data-amplify-form] {
          width: 100% !important;
          margin: 0 auto !important;
        }

        /* Ensure tabs are centered */
        .amplify-tabs {
          width: 100% !important;
          margin: 0 auto !important;
        }

        .amplify-tabs__panel {
          width: 100% !important;
          margin: 0 auto !important;
        }

        /* Center form fields */
        .amplify-field-group {
          width: 100% !important;
          margin: 0 auto !important;
        }

        .amplify-field-group--horizontal {
          width: 100% !important;
          margin: 0 auto !important;
        }

        /* Hide Amplify branding */
        .amplify-text--disabled {
          display: none !important;
        }

        /* Error messages */
        .amplify-alert--error {
          background-color: rgb(254, 242, 242) !important;
          border: 1px solid rgb(252, 165, 165) !important;
          color: rgb(153, 27, 27) !important;
          padding: 0.75rem !important;
          border-radius: 0.5rem !important;
          margin-bottom: 1rem !important;
          font-size: 0.875rem !important;
        }

        /* Links */
        .amplify-button--link {
          color: rgb(143, 188, 143) !important;
          text-decoration: underline !important;
          background: transparent !important;
          border: none !important;
          padding: 0 !important;
          font-size: 0.875rem !important;
        }

        .amplify-button--link:hover {
          color: rgb(107, 142, 107) !important;
        }
      `}</style>

      <div className="w-full max-w-md mx-auto">
        <Authenticator
          socialProviders={["google"]}
          loginMechanisms={["email"]}
          components={{
            Header() {
              return null; // Hide default header
            },
          }}
        >
        {({ user, signOut }) => {
          if (user && onUserAuthenticated) {
            onUserAuthenticated(user);
          }

          return (
            <div className="text-center space-y-4">
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sage-500"></div>
                    <span className="text-gray-600">
                      {isLoading ? "Setting up your account..." : "Logging you in..."}
                    </span>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      signOut();
                      if (onSignOut) onSignOut();
                    }}
                    disabled={isLoading}
                  >
                    Sign Out
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600">
                  Please log in or sign up to continue
                </p>
              )}
            </div>
          );
        }}
        </Authenticator>
      </div>
    </div>
  );
};

export default AuthenticatorWrapper;