import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  Compass,
  Eye,
  FileCheck2,
  HeartHandshake,
  Mail,
  Plus,
  Search,
  ShieldCheck
} from 'lucide-react';
import React, { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogFooter,
  EmptyState,
  ErrorState,
  Footer,
  Input,
  Navigation,
  PageContainer,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '../../components/ui';
import { BRAND_COLORS, SPACING } from '../../design/tokens';

export const DesignSystemShowcasePage: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-white">
      {/* 1. Header Navigation Component Showcase */}
      <Navigation
        brandName="Transplant Saathi"
        userRole="patient"
        ctaButton={
          <Button variant="primary" size="sm">
            Sign In
          </Button>
        }
      />

      {/* 2. Main Page Container Component Showcase */}
      <PageContainer
        title="Design System & UI Components Specification"
        subtitle="Phase 1 Foundation: Strict blue-and-white brand palette, accessible contrast, typography, and reusable components. Fully compliant with AGENTS.md rules."
        badge={<Badge variant="primary">Phase 1 Architecture</Badge>}
        headerActions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            leftIcon={<Eye className="w-4 h-4" />}
          >
            Preview Dialog Component
          </Button>
        }
      >
        <div className="space-y-12 text-left">
          {/* Section A: Brand Palette & Color Tokens */}
          <section className="space-y-4">
            <div className="border-b border-[#E2E8F0] pb-2">
              <h2 className="text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
                1. Exclusive Blue-and-White Color Palette
              </h2>
              <p className="text-xs text-[#64748B]">
                Absolute prohibition of green, teal, beige, cream, purple, orange, or neon gradients.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { name: 'White', hex: BRAND_COLORS.white, text: '#0F172A', border: true, desc: 'Core Surface' },
                { name: 'Ice Blue', hex: BRAND_COLORS.iceBlue, text: '#1D4ED8', border: true, desc: 'Subtle Backgrounds' },
                { name: 'Primary Blue', hex: BRAND_COLORS.primaryBlue, text: '#FFFFFF', desc: 'Primary Action' },
                { name: 'Deep Blue', hex: BRAND_COLORS.deepBlue, text: '#FFFFFF', desc: 'Active & Focus' },
                { name: 'Navy', hex: BRAND_COLORS.navy, text: '#FFFFFF', desc: 'High Contrast Headings' },
                { name: 'Slate', hex: BRAND_COLORS.slate, text: '#FFFFFF', desc: 'Muted Typography' },
                { name: 'Border', hex: BRAND_COLORS.border, text: '#0F172A', border: true, desc: 'Structural Outlines' },
              ].map((color) => (
                <div
                  key={color.name}
                  className={`p-4 rounded-2xl flex flex-col justify-between h-28 shadow-2xs ${
                    color.border ? 'border border-[#E2E8F0]' : ''
                  }`}
                  style={{ backgroundColor: color.hex, color: color.text }}
                >
                  <span className="text-xs font-bold font-heading">{color.name}</span>
                  <div>
                    <div className="font-mono text-xs font-bold">{color.hex}</div>
                    <div className="text-[10px] opacity-80">{color.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section B: Typography & Spacing Tokens */}
          <section className="space-y-4">
            <div className="border-b border-[#E2E8F0] pb-2">
              <h2 className="text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#2563EB]" />
                2. Typography & Spacing Tokens
              </h2>
              <p className="text-xs text-[#64748B]">
                Manrope font for headings; Inter font for body text. Standard 4px-based spacing rhythm.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Typography Scale (Manrope & Inter)</CardTitle>
                  <CardDescription>WCAG AA accessible contrast ratios against white and ice blue.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Heading 1 — 32px Manrope Bold</span>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-heading">
                      Transplant Patient Navigation
                    </h1>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Heading 2 — 24px Manrope Bold</span>
                    <h2 className="text-xl font-bold text-[#0F172A] font-heading">
                      Statutory Clearance & Committee Protocol
                    </h2>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Body Text — 14px Inter Regular</span>
                    <p className="text-sm text-[#0F172A] leading-relaxed">
                      All procedures are strictly governed under the Transplantation of Human Organs and Tissues Act (THOTA) 1994. Peer navigators provide logistics assistance.
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider">Caption / Microcopy — 12px Inter Medium</span>
                    <p className="text-xs text-[#64748B]">
                      Last statutory registry audit: 2026-10-27 | Source: NOTTO Registry
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Spacing Scale Tokens</CardTitle>
                  <CardDescription>Consistent spacing units mapped across margins, padding, and layout gutters.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {Object.entries(SPACING).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between text-xs py-1 border-b border-[#E2E8F0]/60">
                      <span className="font-mono font-bold text-[#0F172A]">SPACING.{key}</span>
                      <span className="text-[#64748B]">{val}</span>
                      <div className="h-3 bg-[#2563EB] rounded-xs" style={{ width: val }} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Section C: Buttons Component Showcase */}
          <section className="space-y-4">
            <div className="border-b border-[#E2E8F0] pb-2">
              <h2 className="text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
                <ArrowRight className="w-5 h-5 text-[#2563EB]" />
                3. Reusable Buttons
              </h2>
              <p className="text-xs text-[#64748B]">
                Variants: Primary, Secondary, Outline, Ghost, Danger. Sizes: sm, md, lg. With icon slots, loading spinners, and visible focus rings.
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">Variants</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary">Primary Button</Button>
                    <Button variant="secondary">Secondary Button</Button>
                    <Button variant="outline">Outline Button</Button>
                    <Button variant="ghost">Ghost Button</Button>
                    <Button variant="navy">Navy Contrast</Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">Sizes & Icons</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                      Small Button
                    </Button>
                    <Button size="md" variant="primary" leftIcon={<HeartHandshake className="w-4 h-4" />}>
                      Medium Button
                    </Button>
                    <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-5 h-5" />}>
                      Large Button
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">States (Loading & Disabled)</h4>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button variant="primary" isLoading>
                      Processing Filing
                    </Button>
                    <Button variant="secondary" disabled>
                      Disabled Action
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section D: Inputs & Form Controls */}
          <section className="space-y-4">
            <div className="border-b border-[#E2E8F0] pb-2">
              <h2 className="text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
                <Search className="w-5 h-5 text-[#2563EB]" />
                4. Reusable Inputs & Form Controls
              </h2>
              <p className="text-xs text-[#64748B]">
                Label, helper text, error text validation, and leading/trailing icons.
              </p>
            </div>

            <Card>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input
                  label="Search Hospital or City"
                  placeholder="e.g. AIIMS New Delhi"
                  leftIcon={<Search className="w-4 h-4 text-[#2563EB]" />}
                  helperText="Search by hospital name, city, or state."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />

                <Input
                  label="Registered Email Address *"
                  type="email"
                  placeholder="patient@transplantsaathi.org"
                  leftIcon={<Mail className="w-4 h-4 text-[#2563EB]" />}
                  value="invalid-email-format"
                  error="Please enter a valid official email address"
                  onChange={() => {}}
                />

                <Input
                  label="Aadhaar / Form 1 Joint Ref Number"
                  placeholder="THOTA-DEL-2026-001"
                  helperText="Official reference from Authorization Committee."
                />
              </CardContent>
            </Card>
          </section>

          {/* Section E: Badges & Alerts Component Showcase */}
          <section className="space-y-4">
            <div className="border-b border-[#E2E8F0] pb-2">
              <h2 className="text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-[#2563EB]" />
                5. Badges & Alert Callouts
              </h2>
              <p className="text-xs text-[#64748B]">
                Contextual markers strictly utilizing brand White, Ice Blue, Primary Blue, and Navy.
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">Badge Variants</h4>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge variant="primary" icon={<CheckCircle2 className="w-3 h-3" />}>Primary Badge</Badge>
                    <Badge variant="subtle" icon={<Clock className="w-3 h-3" />}>Subtle (Ice Blue)</Badge>
                    <Badge variant="outline">Outline Badge</Badge>
                    <Badge variant="navy">Navy Contrast</Badge>
                    <Badge variant="neutral">Neutral System</Badge>
                    <Badge variant="primary" size="sm">Small Tag</Badge>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-2">Alert Banners</h4>
                  <Alert
                    variant="statutory"
                    title="THOTA 1994 Statutory Compliance Notice"
                  >
                    Organ transplants in India are strictly altruistic. Under Section 19, any commercial transaction is punishable by up to 10 years imprisonment and ₹1 Crore fines.
                  </Alert>
                  <Alert
                    variant="contrast"
                    title="Non-Clinical Digital Platform Scope"
                  >
                    Transplant Saathi does not perform organ matching or clinical triage. Allocation rosters are maintained exclusively by statutory authorities (NOTTO/SOTTO).
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Section F: Tables Component Showcase */}
          <section className="space-y-4">
            <div className="border-b border-[#E2E8F0] pb-2">
              <h2 className="text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-[#2563EB]" />
                6. Reusable Accessible Table
              </h2>
              <p className="text-xs text-[#64748B]">
                Semantic table with TableHeader, TableRow, TableHead, TableBody, TableCell, and striped row options.
              </p>
            </div>

            <Table striped>
              <TableHeader>
                <TableRow>
                  <TableHead>Institution Name</TableHead>
                  <TableHead>Registration Number</TableHead>
                  <TableHead>Supported Organs</TableHead>
                  <TableHead>Accreditation</TableHead>
                  <TableHead>Verification Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-bold text-[#0F172A]">All India Institute of Medical Sciences (AIIMS)</TableCell>
                  <TableCell className="font-mono text-xs text-[#2563EB]">NOTTO-APEX-ND-001</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant="subtle" size="sm">KIDNEY</Badge>
                      <Badge variant="subtle" size="sm">LIVER</Badge>
                    </div>
                  </TableCell>
                  <TableCell>NOTTO Apex / NABH</TableCell>
                  <TableCell>
                    <Badge variant="primary" size="sm">AUDIT VERIFIED</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold text-[#0F172A]">Institute of Liver and Biliary Sciences (ILBS)</TableCell>
                  <TableCell className="font-mono text-xs text-[#2563EB]">NOTTO-LIV-DL-002</TableCell>
                  <TableCell>
                    <Badge variant="subtle" size="sm">LIVER</Badge>
                  </TableCell>
                  <TableCell>NABH Accredited</TableCell>
                  <TableCell>
                    <Badge variant="primary" size="sm">AUDIT VERIFIED</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-bold text-[#0F172A]">Post Graduate Institute of Medical Education (PGIMER)</TableCell>
                  <TableCell className="font-mono text-xs text-[#2563EB]">ROTTO-NORTH-CH-003</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant="subtle" size="sm">KIDNEY</Badge>
                      <Badge variant="subtle" size="sm">HEART</Badge>
                    </div>
                  </TableCell>
                  <TableCell>ROTTO Apex / NABH</TableCell>
                  <TableCell>
                    <Badge variant="primary" size="sm">AUDIT VERIFIED</Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          {/* Section G: Loading Skeletons, Empty States & Error States */}
          <section className="space-y-4">
            <div className="border-b border-[#E2E8F0] pb-2">
              <h2 className="text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#2563EB]" />
                7. Skeletons, Empty States & Error States
              </h2>
              <p className="text-xs text-[#64748B]">
                Asynchronous state views ensuring complete interface feedback during data fetching and authorization checks.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Skeletons */}
              <Card>
                <CardHeader>
                  <CardTitle>Loading Skeletons</CardTitle>
                  <CardDescription>Subtle brand pulse animation.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton variant="circular" width="2.5rem" height="2.5rem" />
                    <div className="space-y-2 flex-1">
                      <Skeleton variant="text" width="80%" />
                      <Skeleton variant="text" width="50%" />
                    </div>
                  </div>
                  <Skeleton variant="text" width="100%" />
                  <Skeleton variant="text" width="90%" />
                  <Skeleton variant="rectangular" height="2rem" className="w-28" />
                </CardContent>
              </Card>

              {/* Empty State */}
              <EmptyState
                title="No Matching Hospital Records"
                description="We couldn't find registered apex transplant centers in the selected district. Try clearing your filters."
                actionText="Reset Search Filters"
                onAction={() => alert('Search filters reset.')}
              />

              {/* Error State */}
              <ErrorState
                isPermissionDenied
                title="Hospital Staff Clearance Required"
                message="Only registered hospital nodal coordinators can view patient HLA tissue dossiers."
                retryText="Request Institutional Role"
                onRetry={() => alert('Role request sent to platform administrator.')}
              />
            </div>
          </section>
        </div>
      </PageContainer>

      {/* 8. Reusable Dialog / Modal Component Showcase */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="THOTA Section 19 Statutory Verification"
        description="Statutory legal clearance confirmation for living donor joint affidavit submission."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs text-[#0F172A] leading-relaxed">
          <p>
            Under Section 19 of the Transplantation of Human Organs and Tissues Act (THOTA), 1994, any commercial dealing in human organs is strictly illegal.
          </p>
          <div className="p-3 rounded-xl bg-[#F4F8FF] border border-[#2563EB]/30 space-y-1">
            <div className="font-bold text-[#2563EB]">Mandatory Declaration</div>
            <p className="text-[#64748B]">
              Both donor and recipient declare that no monetary consideration, direct benefit, or inducement is involved.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              alert('Declaration acknowledged.');
              setIsDialogOpen(false);
            }}
          >
            Acknowledge & Confirm
          </Button>
        </DialogFooter>
      </Dialog>

      {/* 9. Footer Component Showcase */}
      <Footer />
    </div>
  );
};
