import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Layout from "@/components/layout/Layout"
import Home from "@/pages/Home"
import CustomerList from "@/pages/CustomerList"
import CustomerDetail from "@/pages/CustomerDetail"
import Schedule from "@/pages/Schedule"
import TreatmentList from "@/pages/TreatmentList"
import FollowUps from "@/pages/FollowUps"
import Dashboard from "@/pages/Dashboard"

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/customers/:id" element={<CustomerDetail />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/treatments" element={<TreatmentList />} />
          <Route path="/follow-ups" element={<FollowUps />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  )
}
