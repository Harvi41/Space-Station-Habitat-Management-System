import React from 'react'
import { BrowserRouter as Router , Routes , Route } from 'react-router-dom'

import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import Dashboard from './components/AdminFeatures/Dashboard'
import StationOverView from './components/AdminFeatures/StationOverView'
import CrewManagement from './components/AdminFeatures/CrewManagement'
import AdminLayout from './components/CommonFeatures/AdminLayout'
import StorageManagment from './components/AdminFeatures/StorageManagment'
import TaskManagment from './components/AdminFeatures/TaskManagment'
import Complain from './components/AdminFeatures/Complain'
import MedicalInventory from './components/AdminFeatures/MedicalInventory'
import AdminProfile from './components/AdminFeatures/AdminProfile'

import UserLayout from './components/CommonFeatures/UserLayout'
import AssignedTask from './components/UserFeatures/AssignedTask'
import ComplainU from './components/UserFeatures/ComplainU'
import MedicalView from './components/UserFeatures/MedicalView'
import StationView from './components/UserFeatures/StationView'
import StorageView from './components/UserFeatures/StorageView'
import UserProfile from './components/UserFeatures/UserProfile'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/login' element={<LoginPage />} />
        <Route path='/signup' element={<SignUpPage />} />

        <Route path="/admin" element={<AdminLayout />}>

          <Route path="dashboard" element={<Dashboard />} />
          <Route path="station" element={<StationOverView />} />
          <Route path="crew" element={<CrewManagement />} />
          <Route path="storage" element={<StorageManagment />} />
          <Route path="tasks" element={<TaskManagment />} />
          <Route path="medical" element={<MedicalInventory />} />
          <Route path="complaints" element={<Complain />} />
          <Route path="profile" element={<AdminProfile />} />

        </Route>

        <Route path="/crew" element={<UserLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="UserTask" element={<AssignedTask />} />
            <Route path="UserMedicalView" element={<MedicalView />} />
            <Route path="UserStationview" element={<StationView/>} />
            <Route path="UserStorageView" element={<StorageView />} />
            <Route path="UserProfile" element={<UserProfile />} />
            <Route path="UserComplain" element={<ComplainU />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App