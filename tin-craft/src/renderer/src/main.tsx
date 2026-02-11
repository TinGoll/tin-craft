import { createRoot } from 'react-dom/client'
import { App } from './App'
import '../src/assets/normalize.css'
import '../src/assets/base.css'
import '../src/assets/fonts.css'
import { SWRProvider } from './providers'
// import App1 from './App1'

createRoot(document.getElementById('root')!).render(
  <SWRProvider>
    <App />
  </SWRProvider>
)
