import { useState } from "react";
import {
  createApplication,
  type Application,
} from "../api/applications";

type AddApplicationModalProps = {
  onClose: () => void;
  onCreated: (application: Application) => void;
};

export function AddApplicationModal({
  onClose,
  onCreated,
}: AddApplicationModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [role, setRole] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [status, setStatus] = useState("applied");
  const [dateApplied, setDateApplied] = useState("");
  const [firstResponseDate, setFirstResponseDate] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const application = await createApplication({
        companyName,
        role,
        companyType,
        status,
        dateApplied,
        firstResponseDate: firstResponseDate || null,
        notes,
      });

      onCreated(application);
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create application"
      );
    } finally {
      setLoading(false);
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
              Add application
            </h2>

            <p className="mt-1 text-xs font-semibold text-[#8A8199]">
              Keep track of a new job application.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl font-bold text-[#8A8199] hover:text-[#29233A]"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="companyName"
              className="mb-1.5 block text-xs font-extrabold text-[#29233A]"
            >
              Company *
            </label>

            <input
              id="companyName"
              type="text"
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="e.g. Canva"
              required
              className="w-full rounded-xl border-2 border-[#D8C9E8] px-4 py-3 text-sm font-semibold text-[#29233A] outline-none transition-colors placeholder:text-[#B8B1C7] focus:border-[#7652B8]"
            />
          </div>

          <div>
            <label
              htmlFor="role"
              className="mb-1.5 block text-xs font-extrabold text-[#29233A]"
            >
              Role *
            </label>

            <input
              id="role"
              type="text"
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="e.g. Frontend Developer"
              required
              className="w-full rounded-xl border-2 border-[#D8C9E8] px-4 py-3 text-sm font-semibold text-[#29233A] outline-none transition-colors placeholder:text-[#B8B1C7] focus:border-[#7652B8]"
            />
          </div>

          <div>
            <label
              htmlFor="companyType"
              className="mb-1.5 block text-xs font-extrabold text-[#29233A]"
            >
              Company type
            </label>

            <select
              id="companyType"
              value={companyType}
              onChange={(event) => setCompanyType(event.target.value)}
              className="w-full rounded-xl border-2 border-[#D8C9E8] bg-white px-4 py-3 text-sm font-semibold text-[#29233A] outline-none focus:border-[#7652B8]"
            >
              <option value="">Select type</option>
              <option value="startup">Startup</option>
              <option value="small-business">Small business</option>
              <option value="mid-size">Mid-size</option>
              <option value="large-company">Large company</option>
              <option value="government">Government</option>
              <option value="non-profit">Non-profit</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="status"
              className="mb-1.5 block text-xs font-extrabold text-[#29233A]"
            >
              Status *
            </label>

            <select
              id="status"
              value={status}
              onChange={(event) => setStatus(event.target.value)}
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
                htmlFor="dateApplied"
                className="mb-1.5 block text-xs font-extrabold text-[#29233A]"
              >
                Date applied *
              </label>

              <input
                id="dateApplied"
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
                htmlFor="firstResponseDate"
                className="mb-1.5 block text-xs font-extrabold text-[#29233A]"
              >
                First response
              </label>

              <input
                id="firstResponseDate"
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
              htmlFor="notes"
              className="mb-1.5 block text-xs font-extrabold text-[#29233A]"
            >
              Notes
            </label>

            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Anything you want to remember..."
              rows={3}
              className="w-full resize-none rounded-xl border-2 border-[#D8C9E8] px-4 py-3 text-sm font-semibold text-[#29233A] outline-none transition-colors placeholder:text-[#B8B1C7] focus:border-[#7652B8]"
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
              disabled={loading}
              className="flex-1 rounded-xl border-2 border-[#D8C9E8] px-4 py-3 text-sm font-extrabold text-[#7652B8] transition-colors hover:bg-[#F8F5FC] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-xl bg-[#7652B8] px-4 py-3 text-sm font-extrabold text-white shadow-[3px_3px_0px_#17182F] transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}