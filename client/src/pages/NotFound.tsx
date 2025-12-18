import { Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-white p-8">
      <div className="text-center max-w-2xl">
        {/* Big bold 404 */}
        <h1 className="dof-huge-title mb-8">
          404
        </h1>

        {/* Playful message */}
        <h2 className="dof-title mb-6">
          OOPS! THIS PAGE WENT OFF THE GRID
        </h2>

        <p className="dof-body mb-12 text-gray-600">
          Looks like this carousel took a wrong turn.
          <br />
          Let's get you back on track!
        </p>

        {/* Bold CTA button */}
        <button
          onClick={handleGoHome}
          className="dof-btn dof-btn-coral dof-btn-lg inline-flex items-center gap-3"
        >
          <Home size={24} />
          BACK TO DASHBOARD
        </button>
      </div>
    </div>
  );
}
