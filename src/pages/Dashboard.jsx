import React, { useState } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import ProdutosCRUD from "../components/ProdutosCRUD";
import MovimentacaoEstoque from "../components/MovimentacaoEstoque";
import DashboardKPI from "../components/DashboardKPI";
import Relatorios from "../components/Relatorios";
import FornecedoresCRUD from "../components/FornecedoresCRUD";
import "./Dashboard.css";

const Dashboard = ({ onLogout }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="dashboard-container">
      {/* Cabeçalho Estilizado */}
      <header className="dashboard-header">
        <h1>
          <i className="pi pi-box" style={{ fontSize: "1.8rem" }}></i>
          Controle de Estoque Profissional
        </h1>

        <button onClick={onLogout} className="logout-btn">
          <i className="pi pi-power-off"></i>
          <span>LogOff</span>
        </button>
      </header>

      {/* Área de Conteúdo com Abas */}
      <main>
        <TabView
          activeIndex={activeIndex}
          onTabChange={(e) => setActiveIndex(e.index)}
        >
          <TabPanel header="Dashboard" leftIcon="pi pi-chart-bar mr-2">
            <DashboardKPI />
          </TabPanel>

          <TabPanel header="Produtos" leftIcon="pi pi-list mr-2">
            <ProdutosCRUD />
          </TabPanel>

          <TabPanel header="Movimentação" leftIcon="pi pi-sync mr-2">
            <MovimentacaoEstoque />
          </TabPanel>

          <TabPanel header="Fornecedores" leftIcon="pi pi-building mr-2">
            <FornecedoresCRUD />
          </TabPanel>

          <TabPanel header="Relatórios" leftIcon="pi pi-file-pdf mr-2">
            <Relatorios />
          </TabPanel>
        </TabView>
      </main>
    </div>
  );
};

export default Dashboard;
