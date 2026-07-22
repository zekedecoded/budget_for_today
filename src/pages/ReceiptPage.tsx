import { ReceiptPanel } from '../components/ReceiptPanel'
import { DebtSavingsDisplay } from '../components/DebtSavingsDisplay'
import { PixelIcon } from '../components/PixelIcon'

export function ReceiptPage() {
  return (
    <div className="page-container pt-6">
      <div className="page-header">
        <PixelIcon name="receipt" size={20} className="text-amber mb-1" />
        <h1 className="page-title">Expense Tracker</h1>
        <p className="page-subtitle">Log your purchases and see what's left</p>
      </div>
      <div><ReceiptPanel /></div>
      <div><DebtSavingsDisplay /></div>
    </div>
  )
}
