import React from 'react';
import { User, Channel, WorkNestPlugin } from '../../types';
import { LanguageTranslateView } from './LanguageTranslateView';

interface PluginsViewProps {
  currentUser: User | null;
  plugins?: WorkNestPlugin[];
  channels?: Channel[];
  members?: User[];
  onTogglePluginEnabled?: (pluginId: string) => void;
  onTogglePluginInstalled?: (pluginId: string) => void;
  onSaveCustomPlugin?: (plugin: WorkNestPlugin) => void;
  onUpdatePluginConfig?: (pluginId: string, userConfig: any) => void;
  onSendToChannel?: (content: string) => void;
  onOpenComposeEmail?: (subject: string, body: string) => void;
  onSaveFileToVault?: (title: string, content: string) => void;
  selectedCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export const PluginsView: React.FC<PluginsViewProps> = ({
  currentUser,
  channels = [],
  members = [],
  onSendToChannel,
  onOpenComposeEmail,
  onSaveFileToVault
}) => {
  // Fallback user if currentUser is null
  const activeUser: User = currentUser || {
    id: 'user_default',
    name: 'WorkNest Member',
    email: 'member@worknest.internal',
    role: 'member',
    status: 'online',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces'
  };

  return (
    <LanguageTranslateView
      currentUser={activeUser}
      channels={channels}
      members={members}
      onSendToChannel={(channelId, content) => onSendToChannel?.(content)}
      onSendToDM={(recipientId, content) => {
        // Fallback dispatch to channel if direct DM not wired
        onSendToChannel?.(content);
      }}
      onSaveFileToVault={onSaveFileToVault}
      onOpenComposeEmail={onOpenComposeEmail}
    />
  );
};

export default PluginsView;
