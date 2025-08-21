import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './pages/App'
import Dataset from './pages/Dataset'
import Copilot from './pages/Copilot'

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/dataset/:id', element: <Dataset /> },
  { path: '/copilot', element: <Copilot /> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
