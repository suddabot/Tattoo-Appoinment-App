import React, { useEffect, useState } from "react";

// Tattoo Booking — Enhanced Single-file Prototype
// - Local demo that contains the real UX & integration points you asked for:
//   • Web booking page + Admin panel
//   • Two studio phone numbers shown
//   • Simulated payment flow (placeholders for PayHere / Flutterwave)
//   • Google Calendar connect (placeholder OAuth flow)
//   • English + Sinhala UI (toggle)
// - This file is a strongly-commented prototype. For production:
//   • Replace localStorage logic with Supabase / Firebase (backend + auth + webhooks)
//   • Wire payment functions to the real gateway (use webhook to confirm payments)
//   • Implement real Google Calendar OAuth flow on server side
//   • Add server-side slot locking / validation to avoid double-booking

const TRANSLATIONS = {
  en: {
    title: "Tattoo Studio — Book an Appointment",
    name: "Name",
    email: "Email",
    phone: "Phone",
    altPhone: "Alternate phone (optional)",
    artist: "Artist",
    date: "Date",
    time: "Time",
    notes: "Notes / reference",
    uploadRef: "Upload reference image",
    payNow: "Pay deposit / Pay now",
    paySimulate: "Simulate Payment (Demo)",
    submit: "Book appointment",
    owner: "Studio Owner",
    connectCalendar: "Connect Google Calendar",
    connected: "Connected",
    disconnect: "Disconnect",
    admin: "Admin Dashboard",
    confirm: "Confirm",
    cancel: "Cancel",
    delete: "Delete",
    exportCSV: "Export CSV",
    search: "Search by name / artist / phone",
    noAppointments: "No appointments found.",
    language: "Language",
    studioPhones: "Studio contact numbers",
    paid: "Paid",
    unpaid: "Unpaid",
    status: "Status",
    paidOn: "Paid on",
  },
  si: {
    title: "ටැටූ ස්ටුඩියෝ — වෙන්කිරීම",
    name: "නම",
    email: "ඊමේල්",
    phone: "දුරකථන",
    altPhone: "විකල්ප දුරකථන (ඇරයි)",
    artist: "කලාකරු",
    date: "දිනය",
    time: "වේලාව",
    notes: "සටහන් / රෙෆරන්ස්",
    uploadRef: "රෙෆරන්ස් රූපය උඩුගත කරන්න",
    payNow: "ඩෙපොසට් ගෙවන්න / දැන් ගෙවන්න",
    paySimulate: "ගෙවීම අනුකරණය කරන්න (ඩෙමෝ)",
    submit: "බුක් කරන්න",
    owner: "ස්ටුඩියෝ හිමියා",
    connectCalendar: "Google කැලෙන්ඩරය සම්බන්ධ කරන්න",
    connected: "සම්බන්ධයි",
    disconnect: "වෙන් කරන්න",
    admin: "පරිපාලක පුවරුව",
    confirm: "තහවුරු කරන්න",
    cancel: "අවලංගු කරන්න",
    delete: "මකන්න",
    exportCSV: "CSV ලෙස අපනයනය කරන්න",
    search: "නම/කලාකරුව/දුරකථන අනුව සෙවීම",
    noAppointments: "කිසිදු වෙන්කිරීමක් නැත.",
    language: "භාෂාව",
    studioPhones: "ස්ටුඩියෝ විමසීම් දුරකථන",
    paid: "ගෙවා ඇත",
    unpaid: "ගෙවී නැත",
    status: "ස්ථಿತಿ",
    paidOn: "ගෙවූ දිනය",
  },
};

function t(lang, key) {
  return TRANSLATIONS[lang][key] || TRANSLATIONS.en[key] || key;
}

export default function TattooAppDemo() {
  const [lang, setLang] = useState("en");
  const [studioPhones] = useState(["+94 11 123 4567", "+94 77 987 6543"]); // two studio numbers

  // appointments stored locally for demo; replace with Supabase/Firebase in prod
  const [appointments, setAppointments] = useState(() => {
    try {
      const raw = localStorage.getItem("tattoo_app_v2_appointments");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const [form, setForm] = useState({ name: "", email: "", phone: "", altPhone: "", artist: "", date: "", time: "", notes: "", image: null, depositPaid: false, paidAt: null });
  const [query, setQuery] = useState("");
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    localStorage.setItem("tattoo_app_v2_appointments", JSON.stringify(appointments));
  }, [appointments]);

  function resetForm() {
    setForm({ name: "", email: "", phone: "", altPhone: "", artist: "", date: "", time: "", notes: "", image: null, depositPaid: false, paidAt: null });
  }

  function handleChange(e) {
    const { name, value, files } = e.target;
    if (files) {
      setForm((f) => ({ ...f, [name]: files[0] }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  function simulatePayment(apptId) {
    // In production: redirect to PayHere/Flutterwave checkout, then handle webhook to verify payment
    // Here we simulate success immediately and mark appointment as paid.
    setAppointments((prev) => prev.map((a) => (a.id === apptId ? { ...a, depositPaid: true, paidAt: new Date().toISOString() } : a)));
    alert("Payment simulated: marked as paid.");
  }

  function book(e) {
    e.preventDefault();
    // basic validation
    if (!form.name.trim() || !form.phone.trim() || !form.date || !form.time) {
      alert("Please fill name, phone, date and time.");
      return;
    }

    // NOTE: in prod, call backend to atomically reserve slot (avoid double-booking)
    const newAppt = { ...form, id: Date.now(), createdAt: new Date().toISOString(), depositPaid: false };
    setAppointments((prev) => [newAppt, ...prev]);

    // Optionally: open payment flow
    resetForm();
    alert("Booked locally (demo). In production this would trigger payment + calendar event creation.");
  }

  function confirmAppointment(id) {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, confirmed: true } : a)));
  }

  function cancelAppointment(id) {
    if (!confirm("Are you sure you want to cancel this appointment?")) return;
    setAppointments((prev) => prev.filter((a) => a.id !== id));
  }

  function exportCSV() {
    const header = ["Name", "Email", "Phone", "AltPhone", "Artist", "Date", "Time", "Notes", "Paid", "PaidAt"];
    const rows = appointments.map((a) => [a.name, a.email, a.phone, a.altPhone, a.artist, a.date, a.time, (a.notes || ""), a.depositPaid ? "Yes" : "No", a.paidAt || ""]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("
");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tattoo_appointments.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = appointments.filter((a) => {
    const q = query.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      (a.artist || "").toLowerCase().includes(q) ||
      (a.phone || "").toLowerCase().includes(q)
    );
  });

  // Calendar connect placeholders
  const [calendarConnected, setCalendarConnected] = useState(false);
  function connectCalendar() {
    // In production: redirect to server endpoint that starts Google OAuth (server must handle client_secret securely)
    // For demo we just toggle state.
    setCalendarConnected(true);
    alert("Demo: Google Calendar connected (simulated). In production this requires OAuth flow and server-side tokens.");
  }
  function disconnectCalendar() {
    setCalendarConnected(false);
  }

  return (
    <div style={{ fontFamily: 'Arial, Helvetica, sans-serif', padding: 20, maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1>{t(lang, 'title')}</h1>
        <div>
          <label style={{ marginRight: 8 }}>{t(lang, 'language')}:</label>
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="en">English</option>
            <option value="si">සිංහල</option>
          </select>
          <button style={{ marginLeft: 12 }} onClick={() => setShowAdmin((s) => !s)}>{t(lang, 'admin')}</button>
        </div>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 20 }}>
        <main style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          {/* Booking form */}
          <form onSubmit={book}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label>{t(lang, 'name')}</label>
                <input name="name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: 8 }} />
              </div>
              <div>
                <label>{t(lang, 'email')}</label>
                <input name="email" value={form.email} onChange={handleChange} style={{ width: '100%', padding: 8 }} />
              </div>
              <div>
                <label>{t(lang, 'phone')}</label>
                <input name="phone" value={form.phone} onChange={handleChange} style={{ width: '100%', padding: 8 }} />
              </div>
              <div>
                <label>{t(lang, 'altPhone')}</label>
                <input name="altPhone" value={form.altPhone} onChange={handleChange} style={{ width: '100%', padding: 8 }} />
              </div>
              <div>
                <label>{t(lang, 'artist')}</label>
                <input name="artist" value={form.artist} onChange={handleChange} style={{ width: '100%', padding: 8 }} placeholder="Artist name or 'Any'" />
              </div>
              <div>
                <label>{t(lang, 'date')}</label>
                <input name="date" value={form.date} onChange={handleChange} type="date" style={{ width: '100%', padding: 8 }} />
              </div>
              <div>
                <label>{t(lang, 'time')}</label>
                <input name="time" value={form.time} onChange={handleChange} type="time" style={{ width: '100%', padding: 8 }} />
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label>{t(lang, 'notes')}</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} style={{ width: '100%', padding: 8 }} />
              </div>
              <div>
                <label>{t(lang, 'uploadRef')}</label>
                <input name="image" onChange={handleChange} type="file" accept="image/*" />
              </div>
            </div>

            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button type="submit">{t(lang, 'submit')}</button>
              <button type="button" onClick={() => alert('In production this would open PayHere/Flutterwave checkout.')}>{t(lang, 'paySimulate')}</button>
            </div>
          </form>

          <section style={{ marginTop: 20 }}>
            <h3>Studio</h3>
            <div>{t(lang, 'studioPhones')}: {studioPhones.join(' • ')}</div>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => { navigator.clipboard?.writeText(studioPhones[0]); alert('Copied primary phone'); }}>{studioPhones[0]}</button>
              <button style={{ marginLeft: 8 }} onClick={() => { navigator.clipboard?.writeText(studioPhones[1]); alert('Copied secondary phone'); }}>{studioPhones[1]}</button>
            </div>
          </section>

        </main>

        <aside style={{ background: '#fff', padding: 16, borderRadius: 8 }}>
          <div style={{ marginBottom: 12 }}>
            <h4>{t(lang, 'owner')}</h4>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button onClick={() => calendarConnected ? disconnectCalendar() : connectCalendar()}>{calendarConnected ? t(lang, 'disconnect') : t(lang, 'connectCalendar')}</button>
              <div>{calendarConnected ? <strong>{t(lang, 'connected')}</strong> : <em>—</em>}</div>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <h4>{t(lang, 'admin')}</h4>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setShowAdmin(true); }}>{t(lang, 'admin')}</button>
              <button onClick={exportCSV}>{t(lang, 'exportCSV')}</button>
            </div>
          </div>
        </aside>
      </section>

      {/* Admin panel */}
      {showAdmin && (
        <section style={{ marginTop: 20, background: '#fff', padding: 16, borderRadius: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{t(lang, 'admin')}</h2>
            <div>
              <input placeholder={t(lang, 'search')} value={query} onChange={(e) => setQuery(e.target.value)} style={{ padding: 8 }} />
              <button style={{ marginLeft: 8 }} onClick={() => { setAppointments([]); localStorage.removeItem('tattoo_app_v2_appointments'); }}>{t(lang, 'delete')} ALL (demo)</button>
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            {filtered.length === 0 ? (
              <div style={{ padding: 12 }}>{t(lang, 'noAppointments')}</div>
            ) : (
              filtered.map((a) => (
                <div key={a.id} style={{ padding: 12, borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{a.name} <small style={{ color: '#666' }}>{a.phone}</small></div>
                    <div style={{ color: '#666' }}>{a.date} {a.time} — {a.artist || '(any)'}</div>
                    {a.notes ? <div style={{ marginTop: 6 }}>{a.notes}</div> : null}
                    <div style={{ marginTop: 6 }}><strong>{t(lang, 'status')}:</strong> {a.depositPaid ? t(lang, 'paid') : t(lang, 'unpaid')} {a.paidAt ? `(${t(lang,'paidOn')}: ${new Date(a.paidAt).toLocaleString()})` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {!a.depositPaid && <button onClick={() => simulatePayment(a.id)}>{t(lang, 'payNow')}</button>}
                    <button onClick={() => confirmAppointment(a.id)}>{t(lang, 'confirm')}</button>
                    <button onClick={() => cancelAppointment(a.id)}>{t(lang, 'cancel')}</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      <footer style={{ marginTop: 20, color: '#666' }}>Demo app — data stored locally. To make production-ready I will replace localStorage with Supabase, wire PayHere/Flutterwave, and add Google Calendar OAuth + background workers for reminders.</footer>
    </div>
  );
}
