import axios from 'axios';

// Define the interface for the profile data based on User Request
export interface WhopProfile {
  id: string;
  email: string;
  name: string;
  companyId: string;
  role: string;
  createdAt: string;
  lastLogin: string;
}

export interface WhopProfileResponse {
  success: boolean;
  data: WhopProfile;
}

// Function to fetch the profile
export const getWhopProfile = async (): Promise<WhopProfile> => {
  try {
    // Get token from localStorage as verified in auth-provider
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await axios.get<WhopProfileResponse>(`${process.env.NEXT_PUBLIC_API_URL}/whop/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Whop Profile Data:', response.data);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        console.error('❌ Error fetching Whop profile:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
        });
        const errorMessage = error.response?.data?.message || error.message;
        throw new Error(errorMessage);
    }
    console.error('❌ Unexpected error fetching Whop profile:', error);
    throw error;
  }
};
