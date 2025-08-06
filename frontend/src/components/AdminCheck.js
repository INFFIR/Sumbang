// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const AdminCheck = () => {
//   const [user, setUser] = useState(null);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const fetchAdmin = async () => {
//       try {
//         const token = localStorage.getItem("token");

//         // Jika token tidak ada, tolak akses
//         if (!token) {
//           navigate("/aksesditolak");
//           return;
//         }

//         const config = {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         };

//         const response = await axios.get(
//           `${process.env.REACT_APP_API_URL}/api/userAdmin`,
//           config
//         );

//         // Jika bukan admin, tolak akses
//         if (response.data.role !== "Admin") {
//           navigate("/aksesditolak");
//           return;
//         }

//         setUser(response.data);
//       } catch (err) {
//         console.error("Gagal verifikasi admin:", err);
//         navigate("/aksesditolak");
//       }
//     };

//     fetchAdmin();
//   }, [navigate]);

//   if (!user) return <div>Memuat verifikasi...</div>;

//   return (
//     <div>
//       <h2>Selamat datang, Admin!</h2>
//       <p>ID: {user.id}</p>
//       <p>Role: {user.role}</p>
//     </div>
//   );
// };

// export default AdminCheck;
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AdminCheck = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return navigate("/aksesditolak");

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/userAdmin`,
          config
        );

        if (response.data.role !== "Admin") {
          navigate("/aksesditolak");
        } else {
          setLoading(false);
        }
      } catch (err) {
        navigate("/aksesditolak");
      }
    };

    checkRole();
  }, [navigate]);

  if (loading) return <div>Memuat validasi Admin...</div>;

  return children;
};

export default AdminCheck;