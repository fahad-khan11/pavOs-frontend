import { whopsdk } from '@/lib/whop-sdk';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest) {
  try {
    // ✅ Verify Whop token on every request (server-side)
    const { userId } = await whopsdk.verifyUserToken(req.headers);
    
    // Extract companyId from query params
    const companyId = req.nextUrl.searchParams.get('companyId');
    
    if (!companyId) {
      return NextResponse.json(
        { success: false, error: 'Company ID required' },
        { status: 400 }
      );
    }

    // Verify user has access to this company
    const access = await whopsdk.users.checkAccess(companyId, { id: userId });
    
    if (access.access_level !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Call backend with verified Whop identifiers
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${backendUrl}/dashboard/analytics`, {
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
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
