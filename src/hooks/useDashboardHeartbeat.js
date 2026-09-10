import { useQuery } from "@tanstack/react-query";
import { fetchDashboardHeartbeat } from "../Services/DashboardServices/dashboardOverviewServices";

/**
 * Custom hook to fetch global dashboard metrics and stats
 * This centralizes the heartbeat query used across multiple components
 */
export const useDashboardHeartbeat = () => {
    return useQuery({
        queryKey: ["dashboardHeartbeat"],
        queryFn: fetchDashboardHeartbeat,
        refetchInterval: 20000, // 20 seconds
        staleTime: 5000,
        refetchOnWindowFocus: true,
    });
};
