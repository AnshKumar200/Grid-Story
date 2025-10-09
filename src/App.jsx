import React from 'react'
import { Route, Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CanvasPage from './pages/CanvasPage'
import Layout from './components/Layout'
import About from './pages/About'

const App = () => {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path='/canvas' element={<CanvasPage />} />
        <Route path='/about' element={<About />}/>
      </Route>
    </Routes>
  )
}

export default App