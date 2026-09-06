import { useEffect, useMemo, useState } from "react";
import type { CalendarEvent } from "../api/calendar";
import {
  createEvent,
  deleteEvent,
  editEvent,
  getEvents,
} from "../api/calendar";

type EventForm = {
  title: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  notes: string;
  type: string;
};

const emptyForm: EventForm = {
  title: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  notes: "",
  type: "Other",
};

const eventTypeStyles: Record<string, string> = {
  Interview: "bg-[#FDE8F2] text-[#C05282]",
  "Online Assessment": "bg-[#FFF0E8] text-[#C56D45]",
  Deadline: "bg-[#EEE5FF] text-[#7652B8]",
  Other: "bg-[#E9F4EC] text-[#4F8760]",
};

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(
    null
  );
  const [form, setForm] = useState<EventForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");
      const data = await getEvents();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const firstDay = new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  }, [firstDay, daysInMonth]);

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function goToToday() {
    setCurrentDate(new Date());
  }

  function getDateString(day: number) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
  }

  function getEventsForDay(day: number) {
    const dateString = getDateString(day);

    return events.filter(
      (event) =>
        dateString >= event.startDate &&
        dateString <= event.endDate
    );
  }

  function openCreateModal(day?: number) {
    const date = day ? getDateString(day) : "";

    setEditingEvent(null);
    setForm({
      ...emptyForm,
      startDate: date,
      endDate: date,
    });
    setShowModal(true);
  }

  function openEditModal(event: CalendarEvent) {
    setEditingEvent(event);

    setForm({
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      notes: event.notes || "",
      type: event.type || "Other",
    });

    setShowModal(true);
  }

  function closeModal() {
    if (saving) return;

    setShowModal(false);
    setEditingEvent(null);
    setForm(emptyForm);
  }

  function updateForm(field: keyof EventForm, value: string) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (
      !form.title ||
      !form.startDate ||
      !form.endDate ||
      !form.startTime ||
      !form.endTime
    ) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      const eventData = {
        title: form.title,
        startDate: form.startDate,
        endDate: form.endDate,
        startTime: form.startTime,
        endTime: form.endTime,
        notes: form.notes,
        type: form.type,
      };

      if (editingEvent) {
        const updated = await editEvent(editingEvent.id, eventData);

        setEvents((previous) =>
          previous.map((event) =>
            event.id === updated.id ? updated : event
          )
        );
      } else {
        const created = await createEvent(eventData);
        setEvents((previous) => [...previous, created]);
      }

      closeModal();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save event");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(event: CalendarEvent) {
    const confirmed = window.confirm(
      `Delete "${event.title}"?`
    );

    if (!confirmed) return;

    try {
      await deleteEvent(event.id);

      setEvents((previous) =>
        previous.filter((item) => item.id !== event.id)
      );

      closeModal();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete event"
      );
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#29233A]">
            Calendar
          </h1>
          <p className="mt-2 text-sm font-semibold text-[#8A8199]">
            Keep track of interviews, assessments and important deadlines.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openCreateModal()}
          className="rounded-xl bg-[#7652B8] px-5 py-3 text-sm font-extrabold text-white shadow-[4px_4px_0px_#17182F] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#17182F] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#17182F]"
        >
          + Add event
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-[#E5B8C5] bg-[#FDE8EE] px-4 py-3 text-sm font-bold text-[#B94A68]">
          {error}
        </div>
      )}

      {/* Calendar */}
      <section className="overflow-hidden rounded-2xl border border-[#D8C9E8] bg-white shadow-[4px_4px_0px_#D8C9E8]">
        {/* Calendar header */}
        <div className="flex items-center justify-between border-b border-[#E8E1EF] px-6 py-5">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-extrabold text-[#29233A]">
              {monthName} {year}
            </h2>

            <button
              type="button"
              onClick={goToToday}
              className="rounded-lg border border-[#D8C9E8] px-3 py-1.5 text-xs font-extrabold text-[#7652B8] hover:bg-[#F8F5FC]"
            >
              Today
            </button>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={previousMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8C9E8] font-bold text-[#7652B8] hover:bg-[#F8F5FC]"
            >
              ←
            </button>

            <button
              type="button"
              onClick={nextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#D8C9E8] font-bold text-[#7652B8] hover:bg-[#F8F5FC]"
            >
              →
            </button>
          </div>
        </div>

        {/* Weekdays */}
        <div className="grid grid-cols-7 border-b border-[#E8E1EF]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
            (day) => (
              <div
                key={day}
                className="px-3 py-3 text-center text-xs font-extrabold uppercase tracking-wide text-[#8A8199]"
              >
                {day}
              </div>
            )
          )}
        </div>

        {/* Days */}
        {loading ? (
          <div className="flex h-96 items-center justify-center text-sm font-bold text-[#8A8199]">
            Loading calendar...
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {calendarDays.map((day, index) => {
              const dayEvents = day ? getEventsForDay(day) : [];

              const today = new Date();
              const isToday =
                day &&
                today.getFullYear() === year &&
                today.getMonth() === month &&
                today.getDate() === day;

              return (
                <div
                  key={index}
                  onDoubleClick={() => day && openCreateModal(day)}
                  className={`min-h-32 border-b border-r border-[#EEE8F4] p-2 ${
                    day ? "bg-white" : "bg-[#FBF9FD]"
                  }`}
                >
                  {day && (
                    <>
                      <button
                        type="button"
                        onClick={() => openCreateModal(day)}
                        className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${
                          isToday
                            ? "bg-[#7652B8] text-white"
                            : "text-[#6F667C] hover:bg-[#F0EAF8]"
                        }`}
                      >
                        {day}
                      </button>

                      <div className="space-y-1">
                        {dayEvents.map((event) => (
                          <button
                            key={event.id}
                            type="button"
                            onClick={() => openEditModal(event)}
                            className={`block w-full truncate rounded-md px-2 py-1 text-left text-[10px] font-extrabold ${
                              eventTypeStyles[event.type || "Other"] ||
                              eventTypeStyles.Other
                            }`}
                          >
                            {event.startTime} · {event.title}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add/Edit modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#17182F]/60 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#D8C9E8] bg-white p-6 shadow-[6px_6px_0px_#17182F]">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-[#29233A]">
                  {editingEvent ? "Edit event" : "Add event"}
                </h2>
                <p className="mt-1 text-xs font-semibold text-[#8A8199]">
                  Add something important to your job search calendar.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-lg font-bold text-[#8A8199] hover:text-[#29233A]"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-[#29233A]">
                  Event title
                </label>

                <input
                  value={form.title}
                  onChange={(e) =>
                    updateForm("title", e.target.value)
                  }
                  placeholder="e.g. Canva Technical Interview"
                  className="w-full rounded-lg border border-[#D8C9E8] bg-[#FBF9FD] px-4 py-3 text-sm outline-none focus:border-[#7652B8] focus:ring-2 focus:ring-[#EEE5FF]"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-[#29233A]">
                  Type
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    updateForm("type", e.target.value)
                  }
                  className="w-full rounded-lg border border-[#D8C9E8] bg-[#FBF9FD] px-4 py-3 text-sm outline-none focus:border-[#7652B8]"
                >
                  <option>Interview</option>
                  <option>Online Assessment</option>
                  <option>Deadline</option>
                  <option>Other</option>
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-[#29233A]">
                    Start date
                  </label>

                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) =>
                      updateForm("startDate", e.target.value)
                    }
                    className="w-full rounded-lg border border-[#D8C9E8] bg-[#FBF9FD] px-3 py-3 text-sm outline-none focus:border-[#7652B8]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-[#29233A]">
                    End date
                  </label>

                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) =>
                      updateForm("endDate", e.target.value)
                    }
                    className="w-full rounded-lg border border-[#D8C9E8] bg-[#FBF9FD] px-3 py-3 text-sm outline-none focus:border-[#7652B8]"
                    required
                  />
                </div>
              </div>

              {/* Times */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-[#29233A]">
                    Start time
                  </label>

                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) =>
                      updateForm("startTime", e.target.value)
                    }
                    className="w-full rounded-lg border border-[#D8C9E8] bg-[#FBF9FD] px-3 py-3 text-sm outline-none focus:border-[#7652B8]"
                    required
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-extrabold text-[#29233A]">
                    End time
                  </label>

                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) =>
                      updateForm("endTime", e.target.value)
                    }
                    className="w-full rounded-lg border border-[#D8C9E8] bg-[#FBF9FD] px-3 py-3 text-sm outline-none focus:border-[#7652B8]"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-[#29233A]">
                  Notes
                </label>

                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    updateForm("notes", e.target.value)
                  }
                  placeholder="Optional notes..."
                  rows={3}
                  className="w-full resize-none rounded-lg border border-[#D8C9E8] bg-[#FBF9FD] px-4 py-3 text-sm outline-none focus:border-[#7652B8]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {editingEvent && (
                  <button
                    type="button"
                    onClick={() => handleDelete(editingEvent)}
                    className="rounded-lg border border-[#E5B8C5] px-4 py-3 text-sm font-extrabold text-[#B94A68] hover:bg-[#FDE8EE]"
                  >
                    Delete
                  </button>
                )}

                <button
                  type="button"
                  onClick={closeModal}
                  className="ml-auto rounded-lg border border-[#D8C9E8] px-5 py-3 text-sm font-extrabold text-[#6F667C] hover:bg-[#F8F5FC]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#7652B8] px-5 py-3 text-sm font-extrabold text-white shadow-[3px_3px_0px_#17182F] disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingEvent
                    ? "Save changes"
                    : "Add event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}