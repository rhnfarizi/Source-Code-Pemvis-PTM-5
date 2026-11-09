import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useReducer,
} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
} from 'react-native';

/* ===================== DATA AWAL (minimal 5 tugas) ===================== */
const STATUS_BELUM = 'Belum Dikerjakan';
const STATUS_SELESAI = 'Selesai';

const initialTasks = [
  {
    id: '1',
    nama: 'Laporan Praktikum Basis Data',
    matkul: 'Basis Data',
    deskripsi: 'Membuat ERD dan query SQL untuk studi kasus perpustakaan.',
    deadline: '2026-11-12',
    status: STATUS_BELUM,
  },
  {
    id: '2',
    nama: 'Aplikasi Tempat Wisata',
    matkul: 'Pemrograman Visual',
    deskripsi: 'Membuat aplikasi React Native dengan FlatList.',
    deadline: '2026-11-10',
    status: STATUS_SELESAI,
  },
  {
    id: '3',
    nama: 'Makalah Etika Profesi',
    matkul: 'Etika Profesi',
    deskripsi: 'Makalah 10 halaman tentang kode etik di bidang TI.',
    deadline: '2026-11-15',
    status: STATUS_BELUM,
  },
  {
    id: '4',
    nama: 'Simulasi Robot SCARA',
    matkul: 'Robotika',
    deskripsi: 'Simulasi kinematika lengan robot menggunakan MATLAB.',
    deadline: '2026-11-18',
    status: STATUS_BELUM,
  },
  {
    id: '5',
    nama: 'Proposal Sistem Informasi',
    matkul: 'Rekayasa Perangkat Lunak',
    deskripsi: 'Menyusun proposal dan diagram UML sistem manajemen kos.',
    deadline: '2026-11-08',
    status: STATUS_SELESAI,
  },
];

/* ===================== REDUCER (useReducer) ===================== */
function tasksReducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK':
      // tugas baru ditaruh paling atas agar langsung terlihat
      return [action.payload, ...state];
    case 'DELETE_TASK':
      return state.filter((task) => task.id !== action.payload);
    case 'TOGGLE_STATUS':
      return state.map((task) =>
        task.id === action.payload
          ? {
              ...task,
              status:
                task.status === STATUS_BELUM ? STATUS_SELESAI : STATUS_BELUM,
            }
          : task
      );
    case 'RESET_TASKS':
      return [];
    default:
      return state;
  }
}

/* ===================== KOMPONEN ANAK (Props) ===================== */
// SummaryBox menerima label, nilai, dan warna dari komponen induk lewat props
function SummaryBox({ label, value, color }) {
  return (
    <View style={[styles.summaryBox, { borderTopColor: color }]}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

// TaskCard menerima data tugas + fungsi aksi dari komponen induk lewat props
const TaskCard = React.memo(function TaskCard({
  id,
  nama,
  matkul,
  deskripsi,
  deadline,
  status,
  onToggle,
  onDelete,
}) {
  const selesai = status === STATUS_SELESAI;

  return (
    <View style={[styles.card, selesai && styles.cardSelesai]}>
      <View style={styles.cardHeader}>
        <Text
          style={[styles.cardTitle, selesai && styles.textSelesai]}
          numberOfLines={2}
        >
          {nama}
        </Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: selesai ? '#2e9e5b' : '#e08a1e' },
          ]}
        >
          <Text style={styles.badgeText}>{status}</Text>
        </View>
      </View>

      <Text style={styles.cardMatkul}>{matkul}</Text>
      <Text style={[styles.cardDesc, selesai && styles.textSelesai]}>
        {deskripsi}
      </Text>
      <Text style={styles.cardDeadline}>Deadline: {deadline}</Text>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[
            styles.btn,
            { backgroundColor: selesai ? '#6b7280' : '#2e9e5b' },
          ]}
          onPress={() => onToggle(id)}
        >
          <Text style={styles.btnText}>
            {selesai ? 'Tandai Belum' : 'Tandai Selesai'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: '#d64545' }]}
          onPress={() => onDelete(id)}
        >
          <Text style={styles.btnText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

/* ===================== KOMPONEN INDUK ===================== */
export default function App() {
  // useReducer: mengelola daftar tugas
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  // useState: nilai input form dan keyword pencarian
  const [nama, setNama] = useState('');
  const [matkul, setMatkul] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [deadline, setDeadline] = useState('');
  const [keyword, setKeyword] = useState('');

  // useRef: akses TextInput nama tugas
  const namaInputRef = useRef(null);

  // useEffect: pantau perubahan keyword (dependency array [keyword])
  useEffect(() => {
    console.log('Keyword pencarian berubah:', keyword);
  }, [keyword]);

  // useMemo: jumlah tugas hanya dihitung ulang ketika data tugas berubah
  const total = tasks.length;
  const jumlahBelum = useMemo(
    () => tasks.filter((t) => t.status === STATUS_BELUM).length,
    [tasks]
  );
  const jumlahSelesai = useMemo(
    () => tasks.filter((t) => t.status === STATUS_SELESAI).length,
    [tasks]
  );

  // Daftar hasil pencarian (berdasarkan nama tugas atau mata kuliah)
  const filteredTasks = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return tasks;
    return tasks.filter(
      (t) =>
        t.nama.toLowerCase().includes(q) || t.matkul.toLowerCase().includes(q)
    );
  }, [tasks, keyword]);

  // useCallback: fungsi tambah tugas
  const handleAddTask = useCallback(() => {
    if (!nama.trim() || !matkul.trim() || !deskripsi.trim() || !deadline.trim()) {
      Alert.alert('Data belum lengkap', 'Isi semua kolom terlebih dahulu.');
      return;
    }

    dispatch({
      type: 'ADD_TASK',
      payload: {
        id: Date.now().toString(),
        nama: nama.trim(),
        matkul: matkul.trim(),
        deskripsi: deskripsi.trim(),
        deadline: deadline.trim(),
        status: STATUS_BELUM,
      },
    });

    setNama('');
    setMatkul('');
    setDeskripsi('');
    setDeadline('');

    // fokus kembali ke input nama tugas
    namaInputRef.current?.focus();
  }, [nama, matkul, deskripsi, deadline]);

  // useCallback: fungsi hapus tugas
  const handleDeleteTask = useCallback((id) => {
    dispatch({ type: 'DELETE_TASK', payload: id });
  }, []);

  // useCallback: fungsi ubah status tugas
  const handleToggleStatus = useCallback((id) => {
    dispatch({ type: 'TOGGLE_STATUS', payload: id });
  }, []);

  // Hapus seluruh tugas (action RESET_TASKS) dengan konfirmasi
  const handleResetTasks = useCallback(() => {
    Alert.alert('Hapus semua tugas?', 'Seluruh data tugas akan dihapus.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus Semua',
        style: 'destructive',
        onPress: () => dispatch({ type: 'RESET_TASKS' }),
      },
    ]);
  }, []);

  const renderItem = useCallback(
    ({ item }) => (
      <TaskCard
        id={item.id}
        nama={item.nama}
        matkul={item.matkul}
        deskripsi={item.deskripsi}
        deadline={item.deadline}
        status={item.status}
        onToggle={handleToggleStatus}
        onDelete={handleDeleteTask}
      />
    ),
    [handleToggleStatus, handleDeleteTask]
  );

  // Bagian atas daftar: judul, ringkasan, form tambah, pencarian
  const header = (
    <View>
      <Text style={styles.title}>Manajemen Tugas Mahasiswa</Text>

      {/* Ringkasan tugas */}
      <View style={styles.summaryRow}>
        <SummaryBox label="Total Tugas" value={total} color="#2563eb" />
        <SummaryBox label="Belum Dikerjakan" value={jumlahBelum} color="#e08a1e" />
        <SummaryBox label="Selesai" value={jumlahSelesai} color="#2e9e5b" />
      </View>

      {/* Form tambah tugas */}
      <View style={styles.form}>
        <Text style={styles.sectionTitle}>Tambah Tugas</Text>
        <TextInput
          ref={namaInputRef}
          style={styles.input}
          placeholder="Nama tugas"
          value={nama}
          onChangeText={setNama}
        />
        <TextInput
          style={styles.input}
          placeholder="Mata kuliah"
          value={matkul}
          onChangeText={setMatkul}
        />
        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Deskripsi tugas"
          value={deskripsi}
          onChangeText={setDeskripsi}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Deadline (contoh: 2026-11-20)"
          value={deadline}
          onChangeText={setDeadline}
        />
        <TouchableOpacity
          style={[styles.btn, styles.btnFull, { backgroundColor: '#2563eb' }]}
          onPress={handleAddTask}
        >
          <Text style={styles.btnText}>Tambah Tugas</Text>
        </TouchableOpacity>
      </View>

      {/* Pencarian */}
      <TextInput
        style={[styles.input, styles.search]}
        placeholder="Cari berdasarkan nama tugas atau mata kuliah..."
        value={keyword}
        onChangeText={setKeyword}
      />

      <View style={styles.listHeaderRow}>
        <Text style={styles.sectionTitle}>
          Daftar Tugas ({filteredTasks.length})
        </Text>
        <TouchableOpacity onPress={handleResetTasks}>
          <Text style={styles.resetText}>Hapus Semua</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <Text style={styles.empty}>
            {tasks.length === 0
              ? 'Belum ada tugas. Tambahkan tugas baru di atas.'
              : 'Tidak ada tugas yang sesuai dengan pencarian.'}
          </Text>
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingTop: StatusBar.currentHeight || 0,
  },
  listContent: { padding: 16, paddingBottom: 40 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },

  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  summaryBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderTopWidth: 4,
    paddingVertical: 12,
    alignItems: 'center',
  },
  summaryValue: { fontSize: 24, fontWeight: 'bold' },
  summaryLabel: { fontSize: 11, color: '#4b5563', textAlign: 'center' },

  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
    backgroundColor: '#fff',
  },
  inputMultiline: { minHeight: 60, textAlignVertical: 'top' },
  search: { marginTop: 0, marginBottom: 12 },

  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resetText: { color: '#d64545', fontWeight: '600' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: '#e08a1e',
  },
  cardSelesai: { borderLeftColor: '#2e9e5b', backgroundColor: '#f0fdf4' },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: '#111827' },
  textSelesai: { textDecorationLine: 'line-through', color: '#6b7280' },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  cardMatkul: { marginTop: 4, color: '#2563eb', fontWeight: '600' },
  cardDesc: { marginTop: 4, color: '#374151' },
  cardDeadline: { marginTop: 6, color: '#6b7280', fontSize: 12 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 10 },

  btn: {
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  btnFull: { marginTop: 10 },
  btnText: { color: '#fff', fontWeight: '600' },

  empty: { textAlign: 'center', color: '#6b7280', marginTop: 24 },
});
