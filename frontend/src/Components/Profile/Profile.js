const Profile = () => {
    const lastUpdated = localStorage.getItem("lastUpdated");
  return (
    <div>
    <h1 className="title" align="center">
      Profile
    </h1>
       <p style={{ color: "white" }}>
         Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Never"}
      </p>
    </div>
    );
};

export default Profile;