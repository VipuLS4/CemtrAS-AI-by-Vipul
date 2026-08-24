import React from 'react';
import { Factory, BarChart3, TrendingUp, ShoppingCart, Wrench, Settings, Bot } from 'lucide-react';
import type { UserRole } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface RoleSelectorProps {
  selectedRole: UserRole | 'General AI';
  onRoleChange: (role: UserRole | 'General AI') => void;
}

interface RoleConfig {
  value: UserRole | 'General AI';
  label: string;
  icon: React.ReactNode;
  description: string;
  requiresAuth?: boolean;
  accent: string;
  selectedBg: string;
  selectedText: string;
  selectedBorder: string;
  iconBg: string;
  iconBgSelected: string;
}

const roles: RoleConfig[] = [
  {
    value: 'Operations',
    label: 'Operations & Maintenance',
    icon: <Factory size={18} />,
    description: 'Machinery troubleshooting & process optimization',
    accent: 'amber',
    selectedBg: 'bg-amber-50 dark:bg-amber-900/30',
    selectedText: 'text-amber-700 dark:text-amber-300',
    selectedBorder: 'border-l-amber-500',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
    iconBgSelected: 'bg-amber-200 dark:bg-amber-800/60 text-amber-700 dark:text-amber-300',
  },
  {
    value: 'Project Management',
    label: 'Project Management',
    icon: <BarChart3 size={18} />,
    description: 'EPC scheduling & resource planning',
    accent: 'blue',
    selectedBg: 'bg-blue-50 dark:bg-blue-900/30',
    selectedText: 'text-blue-700 dark:text-blue-300',
    selectedBorder: 'border-l-blue-600',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
    iconBgSelected: 'bg-blue-200 dark:bg-blue-800/60 text-blue-700 dark:text-blue-300',
  },
  {
    value: 'Sales & Marketing',
    label: 'Sales & Marketing',
    icon: <TrendingUp size={18} />,
    description: 'Market analysis & customer strategies',
    accent: 'emerald',
    selectedBg: 'bg-emerald-50 dark:bg-emerald-900/30',
    selectedText: 'text-emerald-700 dark:text-emerald-300',
    selectedBorder: 'border-l-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
    iconBgSelected: 'bg-emerald-200 dark:bg-emerald-800/60 text-emerald-700 dark:text-emerald-300',
  },
  {
    value: 'Procurement',
    label: 'Procurement & Supply Chain',
    icon: <ShoppingCart size={18} />,
    description: 'Vendor negotiations & inventory optimization',
    accent: 'rose',
    selectedBg: 'bg-rose-50 dark:bg-rose-900/30',
    selectedText: 'text-rose-700 dark:text-rose-300',
    selectedBorder: 'border-l-rose-500',
    iconBg: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
    iconBgSelected: 'bg-rose-200 dark:bg-rose-800/60 text-rose-700 dark:text-rose-300',
  },
  {
    value: 'Erection & Commissioning',
    label: 'Erection & Commissioning',
    icon: <Wrench size={18} />,
    description: 'Installation sequencing & safety compliance',
    accent: 'sky',
    selectedBg: 'bg-sky-50 dark:bg-sky-900/30',
    selectedText: 'text-sky-700 dark:text-sky-300',
    selectedBorder: 'border-l-sky-500',
    iconBg: 'bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400',
    iconBgSelected: 'bg-sky-200 dark:bg-sky-800/60 text-sky-700 dark:text-sky-300',
  },
  {
    value: 'Engineering & Design',
    label: 'Engineering & Design',
    icon: <Settings size={18} />,
    description: 'Process flow design & equipment selection',
    accent: 'orange',
    selectedBg: 'bg-orange-50 dark:bg-orange-900/30',
    selectedText: 'text-orange-700 dark:text-orange-300',
    selectedBorder: 'border-l-orange-500',
    iconBg: 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400',
    iconBgSelected: 'bg-orange-200 dark:bg-orange-800/60 text-orange-700 dark:text-orange-300',
  },
  {
    value: 'General AI',
    label: 'General AI Assistant',
    icon: <Bot size={18} />,
    description: 'General purpose AI for any questions',
    requiresAuth: true,
    accent: 'violet',
    selectedBg: 'bg-violet-50 dark:bg-violet-900/30',
    selectedText: 'text-violet-700 dark:text-violet-300',
    selectedBorder: 'border-l-violet-500',
    iconBg: 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400',
    iconBgSelected: 'bg-violet-200 dark:bg-violet-800/60 text-violet-700 dark:text-violet-300',
  },
];

export const RoleSelector: React.FC<RoleSelectorProps> = ({ selectedRole, onRoleChange }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="space-y-2" role="radiogroup" aria-label="Select expertise area">
      {roles
        .filter(role => !role.requiresAuth || isAuthenticated)
        .map((role) => {
          const isSelected = selectedRole === role.value;
          return (
            <button
              key={role.value}
              onClick={() => onRoleChange(role.value)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 border-l-4 ${
                isSelected
                  ? `${role.selectedBg} ${role.selectedText} ${role.selectedBorder} shadow-md scale-[1.02]`
                  : 'border-l-transparent bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-[1.01]'
              }`}
              role="radio"
              aria-checked={isSelected}
              aria-label={`${role.label}: ${role.description}`}
            >
              <div className={`p-1.5 rounded-lg flex-shrink-0 transition-colors ${isSelected ? role.iconBgSelected : role.iconBg}`}>
                {role.icon}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className={`font-semibold text-xs ${isSelected ? '' : 'text-slate-900 dark:text-white'} truncate`}>
                  {role.label}
                </div>
                <div className={`text-xs ${isSelected ? 'opacity-80' : 'text-slate-500 dark:text-slate-400'} truncate`}>
                  {role.description}
                </div>
              </div>
              {isSelected && (
                <div className={`w-2 h-2 rounded-full shadow-lg flex-shrink-0 bg-${role.accent}-500`}></div>
              )}
            </button>
          );
        })}
    </div>
  );
};
