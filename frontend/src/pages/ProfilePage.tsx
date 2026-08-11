import "./ProfilePage.css";

export function ProfilePage() {
  const user = {
    name: "User",
    email: "user@example.com",
    avatarUrl: "/emptyProfile.jpg",
  };

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

          <button type="button" className="avatar-button">
            Change avatar
          </button>
        </div>

        <div className="profile-form">
          <div className="form-field">
            <label htmlFor="profile-name">Name</label>
            <input
              id="profile-name"
              type="text"
              value={user.name}
              readOnly
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

          <div className="form-field">
            <label htmlFor="profile-password">Password</label>
            <input
              id="profile-password"
              type="password"
              value="password"
              readOnly
            />
          </div>

          <button type="button" className="edit-button">
            Edit profile
          </button>
        </div>
      </div>
    </section>
  );
}