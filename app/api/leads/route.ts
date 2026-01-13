import { NextRequest, NextResponse } from 'next/server';
import { whopSdk } from '@/lib/whop-sdk';

export async function GET(req: NextRequest) {
  try {
    // ✅ Verify Whop token
    const { userId } = await whopSdk.verifyUserToken(req.headers);
    
    const companyId = req.nextUrl.searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID required' },
        { status: 400 }
      );
    }

    // Verify access
    const access = await whopSdk.users.checkAccess(companyId, { id: userId });
    if (access.access_level !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all query params to forward
    const queryParams = new URLSearchParams(req.nextUrl.search);
    
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${backendUrl}/leads?${queryParams.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Whop-User-Id': userId,
        'X-Whop-Company-Id': companyId,
      },
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Leads API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // ✅ Verify Whop token
    const { userId } = await whopSdk.verifyUserToken(req.headers);
    
    const body = await req.json();
    const { companyId } = body;
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID required' },
        { status: 400 }
      );
    }

    // Verify access
    const access = await whopSdk.users.checkAccess(companyId, { id: userId });
    if (access.access_level !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${backendUrl}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Whop-User-Id': userId,
        'X-Whop-Company-Id': companyId,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Create lead API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create lead' },
      { status: 500 }
    );
  }
}
