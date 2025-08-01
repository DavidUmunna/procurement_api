// controllers/poAnalyticsController.js
const PurchaseOrder = require('../models/PurchaseOrder');
const mongoose=require("mongoose")
exports.getPOAnalytics = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      status, 
      staffId, 
      Department,
      urgency,
      view = 'daily' // daily, monthly, yearly
    } = req.query;
    
    const filter = {};
    const AggregationFilter={}
    
    // Date filtering
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
      AggregationFilter.createdAt={};
       if (startDate) AggregationFilter.createdAt.$gte = new Date(startDate);
      if (endDate) AggregationFilter.createdAt.$lte = new Date(endDate);

    }
    
    // Status filtering
    if (status) filter.status = status;
    
    // Staff filtering
    if (staffId) {filter.staff = staffId;
      AggregationFilter.staff=staffId;
    }
    
    // Department filtering
    if (urgency) filter.urgency = urgency;
    if (Department) AggregationFilter.Department=Department;

    console.log("this is the department:",Department)
    // Get the raw data first for detailed analytics
    const orders = await PurchaseOrder.find(filter)
      .populate('staff', 'name email Department')
      .populate('PendingApprovals', 'name email')
      .lean();

    const filteredOrders = orders.filter(order => 
     {if (Department){

        return order.staff?.Department === Department
      }
      return order;
    }

    );
      console.log("filter",AggregationFilter)
    console.log("the orders indicated",filteredOrders)
    // Then get aggregated data for the chart

   
    let dateFormat, groupIdFormat;
    switch(view) {
      case 'yearly':
        dateFormat = '%Y';
        groupIdFormat = { $year: '$createdAt' };
        break;
      case 'monthly':
        dateFormat = '%Y-%m';
        groupIdFormat = { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        };
        break;
      case 'daily':
      default:
        dateFormat = '%Y-%m-%d';
        groupIdFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        };
    }
    
 const pipeline = [];

// 1. Match base filters that reference fields already in the collection
if (filter.staff) {
  pipeline.push({
    $match: {
      staff: new mongoose.Types.ObjectId(filter.staff),
    }
  });
}

// 2. Lookup userInfo (from users collection)
pipeline.push({
  $lookup: {
    from: "users",
    localField: "staff",
    foreignField: "_id",
    as: "userInfo"
  }
});

// 3. Flatten the userInfo array
pipeline.push({ $unwind: "$userInfo" });

// 4. Match on Department, now that userInfo exists
if (AggregationFilter.Department) {
  pipeline.push({
    $match: {
      "userInfo.Department": AggregationFilter.Department
    }
  });
}

// 5. Group by your format (daily, monthly, etc.)
pipeline.push({
  $group: {
    _id: groupIdFormat,
    Department: { $first: "$userInfo.Department" },
    date: {
      $first: {
        $dateToString: {
          format: dateFormat,
          date: "$createdAt"
        }
      }
    },
    count: { $sum: 1 },
    totalValue: { $sum: { $sum: "$products.price" } },
    avgApprovalTime: {
      $avg: {
        $subtract: [
          { $max: "$Approvals.timestamp" },
          "$createdAt"
        ]
      }
    },
    statusDistribution: {
      $push: "$status"
    }
  }
});

// 6. Sort the results
pipeline.push({ $sort: { _id: 1 } });

// 7. Run the aggregation
const aggregatedData = await PurchaseOrder.aggregate(pipeline);

  console.log("Aggregated Data",aggregatedData)
    
    // Process status distribution
    const processedData = aggregatedData.map(item => {
      const statusCounts = item.statusDistribution.reduce((acc, status) => {
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      return {
        ...item,
        statusCounts
      };
    });
    const totalValue = orders.reduce((sum, order) => {
  const productSum = Array.isArray(order.products)
    ? order.products.reduce((s, p) => s + (Number(p.price) || 0), 0)
    : 0;
  return sum + productSum;
  }, 0);
   
    res.json({
      success: true,
      data: {
        chartData: processedData,
        rawData: filteredOrders.slice(0, 100), // Return first 100 for inspection
        summary: {
          totalOrders: filteredOrders.length,
          totalValue: totalValue,
          avgOrderValue:  filteredOrders.length > 0 ? totalValue / orders.length : 0,
          approvalRate: filteredOrders.length > 0
            ? (filteredOrders.filter(o => o.status === 'Approved').length / filteredOrders.length) * 100
            : 0
        }
      }
    });
    
  
}catch (error) {
    console.error('Error fetching purchase order analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve purchase order analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Additional specialized endpoints
exports.getPOStatusDistribution = async (req, res) => {
  try {
    const distribution = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    console.error('Error fetching status distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve status distribution'
    });
  }
};

exports.getPOUrgencyStats = async (req, res) => {
  try {
    const stats = await PurchaseOrder.aggregate([
      {
        $group: {
          _id: "$urgency",
          count: { $sum: 1 },
          avgProcessingTime: {
            $avg: {
              $cond: [
                { $eq: ["$status", "Completed"] },
                { $subtract: ["$updatedAt", "$createdAt"] },
                null
              ]
            }
          }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching urgency stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve urgency statistics'
    });
  }
};