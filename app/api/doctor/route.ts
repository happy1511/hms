import { createAPI, deleteAPI, updateAPI } from "@/controllers/doctor/doctor";
import { withErrorHandling } from "@/lib/errorHandler";

export async function POST(request: Request) {
  return withErrorHandling(() => createAPI(request));
}

export async function PUT(request: Request) {
  return withErrorHandling(() => updateAPI(request));
}

export async function DELETE(request: Request) {
  return withErrorHandling(() => deleteAPI(request));
}
