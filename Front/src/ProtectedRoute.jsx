import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
// your supabase client

export default function ProtectedRoute({ children, requireMain = false, requirePremium = false }) {
  const { user, isSignedIn } = useUser();
  const [allowed, setAllowed] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSignedIn) {
      navigate("/sign-in");
      return;
    }

  
  }, [isSignedIn, user, navigate]);

  if (allowed === null) return <div>Loading...</div>;
  return allowed ? children : null;
}
