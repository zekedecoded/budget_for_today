import { BudgetTicket } from '../components/BudgetTicket'
import { DailyLimitsBoard } from '../components/DailyLimitsBoard'
import { ReceiptPanel } from '../components/ReceiptPanel'
import { DebtSavingsDisplay } from '../components/DebtSavingsDisplay'
import { useAuth } from '../context/AuthContext'

export function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-col items-center">
        <div className="daily-drop-header">
          <h1 className="daily-drop-title">Today's Daily Drop</h1>
          <p className="daily-drop-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase()}
          </p>
        </div>

        <div className="w-full max-w-[340px]">
          <BudgetTicket />
        </div>

        {user && (
          <div className="mt-4 w-full max-w-[340px]">
            <ReceiptPanel />
          </div>
        )}

        {user && (
          <div className="mt-4 w-full max-w-[340px]">
            <DebtSavingsDisplay />
          </div>
        )}

        <div className="mt-6 w-full max-w-lg">
          <DailyLimitsBoard />
        </div>
      </div>
    </div>
  )
}