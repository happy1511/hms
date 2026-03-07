import { getProfile, updateProfile } from "@/controllers/profile/profile";
import { withErrorHandling } from "@/lib/errorHandler";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return withErrorHandling(() => getProfile(request));
}

export async function PUT(request: NextRequest) {
  return withErrorHandling(() => updateProfile(request));
}
