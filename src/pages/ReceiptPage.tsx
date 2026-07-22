import { ReceiptPanel } from '../components/ReceiptPanel'
import { DebtSavingsDisplay } from '../components/DebtSavingsDisplay'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faReceipt } from '@fortawesome/free-solid-svg-icons'

export function ReceiptPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex flex-col items-center">
        <div className="daily-drop-header">
          <FontAwesomeIcon icon={faReceipt} className="text-2xl text-[var(--pokemon-yellow)] mb-2" />
          <h1 className="daily-drop-title text-lg">Today's Spending</h1>
          <p className="daily-drop-subtitle">Log your purchases and track your balance</p>
        </div>

        <div className="w-full max-w-[340px]">
          <ReceiptPanel />
        </div>

        <div className="mt-4 w-full max-w-[340px]">
          <DebtSavingsDisplay />
        </div>
      </div>
    </div>
  )
}
