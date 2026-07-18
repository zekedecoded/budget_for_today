import { BudgetTicket } from '../components/BudgetTicket'
import { DailyLimitsBoard } from '../components/DailyLimitsBoard'

export function Dashboard() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-col items-center">
        <div className="w-full max-w-[340px]">
          <BudgetTicket />
        </div>

        <div className="mt-8 w-full max-w-lg">
          <DailyLimitsBoard />
        </div>
      </div>
    </div>
  )
}
