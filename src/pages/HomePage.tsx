import { BudgetTicket } from '../components/BudgetTicket'
import { XPBar } from '../components/XPBar'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { todayKey, spentFromPurchases } from '../lib/stats'

export function HomePage() {
  const { user } = useAuth()
  const [spent, setSpent] = useState(0)
  const [budget, setBudget] = useState(0)

  useEffect(() => {
    if (!user) return
    supabase
      .from('daily_limits')
      .select('amount, purchases')
      .eq('user_id', user.id)
      .eq('date', todayKey())
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setBudget(data.amount)
          setSpent(spentFromPurchases(data.purchases || []))
        }
      })
  }, [user])

  return (
    <div className="page-container pt-6">
      <div className="page-header">
        <h1 className="page-title">Today's Budget</h1>
        <p className="page-subtitle">
          {new Date().toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      <div><BudgetTicket /></div>
      {user && budget > 0 && (
        <div className="pixel-panel mt-4" style={{ padding: '12px 16px' }}>
          <XPBar spent={spent} budget={budget} />
        </div>
      )}
    </div>
  )
}
