import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom'
import Customers from './components/Customers/Customers'
import Products from './components/Products/Products'
import Sales from './components/Sales/Sales'
import Salespersons from './components/Salespersons/Salespersons'
import CommissionReport from './components/Reports/CommissionReport'
import styles from './App.module.css'

const App: React.FC = () => {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>

      <Router>
        <div className={styles.container}>
          <aside className={styles.sidebar}>
            <nav>
              <ul>
                <li>
                  <NavLink to="/">
                    Customers
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/products">
                    Products
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/sales">
                    Sales
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/salespersons">
                    Salespersons
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/reports">
                    Commission Reports
                  </NavLink>
                </li>
              </ul>
            </nav>
          </aside>

          <main className={styles.mainContent}>
            <header className={styles.header}>
              <h1>BeSpoked Bikes - Sales Tracking</h1>
            </header>

            <div>
              <Routes>
                <Route path="/" element={<Customers />} />
                <Route path="/products" element={<Products />} />
                <Route path="/sales" element={<Sales />} />
                <Route path="/salespersons" element={<Salespersons />} />
                <Route path="/reports" element={<CommissionReport />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </QueryClientProvider>
  )
}

export default App
