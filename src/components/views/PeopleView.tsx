import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  MessageSquare, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Calendar, 
  ChevronRight, 
  Building2, 
  Lock, 
  Globe 
} from 'lucide-react';
import { Member } from '../../types';
import { UserAvatar } from '../UserAvatar';

interface PeopleViewProps {
  members: Member[];
  activeDepartment: string;
  currentUser: Member;
  onStartDM: (member: Member) => void;
  onSendEmailToMember: (member: Member) => void;
}

export const PeopleView: React.FC<PeopleViewProps> = ({
  members = [],
  activeDepartment,
  currentUser,
  onStartDM,
  onSendEmailToMember
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const safeMembers = Array.isArray(members) ? members : [];

  const filteredMembers = safeMembers.filter(m => {
    if (!m) return false;
    if (activeDepartment !== 'All Departments' && activeDepartment !== 'All Members' && m.department !== activeDepartment) {
      return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.name || '').toLowerCase().includes(q) ||
      (m.email || '').toLowerCase().includes(q) ||
      (m.role || '').toLowerCase().includes(q) ||
      (m.department || '').toLowerCase().includes(q) ||
      (m.jobTitle && m.jobTitle.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-white dark:bg-[#0F172A] select-none text-stone-800 dark:text-stone-100">
      
      {/* Top Header */}
      <div className="h-14 px-4 sm:px-6 border-b border-stone-200 dark:border-stone-800/80 flex items-center justify-between shrink-0 bg-white dark:bg-[#0F172A]">
        <div className="flex items-center space-x-3 flex-1 max-w-xs sm:max-w-sm">
          <div className="w-full flex items-center px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 text-xs">
            <Search className="w-3.5 h-3.5 text-stone-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search staff by name, role, department..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="text-xs text-stone-400">
          Showing {filteredMembers.length} staff members
        </div>
      </div>

      {/* Directory Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 scrollbar-thin bg-[#F8FAFC] dark:bg-[#080C14]">
        
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
              {activeDepartment}
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
              Connect with members of your organization.
            </p>
          </div>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-white dark:bg-[#0F172A] rounded-2xl border border-stone-200 dark:border-stone-800/80 p-8 max-w-md mx-auto">
            <div className="w-10 h-10 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
              <Users className="w-5 h-5 text-stone-400" />
            </div>
            <div className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              No members to display
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Connect with members of your organization. No matching staff members found in this department or filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map(member => {
              const isSelf = member.id === currentUser.id;

              return (
                <div
                  key={member.id}
                  className="p-5 rounded-2xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#0F172A] hover:border-blue-300 dark:hover:border-blue-800 transition-all space-y-4 shadow-2xs group"
                >
                {/* Profile Header */}
                <div className="flex items-start space-x-3.5">
                  <UserAvatar
                    member={member}
                    size="lg"
                    showStatus={true}
                    shape="rounded"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 truncate">
                        {member.name}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-50 text-[#0062FF] dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                        {member.role}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-500 dark:text-stone-400 truncate mt-0.5">
                      {member.jobTitle || 'Officer'}
                    </div>

                    <div className="text-[11px] text-stone-400 truncate">
                      {member.department}
                    </div>
                  </div>
                </div>

                {/* Email line */}
                <div className="p-2 rounded-xl bg-stone-50 dark:bg-stone-900/60 border border-stone-100 dark:border-stone-800 text-[11px] text-stone-600 dark:text-stone-300 truncate">
                  {member.email}
                </div>

                {/* Action Buttons */}
                {!isSelf && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100 dark:border-stone-800">
                    <button
                      onClick={() => onStartDM(member)}
                      className="flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-[#0062FF] text-xs font-semibold text-stone-700 dark:text-stone-300 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Direct Line</span>
                    </button>

                    <button
                      onClick={() => onSendEmailToMember(member)}
                      className="flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-xs font-semibold shadow-xs transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Send Mail</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        )}
      </div>

    </div>
  );
};
