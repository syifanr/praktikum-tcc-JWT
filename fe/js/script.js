const BASE_URL = "https://notes-syifa194-797713225706.us-central1.run.app/";

// Cek apakah token login sudah ada
const token = localStorage.getItem("accessToken");
const refreshToken = localStorage.getItem("refreshToken");

if (!token || !refreshToken) {
  alert("Kamu belum login. Silakan login dulu.");
  window.location.href = "login.html"; 
}

// === SETUP AXIOS JWT ===
const axiosJWT = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${token}`,
  },
  withCredentials: true, // Pastikan ini ditambahkan
});

// Interceptor untuk refresh token otomatis
axiosJWT.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403) && // tangani 401 dan 403
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Request refresh token harus withCredentials true dan tanpa body kalau backendnya expect cookie
        const response = await axios.post(`${BASE_URL}/refresh`, {}, { withCredentials: true });

        const newAccessToken = response.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        axiosJWT.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosJWT(originalRequest);
      } catch (refreshError) {
        alert("Session habis. Silakan login ulang.");
        localStorage.clear();
        window.location.href = "login.html";
      }
    }

    return Promise.reject(error);
  }
);

// Form submit
const formulir = document.querySelector("form");
formulir.addEventListener("submit", (e) => {
  e.preventDefault();

  const elemen_Title = document.querySelector("#Title");
  const elemen_Content = document.querySelector("#Content");

  const Title = elemen_Title.value;
  const Content = elemen_Content.value;
  const id = elemen_Title.dataset.id;

  if (!id) { // perbaikan pengecekan id
    axiosJWT
      .post("/add-notes", { Title, Content })
      .then(() => {
        elemen_Title.value = "";
        elemen_Content.value = "";
        getNotes();
      })
      .catch((error) => console.log(error.message));
  } else {
    axiosJWT
      .put(`/edit-notes/${id}`, { Title, Content })
      .then(() => {
        elemen_Title.dataset.id = "";
        elemen_Title.value = "";
        elemen_Content.value = "";
        getNotes();
      })
      .catch((error) => console.log(error));
  }
});

// Pastikan tombol logout ID-nya sama dengan di script
const logoutBtn = document.querySelector("#logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
}

// === GET NOTES ON PAGE LOAD ===
getNotes();
