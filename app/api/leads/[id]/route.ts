import { NextRequest, NextResponse } from 'next/server';
import { whopSdk } from '@/lib/whop-sdk';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await whopSdk.verifyUserToken(req.headers);
    const { id: leadId } = await params;
    const companyId = req.nextUrl.searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID required' },
        { status: 400 }
      );
    }

    const access = await whopSdk.users.checkAccess(companyId, { id: userId });
    if (access.access_level !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${backendUrl}/leads/${leadId}`, {
      headers: {
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
    console.error('Get lead API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await whopSdk.verifyUserToken(req.headers);
    const { id: leadId } = await params;
    const body = await req.json();
    const { companyId } = body;
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID required' },
        { status: 400 }
      );
    }

    const access = await whopSdk.users.checkAccess(companyId, { id: userId });
    if (access.access_level !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${backendUrl}/leads/${leadId}`, {
      method: 'PUT',
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
    console.error('Update lead API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update lead' },
      { status: 500 }
    );
  }
}
