import * as dashboardService from '../services/dashboardService.js';

export async function getDashboard(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate and endDate are required' });
    }

    const data = await dashboardService.getDashboardData(familyId, userId, startDate, endDate);

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getMonthlyDashboard(req, res) {
  try {
    const familyId = req.user.familyId;
    const userId = req.user.userId;
    const { year, month } = req.query;

    if (!year || !month) {
      return res.status(400).json({ error: 'year and month are required' });
    }

    const data = await dashboardService.getMonthlyData(familyId, userId, parseInt(year), parseInt(month));

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
