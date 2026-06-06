import { NextResponse } from "next/server";
import { clerkClient } from "@/lib/auth-server";
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
    // Fetch users from Clerk (mock using Supabase profiles)
    const client = await clerkClient();
    const userList = await client.users.getUserList({
      limit: 100,
      orderBy: "-created_at",
    });

    const clerkUsers = userList?.data || [];

    // Fetch profiles from Supabase
    const admin = getAdminClient();
    const { data: profiles, error: profilesError } = await admin
      .from("profiles")
      .select("user_id, kyc_status, created_at, email, full_name, phone, role");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
    }

    // Fetch balances
    const { data: balances, error: balancesError } = await admin
      .from("user_balances")
      .select("user_id, balance, profit_balance, total_deposits, total_withdrawals");

    if (balancesError) {
      console.error("Error fetching balances:", balancesError);
    }

    // Create maps
    const profilesMap: Record<string, any> = {};
    (profiles || []).forEach((profile: any) => {
      profilesMap[profile.user_id] = profile;
    });

    const balancesMap: Record<string, any> = {};
    (balances || []).forEach((b: any) => {
      balancesMap[b.user_id] = b;
    });

    // Combine Clerk users with profile and balance data
    const combinedUsers = clerkUsers.map((clerkUser: any) => {
      const profile = profilesMap[clerkUser.id] || {};
      const bal = balancesMap[clerkUser.id] || {};
      return {
        user_id: clerkUser.id,
        full_name: clerkUser.firstName && clerkUser.lastName
          ? `${clerkUser.firstName} ${clerkUser.lastName}`
          : clerkUser.firstName || clerkUser.lastName || "Unnamed",
        email: clerkUser.emailAddresses?.[0]?.emailAddress || profile.email || "-",
        phone: profile.phone || "-",
        kyc_status: profile.kyc_status || "pending",
        role: profile.role || "user",
        balance: bal.balance || 0,
        profit_balance: bal.profit_balance || 0,
        total_deposits: bal.total_deposits || 0,
        total_withdrawals: bal.total_withdrawals || 0,
        created_at: profile.created_at || new Date(clerkUser.createdAt || Date.now()).toISOString(),
      };
    });

    return NextResponse.json({ users: combinedUsers });
  } catch (error: any) {
    console.error("Error fetching users list:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch users", users: [] },
      { status: 500 }
    );
  }
}
