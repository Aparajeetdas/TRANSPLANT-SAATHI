import { zodResolver } from '@hookform/resolvers/zod';
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Mail,
  MapPin,
  PhoneCall,
  ShieldAlert
} from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';

const contactSchema = z.object({
  fullName: z.string().min(2, 'Please enter your full name'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid contact phone number'),
  subject: z.string().min(3, 'Please specify the subject of your inquiry'),
  message: z.string().min(10, 'Message must be at least 10 characters long')
});

type ContactFormData = z.infer<typeof contactSchema>;

export const ContactPage: React.FC = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    }
  });

  const onSubmit = async () => {
    // Simulate API submission
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSuccess(true);
    reset();
  };

  return (
    <div className="space-y-12 text-left max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F8FF] border border-[#2563EB]/30 text-xs font-semibold text-[#1D4ED8] mb-2">
          <PhoneCall className="w-3.5 h-3.5 text-[#2563EB]" />
          <span>Support & Official Helplines</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A] font-heading">
          Contact Transplant Saathi
        </h1>
        <p className="text-xs sm:text-sm text-[#64748B] mt-1 max-w-2xl leading-relaxed">
          Need navigation help, have a question about government scheme eligibility, or wish to report a directory update? Contact our public assistance desk or official national helplines.
        </p>
      </div>

      {/* Emergency & 24/7 National Helplines Bar */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0F172A] text-white border border-[#2563EB]/30 space-y-4 shadow-lg relative overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -bottom-10 w-60 h-60 bg-blue-500/10 rounded-full blur-2xl" />
        
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#F4F8FF]">
          <ShieldAlert className="w-4 h-4 text-[#2563EB]" />
          <span>Statutory National Emergency Desks</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 relative">
          <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-white/70 block">NOTTO 24/7 National Toll-Free:</span>
            <div className="flex items-center justify-between gap-2">
              <a href="tel:1800114770" className="text-xl font-extrabold text-white hover:text-blue-300 transition-colors">
                1800-11-4770
              </a>
              <button
                type="button"
                onClick={() => handleCopy('notto', '1800-11-4770')}
                className="text-[10px] font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded border border-white/20 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                title="Copy helpline number"
              >
                {copiedKey === 'notto' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'notto' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-white/50">Official MoHFW national registry hotline</p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-white/70 block">Ayushman Bharat (PM-JAY) Desk:</span>
            <div className="flex items-center justify-between gap-2">
              <a href="tel:14555" className="text-xl font-extrabold text-white hover:text-blue-300 transition-colors">
                14555
              </a>
              <button
                type="button"
                onClick={() => handleCopy('pmjay', '14555')}
                className="text-[10px] font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded border border-white/20 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                title="Copy helpline number"
              >
                {copiedKey === 'pmjay' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'pmjay' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-white/50">Toll-free hospital pre-authorization helpline</p>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <span className="text-xs text-white/70 block">National Emergency Medical Call:</span>
            <div className="flex items-center justify-between gap-2">
              <a href="tel:112" className="text-xl font-extrabold text-white hover:text-blue-300 transition-colors">
                112
              </a>
              <button
                type="button"
                onClick={() => handleCopy('call112', '112')}
                className="text-[10px] font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded border border-white/20 shrink-0 flex items-center gap-1 cursor-pointer transition-colors"
                title="Copy helpline number"
              >
                {copiedKey === 'call112' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedKey === 'call112' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-white/50">Centralized emergency response</p>
          </div>
        </div>
      </div>

      {/* Grid: Contact Form & Directory Assistance Info */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="md:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Send a Public Navigation Inquiry</CardTitle>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="p-6 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-[#2563EB] mx-auto" />
                  <h4 className="text-base font-bold text-[#0F172A] font-heading">
                    Inquiry Received
                  </h4>
                  <p className="text-xs text-[#64748B] max-w-sm mx-auto leading-relaxed">
                    Thank you. Your navigation inquiry has been logged. Our volunteer team will review your query and respond via email within 1–2 business days.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setIsSuccess(false)}>
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Full Name"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      error={errors.fullName?.message}
                      {...register('fullName')}
                    />
                    <Input
                      label="Contact Email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      error={errors.email?.message}
                      {...register('email')}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Contact Mobile"
                      type="tel"
                      required
                      placeholder="e.g. 98765 43210"
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                    <Input
                      label="Inquiry Subject"
                      required
                      placeholder="e.g. Form 1 checklist or Ayushman Mitra help"
                      error={errors.subject?.message}
                      {...register('subject')}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0F172A]">
                      Detailed Message <span className="text-[#2563EB]">*</span>
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Please describe how we can assist your family..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#0F172A] focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                      {...register('message')}
                    />
                    {errors.message && (
                      <p className="text-[11px] font-semibold text-[#1D4ED8]">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="primary"
                      size="md"
                      type="submit"
                      isLoading={isSubmitting}
                      className="w-full"
                    >
                      Submit Navigation Inquiry
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Info Column */}
        <div className="md:col-span-5 space-y-6 text-xs">
          <Card>
            <CardHeader>
              <CardTitle>Direct Contact Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F172A] block">Email Inquiries:</span>
                  <a href="mailto:support@transplantsaathi.org" className="text-[#2563EB] hover:underline">
                    support@transplantsaathi.org
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F172A] block">Volunteer Helpdesk Hours:</span>
                  <span className="text-[#64748B]">Monday – Saturday: 9:00 AM – 6:00 PM IST</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#0F172A] block">Nodal Directorate Office:</span>
                  <span className="text-[#64748B]">
                    Transplant Saathi Humanitarian Navigation Hub<br />
                    Ansari Nagar, New Delhi 110029, India
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Alert variant="warning" title="Medical Emergency Disclaimer">
            Transplant Saathi does not provide immediate acute medical emergency response. In case of acute clinical rejection or surgical distress, contact your hospital emergency transplant coordinator immediately.
          </Alert>
        </div>
      </div>
    </div>
  );
};
