import { Card } from 'primereact/card';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { useState } from 'react';
import './Agendamentos.css';

export default function Agendamentos() {
  const [medico, setMedico] = useState(null);
  const [data, setData] = useState(null);
  const [horario, setHorario] = useState(null);

  const medicos = [
    { label: 'Dr. João - Cardiologia', value: 1 },
    { label: 'Dra. Maria - Pediatria', value: 2 }
  ];

  const horarios = [
    { label: '08:00', value: '08:00' },
    { label: '09:00', value: '09:00' },
    { label: '10:00', value: '10:00' }
  ];

  return (
    <div className="agenda-container">
      <h2>Agenda Médica</h2>

      <div className="agenda-grid">
        
        {/* COLUNA ESQUERDA */}
        <Card title="Agendamento" className="agenda-card">
          <div className="field">
            <label>Médico</label>
            <Dropdown
              value={medico}
              options={medicos}
              onChange={(e) => setMedico(e.value)}
              placeholder="Selecione o médico"
              className="w-full"
            />
          </div>

          <div className="field">
            <label>Data</label>
            <Calendar
              value={data}
              onChange={(e) => setData(e.value)}
              inline
            />
          </div>

          <div className="field">
            <label>Horário</label>
            <Dropdown
              value={horario}
              options={horarios}
              onChange={(e) => setHorario(e.value)}
              placeholder="Selecione o horário"
              className="w-full"
            />
          </div>

          <Button
            label="Confirmar Agendamento"
            icon="pi pi-check"
            className="w-full mt-3"
          />
        </Card>

        {/* COLUNA DIREITA */}
        <Card title="Agenda do Médico" className="agenda-card">
          <p>📅 Aqui vai aparecer a agenda completa do médico</p>
          <p>(consultas já marcadas, horários bloqueados, etc)</p>
        </Card>

      </div>
    </div>
  );
}
