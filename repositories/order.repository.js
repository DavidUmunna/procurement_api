const PurchaseOrder=require("../models/PurchaseOrder")

exports.createOrder=async(data)=>{
    const order=new PurchaseOrder(data)
    savedOrder= await order.save()
    return {data:savedOrder}
}

exports.findOrderbyid=async(Id)=>{
    return await PurchaseOrder.findById(Id);
}

exports.getPaginatedOrders=async(query)=>{
    const [total, orders] = await Promise.all([
              PurchaseOrder.countDocuments(query),
              PurchaseOrder.find(query)
              .populate("staff", "-password -__v -role -canApprove -_id")
              .populate("PendingApprovals.Reviewer")
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                
                
    ]);
    const response=(orders.map((order=>{
      const plainOrder=order.toObject()
     
      return plainOrder
    })))

    return {orders:response,total:total}
}
exports.getOrders=async(query)=>{
  const AllOrders=await PurchaseOrder.find(query)
        .populate("staff", "Department email name  role").populate("products","name quantity price")
        .populate("PendingApprovals.Reviewer")
        .sort({ createdAt: -1 });
  const response=(AllOrders.map((order=>{
      const plainOrder=AllOrders.toObject()
     
      return plainOrder
    })))
    return {orders:response}
}

exports.getDepartmentDisplayORders=async(user)=>{
     const orders = await PurchaseOrder.find()
     .populate("staff", "Department")
     .populate("PendingApprovals")
          .sort({ createdAt: -1 })
      return {data:orders}
                
}

exports.getStaffDisplayOrders=async(user)=>{
  const [total,orders]=await Promise.all(
    PurchaseOrder.countDocuments({staff:user.userId}),
    PurchaseOrder.find({staff:user.userId})
    .populate("staff", "Department")
    .populate("PendingApprovals")
    .sort({ createdAt: -1 })
  )

  return {data:orders,total:total}

}
