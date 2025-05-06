import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { StudentProfileProvider } from './context/StudentProfileContext';
import { OwnerProfileProvider } from './context/OwnerProfileContext';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <StudentProfileProvider>
        <OwnerProfileProvider>
          <RouterProvider router={router} />
        </OwnerProfileProvider>
      </StudentProfileProvider>
    </AuthProvider>
  );
} 