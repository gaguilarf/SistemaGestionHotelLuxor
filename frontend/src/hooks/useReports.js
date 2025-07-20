// src/hooks/useReports.js
import { useState, useEffect } from 'react';
import reportService from '../services/reportService';

// Hook principal para reportes
export const useReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateReport = async (reportType, params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      let data;
      
      switch (reportType) {
        case 'client_frequency':
          data = await reportService.getClienteMasFrecuente(params);
          break;
        case 'room_popularity':
          data = await reportService.getHabitacionMasVendida(params);
          break;
        case 'seasonal_sales':
          data = await reportService.getMejorTemporada(params);
          break;
        case 'dashboard':
          data = await reportService.getDashboard(params);
          break;
        case 'general_stats':
          data = await reportService.getEstadisticasGenerales(params);
          break;
        default:
          throw new Error(`Tipo de reporte no soportado: ${reportType}`);
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    generateReport
  };
};

// Hook para cliente más frecuente
export const useClientFrequencyReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getClienteMasFrecuente(params);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchReport
  };
};

// Hook para habitación más vendida
export const useRoomPopularityReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getHabitacionMasVendida(params);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchReport
  };
};

// Hook para mejor temporada
export const useSeasonalSalesReport = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReport = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getMejorTemporada(params);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    fetchReport
  };
};

// Hook para dashboard
export const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboard = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getDashboard(params);
      setDashboardData(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cargar dashboard automáticamente al montar el componente
    fetchDashboard();
  }, []);

  return {
    dashboardData,
    loading,
    error,
    fetchDashboard,
    refetch: fetchDashboard
  };
};

// Hook para estadísticas generales
export const useGeneralStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getEstadisticasGenerales(params);
      setStats(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    stats,
    loading,
    error,
    fetchStats
  };
};

// Hook para análisis avanzados
export const useAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPrediccionesOcupacion = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getPrediccionesOcupacion(params);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getAnalisisRentabilidad = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getAnalisisRentabilidad(params);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getPrediccionesOcupacion,
    getAnalisisRentabilidad
  };
};

// Hook para exportación
export const useReportExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadFormats, setDownloadFormats] = useState([]);

  const exportReport = async (exportData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.exportReport(exportData);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloadFormats = async () => {
    try {
      const result = await reportService.getDownloadFormats();
      setDownloadFormats(result.available_formats || []);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchDownloadFormats();
  }, []);

  return {
    loading,
    error,
    downloadFormats,
    exportReport,
    fetchDownloadFormats
  };
};

// Hook para reportes programados
export const useReportSchedules = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSchedules = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getReportSchedules();
      setSchedules(result.results || result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async (scheduleData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.createReportSchedule(scheduleData);
      await fetchSchedules(); // Refrescar lista
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const executeNow = async (scheduleId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.executeScheduleNow(scheduleId);
      await fetchSchedules(); // Refrescar lista
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (scheduleId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.toggleScheduleStatus(scheduleId);
      await fetchSchedules(); // Refrescar lista
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  return {
    schedules,
    loading,
    error,
    fetchSchedules,
    createSchedule,
    executeNow,
    toggleStatus
  };
};

// Hook para auditoría
export const useReportAudit = () => {
  const [auditData, setAuditData] = useState([]);
  const [myActivity, setMyActivity] = useState([]);
  const [auditStats, setAuditStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAudit = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getReportAudit(params);
      setAuditData(result.results || result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchMyActivity = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getMyActivity();
      setMyActivity(result.recent_activity || []);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditStats = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getAuditStats(params);
      setAuditStats(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    auditData,
    myActivity,
    auditStats,
    loading,
    error,
    fetchAudit,
    fetchMyActivity,
    fetchAuditStats
  };
};

// Hook para cache
export const useReportCache = () => {
  const [cacheData, setCacheData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCache = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.getReportCache();
      setCacheData(result.results || result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const invalidateCache = async (cacheId) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.invalidateCache(cacheId);
      await fetchCache(); // Refrescar lista
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearExpiredCache = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await reportService.clearExpiredCache();
      await fetchCache(); // Refrescar lista
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCache();
  }, []);

  return {
    cacheData,
    loading,
    error,
    fetchCache,
    invalidateCache,
    clearExpiredCache
  };
};

// Hook utilitario para fechas
export const useReportDateRange = () => {
  const [dateRange, setDateRange] = useState(() => {
    // Por defecto: último mes
    return reportService.getLastMonthDateRange();
  });

  const setLastMonth = () => {
    setDateRange(reportService.getLastMonthDateRange());
  };

  const setLastQuarter = () => {
    setDateRange(reportService.getLastQuarterDateRange());
  };

  const setCurrentYear = () => {
    setDateRange(reportService.getCurrentYearDateRange());
  };

  const setCustomRange = (fechaInicio, fechaFin) => {
    setDateRange({ fecha_inicio: fechaInicio, fecha_fin: fechaFin });
  };

  return {
    dateRange,
    setDateRange,
    setLastMonth,
    setLastQuarter,
    setCurrentYear,
    setCustomRange
  };
};