"use client";

import { Copy, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import type {
  BranchCommunicationSettings,
  BranchCustomerMessageTemplate,
  BranchRecord,
} from "@/lib/branch-types";
import {
  MESSAGE_TEMPLATE_PLACEHOLDERS,
  MESSAGE_TEMPLATE_TRIGGERS,
  createEmptyMessageTemplate,
  renderTemplatePreview,
} from "@/lib/branch-communication-defaults";
import {
  BranchSectionCard,
  branchInputClass,
  branchSelectClass,
  branchTextareaClass,
} from "@/components/branches/branch-ui-primitives";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BranchMessageTemplatesCardProps {
  branch: BranchRecord;
  onCommunicationChange: (communication: BranchCommunicationSettings) => void;
}

function updateTemplates(
  branch: BranchRecord,
  onCommunicationChange: (communication: BranchCommunicationSettings) => void,
  messageTemplates: BranchCustomerMessageTemplate[],
) {
  onCommunicationChange({
    ...branch.communication,
    messageTemplates,
  });
}

function updateTemplate(
  branch: BranchRecord,
  onCommunicationChange: (communication: BranchCommunicationSettings) => void,
  id: string,
  patch: Partial<BranchCustomerMessageTemplate>,
) {
  updateTemplates(
    branch,
    onCommunicationChange,
    branch.communication.messageTemplates.map((t) =>
      t.id === id ? { ...t, ...patch } : t,
    ),
  );
}

export function BranchMessageTemplatesCard({
  branch,
  onCommunicationChange,
}: BranchMessageTemplatesCardProps) {
  const templates = branch.communication.messageTemplates;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addTemplate = () => {
    const next = createEmptyMessageTemplate();
    updateTemplates(branch, onCommunicationChange, [...templates, next]);
    setExpandedId(next.id);
  };

  const duplicateTemplate = (template: BranchCustomerMessageTemplate) => {
    const copy: BranchCustomerMessageTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      name: `${template.name} (copy)`,
    };
    updateTemplates(branch, onCommunicationChange, [...templates, copy]);
    setExpandedId(copy.id);
  };

  const deleteTemplate = (id: string) => {
    updateTemplates(
      branch,
      onCommunicationChange,
      templates.filter((t) => t.id !== id),
    );
    if (expandedId === id) setExpandedId(null);
  };

  const previewTemplate = templates.find((t) => t.id === expandedId) ?? templates[0];

  return (
    <BranchSectionCard
      title="Customer message templates"
      description="Automated email and SMS messages sent to customers."
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={addTemplate}
        >
          <Plus className="size-4" />
          Add template
        </Button>
      }
    >
      {templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-6 py-10 text-center">
          <p className="text-sm text-[#6B7280]">
            No message templates yet. Create templates for repair updates, invoices, and reminders.
          </p>
          <Button type="button" size="sm" className="gap-1.5 border-0 bg-(--repair-primary) text-(--repair-on-primary)" onClick={addTemplate}>
            <Plus className="size-4" />
            Add template
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-3">
            {templates.map((template) => {
              const isExpanded = expandedId === template.id;
              const showSubject =
                template.channel === "email" || template.channel === "both";

              return (
                <div
                  key={template.id}
                  className="overflow-hidden rounded-md border border-[#E5E7EB] bg-white"
                >
                  <div className="flex flex-wrap items-center gap-3 border-b border-[#E5E7EB] bg-[#FAFAFA] px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-[#111827]">
                        {template.name}
                      </p>
                      <p className="text-xs text-[#6B7280]">
                        {template.channel.toUpperCase()} ·{" "}
                        {MESSAGE_TEMPLATE_TRIGGERS.find((t) => t.value === template.trigger)?.label ??
                          template.trigger}
                        {!template.enabled ? " · Disabled" : ""}
                      </p>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-medium text-[#374151]">
                      <input
                        type="checkbox"
                        checked={template.enabled}
                        onChange={(e) =>
                          updateTemplate(branch, onCommunicationChange, template.id, {
                            enabled: e.target.checked,
                          })
                        }
                        className="size-4 rounded border-[#D1D5DB]"
                      />
                      Enabled
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : template.id)}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F3F4F6]"
                        aria-label={isExpanded ? "Collapse template" : "Edit template"}
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => duplicateTemplate(template)}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F3F4F6]"
                        aria-label="Duplicate template"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTemplate(template.id)}
                        className="inline-flex size-8 items-center justify-center rounded-md border border-[#E5E7EB] bg-white text-red-600 hover:bg-red-50"
                        aria-label="Delete template"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  {isExpanded ? (
                    <div className="grid gap-4 p-4 sm:grid-cols-2">
                      <label className="space-y-1 sm:col-span-2">
                        <span className="text-sm font-medium text-[#374151]">Template name</span>
                        <input
                          value={template.name}
                          onChange={(e) =>
                            updateTemplate(branch, onCommunicationChange, template.id, {
                              name: e.target.value,
                            })
                          }
                          className={branchInputClass}
                        />
                      </label>
                      <label className="space-y-1">
                        <span className="text-sm font-medium text-[#374151]">Channel</span>
                        <select
                          value={template.channel}
                          onChange={(e) =>
                            updateTemplate(branch, onCommunicationChange, template.id, {
                              channel: e.target.value as BranchCustomerMessageTemplate["channel"],
                            })
                          }
                          className={branchSelectClass}
                        >
                          <option value="email">Email</option>
                          <option value="sms">SMS</option>
                          <option value="both">Both</option>
                        </select>
                      </label>
                      <label className="space-y-1">
                        <span className="text-sm font-medium text-[#374151]">Trigger / event</span>
                        <select
                          value={template.trigger}
                          onChange={(e) =>
                            updateTemplate(branch, onCommunicationChange, template.id, {
                              trigger: e.target.value,
                            })
                          }
                          className={branchSelectClass}
                        >
                          {MESSAGE_TEMPLATE_TRIGGERS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      {showSubject ? (
                        <label className="space-y-1 sm:col-span-2">
                          <span className="text-sm font-medium text-[#374151]">Subject (email)</span>
                          <input
                            value={template.subject}
                            onChange={(e) =>
                              updateTemplate(branch, onCommunicationChange, template.id, {
                                subject: e.target.value,
                              })
                            }
                            className={branchInputClass}
                          />
                        </label>
                      ) : null}
                      <label className="space-y-1 sm:col-span-2">
                        <span className="text-sm font-medium text-[#374151]">Body</span>
                        <textarea
                          value={template.body}
                          onChange={(e) =>
                            updateTemplate(branch, onCommunicationChange, template.id, {
                              body: e.target.value,
                            })
                          }
                          placeholder={`Use placeholders: ${MESSAGE_TEMPLATE_PLACEHOLDERS}`}
                          className={cn(branchTextareaClass, "min-h-[120px]")}
                        />
                      </label>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>

          {previewTemplate ? (
            <div className="rounded-md border border-[#E5E7EB] bg-[#FAFAFA] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-[#6B7280]">
                Preview ({previewTemplate.name})
              </p>
              {previewTemplate.channel !== "sms" && previewTemplate.subject ? (
                <p className="mt-2 text-sm font-semibold text-[#111827]">
                  Subject: {renderTemplatePreview(previewTemplate.subject, branch.name)}
                </p>
              ) : null}
              <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-[#374151]">
                {renderTemplatePreview(previewTemplate.body, branch.name)}
              </pre>
            </div>
          ) : null}
        </div>
      )}
    </BranchSectionCard>
  );
}
