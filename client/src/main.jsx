import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/global.css'
import axios from 'axios'

axios.interceptors.request.use(config => {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('userToken')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
