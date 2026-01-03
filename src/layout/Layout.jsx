import { Outlet } from 'react-router-dom';
import Topbar from './TopBar';
import './layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <Topbar />
      <main className="layout-content">
        <Outlet />
      </main>
    </div>
  );
}
