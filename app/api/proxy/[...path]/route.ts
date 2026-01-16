import { whopsdk } from '@/lib/whop-sdk';
import { NextRequest, NextResponse } from 'next/server';


/**
 * Generic API proxy that verifies Whop token and forwards requests to backend
 * Handles: /api/proxy/[...path]
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(req, 'GET', params);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(req, 'POST', params);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(req, 'PUT', params);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(req, 'PATCH', params);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(req, 'DELETE', params);
}

async function handleRequest(
  req: NextRequest,
  method: string,
  params: Promise<{ path: string[] }>
) {
  try {
    // ✅ Verify Whop token on EVERY request (server-side)
    const { userId } = await whopsdk.verifyUserToken(req.headers);
    
    // Extract companyId from query params or body
    const companyId = req.nextUrl.searchParams.get('companyId');
    
    if (!companyId) {
      // Try to get from body for POST/PUT/PATCH
      if (method !== 'GET' && method !== 'DELETE') {
        try {
          const body = await req.clone().json();
          if (!body.companyId) {
            return NextResponse.json(
              { success: false, error: 'Company ID required' },
              { status: 400 }
            );
          }
        } catch (e) {
          return NextResponse.json(
            { success: false, error: 'Company ID required' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { success: false, error: 'Company ID required' },
          { status: 400 }
        );
      }
    }

    // Verify user has admin access to this company
    const access = await whopsdk.users.checkAccess(companyId, { id: userId });
    
    if (access.access_level !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Build backend URL
    const { path } = await params;
    const backendPath = path.join('/');
    const queryString = req.nextUrl.search;
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;
    const url = `${backendUrl}/${backendPath}${queryString}`;

    // Prepare request options
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Whop-User-Id': userId,
        'X-Whop-Company-Id': companyId,
      },
    };

    // Add body for POST/PUT/PATCH
    if (method !== 'GET' && method !== 'DELETE') {
      const body = await req.text();
      if (body) {
        options.body = body;
      }
    }

    // Forward request to backend
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend error (${response.status}):`, errorText);
      return NextResponse.json(
        { success: false, error: errorText || 'Backend request failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API proxy error:', error);
    
    // Handle Whop token verification errors
    if (error.message?.includes('token') || error.message?.includes('unauthorized')) {
      return NextResponse.json(
        { success: false, error: 'Authentication failed. Please reload the app.' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
