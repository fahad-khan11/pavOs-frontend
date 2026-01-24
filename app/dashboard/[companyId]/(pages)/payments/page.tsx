"use client"

import { useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/lib/redux/hook"
import { fetchPayments } from "@/lib/redux/paymentsSlice"
import { ChevronLeft, ChevronRight, CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentsPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const companyId = params.companyId as string

  const { data: payments, isLoading, error, pageInfo } = useAppSelector(
    (state) => state.payments
  )

  // Preserve the dev token in navigation links
  const devToken = searchParams?.get("whop-dev-user-token")
  const tokenQuery = devToken ? `?whop-dev-user-token=${devToken}` : ""

  useEffect(() => {
    dispatch(fetchPayments({}))
  }, [dispatch])

  const handleNextPage = () => {
    if (pageInfo.has_next_page && pageInfo.end_cursor) {
      dispatch(fetchPayments({ cursor: pageInfo.end_cursor, direction: "next" }))
    }
  }

  const handlePrevPage = () => {
    if (pageInfo.has_previous_page && pageInfo.start_cursor) {
      dispatch(fetchPayments({ cursor: pageInfo.start_cursor, direction: "prev" }))
    }
  }

  const formatCurrency = (amount: number, currency: string = "usd") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string, substatus: string) => {
    if (substatus === "succeeded") return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    if (status === "draft") return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    if (substatus === "failed") return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
  }

  if (isLoading && payments.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0e1d3a] dark:text-[#F4C542]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => dispatch(fetchPayments({}))}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 space-y-4">
          <nav className="text-sm text-gray-500 dark:text-gray-400">
           Payments
          </nav>
          <div className="flex items-center gap-3">
            <CreditCard className="h-8 w-8 text-[#0e1d3a] dark:text-[#F4C542]" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Payments
            </h1>
          </div>
          {/* <p className="text-gray-600 dark:text-gray-400">
            View and manage all payment transactions
          </p> */}
        </div>

        {/* Payments Table */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No payments found
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {/* Customer */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payment.user?.name || "N/A"}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {payment.user?.email || "N/A"}
                          </div>
                        </div>
                      </td>
                      {/* Product */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {payment.product?.title || "N/A"}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {payment.billing_reason?.replace(/_/g, " ") || "N/A"}
                        </div>
                      </td>
                      {/* Amount */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(payment.total, payment.currency)}
                        </div>
                        {payment.refunded_amount > 0 && (
                          <div className="text-xs text-red-500">
                            Refunded: {formatCurrency(payment.refunded_amount, payment.currency)}
                          </div>
                        )}
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            payment.status,
                            payment.substatus
                          )}`}
                        >
                          {payment.substatus || payment.status}
                        </span>
                      </td>
                      {/* Payment Method */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {payment.card_brand && (
                            <span className="text-sm capitalize text-gray-900 dark:text-white">
                              {payment.card_brand}
                            </span>
                          )}
                          {payment.card_last4 && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              •••• {payment.card_last4}
                            </span>
                          )}
                          {!payment.card_brand && !payment.card_last4 && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {payment.payment_method_type || "N/A"}
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(payment.paid_at || payment.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Showing {payments.length} payments
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={!pageInfo.has_previous_page || isLoading}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!pageInfo.has_next_page || isLoading}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
