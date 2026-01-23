import PageMeta from "../../components/common/PageMeta";
import InfoCard from "./infoCard";
import StatisticsChart from "./barChart";
import RecentSubscriptionUsers from "./recentSubciptions";
import RecentWithdrawalUsers from "./recentWithdrawalUsers";
// import ExampleTable from "./exampleTable"; // <-- Your new table
// import DemographicCard from "../../components/ecommerce/DemographicCard";
// import RecentOrders from "../../components/ecommerce/RecentOrders";
import RecentReferralUsers from "./topReferalls";

export default function SalesDashboard() {
  return (
    <>
      <PageMeta title="Prithu Dashboard" description="" />

      {/* Info Cards */}
      <div className="">
        <InfoCard />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">

        {/* Three Tables */}
        <div className="col-span-12 flex flex-col xl:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <RecentSubscriptionUsers />
          </div>
          <div className="flex-1 min-w-0">
            <RecentWithdrawalUsers />
          </div>
          <div className="flex-1 min-w-0">
            <RecentReferralUsers/>
          </div>
        </div>

        {/* Statistics Chart */}
        <div className="col-span-12">
           <StatisticsChart /> 
        </div>

        {/* Demographics & Orders */}
        <div className="col-span-12 xl:col-span-5">
          {/* <DemographicCard /> */}
        </div>
        <div className="col-span-12 xl:col-span-7">
          {/* <RecentOrders /> */}
        </div>

      </div>
    </>
  );
}
