import React, { useState } from 'react';
import { 
  Folder, 
  FileText, 
  Image as ImageIcon, 
  Table, 
  FileCode, 
  Download, 
  Eye, 
  Search, 
  Grid, 
  List, 
  Upload, 
  Trash2, 
  MoreVertical, 
  Check, 
  X,
  Plus,
  FileCheck,
  ShieldCheck,
  Building2,
  ExternalLink,
  Loader2,
  FolderKanban,
  FolderCheck
} from 'lucide-react';
import { FileItem, FileFolder, Member } from '../../types';
import { uploadFileToStorage } from '../../lib/firestoreService';
import { CloudDriveFile } from '../../lib/pluginsData';

interface FilesViewProps {
  files: FileItem[];
  folders: FileFolder[];
  activeFilter: string;
  currentUser: Member;
  onUploadFile: (file: FileItem) => void;
  onDeleteFile: (fileId: string, storagePath?: string) => void;
  onSelectFilePreview: (file: FileItem) => void;
}

export const FilesView: React.FC<FilesViewProps> = ({
  files = [],
  folders = [],
  activeFilter,
  currentUser,
  onUploadFile,
  onDeleteFile,
  onSelectFilePreview
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const safeFiles = Array.isArray(files) ? files : [];

  const filteredFiles = safeFiles.filter(f => {
    if (!f) return false;
    if (activeFilter === 'all') return true;
    if (activeFilter === 'shared') return f.isSharedWithMe || f.updatedBy?.id !== currentUser?.id;
    if (activeFilter === 'conversation') return f.channelId !== undefined;
    return f.folderId === activeFilter;
  }).filter(f => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (f.name || '').toLowerCase().includes(q) || (f.tags || []).some(t => (t || '').toLowerCase().includes(q));
  });

  const getFileIcon = (type: FileItem['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-5 h-5 text-amber-500" />;
      case 'spreadsheet':
        return <Table className="w-5 h-5 text-emerald-600" />;
      case 'code':
        return <FileCode className="w-5 h-5 text-blue-500" />;
      default:
        return <FileCheck className="w-5 h-5 text-[#0062FF] dark:text-blue-400" />;
    }
  };

  const handleUploadFiles = async (fileList: FileList | File[]) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      const filesArray = Array.from(fileList);
      for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        
        // 1. File size validation (< 25MB)
        if (file.size > 25 * 1024 * 1024) {
          throw new Error(`File ${file.name} exceeds 25MB limit. Please upload a smaller file.`);
        }

        const uploadedItem = await uploadFileToStorage(
          file, 
          {
            updatedBy: currentUser,
            folderId: activeFilter.startsWith('fld_') ? activeFilter : 'fld_projects',
            tags: ['Statutory Filing', 'Official Document'],
            securityClassification: 'Official'
          },
          (progress) => {
            setUploadProgress(progress);
          }
        );
        onUploadFile(uploadedItem);
      }
    } catch (err: any) {
      console.error('Upload error:', err);
      setUploadError(err?.message || 'File upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleNativeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleUploadFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden bg-white dark:bg-[#0F172A] select-none text-stone-800 dark:text-stone-100">
      
      {/* Top Header */}
      <div className="h-14 px-4 sm:px-6 border-b border-stone-200 dark:border-stone-800/80 flex items-center justify-between shrink-0 bg-white dark:bg-[#0F172A]">
        <div className="flex items-center space-x-3 flex-1 max-w-xs sm:max-w-sm">
          <div className="w-full flex items-center px-2.5 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900/60 text-xs">
            <Search className="w-3.5 h-3.5 text-stone-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search official gazettes and files..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center rounded-lg border border-stone-200 dark:border-stone-800 p-0.5 bg-stone-50 dark:bg-stone-900">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-400'}`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-xs' : 'text-stone-400'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          <label className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 rounded-xl bg-[#0062FF] hover:bg-[#0048C6] active:bg-[#0038A8] text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors shrink-0 ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
            {isUploading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Uploading {uploadProgress}%</span>
                <span className="sm:hidden">{uploadProgress}%</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload Document</span>
                <span className="sm:hidden">Upload</span>
              </>
            )}
            <input type="file" multiple onChange={handleNativeUpload} className="hidden" disabled={isUploading} />
          </label>
        </div>
      </div>

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="px-4 py-2 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-800 flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
          <span>{uploadError}</span>
          <button onClick={() => setUploadError(null)} className="p-1 hover:text-rose-900">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Main Files Area */}
      <div 
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 space-y-6 scrollbar-thin ${
          isDragging ? 'bg-blue-50/40 dark:bg-blue-950/20 border-2 border-dashed border-[#0062FF]' : ''
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-stone-900 dark:text-stone-100">
              {activeFilter === 'all' ? 'All Official Gazettes & Documents' : folders.find(f => f.id === activeFilter)?.name || 'Document Vault'}
            </h2>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Find and share the files your team works with.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Google Drive & OneDrive Connected</span>
            </span>
          </div>
        </div>

        {filteredFiles.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 text-stone-400 flex items-center justify-center mx-auto">
              <FolderKanban className="w-6 h-6 text-stone-400" />
            </div>
            <div className="text-sm font-semibold text-stone-700 dark:text-stone-300">
              No files available yet
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto">
              Find and share the files your team works with. Drag and drop statutory memos or click Upload Document above.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                onClick={() => onSelectFilePreview(file)}
                className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#111726] hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all cursor-pointer group shadow-2xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-stone-800">
                    {getFileIcon(file.type)}
                  </div>
                  <div className="flex items-center space-x-1">
                    {file.downloadUrl && (
                      <a
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        download={file.name}
                        className="p-1 rounded text-stone-300 hover:text-[#0062FF] opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Download Document"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    )}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        onDeleteFile(file.id, file.storagePath);
                      }}
                      className="p-1 rounded text-stone-300 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete File"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate" title={file.name}>
                    {file.name}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    {file.size} • Updated {file.updatedAt}
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400">
                  <span className="truncate">By {file.updatedBy.name}</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">Verified</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-stone-200 dark:border-stone-800 overflow-x-auto bg-white dark:bg-[#111726]">
            <table className="w-full text-left text-xs min-w-[550px]">
              <thead className="bg-stone-50 dark:bg-stone-900/60 border-b border-stone-200 dark:border-stone-800 text-stone-500 text-[11px] font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Document Name</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Signatory / Signer</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {filteredFiles.map(file => (
                  <tr 
                    key={file.id} 
                    onClick={() => onSelectFilePreview(file)}
                    className="hover:bg-stone-50/50 dark:hover:bg-stone-900/40 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2.5">
                        {getFileIcon(file.type)}
                        <span className="font-semibold text-stone-900 dark:text-stone-100 truncate max-w-xs">{file.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-stone-500 font-mono text-[11px]">{file.size}</td>
                    <td className="px-4 py-3 text-stone-600 dark:text-stone-300">{file.updatedBy.name}</td>
                    <td className="px-4 py-3 text-stone-400 text-[11px]">{file.updatedAt}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-1.5" onClick={e => e.stopPropagation()}>
                        {file.downloadUrl && (
                          <a
                            href={file.downloadUrl}
                            target="_blank"
                            rel="noreferrer"
                            download={file.name}
                            className="p-1 text-stone-400 hover:text-[#0062FF]"
                            title="Download Document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => onDeleteFile(file.id, file.storagePath)}
                          className="p-1 text-stone-400 hover:text-rose-600"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
