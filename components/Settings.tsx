import React from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import SocialAccountsManager from './SocialAccountsManager';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const Settings: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <SettingsIcon size={20} className="text-gray-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
              <p className="text-sm text-gray-500">Manage your connected accounts and preferences</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <SocialAccountsManager />

          {/* Additional settings sections can be added here */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">API Configuration</h3>
            <p className="text-sm text-gray-500 mb-4">
              Environment variables are configured on the server. See the setup instructions for details.
            </p>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <code className="text-xs text-gray-600 block whitespace-pre">
{`# Required Environment Variables
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
GEMINI_API_KEY=your_gemini_api_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
