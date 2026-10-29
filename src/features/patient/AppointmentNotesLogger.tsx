import { Calendar, FileText, Plus, RefreshCw, Trash2, User } from 'lucide-react';
import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { SkeletonCard } from '../../components/ui/LoadingSkeleton';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { AppointmentNote } from '../../types';
import { useAppointmentNotes } from './usePatientData';

function createNoteId(): string {
  return `note-${Date.now()}`;
}

export const AppointmentNotesLogger: React.FC = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id || 'demo-patient';
  const { notes, isLoading, isError, refetch, saveNote, isSaving, deleteNote, isDeleting } = useAppointmentNotes();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [doctorOrDepartment, setDoctorOrDepartment] = useState('');
  const [hospitalName, setHospitalName] = useState('All India Institute of Medical Sciences (AIIMS)');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString().split('T')[0]);
  const [keyDiscussionPoints, setKeyDiscussionPoints] = useState('');
  const [prescribedTestsOrNextSteps, setPrescribedTestsOrNextSteps] = useState('');
  const [questionsForNextVisit, setQuestionsForNextVisit] = useState('');

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorOrDepartment.trim() || !keyDiscussionPoints.trim()) return;

    const newNote: AppointmentNote = {
      id: createNoteId(),
      userId,
      doctorOrDepartment,
      hospitalName,
      appointmentDate,
      keyDiscussionPoints,
      prescribedTestsOrNextSteps,
      questionsForNextVisit,
      createdAt: new Date().toISOString()
    };

    saveNote(newNote);
    setIsModalOpen(false);

    // Reset form
    setDoctorOrDepartment('');
    setKeyDiscussionPoints('');
    setPrescribedTestsOrNextSteps('');
    setQuestionsForNextVisit('');
  };

  const handleDelete = (id: string) => {
    deleteNote(id);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Card */}
      <Card className="p-6 bg-white border-[#E2E8F0]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#2563EB]" />
              Consultation & Appointment Notes
            </h2>
            <p className="text-xs text-[#64748B]">
              Prepare your questions and document decisions from nephrologist, hepatologist, or coordinator visits.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New Appointment Note
          </Button>
        </div>
      </Card>

      {/* Loading, Error, and Notes List */}
      {isLoading ? (
        <SkeletonCard count={3} />
      ) : isError ? (
        <Card className="p-6 text-center bg-white border-[#E2E8F0] space-y-3">
          <p className="text-xs text-[#64748B]">Could not load appointment notes from the database.</p>
          <Button variant="secondary" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry Load
          </Button>
        </Card>
      ) : notes.length === 0 ? (
        <EmptyState
          title="No Consultation Notes Recorded Yet"
          description="Document consultation advice, questions for your doctor, and prescribed next steps."
          actionText="Record Your First Visit"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id} className="border-[#E2E8F0] bg-white shadow-xs overflow-hidden">
              <div className="bg-[#F4F8FF] px-6 py-3.5 border-b border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-sm font-bold text-[#0F172A]">{note.doctorOrDepartment}</span>
                  <span className="text-xs text-[#64748B]">({note.hospitalName})</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs text-[#64748B]">
                    <Calendar className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{note.appointmentDate}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(note.id)}
                    disabled={isDeleting}
                    className="text-[#64748B] hover:text-[#0F172A] p-1 transition-colors cursor-pointer"
                    title="Delete Note"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <CardContent className="p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#2563EB] mb-1">
                    Key Discussion Points & Consultation Notes
                  </h4>
                  <p className="text-sm text-[#0F172A] leading-relaxed whitespace-pre-wrap">
                    {note.keyDiscussionPoints}
                  </p>
                </div>

                {note.prescribedTestsOrNextSteps && (
                  <div className="bg-[#F4F8FF]/60 p-3 rounded-lg border border-[#E2E8F0]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] mb-1">
                      Prescribed Diagnostic Tests & Next Steps
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {note.prescribedTestsOrNextSteps}
                    </p>
                  </div>
                )}

                {note.questionsForNextVisit && (
                  <div className="border-t border-[#E2E8F0] pt-3">
                    <h4 className="text-xs font-bold text-[#0F172A] mb-1">
                      Questions for Next Appointment:
                    </h4>
                    <p className="text-xs text-[#64748B] leading-relaxed">
                      {note.questionsForNextVisit}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Note Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Doctor Consultation Note">
        <form onSubmit={handleSaveNote} className="space-y-4 text-left">
          <Input
            label="Doctor / Department"
            required
            value={doctorOrDepartment}
            onChange={(e) => setDoctorOrDepartment(e.target.value)}
            placeholder="e.g. Dr. Sen (Nephrology OPD) or Coordinator Office"
          />

          <Input
            label="Hospital / Center"
            required
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            placeholder="e.g. AIIMS New Delhi"
          />

          <Input
            label="Visit Date"
            type="date"
            required
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Key Discussion Points & Instructions *
            </label>
            <textarea
              required
              rows={3}
              value={keyDiscussionPoints}
              onChange={(e) => setKeyDiscussionPoints(e.target.value)}
              placeholder="What did the doctor advise regarding donor workup, medication, or diet?"
              className="w-full text-xs p-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Prescribed Diagnostic Tests / Hospital Actions
            </label>
            <input
              type="text"
              value={prescribedTestsOrNextSteps}
              onChange={(e) => setPrescribedTestsOrNextSteps(e.target.value)}
              placeholder="e.g. DTPA Renogram, Viral Serology screening, Cardiology Clearance"
              className="w-full text-xs p-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">
              Questions to Ask on Next Visit
            </label>
            <input
              type="text"
              value={questionsForNextVisit}
              onChange={(e) => setQuestionsForNextVisit(e.target.value)}
              placeholder="e.g. Confirmation of date for Authorization Committee interview"
              className="w-full text-xs p-3 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
              Save Consultation Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
