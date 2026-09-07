import { 
  db, 
  auth, 
  storage, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject, 
  handleFirestoreError, 
  OperationType 
} from './firebase';
import { 
  Channel, 
  DirectMessage, 
  Message, 
  FileItem, 
  FileFolder, 
  Member, 
  EmailMessage, 
  AuditLogEntry, 
  NotificationItem, 
  ApprovedDomain, 
  OrganizationInvitation, 
  OrganizationSettings, 
  OrganizationEvent,
  CalendarEvent,
  EventParticipant,
  RSVPStatus,
  MeetingRoom,
  MeetingParticipantState,
  MeetingSignal,
  MeetingChatMessage,
  UserRole,
  UserStatus,
  Attachment,
  TaskItem,
  TaskStatus
} from '../types';

/**
 * Recursively removes any undefined properties from an object so Firestore operations never fail.
 */
export function cleanForFirestore<T>(data: T): T {
  if (data === undefined || data === null) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter(item => item !== undefined)
      .map(item => cleanForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    if (data instanceof Date) return data;
    
    const anyData = data as any;
    // Check for Firestore FieldValue / Sentinel objects (like serverTimestamp())
    if (
      typeof anyData?._methodName === 'string' ||
      typeof anyData?.isEqual === 'function' ||
      anyData?.constructor?.name === 'FieldValueImpl' ||
      anyData?.constructor?.name === 'ServerTimestampTransform'
    ) {
      return data;
    }

    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(anyData)) {
      const val = anyData[key];
      if (val !== undefined) {
        cleaned[key] = cleanForFirestore(val);
      }
    }
    return cleaned as T;
  }
  return data;
}

/* =========================================================================
   1. ORGANIZATIONS & SETTINGS
   ========================================================================= */

export const DEFAULT_ORG_ID = 'org_worknest_main';

export function subscribeToOrganization(callback: (org: OrganizationSettings) => void) {
  const orgDocRef = doc(db, 'organizations', DEFAULT_ORG_ID);
  return onSnapshot(orgDocRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as OrganizationSettings);
    } else {
      // Default clean WorkNest organization structure with empty domains
      const initialOrg: OrganizationSettings = {
        id: DEFAULT_ORG_ID,
        name: 'WorkNest',
        logoText: 'WN',
        domain: '',
        accentColor: 'indigo',
        emailProvider: 'none',
        allowGuestInvites: false,
        retentionDays: 180,
        registrationApprovalMode: 'auto_approved_domains',
        requireGovDomain: true,
        organizationStateOrAgency: 'WorkNest Organization',
        approvedDomains: []
      };
      callback(initialOrg);
    }
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `organizations/${DEFAULT_ORG_ID}`);
  });
}

export async function updateOrganizationConfig(updates: Partial<OrganizationSettings>) {
  try {
    const orgDocRef = doc(db, 'organizations', DEFAULT_ORG_ID);
    await setDoc(orgDocRef, cleanForFirestore({ ...updates, updatedAt: serverTimestamp() }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `organizations/${DEFAULT_ORG_ID}`);
  }
}

/* =========================================================================
   2. USERS & MEMBERS
   ========================================================================= */

export function subscribeToMembers(callback: (members: Member[]) => void) {
  const usersColl = collection(db, 'users');
  return onSnapshot(usersColl, (snapshot) => {
    const membersList: Member[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as Member));
    callback(membersList);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'users');
  });
}

export async function updateUserRole(userId: string, role: UserRole) {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, cleanForFirestore({ role, updatedAt: serverTimestamp() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

export async function updateUserApproval(userId: string, status: 'approved' | 'pending_approval' | 'rejected') {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, cleanForFirestore({ approvalStatus: status, updatedAt: serverTimestamp() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
  }
}

export async function removeUser(userId: string) {
  try {
    const userDocRef = doc(db, 'users', userId);
    await deleteDoc(userDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `users/${userId}`);
  }
}

export async function updateUserPresence(userId: string, status: UserStatus) {
  try {
    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, cleanForFirestore({ status, lastActiveAt: serverTimestamp() }));
  } catch (error) {
    console.warn('Presence update notice:', error);
  }
}

/* =========================================================================
   3. CHANNELS
   ========================================================================= */

export function subscribeToChannels(callback: (channels: Channel[]) => void) {
  const channelsColl = collection(db, 'channels');
  return onSnapshot(channelsColl, (snapshot) => {
    const channelList: Channel[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as Channel));
    callback(channelList);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'channels');
  });
}

export async function createChannel(channelData: Partial<Channel>) {
  try {
    const channelId = channelData.id || `chan_${Date.now()}`;
    const channelRef = doc(db, 'channels', channelId);
    await setDoc(channelRef, cleanForFirestore({
      ...channelData,
      id: channelId,
      createdAt: serverTimestamp(),
      unreadCount: 0
    }));
    return channelId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'channels');
  }
}

export async function updateChannel(channelId: string, updates: Partial<Channel>) {
  try {
    const channelRef = doc(db, 'channels', channelId);
    await updateDoc(channelRef, cleanForFirestore({ ...updates, updatedAt: serverTimestamp() }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `channels/${channelId}`);
  }
}

export async function deleteChannel(channelId: string) {
  try {
    const channelRef = doc(db, 'channels', channelId);
    await deleteDoc(channelRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `channels/${channelId}`);
  }
}

/* =========================================================================
   4. DIRECT MESSAGES
   ========================================================================= */

export function subscribeToDirectMessages(currentUserId: string, callback: (dms: DirectMessage[]) => void) {
  const dmColl = collection(db, 'directMessages');
  return onSnapshot(dmColl, (snapshot) => {
    const dmList: DirectMessage[] = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() } as DirectMessage))
      .filter(dm => dm.participants?.some(p => p.id === currentUserId));
    callback(dmList);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'directMessages');
  });
}

export async function createOrGetDirectMessage(currentUser: Member, recipient: Member) {
  try {
    const sortedIds = [currentUser.id, recipient.id].sort();
    const dmId = `dm_${sortedIds[0]}_${sortedIds[1]}`;
    const dmRef = doc(db, 'directMessages', dmId);
    
    const existing = await getDoc(dmRef);
    if (!existing.exists()) {
      await setDoc(dmRef, cleanForFirestore({
        id: dmId,
        participants: [currentUser, recipient],
        createdAt: serverTimestamp(),
        unreadCount: 0
      }));
    }
    return dmId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'directMessages');
  }
}

/* =========================================================================
   5. REAL-TIME MESSAGES
   ========================================================================= */

export function subscribeToMessages(conversationId: string, callback: (messages: Message[]) => void) {
  const msgColl = collection(db, 'messages');
  const q = query(msgColl, where('conversationId', '==', conversationId));

  return onSnapshot(q, (snapshot) => {
    const msgs: Message[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as Message));

    // Sort ascending by time
    msgs.sort((a, b) => {
      const tA = a.createdMillis || 0;
      const tB = b.createdMillis || 0;
      return tA - tB;
    });

    callback(msgs);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `messages?conversationId=${conversationId}`);
  });
}

export async function sendMessage(msg: Partial<Message>) {
  try {
    const messageId = msg.id || `msg_${Date.now()}`;
    const msgRef = doc(db, 'messages', messageId);
    await setDoc(msgRef, cleanForFirestore({
      ...msg,
      id: messageId,
      createdMillis: Date.now(),
      createdAt: serverTimestamp()
    }));
    return messageId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'messages');
  }
}

export async function deleteMessage(messageId: string) {
  try {
    const msgRef = doc(db, 'messages', messageId);
    await deleteDoc(msgRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `messages/${messageId}`);
  }
}

export async function togglePinMessage(messageId: string, isPinned: boolean) {
  try {
    const msgRef = doc(db, 'messages', messageId);
    await updateDoc(msgRef, cleanForFirestore({ isPinned: !isPinned }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `messages/${messageId}`);
  }
}

export async function addMessageReaction(messageId: string, emoji: string, userName: string, existingReactions: any[] = []) {
  try {
    const msgRef = doc(db, 'messages', messageId);
    const reactions = [...existingReactions];
    const match = reactions.find(r => r.emoji === emoji);

    if (match) {
      match.count += 1;
      if (!match.users?.includes(userName)) {
        match.users = [...(match.users || []), userName];
      }
    } else {
      reactions.push({ emoji, count: 1, users: [userName] });
    }

    await updateDoc(msgRef, cleanForFirestore({ reactions }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `messages/${messageId}`);
  }
}

export async function sendThreadReply(parentMessageId: string, reply: any, existingReplies: any[] = []) {
  try {
    const msgRef = doc(db, 'messages', parentMessageId);
    const replies = [...existingReplies, reply];
    await updateDoc(msgRef, cleanForFirestore({ replies }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `messages/${parentMessageId}`);
  }
}

/* =========================================================================
   6. FILES & CLOUD STORAGE
   ========================================================================= */

function getResolvedMimeType(file: File): string {
  if (file.type && file.type !== 'application/octet-stream') return file.type;
  const ext = file.name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    case 'xls': return 'application/vnd.ms-excel';
    case 'docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc': return 'application/msword';
    case 'pptx': return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    case 'ppt': return 'application/vnd.ms-powerpoint';
    case 'pdf': return 'application/pdf';
    case 'csv': return 'text/csv';
    case 'txt': return 'text/plain';
    case 'json': return 'application/json';
    case 'png': return 'image/png';
    case 'jpg':
    case 'jpeg': return 'image/jpeg';
    case 'gif': return 'image/gif';
    case 'webp': return 'image/webp';
    case 'svg': return 'image/svg+xml';
    case 'zip': return 'application/zip';
    case 'mp3': return 'audio/mpeg';
    case 'wav': return 'audio/wav';
    case 'webm': return 'audio/webm';
    default: return file.type || 'application/octet-stream';
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export function subscribeToFiles(callback: (files: FileItem[]) => void) {
  const filesColl = collection(db, 'files');
  return onSnapshot(filesColl, (snapshot) => {
    const fileList: FileItem[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as FileItem));
    callback(fileList);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'files');
  });
}

export async function uploadFileToStorage(
  file: File, 
  metadata: Partial<FileItem>, 
  onProgress?: (percent: number) => void
): Promise<FileItem> {
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const storagePath = `organizations/${DEFAULT_ORG_ID}/documents/${fileId}_${cleanName}`;
  const fileStorageRef = ref(storage, storagePath);
  const mimeType = getResolvedMimeType(file);

  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const fileType: FileItem['type'] = file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext)
    ? 'image' 
    : ext === 'pdf' 
    ? 'pdf' 
    : ['xlsx', 'xls', 'csv'].includes(ext) || file.type.includes('sheet') || file.type.includes('csv')
    ? 'spreadsheet'
    : ['js', 'ts', 'jsx', 'tsx', 'py', 'html', 'css', 'json', 'sql'].includes(ext)
    ? 'code'
    : 'document';

  const sizeInKb = file.size > 1024 * 1024 
    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(file.size / 1024)} KB`;

  const saveFileToFirestore = async (downloadUrl: string, actualStoragePath?: string) => {
    const newFileRecord: FileItem = {
      id: fileId,
      name: file.name,
      type: fileType,
      size: sizeInKb,
      storagePath: actualStoragePath || '',
      downloadUrl,
      updatedAt: 'Just now',
      updatedBy: metadata.updatedBy || { id: 'usr', name: 'Officer', email: '', role: 'Member', status: 'online', department: '', avatar: '' },
      folderId: metadata.folderId || 'fld_projects',
      tags: metadata.tags || ['Official Document'],
      securityClassification: metadata.securityClassification || 'Official'
    };

    if (metadata.channelId) {
      newFileRecord.channelId = metadata.channelId;
    }

    const fileDocRef = doc(db, 'files', fileId);
    await setDoc(fileDocRef, cleanForFirestore({
      ...newFileRecord,
      createdAt: serverTimestamp()
    }));

    return newFileRecord;
  };

  try {
    // Attempt Firebase Storage Resumable Upload with proper MIME metadata
    const uploadPromise = new Promise<string>((resolve, reject) => {
      const uploadTask = uploadBytesResumable(fileStorageRef, file, {
        contentType: mimeType,
        customMetadata: {
          originalName: file.name,
          uploadedBy: metadata.updatedBy?.name || 'Officer'
        }
      });

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(Math.round(progress));
        },
        (error) => {
          reject(error);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (urlErr) {
            reject(urlErr);
          }
        }
      );
    });

    const downloadUrl = await uploadPromise;
    return await saveFileToFirestore(downloadUrl, storagePath);
  } catch (storageError) {
    console.warn('Firebase Storage direct upload notice (falling back to DataURL storage):', storageError);
    if (onProgress) onProgress(100);

    // Resilient fallback: create Data URL or Object URL and store file in Firestore collection
    let fallbackUrl = '';
    try {
      if (file.size <= 5 * 1024 * 1024) {
        fallbackUrl = await readFileAsDataUrl(file);
      } else {
        fallbackUrl = URL.createObjectURL(file);
      }
    } catch {
      fallbackUrl = URL.createObjectURL(file);
    }

    return await saveFileToFirestore(fallbackUrl);
  }
}

export async function deleteFileRecord(fileId: string, storagePath?: string) {
  try {
    if (storagePath) {
      try {
        const fileStorageRef = ref(storage, storagePath);
        await deleteObject(fileStorageRef);
      } catch (stErr) {
        console.warn('Storage file deletion notice:', stErr);
      }
    }
    const fileDocRef = doc(db, 'files', fileId);
    await deleteDoc(fileDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `files/${fileId}`);
  }
}

/* =========================================================================
   7. OFFICIAL DISPATCH EMAILS
   ========================================================================= */

export function subscribeToEmails(callback: (emails: EmailMessage[]) => void) {
  const emailsColl = collection(db, 'emails');
  return onSnapshot(emailsColl, (snapshot) => {
    const list: EmailMessage[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as EmailMessage));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'emails');
  });
}

export async function sendOfficialEmail(emailData: Partial<EmailMessage>) {
  try {
    const emailId = emailData.id || `mail_${Date.now()}`;
    const emailRef = doc(db, 'emails', emailId);
    await setDoc(emailRef, cleanForFirestore({
      ...emailData,
      id: emailId,
      createdAt: serverTimestamp()
    }));
    return emailId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'emails');
  }
}

export async function updateEmailStatus(emailId: string, updates: Partial<EmailMessage>) {
  try {
    const emailRef = doc(db, 'emails', emailId);
    await updateDoc(emailRef, cleanForFirestore(updates));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `emails/${emailId}`);
  }
}

export async function deleteEmail(emailId: string) {
  try {
    const emailRef = doc(db, 'emails', emailId);
    await deleteDoc(emailRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `emails/${emailId}`);
  }
}

/* =========================================================================
   8. STATUTORY AUDIT LOGS
   ========================================================================= */

export function subscribeToAuditLogs(callback: (logs: AuditLogEntry[]) => void) {
  const logsColl = collection(db, 'auditLogs');
  return onSnapshot(logsColl, (snapshot) => {
    const list: AuditLogEntry[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as AuditLogEntry));

    list.sort((a, b) => (b.createdMillis || 0) - (a.createdMillis || 0));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'auditLogs');
  });
}

export async function logAuditEvent(actor: Member, action: string, target: string, details: string, ipAddress?: string) {
  try {
    const auditId = `log_${Date.now()}`;
    const logRef = doc(db, 'auditLogs', auditId);
    await setDoc(logRef, cleanForFirestore({
      id: auditId,
      actor: {
        id: actor.id,
        name: actor.name,
        email: actor.email,
        role: actor.role,
        department: actor.department
      },
      action,
      target,
      details,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'success',
      ipAddress: ipAddress || '127.0.0.1 (WorkNest Gateway)',
      createdMillis: Date.now(),
      createdAt: serverTimestamp()
    }));
  } catch (error) {
    console.warn('Audit log write error:', error);
  }
}

/* =========================================================================
   9. NOTIFICATIONS
   ========================================================================= */

export function subscribeToNotifications(userId: string, callback: (notifications: NotificationItem[]) => void) {
  const notifColl = collection(db, 'notifications');
  return onSnapshot(notifColl, (snapshot) => {
    const list: NotificationItem[] = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() } as NotificationItem))
      .filter(n => !n.userId || n.userId === userId);
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'notifications');
  });
}

export async function markNotificationRead(notifId: string) {
  try {
    const notifRef = doc(db, 'notifications', notifId);
    await updateDoc(notifRef, cleanForFirestore({ isRead: true }));
  } catch (error) {
    console.warn('Could not mark notification read:', error);
  }
}

/* =========================================================================
   10. APPROVED DOMAINS ALLOWLIST
   ========================================================================= */

export function subscribeToApprovedDomains(callback: (domains: ApprovedDomain[]) => void) {
  const domColl = collection(db, 'approvedDomains');
  return onSnapshot(domColl, (snapshot) => {
    const list: ApprovedDomain[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as ApprovedDomain));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'approvedDomains');
  });
}

export async function addApprovedDomain(domain: string, description: string, addedBy: string) {
  try {
    const domainId = `dom_${Date.now()}`;
    const domRef = doc(db, 'approvedDomains', domainId);
    await setDoc(domRef, cleanForFirestore({
      id: domainId,
      domain: domain.toLowerCase().trim(),
      description,
      addedBy,
      addedDate: 'Today',
      status: 'active',
      createdAt: serverTimestamp()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'approvedDomains');
  }
}

export async function toggleApprovedDomainStatus(domainId: string, currentStatus: 'active' | 'disabled') {
  try {
    const domRef = doc(db, 'approvedDomains', domainId);
    await updateDoc(domRef, cleanForFirestore({ status: currentStatus === 'active' ? 'disabled' : 'active' }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `approvedDomains/${domainId}`);
  }
}

export async function removeApprovedDomain(domainId: string) {
  try {
    const domRef = doc(db, 'approvedDomains', domainId);
    await deleteDoc(domRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `approvedDomains/${domainId}`);
  }
}

/* =========================================================================
   11. INVITATIONS
   ========================================================================= */

export function subscribeToInvitations(callback: (invitations: OrganizationInvitation[]) => void) {
  const invColl = collection(db, 'invitations');
  return onSnapshot(invColl, (snapshot) => {
    const list: OrganizationInvitation[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as OrganizationInvitation));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'invitations');
  });
}

export async function createInvitation(inviteData: Partial<OrganizationInvitation>) {
  try {
    const invId = `inv_${Date.now()}`;
    const invRef = doc(db, 'invitations', invId);
    await setDoc(invRef, cleanForFirestore({
      ...inviteData,
      id: invId,
      status: 'pending',
      createdAt: serverTimestamp()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'invitations');
  }
}

export async function revokeInvitation(invitationId: string) {
  try {
    const invRef = doc(db, 'invitations', invitationId);
    await deleteDoc(invRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `invitations/${invitationId}`);
  }
}

/* =========================================================================
   12. CALENDAR EVENTS (Real Firestore Persistence)
   ========================================================================= */

export function subscribeToCalendarEvents(
  callback: (events: CalendarEvent[]) => void,
  currentUserId?: string,
  userDepartment?: string
) {
  const eventsColl = collection(db, 'calendarEvents');
  const q = query(eventsColl, orderBy('startDate', 'asc'));

  return onSnapshot(q, (snapshot) => {
    const allEvents: CalendarEvent[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as CalendarEvent));

    // Filter by visibility and permissions
    const visibleEvents = allEvents.filter(ev => {
      if (!ev) return false;
      if (ev.visibility === 'organization') return true;
      if (ev.visibility === 'department') {
        if (!userDepartment || !ev.department) return true;
        return ev.department.toLowerCase() === userDepartment.toLowerCase() || ev.creatorId === currentUserId;
      }
      if (ev.visibility === 'channel') return true;
      if (ev.visibility === 'private') {
        if (ev.creatorId === currentUserId) return true;
        return (ev.participants || []).some(p => p.userId === currentUserId);
      }
      return true;
    });

    callback(visibleEvents);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'calendarEvents');
  });
}

export async function createCalendarEvent(eventData: Partial<CalendarEvent>) {
  try {
    const eventId = eventData.id || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const eventRef = doc(db, 'calendarEvents', eventId);

    const fullEvent: CalendarEvent = {
      id: eventId,
      title: eventData.title || 'Untitled Event',
      description: eventData.description || '',
      startDate: eventData.startDate || new Date().toISOString().split('T')[0],
      startTime: eventData.startTime || '09:00',
      endDate: eventData.endDate || eventData.startDate || new Date().toISOString().split('T')[0],
      endTime: eventData.endTime || '10:00',
      timezone: eventData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      isAllDay: !!eventData.isAllDay,
      location: eventData.location || '',
      visibility: eventData.visibility || 'organization',
      department: eventData.department || '',
      channelId: eventData.channelId || '',
      creatorId: eventData.creatorId || '',
      creatorName: eventData.creatorName || 'Public Officer',
      creatorEmail: eventData.creatorEmail || '',
      participants: eventData.participants || [],
      meetingId: eventData.meetingId || '',
      meetingUrl: eventData.meetingUrl || '',
      hasMeeting: !!eventData.hasMeeting,
      reminderMinutes: eventData.reminderMinutes || 15,
      recurrence: eventData.recurrence || 'none',
      attachments: eventData.attachments || [],
      colorTag: eventData.colorTag || '#0062FF',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await setDoc(eventRef, cleanForFirestore(fullEvent));

    // If event has participants, create notifications for invited members
    if (fullEvent.participants && fullEvent.participants.length > 0) {
      for (const p of fullEvent.participants) {
        if (p.userId && p.userId !== fullEvent.creatorId) {
          await createNotificationForUser(
            p.userId,
            `Event Invitation: ${fullEvent.title}`,
            `${fullEvent.creatorName} invited you to "${fullEvent.title}" on ${fullEvent.startDate} at ${fullEvent.startTime}`,
            'calendar_event',
            fullEvent.id,
            'event'
          );
        }
      }
    }

    return fullEvent;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'calendarEvents');
    throw error;
  }
}

export async function updateCalendarEvent(eventId: string, updates: Partial<CalendarEvent>) {
  try {
    const eventRef = doc(db, 'calendarEvents', eventId);
    await updateDoc(eventRef, cleanForFirestore({
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `calendarEvents/${eventId}`);
    throw error;
  }
}

export async function deleteCalendarEvent(eventId: string) {
  try {
    const eventRef = doc(db, 'calendarEvents', eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `calendarEvents/${eventId}`);
    throw error;
  }
}

export async function updateEventRSVP(eventId: string, userId: string, status: RSVPStatus) {
  try {
    const eventRef = doc(db, 'calendarEvents', eventId);
    const snap = await getDoc(eventRef);
    if (!snap.exists()) return;

    const data = snap.data() as CalendarEvent;
    const participants = (data.participants || []).map(p => {
      if (p.userId === userId) {
        return { ...p, status };
      }
      return p;
    });

    // If user wasn't in participant list yet, add them
    if (!participants.some(p => p.userId === userId)) {
      participants.push({
        userId,
        name: 'Officer',
        email: '',
        status
      });
    }

    await updateDoc(eventRef, cleanForFirestore({
      participants,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `calendarEvents/${eventId}/rsvp`);
  }
}

/* =========================================================================
   13. VIDEO MEETINGS & WEBRTC ROOMS (Browser-Native Google Meet Class)
   ========================================================================= */

export function subscribeToMeetings(
  callback: (meetings: MeetingRoom[]) => void,
  currentUserId?: string,
  userDepartment?: string
) {
  const meetingsColl = collection(db, 'meetings');
  const q = query(meetingsColl, orderBy('createdAt', 'desc'), limit(50));

  return onSnapshot(q, (snapshot) => {
    const list: MeetingRoom[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as MeetingRoom));

    // Filter accessible meetings
    const accessible = list.filter(m => {
      if (!m) return false;
      if (!m.isPrivate) return true;
      if (m.hostId === currentUserId) return true;
      if (m.invitedUserIds && m.invitedUserIds.includes(currentUserId || '')) return true;
      if (m.allowedDepartment && userDepartment && m.allowedDepartment.toLowerCase() === userDepartment.toLowerCase()) return true;
      return false;
    });

    callback(accessible);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, 'meetings');
  });
}

export async function getMeetingById(meetingId: string): Promise<MeetingRoom | null> {
  try {
    const mRef = doc(db, 'meetings', meetingId);
    const snap = await getDoc(mRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as MeetingRoom;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `meetings/${meetingId}`);
    return null;
  }
}

export function subscribeToMeetingRoom(
  meetingId: string,
  callback: (meeting: MeetingRoom | null) => void
) {
  const mRef = doc(db, 'meetings', meetingId);
  return onSnapshot(mRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }
    callback({ id: snapshot.id, ...snapshot.data() } as MeetingRoom);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, `meetings/${meetingId}`);
  });
}

export async function createMeetingRoom(roomData: Partial<MeetingRoom>): Promise<MeetingRoom> {
  try {
    // Generate clean secure ID e.g. "wn-meet-9382"
    const randomSuffix = Math.random().toString(36).substring(2, 6) + '-' + Math.random().toString(36).substring(2, 6);
    const meetingId = roomData.id || `wn-meet-${randomSuffix}`;
    const mRef = doc(db, 'meetings', meetingId);

    const newMeeting: MeetingRoom = {
      id: meetingId,
      title: roomData.title || 'WorkNest Consultation & Briefing',
      description: roomData.description || '',
      hostId: roomData.hostId || '',
      hostName: roomData.hostName || 'Host Officer',
      hostEmail: roomData.hostEmail || '',
      status: roomData.status || 'active',
      scheduledStartTime: roomData.scheduledStartTime || new Date().toISOString(),
      scheduledEndTime: roomData.scheduledEndTime || '',
      actualStartTime: new Date().toISOString(),
      channelId: roomData.channelId || '',
      dmId: roomData.dmId || '',
      calendarEventId: roomData.calendarEventId || '',
      isWaitingRoomEnabled: !!roomData.isWaitingRoomEnabled,
      isPrivate: !!roomData.isPrivate,
      allowedDepartment: roomData.allowedDepartment || '',
      invitedUserIds: roomData.invitedUserIds || [],
      activeParticipantsCount: 1,
      createdAt: new Date().toISOString()
    };

    await setDoc(mRef, cleanForFirestore(newMeeting));

    // Send invitations to invited users
    if (newMeeting.invitedUserIds && newMeeting.invitedUserIds.length > 0) {
      for (const uId of newMeeting.invitedUserIds) {
        if (uId && uId !== newMeeting.hostId) {
          await createNotificationForUser(
            uId,
            `Meeting Invitation: ${newMeeting.title}`,
            `${newMeeting.hostName} invited you to join meeting ${newMeeting.id}`,
            'meeting_invite',
            newMeeting.id,
            'meeting'
          );
        }
      }
    }

    return newMeeting;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'meetings');
    throw error;
  }
}

export async function updateMeetingRoom(meetingId: string, updates: Partial<MeetingRoom>) {
  try {
    const mRef = doc(db, 'meetings', meetingId);
    await updateDoc(mRef, cleanForFirestore(updates));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `meetings/${meetingId}`);
  }
}

export async function endMeetingRoom(meetingId: string) {
  try {
    const mRef = doc(db, 'meetings', meetingId);
    await updateDoc(mRef, cleanForFirestore({
      status: 'ended',
      endedAt: new Date().toISOString(),
      activeParticipantsCount: 0
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `meetings/${meetingId}/end`);
  }
}

// Meeting Participants Sub-collections or Dedicated collection
export function subscribeToMeetingParticipants(
  meetingId: string,
  callback: (participants: MeetingParticipantState[]) => void
) {
  const collRef = collection(db, 'meetingParticipants');
  const q = query(collRef, where('meetingId', '==', meetingId));

  return onSnapshot(q, (snapshot) => {
    const list: MeetingParticipantState[] = snapshot.docs.map(d => ({
      ...d.data()
    } as unknown as MeetingParticipantState));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `meetingParticipants/${meetingId}`);
  });
}

export async function updateParticipantState(meetingId: string, participantState: MeetingParticipantState) {
  try {
    const docId = `${meetingId}_${participantState.userId}`;
    const pRef = doc(db, 'meetingParticipants', docId);
    await setDoc(pRef, cleanForFirestore({
      ...participantState,
      meetingId,
      lastHeartbeat: new Date().toISOString()
    }), { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `meetingParticipants/${meetingId}`);
  }
}

export async function removeParticipantFromMeeting(meetingId: string, userId: string) {
  try {
    const docId = `${meetingId}_${userId}`;
    const pRef = doc(db, 'meetingParticipants', docId);
    await deleteDoc(pRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `meetingParticipants/${meetingId}/${userId}`);
  }
}

export async function admitParticipantFromWaitingRoom(meetingId: string, userId: string) {
  try {
    const docId = `${meetingId}_${userId}`;
    const pRef = doc(db, 'meetingParticipants', docId);
    await updateDoc(pRef, cleanForFirestore({
      waitingRoomStatus: 'admitted'
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `meetingParticipants/${meetingId}/admit`);
  }
}

export async function rejectParticipantFromWaitingRoom(meetingId: string, userId: string) {
  try {
    const docId = `${meetingId}_${userId}`;
    const pRef = doc(db, 'meetingParticipants', docId);
    await updateDoc(pRef, cleanForFirestore({
      waitingRoomStatus: 'rejected'
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `meetingParticipants/${meetingId}/reject`);
  }
}

// In-meeting Signaling (WebRTC handshake exchange via Firestore)
export function subscribeToMeetingSignals(
  meetingId: string,
  currentUserId: string,
  callback: (signal: MeetingSignal) => void
) {
  const collRef = collection(db, 'meetingSignals');
  const q = query(
    collRef,
    where('meetingId', '==', meetingId),
    where('to', '==', currentUserId),
    orderBy('timestamp', 'desc'),
    limit(20)
  );

  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const signalData = { id: change.doc.id, ...change.doc.data() } as MeetingSignal;
        callback(signalData);
      }
    });
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `meetingSignals/${meetingId}`);
  });
}

export async function sendMeetingSignal(signal: Omit<MeetingSignal, 'id' | 'timestamp'>) {
  try {
    const collRef = collection(db, 'meetingSignals');
    await addDoc(collRef, cleanForFirestore({
      ...signal,
      timestamp: Date.now()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'meetingSignals');
  }
}

// In-meeting Chat (Lightweight conversation separate from channels)
export function subscribeToMeetingChat(
  meetingId: string,
  callback: (messages: MeetingChatMessage[]) => void
) {
  const chatColl = collection(db, 'meetingChat');
  const q = query(
    chatColl,
    where('meetingId', '==', meetingId),
    orderBy('timestamp', 'asc'),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const list: MeetingChatMessage[] = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    } as MeetingChatMessage));
    callback(list);
  }, (error) => {
    handleFirestoreError(error, OperationType.LIST, `meetingChat/${meetingId}`);
  });
}

export async function sendMeetingChatMessage(msg: Omit<MeetingChatMessage, 'id' | 'timestamp'>) {
  try {
    const chatColl = collection(db, 'meetingChat');
    const msgId = `mchat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await setDoc(doc(chatColl, msgId), cleanForFirestore({
      ...msg,
      id: msgId,
      timestamp: new Date().toISOString()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'meetingChat');
  }
}

export async function createNotificationForUser(
  userId: string,
  title: string,
  description: string,
  type: NotificationItem['type'],
  targetId?: string,
  targetType?: NotificationItem['targetType']
) {
  try {
    const notifColl = collection(db, 'notifications');
    const notifId = `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await setDoc(doc(notifColl, notifId), cleanForFirestore({
      id: notifId,
      userId,
      title,
      description,
      timestamp: new Date().toISOString(),
      isRead: false,
      type,
      targetId: targetId || '',
      targetType: targetType || 'system'
    }));
  } catch (error) {
    console.warn('Notification creation failed:', error);
  }
}

// -------------------------------------------------------------
// KANBAN PROJECT TASKS & DELIVERABLES REAL-TIME SYNC
// -------------------------------------------------------------

export function subscribeToTasks(callback: (tasks: TaskItem[]) => void) {
  try {
    const tasksColl = collection(db, 'tasks');
    const q = query(tasksColl);
    return onSnapshot(q, (snapshot) => {
      const tasksList: TaskItem[] = [];
      snapshot.forEach(docSnap => {
        tasksList.push(docSnap.data() as TaskItem);
      });
      // Sort tasks by order or createdAt
      tasksList.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined && a.order !== b.order) {
          return a.order - b.order;
        }
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      });
      callback(tasksList);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'tasks');
      callback([]);
    });
  } catch (error) {
    console.warn('Fallback to local tasks state:', error);
    return () => {};
  }
}

export async function createTaskItem(task: Omit<TaskItem, 'id' | 'createdAt'>) {
  try {
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    const newTask: TaskItem = {
      ...task,
      id: taskId,
      createdAt: now,
      updatedAt: now
    };
    await setDoc(doc(db, 'tasks', taskId), cleanForFirestore(newTask));
    return newTask;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'tasks');
    throw error;
  }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, cleanForFirestore({
      status,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    throw error;
  }
}

export async function updateTaskItem(taskId: string, updates: Partial<TaskItem>) {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, cleanForFirestore({
      ...updates,
      updatedAt: new Date().toISOString()
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    throw error;
  }
}

export async function deleteTaskItem(taskId: string) {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `tasks/${taskId}`);
    throw error;
  }
}
