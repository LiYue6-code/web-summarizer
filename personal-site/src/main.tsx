import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import { applyStoredSettings } from '@/api'
import './index.css'
import App from './App'

// 应用启动时应用已保存的站点设置（如强调色）
applyStoredSettings()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
