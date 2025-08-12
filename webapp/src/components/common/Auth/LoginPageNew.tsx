import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import '@aws-amplify/ui-react/styles.css';
import { createUserProfile } from "../../../services";
import { Card, CardContent, CardHeader } from "../../ui/Card";
import AuthenticatorWrapper from "../../ui/AuthenticatorWrapper";
import logger from "../../../util/logger";

interface UserProfile {
  firstname: string;
  lastname: string;
  useremail: string;
}

interface AmplifyUser {
  username: string;
  signInDetails?: {
    loginId?: string;
  };
}

const LoginPageNew: React.FC = () => {
  const navigate = useNavigate();
  const [profileCreated, setProfileCreated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUserProfileCreation = async (currentUser: AmplifyUser): Promise<void> => {
    try {
      setIsLoading(true);
      logger.log("[LoginPage] - currentUser:", currentUser);
      
      const email = currentUser.signInDetails?.loginId || "";
      const userFullName = currentUser.username || "";
      const splitName = userFullName.split(" ");
      const firstname = splitName[0] || "";
      const lastname = splitName.slice(1).join(" ");

      if (!profileCreated) {
        const userProfileData: UserProfile = {
          firstname,
          lastname,
          useremail: email,
        };

        await createUserProfile(userProfileData);
        setProfileCreated(true);
      }
    } catch (error) {
      console.error("Error during user profile creation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (profileCreated) {
      navigate("/");
    }
  }, [profileCreated, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-wood-50 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <Card className="shadow-xl">
          <CardHeader className="text-center pb-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-sage-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">P</span>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to PrimeTime
            </h1>
            <p className="text-gray-600">
              Your ultimate learning companion for exam success
            </p>
          </CardHeader>
          
          <CardContent className="px-8 pb-8">
            <div className="space-y-6">
              {/* Features highlight */}
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className="w-2 h-2 bg-sage-500 rounded-full"></div>
                  <span>Comprehensive mock exams</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className="w-2 h-2 bg-wood-400 rounded-full"></div>
                  <span>Detailed performance feedback</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-600">
                  <div className="w-2 h-2 bg-sage-500 rounded-full"></div>
                  <span>Personalized learning paths</span>
                </div>
              </div>

              {/* Authenticator */}
              <div className="border-t border-gray-200 pt-6">
                <div className="min-h-[500px]">
                  <AuthenticatorWrapper
                    onUserAuthenticated={(user) => {
                      logger.log("[LoginPage] - user:", user);
                      handleUserProfileCreation(user);
                    }}
                    isLoading={isLoading}
                    onSignOut={() => {
                      setProfileCreated(false);
                      setIsLoading(false);
                    }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-sage-600 hover:text-sage-700 underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacy-policy" className="text-sage-600 hover:text-sage-700 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPageNew;