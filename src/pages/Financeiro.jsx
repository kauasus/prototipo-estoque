import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export default function Financeiro() {
  const dados = [
    { paciente: 'João', valor: 150, status: 'Pago' },
    { paciente: 'Maria', valor: 200, status: 'Pendente' }
  ];

  return (
    <Card title="Financeiro">
      <DataTable value={dados}>
        <Column field="paciente" header="Paciente" />
        <Column field="valor" header="Valor" />
        <Column field="status" header="Status" />
      </DataTable>
    </Card>
  );
}
