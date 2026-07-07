import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export const useProjectDetail = (id) => {
  const [order, setOrder] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      if (data.data) {
        setOrder(data.data);
        setAssets(data.data.assets || []);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
      // Fallback data for local development when server is not running
      setOrder({
        id: id,
        order_number: 'PRC-LXP12-ABC',
        project_name: 'Company Profile Website',
        status: 'in_progress',
        created_at: new Date().toISOString(),
        service_name: 'Web Development',
        timeline: '2-3 Minggu',
        budget_range: 'Rp 5.000.000 - Rp 10.000.000',
        final_price: 7500000,
        staging_url: 'https://staging.propscode.com/project-12',
        handover_url: 'https://github.com/propscode/project-12',
      });
      setAssets([
        {
          id: 1,
          file_name: 'Referensi Desain Figma',
          file_path: 'https://figma.com/file/example',
          file_type: 'link',
          created_at: new Date().toISOString(),
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id, loadOrder]);

  return { order, assets, loading, loadOrder };
};
