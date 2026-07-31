import { useContext } from 'react'
import {
  HouseholdContext,
  type HouseholdContextValue,
} from './householdContext'

export function useHousehold(): HouseholdContextValue {
  const ctx = useContext(HouseholdContext)
  if (!ctx) {
    throw new Error('useHousehold must be used inside a HouseholdProvider')
  }
  return ctx
}
