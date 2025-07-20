// src/services/reportService.js
const API_BASE_URL = 'http://localhost:8000/api';

class ReportService {
  
  // ==================== REPORTES PRINCIPALES ====================
  
  async getClienteMasFrecuente(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/reports/cliente_mas_frecuente/${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching cliente más frecuente:', error);
      throw error;
    }
  }

  async getHabitacionMasVendida(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/reports/habitacion_mas_vendida/${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching habitación más vendida:', error);
      throw error;
    }
  }

  async getMejorTemporada(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/reports/mejor_temporada/${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching mejor temporada:', error);
      throw error;
    }
  }

  async getDashboard(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/reports/dashboard/${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      throw error;
    }
  }

  async getEstadisticasGenerales(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/reports/estadisticas_generales/${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching estadísticas generales:', error);
      throw error;
    }
  }

  // ==================== ANÁLISIS AVANZADOS ====================

  async getPrediccionesOcupacion(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/analytics/predicciones_ocupacion/${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching predicciones ocupación:', error);
      throw error;
    }
  }

  async getAnalisisRentabilidad(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/analytics/analisis_rentabilidad/${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching análisis rentabilidad:', error);
      throw error;
    }
  }

  // ==================== EXPORTACIÓN ====================

  async exportReport(exportData) {
    try {
      const response = await fetch(`${API_BASE_URL}/export/export_report/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(exportData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  async getDownloadFormats() {
    try {
      const response = await fetch(`${API_BASE_URL}/export/download_formats/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching download formats:', error);
      throw error;
    }
  }

  // ==================== REPORTES PROGRAMADOS ====================

  async getReportSchedules() {
    try {
      const response = await fetch(`${API_BASE_URL}/schedules/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching report schedules:', error);
      throw error;
    }
  }

  async createReportSchedule(scheduleData) {
    try {
      const response = await fetch(`${API_BASE_URL}/schedules/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(scheduleData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.error || `Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating report schedule:', error);
      throw error;
    }
  }

  async executeScheduleNow(scheduleId) {
    try {
      const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}/execute_now/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error executing schedule:', error);
      throw error;
    }
  }

  async toggleScheduleStatus(scheduleId) {
    try {
      const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}/toggle_status/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error toggling schedule status:', error);
      throw error;
    }
  }

  // ==================== AUDITORÍA ====================

  async getReportAudit(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/audit/${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching report audit:', error);
      throw error;
    }
  }

  async getMyActivity() {
    try {
      const response = await fetch(`${API_BASE_URL}/audit/my_activity/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching my activity:', error);
      throw error;
    }
  }

  async getAuditStats(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_BASE_URL}/audit/stats/${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching audit stats:', error);
      throw error;
    }
  }

  // ==================== CACHE ====================

  async getReportCache() {
    try {
      const response = await fetch(`${API_BASE_URL}/cache/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching report cache:', error);
      throw error;
    }
  }

  async invalidateCache(cacheId) {
    try {
      const response = await fetch(`${API_BASE_URL}/cache/${cacheId}/invalidate/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error invalidating cache:', error);
      throw error;
    }
  }

  async clearExpiredCache() {
    try {
      const response = await fetch(`${API_BASE_URL}/cache/clear_expired/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error clearing expired cache:', error);
      throw error;
    }
  }

  // ==================== UTILIDADES ====================

  /**
   * Formatear parámetros de fecha para API
   */
  formatDateParams(fechaInicio, fechaFin, limit = 10) {
    const params = {};
    
    if (fechaInicio) {
      params.fecha_inicio = fechaInicio;
    }
    
    if (fechaFin) {
      params.fecha_fin = fechaFin;
    }
    
    if (limit) {
      params.limit = limit;
    }
    
    return params;
  }

  /**
   * Obtener fecha del último mes
   */
  getLastMonthDateRange() {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    
    return {
      fecha_inicio: lastMonth.toISOString().split('T')[0],
      fecha_fin: today.toISOString().split('T')[0]
    };
  }

  /**
   * Obtener fecha del último trimestre
   */
  getLastQuarterDateRange() {
    const today = new Date();
    const lastQuarter = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
    
    return {
      fecha_inicio: lastQuarter.toISOString().split('T')[0],
      fecha_fin: today.toISOString().split('T')[0]
    };
  }

  /**
   * Obtener fecha del año actual
   */
  getCurrentYearDateRange() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    return {
      fecha_inicio: startOfYear.toISOString().split('T')[0],
      fecha_fin: today.toISOString().split('T')[0]
    };
  }
}

export default new ReportService();