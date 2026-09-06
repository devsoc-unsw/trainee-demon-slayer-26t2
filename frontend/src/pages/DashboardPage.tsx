import { useEffect, useState } from "react";
import type { CalendarEvent } from "../api/calendar";
import { getEvents } from "../api/calendar";
import type { Application } from "../api/applications";
import { getApplications } from "../api/applications";
import { AddApplicationModal } from "../components/AddApplicationModal";

export function DashboardPage() {
  const [upcoming, setUpcoming] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const [applications, setApplications] = useState<Application[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(true);

  const [showAddApplication, setShowAddApplication] = useState(false);

  useEffect(() => {
    async function loadUpcomingEvents() {
      try {
        const events = await getEvents();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingEvents = events
          .filter((event) => {
            const eventDate = new Date(
              `${event.startDate}T${event.startTime}`
            );

            return eventDate >= today;
          })
          .sort((a, b) => {
            const dateA = new Date(
              `${a.startDate}T${a.startTime}`
            );

            const dateB = new Date(
              `${b.startDate}T${b.startTime}`
            );

            return dateA.getTime() - dateB.getTime();
          })
          .slice(0, 3);

        setUpcoming(upcomingEvents);
      } catch (error) {
        console.error("Failed to load calendar events:", error);
      } finally {
        setLoadingEvents(false);
      }
    }

    loadUpcomingEvents();
  }, []);

  useEffect(() => {
    async function loadApplications() {
      try {
        const data = await getApplications();
        setApplications(data);
      } catch (error) {
        console.error("Failed to load applications:", error);
      } finally {
        setLoadingApplications(false);
      }
    }

    loadApplications();
  }, []);

  const totalApplications = applications.length;

  const inProgress = applications.filter((application) => {
    const status = application.status
      .trim()
      .toLowerCase()
      .replace(/[_ ]/g, "-");

    return [
      "applied",
      "application",
      "oa",
      "online-assessment",
      "online-assessments",
      "interview",
      "interviews",
      "behavioural",
      "behavioral",
      "technical",
      "behavioural-interview",
      "behavioral-interview",
      "technical-interview",
    ].includes(status);
  }).length;

  const interviews = applications.filter((application) => {
    const status = application.status
      .trim()
      .toLowerCase()
      .replace(/[_ ]/g, "-");

    return [
      "interview",
      "interviews",
      "behavioural",
      "behavioral",
      "technical",
      "behavioural-interview",
      "behavioral-interview",
      "technical-interview",
    ].includes(status);
  }).length;

  const offers = applications.filter((application) => {
    const status = application.status
      .trim()
      .toLowerCase()
      .replace(/[_ ]/g, "-");

    return ["offer", "offers", "accepted"].includes(status);
  }).length;

  const stats = [
    {
      label: "Applications",
      value: totalApplications,
    },
    {
      label: "In Progress",
      value: inProgress,
    },
    {
      label: "Interviews",
      value: interviews,
    },
    {
      label: "Offers",
      value: offers,
    },
  ];

  const recentApplications = [...applications]
    .sort((a, b) => {
      const dateA = new Date(a.dateApplied).getTime();
      const dateB = new Date(b.dateApplied).getTime();

      return dateB - dateA;
    })
    .slice(0, 5);

  const statusStyles: Record<string, string> = {
    Applied: "bg-[#EEE5FF] text-[#7652B8]",
    Interview: "bg-[#FDE8F2] text-[#C05282]",
    "Online Assessment": "bg-[#FFF0E8] text-[#C56D45]",
    Rejected: "bg-[#F3E9ED] text-[#8A6573]",
    Declined: "bg-[#F3E9ED] text-[#8A6573]",
    Offer: "bg-[#E8F6EC] text-[#4D8A5A]",
    Accepted: "bg-[#E8F6EC] text-[#4D8A5A]",
  };

  function formatStatus(status: string) {
    return status
      .replace(/[-_]/g, " ")
      .trim()
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join(" ");
  }

  function formatApplicationDate(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
    });
  }

  function formatEventDate(event: CalendarEvent) {
    const date = new Date(
      `${event.startDate}T${event.startTime}`
    );

    const today = new Date();
    const tomorrow = new Date();

    tomorrow.setDate(today.getDate() + 1);

    const isToday =
      date.toDateString() === today.toDateString();

    const isTomorrow =
      date.toDateString() === tomorrow.toDateString();

    if (isToday) return "Today";
    if (isTomorrow) return "Tomorrow";

    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
    });
  }

  function handleApplicationCreated(application: Application) {
    setApplications((current) => [application, ...current]);
  }

  return (
    <>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#29233A]">
              Welcome back! ♡
            </h1>

            <p className="mt-2 text-sm font-semibold text-[#8A8199]">
              Here's what's happening with your job search.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddApplication(true)}
            className="rounded-xl bg-[#7652B8] px-5 py-3 text-sm font-extrabold text-white shadow-[4px_4px_0px_#17182F] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#17182F] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#17182F]"
          >
            + Add application
          </button>
        </div>

        {/* Stats */}
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
                {loadingApplications ? "—" : stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Recent applications */}
          <section className="rounded-2xl border border-[#D8C9E8] bg-white p-6 shadow-[4px_4px_0px_#D8C9E8]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#29233A]">
                  Recent applications
                </h2>

                <p className="mt-1 text-xs font-semibold text-[#8A8199]">
                  Your latest job applications
                </p>
              </div>

              <button
                type="button"
                className="text-xs font-extrabold text-[#7652B8] hover:underline"
              >
                View all →
              </button>
            </div>

            {loadingApplications ? (
              <div className="py-8 text-center text-xs font-bold text-[#8A8199]">
                Loading applications...
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="rounded-xl bg-[#F8F5FC] px-4 py-8 text-center">
                <p className="text-sm font-extrabold text-[#7652B8]">
                  No applications yet ♡
                </p>

                <p className="mt-1 text-xs font-semibold text-[#8A8199]">
                  Click "Add application" to get started.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#EEE8F4]">
                {recentApplications.map((application) => {
                  const formattedStatus = formatStatus(
                    application.status
                  );

                  return (
                    <div
                      key={application.id}
                      className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-[#29233A]">
                          {application.companyName}
                        </p>

                        <p className="mt-1 truncate text-xs font-semibold text-[#8A8199]">
                          {application.role}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-4">
                        <span
                          className={`rounded-full px-3 py-1.5 text-[11px] font-extrabold ${
                            statusStyles[formattedStatus] ??
                            "bg-[#F3F0F7] text-[#7652B8]"
                          }`}
                        >
                          {formattedStatus}
                        </span>

                        <span className="hidden text-xs font-semibold text-[#A39AAA] sm:block">
                          {formatApplicationDate(
                            application.dateApplied
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Upcoming events */}
          <section className="rounded-2xl border border-[#D8C9E8] bg-white p-6 shadow-[4px_4px_0px_#D8C9E8]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[#29233A]">
                  Upcoming
                </h2>

                <p className="mt-1 text-xs font-semibold text-[#8A8199]">
                  Your next calendar events
                </p>
              </div>
            </div>

            {loadingEvents ? (
              <div className="py-8 text-center text-xs font-bold text-[#8A8199]">
                Loading events...
              </div>
            ) : upcoming.length === 0 ? (
              <div className="rounded-xl bg-[#F8F5FC] px-4 py-8 text-center">
                <p className="text-sm font-extrabold text-[#7652B8]">
                  Nothing coming up ♡
                </p>

                <p className="mt-1 text-xs font-semibold text-[#8A8199]">
                  Add an event to your calendar.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcoming.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-xl bg-[#F8F5FC] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEE5FF] text-sm text-[#7652B8]">
                        ◷
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-extrabold text-[#7652B8]">
                          {formatEventDate(event)} ·{" "}
                          {event.startTime}
                        </p>

                        <p className="mt-1 truncate text-sm font-extrabold text-[#29233A]">
                          {event.title}
                        </p>

                        {event.type && (
                          <p className="mt-1 text-xs font-semibold text-[#8A8199]">
                            {event.type}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                window.location.href = "/calendar";
              }}
              className="mt-5 w-full rounded-xl border-2 border-[#D8C9E8] px-4 py-3 text-xs font-extrabold text-[#7652B8] transition-colors hover:bg-[#F8F5FC]"
            >
              View calendar →
            </button>
          </section>
        </div>

        {/* Bottom message */}
        <div className="mt-6 rounded-2xl bg-[#EEE5FF] px-6 py-5 text-center">
          <p className="text-sm font-extrabold text-[#7652B8]">
            ✦ Keep going! Every application gets you one step closer.
          </p>
        </div>
      </div>

      {showAddApplication && (
        <AddApplicationModal
          onClose={() => setShowAddApplication(false)}
          onCreated={handleApplicationCreated}
        />
      )}
    </>
  );
}