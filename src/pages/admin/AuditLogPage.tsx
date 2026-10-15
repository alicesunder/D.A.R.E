import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { History, Search, Filter, ShieldCheck, Download } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === 'all' || log.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const handleExportCSV = () => {
    const headers = ['ลำดับ,วันเวลา,ผู้ใช้งาน,บทบาท,การดำเนินการ,หมวดหมู่,รายละเอียด'];
    const rows = filteredLogs.map((l, idx) =>
      `${idx + 1},"${l.timestamp}","${l.userName}","${l.userRole}","${l.action}","${l.category}","${l.details}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `DARE_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#32145C] flex items-center gap-2">
            <History className="w-6 h-6 text-[#5B2A86]" />
            <span>ประวัติการใช้งานและบันทึกกิจกรรมระบบ (Audit Logs)</span>
          </h1>
          <p className="text-xs text-[#756B80]">
            บันทึกการเข้าสู่ระบบ การแก้ไขข้อมูล การมอบหมาย และการส่งออกข้อมูลสู่ภายนอกเพื่อความโปร่งใส
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#5B2A86] bg-white border border-[#E7E0EF] rounded-lg hover:bg-purple-50 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span>ดาวน์โหลดบันทึกประวัติ (CSV)</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E0EF] shadow-2xs grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#756B80]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาผู้ใช้งาน, การกระทำ, หรือรายละเอียด..."
            className="w-full pl-9 pr-3 py-2 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
          />
        </div>

        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-3 bg-[#F7F5FB] border border-[#E7E0EF] rounded-lg"
          >
            <option value="all">ทุกประเภทกิจกรรม</option>
            <option value="auth">การยืนยันตัวตน (Auth)</option>
            <option value="personnel">ข้อมูลครู D.A.R.E.</option>
            <option value="school">ข้อมูลสถานศึกษา</option>
            <option value="assignment">การมอบหมายครู</option>
            <option value="activity">กิจกรรมและการอนุมัติ</option>
            <option value="sheets_export">การส่งออก Google Sheets</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-[#E7E0EF] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F5FB] text-[#756B80] font-semibold border-b border-[#E7E0EF]">
              <tr>
                <th className="py-3 px-4 w-12 text-center">ลำดับ</th>
                <th className="py-3 px-4">วันและเวลา</th>
                <th className="py-3 px-4">ผู้ดำเนินการ</th>
                <th className="py-3 px-4">การดำเนินการ (Action)</th>
                <th className="py-3 px-4">หมวดหมู่</th>
                <th className="py-3 px-4">รายละเอียด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E7E0EF] text-[#211A2B]">
              {filteredLogs.map((log, idx) => (
                <tr key={log.id} className="hover:bg-purple-50/50">
                  <td className="py-3 px-4 text-center text-[#756B80] font-mono">{idx + 1}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-[#756B80] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-3 px-4 font-medium">
                    <div className="font-bold text-[#32145C]">{log.userName}</div>
                    <div className="text-[10px] text-[#756B80]">{log.userRole}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#211A2B]">{log.action}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-[#5B2A86] border border-purple-100">
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#756B80] text-[11px] max-w-sm truncate" title={log.details}>
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
