import { useEffect, useState } from "react";
import {
  deleteApplication,
  editApplication,
  getApplications,
  type Application,
} from "../api/applications";
import { AddApplicationModal } from "../components/AddApplicationModal";

export function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddApplication, setShowAddApplication] = useState(false);
  const [editingApplication, setEditingApplication] =
    useState<Application | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  

  useEffect(() => {
    async function loadApplications() {
      try {
        const data = await getApplications();
        setApplications(data);
      } catch (err) {
        console.error("Failed to load applications:", err);

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load applications"
        );
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  }, []);

  function handleApplicationCreated(application: Application) {
    setApplications((current) => [application, ...current]);
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmed) return;

    setDeletingId(id);
    setError("");

    try {
      await deleteApplication(id);

      setApplications((current) =>
        current.filter((application) => application.id !== id)
      );
    } catch (err) {
      console.error("Failed to delete application:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete application"
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleEdit(
    application: Application,
    data: {
      companyName: string;
      role: string;
      companyType?: string;
      status: string;
      dateApplied: string;
      firstResponseDate?: string | null;
      notes?: string;
    }
  ) {
    try {
      const updatedApplication = await editApplication(
        application.id,
        data
      );

      setApplications((current) =>
        current.map((item) =>
          item.id === application.id
            ? updatedApplication
            : item
        )
      );

      setEditingApplication(null);
    } catch (err) {
      console.error("Failed to edit application:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to edit application"
      );
    }
  }

  function formatStatus(status: string) {
    return status
      .replace(/[-_]/g, " ")
      .trim()
      .split(" ")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1).toLowerCase()
      )
      .join(" ");
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  const statusStyles: Record<string, string> = {
    Applied: "bg-[#EEE5FF] text-[#7652B8]",
    Interview: "bg-[#FDE8F2] text-[#C05282]",
    "Online Assessment":
      "bg-[#FFF0E8] text-[#C56D45]",
    Rejected: "bg-[#F3E9ED] text-[#8A6573]",
    Declined: "bg-[#F3E9ED] text-[#8A6573]",
    Offer: "bg-[#E8F6EC] text-[#4D8A5A]",
    Accepted: "bg-[#E8F6EC] text-[#4D8A5A]",
  };

  return (
    <>
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-[#29233A]">
              Applications
            </h1>

            <p className="mt-2 text-sm font-semibold text-[#8A8199]">
              Keep track of every opportunity in one place.
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

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl bg-[#FDE8F2] px-4 py-3 text-xs font-bold text-[#C05282]">
            <span>{error}</span>

            <button
              type="button"
              onClick={() => setError("")}
              className="text-lg leading-none"
            >
              ×
            </button>
          </div>
        )}

        {/* Summary */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#D8C9E8] bg-white p-5 shadow-[3px_3px_0px_#D8C9E8]">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#8A8199]">
              Total
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#7652B8]">
              {loading ? "—" : applications.length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#D8C9E8] bg-white p-5 shadow-[3px_3px_0px_#D8C9E8]">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#8A8199]">
              Applied
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#7652B8]">
              {loading
                ? "—"
                : applications.filter(
                    (application) =>
                      application.status.toLowerCase() ===
                      "applied"
                  ).length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#D8C9E8] bg-white p-5 shadow-[3px_3px_0px_#D8C9E8]">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#8A8199]">
              Interviews
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#7652B8]">
              {loading
                ? "—"
                : applications.filter((application) => {
                    const status = application.status
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
                  }).length}
            </p>
          </div>

          <div className="rounded-2xl border border-[#D8C9E8] bg-white p-5 shadow-[3px_3px_0px_#D8C9E8]">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[#8A8199]">
              Offers
            </p>

            <p className="mt-2 text-3xl font-extrabold text-[#7652B8]">
              {loading
                ? "—"
                : applications.filter((application) =>
                    ["offer", "offers", "accepted"].includes(
                      application.status
                        .toLowerCase()
                        .replace(/[_ ]/g, "-")
                    )
                  ).length}
            </p>
          </div>
        </div>

        {/* Applications table */}
        <section className="overflow-hidden rounded-2xl border border-[#D8C9E8] bg-white shadow-[4px_4px_0px_#D8C9E8]">
          <div className="border-b border-[#EEE8F4] px-6 py-5">
            <h2 className="text-lg font-extrabold text-[#29233A]">
              All applications
            </h2>

            <p className="mt-1 text-xs font-semibold text-[#8A8199]">
              {applications.length}{" "}
              {applications.length === 1
                ? "application"
                : "applications"}{" "}
              tracked
            </p>
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm font-bold text-[#8A8199]">
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="px-6 py-14 text-center">
              <p className="text-lg font-extrabold text-[#7652B8]">
                No applications yet ♡
              </p>

              <p className="mt-2 text-sm font-semibold text-[#8A8199]">
                Add your first application to start tracking
                your job search.
              </p>

              <button
                type="button"
                onClick={() => setShowAddApplication(true)}
                className="mt-5 rounded-xl bg-[#7652B8] px-5 py-3 text-sm font-extrabold text-white shadow-[3px_3px_0px_#17182F]"
              >
                + Add application
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr className="bg-[#F8F5FC] text-left">
                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-[#8A8199]">
                      Company
                    </th>

                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-[#8A8199]">
                      Role
                    </th>

                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-[#8A8199]">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-[#8A8199]">
                      Applied
                    </th>

                    <th className="px-6 py-4 text-xs font-extrabold uppercase tracking-wide text-[#8A8199]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#EEE8F4]">
                  {[...applications]
                    .sort(
                      (a, b) =>
                        new Date(b.dateApplied).getTime() -
                        new Date(a.dateApplied).getTime()
                    )
                    .map((application) => {
                      const formattedStatus = formatStatus(
                        application.status
                      );

                      return (
                        <tr
                          key={application.id}
                          className="transition-colors hover:bg-[#FCFAFF]"
                        >
                          <td className="px-6 py-4">
                            <p className="font-extrabold text-[#29233A]">
                              {application.companyName}
                            </p>

                            {application.companyType && (
                              <p className="mt-1 text-xs font-semibold text-[#8A8199]">
                                {formatStatus(
                                  application.companyType
                                )}
                              </p>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-[#29233A]">
                              {application.role}
                            </p>
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`inline-block rounded-full px-3 py-1.5 text-[11px] font-extrabold ${
                                statusStyles[formattedStatus] ??
                                "bg-[#F3F0F7] text-[#7652B8]"
                              }`}
                            >
                              {formattedStatus}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-sm font-semibold text-[#8A8199]">
                            {formatDate(
                              application.dateApplied
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingApplication(
                                    application
                                  )
                                }
                                className="rounded-lg border border-[#D8C9E8] px-3 py-2 text-xs font-extrabold text-[#7652B8] hover:bg-[#F8F5FC]"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(application.id)
                                }
                                disabled={
                                  deletingId === application.id
                                }
                                className="rounded-lg border border-[#F1D4DE] px-3 py-2 text-xs font-extrabold text-[#C05282] hover:bg-[#FDE8F2] disabled:opacity-50"
                              >
                                {deletingId === application.id
                                  ? "..."
                                  : "Delete"}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {showAddApplication && (
        <AddApplicationModal
          onClose={() => setShowAddApplication(false)}
          onCreated={handleApplicationCreated}
        />
      )}

      {editingApplication && (
        <EditApplicationModal
          application={editingApplication}
          onClose={() => setEditingApplication(null)}
          onSave={handleEdit}
        />
      )}
    </>
  );
}


type EditApplicationModalProps = {
  application: Application;
  onClose: () => void;
  onSave: (
    application: Application,
    data: {
      companyName: string;
      role: string;
      companyType?: string;
      status: string;
      dateApplied: string;
      firstResponseDate?: string | null;
      notes?: string;
    }
  ) => Promise<void>;
};

function EditApplicationModal({
  application,
  onClose,
  onSave,
}: EditApplicationModalProps) {
  const [companyName, setCompanyName] = useState(
    application.companyName
  );
  const [role, setRole] = useState(application.role);
  const [companyType, setCompanyType] = useState(
    application.companyType
  );
  const [status, setStatus] = useState(application.status);
  const [dateApplied, setDateApplied] = useState(
    application.dateApplied
  );
  const [firstResponseDate, setFirstResponseDate] =
    useState(application.firstResponseDate ?? "");
  const [notes, setNotes] = useState(application.notes);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      await onSave(application, {
        companyName,
        role,
        companyType,
        status,
        dateApplied,
        firstResponseDate: firstResponseDate || null,
        notes,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save application"
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#17182F]/60 px-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#D8C9E8] bg-white p-6 shadow-[6px_6px_0px_#17182F]">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#29233A]">
              Edit application
            </h2>

            <p className="mt-1 text-xs font-semibold text-[#8A8199]">
              Update your application details.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl font-bold text-[#8A8199] hover:text-[#29233A]"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="edit-companyName"
              className="mb-1.5 block text-xs font-extrabold text-[#29233A]"
            >
              Company *
            </label>

            <input
              id="edit-companyName"
              type="text"
              value={companyName}
              onChange={(event) =>
                setCompanyName(event.target.value)
              }
              required
              className="w-full rounded-xl border-2 border-[#D8C9E8] px-4 py-3 text-sm font-semibold text-[#29233A] outline-none focus:border-[#7652B8]"
            />
          </div>

          <div>
            <label
              htmlFor="edit-role"
              className="mb-1.5 block text-xs font-extrabold text-[#29233A]"
            >
              Role *
            </label>

            <input
              id="edit-role"
              type="text"
              value={role}
              onChange={(event) =>
                setRole(event.target.value)
              }
              required
              className="w-full rounded-xl border-2 border-[#D8C9E8] px-4 py-3 text-sm font-semibold text-[#29233A] outline-none focus:border-[#7652B8]"
            />
          </div>

          <div>
            <label
              htmlFor="edit-companyType"
              className="mb-1.5 block text-xs font-extrabold text-[#29233A]"
            >
              Company type
            </label>

            <select
              id="edit-companyType"
              value={companyType}
              onChange={(event) =>
                setCompanyType(event.target.value)
              }
              className="w-full rounded-xl border-2 border-[#D8C9E8] bg-white px-4 py-3 text-sm font-semibold text-[#29233A] outline-none focus:border-[#7652B8]"
            >
              <option value="">Select type</option>
              <option value="startup">Startup</option>
              <option value="small-business">
                Small business
              </option>
              <option value="mid-size">Mid-size</option>
              <option value="large-company">
                Large company
              </option>
              <option value="government">Government</option>
              <option value="non-profit">Non-profit</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="edit-status"
              className="mb-1.5 block text-xs font-extrabold text-[#29233A]"
            >
              Status *
            </label>

            <select
              id="edit-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value)
              }
              required
              className="w-full rounded-xl border-2 border-[#D8C9E8] bg-white px-4 py-3 text-sm font-semibold text-[#29233A] outline-none focus:border-[#7652B8]"
            >
              <option value="applied">Applied</option>
              <option value="online-assessment">
                Online Assessment
              </option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="edit-dateApplied"
                className="mb-1.5 block text-xs font-extrabold text-[#29233A]"
              >
                Date applied *
              </label>

              <input
                id="edit-dateApplied"
                type="date"
                value={dateApplied}
                onChange={(event) =>
                  setDateApplied(event.target.value)
                }
                required
                className="w-full rounded-xl border-2 border-[#D8C9E8] px-4 py-3 text-sm font-semibold text-[#29233A] outline-none focus:border-[#7652B8]"
              />
            </div>

            <div>
              <label
                htmlFor="edit-firstResponseDate"
                className="mb-1.5 block text-xs font-extrabold text-[#29233A]"
              >
                First response
              </label>

              <input
                id="edit-firstResponseDate"
                type="date"
                value={firstResponseDate}
                onChange={(event) =>
                  setFirstResponseDate(event.target.value)
                }
                className="w-full rounded-xl border-2 border-[#D8C9E8] px-4 py-3 text-sm font-semibold text-[#29233A] outline-none focus:border-[#7652B8]"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="edit-notes"
              className="mb-1.5 block text-xs font-extrabold text-[#29233A]"
            >
              Notes
            </label>

            <textarea
              id="edit-notes"
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              rows={3}
              className="w-full resize-none rounded-xl border-2 border-[#D8C9E8] px-4 py-3 text-sm font-semibold text-[#29233A] outline-none focus:border-[#7652B8]"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-[#FDE8F2] px-4 py-3 text-xs font-bold text-[#C05282]">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 rounded-xl border-2 border-[#D8C9E8] px-4 py-3 text-sm font-extrabold text-[#7652B8] hover:bg-[#F8F5FC] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-[#7652B8] px-4 py-3 text-sm font-extrabold text-white shadow-[3px_3px_0px_#17182F] hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}