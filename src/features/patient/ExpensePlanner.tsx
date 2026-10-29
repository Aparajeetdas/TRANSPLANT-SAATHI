import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Edit3,
  IndianRupee,
  Info,
  Plus,
  RefreshCw,
  Scale,
  Trash2
} from 'lucide-react';
import React, { useState } from 'react';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { SkeletonCard } from '../../components/ui/LoadingSkeleton';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { recordAuditLog } from '../../lib/store';
import { ExpenseItem, ExpensePlan } from '../../types';
import { usePatientExpensePlan } from './usePatientData';

function createItemId(): string {
  return `item-${Date.now()}`;
}

export const ExpensePlanner: React.FC = () => {
  const { currentUser } = useAuth();
  const { plan, isLoading, isError, refetch, savePlan, isSaving } = usePatientExpensePlan();
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isEditBudgetModalOpen, setIsEditBudgetModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ExpenseItem | null>(null);

  // New item state
  const [itemCategory, setItemCategory] = useState<ExpenseItem['category']>('pre_op');
  const [itemCategoryLabel, setItemCategoryLabel] = useState('Recipient Pre-Operative Fitness Workup');
  const [itemDescription, setItemDescription] = useState('');
  const [itemEstimated, setItemEstimated] = useState('');

  // Edit item form state
  const [editDescription, setEditDescription] = useState('');
  const [editEstimated, setEditEstimated] = useState('');
  const [editActual, setEditActual] = useState('');
  const [editCategory, setEditCategory] = useState<ExpenseItem['category']>('pre_op');
  const [editCategoryLabel, setEditCategoryLabel] = useState('');
  const [editIsPaid, setEditIsPaid] = useState(false);
  const [editReceiptRef, setEditReceiptRef] = useState('');

  // Budget edit state
  const [targetBudget, setTargetBudget] = useState(String(plan.targetBudget));
  const [sanctionedAmount, setSanctionedAmount] = useState(String(plan.sanctionedAmount));
  const [schemeName, setSchemeName] = useState(plan.schemeName || 'Ayushman Bharat PM-JAY');
  const [hasGovernmentScheme, setHasGovernmentScheme] = useState(plan.hasGovernmentScheme);

  // Financial Calculations
  const totalEstimated = plan.items.reduce((sum, item) => sum + item.estimatedAmount, 0);
  const totalActual = plan.items.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
  const netEstimatedOutOfPocket = Math.max(0, totalEstimated - (plan.hasGovernmentScheme ? plan.sanctionedAmount : 0));
  const variance = totalActual - totalEstimated;
  const isOverBudget = variance > 0;

  const handleTogglePaid = (itemId: string) => {
    const updatedItems = plan.items.map((item) => {
      if (item.id === itemId) {
        const isPaid = !item.isPaid;
        return {
          ...item,
          isPaid,
          actualAmount: isPaid && item.actualAmount === 0 ? item.estimatedAmount : item.actualAmount
        };
      }
      return item;
    });

    const updatedPlan: ExpensePlan = {
      ...plan,
      items: updatedItems,
      updatedAt: new Date().toISOString()
    };
    savePlan(updatedPlan);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const est = parseFloat(itemEstimated);
    if (isNaN(est) || est <= 0 || !itemDescription.trim()) return;

    const newItem: ExpenseItem = {
      id: createItemId(),
      planId: plan.id,
      category: itemCategory,
      categoryLabel: itemCategoryLabel,
      description: itemDescription,
      estimatedAmount: est,
      actualAmount: 0,
      isPaid: false
    };

    const updatedPlan: ExpensePlan = {
      ...plan,
      items: [...plan.items, newItem],
      updatedAt: new Date().toISOString()
    };

    savePlan(updatedPlan);
    if (currentUser) {
      recordAuditLog(currentUser, 'EXPENSE_ITEM_CREATED', 'expense_items', newItem.id, {
        category: newItem.category,
        description: newItem.description,
        estimated: newItem.estimatedAmount
      });
    }

    setIsAddItemModalOpen(false);
    setItemDescription('');
    setItemEstimated('');
  };

  const handleOpenEditItem = (item: ExpenseItem) => {
    setEditingItem(item);
    setEditDescription(item.description);
    setEditEstimated(String(item.estimatedAmount));
    setEditActual(String(item.actualAmount || 0));
    setEditCategory(item.category);
    setEditCategoryLabel(item.categoryLabel);
    setEditIsPaid(item.isPaid);
    setEditReceiptRef(item.receiptReference || '');
  };

  const handleSaveEditItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const est = parseFloat(editEstimated) || 0;
    const act = parseFloat(editActual) || 0;

    const updatedItem: ExpenseItem = {
      ...editingItem,
      description: editDescription.trim(),
      category: editCategory,
      categoryLabel: editCategoryLabel,
      estimatedAmount: est,
      actualAmount: act,
      isPaid: editIsPaid,
      receiptReference: editReceiptRef.trim() || undefined
    };

    const updatedPlan: ExpensePlan = {
      ...plan,
      items: plan.items.map((i) => (i.id === editingItem.id ? updatedItem : i)),
      updatedAt: new Date().toISOString()
    };

    savePlan(updatedPlan);
    if (currentUser) {
      recordAuditLog(currentUser, 'EXPENSE_ITEM_UPDATED', 'expense_items', updatedItem.id, {
        description: updatedItem.description,
        estimated: updatedItem.estimatedAmount,
        actual: updatedItem.actualAmount
      });
    }

    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    const targetItem = plan.items.find((i) => i.id === itemId);
    const updatedPlan: ExpensePlan = {
      ...plan,
      items: plan.items.filter((i) => i.id !== itemId),
      updatedAt: new Date().toISOString()
    };

    savePlan(updatedPlan);
    if (currentUser && targetItem) {
      recordAuditLog(currentUser, 'EXPENSE_ITEM_DELETED', 'expense_items', itemId, {
        description: targetItem.description
      });
    }
  };

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedPlan: ExpensePlan = {
      ...plan,
      targetBudget: parseFloat(targetBudget) || 0,
      sanctionedAmount: parseFloat(sanctionedAmount) || 0,
      schemeName: hasGovernmentScheme ? schemeName : undefined,
      hasGovernmentScheme,
      updatedAt: new Date().toISOString()
    };

    savePlan(updatedPlan);
    if (currentUser) {
      recordAuditLog(currentUser, 'EXPENSE_BUDGET_ADJUSTED', 'expense_plans', updatedPlan.id, {
        targetBudget: updatedPlan.targetBudget,
        sanctionedAmount: updatedPlan.sanctionedAmount,
        hasScheme: updatedPlan.hasGovernmentScheme
      });
    }

    setIsEditBudgetModalOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Statutory Disclaimer Banner - Financial Relief Not Guaranteed */}
      <Alert
        variant="statutory"
        title="Statutory Notice: Financial Assistance is Not Guaranteed"
      >
        Transplant Saathi provides non-clinical administrative cost planning and expense projection. Government scheme grants (such as Ayushman Bharat PM-JAY and Rashtriya Arogya Nidhi) and charitable relief subsidies are subject to statutory eligibility verification and hospital Authorization Committee pre-authorization. <strong>Financial assistance or grant approvals are NOT guaranteed by Transplant Saathi.</strong>
      </Alert>

      {/* Overview Financial Metrics */}
      <Card className="p-6 bg-white border-[#E2E8F0]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] font-heading flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-[#2563EB]" />
              Transplant Expense & Financial Planning
            </h2>
            <p className="text-xs text-[#64748B]">
              Comprehensive budgeting covering living donor workup, surgery package, lodging, and immunosuppressants.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setTargetBudget(String(plan.targetBudget));
                setSanctionedAmount(String(plan.sanctionedAmount));
                setSchemeName(plan.schemeName || 'Ayushman Bharat PM-JAY');
                setHasGovernmentScheme(plan.hasGovernmentScheme);
                setIsEditBudgetModalOpen(true);
              }}
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Adjust Budget & Schemes
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsAddItemModalOpen(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Expense Item
            </Button>
          </div>
        </div>

        {/* 4 Stat Metric Cards */}
        {isLoading ? (
          <SkeletonCard count={4} />
        ) : isError ? (
          <div className="p-4 text-center bg-[#F4F8FF] rounded-xl border border-[#2563EB]/20 space-y-2">
            <p className="text-xs text-[#64748B]">Failed to synchronize budget data with the database.</p>
            <Button variant="secondary" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Retry Sync
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#F4F8FF] border border-[#E2E8F0]">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Estimated Total Cost
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A] mt-1 font-heading">
                ₹{totalEstimated.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">
                Target Budget: ₹{plan.targetBudget.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0]">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Government / Scheme Relief
              </div>
              <div className="text-2xl font-extrabold text-[#2563EB] mt-1 font-heading">
                ₹{(plan.hasGovernmentScheme ? plan.sanctionedAmount : 0).toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-[#2563EB] mt-1">
                {plan.hasGovernmentScheme ? plan.schemeName : 'No Scheme Linked'}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#2563EB]/30">
              <div className="text-[11px] font-bold text-[#1D4ED8] uppercase tracking-wider">
                Net Out-Of-Pocket Target
              </div>
              <div className="text-2xl font-extrabold text-[#1D4ED8] mt-1 font-heading">
                ₹{netEstimatedOutOfPocket.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">
                Amount patient/family must prepare
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white border border-[#E2E8F0]">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                Actual Paid to Date
              </div>
              <div className="text-2xl font-extrabold text-[#0F172A] mt-1 font-heading">
                ₹{totalActual.toLocaleString('en-IN')}
              </div>
              <div className="text-[11px] text-[#64748B] mt-1">
                Remaining to Pay: ₹{Math.max(0, netEstimatedOutOfPocket - totalActual).toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Variance Analysis: Estimated vs. Actual Costs */}
      <Card className="p-6 bg-white border-[#E2E8F0]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-2">
              <Scale className="w-4 h-4 text-[#2563EB]" />
              Cost Variance Analysis (Estimated vs. Actual Costs)
            </h3>
            <p className="text-xs text-[#64748B]">
              Real-time audit comparing projected expenses against verified invoices and out-of-pocket receipts.
            </p>
          </div>
          <Badge variant={isOverBudget ? 'navy' : 'primary'}>
            {isOverBudget ? (
              <span className="flex items-center gap-1 text-[#0F172A]">
                <ArrowUpRight className="w-3.5 h-3.5 text-[#1D4ED8]" />
                Variance: +₹{variance.toLocaleString('en-IN')} (Over Estimate)
              </span>
            ) : (
              <span className="flex items-center gap-1 text-white">
                <ArrowDownRight className="w-3.5 h-3.5 text-white" />
                Within Estimate ({totalEstimated > 0 ? `${Math.round((totalActual / totalEstimated) * 100)}% utilized` : '0%'})
              </span>
            )}
          </Badge>
        </div>

        {/* Progress Comparison Bar */}
        <div className="space-y-2 p-4 bg-[#F4F8FF]/60 rounded-xl border border-[#E2E8F0]">
          <div className="flex justify-between text-xs text-[#0F172A] font-medium">
            <span>Expenditure against Projected Budget</span>
            <span className="font-bold text-[#2563EB]">
              ₹{totalActual.toLocaleString('en-IN')} of ₹{totalEstimated.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-[#E2E8F0]">
            <div
              className={`h-full transition-all duration-300 ${isOverBudget ? 'bg-[#1D4ED8]' : 'bg-[#2563EB]'}`}
              style={{ width: `${Math.min(100, totalEstimated > 0 ? (totalActual / totalEstimated) * 100 : 0)}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Itemized Breakdown Table with Edit/Delete/Variance */}
      <Card className="p-6 bg-white border-[#E2E8F0]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0F172A]">
            Itemized Expense Breakdown ({plan.items.length} Items)
          </h3>
          <span className="text-xs text-[#64748B]">Click checkbox to toggle payment status</span>
        </div>

        {plan.items.length === 0 ? (
          <EmptyState
            title="No Expense Items in Plan"
            description="Add donor typing, hospital packages, immunosuppressants, or lodging estimates to project your total out-of-pocket budget."
            actionText="Add First Expense Item"
            onAction={() => setIsAddItemModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F4F8FF] border-b border-[#E2E8F0] text-[#64748B] font-bold">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Pillar / Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Estimated</th>
                  <th className="py-3 px-4 text-right">Actual Paid</th>
                  <th className="py-3 px-4 text-right">Variance</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {plan.items.map((item) => {
                  const itemVariance = (item.actualAmount || 0) - item.estimatedAmount;
                  const itemOver = itemVariance > 0;
                  return (
                    <tr key={item.id} className="hover:bg-[#F4F8FF]/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleTogglePaid(item.id)}
                          disabled={isSaving}
                          className={`w-5 h-5 rounded flex items-center justify-center border transition-all cursor-pointer ${
                            item.isPaid
                              ? 'bg-[#2563EB] border-[#2563EB] text-white'
                              : 'border-[#64748B]/40 hover:border-[#2563EB]'
                          }`}
                          title={item.isPaid ? 'Mark as Unpaid' : 'Mark as Paid'}
                        >
                          {item.isPaid && <Check className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#0F172A]">
                        <Badge variant="neutral" className="text-[10px]">
                          {item.categoryLabel}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-[#0F172A]">
                        <div>{item.description}</div>
                        {item.receiptReference && (
                          <div className="text-[10px] text-[#2563EB] font-mono mt-0.5">
                            Receipt: {item.receiptReference}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-[#0F172A]">
                        ₹{item.estimatedAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#2563EB]">
                        ₹{(item.actualAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold">
                        {item.actualAmount === 0 ? (
                          <span className="text-[#64748B]">Pending</span>
                        ) : itemOver ? (
                          <span className="text-[#1D4ED8] font-bold">
                            +₹{itemVariance.toLocaleString('en-IN')}
                          </span>
                        ) : itemVariance < 0 ? (
                          <span className="text-[#2563EB]">
                            -₹{Math.abs(itemVariance).toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-[#64748B]">Exact</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleOpenEditItem(item)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#F4F8FF] transition-colors cursor-pointer"
                            title="Edit Item"
                            aria-label={`Edit ${item.description}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4F8FF] transition-colors cursor-pointer"
                            title="Delete Item"
                            aria-label={`Delete ${item.description}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Advisory & Scheme Notes */}
      <Card className="p-4 bg-[#F4F8FF] border border-[#2563EB]/20">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
          <div className="text-xs text-[#0F172A] space-y-1">
            <span className="font-bold">Hospital Package Notice:</span>
            <p className="text-[#64748B] leading-relaxed">
              Hospital surgical estimates include standard ICU and inpatient stay. Additional costs may arise for extended ICU ventilation, dialysis, high-dose plasmapheresis, or treatment of acute rejection episodes. Inquire with the hospital financial counselor regarding PM-JAY and state CM relief fund pre-authorization.
            </p>
          </div>
        </div>
      </Card>

      {/* Add Item Modal */}
      <Modal isOpen={isAddItemModalOpen} onClose={() => setIsAddItemModalOpen(false)} title="Add Expense Item">
        <form onSubmit={handleAddItem} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-semibold text-[#0F172A] mb-1">Pillar Category *</label>
            <select
              value={itemCategory}
              onChange={(e) => {
                const cat = e.target.value as ExpenseItem['category'];
                setItemCategory(cat);
                const labels: Record<ExpenseItem['category'], string> = {
                  donor_eval: 'Living Donor Evaluation & Tissue Typing',
                  pre_op: 'Recipient Pre-Operative Fitness Workup',
                  hospital_package: 'Hospital Surgical & Modular OT Package',
                  lodging_travel: 'Lodging, Diet & Inter-City Transit',
                  immunosuppressants: 'Initial 6-Month Immunosuppressive Therapy',
                  margin_of_safety: 'Emergency Complication Buffer'
                };
                setItemCategoryLabel(labels[cat]);
              }}
              className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="donor_eval">Living Donor Evaluation & Tissue Typing</option>
              <option value="pre_op">Recipient Pre-Operative Fitness Workup</option>
              <option value="hospital_package">Hospital Surgical & Modular OT Package</option>
              <option value="lodging_travel">Lodging, Diet & Inter-City Transit</option>
              <option value="immunosuppressants">Initial 6-Month Immunosuppressive Therapy</option>
              <option value="margin_of_safety">Emergency Complication Buffer</option>
            </select>
          </div>

          <Input
            label="Item Description *"
            required
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            placeholder="e.g. HLA high-resolution typing + Donor CT Angiography"
          />

          <Input
            label="Estimated Amount (₹) *"
            type="number"
            required
            value={itemEstimated}
            onChange={(e) => setItemEstimated(e.target.value)}
            placeholder="e.g. 45000"
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddItemModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
              Add Item
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        title="Edit Expense Item & Record Invoice"
      >
        {editingItem && (
          <form onSubmit={handleSaveEditItem} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1">Pillar Category *</label>
              <select
                value={editCategory}
                onChange={(e) => {
                  const cat = e.target.value as ExpenseItem['category'];
                  setEditCategory(cat);
                  const labels: Record<ExpenseItem['category'], string> = {
                    donor_eval: 'Living Donor Evaluation & Tissue Typing',
                    pre_op: 'Recipient Pre-Operative Fitness Workup',
                    hospital_package: 'Hospital Surgical & Modular OT Package',
                    lodging_travel: 'Lodging, Diet & Inter-City Transit',
                    immunosuppressants: 'Initial 6-Month Immunosuppressive Therapy',
                    margin_of_safety: 'Emergency Complication Buffer'
                  };
                  setEditCategoryLabel(labels[cat]);
                }}
                className="w-full text-xs p-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                <option value="donor_eval">Living Donor Evaluation & Tissue Typing</option>
                <option value="pre_op">Recipient Pre-Operative Fitness Workup</option>
                <option value="hospital_package">Hospital Surgical & Modular OT Package</option>
                <option value="lodging_travel">Lodging, Diet & Inter-City Transit</option>
                <option value="immunosuppressants">Initial 6-Month Immunosuppressive Therapy</option>
                <option value="margin_of_safety">Emergency Complication Buffer</option>
              </select>
            </div>

            <Input
              label="Item Description *"
              required
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Estimated Amount (₹) *"
                type="number"
                required
                value={editEstimated}
                onChange={(e) => setEditEstimated(e.target.value)}
              />
              <Input
                label="Actual Amount Paid (₹)"
                type="number"
                value={editActual}
                onChange={(e) => setEditActual(e.target.value)}
              />
            </div>

            <Input
              label="Receipt / Bill Reference Number"
              value={editReceiptRef}
              onChange={(e) => setEditReceiptRef(e.target.value)}
              placeholder="e.g. AIIMS-BIL-2026-901"
            />

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="editIsPaid"
                checked={editIsPaid}
                onChange={(e) => setEditIsPaid(e.target.checked)}
                className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
              />
              <label htmlFor="editIsPaid" className="text-xs font-semibold text-[#0F172A] cursor-pointer">
                Mark as Settled / Paid in Full
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
              <Button variant="ghost" size="sm" type="button" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Adjust Budget Modal */}
      <Modal isOpen={isEditBudgetModalOpen} onClose={() => setIsEditBudgetModalOpen(false)} title="Adjust Target Budget & Schemes">
        <form onSubmit={handleSaveBudget} className="space-y-4 text-left">
          <Input
            label="Target Total Budget (₹)"
            type="number"
            required
            value={targetBudget}
            onChange={(e) => setTargetBudget(e.target.value)}
          />

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="hasScheme"
              checked={hasGovernmentScheme}
              onChange={(e) => setHasGovernmentScheme(e.target.checked)}
              className="rounded border-[#E2E8F0] text-[#2563EB] focus:ring-[#2563EB]"
            />
            <label htmlFor="hasScheme" className="text-xs font-semibold text-[#0F172A] cursor-pointer">
              Recipient has Government / Charitable Healthcare Scheme
            </label>
          </div>

          {hasGovernmentScheme && (
            <>
              <Input
                label="Scheme Name"
                required
                value={schemeName}
                onChange={(e) => setSchemeName(e.target.value)}
                placeholder="e.g. Ayushman Bharat PM-JAY or Rashtriya Arogya Nidhi (RAN)"
              />
              <Input
                label="Sanctioned / Grant Amount (₹)"
                type="number"
                required
                value={sanctionedAmount}
                onChange={(e) => setSanctionedAmount(e.target.value)}
              />
            </>
          )}

          <div className="p-3 bg-[#F4F8FF] rounded-xl border border-[#2563EB]/20 text-[11px] text-[#64748B]">
            <strong>Important:</strong> Inclusion of a government scheme is for planning purposes only. Schemes require official empaneled hospital pre-authorization; assistance is not guaranteed by Transplant Saathi.
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#E2E8F0]">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditBudgetModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" isLoading={isSaving}>
              Save Budget Settings
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
