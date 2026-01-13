import { NextRequest, NextResponse } from 'next/server';
import { whopSdk } from '@/lib/whop-sdk';

export async function GET(req: NextRequest) {
  try {
    // ✅ Verify Whop token on every request (server-side)
    const { userId } = await whopSdk.verifyUserToken(req.headers);
    
    const companyId = req.nextUrl.searchParams.get('companyId');
    const limit = req.nextUrl.searchParams.get('limit') || '5';
    
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

    // Call backend with verified identifiers
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${backendUrl}/dashboard/recent-activity?limit=${limit}`, {
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
    console.error('Recent activity API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
