import { NextResponse } from 'next/server';

export async function POST() {
  // With bearer tokens, logout is handled client-side by removing the token
  return NextResponse.json({ success: true });
}