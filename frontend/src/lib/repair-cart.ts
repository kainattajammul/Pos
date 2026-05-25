import type { RepairPart } from "@/lib/repairs-parts-data";
import type { RepairProblem } from "@/lib/repairs-problems-data";
import type { RepairDetailsFormValues } from "@/lib/repairs-details-data";

export type RepairCartLineKind = "issue" | "part" | "service";

export interface RepairCartLineItem {
  id: string;
  kind: RepairCartLineKind;
  qty: number;
  name: string;
  price: number;
  tax: number;
  total: number;
}

export interface RepairCartTotals {
  itemCount: number;
  subTotal: number;
  discount: number;
  tax: number;
  total: number;
}

export interface BuildRepairCartLineItemsInput {
  selectedProblemIds: string[];
  selectedPartIds: string[];
  problems: RepairProblem[];
  parts: RepairPart[];
  repairCharges: string;
}

export function buildRepairCartLineItems(
  input: BuildRepairCartLineItemsInput,
): RepairCartLineItem[] {
  const lines: RepairCartLineItem[] = [];

  for (const problemId of input.selectedProblemIds) {
    const problem = input.problems.find((p) => p.id === problemId && !p.isAdd);
    if (!problem) continue;
    lines.push({
      id: `issue-${problem.id}`,
      kind: "issue",
      qty: 1,
      name: problem.name,
      price: problem.price,
      tax: 0,
      total: problem.price,
    });
  }

  for (const partId of input.selectedPartIds) {
    const part = input.parts.find((p) => p.id === partId && !p.isAdd);
    if (!part) continue;
    lines.push({
      id: `part-${part.id}`,
      kind: "part",
      qty: 1,
      name: part.name,
      price: part.price,
      tax: 0,
      total: part.price,
    });
  }

  if (lines.length === 0) {
    const charge = Number.parseFloat(input.repairCharges);
    if (Number.isFinite(charge) && charge > 0) {
      lines.push({
        id: "service-repair",
        kind: "service",
        qty: 1,
        name: "Repair service",
        price: charge,
        tax: 0,
        total: charge,
      });
    }
  }

  return lines;
}

export function computeRepairCartTotals(
  lines: RepairCartLineItem[],
  detailsForm: RepairDetailsFormValues,
): RepairCartTotals {
  const itemCount = lines.reduce((sum, line) => sum + line.qty, 0);
  const subTotal = lines.reduce((sum, line) => sum + line.total, 0);
  const tax = lines.reduce((sum, line) => sum + line.tax, 0);

  const parsedCharge = Number.parseFloat(detailsForm.repairCharges);
  const total =
    Number.isFinite(parsedCharge) && parsedCharge >= 0 ? parsedCharge : subTotal;

  const discount = subTotal > total ? subTotal - total : 0;

  return {
    itemCount,
    subTotal,
    discount,
    tax,
    total,
  };
}

export function formatCartMoney(amount: number): string {
  return `$${amount.toFixed(2)}`;
}
