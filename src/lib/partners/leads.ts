import { getSupabaseAdmin } from "@/lib/supabase/admin";

export interface PartnerLead {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  role: string | null;
  interest: string | null;
  message: string | null;
  source: string;
  createdAt: string;
}

interface PartnerLeadRow {
  id: string;
  name: string;
  email: string;
  organization: string | null;
  role: string | null;
  interest: string | null;
  message: string | null;
  source: string;
  created_at: string;
}

function rowToLead(row: PartnerLeadRow): PartnerLead {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    organization: row.organization,
    role: row.role,
    interest: row.interest,
    message: row.message,
    source: row.source,
    createdAt: row.created_at,
  };
}

export async function insertPartnerLead(input: {
  name: string;
  email: string;
  organization?: string;
  role?: string;
  interest?: string;
  message?: string;
  source?: string;
}): Promise<PartnerLead> {
  const supabase = getSupabaseAdmin();
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase
    .from("partner_leads")
    .insert({
      name: input.name.trim(),
      email: input.email.trim(),
      organization: input.organization?.trim() || null,
      role: input.role?.trim() || null,
      interest: input.interest?.trim() || null,
      message: input.message?.trim() || null,
      source: input.source?.trim() || "community",
    })
    .select("*")
    .single();

  if (error) throw new Error(error.message);
  return rowToLead(data as PartnerLeadRow);
}

export async function countPartnerLeads(): Promise<number> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("partner_leads")
    .select("id", { count: "exact", head: true });

  if (error) return 0;
  return count ?? 0;
}
