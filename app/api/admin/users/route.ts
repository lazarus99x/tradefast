import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
  if (!url || !key) throw new Error("Supabase env not configured");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function GET() {
  try {
    const admin = getAdminClient();

    // Fetch all profiles from Supabase directly
    const { data: profiles, error: profilesError } = await admin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return NextResponse.json(
        { error: profilesError.message, users: [] },
        { status: 500 }
      );
    }

    // Map profiles to the expected user format
    const users = (profiles || []).map((p: any) => ({
      id: p.user_id,
      firstName: p.full_name?.split(" ")[0] || p.full_name || "User",
      lastName: p.full_name?.split(" ").slice(1).join(" ") || "",
      emailAddresses: [{ emailAddress: p.email || "" }],
      createdAt: new Date(p.created_at || Date.now()).getTime(),
      kyc_status: p.kyc_status || "pending",
      role: p.role || "user",
      publicMetadata: {
        suspended: p.kyc_status === "suspended",
        role: p.role || "user",
        ...p,
      },
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch users", users: [] },
      { status: 500 }
    );
  }
}
