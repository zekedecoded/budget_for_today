import { useState } from 'react'
import { BudgetTicket } from '../components/BudgetTicket'
import { DailyLimitSetter } from '../components/DailyLimitSetter'
import { DailyLimitsBoard } from '../components/DailyLimitsBoard'
import { useAuth } from '../context/AuthContext'

export function Dashboard() {
  const { user } = useAuth()
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">

      <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-center">
        <div className="w-full max-w-[340px] shrink-0">
          <BudgetTicket />
        </div>

        {user && (
          <div className="flex w-full max-w-sm flex-col gap-6">
            <DailyLimitSetter onSaved={() => setRefreshKey((k) => k + 1)} />
          </div>
        )}
      </div>

      <div className="mx-auto mt-8 w-full max-w-lg">
        <DailyLimitsBoard key={refreshKey} />
      </div>
    </div>
  )
}
