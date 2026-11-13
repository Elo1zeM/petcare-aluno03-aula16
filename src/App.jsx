import { useEffect, useMemo, useState } from 'react'
import {
  PawPrint, LayoutDashboard, Syringe, CalendarDays, Dog, Plus, Search,
  Bell, ChevronRight, ChevronLeft, Menu, X, Heart, Clock, MapPin,
  Phone, Mail, CheckCircle2, AlertCircle, CalendarCheck, Trash2,
  Edit3, Stethoscope, ShieldCheck, Sparkles, Cat, MoreHorizontal
} from 'lucide-react'

const seedPets = [
  { id: 1, name: 'Luna', species: 'Cachorro', breed: 'Golden Retriever', age: '3 anos', sex: 'Fêmea', weight: '24 kg', color: 'gold', initials: 'LU', notes: 'Muito brincalhona e carinhosa.' },
  { id: 2, name: 'Max', species: 'Cachorro', breed: 'Labrador', age: '5 anos', sex: 'Macho', weight: '29 kg', color: 'blue', initials: 'MA', notes: 'Alergia alimentar em acompanhamento.' },
]
const seedVaccines = [
  { id: 1, petId: 1, name: 'Antirrábica', date: '2026-05-12', next: '2027-05-12', vet: 'Dra. Camila Souza', status: 'Em dia' },
  { id: 2, petId: 1, name: 'V8 / Polivalente', date: '2026-02-10', next: '2027-02-10', vet: 'Dra. Camila Souza', status: 'Em dia' },
  { id: 3, petId: 2, name: 'Antirrábica', date: '2025-12-02', next: '2026-12-02', vet: 'Dr. Rafael Lima', status: 'Próxima dose' },
]
const seedAppointments = [
  { id: 1, petId: 1, date: '2026-11-18', time: '14:30', type: 'Consulta de rotina', vet: 'Dra. Camila Souza', clinic: 'Clínica VetVida', status: 'Confirmado' },
  { id: 2, petId: 2, date: '2026-11-24', time: '09:00', type: 'Retorno', vet: 'Dr. Rafael Lima', clinic: 'Clínica VetVida', status: 'Pendente' },
]
const readStore = (key, fallback) => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback } catch { return fallback }
}
const saveStore = (key, value) => localStorage.setItem(key, JSON.stringify(value))
const formatDate = (value) => value ? new Date(`${value}T12:00:00`).toLocaleDateString('pt-BR') : '—'
const today = new Date().toISOString().slice(0, 10)

function App() {
  const [pets, setPets] = useState(() => readStore('petcare-pets', seedPets))
  const [vaccines, setVaccines] = useState(() => readStore('petcare-vaccines', seedVaccines))
  const [appointments, setAppointments] = useState(() => readStore('petcare-appointments', seedAppointments))
  const [page, setPage] = useState('dashboard')
  const [modal, setModal] = useState(null)
  const [editing, setEditing] = useState(null)
  const [search, setSearch] = useState('')
  const [mobileMenu, setMobileMenu] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => saveStore('petcare-pets', pets), [pets])
  useEffect(() => saveStore('petcare-vaccines', vaccines), [vaccines])
  useEffect(() => saveStore('petcare-appointments', appointments), [appointments])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const upcoming = useMemo(() => [...appointments].filter(a => a.date >= today).sort((a,b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`)), [appointments])
  const dueVaccines = vaccines.filter(v => v.next && v.next <= new Date(Date.now() + 45*86400000).toISOString().slice(0,10))
  const filteredPets = pets.filter(p => `${p.name} ${p.breed} ${p.species}`.toLowerCase().includes(search.toLowerCase()))
  const petName = id => pets.find(p => p.id === Number(id))?.name || 'Pet não encontrado'

  function notify(message) { setToast(message) }
  function openModal(type, item = null) { setEditing(item); setModal(type) }
  function closeModal() { setModal(null); setEditing(null) }
  function savePet(data) {
    if (editing) setPets(old => old.map(p => p.id === editing.id ? { ...p, ...data } : p))
    else setPets(old => [...old, { ...data, id: Date.now(), initials: data.name.slice(0,2).toUpperCase() }])
    closeModal(); notify(editing ? 'Cadastro atualizado!' : 'Pet cadastrado com sucesso!')
  }
  function saveVaccine(data) {
    if (editing) setVaccines(old => old.map(v => v.id === editing.id ? { ...v, ...data } : v))
    else setVaccines(old => [...old, { ...data, id: Date.now() }])
    closeModal(); notify('Vacina salva na carteira!')
  }
  function saveAppointment(data) {
    if (editing) setAppointments(old => old.map(a => a.id === editing.id ? { ...a, ...data } : a))
    else setAppointments(old => [...old, { ...data, id: Date.now(), status: 'Pendente' }])
    closeModal(); notify('Agendamento salvo!')
  }
  function removeItem(type, id) {
    if (!window.confirm('Tem certeza que deseja excluir este registro?')) return
    if (type === 'pet') {
      setPets(old => old.filter(p => p.id !== id))
      setVaccines(old => old.filter(v => v.petId !== id))
      setAppointments(old => old.filter(a => a.petId !== id))
    }
    if (type === 'vaccine') setVaccines(old => old.filter(v => v.id !== id))
    if (type === 'appointment') setAppointments(old => old.filter(a => a.id !== id))
    notify('Registro excluído.')
  }

  const nav = [
    { id: 'dashboard', label: 'Visão geral', icon: LayoutDashboard },
    { id: 'pets', label: 'Meus pets', icon: PawPrint },
    { id: 'vaccines', label: 'Vacinação', icon: Syringe },
    { id: 'appointments', label: 'Agendamentos', icon: CalendarDays },
  ]
  const pageTitle = nav.find(n => n.id === page)?.label || 'Visão geral'

  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><PawPrint size={22} strokeWidth={2.5}/></div>
        <div><strong>PetCare</strong><span>CUIDADO EM CADA DETALHE</span></div>
        <button className="mobile-close icon-button" onClick={() => setMobileMenu(false)}><X size={19}/></button>
      </div>
      <div className="workspace-label">MENU PRINCIPAL</div>
      <nav className="side-nav">
        {nav.map(item => <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => {setPage(item.id);setMobileMenu(false)}}>
          <item.icon size={18}/><span>{item.label}</span>{item.id === 'vaccines' && dueVaccines.length > 0 && <i>{dueVaccines.length}</i>}
        </button>)}
      </nav>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><Heart size={17}/></div><b>Amor também é cuidado.</b><p>Mantenha a saúde do seu melhor amigo sempre em dia.</p></div>
        <div className="profile"><div className="avatar-user">EM</div><div><b>Meu espaço</b><span>Responsável pelos pets</span></div><MoreHorizontal size={18}/></div>
      </div>
    </aside>
    {mobileMenu && <div className="scrim" onClick={() => setMobileMenu(false)} />}
    <main className="main-area">
      <header className="topbar">
        <button className="icon-button menu-toggle" onClick={() => setMobileMenu(true)}><Menu size={21}/></button>
        <div className="breadcrumb">PetCare <ChevronRight size={14}/> <b>{pageTitle}</b></div>
        <div className="top-actions">
          <div className="today-label"><CalendarDays size={15}/>{new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'})}</div>
          <button className="notification-button" onClick={() => {setPage('vaccines');notify(`${dueVaccines.length} vacina(s) precisam de atenção.`)}} aria-label="Notificações"><Bell size={18}/>{dueVaccines.length > 0 && <i/>}</button>
          <div className="avatar-user top-avatar">EM</div>
        </div>
      </header>
      <div className="content">
        {page === 'dashboard' && <Dashboard pets={pets} vaccines={vaccines} dueVaccines={dueVaccines} upcoming={upcoming} petName={petName} setPage={setPage} openModal={openModal}/>}
        {page === 'pets' && <PetsPage pets={filteredPets} search={search} setSearch={setSearch} openModal={openModal} removeItem={removeItem}/>}
        {page === 'vaccines' && <VaccinesPage vaccines={vaccines} pets={pets} petName={petName} openModal={openModal} removeItem={removeItem}/>}
        {page === 'appointments' && <AppointmentsPage appointments={appointments} pets={pets} petName={petName} openModal={openModal} removeItem={removeItem}/>}
      </div>
      <footer className="footer"><span>© 2026 PetCare</span><span>Feito com cuidado <Heart size={12} fill="currentColor"/></span></footer>
    </main>
    {modal && <Modal type={modal} editing={editing} pets={pets} onClose={closeModal} onSavePet={savePet} onSaveVaccine={saveVaccine} onSaveAppointment={saveAppointment}/>}
    {toast && <div className="toast"><CheckCircle2 size={17}/>{toast}</div>}
  </div>
}

function PageHeading({eyebrow, title, description, action, onAction}) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <button className="primary-button" onClick={onAction}><Plus size={17}/>{action}</button>}</div>
}
function Dashboard({pets,vaccines,dueVaccines,upcoming,petName,setPage,openModal}) {
  return <>
    <div className="welcome-banner">
      <div><span className="welcome-kicker">BEM-VINDO AO PETCARE</span><h1>O cuidado que seu pet merece. <span>♡</span></h1><p>Organize a saúde, as vacinas e as consultas dos seus companheiros em um só lugar.</p>
      <button className="light-button" onClick={() => setPage('pets')}>Ver meus pets <ChevronRight size={16}/></button></div>
      <div className="banner-art"><div className="art-circle"><PawPrint size={92}/></div><span className="sparkle s1">✦</span><span className="sparkle s2">✧</span></div>
    </div>
    <div className="stats-grid">
      <Stat icon={PawPrint} label="Pets cadastrados" value={pets.length} detail="companheiros no PetCare" tone="navy"/>
      <Stat icon={Syringe} label="Vacinas registradas" value={vaccines.length} detail="doses na carteira" tone="silver"/>
      <Stat icon={CalendarCheck} label="Próximas consultas" value={upcoming.length} detail="agendamentos futuros" tone="blue"/>
      <Stat icon={AlertCircle} label="Vacinas para atenção" value={dueVaccines.length} detail="próximas ou vencendo" tone="amber"/>
    </div>
    <div className="dashboard-grid">
      <section className="panel pets-panel">
        <div className="panel-heading"><div><h2>Meus companheiros</h2><p>Quem faz parte da família</p></div><button className="text-button" onClick={() => setPage('pets')}>Ver todos <ChevronRight size={15}/></button></div>
        {pets.length === 0 ? <Empty text="Você ainda não cadastrou nenhum pet." action="Cadastrar primeiro pet" onClick={() => openModal('pet')}/> : <div className="pet-mini-list">{pets.slice(0,3).map(p => <div className="pet-mini" key={p.id}><PetAvatar pet={p}/><div className="pet-mini-info"><b>{p.name}</b><span>{p.breed || p.species} · {p.age || 'Idade não informada'}</span></div><span className="pet-health"><i/> Ativo</span><button className="round-arrow" onClick={() => setPage('pets')}><ChevronRight size={17}/></button></div>)}</div>}
        <button className="add-dashed" onClick={() => openModal('pet')}><Plus size={16}/> Adicionar novo pet</button>
      </section>
      <section className="panel next-panel">
        <div className="panel-heading"><div><h2>Próximo compromisso</h2><p>Não perca nenhum cuidado</p></div><CalendarDays size={19} className="muted-icon"/></div>
        {upcoming.length ? <div className="next-appointment"><div className="date-tile"><b>{new Date(`${upcoming[0].date}T12:00:00`).getDate()}</b><span>{new Date(`${upcoming[0].date}T12:00:00`).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</span></div><div><b>{upcoming[0].type}</b><span>{petName(upcoming[0].petId)} · {upcoming[0].vet}</span><small><Clock size={13}/>{upcoming[0].time} · {upcoming[0].clinic}</small></div></div> : <Empty text="Nenhuma consulta agendada." action="Agendar consulta" onClick={() => openModal('appointment')}/>}
        <button className="outline-button full" onClick={() => setPage('appointments')}>Ver agendamentos <ChevronRight size={15}/></button>
      </section>
    </div>
    <section className="panel vaccine-alert-panel">
      <div className="panel-heading"><div><h2>Carteira de vacinação</h2><p>Acompanhe as doses e mantenha tudo atualizado</p></div><button className="text-button" onClick={() => setPage('vaccines')}>Ver carteira <ChevronRight size={15}/></button></div>
      {vaccines.length === 0 ? <Empty text="Nenhuma vacina registrada." action="Registrar vacina" onClick={() => openModal('vaccine')}/> : <div className="vaccine-summary">{vaccines.slice(0,3).map(v => <div className="vaccine-summary-row" key={v.id}><div className="vaccine-icon"><ShieldCheck size={18}/></div><div className="vaccine-summary-info"><b>{v.name}</b><span>{petName(v.petId)} · Próxima dose: {formatDate(v.next)}</span></div><span className={`status-pill ${v.next && v.next <= today ? 'warning' : 'good'}`}>{v.next && v.next <= today ? 'Verificar dose' : 'Registrada'}</span></div>)}</div>}
    </section>
  </>
}
function Stat({icon:Icon,label,value,detail,tone}) { return <div className="stat-card"><div className={`stat-icon ${tone}`}><Icon size={19}/></div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></div> }
function PetAvatar({pet,large=false}) { return <div className={`pet-avatar ${pet.color || 'navy'} ${large?'large':''}`}>{pet.species === 'Gato' ? <Cat size={large?30:22}/> : <Dog size={large?31:23}/>}</div> }
function Empty({text,action,onClick}) { return <div className="empty-state"><PawPrint size={24}/><p>{text}</p>{action && <button className="text-button" onClick={onClick}>{action} <ChevronRight size={14}/></button>}</div> }

function PetsPage({pets,search,setSearch,openModal,removeItem}) {
  return <><PageHeading eyebrow="FAMÍLIA PETCARE" title="Meus pets" description="Todos os seus companheiros em um só lugar." action="Adicionar pet" onAction={() => openModal('pet')}/>
    <div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por nome, raça ou espécie..."/></div><span className="result-count">{pets.length} pet(s)</span></div>
    {pets.length ? <div className="pets-grid">{pets.map(p=><article className="pet-card" key={p.id}><div className="pet-card-top"><PetAvatar pet={p} large/><button className="icon-button" onClick={()=>openModal('pet',p)}><Edit3 size={16}/></button></div><h3>{p.name}</h3><p className="pet-breed">{p.breed || p.species}</p><div className="pet-details"><span><Dog size={14}/>{p.species}</span><span><Heart size={14}/>{p.sex || 'Não informado'}</span><span><Sparkles size={14}/>{p.age || 'Idade não informada'}</span></div>{p.weight && <div className="weight-line">Peso: <b>{p.weight}</b></div>}{p.notes && <p className="pet-notes">{p.notes}</p>}<div className="pet-card-actions"><button className="outline-button" onClick={()=>openModal('vaccine', {petId:p.id})}><Syringe size={15}/> Registrar vacina</button><button className="delete-button" onClick={()=>removeItem('pet',p.id)} aria-label="Excluir pet"><Trash2 size={16}/></button></div></article>)}</div> : <div className="panel"><Empty text="Nenhum pet encontrado. Cadastre seu primeiro companheiro!" action="Adicionar pet" onClick={()=>openModal('pet')}/></div>}
  </>
}
function VaccinesPage({vaccines,pets,petName,openModal,removeItem}) {
  return <><PageHeading eyebrow="SAÚDE EM DIA" title="Carteira de vacinação" description="Histórico de vacinas e acompanhamento das próximas doses." action="Registrar vacina" onAction={()=>openModal('vaccine')}/>
    <div className="info-strip"><ShieldCheck size={20}/><div><b>Prevenção é uma forma de carinho.</b><span>Consulte sempre um médico-veterinário para manter o calendário de vacinação adequado ao seu pet.</span></div></div>
    <section className="panel table-panel"><div className="panel-heading"><div><h2>Vacinas registradas</h2><p>{vaccines.length} registro(s) na carteira</p></div></div>{vaccines.length ? <div className="table-wrap"><table><thead><tr><th>Vacina</th><th>Pet</th><th>Data aplicada</th><th>Próxima dose</th><th>Veterinário(a)</th><th></th></tr></thead><tbody>{vaccines.map(v=><tr key={v.id}><td><div className="table-main"><span className="table-icon"><Syringe size={16}/></span><b>{v.name}</b></div></td><td>{petName(v.petId)}</td><td>{formatDate(v.date)}</td><td><span className={`date-status ${v.next && v.next <= today ? 'overdue' : ''}`}>{formatDate(v.next)}</span></td><td>{v.vet || '—'}</td><td><div className="row-actions"><button onClick={()=>openModal('vaccine',v)} aria-label="Editar"><Edit3 size={15}/></button><button onClick={()=>removeItem('vaccine',v.id)} aria-label="Excluir"><Trash2 size={15}/></button></div></td></tr>)}</tbody></table></div> : <Empty text="Ainda não há vacinas registradas." action="Registrar primeira vacina" onClick={()=>openModal('vaccine')}/>}</section>
  </>
}
function AppointmentsPage({appointments,pets,petName,openModal,removeItem}) {
  const sorted = [...appointments].sort((a,b)=>`${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  return <><PageHeading eyebrow="AGENDA PETCARE" title="Agendamentos" description="Organize consultas, retornos e cuidados veterinários." action="Novo agendamento" onAction={()=>openModal('appointment')}/>
    <div className="appointment-list">{sorted.length ? sorted.map(a=><article className="appointment-card" key={a.id}><div className="appointment-date"><b>{new Date(`${a.date}T12:00:00`).getDate()}</b><span>{new Date(`${a.date}T12:00:00`).toLocaleDateString('pt-BR',{month:'short'}).replace('.','')}</span><small>{new Date(`${a.date}T12:00:00`).getFullYear()}</small></div><div className="appointment-details"><div className="appointment-title"><h3>{a.type}</h3><span className={`status-pill ${a.status==='Confirmado'?'good':'pending'}`}>{a.status}</span></div><p><PawPrint size={14}/>{petName(a.petId)} <span>•</span> <Stethoscope size={14}/>{a.vet || 'Veterinário não informado'}</p><p><Clock size={14}/>{a.time} <span>•</span> <MapPin size={14}/>{a.clinic || 'Local não informado'}</p></div><div className="appointment-actions"><button className="icon-button" onClick={()=>openModal('appointment',a)}><Edit3 size={16}/></button><button className="icon-button" onClick={()=>removeItem('appointment',a.id)}><Trash2 size={16}/></button></div></article>) : <div className="panel"><Empty text="Você ainda não possui agendamentos." action="Agendar consulta" onClick={()=>openModal('appointment')}/></div>}</div>
  </>
}

function Modal({type,editing,pets,onClose,onSavePet,onSaveVaccine,onSaveAppointment}) {
  const isPet = type==='pet', isVaccine=type==='vaccine'
  const initial = editing || (isPet ? {name:'',species:'Cachorro',breed:'',age:'',sex:'',weight:'',color:'navy',notes:''} : isVaccine ? {petId:pets[0]?.id || '',name:'',date:today,next:'',vet:''} : {petId:pets[0]?.id || '',date:today,time:'09:00',type:'Consulta de rotina',vet:'',clinic:'',status:'Pendente'})
  const [form,setForm] = useState(initial)
  const [error,setError] = useState('')
  const change = e => setForm(f=>({...f,[e.target.name]:e.target.value}))
  function submit(e) {
    e.preventDefault()
    if (isPet && !form.name.trim()) return setError('Informe o nome do pet.')
    if (!isPet && !form.petId) return setError('Cadastre um pet antes de continuar.')
    if (isVaccine && !form.name.trim()) return setError('Informe o nome da vacina.')
    if (type==='appointment' && (!form.date || !form.time || !form.type)) return setError('Preencha data, horário e tipo de atendimento.')
    if (isPet) onSavePet(form)
    else if (isVaccine) onSaveVaccine({...form,petId:Number(form.petId)})
    else onSaveAppointment({...form,petId:Number(form.petId)})
  }
  const title = isPet ? (editing?'Editar pet':'Cadastrar pet') : isVaccine ? (editing?'Editar vacina':'Registrar vacina') : (editing?'Editar agendamento':'Novo agendamento')
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className="modal"><div className="modal-header"><div><span className="eyebrow">PETCARE</span><h2>{title}</h2></div><button className="icon-button" onClick={onClose}><X size={19}/></button></div>
    <form onSubmit={submit} className="modal-form">
      {isPet ? <>
        <Field label="Nome do pet *"><input name="name" value={form.name||''} onChange={change} placeholder="Ex.: Luna" autoFocus/></Field>
        <div className="form-row"><Field label="Espécie"><select name="species" value={form.species||'Cachorro'} onChange={change}><option>Cachorro</option><option>Gato</option><option>Outro</option></select></Field><Field label="Sexo"><select name="sex" value={form.sex||''} onChange={change}><option value="">Selecione</option><option>Fêmea</option><option>Macho</option></select></Field></div>
        <Field label="Raça"><input name="breed" value={form.breed||''} onChange={change} placeholder="Ex.: Golden Retriever"/></Field>
        <div className="form-row"><Field label="Idade"><input name="age" value={form.age||''} onChange={change} placeholder="Ex.: 2 anos"/></Field><Field label="Peso"><input name="weight" value={form.weight||''} onChange={change} placeholder="Ex.: 12 kg"/></Field></div>
        <Field label="Observações"><textarea name="notes" value={form.notes||''} onChange={change} placeholder="Alergias, cuidados especiais..."/></Field>
      </> : <>
        <Field label="Pet *"><select name="petId" value={form.petId} onChange={change}>{pets.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}</select></Field>
        {isVaccine ? <>
          <Field label="Nome da vacina *"><input name="name" value={form.name||''} onChange={change} placeholder="Ex.: Antirrábica"/></Field>
          <div className="form-row"><Field label="Data aplicada"><input type="date" name="date" value={form.date||''} onChange={change}/></Field><Field label="Próxima dose"><input type="date" name="next" value={form.next||''} onChange={change}/></Field></div>
          <Field label="Veterinário(a)"><input name="vet" value={form.vet||''} onChange={change} placeholder="Nome do profissional"/></Field>
        </> : <>
          <Field label="Tipo de atendimento *"><select name="type" value={form.type||'Consulta de rotina'} onChange={change}><option>Consulta de rotina</option><option>Retorno</option><option>Vacinação</option><option>Exame</option><option>Banho e tosa</option><option>Emergência</option></select></Field>
          <div className="form-row"><Field label="Data *"><input type="date" min={today} name="date" value={form.date||''} onChange={change}/></Field><Field label="Horário *"><input type="time" name="time" value={form.time||'09:00'} onChange={change}/></Field></div>
          <Field label="Veterinário(a)"><input name="vet" value={form.vet||''} onChange={change} placeholder="Nome do profissional"/></Field>
          <Field label="Clínica / endereço"><input name="clinic" value={form.clinic||''} onChange={change} placeholder="Nome da clínica"/></Field>
          <Field label="Status"><select name="status" value={form.status||'Pendente'} onChange={change}><option>Pendente</option><option>Confirmado</option><option>Concluído</option></select></Field>
        </>}
      </>}
      {error && <div className="form-error"><AlertCircle size={15}/>{error}</div>}
      <div className="modal-actions"><button type="button" className="outline-button" onClick={onClose}>Cancelar</button><button className="primary-button" type="submit"><CheckCircle2 size={16}/>Salvar</button></div>
    </form>
  </div></div>
}
function Field({label,children}) { return <label className="field"><span>{label}</span>{children}</label> }

export default App
