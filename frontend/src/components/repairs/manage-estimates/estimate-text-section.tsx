"use client";

interface EstimateTextSectionProps {
  slogan: string;
  footer: string;
  termsAndCondition: string;
  onSloganChange: (value: string) => void;
  onFooterChange: (value: string) => void;
  onTermsChange: (value: string) => void;
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="mb-1 block text-sm font-medium text-[#374151]">{children}</label>;
}

export function EstimateTextSection({
  slogan,
  footer,
  termsAndCondition,
  onSloganChange,
  onFooterChange,
  onTermsChange,
}: EstimateTextSectionProps) {
  return (
    <div className="space-y-3">
      <div>
        <Label>Slogan</Label>
        <input
          value={slogan}
          onChange={(e) => onSloganChange(e.target.value)}
          placeholder="Your estimate slogan here"
          className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
        />
      </div>
      <div>
        <Label>Footer</Label>
        <input
          value={footer}
          onChange={(e) => onFooterChange(e.target.value)}
          placeholder="Your estimate footer here"
          className="h-10 w-full rounded-md border border-[#E5E7EB] bg-white px-3 text-sm placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
        />
      </div>
      <div>
        <Label>Terms &amp; Condition</Label>
        <textarea
          value={termsAndCondition}
          onChange={(e) => onTermsChange(e.target.value)}
          placeholder="Your terms and conditions here"
          className="min-h-[120px] w-full resize-y rounded-md border border-[#E5E7EB] bg-white px-3 py-2 text-sm placeholder:text-[#9CA3AF] focus:border-(--repair-primary) focus:outline-none focus:ring-1 focus:ring-(--repair-primary)"
        />
      </div>
    </div>
  );
}
