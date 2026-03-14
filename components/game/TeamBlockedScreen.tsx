export default function TeamBlockedScreen() {
  return (
    <div className="h-screen w-full flex items-center justify-center bg-black text-white">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-red-500">
          Team Access Blocked
        </h1>
        <p className="text-gray-300">
          Your team has been blocked by the event admin.
        </p>
        <p className="text-sm text-gray-500">
          Please contact the organizers for assistance.
        </p>
      </div>
    </div>
  );
}
