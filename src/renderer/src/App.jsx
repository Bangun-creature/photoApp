import Wrapper from './components/Wrapper'
import { useState } from 'react'

function App() {
  const [statusWrapper, setStatusWrapper] = useState(1)

  return (
    <div className="w-full h-screen bg-slate-400">
      <div className="px-5 py-2 bg-slate-700 h-full">
        <Wrapper statusWrapper={statusWrapper} setStatusWrapper={setStatusWrapper} />
      </div>
    </div>
  )
}

export default App
