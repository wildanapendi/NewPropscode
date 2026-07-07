import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './OrderFormPage.css';

// Konstanta di luar komponen agar tidak dibuat ulang setiap render
const WHATSAPP_NUMBER = '6285171663006';

const TIMELINE_OPTIONS = [
  { value: '1bulan', label: '1 Bulan' },
  { value: '2bulan', label: '2 Bulan' },
  { value: '3bulan', label: '3 Bulan' },
  { value: '6bulan', label: '6 Bulan' },
  { value: 'fleksibel', label: 'Fleksibel / Sesuai Diskusi' },
];

const STEPS = [
  { id: 1, label: 'Pilih Layanan' },
  { id: 2, label: 'Detail Proyek' },
  { id: 3, label: 'Konfirmasi' },
];

const INITIAL_FORM = {
  service_id: '',
  project_name: '',
  project_description: '',
  budget_range: '',
  timeline: '',
  reference_links: '',
  requirements: '',
};

const OrderFormPage = () => {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [servicesLoading, setServicesLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const { data } = await api.get('/services');
      setServices(data.data || []);
    } catch {
      setServices([
        { id: 1, name: 'Website Development', description: 'Website profesional & responsif.', base_price: 5000000 },
        { id: 2, name: 'Mobile App', description: 'Aplikasi mobile cross-platform.', base_price: 15000000 },
        { id: 3, name: 'UI/UX Design', description: 'Desain UI/UX yang intuitif.', base_price: 3000000 },
        { id: 4, name: 'Custom Software', description: 'Solusi perangkat lunak custom.', base_price: 20000000 },
      ]);
    } finally {
      setServicesLoading(false);
    }
  };

  /** Handler perubahan field form generik — menggunakan name attribute */
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceSelect = (serviceId) => {
    setFormData((prev) => ({ ...prev, service_id: serviceId }));
  };

  const handleNextStep = () => {
    if (step === 1 && !formData.service_id) {
      return toast.error('Pilih salah satu layanan terlebih dahulu');
    }
    if (step === 2) {
      if (!formData.project_name.trim()) return toast.error('Nama proyek wajib diisi');
      if (!formData.project_description.trim()) return toast.error('Deskripsi proyek wajib diisi');
    }
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/orders', {
        ...formData,
        service_id: parseInt(formData.service_id, 10),
      });

      const orderNumber = data.data?.order_number || '';

      // Buka WhatsApp dengan nomor & pesan yang sudah disiapkan
      const message = encodeURIComponent(
        `Halo Propscode! Saya baru saja membuat pesanan *${orderNumber}* untuk proyek *${formData.project_name}*. Mohon konfirmasinya. Terima kasih!`
      );
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');

      toast.success('Pesanan berhasil dibuat!');
      navigate('/dashboard');
    } catch {
      toast.error('Gagal membuat pesanan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const selectedService = services.find((s) => s.id === parseInt(formData.service_id, 10));

  return (
    <main className="order-form-page">
      <div className="container">
        <header>
          <h1>Buat Pesanan Baru</h1>
          <p className="subtitle">Ceritakan kebutuhan proyek Anda dan kami akan membantu mewujudkannya.</p>
        </header>

        {/* Stepper sebagai ol (ordered list) karena langkah bersifat berurutan */}
        <nav aria-label="Langkah pembuatan pesanan">
          <ol className="order-steps" role="list">
            {STEPS.map((s) => {
              const isCompleted = step > s.id;
              const isCurrent = step === s.id;
              return (
                <li
                  key={s.id}
                  className={`step ${isCurrent ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className="step-number" aria-hidden="true">
                    {isCompleted ? '✓' : s.id}
                  </span>
                  <span className="step-label">{s.label}</span>
                </li>
              );
            })}
          </ol>
        </nav>

        <div className="order-form-content glass-card">
          <AnimatePresence mode="wait">
            {/* ===== Step 1: Pilih Layanan ===== */}
            {step === 1 && (
              <motion.section
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                aria-labelledby="step1-heading"
              >
                <h2 id="step1-heading">Pilih Jenis Layanan</h2>

                {servicesLoading ? (
                  <div className="loading-spinner" aria-busy="true" aria-label="Memuat layanan...">
                    <div className="spinner" />
                  </div>
                ) : (
                  /* radiogroup semantik untuk pilihan layanan */
                  <div
                    className="services-grid-selector"
                    role="radiogroup"
                    aria-label="Pilih jenis layanan"
                    aria-required="true"
                  >
                    {services.map((service) => {
                      const isSelected = formData.service_id === service.id.toString() ||
                        formData.service_id === service.id;
                      return (
                        <motion.div
                          key={service.id}
                          className={`service-option glass-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleServiceSelect(service.id)}
                          role="radio"
                          aria-checked={isSelected}
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && handleServiceSelect(service.id)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <h3>{service.name}</h3>
                          <p>{service.description}</p>
                          <div className="service-price">
                            Mulai dari{' '}
                            <strong className="gradient-text">
                              Rp {Number(service.base_price).toLocaleString('id-ID')}
                            </strong>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </motion.section>
            )}

            {/* ===== Step 2: Detail Proyek ===== */}
            {step === 2 && (
              <motion.section
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                aria-labelledby="step2-heading"
              >
                <h2 id="step2-heading">Detail Proyek</h2>

                <div className="form-group">
                  <label htmlFor="project-name">Nama Proyek</label>
                  <input
                    id="project-name"
                    type="text"
                    name="project_name"
                    className="form-control"
                    placeholder="Contoh: Website Company Profile PT. Sejahtera"
                    value={formData.project_name}
                    onChange={handleFormChange}
                    required
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="project-description">Deskripsi Kebutuhan Proyek</label>
                  <textarea
                    id="project-description"
                    name="project_description"
                    className="form-control"
                    placeholder="Ceritakan kebutuhan Anda secara rinci, fitur apa saja yang diinginkan, target pengguna, dll."
                    value={formData.project_description}
                    onChange={handleFormChange}
                    required
                    style={{ minHeight: '120px' }}
                  />
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label htmlFor="budget-range">
                      Budget Range{' '}
                      <span className="label-optional">(Opsional)</span>
                    </label>
                    <input
                      id="budget-range"
                      type="text"
                      name="budget_range"
                      className="form-control"
                      placeholder="Contoh: Rp 5-10 Juta"
                      value={formData.budget_range}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="project-timeline">Estimasi Waktu Pengerjaan</label>
                    <select
                      id="project-timeline"
                      name="timeline"
                      className="form-control"
                      value={formData.timeline}
                      onChange={handleFormChange}
                    >
                      <option value="">Pilih estimasi waktu</option>
                      {TIMELINE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reference-links">
                    Link Referensi / Desain{' '}
                    <span className="label-optional">(Opsional)</span>
                  </label>
                  <input
                    id="reference-links"
                    type="text"
                    name="reference_links"
                    className="form-control"
                    placeholder="Contoh: https://dribbble.com/shots/xxx, https://figma.com/..."
                    value={formData.reference_links}
                    onChange={handleFormChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="requirements">
                    Persyaratan Khusus / Catatan Tambahan{' '}
                    <span className="label-optional">(Opsional)</span>
                  </label>
                  <textarea
                    id="requirements"
                    name="requirements"
                    className="form-control"
                    placeholder="Contoh: Harus terintegrasi dengan sistem yang ada, preferensi warna, dll."
                    value={formData.requirements}
                    onChange={handleFormChange}
                    style={{ minHeight: '80px' }}
                  />
                </div>
              </motion.section>
            )}

            {/* ===== Step 3: Konfirmasi ===== */}
            {step === 3 && (
              <motion.section
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                aria-labelledby="step3-heading"
              >
                <h2 id="step3-heading">Konfirmasi Pesanan</h2>
                <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                  Periksa kembali detail pesanan Anda sebelum mengirimkan.
                </p>

                <dl className="order-summary">
                  <div className="summary-row">
                    <dt>Nama Klien</dt>
                    <dd>{user?.name || '—'}</dd>
                  </div>
                  <div className="summary-row">
                    <dt>Layanan Dipilih</dt>
                    <dd>{selectedService?.name || '—'}</dd>
                  </div>
                  <div className="summary-row">
                    <dt>Nama Proyek</dt>
                    <dd>{formData.project_name}</dd>
                  </div>
                  <div className="summary-row">
                    <dt>Estimasi Waktu</dt>
                    <dd>
                      {TIMELINE_OPTIONS.find((t) => t.value === formData.timeline)?.label || '—'}
                    </dd>
                  </div>
                  {formData.budget_range && (
                    <div className="summary-row">
                      <dt>Budget Range</dt>
                      <dd>{formData.budget_range}</dd>
                    </div>
                  )}
                  <div className="summary-row">
                    <dt>Harga Estimasi</dt>
                    <dd className="gradient-text">
                      Mulai dari Rp {Number(selectedService?.base_price || 0).toLocaleString('id-ID')}
                    </dd>
                  </div>
                </dl>

                <p
                  className="whatsapp-notice"
                  style={{ marginTop: '1.5rem', background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.3)', borderRadius: 'var(--radius-md)', padding: '1rem', fontSize: '0.875rem' }}
                >
                  Setelah pesanan dikirimkan, Anda akan diarahkan ke <strong>WhatsApp</strong> untuk
                  konfirmasi awal dengan tim Propscode.
                </p>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Navigasi antar step */}
          <div className="form-navigation" style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
            {step > 1 ? (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setStep((prev) => prev - 1)}
              >
                Kembali
              </button>
            ) : (
              <div /> /* spacer */
            )}

            {step < STEPS.length ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNextStep}
                disabled={step === 1 && !formData.service_id}
              >
                Lanjut
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Mengirimkan...' : '🚀 Kirim Pesanan'}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default OrderFormPage;
