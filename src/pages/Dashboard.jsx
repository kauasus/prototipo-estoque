import React from "react";
import { useNavigate } from "react-router-dom";
import { TabView, TabPanel } from "primereact/tabview";
import { Button } from "primereact/button";
import DashboardKPI from "../components/DashboardKPI";
import ProdutosCRUD from "../components/ProdutosCRUD";
import MovimentacaoEstoque from "../components/MovimentacaoEstoque";
import Relatorios from "../components/Relatorios";

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/");
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1 style={{ margin: 0, color: "#334155" }}>
          📦 Sistema de Controle de Estoque
        </h1>
        <Button
          label="Sair"
          icon="pi pi-sign-out"
          onClick={handleLogout}
          className="p-button-danger p-button-outlined"
        />
      </div>

      <TabView>
        <TabPanel header="Dashboard" leftIcon="pi pi-chart-bar mr-2">
          <DashboardKPI />
        </TabPanel>
        <TabPanel header="Produtos" leftIcon="pi pi-box mr-2">
          <ProdutosCRUD />
        </TabPanel>
        <TabPanel header="Entrada / Saída" leftIcon="pi pi-arrows-h mr-2">
          <MovimentacaoEstoque />
        </TabPanel>
        <TabPanel header="Relatórios" leftIcon="pi pi-file mr-2">
          <Relatorios />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default Dashboard;
