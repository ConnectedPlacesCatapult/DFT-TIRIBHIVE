import Link from "next/link";

export default function HandbookNotFound() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-gray-800 mb-4">
        Page Not Found
      </h1>
      <p className="text-gray-600 mb-8">
        The page you are looking for does not exist in the handbook.
      </p>
      <Link
        href="/handbook"
        className="bg-[#1a3a5c] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#24537f]"
      >
        Back to Handbook
      </Link>
    </div>
  );
}
