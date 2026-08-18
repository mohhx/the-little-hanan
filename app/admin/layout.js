import { Suspense } from 'react'
import ToastHost from '../../components/ui/Toast'
import MiniPreloader from '../../components/ui/MiniPreloader'
import NavigationWatcher from '../../components/layout/NavigationWatcher'

export default function AdminLayout({ children }) {
  return (
    <>
      <Suspense fallback={null}>
        <NavigationWatcher />
      </Suspense>
      <MiniPreloader />
      {children}
      <ToastHost />
    </>
  )
}