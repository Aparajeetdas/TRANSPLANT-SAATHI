import { ChevronLeft, ChevronRight, Eye, History, Search } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { getStoredAuditLogs } from '../../lib/store';
import { AuditLogEntry } from '../../types';

export const AuditLogView: React.FC = () => {
  const [logs] = useState<AuditLogEntry[]>(() => getStoredAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const itemsPerPage = 8;

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        log.action.toLowerCase().includes(q) ||
        log.actorName.toLowerCase().includes(q) ||
        log.targetTable.toLowerCase().includes(q) ||
        log.targetId.toLowerCase().includes(q) ||
        JSON.stringify(log.details || {}).toLowerCase().includes(q);

      const matchesRole = selectedRole === 'all' || log.actorRole === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [logs, searchQuery, selectedRole]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-[#0F172A] font-heading flex items-center gap-2">
            <History className="w-5 h-5 text-[#2563EB]" />
            <span>Immutable Security Audit Log</span>
          </h3>
          <p className="text-xs text-[#64748B]">
            Tracks role assignments, compliance verifications, directory changes, and privilege enforcement events.
          </p>
        </div>
        <div className="text-xs text-[#64748B]">
          Total entries recorded: <span className="font-bold text-[#0F172A]">{logs.length}</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search action, actor, target table, or metadata..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
          />
        </div>
        <div className="sm:col-span-4">
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] bg-white focus:border-[#2563EB] focus:outline-none"
          >
            <option value="all">All Actor Roles</option>
            <option value="admin">Admin</option>
            <option value="hospital_staff">Hospital Staff</option>
            <option value="volunteer">Volunteer</option>
            <option value="patient">Patient</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F4F8FF] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
                <th className="px-5 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5">Actor</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Action Code</th>
                <th className="px-5 py-3.5">Target Table & ID</th>
                <th className="px-5 py-3.5">Metadata Preview</th>
                <th className="px-5 py-3.5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-xs text-[#64748B]">
                    No audit records found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[#F4F8FF]/50 transition-colors font-mono text-[11px]"
                  >
                    <td className="px-5 py-3.5 text-[#64748B] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5 text-[#0F172A] font-sans font-bold whitespace-nowrap">
                      {log.actorName}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap font-sans">
                      <Badge variant={log.actorRole === 'admin' ? 'navy' : 'subtle'}>
                        {log.actorRole}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-[#2563EB] whitespace-nowrap">
                      {log.action}
                    </td>
                    <td className="px-5 py-3.5 text-[#0F172A] whitespace-nowrap">
                      <span className="font-semibold text-[#1D4ED8]">{log.targetTable}</span>
                      <span className="text-[#64748B] block text-[10px]">{log.targetId}</span>
                    </td>
                    <td className="px-5 py-3.5 text-[#64748B] max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details) : '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right whitespace-nowrap font-sans">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLog(log)}
                        className="text-[11px] py-1 px-2.5"
                        leftIcon={<Eye className="w-3 h-3 text-[#2563EB]" />}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {filteredLogs.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-3.5 border-t border-[#E2E8F0] bg-[#F4F8FF]/40 gap-3 text-xs">
            <div className="text-[#64748B]">
              Showing <span className="font-bold text-[#0F172A]">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
              <span className="font-bold text-[#0F172A]">
                {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
              </span>{' '}
              of <span className="font-bold text-[#0F172A]">{filteredLogs.length}</span> audit events
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="py-1 px-2 text-xs"
                leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
              >
                Previous
              </Button>

              <span className="px-3 py-1 text-xs text-[#0F172A] font-semibold">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="py-1 px-2 text-xs"
                rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Snapshot Inspection Modal */}
      {selectedLog && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedLog(null)}
          title="Audit Log Event Inspection"
          subtitle={`Event ID: ${selectedLog.id}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs bg-[#F4F8FF] p-4 rounded-xl border border-[#2563EB]/20">
              <div>
                <span className="text-[#64748B] block">Timestamp:</span>
                <span className="font-semibold text-[#0F172A]">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[#64748B] block">Action Code:</span>
                <span className="font-bold text-[#2563EB]">{selectedLog.action}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Actor:</span>
                <span className="font-semibold text-[#0F172A]">{selectedLog.actorName}</span>
                <span className="text-[10px] text-[#64748B] block">({selectedLog.actorId})</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Actor Role:</span>
                <Badge variant={selectedLog.actorRole === 'admin' ? 'navy' : 'subtle'}>
                  {selectedLog.actorRole}
                </Badge>
              </div>
              <div>
                <span className="text-[#64748B] block">Target Table:</span>
                <span className="font-mono text-[#0F172A]">{selectedLog.targetTable}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Target ID:</span>
                <span className="font-mono text-[#0F172A]">{selectedLog.targetId}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-[#0F172A] block mb-1.5 font-heading">
                Payload Snapshot (JSON):
              </span>
              <pre className="p-4 bg-[#0F172A] text-[#F4F8FF] rounded-xl text-xs font-mono overflow-x-auto max-h-60 leading-relaxed">
                {JSON.stringify(selectedLog.details || {}, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLog(null)}
              >
                Close Inspection
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
