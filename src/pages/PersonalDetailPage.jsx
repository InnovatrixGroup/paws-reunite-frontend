import { useEffect, useState } from "react";
import { useLocalStorage } from "react-use";
import { useUserPostDispatch, useUserPost } from "../contexts/UserPostContext";
import { useNavigate } from "react-router-dom";
import "../styles/PersonalDetailPage.css";
import EditProfileDialog from "../components/EditProfileDialog";
import EditPostPopup from "../components/EditPostPopup";
import { Navigate } from "react-router-dom";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import { ValidateUserAuth } from "../services/UserAuth";
import { set } from "react-hook-form";

const api = process.env.REACT_APP_DATABASE_URL;

export default function PersonalDetailPage() {
  const [userAuth, setUserAuth] = useLocalStorage("pawsReuniteUserAuth");
  const [userDetail, setUserDetail] = useState(null);
  const [isCreate, setIsCreate] = useState(false);
  const navigate = useNavigate();
  const userPostDispatch = useUserPostDispatch();
  const userPostData = useUserPost();
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [isRedirectToLanding, setIsRedirectToLanding] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isNotificationRedirect, setIsNotificationRedirect] = useState(false);
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleLogout = () => {
    setUserAuth(null);
    alert("You have logged out.");
    // navigate to landing page automatically after logout
    navigate("/welcome");
  };

  const handleNotificationIconClick = () => {
    setIsNotificationOpen((prevIsOpen) => !prevIsOpen);
    console.log(isNotificationOpen);
  };

  // fetch user data and save to state
  useEffect(() => {
    async function fetchUserData() {
      try {
        const jsonData = await ValidateUserAuth(userAuth);
        setUserDetail(jsonData);
      } catch (error) {
        console.log(error);
      }
    }

    const fetchUserPosts = async () => {
      try {
        const response = await fetch(`${api}/posts/user`, {
          method: "GET",
          headers: {
            authorization: `Bearer ${userAuth?.jwt}`,
            userId: userAuth?.userId
          }
        });
        const jsonData = await response.json();
        userPostDispatch({ type: "loadAll", payload: jsonData.data });
      } catch (error) {
        console.log(error);
      }
    };

    const fetchUserNotifications = async () => {
      try {
        const response = await fetch(`${api}/notifications`, {
          method: "GET",
          headers: {
            authorization: `Bearer ${userAuth?.jwt}`,
            userId: userAuth?.userId
          }
        });
        const jsonData = await response.json();
        setNotifications(jsonData.data);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }
    };

    fetchUserPosts();
    fetchUserData();
    fetchUserNotifications();
  }, [userAuth]);

  // handle edit profile dialog
  const [editProfileDialogOpen, setEditProfileDialogOpen] = useState(false);
  const closeEditProfileDialog = () => {
    setEditProfileDialogOpen(false);
  };
  const openEditProfileDialog = () => {
    setEditProfileDialogOpen(true);
  };

  const [redirect, setRedirect] = useState(false);

  const handleRedirect = (id) => {
    setRedirect(true);
    setSelectedPostId(id);
  };

  // hide navbar when edit profile dialog is open, but show footer
  useEffect(() => {
    const navbar = document.querySelector(".navbar");
    editProfileDialogOpen && navbar.classList.add("hidden");

    const footer = document.querySelector(".footer-container");
    editProfileDialogOpen && footer.classList.add("show-footer");

    return () => {
      navbar.classList.remove("hidden");
      footer.classList.remove("show-footer");
    };
  }, [editProfileDialogOpen]);

  const handleNotificationRedirect = (postId) => {
    setIsNotificationRedirect(true);
    setSelectedNotificationId(postId);
  };

  return (
    <>
      {isLoading ? (
        <></>
      ) : (
        <div>
          <div className="personal-info-container">
            <div className="personal-info-avatar hidden md:block lg:block"></div>

            <div className="personal-info relative">
              <div className="flex">
                <h1 className="mr-3">Personal Info</h1>
                <div className="relative cursor-pointer" onClick={handleNotificationIconClick}>
                  <NotificationsOutlinedIcon className="notification-icon hover:scale-105" />
                  <div className="notification-text bg-white rounded-full text-black text-[8px] w-[14px] h-[14px] flex justify-center items-center absolute top-0 right-0">
                    <p className="">{notifications && notifications.length}</p>
                  </div>
                </div>
              </div>
              <h3 className="username">{userDetail && userDetail.username}</h3>
              <h3 className="email">{userDetail && userDetail.email}</h3>
            </div>

            <div className="personal-info-btn-container">
              {userDetail?.role === "admin" && (
                <button onClick={() => navigate("/admin")}>Admin Page</button>
              )}
              <button onClick={openEditProfileDialog}>Edit profile</button>
              <EditProfileDialog
                isOpen={editProfileDialogOpen}
                closeDialog={closeEditProfileDialog}
                setUserDetail={setUserDetail}
                userDetail={userDetail}
                userAuth={userAuth}
                setUserAuth={setUserAuth}
              />
              <button onClick={handleLogout}>Logout</button>
            </div>
          </div>
          <div
            className={`notification-container bg-black text-white ${
              isNotificationOpen ? "notification-open" : ""
            }`}
          >
            {notifications.length > 0 &&
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className="p-3 bg-neutral-900 rounded-xl cursor-pointer hover:underline"
                  onClick={() => handleNotificationRedirect(notification.postId)}
                >
                  {notification.message}
                </div>
              ))}
          </div>

          <div className="personal-info-post-container">
            <h1>Your Posts</h1>
            <div className="grid grid-cols-3 gap-3 p-5 xs:gap-0">
              {userPostData &&
                userPostData.map((post) => (
                  <div
                    className="image personal-post-image"
                    onClick={() => handleRedirect(post._id)}
                    key={post._id}
                  >
                    <img
                      src={post?.photos[0]}
                      className="w-full aspect-square object-cover"
                      alt="post"
                    />
                  </div>
                ))}
            </div>
            <button onClick={() => setIsCreate(true)} className="create-post-btn">
              Create Post
            </button>
            {
              <EditPostPopup
                trigger={isCreate}
                close={() => setIsCreate(false)}
                post={{}}
                mode="create"
              />
            }
            {redirect && <Navigate to={`/pets/${selectedPostId}`} />}
            {isNotificationRedirect && <Navigate to={`/pets/${selectedNotificationId}`} />}
            {notifications && console.log(notifications)}
          </div>
        </div>
      )}
    </>
  );
}
