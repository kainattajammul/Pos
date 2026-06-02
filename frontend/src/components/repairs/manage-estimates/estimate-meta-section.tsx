"use client";

interface EstimateMetaSectionProps {
  createdDate: string;
  dueDate: string;
  npoSo: string;
  onCreatedDateChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onNpoSoChange: (value: string) => void;
}

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_1fr] items-center gap-2">
      <span className="text-sm font-medium text-[#374151]">{label}</span>
      {children}
    </div>
  );
}

function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm text-[#111827] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
    />
  );
}

export function EstimateMetaSection({
  createdDate,
  dueDate,
  npoSo,
  onCreatedDateChange,
  onDueDateChange,
  onNpoSoChange,
}: EstimateMetaSectionProps) {
  return (
    <div className="space-y-3 pt-6">
      <MetaRow label="Created Date">
        <FieldInput value={createdDate} onChange={(e) => onCreatedDateChange(e.target.value)} />
      </MetaRow>
      <MetaRow label="Due Date">
        <FieldInput value={dueDate} onChange={(e) => onDueDateChange(e.target.value)} />
      </MetaRow>
      <MetaRow label="N.P.O/S.O">
        <FieldInput value={npoSo} onChange={(e) => onNpoSoChange(e.target.value)} />
      </MetaRow>
    </div>
  );
}
