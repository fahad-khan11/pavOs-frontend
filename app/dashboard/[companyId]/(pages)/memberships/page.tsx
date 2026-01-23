"use client";

import { useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,  // Preserve the dev token in navigation links

} from "@/components/ui/breadcrumb";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hook";
import { fetchMembers } from "@/lib/redux/membersSlice";

const statusColors: Record<string, string> = {
  active: "bg-green-500",
  joined: "bg-green-500",
  cancelled: "bg-red-500",
  drafted: "bg-yellow-500",
};

const accessColors: Record<string, string> = {
  full_access: "bg-blue-500",
  admin: "bg-purple-500",
  customer: "bg-blue-500",
  limited_access: "bg-orange-500",
  no_access: "bg-gray-500",
};

export default function MembershipsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId = params.companyId as string;

  // Redux
  const dispatch = useAppDispatch();
  const { data: members, stats, isLoading, error } = useAppSelector((state) => state.members);
  const { isLoaded: isWhopLoaded } = useAppSelector((state) => state.whop);

  // Preserve the dev token in navigation links
  const devToken = searchParams.get("whop-dev-user-token");
  const tokenQuery = devToken ? `?whop-dev-user-token=${devToken}` : "";

  useEffect(() => {
    if (isWhopLoaded) {
      dispatch(fetchMembers());
    }
  }, [dispatch, isWhopLoaded]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Use stats from API if available, otherwise calculate (fallback/initial)
  const totalMembers = stats?.total_members ?? members.length;
  const activeMembers = stats?.active_members ?? members.filter(m => m.status === "joined" || m.status === "active").length;
  const cancelledMembers = stats?.cancelled_members ?? members.filter(m => m.status === "cancelled").length;
  const draftedMembers = stats?.drafted_members ?? members.filter(m => m.status === "drafted").length;
  const totalRevenue = stats?.total_revenue_usd ?? members.reduce((sum, m) => sum + (m.total_spent_usd || 0), 0);

  return (
    <div className="min-h-screen w-full bg-white dark:bg-gray-950 p-8">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href={`/dashboard/${companyId}/dashboard-page${tokenQuery}`}>Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Memberships</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Memberships</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                View and manage your current plan memberships.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="truncate">Total Members</CardDescription>
              <CardTitle className="text-2xl">{totalMembers}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="truncate">Active</CardDescription>
              <CardTitle className="text-2xl flex items-center justify-between">
                {activeMembers}
                <Badge className={statusColors.active || statusColors.joined}>Active</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="truncate">Cancelled</CardDescription>
              <CardTitle className="text-2xl flex items-center justify-between">
                {cancelledMembers}
                <Badge className={statusColors.cancelled}>Cancelled</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="truncate">Drafted</CardDescription>
              <CardTitle className="text-2xl flex items-center justify-between">
                {draftedMembers}
                <Badge className={statusColors.drafted}>Drafted</Badge>
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="truncate">Total Revenue</CardDescription>
              <CardTitle className="text-2xl">{formatCurrency(totalRevenue)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            Error loading members: {error}
          </div>
        )}

        {/* Memberships Table */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Access Level</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Action</TableHead>
                <TableHead className="text-right">Total Spent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Loading members...
                  </TableCell>
                </TableRow>
              ) : members.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No members found.
                  </TableCell>
                </TableRow>
              ) : (
                members.map((membership) => (
                  <TableRow 
                    key={membership.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-[#0e1d3a] dark:bg-[#F4C542] flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-white dark:text-gray-900">
                            {membership.name ? membership.name.charAt(0) : "?"}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {membership.name || "Unknown User"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {membership.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusColors[membership.status] || "bg-gray-500"} text-white`}>
                        {membership.status.charAt(0).toUpperCase() + membership.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${accessColors[membership.access_level] || "bg-gray-500"} text-white border-0`}>
                        {membership.access_level.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-900 dark:text-white">
                      {formatDate(membership.joined_at)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-gray-900 dark:text-white capitalize">
                          {membership.last_action}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(membership.last_action_at)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(membership.total_spent_usd)}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full h-8 w-8"
                        onClick={() => router.push(`memberships/${membership.id}${tokenQuery}`)}
                       >
                         <Eye className="h-4 w-4 text-gray-500 hover:text-gray-900 dark:hover:text-white" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
