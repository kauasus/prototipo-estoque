import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Card } from 'primereact/card';

export default function Agendamentos() {
  const dados = [
    { medico: 'Dr. João', data: '2026-01-10', hora: '09:00' },
    { medico: 'Dra. Ana', data: '2026-01-12', hora: '14:00' }
  ];

  return (
    <Card title="Consultas Agendadas">
      <DataTable value={dados} paginator rows={5}>
        <Column field="medico" header="Médico" />
        <Column field="data" header="Data" />
        <Column field="hora" header="Hora" />
      </DataTable>
    </Card>
  );
}
