import { JoinForm } from "./components/JoinForm";
import { TokenDisplay } from "./components/TokenDisplay";
import { StatusBadge } from "./components/StatusBadge";
import { useQueue } from "./hooks/useQueue";
import { getServiceTag } from "./utlls/serviceTag";

function App() {
  // Get URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const orgId = urlParams.get("org") || "default";
  const serviceTag = getServiceTag();

  const { token, queuePosition, isLoading, error, joinQueue } = useQueue(
    orgId,
    serviceTag
  );

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-md">
        {!token ? (
          <JoinForm
            onSubmit={joinQueue}
            isLoading={isLoading}
            error={error}
            orgId={""}
          />
        ) : (
          <div className="space-y-6">
            <TokenDisplay
              tokenNumber={token.token_number}
              peopleCount={token.people_count}
              queuePosition={queuePosition}
            />

            <div className="text-center">
              <StatusBadge status={token.status} />
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Details
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">
                    {token.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">
                    {token.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium text-gray-900 capitalize">
                    {serviceTag}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">
                    {token.service_date}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-600 bg-white rounded-xl p-4 border border-gray-100">
              <p>
                💡 <strong>Keep this screen open</strong> to receive real-time
                updates about your queue status.
              </p>
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Reset Queue
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
