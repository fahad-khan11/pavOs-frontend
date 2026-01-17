"use client"

import { useEffect } from "react"
import { useAppDispatch } from "@/lib/redux/hook"
import { setWhopData, WhopUser, WhopCompany, WhopAccess } from "@/lib/redux/whopSlice"

interface WhopDataInitializerProps {
  user: WhopUser
  company: WhopCompany
  access: WhopAccess
  token: string
}

export function WhopDataInitializer({ user, company, access, token }: WhopDataInitializerProps) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(setWhopData({ user, company, access, token }))
  }, [dispatch, user, company, access, token])

  return null
}
