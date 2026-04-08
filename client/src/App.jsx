import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationProvider } from './context/NotificationContext';
import AppRoutes from './routes/AppRoutes'

function App() {
  return (
    <NotificationProvider>
      <AppRoutes />
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </NotificationProvider>
  )
}

export default App

