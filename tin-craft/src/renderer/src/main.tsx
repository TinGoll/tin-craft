import { createRoot } from 'react-dom/client'
import '../src/assets/normalize.css'
import '../src/assets/base.css'
import '../src/assets/fonts.css'
import { SWRProvider } from './providers'
import App1 from './App1'

createRoot(document.getElementById('root')!).render(
  <SWRProvider>
    <App1 />
  </SWRProvider>
)
