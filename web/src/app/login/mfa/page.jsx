import { Suspense } from 'react'
import MFAClient from './MFAClient'

export const dynamic = 'force-dynamic'

export default function MFAPage() {
  return (
    <Suspense>
      <MFAClient />
    </Suspense>
  )
}
