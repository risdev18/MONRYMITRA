import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { useEffect } from 'react';

const RootGuard = ({ children }: { children: React.ReactNode }) => {
    const navigate = useNavigate();
    const { business, isConfigured, refreshBusiness } = useAppStore();

    useEffect(() => {
        // 1. Initial configuration check
        if (!isConfigured || !business) {
            navigate('/setup');
            return;
        }

        // 2. Refresh business data from localStorage (in case admin activated)
        refreshBusiness();

        // 3. Subscription/Trial check
        const now = new Date();
        const trialExpiry = business.trialExpiry ? new Date(business.trialExpiry) : null;
        const subExpiry = business.subscriptionExpiry ? new Date(business.subscriptionExpiry) : null;

        // Note: For existing mock businesses that don't have trialExpiry, 
        // we'll assume they need setup or have expired if we want to be strict.
        // But for MVP, if it's missing, we let it slide or set it.

        let isActive = false;
        if (business.paymentStatus === 'PAID') isActive = true;
        if (trialExpiry && now < trialExpiry) isActive = true;
        if (subExpiry && now < subExpiry) isActive = true;

        if (!isActive && (trialExpiry || subExpiry)) {
            navigate('/paywall');
        }
    }, [isConfigured, business, navigate, refreshBusiness]);

    return <>{children}</>;
};

export default RootGuard;
