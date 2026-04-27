import React, { useState, useMemo, useEffect } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, Settings, Plus, Search, 
  Edit2, Trash2, User, ChevronDown, GraduationCap, 
  CheckCircle, LogOut, X, Save, Bookmark, BarChart3
} from 'lucide-react';

const API_BASE_URL = "/api/students";

// --- MOCK COURSE DATA ---
const ALL_COURSES = [
  { id: 1, title: 'Computer Science', code: 'CS101', instructor: 'Dr. Aris', duration: '4 Years' },
  { id: 2, title: 'Information Technology', code: 'IT202', instructor: 'Dr. Sarah', duration: '4 Years' },
  { id: 3, title: 'Data Science', code: 'DS303', instructor: 'Prof. Miller', duration: '2 Years' },
  { id: 4, title: 'Artificial Intelligence', code: 'AI404', instructor: 'Dr. Watson', duration: '3 Years' },
];

export default function UnifiedEduFlow() {
  // 1. GLOBAL STATES
  const [user, setUser] = useState(null); 
  const [view, setView] = useState('dashboard'); 
  const [students, setStudents] = useState([]); // Fetched from Django
  const [enrolledIds, setEnrolledIds] = useState([1]); // User's local enrollment state
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  
  // 2. MODAL STATES (Admin only)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // 3. API SYNC (POSTGRESQL VIA DJANGO)
  useEffect(() => { if (user) fetchStudents(); }, [user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL);
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      console.error("API error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveStudent = async (formData) => {
    const isEdit = !!editingItem;

    const url = isEdit
      ? `${API_BASE_URL}/${editingItem.id}`
      : API_BASE_URL;

    try {
      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",   // ✅ FIXED
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchStudents();
        setIsModalOpen(false);
        setEditingItem(null);
      }
    } catch (e) {
      alert("Save Failed");
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Delete permanently from database?")) {
      const res = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchStudents();
      } else {
        alert("Delete failed");
      }
    }
  };

  // 4. USER SPECIFIC LOGIC
  const handleEnroll = (id) => {
    if (!enrolledIds.includes(id)) setEnrolledIds([...enrolledIds, id]);
  };

  // 5. SEARCH LOGIC (ADMIN VIEW)
  const filteredStudents = useMemo(() => {
    if (!search) return students;

    const value = search.toLowerCase();

    return students.filter((s) => {
      return (
        (s.name && s.name.toLowerCase().includes(value)) ||
        (s.email && s.email.toLowerCase().includes(value)) ||
        (s.course && s.course.toLowerCase().includes(value)) ||
        (s.age && s.age.toString().includes(value))
      );
    });
  }, [students, search]); 

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="fixed inset-0 flex bg-[#0a0a0a] text-neutral-200 font-sans overflow-hidden">
      
      {/* SIDEBAR: DYNAMICALLY FILTERS LINKS BY ROLE */}
      <aside className="w-64 flex-shrink-0 bg-[#111111] border-r border-neutral-800/50 flex flex-col h-full">
        <div className="p-8 flex items-center gap-3">
          <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20"><GraduationCap className="text-emerald-500" size={24} /></div>
          <h1 className="text-xl font-bold text-white uppercase italic">EduFlow</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <SidebarBtn icon={<LayoutDashboard size={18}/>} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          
          {user.role === 'admin' ? (
            <SidebarBtn icon={<Users size={18}/>} label="Student Registry" active={view === 'students'} onClick={() => setView('students')} />
          ) : (
            <SidebarBtn icon={<Bookmark size={18}/>} label="My Enrollments" active={view === 'my-courses'} onClick={() => setView('my-courses')} />
          )}

          <SidebarBtn icon={<BookOpen size={18}/>} label="Available Courses" active={view === 'all-courses'} onClick={() => setView('all-courses')} />
          <SidebarBtn icon={<Settings size={18}/>} label="Settings" active={view === 'settings'} onClick={() => setView('settings')} />
        </nav>

        <div className="p-4 border-t border-neutral-800/50"><LogoutBtn onLogout={() => setUser(null)} user={user} /></div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 h-full overflow-y-auto p-10 bg-[#0a0a0a]">
        <div className="max-w-6xl mx-auto">
          
          {/* VIEW: DASHBOARD (Dynamic based on Role) */}
          {view === 'dashboard' && (
            <div className="animate-in fade-in duration-500">
              <Header title="Analytics Center" subtitle={`Welcome, ${user.role}`} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <StatCard label={user.role === 'admin' ? "Total Users" : "Enrolled Courses"} value={user.role === 'admin' ? students.length : enrolledIds.length} icon={<Users className="text-emerald-500"/>} />
                <StatCard label="System Sync" value="Live" icon={<CheckCircle className="text-sky-500"/>} />
                <StatCard label="Avg Performance" value="92%" icon={<BarChart3 className="text-violet-500"/>} />
              </div>
              <div className="bg-neutral-900/20 border border-dashed border-neutral-800 rounded-3xl p-20 text-center text-neutral-800 font-black uppercase text-sm italic">Analytics Visual Placeholder</div>
            </div>
          )}

          {/* VIEW: ADMIN STUDENT REGISTRY (CRUD) */}
          {view === 'students' && user.role === 'admin' && (
            <div className="animate-in fade-in duration-500">
              <div className="flex justify-between items-end mb-10">
                <Header title="Student Registry" subtitle={`PostgreSQL matches: ${filteredStudents.length}`} />
                <button onClick={() => {setEditingItem(null); setIsModalOpen(true)}} className="bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-3 rounded-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20">
                  <Plus size={18} strokeWidth={3} /> New Entry
                </button>
              </div>
              <div className="bg-[#141414] border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-6 bg-[#171717] border-b border-neutral-800"><div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600" size={16} />
                  <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Filter records..." className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl py-3 pl-10 pr-4 text-sm text-neutral-300 outline-none focus:border-emerald-500/50" /></div></div>
                {/* ✅ ADD THIS HERE */}
                {loading && (
                  <div className="p-6 text-neutral-500 font-bold">
                    Loading students...
                  </div>
                )}
                <table className="w-full text-left">
                  <thead className="bg-[#111111] text-neutral-600 text-[10px] font-black uppercase tracking-widest border-b border-neutral-800"><tr><th className="px-8 py-4">Identity</th><th className="px-8 py-4">Curriculum</th><th className="px-8 py-4 text-right">Actions</th></tr></thead>
                  <tbody className="divide-y divide-neutral-800/50">
                    {filteredStudents.map(student => (
                      <tr key={student.id} className="hover:bg-emerald-500/[0.01] transition-colors group">
                        <td className="px-8 py-6"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-black text-xs">{student.name?.charAt(0)}</div><div><p className="font-bold text-neutral-200">{student.name}</p><p className="text-[10px] text-neutral-600 font-bold uppercase tracking-tight">{student.email}</p></div></div></td>
                        <td className="px-8 py-6 text-sm text-neutral-400 italic">{student.course}</td>
                        <td className="px-8 py-6 text-right flex gap-2 justify-end opacity-40 group-hover:opacity-100 transition-opacity"><button onClick={()=> {setEditingItem(student); setIsModalOpen(true)}} className="p-2 text-neutral-500 hover:text-emerald-500"><Edit2 size={16}/></button><button onClick={()=>handleDelete(student.id)} className="p-2 text-neutral-500 hover:text-rose-500"><Trash2 size={16}/></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW: ALL COURSES (Catalog) */}
          {view === 'all-courses' && (
            <div className="animate-in fade-in duration-500">
              <Header title="Course Catalog" subtitle="Available programs for enrollment" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ALL_COURSES.map(course => (
                  <div key={course.id} className="bg-[#141414] border border-neutral-800 p-8 rounded-3xl hover:border-emerald-500/30 transition-all flex justify-between items-center">
                    <div>
                        <h4 className="text-xl font-black text-white italic">{course.title}</h4>
                        <p className="text-[10px] text-neutral-600 uppercase font-black tracking-widest mt-1">{course.code} • {course.instructor}</p>
                    </div>
                    {user.role === 'user' && (
                        <button onClick={()=>handleEnroll(course.id)} disabled={enrolledIds.includes(course.id)} className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${enrolledIds.includes(course.id) ? 'bg-neutral-800 text-neutral-600' : 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/10'}`}>
                            {enrolledIds.includes(course.id) ? 'Enrolled' : 'Enroll Now'}
                        </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: USER'S MY ENROLLMENTS */}
          {view === 'my-courses' && user.role === 'user' && (
            <div className="animate-in fade-in duration-500">
                <Header title="My Active Track" subtitle="Currently study programs" />
                <div className="space-y-4">
                    {ALL_COURSES.filter(c => enrolledIds.includes(c.id)).map(course => (
                        <div key={course.id} className="bg-[#141414] border border-neutral-800 p-6 rounded-3xl flex items-center gap-6">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500"><BookOpen size={24}/></div>
                            <div className="flex-1"><h4 className="font-black text-white">{course.title}</h4><p className="text-xs text-neutral-600 uppercase font-bold tracking-widest">{course.instructor} • {course.duration}</p></div>
                            <button className="text-[10px] font-black text-emerald-500 border border-emerald-500/20 px-4 py-2 rounded-lg hover:bg-emerald-500/5">Open Modules</button>
                        </div>
                    ))}
                </div>
            </div>
          )}

        </div>
      </main>

      {/* ADMIN MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-6 z-50">
          <div className="bg-[#111111] border border-neutral-800 w-full max-w-md rounded-3xl p-8 shadow-2xl relative">
            <button onClick={()=>setIsModalOpen(false)} className="absolute top-6 right-6 text-neutral-600 hover:text-white"><X size={20}/></button>
            <h3 className="text-xl font-black text-white italic mb-8 uppercase tracking-tight">{editingItem ? 'Edit DB Record' : 'Create DB Entry'}</h3>
            <StudentForm initialData={editingItem} onSave={handleSaveStudent} />
          </div>
        </div>
      )}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function StudentForm({ initialData, onSave }) {
    const [form, setForm] = useState(initialData || { name: '', email: '', age: 20, course: '' });
    return (
      <form onSubmit={e => {e.preventDefault(); onSave(form)}} className="space-y-4">
        <div><label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Student Name</label><input required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl py-3 px-4 text-neutral-200 outline-none focus:border-emerald-500/40 text-sm" placeholder="John Doe"/></div>
        <div><label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Email</label><input required value={form.email} onChange={e=>setForm({...form, email:e.target.value})} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl py-3 px-4 text-neutral-200 outline-none focus:border-emerald-500/40 text-sm" placeholder="john@example.com"/></div>
        <div><label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Age</label><input
            type="number"
            value={form.age}
            onChange={e => setForm({...form, age: e.target.value})}
            placeholder="Age"
            className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl py-3 px-4 text-neutral-200"
          /></div>
        <div><label className="text-[10px] font-black text-neutral-600 uppercase tracking-widest px-1">Course Assignment</label><input required value={form.course} onChange={e=>setForm({...form, course:e.target.value})} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl py-3 px-4 text-neutral-200 outline-none focus:border-emerald-500/40 text-sm" placeholder="Computer Science"/></div>
        <button type="submit" className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-emerald-500/20"><Save size={16}/> Save to PostgreSQL</button>
      </form>
    );
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  return (
    <div className="fixed inset-0 bg-[#0a0a0a] flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-[#111111] border border-neutral-800 rounded-3xl p-10 text-center shadow-2xl">
        <div className="bg-emerald-500/10 p-5 rounded-2xl text-emerald-500 mb-6 inline-block border border-emerald-500/20"><GraduationCap size={40}/></div>
        <h2 className="text-2xl font-black text-white italic tracking-tight mb-8 uppercase">EDUFLOW ACCESS</h2>
        <input type="email" placeholder="Identifier (e.g. admin@flow.com)" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-[#0a0a0a] border border-neutral-800 rounded-xl py-4 px-5 text-neutral-200 outline-none focus:border-emerald-500/40 mb-4 font-bold" />
        <button onClick={() => onLogin({ email, role: email.includes('admin') ? 'admin' : 'user' })} className="w-full bg-emerald-500 text-black py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Establish Session</button>
        <p className="text-[10px] text-neutral-700 mt-6 font-black tracking-widest uppercase">Type 'admin' for management view</p>
      </div>
    </div>
  );
}

// Helpers
const SidebarBtn = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all group ${active ? 'bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/20' : 'text-neutral-500 hover:text-white hover:bg-neutral-900'}`}>
    <span className={active ? '' : 'text-emerald-500/60 group-hover:text-emerald-500'}>{icon}</span>
    <span className="text-sm tracking-wide">{label}</span>
  </button>
);

const Header = ({ title, subtitle }) => (
    <div className="mb-10">
        <h2 className="text-4xl font-black text-white tracking-tight italic">{title}</h2>
        <p className="text-emerald-500/60 uppercase text-[10px] font-black tracking-[0.4em] mt-2 italic">{subtitle}</p>
    </div>
);

const StatCard = ({ label, value, icon }) => (
  <div className="bg-[#141414] p-8 rounded-3xl border border-neutral-800 group relative overflow-hidden">
    <div className="relative z-10"><p className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">{label}</p><h4 className="text-3xl font-black text-white mt-1">{value}</h4></div>
    <div className="absolute -right-4 -bottom-4 text-neutral-800 opacity-20 group-hover:text-emerald-500 transition-all">{React.cloneElement(icon, { size: 100 })}</div>
  </div>
);

const LogoutBtn = ({ onLogout, user }) => (
    <div className="space-y-4">
        <button onClick={onLogout} className="w-full flex items-center gap-3 px-3 py-2 text-neutral-600 hover:text-rose-500 transition-all font-black text-[10px] uppercase tracking-widest"><LogOut size={14}/> Close session</button>
        <div className="flex items-center gap-3 p-3 bg-neutral-900 rounded-2xl border border-neutral-800">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-[10px] text-black ${user.role === 'admin' ? 'bg-emerald-500' : 'bg-sky-500'}`}>{user.role[0].toUpperCase()}</div>
            <div className="flex-1 min-w-0"><p className="text-[10px] font-black text-white uppercase truncate">{user.role}</p><p className="text-[9px] text-neutral-600 truncate">{user.email}</p></div>
        </div>
    </div>
);