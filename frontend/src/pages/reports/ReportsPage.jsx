// src/pages/reports/ReportsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Users, Home, DollarSign, Calendar, Download, 
  BarChart3, Activity, Filter, RefreshCw, FileText, 
  Crown, Star, AlertCircle, Eye
} from 'lucide-react';
import { 
  useDashboard, 
  useClientFrequencyReport, 
  useRoomPopularityReport, 
  useSeasonalSalesReport,
  useReportDateRange,
  useReportExport 
} from '../../hooks/useReports';
import Button from '../../Components/common/Button';

// Colores para gráficos
const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDateFilters, setShowDateFilters] = useState(false);
  
  // Hooks
  const { dashboardData, loading: dashboardLoading, fetchDashboard } = useDashboard();
  const { data: clientFrequencyData, loading: clientLoading, fetchReport: fetchClientReport } = useClientFrequencyReport();
  const { data: roomPopularityData, loading: roomLoading, fetchReport: fetchRoomReport } = useRoomPopularityReport();
  const { data: seasonalData, loading: seasonalLoading, fetchReport: fetchSeasonalReport } = useSeasonalSalesReport();
  const { dateRange, setCustomRange, setLastMonth, setLastQuarter, setCurrentYear } = useReportDateRange();
  const { exportReport, loading: exportLoading } = useReportExport();

  // Estados locales
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [reportLimit, setReportLimit] = useState(10);

  // Inicializar fechas cuando se monta el componente
  useEffect(() => {
    if (dateRange.fecha_inicio && dateRange.fecha_fin) {
      setCustomDateStart(dateRange.fecha_inicio);
      setCustomDateEnd(dateRange.fecha_fin);
    }
  }, [dateRange]);

  // Cargar reportes automáticamente cuando cambia el tab
  useEffect(() => {
    const params = { ...dateRange, limit: reportLimit };
    
    switch (activeTab) {
      case 'clients':
        fetchClientReport(params);
        break;
      case 'rooms':
        fetchRoomReport(params);
        break;
      case 'seasonal':
        fetchSeasonalReport(params);
        break;
      default:
        break;
    }
  }, [activeTab, dateRange, reportLimit]);

  // Manejar cambio de fechas personalizadas
  const handleApplyCustomDates = () => {
    if (customDateStart && customDateEnd) {
      setCustomRange(customDateStart, customDateEnd);
    }
  };

  // Refrescar reporte actual según tab activo
  const refreshCurrentReport = () => {
    const params = { ...dateRange, limit: reportLimit };
    
    switch (activeTab) {
      case 'dashboard':
        fetchDashboard(params);
        break;
      case 'clients':
        fetchClientReport(params);
        break;
      case 'rooms':
        fetchRoomReport(params);
        break;
      case 'seasonal':
        fetchSeasonalReport(params);
        break;
      default:
        break;
    }
  };

  // Manejar exportación
  const handleExport = async (format) => {
    try {
      let reportData = {};
      let reportType = '';

      switch (activeTab) {
        case 'dashboard':
          reportData = dashboardData;
          reportType = 'dashboard';
          break;
        case 'clients':
          reportData = clientFrequencyData;
          reportType = 'client_frequency';
          break;
        case 'rooms':
          reportData = roomPopularityData;
          reportType = 'room_popularity';
          break;
        case 'seasonal':
          reportData = seasonalData;
          reportType = 'seasonal_sales';
          break;
        default:
          return;
      }

      const exportData = {
        format,
        report_type: reportType,
        report_data: reportData,
        include_charts: true,
        file_name: `reporte_${reportType}_${new Date().toISOString().split('T')[0]}`
      };

      const result = await exportReport(exportData);
      
      if (result.download_url) {
        window.open(result.download_url, '_blank');
      } else {
        alert('Reporte exportado exitosamente');
      }
    } catch (error) {
      alert('Error al exportar reporte: ' + error.message);
    }
  };

  // Renderizar gráfico basado en tipo
  const renderChart = (chartData) => {
    if (!chartData?.data || chartData.data.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No hay datos para mostrar</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      width: '100%',
      height: 300,
      data: chartData.data,
      margin: { top: 5, right: 30, left: 20, bottom: 5 }
    };

    switch (chartData.chart_type) {
      case 'bar':
        return (
          <ResponsiveContainer {...commonProps}>
            <BarChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={chartData.colors?.[0] || CHART_COLORS[0]} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer {...commonProps}>
            <LineChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={chartData.colors?.[0] || CHART_COLORS[0]}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer {...commonProps}>
            <AreaChart data={chartData.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={chartData.colors?.[0] || CHART_COLORS[0]}
                fill={chartData.colors?.[0] || CHART_COLORS[0]}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="text-center text-gray-500 py-8">Tipo de gráfico no soportado</div>;
    }
  };

  // Renderizar tarjetas de resumen del dashboard
  const renderSummaryCards = () => {
    if (!dashboardData?.summary_cards) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {dashboardData.summary_cards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                {card.trend && (
                  <p className={`text-sm font-medium ${
                    card.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.trend}
                  </p>
                )}
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                card.color === 'blue' ? 'bg-blue-100' :
                card.color === 'green' ? 'bg-green-100' :
                card.color === 'yellow' ? 'bg-yellow-100' :
                card.color === 'purple' ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                {card.icon === 'users' && <Users className="h-6 w-6 text-blue-600" />}
                {card.icon === 'calendar' && <Calendar className="h-6 w-6 text-green-600" />}
                {card.icon === 'dollar-sign' && <DollarSign className="h-6 w-6 text-yellow-600" />}
                {card.icon === 'home' && <Home className="h-6 w-6 text-purple-600" />}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Renderizar contenido del dashboard
  const renderDashboardContent = () => {
    if (dashboardLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Cargando dashboard...</p>
          </div>
        </div>
      );
    }

    if (!dashboardData) {
      return (
        <div className="text-center py-12">
          <Activity className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay datos del dashboard disponibles</p>
          <Button onClick={() => fetchDashboard(dateRange)} className="mt-4">
            Cargar Dashboard
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {renderSummaryCards()}
        
        {/* Gráficos del dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dashboardData.charts?.map((chart, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{chart.title}</h3>
              {chart.subtitle && (
                <p className="text-sm text-gray-600 mb-4">{chart.subtitle}</p>
              )}
              {renderChart(chart)}
            </div>
          ))}
        </div>

        {/* Actividad reciente */}
        {dashboardData.recent_activity && dashboardData.recent_activity.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
            <div className="space-y-3">
              {dashboardData.recent_activity.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.description}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Renderizar reporte de clientes frecuentes
  const renderClientFrequencyReport = () => {
    if (clientLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Cargando reporte de clientes...</p>
          </div>
        </div>
      );
    }

    if (!clientFrequencyData || clientFrequencyData.length === 0) {
      return (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay datos de clientes disponibles</p>
          <Button onClick={() => fetchClientReport(dateRange)} className="mt-4">
            Generar Reporte
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Top 3 clientes */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Crown className="h-5 w-5 text-yellow-500 mr-2" />
            Top 3 Clientes Más Frecuentes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clientFrequencyData.slice(0, 3).map((client, index) => (
              <div key={client.cliente_id} className={`p-4 rounded-lg border-2 ${
                index === 0 ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' :
                index === 1 ? 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200' :
                'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}>
                    {index + 1}
                  </div>
                  <span className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-sm">{client.nombre_completo}</h4>
                  <p className="text-xs text-gray-600 mb-2">{client.tipo_documento}: {client.numero_documento}</p>
                  <div className="space-y-1 text-xs">
                    <p><span className="font-medium">Reservas:</span> {client.total_reservas}</p>
                    <p><span className="font-medium">Total:</span> S/ {client.monto_total_pagado.toFixed(2)}</p>
                    <p><span className="font-medium">Habitaciones:</span> {client.total_habitaciones}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabla completa */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Todos los Clientes Frecuentes</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Habitaciones</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promedio</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientFrequencyData.map((client) => (
                  <tr key={client.cliente_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{client.nombre_completo}</div>
                        <div className="text-sm text-gray-500">{client.numero_documento}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.total_reservas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.total_habitaciones}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      S/ {client.monto_total_pagado.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {client.promedio_habitaciones_por_reserva} hab/reserva
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar reporte de habitaciones populares
  const renderRoomPopularityReport = () => {
    if (roomLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Cargando reporte de habitaciones...</p>
          </div>
        </div>
      );
    }

    if (!roomPopularityData || roomPopularityData.length === 0) {
      return (
        <div className="text-center py-12">
          <Home className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay datos de habitaciones disponibles</p>
          <Button onClick={() => fetchRoomReport(dateRange)} className="mt-4">
            Generar Reporte
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Top 3 habitaciones */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <Star className="h-5 w-5 text-yellow-500 mr-2" />
            Top 3 Habitaciones Más Vendidas
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roomPopularityData.slice(0, 3).map((room, index) => (
              <div key={room.habitacion_id} className={`p-4 rounded-lg border-2 ${
                index === 0 ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200' :
                index === 1 ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' :
                'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-lg text-gray-900">Hab. {room.numero}</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 'bg-orange-400'
                  }`}>
                    #{index + 1}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Tipo:</span> {room.tipo_display}</p>
                  <p><span className="font-medium">Asignaciones:</span> {room.total_asignaciones}</p>
                  <p><span className="font-medium">Ingresos:</span> S/ {room.ingresos_generados.toFixed(2)}</p>
                  <p><span className="font-medium">Ocupación:</span> {room.tasa_ocupacion}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gráfico de habitaciones */}
        {roomPopularityData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparación de Asignaciones</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roomPopularityData.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="numero" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_asignaciones" fill="#3B82F6" name="Asignaciones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tabla completa */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Todas las Habitaciones</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Habitación</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asignaciones</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clientes</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ocupación</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {roomPopularityData.map((room) => (
                  <tr key={room.habitacion_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">Hab. {room.numero}</div>
                        <div className="text-sm text-gray-500">{room.tipo_display}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.total_asignaciones}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {room.total_clientes_unicos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      S/ {room.ingresos_generados.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        room.tasa_ocupacion >= 80 ? 'bg-green-100 text-green-800' :
                        room.tasa_ocupacion >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {room.tasa_ocupacion}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar reporte de temporadas
  const renderSeasonalSalesReport = () => {
    if (seasonalLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="text-gray-600 font-medium">Cargando reporte de temporadas...</p>
          </div>
        </div>
      );
    }

    if (!seasonalData || seasonalData.length === 0) {
      return (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hay datos de temporadas disponibles</p>
          <Button onClick={() => fetchSeasonalReport(dateRange)} className="mt-4">
            Generar Reporte
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Mejor temporada */}
        {seasonalData.length > 0 && (
          <div className="bg-gradient-to-r from-green-500 to-blue-600 p-6 rounded-lg text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center">
                  🏆 Mejor Temporada
                </h3>
                <p className="text-lg">{seasonalData[0].periodo}</p>
                <p className="text-sm opacity-90">
                  {seasonalData[0].total_reservas} reservas • S/ {seasonalData[0].ingresos_totales.toFixed(2)} ingresos
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">{seasonalData[0].clientes_unicos}</p>
                <p className="text-sm opacity-90">clientes únicos</p>
              </div>
            </div>
          </div>
        )}

        {/* Gráfico de tendencias */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tendencias por Período</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={seasonalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey="ingresos_totales" 
                stroke="#10B981" 
                fill="#10B981"
                fillOpacity={0.6}
                name="Ingresos"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tabla de temporadas */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Análisis por Período</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Período</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reservas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Habitaciones</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Promedio Diario</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {seasonalData.map((period) => (
                  <tr key={period.periodo} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{period.periodo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {period.total_reservas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {period.total_habitaciones_vendidas}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      S/ {period.ingresos_totales.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {period.promedio_reservas_diarias.toFixed(1)} reservas/día
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // Detectar si hay algún loading activo
  const isLoading = dashboardLoading || clientLoading || roomLoading || seasonalLoading;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-3 md:space-y-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Reportes y Estadísticas</h1>
          <p className="text-gray-600 text-sm">Análisis detallado del rendimiento del hotel</p>
        </div>

        {/* Controles de fecha y exportación */}
        <div className="flex flex-col space-y-3 md:flex-row md:justify-between md:items-center md:space-y-0 md:space-x-4">
          <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDateFilters(!showDateFilters)}
              className="flex items-center justify-center space-x-2"
            >
              <Filter className="h-4 w-4" />
              <span>Filtros</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={refreshCurrentReport}
              disabled={isLoading}
              className="flex items-center justify-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </Button>
          </div>

          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-3">
            <Button
              variant="primary"
              onClick={() => handleExport('json')}
              disabled={exportLoading}
              className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filtros de fecha */}
      {showDateFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros de Fecha y Opciones</h3>
          
          {/* Filtros rápidos */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={setLastMonth}
              className="text-sm"
            >
              Último Mes
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={setLastQuarter}
              className="text-sm"
            >
              Último Trimestre
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={setCurrentYear}
              className="text-sm"
            >
              Año Actual
            </Button>
          </div>

          {/* Fechas personalizadas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={customDateStart}
                onChange={(e) => setCustomDateStart(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={customDateEnd}
                onChange={(e) => setCustomDateEnd(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Límite de Resultados
              </label>
              <select
                value={reportLimit}
                onChange={(e) => setReportLimit(Number(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value={5}>5 resultados</option>
                <option value={10}>10 resultados</option>
                <option value={20}>20 resultados</option>
                <option value={50}>50 resultados</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              onClick={handleApplyCustomDates}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Aplicar Filtros
            </Button>
          </div>

          {/* Información del rango actual */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Período actual:</strong> {dateRange.fecha_inicio} al {dateRange.fecha_fin}
            </p>
          </div>
        </div>
      )}

      {/* Tabs de navegación */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: Activity },
              { id: 'clients', name: 'Clientes Frecuentes', icon: Users },
              { id: 'rooms', name: 'Habitaciones Populares', icon: Home },
              { id: 'seasonal', name: 'Temporadas', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenido de los tabs */}
        <div className="p-6">
          {activeTab === 'dashboard' && renderDashboardContent()}
          {activeTab === 'clients' && renderClientFrequencyReport()}
          {activeTab === 'rooms' && renderRoomPopularityReport()}
          {activeTab === 'seasonal' && renderSeasonalSalesReport()}
        </div>
      </div>

      {/* Información adicional */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-600" />
          Información del Reporte
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Período Analizado:</p>
            <p className="text-gray-600">{dateRange.fecha_inicio} al {dateRange.fecha_fin}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Última Actualización:</p>
            <p className="text-gray-600">{new Date().toLocaleString('es-ES')}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Límite de Resultados:</p>
            <p className="text-gray-600">{reportLimit} registros</p>
          </div>
        </div>
      </div>

      {/* Footer con tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Consejos para usar los reportes
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Use los filtros de fecha para analizar períodos específicos</li>
                <li>Los reportes se actualizan automáticamente con datos en tiempo real</li>
                <li>Puede exportar cualquier reporte en formato JSON para análisis externos</li>
                <li>El dashboard muestra un resumen general de todas las métricas importantes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;