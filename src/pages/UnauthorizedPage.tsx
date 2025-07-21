import { Link } from "react-router-dom";

const UnauthorizedPage = () => (
    <div className="container mx-auto px-4 py-12 text-center">
      <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
      <p className="text-muted-foreground mb-6">You do not have permission to access this page.</p>
      <Link to="/" className="text-primary hover:underline">
        Return to Home
      </Link>
    </div>
  )
export default UnauthorizedPage;