# Personal-budgeting-app-

notes:
Patch 1 
Penyesuaian currency dari dollar ke rupiah meliputi
- tampilan UI
- format angka dari $0 ke Rp 0.0

Patch 2
Fetching data supabase

Patch 3
Penambahan smart daily adjustment 
- Jika hari sebelumnya spent uang melebihi batas, maka uang yang bisa digunakan di hari setelahnya akan lebih sedikit
- Jika hari sebelumnya spent uang dibawah batas, maka uang yang bisa digunakan di hari setelahnya akan lebih banyak
Contoh:
Budget harian: 30k
Kemarin pakai 50k
→ Hari ini jadi 20k

Fix code typing