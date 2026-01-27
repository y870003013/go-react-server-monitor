import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css' // 确保你的 CSS 路径正确

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)