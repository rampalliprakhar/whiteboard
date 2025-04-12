import Link from "next/link";

export default function ErrorPage({ statusCode, message }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-xl">
        <h1 className="text-6xl font-bold text-red-500 mb-4">
          {statusCode || "Oops!"}
        </h1>
        <p className="text-xl text-gray-600 mb-6">
          {message || "Something went wrong"}
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}