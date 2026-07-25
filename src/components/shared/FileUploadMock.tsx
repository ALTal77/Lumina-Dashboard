import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X, FileCheck, Image as ImageIcon } from 'lucide-react';

interface FileUploadMockProps {
  id?: string;
  label?: string;
  accept?: string;
  onFileSelect?: (file: { name: string; url: string; size: string }) => void;
  defaultPreview?: string;
}

export const FileUploadMock: React.FC<FileUploadMockProps> = ({
  id,
  label,
  accept = 'image/*',
  onFileSelect,
  defaultPreview,
}) => {
  const { t } = useTranslation();
  const resolvedLabel = label ?? t('fileUpload.label.default');
  const [fileData, setFileData] = useState<{ name: string; url: string; size: string } | null>(
    defaultPreview
      ? { name: t('fileUpload.defaultFileName'), url: defaultPreview, size: t('fileUpload.defaultFileSize') }
      : null
  );
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      const data = {
        name: file.name,
        url: previewUrl,
        size: `${(file.size / 1024 / 1024).toFixed(1)} ${t('fileUpload.sizeUnit')}`,
      };
      setFileData(data);
      if (onFileSelect) onFileSelect(data);
    }
  };

  const removeFile = () => {
    setFileData(null);
  };

  return (
    <div id={id} className="w-full">
      {resolvedLabel && <label className="block text-xs font-semibold text-heading mb-1.5">{resolvedLabel}</label>}

      {fileData ? (
        <div className="flex items-center justify-between p-3 bg-page border border-border rounded-[16px]">
          <div className="flex items-center gap-3 overflow-hidden">
            {fileData.url.startsWith('http') || fileData.url.startsWith('blob:') ? (
              <img src={fileData.url} alt={t('fileUpload.image.alt')} className="w-10 h-10 rounded-lg object-cover border border-border" />
            ) : (
              <div className="w-10 h-10 bg-primary-tint text-primary rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-semibold text-heading truncate">{fileData.name}</p>
              <p className="text-[10px] text-muted">{fileData.size}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] bg-primary-tint text-primary font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <FileCheck className="w-3 h-3" /> {t('fileUpload.status.ready')}
            </span>
            <button
              type="button"
              onClick={removeFile}
              className="p-1 text-muted hover:text-danger rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              const file = e.dataTransfer.files[0];
              const previewUrl = URL.createObjectURL(file);
              const data = {
                name: file.name,
                url: previewUrl,
        size: `${(file.size / 1024 / 1024).toFixed(1)} ${t('fileUpload.sizeUnit')}`,
              };
              setFileData(data);
              if (onFileSelect) onFileSelect(data);
            }
          }}
          className={`border-2 border-dashed rounded-[16px] p-4 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-primary bg-primary-tint'
              : 'border-border hover:border-muted bg-page'
          }`}
        >
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={`file-input-${resolvedLabel.replace(/\s+/g, '-').toLowerCase()}`}
          />
          <label htmlFor={`file-input-${resolvedLabel.replace(/\s+/g, '-').toLowerCase()}`} className="cursor-pointer">
            <Upload className="w-6 h-6 text-muted mx-auto mb-1.5" />
            <p className="text-xs font-semibold text-heading">
              {t('fileUpload.dropZone.dragAndDrop')} <span className="text-primary underline">{t('fileUpload.dropZone.browse')}</span>
            </p>
            <p className="text-[10px] text-muted mt-0.5">{t('fileUpload.dropZone.supportedFormats')}</p>
          </label>
        </div>
      )}
    </div>
  );
};
