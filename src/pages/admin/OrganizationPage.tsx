import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Organization } from '../../types';
import { 
  Network, 
  Building2, 
  Users, 
  School, 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  X,
  Phone,
  MapPin
} from 'lucide-react';
import { ConfirmationModal } from '../../components/ui/ConfirmationModal';

export const OrganizationPage: React.FC = () => {
  const { organizations, personnel, schools, activities, currentRole } = useApp();

  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'org-hq': true,
    'org-reg-1': true,
    'org-reg-2': true,
    'org-reg-3': true,
    'org-reg-4': true,
  });

  const [selectedUnit, setSelectedUnit] = useState<Organization | null>(organizations[0] || null);

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Dynamic counts for each unit
  const getUnitCounts = (orgId: string) => {
    // Collect self and descendant unit IDs
    const childIds = organizations.filter(o => o.parentId === orgId).map(o => o.id);
    const allRelevantIds = [orgId, ...childIds];

    const officerCount = personnel.filter(p => allRelevantIds.includes(p.organizationId)).length;
    const schoolCount = schools.filter(s => allRelevantIds.includes(s.organizationId)).length;
    const activityCount = activities.filter(a => allRelevantIds.includes(a.organizationId)).length;

    return { officerCount, schoolCount, activityCount };
  };

  const hq = organizations.find(o => o.level === 'hq');
  const regions = organizations.filter(o => o.level === 'region');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#32145C] flex items-center gap-2">
          <Network className="w-6 h-6 text-[#5B2A86]" />
          <span>โครงสร้างหน่วยงานและการบังคับบัญชา</span>
        </h1>
        <p className="text-xs text-[#756B80]">
          แผนผังสายการบังคับบัญชา กองบัญชาการตำรวจตระเวนชายแดน และสถิติภาพรวมแต่ละหน่วย
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Tree Structure View */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7E0EF] shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7E0EF] pb-3">
            <h3 className="text-sm font-bold text-[#32145C] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#5B2A86]" />
              <span>ผังโครงสร้างหน่วย ตชด. ทั่วประเทศ</span>
            </h3>
            <span className="text-[11px] text-[#756B80]">คลิกหน่วยเพื่อดูรายละเอียด</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Headquarters Root */}
            {hq && (
              <div className="space-y-2">
                <div
                  onClick={() => setSelectedUnit(hq)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    selectedUnit?.id === hq.id
                      ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-[#7C3AED]/30'
                      : 'border-[#E7E0EF] bg-[#F7F5FB] hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNode(hq.id);
                      }}
                      className="p-1 hover:bg-purple-100 rounded"
                    >
                      {expandedNodes[hq.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <Building2 className="w-4 h-4 text-[#32145C]" />
                    <div>
                      <span className="font-bold text-[#32145C] text-sm">{hq.name}</span>
                      <span className="ml-2 text-[10px] text-[#D6B15E] font-semibold">({hq.shortName})</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-[#5B2A86]">
                    ส่วนกลาง
                  </span>
                </div>

                {/* Regions List */}
                {expandedNodes[hq.id] && (
                  <div className="pl-6 space-y-3 border-l-2 border-purple-200 ml-4">
                    {regions.map((reg) => {
                      const subdivisions = organizations.filter(o => o.parentId === reg.id);
                      const isExpanded = expandedNodes[reg.id];

                      return (
                        <div key={reg.id} className="space-y-2">
                          <div
                            onClick={() => setSelectedUnit(reg)}
                            className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                              selectedUnit?.id === reg.id
                                ? 'border-[#7C3AED] bg-purple-50 ring-2 ring-[#7C3AED]/30'
                                : 'border-[#E7E0EF] bg-white hover:border-purple-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleNode(reg.id);
                                }}
                                className="p-0.5 hover:bg-gray-100 rounded"
                              >
                                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                              </button>
                              <span className="font-bold text-[#211A2B]">{reg.name}</span>
                              <span className="text-[10px] text-[#756B80]">({reg.province})</span>
                            </div>
                            <span className="text-[10px] text-[#756B80]">
                              {subdivisions.length} กองกำกับการ
                            </span>
                          </div>

                          {/* Subdivisions */}
                          {isExpanded && (
                            <div className="pl-6 space-y-1.5 border-l-2 border-dashed border-purple-200 ml-3">
                              {subdivisions.map((sub) => {
                                const counts = getUnitCounts(sub.id);
                                return (
                                  <div
                                    key={sub.id}
                                    onClick={() => setSelectedUnit(sub)}
                                    className={`p-2 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                                      selectedUnit?.id === sub.id
                                        ? 'border-[#7C3AED] bg-purple-50 font-bold'
                                        : 'border-[#E7E0EF] bg-white hover:bg-gray-50'
                                    }`}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-[#5B2A86]" />
                                      <span className="text-gray-800">{sub.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-[#756B80]">
                                      <span>ครู {counts.officerCount}</span>
                                      <span>รร. {counts.schoolCount}</span>
                                      <span>กิจกรรม {counts.activityCount}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Selected Unit Detail Panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7E0EF] shadow-2xs p-5 space-y-5">
          {selectedUnit ? (
            <div className="space-y-5">
              <div className="border-b border-[#E7E0EF] pb-3">
                <span className="text-[10px] font-bold text-[#5B2A86] uppercase tracking-wider">
                  รายละเอียดหน่วยงาน
                </span>
                <h3 className="text-base font-bold text-[#32145C] mt-1">{selectedUnit.name}</h3>
                <p className="text-xs text-[#756B80]">{selectedUnit.shortName} • รหัสหน่วย: {selectedUnit.code}</p>
              </div>

              {/* Counts Grid */}
              {(() => {
                const counts = getUnitCounts(selectedUnit.id);
                return (
                  <div className="grid grid-cols-3 gap-3 text-center text-xs">
                    <div className="p-3 rounded-xl bg-purple-50 border border-purple-100">
                      <Users className="w-5 h-5 mx-auto text-[#5B2A86]" />
                      <div className="text-lg font-bold text-[#32145C] mt-1">{counts.officerCount}</div>
                      <div className="text-[10px] text-[#756B80]">ครู D.A.R.E.</div>
                    </div>
                    <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
                      <School className="w-5 h-5 mx-auto text-blue-600" />
                      <div className="text-lg font-bold text-blue-900 mt-1">{counts.schoolCount}</div>
                      <div className="text-[10px] text-[#756B80]">โรงเรียนในสังกัด</div>
                    </div>
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <Activity className="w-5 h-5 mx-auto text-emerald-600" />
                      <div className="text-lg font-bold text-emerald-900 mt-1">{counts.activityCount}</div>
                      <div className="text-[10px] text-[#756B80]">กิจกรรมที่จัดแล้ว</div>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-[#F7F5FB] rounded-lg space-y-1">
                  <span className="text-[#756B80] block">พื้นที่รับผิดชอบ / ที่ตั้ง</span>
                  <span className="font-bold text-[#211A2B] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#5B2A86]" />
                    <span>จังหวัด{selectedUnit.province}</span>
                  </span>
                </div>

                {selectedUnit.phone && (
                  <div className="p-3 bg-[#F7F5FB] rounded-lg space-y-1">
                    <span className="text-[#756B80] block">หมายเลขโทรศัพท์</span>
                    <span className="font-bold text-[#211A2B] flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#5B2A86]" />
                      <span>{selectedUnit.phone}</span>
                    </span>
                  </div>
                )}
              </div>

              {/* Assigned Schools preview in this unit */}
              <div className="space-y-2 text-xs">
                <span className="font-bold text-[#32145C] block">โรงเรียนในพื้นที่รับผิดชอบของหน่วย:</span>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {schools
                    .filter(s => s.organizationId === selectedUnit.id)
                    .map(sch => (
                      <div key={sch.id} className="p-2 rounded bg-gray-50 border border-gray-100 flex items-center justify-between">
                        <span className="truncate">{sch.name}</span>
                        <span className="text-[10px] text-[#756B80]">อ.{sch.district}</span>
                      </div>
                    ))}
                  {schools.filter(s => s.organizationId === selectedUnit.id).length === 0 && (
                    <div className="text-gray-400 italic p-3 text-center">ไม่มีโรงเรียนที่ผูกกับหน่วยนี้โดยตรง</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-xs text-gray-400">
              กรุณาเลือกหน่วยงานทางด้านซ้ายเพื่อดูรายละเอียด
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
