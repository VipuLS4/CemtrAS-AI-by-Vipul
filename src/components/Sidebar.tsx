import React, { useState } from 'react';
import { Factory, User, LogOut, X, Plus, MessageSquare, Zap } from 'lucide-react';
import { RoleSelector } from './RoleSelector';
import { ChatHistoryList } from './ChatHistoryList';
import { useAuth } from '../contexts/AuthContext';
import { useChatHistory } from '../contexts/ChatHistoryContext';
import type { UserRole, ChatHistory } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRole: UserRole | 'General AI';
  onRoleChange: (role: UserRole | 'General AI') => void;
  onLoadChat: (history: ChatHistory) => void;
  onNewChat: () => void;
  messageCount: number;
  isLoading: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  selectedRole,
  onRoleChange,
  onLoadChat,
  onNewChat,
  messageCount,
  isLoading
}) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { histories } = useChatHistory();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    onClose();
    window.location.reload();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          fixed lg:relative z-50 lg:z-auto
          w-80 h-full
          bg-white dark:bg-slate-900 
          border-r border-slate-200 dark:border-slate-700
          flex flex-col shadow-xl lg:shadow-none
          transition-transform duration-300 ease-in-out
        `}
        id="sidebar-navigation"
        role="navigation"
        aria-label="Main navigation and chat controls"
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0" role="region" aria-label="Application header">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-slate-700 to-blue-900 rounded-xl shadow-lg">
                <Factory className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">CemtrAS AI</h2>
                <p className="text-xs text-blue-700 dark:text-blue-400 font-semibold">
                  EPC Project Expert
                </p>
              </div>
            </div>
            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="text-slate-500 dark:text-slate-400" size={20} />
            </button>
          </div>

          {/* User Profile */}
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl" role="region" aria-label="User profile information">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-blue-900 flex items-center justify-center">
                <User className="text-white" size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user.fullName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-colors"
                aria-label="Logout from account"
              >
                <LogOut className="text-slate-400 hover:text-rose-500" size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl" role="region" aria-label="Guest user information">
              <div className="w-10 h-10 rounded-full overflow-hidden">
                <img 
                  src="/untitled (10).jpeg" 
                  alt="Guest User"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Vipul Sharma
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Guest Mode
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Top Section - Roles (50% height) */}
        <div className="flex-1 flex flex-col min-h-0">
          <nav className="p-4 border-b border-slate-200 dark:border-slate-700" role="navigation" aria-label="Expertise area selection">
            <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3" id="role-selector-heading">
              Select Expertise Area
            </h2>
            <div className="max-h-64 overflow-y-auto" role="radiogroup" aria-labelledby="role-selector-heading">
              <RoleSelector 
                selectedRole={selectedRole}
                onRoleChange={onRoleChange}
              />
            </div>
          </nav>

          {/* Bottom Section - Chat History & Stats (50% height) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" role="region" aria-label="Chat management">
            {/* New Chat Button */}
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-300 font-semibold shadow-md hover:shadow-lg hover:scale-[1.02]"
              aria-label="Start a new chat conversation"
            >
              <Plus size={16} />
              New Chat
            </button>

            {/* Chat History */}
            {isAuthenticated && (
              <section aria-labelledby="chat-history-heading">
                <h3 id="chat-history-heading" className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Chat History
                </h3>
                <ChatHistoryList 
                  history={histories}
                  onSelect={onLoadChat}
                />
              </section>
            )}

            {/* Stats */}
            <section className="space-y-3" role="region" aria-label="Chat statistics">
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3" role="status" aria-label="Message count">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="text-blue-500" size={14} />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    MESSAGES
                  </span>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{messageCount}</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3" role="status" aria-label="System status">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="text-amber-500" size={14} />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    STATUS
                  </span>
                </div>
                <p className={`text-sm font-bold ${isLoading ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {isLoading ? 'Processing...' : 'Ready'}
                </p>
              </div>
            </section>

            {/* Guest Mode Notice */}
            {!isAuthenticated && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3" role="note" aria-label="Guest mode limitations">
                <p className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  GUEST MODE
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Login to save chats & access advanced features
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0" role="contentinfo">
          <div className="text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Powered by <span className="text-blue-700 dark:text-blue-400 font-semibold">AI Technology</span>
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              © 2024 CemtrAS AI — EPC Project Expert
            </p>
          </div>
        </footer>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="logout-dialog-title">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 id="logout-dialog-title" className="text-xl font-bold text-slate-900 dark:text-white mb-4">
              Confirm Logout
            </h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to logout? Your chat history will be preserved.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 px-4 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                aria-label="Cancel logout"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                aria-label="Confirm logout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};