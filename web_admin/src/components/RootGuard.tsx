import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useEffect } from 'react';

const RootGuard = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const { business, isConfigured, refreshBusiness } = useAppStore();

    useEffect(() => {
        const checkStatus = async () => {
            // 1. Initial configuration check
            if (!isConfigured || !business) {
                navigate('/setup');
                return;
            }

            // 2. If not already active, try refreshing one last time before redirecting
            let currentBusiness = business;

            const isCurrentlyActive = (b: any) => {
                const now = new Date();
                const trialExpiry = b.trialExpiry ? new Date(b.trialExpiry) : null;
                const subExpiry = b.subscriptionExpiry ? new Date(b.subscriptionExpiry) : null;

                if (b.paymentStatus === 'PAID') return true;
                if (trialExpiry && now < trialExpiry) return true;
                if (subExpiry && now < subExpiry) return true;
                return false;
            };

            if (!isCurrentlyActive(currentBusiness)) {
                // Try one refresh
                await refreshBusiness();
                // Since refreshBusiness updates the store, the effect will re-run.
                // However, we can also check the local result if we refactor it to return data.
                // For now, if it's still not active after the store update (next run), it will redirect.
            }

            // 3. Final Redirect Logic
            if (!isCurrentlyActive(currentBusiness) && currentBusiness.paymentStatus !== 'PENDING_APPROVAL') {
                navigate('/paywall');
            }
        };

        checkStatus();
    }, [isConfigured, business, navigate, refreshBusiness]);

    return <>{children}</>;
};

export default RootGuard;
