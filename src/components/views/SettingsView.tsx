import React, { useState } from 'react';
import { 
  Layers, 
  Users, 
  Hash, 
  Shield, 
  Link2, 
  Check, 
  Plus, 
  Trash2, 
  Download, 
  Palette, 
  Globe, 
  Smartphone,
  ExternalLink,
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  UserPlus,
  Radio,
  FileCheck,
  AlertCircle,
  Clock,
  RefreshCw,
  Eye,
  KeyRound,
  LogOut
} from 'lucide-react';
import { 
  OrganizationSettings, 
  Member, 
  UserRole, 
  ThemeAccentColor, 
  AuditLogEntry, 
  Channel,
  ApprovedDomain,
  RegistrationApprovalMode,
  OrganizationInvitation
} from '../../types';
import { UserAvatar } from '../UserAvatar';
import { WorkNestLogo } from '../WorkNestLogo';

interface SettingsViewProps {
  organization: OrganizationSettings;
  onUpdateOrganization: (updated: Partial<OrganizationSettings>) => void;
  members: Member[];
  onAddMember: (newMember: Partial<Member>) => void;
  onUpdateMemberRole: (memberId: string, role: UserRole) => void;
  onRemoveMember: (memberId: string) => void;
  channels: Channel[];
  auditLogs: AuditLogEntry[];
  activeTab: string;
  approvedDomains?: ApprovedDomain[];
  invitations?: OrganizationInvitation[];
  onAddDomain?: (domain: string, desc?: string) => void;
  onToggleDomainStatus?: (domainId: string) => void;
  onRemoveDomain?: (domainId: string) => void;
  onSendInvitation?: (invitation: { email: string; role: UserRole; department: string }) => void;
  onRevokeInvitation?: (invitationId: string) => void;
  isConnected?: boolean;
  onToggleConnection?: () => void;
  theme?: 'dark' | 'light' | 'system';
  onSelectTheme?: (t: 'dark' | 'light' | 'system') => void;
  currentUser?: Member | null;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  organization,
  onUpdateOrganization,
  members,
  onAddMember,
  onUpdateMemberRole,
  onRemoveMember,
  channels,
  auditLogs,
  activeTab,
  approvedDomains = [],
  invitations = [],
  onAddDomain,
  onToggleDomainStatus,
  onRemoveDomain,
  onSendInvitation,
  onRevokeInvitation,
  isConnected = true,
  onToggleConnection,
  theme = 'dark',
  onSelectTheme,
  currentUser,
  onLogout
}) => {
  const [orgName, setOrgName] = useState(organization.name);
  const [orgDomain, setOrgDomain] = useState(organization.domain);
  const [logoText, setLogoText] = useState(organization.logoText);
  const [accentColor, setAccentColor] = useState<ThemeAccentColor>(organization.accentColor);
  const [agencyName, setAgencyName] = useState(organization.organizationStateOrAgency || 'WorkNest Workspace');
  const [retentionDays, setRetentionDays] = useState(organization.retentionDays || 180);
  const [approvalMode, setApprovalMode] = useState<RegistrationApprovalMode>(organization.registrationApprovalMode || 'admin_approval');
  const [requireGov, setRequireGov] = useState(organization.requireGovDomain ?? true);
  
  const [isSaved, setIsSaved] = useState(false);

  // New Member Modal State
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemName, setNewMemName] = useState('');
  const [newMemEmail, setNewMemEmail] = useState('');
  const [newMemDept, setNewMemDept] = useState('Administration & Finance');
  const [newMemRole, setNewMemRole] = useState<UserRole>('Member');
  const [newMemTitle, setNewMemTitle] = useState('Staff Officer');

  // New Domain Form State
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [newDomainStr, setNewDomainStr] = useState('');
  const [newDomainDesc, setNewDomainDesc] = useState('');
  const [domainError, setDomainError] = useState<string | null>(null);

  // New Invitation Form State
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<UserRole>('Member');
  const [inviteDept, setInviteDept] = useState('Administration & Finance');
  const [inviteError, setInviteError] = useState<string | null>(null);

  // Audit filter state
  const [auditFilter, setAuditFilter] = useState('');

  const handleSaveProfile = () => {
    onUpdateOrganization({
      name: orgName,
      domain: orgDomain,
      logoText,
      accentColor,
      organizationStateOrAgency: agencyName,
      retentionDays,
      registrationApprovalMode: approvalMode,
      requireGovDomain: requireGov
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemName || !newMemEmail) return;

    onAddMember({
      name: newMemName,
      email: newMemEmail,
      department: newMemDept,
      jobTitle: newMemTitle,
      role: newMemRole,
      status: 'offline',
      isVerifiedGov: true,
      avatar: ''
    });

    setNewMemName('');
    setNewMemEmail('');
    setShowAddMember(false);
  };

  const handleAddNewDomainSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDomainError(null);
    const trimmed = newDomainStr.trim().toLowerCase().replace(/^@/, '');

    if (!trimmed) {
      setDomainError('Please enter a valid domain name.');
      return;
    }

    if (onAddDomain) {
      onAddDomain(trimmed, newDomainDesc.trim());
    }
    setNewDomainStr('');
    setNewDomainDesc('');
    setShowAddDomain(false);
  };

  const handleSendInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    const trimmed = inviteEmail.trim().toLowerCase();

    if (!trimmed || !trimmed.includes('@')) {
      setInviteError('Please enter a valid email address.');
      return;
    }

    if (onSendInvitation) {
      onSendInvitation({
        email: trimmed,
        role: inviteRole,
        department: inviteDept
      });
    }

    setInviteEmail('');
    setShowInviteModal(false);
  };

  const handleExportAuditLogs = () => {
    const jsonStr = JSON.stringify(auditLogs, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WorkNest-Audit-Report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const safeLogs = Array.isArray(auditLogs) ? auditLogs : [];
  const filteredLogs = auditFilter.trim()
    ? safeLogs.filter(log => 
        (log.action || '').toLowerCase().includes(auditFilter.toLowerCase()) ||
        (log.actor?.name || '').toLowerCase().includes(auditFilter.toLowerCase()) ||
        (log.target || '').toLowerCase().includes(auditFilter.toLowerCase()) ||
        (log.details || '').toLowerCase().includes(auditFilter.toLowerCase())
      )
    : safeLogs;

  const currentDomains = (approvedDomains && approvedDomains.length > 0 ? approvedDomains : organization?.approvedDomains) || [];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-white dark:bg-[#0F172A] p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 select-none text-stone-800 dark:text-stone-100 scrollbar-thin">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* 1. ORGANIZATION PROFILE */}
        {activeTab === 'profile' && (
          <section className="space-y-6">
            <div className="border-b border-stone-200 dark:border-stone-800/80 pb-4">
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                Organization Profile & Settings
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Configure primary metadata, agency affiliations, and workspace parameters.
              </p>
            </div>

            {/* Official Workspace Brand Emblem Display */}
            <div className="p-4 sm:p-5 rounded-2xl bg-stone-50/80 dark:bg-[#111726]/80 border border-stone-200/90 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-2.5 rounded-xl bg-white dark:bg-[#0B101E] border border-stone-200 dark:border-stone-800/80 shadow-xs flex items-center justify-center">
                  <WorkNestLogo size="md" />
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Official WorkNest Brand Identity
                  </div>
                  <div className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    High-contrast vector rendering with automatic dark/light mode optimization and zero fringe.
                  </div>
                </div>
              </div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-[11px] font-semibold text-blue-700 dark:text-blue-300 shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified Asset</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Workspace Title
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Primary Domain
                </label>
                <input
                  type="text"
                  value={orgDomain}
                  onChange={e => setOrgDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Agency / State Jurisdiction
                </label>
                <input
                  type="text"
                  value={agencyName}
                  onChange={e => setAgencyName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  Audit Retention (Days)
                </label>
                <input
                  type="number"
                  value={retentionDays}
                  onChange={e => setRetentionDays(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Appearance & Color Mode */}
            {onSelectTheme && (
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-3">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    Workspace Visual Theme
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Choose between executive dark mode, crisp high-contrast light mode, or match system settings.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'dark', label: 'Dark Mode (Default)', desc: 'Eye-friendly deep navy canvas', icon: '🌙' },
                    { id: 'light', label: 'Light Mode', desc: 'Clean, high-contrast daylight view', icon: '☀️' },
                    { id: 'system', label: 'System Theme', desc: 'Sync with operating system', icon: '💻' }
                  ].map(mode => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => onSelectTheme(mode.id as 'dark' | 'light' | 'system')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        theme === mode.id
                          ? 'border-[#0062FF] bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-[#0062FF]'
                          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900/50 hover:border-stone-300 dark:hover:border-stone-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-base">{mode.icon}</span>
                        {theme === mode.id && (
                          <span className="w-4 h-4 rounded-full bg-[#0062FF] text-white flex items-center justify-center text-[10px]">
                            ✓
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                          {mode.label}
                        </div>
                        <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5">
                          {mode.desc}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Officer Session & Sign Out */}
            {currentUser && onLogout && (
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800">
                <div className="flex items-center space-x-3">
                  <UserAvatar member={currentUser} size="md" showStatus={true} shape="rounded" />
                  <div>
                    <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-stone-500 dark:text-stone-400">
                      {currentUser.email} • {currentUser.role} ({currentUser.department || 'Operations'})
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  id="btn-settings-signout"
                  onClick={onLogout}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800/80 transition-colors flex items-center space-x-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out Session</span>
                </button>
              </div>
            )}

            <div className="pt-4 flex items-center justify-end">
              <button
                onClick={handleSaveProfile}
                className="px-5 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-xs font-bold shadow-xs transition-colors flex items-center space-x-2"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Configuration Saved</span>
                  </>
                ) : (
                  <span>Save Organization Profile</span>
                )}
              </button>
            </div>
          </section>
        )}

        {/* 2. DOMAIN ALLOWLIST */}
        {activeTab === 'domains' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800/80 pb-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Domain Allowlist
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Approved organizational domains for user registration and authentication.
                </p>
              </div>
              <button
                onClick={() => setShowAddDomain(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Domain</span>
              </button>
            </div>

            <div className="space-y-2">
              {currentDomains.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-400">
                  No custom domains added yet.
                </div>
              ) : (
                currentDomains.map(d => (
                  <div
                    key={d.id}
                    className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Globe className="w-4 h-4 text-[#0062FF]" />
                      <div>
                        <div className="font-bold text-xs text-stone-900 dark:text-stone-100">
                          @{d.domain}
                        </div>
                        <div className="text-[11px] text-stone-500">{d.description || 'Approved domain'}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.isActive ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' : 'bg-stone-200 text-stone-500'
                      }`}>
                        {d.isActive ? 'Active' : 'Disabled'}
                      </span>
                      {onRemoveDomain && (
                        <button
                          onClick={() => onRemoveDomain(d.id)}
                          className="p-1 text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Domain Modal */}
            {showAddDomain && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <form onSubmit={handleAddNewDomainSubmit} className="w-full max-w-md bg-white dark:bg-[#111726] rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-2xl">
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    Add Approved Domain
                  </h3>
                  {domainError && (
                    <div className="p-2 rounded-lg bg-rose-50 text-rose-700 text-xs">
                      {domainError}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Domain name</label>
                    <input
                      type="text"
                      placeholder="e.g. agency.gov.ng"
                      value={newDomainStr}
                      onChange={e => setNewDomainStr(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Description</label>
                    <input
                      type="text"
                      placeholder="e.g. Department of Finance"
                      value={newDomainDesc}
                      onChange={e => setNewDomainDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddDomain(false)}
                      className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white text-xs font-bold"
                    >
                      Add Domain
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}

        {/* 3. MEMBERS & ROLES */}
        {activeTab === 'members' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800/80 pb-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Officer Access & Roles
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Manage staff roles and clearances across the organization.
                </p>
              </div>
              <button
                onClick={() => setShowAddMember(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Officer</span>
              </button>
            </div>

            <div className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 text-stone-500 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Officer</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                  {members.map(member => (
                    <tr key={member.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-900/40">
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <UserAvatar
                            member={member}
                            size="sm"
                            showStatus={true}
                            shape="rounded"
                          />
                          <div>
                            <div className="font-bold text-stone-900 dark:text-stone-100">{member.name}</div>
                            <div className="text-[11px] text-stone-400">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{member.department}</td>
                      <td className="px-4 py-3">
                        <select
                          value={member.role}
                          onChange={e => onUpdateMemberRole(member.id, e.target.value as UserRole)}
                          className="px-2 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-xs text-stone-900 dark:text-stone-100"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Member">Member</option>
                          <option value="Auditor">Auditor</option>
                          <option value="Guest">Guest</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => onRemoveMember(member.id)}
                          className="p-1 text-stone-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add Member Modal */}
            {showAddMember && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <form onSubmit={handleCreateMember} className="w-full max-w-md bg-white dark:bg-[#111726] rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-2xl">
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    Add New Officer
                  </h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Name</label>
                    <input
                      type="text"
                      required
                      value={newMemName}
                      onChange={e => setNewMemName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Official Email</label>
                    <input
                      type="email"
                      required
                      value={newMemEmail}
                      onChange={e => setNewMemEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Department</label>
                    <input
                      type="text"
                      value={newMemDept}
                      onChange={e => setNewMemDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddMember(false)}
                      className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white text-xs font-bold"
                    >
                      Create Officer
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}

        {/* 4. INVITATIONS */}
        {activeTab === 'invitations' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800/80 pb-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  Pending Enrollments & Invites
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Enroll new staff members with pre-assigned roles and access tokens.
                </p>
              </div>
              <button
                onClick={() => setShowInviteModal(true)}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white text-xs font-bold shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Invite Staff</span>
              </button>
            </div>

            <div className="space-y-2">
              {invitations.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-400">
                  No active invitations pending.
                </div>
              ) : (
                invitations.map(inv => (
                  <div
                    key={inv.id}
                    className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-bold text-xs text-stone-900 dark:text-stone-100">{inv.email}</div>
                      <div className="text-[11px] text-stone-500">{inv.department} • Role: {inv.role}</div>
                    </div>
                    {onRevokeInvitation && (
                      <button
                        onClick={() => onRevokeInvitation(inv.id)}
                        className="p-1 text-stone-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Send Invite Modal */}
            {showInviteModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
                <form onSubmit={handleSendInviteSubmit} className="w-full max-w-md bg-white dark:bg-[#111726] rounded-2xl border border-stone-200 dark:border-stone-800 p-6 space-y-4 shadow-2xl">
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    Invite Staff Member
                  </h3>
                  {inviteError && (
                    <div className="p-2 rounded-lg bg-rose-50 text-rose-700 text-xs">
                      {inviteError}
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Staff Email</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. officer@worknest.app"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-700 dark:text-stone-300">Department</label>
                    <input
                      type="text"
                      value={inviteDept}
                      onChange={e => setInviteDept(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-xs text-stone-900 dark:text-stone-100 focus:outline-none"
                    />
                  </div>
                  <div className="flex justify-end space-x-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowInviteModal(false)}
                      className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-700 text-xs font-semibold text-stone-600 dark:text-stone-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] text-white text-xs font-bold"
                    >
                      Send Invitation
                    </button>
                  </div>
                </form>
              </div>
            )}
          </section>
        )}

        {/* 5. AUDIT LOGS */}
        {activeTab === 'audit' && (
          <section className="space-y-6">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800/80 pb-4">
              <div>
                <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  NDPA 2023 Statutory Audit Trail
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Immutable audit records of user authorizations, file transfers, and administrative actions.
                </p>
              </div>
              <button
                onClick={handleExportAuditLogs}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit Logs</span>
              </button>
            </div>

            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-stone-400">
                  No audit log records found.
                </div>
              ) : (
                filteredLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/40 flex items-start justify-between text-xs space-y-1"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-stone-900 dark:text-stone-100">
                          {log.action}
                        </span>
                        <span className="text-[10px] text-stone-400">• {log.timestamp}</span>
                      </div>
                      <div className="text-stone-600 dark:text-stone-300 text-[11px]">
                        Actor: {log.actor.name} ({log.actor.email})
                      </div>
                      <div className="text-stone-500 dark:text-stone-400 text-[11px]">
                        Target: {log.target} — {log.details}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-100 text-[#0062FF] dark:bg-blue-950 dark:text-blue-300 shrink-0">
                      SEC-OK
                    </span>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};
