"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hook";
import { fetchMemberDetails, clearSelectedMember } from "@/lib/redux/membersSlice";
import { User, DollarSign, Calendar, Shield, Activity, Phone, Mail, Building } from "lucide-react";

export default function MemberDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const companyId = params.companyId as string;
  const memberId = params.memberId as string;

  const dispatch = useAppDispatch();
  const { selectedMember, isLoading, error } = useAppSelector((state) => state.members);
  const member = selectedMember as any;
  const { isLoaded: isWhopLoaded } = useAppSelector((state) => state.whop);

  const devToken = searchParams.get("whop-dev-user-token");
  const tokenQuery = devToken ? `?whop-dev-user-token=${devToken}` : "";

  useEffect(() => {
    if (isWhopLoaded && memberId) {
      dispatch(fetchMemberDetails(memberId));
    }
    return () => {
        dispatch(clearSelectedMember());
    }
  }, [dispatch, isWhopLoaded, memberId]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined || amount === null) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
            <div className="text-gray-500">Loading member details...</div>
        </div>
    )
  }

  if (error) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
            <div className="text-red-500">Error: {error}</div>
        </div>
    )
  }

  if (!member) {
       return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
            <div className="text-gray-500">Member not found.</div>
        </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-950 p-8">
      <div className="container mx-auto py-8 space-y-8">
        
        {/* Header & Breadcrumb */}
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/dashboard/${companyId}/dashboard-page${tokenQuery}`}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/dashboard/${companyId}/memberships${tokenQuery}`}>Memberships</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Member Details</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-[#0e1d3a] dark:bg-[#F4C542] flex items-center justify-center shrink-0 text-xl font-bold text-white dark:text-gray-900">
                    {member.name?.charAt(0) || "?"}
                </div>
                <div>
                   <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{member.name || "N/A"}</h1>
                   <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Member ID: {member.id || "N/A"}
                   </p>
                </div>
            </div>
            
             <Badge className={
                 member.status === "joined" ? "bg-green-500" :
                 member.status === "active" ? "bg-green-500" :
                 member.status === "cancelled" ? "bg-red-500" : "bg-gray-500"
             }>
                 {member.status?.toUpperCase() || "N/A"}
             </Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            {/* User Info Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        User Information
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Email:</span>
                            <span className="text-gray-600 dark:text-gray-400">{member.email || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Username:</span>
                            <span className="text-gray-600 dark:text-gray-400">{member.username || "N/A"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">Phone:</span>
                            <span className="text-gray-600 dark:text-gray-400">{member.phone || "N/A"}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Membership Info Card */}
            <Card>
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Membership Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                         <div className="flex items-center justify-between">
                            <span className="font-medium">Access Level:</span>
                             <Badge variant="outline">{member.access_level?.toUpperCase() || "N/A"}</Badge>
                        </div>
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Total Spent:</span>
                            </div>
                            <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(member.total_spent_usd)}</span>
                        </div>
                         <div className="flex items-center justify-between">
                             <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-gray-500" />
                                <span className="font-medium">Company:</span>
                            </div>
                             <span className="text-gray-600 dark:text-gray-400">{member.company?.title || "N/A"}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

             {/* Activity Timeline Card */}
            <Card className="md:col-span-2">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Timestamps
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Joined At</p>
                            <p className="text-sm">{formatDate(member.joined_at)}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Last Updated</p>
                            <p className="text-sm">{formatDate(member.updated_at)}</p>
                        </div>
                         <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Created At</p>
                            <p className="text-sm">{formatDate(member.created_at)}</p>
                        </div>
                         <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-500">Last Action</p>
                            <div className="flex items-center gap-2">
                                <Activity className="h-3 w-3 text-gray-400" />
                                <span className="text-sm capitalize">{member.last_action || "N/A"}</span>
                            </div>
                            <p className="text-xs text-gray-500">at {formatDate(member.last_action_at)}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
