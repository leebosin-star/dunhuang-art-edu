import { HashRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import Creation from './pages/Creation'
import Interaction from './pages/Interaction'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/creation" element={<Creation />} />
          <Route path="/interaction" element={<Interaction />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
