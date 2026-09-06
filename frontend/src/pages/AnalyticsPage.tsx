import { useEffect, useMemo, useState } from "react";
import { getApplications, type Application } from "../api/applications";
import {
  getAppliedCount,
  getApplicationsByDay,
  getBehaviouralInterviewCount,
  getCompanyCount,
  getCompanyTypeCount,
  getDeclinedCount,
  getInterviewCount,
  getOfferCount,
  getOnlineAssessmentCount,
  getRejectionCount,
  getRoleCount,
  getTechnicalInterviewCount,
  type ApplicationsByDay,
} from "../api/analytics";

export function AnalyticsPage() {
  const [applied, setApplied] = useState(0);
  const [onlineAssessments, setOnlineAssessments] = useState(0);
  const [interviews, setInterviews] = useState(0);
  const [behaviouralInterviews, setBehaviouralInterviews] = useState(0);
  const [technicalInterviews, setTechnicalInterviews] = useState(0);
  const [offers, setOffers] = useState(0);
  const [declined, setDeclined] = useState(0);
  const [rejections, setRejections] = useState(0);
  const [companies, setCompanies] = useState(0);
  const [roles, setRoles] = useState(0);
  const [companyTypes, setCompanyTypes] = useState(0);

  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsByDay, setApplicationsByDay] = useState<
    ApplicationsByDay[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      setError("");

      try {
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - 29);

        const formatDate = (date: Date) => {
          return date.toISOString().slice(0, 10);
        };

        const [
          appliedCount,
          oaCount,
          interviewCount,
          behaviouralCount,
          technicalCount,
          offerCount,
          declinedCount,
          rejectionCount,
          companyCount,
          roleCount,
          companyTypeCount,
          applicationData,
          dailyData,
        ] = await Promise.all([
          getAppliedCount(),
          getOnlineAssessmentCount(),
          getInterviewCount(),
          getBehaviouralInterviewCount(),
          getTechnicalInterviewCount(),
          getOfferCount(),
          getDeclinedCount(),
          getRejectionCount(),
          getCompanyCount(),
          getRoleCount(),
          getCompanyTypeCount(),
          getApplications(),
          getApplicationsByDay(formatDate(startDate), formatDate(today)),
        ]);

        setApplied(appliedCount);
        setOnlineAssessments(oaCount);
        setInterviews(interviewCount);
        setBehaviouralInterviews(behaviouralCount);
        setTechnicalInterviews(technicalCount);
        setOffers(offerCount);
        setDeclined(declinedCount);
        setRejections(rejectionCount);
        setCompanies(companyCount);
        setRoles(roleCount);
        setCompanyTypes(companyTypeCount);
        setApplications(applicationData);
        setApplicationsByDay(dailyData);
      } catch (err) {
        console.error("Failed to load analytics:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load analytics"
        );
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, []);

  const totalApplications = applications.length;

  const applicationRate =
    totalApplications > 0
      ? Math.round((applied / totalApplications) * 100)
      : 0;

  const offerRate =
    totalApplications > 0
      ? Math.round((offers / totalApplications) * 100)
      : 0;

  const interviewRate =
    totalApplications > 0
      ? Math.round((interviews / totalApplications) * 100)
      : 0;

  const maxDailyApplications = Math.max(
    ...applicationsByDay.map((item) => item.count),
    1
  );

  const recentActivity = useMemo(() => {
    return applicationsByDay.map((item) => {
      const date = new Date(`${item.date}T00:00:00`);

      return {
        ...item,
        label: date.toLocaleDateString("en-AU", {
          day: "numeric",
          month: "short",
        }),
      };
    });
  }, [applicationsByDay]);

  const roleBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};

    applications.forEach((application) => {
      const role = application.role.trim();

      if (!role) return;

      counts[role] = (counts[role] ?? 0) + 1;
    });

    return Object.entries(counts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5);
  }, [applications]);

  const companyTypeBreakdown = useMemo(() => {
    const counts: Record<string, number> = {};

    applications.forEach((application) => {
      const type = application.companyType.trim();

      if (!type) return;

      counts[type] = (counts[type] ?? 0) + 1;
    });

    return Object.entries(counts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5);
  }, [applications]);

  function formatCompanyType(type: string) {
    return type
      .replace(/[-_]/g, " ")
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase()
      )
      .join(" ");
  }

  function formatDateLabel(date: string) {
    return new Date(`${date}T00:00:00`).toLocaleDateString(
      "en-AU",
      {
        day: "numeric",
        month: "short",
      }
    );
  }

  const stats = [
    {
      label: "Applications",
      value: totalApplications,
      description: "Total applications",
    },
    {
      label: "Interviews",
      value: interviews,
      description: `${interviewRate}% conversion`,
    },
    {
      label: "Offers",
      value: offers,
      description: `${offerRate}% success rate`,
    },
    {
      label: "Companies",
      value: companies,
      description: "Companies applied to",
    },
  ];

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#29233A]">
            Analytics
          </h1>

          <p className="mt-2 text-sm font-semibold text-[#8A8199]">
            See how your job search is progressing.
          </p>
        </div>

        <div className="rounded-2xl border border-[#D8C9E8] bg-white p-12 text-center shadow-[4px_4px_0px_#D8C9E8]">
          <p className="text-sm font-extrabold text-[#7652B8]">
            Loading your analytics...
          </p>

          <p className="mt-2 text-xs font-semibold text-[#8A8199]">
            Crunching the numbers ♡
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-[#29233A]">
            Analytics
          </h1>

          <p className="mt-2 text-sm font-semibold text-[#8A8199]">
            See how your job search is progressing.
          </p>
        </div>

        <div className="rounded-2xl border border-[#F0C9D8] bg-[#FDE8F2] p-6">
          <p className="text-sm font-extrabold text-[#C05282]">
            Unable to load analytics
          </p>

          <p className="mt-1 text-xs font-semibold text-[#8A8199]">
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#29233A]">
          Analytics
        </h1>

        <p className="mt-2 text-sm font-semibold text-[#8A8199]">
          See how your job search is progressing.
        </p>
      </div>

      {/* Overview cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-[#D8C9E8] bg-white p-5 shadow-[3px_3px_0px_#D8C9E8]"
          >
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#8A8199]">
              {stat.label}
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#7652B8]">
              {stat.value}
            </p>

            <p className="mt-1 text-xs font-semibold text-[#A39AAA]">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Application funnel */}
        <section className="rounded-2xl border border-[#D8C9E8] bg-white p-6 shadow-[4px_4px_0px_#D8C9E8]">
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-[#29233A]">
              Application funnel
            </h2>

            <p className="mt-1 text-xs font-semibold text-[#8A8199]">
              Track how applications move through your pipeline.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#29233A]">
                  Applications
                </span>

                <span className="text-xs font-extrabold text-[#7652B8]">
                  {applied}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#EEE5FF]">
                <div
                  className="h-full rounded-full bg-[#7652B8] transition-all"
                  style={{
                    width: `${
                      totalApplications > 0
                        ? (applied / totalApplications) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#29233A]">
                  Online assessments
                </span>

                <span className="text-xs font-extrabold text-[#C56D45]">
                  {onlineAssessments}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#FFF0E8]">
                <div
                  className="h-full rounded-full bg-[#C56D45] transition-all"
                  style={{
                    width: `${
                      totalApplications > 0
                        ? (onlineAssessments / totalApplications) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#29233A]">
                  Interviews
                </span>

                <span className="text-xs font-extrabold text-[#C05282]">
                  {interviews}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#FDE8F2]">
                <div
                  className="h-full rounded-full bg-[#C05282] transition-all"
                  style={{
                    width: `${
                      totalApplications > 0
                        ? (interviews / totalApplications) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-extrabold text-[#29233A]">
                  Offers
                </span>

                <span className="text-xs font-extrabold text-[#4D8A5A]">
                  {offers}
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-[#E8F6EC]">
                <div
                  className="h-full rounded-full bg-[#67A978] transition-all"
                  style={{
                    width: `${
                      totalApplications > 0
                        ? (offers / totalApplications) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Interview breakdown */}
        <section className="rounded-2xl border border-[#D8C9E8] bg-white p-6 shadow-[4px_4px_0px_#D8C9E8]">
          <div className="mb-6">
            <h2 className="text-lg font-extrabold text-[#29233A]">
              Interviews
            </h2>

            <p className="mt-1 text-xs font-semibold text-[#8A8199]">
              Your interview breakdown.
            </p>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl bg-[#FDE8F2] p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#29233A]">
                  Total interviews
                </span>

                <span className="text-2xl font-extrabold text-[#C05282]">
                  {interviews}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#F8F5FC] p-4">
              <span className="text-xs font-extrabold text-[#29233A]">
                Behavioural
              </span>

              <span className="text-sm font-extrabold text-[#7652B8]">
                {behaviouralInterviews}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#F8F5FC] p-4">
              <span className="text-xs font-extrabold text-[#29233A]">
                Technical
              </span>

              <span className="text-sm font-extrabold text-[#7652B8]">
                {technicalInterviews}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#E8F6EC] p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#4D8A5A]">
                  Offers
                </p>

                <p className="mt-1 text-xl font-extrabold text-[#4D8A5A]">
                  {offers}
                </p>
              </div>

              <div className="rounded-xl bg-[#F3E9ED] p-4">
                <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#8A6573]">
                  Rejected
                </p>

                <p className="mt-1 text-xl font-extrabold text-[#8A6573]">
                  {rejections}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Application activity */}
      <section className="mt-6 rounded-2xl border border-[#D8C9E8] bg-white p-6 shadow-[4px_4px_0px_#D8C9E8]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-extrabold text-[#29233A]">
              Application activity
            </h2>

            <p className="mt-1 text-xs font-semibold text-[#8A8199]">
              Applications submitted over the last 30 days.
            </p>
          </div>

          <span className="rounded-full bg-[#EEE5FF] px-3 py-1.5 text-[11px] font-extrabold text-[#7652B8]">
            30 days
          </span>
        </div>

        {recentActivity.length === 0 ? (
          <div className="rounded-xl bg-[#F8F5FC] px-4 py-10 text-center">
            <p className="text-sm font-extrabold text-[#7652B8]">
              No activity yet ♡
            </p>

            <p className="mt-1 text-xs font-semibold text-[#8A8199]">
              Your application activity will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex min-w-[700px] items-end gap-2">
              {recentActivity.map((item) => {
                const height =
                  item.count === 0
                    ? 4
                    : Math.max(
                        12,
                        (item.count / maxDailyApplications) * 180
                      );

                return (
                  <div
                    key={item.date}
                    className="flex flex-1 flex-col items-center justify-end gap-2"
                  >
                    <span className="text-[10px] font-extrabold text-[#7652B8]">
                      {item.count > 0 ? item.count : ""}
                    </span>

                    <div
                      className="w-full max-w-8 rounded-t-lg bg-[#9B78D1] transition-all hover:bg-[#7652B8]"
                      style={{
                        height: `${height}px`,
                      }}
                      title={`${item.count} application${
                        item.count === 1 ? "" : "s"
                      } on ${formatDateLabel(item.date)}`}
                    />

                    <span className="whitespace-nowrap text-[9px] font-bold text-[#A39AAA]">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Breakdown */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Roles */}
        <section className="rounded-2xl border border-[#D8C9E8] bg-white p-6 shadow-[4px_4px_0px_#D8C9E8]">
          <div className="mb-5">
            <h2 className="text-lg font-extrabold text-[#29233A]">
              Top roles
            </h2>

            <p className="mt-1 text-xs font-semibold text-[#8A8199]">
              Where you're applying most.
            </p>
          </div>

          {roleBreakdown.length === 0 ? (
            <p className="rounded-xl bg-[#F8F5FC] p-5 text-center text-xs font-bold text-[#8A8199]">
              No role data yet.
            </p>
          ) : (
            <div className="space-y-4">
              {roleBreakdown.map(([role, count]) => {
                const percentage =
                  totalApplications > 0
                    ? (count / totalApplications) * 100
                    : 0;

                return (
                  <div key={role}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="truncate text-xs font-extrabold text-[#29233A]">
                        {role}
                      </span>

                      <span className="shrink-0 text-xs font-extrabold text-[#7652B8]">
                        {count}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#EEE5FF]">
                      <div
                        className="h-full rounded-full bg-[#7652B8]"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Company types */}
        <section className="rounded-2xl border border-[#D8C9E8] bg-white p-6 shadow-[4px_4px_0px_#D8C9E8]">
          <div className="mb-5">
            <h2 className="text-lg font-extrabold text-[#29233A]">
              Company types
            </h2>

            <p className="mt-1 text-xs font-semibold text-[#8A8199]">
              The companies you're targeting.
            </p>
          </div>

          {companyTypeBreakdown.length === 0 ? (
            <p className="rounded-xl bg-[#F8F5FC] p-5 text-center text-xs font-bold text-[#8A8199]">
              No company type data yet.
            </p>
          ) : (
            <div className="space-y-4">
              {companyTypeBreakdown.map(([type, count]) => {
                const percentage =
                  totalApplications > 0
                    ? (count / totalApplications) * 100
                    : 0;

                return (
                  <div key={type}>
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <span className="truncate text-xs font-extrabold text-[#29233A]">
                        {formatCompanyType(type)}
                      </span>

                      <span className="shrink-0 text-xs font-extrabold text-[#7652B8]">
                        {count}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-[#EEE5FF]">
                      <div
                        className="h-full rounded-full bg-[#9B78D1]"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Overall stats */}
        <section className="rounded-2xl border border-[#D8C9E8] bg-white p-6 shadow-[4px_4px_0px_#D8C9E8]">
          <div className="mb-5">
            <h2 className="text-lg font-extrabold text-[#29233A]">
              Search overview
            </h2>

            <p className="mt-1 text-xs font-semibold text-[#8A8199]">
              A quick look at your strategy.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-[#F8F5FC] px-4 py-3">
              <span className="text-xs font-extrabold text-[#29233A]">
                Unique companies
              </span>

              <span className="text-sm font-extrabold text-[#7652B8]">
                {companies}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#F8F5FC] px-4 py-3">
              <span className="text-xs font-extrabold text-[#29233A]">
                Unique roles
              </span>

              <span className="text-sm font-extrabold text-[#7652B8]">
                {roles}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#F8F5FC] px-4 py-3">
              <span className="text-xs font-extrabold text-[#29233A]">
                Company types
              </span>

              <span className="text-sm font-extrabold text-[#7652B8]">
                {companyTypes}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#EEE5FF] px-4 py-3">
              <span className="text-xs font-extrabold text-[#7652B8]">
                Interview conversion
              </span>

              <span className="text-sm font-extrabold text-[#7652B8]">
                {applicationRate > 0 ? interviewRate : 0}%
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#E8F6EC] px-4 py-3">
              <span className="text-xs font-extrabold text-[#4D8A5A]">
                Offer conversion
              </span>

              <span className="text-sm font-extrabold text-[#4D8A5A]">
                {offerRate}%
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-[#F3E9ED] px-4 py-3">
              <span className="text-xs font-extrabold text-[#8A6573]">
                Declined
              </span>

              <span className="text-sm font-extrabold text-[#8A6573]">
                {declined}
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom message */}
      <div className="mt-6 rounded-2xl bg-[#EEE5FF] px-6 py-5 text-center">
        <p className="text-sm font-extrabold text-[#7652B8]">
          ✦ Keep applying! Consistency is the secret weapon. ♡
        </p>
      </div>
    </div>
  );
}
