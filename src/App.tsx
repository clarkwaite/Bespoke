import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom'
import { Customers } from './components/Customers/Customers'
import { Products } from './components/Products/Products'
import { Sales } from './components/Sales/Sales'
import { Salespersons } from './components/Salespersons/Salespersons'
import { CommissionReport } from './components/Reports/CommissionReport'
import { AppContainer, Sidebar, SidebarNav, MainContent, PageHeader } from './appStyles'

const App: React.FC = () => {
  const queryClient = new QueryClient()
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppContainer>
          <Sidebar>
            <SidebarNav>
              <ul>
                <li>
                  <NavLink to="/">
                    Sales
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/products">
                    Products
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/customers">
                    Customers
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
            </SidebarNav>
          </Sidebar>

          <MainContent>
            <PageHeader>
              <h1>BeSpoked Bikes - Sales Tracking</h1>
            </PageHeader>

            <div>
              <Routes>
                <Route path="/" element={<Sales />} />
                <Route path="/products" element={<Products />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/salespersons" element={<Salespersons />} />
                <Route path="/reports" element={<CommissionReport />} />
              </Routes>
            </div>
          </MainContent>
        </AppContainer>
      </Router>
    </QueryClientProvider>
  )
}

export default App
