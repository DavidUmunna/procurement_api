// controllers/skipController.js
const Skip = require('../models/skips_tracking'); // Your Skip model

exports.getSkipAnalytics = async (req, res) => {
  try {
    const { startDate, endDate,DateField, groupBy = 'day' } = req.query;
    
    // Validate dates
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Both startDate and endDate are required' });
    }
    console.log(req.query)

    // Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const fieldMap = {
      DM:"DateMobilized",
      DRL:"DateReceivedOnLocation",
      DD:"DemobilizationOfFilledSkips",
      DF:"DateFilled"
    };
    
    // Get actual schema field name
    const fieldName = fieldMap[DateField];

    if (!fieldName) {
      return res.status(400).json({ error: "Invalid date field" });
    }
    // Group skips by time period
    let groupQuery;
    switch (groupBy) {
      case 'day':
        groupQuery = {
          year: { $year: `$${fieldName}` },
          month: { $month: `$${fieldName}`},
          day: { $dayOfMonth: `$${fieldName}`}
        };
        break;
      case 'week':
        groupQuery = {
          year: { $year: `$${fieldName}` },
          week: { $week: `$${fieldName}`}
        };
        break;
      case 'month':
        groupQuery = {
          year: { $year: `$${fieldName}` },
          month: { $month: `$${fieldName}` }
        };
        break;
      default:
        return res.status(400).json({ error: 'Invalid groupBy parameter. Use "day", "week", or "month"' });
    }

    // Aggregate skips by time period
    // Inside your controller, replace the aggregation with:

    const skipsByDay = await Skip.aggregate([
  // 1) Filter to your date range on DateFilled
  {
    $match: {
      [fieldName]: { $gte: start, $lte: end }
    }
  },

  // 2) Project a normalized weight in tonnes
  {
    $project: {
      // Truncate DateFilled to midnight of that day
      day: {
        $dateTrunc: {
          date: `$${fieldName}`,
          unit: "day"
        }
      },
      qtyInTonnes: {
        $cond: [
          { $eq: [ "$Quantity.unit", "kg" ] },
          { $divide: [ "$Quantity.value", 1000 ] },
          "$Quantity.value"
        ]
      }
    }
  },

  // 3) Group by that day and sum
  {
    $group: {
      _id: "$day",
      totalTonnes: { $sum: "$qtyInTonnes" }
    }
  },

  // 4) Sort by day ascending
  { $sort: { _id: 1 } },

  // 5) Format output
  {
    $project: {
      _id: 0,
      date: {
        $dateToString: { format: "%Y-%m-%d", date: "$_id" }
      },
      totalTonnes: 1
    }
  }
]);



    // After running the aggregation into `skipsByDay`:
const result = fillMissingDates(
  skipsByDay.map(item => ({
    date: item.date,
    count: item.totalTonnes    // map totalTonnes → count for the helper
  })),
  start,
  end,
  'day'                        // since we’re grouping by calendar day
);

    res.json({ data: result });
  } catch (error) {
    console.error('Error fetching skip analytics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to fill in missing dates with zero counts
function fillMissingDates(data, startDate, endDate, groupBy) {
  const filledData = [];
  const currentDate = new Date(startDate);
  const end = new Date(endDate);
  
  // Create a map of existing data for quick lookup
  const dataMap = new Map();
  data.forEach(item => {
    const dateKey = groupBy === 'week' 
      ? `${new Date(item.date).getFullYear()}-${getWeekNumber(new Date(item.date))}`
      : item.date
    dataMap.set(dateKey, item);
  });

  // Iterate through each day/week/month in range
  while (currentDate <= end) {
    let dateKey, formattedDate;
    
    if (groupBy === 'day') {
      formattedDate = currentDate.toISOString().split('T')[0];
      dateKey = formattedDate;
    } else if (groupBy === 'week') {
      const year = currentDate.getFullYear();
      const week = getWeekNumber(currentDate);
      dateKey = `${year}-${week}`;
      formattedDate = currentDate.toISOString().split('T')[0];
    } else { // month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      dateKey = `${year}-${month.toString().padStart(2, '0')}`;
      formattedDate = currentDate.toISOString().split('T')[0];
    }

    if (dataMap.has(dateKey)) {
      filledData.push(dataMap.get(dateKey));
    } else {
      filledData.push({
        date: formattedDate,
        count: 0
      });
    }

    // Increment date based on groupBy
    if (groupBy === 'day') {
      currentDate.setDate(currentDate.getDate() + 1);
    } else if (groupBy === 'week') {
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }

  return filledData;
}

// Helper function to get ISO week number
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
}