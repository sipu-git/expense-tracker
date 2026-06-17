import { useAppSelector } from '@/hooks/redux'
import { selectIsAuthenticated } from '@/store/slices/userSlices/user.slice'
import { Navigate, Outlet } from 'react-router-dom'

const ProtectedRoutes = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated)
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoutes