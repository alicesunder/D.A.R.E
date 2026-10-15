import React from 'react';
import { AlertTriangle, CheckCircle2, FileSpreadsheet, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  type?: 'danger' | 'warning' | 'info' | 'sheets';
  confirmLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  details?: string[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  type = 'warning',
  confirmLabel = 'ยืนยันดำเนินการ',
  cancelLabel = 'ยกเลิก',
  isLoading = false,
  details = [],
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <div className="p-3 bg-red-100 text-red-600 rounded-full"><AlertTriangle className="w-6 h-6" /></div>;
      case 'sheets':
        return <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full"><FileSpreadsheet className="w-6 h-6" /></div>;
      case 'info':
        return <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><CheckCircle2 className="w-6 h-6" /></div>;
      default:
        return <div className="p-3 bg-amber-100 text-amber-600 rounded-full"><AlertTriangle className="w-6 h-6" /></div>;
    }
  };

  const getConfirmButtonClass = () => {
    switch (type) {
      case 'danger':
        return 'bg-[#C63C4B] hover:bg-[#A82836] text-white';
      case 'sheets':
        return 'bg-[#168A62] hover:bg-[#0E6C4C] text-white';
      default:
        return 'bg-[#5B2A86] hover:bg-[#441D66] text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        role="dialog" 
        aria-modal="true"
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-[#E7E0EF] overflow-hidden"
      >
        <div className="flex items-start justify-between p-5 border-b border-[#E7E0EF]">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <h3 className="text-lg font-bold text-[#211A2B]">{title}</h3>
              <p className="text-xs text-[#756B80]">โปรดยืนยันการดำเนินการ</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 text-[#756B80] hover:text-[#211A2B] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-[#4A3B69] leading-relaxed whitespace-pre-line">
            {description}
          </p>

          {details && details.length > 0 && (
            <div className="p-3 bg-[#F7F5FB] rounded-lg border border-[#E7E0EF] space-y-1">
              <span className="text-xs font-semibold text-[#5B2A86]">รายการที่เกี่ยวข้อง:</span>
              <ul className="text-xs text-[#756B80] list-disc list-inside space-y-0.5">
                {details.map((item, idx) => (
                  <li key={idx} className="truncate">{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[#F7F5FB] border-t border-[#E7E0EF]">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-[#756B80] hover:text-[#211A2B] bg-white border border-[#E7E0EF] rounded-lg transition-colors hover:bg-gray-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2 text-sm font-semibold rounded-lg shadow-xs transition-all flex items-center gap-2 ${getConfirmButtonClass()}`}
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
