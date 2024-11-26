import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Alarm from './Alarm'
import MenuNav from './Components/Layout/MenuNav'
import Protected from './Components/Protected'
import Dashboard from './Dashboard'
import Edit from './Edit'
import Login from './Login'

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Protected>
        <MenuNav />
      </Protected>
    ),
    children: [
      {
        path: '',
        element: <Dashboard />
      },
      {
        path: 'edit',
        element: <Edit />
      },
      {
        path: 'alarm',
        element: <Alarm />
      },
      {
        path: 'settings',
        element: <></>
      }
    ]
  },
  {
    path: '/login',
    element: <Login />
  }
])

const App = () => {
  return <RouterProvider router={router} />
}

export default App
