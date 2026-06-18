const SUPABASE_URL = 'https://gzgrqnxngelctwdmegva.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6Z3JxbnhuZ2VsY3R3ZG1lZ3ZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0OTkwNzcsImV4cCI6MjA5NzA3NTA3N30.X71JgALxRkoWcCqE8TnRd4RZr9d5M2lrrzX3ICbSFmg';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ui = {
    loginSection: document.getElementById('login-section'),
    dashboardSection: document.getElementById('dashboard-section'),
    loginForm: document.getElementById('login-form'),
    emailInput: document.getElementById('email'),
    passwordInput: document.getElementById('password'),
    btnLogin: document.getElementById('btn-login'),
    btnLogout: document.getElementById('btn-logout'),
    errorMsg: document.getElementById('login-error'),
    
    tableMobil: document.getElementById('table-body-mobil'),
    tableTestimoni: document.getElementById('table-body-testimoni'),

    carModal: document.getElementById('car-modal'),
    btnOpenCarModal: document.getElementById('btn-tambah-mobil'), 
    btnCloseCarModal: document.getElementById('close-car-modal'),
    carForm: document.getElementById('car-form'),
    btnSaveCar: document.getElementById('btn-save-car'),
    carIdInput: document.getElementById('car-id'),
    carNameInput: document.getElementById('car-name'),
    carTypeInput: document.getElementById('car-type'),
    carPriceInput: document.getElementById('car-price'),
    carDescInput: document.getElementById('car-desc'),
    carImageInput: document.getElementById('car-image'),

    testimoniModal: document.getElementById('testimoni-modal'),
    btnOpenTestimoniModal: document.getElementById('btn-tambah-testimoni'), 
    btnCloseTestimoniModal: document.getElementById('close-testimoni-modal'),
    testimoniForm: document.getElementById('testimoni-form'),
    btnSaveTestimoni: document.getElementById('btn-save-testimoni'),
    testimoniImageInput: document.getElementById('testimoni-image')
};

let testiPage = 1;
const testiLimit = 5;
let filteredTesti = [];

function renderTestiTable() {
    ui.tableTestimoni.innerHTML = '';
    const totalPages = Math.ceil(filteredTesti.length / testiLimit) || 1;
    const paginatedData = filteredTesti.slice((testiPage - 1) * testiLimit, testiPage * testiLimit);

    if (paginatedData.length === 0) {
        ui.tableTestimoni.innerHTML = '<tr><td colspan="3" style="text-align:center;">Belum ada testimoni.</td></tr>';
    } else {
        paginatedData.forEach(testi => {
            const tgl = new Date(testi.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${testi.photo_url}" style="width:120px; height:80px; object-fit:cover; border-radius:8px;"></td>
                <td><strong>${tgl}</strong></td>
                <td style="text-align: right;">
                    <button class="btn btn-outline-danger" style="padding: 6px 12px;" onclick="deleteTesti('${testi.id}', '${testi.photo_url}')">Hapus</button>
                </td>
            `;
            ui.tableTestimoni.appendChild(tr);
        });
    }
    document.getElementById('page-info-testimoni').innerText = `Hal ${testiPage} dari ${totalPages}`;
    document.getElementById('btn-prev-testimoni').disabled = testiPage === 1;
    document.getElementById('btn-next-testimoni').disabled = testiPage === totalPages;
}

async function fetchTestimonials() {
    ui.tableTestimoni.innerHTML = '<tr><td colspan="3" style="text-align:center;">Memuat data testimoni...</td></tr>';
    try {
        const { data, error } = await supabaseClient.from('testimonials').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        window.testiList = data;
        filteredTesti = [...window.testiList];
        testiPage = 1;
        renderTestiTable();
    } catch (err) {
        ui.tableTestimoni.innerHTML = `<tr><td colspan="3" style="color:red;">Error: ${err.message}</td></tr>`;
    }
}

document.getElementById('search-testimoni').addEventListener('input', (e) => {
    const kw = e.target.value.toLowerCase();
    filteredTesti = window.testiList.filter(t => new Date(t.created_at).toLocaleDateString('id-ID', {month:'long'}).toLowerCase().includes(kw));
    testiPage = 1; renderTestiTable();
});
document.getElementById('btn-prev-testimoni').addEventListener('click', () => { if(testiPage > 1) { testiPage--; renderTestiTable(); }});
document.getElementById('btn-next-testimoni').addEventListener('click', () => { if(testiPage < Math.ceil(filteredTesti.length/testiLimit)) { testiPage++; renderTestiTable(); }});

ui.btnOpenTestimoniModal.addEventListener('click', () => { ui.testimoniForm.reset(); ui.testimoniModal.style.display = 'flex'; });
ui.btnCloseTestimoniModal.addEventListener('click', () => ui.testimoniModal.style.display = 'none');

ui.testimoniForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    ui.btnSaveTestimoni.disabled = true; ui.btnSaveTestimoni.innerText = 'Mengupload...';
    try {
        const file = ui.testimoniImageInput.files[0];
        if(!file) throw new Error("Pilih foto terlebih dahulu!");
        const fileName = `testimonials/${Date.now()}.${file.name.split('.').pop()}`;
        await supabaseClient.storage.from('testimonial').upload(fileName, file);
        const photoUrl = supabaseClient.storage.from('testimonial').getPublicUrl(fileName).data.publicUrl;
        
        await supabaseClient.from('testimonials').insert([{ photo_url: photoUrl }]);
        ui.testimoniModal.style.display = 'none'; fetchTestimonials();
    } catch (err) { alert(err.message); } 
    finally { ui.btnSaveTestimoni.disabled = false; ui.btnSaveTestimoni.innerText = 'Upload Testimoni'; }
});

window.deleteTesti = async (id, photoUrl) => {
    if(!confirm("Apakah Anda yakin ingin menghapus foto testimoni ini?")) return;

    try {
        if (photoUrl && photoUrl !== '#' && photoUrl.includes('testimonial')) {
            const urlParts = photoUrl.split('/');
            const fileName = urlParts[urlParts.length - 1]; 
            
            const { error: storageError } = await supabaseClient.storage
                .from('testimonial')
                .remove([`testimonials/${fileName}`]);
                
            if (storageError) {
                console.warn("Peringatan: Gambar gagal dihapus dari storage", storageError);
            }
        }

        const { error: dbError } = await supabaseClient.from('testimonials').delete().eq('id', id); 
        if (dbError) throw dbError;

        alert("Testimoni beserta fotonya berhasil dihapus!");
        fetchTestimonials();

    } catch (error) {
        console.error("Error menghapus testimoni:", error);
        alert("Terjadi kesalahan saat menghapus data: " + error.message);
    }
};

let currentPage = 1;
const itemsPerPage = 5;
let filteredCarList = [];

function renderCarTable() {
    ui.tableMobil.innerHTML = ''; 
    const totalPages = Math.ceil(filteredCarList.length / itemsPerPage) || 1;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = filteredCarList.slice(startIndex, endIndex);

    if (paginatedData.length === 0) {
        ui.tableMobil.innerHTML = '<tr><td colspan="5" style="text-align:center;">Data tidak ditemukan.</td></tr>';
    } else {
        paginatedData.forEach((car) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${car.photo_url || '#'}" alt="${car.name}" style="width:80px; height:50px; object-fit:cover; border-radius:6px;" onerror="this.src='https://via.placeholder.com/80?text=No+Image'"></td>
                <td><strong>${car.name}</strong></td>
                <td>${car.type}</td>
                <td>${car.price}</td>
                <td style="text-align: right;">
                    <button class="btn btn-primary" style="padding: 6px 12px; font-size: 12px; margin-right: 5px;" onclick="editCar('${car.id}')">Edit</button>
                    <button class="btn btn-danger" style="padding: 6px 12px; font-size: 12px;" onclick="deleteCar('${car.id}', '${car.photo_url}')">Hapus</button>
                </td>
            `;
            ui.tableMobil.appendChild(tr);
        });
    }

    document.getElementById('page-info-car').innerText = `Hal ${currentPage} dari ${totalPages}`;
    document.getElementById('btn-prev-car').disabled = currentPage === 1;
    document.getElementById('btn-next-car').disabled = currentPage === totalPages;
}

document.getElementById('search-car').addEventListener('input', (e) => {
    const keyword = e.target.value.toLowerCase();
    filteredCarList = window.carList.filter(car => 
        car.name.toLowerCase().includes(keyword) || 
        car.type.toLowerCase().includes(keyword)
    );
    currentPage = 1; 
    renderCarTable(); 
});

document.getElementById('btn-prev-car').addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; renderCarTable(); }
});
document.getElementById('btn-next-car').addEventListener('click', () => {
    const totalPages = Math.ceil(filteredCarList.length / itemsPerPage);
    if (currentPage < totalPages) { currentPage++; renderCarTable(); }
});

async function checkAuthSession() {
    const { data: { session }, error } = await supabaseClient.auth.getSession();
    if (session) {
        ui.loginSection.style.display = 'none';
        ui.dashboardSection.style.display = 'block';
        fetchCarModels();
    } else {
        ui.loginSection.style.display = 'flex';
        ui.dashboardSection.style.display = 'none';
    }
}

ui.loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = ui.emailInput.value;
    const password = ui.passwordInput.value;
    ui.btnLogin.innerText = 'Memeriksa...';
    ui.btnLogin.disabled = true;

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
        if (error) throw error;
        ui.errorMsg.style.display = 'none';
        checkAuthSession();
    } catch (error) {
        ui.errorMsg.innerText = "Gagal login: " + error.message;
        ui.errorMsg.style.display = 'block';
    } finally {
        ui.btnLogin.innerText = 'Masuk ke Dashboard';
        ui.btnLogin.disabled = false;
    }
});

ui.btnLogout.addEventListener('click', async () => {
    await supabaseClient.auth.signOut();
    checkAuthSession();
    ui.emailInput.value = '';
    ui.passwordInput.value = '';
});

function showTab(tabName) {
    document.getElementById('tab-mobil').style.display = tabName === 'mobil' ? 'block' : 'none';
    document.getElementById('tab-testimoni').style.display = tabName === 'testimoni' ? 'block' : 'none';
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => tab.classList.remove('active')); 

    if (tabName === 'mobil') {
        tabs[0].classList.add('active'); 
        fetchCarModels();
    } else if (tabName === 'testimoni') {
        tabs[1].classList.add('active'); 
        fetchTestimonials();
    }
}


async function fetchCarModels() {
    ui.tableMobil.innerHTML = '<tr><td colspan="5" style="text-align:center;">Memuat data...</td></tr>';
    try {
        const { data, error } = await supabaseClient.from('car_models').select('*').order('created_at', { ascending: false });
        if (error) throw error;

        window.carList = data;
        filteredCarList = [...window.carList];
        currentPage = 1;
        renderCarTable();
    } catch (error) {
        console.error("Error fetching cars:", error);
        ui.tableMobil.innerHTML = `<tr><td colspan="5" style="color:red;">Gagal memuat data: ${error.message}</td></tr>`;
    }
}

ui.btnOpenCarModal.addEventListener('click', () => {
    ui.carForm.reset(); 
    ui.carIdInput.value = ''; 
    document.getElementById('current-image-info').innerText = '';
    document.getElementById('modal-car-title').innerText = 'Tambah Model Mobil';
    ui.btnSaveCar.innerText = 'Simpan Data Mobil';
    ui.carModal.style.display = 'flex';
});

window.editCar = function(id) {
    const car = window.carList.find(c => c.id === id);
    if (!car) return;

    ui.carIdInput.value = car.id; 
    ui.carNameInput.value = car.name;
    ui.carTypeInput.value = car.type;
    ui.carPriceInput.value = car.price;
    ui.carDescInput.value = car.description;
    document.getElementById('current-image-info').innerText = "Catatan: Biarkan kosong jika tidak ingin mengubah foto mobil.";
    document.getElementById('modal-car-title').innerText = 'Edit Data Mobil';
    ui.btnSaveCar.innerText = 'Update Data Mobil';
    ui.carModal.style.display = 'flex';
};

ui.btnCloseCarModal.addEventListener('click', () => {
    ui.carModal.style.display = 'none';
});

ui.carForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const isEdit = ui.carIdInput.value !== ''; 
    ui.btnSaveCar.innerText = 'Menyimpan...';
    ui.btnSaveCar.disabled = true;

    try {
        let photoUrl = '';
        let oldPhotoUrl = '';

        if (isEdit) {
            const oldCar = window.carList.find(c => c.id === ui.carIdInput.value);
            if (oldCar) oldPhotoUrl = oldCar.photo_url;
            photoUrl = oldPhotoUrl; 
        }

        const file = ui.carImageInput.files[0];

        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}.${fileExt}`;
            const filePath = `cars/${fileName}`;

            const { error: uploadError } = await supabaseClient.storage
                .from('model_car')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabaseClient.storage
                .from('model_car')
                .getPublicUrl(filePath);
            
            photoUrl = publicUrlData.publicUrl; 

            if (isEdit && oldPhotoUrl && oldPhotoUrl.includes('model_car')) {
                const urlParts = oldPhotoUrl.split('/');
                const oldFileName = urlParts[urlParts.length - 1];
                await supabaseClient.storage.from('model_car').remove([`cars/${oldFileName}`]);
            }
        }

        const carData = {
            name: ui.carNameInput.value,
            type: ui.carTypeInput.value,
            price: ui.carPriceInput.value,
            description: ui.carDescInput.value,
            photo_url: photoUrl
        };

        if (isEdit) {
            const { error: updateError } = await supabaseClient
                .from('car_models')
                .update(carData)
                .eq('id', ui.carIdInput.value); 
            if (updateError) throw updateError;
            alert("Data mobil berhasil diperbarui!");
        } else {
            const { error: insertError } = await supabaseClient
                .from('car_models')
                .insert([carData]);
            if (insertError) throw insertError;
            alert("Data mobil berhasil ditambahkan!");
        }

        ui.carModal.style.display = 'none';
        ui.carForm.reset();
        fetchCarModels();

    } catch (error) {
        console.error("Error saving car:", error);
        alert("Gagal menyimpan data: " + error.message);
    } finally {
        ui.btnSaveCar.innerText = 'Simpan Data Mobil';
        ui.btnSaveCar.disabled = false;
    }
});

window.deleteCar = async function(id, photoUrl) {
    const confirmDelete = confirm("Apakah Anda yakin ingin menghapus data mobil ini?");
    if (!confirmDelete) return;

    try {
        if (photoUrl && photoUrl !== '#' && photoUrl.includes('model_car')) {
            const urlParts = photoUrl.split('/');
            const fileName = urlParts[urlParts.length - 1]; 
            const filePath = `cars/${fileName}`;

            const { error: storageError } = await supabaseClient.storage
                .from('model_car')
                .remove([filePath]);

            if (storageError) {
                console.warn("Gambar gagal dihapus dari storage", storageError);
            }
        }

        const { error: dbError } = await supabaseClient.from('car_models').delete().eq('id', id); 
        if (dbError) throw dbError;

        alert("Data mobil berhasil dihapus!");
        fetchCarModels();

    } catch (error) {
        console.error("Error menghapus mobil:", error);
        alert("Terjadi kesalahan saat menghapus data: " + error.message);
    }
};

checkAuthSession();