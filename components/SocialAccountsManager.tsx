import React, { useState, useEffect } from 'react';
import { Facebook, Instagram, Linkedin, Twitter, Plus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { socialApi } from '../services/api';

interface SocialAccount {
  id: number;
  platform: string;
  platform_username: string;
  platform_user_id: string;
  page_id: string | null;
  created_at: string;
  token_expired: boolean;
}

const platformIcons: Record<string, React.ReactNode> = {
  twitter: <Twitter size={20} />,
  linkedin: <Linkedin size={20} />,
  facebook: <Facebook size={20} />,
  instagram: <Instagram size={20} />,
};

const platformColors: Record<string, string> = {
  twitter: 'bg-black text-white',
  linkedin: 'bg-blue-700 text-white',
  facebook: 'bg-blue-600 text-white',
  instagram: 'bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white',
};

const platformNames: Record<string, string> = {
  twitter: 'X (Twitter)',
  linkedin: 'LinkedIn',
  facebook: 'Facebook',
  instagram: 'Instagram',
};

interface Props {
  onAccountsChange?: (accounts: SocialAccount[]) => void;
}

const SocialAccountsManager: React.FC<Props> = ({ onAccountsChange }) => {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccounts();

    // Check URL params for OAuth callback messages
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const oauthError = params.get('error');

    if (connected) {
      // Show success message briefly
      setError(null);
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (oauthError) {
      setError(getErrorMessage(oauthError));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    onAccountsChange?.(accounts);
  }, [accounts, onAccountsChange]);

  const getErrorMessage = (code: string): string => {
    switch (code) {
      case 'oauth_denied':
        return 'Authorization was denied. Please try again.';
      case 'oauth_failed':
        return 'Failed to connect account. Please try again.';
      case 'no_instagram_business_account':
        return 'No Instagram Business account found. Please ensure your Instagram is connected to a Facebook Page.';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await socialApi.getAccounts();
      setAccounts(data.accounts);
    } catch (err) {
      setError('Failed to load connected accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (platform: string) => {
    // Redirect to OAuth flow
    window.location.href = socialApi.getConnectUrl(platform);
  };

  const handleDisconnect = async (accountId: number) => {
    if (!confirm('Are you sure you want to disconnect this account?')) return;

    try {
      await socialApi.disconnect(accountId);
      setAccounts(prev => prev.filter(a => a.id !== accountId));
    } catch (err) {
      setError('Failed to disconnect account');
    }
  };

  const connectedPlatforms = new Set(accounts.map(a => a.platform));
  const availablePlatforms = ['twitter', 'linkedin', 'facebook', 'instagram'].filter(
    p => !connectedPlatforms.has(p)
  );

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-100 rounded"></div>
            <div className="h-12 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Accounts</h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            &times;
          </button>
        </div>
      )}

      {/* Connected Accounts */}
      <div className="space-y-3 mb-6">
        {accounts.length === 0 ? (
          <p className="text-gray-500 text-sm py-4 text-center">
            No accounts connected yet. Connect your social media accounts to start publishing.
          </p>
        ) : (
          accounts.map(account => (
            <div
              key={account.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${platformColors[account.platform]}`}>
                  {platformIcons[account.platform]}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {platformNames[account.platform]}
                  </div>
                  <div className="text-sm text-gray-500">
                    @{account.platform_username}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {account.token_expired ? (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center gap-1">
                    <AlertCircle size={12} />
                    Reconnect needed
                  </span>
                ) : (
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                    <CheckCircle size={12} />
                    Connected
                  </span>
                )}
                <button
                  onClick={() => handleDisconnect(account.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Disconnect account"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Connect New Account */}
      {availablePlatforms.length > 0 && (
        <>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Add Account</h4>
          <div className="grid grid-cols-2 gap-3">
            {availablePlatforms.map(platform => (
              <button
                key={platform}
                onClick={() => handleConnect(platform)}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
              >
                <div className={`p-2 rounded-lg ${platformColors[platform]}`}>
                  {platformIcons[platform]}
                </div>
                <div className="text-left">
                  <div className="font-medium text-gray-900 text-sm">
                    {platformNames[platform]}
                  </div>
                  <div className="text-xs text-gray-500">
                    Connect account
                  </div>
                </div>
                <Plus size={16} className="ml-auto text-gray-400" />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SocialAccountsManager;
