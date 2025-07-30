
import { useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import  {SubscriptionPage}  from '../pages/SubscriptionPage';
import { UserSubscriptionHistory } from '../pages/UserSubscriptionHistoryPage';

function SubscriptionRouter() {
  const { isSubscribed, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="subscription-page-loading">로딩 중...</div>;
  }

  if (isSubscribed && location.pathname === '/subscription') {
    return <Navigate to="/my-subscription" replace />;
  }
  if (!isSubscribed && location.pathname === '/my-subscription') {
    return <Navigate to="/subscription" replace />;
  }

  return isSubscribed ? <UserSubscriptionHistory /> : <SubscriptionPage />;
}

export default SubscriptionRouter;
