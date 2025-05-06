import { useRouteError, Link } from 'react-router-dom';

export default function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Oops!</h1>
        <p className="text-gray-600 mb-4">Sorry, an unexpected error has occurred.</p>
        <p className="text-gray-500 mb-6">
          <i>{error.statusText || error.message}</i>
        </p>
        <Link
          to="/"
          className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
} 