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
});

// Interceptor untuk refresh token otomatis
axiosJWT.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 403 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${BASE_URL}/refresh`, {
          refreshToken: localStorage.getItem("refreshToken"),
        });

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

// === HANDLE FORM SUBMIT ===
const formulir = document.querySelector("form");

  formulir.addEventListener("submit", (e) => {
    e.preventDefault();

    const elemen_Title = document.querySelector("#Title");
    const elemen_Content = document.querySelector("#Content");

    const Title = elemen_Title.value;
    const Content = elemen_Content.value;
    const id = elemen_Title.dataset.id;

  if (id === "") {
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

// === GET NOTES ===
async function getNotes() {
  try {
    const { data } = await axiosJWT.get("/notes");

    const table = document.querySelector("#table-notes");
    let tampilan = "";
    let no = 1;

    for (const notes of data) {
      tampilan += tampilkanNotes(no, notes);
      no++;
    }

    table.innerHTML = tampilan;
    hapusNotes();
    editNotes();
  } catch (error) {
    console.log(error.message);
  }
}

// === TAMPILKAN NOTES ===
function tampilkanNotes(no, notes) {
  return `
    <tr>
      <td>${no}</td>
      <td class="Title">${notes.Title}</td>
      <td class="Content">${notes.Content}</td>
      <td><button data-id=${notes.id} class='btn-edit'>Edit</button></td>
      <td><button data-id=${notes.id} class='btn-hapus'>Delete</button></td>
    </tr>
  `;
}

// === HAPUS NOTES ===
function hapusNotes() {
  const kumpulan_tombol_hapus = document.querySelectorAll(".btn-hapus");

  kumpulan_tombol_hapus.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      axiosJWT
        .delete(`/delete-notes/${id}`)
        .then(() => getNotes())
        .catch((error) => console.log(error));
    });
  });
}

// === EDIT NOTES ===
function editNotes() {
  const kumpulan_tombol_edit = document.querySelectorAll(".btn-edit");

    kumpulan_tombol_edit.forEach((tombol_edit) => {
      tombol_edit.addEventListener("click", () => {
        const id = tombol_edit.dataset.id;
        const Title =
          tombol_edit.parentElement.parentElement.querySelector(
            ".Title"
          ).innerText;
        const Content =
          tombol_edit.parentElement.parentElement.querySelector(
            ".Content"
          ).innerText;

          const elemen_Title = document.querySelector("#Title");
          const elemen_Content = document.querySelector("#Content");

          elemen_Title.dataset.id = id;
          elemen_Title.value = Title;
          elemen_Content.value = Content;
      });
    });
}

// === LOGOUT FUNCTION ===
const logoutBtn = document.querySelector("#logout");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html"; // ganti sesuai halaman login kamu
  });
}

// === GET NOTES ON PAGE LOAD ===
getNotes();
