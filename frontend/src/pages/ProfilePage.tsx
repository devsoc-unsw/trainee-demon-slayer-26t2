import { useEffect, useRef, useState, type FormEvent } from "react";
import "./ProfilePage.css";

interface ProfileUser {
  name: string;
  email: string;
  avatarUrl: string;
}

function fetchMockProfile(): Promise<ProfileUser | null> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: "User",
        email: "user@example.com",
        avatarUrl: "/emptyProfile.jpg",
      });
    }, 600);
  });
}

export function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<ProfileUser | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  // Guards against an accidental rapid double-click landing on the "Save"
  // button, which renders in the exact same spot "Edit profile" just was
  // (see: Save immediately firing right after Edit, before the editable
  // state is ever visible/usable).
  const editingStartedAtRef = useRef<number | null>(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchMockProfile().then((data) => {
      if (cancelled) return;
      setUser(data);
      setIsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  function handleRetry() {
    setIsLoading(true);
    fetchMockProfile().then((data) => {
      setUser(data);
      setIsLoading(false);
    });
  }

  function handleStartEditing() {
    if (!user) return;
    setDraftName(user.name);
    setProfileMessage(null);
    setIsEditing(true);
    editingStartedAtRef.current = Date.now();
  }

  function handleCancelEditing() {
    setIsEditing(false);
    editingStartedAtRef.current = null;
  }

  function handleSaveProfile(event: FormEvent) {
    event.preventDefault();
    if (!user) return;

    // A rapid double-click on "Edit profile" lands its second click on
    // "Save" (it renders in the same place). Ignore a submit that arrives
    // suspiciously soon after entering edit mode so people get a real
    // chance to see/use the editable field first.
    const editingStartedAt = editingStartedAtRef.current;
    if (editingStartedAt !== null && Date.now() - editingStartedAt < 300) {
      return;
    }

    const trimmedName = draftName.trim();
    if (!trimmedName) {
      setProfileMessage("Name can't be empty.");
      return;
    }

    // TODO: call the real update-profile endpoint here once it exists.
    setUser({ ...user, name: trimmedName });
    setIsEditing(false);
    setProfileMessage("Profile updated.");
    editingStartedAtRef.current = null;
  }

  function handleTogglePasswordSection() {
    setIsChangingPassword((prev) => !prev);
    setPasswordError(null);
    setPasswordSuccess(null);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  function handleChangePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Fill in all three fields.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation don't match.");
      return;
    }

    // TODO: replace with a real call to PATCH /user/auth/change-password
    // (see backend/auth.js) once the frontend auth service exposes it.
    setPasswordSuccess("Password changed.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  if (isLoading) {
    return (
      <section className="profile-page">
        <div className="profile-header">
          <h1>Profile</h1>
          <p>View and manage your account details.</p>
        </div>

        <div className="profile-card profile-status" role="status" aria-live="polite">
          <span className="loading-spinner" aria-hidden="true" />
          <span>Loading your profile...</span>
        </div>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="profile-page">
        <div className="profile-header">
          <h1>Profile</h1>
          <p>View and manage your account details.</p>
        </div>

        <div className="profile-card profile-status" role="alert">
          <p>We couldn't load your profile.</p>
          <button type="button" className="edit-button" onClick={handleRetry}>
            Try again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="profile-header">
        <h1>Profile</h1>
        <p>View and manage your account details.</p>
      </div>

      <div className="profile-card">
        <div className="avatar-section">
          <img
            className="profile-avatar"
            src={user.avatarUrl}
            alt={`${user.name}'s avatar`}
          />

          <button type="button" className="avatar-button" title="Coming soon">
            Change avatar
          </button>
        </div>

        <div className="profile-form">
          {profileMessage && (
            <p className="form-message" role="status">
              {profileMessage}
            </p>
          )}

          <form onSubmit={handleSaveProfile}>
            <div className="form-field">
              <label htmlFor="profile-name">Name</label>
              <input
                id="profile-name"
                type="text"
                value={isEditing ? draftName : user.name}
                onChange={(event) => setDraftName(event.target.value)}
                readOnly={!isEditing}
              />
            </div>

            <div className="form-field">
              <label htmlFor="profile-email">Email</label>
              <input
                id="profile-email"
                type="email"
                value={user.email}
                readOnly
              />
            </div>

            <div className="form-actions">
              {isEditing ? (
                <>
                  <button type="submit" className="edit-button primary">
                    Save
                  </button>
                  <button
                    type="button"
                    className="edit-button"
                    onClick={handleCancelEditing}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="edit-button"
                  onClick={handleStartEditing}
                >
                  Edit profile
                </button>
              )}
            </div>
          </form>

          <div className="password-section">
            <div className="password-section-header">
              <h2>Password</h2>
              <button
                type="button"
                className="edit-button"
                onClick={handleTogglePasswordSection}
              >
                {isChangingPassword ? "Cancel" : "Change password"}
              </button>
            </div>

            {isChangingPassword && (
              <form
                className="password-form"
                onSubmit={handleChangePassword}
              >
                <div className="form-field">
                  <label htmlFor="current-password">Current password</label>
                  <input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(event.target.value)
                    }
                    autoComplete="current-password"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="new-password">New password</label>
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="confirm-password">
                    Confirm new password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    autoComplete="new-password"
                  />
                </div>

                {passwordError && (
                  <p className="form-error" role="alert">
                    {passwordError}
                  </p>
                )}
                {passwordSuccess && (
                  <p className="form-message" role="status">
                    {passwordSuccess}
                  </p>
                )}

                <div className="form-actions">
                  <button type="submit" className="edit-button primary">
                    Update password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
