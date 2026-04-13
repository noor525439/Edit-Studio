import { getData } from '@/context/userContext'
import React from 'react'
import { Navigate } from 'react-router-dom'

const ProtectedRoutes = ({ children }) => {
    const { user } = getData()

    return (
        <>
            {
                user ? children : <Navigate to={'/login'} />
            }
        </>
    )
}   

export default ProtectedRoutes